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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShopifyController = void 0;
const common_1 = require("@nestjs/common");
const shopify_service_1 = require("./shopify.service");
let ShopifyController = class ShopifyController {
    constructor(shopifyService) {
        this.shopifyService = shopifyService;
    }
    async syncProducts(body) {
        return this.shopifyService.syncProductsToShopify(body.products);
    }
    async syncInventory(body) {
        return this.shopifyService.syncInventoryToShopify(body.inventory);
    }
    async createOrder(orderData) {
        return this.shopifyService.createShopifyOrder(orderData);
    }
    async getProducts() {
        return this.shopifyService.getShopifyProducts();
    }
    async getSyncStatus() {
        return {
            status: 'connected',
            lastSync: new Date().toISOString(),
            shop: process.env.SHOPIFY_STORE_URL,
        };
    }
};
exports.ShopifyController = ShopifyController;
__decorate([
    (0, common_1.Post)('sync/products'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ShopifyController.prototype, "syncProducts", null);
__decorate([
    (0, common_1.Post)('sync/inventory'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ShopifyController.prototype, "syncInventory", null);
__decorate([
    (0, common_1.Post)('orders/create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ShopifyController.prototype, "createOrder", null);
__decorate([
    (0, common_1.Get)('products'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ShopifyController.prototype, "getProducts", null);
__decorate([
    (0, common_1.Get)('sync/status'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ShopifyController.prototype, "getSyncStatus", null);
exports.ShopifyController = ShopifyController = __decorate([
    (0, common_1.Controller)('shopify'),
    __metadata("design:paramtypes", [shopify_service_1.ShopifyService])
], ShopifyController);
//# sourceMappingURL=shopify.controller.js.map