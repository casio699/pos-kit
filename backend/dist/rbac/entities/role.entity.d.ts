import { User } from '../../auth/entities/user.entity';
export declare class Tenant {
    id: string;
    name: string;
    domain: string;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
}
export declare class Role {
    id: string;
    tenant_id: string;
    name: string;
    description: string;
    permissions: string[];
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
    tenant: Tenant;
}
export declare class UserRole {
    id: string;
    user_id: string;
    role_id: string;
    tenant_id: string;
    is_active: boolean;
    assigned_at: Date;
    user: User;
    role: Role;
}
//# sourceMappingURL=role.entity.d.ts.map