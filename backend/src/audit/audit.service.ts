import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';

export interface AuditLogData {
  userId: string;
  tenantId: string;
  action: string;
  resourceType?: string;
  resourceId?: string;
  oldValues?: any;
  newValues?: any;
  ipAddress?: string;
  userAgent?: string;
  success?: boolean;
  errorMessage?: string;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  async log(data: AuditLogData): Promise<void> {
    try {
      const auditLog = this.auditLogRepository.create({
        user_id: data.userId,
        tenant_id: data.tenantId,
        action: data.action,
        resource_type: data.resourceType,
        resource_id: data.resourceId,
        old_values: data.oldValues,
        new_values: data.newValues,
        ip_address: data.ipAddress,
        user_agent: data.userAgent,
        success: data.success ?? true,
        error_message: data.errorMessage,
      });

      await this.auditLogRepository.save(auditLog);
    } catch (error) {
      // Log audit failures to console but don't throw to avoid breaking main functionality
      console.error('Failed to create audit log:', error);
    }
  }

  async findByTenant(
    tenantId: string,
    page: number = 1,
    limit: number = 50,
  ): Promise<{ logs: AuditLog[]; total: number }> {
    const [logs, total] = await this.auditLogRepository.findAndCount({
      where: { tenant_id: tenantId },
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { logs, total };
  }

  async findByUser(
    userId: string,
    tenantId: string,
    page: number = 1,
    limit: number = 50,
  ): Promise<{ logs: AuditLog[]; total: number }> {
    const [logs, total] = await this.auditLogRepository.findAndCount({
      where: { user_id: userId, tenant_id: tenantId },
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { logs, total };
  }

  async findByAction(
    action: string,
    tenantId: string,
    page: number = 1,
    limit: number = 50,
  ): Promise<{ logs: AuditLog[]; total: number }> {
    const [logs, total] = await this.auditLogRepository.findAndCount({
      where: { action, tenant_id: tenantId },
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { logs, total };
  }
}
