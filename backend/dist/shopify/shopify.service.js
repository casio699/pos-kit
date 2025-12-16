"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ShopifyService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShopifyService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const shopify_api_1 = require("@shopify/shopify-api");
require("@shopify/shopify-api/adapters/node");
let ShopifyService = ShopifyService_1 = class ShopifyService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(ShopifyService_1.name);
        const storeUrl = this.configService.get('SHOPIFY_STORE_URL');
        const accessToken = this.configService.get('SHOPIFY_ADMIN_ACCESS_TOKEN');
        if (!storeUrl || !accessToken) {
            throw new Error('SHOPIFY_STORE_URL and SHOPIFY_ADMIN_ACCESS_TOKEN must be configured');
        }
        this.shopify = (0, shopify_api_1.shopifyApi)({
            apiVersion: shopify_api_1.ApiVersion.October23,
            adminApiAccessToken: accessToken,
            hostName: storeUrl,
            isCustomStoreApp: true,
            apiSecretKey: 'dummy-secret-key', // Required for custom apps
            isEmbeddedApp: false,
        });
    }
    async syncProductsToShopify(products) {
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
        }
        catch (error) {
            this.logger.error('Error syncing products to Shopify', error);
            throw error;
        }
    }
    async syncInventoryToShopify(inventoryData) {
        try {
            const results = [];
            for (const item of inventoryData) {
                // Find product by SKU
                const products = await this.shopify.rest.Product.all({
                    session: this.getSession(),
                    fields: 'id,variants',
                });
                const product = products.data.find((p) => p.variants.some((v) => v.sku === item.sku));
                if (product) {
                    const variant = product.variants.find((v) => v.sku === item.sku);
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
        }
        catch (error) {
            this.logger.error('Error syncing inventory to Shopify', error);
            throw error;
        }
    }
    async createShopifyOrder(orderData) {
        try {
            const order = new this.shopify.rest.Order({ session: this.getSession() });
            order.email = orderData.customerEmail;
            order.financial_status = 'pending';
            order.currency = orderData.currency || 'USD';
            // Create line items
            order.line_items = orderData.items.map((item) => ({
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
        }
        catch (error) {
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
            return products.data.map((product) => ({
                shopifyId: product.id,
                title: product.title,
                status: product.status,
                variants: product.variants.map((variant) => ({
                    id: variant.id,
                    sku: variant.sku,
                    price: variant.price,
                    inventory_quantity: variant.inventory_quantity,
                })),
            }));
        }
        catch (error) {
            this.logger.error('Error fetching Shopify products', error);
            throw error;
        }
    }
    getSession() {
        return {
            id: 'pos-system-session',
            shop: this.configService.get('SHOPIFY_STORE_URL'),
            state: 'active',
            accessToken: this.configService.get('SHOPIFY_ADMIN_ACCESS_TOKEN'),
            scope: ['read_products', 'write_products', 'read_inventory', 'write_inventory', 'read_orders', 'write_orders'],
        };
    }
};
exports.ShopifyService = ShopifyService;
exports.ShopifyService = ShopifyService = ShopifyService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], ShopifyService);
//# sourceMappingURL=shopify.service.js.map