export interface ConsentTemplate {
    type: string;
    title: string;
    description: string;
    risks: string[];
    alternatives: string[];
    postProcedureCare?: string[];
}
export declare class ConsentTemplateService {
    private static templates;
    static getTemplate(type: string): ConsentTemplate | undefined;
    static getAllTemplates(): ConsentTemplate[];
    static generateConsentText(type: string, data: {
        ownerName: string;
        petName: string;
        clinicName: string;
        veterinarianName: string;
        procedureName?: string;
        treatmentDescription?: string;
    }): string;
    static generatePDF(consentText: string): Buffer;
}
//# sourceMappingURL=ConsentTemplateService.d.ts.map