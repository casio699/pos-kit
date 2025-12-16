import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WarehouseService } from './warehouse.service';
import { WarehouseController } from './warehouse.controller';
import { Location } from './entities/location.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Location])],
  providers: [WarehouseService],
  controllers: [WarehouseController],
  exports: [WarehouseService],
})
export class WarehouseModule {}
