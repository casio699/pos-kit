import { WebhooksService } from './webhooks.service';
export declare class WebhooksController {
    private webhooksService;
    constructor(webhooksService: WebhooksService);
    subscribeWebhook(body: any): Promise<{
        id: string;
        event_type: string;
        url: string;
        created_at: string;
    }>;
    listWebhooks(tenant_id: string): Promise<never[]>;
}
//# sourceMappingURL=webhooks.controller.d.ts.map