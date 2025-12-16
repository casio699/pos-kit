import { Controller, Post, Body, HttpCode, Get, UseGuards, Request, BadRequestException, ConflictException, InternalServerErrorException, UnauthorizedException, Logger } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Audit } from '../audit/decorators/audit.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private authService: AuthService) {}

  @Post('register')
  @Audit({
    action: 'USER_REGISTER',
    resourceType: 'user',
    getNewData: (args) => ({ email: args[0]?.email, tenant_id: args[0]?.tenant_id }),
  })
  async register(@Body() body: any) {
    this.logger.log(`Registration attempt for email: ${body.email}, tenant_id: ${body.tenant_id}, role: ${body.role}`);
    
    try {
      // Validate required fields
      if (!body.email || !body.password || !body.first_name || !body.last_name || !body.tenant_id || !body.role) {
        this.logger.warn(`Missing required fields for registration. Email: ${body.email}`);
        throw new BadRequestException('All fields are required: email, password, first_name, last_name, tenant_id, role');
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(body.email)) {
        this.logger.warn(`Invalid email format: ${body.email}`);
        throw new BadRequestException('Invalid email format');
      }

      // Validate password strength
      if (body.password.length < 6) {
        this.logger.warn(`Password too short for email: ${body.email}`);
        throw new BadRequestException('Password must be at least 6 characters long');
      }

      // Validate UUID format for tenant_id
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(body.tenant_id)) {
        this.logger.warn(`Invalid tenant_id format: ${body.tenant_id}`);
        throw new BadRequestException('Invalid tenant_id format. Expected UUID');
      }

      // Validate name fields
      if (body.first_name.trim().length === 0 || body.last_name.trim().length === 0) {
        this.logger.warn(`Empty name fields for email: ${body.email}`);
        throw new BadRequestException('First name and last name cannot be empty');
      }

      const validRoles = ['cashier', 'manager', 'admin', 'user'];
      if (!validRoles.includes(body.role)) {
        this.logger.warn(`Invalid role specified: ${body.role}`);
        throw new BadRequestException(`Invalid role. Must be one of: ${validRoles.join(', ')}`);
      }

      const result = await this.authService.register(
        body.tenant_id,
        body.email,
        body.password,
        body.first_name,
        body.last_name,
        body.role,
      );
      
      this.logger.log(`Successfully registered user with email: ${body.email}`);
      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Registration failed for email: ${body.email}`, errorStack);
      
      // Handle specific database errors
      if (error && typeof error === 'object' && 'code' in error && error.code === '23505') { // PostgreSQL unique violation
        if (error && typeof error === 'object' && 'detail' in error && typeof error.detail === 'string' && error.detail.includes('email')) {
          throw new ConflictException('User with this email already exists');
        }
        if (error && typeof error === 'object' && 'detail' in error && typeof error.detail === 'string' && error.detail.includes('tenant_id')) {
          throw new ConflictException('Tenant ID already exists');
        }
      }
      
      // Re-throw NestJS exceptions
      if (error instanceof BadRequestException || error instanceof ConflictException) {
        throw error;
      }
      
      // Handle other errors
      throw new InternalServerErrorException('Registration failed due to an internal server error');
    }
  }

  @Post('login')
  @HttpCode(200)
  @Audit({
    action: 'USER_LOGIN',
    resourceType: 'user',
    getNewData: (args) => ({ email: args[0]?.email }),
  })
  async login(@Body() body: { email: string; password: string }) {
    this.logger.log(`Login attempt for email: ${body.email}`);
    
    try {
      // Validate required fields
      if (!body.email || !body.password) {
        this.logger.warn(`Missing email or password for login`);
        throw new BadRequestException('Email and password are required');
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(body.email)) {
        this.logger.warn(`Invalid email format for login: ${body.email}`);
        throw new BadRequestException('Invalid email format');
      }

      const result = await this.authService.login(body.email, body.password);
      this.logger.log(`Successfully logged in user with email: ${body.email}`);
      return result;

    } catch (error) {
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Login failed for email: ${body.email}`, errorStack);
      
      // Re-throw NestJS exceptions
      if (error instanceof BadRequestException || error instanceof UnauthorizedException) {
        throw error;
      }
      
      // Handle other errors
      throw new InternalServerErrorException('Login failed due to an internal server error');
    }
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req: any) {
    return req.user;
  }

  }
