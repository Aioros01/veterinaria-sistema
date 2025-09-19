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
exports.Appointment = exports.AppointmentType = exports.AppointmentStatus = void 0;
const typeorm_1 = require("typeorm");
const AuditableEntity_1 = require("./AuditableEntity");
const Pet_1 = require("./Pet");
const User_1 = require("./User");
var AppointmentStatus;
(function (AppointmentStatus) {
    AppointmentStatus["SCHEDULED"] = "scheduled";
    AppointmentStatus["CONFIRMED"] = "confirmed";
    AppointmentStatus["IN_PROGRESS"] = "in_progress";
    AppointmentStatus["COMPLETED"] = "completed";
    AppointmentStatus["CANCELLED"] = "cancelled";
    AppointmentStatus["NO_SHOW"] = "no_show";
})(AppointmentStatus || (exports.AppointmentStatus = AppointmentStatus = {}));
var AppointmentType;
(function (AppointmentType) {
    AppointmentType["CONSULTATION"] = "consultation";
    AppointmentType["VACCINATION"] = "vaccination";
    AppointmentType["SURGERY"] = "surgery";
    AppointmentType["GROOMING"] = "grooming";
    AppointmentType["CHECKUP"] = "checkup";
    AppointmentType["EMERGENCY"] = "emergency";
    AppointmentType["OTHER"] = "other";
})(AppointmentType || (exports.AppointmentType = AppointmentType = {}));
let Appointment = class Appointment extends AuditableEntity_1.AuditableEntity {
    getDuration() {
        const start = new Date(`2000-01-01T${this.startTime}`);
        const end = new Date(`2000-01-01T${this.endTime}`);
        return (end.getTime() - start.getTime()) / (1000 * 60);
    }
};
exports.Appointment = Appointment;
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], Appointment.prototype, "appointmentDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'time' }),
    __metadata("design:type", String)
], Appointment.prototype, "startTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'time' }),
    __metadata("design:type", String)
], Appointment.prototype, "endTime", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        default: AppointmentType.CONSULTATION
    }),
    __metadata("design:type", String)
], Appointment.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        default: AppointmentStatus.SCHEDULED
    }),
    __metadata("design:type", String)
], Appointment.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Appointment.prototype, "reason", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Appointment.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Appointment.prototype, "reminderSent48h", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Appointment.prototype, "reminderSent24h", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Appointment.prototype, "reminderSent12h", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Appointment.prototype, "estimatedCost", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Appointment.prototype, "actualCost", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], Appointment.prototype, "customFields", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Appointment.prototype, "petId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Appointment.prototype, "veterinarianId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Pet_1.Pet, pet => pet.appointments),
    (0, typeorm_1.JoinColumn)({ name: 'petId' }),
    __metadata("design:type", Pet_1.Pet)
], Appointment.prototype, "pet", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, user => user.veterinarianAppointments),
    (0, typeorm_1.JoinColumn)({ name: 'veterinarianId' }),
    __metadata("design:type", User_1.User)
], Appointment.prototype, "veterinarian", void 0);
exports.Appointment = Appointment = __decorate([
    (0, typeorm_1.Entity)('appointments'),
    (0, typeorm_1.Index)(['appointmentDate', 'status']),
    (0, typeorm_1.Index)(['petId']),
    (0, typeorm_1.Index)(['veterinarianId'])
], Appointment);
//# sourceMappingURL=Appointment.js.map