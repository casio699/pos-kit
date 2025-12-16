import { SyncService, SyncResult } from './sync.service';
import { SyncEventType } from './entities/sync-event.entity';
export declare class SyncController {
    private syncService;
    constructor(syncService: SyncService);
    syncEvents(body: {
        events: any[];
    }, req: any): Promise<SyncResult>;
    getConflicts(req: any): Promise<any[]>;
    getPendingEvents(req: any, userId?: string): Promise<import("./entities/sync-event.entity").SyncEvent[]>;
    createSyncEvent(body: {
        eventType: SyncEventType;
        resourceType: string;
        resourceId: string;
        data: any;
    }, req: any): Promise<import("./entities/sync-event.entity").SyncEvent>;
    retryFailedEvents(req: any): Promise<{
        message: string;
        retried_count: number;
    }>;
    getSyncStatus(req: any): Promise<{
        pending_count: number;
        conflict_count: number;
        pending_events: import("./entities/sync-event.entity").SyncEvent[];
        conflicts: any[];
    }>;
}
//# sourceMappingURL=sync.controller.d.ts.map