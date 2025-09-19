import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare class HospitalizationController {
    private hospitalizationRepo;
    private medicationRepo;
    private noteRepo;
    create(req: AuthRequest, res: Response): Promise<void>;
    getActive(req: AuthRequest, res: Response): Promise<void>;
    addMedication(req: AuthRequest, res: Response): Promise<void>;
    administerMedication(req: AuthRequest, res: Response): Promise<void>;
    addNote(req: AuthRequest, res: Response): Promise<void>;
    discharge(req: AuthRequest, res: Response): Promise<void>;
    getById(req: AuthRequest, res: Response): Promise<void>;
    getByPet(req: AuthRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=HospitalizationController.d.ts.map