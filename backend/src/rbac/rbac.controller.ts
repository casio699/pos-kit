import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from './guards/permissions.guard';
import { RequirePermissions } from './decorators/permissions.decorator';
import { RbacService, DefaultRole, Permission } from './rbac.service';
import { Role } from './entities/role.entity';
import { User } from '../auth/entities/user.entity';
import { CreateRoleDto, UpdateRoleDto, AssignRoleDto } from './dto/role.dto';

interface UserWithRoles extends Omit<User, 'roles'> {
  roles: Role[];
}

@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermissions(Permission.ROLE_MANAGE)
@Controller('rbac')
export class RbacController {
  constructor(private readonly rbacService: RbacService) {}

  @Post('initialize-roles')
  async initializeRoles(@Request() req: any) {
    const tenantId = req.user.tenantId || req.user.tenant_id;
    console.log('RBAC: Received tenantId:', tenantId);
    console.log('RBAC: User object:', req.user);
    await this.rbacService.initializeDefaultRoles(tenantId);
    return { message: 'Default roles initialized successfully' };
  }

  @Get('roles')
  async listRoles(@Request() req: any): Promise<Role[]> {
    const tenantId = req.user.tenantId || req.user.tenant_id;
    return this.rbacService.listRoles(tenantId);
  }

  @Post('roles')
  async createRole(@Body() createRoleDto: CreateRoleDto, @Request() req: any): Promise<Role> {
    const tenantId = req.user.tenantId || req.user.tenant_id;
    return this.rbacService.createRole(createRoleDto, tenantId);
  }

  @Put('roles/:roleId')
  async updateRole(
    @Param('roleId') roleId: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ): Promise<Role> {
    return this.rbacService.updateRole(roleId, updateRoleDto);
  }

  @Delete('roles/:roleId')
  async deleteRole(@Param('roleId') roleId: string): Promise<void> {
    return this.rbacService.deleteRole(roleId);
  }

  @Get('users')
  async listUsers(@Request() req: any): Promise<UserWithRoles[]> {
    const tenantId = req.user.tenantId || req.user.tenant_id;
    const users = await this.rbacService.listUsers(tenantId);
    
    // Add roles to each user
    const usersWithRoles = await Promise.all(
      users.map(async (user) => {
        const userRoles = await this.rbacService.getUserRoles(user.id, tenantId);
        return {
          ...user,
          roles: userRoles,
        };
      })
    );

    return usersWithRoles;
  }

  @Post('users/:userId/roles')
  async assignRole(
    @Param('userId') userId: string,
    @Body() assignRoleDto: AssignRoleDto,
    @Request() req: any,
  ) {
    const tenantId = req.user.tenantId || req.user.tenant_id;
    return this.rbacService.assignRole(userId, assignRoleDto.roleId, tenantId);
  }

  @Delete('users/:userId/roles/:roleId')
  async removeRole(
    @Param('userId') userId: string,
    @Param('roleId') roleId: string,
    @Request() req: any,
  ) {
    const tenantId = req.user.tenantId || req.user.tenant_id;
    return this.rbacService.removeRole(userId, roleId, tenantId);
  }

  @Get('users/:userId/roles')
  async getUserRoles(
    @Param('userId') userId: string,
    @Request() req: any,
  ): Promise<Role[]> {
    const tenantId = req.user.tenantId || req.user.tenant_id;
    return this.rbacService.getUserRoles(userId, tenantId);
  }

  @Get('users/:userId/permissions')
  async getUserPermissions(
    @Param('userId') userId: string,
    @Request() req: any,
  ) {
    const tenantId = req.user.tenantId || req.user.tenant_id;
    return this.rbacService.getUserPermissions(userId, tenantId);
  }

  @Get('permissions')
  async listPermissions() {
    const { Permission } = await import('./rbac.service');
    return Object.values(Permission);
  }
}
