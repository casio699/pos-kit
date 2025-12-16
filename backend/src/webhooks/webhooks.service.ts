import { Injectable } from '@nestjs/common';

@Injectable()
export class WebhooksService {
  async subscribeWebhook(tenant_id: string, event_type: string, url: string) {
    return {
      id: 'webhook-' + Math.random().toString(36).substr(2, 9),
      event_type,
      url,
      created_at: new Date().toISOString(),
    };
  }

  async listWebhooks(tenant_id: string) {
    return [];
  }
}
