import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
export declare class ProductsService {
    private productRepo;
    constructor(productRepo: Repository<Product>);
    create(tenant_id: string, data: any): Promise<Product[]>;
    findAll(tenant_id: string, skip?: number, take?: number): Promise<Product[]>;
    findOne(id: string): Promise<Product | null>;
    update(id: string, data: any): Promise<Product | null>;
    delete(id: string): Promise<import("typeorm").DeleteResult>;
}
//# sourceMappingURL=products.service.d.ts.map