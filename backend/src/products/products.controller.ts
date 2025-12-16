import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../rbac/guards/permissions.guard';
import { RequirePermissions, RequirePermission } from '../rbac/decorators/permissions.decorator';
import { Permission } from '../rbac/rbac.service';
import { AuthenticatedRequest } from '../common/types/request.types';

@Controller('products')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Post()
  @RequirePermission(Permission.PRODUCT_CREATE)
  async create(@Req() req: AuthenticatedRequest, @Body() body: any) {
    return this.productsService.create(req.user.tenant_id, body);
  }

  @Get()
  @RequirePermission(Permission.PRODUCT_READ)
  async findAll(@Req() req: AuthenticatedRequest, @Query('skip') skip = 0, @Query('take') take = 50) {
    return this.productsService.findAll(req.user.tenant_id, skip, take);
  }

  @Get(':id')
  @RequirePermission(Permission.PRODUCT_READ)
  async findOne(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.productsService.findOne(req.user.tenant_id, id);
  }

  @Put(':id')
  @RequirePermission(Permission.PRODUCT_UPDATE)
  async update(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() body: any) {
    return this.productsService.update(req.user.tenant_id, id, body);
  }

  @Delete(':id')
  @RequirePermission(Permission.PRODUCT_DELETE)
  async delete(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.productsService.delete(req.user.tenant_id, id);
  }

  @Post('initialize-sample')
  @RequirePermission(Permission.PRODUCT_CREATE)
  async initializeSampleData(@Req() req: AuthenticatedRequest) {
    return this.productsService.initializeSampleData(req.user.tenant_id);
  }
}
