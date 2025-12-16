import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { StockMovementsService } from './stock-movements.service';

@Controller('stock-movements')
@UseGuards(AuthGuard('jwt'))
export class StockMovementsController {
  constructor(private movementService: StockMovementsService) {}

  @Get()
  async getMovements(@Query('tenant_id') tenant_id: string, @Query('skip') skip = 0, @Query('take') take = 100) {
    return this.movementService.getMovements(tenant_id, skip, take);
  }
}
