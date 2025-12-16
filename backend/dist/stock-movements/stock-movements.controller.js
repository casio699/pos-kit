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
exports.StockMovementsController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const stock_movements_service_1 = require("./stock-movements.service");
let StockMovementsController = class StockMovementsController {
    constructor(movementService) {
        this.movementService = movementService;
    }
    async getMovements(tenant_id, skip = 0, take = 100) {
        return this.movementService.getMovements(tenant_id, skip, take);
    }
};
exports.StockMovementsController = StockMovementsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('tenant_id')),
    __param(1, (0, common_1.Query)('skip')),
    __param(2, (0, common_1.Query)('take')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], StockMovementsController.prototype, "getMovements", null);
exports.StockMovementsController = StockMovementsController = __decorate([
    (0, common_1.Controller)('stock-movements'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __metadata("design:paramtypes", [stock_movements_service_1.StockMovementsService])
], StockMovementsController);
//# sourceMappingURL=stock-movements.controller.js.map