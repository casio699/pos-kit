import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role, UserRole } from './entities/role.entity';
import { User } from '../auth/entities/user.entity';

export enum Permission {
  // Products
  PRODUCT_READ = 'product:read',
  PRODUCT_CREATE = 'product:create',
  PRODUCT_UPDATE = 'product:update',
  PRODUCT_DELETE = 'product:delete',
  
  // Inventory
  INVENTORY_READ = 'inventory:read',
  INVENTORY_ADJUST = 'inventory:adjust',
  INVENTORY_TRANSFER = 'inventory:transfer',
  
  // Sales
  SALE_READ = 'sale:read',
  SALE_CREATE = 'sale:create',
  SALE_UPDATE = 'sale:update',
  SALE_DELETE = 'sale:delete',
  SALE_REFUND = 'sale:refund',
  
  // Users & Roles
  USER_READ = 'user:read',
  USER_CREATE = 'user:create',
  USER_UPDATE = 'user:update',
  USER_DELETE = 'user:delete',
  ROLE_MANAGE = 'role:manage',
  
  // Reports
  REPORT_READ = 'report:read',
  REPORT_EXPORT = 'report:export',
  
  // Settings
  SETTINGS_READ = 'settings:read',
  SETTINGS_UPDATE = 'settings:update',
  
  // Admin
  ADMIN_FULL = 'admin:full',
}

export enum DefaultRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  CASHIER = 'cashier',
  VIEWER = 'viewer',
}

@Injectable()
export class RbacService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(UserRole)
    private userRoleRepository: Repository<UserRole>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getDefaultRoles(): Promise<Omit<Role, 'id'>[]> {
    return [
      {
        tenant_id: '',
        name: DefaultRole.ADMIN,
        description: 'Full system access',
        permissions: Object.values(Permission),
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
        tenant: null as any,
      },
      {
        tenant_id: '',
        name: DefaultRole.MANAGER,
        description: 'Can manage products, inventory, and sales',
        permissions: [
          Permission.PRODUCT_READ,
          Permission.PRODUCT_CREATE,
          Permission.PRODUCT_UPDATE,
          Permission.INVENTORY_READ,
          Permission.INVENTORY_ADJUST,
          Permission.INVENTORY_TRANSFER,
          Permission.SALE_READ,
          Permission.SALE_CREATE,
          Permission.SALE_UPDATE,
          Permission.SALE_REFUND,
          Permission.REPORT_READ,
          Permission.REPORT_EXPORT,
          Permission.SETTINGS_READ,
        ],
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
        tenant: null as any,
      },
      {
        tenant_id: '',
        name: DefaultRole.CASHIER,
        description: 'Can process sales and view inventory',
        permissions: [
          Permission.PRODUCT_READ,
          Permission.INVENTORY_READ,
          Permission.SALE_READ,
          Permission.SALE_CREATE,
          Permission.SALE_UPDATE,
        ],
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
        tenant: null as any,
      },
      {
        tenant_id: '',
        name: DefaultRole.VIEWER,
        description: 'Read-only access',
        permissions: [
          Permission.PRODUCT_READ,
          Permission.INVENTORY_READ,
          Permission.SALE_READ,
          Permission.REPORT_READ,
        ],
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
        tenant: null as any,
      },
    ];
  }

  async initializeDefaultRoles(tenantId: string): Promise<void> {
    // First, ensure the tenant exists
    await this.ensureTenantExists(tenantId);
    
    const defaultRoles = await this.getDefaultRoles();
    
    for (const roleTemplate of defaultRoles) {
      const existingRole = await this.roleRepository.findOne({
        where: { name: roleTemplate.name, tenant_id: tenantId },
      });
      
      if (!existingRole) {
        const role = this.roleRepository.create({
          name: roleTemplate.name,
          description: roleTemplate.description,
          permissions: roleTemplate.permissions,
          is_active: roleTemplate.is_active,
          tenant_id: tenantId,
        });
        await this.roleRepository.save(role);
      }
    }
  }

  private async ensureTenantExists(tenantId: string): Promise<void> {
    const tenantRepository = this.roleRepository.manager.getRepository('Tenant');
    let tenant = await tenantRepository.findOne({ where: { id: tenantId } });
    
    if (!tenant) {
      tenant = tenantRepository.create({
        id: tenantId,
        name: `Tenant ${tenantId}`,
        is_active: true,
      });
      await tenantRepository.save(tenant);
    }
  }

  async getUserPermissions(userId: string, tenantId: string): Promise<string[]> {
    const userRoles = await this.userRoleRepository.find({
      where: { user_id: userId, tenant_id: tenantId, is_active: true },
      relations: ['role'],
    });

    const permissions = new Set<string>();
    
    for (const userRole of userRoles) {
      if (userRole.role && userRole.role.is_active) {
        userRole.role.permissions.forEach((permission: string) => permissions.add(permission));
      }
    }

    return Array.from(permissions);
  }

  async hasPermission(
    userId: string,
    tenantId: string,
    permission: string,
  ): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId, tenantId);
    return userPermissions.includes(permission) || userPermissions.includes(Permission.ADMIN_FULL);
  }

  async assignRole(userId: string, roleId: string, tenantId: string): Promise<UserRole> {
    const existingAssignment = await this.userRoleRepository.findOne({
      where: { user_id: userId, role_id: roleId, tenant_id: tenantId },
    });

    if (existingAssignment) {
      existingAssignment.is_active = true;
      return this.userRoleRepository.save(existingAssignment);
    }

    const userRole = this.userRoleRepository.create({
      user_id: userId,
      role_id: roleId,
      tenant_id: tenantId,
    });

    return this.userRoleRepository.save(userRole);
  }

  async removeRole(userId: string, roleId: string, tenantId: string): Promise<void> {
    await this.userRoleRepository.update(
      { user_id: userId, role_id: roleId, tenant_id: tenantId },
      { is_active: false },
    );
  }

  async getUserRoles(userId: string, tenantId: string): Promise<Role[]> {
    const userRoles = await this.userRoleRepository.find({
      where: { user_id: userId, tenant_id: tenantId, is_active: true },
      relations: ['role'],
    });

    return userRoles.map(ur => ur.role).filter(Boolean);
  }

  async getRoleByName(name: string, tenantId: string): Promise<Role | null> {
    return this.roleRepository.findOne({
      where: { name, tenant_id: tenantId, is_active: true },
    });
  }

  async listUsers(tenantId: string): Promise<Omit<User, 'roles'>[]> {
    const users = await this.userRepository.find({
      where: { tenant_id: tenantId, is_active: true },
      select: ['id', 'email', 'first_name', 'last_name', 'created_at', 'is_active'],
    });

    return users;
  }

  async createRole(roleData: Partial<Role>, tenantId: string): Promise<Role> {
    const role = this.roleRepository.create({
      ...roleData,
      tenant_id: tenantId,
    });
    return this.roleRepository.save(role);
  }

  async updateRole(roleId: string, updates: Partial<Role>): Promise<Role> {
    await this.roleRepository.update(roleId, updates);
    const role = await this.roleRepository.findOne({ where: { id: roleId } });
    if (!role) {
      throw new Error('Role not found');
    }
    return role;
  }

  async deleteRole(roleId: string): Promise<void> {
    await this.roleRepository.update(roleId, { is_active: false });
  }

  async listRoles(tenantId: string): Promise<Role[]> {
    return this.roleRepository.find({
      where: { tenant_id: tenantId, is_active: true },
      order: { name: 'ASC' },
    });
  }
}
