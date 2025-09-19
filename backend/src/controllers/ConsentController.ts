import { Response } from 'express';
import { AppDataSource } from '../config/database';
import { Consent, ConsentStatus } from '../entities/Consent';
import { ConsentDocumentHistory, DocumentType } from '../entities/ConsentDocumentHistory';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import multer from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { ConsentTemplateService } from '../services/ConsentTemplateService';

// Asegurar que existe la carpeta de uploads
const uploadDir = path.join(__dirname, '../../uploads/consents');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuración de multer para subir PDFs
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'consent-' + uniqueSuffix + path.extname(file.originalname));
  }
});

export const uploadConsent = multer({
  storage,
  fileFilter: (req, file, cb) => {
    // Aceptar PDF e imágenes
    const allowedMimes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos PDF o imágenes (JPG, PNG, GIF, WEBP)'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB máximo
  }
});

export class ConsentController {
  private consentRepo = AppDataSource.getRepository(Consent);
  private historyRepo = AppDataSource.getRepository(ConsentDocumentHistory);

  // Obtener plantillas disponibles
  async getTemplates(req: AuthRequest, res: Response): Promise<void> {
    try {
      const templates = ConsentTemplateService.getAllTemplates();
      res.json({ templates });
    } catch (error) {
      console.error('Error fetching templates:', error);
      throw error;
    }
  }

  // Generar consentimiento desde plantilla
  async generateFromTemplate(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { type, petId, procedureName, treatmentDescription } = req.body;

      // Obtener información de la mascota y propietario
      const petRepo = AppDataSource.getRepository('Pet');
      const pet = await petRepo.findOne({
        where: { id: petId },
        relations: ['owner']
      });

      if (!pet) {
        throw new AppError(404, 'Mascota no encontrada');
      }

      const consentText = ConsentTemplateService.generateConsentText(type, {
        ownerName: `${pet.owner.firstName} ${pet.owner.lastName}`,
        petName: pet.name,
        clinicName: 'Clínica Veterinaria',
        veterinarianName: `${req.user!.firstName} ${req.user!.lastName}`,
        procedureName,
        treatmentDescription
      });

      const template = ConsentTemplateService.getTemplate(type);
      
      res.json({ 
        consentText,
        template 
      });
    } catch (error) {
      console.error('Error generating consent from template:', error);
      throw error;
    }
  }

  // Crear consentimiento (veterinario solicita)
  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const consentData = {
        ...req.body,
        requestedById: req.user!.id,
        status: ConsentStatus.PENDING,
        createdBy: req.user!.id,
        updatedBy: req.user!.id
      };

      // Si se subió un PDF
      if (req.file) {
        consentData.documentUrl = `/uploads/consents/${req.file.filename}`;
      }

      const consent = this.consentRepo.create(consentData);
      await this.consentRepo.save(consent);

      res.status(201).json({
        message: 'Consentimiento creado exitosamente',
        consent
      });
    } catch (error) {
      console.error('Error creating consent:', error);
      throw error;
    }
  }

  // Obtener consentimientos
  async getAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      let consents;

      if (req.user!.role === 'admin' || req.user!.role === 'veterinarian') {
        // Admin y veterinarios ven todos los consentimientos
        consents = await this.consentRepo.find({
          relations: ['pet', 'pet.owner', 'requestedBy', 'approvedBy', 'medicalHistory'],
          order: { createdAt: 'DESC' }
        });
      } else {
        // Clientes ven solo los de sus mascotas
        const petRepo = AppDataSource.getRepository('Pet');
        const userPets = await petRepo.find({
          where: { ownerId: req.user!.id },
          select: ['id']
        });
        
        const petIds = userPets.map(pet => pet.id);
        
        if (petIds.length > 0) {
          consents = await this.consentRepo
            .createQueryBuilder('c')
            .leftJoinAndSelect('c.pet', 'pet')
            .leftJoinAndSelect('c.requestedBy', 'requestedBy')
            .leftJoinAndSelect('c.approvedBy', 'approvedBy')
            .where('c.petId IN (:...petIds)', { petIds })
            .orderBy('c.createdAt', 'DESC')
            .getMany();
        } else {
          consents = [];
        }
      }

      res.json({ consents });
    } catch (error) {
      console.error('Error fetching consents:', error);
      throw error;
    }
  }

  // Obtener consentimientos pendientes de firma para un cliente
  async getPending(req: AuthRequest, res: Response): Promise<void> {
    try {
      const petRepo = AppDataSource.getRepository('Pet');
      const userPets = await petRepo.find({
        where: { ownerId: req.user!.id },
        select: ['id']
      });
      
      const petIds = userPets.map(pet => pet.id);
      
      if (petIds.length === 0) {
        res.json({ consents: [] });
        return;
      }

      const consents = await this.consentRepo
        .createQueryBuilder('c')
        .leftJoinAndSelect('c.pet', 'pet')
        .leftJoinAndSelect('c.requestedBy', 'requestedBy')
        .where('c.petId IN (:...petIds)', { petIds })
        .andWhere('c.status = :status', { status: ConsentStatus.PENDING })
        .orderBy('c.createdAt', 'DESC')
        .getMany();

      res.json({ consents });
    } catch (error) {
      console.error('Error fetching pending consents:', error);
      throw error;
    }
  }

  // Firmar consentimiento (cliente firma)
  async sign(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { digitalSignature, signedBy, relationship } = req.body;

      const consent = await this.consentRepo.findOne({
        where: { id },
        relations: ['pet']
      });

      if (!consent) {
        throw new AppError(404, 'Consentimiento no encontrado');
      }

      // Verificar que el usuario es el dueño de la mascota
      if (req.user!.role === 'cliente' && consent.pet.ownerId !== req.user!.id) {
        throw new AppError(403, 'No tienes permiso para firmar este consentimiento');
      }

      consent.status = ConsentStatus.SIGNED;
      consent.signedDate = new Date();
      consent.signedBy = signedBy || `${req.user!.firstName} ${req.user!.lastName}`;
      consent.relationship = relationship || 'Propietario';
      consent.digitalSignature = digitalSignature;
      consent.approvedById = req.user!.id;
      consent.updatedBy = req.user!.id;

      await this.consentRepo.save(consent);

      res.json({
        message: 'Consentimiento firmado exitosamente',
        consent
      });
    } catch (error) {
      console.error('Error signing consent:', error);
      throw error;
    }
  }

  // Rechazar consentimiento
  async reject(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const consent = await this.consentRepo.findOne({
        where: { id },
        relations: ['pet']
      });

      if (!consent) {
        throw new AppError(404, 'Consentimiento no encontrado');
      }

      // Verificar permisos
      if (req.user!.role === 'cliente' && consent.pet.ownerId !== req.user!.id) {
        throw new AppError(403, 'No tienes permiso para rechazar este consentimiento');
      }

      consent.status = ConsentStatus.REJECTED;
      consent.additionalNotes = reason;
      consent.updatedBy = req.user!.id;

      await this.consentRepo.save(consent);

      res.json({
        message: 'Consentimiento rechazado',
        consent
      });
    } catch (error) {
      console.error('Error rejecting consent:', error);
      throw error;
    }
  }

  // Obtener consentimiento por ID
  async getById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const consent = await this.consentRepo.findOne({
        where: { id },
        relations: ['pet', 'pet.owner', 'requestedBy', 'approvedBy', 'medicalHistory']
      });

      if (!consent) {
        throw new AppError(404, 'Consentimiento no encontrado');
      }

      // Verificar permisos
      if (req.user!.role === 'cliente' && consent.pet.ownerId !== req.user!.id) {
        throw new AppError(403, 'No tienes permiso para ver este consentimiento');
      }

      res.json({ consent });
    } catch (error) {
      console.error('Error fetching consent:', error);
      throw error;
    }
  }

  // Obtener consentimientos por historia médica
  async getByMedicalHistory(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { medicalHistoryId } = req.params;

      const consents = await this.consentRepo.find({
        where: { medicalHistoryId },
        relations: ['pet', 'requestedBy', 'approvedBy'],
        order: { createdAt: 'DESC' }
      });

      res.json({ consents });
    } catch (error) {
      console.error('Error fetching consents by medical history:', error);
      throw error;
    }
  }

  // Obtener historial de documentos de un consentimiento
  async getDocumentHistory(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const consent = await this.consentRepo.findOne({
        where: { id },
        relations: ['pet']
      });
      
      if (!consent) {
        throw new AppError(404, 'Consentimiento no encontrado');
      }
      
      // Verificar permisos
      if (req.user!.role === 'cliente' && consent.pet.ownerId !== req.user!.id) {
        throw new AppError(403, 'No tienes permiso para ver este historial');
      }
      
      const history = await this.historyRepo.find({
        where: { consentId: id },
        relations: ['uploadedBy'],
        order: { uploadedAt: 'DESC' }
      });
      
      res.json({ history });
    } catch (error) {
      console.error('Error fetching document history:', error);
      throw error;
    }
  }

  // Cargar consentimiento firmado y cédula
  async uploadSigned(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const files = req.files as any;

      if (!files || !files.signedConsent) {
        throw new AppError(400, 'Se requiere el consentimiento firmado');
      }

      const consent = await this.consentRepo.findOne({
        where: { id },
        relations: ['pet']
      });

      if (!consent) {
        throw new AppError(404, 'Consentimiento no encontrado');
      }

      // Verificar permisos
      if (req.user!.role === 'cliente' && consent.pet.ownerId !== req.user!.id) {
        throw new AppError(403, 'No tienes permiso para actualizar este consentimiento');
      }

      // Marcar documentos anteriores como inactivos
      await this.historyRepo.update(
        { consentId: id, isActive: true },
        { isActive: false }
      );

      // Guardar el consentimiento firmado en el historial
      const consentHistory = this.historyRepo.create({
        consentId: id,
        documentType: DocumentType.SIGNED_CONSENT,
        documentUrl: `/uploads/consents/${files.signedConsent[0].filename}`,
        originalFileName: files.signedConsent[0].originalname,
        mimeType: files.signedConsent[0].mimetype,
        fileSize: files.signedConsent[0].size,
        uploadedById: req.user!.id,
        isActive: true,
        notes: 'Documento cargado mediante formulario web'
      });
      await this.historyRepo.save(consentHistory);

      // Si se subió también el documento de identidad, guardarlo en el historial
      if (files.idDocument && files.idDocument[0]) {
        const idHistory = this.historyRepo.create({
          consentId: id,
          documentType: DocumentType.ID_DOCUMENT,
          documentUrl: `/uploads/consents/${files.idDocument[0].filename}`,
          originalFileName: files.idDocument[0].originalname,
          mimeType: files.idDocument[0].mimetype,
          fileSize: files.idDocument[0].size,
          uploadedById: req.user!.id,
          isActive: true,
          notes: 'Documento de identidad'
        });
        await this.historyRepo.save(idHistory);
        consent.idDocumentUrl = `/uploads/consents/${files.idDocument[0].filename}`;
      }

      // Actualizar el consentimiento
      consent.documentUrl = `/uploads/consents/${files.signedConsent[0].filename}`;
      consent.status = ConsentStatus.SIGNED;
      consent.signedDate = new Date();
      consent.signedBy = `${req.user!.firstName} ${req.user!.lastName}`;
      consent.approvedById = req.user!.id;
      consent.updatedBy = req.user!.id;

      await this.consentRepo.save(consent);

      res.json({
        message: 'Documentos cargados exitosamente',
        consent
      });
    } catch (error) {
      console.error('Error uploading signed consent:', error);
      throw error;
    }
  }
}