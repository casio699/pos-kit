"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RbacController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const permissions_guard_1 = require("./guards/permissions.guard");
const permissions_decorator_1 = require("./decorators/permissions.decorator");
const rbac_service_1 = require("./rbac.service");
const role_dto_1 = require("./dto/role.dto");
const audit_decorator_1 = require("../audit/decorators/audit.decorator");
let RbacController = class RbacController {
    constructor(rbacService) {
        this.rbacService = rbacService;
    }
    async initializeRoles(req) {
        const tenantId = req.user.tenantId || req.user.tenant_id;
        console.log('RBAC: Received tenantId:', tenantId);
        console.log('RBAC: User object:', req.user);
        await this.rbacService.initializeDefaultRoles(tenantId);
        return { message: 'Default roles initialized successfully' };
    }
    async listRoles(req) {
        const tenantId = req.user.tenantId || req.user.tenant_id;
        return this.rbacService.listRoles(tenantId);
    }
    async createRole(createRoleDto, req) {
        const tenantId = req.user.tenantId || req.user.tenant_id;
        return this.rbacService.createRole(createRoleDto, tenantId);
    }
    async updateRole(roleId, updateRoleDto) {
        return this.rbacService.updateRole(roleId, updateRoleDto);
    }
    async deleteRole(roleId) {
        return this.rbacService.deleteRole(roleId);
    }
    async listUsers(req) {
        const tenantId = req.user.tenantId || req.user.tenant_id;
        const users = await this.rbacService.listUsers(tenantId);
        // Add roles to each user
        const usersWithRoles = await Promise.all(users.map(async (user) => {
            const userRoles = await this.rbacService.getUserRoles(user.id, tenantId);
            return {
                ...user,
                roles: userRoles,
            };
        }));
        return usersWithRoles;
    }
    async assignRole(userId, assignRoleDto, req) {
        const tenantId = req.user.tenantId || req.user.tenant_id;
        return this.rbacService.assignRole(userId, assignRoleDto.roleId, tenantId);
    }
    async removeRole(userId, roleId, req) {
        const tenantId = req.user.tenantId || req.user.tenant_id;
        return this.rbacService.removeRole(userId, roleId, tenantId);
    }
    async getUserRoles(userId, req) {
        const tenantId = req.user.tenantId || req.user.tenant_id;
        return this.rbacService.getUserRoles(userId, tenantId);
    }
    async getUserPermissions(userId, req) {
        const tenantId = req.user.tenantId || req.user.tenant_id;
        return this.rbacService.getUserPermissions(userId, tenantId);
    }
    async listPermissions() {
        const { Permission } = await Promise.resolve().then(() => __importStar(require('./rbac.service')));
        return Object.values(Permission);
    }
};
exports.RbacController = RbacController;
__decorate([
    (0, common_1.Post)('initialize-roles'),
    (0, audit_decorator_1.Audit)({
        action: 'ROLES_INITIALIZE',
        resourceType: 'system',
    }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RbacController.prototype, "initializeRoles", null);
__decorate([
    (0, common_1.Get)('roles'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RbacController.prototype, "listRoles", null);
__decorate([
    (0, common_1.Post)('roles'),
    (0, audit_decorator_1.Audit)({
        action: 'ROLE_CREATE',
        resourceType: 'role',
        getResourceId: (args) => args[1]?.id,
        getNewData: (args) => ({ name: args[0]?.name, permissions: args[0]?.permissions }),
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [role_dto_1.CreateRoleDto, Object]),
    __metadata("design:returntype", Promise)
], RbacController.prototype, "createRole", null);
__decorate([
    (0, common_1.Put)('roles/:roleId'),
    (0, audit_decorator_1.Audit)({
        action: 'ROLE_UPDATE',
        resourceType: 'role',
        getResourceId: (args) => args[0],
        getOldData: (args) => ({ /* old data would be fetched from service */}),
        getNewData: (args) => args[1],
    }),
    __param(0, (0, common_1.Param)('roleId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, role_dto_1.UpdateRoleDto]),
    __metadata("design:returntype", Promise)
], RbacController.prototype, "updateRole", null);
__decorate([
    (0, common_1.Delete)('roles/:roleId'),
    (0, audit_decorator_1.Audit)({
        action: 'ROLE_DELETE',
        resourceType: 'role',
        getResourceId: (args) => args[0],
    }),
    __param(0, (0, common_1.Param)('roleId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RbacController.prototype, "deleteRole", null);
__decorate([
    (0, common_1.Get)('users'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RbacController.prototype, "listUsers", null);
__decorate([
    (0, common_1.Post)('users/:userId/roles'),
    (0, audit_decorator_1.Audit)({
        action: 'USER_ROLE_ASSIGN',
        resourceType: 'user_role',
        getResourceId: (args) => `${args[0]}-${args[1]?.roleId}`,
        getNewData: (args) => ({ userId: args[0], roleId: args[1]?.roleId }),
    }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, role_dto_1.AssignRoleDto, Object]),
    __metadata("design:returntype", Promise)
], RbacController.prototype, "assignRole", null);
__decorate([
    (0, common_1.Delete)('users/:userId/roles/:roleId'),
    (0, audit_decorator_1.Audit)({
        action: 'USER_ROLE_REMOVE',
        resourceType: 'user_role',
        getResourceId: (args) => `${args[0]}-${args[1]}`,
        getOldData: (args) => ({ userId: args[0], roleId: args[1] }),
    }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Param)('roleId')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], RbacController.prototype, "removeRole", null);
__decorate([
    (0, common_1.Get)('users/:userId/roles'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RbacController.prototype, "getUserRoles", null);
__decorate([
    (0, common_1.Get)('users/:userId/permissions'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RbacController.prototype, "getUserPermissions", null);
__decorate([
    (0, common_1.Get)('permissions'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RbacController.prototype, "listPermissions", null);
exports.RbacController = RbacController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, permissions_decorator_1.RequirePermissions)(rbac_service_1.Permission.ROLE_MANAGE),
    (0, common_1.Controller)('rbac'),
    __metadata("design:paramtypes", [rbac_service_1.RbacService])
], RbacController);
//# sourceMappingURL=rbac.controller.js.map