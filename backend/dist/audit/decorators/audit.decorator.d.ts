export declare const AUDIT_KEY = "audit";
export interface AuditOptions {
    action: string;
    resourceType?: string;
    getResourceId?: (args: any[]) => string;
    getOldData?: (args: any[]) => any;
    getNewData?: (args: any[]) => any;
}
export declare const Audit: (options: AuditOptions) => import("@nestjs/common").CustomDecorator<string>;
//# sourceMappingURL=audit.decorator.d.ts.map