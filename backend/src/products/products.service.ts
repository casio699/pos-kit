import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ProductsService {
  constructor(@InjectRepository(Product) private productRepo: Repository<Product>) {}

  async create(tenant_id: string, data: any) {
    const product = this.productRepo.create({ tenant_id, ...data });
    return this.productRepo.save(product);
  }

  async findAll(tenant_id: string, skip = 0, take = 50) {
    return this.productRepo.find({
      where: { tenant_id },
      skip,
      take,
    });
  }

  async findOne(tenantId: string, id: string) {
    const product = await this.productRepo.findOne({ 
      where: { id, tenant_id: tenantId } 
    });
    
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    
    return product;
  }

  async update(tenantId: string, id: string, data: any) {
    await this.findOne(tenantId, id); // Verify product exists and belongs to tenant
    await this.productRepo.update(
      { id, tenant_id: tenantId },
      { ...data, updated_at: new Date() }
    );
    return this.findOne(tenantId, id);
  }

  async delete(tenantId: string, id: string) {
    await this.findOne(tenantId, id); // Verify product exists and belongs to tenant
    return this.productRepo.delete({ id, tenant_id: tenantId });
  }

  async initializeSampleData(tenantId: string) {
    const sampleProducts = [
      {
        id: uuidv4(),
        name: 'Sample Product 1',
        description: 'This is a sample product',
        sku: 'SP-001',
        price: 19.99,
        cost: 9.99,
        is_active: true,
      },
      {
        id: uuidv4(),
        name: 'Sample Product 2',
        description: 'Another sample product',
        sku: 'SP-002',
        price: 29.99,
        cost: 14.99,
        is_active: true,
      },
    ];

    const products = sampleProducts.map(product => ({
      ...product,
      tenant_id: tenantId,
      created_at: new Date(),
      updated_at: new Date(),
    }));

    await this.productRepo.save(products);
    return products;
  }
}
