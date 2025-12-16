"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const audit_log_entity_1 = require("./entities/audit-log.entity");
let AuditService = class AuditService {
    constructor(auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }
    async log(data) {
        try {
            const auditLog = this.auditLogRepository.create({
                user_id: data.userId,
                tenant_id: data.tenantId,
                action: data.action,
                resource_type: data.resourceType,
                resource_id: data.resourceId,
                old_values: data.oldValues,
                new_values: data.newValues,
                ip_address: data.ipAddress,
                user_agent: data.userAgent,
                success: data.success ?? true,
                error_message: data.errorMessage,
            });
            await this.auditLogRepository.save(auditLog);
        }
        catch (error) {
            // Log audit failures to console but don't throw to avoid breaking main functionality
            console.error('Failed to create audit log:', error);
        }
    }
    async findByTenant(tenantId, page = 1, limit = 50) {
        const [logs, total] = await this.auditLogRepository.findAndCount({
            where: { tenant_id: tenantId },
            order: { created_at: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });
        return { logs, total };
    }
    async findByUser(userId, tenantId, page = 1, limit = 50) {
        const [logs, total] = await this.auditLogRepository.findAndCount({
            where: { user_id: userId, tenant_id: tenantId },
            order: { created_at: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });
        return { logs, total };
    }
    async findByAction(action, tenantId, page = 1, limit = 50) {
        const [logs, total] = await this.auditLogRepository.findAndCount({
            where: { action, tenant_id: tenantId },
            order: { created_at: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });
        return { logs, total };
    }
};
exports.AuditService = AuditService;
exports.AuditService = AuditService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(audit_log_entity_1.AuditLog)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], AuditService);
//# sourceMappingURL=audit.service.js.map