import { Injectable } from '@nestjs/common';

@Injectable()
export class ReportingService {
  async getDashboard(tenant_id: string, location_id?: string) {
    return {
      total_sales: 0,
      transaction_count: 0,
      avg_transaction_value: 0,
      inventory_value: 0,
      low_stock_count: 0,
    };
  }

  async getInventoryHealth(tenant_id: string, location_id?: string) {
    return {
      total_items: 0,
      stockout_count: 0,
      overstock_count: 0,
      inventory_turnover: 0,
      shrinkage_rate: 0,
    };
  }
}
