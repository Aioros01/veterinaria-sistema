import { Response } from 'express';
import { AppDataSource } from '../config/database';
import { User, UserRole } from '../entities/User';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { auditService } from '../services/AuditService';
import { AuditAction } from '../entities/AuditLog';
import * as bcrypt from 'bcrypt';

export class UserController {
  private userRepository = AppDataSource.getRepository(User);
  private auditService = auditService;

  async searchByDocument(req: AuthRequest, res: Response): Promise<void> {
    const { documentNumber } = req.params;
    
    const user = await this.userRepository.findOne({
      where: { documentNumber },
      relations: ['pets']
    });
    
    if (!user) {
      throw new AppError(404, 'Usuario no encontrado con ese número de documento');
    }
    
    res.json({ user });
  }

  async getProfile(req: AuthRequest, res: Response): Promise<void> {
    res.json({ user: req.user });
  }

  async updateProfile(req: AuthRequest, res: Response): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: req.user!.id } });
    if (!user) throw new AppError(404, 'User not found');
    
    Object.assign(user, req.body);
    await this.userRepository.save(user);
    
    res.json({ message: 'Profile updated', user });
  }

  async getAllUsers(req: AuthRequest, res: Response): Promise<void> {
    const users = await this.userRepository.find();
    res.json({ users });
  }

  async getUserById(req: AuthRequest, res: Response): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: req.params.id } });
    if (!user) throw new AppError(404, 'User not found');
    res.json({ user });
  }

  async updateUser(req: AuthRequest, res: Response): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: req.params.id } });
    if (!user) throw new AppError(404, 'User not found');

    // Guardar valores anteriores para auditoría
    const oldValues = { ...user };

    // Si se está actualizando el número de documento, verificar que no exista
    if (req.body.documentNumber && req.body.documentNumber !== user.documentNumber) {
      const existingDocument = await this.userRepository.findOne({
        where: { documentNumber: req.body.documentNumber }
      });
      if (existingDocument) {
        throw new AppError(400, 'El número de documento ya está registrado');
      }
    }

    // No permitir cambiar la contraseña por este método
    const { password, ...updateData } = req.body;

    Object.assign(user, updateData);
    await this.userRepository.save(user);

    // Registrar en auditoría
    await auditService.logUserUpdate(
      user.id,
      oldValues,
      user,
      req.user!,
      req.ip,
      req.headers['user-agent'] as string
    );

    res.json({ message: 'User updated', user });
  }

  async deleteUser(req: AuthRequest, res: Response): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: req.params.id } });
    if (!user) throw new AppError(404, 'User not found');
    
    user.isActive = false;
    await this.userRepository.save(user);
    
    res.json({ message: 'User deleted' });
  }

  // Crear usuario por admin
  async adminCreateUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { email, password, firstName, lastName, role, phone, documentType, documentNumber } = req.body;

      // Verificar si el email ya existe
      const existingUser = await this.userRepository.findOne({ where: { email } });
      if (existingUser) {
        throw new AppError(400, 'El email ya está registrado');
      }

      // Verificar si el número de documento ya existe (si se proporciona)
      if (documentNumber) {
        const existingDocument = await this.userRepository.findOne({ where: { documentNumber } });
        if (existingDocument) {
          throw new AppError(400, 'El número de documento ya está registrado');
        }
      }

      // Hash de la contraseña
      const hashedPassword = await bcrypt.hash(password, 10);

      // Crear el usuario
      const user = this.userRepository.create({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: role || 'client',
        phone,
        documentType: documentType || 'cedula',
        documentNumber,
        isActive: true
      });

      await this.userRepository.save(user);

      // Registrar en auditoría
      await auditService.logUserCreation(
        user,
        req.user!,
        req.ip,
        req.headers['user-agent'] as string
      );

      // No devolver la contraseña
      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json({
        message: 'Usuario creado exitosamente',
        user: userWithoutPassword
      });
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // Crear cliente por veterinario
  async createClient(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { email, password, firstName, lastName, phone, documentType, documentNumber } = req.body;

      // Verificar si el email ya existe
      const existingUser = await this.userRepository.findOne({ where: { email } });
      if (existingUser) {
        throw new AppError(400, 'El email ya está registrado');
      }

      // Verificar si el número de documento ya existe
      if (documentNumber) {
        const existingDocument = await this.userRepository.findOne({ where: { documentNumber } });
        if (existingDocument) {
          throw new AppError(400, 'El número de documento ya está registrado');
        }
      }

      // Hash de la contraseña
      const hashedPassword = await bcrypt.hash(password, 10);

      // Crear el usuario - FORZAR ROL CLIENTE
      const user = this.userRepository.create({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: UserRole.CLIENT, // SIEMPRE cliente cuando lo crea un veterinario
        phone,
        documentType: documentType || 'cedula',
        documentNumber,
        isActive: true
      });

      await this.userRepository.save(user);

      // Registrar en auditoría
      await auditService.logUserCreation(
        user,
        req.user!,
        req.ip,
        req.headers['user-agent'] as string
      );

      // No devolver la contraseña
      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json({
        message: 'Cliente creado exitosamente',
        user: userWithoutPassword
      });
    } catch (error) {
      console.error('Error creating client:', error);
      throw error;
    }
  }

  // Restablecer contraseña sin email
  async resetPassword(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { newPassword } = req.body;

      const user = await this.userRepository.findOne({ where: { id } });
      if (!user) {
        throw new AppError(404, 'Usuario no encontrado');
      }

      // Si es veterinario, solo puede resetear contraseñas de clientes
      if (req.user!.role === UserRole.VETERINARIAN && user.role !== UserRole.CLIENT) {
        throw new AppError(403, 'Los veterinarios solo pueden resetear contraseñas de clientes');
      }

      // Hash de la nueva contraseña
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;

      await this.userRepository.save(user);

      // Registrar en auditoría
      await auditService.logPasswordReset(
        user,
        req.user!,
        req.ip,
        req.headers['user-agent'] as string
      );

      res.json({ 
        message: 'Contraseña restablecida exitosamente',
        email: user.email
      });
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  }

  // Toggle usuario activo/inactivo
  async toggleActive(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const user = await this.userRepository.findOne({ where: { id } });
      if (!user) {
        throw new AppError(404, 'Usuario no encontrado');
      }

      // No permitir desactivar el propio usuario
      if (user.id === req.user!.id) {
        throw new AppError(400, 'No puedes desactivar tu propio usuario');
      }

      user.isActive = !user.isActive;
      await this.userRepository.save(user);

      res.json({ 
        message: user.isActive ? 'Usuario activado' : 'Usuario desactivado',
        user
      });
    } catch (error) {
      console.error('Error toggling user active status:', error);
      throw error;
    }
  }
}