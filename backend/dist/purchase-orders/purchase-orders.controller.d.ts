import { PurchaseOrdersService } from './purchase-orders.service';
export declare class PurchaseOrdersController {
    private poService;
    constructor(poService: PurchaseOrdersService);
    createPO(body: any): Promise<import("./entities/purchase-order.entity").PurchaseOrder>;
    listPOs(tenant_id: string, skip?: number, take?: number): Promise<import("./entities/purchase-order.entity").PurchaseOrder[]>;
    getPO(id: string): Promise<import("./entities/purchase-order.entity").PurchaseOrder | null>;
}
//# sourceMappingURL=purchase-orders.controller.d.ts.map