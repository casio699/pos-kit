import { DevicesService } from './devices.service';
export declare class DevicesController {
    private devicesService;
    constructor(devicesService: DevicesService);
    registerDevice(body: any): Promise<{
        device_id: string;
        registered_at: string;
    }>;
    getDeviceStatus(id: string): Promise<{
        device_id: string;
        online: boolean;
        last_seen: string;
        firmware_version: string;
    }>;
}
//# sourceMappingURL=devices.controller.d.ts.map