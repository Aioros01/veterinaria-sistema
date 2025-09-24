"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateAuditLogTable1758660000000 = void 0;
const typeorm_1 = require("typeorm");
class CreateAuditLogTable1758660000000 {
    async up(queryRunner) {
        await queryRunner.createTable(new typeorm_1.Table({
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
        }), true);
    }
    async down(queryRunner) {
        await queryRunner.dropTable("audit_logs");
    }
}
exports.CreateAuditLogTable1758660000000 = CreateAuditLogTable1758660000000;
//# sourceMappingURL=CreateAuditLogTable.js.map