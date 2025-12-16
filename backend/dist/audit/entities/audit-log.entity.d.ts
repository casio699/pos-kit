export declare class AuditLog {
    id: string;
    user_id: string;
    tenant_id: string;
    action: string;
    resource_type: string;
    resource_id: string;
    old_values: any;
    new_values: any;
    ip_address: string;
    user_agent: string;
    success: boolean;
    error_message: string;
    entity_type: string;
    entity_id: string;
    status: string;
    created_at: Date;
}
//# sourceMappingURL=audit-log.entity.d.ts.map