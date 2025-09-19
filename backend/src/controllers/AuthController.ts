import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { User, UserRole } from '../entities/User';
import { AuthMiddleware } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { notificationService } from '../services/NotificationService';
import { cache, CacheKeys } from '../config/redis';
import { validate } from 'class-validator';

export class AuthController {
  private userRepository = AppDataSource.getRepository(User);

  async register(req: Request, res: Response): Promise<void> {
    const { firstName, lastName, email, password, phone, address, role } = req.body;

    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new AppError(400, 'Email already registered');
    }

    const user = this.userRepository.create({
      firstName,
      lastName,
      email,
      password,
      phone,
      address,
      role: role || UserRole.CLIENT
    });

    const errors = await validate(user);
    if (errors.length > 0) {
      throw new AppError(400, 'Validation failed');
    }

    await this.userRepository.save(user);
    
    const token = AuthMiddleware.generateToken(user);
    
    await notificationService.sendWelcomeEmail(user);
    
    const { password: _, ...userWithoutPassword } = user;
    
    res.status(201).json({
      message: 'User registered successfully',
      user: userWithoutPassword,
      token
    });
  }

  async login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;

    if (!email) {
      throw new AppError(400, 'Email is required');
    }

    // Buscar por email solamente y obtener el password (que está marcado como select: false)
    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();

    if (!user || !await user.validatePassword(password)) {
      throw new AppError(401, 'Invalid credentials');
    }

    if (!user.isActive) {
      throw new AppError(401, 'Account is deactivated');
    }

    const token = AuthMiddleware.generateToken(user);
    
    await cache.set(CacheKeys.USER(user.id), user, 3600);
    
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      message: 'Login successful',
      user: userWithoutPassword,
      token
    });
  }

  async forgotPassword(req: Request, res: Response): Promise<void> {
    const { email } = req.body;

    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      res.json({ message: 'If the email exists, a reset link has been sent' });
      return;
    }

    const resetToken = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    await cache.set(`reset_token:${resetToken}`, user.id, 3600);
    
    await notificationService.sendPasswordReset(user, resetToken);
    
    res.json({ message: 'If the email exists, a reset link has been sent' });
  }

  async resetPassword(req: Request, res: Response): Promise<void> {
    const { token, newPassword } = req.body;

    const userId = await cache.get<string>(`reset_token:${token}`);
    if (!userId) {
      throw new AppError(400, 'Invalid or expired reset token');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new AppError(404, 'User not found');
    }

    user.password = newPassword;
    await this.userRepository.save(user);
    
    await cache.del(`reset_token:${token}`);
    await cache.del(CacheKeys.USER(user.id));
    
    res.json({ message: 'Password reset successfully' });
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    const { token } = req.body;

    const decoded = await AuthMiddleware.verifyToken(token);
    if (!decoded) {
      throw new AppError(401, 'Invalid token');
    }

    const user = await this.userRepository.findOne({ 
      where: { id: decoded.id, isActive: true } 
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    const newToken = AuthMiddleware.generateToken(user);
    
    res.json({ token: newToken });
  }
}