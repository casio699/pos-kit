import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StockMovement } from './entities/stock-movement.entity';

@Injectable()
export class StockMovementsService {
  constructor(@InjectRepository(StockMovement) private movementRepo: Repository<StockMovement>) {}

  async recordMovement(tenant_id: string, product_id: string, movement_type: string, quantity: number, from_location_id?: string, to_location_id?: string, reason?: string, user_id?: string) {
    const movement = this.movementRepo.create({
      tenant_id,
      product_id,
      movement_type,
      quantity,
      from_location_id,
      to_location_id,
      reason,
      user_id,
    });
    return this.movementRepo.save(movement);
  }

  async getMovements(tenant_id: string, skip = 0, take = 100) {
    return this.movementRepo.find({ where: { tenant_id }, skip, take, order: { created_at: 'DESC' } });
  }
}
