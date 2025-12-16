import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../rbac/guards/permissions.guard';
import { RequirePermissions, RequirePermission } from '../rbac/decorators/permissions.decorator';
import { Permission } from '../rbac/rbac.service';

@Controller('products')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Post()
  @RequirePermission(Permission.PRODUCT_CREATE)
  async create(@Body() body: any) {
    return this.productsService.create(body.tenant_id, body);
  }

  @Get()
  @RequirePermission(Permission.PRODUCT_READ)
  async findAll(@Query('tenant_id') tenant_id: string, @Query('skip') skip = 0, @Query('take') take = 50) {
    return this.productsService.findAll(tenant_id, skip, take);
  }

  @Get(':id')
  @RequirePermission(Permission.PRODUCT_READ)
  async findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Put(':id')
  @RequirePermission(Permission.PRODUCT_UPDATE)
  async update(@Param('id') id: string, @Body() body: any) {
    return this.productsService.update(id, body);
  }

  @Delete(':id')
  @RequirePermission(Permission.PRODUCT_DELETE)
  async delete(@Param('id') id: string) {
    return this.productsService.delete(id);
  }
}
