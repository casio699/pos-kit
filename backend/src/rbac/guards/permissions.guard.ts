import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RbacService, Permission } from '../rbac.service';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private rbacService: RbacService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || (!user.id && !user.userId)) {
      return false;
    }

    const userId = user.id || user.userId;
    const tenantId = user.tenantId || user.tenant_id;
    
    for (const permission of requiredPermissions) {
      const hasPermission = await this.rbacService.hasPermission(
        userId,
        tenantId,
        permission,
      );
      if (!hasPermission) {
        return false;
      }
    }

    return true;
  }
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private rbacService: RbacService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      'roles',
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.id) {
      return false;
    }

    const tenantId = user.tenantId || user.tenant_id;
    const userRoles = await this.rbacService.getUserRoles(user.id, tenantId);
    const userRoleNames = userRoles.map(role => role.name);

    return requiredRoles.some(role => userRoleNames.includes(role));
  }
}
