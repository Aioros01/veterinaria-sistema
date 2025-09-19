import { Response } from 'express';
import { AppDataSource } from '../config/database';
import { Hospitalization, DischargeType } from '../entities/Hospitalization';
import { HospitalizationMedication } from '../entities/HospitalizationMedication';
import { HospitalizationNote } from '../entities/HospitalizationNote';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

export class HospitalizationController {
  private hospitalizationRepo = AppDataSource.getRepository(Hospitalization);
  private medicationRepo = AppDataSource.getRepository(HospitalizationMedication);
  private noteRepo = AppDataSource.getRepository(HospitalizationNote);

  // Crear nueva hospitalización
  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const hospitalizationData = {
        ...req.body,
        veterinarianId: req.user!.id,
        createdBy: req.user!.id,
        updatedBy: req.user!.id
      };

      const hospitalization = this.hospitalizationRepo.create(hospitalizationData);
      await this.hospitalizationRepo.save(hospitalization);

      res.status(201).json({
        message: 'Hospitalización creada exitosamente',
        hospitalization
      });
    } catch (error) {
      console.error('Error creating hospitalization:', error);
      throw error;
    }
  }

  // Obtener hospitalizaciones activas
  async getActive(req: AuthRequest, res: Response): Promise<void> {
    try {
      let hospitalizations;

      if (req.user!.role === 'admin' || req.user!.role === 'veterinarian') {
        // Admin y veterinarios ven todas las hospitalizaciones activas
        hospitalizations = await this.hospitalizationRepo.find({
          where: { isActive: true, dischargeDate: null },
          relations: ['pet', 'pet.owner', 'veterinarian', 'medications'],
          order: { admissionDate: 'DESC' }
        });
      } else {
        // Clientes ven solo las de sus mascotas
        const petRepo = AppDataSource.getRepository('Pet');
        const userPets = await petRepo.find({
          where: { ownerId: req.user!.id },
          select: ['id']
        });
        
        const petIds = userPets.map(pet => pet.id);
        
        if (petIds.length > 0) {
          hospitalizations = await this.hospitalizationRepo
            .createQueryBuilder('h')
            .leftJoinAndSelect('h.pet', 'pet')
            .leftJoinAndSelect('h.veterinarian', 'vet')
            .leftJoinAndSelect('h.medications', 'meds')
            .where('h.petId IN (:...petIds)', { petIds })
            .andWhere('h.isActive = :isActive', { isActive: true })
            .andWhere('h.dischargeDate IS NULL')
            .orderBy('h.admissionDate', 'DESC')
            .getMany();
        } else {
          hospitalizations = [];
        }
      }

      res.json({ hospitalizations });
    } catch (error) {
      console.error('Error fetching hospitalizations:', error);
      throw error;
    }
  }

  // Agregar medicamento a hospitalización
  async addMedication(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { hospitalizationId } = req.params;

      // Verificar que la hospitalización existe
      const hospitalization = await this.hospitalizationRepo.findOne({
        where: { id: hospitalizationId }
      });

      if (!hospitalization) {
        throw new AppError(404, 'Hospitalización no encontrada');
      }

      const medicationData = {
        ...req.body,
        hospitalizationId,
        createdBy: req.user!.id,
        updatedBy: req.user!.id,
        administrationLog: []
      };

      const medication = this.medicationRepo.create(medicationData);
      await this.medicationRepo.save(medication);

      res.status(201).json({
        message: 'Medicamento agregado exitosamente',
        medication
      });
    } catch (error) {
      console.error('Error adding medication:', error);
      throw error;
    }
  }

  // Registrar administración de medicamento
  async administerMedication(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { medicationId } = req.params;
      const { notes } = req.body;

      const medication = await this.medicationRepo.findOne({
        where: { id: medicationId }
      });

      if (!medication) {
        throw new AppError(404, 'Medicamento no encontrado');
      }

      // Agregar al log de administración
      const administrationEntry = {
        date: new Date(),
        administeredBy: `${req.user!.firstName} ${req.user!.lastName}`,
        notes
      };

      medication.administrationLog = medication.administrationLog || [];
      medication.administrationLog.push(administrationEntry);
      medication.lastAdministered = new Date();
      
      // Calcular próxima dosis basándose en la frecuencia
      const hoursMatch = medication.frequency.match(/(\d+)\s*hora/i);
      if (hoursMatch) {
        const hours = parseInt(hoursMatch[1]);
        const nextDue = new Date();
        nextDue.setHours(nextDue.getHours() + hours);
        medication.nextDue = nextDue;
      }

      medication.updatedBy = req.user!.id;
      await this.medicationRepo.save(medication);

      res.json({
        message: 'Medicamento administrado exitosamente',
        medication
      });
    } catch (error) {
      console.error('Error administering medication:', error);
      throw error;
    }
  }

  // Agregar nota de evolución
  async addNote(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { hospitalizationId } = req.params;

      const hospitalization = await this.hospitalizationRepo.findOne({
        where: { id: hospitalizationId }
      });

      if (!hospitalization) {
        throw new AppError(404, 'Hospitalización no encontrada');
      }

      const noteData = {
        ...req.body,
        hospitalizationId,
        authorId: req.user!.id,
        createdBy: req.user!.id,
        updatedBy: req.user!.id
      };

      const note = this.noteRepo.create(noteData);
      await this.noteRepo.save(note);

      res.status(201).json({
        message: 'Nota agregada exitosamente',
        note
      });
    } catch (error) {
      console.error('Error adding note:', error);
      throw error;
    }
  }

  // Dar de alta
  async discharge(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { dischargeType, dischargeNotes } = req.body;

      const hospitalization = await this.hospitalizationRepo.findOne({
        where: { id }
      });

      if (!hospitalization) {
        throw new AppError(404, 'Hospitalización no encontrada');
      }

      hospitalization.dischargeDate = new Date();
      hospitalization.dischargeType = dischargeType;
      hospitalization.dischargeNotes = dischargeNotes;
      hospitalization.isActive = false;
      hospitalization.updatedBy = req.user!.id;

      await this.hospitalizationRepo.save(hospitalization);

      res.json({
        message: 'Alta registrada exitosamente',
        hospitalization
      });
    } catch (error) {
      console.error('Error discharging patient:', error);
      throw error;
    }
  }

  // Obtener detalles completos de una hospitalización
  async getById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const hospitalization = await this.hospitalizationRepo.findOne({
        where: { id },
        relations: ['pet', 'pet.owner', 'veterinarian', 'medications', 'notes', 'notes.author']
      });

      if (!hospitalization) {
        throw new AppError(404, 'Hospitalización no encontrada');
      }

      // Verificar permisos
      if (req.user!.role === 'client') {
        const pet = hospitalization.pet;
        if (pet.ownerId !== req.user!.id) {
          throw new AppError(403, 'No tienes permiso para ver esta hospitalización');
        }
      }

      res.json({ hospitalization });
    } catch (error) {
      console.error('Error fetching hospitalization:', error);
      throw error;
    }
  }

  // Obtener hospitalizaciones por mascota
  async getByPet(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { petId } = req.params;

      // Verificar que la mascota existe y el usuario tiene permisos
      const petRepo = AppDataSource.getRepository('Pet');
      const pet = await petRepo.findOne({
        where: { id: petId },
        relations: ['owner']
      });

      if (!pet) {
        throw new AppError(404, 'Mascota no encontrada');
      }

      // Verificar permisos
      if (req.user!.role === 'client' && pet.ownerId !== req.user!.id) {
        throw new AppError(403, 'No tienes permiso para ver las hospitalizaciones de esta mascota');
      }

      const hospitalizations = await this.hospitalizationRepo.find({
        where: { petId },
        relations: ['veterinarian', 'medications', 'notes'],
        order: { admissionDate: 'DESC' }
      });

      res.json({ hospitalizations });
    } catch (error) {
      console.error('Error fetching pet hospitalizations:', error);
      throw error;
    }
  }
}