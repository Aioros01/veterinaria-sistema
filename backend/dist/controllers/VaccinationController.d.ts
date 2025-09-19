import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare class VaccinationController {
    private vaccinationRepository;
    create(req: AuthRequest, res: Response): Promise<void>;
    getByPet(req: AuthRequest, res: Response): Promise<void>;
    getUpcoming(req: AuthRequest, res: Response): Promise<void>;
    getById(req: AuthRequest, res: Response): Promise<void>;
    update(req: AuthRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=VaccinationController.d.ts.map