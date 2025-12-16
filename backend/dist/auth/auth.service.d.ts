import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { RbacService } from '../rbac/rbac.service';
export declare class AuthService {
    private userRepo;
    private jwtService;
    private rbacService;
    constructor(userRepo: Repository<User>, jwtService: JwtService, rbacService: RbacService);
    register(tenant_id: string, email: string, password: string, first_name: string, last_name: string): Promise<User>;
    login(email: string, password: string): Promise<{
        access_token: string;
        refresh_token: string;
        user: User;
    }>;
    validateUser(userId: string): Promise<User | null>;
}
//# sourceMappingURL=auth.service.d.ts.map