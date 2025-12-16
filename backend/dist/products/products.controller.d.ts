import { ProductsService } from './products.service';
import { AuthenticatedRequest } from '../common/types/request.types';
export declare class ProductsController {
    private productsService;
    constructor(productsService: ProductsService);
    create(req: AuthenticatedRequest, body: any): Promise<import("./entities/product.entity").Product[]>;
    findAll(req: AuthenticatedRequest, skip?: number, take?: number): Promise<import("./entities/product.entity").Product[]>;
    findOne(req: AuthenticatedRequest, id: string): Promise<import("./entities/product.entity").Product>;
    update(req: AuthenticatedRequest, id: string, body: any): Promise<import("./entities/product.entity").Product>;
    delete(req: AuthenticatedRequest, id: string): Promise<import("typeorm").DeleteResult>;
    initializeSampleData(req: AuthenticatedRequest): Promise<{
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
//# sourceMappingURL=products.controller.d.ts.map