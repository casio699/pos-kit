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

  async register(tenant_id: string, email: string, password: string, first_name: string, last_name: string, role: string) {
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
      } else {
        console.log(`Role ${role} not found, initializing default roles`);
        await this.rbacService.initializeDefaultRoles(tenant_id);
        const selectedRole = await this.rbacService.getRoleByName(role, tenant_id);
        console.log(`After initialization, found role: ${selectedRole ? selectedRole.name : 'null'}`);
        if (selectedRole) {
          await this.rbacService.assignRole(savedUser.id, selectedRole.id, tenant_id);
          console.log(`Successfully assigned role ${role} to user ${savedUser.id} after initialization`);
        }
      }
    } catch (error) {
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
