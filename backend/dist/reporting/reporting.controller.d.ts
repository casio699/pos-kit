import { ReportingService } from './reporting.service';
export declare class ReportingController {
    private reportingService;
    constructor(reportingService: ReportingService);
    getDashboard(tenant_id: string, location_id?: string): Promise<{
        total_sales: number;
        transaction_count: number;
        avg_transaction_value: number;
        inventory_value: number;
        low_stock_count: number;
    }>;
    getInventoryHealth(tenant_id: string, location_id?: string): Promise<{
        total_items: number;
        stockout_count: number;
        overstock_count: number;
        inventory_turnover: number;
        shrinkage_rate: number;
    }>;
}
//# sourceMappingURL=reporting.controller.d.ts.map