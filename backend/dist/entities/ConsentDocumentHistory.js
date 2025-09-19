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
exports.ConsentDocumentHistory = exports.DocumentType = void 0;
const typeorm_1 = require("typeorm");
const Consent_1 = require("./Consent");
const User_1 = require("./User");
var DocumentType;
(function (DocumentType) {
    DocumentType["SIGNED_CONSENT"] = "signed_consent";
    DocumentType["ID_DOCUMENT"] = "id_document";
})(DocumentType || (exports.DocumentType = DocumentType = {}));
let ConsentDocumentHistory = class ConsentDocumentHistory {
};
exports.ConsentDocumentHistory = ConsentDocumentHistory;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ConsentDocumentHistory.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], ConsentDocumentHistory.prototype, "consentId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Consent_1.Consent, consent => consent.documentHistory),
    (0, typeorm_1.JoinColumn)({ name: 'consentId' }),
    __metadata("design:type", Consent_1.Consent)
], ConsentDocumentHistory.prototype, "consent", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar'
    }),
    __metadata("design:type", String)
], ConsentDocumentHistory.prototype, "documentType", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ConsentDocumentHistory.prototype, "documentUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ConsentDocumentHistory.prototype, "originalFileName", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ConsentDocumentHistory.prototype, "mimeType", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], ConsentDocumentHistory.prototype, "fileSize", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], ConsentDocumentHistory.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ConsentDocumentHistory.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ConsentDocumentHistory.prototype, "uploadedById", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'uploadedById' }),
    __metadata("design:type", User_1.User)
], ConsentDocumentHistory.prototype, "uploadedBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ConsentDocumentHistory.prototype, "uploadedAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], ConsentDocumentHistory.prototype, "updatedAt", void 0);
exports.ConsentDocumentHistory = ConsentDocumentHistory = __decorate([
    (0, typeorm_1.Entity)('consent_document_history')
], ConsentDocumentHistory);
//# sourceMappingURL=ConsentDocumentHistory.js.map