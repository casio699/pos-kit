import { SetMetadata } from '@nestjs/common';

export const AUDIT_KEY = 'audit';

export interface AuditOptions {
  action: string;
  resourceType?: string;
  getResourceId?: (args: any[]) => string;
  getOldData?: (args: any[]) => any;
  getNewData?: (args: any[]) => any;
}

export const Audit = (options: AuditOptions) => SetMetadata(AUDIT_KEY, options);
