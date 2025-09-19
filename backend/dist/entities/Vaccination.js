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
exports.Vaccination = void 0;
const typeorm_1 = require("typeorm");
const AuditableEntity_1 = require("./AuditableEntity");
const Pet_1 = require("./Pet");
const User_1 = require("./User");
let Vaccination = class Vaccination extends AuditableEntity_1.AuditableEntity {
    isUpcoming() {
        if (!this.nextDoseDate)
            return false;
        return new Date(this.nextDoseDate) > new Date();
    }
    daysUntilNextDose() {
        if (!this.nextDoseDate)
            return null;
        const today = new Date();
        const nextDose = new Date(this.nextDoseDate);
        const diffTime = nextDose.getTime() - today.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
};
exports.Vaccination = Vaccination;
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Vaccination.prototype, "vaccineName", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Vaccination.prototype, "manufacturer", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Vaccination.prototype, "batchNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], Vaccination.prototype, "vaccinationDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Vaccination.prototype, "expirationDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Vaccination.prototype, "nextDoseDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Vaccination.prototype, "doseNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Vaccination.prototype, "totalDoses", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Vaccination.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Vaccination.prototype, "cost", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Vaccination.prototype, "reminderSent", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Vaccination.prototype, "petId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Vaccination.prototype, "veterinarianId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Pet_1.Pet, pet => pet.vaccinations),
    (0, typeorm_1.JoinColumn)({ name: 'petId' }),
    __metadata("design:type", Pet_1.Pet)
], Vaccination.prototype, "pet", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'veterinarianId' }),
    __metadata("design:type", User_1.User)
], Vaccination.prototype, "veterinarian", void 0);
exports.Vaccination = Vaccination = __decorate([
    (0, typeorm_1.Entity)('vaccinations'),
    (0, typeorm_1.Index)(['petId', 'vaccinationDate']),
    (0, typeorm_1.Index)(['nextDoseDate'])
], Vaccination);
//# sourceMappingURL=Vaccination.js.map