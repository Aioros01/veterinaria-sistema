import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import multer from 'multer';
export declare const uploadConsent: multer.Multer;
export declare class ConsentController {
    private consentRepo;
    private historyRepo;
    getTemplates(req: AuthRequest, res: Response): Promise<void>;
    generateFromTemplate(req: AuthRequest, res: Response): Promise<void>;
    create(req: AuthRequest, res: Response): Promise<void>;
    getAll(req: AuthRequest, res: Response): Promise<void>;
    getPending(req: AuthRequest, res: Response): Promise<void>;
    sign(req: AuthRequest, res: Response): Promise<void>;
    reject(req: AuthRequest, res: Response): Promise<void>;
    getById(req: AuthRequest, res: Response): Promise<void>;
    getByMedicalHistory(req: AuthRequest, res: Response): Promise<void>;
    getDocumentHistory(req: AuthRequest, res: Response): Promise<void>;
    uploadSigned(req: AuthRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=ConsentController.d.ts.map