import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuditService } from './audit.service';

@UseGuards(JwtAuthGuard)
@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('logs')
  async getAuditLogs(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('userId') userId?: string,
    @Query('action') action?: string,
  ) {
    const user: any = req.user;
    const tenantId = user.tenant_id || user.tenantId;
    const pageNum = parseInt(page || '1', 10);
    const limitNum = parseInt(limit || '50', 10);

    if (userId) {
      return this.auditService.findByUser(userId, tenantId, pageNum, limitNum);
    }

    if (action) {
      return this.auditService.findByAction(action, tenantId, pageNum, limitNum);
    }

    return this.auditService.findByTenant(tenantId, pageNum, limitNum);
  }
}
