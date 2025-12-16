import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sale } from './entities/sale.entity';
import { SaleLine } from './entities/sale-line.entity';

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(Sale) private saleRepo: Repository<Sale>,
    @InjectRepository(SaleLine) private saleLineRepo: Repository<SaleLine>,
  ) {}

  async createSale(tenant_id: string, location_id: string, user_id: string, lines: any[], total_amount: number, payment_method: string) {
    const sale = this.saleRepo.create({ tenant_id, location_id, user_id, total_amount, payment_method });
    const savedSale = await this.saleRepo.save(sale);

    for (const line of lines) {
      const saleLine = this.saleLineRepo.create({ sale_id: savedSale.id, ...line });
      await this.saleLineRepo.save(saleLine);
    }

    return this.saleRepo.findOne({ where: { id: savedSale.id }, relations: ['lines'] });
  }

  async getSale(id: string) {
    return this.saleRepo.findOne({ where: { id }, relations: ['lines'] });
  }

  async listSales(tenant_id: string, skip = 0, take = 50) {
    return this.saleRepo.find({ where: { tenant_id }, skip, take, relations: ['lines'] });
  }

  async refundSale(id: string, amount: number) {
    const sale = await this.saleRepo.findOne({ where: { id } });
    if (!sale) throw new Error('Sale not found');
    sale.status = amount >= sale.total_amount ? 'refunded' : 'partial_refund';
    return this.saleRepo.save(sale);
  }
}
