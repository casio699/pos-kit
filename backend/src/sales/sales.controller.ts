import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SalesService } from './sales.service';

@Controller('sales')
@UseGuards(AuthGuard('jwt'))
export class SalesController {
  constructor(private salesService: SalesService) {}

  @Post()
  async createSale(@Body() body: any) {
    return this.salesService.createSale(body.tenant_id, body.location_id, body.user_id, body.lines, body.total_amount, body.payment_method);
  }

  @Get()
  async listSales(@Query('tenant_id') tenant_id: string, @Query('skip') skip = 0, @Query('take') take = 50) {
    return this.salesService.listSales(tenant_id, skip, take);
  }

  @Get(':id')
  async getSale(@Param('id') id: string) {
    return this.salesService.getSale(id);
  }

  @Post(':id/refund')
  async refundSale(@Param('id') id: string, @Body() body: { amount: number }) {
    return this.salesService.refundSale(id, body.amount);
  }
}
