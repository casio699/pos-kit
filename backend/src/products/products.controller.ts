import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ProductsService } from './products.service';

@Controller('products')
@UseGuards(AuthGuard('jwt'))
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Post()
  async create(@Body() body: any) {
    return this.productsService.create(body.tenant_id, body);
  }

  @Get()
  async findAll(@Query('tenant_id') tenant_id: string, @Query('skip') skip = 0, @Query('take') take = 50) {
    return this.productsService.findAll(tenant_id, skip, take);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.productsService.update(id, body);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.productsService.delete(id);
  }
}
