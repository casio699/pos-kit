import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InventoryService } from './inventory.service';

@Controller('inventory')
@UseGuards(AuthGuard('jwt'))
export class InventoryController {
  constructor(private inventoryService: InventoryService) {}

  @Get()
  async getInventory(@Query('tenant_id') tenant_id: string, @Query('location_id') location_id?: string, @Query('product_id') product_id?: string) {
    return this.inventoryService.getInventory(tenant_id, location_id, product_id);
  }

  @Post('adjust')
  async adjustInventory(@Body() body: any) {
    return this.inventoryService.adjustInventory(body.tenant_id, body.product_id, body.location_id, body.quantity);
  }

  @Post('transfer')
  async transferInventory(@Body() body: any) {
    return this.inventoryService.transferInventory(body.tenant_id, body.product_id, body.from_location_id, body.to_location_id, body.quantity);
  }
}
