import { AuditLog, AuditAction } from '../entities/AuditLog';
import { User } from '../entities/User';
export declare class AuditService {
    private auditRepository;
    log(params: {
        action: AuditAction;
        entityType: string;
        entityId?: string;
        oldValues?: any;
        newValues?: any;
        performedBy?: User;
        description?: string;
        ipAddress?: string;
        userAgent?: string;
    }): Promise<AuditLog>;
    logUserCreation(newUser: any, createdBy: User, ipAddress?: string, userAgent?: string): Promise<void>;
    logUserUpdate(userId: string, oldUser: any, newUser: any, updatedBy: User, ipAddress?: string, userAgent?: string): Promise<void>;
    logPasswordReset(targetUser: any, resetBy: User, ipAddress?: string, userAgent?: string): Promise<void>;
    logStatusChange(targetUser: any, newStatus: boolean, changedBy: User, ipAddress?: string, userAgent?: string): Promise<void>;
    getAuditLogs(filters?: {
        entityType?: string;
        entityId?: string;
        performedById?: string;
        action?: AuditAction;
        startDate?: Date;
        endDate?: Date;
    }): Promise<AuditLog[]>;
}
export declare const auditService: AuditService;
//# sourceMappingURL=AuditService.d.ts.map