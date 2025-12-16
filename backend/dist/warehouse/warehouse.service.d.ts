import { Repository } from 'typeorm';
import { Location } from './entities/location.entity';
export declare class WarehouseService {
    private locationRepo;
    constructor(locationRepo: Repository<Location>);
    createLocation(tenant_id: string, name: string, type: string, address?: string): Promise<Location>;
    listLocations(tenant_id: string): Promise<Location[]>;
    getLocation(id: string): Promise<Location | null>;
}
//# sourceMappingURL=warehouse.service.d.ts.map