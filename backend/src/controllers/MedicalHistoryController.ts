import { Response } from 'express';
import { AppDataSource } from '../config/database';
import { MedicalHistory } from '../entities/MedicalHistory';
import { Prescription } from '../entities/Prescription';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

export class MedicalHistoryController {
  private medicalHistoryRepository = AppDataSource.getRepository(MedicalHistory);
  private prescriptionRepository = AppDataSource.getRepository(Prescription);

  async create(req: AuthRequest, res: Response): Promise<void> {
    const history = this.medicalHistoryRepository.create({
      ...req.body,
      veterinarianId: req.user!.id
    });
    await this.medicalHistoryRepository.save(history);
    res.status(201).json({ message: 'Medical history created', history });
  }

  async getByPet(req: AuthRequest, res: Response): Promise<void> {
    const histories = await this.medicalHistoryRepository.find({
      where: { petId: req.params.petId },
      relations: ['veterinarian'],
      order: { visitDate: 'DESC' }
    });
    res.json({ histories });
  }

  async getById(req: AuthRequest, res: Response): Promise<void> {
    const history = await this.medicalHistoryRepository.findOne({
      where: { id: req.params.id },
      relations: ['pet', 'veterinarian']
    });
    if (!history) throw new AppError(404, 'Medical history not found');
    res.json({ history });
  }

  async update(req: AuthRequest, res: Response): Promise<void> {
    const history = await this.medicalHistoryRepository.findOne({ where: { id: req.params.id } });
    if (!history) throw new AppError(404, 'Medical history not found');
    
    Object.assign(history, req.body);
    await this.medicalHistoryRepository.save(history);
    
    res.json({ message: 'Medical history updated', history });
  }

  async uploadAttachments(req: AuthRequest, res: Response): Promise<void> {
    const history = await this.medicalHistoryRepository.findOne({ where: { id: req.params.id } });
    if (!history) throw new AppError(404, 'Medical history not found');
    
    const files = req.files as any[];
    history.attachments = files.map(f => `/uploads/medical/${f.filename}`);
    await this.medicalHistoryRepository.save(history);
    
    res.json({ message: 'Attachments uploaded', attachments: history.attachments });
  }

  async addPrescription(req: AuthRequest, res: Response): Promise<void> {
    const prescription = this.prescriptionRepository.create({
      ...req.body,
      medicalHistoryId: req.params.id
    });
    await this.prescriptionRepository.save(prescription);
    res.status(201).json({ message: 'Prescription added', prescription });
  }
}