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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = __importStar(require("bcrypt"));
const user_entity_1 = require("./entities/user.entity");
const rbac_service_1 = require("../rbac/rbac.service");
let AuthService = class AuthService {
    constructor(userRepo, jwtService, rbacService) {
        this.userRepo = userRepo;
        this.jwtService = jwtService;
        this.rbacService = rbacService;
    }
    async register(tenant_id, email, password, first_name, last_name, role) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = this.userRepo.create({
            tenant_id,
            email,
            password_hash: hashedPassword,
            first_name,
            last_name,
            roles: ['user'],
        });
        const savedUser = await this.userRepo.save(user);
        // Assign the selected role to new users
        try {
            console.log(`Attempting to assign role: ${role} for tenant: ${tenant_id}`);
            const selectedRole = await this.rbacService.getRoleByName(role, tenant_id);
            console.log(`Found role: ${selectedRole ? selectedRole.name : 'null'}`);
            if (selectedRole) {
                await this.rbacService.assignRole(savedUser.id, selectedRole.id, tenant_id);
                console.log(`Successfully assigned role ${role} to user ${savedUser.id}`);
            }
            else {
                console.log(`Role ${role} not found, initializing default roles`);
                await this.rbacService.initializeDefaultRoles(tenant_id);
                const selectedRole = await this.rbacService.getRoleByName(role, tenant_id);
                console.log(`After initialization, found role: ${selectedRole ? selectedRole.name : 'null'}`);
                if (selectedRole) {
                    await this.rbacService.assignRole(savedUser.id, selectedRole.id, tenant_id);
                    console.log(`Successfully assigned role ${role} to user ${savedUser.id} after initialization`);
                }
            }
        }
        catch (error) {
            console.error(`Error assigning role ${role} to user ${savedUser.id}:`, error);
            // If roles aren't initialized, initialize them first
            await this.rbacService.initializeDefaultRoles(tenant_id);
            const selectedRole = await this.rbacService.getRoleByName(role, tenant_id);
            if (selectedRole) {
                await this.rbacService.assignRole(savedUser.id, selectedRole.id, tenant_id);
            }
        }
        return savedUser;
    }
    async login(email, password) {
        const user = await this.userRepo.findOne({ where: { email } });
        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        // Get proper RBAC roles for the user
        const userRoles = await this.rbacService.getUserRoles(user.id, user.tenant_id);
        const roleNames = userRoles.map(role => role.name);
        const payload = { sub: user.id, email: user.email, roles: roleNames, tenant_id: user.tenant_id };
        const access_token = this.jwtService.sign(payload);
        const refresh_token = this.jwtService.sign(payload, { expiresIn: '7d' });
        // Update user object with proper roles for response
        user.roles = roleNames;
        return { access_token, refresh_token, user };
    }
    async validateUser(userId) {
        return this.userRepo.findOne({ where: { id: userId } });
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        jwt_1.JwtService,
        rbac_service_1.RbacService])
], AuthService);
//# sourceMappingURL=auth.service.js.map