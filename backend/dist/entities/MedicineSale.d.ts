import { AuditableEntity } from './AuditableEntity';
import { Medicine } from './Medicine';
import { Prescription } from './Prescription';
import { User } from './User';
import { Pet } from './Pet';
export declare enum SaleStatus {
    PENDING = "pending",
    COMPLETED = "completed",
    CANCELLED = "cancelled",
    REFUNDED = "refunded"
}
export declare enum PurchaseLocation {
    IN_CLINIC = "in_clinic",// Compra en la veterinaria
    EXTERNAL = "external",// Compra externa
    SPLIT = "split"
}
export declare class MedicineSale extends AuditableEntity {
    saleDate: Date;
    quantity: number;
    quantityInClinic: number;
    quantityExternal: number;
    unitPrice: number;
    totalPrice: number;
    discountPercentage: number;
    discountAmount: number;
    finalPrice: number;
    status: SaleStatus;
    purchaseLocation: PurchaseLocation;
    notes: string;
    externalPharmacy: string;
    invoiceNumber: string;
    prescriptionId: string;
    medicineId: string;
    clientId: string;
    petId: string;
    veterinarianId: string;
    prescription: Prescription;
    medicine: Medicine;
    client: User;
    pet: Pet;
    veterinarian: User;
    calculatePrices(): void;
    affectsInventory(): boolean;
}
//# sourceMappingURL=MedicineSale.d.ts.map