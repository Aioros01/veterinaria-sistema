import { AuditableEntity } from './AuditableEntity';
import { MedicalHistory } from './MedicalHistory';
import { Medicine } from './Medicine';
export declare enum PurchaseStatus {
    PENDING = "pending",// Pendiente de compra
    PURCHASED_IN_CLINIC = "purchased_in_clinic",// Comprado en la clínica
    PURCHASED_EXTERNAL = "purchased_external",// Comprado externamente
    NOT_PURCHASED = "not_purchased"
}
export declare class Prescription extends AuditableEntity {
    medicineName: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
    startDate: Date;
    endDate: Date;
    isActive: boolean;
    cost: number;
    purchaseStatus: PurchaseStatus;
    quantity: number;
    externalPharmacy: string;
    purchaseDate: Date;
    medicalHistoryId: string;
    medicineId: string;
    medicalHistory: MedicalHistory;
    medicine: Medicine;
}
//# sourceMappingURL=Prescription.d.ts.map