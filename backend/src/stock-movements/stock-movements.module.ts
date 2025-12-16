import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockMovementsService } from './stock-movements.service';
import { StockMovementsController } from './stock-movements.controller';
import { StockMovement } from './entities/stock-movement.entity';

@Module({
  imports: [TypeOrmModule.forFeature([StockMovement])],
  providers: [StockMovementsService],
  controllers: [StockMovementsController],
  exports: [StockMovementsService],
})
export class StockMovementsModule {}
