"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddDocumentFieldsToUser1699999999999 = void 0;
class AddDocumentFieldsToUser1699999999999 {
    async up(queryRunner) {
        // Agregar columna documentType si no existe
        const hasDocumentType = await queryRunner.hasColumn("users", "documentType");
        if (!hasDocumentType) {
            await queryRunner.query(`
                ALTER TABLE "users" 
                ADD COLUMN "documentType" VARCHAR(50) NULL
            `);
        }
        // Agregar columna documentNumber si no existe
        const hasDocumentNumber = await queryRunner.hasColumn("users", "documentNumber");
        if (!hasDocumentNumber) {
            await queryRunner.query(`
                ALTER TABLE "users" 
                ADD COLUMN "documentNumber" VARCHAR(50) NULL
            `);
        }
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "documentNumber"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "documentType"`);
    }
}
exports.AddDocumentFieldsToUser1699999999999 = AddDocumentFieldsToUser1699999999999;
//# sourceMappingURL=AddDocumentFieldsToUser.js.map