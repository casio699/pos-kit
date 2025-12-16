import { InventoryService } from './inventory.service';
export declare class InventoryController {
    private inventoryService;
    constructor(inventoryService: InventoryService);
    getInventory(tenant_id: string, location_id?: string, product_id?: string): Promise<import("./entities/inventory-item.entity").InventoryItem[]>;
    adjustInventory(body: any): Promise<import("./entities/inventory-item.entity").InventoryItem>;
    transferInventory(body: any): Promise<import("./entities/inventory-item.entity").InventoryItem>;
}
//# sourceMappingURL=inventory.controller.d.ts.map