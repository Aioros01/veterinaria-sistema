import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

async function addIdDocumentUrl() {
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
    } else {
      console.log('ℹ️ La columna idDocumentUrl ya existe');
    }

    await dataSource.destroy();
    console.log('✅ Conexión cerrada');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addIdDocumentUrl();