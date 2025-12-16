"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const auth_module_1 = require("./auth/auth.module");
const products_module_1 = require("./products/products.module");
const inventory_module_1 = require("./inventory/inventory.module");
const sales_module_1 = require("./sales/sales.module");
const purchase_orders_module_1 = require("./purchase-orders/purchase-orders.module");
const stock_movements_module_1 = require("./stock-movements/stock-movements.module");
const warehouse_module_1 = require("./warehouse/warehouse.module");
const reporting_module_1 = require("./reporting/reporting.module");
const devices_module_1 = require("./devices/devices.module");
const webhooks_module_1 = require("./webhooks/webhooks.module");
const sync_module_1 = require("./sync/sync.module");
const common_module_1 = require("./common/common.module");
const health_controller_1 = require("./health.controller");
const payments_module_1 = require("./payments/payments.module");
const shopify_module_1 = require("./shopify/shopify.module");
const rbac_module_1 = require("./rbac/rbac.module");
const audit_module_1 = require("./audit/audit.module");
const core_1 = require("@nestjs/core");
const audit_interceptor_1 = require("./audit/interceptors/audit.interceptor");
const audit_controller_1 = require("./audit/audit.controller");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            typeorm_1.TypeOrmModule.forRoot({
                type: 'postgres',
                host: process.env.DATABASE_HOST || 'localhost',
                port: parseInt(process.env.DATABASE_PORT || '5432'),
                username: process.env.DATABASE_USER || 'pos_user',
                password: process.env.DATABASE_PASSWORD || 'pos_password',
                database: process.env.DATABASE_NAME || 'pos_kit',
                entities: ['dist/**/*.entity{.ts,.js}'],
                migrations: ['dist/database/migrations/*{.ts,.js}'],
                migrationsTableName: 'typeorm_migrations',
                synchronize: false,
                autoLoadEntities: true,
                logging: process.env.NODE_ENV === 'development',
                poolSize: parseInt(process.env.DATABASE_POOL_SIZE || '20'),
            }),
            common_module_1.CommonModule,
            auth_module_1.AuthModule,
            products_module_1.ProductsModule,
            inventory_module_1.InventoryModule,
            sales_module_1.SalesModule,
            purchase_orders_module_1.PurchaseOrdersModule,
            stock_movements_module_1.StockMovementsModule,
            warehouse_module_1.WarehouseModule,
            reporting_module_1.ReportingModule,
            devices_module_1.DevicesModule,
            webhooks_module_1.WebhooksModule,
            sync_module_1.SyncModule,
            payments_module_1.PaymentsModule,
            shopify_module_1.ShopifyModule,
            rbac_module_1.RbacModule,
            audit_module_1.AuditModule,
        ],
        controllers: [health_controller_1.HealthController, audit_controller_1.AuditController],
        providers: [
            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: audit_interceptor_1.AuditInterceptor,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map