import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PurchaseOrdersService } from './purchase-orders.service';

@Controller('purchase-orders')
@UseGuards(AuthGuard('jwt'))
export class PurchaseOrdersController {
  constructor(private poService: PurchaseOrdersService) {}

  @Post()
  async createPO(@Body() body: any) {
    return this.poService.createPO(body.tenant_id, body.po_number, body.supplier_id, body.expected_delivery_date);
  }

  @Get()
  async listPOs(@Query('tenant_id') tenant_id: string, @Query('skip') skip = 0, @Query('take') take = 50) {
    return this.poService.listPOs(tenant_id, skip, take);
  }

  @Get(':id')
  async getPO(@Param('id') id: string) {
    return this.poService.getPO(id);
  }
}
