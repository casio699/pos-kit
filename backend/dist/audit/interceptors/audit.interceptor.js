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
var AuditInterceptor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditInterceptor = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const operators_1 = require("rxjs/operators");
const audit_service_1 = require("../audit.service");
const audit_decorator_1 = require("../decorators/audit.decorator");
let AuditInterceptor = AuditInterceptor_1 = class AuditInterceptor {
    constructor(reflector, auditService) {
        this.reflector = reflector;
        this.auditService = auditService;
        this.logger = new common_1.Logger(AuditInterceptor_1.name);
    }
    intercept(context, next) {
        const auditOptions = this.reflector.get(audit_decorator_1.AUDIT_KEY, context.getHandler());
        if (!auditOptions) {
            return next.handle();
        }
        this.logger.log(`Audit interceptor triggered for action: ${auditOptions.action}`);
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        let startTime = Date.now();
        return next.handle().pipe((0, operators_1.tap)({
            next: (response) => {
                // Log successful action
                this.logger.log(`Successful action: ${auditOptions.action}`);
                this.logAction(auditOptions, request, user, true, null, startTime);
            },
            error: (error) => {
                // Log failed action
                this.logger.log(`Failed action: ${auditOptions.action} - ${error.message}`);
                this.logAction(auditOptions, request, user, false, error.message, startTime);
            },
        }));
    }
    async logAction(auditOptions, request, user, success, errorMessage, startTime) {
        if (!user || !user.id) {
            this.logger.warn('No user found in request, skipping audit log');
            return; // Don't log anonymous requests
        }
        try {
            const resourceId = auditOptions.getResourceId
                ? auditOptions.getResourceId([request.body, request.params])
                : null;
            const oldData = auditOptions.getOldData
                ? auditOptions.getOldData([request.body, request.params])
                : null;
            const newData = auditOptions.getNewData
                ? auditOptions.getNewData([request.body, request.params])
                : null;
            this.logger.log(`Creating audit log for user ${user.id}, action ${auditOptions.action}`);
            await this.auditService.log({
                userId: user.id,
                tenantId: user.tenant_id || user.tenantId,
                action: auditOptions.action,
                resourceType: auditOptions.resourceType,
                resourceId: resourceId || undefined,
                oldValues: oldData,
                newValues: newData,
                ipAddress: request.ip || request.connection.remoteAddress,
                userAgent: request.get('User-Agent'),
                success,
                errorMessage: errorMessage || undefined,
            });
            this.logger.log(`Audit log created successfully`);
        }
        catch (error) {
            this.logger.error('Failed to create audit log:', error);
        }
    }
};
exports.AuditInterceptor = AuditInterceptor;
exports.AuditInterceptor = AuditInterceptor = AuditInterceptor_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        audit_service_1.AuditService])
], AuditInterceptor);
//# sourceMappingURL=audit.interceptor.js.map