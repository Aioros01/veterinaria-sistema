"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VaccinationController = void 0;
const database_1 = require("../config/database");
const Vaccination_1 = require("../entities/Vaccination");
const errorHandler_1 = require("../middleware/errorHandler");
const typeorm_1 = require("typeorm");
class VaccinationController {
    constructor() {
        this.vaccinationRepository = database_1.AppDataSource.getRepository(Vaccination_1.Vaccination);
    }
    async create(req, res) {
        const vaccination = this.vaccinationRepository.create({
            ...req.body,
            veterinarianId: req.user.id
        });
        await this.vaccinationRepository.save(vaccination);
        res.status(201).json({ message: 'Vaccination recorded', vaccination });
    }
    async getByPet(req, res) {
        const vaccinations = await this.vaccinationRepository.find({
            where: { petId: req.params.petId },
            relations: ['veterinarian'],
            order: { vaccinationDate: 'DESC' }
        });
        res.json({ vaccinations });
    }
    async getUpcoming(req, res) {
        const vaccinations = await this.vaccinationRepository.find({
            where: { nextDoseDate: (0, typeorm_1.MoreThan)(new Date()) },
            relations: ['pet', 'veterinarian'],
            order: { nextDoseDate: 'ASC' }
        });
        res.json({ vaccinations });
    }
    async getById(req, res) {
        const vaccination = await this.vaccinationRepository.findOne({
            where: { id: req.params.id },
            relations: ['pet', 'veterinarian']
        });
        if (!vaccination)
            throw new errorHandler_1.AppError(404, 'Vaccination not found');
        res.json({ vaccination });
    }
    async update(req, res) {
        const vaccination = await this.vaccinationRepository.findOne({ where: { id: req.params.id } });
        if (!vaccination)
            throw new errorHandler_1.AppError(404, 'Vaccination not found');
        Object.assign(vaccination, req.body);
        await this.vaccinationRepository.save(vaccination);
        res.json({ message: 'Vaccination updated', vaccination });
    }
}
exports.VaccinationController = VaccinationController;
//# sourceMappingURL=VaccinationController.js.map