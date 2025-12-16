import { Repository } from 'typeorm';
import { StockMovement } from './entities/stock-movement.entity';
export declare class StockMovementsService {
    private movementRepo;
    constructor(movementRepo: Repository<StockMovement>);
    recordMovement(tenant_id: string, product_id: string, movement_type: string, quantity: number, from_location_id?: string, to_location_id?: string, reason?: string, user_id?: string): Promise<StockMovement>;
    getMovements(tenant_id: string, skip?: number, take?: number): Promise<StockMovement[]>;
}
//# sourceMappingURL=stock-movements.service.d.ts.map