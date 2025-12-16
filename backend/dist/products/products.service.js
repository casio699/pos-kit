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
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const product_entity_1 = require("./entities/product.entity");
const uuid_1 = require("uuid");
let ProductsService = class ProductsService {
    constructor(productRepo) {
        this.productRepo = productRepo;
    }
    async create(tenant_id, data) {
        const product = this.productRepo.create({ tenant_id, ...data });
        return this.productRepo.save(product);
    }
    async findAll(tenant_id, skip = 0, take = 50) {
        return this.productRepo.find({
            where: { tenant_id },
            skip,
            take,
        });
    }
    async findOne(tenantId, id) {
        const product = await this.productRepo.findOne({
            where: { id, tenant_id: tenantId }
        });
        if (!product) {
            throw new common_1.NotFoundException(`Product with ID ${id} not found`);
        }
        return product;
    }
    async update(tenantId, id, data) {
        await this.findOne(tenantId, id); // Verify product exists and belongs to tenant
        await this.productRepo.update({ id, tenant_id: tenantId }, { ...data, updated_at: new Date() });
        return this.findOne(tenantId, id);
    }
    async delete(tenantId, id) {
        await this.findOne(tenantId, id); // Verify product exists and belongs to tenant
        return this.productRepo.delete({ id, tenant_id: tenantId });
    }
    async initializeSampleData(tenantId) {
        const sampleProducts = [
            {
                id: (0, uuid_1.v4)(),
                name: 'Sample Product 1',
                description: 'This is a sample product',
                sku: 'SP-001',
                price: 19.99,
                cost: 9.99,
                is_active: true,
            },
            {
                id: (0, uuid_1.v4)(),
                name: 'Sample Product 2',
                description: 'Another sample product',
                sku: 'SP-002',
                price: 29.99,
                cost: 14.99,
                is_active: true,
            },
        ];
        const products = sampleProducts.map(product => ({
            ...product,
            tenant_id: tenantId,
            created_at: new Date(),
            updated_at: new Date(),
        }));
        await this.productRepo.save(products);
        return products;
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ProductsService);
//# sourceMappingURL=products.service.js.map