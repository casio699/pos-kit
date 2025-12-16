import { SaleLine } from './sale-line.entity';
export declare class Sale {
    id: string;
    tenant_id: string;
    location_id: string;
    user_id: string;
    total_amount: number;
    payment_method: string;
    status: string;
    created_at: Date;
    lines: SaleLine[];
}
//# sourceMappingURL=sale.entity.d.ts.map