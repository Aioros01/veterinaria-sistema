"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.scheduleCronJobs = scheduleCronJobs;
const cron = __importStar(require("node-cron"));
const database_1 = require("../config/database");
const Appointment_1 = require("../entities/Appointment");
const Vaccination_1 = require("../entities/Vaccination");
const NotificationService_1 = require("../services/NotificationService");
const typeorm_1 = require("typeorm");
function scheduleCronJobs() {
    // Ejecutar cada hora para verificar recordatorios de citas
    cron.schedule('0 * * * *', async () => {
        console.log('⏰ Checking appointment reminders...');
        await sendAppointmentReminders();
    });
    // Ejecutar diariamente a las 9 AM para verificar vacunaciones pendientes
    cron.schedule('0 9 * * *', async () => {
        console.log('💉 Checking vaccination reminders...');
        await sendVaccinationReminders();
    });
    // Ejecutar diariamente a las 8 AM para actualizar estadísticas del dashboard
    cron.schedule('0 8 * * *', async () => {
        console.log('📊 Updating dashboard statistics...');
        await updateDashboardStats();
    });
    console.log('✅ Cron jobs scheduled successfully');
}
async function sendAppointmentReminders() {
    try {
        const appointmentRepo = database_1.AppDataSource.getRepository(Appointment_1.Appointment);
        const now = new Date();
        // Recordatorio 48 horas
        const in48Hours = new Date(now.getTime() + 48 * 60 * 60 * 1000);
        const appointments48h = await appointmentRepo.find({
            where: {
                appointmentDate: (0, typeorm_1.Between)(new Date(in48Hours.getTime() - 60 * 60 * 1000), in48Hours),
                status: Appointment_1.AppointmentStatus.SCHEDULED,
                reminderSent48h: false
            },
            relations: ['pet', 'pet.owner']
        });
        for (const appointment of appointments48h) {
            await NotificationService_1.notificationService.sendAppointmentReminder(appointment, appointment.pet.owner, appointment.pet, 48);
            appointment.reminderSent48h = true;
            await appointmentRepo.save(appointment);
        }
        // Recordatorio 24 horas
        const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        const appointments24h = await appointmentRepo.find({
            where: {
                appointmentDate: (0, typeorm_1.Between)(new Date(in24Hours.getTime() - 60 * 60 * 1000), in24Hours),
                status: Appointment_1.AppointmentStatus.SCHEDULED,
                reminderSent24h: false
            },
            relations: ['pet', 'pet.owner']
        });
        for (const appointment of appointments24h) {
            await NotificationService_1.notificationService.sendAppointmentReminder(appointment, appointment.pet.owner, appointment.pet, 24);
            appointment.reminderSent24h = true;
            await appointmentRepo.save(appointment);
        }
        // Recordatorio 12 horas
        const in12Hours = new Date(now.getTime() + 12 * 60 * 60 * 1000);
        const appointments12h = await appointmentRepo.find({
            where: {
                appointmentDate: (0, typeorm_1.Between)(new Date(in12Hours.getTime() - 60 * 60 * 1000), in12Hours),
                status: Appointment_1.AppointmentStatus.SCHEDULED,
                reminderSent12h: false
            },
            relations: ['pet', 'pet.owner']
        });
        for (const appointment of appointments12h) {
            await NotificationService_1.notificationService.sendAppointmentReminder(appointment, appointment.pet.owner, appointment.pet, 12);
            appointment.reminderSent12h = true;
            await appointmentRepo.save(appointment);
        }
        console.log(`✉️ Sent ${appointments48h.length + appointments24h.length + appointments12h.length} appointment reminders`);
    }
    catch (error) {
        console.error('Error sending appointment reminders:', error);
    }
}
async function sendVaccinationReminders() {
    try {
        const vaccinationRepo = database_1.AppDataSource.getRepository(Vaccination_1.Vaccination);
        const today = new Date();
        const in7Days = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        const upcomingVaccinations = await vaccinationRepo.find({
            where: {
                nextDoseDate: (0, typeorm_1.Between)(today, in7Days),
                reminderSent: false
            },
            relations: ['pet', 'pet.owner']
        });
        for (const vaccination of upcomingVaccinations) {
            await NotificationService_1.notificationService.sendVaccinationReminder(vaccination, vaccination.pet.owner, vaccination.pet);
            vaccination.reminderSent = true;
            await vaccinationRepo.save(vaccination);
        }
        console.log(`💉 Sent ${upcomingVaccinations.length} vaccination reminders`);
    }
    catch (error) {
        console.error('Error sending vaccination reminders:', error);
    }
}
async function updateDashboardStats() {
    try {
        // Aquí puedes agregar lógica para pre-calcular estadísticas del dashboard
        // y almacenarlas en caché para acceso rápido
        console.log('📊 Dashboard statistics updated');
    }
    catch (error) {
        console.error('Error updating dashboard stats:', error);
    }
}
//# sourceMappingURL=cronJobs.js.map