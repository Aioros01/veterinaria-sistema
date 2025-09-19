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
async function addIdDocumentUrl() {
    const dataSource = new typeorm_1.DataSource({
        type: 'postgres',
        url: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        },
        synchronize: false,
        logging: true
    });
    try {
        console.log('🔧 Agregando columna idDocumentUrl a la tabla consents...');
        await dataSource.initialize();
        console.log('✅ Conexión establecida');
        // Verificar si la columna ya existe
        const columns = await dataSource.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'consents' 
      AND column_name = 'idDocumentUrl'
    `);
        if (columns.length === 0) {
            // Agregar la columna si no existe
            await dataSource.query(`
        ALTER TABLE consents 
        ADD COLUMN "idDocumentUrl" VARCHAR(255) NULL
      `);
            console.log('✅ Columna idDocumentUrl agregada exitosamente');
        }
        else {
            console.log('ℹ️ La columna idDocumentUrl ya existe');
        }
        await dataSource.destroy();
        console.log('✅ Conexión cerrada');
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}
addIdDocumentUrl();
//# sourceMappingURL=addIdDocumentUrl.js.map