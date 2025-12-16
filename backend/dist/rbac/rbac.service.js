"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RbacService = exports.DefaultRole = exports.Permission = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const role_entity_1 = require("./entities/role.entity");
const user_entity_1 = require("../auth/entities/user.entity");
var Permission;
(function (Permission) {
    // Products
    Permission["PRODUCT_READ"] = "product:read";
    Permission["PRODUCT_CREATE"] = "product:create";
    Permission["PRODUCT_UPDATE"] = "product:update";
    Permission["PRODUCT_DELETE"] = "product:delete";
    // Inventory
    Permission["INVENTORY_READ"] = "inventory:read";
    Permission["INVENTORY_ADJUST"] = "inventory:adjust";
    Permission["INVENTORY_TRANSFER"] = "inventory:transfer";
    // Sales
    Permission["SALE_READ"] = "sale:read";
    Permission["SALE_CREATE"] = "sale:create";
    Permission["SALE_UPDATE"] = "sale:update";
    Permission["SALE_DELETE"] = "sale:delete";
    Permission["SALE_REFUND"] = "sale:refund";
    // Users & Roles
    Permission["USER_READ"] = "user:read";
    Permission["USER_CREATE"] = "user:create";
    Permission["USER_UPDATE"] = "user:update";
    Permission["USER_DELETE"] = "user:delete";
    Permission["ROLE_MANAGE"] = "role:manage";
    // Reports
    Permission["REPORT_READ"] = "report:read";
    Permission["REPORT_EXPORT"] = "report:export";
    // Settings
    Permission["SETTINGS_READ"] = "settings:read";
    Permission["SETTINGS_UPDATE"] = "settings:update";
    // Admin
    Permission["ADMIN_FULL"] = "admin:full";
})(Permission || (exports.Permission = Permission = {}));
var DefaultRole;
(function (DefaultRole) {
    DefaultRole["ADMIN"] = "admin";
    DefaultRole["MANAGER"] = "manager";
    DefaultRole["CASHIER"] = "cashier";
    DefaultRole["VIEWER"] = "viewer";
})(DefaultRole || (exports.DefaultRole = DefaultRole = {}));
let RbacService = class RbacService {
    constructor(roleRepository, userRoleRepository, userRepository) {
        this.roleRepository = roleRepository;
        this.userRoleRepository = userRoleRepository;
        this.userRepository = userRepository;
    }
    async getDefaultRoles() {
        return [
            {
                tenant_id: '',
                name: DefaultRole.ADMIN,
                description: 'Full system access',
                permissions: Object.values(Permission),
                is_active: true,
                created_at: new Date(),
                updated_at: new Date(),
                tenant: null,
            },
            {
                tenant_id: '',
                name: DefaultRole.MANAGER,
                description: 'Can manage products, inventory, and sales',
                permissions: [
                    Permission.PRODUCT_READ,
                    Permission.PRODUCT_CREATE,
                    Permission.PRODUCT_UPDATE,
                    Permission.INVENTORY_READ,
                    Permission.INVENTORY_ADJUST,
                    Permission.INVENTORY_TRANSFER,
                    Permission.SALE_READ,
                    Permission.SALE_CREATE,
                    Permission.SALE_UPDATE,
                    Permission.SALE_REFUND,
                    Permission.REPORT_READ,
                    Permission.REPORT_EXPORT,
                    Permission.SETTINGS_READ,
                ],
                is_active: true,
                created_at: new Date(),
                updated_at: new Date(),
                tenant: null,
            },
            {
                tenant_id: '',
                name: DefaultRole.CASHIER,
                description: 'Can process sales and view inventory',
                permissions: [
                    Permission.PRODUCT_READ,
                    Permission.INVENTORY_READ,
                    Permission.SALE_READ,
                    Permission.SALE_CREATE,
                    Permission.SALE_UPDATE,
                ],
                is_active: true,
                created_at: new Date(),
                updated_at: new Date(),
                tenant: null,
            },
            {
                tenant_id: '',
                name: DefaultRole.VIEWER,
                description: 'Read-only access',
                permissions: [
                    Permission.PRODUCT_READ,
                    Permission.INVENTORY_READ,
                    Permission.SALE_READ,
                    Permission.REPORT_READ,
                ],
                is_active: true,
                created_at: new Date(),
                updated_at: new Date(),
                tenant: null,
            },
        ];
    }
    async initializeDefaultRoles(tenantId) {
        // First, ensure the tenant exists
        await this.ensureTenantExists(tenantId);
        const defaultRoles = await this.getDefaultRoles();
        for (const roleTemplate of defaultRoles) {
            const existingRole = await this.roleRepository.findOne({
                where: { name: roleTemplate.name, tenant_id: tenantId },
            });
            if (!existingRole) {
                const role = this.roleRepository.create({
                    name: roleTemplate.name,
                    description: roleTemplate.description,
                    permissions: roleTemplate.permissions,
                    is_active: roleTemplate.is_active,
                    tenant_id: tenantId,
                });
                await this.roleRepository.save(role);
            }
        }
    }
    async ensureTenantExists(tenantId) {
        const tenantRepository = this.roleRepository.manager.getRepository('Tenant');
        let tenant = await tenantRepository.findOne({ where: { id: tenantId } });
        if (!tenant) {
            tenant = tenantRepository.create({
                id: tenantId,
                name: `Tenant ${tenantId}`,
                is_active: true,
            });
            await tenantRepository.save(tenant);
        }
    }
    async getUserPermissions(userId, tenantId) {
        const userRoles = await this.userRoleRepository.find({
            where: { user_id: userId, tenant_id: tenantId, is_active: true },
            relations: ['role'],
        });
        const permissions = new Set();
        for (const userRole of userRoles) {
            if (userRole.role && userRole.role.is_active) {
                userRole.role.permissions.forEach((permission) => permissions.add(permission));
            }
        }
        return Array.from(permissions);
    }
    async hasPermission(userId, tenantId, permission) {
        const userPermissions = await this.getUserPermissions(userId, tenantId);
        return userPermissions.includes(permission) || userPermissions.includes(Permission.ADMIN_FULL);
    }
    async assignRole(userId, roleId, tenantId) {
        const existingAssignment = await this.userRoleRepository.findOne({
            where: { user_id: userId, role_id: roleId, tenant_id: tenantId },
        });
        if (existingAssignment) {
            existingAssignment.is_active = true;
            return this.userRoleRepository.save(existingAssignment);
        }
        const userRole = this.userRoleRepository.create({
            user_id: userId,
            role_id: roleId,
            tenant_id: tenantId,
        });
        return this.userRoleRepository.save(userRole);
    }
    async removeRole(userId, roleId, tenantId) {
        await this.userRoleRepository.update({ user_id: userId, role_id: roleId, tenant_id: tenantId }, { is_active: false });
    }
    async getUserRoles(userId, tenantId) {
        const userRoles = await this.userRoleRepository.find({
            where: { user_id: userId, tenant_id: tenantId, is_active: true },
            relations: ['role'],
        });
        return userRoles.map(ur => ur.role).filter(Boolean);
    }
    async getRoleByName(name, tenantId) {
        return this.roleRepository.findOne({
            where: { name, tenant_id: tenantId, is_active: true },
        });
    }
    async listUsers(tenantId) {
        const users = await this.userRepository.find({
            where: { tenant_id: tenantId, is_active: true },
            select: ['id', 'email', 'first_name', 'last_name', 'created_at', 'is_active'],
        });
        return users;
    }
    async createRole(roleData, tenantId) {
        const role = this.roleRepository.create({
            ...roleData,
            tenant_id: tenantId,
        });
        return this.roleRepository.save(role);
    }
    async updateRole(roleId, updates) {
        await this.roleRepository.update(roleId, updates);
        const role = await this.roleRepository.findOne({ where: { id: roleId } });
        if (!role) {
            throw new Error('Role not found');
        }
        return role;
    }
    async deleteRole(roleId) {
        await this.roleRepository.update(roleId, { is_active: false });
    }
    async listRoles(tenantId) {
        return this.roleRepository.find({
            where: { tenant_id: tenantId, is_active: true },
            order: { name: 'ASC' },
        });
    }
};
exports.RbacService = RbacService;
exports.RbacService = RbacService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(role_entity_1.Role)),
    __param(1, (0, typeorm_1.InjectRepository)(role_entity_1.UserRole)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], RbacService);
//# sourceMappingURL=rbac.service.js.map