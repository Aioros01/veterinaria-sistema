import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare class MedicalHistoryController {
    private medicalHistoryRepository;
    private prescriptionRepository;
    create(req: AuthRequest, res: Response): Promise<void>;
    getByPet(req: AuthRequest, res: Response): Promise<void>;
    getById(req: AuthRequest, res: Response): Promise<void>;
    update(req: AuthRequest, res: Response): Promise<void>;
    uploadAttachments(req: AuthRequest, res: Response): Promise<void>;
    addPrescription(req: AuthRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=MedicalHistoryController.d.ts.map