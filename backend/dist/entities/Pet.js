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
exports.Pet = exports.PetGender = exports.PetSpecies = void 0;
const typeorm_1 = require("typeorm");
const AuditableEntity_1 = require("./AuditableEntity");
const User_1 = require("./User");
const MedicalHistory_1 = require("./MedicalHistory");
const Appointment_1 = require("./Appointment");
const Vaccination_1 = require("./Vaccination");
const Hospitalization_1 = require("./Hospitalization");
const Consent_1 = require("./Consent");
var PetSpecies;
(function (PetSpecies) {
    PetSpecies["DOG"] = "dog";
    PetSpecies["CAT"] = "cat";
    PetSpecies["BIRD"] = "bird";
    PetSpecies["RABBIT"] = "rabbit";
    PetSpecies["HAMSTER"] = "hamster";
    PetSpecies["GUINEA_PIG"] = "guinea_pig";
    PetSpecies["REPTILE"] = "reptile";
    PetSpecies["OTHER"] = "other";
})(PetSpecies || (exports.PetSpecies = PetSpecies = {}));
var PetGender;
(function (PetGender) {
    PetGender["MALE"] = "male";
    PetGender["FEMALE"] = "female";
})(PetGender || (exports.PetGender = PetGender = {}));
let Pet = class Pet extends AuditableEntity_1.AuditableEntity {
    getAge() {
        if (!this.birthDate)
            return null;
        const today = new Date();
        const birthDate = new Date(this.birthDate);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }
};
exports.Pet = Pet;
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Pet.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        default: PetSpecies.OTHER
    }),
    __metadata("design:type", String)
], Pet.prototype, "species", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Pet.prototype, "breed", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Pet.prototype, "birthDate", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        nullable: true
    }),
    __metadata("design:type", String)
], Pet.prototype, "gender", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Pet.prototype, "weight", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Pet.prototype, "color", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Pet.prototype, "microchipNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Pet.prototype, "isNeutered", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Pet.prototype, "allergies", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Pet.prototype, "specialConditions", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Pet.prototype, "profilePicture", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], Pet.prototype, "customFields", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], Pet.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Pet.prototype, "ownerId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, user => user.pets),
    (0, typeorm_1.JoinColumn)({ name: 'ownerId' }),
    __metadata("design:type", User_1.User)
], Pet.prototype, "owner", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => MedicalHistory_1.MedicalHistory, history => history.pet),
    __metadata("design:type", Array)
], Pet.prototype, "medicalHistories", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Appointment_1.Appointment, appointment => appointment.pet),
    __metadata("design:type", Array)
], Pet.prototype, "appointments", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Vaccination_1.Vaccination, vaccination => vaccination.pet),
    __metadata("design:type", Array)
], Pet.prototype, "vaccinations", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Hospitalization_1.Hospitalization, hospitalization => hospitalization.pet),
    __metadata("design:type", Array)
], Pet.prototype, "hospitalizations", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Consent_1.Consent, consent => consent.pet),
    __metadata("design:type", Array)
], Pet.prototype, "consents", void 0);
exports.Pet = Pet = __decorate([
    (0, typeorm_1.Entity)('pets'),
    (0, typeorm_1.Index)(['ownerId']),
    (0, typeorm_1.Index)(['species'])
], Pet);
//# sourceMappingURL=Pet.js.map