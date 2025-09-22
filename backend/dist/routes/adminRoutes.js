"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const database_1 = require("../config/database");
const User_1 = require("../entities/User");
const Pet_1 = require("../entities/Pet");
const Appointment_1 = require("../entities/Appointment");
const Medicine_1 = require("../entities/Medicine");
const Prescription_1 = require("../entities/Prescription");
const MedicineSale_1 = require("../entities/MedicineSale");
const router = (0, express_1.Router)();
// Middleware para verificar que el usuario es admin
const adminMiddleware = async (req, res, next) => {
    if (req.user?.role !== User_1.UserRole.ADMIN) {
        return res.status(403).json({ message: 'Acceso denegado. Solo administradores.' });
    }
    next();
};
// Aplicar autenticación y verificación de admin a todas las rutas
router.use(auth_1.AuthMiddleware.authenticate, adminMiddleware);
// Obtener estadísticas generales del sistema
router.get('/stats', async (req, res) => {
    try {
        const userRepo = database_1.AppDataSource.getRepository(User_1.User);
        const petRepo = database_1.AppDataSource.getRepository(Pet_1.Pet);
        const appointmentRepo = database_1.AppDataSource.getRepository(Appointment_1.Appointment);
        const medicationRepo = database_1.AppDataSource.getRepository(Medicine_1.Medicine);
        const prescriptionRepo = database_1.AppDataSource.getRepository(Prescription_1.Prescription);
        const saleRepo = database_1.AppDataSource.getRepository(MedicineSale_1.MedicineSale);
        // Contar registros
        const totalUsers = await userRepo.count();
        const totalPets = await petRepo.count();
        const totalAppointments = await appointmentRepo.count();
        const totalMedications = await medicationRepo.count();
        const totalPrescriptions = await prescriptionRepo.count();
        const totalSales = await saleRepo.count();
        // Contar por estados
        const pendingAppointments = await appointmentRepo.count({
            where: { status: Appointment_1.AppointmentStatus.SCHEDULED }
        });
        const completedAppointments = await appointmentRepo.count({
            where: { status: Appointment_1.AppointmentStatus.COMPLETED }
        });
        // Calcular total de ventas
        const sales = await saleRepo.find();
        const totalRevenue = sales.reduce((sum, sale) => sum + parseFloat((sale.finalPrice || 0).toString()), 0);
        // Medicamentos con bajo stock
        const lowStockMeds = await medicationRepo
            .createQueryBuilder('medication')
            .where('medication.currentStock < 10')
            .getCount();
        res.json({
            users: {
                total: totalUsers,
                admins: await userRepo.count({ where: { role: User_1.UserRole.ADMIN } }),
                vets: await userRepo.count({ where: { role: User_1.UserRole.VETERINARIAN } }),
                clients: await userRepo.count({ where: { role: User_1.UserRole.CLIENT } })
            },
            pets: {
                total: totalPets,
                dogs: await petRepo.count({ where: { species: Pet_1.PetSpecies.DOG } }),
                cats: await petRepo.count({ where: { species: Pet_1.PetSpecies.CAT } }),
                others: await petRepo
                    .createQueryBuilder('pet')
                    .where('pet.species NOT IN (:...species)', { species: ['dog', 'cat'] })
                    .getCount()
            },
            appointments: {
                total: totalAppointments,
                pending: pendingAppointments,
                completed: completedAppointments,
                cancelled: await appointmentRepo.count({ where: { status: Appointment_1.AppointmentStatus.CANCELLED } })
            },
            inventory: {
                totalMedications: totalMedications,
                lowStock: lowStockMeds
            },
            prescriptions: {
                total: totalPrescriptions
            },
            sales: {
                total: totalSales,
                revenue: totalRevenue
            }
        });
    }
    catch (error) {
        console.error('Error obteniendo estadísticas:', error);
        res.status(500).json({
            message: 'Error al obtener estadísticas',
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
});
// Obtener todos los usuarios con detalles
router.get('/all-users', async (req, res) => {
    try {
        const userRepo = database_1.AppDataSource.getRepository(User_1.User);
        const users = await userRepo.find({
            select: ['id', 'firstName', 'lastName', 'email', 'phone', 'address', 'role', 'createdAt', 'updatedAt'],
            order: { createdAt: 'DESC' }
        });
        res.json(users);
    }
    catch (error) {
        console.error('Error obteniendo usuarios:', error);
        res.status(500).json({ message: 'Error al obtener usuarios' });
    }
});
// Obtener todas las mascotas con propietarios
router.get('/all-pets', async (req, res) => {
    try {
        const petRepo = database_1.AppDataSource.getRepository(Pet_1.Pet);
        const pets = await petRepo.find({
            relations: ['owner'],
            order: { createdAt: 'DESC' }
        });
        res.json(pets);
    }
    catch (error) {
        console.error('Error obteniendo mascotas:', error);
        res.status(500).json({ message: 'Error al obtener mascotas' });
    }
});
// Obtener todas las citas con detalles completos
router.get('/all-appointments', async (req, res) => {
    try {
        const appointmentRepo = database_1.AppDataSource.getRepository(Appointment_1.Appointment);
        const appointments = await appointmentRepo.find({
            relations: ['pet', 'pet.owner', 'veterinarian'],
            order: { appointmentDate: 'DESC', startTime: 'DESC' }
        });
        res.json(appointments);
    }
    catch (error) {
        console.error('Error obteniendo citas:', error);
        res.status(500).json({ message: 'Error al obtener citas' });
    }
});
// Obtener todo el inventario de medicamentos
router.get('/all-medications', async (req, res) => {
    try {
        const medicationRepo = database_1.AppDataSource.getRepository(Medicine_1.Medicine);
        const medications = await medicationRepo.find({
            order: { name: 'ASC' }
        });
        res.json(medications);
    }
    catch (error) {
        console.error('Error obteniendo medicamentos:', error);
        res.status(500).json({ message: 'Error al obtener medicamentos' });
    }
});
// Obtener todas las prescripciones
router.get('/all-prescriptions', async (req, res) => {
    try {
        const prescriptionRepo = database_1.AppDataSource.getRepository(Prescription_1.Prescription);
        const prescriptions = await prescriptionRepo.find({
            relations: ['medicalHistory', 'medicalHistory.pet', 'medicalHistory.pet.owner', 'medicalHistory.veterinarian', 'medicine'],
            order: { startDate: 'DESC' }
        });
        res.json(prescriptions);
    }
    catch (error) {
        console.error('Error obteniendo prescripciones:', error);
        res.status(500).json({ message: 'Error al obtener prescripciones' });
    }
});
// Obtener todas las ventas con detalles
router.get('/all-sales', async (req, res) => {
    try {
        const saleRepo = database_1.AppDataSource.getRepository(MedicineSale_1.MedicineSale);
        const sales = await saleRepo.find({
            relations: ['client', 'medicine', 'prescription'],
            order: { saleDate: 'DESC' }
        });
        res.json(sales);
    }
    catch (error) {
        console.error('Error obteniendo ventas:', error);
        res.status(500).json({ message: 'Error al obtener ventas' });
    }
});
exports.default = router;
//# sourceMappingURL=adminRoutes.js.map