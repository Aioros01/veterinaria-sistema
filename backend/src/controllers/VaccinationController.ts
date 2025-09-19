import { Response } from 'express';
import { AppDataSource } from '../config/database';
import { Vaccination } from '../entities/Vaccination';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { MoreThan } from 'typeorm';

export class VaccinationController {
  private vaccinationRepository = AppDataSource.getRepository(Vaccination);

  async create(req: AuthRequest, res: Response): Promise<void> {
    const vaccination = this.vaccinationRepository.create({
      ...req.body,
      veterinarianId: req.user!.id
    });
    await this.vaccinationRepository.save(vaccination);
    res.status(201).json({ message: 'Vaccination recorded', vaccination });
  }

  async getByPet(req: AuthRequest, res: Response): Promise<void> {
    const vaccinations = await this.vaccinationRepository.find({
      where: { petId: req.params.petId },
      relations: ['veterinarian'],
      order: { vaccinationDate: 'DESC' }
    });
    res.json({ vaccinations });
  }

  async getUpcoming(req: AuthRequest, res: Response): Promise<void> {
    const vaccinations = await this.vaccinationRepository.find({
      where: { nextDoseDate: MoreThan(new Date()) },
      relations: ['pet', 'veterinarian'],
      order: { nextDoseDate: 'ASC' }
    });
    res.json({ vaccinations });
  }

  async getById(req: AuthRequest, res: Response): Promise<void> {
    const vaccination = await this.vaccinationRepository.findOne({
      where: { id: req.params.id },
      relations: ['pet', 'veterinarian']
    });
    if (!vaccination) throw new AppError(404, 'Vaccination not found');
    res.json({ vaccination });
  }

  async update(req: AuthRequest, res: Response): Promise<void> {
    const vaccination = await this.vaccinationRepository.findOne({ where: { id: req.params.id } });
    if (!vaccination) throw new AppError(404, 'Vaccination not found');
    
    Object.assign(vaccination, req.body);
    await this.vaccinationRepository.save(vaccination);
    
    res.json({ message: 'Vaccination updated', vaccination });
  }
}