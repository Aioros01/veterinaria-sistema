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
const typeorm_1 = require("typeorm");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
async function fixDatabase() {
    // Crear conexión directa sin synchronize
    const dataSource = new typeorm_1.DataSource({
        type: 'postgres',
        url: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        },
        synchronize: false, // Deshabilitado para evitar problemas
        logging: true
    });
    try {
        console.log('🔧 Iniciando corrección de base de datos...');
        // Inicializar conexión
        await dataSource.initialize();
        console.log('✅ Conexión establecida');
        // Ejecutar queries para agregar columnas faltantes
        try {
            // Primero verificar si las columnas existen
            const columns = await dataSource.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name IN ('documentType', 'documentNumber')
      `);
            const existingColumns = columns.map((col) => col.column_name);
            if (!existingColumns.includes('documentType')) {
                await dataSource.query(`
          ALTER TABLE "users" 
          ADD COLUMN "documentType" VARCHAR(50) NULL
        `);
                console.log('✅ Columna documentType agregada');
            }
            else {
                console.log('ℹ️ Columna documentType ya existe');
            }
            if (!existingColumns.includes('documentNumber')) {
                await dataSource.query(`
          ALTER TABLE "users" 
          ADD COLUMN "documentNumber" VARCHAR(50) NULL
        `);
                console.log('✅ Columna documentNumber agregada');
            }
            else {
                console.log('ℹ️ Columna documentNumber ya existe');
            }
        }
        catch (error) {
            console.error('❌ Error agregando columnas:', error.message);
            throw error;
        }
        console.log('✅ Base de datos actualizada exitosamente');
        // Cerrar conexión
        await dataSource.destroy();
        console.log('✅ Conexión cerrada');
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Error fatal:', error);
        process.exit(1);
    }
}
fixDatabase();
//# sourceMappingURL=fixDatabase.js.map