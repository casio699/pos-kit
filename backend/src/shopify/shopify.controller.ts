import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { ShopifyService } from './shopify.service';

@Controller('shopify')
export class ShopifyController {
  constructor(private readonly shopifyService: ShopifyService) {}

  @Post('sync/products')
  async syncProducts(@Body() body: { products: any[] }) {
    return this.shopifyService.syncProductsToShopify(body.products);
  }

  @Post('sync/inventory')
  async syncInventory(@Body() body: { inventory: any[] }) {
    return this.shopifyService.syncInventoryToShopify(body.inventory);
  }

  @Post('orders/create')
  async createOrder(@Body() orderData: any) {
    return this.shopifyService.createShopifyOrder(orderData);
  }

  @Get('products')
  async getProducts() {
    return this.shopifyService.getShopifyProducts();
  }

  @Get('sync/status')
  async getSyncStatus() {
    return {
      status: 'connected',
      lastSync: new Date().toISOString(),
      shop: process.env.SHOPIFY_STORE_URL,
    };
  }
}
