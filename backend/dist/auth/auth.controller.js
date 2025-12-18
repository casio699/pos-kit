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
var AuthController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const audit_decorator_1 = require("../audit/decorators/audit.decorator");
const jwt_auth_guard_1 = require("./guards/jwt-auth.guard");
let AuthController = AuthController_1 = class AuthController {
    constructor(authService) {
        this.authService = authService;
        this.logger = new common_1.Logger(AuthController_1.name);
    }
    async register(body) {
        this.logger.log(`Registration attempt for email: ${body.email}, tenant_id: ${body.tenant_id}, role: ${body.role}`);
        try {
            // Validate required fields
            if (!body.email || !body.password || !body.first_name || !body.last_name || !body.tenant_id || !body.role) {
                this.logger.warn(`Missing required fields for registration. Email: ${body.email}`);
                throw new common_1.BadRequestException('All fields are required: email, password, first_name, last_name, tenant_id, role');
            }
            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(body.email)) {
                this.logger.warn(`Invalid email format: ${body.email}`);
                throw new common_1.BadRequestException('Invalid email format');
            }
            // Validate password strength
            if (body.password.length < 6) {
                this.logger.warn(`Password too short for email: ${body.email}`);
                throw new common_1.BadRequestException('Password must be at least 6 characters long');
            }
            // Validate UUID format for tenant_id
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
            if (!uuidRegex.test(body.tenant_id)) {
                this.logger.warn(`Invalid tenant_id format: ${body.tenant_id}`);
                throw new common_1.BadRequestException('Invalid tenant_id format. Expected UUID');
            }
            // Validate name fields
            if (body.first_name.trim().length === 0 || body.last_name.trim().length === 0) {
                this.logger.warn(`Empty name fields for email: ${body.email}`);
                throw new common_1.BadRequestException('First name and last name cannot be empty');
            }
            const validRoles = ['cashier', 'manager', 'admin', 'user'];
            if (!validRoles.includes(body.role)) {
                this.logger.warn(`Invalid role specified: ${body.role}`);
                throw new common_1.BadRequestException(`Invalid role. Must be one of: ${validRoles.join(', ')}`);
            }
            const result = await this.authService.register(body.tenant_id, body.email, body.password, body.first_name, body.last_name, body.role);
            this.logger.log(`Successfully registered user with email: ${body.email}`);
            return result;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            const errorStack = error instanceof Error ? error.stack : undefined;
            this.logger.error(`Registration failed for email: ${body.email}`, errorStack);
            // Handle specific database errors
            if (error && typeof error === 'object' && 'code' in error && error.code === '23505') { // PostgreSQL unique violation
                if (error && typeof error === 'object' && 'detail' in error && typeof error.detail === 'string' && error.detail.includes('email')) {
                    throw new common_1.ConflictException('User with this email already exists');
                }
                if (error && typeof error === 'object' && 'detail' in error && typeof error.detail === 'string' && error.detail.includes('tenant_id')) {
                    throw new common_1.ConflictException('Tenant ID already exists');
                }
            }
            // Re-throw NestJS exceptions
            if (error instanceof common_1.BadRequestException || error instanceof common_1.ConflictException) {
                throw error;
            }
            // Handle other errors
            throw new common_1.InternalServerErrorException('Registration failed due to an internal server error');
        }
    }
    async login(body) {
        this.logger.log(`Login attempt for email: ${body.email}`);
        try {
            // Validate required fields
            if (!body.email || !body.password) {
                this.logger.warn(`Missing email or password for login`);
                throw new common_1.BadRequestException('Email and password are required');
            }
            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(body.email)) {
                this.logger.warn(`Invalid email format for login: ${body.email}`);
                throw new common_1.BadRequestException('Invalid email format');
            }
            const result = await this.authService.login(body.email, body.password);
            this.logger.log(`Successfully logged in user with email: ${body.email}`);
            return result;
        }
        catch (error) {
            const errorStack = error instanceof Error ? error.stack : undefined;
            this.logger.error(`Login failed for email: ${body.email}`, errorStack);
            // Re-throw NestJS exceptions
            if (error instanceof common_1.BadRequestException || error instanceof common_1.UnauthorizedException) {
                throw error;
            }
            // Handle other errors
            throw new common_1.InternalServerErrorException('Login failed due to an internal server error');
        }
    }
    async getProfile(req) {
        return req.user;
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('register'),
    (0, audit_decorator_1.Audit)({
        action: 'USER_REGISTER',
        resourceType: 'user',
        getNewData: (args) => ({ email: args[0]?.email, tenant_id: args[0]?.tenant_id }),
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('login'),
    (0, common_1.HttpCode)(200),
    (0, audit_decorator_1.Audit)({
        action: 'USER_LOGIN',
        resourceType: 'user',
        getNewData: (args) => ({ email: args[0]?.email }),
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getProfile", null);
exports.AuthController = AuthController = AuthController_1 = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map