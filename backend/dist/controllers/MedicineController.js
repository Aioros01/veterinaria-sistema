"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MedicineController = void 0;
const database_1 = require("../config/database");
const Medicine_1 = require("../entities/Medicine");
const errorHandler_1 = require("../middleware/errorHandler");
class MedicineController {
    constructor() {
        this.medicineRepository = database_1.AppDataSource.getRepository(Medicine_1.Medicine);
    }
    async getAll(req, res) {
        const startTime = performance.now();
        const requestId = req.requestId || 'medicine-getAll';
        console.log(`[${new Date().toISOString()}] 💊 [${requestId}] MedicineController.getAll START`);
        try {
            // Log before DB query
            const queryStart = performance.now();
            console.log(`[${new Date().toISOString()}] 🗄️  [${requestId}] Starting medicine query...`);
            if (req.logTiming) {
                req.logTiming(`Starting medicine database query`);
            }
            const medicines = await this.medicineRepository.find({
                where: { isActive: true },
                order: { name: 'ASC' }
            });
            const queryTime = performance.now() - queryStart;
            console.log(`[${new Date().toISOString()}] ✅ [${requestId}] Medicine query complete: ${queryTime.toFixed(2)}ms`);
            console.log(`[${new Date().toISOString()}] 📊 [${requestId}] Found ${medicines.length} medicines`);
            if (queryTime > 100) {
                console.log(`[${new Date().toISOString()}] ⚠️  [${requestId}] SLOW QUERY WARNING!`);
            }
            if (req.logTiming) {
                req.logTiming(`Medicine query completed (${medicines.length} records)`);
            }
            // Log response preparation
            const responseStart = performance.now();
            const response = { medicines };
            const responseTime = performance.now() - responseStart;
            console.log(`[${new Date().toISOString()}] 📦 [${requestId}] Response prepared: ${responseTime.toFixed(2)}ms`);
            const totalTime = performance.now() - startTime;
            console.log(`[${new Date().toISOString()}] ✅ [${requestId}] MedicineController.getAll COMPLETE: ${totalTime.toFixed(2)}ms total`);
            res.json(response);
        }
        catch (error) {
            const errorTime = performance.now() - startTime;
            console.log(`[${new Date().toISOString()}] ❌ [${requestId}] MedicineController.getAll ERROR: ${errorTime.toFixed(2)}ms`);
            console.log(`[${new Date().toISOString()}] 🚨 [${requestId}] Error details:`, error);
            res.json({ medicines: [] });
        }
    }
    async getLowStock(req, res) {
        try {
            const medicines = await this.medicineRepository
                .createQueryBuilder('medicine')
                .where('medicine.isActive = :isActive', { isActive: true })
                .andWhere('medicine.currentStock <= medicine.minimumStock')
                .orderBy('medicine.currentStock', 'ASC')
                .getMany();
            res.json({ medicines });
        }
        catch (error) {
            console.error('Error getting low stock medicines:', error);
            res.json({ medicines: [] });
        }
    }
    async getExpiring(req, res) {
        try {
            const thirtyDaysFromNow = new Date();
            thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
            const medicines = await this.medicineRepository
                .createQueryBuilder('medicine')
                .where('medicine.isActive = :isActive', { isActive: true })
                .andWhere('medicine.expirationDate IS NOT NULL')
                .andWhere('medicine.expirationDate <= :date', { date: thirtyDaysFromNow })
                .orderBy('medicine.expirationDate', 'ASC')
                .getMany();
            res.json({ medicines });
        }
        catch (error) {
            console.error('Error getting expiring medicines:', error);
            res.json({ medicines: [] });
        }
    }
    async getById(req, res) {
        try {
            const medicine = await this.medicineRepository.findOne({ where: { id: req.params.id } });
            if (!medicine)
                throw new errorHandler_1.AppError(404, 'Medicine not found');
            res.json({ medicine });
        }
        catch (error) {
            res.status(404).json({ error: 'Medicine not found' });
        }
    }
    async create(req, res) {
        try {
            const medicine = this.medicineRepository.create(req.body);
            await this.medicineRepository.save(medicine);
            res.status(201).json({ message: 'Medicine created', medicine });
        }
        catch (error) {
            res.status(400).json({ error: 'Error creating medicine' });
        }
    }
    async update(req, res) {
        try {
            const medicine = await this.medicineRepository.findOne({ where: { id: req.params.id } });
            if (!medicine)
                throw new errorHandler_1.AppError(404, 'Medicine not found');
            Object.assign(medicine, req.body);
            await this.medicineRepository.save(medicine);
            res.json({ message: 'Medicine updated', medicine });
        }
        catch (error) {
            res.status(404).json({ error: 'Medicine not found' });
        }
    }
    async updateStock(req, res) {
        try {
            const medicine = await this.medicineRepository.findOne({ where: { id: req.params.id } });
            if (!medicine)
                throw new errorHandler_1.AppError(404, 'Medicine not found');
            medicine.currentStock = req.body.quantity || req.body.stock;
            await this.medicineRepository.save(medicine);
            res.json({ message: 'Stock updated', currentStock: medicine.currentStock });
        }
        catch (error) {
            res.status(404).json({ error: 'Medicine not found' });
        }
    }
    async delete(req, res) {
        try {
            const medicine = await this.medicineRepository.findOne({ where: { id: req.params.id } });
            if (!medicine)
                throw new errorHandler_1.AppError(404, 'Medicine not found');
            medicine.isActive = false;
            await this.medicineRepository.save(medicine);
            res.json({ message: 'Medicine deleted' });
        }
        catch (error) {
            res.status(404).json({ error: 'Medicine not found' });
        }
    }
}
exports.MedicineController = MedicineController;
//# sourceMappingURL=MedicineController.js.map