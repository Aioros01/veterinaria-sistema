import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDocumentFieldsToUser1699999999999 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
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

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "documentNumber"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "documentType"`);
    }
}