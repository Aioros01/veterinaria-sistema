import { Consent } from './Consent';
import { User } from './User';
export declare enum DocumentType {
    SIGNED_CONSENT = "signed_consent",
    ID_DOCUMENT = "id_document"
}
export declare class ConsentDocumentHistory {
    id: string;
    consentId: string;
    consent: Consent;
    documentType: DocumentType;
    documentUrl: string;
    originalFileName?: string;
    mimeType?: string;
    fileSize?: number;
    isActive: boolean;
    notes?: string;
    uploadedById?: string;
    uploadedBy?: User;
    uploadedAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=ConsentDocumentHistory.d.ts.map