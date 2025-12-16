import { RbacService, Permission } from './rbac.service';
import { Role } from './entities/role.entity';
import { User } from '../auth/entities/user.entity';
import { CreateRoleDto, UpdateRoleDto, AssignRoleDto } from './dto/role.dto';
interface UserWithRoles extends Omit<User, 'roles'> {
    roles: Role[];
}
export declare class RbacController {
    private readonly rbacService;
    constructor(rbacService: RbacService);
    initializeRoles(req: any): Promise<{
        message: string;
    }>;
    listRoles(req: any): Promise<Role[]>;
    createRole(createRoleDto: CreateRoleDto, req: any): Promise<Role>;
    updateRole(roleId: string, updateRoleDto: UpdateRoleDto): Promise<Role>;
    deleteRole(roleId: string): Promise<void>;
    listUsers(req: any): Promise<UserWithRoles[]>;
    assignRole(userId: string, assignRoleDto: AssignRoleDto, req: any): Promise<import("./entities/role.entity").UserRole>;
    removeRole(userId: string, roleId: string, req: any): Promise<void>;
    getUserRoles(userId: string, req: any): Promise<Role[]>;
    getUserPermissions(userId: string, req: any): Promise<string[]>;
    listPermissions(): Promise<Permission[]>;
}
export {};
//# sourceMappingURL=rbac.controller.d.ts.map