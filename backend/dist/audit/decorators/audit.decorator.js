"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Audit = exports.AUDIT_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.AUDIT_KEY = 'audit';
const Audit = (options) => (0, common_1.SetMetadata)(exports.AUDIT_KEY, options);
exports.Audit = Audit;
//# sourceMappingURL=audit.decorator.js.map