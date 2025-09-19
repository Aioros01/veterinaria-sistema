import { AuditableEntity } from './AuditableEntity';
import { Pet } from './Pet';
import { User } from './User';
export declare class Vaccination extends AuditableEntity {
    vaccineName: string;
    manufacturer: string;
    batchNumber: string;
    vaccinationDate: Date;
    expirationDate: Date;
    nextDoseDate: Date;
    doseNumber: number;
    totalDoses: number;
    notes: string;
    cost: number;
    reminderSent: boolean;
    petId: string;
    veterinarianId: string;
    pet: Pet;
    veterinarian: User;
    isUpcoming(): boolean;
    daysUntilNextDose(): number | null;
}
//# sourceMappingURL=Vaccination.d.ts.map