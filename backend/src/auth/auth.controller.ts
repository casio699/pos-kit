import { Controller, Post, Body, HttpCode, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Audit } from '../audit/decorators/audit.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @Audit({
    action: 'USER_REGISTER',
    resourceType: 'user',
    getNewData: (args) => ({ email: args[0]?.email, tenant_id: args[0]?.tenant_id }),
  })
  async register(@Body() body: any) {
    return this.authService.register(
      body.tenant_id,
      body.email,
      body.password,
      body.first_name,
      body.last_name,
    );
  }

  @Post('login')
  @HttpCode(200)
  @Audit({
    action: 'USER_LOGIN',
    resourceType: 'user',
    getNewData: (args) => ({ email: args[0]?.email }),
  })
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req: any) {
    return req.user;
  }
}
