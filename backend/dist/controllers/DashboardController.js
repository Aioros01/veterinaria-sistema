"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardController = void 0;
const database_1 = require("../config/database");
const Appointment_1 = require("../entities/Appointment");
const Pet_1 = require("../entities/Pet");
const Medicine_1 = require("../entities/Medicine");
const redis_1 = require("../config/redis");
const typeorm_1 = require("typeorm");
class DashboardController {
    async getStats(req, res) {
        const cacheKey = redis_1.CacheKeys.DASHBOARD_STATS(req.user.id);
        let stats = await redis_1.cache.get(cacheKey);
        if (!stats) {
            const petRepo = database_1.AppDataSource.getRepository(Pet_1.Pet);
            const appointmentRepo = database_1.AppDataSource.getRepository(Appointment_1.Appointment);
            const medicineRepo = database_1.AppDataSource.getRepository(Medicine_1.Medicine);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            stats = {
                totalPets: await petRepo.count({ where: { isActive: true } }),
                todayAppointments: await appointmentRepo.count({
                    where: {
                        appointmentDate: (0, typeorm_1.Between)(today, tomorrow),
                        status: Appointment_1.AppointmentStatus.SCHEDULED
                    }
                }),
                upcomingAppointments: await appointmentRepo.count({
                    where: {
                        appointmentDate: (0, typeorm_1.Between)(today, new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)),
                        status: Appointment_1.AppointmentStatus.SCHEDULED
                    }
                }),
                lowStockMedicines: await medicineRepo
                    .createQueryBuilder('medicine')
                    .where('medicine.currentStock <= medicine.minimumStock')
                    .andWhere('medicine.isActive = :isActive', { isActive: true })
                    .getCount()
            };
            await redis_1.cache.set(cacheKey, stats, 300);
        }
        res.json({ stats });
    }
    async getAppointmentsSummary(req, res) {
        const appointmentRepo = database_1.AppDataSource.getRepository(Appointment_1.Appointment);
        const summary = await appointmentRepo
            .createQueryBuilder('appointment')
            .select('appointment.status', 'status')
            .addSelect('COUNT(*)', 'count')
            .groupBy('appointment.status')
            .getRawMany();
        res.json({ summary });
    }
    async getRevenue(req, res) {
        const appointmentRepo = database_1.AppDataSource.getRepository(Appointment_1.Appointment);
        const { startDate, endDate } = req.query;
        const start = startDate ? new Date(startDate) : new Date(new Date().setMonth(new Date().getMonth() - 1));
        const end = endDate ? new Date(endDate) : new Date();
        const revenue = await appointmentRepo
            .createQueryBuilder('appointment')
            .select('SUM(appointment.actualCost)', 'total')
            .where('appointment.appointmentDate BETWEEN :start AND :end', { start, end })
            .andWhere('appointment.status = :status', { status: Appointment_1.AppointmentStatus.COMPLETED })
            .getRawOne();
        res.json({ revenue: revenue.total || 0, period: { start, end } });
    }
    async getPopularServices(req, res) {
        const appointmentRepo = database_1.AppDataSource.getRepository(Appointment_1.Appointment);
        const services = await appointmentRepo
            .createQueryBuilder('appointment')
            .select('appointment.type', 'type')
            .addSelect('COUNT(*)', 'count')
            .where('appointment.status = :status', { status: Appointment_1.AppointmentStatus.COMPLETED })
            .groupBy('appointment.type')
            .orderBy('count', 'DESC')
            .limit(5)
            .getRawMany();
        res.json({ services });
    }
}
exports.DashboardController = DashboardController;
//# sourceMappingURL=DashboardController.js.map