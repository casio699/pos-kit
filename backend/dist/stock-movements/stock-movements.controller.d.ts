import { StockMovementsService } from './stock-movements.service';
export declare class StockMovementsController {
    private movementService;
    constructor(movementService: StockMovementsService);
    getMovements(tenant_id: string, skip?: number, take?: number): Promise<import("./entities/stock-movement.entity").StockMovement[]>;
}
//# sourceMappingURL=stock-movements.controller.d.ts.map