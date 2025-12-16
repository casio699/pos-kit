import { Injectable } from '@nestjs/common';

@Injectable()
export class DevicesService {
  async registerDevice(tenant_id: string, device_id: string, device_type: string, location_id: string) {
    return {
      device_id,
      registered_at: new Date().toISOString(),
    };
  }

  async getDeviceStatus(device_id: string) {
    return {
      device_id,
      online: true,
      last_seen: new Date().toISOString(),
      firmware_version: '1.0.0',
    };
  }
}
