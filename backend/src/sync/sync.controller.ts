import { Controller, Get, Post, Body, Query, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SyncService, SyncResult } from './sync.service';
import { SyncEventType } from './entities/sync-event.entity';

@Controller('sync')
@UseGuards(JwtAuthGuard)
export class SyncController {
  constructor(private syncService: SyncService) {}

  @Post('events')
  async syncEvents(@Body() body: { events: any[] }, @Request() req: any) {
    const tenantId = req.user.tenant_id || req.user.tenantId;
    return this.syncService.syncEvents(tenantId, body.events);
  }

  @Get('conflicts')
  async getConflicts(@Request() req: any) {
    const tenantId = req.user.tenant_id || req.user.tenantId;
    return this.syncService.getConflicts(tenantId);
  }

  @Get('pending')
  async getPendingEvents(@Request() req: any, @Query('userId') userId?: string) {
    const tenantId = req.user.tenant_id || req.user.tenantId;
    return this.syncService.getPendingSyncEvents(tenantId, userId);
  }

  @Post('create-event')
  async createSyncEvent(
    @Body() body: {
      eventType: SyncEventType;
      resourceType: string;
      resourceId: string;
      data: any;
    },
    @Request() req: any,
  ) {
    const userId = req.user.id;
    const tenantId = req.user.tenant_id || req.user.tenantId;
    
    return this.syncService.createSyncEvent(
      userId,
      tenantId,
      body.eventType,
      body.resourceType,
      body.resourceId,
      body.data,
    );
  }

  @Post('retry-failed')
  async retryFailedEvents(@Request() req: any) {
    const tenantId = req.user.tenant_id || req.user.tenantId;
    const retriedCount = await this.syncService.retryFailedEvents(tenantId);
    
    return {
      message: `Retried ${retriedCount} failed events`,
      retried_count: retriedCount,
    };
  }

  @Get('status')
  async getSyncStatus(@Request() req: any) {
    const tenantId = req.user.tenant_id || req.user.tenantId;
    const userId = req.user.id;
    
    const pendingEvents = await this.syncService.getPendingSyncEvents(tenantId, userId);
    const conflicts = await this.syncService.getConflicts(tenantId);
    
    return {
      pending_count: pendingEvents.length,
      conflict_count: conflicts.length,
      pending_events: pendingEvents,
      conflicts,
    };
  }
}
