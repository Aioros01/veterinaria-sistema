"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddMissingPrescriptionFields1758032063257 = void 0;
class AddMissingPrescriptionFields1758032063257 {
    constructor() {
        this.name = 'AddMissingPrescriptionFields1758032063257';
    }
    async up(queryRunner) {
        // Agregar campos faltantes a la tabla prescriptions
        await queryRunner.query(`ALTER TABLE "prescriptions" ADD COLUMN IF NOT EXISTS "quantity" int8 NOT NULL DEFAULT 1`);
        await queryRunner.query(`ALTER TABLE "prescriptions" ADD COLUMN IF NOT EXISTS "externalPharmacy" varchar`);
        await queryRunner.query(`ALTER TABLE "prescriptions" ADD COLUMN IF NOT EXISTS "purchaseDate" timestamp`);
    }
    async down(queryRunner) {
        // Revertir cambios
        await queryRunner.query(`ALTER TABLE "prescriptions" DROP COLUMN IF EXISTS "purchaseDate"`);
        await queryRunner.query(`ALTER TABLE "prescriptions" DROP COLUMN IF EXISTS "externalPharmacy"`);
        await queryRunner.query(`ALTER TABLE "prescriptions" DROP COLUMN IF EXISTS "quantity"`);
    }
}
exports.AddMissingPrescriptionFields1758032063257 = AddMissingPrescriptionFields1758032063257;
//# sourceMappingURL=1758032063257-AddMissingPrescriptionFields.js.map