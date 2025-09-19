import { AuditableEntity } from './AuditableEntity';
import { Pet } from './Pet';
import { User } from './User';
import { MedicalHistory } from './MedicalHistory';
import { ConsentDocumentHistory } from './ConsentDocumentHistory';
export declare enum ConsentType {
    SURGERY = "surgery",// Consentimiento para cirugía
    ANESTHESIA = "anesthesia",// Consentimiento para anestesia
    EUTHANASIA = "euthanasia",// Consentimiento para eutanasia
    HOSPITALIZATION = "hospitalization",// Consentimiento para hospitalización
    TREATMENT = "treatment",// Consentimiento para tratamiento
    OTHER = "other"
}
export declare enum ConsentStatus {
    PENDING = "pending",// Pendiente de firma
    SIGNED = "signed",// Firmado
    REJECTED = "rejected",// Rechazado
    EXPIRED = "expired"
}
export declare class Consent extends AuditableEntity {
    type: ConsentType;
    status: ConsentStatus;
    description: string;
    risks: string;
    alternatives: string;
    documentUrl: string;
    idDocumentUrl: string;
    signedDate: Date;
    signedBy: string;
    relationship: string;
    witnessName: string;
    digitalSignature: string;
    additionalNotes: string;
    expiryDate: Date;
    petId: string;
    pet: Pet;
    medicalHistoryId: string;
    medicalHistory: MedicalHistory;
    requestedById: string;
    requestedBy: User;
    approvedById: string;
    approvedBy: User;
    documentHistory: ConsentDocumentHistory[];
}
//# sourceMappingURL=Consent.d.ts.map