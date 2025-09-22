import { Request, Response, NextFunction } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import { AppDataSource } from '../config/database';
import { User, UserRole } from '../entities/User';

export interface AuthRequest extends Request {
  user?: User;
  file?: any;
  files?: any[] | { [fieldname: string]: any[] };
  body: any;
  params: any;
  query: any;
  headers: any;
}

export class AuthMiddleware {
  static async authenticate(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    const authStart = performance.now();
    const requestId = (req as any).requestId || 'auth';
    
    try {
      console.log(`[${new Date().toISOString()}] 🔐 [${requestId}] AUTH START`);
      
      // Step 1: Extract token
      const tokenStart = performance.now();
      const token = req.headers.authorization?.split(' ')[1];
      console.log(`[${new Date().toISOString()}] 📝 [${requestId}] Token extraction: ${(performance.now() - tokenStart).toFixed(2)}ms`);

      if (!token) {
        console.log(`[${new Date().toISOString()}] ❌ [${requestId}] No token provided`);
        res.status(401).json({ error: 'No token provided' });
        return;
      }

      // Step 2: Verify JWT
      const verifyStart = performance.now();
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      const verifyTime = performance.now() - verifyStart;
      console.log(`[${new Date().toISOString()}] 🔑 [${requestId}] JWT verification: ${verifyTime.toFixed(2)}ms`);
      
      if ((req as any).logTiming) {
        (req as any).logTiming(`JWT Token Verified`);
      }
      
      // Step 3: Database query
      const dbStart = performance.now();
      console.log(`[${new Date().toISOString()}] 🗄️  [${requestId}] Starting DB query for user ID: ${decoded.id}`);
      
      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({ 
        where: { id: decoded.id, isActive: true } 
      });
      
      const dbTime = performance.now() - dbStart;
      console.log(`[${new Date().toISOString()}] ✅ [${requestId}] DB query complete: ${dbTime.toFixed(2)}ms`);
      
      if (dbTime > 100) {
        console.log(`[${new Date().toISOString()}] ⚠️  [${requestId}] SLOW DB QUERY DETECTED!`);
      }
      
      if ((req as any).logTiming) {
        (req as any).logTiming(`User fetched from database`);
      }

      if (!user) {
        console.log(`[${new Date().toISOString()}] ❌ [${requestId}] User not found in DB`);
        res.status(401).json({ error: 'Invalid token' });
        return;
      }

      req.user = user;
      
      const totalAuthTime = performance.now() - authStart;
      console.log(`[${new Date().toISOString()}] ✅ [${requestId}] AUTH COMPLETE: ${totalAuthTime.toFixed(2)}ms total`);
      
      if ((req as any).logTiming) {
        (req as any).logTiming(`Authentication completed`);
      }
      
      next();
    } catch (error) {
      const totalTime = performance.now() - authStart;
      console.log(`[${new Date().toISOString()}] ❌ [${requestId}] AUTH FAILED: ${totalTime.toFixed(2)}ms - Error: ${error}`);
      res.status(401).json({ error: 'Invalid or expired token' });
    }
  }

  static authorize(...roles: UserRole[]) {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      if (!roles.includes(req.user.role)) {
        res.status(403).json({ error: 'Insufficient permissions' });
        return;
      }

      next();
    };
  }

  static async optionalAuth(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = req.headers.authorization?.split(' ')[1];

      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOne({ 
          where: { id: decoded.id, isActive: true } 
        });
        req.user = user || undefined;
      }

      next();
    } catch (error) {
      next();
    }
  }

  static generateToken(user: User): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not defined');
    }
    
    const options: any = { 
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    };
    
    return jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role 
      },
      secret,
      options
    );
  }

  static async verifyToken(token: string): Promise<any> {
    try {
      return jwt.verify(token, process.env.JWT_SECRET!);
    } catch (error) {
      return null;
    }
  }
}

// Export functions directly for easier import in routes
export const authenticate = AuthMiddleware.authenticate;
export const authorize = AuthMiddleware.authorize;
export const optionalAuth = AuthMiddleware.optionalAuth;