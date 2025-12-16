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
exports.SyncController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const sync_service_1 = require("./sync.service");
let SyncController = class SyncController {
    constructor(syncService) {
        this.syncService = syncService;
    }
    async syncEvents(body, req) {
        const tenantId = req.user.tenant_id || req.user.tenantId;
        return this.syncService.syncEvents(tenantId, body.events);
    }
    async getConflicts(req) {
        const tenantId = req.user.tenant_id || req.user.tenantId;
        return this.syncService.getConflicts(tenantId);
    }
    async getPendingEvents(req, userId) {
        const tenantId = req.user.tenant_id || req.user.tenantId;
        return this.syncService.getPendingSyncEvents(tenantId, userId);
    }
    async createSyncEvent(body, req) {
        const userId = req.user.id;
        const tenantId = req.user.tenant_id || req.user.tenantId;
        return this.syncService.createSyncEvent(userId, tenantId, body.eventType, body.resourceType, body.resourceId, body.data);
    }
    async retryFailedEvents(req) {
        const tenantId = req.user.tenant_id || req.user.tenantId;
        const retriedCount = await this.syncService.retryFailedEvents(tenantId);
        return {
            message: `Retried ${retriedCount} failed events`,
            retried_count: retriedCount,
        };
    }
    async getSyncStatus(req) {
        const tenantId = req.user.tenant_id || req.user.tenantId;
        const userId = req.user.id;
        const pendingEvents = await this.syncService.getPendingSyncEvents(tenantId, userId);
        const conflicts = await this.syncService.getConflicts(tenantId);
        return {
            pending_count: pendingEvents.length,
            conflict_count: conflicts.length,
            pending_events: pendingEvents,
            conflicts,
        };
    }
};
exports.SyncController = SyncController;
__decorate([
    (0, common_1.Post)('events'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SyncController.prototype, "syncEvents", null);
__decorate([
    (0, common_1.Get)('conflicts'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SyncController.prototype, "getConflicts", null);
__decorate([
    (0, common_1.Get)('pending'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], SyncController.prototype, "getPendingEvents", null);
__decorate([
    (0, common_1.Post)('create-event'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SyncController.prototype, "createSyncEvent", null);
__decorate([
    (0, common_1.Post)('retry-failed'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SyncController.prototype, "retryFailedEvents", null);
__decorate([
    (0, common_1.Get)('status'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SyncController.prototype, "getSyncStatus", null);
exports.SyncController = SyncController = __decorate([
    (0, common_1.Controller)('sync'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [sync_service_1.SyncService])
], SyncController);
//# sourceMappingURL=sync.controller.js.map