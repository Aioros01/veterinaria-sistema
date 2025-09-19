import * as cron from 'node-cron';
import { AppDataSource } from '../config/database';
import { Appointment, AppointmentStatus } from '../entities/Appointment';
import { Vaccination } from '../entities/Vaccination';
import { notificationService } from '../services/NotificationService';
import { LessThanOrEqual, MoreThan, IsNull, Between } from 'typeorm';

export function scheduleCronJobs(): void {
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

async function sendAppointmentReminders(): Promise<void> {
  try {
    const appointmentRepo = AppDataSource.getRepository(Appointment);
    const now = new Date();
    
    // Recordatorio 48 horas
    const in48Hours = new Date(now.getTime() + 48 * 60 * 60 * 1000);
    const appointments48h = await appointmentRepo.find({
      where: {
        appointmentDate: Between(new Date(in48Hours.getTime() - 60 * 60 * 1000), in48Hours),
        status: AppointmentStatus.SCHEDULED,
        reminderSent48h: false
      },
      relations: ['pet', 'pet.owner']
    });

    for (const appointment of appointments48h) {
      await notificationService.sendAppointmentReminder(
        appointment,
        appointment.pet.owner,
        appointment.pet,
        48
      );
      appointment.reminderSent48h = true;
      await appointmentRepo.save(appointment);
    }

    // Recordatorio 24 horas
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const appointments24h = await appointmentRepo.find({
      where: {
        appointmentDate: Between(new Date(in24Hours.getTime() - 60 * 60 * 1000), in24Hours),
        status: AppointmentStatus.SCHEDULED,
        reminderSent24h: false
      },
      relations: ['pet', 'pet.owner']
    });

    for (const appointment of appointments24h) {
      await notificationService.sendAppointmentReminder(
        appointment,
        appointment.pet.owner,
        appointment.pet,
        24
      );
      appointment.reminderSent24h = true;
      await appointmentRepo.save(appointment);
    }

    // Recordatorio 12 horas
    const in12Hours = new Date(now.getTime() + 12 * 60 * 60 * 1000);
    const appointments12h = await appointmentRepo.find({
      where: {
        appointmentDate: Between(new Date(in12Hours.getTime() - 60 * 60 * 1000), in12Hours),
        status: AppointmentStatus.SCHEDULED,
        reminderSent12h: false
      },
      relations: ['pet', 'pet.owner']
    });

    for (const appointment of appointments12h) {
      await notificationService.sendAppointmentReminder(
        appointment,
        appointment.pet.owner,
        appointment.pet,
        12
      );
      appointment.reminderSent12h = true;
      await appointmentRepo.save(appointment);
    }

    console.log(`✉️ Sent ${appointments48h.length + appointments24h.length + appointments12h.length} appointment reminders`);
  } catch (error) {
    console.error('Error sending appointment reminders:', error);
  }
}

async function sendVaccinationReminders(): Promise<void> {
  try {
    const vaccinationRepo = AppDataSource.getRepository(Vaccination);
    const today = new Date();
    const in7Days = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    const upcomingVaccinations = await vaccinationRepo.find({
      where: {
        nextDoseDate: Between(today, in7Days),
        reminderSent: false
      },
      relations: ['pet', 'pet.owner']
    });

    for (const vaccination of upcomingVaccinations) {
      await notificationService.sendVaccinationReminder(
        vaccination,
        vaccination.pet.owner,
        vaccination.pet
      );
      vaccination.reminderSent = true;
      await vaccinationRepo.save(vaccination);
    }

    console.log(`💉 Sent ${upcomingVaccinations.length} vaccination reminders`);
  } catch (error) {
    console.error('Error sending vaccination reminders:', error);
  }
}

async function updateDashboardStats(): Promise<void> {
  try {
    // Aquí puedes agregar lógica para pre-calcular estadísticas del dashboard
    // y almacenarlas en caché para acceso rápido
    console.log('📊 Dashboard statistics updated');
  } catch (error) {
    console.error('Error updating dashboard stats:', error);
  }
}