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
exports.Prescription = exports.PurchaseStatus = void 0;
const typeorm_1 = require("typeorm");
const AuditableEntity_1 = require("./AuditableEntity");
const MedicalHistory_1 = require("./MedicalHistory");
const Medicine_1 = require("./Medicine");
var PurchaseStatus;
(function (PurchaseStatus) {
    PurchaseStatus["PENDING"] = "pending";
    PurchaseStatus["PURCHASED_IN_CLINIC"] = "purchased_in_clinic";
    PurchaseStatus["PURCHASED_EXTERNAL"] = "purchased_external";
    PurchaseStatus["NOT_PURCHASED"] = "not_purchased"; // No comprado
})(PurchaseStatus || (exports.PurchaseStatus = PurchaseStatus = {}));
let Prescription = class Prescription extends AuditableEntity_1.AuditableEntity {
};
exports.Prescription = Prescription;
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Prescription.prototype, "medicineName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], Prescription.prototype, "dosage", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Prescription.prototype, "frequency", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Prescription.prototype, "duration", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Prescription.prototype, "instructions", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], Prescription.prototype, "startDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Prescription.prototype, "endDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], Prescription.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Prescription.prototype, "cost", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        default: PurchaseStatus.PENDING
    }),
    __metadata("design:type", String)
], Prescription.prototype, "purchaseStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', default: 1 }),
    __metadata("design:type", Number)
], Prescription.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Prescription.prototype, "externalPharmacy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Prescription.prototype, "purchaseDate", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Prescription.prototype, "medicalHistoryId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Prescription.prototype, "medicineId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => MedicalHistory_1.MedicalHistory, history => history.prescriptions),
    (0, typeorm_1.JoinColumn)({ name: 'medicalHistoryId' }),
    __metadata("design:type", MedicalHistory_1.MedicalHistory)
], Prescription.prototype, "medicalHistory", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Medicine_1.Medicine),
    (0, typeorm_1.JoinColumn)({ name: 'medicineId' }),
    __metadata("design:type", Medicine_1.Medicine)
], Prescription.prototype, "medicine", void 0);
exports.Prescription = Prescription = __decorate([
    (0, typeorm_1.Entity)('prescriptions'),
    (0, typeorm_1.Index)(['medicalHistoryId'])
], Prescription);
//# sourceMappingURL=Prescription.js.map