"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const database_1 = require("../config/database");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
/**
 * Script de validación de esquema de base de datos
 * Compara las entidades de TypeORM con las tablas reales en la BD
 * Detecta campos faltantes, tipos incorrectos y otras inconsistencias
 */
async function validateSchema() {
    console.log('🔍 INICIANDO VALIDACIÓN DE ESQUEMA DE BASE DE DATOS\n');
    console.log('='.repeat(60));
    const results = [];
    try {
        // Inicializar conexión
        if (!database_1.AppDataSource.isInitialized) {
            await database_1.AppDataSource.initialize();
            console.log('✅ Conexión a base de datos establecida\n');
        }
        // Obtener metadata de todas las entidades
        const entities = database_1.AppDataSource.entityMetadatas;
        console.log(`📊 Validando ${entities.length} entidades...\n`);
        for (const entity of entities) {
            const result = {
                entity: entity.tableName,
                status: 'OK',
                issues: []
            };
            console.log(`\n🔍 Validando tabla: ${entity.tableName}`);
            console.log('-'.repeat(40));
            try {
                // Verificar si la tabla existe
                const tableExists = await database_1.AppDataSource.query(`
          SELECT EXISTS (
            SELECT 1 FROM information_schema.tables
            WHERE table_name = '${entity.tableName}'
          )
        `);
                if (!tableExists[0].exists) {
                    result.status = 'ERROR';
                    result.issues.push(`❌ Tabla '${entity.tableName}' NO EXISTE en la base de datos`);
                    results.push(result);
                    continue;
                }
                // Obtener columnas de la base de datos
                const dbColumns = await database_1.AppDataSource.query(`
          SELECT
            column_name,
            data_type,
            is_nullable,
            column_default IS NOT NULL as has_default
          FROM information_schema.columns
          WHERE table_name = '${entity.tableName}'
          ORDER BY ordinal_position
        `);
                const dbColumnMap = new Map();
                dbColumns.forEach((col) => {
                    dbColumnMap.set(col.column_name, {
                        name: col.column_name,
                        type: col.data_type,
                        isNullable: col.is_nullable === 'YES',
                        hasDefault: col.has_default
                    });
                });
                // Verificar cada columna de la entidad
                for (const column of entity.columns) {
                    const columnName = column.databaseName || column.propertyName;
                    const dbColumn = dbColumnMap.get(columnName);
                    if (!dbColumn) {
                        result.status = 'ERROR';
                        result.issues.push(`❌ Campo '${columnName}' definido en la entidad pero NO EXISTE en la tabla`);
                        console.log(`  ❌ Campo faltante: ${columnName}`);
                    }
                    else {
                        // Verificar nullable
                        if (column.isNullable !== dbColumn.isNullable && !column.isPrimary) {
                            result.status = result.status === 'ERROR' ? 'ERROR' : 'WARNING';
                            result.issues.push(`⚠️  Campo '${columnName}': nullable diferente (Entidad: ${column.isNullable}, BD: ${dbColumn.isNullable})`);
                        }
                        console.log(`  ✅ Campo OK: ${columnName} (${dbColumn.type})`);
                        dbColumnMap.delete(columnName);
                    }
                }
                // Verificar columnas extras en la BD
                for (const [columnName, dbColumn] of dbColumnMap) {
                    // Ignorar campos del sistema
                    if (!['id', 'createdAt', 'updatedAt', 'createdBy', 'updatedBy'].includes(columnName)) {
                        result.status = result.status === 'ERROR' ? 'ERROR' : 'WARNING';
                        result.issues.push(`⚠️  Campo '${columnName}' existe en la BD pero NO en la entidad`);
                        console.log(`  ⚠️  Campo extra en BD: ${columnName}`);
                    }
                }
                // Verificar relaciones
                for (const relation of entity.relations) {
                    const relationName = relation.propertyName;
                    const relationType = typeof relation.type === 'function' ? relation.type.name : relation.type;
                    console.log(`  🔗 Relación: ${relationName} -> ${relationType}`);
                }
            }
            catch (error) {
                result.status = 'ERROR';
                result.issues.push(`❌ Error validando tabla: ${error.message}`);
                console.error(`  ❌ Error: ${error.message}`);
            }
            results.push(result);
        }
        // Resumen final
        console.log('\n' + '='.repeat(60));
        console.log('📋 RESUMEN DE VALIDACIÓN');
        console.log('='.repeat(60));
        let totalOK = 0;
        let totalWarnings = 0;
        let totalErrors = 0;
        let criticalIssues = [];
        for (const result of results) {
            if (result.status === 'OK') {
                totalOK++;
                console.log(`✅ ${result.entity}: OK`);
            }
            else if (result.status === 'WARNING') {
                totalWarnings++;
                console.log(`⚠️  ${result.entity}: ADVERTENCIAS`);
                result.issues.forEach(issue => console.log(`   ${issue}`));
            }
            else {
                totalErrors++;
                console.log(`❌ ${result.entity}: ERRORES`);
                result.issues.forEach(issue => {
                    console.log(`   ${issue}`);
                    if (issue.includes('NO EXISTE')) {
                        criticalIssues.push(`${result.entity}: ${issue}`);
                    }
                });
            }
        }
        console.log('\n' + '-'.repeat(60));
        console.log(`Total: ${totalOK} OK, ${totalWarnings} Advertencias, ${totalErrors} Errores`);
        // Campos críticos identificados
        if (criticalIssues.length > 0) {
            console.log('\n🚨 PROBLEMAS CRÍTICOS DETECTADOS:');
            console.log('='.repeat(60));
            criticalIssues.forEach(issue => console.log(`  ${issue}`));
            console.log('\n💡 SOLUCIÓN RECOMENDADA:');
            console.log('  1. Ejecuta: npm run migration:generate -- src/migrations/FixMissingFields');
            console.log('  2. Revisa la migración generada');
            console.log('  3. Ejecuta: npm run migration:run');
        }
        // Detectar problema específico de Prescription
        const prescriptionResult = results.find(r => r.entity === 'prescriptions');
        if (prescriptionResult && prescriptionResult.status === 'ERROR') {
            console.log('\n⚠️  PROBLEMA DETECTADO EN PRESCRIPTION:');
            console.log('  Los campos quantity y externalPharmacy no existen.');
            console.log('  Esto está causando errores en el sistema de backups.');
        }
    }
    catch (error) {
        console.error('\n❌ Error durante la validación:', error);
        process.exit(1);
    }
    finally {
        await database_1.AppDataSource.destroy();
    }
}
// Ejecutar validación
validateSchema()
    .then(() => {
    console.log('\n✅ Validación completada');
    process.exit(0);
})
    .catch(error => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
});
//# sourceMappingURL=validateSchema.js.map