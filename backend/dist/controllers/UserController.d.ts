import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare class UserController {
    private userRepository;
    searchByDocument(req: AuthRequest, res: Response): Promise<void>;
    getProfile(req: AuthRequest, res: Response): Promise<void>;
    updateProfile(req: AuthRequest, res: Response): Promise<void>;
    getAllUsers(req: AuthRequest, res: Response): Promise<void>;
    getUserById(req: AuthRequest, res: Response): Promise<void>;
    updateUser(req: AuthRequest, res: Response): Promise<void>;
    deleteUser(req: AuthRequest, res: Response): Promise<void>;
    adminCreateUser(req: AuthRequest, res: Response): Promise<void>;
    resetPassword(req: AuthRequest, res: Response): Promise<void>;
    toggleActive(req: AuthRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=UserController.d.ts.map