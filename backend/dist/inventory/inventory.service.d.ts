import { Repository } from 'typeorm';
import { InventoryItem } from './entities/inventory-item.entity';
export declare class InventoryService {
    private inventoryRepo;
    constructor(inventoryRepo: Repository<InventoryItem>);
    getInventory(tenant_id: string, location_id?: string, product_id?: string): Promise<InventoryItem[]>;
    adjustInventory(tenant_id: string, product_id: string, location_id: string, quantity: number): Promise<InventoryItem>;
    transferInventory(tenant_id: string, product_id: string, from_location: string, to_location: string, quantity: number): Promise<InventoryItem>;
}
//# sourceMappingURL=inventory.service.d.ts.map