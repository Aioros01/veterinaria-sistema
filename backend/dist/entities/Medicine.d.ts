import { AuditableEntity } from './AuditableEntity';
export declare enum MedicineCategory {
    ANTIBIOTIC = "antibiotic",
    ANALGESIC = "analgesic",
    ANTI_INFLAMMATORY = "anti_inflammatory",
    ANTIPARASITIC = "antiparasitic",
    VACCINE = "vaccine",
    VITAMIN = "vitamin",
    SUPPLEMENT = "supplement",
    OTHER = "other"
}
export declare class Medicine extends AuditableEntity {
    name: string;
    genericName: string;
    manufacturer: string;
    category: MedicineCategory;
    description: string;
    presentation: string;
    concentration: string;
    unitPrice: number;
    currentStock: number;
    minimumStock: number;
    maximumStock: number;
    supplier: string;
    supplierContact: string;
    expirationDate: Date;
    batchNumber: string;
    storageConditions: string;
    contraindications: string;
    sideEffects: string;
    isActive: boolean;
    customFields: Record<string, any>;
    isLowStock(): boolean;
    isExpiringSoon(daysThreshold?: number): boolean;
    isExpired(): boolean;
}
//# sourceMappingURL=Medicine.d.ts.map