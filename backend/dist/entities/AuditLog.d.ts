import { User } from './User';
export declare enum AuditAction {
    CREATE = "CREATE",
    UPDATE = "UPDATE",
    DELETE = "DELETE",
    LOGIN = "LOGIN",
    LOGOUT = "LOGOUT",
    PASSWORD_RESET = "PASSWORD_RESET",
    STATUS_CHANGE = "STATUS_CHANGE"
}
export declare class AuditLog {
    id: string;
    action: AuditAction;
    entityType: string;
    entityId: string;
    oldValues: any;
    newValues: any;
    description: string;
    performedBy: User;
    performedById: string;
    performedByEmail: string;
    performedByRole: string;
    ipAddress: string;
    userAgent: string;
    createdAt: Date;
    static generateDescription(action: AuditAction, entityType: string, details?: any): string;
}
//# sourceMappingURL=AuditLog.d.ts.map