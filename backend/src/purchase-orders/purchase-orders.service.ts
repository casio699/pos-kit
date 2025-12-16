import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PurchaseOrder } from './entities/purchase-order.entity';

@Injectable()
export class PurchaseOrdersService {
  constructor(@InjectRepository(PurchaseOrder) private poRepo: Repository<PurchaseOrder>) {}

  async createPO(tenant_id: string, po_number: string, supplier_id: string, expected_delivery_date: Date) {
    const po = this.poRepo.create({ tenant_id, po_number, supplier_id, expected_delivery_date });
    return this.poRepo.save(po);
  }

  async listPOs(tenant_id: string, skip = 0, take = 50) {
    return this.poRepo.find({ where: { tenant_id }, skip, take });
  }

  async getPO(id: string) {
    return this.poRepo.findOne({ where: { id } });
  }

  async updatePOStatus(id: string, status: string) {
    await this.poRepo.update(id, { status });
    return this.getPO(id);
  }
}
