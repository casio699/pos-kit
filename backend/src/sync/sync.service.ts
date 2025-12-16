import { Injectable } from '@nestjs/common';

@Injectable()
export class SyncService {
  async syncEvents(tenant_id: string, events: any[]) {
    return {
      synced_count: events.length,
      conflicts: [],
      server_events: [],
    };
  }

  async getConflicts(tenant_id: string) {
    return [];
  }
}
