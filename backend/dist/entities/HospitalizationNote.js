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
exports.HospitalizationNote = void 0;
const typeorm_1 = require("typeorm");
const AuditableEntity_1 = require("./AuditableEntity");
const Hospitalization_1 = require("./Hospitalization");
const User_1 = require("./User");
let HospitalizationNote = class HospitalizationNote extends AuditableEntity_1.AuditableEntity {
};
exports.HospitalizationNote = HospitalizationNote;
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], HospitalizationNote.prototype, "note", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], HospitalizationNote.prototype, "vitalSigns", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], HospitalizationNote.prototype, "hospitalizationId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Hospitalization_1.Hospitalization, hospitalization => hospitalization.notes),
    (0, typeorm_1.JoinColumn)({ name: 'hospitalizationId' }),
    __metadata("design:type", Hospitalization_1.Hospitalization)
], HospitalizationNote.prototype, "hospitalization", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], HospitalizationNote.prototype, "authorId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'authorId' }),
    __metadata("design:type", User_1.User)
], HospitalizationNote.prototype, "author", void 0);
exports.HospitalizationNote = HospitalizationNote = __decorate([
    (0, typeorm_1.Entity)('hospitalization_notes')
], HospitalizationNote);
//# sourceMappingURL=HospitalizationNote.js.map