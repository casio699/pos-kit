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
var SyncService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const sync_event_entity_1 = require("./entities/sync-event.entity");
let SyncService = SyncService_1 = class SyncService {
    constructor(syncEventRepository) {
        this.syncEventRepository = syncEventRepository;
        this.logger = new common_1.Logger(SyncService_1.name);
    }
    async createSyncEvent(userId, tenantId, eventType, resourceType, resourceId, data) {
        try {
            const syncEvent = this.syncEventRepository.create({
                user_id: userId,
                tenant_id: tenantId,
                event_type: eventType,
                resource_type: resourceType,
                resource_id: resourceId,
                data,
                status: sync_event_entity_1.SyncStatus.PENDING,
            });
            return await this.syncEventRepository.save(syncEvent);
        }
        catch (error) {
            this.logger.error('Failed to create sync event:', error);
            throw error;
        }
    }
    async syncEvents(tenantId, events) {
        const result = {
            synced_count: 0,
            conflicts: [],
            server_events: [],
            errors: [],
        };
        for (const event of events) {
            try {
                await this.processSyncEvent(tenantId, event);
                result.synced_count++;
            }
            catch (error) {
                if (error.message?.includes('conflict')) {
                    result.conflicts.push({
                        client_event: event,
                        server_data: error.serverData,
                        conflict_type: error.conflictType,
                    });
                }
                else {
                    result.errors.push(`Failed to sync event ${event.id}: ${error.message}`);
                }
            }
        }
        // Get any server events that the client might have missed
        const serverEvents = await this.getServerEvents(tenantId, events);
        result.server_events = serverEvents;
        return result;
    }
    async processSyncEvent(tenantId, event) {
        // Check for conflicts with existing data
        const conflict = await this.checkForConflict(tenantId, event);
        if (conflict) {
            throw new Error(`Conflict detected for ${event.resource_type} ${event.resource_id}`);
        }
        // Apply the sync event based on type
        switch (event.event_type) {
            case sync_event_entity_1.SyncEventType.CREATE:
                await this.handleCreate(event);
                break;
            case sync_event_entity_1.SyncEventType.UPDATE:
                await this.handleUpdate(event);
                break;
            case sync_event_entity_1.SyncEventType.DELETE:
                await this.handleDelete(event);
                break;
            default:
                throw new Error(`Unknown event type: ${event.event_type}`);
        }
    }
    async checkForConflict(tenantId, event) {
        // For now, simple timestamp-based conflict detection
        // In a real implementation, this would be more sophisticated
        return false;
    }
    async handleCreate(event) {
        // Implementation depends on resource type
        this.logger.log(`Creating ${event.resource_type}: ${event.resource_id}`);
    }
    async handleUpdate(event) {
        // Implementation depends on resource type
        this.logger.log(`Updating ${event.resource_type}: ${event.resource_id}`);
    }
    async handleDelete(event) {
        // Implementation depends on resource type
        this.logger.log(`Deleting ${event.resource_type}: ${event.resource_id}`);
    }
    async getServerEvents(tenantId, clientEvents) {
        // Get events that occurred since the client's last sync
        const clientEventIds = clientEvents.map(e => e.id);
        const serverEvents = await this.syncEventRepository.find({
            where: {
                tenant_id: tenantId,
                status: sync_event_entity_1.SyncStatus.COMPLETED,
                id: (0, typeorm_2.MoreThan)(clientEvents[clientEvents.length - 1]?.id || '0'),
            },
            order: { created_at: 'ASC' },
            take: 100,
        });
        return serverEvents;
    }
    async getPendingSyncEvents(tenantId, userId) {
        const where = {
            tenant_id: tenantId,
            status: sync_event_entity_1.SyncStatus.PENDING,
        };
        if (userId) {
            where.user_id = userId;
        }
        return await this.syncEventRepository.find({
            where,
            order: { created_at: 'ASC' },
            take: 50,
        });
    }
    async markEventAsSynced(eventId) {
        await this.syncEventRepository.update(eventId, {
            status: sync_event_entity_1.SyncStatus.COMPLETED,
            synced_at: new Date(),
        });
    }
    async markEventAsFailed(eventId, errorMessage) {
        await this.syncEventRepository.increment({ id: eventId }, 'retry_count', 1);
        const event = await this.syncEventRepository.findOne({ where: { id: eventId } });
        if (event && event.retry_count >= 3) {
            await this.syncEventRepository.update(eventId, {
                status: sync_event_entity_1.SyncStatus.FAILED,
                error_message: errorMessage,
            });
        }
    }
    async getConflicts(tenantId) {
        // Return events that have conflicts
        return await this.syncEventRepository.find({
            where: {
                tenant_id: tenantId,
                status: sync_event_entity_1.SyncStatus.FAILED,
            },
            order: { created_at: 'DESC' },
            take: 20,
        });
    }
    async retryFailedEvents(tenantId) {
        const failedEvents = await this.syncEventRepository.find({
            where: {
                tenant_id: tenantId,
                status: sync_event_entity_1.SyncStatus.FAILED,
                retry_count: (0, typeorm_2.MoreThan)(0),
            },
            take: 10,
        });
        let retriedCount = 0;
        for (const event of failedEvents) {
            try {
                await this.syncEventRepository.update(event.id, {
                    status: sync_event_entity_1.SyncStatus.PENDING,
                    retry_count: 0,
                    error_message: undefined,
                });
                retriedCount++;
            }
            catch (error) {
                this.logger.error(`Failed to retry event ${event.id}:`, error);
            }
        }
        return retriedCount;
    }
};
exports.SyncService = SyncService;
exports.SyncService = SyncService = SyncService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(sync_event_entity_1.SyncEvent)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], SyncService);
//# sourceMappingURL=sync.service.js.map