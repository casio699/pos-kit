export declare class ShopifyService {
    syncProducts(tenantId: string, shopifyStore: string, accessToken: string): Promise<{
        synced_count: number;
        created: never[];
        updated: never[];
        errors: never[];
        last_sync: string;
    }>;
    syncInventory(tenantId: string, shopifyStore: string, accessToken: string): Promise<{
        synced_count: number;
        updates: never[];
        errors: never[];
        last_sync: string;
    }>;
    createOrder(tenantId: string, saleId: string, shopifyStore: string, accessToken: string): Promise<{
        shopify_order_id: string;
        status: string;
        created_at: string;
    }>;
    getProductVariants(shopifyStore: string, accessToken: string, productId: string): Promise<{
        variants: never[];
        total: number;
    }>;
}
//# sourceMappingURL=shopify.service.d.ts.map