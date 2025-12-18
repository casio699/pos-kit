import { ReportingService } from './reporting.service';
export declare class DashboardController {
    private readonly reportingService;
    constructor(reportingService: ReportingService);
    getDashboard(req: any): Promise<{
        totalRevenue: number;
        monthlyRevenue: number;
        lastMonthRevenue: number;
        revenueGrowth: number;
        totalProducts: number;
        lowStockProducts: number;
        recentSales: import("../sales/entities/sale.entity").Sale[];
    }>;
    getSalesSummary(req: any): Promise<{
        dailySales: {
            [key: string]: number;
        };
        totalSales: number;
        totalRevenue: number;
        averageSaleValue: number;
    }>;
    getInventorySummary(req: any): Promise<{
        totalProducts: number;
        activeProducts: number;
        lowStockItems: number;
        outOfStockItems: number;
        totalInventoryValue: number;
    }>;
}
//# sourceMappingURL=dashboard.controller.d.ts.map