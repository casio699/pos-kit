export declare class WebhooksService {
    subscribeWebhook(tenant_id: string, event_type: string, url: string): Promise<{
        id: string;
        event_type: string;
        url: string;
        created_at: string;
    }>;
    listWebhooks(tenant_id: string): Promise<never[]>;
}
//# sourceMappingURL=webhooks.service.d.ts.map