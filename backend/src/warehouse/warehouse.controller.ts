import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { WarehouseService } from './warehouse.service';

@Controller('locations')
@UseGuards(AuthGuard('jwt'))
export class WarehouseController {
  constructor(private warehouseService: WarehouseService) {}

  @Post()
  async createLocation(@Body() body: any) {
    return this.warehouseService.createLocation(body.tenant_id, body.name, body.type, body.address);
  }

  @Get()
  async listLocations(@Query('tenant_id') tenant_id: string) {
    return this.warehouseService.listLocations(tenant_id);
  }
}
