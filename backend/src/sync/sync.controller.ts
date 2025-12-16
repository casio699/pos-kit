import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SyncService } from './sync.service';

@Controller('sync')
@UseGuards(AuthGuard('jwt'))
export class SyncController {
  constructor(private syncService: SyncService) {}

  @Post('events')
  async syncEvents(@Body() body: any) {
    return this.syncService.syncEvents(body.tenant_id, body.events);
  }

  @Get('conflicts')
  async getConflicts(@Query('tenant_id') tenant_id: string) {
    return this.syncService.getConflicts(tenant_id);
  }
}
