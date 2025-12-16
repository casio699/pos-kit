export declare class SyncService {
    syncEvents(tenant_id: string, events: any[]): Promise<{
        synced_count: number;
        conflicts: never[];
        server_events: never[];
    }>;
    getConflicts(tenant_id: string): Promise<never[]>;
}
//# sourceMappingURL=sync.service.d.ts.map