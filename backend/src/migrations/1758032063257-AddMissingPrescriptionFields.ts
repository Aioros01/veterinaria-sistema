import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMissingPrescriptionFields1758032063257 implements MigrationInterface {
    name = 'AddMissingPrescriptionFields1758032063257'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Agregar campos faltantes a la tabla prescriptions
        await queryRunner.query(`ALTER TABLE "prescriptions" ADD COLUMN IF NOT EXISTS "quantity" int8 NOT NULL DEFAULT 1`);
        await queryRunner.query(`ALTER TABLE "prescriptions" ADD COLUMN IF NOT EXISTS "externalPharmacy" varchar`);
        await queryRunner.query(`ALTER TABLE "prescriptions" ADD COLUMN IF NOT EXISTS "purchaseDate" timestamp`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revertir cambios
        await queryRunner.query(`ALTER TABLE "prescriptions" DROP COLUMN IF EXISTS "purchaseDate"`);
        await queryRunner.query(`ALTER TABLE "prescriptions" DROP COLUMN IF EXISTS "externalPharmacy"`);
        await queryRunner.query(`ALTER TABLE "prescriptions" DROP COLUMN IF EXISTS "quantity"`);
    }
}