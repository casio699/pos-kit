import { SalesService } from './sales.service';
export declare class SalesController {
    private salesService;
    constructor(salesService: SalesService);
    createSale(body: any): Promise<import("./entities/sale.entity").Sale | null>;
    listSales(tenant_id: string, skip?: number, take?: number): Promise<import("./entities/sale.entity").Sale[]>;
    getSale(id: string): Promise<import("./entities/sale.entity").Sale | null>;
    refundSale(id: string, body: {
        amount: number;
    }): Promise<import("./entities/sale.entity").Sale>;
}
//# sourceMappingURL=sales.controller.d.ts.map