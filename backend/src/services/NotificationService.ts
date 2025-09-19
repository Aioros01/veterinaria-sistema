import { Appointment } from '../entities/Appointment';
import { Vaccination } from '../entities/Vaccination';
import { User } from '../entities/User';
import { Pet } from '../entities/Pet';

export class NotificationService {
  private emailTransporter: any;

  constructor() {
    try {
      const nodemailer = require('nodemailer');
      this.emailTransporter = nodemailer.createTransporter({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
    } catch (error) {
      console.warn('Email service not configured:', error);
      this.emailTransporter = null;
    }
  }

  async sendEmail(to: string, subject: string, html: string): Promise<void> {
    if (!this.emailTransporter) {
      console.warn('Email transporter not configured, skipping email send');
      return;
    }
    try {
      await this.emailTransporter.sendMail({
        from: `"Veterinaria" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html
      });
      console.log(`Email sent to ${to}`);
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  async sendWhatsApp(to: string, message: string): Promise<void> {
    try {
      console.log(`WhatsApp message would be sent to ${to}: ${message}`);
    } catch (error) {
      console.error('Error sending WhatsApp:', error);
      throw error;
    }
  }

  async sendAppointmentReminder(
    appointment: Appointment, 
    owner: User, 
    pet: Pet, 
    hoursBefore: number
  ): Promise<void> {
    const subject = `Recordatorio: Cita veterinaria para ${pet.name}`;
    const html = `
      <h2>Recordatorio de Cita</h2>
      <p>Estimado/a ${owner.getFullName()},</p>
      <p>Le recordamos que tiene una cita programada para su mascota ${pet.name}:</p>
      <ul>
        <li><strong>Fecha:</strong> ${new Date(appointment.appointmentDate).toLocaleDateString()}</li>
        <li><strong>Hora:</strong> ${appointment.startTime}</li>
        <li><strong>Tipo:</strong> ${appointment.type}</li>
        <li><strong>Motivo:</strong> ${appointment.reason || 'Consulta general'}</li>
      </ul>
      <p>Por favor, llegue 10 minutos antes de la hora programada.</p>
      <p>Si necesita cancelar o reprogramar, contáctenos lo antes posible.</p>
      <br>
      <p>Saludos cordiales,<br>Equipo Veterinario</p>
    `;

    if (owner.emailNotifications) {
      await this.sendEmail(owner.email, subject, html);
    }

    if (owner.whatsappNotifications && owner.phone) {
      const whatsappMessage = `Recordatorio: Cita para ${pet.name} el ${new Date(appointment.appointmentDate).toLocaleDateString()} a las ${appointment.startTime}`;
      await this.sendWhatsApp(owner.phone, whatsappMessage);
    }
  }

  async sendVaccinationReminder(
    vaccination: Vaccination,
    owner: User,
    pet: Pet
  ): Promise<void> {
    const subject = `Recordatorio: Vacunación pendiente para ${pet.name}`;
    const html = `
      <h2>Recordatorio de Vacunación</h2>
      <p>Estimado/a ${owner.getFullName()},</p>
      <p>Le recordamos que ${pet.name} tiene una vacunación pendiente:</p>
      <ul>
        <li><strong>Vacuna:</strong> ${vaccination.vaccineName}</li>
        <li><strong>Fecha programada:</strong> ${new Date(vaccination.nextDoseDate!).toLocaleDateString()}</li>
        <li><strong>Dosis:</strong> ${vaccination.doseNumber} de ${vaccination.totalDoses}</li>
      </ul>
      <p>Es importante mantener el calendario de vacunación al día para la salud de su mascota.</p>
      <p>Por favor, agende una cita lo antes posible.</p>
      <br>
      <p>Saludos cordiales,<br>Equipo Veterinario</p>
    `;

    if (owner.emailNotifications) {
      await this.sendEmail(owner.email, subject, html);
    }

    if (owner.whatsappNotifications && owner.phone) {
      const whatsappMessage = `Recordatorio: ${pet.name} necesita la vacuna ${vaccination.vaccineName} el ${new Date(vaccination.nextDoseDate!).toLocaleDateString()}`;
      await this.sendWhatsApp(owner.phone, whatsappMessage);
    }
  }

  async sendWelcomeEmail(user: User): Promise<void> {
    const subject = 'Bienvenido a nuestra Clínica Veterinaria';
    const html = `
      <h2>¡Bienvenido/a ${user.getFullName()}!</h2>
      <p>Gracias por registrarse en nuestro sistema de gestión veterinaria.</p>
      <p>Ahora puede:</p>
      <ul>
        <li>Registrar a sus mascotas</li>
        <li>Agendar citas</li>
        <li>Ver el historial médico</li>
        <li>Recibir recordatorios de vacunación</li>
        <li>Acceder a recetas y tratamientos</li>
      </ul>
      <p>Si tiene alguna pregunta, no dude en contactarnos.</p>
      <br>
      <p>Saludos cordiales,<br>Equipo Veterinario</p>
    `;

    await this.sendEmail(user.email, subject, html);
  }

  async sendPasswordReset(user: User, resetToken: string): Promise<void> {
    const subject = 'Restablecimiento de contraseña';
    const html = `
      <h2>Restablecimiento de contraseña</h2>
      <p>Hola ${user.getFullName()},</p>
      <p>Hemos recibido una solicitud para restablecer su contraseña.</p>
      <p>Use el siguiente código para restablecer su contraseña:</p>
      <h3>${resetToken}</h3>
      <p>Este código expirará en 1 hora.</p>
      <p>Si no solicitó este cambio, ignore este correo.</p>
      <br>
      <p>Saludos cordiales,<br>Equipo Veterinario</p>
    `;

    await this.sendEmail(user.email, subject, html);
  }
}

export const notificationService = new NotificationService();