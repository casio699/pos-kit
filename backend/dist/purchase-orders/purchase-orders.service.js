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
exports.PurchaseOrdersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const purchase_order_entity_1 = require("./entities/purchase-order.entity");
let PurchaseOrdersService = class PurchaseOrdersService {
    constructor(poRepo) {
        this.poRepo = poRepo;
    }
    async createPO(tenant_id, po_number, supplier_id, expected_delivery_date) {
        const po = this.poRepo.create({ tenant_id, po_number, supplier_id, expected_delivery_date });
        return this.poRepo.save(po);
    }
    async listPOs(tenant_id, skip = 0, take = 50) {
        return this.poRepo.find({ where: { tenant_id }, skip, take });
    }
    async getPO(id) {
        return this.poRepo.findOne({ where: { id } });
    }
    async updatePOStatus(id, status) {
        await this.poRepo.update(id, { status });
        return this.getPO(id);
    }
};
exports.PurchaseOrdersService = PurchaseOrdersService;
exports.PurchaseOrdersService = PurchaseOrdersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(purchase_order_entity_1.PurchaseOrder)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], PurchaseOrdersService);
//# sourceMappingURL=purchase-orders.service.js.map