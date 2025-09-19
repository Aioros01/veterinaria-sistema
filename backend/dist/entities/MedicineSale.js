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
exports.MedicineSale = exports.PurchaseLocation = exports.SaleStatus = void 0;
const typeorm_1 = require("typeorm");
const AuditableEntity_1 = require("./AuditableEntity");
const Medicine_1 = require("./Medicine");
const Prescription_1 = require("./Prescription");
const User_1 = require("./User");
const Pet_1 = require("./Pet");
var SaleStatus;
(function (SaleStatus) {
    SaleStatus["PENDING"] = "pending";
    SaleStatus["COMPLETED"] = "completed";
    SaleStatus["CANCELLED"] = "cancelled";
    SaleStatus["REFUNDED"] = "refunded";
})(SaleStatus || (exports.SaleStatus = SaleStatus = {}));
var PurchaseLocation;
(function (PurchaseLocation) {
    PurchaseLocation["IN_CLINIC"] = "in_clinic";
    PurchaseLocation["EXTERNAL"] = "external";
    PurchaseLocation["SPLIT"] = "split"; // Compra parcial (parte en clínica, parte externa)
})(PurchaseLocation || (exports.PurchaseLocation = PurchaseLocation = {}));
let MedicineSale = class MedicineSale extends AuditableEntity_1.AuditableEntity {
    calculatePrices() {
        // Calcular precio total
        this.totalPrice = this.quantity * this.unitPrice;
        // Calcular descuento
        if (this.discountPercentage > 0) {
            this.discountAmount = this.totalPrice * (this.discountPercentage / 100);
        }
        // Calcular precio final
        this.finalPrice = this.totalPrice - this.discountAmount;
    }
    // Método para verificar si la venta afecta el inventario
    affectsInventory() {
        return this.purchaseLocation === PurchaseLocation.IN_CLINIC &&
            this.status === SaleStatus.COMPLETED;
    }
};
exports.MedicineSale = MedicineSale;
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], MedicineSale.prototype, "saleDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer' }),
    __metadata("design:type", Number)
], MedicineSale.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', nullable: true }),
    __metadata("design:type", Number)
], MedicineSale.prototype, "quantityInClinic", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', nullable: true }),
    __metadata("design:type", Number)
], MedicineSale.prototype, "quantityExternal", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], MedicineSale.prototype, "unitPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], MedicineSale.prototype, "totalPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], MedicineSale.prototype, "discountPercentage", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], MedicineSale.prototype, "discountAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], MedicineSale.prototype, "finalPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        default: SaleStatus.COMPLETED
    }),
    __metadata("design:type", String)
], MedicineSale.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        default: PurchaseLocation.IN_CLINIC
    }),
    __metadata("design:type", String)
], MedicineSale.prototype, "purchaseLocation", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], MedicineSale.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], MedicineSale.prototype, "externalPharmacy", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], MedicineSale.prototype, "invoiceNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], MedicineSale.prototype, "prescriptionId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], MedicineSale.prototype, "medicineId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], MedicineSale.prototype, "clientId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], MedicineSale.prototype, "petId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], MedicineSale.prototype, "veterinarianId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Prescription_1.Prescription, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'prescriptionId' }),
    __metadata("design:type", Prescription_1.Prescription)
], MedicineSale.prototype, "prescription", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Medicine_1.Medicine),
    (0, typeorm_1.JoinColumn)({ name: 'medicineId' }),
    __metadata("design:type", Medicine_1.Medicine)
], MedicineSale.prototype, "medicine", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'clientId' }),
    __metadata("design:type", User_1.User)
], MedicineSale.prototype, "client", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Pet_1.Pet, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'petId' }),
    __metadata("design:type", Pet_1.Pet)
], MedicineSale.prototype, "pet", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'veterinarianId' }),
    __metadata("design:type", User_1.User)
], MedicineSale.prototype, "veterinarian", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    (0, typeorm_1.BeforeUpdate)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MedicineSale.prototype, "calculatePrices", null);
exports.MedicineSale = MedicineSale = __decorate([
    (0, typeorm_1.Entity)('medicine_sales'),
    (0, typeorm_1.Index)(['prescriptionId']),
    (0, typeorm_1.Index)(['medicineId']),
    (0, typeorm_1.Index)(['clientId']),
    (0, typeorm_1.Index)(['saleDate'])
], MedicineSale);
//# sourceMappingURL=MedicineSale.js.map