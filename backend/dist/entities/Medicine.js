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
exports.Medicine = exports.MedicineCategory = void 0;
const typeorm_1 = require("typeorm");
const AuditableEntity_1 = require("./AuditableEntity");
var MedicineCategory;
(function (MedicineCategory) {
    MedicineCategory["ANTIBIOTIC"] = "antibiotic";
    MedicineCategory["ANALGESIC"] = "analgesic";
    MedicineCategory["ANTI_INFLAMMATORY"] = "anti_inflammatory";
    MedicineCategory["ANTIPARASITIC"] = "antiparasitic";
    MedicineCategory["VACCINE"] = "vaccine";
    MedicineCategory["VITAMIN"] = "vitamin";
    MedicineCategory["SUPPLEMENT"] = "supplement";
    MedicineCategory["OTHER"] = "other";
})(MedicineCategory || (exports.MedicineCategory = MedicineCategory = {}));
let Medicine = class Medicine extends AuditableEntity_1.AuditableEntity {
    isLowStock() {
        return this.currentStock <= this.minimumStock;
    }
    isExpiringSoon(daysThreshold = 30) {
        if (!this.expirationDate)
            return false;
        const today = new Date();
        const expDate = new Date(this.expirationDate);
        const diffTime = expDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= daysThreshold && diffDays > 0;
    }
    isExpired() {
        if (!this.expirationDate)
            return false;
        return new Date(this.expirationDate) < new Date();
    }
};
exports.Medicine = Medicine;
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], Medicine.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Medicine.prototype, "genericName", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Medicine.prototype, "manufacturer", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        default: MedicineCategory.OTHER
    }),
    __metadata("design:type", String)
], Medicine.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Medicine.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Medicine.prototype, "presentation", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Medicine.prototype, "concentration", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Medicine.prototype, "unitPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', default: 0 }),
    __metadata("design:type", Number)
], Medicine.prototype, "currentStock", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', default: 10 }),
    __metadata("design:type", Number)
], Medicine.prototype, "minimumStock", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', default: 100 }),
    __metadata("design:type", Number)
], Medicine.prototype, "maximumStock", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Medicine.prototype, "supplier", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Medicine.prototype, "supplierContact", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Medicine.prototype, "expirationDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Medicine.prototype, "batchNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Medicine.prototype, "storageConditions", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Medicine.prototype, "contraindications", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Medicine.prototype, "sideEffects", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], Medicine.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], Medicine.prototype, "customFields", void 0);
exports.Medicine = Medicine = __decorate([
    (0, typeorm_1.Entity)('medicines'),
    (0, typeorm_1.Index)(['name']),
    (0, typeorm_1.Index)(['category'])
], Medicine);
//# sourceMappingURL=Medicine.js.map