require('dotenv').config();
const { AppDataSource } = require('./dist/config/database');

async function createTables() {
  try {
    await AppDataSource.initialize();
    console.log('Conexión establecida');
    
    // Crear tabla de hospitalizaciones
    await AppDataSource.query(`
      CREATE TABLE IF NOT EXISTS hospitalizations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "createdBy" VARCHAR(255),
        "updatedBy" VARCHAR(255),
        "admissionDate" TIMESTAMP NOT NULL,
        "dischargeDate" TIMESTAMP,
        diagnosis TEXT NOT NULL,
        "reasonForAdmission" TEXT,
        "treatmentPlan" TEXT,
        "dischargeType" VARCHAR(20),
        "dischargeNotes" TEXT,
        "isActive" BOOLEAN DEFAULT true,
        "petId" UUID NOT NULL REFERENCES pets(id),
        "veterinarianId" UUID NOT NULL REFERENCES users(id)
      )
    `);
    console.log('✅ Tabla hospitalizations creada');

    // Crear tabla de medicamentos de hospitalización
    await AppDataSource.query(`
      CREATE TABLE IF NOT EXISTS hospitalization_medications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "createdBy" VARCHAR(255),
        "updatedBy" VARCHAR(255),
        "medicationName" VARCHAR(255) NOT NULL,
        dosage TEXT NOT NULL,
        frequency VARCHAR(255) NOT NULL,
        route VARCHAR(100),
        "lastAdministered" TIMESTAMP,
        "nextDue" TIMESTAMP,
        "administrationLog" JSONB,
        "isActive" BOOLEAN DEFAULT true,
        "hospitalizationId" UUID NOT NULL REFERENCES hospitalizations(id)
      )
    `);
    console.log('✅ Tabla hospitalization_medications creada');

    // Crear tabla de notas de hospitalización
    await AppDataSource.query(`
      CREATE TABLE IF NOT EXISTS hospitalization_notes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "createdBy" VARCHAR(255),
        "updatedBy" VARCHAR(255),
        note TEXT NOT NULL,
        "vitalSigns" JSONB,
        "hospitalizationId" UUID NOT NULL REFERENCES hospitalizations(id),
        "authorId" UUID NOT NULL REFERENCES users(id)
      )
    `);
    console.log('✅ Tabla hospitalization_notes creada');

    // Crear tabla de consentimientos
    await AppDataSource.query(`
      CREATE TABLE IF NOT EXISTS consents (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "createdBy" VARCHAR(255),
        "updatedBy" VARCHAR(255),
        type VARCHAR(20) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        description TEXT NOT NULL,
        risks TEXT,
        alternatives TEXT,
        "documentUrl" VARCHAR(500),
        "signedDate" TIMESTAMP,
        "signedBy" VARCHAR(255),
        relationship VARCHAR(100),
        "witnessName" VARCHAR(255),
        "digitalSignature" TEXT,
        "additionalNotes" TEXT,
        "expiryDate" TIMESTAMP,
        "petId" UUID NOT NULL REFERENCES pets(id),
        "medicalHistoryId" UUID REFERENCES medical_histories(id),
        "requestedById" UUID NOT NULL REFERENCES users(id),
        "approvedById" UUID REFERENCES users(id)
      )
    `);
    console.log('✅ Tabla consents creada');

    // Crear índices
    await AppDataSource.query(`
      CREATE INDEX IF NOT EXISTS idx_hospitalizations_pet ON hospitalizations("petId");
      CREATE INDEX IF NOT EXISTS idx_hospitalizations_status ON hospitalizations("isActive");
      CREATE INDEX IF NOT EXISTS idx_hospitalization_medications_hosp ON hospitalization_medications("hospitalizationId");
      CREATE INDEX IF NOT EXISTS idx_hospitalization_notes_hosp ON hospitalization_notes("hospitalizationId");
      CREATE INDEX IF NOT EXISTS idx_consents_pet ON consents("petId");
      CREATE INDEX IF NOT EXISTS idx_consents_status ON consents(status);
      CREATE INDEX IF NOT EXISTS idx_consents_medical_history ON consents("medicalHistoryId");
    `);
    console.log('✅ Índices creados');

    console.log('✅ Todas las tablas creadas exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createTables();