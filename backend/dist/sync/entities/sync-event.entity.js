"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncEvent = exports.SyncStatus = exports.SyncEventType = void 0;
const typeorm_1 = require("typeorm");
var SyncEventType;
(function (SyncEventType) {
    SyncEventType["CREATE"] = "create";
    SyncEventType["UPDATE"] = "update";
    SyncEventType["DELETE"] = "delete";
})(SyncEventType || (exports.SyncEventType = SyncEventType = {}));
var SyncStatus;
(function (SyncStatus) {
    SyncStatus["PENDING"] = "pending";
    SyncStatus["IN_PROGRESS"] = "in_progress";
    SyncStatus["COMPLETED"] = "completed";
    SyncStatus["FAILED"] = "failed";
})(SyncStatus || (exports.SyncStatus = SyncStatus = {}));
let SyncEvent = class SyncEvent {
};
exports.SyncEvent = SyncEvent;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], SyncEvent.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid'),
    __metadata("design:type", String)
], SyncEvent.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid'),
    __metadata("design:type", String)
], SyncEvent.prototype, "tenant_id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: SyncEventType,
    }),
    __metadata("design:type", String)
], SyncEvent.prototype, "event_type", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], SyncEvent.prototype, "resource_type", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid'),
    __metadata("design:type", String)
], SyncEvent.prototype, "resource_id", void 0);
__decorate([
    (0, typeorm_1.Column)('json'),
    __metadata("design:type", Object)
], SyncEvent.prototype, "data", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: SyncStatus,
        default: SyncStatus.PENDING,
    }),
    __metadata("design:type", String)
], SyncEvent.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], SyncEvent.prototype, "error_message", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], SyncEvent.prototype, "synced_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 1 }),
    __metadata("design:type", Number)
], SyncEvent.prototype, "retry_count", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], SyncEvent.prototype, "created_at", void 0);
exports.SyncEvent = SyncEvent = __decorate([
    (0, typeorm_1.Entity)('sync_events'),
    (0, typeorm_1.Index)(['user_id']),
    (0, typeorm_1.Index)(['tenant_id']),
    (0, typeorm_1.Index)(['status']),
    (0, typeorm_1.Index)(['created_at'])
], SyncEvent);
//# sourceMappingURL=sync-event.entity.js.map