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
async function addDocumentHistoryTable() {
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
        console.log('🔧 Creando tabla de historial de documentos...');
        await dataSource.initialize();
        console.log('✅ Conexión establecida');
        // Crear tabla de historial de documentos
        await dataSource.query(`
      CREATE TABLE IF NOT EXISTS consent_document_history (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        "consentId" UUID NOT NULL REFERENCES consents(id) ON DELETE CASCADE,
        "documentType" VARCHAR(50) NOT NULL,
        "documentUrl" VARCHAR(500) NOT NULL,
        "originalFileName" VARCHAR(255),
        "mimeType" VARCHAR(100),
        "fileSize" INTEGER,
        "isActive" BOOLEAN DEFAULT true,
        "notes" TEXT,
        "uploadedById" UUID REFERENCES users(id),
        "uploadedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
        console.log('✅ Tabla consent_document_history creada');
        // Crear índices
        await dataSource.query(`
      CREATE INDEX IF NOT EXISTS idx_document_history_consent 
      ON consent_document_history("consentId");
      
      CREATE INDEX IF NOT EXISTS idx_document_history_type 
      ON consent_document_history("documentType");
      
      CREATE INDEX IF NOT EXISTS idx_document_history_active 
      ON consent_document_history("isActive");
    `);
        console.log('✅ Índices creados');
        // Migrar datos existentes si hay documentos en la tabla consents
        await dataSource.query(`
      INSERT INTO consent_document_history 
        ("consentId", "documentType", "documentUrl", "uploadedById", "uploadedAt")
      SELECT 
        id, 
        'signed_consent', 
        "documentUrl",
        "approvedById",
        "signedDate"
      FROM consents 
      WHERE "documentUrl" IS NOT NULL
      ON CONFLICT DO NOTHING
    `);
        await dataSource.query(`
      INSERT INTO consent_document_history 
        ("consentId", "documentType", "documentUrl", "uploadedById", "uploadedAt")
      SELECT 
        id, 
        'id_document', 
        "idDocumentUrl",
        "approvedById",
        "signedDate"
      FROM consents 
      WHERE "idDocumentUrl" IS NOT NULL
      ON CONFLICT DO NOTHING
    `);
        console.log('✅ Datos históricos migrados');
        await dataSource.destroy();
        console.log('✅ Proceso completado exitosamente');
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}
addDocumentHistoryTable();
//# sourceMappingURL=addDocumentHistory.js.map