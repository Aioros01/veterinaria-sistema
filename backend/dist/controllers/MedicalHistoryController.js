"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MedicalHistoryController = void 0;
const database_1 = require("../config/database");
const MedicalHistory_1 = require("../entities/MedicalHistory");
const Prescription_1 = require("../entities/Prescription");
const errorHandler_1 = require("../middleware/errorHandler");
class MedicalHistoryController {
    constructor() {
        this.medicalHistoryRepository = database_1.AppDataSource.getRepository(MedicalHistory_1.MedicalHistory);
        this.prescriptionRepository = database_1.AppDataSource.getRepository(Prescription_1.Prescription);
    }
    async create(req, res) {
        const history = this.medicalHistoryRepository.create({
            ...req.body,
            veterinarianId: req.user.id
        });
        await this.medicalHistoryRepository.save(history);
        res.status(201).json({ message: 'Medical history created', history });
    }
    async getByPet(req, res) {
        const histories = await this.medicalHistoryRepository.find({
            where: { petId: req.params.petId },
            relations: ['veterinarian'],
            order: { visitDate: 'DESC' }
        });
        res.json({ histories });
    }
    async getById(req, res) {
        const history = await this.medicalHistoryRepository.findOne({
            where: { id: req.params.id },
            relations: ['pet', 'veterinarian']
        });
        if (!history)
            throw new errorHandler_1.AppError(404, 'Medical history not found');
        res.json({ history });
    }
    async update(req, res) {
        const history = await this.medicalHistoryRepository.findOne({ where: { id: req.params.id } });
        if (!history)
            throw new errorHandler_1.AppError(404, 'Medical history not found');
        Object.assign(history, req.body);
        await this.medicalHistoryRepository.save(history);
        res.json({ message: 'Medical history updated', history });
    }
    async uploadAttachments(req, res) {
        const history = await this.medicalHistoryRepository.findOne({ where: { id: req.params.id } });
        if (!history)
            throw new errorHandler_1.AppError(404, 'Medical history not found');
        const files = req.files;
        history.attachments = files.map(f => `/uploads/medical/${f.filename}`);
        await this.medicalHistoryRepository.save(history);
        res.json({ message: 'Attachments uploaded', attachments: history.attachments });
    }
    async addPrescription(req, res) {
        const prescription = this.prescriptionRepository.create({
            ...req.body,
            medicalHistoryId: req.params.id
        });
        await this.prescriptionRepository.save(prescription);
        res.status(201).json({ message: 'Prescription added', prescription });
    }
}
exports.MedicalHistoryController = MedicalHistoryController;
//# sourceMappingURL=MedicalHistoryController.js.map