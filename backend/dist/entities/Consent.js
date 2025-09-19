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
exports.Consent = exports.ConsentStatus = exports.ConsentType = void 0;
const typeorm_1 = require("typeorm");
const AuditableEntity_1 = require("./AuditableEntity");
const Pet_1 = require("./Pet");
const User_1 = require("./User");
const MedicalHistory_1 = require("./MedicalHistory");
const ConsentDocumentHistory_1 = require("./ConsentDocumentHistory");
var ConsentType;
(function (ConsentType) {
    ConsentType["SURGERY"] = "surgery";
    ConsentType["ANESTHESIA"] = "anesthesia";
    ConsentType["EUTHANASIA"] = "euthanasia";
    ConsentType["HOSPITALIZATION"] = "hospitalization";
    ConsentType["TREATMENT"] = "treatment";
    ConsentType["OTHER"] = "other"; // Otros consentimientos
})(ConsentType || (exports.ConsentType = ConsentType = {}));
var ConsentStatus;
(function (ConsentStatus) {
    ConsentStatus["PENDING"] = "pending";
    ConsentStatus["SIGNED"] = "signed";
    ConsentStatus["REJECTED"] = "rejected";
    ConsentStatus["EXPIRED"] = "expired"; // Expirado
})(ConsentStatus || (exports.ConsentStatus = ConsentStatus = {}));
let Consent = class Consent extends AuditableEntity_1.AuditableEntity {
};
exports.Consent = Consent;
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar'
    }),
    __metadata("design:type", String)
], Consent.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        default: ConsentStatus.PENDING
    }),
    __metadata("design:type", String)
], Consent.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], Consent.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Consent.prototype, "risks", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Consent.prototype, "alternatives", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Consent.prototype, "documentUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Consent.prototype, "idDocumentUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Consent.prototype, "signedDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Consent.prototype, "signedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Consent.prototype, "relationship", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Consent.prototype, "witnessName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Consent.prototype, "digitalSignature", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Consent.prototype, "additionalNotes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Consent.prototype, "expiryDate", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Consent.prototype, "petId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Pet_1.Pet),
    (0, typeorm_1.JoinColumn)({ name: 'petId' }),
    __metadata("design:type", Pet_1.Pet)
], Consent.prototype, "pet", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Consent.prototype, "medicalHistoryId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => MedicalHistory_1.MedicalHistory),
    (0, typeorm_1.JoinColumn)({ name: 'medicalHistoryId' }),
    __metadata("design:type", MedicalHistory_1.MedicalHistory)
], Consent.prototype, "medicalHistory", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Consent.prototype, "requestedById", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'requestedById' }),
    __metadata("design:type", User_1.User)
], Consent.prototype, "requestedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Consent.prototype, "approvedById", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'approvedById' }),
    __metadata("design:type", User_1.User)
], Consent.prototype, "approvedBy", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => ConsentDocumentHistory_1.ConsentDocumentHistory, history => history.consent),
    __metadata("design:type", Array)
], Consent.prototype, "documentHistory", void 0);
exports.Consent = Consent = __decorate([
    (0, typeorm_1.Entity)('consents'),
    (0, typeorm_1.Index)(['petId', 'type']),
    (0, typeorm_1.Index)(['medicalHistoryId']),
    (0, typeorm_1.Index)(['status'])
], Consent);
//# sourceMappingURL=Consent.js.map