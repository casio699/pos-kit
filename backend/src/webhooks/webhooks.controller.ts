import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { WebhooksService } from './webhooks.service';

@Controller('webhooks')
@UseGuards(AuthGuard('jwt'))
export class WebhooksController {
  constructor(private webhooksService: WebhooksService) {}

  @Post('subscribe')
  async subscribeWebhook(@Body() body: any) {
    return this.webhooksService.subscribeWebhook(body.tenant_id, body.event_type, body.url);
  }

  @Get()
  async listWebhooks(@Query('tenant_id') tenant_id: string) {
    return this.webhooksService.listWebhooks(tenant_id);
  }
}
