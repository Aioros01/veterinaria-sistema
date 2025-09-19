import { Request, Response } from 'express';
export declare class AuthController {
    private userRepository;
    register(req: Request, res: Response): Promise<void>;
    login(req: Request, res: Response): Promise<void>;
    forgotPassword(req: Request, res: Response): Promise<void>;
    resetPassword(req: Request, res: Response): Promise<void>;
    refreshToken(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=AuthController.d.ts.map