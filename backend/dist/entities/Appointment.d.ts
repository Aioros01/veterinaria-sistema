import { AuditableEntity } from './AuditableEntity';
import { Pet } from './Pet';
import { User } from './User';
export declare enum AppointmentStatus {
    SCHEDULED = "scheduled",
    CONFIRMED = "confirmed",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed",
    CANCELLED = "cancelled",
    NO_SHOW = "no_show"
}
export declare enum AppointmentType {
    CONSULTATION = "consultation",
    VACCINATION = "vaccination",
    SURGERY = "surgery",
    GROOMING = "grooming",
    CHECKUP = "checkup",
    EMERGENCY = "emergency",
    OTHER = "other"
}
export declare class Appointment extends AuditableEntity {
    appointmentDate: Date;
    startTime: string;
    endTime: string;
    type: AppointmentType;
    status: AppointmentStatus;
    reason: string;
    notes: string;
    reminderSent48h: boolean;
    reminderSent24h: boolean;
    reminderSent12h: boolean;
    estimatedCost: number;
    actualCost: number;
    customFields: Record<string, any>;
    petId: string;
    veterinarianId: string;
    pet: Pet;
    veterinarian: User;
    getDuration(): number;
}
//# sourceMappingURL=Appointment.d.ts.map