import { Request, Response, NextFunction } from 'express';
import { User, UserRole } from '../entities/User';
export interface AuthRequest extends Request {
    user?: User;
    file?: Express.Multer.File;
    files?: Express.Multer.File[] | {
        [fieldname: string]: Express.Multer.File[];
    };
}
export declare class AuthMiddleware {
    static authenticate(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    static authorize(...roles: UserRole[]): (req: AuthRequest, res: Response, next: NextFunction) => void;
    static optionalAuth(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    static generateToken(user: User): string;
    static verifyToken(token: string): Promise<any>;
}
export declare const authenticate: typeof AuthMiddleware.authenticate;
export declare const authorize: typeof AuthMiddleware.authorize;
export declare const optionalAuth: typeof AuthMiddleware.optionalAuth;
//# sourceMappingURL=auth.d.ts.map