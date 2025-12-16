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
exports.WarehouseService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const location_entity_1 = require("./entities/location.entity");
let WarehouseService = class WarehouseService {
    constructor(locationRepo) {
        this.locationRepo = locationRepo;
    }
    async createLocation(tenant_id, name, type, address) {
        const location = this.locationRepo.create({ tenant_id, name, type, address });
        return this.locationRepo.save(location);
    }
    async listLocations(tenant_id) {
        return this.locationRepo.find({ where: { tenant_id, is_active: true } });
    }
    async getLocation(id) {
        return this.locationRepo.findOne({ where: { id } });
    }
};
exports.WarehouseService = WarehouseService;
exports.WarehouseService = WarehouseService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(location_entity_1.Location)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], WarehouseService);
//# sourceMappingURL=warehouse.service.js.map