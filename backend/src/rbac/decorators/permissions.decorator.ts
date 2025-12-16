import { SetMetadata } from '@nestjs/common';
import { Permission } from '../rbac.service';

export const PERMISSIONS_KEY = 'permissions';

export const RequirePermissions = (...permissions: Permission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

export const RequirePermission = (permission: Permission) =>
  SetMetadata(PERMISSIONS_KEY, [permission]);

export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
