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
exports.InventoryService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const inventory_item_entity_1 = require("./entities/inventory-item.entity");
let InventoryService = class InventoryService {
    constructor(inventoryRepo) {
        this.inventoryRepo = inventoryRepo;
    }
    async getInventory(tenant_id, location_id, product_id) {
        const query = this.inventoryRepo.createQueryBuilder('inv').where('inv.tenant_id = :tenant_id', { tenant_id });
        if (location_id)
            query.andWhere('inv.location_id = :location_id', { location_id });
        if (product_id)
            query.andWhere('inv.product_id = :product_id', { product_id });
        return query.getMany();
    }
    async adjustInventory(tenant_id, product_id, location_id, quantity) {
        let item = await this.inventoryRepo.findOne({ where: { tenant_id, product_id, location_id } });
        if (!item) {
            item = this.inventoryRepo.create({ tenant_id, product_id, location_id, qty_available: quantity });
        }
        else {
            item.qty_available += quantity;
        }
        item.last_updated = new Date();
        return this.inventoryRepo.save(item);
    }
    async transferInventory(tenant_id, product_id, from_location, to_location, quantity) {
        const fromItem = await this.inventoryRepo.findOne({ where: { tenant_id, product_id, location_id: from_location } });
        if (!fromItem || fromItem.qty_available < quantity)
            throw new Error('Insufficient inventory');
        fromItem.qty_available -= quantity;
        await this.inventoryRepo.save(fromItem);
        let toItem = await this.inventoryRepo.findOne({ where: { tenant_id, product_id, location_id: to_location } });
        if (!toItem) {
            toItem = this.inventoryRepo.create({ tenant_id, product_id, location_id: to_location, qty_available: quantity });
        }
        else {
            toItem.qty_available += quantity;
        }
        return this.inventoryRepo.save(toItem);
    }
};
exports.InventoryService = InventoryService;
exports.InventoryService = InventoryService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(inventory_item_entity_1.InventoryItem)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], InventoryService);
//# sourceMappingURL=inventory.service.js.map