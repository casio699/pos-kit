import { ProductsService } from './products.service';
export declare class ProductsController {
    private productsService;
    constructor(productsService: ProductsService);
    create(body: any): Promise<import("./entities/product.entity").Product[]>;
    findAll(tenant_id: string, skip?: number, take?: number): Promise<import("./entities/product.entity").Product[]>;
    findOne(id: string): Promise<import("./entities/product.entity").Product | null>;
    update(id: string, body: any): Promise<import("./entities/product.entity").Product | null>;
    delete(id: string): Promise<import("typeorm").DeleteResult>;
}
//# sourceMappingURL=products.controller.d.ts.map