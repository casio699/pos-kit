import { AuditService } from './audit.service';
export declare class AuditController {
    private readonly auditService;
    constructor(auditService: AuditService);
    getAuditLogs(req: any, page?: string, limit?: string, userId?: string, action?: string): Promise<{
        logs: import("./entities/audit-log.entity").AuditLog[];
        total: number;
    }>;
}
//# sourceMappingURL=audit.controller.d.ts.map