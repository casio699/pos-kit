"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportingService = void 0;
const common_1 = require("@nestjs/common");
let ReportingService = class ReportingService {
    async getDashboard(tenant_id, location_id) {
        return {
            total_sales: 0,
            transaction_count: 0,
            avg_transaction_value: 0,
            inventory_value: 0,
            low_stock_count: 0,
        };
    }
    async getInventoryHealth(tenant_id, location_id) {
        return {
            total_items: 0,
            stockout_count: 0,
            overstock_count: 0,
            inventory_turnover: 0,
            shrinkage_rate: 0,
        };
    }
};
exports.ReportingService = ReportingService;
exports.ReportingService = ReportingService = __decorate([
    (0, common_1.Injectable)()
], ReportingService);
//# sourceMappingURL=reporting.service.js.map