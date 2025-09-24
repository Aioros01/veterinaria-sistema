import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateAuditLogTable1758660000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "audit_logs",
                columns: [
                    {
                        name: "id",
                        type: "uuid",
                        isPrimary: true,
                        generationStrategy: "uuid",
                        default: "gen_random_uuid()"
                    },
                    {
                        name: "action",
                        type: "varchar",
                        length: "50"
                    },
                    {
                        name: "entityType",
                        type: "varchar",
                        length: "100"
                    },
                    {
                        name: "entityId",
                        type: "varchar",
                        isNullable: true
                    },
                    {
                        name: "oldValues",
                        type: "jsonb",
                        isNullable: true
                    },
                    {
                        name: "newValues",
                        type: "jsonb",
                        isNullable: true
                    },
                    {
                        name: "description",
                        type: "text",
                        isNullable: true
                    },
                    {
                        name: "performed_by",
                        type: "uuid",
                        isNullable: true
                    },
                    {
                        name: "performedById",
                        type: "varchar",
                        isNullable: true
                    },
                    {
                        name: "performedByEmail",
                        type: "varchar",
                        isNullable: true
                    },
                    {
                        name: "performedByRole",
                        type: "varchar",
                        isNullable: true
                    },
                    {
                        name: "ipAddress",
                        type: "varchar",
                        isNullable: true
                    },
                    {
                        name: "userAgent",
                        type: "text",
                        isNullable: true
                    },
                    {
                        name: "createdAt",
                        type: "timestamp",
                        default: "CURRENT_TIMESTAMP"
                    }
                ],
                foreignKeys: [
                    {
                        name: "FK_audit_user",
                        columnNames: ["performed_by"],
                        referencedTableName: "users",
                        referencedColumnNames: ["id"],
                        onDelete: "SET NULL"
                    }
                ],
                indices: [
                    {
                        name: "IDX_audit_action",
                        columnNames: ["action"]
                    },
                    {
                        name: "IDX_audit_entity",
                        columnNames: ["entityType", "entityId"]
                    },
                    {
                        name: "IDX_audit_performed_by",
                        columnNames: ["performedById"]
                    },
                    {
                        name: "IDX_audit_created_at",
                        columnNames: ["createdAt"]
                    }
                ]
            }),
            true
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("audit_logs");
    }
}