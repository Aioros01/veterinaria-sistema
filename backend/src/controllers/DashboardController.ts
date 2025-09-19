import { Response } from 'express';
import { AppDataSource } from '../config/database';
import { Appointment, AppointmentStatus } from '../entities/Appointment';
import { Pet } from '../entities/Pet';
import { Medicine } from '../entities/Medicine';
import { AuthRequest } from '../middleware/auth';
import { cache, CacheKeys } from '../config/redis';
import { Between } from 'typeorm';

export class DashboardController {
  async getStats(req: AuthRequest, res: Response): Promise<void> {
    const cacheKey = CacheKeys.DASHBOARD_STATS(req.user!.id);
    let stats = await cache.get<any>(cacheKey);

    if (!stats) {
      const petRepo = AppDataSource.getRepository(Pet);
      const appointmentRepo = AppDataSource.getRepository(Appointment);
      const medicineRepo = AppDataSource.getRepository(Medicine);

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      stats = {
        totalPets: await petRepo.count({ where: { isActive: true } }),
        todayAppointments: await appointmentRepo.count({
          where: {
            appointmentDate: Between(today, tomorrow),
            status: AppointmentStatus.SCHEDULED
          }
        }),
        upcomingAppointments: await appointmentRepo.count({
          where: {
            appointmentDate: Between(today, new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)),
            status: AppointmentStatus.SCHEDULED
          }
        }),
        lowStockMedicines: await medicineRepo
          .createQueryBuilder('medicine')
          .where('medicine.currentStock <= medicine.minimumStock')
          .andWhere('medicine.isActive = :isActive', { isActive: true })
          .getCount()
      };

      await cache.set(cacheKey, stats, 300);
    }

    res.json({ stats });
  }

  async getAppointmentsSummary(req: AuthRequest, res: Response): Promise<void> {
    const appointmentRepo = AppDataSource.getRepository(Appointment);
    
    const summary = await appointmentRepo
      .createQueryBuilder('appointment')
      .select('appointment.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('appointment.status')
      .getRawMany();
    
    res.json({ summary });
  }

  async getRevenue(req: AuthRequest, res: Response): Promise<void> {
    const appointmentRepo = AppDataSource.getRepository(Appointment);
    
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate as string) : new Date(new Date().setMonth(new Date().getMonth() - 1));
    const end = endDate ? new Date(endDate as string) : new Date();
    
    const revenue = await appointmentRepo
      .createQueryBuilder('appointment')
      .select('SUM(appointment.actualCost)', 'total')
      .where('appointment.appointmentDate BETWEEN :start AND :end', { start, end })
      .andWhere('appointment.status = :status', { status: AppointmentStatus.COMPLETED })
      .getRawOne();
    
    res.json({ revenue: revenue.total || 0, period: { start, end } });
  }

  async getPopularServices(req: AuthRequest, res: Response): Promise<void> {
    const appointmentRepo = AppDataSource.getRepository(Appointment);
    
    const services = await appointmentRepo
      .createQueryBuilder('appointment')
      .select('appointment.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .where('appointment.status = :status', { status: AppointmentStatus.COMPLETED })
      .groupBy('appointment.type')
      .orderBy('count', 'DESC')
      .limit(5)
      .getRawMany();
    
    res.json({ services });
  }
}