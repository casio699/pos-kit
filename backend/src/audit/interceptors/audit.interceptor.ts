import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';
import { AuditService } from '../audit.service';
import { AUDIT_KEY, AuditOptions } from '../decorators/audit.decorator';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private reflector: Reflector,
    private auditService: AuditService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const auditOptions = this.reflector.get<AuditOptions>(
      AUDIT_KEY,
      context.getHandler(),
    );

    if (!auditOptions) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as any;

    let startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: (response) => {
          // Log successful action
          this.logAction(auditOptions, request, user, true, null, startTime);
        },
        error: (error) => {
          // Log failed action
          this.logAction(auditOptions, request, user, false, error.message, startTime);
        },
      }),
    );
  }

  private async logAction(
    auditOptions: AuditOptions,
    request: Request,
    user: any,
    success: boolean,
    errorMessage: string | null,
    startTime: number,
  ) {
    if (!user || !user.id) {
      return; // Don't log anonymous requests
    }

    const resourceId = auditOptions.getResourceId
      ? auditOptions.getResourceId(request.body || request.params)
      : null;

    const oldData = auditOptions.getOldData
      ? auditOptions.getOldData(request.body || request.params)
      : null;

    const newData = auditOptions.getNewData
      ? auditOptions.getNewData(request.body || request.params)
      : null;

    await this.auditService.log({
      userId: user.id,
      tenantId: user.tenant_id || user.tenantId,
      action: auditOptions.action,
      resourceType: auditOptions.resourceType,
      resourceId: resourceId || undefined,
      oldValues: oldData,
      newValues: newData,
      ipAddress: request.ip || request.connection.remoteAddress,
      userAgent: request.get('User-Agent'),
      success,
      errorMessage: errorMessage || undefined,
    });
  }
}
