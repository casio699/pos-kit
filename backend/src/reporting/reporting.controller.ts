import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ReportingService } from './reporting.service';

@Controller('reports')
@UseGuards(AuthGuard('jwt'))
export class ReportingController {
  constructor(private reportingService: ReportingService) {}

  @Get('dashboard')
  async getDashboard(@Query('tenant_id') tenant_id: string, @Query('location_id') location_id?: string) {
    return this.reportingService.getDashboard(tenant_id, location_id);
  }

  @Get('inventory-health')
  async getInventoryHealth(@Query('tenant_id') tenant_id: string, @Query('location_id') location_id?: string) {
    return this.reportingService.getInventoryHealth(tenant_id, location_id);
  }
}
