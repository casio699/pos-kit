import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../rbac/guards/permissions.guard';
import { RequirePermission } from '../rbac/decorators/permissions.decorator';
import { Permission } from '../rbac/rbac.service';

@Controller('inventory')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class InventoryController {
  constructor(private inventoryService: InventoryService) {}

  @Get()
  @RequirePermission(Permission.INVENTORY_READ)
  async getInventory(@Query('tenant_id') tenant_id: string, @Query('location_id') location_id?: string, @Query('product_id') product_id?: string) {
    return this.inventoryService.getInventory(tenant_id, location_id, product_id);
  }

  @Post('adjust')
  @RequirePermission(Permission.INVENTORY_ADJUST)
  async adjustInventory(@Body() body: any) {
    return this.inventoryService.adjustInventory(body.tenant_id, body.product_id, body.location_id, body.quantity);
  }

  @Post('transfer')
  @RequirePermission(Permission.INVENTORY_TRANSFER)
  async transferInventory(@Body() body: any) {
    return this.inventoryService.transferInventory(body.tenant_id, body.product_id, body.from_location_id, body.to_location_id, body.quantity);
  }
}
