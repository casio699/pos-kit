import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Audit } from '../audit/decorators/audit.decorator';

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
}
