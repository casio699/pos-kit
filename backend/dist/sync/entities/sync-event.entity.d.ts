export declare enum SyncEventType {
    CREATE = "create",
    UPDATE = "update",
    DELETE = "delete"
}
export declare enum SyncStatus {
    PENDING = "pending",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed",
    FAILED = "failed"
}
export declare class SyncEvent {
    id: string;
    user_id: string;
    tenant_id: string;
    event_type: SyncEventType;
    resource_type: string;
    resource_id: string;
    data: any;
    status: SyncStatus;
    error_message: string;
    synced_at: Date;
    retry_count: number;
    created_at: Date;
}
//# sourceMappingURL=sync-event.entity.d.ts.map