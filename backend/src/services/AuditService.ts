import { AppDataSource } from '../config/database';
import { AuditLog, AuditAction } from '../entities/AuditLog';
import { User } from '../entities/User';

export class AuditService {
  private auditRepository = AppDataSource.getRepository(AuditLog);

  async log(params: {
    action: AuditAction;
    entityType: string;
    entityId?: string;
    oldValues?: any;
    newValues?: any;
    performedBy?: User;
    description?: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<AuditLog> {
    try {
      const auditLog = this.auditRepository.create({
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        oldValues: params.oldValues,
        newValues: params.newValues,
        performedById: params.performedBy?.id,
        performedByEmail: params.performedBy?.email,
        performedByRole: params.performedBy?.role,
        description: params.description || AuditLog.generateDescription(
          params.action,
          params.entityType,
          {
            userName: params.newValues?.firstName || params.oldValues?.firstName,
            email: params.newValues?.email || params.oldValues?.email
          }
        ),
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        createdAt: new Date()
      });

      return await this.auditRepository.save(auditLog);
    } catch (error) {
      console.error('Error al guardar log de auditoría:', error);
      // No lanzamos error para no interrumpir la operación principal
      return null;
    }
  }

  async logUserCreation(
    newUser: any,
    createdBy: User,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      action: AuditAction.CREATE,
      entityType: 'User',
      entityId: newUser.id,
      newValues: {
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role
      },
      performedBy: createdBy,
      description: `${createdBy.role} ${createdBy.email} creó nuevo usuario ${newUser.role}: ${newUser.email}`,
      ipAddress,
      userAgent
    });
  }

  async logUserUpdate(
    userId: string,
    oldUser: any,
    newUser: any,
    updatedBy: User,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    // Detectar qué campos cambiaron
    const changes = {};
    const oldValues = {};

    Object.keys(newUser).forEach(key => {
      if (oldUser[key] !== newUser[key] && key !== 'password') {
        oldValues[key] = oldUser[key];
        changes[key] = newUser[key];
      }
    });

    await this.log({
      action: AuditAction.UPDATE,
      entityType: 'User',
      entityId: userId,
      oldValues,
      newValues: changes,
      performedBy: updatedBy,
      description: `${updatedBy.role} ${updatedBy.email} actualizó usuario ${oldUser.email}`,
      ipAddress,
      userAgent
    });
  }

  async logPasswordReset(
    targetUser: any,
    resetBy: User,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      action: AuditAction.PASSWORD_RESET,
      entityType: 'User',
      entityId: targetUser.id,
      performedBy: resetBy,
      description: `${resetBy.role} ${resetBy.email} reseteó la contraseña de ${targetUser.email}`,
      ipAddress,
      userAgent
    });
  }

  async logStatusChange(
    targetUser: any,
    newStatus: boolean,
    changedBy: User,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      action: AuditAction.STATUS_CHANGE,
      entityType: 'User',
      entityId: targetUser.id,
      oldValues: { isActive: !newStatus },
      newValues: { isActive: newStatus },
      performedBy: changedBy,
      description: `${changedBy.role} ${changedBy.email} ${newStatus ? 'activó' : 'desactivó'} usuario ${targetUser.email}`,
      ipAddress,
      userAgent
    });
  }

  async getAuditLogs(filters?: {
    entityType?: string;
    entityId?: string;
    performedById?: string;
    action?: AuditAction;
    startDate?: Date;
    endDate?: Date;
  }): Promise<AuditLog[]> {
    const query = this.auditRepository.createQueryBuilder('audit')
      .leftJoinAndSelect('audit.performedBy', 'user')
      .orderBy('audit.createdAt', 'DESC');

    if (filters?.entityType) {
      query.andWhere('audit.entityType = :entityType', { entityType: filters.entityType });
    }

    if (filters?.entityId) {
      query.andWhere('audit.entityId = :entityId', { entityId: filters.entityId });
    }

    if (filters?.performedById) {
      query.andWhere('audit.performedById = :performedById', { performedById: filters.performedById });
    }

    if (filters?.action) {
      query.andWhere('audit.action = :action', { action: filters.action });
    }

    if (filters?.startDate) {
      query.andWhere('audit.createdAt >= :startDate', { startDate: filters.startDate });
    }

    if (filters?.endDate) {
      query.andWhere('audit.createdAt <= :endDate', { endDate: filters.endDate });
    }

    return await query.getMany();
  }
}

export const auditService = new AuditService();