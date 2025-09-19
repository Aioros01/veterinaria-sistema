import { AuditableEntity } from './AuditableEntity';
import { Hospitalization } from './Hospitalization';
export declare class HospitalizationMedication extends AuditableEntity {
    medicationName: string;
    dosage: string;
    frequency: string;
    route?: string;
    lastAdministered?: Date;
    nextDue?: Date;
    administrationLog?: any[];
    isActive: boolean;
    hospitalizationId: string;
    hospitalization: Hospitalization;
}
//# sourceMappingURL=HospitalizationMedication.d.ts.map