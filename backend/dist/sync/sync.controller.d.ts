import { SyncService } from './sync.service';
export declare class SyncController {
    private syncService;
    constructor(syncService: SyncService);
    syncEvents(body: any): Promise<{
        synced_count: number;
        conflicts: never[];
        server_events: never[];
    }>;
    getConflicts(tenant_id: string): Promise<never[]>;
}
//# sourceMappingURL=sync.controller.d.ts.map