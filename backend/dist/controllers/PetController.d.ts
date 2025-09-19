import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare class PetController {
    private petRepository;
    create(req: AuthRequest, res: Response): Promise<void>;
    getAll(req: AuthRequest, res: Response): Promise<void>;
    getMyPets(req: AuthRequest, res: Response): Promise<void>;
    getById(req: AuthRequest, res: Response): Promise<void>;
    update(req: AuthRequest, res: Response): Promise<void>;
    delete(req: AuthRequest, res: Response): Promise<void>;
    uploadPhoto(req: AuthRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=PetController.d.ts.map