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
exports.PurchaseOrdersController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const purchase_orders_service_1 = require("./purchase-orders.service");
let PurchaseOrdersController = class PurchaseOrdersController {
    constructor(poService) {
        this.poService = poService;
    }
    async createPO(body) {
        return this.poService.createPO(body.tenant_id, body.po_number, body.supplier_id, body.expected_delivery_date);
    }
    async listPOs(tenant_id, skip = 0, take = 50) {
        return this.poService.listPOs(tenant_id, skip, take);
    }
    async getPO(id) {
        return this.poService.getPO(id);
    }
};
exports.PurchaseOrdersController = PurchaseOrdersController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PurchaseOrdersController.prototype, "createPO", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('tenant_id')),
    __param(1, (0, common_1.Query)('skip')),
    __param(2, (0, common_1.Query)('take')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], PurchaseOrdersController.prototype, "listPOs", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PurchaseOrdersController.prototype, "getPO", null);
exports.PurchaseOrdersController = PurchaseOrdersController = __decorate([
    (0, common_1.Controller)('purchase-orders'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __metadata("design:paramtypes", [purchase_orders_service_1.PurchaseOrdersService])
], PurchaseOrdersController);
//# sourceMappingURL=purchase-orders.controller.js.map