import { AuditableEntity } from './AuditableEntity';
import { Hospitalization } from './Hospitalization';
import { User } from './User';
export declare class HospitalizationNote extends AuditableEntity {
    note: string;
    vitalSigns?: {
        temperature?: number;
        heartRate?: number;
        respiratoryRate?: number;
        bloodPressure?: string;
    };
    hospitalizationId: string;
    hospitalization: Hospitalization;
    authorId: string;
    author: User;
}
//# sourceMappingURL=HospitalizationNote.d.ts.map