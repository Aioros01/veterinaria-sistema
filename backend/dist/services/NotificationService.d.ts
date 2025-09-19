import { Appointment } from '../entities/Appointment';
import { Vaccination } from '../entities/Vaccination';
import { User } from '../entities/User';
import { Pet } from '../entities/Pet';
export declare class NotificationService {
    private emailTransporter;
    constructor();
    sendEmail(to: string, subject: string, html: string): Promise<void>;
    sendWhatsApp(to: string, message: string): Promise<void>;
    sendAppointmentReminder(appointment: Appointment, owner: User, pet: Pet, hoursBefore: number): Promise<void>;
    sendVaccinationReminder(vaccination: Vaccination, owner: User, pet: Pet): Promise<void>;
    sendWelcomeEmail(user: User): Promise<void>;
    sendPasswordReset(user: User, resetToken: string): Promise<void>;
}
export declare const notificationService: NotificationService;
//# sourceMappingURL=NotificationService.d.ts.map