import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { shopifyApi, ApiVersion } from '@shopify/shopify-api';
import '@shopify/shopify-api/adapters/node';

@Injectable()
export class ShopifyService {
  private readonly logger = new Logger(ShopifyService.name);
  private shopify: ReturnType<typeof shopifyApi>;

  constructor(private configService: ConfigService) {
    const storeUrl = this.configService.get<string>('SHOPIFY_STORE_URL');
    const accessToken = this.configService.get<string>('SHOPIFY_ADMIN_ACCESS_TOKEN');
    
    if (!storeUrl || !accessToken) {
      this.logger.warn('Shopify credentials not configured. Shopify integration will be disabled.');
      return;
    }
    
    this.shopify = shopifyApi({
      apiVersion: ApiVersion.October23,
      adminApiAccessToken: accessToken,
      hostName: storeUrl,
      isCustomStoreApp: true,
      apiSecretKey: 'dummy-secret-key', // Required for custom apps
      isEmbeddedApp: false,
    });
  }

  async syncProductsToShopify(products: any[]) {
    try {
      const results = [];
      
      for (const product of products) {
        const shopifyProduct = new this.shopify.rest.Product({ session: this.getSession() });
        
        shopifyProduct.title = product.name;
        shopifyProduct.body_html = product.description || '';
        shopifyProduct.vendor = product.vendor || 'POS System';
        shopifyProduct.product_type = product.category || 'POS Product';
        shopifyProduct.status = product.active ? 'active' : 'draft';
        
        // Set price
        shopifyProduct.variants = [
          {
            price: product.price.toString(),
            sku: product.sku || `POS-${product.id}`,
            inventory_management: 'shopify',
            inventory_quantity: product.stock || 0,
          },
        ];

        await shopifyProduct.save({ update: true });
        results.push({
          localId: product.id,
          shopifyId: shopifyProduct.id,
          status: 'synced',
        });
      }

      this.logger.log(`Successfully synced ${results.length} products to Shopify`);
      return results;
    } catch (error) {
      this.logger.error('Error syncing products to Shopify', error);
      throw error;
    }
  }

  async syncInventoryToShopify(inventoryData: any[]) {
    try {
      const results = [];
      
      for (const item of inventoryData) {
        // Find product by SKU
        const products = await this.shopify.rest.Product.all({
          session: this.getSession(),
          fields: 'id,variants',
        });

        const product = products.data.find((p: any) => 
          p.variants.some((v: any) => v.sku === item.sku)
        );

        if (product) {
          const variant = product.variants.find((v: any) => v.sku === item.sku);
          variant.inventory_quantity = item.quantity;
          await variant.save({ update: true });
          
          results.push({
            sku: item.sku,
            shopifyVariantId: variant.id,
            quantity: item.quantity,
            status: 'updated',
          });
        }
      }

      this.logger.log(`Successfully updated inventory for ${results.length} items`);
      return results;
    } catch (error) {
      this.logger.error('Error syncing inventory to Shopify', error);
      throw error;
    }
  }

  async createShopifyOrder(orderData: any) {
    try {
      const order = new this.shopify.rest.Order({ session: this.getSession() });
      
      order.email = orderData.customerEmail;
      order.financial_status = 'pending';
      order.currency = orderData.currency || 'USD';
      
      // Create line items
      order.line_items = orderData.items.map((item: any) => ({
        variant_id: item.shopifyVariantId,
        quantity: item.quantity,
        price: item.price,
      }));

      // Set shipping address if provided
      if (orderData.shippingAddress) {
        order.shipping_address = {
          first_name: orderData.shippingAddress.firstName,
          last_name: orderData.shippingAddress.lastName,
          address1: orderData.shippingAddress.address1,
          city: orderData.shippingAddress.city,
          province: orderData.shippingAddress.state,
          country: orderData.shippingAddress.country,
          zip: orderData.shippingAddress.zipCode,
        };
      }

      await order.save({ update: true });
      
      this.logger.log(`Created Shopify order ${order.id}`);
      return {
        localOrderId: orderData.id,
        shopifyOrderId: order.id,
        status: 'created',
      };
    } catch (error) {
      this.logger.error('Error creating Shopify order', error);
      throw error;
    }
  }

  async getShopifyProducts() {
    try {
      const products = await this.shopify.rest.Product.all({
        session: this.getSession(),
        limit: 250,
      });

      return products.data.map((product: any) => ({
        shopifyId: product.id,
        title: product.title,
        status: product.status,
        variants: product.variants.map((variant: any) => ({
          id: variant.id,
          sku: variant.sku,
          price: variant.price,
          inventory_quantity: variant.inventory_quantity,
        })),
      }));
    } catch (error) {
      this.logger.error('Error fetching Shopify products', error);
      throw error;
    }
  }

  private getSession() {
    return {
      id: 'pos-system-session',
      shop: this.configService.get('SHOPIFY_STORE_URL'),
      state: 'active',
      accessToken: this.configService.get('SHOPIFY_ADMIN_ACCESS_TOKEN'),
      scope: ['read_products', 'write_products', 'read_inventory', 'write_inventory', 'read_orders', 'write_orders'],
    };
  }
}
