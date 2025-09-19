import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

async function addDocumentHistoryTable() {
  const dataSource = new DataSource({
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
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addDocumentHistoryTable();