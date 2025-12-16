export interface AuthenticatedRequest extends Request {
    user: {
        id: string;
        email: string;
        roles: string[];
        tenant_id: string;
    };
}
//# sourceMappingURL=request.types.d.ts.map