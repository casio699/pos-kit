import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'change-me-in-prod',
    });
  }

  async validate(payload: any) {
    // The payload is already the user data from the JWT token
    return {
      id: payload.sub,
      email: payload.email,
      roles: payload.roles,
      tenant_id: payload.tenant_id,
      tenantId: payload.tenant_id, // Add both for compatibility
    };
  }
}
