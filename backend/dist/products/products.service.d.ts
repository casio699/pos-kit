import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
export declare class ProductsService {
    private productRepo;
    constructor(productRepo: Repository<Product>);
    create(tenant_id: string, data: any): Promise<Product[]>;
    findAll(tenant_id: string, skip?: number, take?: number): Promise<Product[]>;
    findOne(tenantId: string, id: string): Promise<Product>;
    update(tenantId: string, id: string, data: any): Promise<Product>;
    delete(tenantId: string, id: string): Promise<import("typeorm").DeleteResult>;
    initializeSampleData(tenantId: string): Promise<{
        tenant_id: string;
        created_at: Date;
        updated_at: Date;
        id: string;
        name: string;
        description: string;
        sku: string;
        price: number;
        cost: number;
        is_active: boolean;
    }[]>;
}
//# sourceMappingURL=products.service.d.ts.map