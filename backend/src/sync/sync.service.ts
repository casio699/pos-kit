import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThan } from 'typeorm';
import { SyncEvent, SyncEventType, SyncStatus } from './entities/sync-event.entity';

export interface SyncResult {
  synced_count: number;
  conflicts: any[];
  server_events: any[];
  errors: string[];
}

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);

  constructor(
    @InjectRepository(SyncEvent)
    private syncEventRepository: Repository<SyncEvent>,
  ) {}

  async createSyncEvent(
    userId: string,
    tenantId: string,
    eventType: SyncEventType,
    resourceType: string,
    resourceId: string,
    data: any,
  ): Promise<SyncEvent> {
    try {
      const syncEvent = this.syncEventRepository.create({
        user_id: userId,
        tenant_id: tenantId,
        event_type: eventType,
        resource_type: resourceType,
        resource_id: resourceId,
        data,
        status: SyncStatus.PENDING,
      });

      return await this.syncEventRepository.save(syncEvent);
    } catch (error) {
      this.logger.error('Failed to create sync event:', error);
      throw error;
    }
  }

  async syncEvents(tenantId: string, events: any[]): Promise<SyncResult> {
    const result: SyncResult = {
      synced_count: 0,
      conflicts: [],
      server_events: [],
      errors: [],
    };

    for (const event of events) {
      try {
        await this.processSyncEvent(tenantId, event);
        result.synced_count++;
      } catch (error: any) {
        if (error.message?.includes('conflict')) {
          result.conflicts.push({
            client_event: event,
            server_data: error.serverData,
            conflict_type: error.conflictType,
          });
        } else {
          result.errors.push(`Failed to sync event ${event.id}: ${error.message}`);
        }
      }
    }

    // Get any server events that the client might have missed
    const serverEvents = await this.getServerEvents(tenantId, events);
    result.server_events = serverEvents;

    return result;
  }

  private async processSyncEvent(tenantId: string, event: any): Promise<void> {
    // Check for conflicts with existing data
    const conflict = await this.checkForConflict(tenantId, event);
    if (conflict) {
      throw new Error(`Conflict detected for ${event.resource_type} ${event.resource_id}`);
    }

    // Apply the sync event based on type
    switch (event.event_type) {
      case SyncEventType.CREATE:
        await this.handleCreate(event);
        break;
      case SyncEventType.UPDATE:
        await this.handleUpdate(event);
        break;
      case SyncEventType.DELETE:
        await this.handleDelete(event);
        break;
      default:
        throw new Error(`Unknown event type: ${event.event_type}`);
    }
  }

  private async checkForConflict(tenantId: string, event: any): Promise<boolean> {
    // For now, simple timestamp-based conflict detection
    // In a real implementation, this would be more sophisticated
    return false;
  }

  private async handleCreate(event: any): Promise<void> {
    // Implementation depends on resource type
    this.logger.log(`Creating ${event.resource_type}: ${event.resource_id}`);
  }

  private async handleUpdate(event: any): Promise<void> {
    // Implementation depends on resource type
    this.logger.log(`Updating ${event.resource_type}: ${event.resource_id}`);
  }

  private async handleDelete(event: any): Promise<void> {
    // Implementation depends on resource type
    this.logger.log(`Deleting ${event.resource_type}: ${event.resource_id}`);
  }

  private async getServerEvents(tenantId: string, clientEvents: any[]): Promise<any[]> {
    // Get events that occurred since the client's last sync
    const clientEventIds = clientEvents.map(e => e.id);
    
    const serverEvents = await this.syncEventRepository.find({
      where: {
        tenant_id: tenantId,
        status: SyncStatus.COMPLETED,
        id: MoreThan(clientEvents[clientEvents.length - 1]?.id || '0'),
      },
      order: { created_at: 'ASC' },
      take: 100,
    });

    return serverEvents;
  }

  async getPendingSyncEvents(tenantId: string, userId?: string): Promise<SyncEvent[]> {
    const where: any = {
      tenant_id: tenantId,
      status: SyncStatus.PENDING,
    };

    if (userId) {
      where.user_id = userId;
    }

    return await this.syncEventRepository.find({
      where,
      order: { created_at: 'ASC' },
      take: 50,
    });
  }

  async markEventAsSynced(eventId: string): Promise<void> {
    await this.syncEventRepository.update(eventId, {
      status: SyncStatus.COMPLETED,
      synced_at: new Date(),
    });
  }

  async markEventAsFailed(eventId: string, errorMessage: string): Promise<void> {
    await this.syncEventRepository.increment({ id: eventId }, 'retry_count', 1);
    
    const event = await this.syncEventRepository.findOne({ where: { id: eventId } });
    if (event && event.retry_count >= 3) {
      await this.syncEventRepository.update(eventId, {
        status: SyncStatus.FAILED,
        error_message: errorMessage,
      });
    }
  }

  async getConflicts(tenantId: string): Promise<any[]> {
    // Return events that have conflicts
    return await this.syncEventRepository.find({
      where: {
        tenant_id: tenantId,
        status: SyncStatus.FAILED,
      },
      order: { created_at: 'DESC' },
      take: 20,
    });
  }

  async retryFailedEvents(tenantId: string): Promise<number> {
    const failedEvents = await this.syncEventRepository.find({
      where: {
        tenant_id: tenantId,
        status: SyncStatus.FAILED,
        retry_count: MoreThan(0),
      },
      take: 10,
    });

    let retriedCount = 0;
    for (const event of failedEvents) {
      try {
        await this.syncEventRepository.update(event.id, {
          status: SyncStatus.PENDING,
          retry_count: 0,
          error_message: undefined,
        });
        retriedCount++;
      } catch (error) {
        this.logger.error(`Failed to retry event ${event.id}:`, error);
      }
    }

    return retriedCount;
  }
}
