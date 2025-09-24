import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  PASSWORD_RESET = 'PASSWORD_RESET',
  STATUS_CHANGE = 'STATUS_CHANGE'
}

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: AuditAction
  })
  action: AuditAction;

  @Column()
  entityType: string; // 'User', 'Pet', 'Appointment', etc.

  @Column({ nullable: true })
  entityId: string; // ID de la entidad afectada

  @Column({ type: 'jsonb', nullable: true })
  oldValues: any; // Valores anteriores (para UPDATE)

  @Column({ type: 'jsonb', nullable: true })
  newValues: any; // Valores nuevos

  @Column({ nullable: true })
  description: string; // Descripción legible de la acción

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'performed_by' })
  performedBy: User; // Quien realizó la acción

  @Column({ nullable: true })
  performedById: string;

  @Column({ nullable: true })
  performedByEmail: string; // Email para referencia rápida

  @Column({ nullable: true })
  performedByRole: string; // Rol del usuario al momento de la acción

  @Column({ nullable: true })
  ipAddress: string; // IP desde donde se realizó la acción

  @Column({ nullable: true })
  userAgent: string; // Browser/dispositivo usado

  @CreateDateColumn()
  createdAt: Date;

  // Helper method para crear descripciones legibles
  static generateDescription(action: AuditAction, entityType: string, details?: any): string {
    const descriptions = {
      [AuditAction.CREATE]: `Creó nuevo ${entityType}`,
      [AuditAction.UPDATE]: `Actualizó ${entityType}`,
      [AuditAction.DELETE]: `Eliminó ${entityType}`,
      [AuditAction.LOGIN]: 'Inició sesión',
      [AuditAction.LOGOUT]: 'Cerró sesión',
      [AuditAction.PASSWORD_RESET]: `Reseteo contraseña de ${entityType}`,
      [AuditAction.STATUS_CHANGE]: `Cambió estado de ${entityType}`
    };

    let description = descriptions[action] || `${action} en ${entityType}`;

    if (details) {
      if (details.userName) description += ` - ${details.userName}`;
      if (details.email) description += ` (${details.email})`;
    }

    return description;
  }
}