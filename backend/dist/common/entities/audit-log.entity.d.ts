export declare class AuditLog {
    id: string;
    tenant_id: string;
    user_id: string;
    action: string;
    entity_type: string;
    entity_id: string;
    old_values: any;
    new_values: any;
    ip_address: string;
    user_agent: string;
    status: string;
    error_message: string;
    created_at: Date;
}
//# sourceMappingURL=audit-log.entity.d.ts.map