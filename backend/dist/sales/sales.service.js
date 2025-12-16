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
exports.SalesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const sale_entity_1 = require("./entities/sale.entity");
const sale_line_entity_1 = require("./entities/sale-line.entity");
let SalesService = class SalesService {
    constructor(saleRepo, saleLineRepo) {
        this.saleRepo = saleRepo;
        this.saleLineRepo = saleLineRepo;
    }
    async createSale(tenant_id, location_id, user_id, lines, total_amount, payment_method) {
        const sale = this.saleRepo.create({ tenant_id, location_id, user_id, total_amount, payment_method });
        const savedSale = await this.saleRepo.save(sale);
        for (const line of lines) {
            const saleLine = this.saleLineRepo.create({ sale_id: savedSale.id, ...line });
            await this.saleLineRepo.save(saleLine);
        }
        return this.saleRepo.findOne({ where: { id: savedSale.id }, relations: ['lines'] });
    }
    async getSale(id) {
        return this.saleRepo.findOne({ where: { id }, relations: ['lines'] });
    }
    async listSales(tenant_id, skip = 0, take = 50) {
        return this.saleRepo.find({ where: { tenant_id }, skip, take, relations: ['lines'] });
    }
    async refundSale(id, amount) {
        const sale = await this.saleRepo.findOne({ where: { id } });
        if (!sale)
            throw new Error('Sale not found');
        sale.status = amount >= sale.total_amount ? 'refunded' : 'partial_refund';
        return this.saleRepo.save(sale);
    }
};
exports.SalesService = SalesService;
exports.SalesService = SalesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(sale_entity_1.Sale)),
    __param(1, (0, typeorm_1.InjectRepository)(sale_line_entity_1.SaleLine)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], SalesService);
//# sourceMappingURL=sales.service.js.map