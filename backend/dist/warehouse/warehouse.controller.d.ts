import { WarehouseService } from './warehouse.service';
export declare class WarehouseController {
    private warehouseService;
    constructor(warehouseService: WarehouseService);
    createLocation(body: any): Promise<import("./entities/location.entity").Location>;
    listLocations(tenant_id: string): Promise<import("./entities/location.entity").Location[]>;
}
//# sourceMappingURL=warehouse.controller.d.ts.map