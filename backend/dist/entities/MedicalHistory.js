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
exports.MedicalHistory = void 0;
const typeorm_1 = require("typeorm");
const AuditableEntity_1 = require("./AuditableEntity");
const Pet_1 = require("./Pet");
const User_1 = require("./User");
const Prescription_1 = require("./Prescription");
let MedicalHistory = class MedicalHistory extends AuditableEntity_1.AuditableEntity {
};
exports.MedicalHistory = MedicalHistory;
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], MedicalHistory.prototype, "visitDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], MedicalHistory.prototype, "reasonForVisit", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], MedicalHistory.prototype, "symptoms", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], MedicalHistory.prototype, "diagnosis", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], MedicalHistory.prototype, "treatment", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], MedicalHistory.prototype, "weight", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 4, scale: 1, nullable: true }),
    __metadata("design:type", Number)
], MedicalHistory.prototype, "temperature", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], MedicalHistory.prototype, "heartRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], MedicalHistory.prototype, "respiratoryRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], MedicalHistory.prototype, "physicalExamNotes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], MedicalHistory.prototype, "labResults", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], MedicalHistory.prototype, "attachments", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], MedicalHistory.prototype, "followUpInstructions", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], MedicalHistory.prototype, "nextVisitDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], MedicalHistory.prototype, "customFields", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], MedicalHistory.prototype, "petId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], MedicalHistory.prototype, "veterinarianId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Pet_1.Pet, pet => pet.medicalHistories),
    (0, typeorm_1.JoinColumn)({ name: 'petId' }),
    __metadata("design:type", Pet_1.Pet)
], MedicalHistory.prototype, "pet", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'veterinarianId' }),
    __metadata("design:type", User_1.User)
], MedicalHistory.prototype, "veterinarian", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Prescription_1.Prescription, prescription => prescription.medicalHistory),
    __metadata("design:type", Array)
], MedicalHistory.prototype, "prescriptions", void 0);
exports.MedicalHistory = MedicalHistory = __decorate([
    (0, typeorm_1.Entity)('medical_histories'),
    (0, typeorm_1.Index)(['petId', 'visitDate']),
    (0, typeorm_1.Index)(['veterinarianId'])
], MedicalHistory);
//# sourceMappingURL=MedicalHistory.js.map