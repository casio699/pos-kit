import { ConfigService } from '@nestjs/config';
import '@shopify/shopify-api/adapters/node';
export declare class ShopifyService {
    private configService;
    private readonly logger;
    private shopify;
    constructor(configService: ConfigService);
    syncProductsToShopify(products: any[]): Promise<{
        localId: any;
        shopifyId: any;
        status: string;
    }[]>;
    syncInventoryToShopify(inventoryData: any[]): Promise<{
        sku: any;
        shopifyVariantId: any;
        quantity: any;
        status: string;
    }[]>;
    createShopifyOrder(orderData: any): Promise<{
        localOrderId: any;
        shopifyOrderId: any;
        status: string;
    }>;
    getShopifyProducts(): Promise<any>;
    private getSession;
}
//# sourceMappingURL=shopify.service.d.ts.map