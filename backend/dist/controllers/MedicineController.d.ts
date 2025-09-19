import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare class MedicineController {
    private medicineRepository;
    getAll(req: AuthRequest, res: Response): Promise<void>;
    getLowStock(req: AuthRequest, res: Response): Promise<void>;
    getExpiring(req: AuthRequest, res: Response): Promise<void>;
    getById(req: AuthRequest, res: Response): Promise<void>;
    create(req: AuthRequest, res: Response): Promise<void>;
    update(req: AuthRequest, res: Response): Promise<void>;
    updateStock(req: AuthRequest, res: Response): Promise<void>;
    delete(req: AuthRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=MedicineController.d.ts.map