import { Repository } from 'typeorm';
import { PurchaseOrder } from './entities/purchase-order.entity';
export declare class PurchaseOrdersService {
    private poRepo;
    constructor(poRepo: Repository<PurchaseOrder>);
    createPO(tenant_id: string, po_number: string, supplier_id: string, expected_delivery_date: Date): Promise<PurchaseOrder>;
    listPOs(tenant_id: string, skip?: number, take?: number): Promise<PurchaseOrder[]>;
    getPO(id: string): Promise<PurchaseOrder | null>;
    updatePOStatus(id: string, status: string): Promise<PurchaseOrder | null>;
}
//# sourceMappingURL=purchase-orders.service.d.ts.map