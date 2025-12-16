import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';

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

  async findOne(id: string) {
    return this.productRepo.findOne({ where: { id } });
  }

  async update(id: string, data: any) {
    await this.productRepo.update(id, { ...data, updated_at: new Date() });
    return this.findOne(id);
  }

  async delete(id: string) {
    return this.productRepo.delete(id);
  }
}
