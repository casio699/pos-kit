import { Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';
export declare class UsersService {
    private userRepository;
    constructor(userRepository: Repository<User>);
    getUsersByTenant(tenant_id: string): Promise<User[]>;
    createUser(tenant_id: string, createUserDto: any): Promise<User>;
    updateUser(tenant_id: string, id: string, updateUserDto: any): Promise<User>;
    deleteUser(tenant_id: string, id: string): Promise<void>;
}
//# sourceMappingURL=users.service.d.ts.map