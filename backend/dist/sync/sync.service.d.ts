import { Repository } from 'typeorm';
import { SyncEvent, SyncEventType } from './entities/sync-event.entity';
export interface SyncResult {
    synced_count: number;
    conflicts: any[];
    server_events: any[];
    errors: string[];
}
export declare class SyncService {
    private syncEventRepository;
    private readonly logger;
    constructor(syncEventRepository: Repository<SyncEvent>);
    createSyncEvent(userId: string, tenantId: string, eventType: SyncEventType, resourceType: string, resourceId: string, data: any): Promise<SyncEvent>;
    syncEvents(tenantId: string, events: any[]): Promise<SyncResult>;
    private processSyncEvent;
    private checkForConflict;
    private handleCreate;
    private handleUpdate;
    private handleDelete;
    private getServerEvents;
    getPendingSyncEvents(tenantId: string, userId?: string): Promise<SyncEvent[]>;
    markEventAsSynced(eventId: string): Promise<void>;
    markEventAsFailed(eventId: string, errorMessage: string): Promise<void>;
    getConflicts(tenantId: string): Promise<any[]>;
    retryFailedEvents(tenantId: string): Promise<number>;
}
//# sourceMappingURL=sync.service.d.ts.map