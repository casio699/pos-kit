export declare class CreateRoleDto {
    name: string;
    description?: string;
    permissions: string[];
}
export declare class UpdateRoleDto {
    name?: string;
    description?: string;
    permissions?: string[];
    is_active?: boolean;
}
export declare class AssignRoleDto {
    roleId: string;
}
//# sourceMappingURL=role.dto.d.ts.map