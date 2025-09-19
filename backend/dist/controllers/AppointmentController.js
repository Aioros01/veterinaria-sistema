"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentController = void 0;
const database_1 = require("../config/database");
const Appointment_1 = require("../entities/Appointment");
const errorHandler_1 = require("../middleware/errorHandler");
class AppointmentController {
    constructor() {
        this.appointmentRepository = database_1.AppDataSource.getRepository(Appointment_1.Appointment);
    }
    async create(req, res) {
        try {
            // Calcular endTime (agregar 30 minutos al startTime)
            const startTimeParts = req.body.startTime.split(':');
            const startHour = parseInt(startTimeParts[0]);
            const startMinute = parseInt(startTimeParts[1]);
            let endHour = startHour;
            let endMinute = startMinute + 30;
            if (endMinute >= 60) {
                endHour += 1;
                endMinute -= 60;
            }
            const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
            // Buscar el primer veterinario disponible
            const userRepo = database_1.AppDataSource.getRepository('User');
            const vet = await userRepo.findOne({
                where: { role: 'veterinarian', isActive: true }
            });
            if (!vet) {
                throw new errorHandler_1.AppError(400, 'No hay veterinarios disponibles');
            }
            const appointmentData = {
                ...req.body,
                endTime,
                veterinarianId: vet.id,
                status: 'scheduled',
                createdBy: req.user.id, // Registrar quién creó la cita
                updatedBy: req.user.id // Registrar quién la actualizó
            };
            const appointment = this.appointmentRepository.create(appointmentData);
            await this.appointmentRepository.save(appointment);
            res.status(201).json({
                message: 'Cita agendada exitosamente',
                appointment
            });
        }
        catch (error) {
            console.error('Error creating appointment:', error);
            throw error;
        }
    }
    async getMyAppointments(req, res) {
        try {
            let appointments;
            if (req.user.role === 'admin') {
                // Administrador ve TODAS las citas con información completa
                appointments = await this.appointmentRepository.find({
                    relations: ['pet', 'pet.owner', 'veterinarian'],
                    order: { appointmentDate: 'DESC', startTime: 'DESC' }
                });
            }
            else if (req.user.role === 'veterinarian') {
                // Veterinario ve solo sus citas asignadas
                appointments = await this.appointmentRepository.find({
                    where: { veterinarianId: req.user.id },
                    relations: ['pet', 'pet.owner'],
                    order: { appointmentDate: 'DESC', startTime: 'DESC' }
                });
            }
            else {
                // Cliente ve solo las citas de sus mascotas
                const petRepo = database_1.AppDataSource.getRepository('Pet');
                const userPets = await petRepo.find({
                    where: { ownerId: req.user.id },
                    select: ['id']
                });
                const petIds = userPets.map(pet => pet.id);
                if (petIds.length > 0) {
                    appointments = await this.appointmentRepository
                        .createQueryBuilder('appointment')
                        .leftJoinAndSelect('appointment.pet', 'pet')
                        .leftJoinAndSelect('appointment.veterinarian', 'veterinarian')
                        .where('appointment.petId IN (:...petIds)', { petIds })
                        .orderBy('appointment.appointmentDate', 'DESC')
                        .addOrderBy('appointment.startTime', 'DESC')
                        .getMany();
                }
                else {
                    appointments = [];
                }
            }
            res.json({ appointments });
        }
        catch (error) {
            console.error('Error fetching appointments:', error);
            res.json({ appointments: [] });
        }
    }
    async getCalendar(req, res) {
        // Simplificado para evitar errores - retorna array vacío por ahora
        res.json({ appointments: [] });
    }
    async getById(req, res) {
        const appointment = await this.appointmentRepository.findOne({
            where: { id: req.params.id },
            relations: ['pet', 'veterinarian']
        });
        if (!appointment)
            throw new errorHandler_1.AppError(404, 'Appointment not found');
        res.json({ appointment });
    }
    async update(req, res) {
        const appointment = await this.appointmentRepository.findOne({ where: { id: req.params.id } });
        if (!appointment)
            throw new errorHandler_1.AppError(404, 'Appointment not found');
        Object.assign(appointment, req.body);
        await this.appointmentRepository.save(appointment);
        res.json({ message: 'Appointment updated', appointment });
    }
    async updateStatus(req, res) {
        const appointment = await this.appointmentRepository.findOne({ where: { id: req.params.id } });
        if (!appointment)
            throw new errorHandler_1.AppError(404, 'Appointment not found');
        appointment.status = req.body.status;
        await this.appointmentRepository.save(appointment);
        res.json({ message: 'Status updated', appointment });
    }
    async cancel(req, res) {
        const appointment = await this.appointmentRepository.findOne({ where: { id: req.params.id } });
        if (!appointment)
            throw new errorHandler_1.AppError(404, 'Appointment not found');
        appointment.status = 'cancelled';
        await this.appointmentRepository.save(appointment);
        res.json({ message: 'Appointment cancelled' });
    }
}
exports.AppointmentController = AppointmentController;
//# sourceMappingURL=AppointmentController.js.map