import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

async function fixDatabase() {
  // Crear conexión directa sin synchronize
  const dataSource = new DataSource({
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
      
      const existingColumns = columns.map((col: any) => col.column_name);
      
      if (!existingColumns.includes('documentType')) {
        await dataSource.query(`
          ALTER TABLE "users" 
          ADD COLUMN "documentType" VARCHAR(50) NULL
        `);
        console.log('✅ Columna documentType agregada');
      } else {
        console.log('ℹ️ Columna documentType ya existe');
      }
      
      if (!existingColumns.includes('documentNumber')) {
        await dataSource.query(`
          ALTER TABLE "users" 
          ADD COLUMN "documentNumber" VARCHAR(50) NULL
        `);
        console.log('✅ Columna documentNumber agregada');
      } else {
        console.log('ℹ️ Columna documentNumber ya existe');
      }
    } catch (error: any) {
      console.error('❌ Error agregando columnas:', error.message);
      throw error;
    }

    console.log('✅ Base de datos actualizada exitosamente');
    
    // Cerrar conexión
    await dataSource.destroy();
    console.log('✅ Conexión cerrada');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  }
}

fixDatabase();