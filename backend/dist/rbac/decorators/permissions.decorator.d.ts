import { Permission } from '../rbac.service';
export declare const PERMISSIONS_KEY = "permissions";
export declare const RequirePermissions: (...permissions: Permission[]) => import("@nestjs/common").CustomDecorator<string>;
export declare const RequirePermission: (permission: Permission) => import("@nestjs/common").CustomDecorator<string>;
export declare const Roles: (...roles: string[]) => import("@nestjs/common").CustomDecorator<string>;
//# sourceMappingURL=permissions.decorator.d.ts.map