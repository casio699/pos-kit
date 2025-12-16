import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { InventoryModule } from './inventory/inventory.module';
import { SalesModule } from './sales/sales.module';
import { PurchaseOrdersModule } from './purchase-orders/purchase-orders.module';
import { StockMovementsModule } from './stock-movements/stock-movements.module';
import { WarehouseModule } from './warehouse/warehouse.module';
import { ReportingModule } from './reporting/reporting.module';
import { DevicesModule } from './devices/devices.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { SyncModule } from './sync/sync.module';
import { CommonModule } from './common/common.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT || '5432'),
      username: process.env.DATABASE_USER || 'pos_user',
      password: process.env.DATABASE_PASSWORD || 'pos_password',
      database: process.env.DATABASE_NAME || 'pos_kit',
      entities: ['dist/**/*.entity{.ts,.js}'],
      migrations: ['dist/database/migrations/*{.ts,.js}'],
      migrationsTableName: 'typeorm_migrations',
      synchronize: true,
      autoLoadEntities: true,
      logging: process.env.NODE_ENV === 'development',
      poolSize: parseInt(process.env.DATABASE_POOL_SIZE || '20'),
    }),
    CommonModule,
    AuthModule,
    ProductsModule,
    InventoryModule,
    SalesModule,
    PurchaseOrdersModule,
    StockMovementsModule,
    WarehouseModule,
    ReportingModule,
    DevicesModule,
    WebhooksModule,
    SyncModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
