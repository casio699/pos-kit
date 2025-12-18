import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getUsers(req: any): Promise<import("../auth/entities/user.entity").User[]>;
    createUser(req: any, createUserDto: any): Promise<import("../auth/entities/user.entity").User>;
    updateUser(req: any, id: string, updateUserDto: any): Promise<import("../auth/entities/user.entity").User>;
    deleteUser(req: any, id: string): Promise<void>;
}
//# sourceMappingURL=users.controller.d.ts.map