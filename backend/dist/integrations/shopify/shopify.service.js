"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShopifyService = void 0;
const common_1 = require("@nestjs/common");
let ShopifyService = class ShopifyService {
    async syncProducts(tenantId, shopifyStore, accessToken) {
        return {
            synced_count: 0,
            created: [],
            updated: [],
            errors: [],
            last_sync: new Date().toISOString(),
        };
    }
    async syncInventory(tenantId, shopifyStore, accessToken) {
        return {
            synced_count: 0,
            updates: [],
            errors: [],
            last_sync: new Date().toISOString(),
        };
    }
    async createOrder(tenantId, saleId, shopifyStore, accessToken) {
        return {
            shopify_order_id: 'gid_' + Math.random().toString(36).substr(2, 9),
            status: 'pending',
            created_at: new Date().toISOString(),
        };
    }
    async getProductVariants(shopifyStore, accessToken, productId) {
        return {
            variants: [],
            total: 0,
        };
    }
};
exports.ShopifyService = ShopifyService;
exports.ShopifyService = ShopifyService = __decorate([
    (0, common_1.Injectable)()
], ShopifyService);
//# sourceMappingURL=shopify.service.js.map