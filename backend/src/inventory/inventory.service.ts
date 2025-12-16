import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventoryItem } from './entities/inventory-item.entity';

@Injectable()
export class InventoryService {
  constructor(@InjectRepository(InventoryItem) private inventoryRepo: Repository<InventoryItem>) {}

  async getInventory(tenant_id: string, location_id?: string, product_id?: string) {
    const query = this.inventoryRepo.createQueryBuilder('inv').where('inv.tenant_id = :tenant_id', { tenant_id });
    if (location_id) query.andWhere('inv.location_id = :location_id', { location_id });
    if (product_id) query.andWhere('inv.product_id = :product_id', { product_id });
    return query.getMany();
  }

  async adjustInventory(tenant_id: string, product_id: string, location_id: string, quantity: number) {
    let item = await this.inventoryRepo.findOne({ where: { tenant_id, product_id, location_id } });
    if (!item) {
      item = this.inventoryRepo.create({ tenant_id, product_id, location_id, qty_available: quantity });
    } else {
      item.qty_available += quantity;
    }
    item.last_updated = new Date();
    return this.inventoryRepo.save(item);
  }

  async transferInventory(tenant_id: string, product_id: string, from_location: string, to_location: string, quantity: number) {
    const fromItem = await this.inventoryRepo.findOne({ where: { tenant_id, product_id, location_id: from_location } });
    if (!fromItem || fromItem.qty_available < quantity) throw new Error('Insufficient inventory');
    fromItem.qty_available -= quantity;
    await this.inventoryRepo.save(fromItem);

    let toItem = await this.inventoryRepo.findOne({ where: { tenant_id, product_id, location_id: to_location } });
    if (!toItem) {
      toItem = this.inventoryRepo.create({ tenant_id, product_id, location_id: to_location, qty_available: quantity });
    } else {
      toItem.qty_available += quantity;
    }
    return this.inventoryRepo.save(toItem);
  }
}
