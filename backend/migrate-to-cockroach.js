const { Client } = require('pg');
require('dotenv').config();

// Configuración de Supabase (origen)
const supabaseConfig = {
  connectionString: process.env.DATABASE_URL || 
    'postgresql://postgres:XRRTa933@db.xahomsbzocjfsigwfgzi.supabase.co:5432/postgres'
};

// Configuración de CockroachDB (destino)
// ACTUALIZA ESTA URL CON TU CONEXIÓN DE COCKROACHDB
const cockroachConfig = {
  connectionString: 'postgresql://cris_mena0228:WXYmxAr3IUHInCg0cqf4jg@veterinaria-15765.j77.aws-us-east-1.cockroachlabs.cloud:26257/defaultdb?sslmode=require'
};

async function migrateData() {
  console.log('🚀 Iniciando migración de Supabase a CockroachDB...\n');
  
  const supabase = new Client(supabaseConfig);
  const cockroach = new Client(cockroachConfig);
  
  try {
    // Conectar a ambas bases de datos
    console.log('📡 Conectando a Supabase...');
    await supabase.connect();
    console.log('✅ Conectado a Supabase\n');
    
    console.log('📡 Conectando a CockroachDB...');
    await cockroach.connect();
    console.log('✅ Conectado a CockroachDB\n');
    
    // Tablas en orden correcto (respetando foreign keys)
    const tables = [
      'users',
      'pets', 
      'appointments',
      'medical_histories',
      'vaccinations',
      'medicines',
      'prescriptions'
    ];
    
    console.log('🗄️ Migrando tablas...\n');
    
    for (const table of tables) {
      console.log(`📋 Migrando tabla: ${table}`);
      
      try {
        // Obtener datos de Supabase
        const result = await supabase.query(`SELECT * FROM ${table}`);
        console.log(`   ✓ ${result.rows.length} registros encontrados`);
        
        if (result.rows.length > 0) {
          // Crear tabla en CockroachDB si no existe
          const createTableQuery = await supabase.query(`
            SELECT 
              'CREATE TABLE IF NOT EXISTS ' || table_name || ' (' ||
              string_agg(
                column_name || ' ' || 
                CASE 
                  WHEN data_type = 'USER-DEFINED' THEN udt_name
                  ELSE data_type 
                END ||
                CASE 
                  WHEN character_maximum_length IS NOT NULL 
                  THEN '(' || character_maximum_length || ')'
                  ELSE ''
                END ||
                CASE 
                  WHEN is_nullable = 'NO' THEN ' NOT NULL'
                  ELSE ''
                END,
                ', '
              ) || ');' as create_statement
            FROM information_schema.columns
            WHERE table_name = '${table}'
            GROUP BY table_name
          `);
          
          if (createTableQuery.rows[0]) {
            await cockroach.query(createTableQuery.rows[0].create_statement);
          }
          
          // Limpiar tabla destino
          await cockroach.query(`DELETE FROM ${table}`);
          
          // Insertar datos
          for (const row of result.rows) {
            const columns = Object.keys(row).filter(key => row[key] !== null);
            const values = columns.map(key => row[key]);
            const placeholders = columns.map((_, index) => `$${index + 1}`);
            
            const insertQuery = `
              INSERT INTO ${table} (${columns.join(', ')}) 
              VALUES (${placeholders.join(', ')})
              ON CONFLICT DO NOTHING
            `;
            
            await cockroach.query(insertQuery, values);
          }
          
          console.log(`   ✓ Tabla ${table} migrada exitosamente\n`);
        }
      } catch (error) {
        console.log(`   ⚠️ Error en tabla ${table}: ${error.message}`);
        console.log(`   Continuando con siguiente tabla...\n`);
      }
    }
    
    console.log('✅ ¡Migración completada exitosamente!');
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
  } finally {
    await supabase.end();
    await cockroach.end();
  }
}

// Ejecutar migración
migrateData();