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
exports.HospitalizationMedication = void 0;
const typeorm_1 = require("typeorm");
const AuditableEntity_1 = require("./AuditableEntity");
const Hospitalization_1 = require("./Hospitalization");
let HospitalizationMedication = class HospitalizationMedication extends AuditableEntity_1.AuditableEntity {
};
exports.HospitalizationMedication = HospitalizationMedication;
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], HospitalizationMedication.prototype, "medicationName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], HospitalizationMedication.prototype, "dosage", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], HospitalizationMedication.prototype, "frequency", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], HospitalizationMedication.prototype, "route", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], HospitalizationMedication.prototype, "lastAdministered", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], HospitalizationMedication.prototype, "nextDue", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Array)
], HospitalizationMedication.prototype, "administrationLog", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], HospitalizationMedication.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], HospitalizationMedication.prototype, "hospitalizationId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Hospitalization_1.Hospitalization, hospitalization => hospitalization.medications),
    (0, typeorm_1.JoinColumn)({ name: 'hospitalizationId' }),
    __metadata("design:type", Hospitalization_1.Hospitalization)
], HospitalizationMedication.prototype, "hospitalization", void 0);
exports.HospitalizationMedication = HospitalizationMedication = __decorate([
    (0, typeorm_1.Entity)('hospitalization_medications')
], HospitalizationMedication);
//# sourceMappingURL=HospitalizationMedication.js.map