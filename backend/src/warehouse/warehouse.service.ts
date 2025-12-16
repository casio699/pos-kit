import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Location } from './entities/location.entity';

@Injectable()
export class WarehouseService {
  constructor(@InjectRepository(Location) private locationRepo: Repository<Location>) {}

  async createLocation(tenant_id: string, name: string, type: string, address?: string) {
    const location = this.locationRepo.create({ tenant_id, name, type, address });
    return this.locationRepo.save(location);
  }

  async listLocations(tenant_id: string) {
    return this.locationRepo.find({ where: { tenant_id, is_active: true } });
  }

  async getLocation(id: string) {
    return this.locationRepo.findOne({ where: { id } });
  }
}
