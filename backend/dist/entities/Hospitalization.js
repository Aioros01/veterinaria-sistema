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
exports.Hospitalization = exports.DischargeType = void 0;
const typeorm_1 = require("typeorm");
const AuditableEntity_1 = require("./AuditableEntity");
const Pet_1 = require("./Pet");
const User_1 = require("./User");
const HospitalizationMedication_1 = require("./HospitalizationMedication");
const HospitalizationNote_1 = require("./HospitalizationNote");
var DischargeType;
(function (DischargeType) {
    DischargeType["MEDICAL"] = "medical";
    DischargeType["VOLUNTARY"] = "voluntary";
    DischargeType["DEATH"] = "death";
    DischargeType["TRANSFER"] = "transfer"; // Transferencia
})(DischargeType || (exports.DischargeType = DischargeType = {}));
let Hospitalization = class Hospitalization extends AuditableEntity_1.AuditableEntity {
};
exports.Hospitalization = Hospitalization;
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], Hospitalization.prototype, "admissionDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Hospitalization.prototype, "dischargeDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], Hospitalization.prototype, "diagnosis", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Hospitalization.prototype, "reasonForAdmission", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Hospitalization.prototype, "treatmentPlan", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        nullable: true
    }),
    __metadata("design:type", String)
], Hospitalization.prototype, "dischargeType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Hospitalization.prototype, "dischargeNotes", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], Hospitalization.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Hospitalization.prototype, "petId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Pet_1.Pet, pet => pet.hospitalizations),
    (0, typeorm_1.JoinColumn)({ name: 'petId' }),
    __metadata("design:type", Pet_1.Pet)
], Hospitalization.prototype, "pet", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Hospitalization.prototype, "veterinarianId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'veterinarianId' }),
    __metadata("design:type", User_1.User)
], Hospitalization.prototype, "veterinarian", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => HospitalizationMedication_1.HospitalizationMedication, medication => medication.hospitalization),
    __metadata("design:type", Array)
], Hospitalization.prototype, "medications", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => HospitalizationNote_1.HospitalizationNote, note => note.hospitalization),
    __metadata("design:type", Array)
], Hospitalization.prototype, "notes", void 0);
exports.Hospitalization = Hospitalization = __decorate([
    (0, typeorm_1.Entity)('hospitalizations'),
    (0, typeorm_1.Index)(['petId', 'admissionDate']),
    (0, typeorm_1.Index)(['isActive'])
], Hospitalization);
//# sourceMappingURL=Hospitalization.js.map