import { Repository } from 'typeorm';
import { Role, UserRole } from './entities/role.entity';
import { User } from '../auth/entities/user.entity';
export declare enum Permission {
    PRODUCT_READ = "product:read",
    PRODUCT_CREATE = "product:create",
    PRODUCT_UPDATE = "product:update",
    PRODUCT_DELETE = "product:delete",
    INVENTORY_READ = "inventory:read",
    INVENTORY_ADJUST = "inventory:adjust",
    INVENTORY_TRANSFER = "inventory:transfer",
    SALE_READ = "sale:read",
    SALE_CREATE = "sale:create",
    SALE_UPDATE = "sale:update",
    SALE_DELETE = "sale:delete",
    SALE_REFUND = "sale:refund",
    USER_READ = "user:read",
    USER_CREATE = "user:create",
    USER_UPDATE = "user:update",
    USER_DELETE = "user:delete",
    ROLE_MANAGE = "role:manage",
    REPORT_READ = "report:read",
    REPORT_EXPORT = "report:export",
    SETTINGS_READ = "settings:read",
    SETTINGS_UPDATE = "settings:update",
    ADMIN_FULL = "admin:full"
}
export declare enum DefaultRole {
    ADMIN = "admin",
    MANAGER = "manager",
    CASHIER = "cashier",
    VIEWER = "viewer"
}
export declare class RbacService {
    private roleRepository;
    private userRoleRepository;
    private userRepository;
    constructor(roleRepository: Repository<Role>, userRoleRepository: Repository<UserRole>, userRepository: Repository<User>);
    getDefaultRoles(): Promise<Omit<Role, 'id'>[]>;
    initializeDefaultRoles(tenantId: string): Promise<void>;
    private ensureTenantExists;
    getUserPermissions(userId: string, tenantId: string): Promise<string[]>;
    hasPermission(userId: string, tenantId: string, permission: string): Promise<boolean>;
    assignRole(userId: string, roleId: string, tenantId: string): Promise<UserRole>;
    removeRole(userId: string, roleId: string, tenantId: string): Promise<void>;
    getUserRoles(userId: string, tenantId: string): Promise<Role[]>;
    getRoleByName(name: string, tenantId: string): Promise<Role | null>;
    listUsers(tenantId: string): Promise<Omit<User, 'roles'>[]>;
    createRole(roleData: Partial<Role>, tenantId: string): Promise<Role>;
    updateRole(roleId: string, updates: Partial<Role>): Promise<Role>;
    deleteRole(roleId: string): Promise<void>;
    listRoles(tenantId: string): Promise<Role[]>;
}
//# sourceMappingURL=rbac.service.d.ts.map