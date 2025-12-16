import { ShopifyService } from './shopify.service';
export declare class ShopifyController {
    private readonly shopifyService;
    constructor(shopifyService: ShopifyService);
    syncProducts(body: {
        products: any[];
    }): Promise<{
        localId: any;
        shopifyId: any;
        status: string;
    }[]>;
    syncInventory(body: {
        inventory: any[];
    }): Promise<{
        sku: any;
        shopifyVariantId: any;
        quantity: any;
        status: string;
    }[]>;
    createOrder(orderData: any): Promise<{
        localOrderId: any;
        shopifyOrderId: any;
        status: string;
    }>;
    getProducts(): Promise<any>;
    getSyncStatus(): Promise<{
        status: string;
        lastSync: string;
        shop: string | undefined;
    }>;
}
//# sourceMappingURL=shopify.controller.d.ts.map