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
exports.InventoryController = void 0;
const common_1 = require("@nestjs/common");
const inventory_service_1 = require("./inventory.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const permissions_guard_1 = require("../rbac/guards/permissions.guard");
const permissions_decorator_1 = require("../rbac/decorators/permissions.decorator");
const rbac_service_1 = require("../rbac/rbac.service");
let InventoryController = class InventoryController {
    constructor(inventoryService) {
        this.inventoryService = inventoryService;
    }
    async getInventory(tenant_id, location_id, product_id) {
        return this.inventoryService.getInventory(tenant_id, location_id, product_id);
    }
    async adjustInventory(body) {
        return this.inventoryService.adjustInventory(body.tenant_id, body.product_id, body.location_id, body.quantity);
    }
    async transferInventory(body) {
        return this.inventoryService.transferInventory(body.tenant_id, body.product_id, body.from_location_id, body.to_location_id, body.quantity);
    }
};
exports.InventoryController = InventoryController;
__decorate([
    (0, common_1.Get)(),
    (0, permissions_decorator_1.RequirePermission)(rbac_service_1.Permission.INVENTORY_READ),
    __param(0, (0, common_1.Query)('tenant_id')),
    __param(1, (0, common_1.Query)('location_id')),
    __param(2, (0, common_1.Query)('product_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "getInventory", null);
__decorate([
    (0, common_1.Post)('adjust'),
    (0, permissions_decorator_1.RequirePermission)(rbac_service_1.Permission.INVENTORY_ADJUST),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "adjustInventory", null);
__decorate([
    (0, common_1.Post)('transfer'),
    (0, permissions_decorator_1.RequirePermission)(rbac_service_1.Permission.INVENTORY_TRANSFER),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "transferInventory", null);
exports.InventoryController = InventoryController = __decorate([
    (0, common_1.Controller)('inventory'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    __metadata("design:paramtypes", [inventory_service_1.InventoryService])
], InventoryController);
//# sourceMappingURL=inventory.controller.js.map