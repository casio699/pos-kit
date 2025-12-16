import { Repository } from 'typeorm';
import { Sale } from './entities/sale.entity';
import { SaleLine } from './entities/sale-line.entity';
export declare class SalesService {
    private saleRepo;
    private saleLineRepo;
    constructor(saleRepo: Repository<Sale>, saleLineRepo: Repository<SaleLine>);
    createSale(tenant_id: string, location_id: string, user_id: string, lines: any[], total_amount: number, payment_method: string): Promise<Sale | null>;
    getSale(id: string): Promise<Sale | null>;
    listSales(tenant_id: string, skip?: number, take?: number): Promise<Sale[]>;
    refundSale(id: string, amount: number): Promise<Sale>;
}
//# sourceMappingURL=sales.service.d.ts.map