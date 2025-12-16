import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';
export interface AuditLogData {
    userId: string;
    tenantId: string;
    action: string;
    resourceType?: string;
    resourceId?: string;
    oldValues?: any;
    newValues?: any;
    ipAddress?: string;
    userAgent?: string;
    success?: boolean;
    errorMessage?: string;
}
export declare class AuditService {
    private auditLogRepository;
    constructor(auditLogRepository: Repository<AuditLog>);
    log(data: AuditLogData): Promise<void>;
    findByTenant(tenantId: string, page?: number, limit?: number): Promise<{
        logs: AuditLog[];
        total: number;
    }>;
    findByUser(userId: string, tenantId: string, page?: number, limit?: number): Promise<{
        logs: AuditLog[];
        total: number;
    }>;
    findByAction(action: string, tenantId: string, page?: number, limit?: number): Promise<{
        logs: AuditLog[];
        total: number;
    }>;
}
//# sourceMappingURL=audit.service.d.ts.map