require('dotenv').config();
const { AppDataSource } = require('./dist/config/database');

async function addAuditFields() {
  try {
    await AppDataSource.initialize();
    console.log('Conexión establecida');
    
    // Agregar campos de auditoría a todas las tablas
    const tables = ['pets', 'appointments', 'medical_histories', 'medicines', 'vaccinations'];
    
    for (const table of tables) {
      try {
        // Agregar createdBy si no existe
        await AppDataSource.query(`
          ALTER TABLE ${table} 
          ADD COLUMN IF NOT EXISTS "createdBy" varchar(255)
        `);
        console.log(`✅ Campo createdBy agregado a ${table}`);
        
        // Agregar updatedBy si no existe
        await AppDataSource.query(`
          ALTER TABLE ${table} 
          ADD COLUMN IF NOT EXISTS "updatedBy" varchar(255)
        `);
        console.log(`✅ Campo updatedBy agregado a ${table}`);
      } catch (error) {
        console.log(`⚠️ Error en tabla ${table}:`, error.message);
      }
    }
    
    console.log('✅ Campos de auditoría agregados exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

addAuditFields();