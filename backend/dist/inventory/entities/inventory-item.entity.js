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
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryItem = void 0;
const typeorm_1 = require("typeorm");
let InventoryItem = class InventoryItem {
};
exports.InventoryItem = InventoryItem;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], InventoryItem.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid'),
    __metadata("design:type", String)
], InventoryItem.prototype, "tenant_id", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid'),
    __metadata("design:type", String)
], InventoryItem.prototype, "product_id", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid'),
    __metadata("design:type", String)
], InventoryItem.prototype, "location_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], InventoryItem.prototype, "qty_available", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], InventoryItem.prototype, "qty_reserved", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], InventoryItem.prototype, "qty_damaged", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], InventoryItem.prototype, "qty_in_transit", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], InventoryItem.prototype, "bin_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'piece' }),
    __metadata("design:type", String)
], InventoryItem.prototype, "uom", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], InventoryItem.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], InventoryItem.prototype, "last_updated", void 0);
exports.InventoryItem = InventoryItem = __decorate([
    (0, typeorm_1.Entity)('inventory_items'),
    (0, typeorm_1.Index)(['product_id', 'location_id'], { unique: true }),
    (0, typeorm_1.Index)(['tenant_id'])
], InventoryItem);
//# sourceMappingURL=inventory-item.entity.js.map