import { AuditableEntity } from './AuditableEntity';
import { Pet } from './Pet';
import { User } from './User';
import { HospitalizationMedication } from './HospitalizationMedication';
import { HospitalizationNote } from './HospitalizationNote';
export declare enum DischargeType {
    MEDICAL = "medical",// Alta médica
    VOLUNTARY = "voluntary",// Alta voluntaria
    DEATH = "death",// Fallecimiento
    TRANSFER = "transfer"
}
export declare class Hospitalization extends AuditableEntity {
    admissionDate: Date;
    dischargeDate: Date;
    diagnosis: string;
    reasonForAdmission: string;
    treatmentPlan: string;
    dischargeType: DischargeType;
    dischargeNotes: string;
    isActive: boolean;
    petId: string;
    pet: Pet;
    veterinarianId: string;
    veterinarian: User;
    medications: HospitalizationMedication[];
    notes: HospitalizationNote[];
}
//# sourceMappingURL=Hospitalization.d.ts.map