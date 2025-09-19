import { AuditableEntity } from './AuditableEntity';
import { Pet } from './Pet';
import { User } from './User';
import { Prescription } from './Prescription';
export declare class MedicalHistory extends AuditableEntity {
    visitDate: Date;
    reasonForVisit: string;
    symptoms: string;
    diagnosis: string;
    treatment: string;
    weight: number;
    temperature: number;
    heartRate: number;
    respiratoryRate: number;
    physicalExamNotes: string;
    labResults: Record<string, any>;
    attachments: string[];
    followUpInstructions: string;
    nextVisitDate: Date;
    customFields: Record<string, any>;
    petId: string;
    veterinarianId: string;
    pet: Pet;
    veterinarian: User;
    prescriptions: Prescription[];
}
//# sourceMappingURL=MedicalHistory.d.ts.map