export declare class DevicesService {
    registerDevice(tenant_id: string, device_id: string, device_type: string, location_id: string): Promise<{
        device_id: string;
        registered_at: string;
    }>;
    getDeviceStatus(device_id: string): Promise<{
        device_id: string;
        online: boolean;
        last_seen: string;
        firmware_version: string;
    }>;
}
//# sourceMappingURL=devices.service.d.ts.map