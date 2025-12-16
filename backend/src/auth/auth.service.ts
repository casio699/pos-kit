import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { RbacService } from '../rbac/rbac.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    private jwtService: JwtService,
    private rbacService: RbacService,
  ) {}

  async register(tenant_id: string, email: string, password: string, first_name: string, last_name: string) {
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

    // Assign default 'viewer' role to new users
    try {
      const viewerRole = await this.rbacService.getRoleByName('viewer', tenant_id);
      if (viewerRole) {
        await this.rbacService.assignRole(savedUser.id, viewerRole.id, tenant_id);
      }
    } catch (error) {
      // If roles aren't initialized, initialize them first
      await this.rbacService.initializeDefaultRoles(tenant_id);
      const viewerRole = await this.rbacService.getRoleByName('viewer', tenant_id);
      if (viewerRole) {
        await this.rbacService.assignRole(savedUser.id, viewerRole.id, tenant_id);
      }
    }

    return savedUser;
  }

  async login(email: string, password: string) {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      throw new UnauthorizedException('Invalid credentials');
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

  async validateUser(userId: string) {
    return this.userRepo.findOne({ where: { id: userId } });
  }
}
