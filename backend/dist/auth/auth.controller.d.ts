import { AuthService } from './auth.service';
export declare class AuthController {
    private authService;
    private readonly logger;
    constructor(authService: AuthService);
    register(body: any): Promise<import("./entities/user.entity").User>;
    login(body: {
        email: string;
        password: string;
    }): Promise<{
        access_token: string;
        refresh_token: string;
        user: import("./entities/user.entity").User;
    }>;
    getProfile(req: any): Promise<any>;
}
//# sourceMappingURL=auth.controller.d.ts.map