import { Injectable } from '@nestjs/common';

@Injectable()
export class ShopifyService {
  async syncProducts(tenantId: string, shopifyStore: string, accessToken: string) {
    return {
      synced_count: 0,
      created: [],
      updated: [],
      errors: [],
      last_sync: new Date().toISOString(),
    };
  }

  async syncInventory(tenantId: string, shopifyStore: string, accessToken: string) {
    return {
      synced_count: 0,
      updates: [],
      errors: [],
      last_sync: new Date().toISOString(),
    };
  }

  async createOrder(tenantId: string, saleId: string, shopifyStore: string, accessToken: string) {
    return {
      shopify_order_id: 'gid_' + Math.random().toString(36).substr(2, 9),
      status: 'pending',
      created_at: new Date().toISOString(),
    };
  }

  async getProductVariants(shopifyStore: string, accessToken: string, productId: string) {
    return {
      variants: [],
      total: 0,
    };
  }
}
