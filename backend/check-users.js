const { Client } = require('pg');

// Configuración de CockroachDB
const cockroachConfig = {
  connectionString: 'postgresql://cris_mena0228:WXYmxAr3IUHInCg0cqf4jg@veterinaria-15765.j77.aws-us-east-1.cockroachlabs.cloud:26257/defaultdb?sslmode=require'
};

async function checkUsers() {
  console.log('🔍 Verificando usuarios en CockroachDB...\n');
  
  const client = new Client(cockroachConfig);
  
  try {
    console.log('📡 Conectando a CockroachDB...');
    await client.connect();
    console.log('✅ Conectado a CockroachDB\n');
    
    // Verificar si la tabla users existe
    const tableCheck = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'users'
    `);
    
    if (tableCheck.rows.length === 0) {
      console.log('❌ La tabla users no existe!');
      return;
    }
    
    console.log('✅ La tabla users existe');
    
    // Obtener todos los usuarios
    const users = await client.query('SELECT id, username, email, full_name, role FROM users');
    console.log(`📋 Encontrados ${users.rows.length} usuarios:\n`);
    
    if (users.rows.length === 0) {
      console.log('❌ No hay usuarios en la base de datos!');
    } else {
      users.rows.forEach((user, index) => {
        console.log(`   ${index + 1}. Usuario: ${user.username}`);
        console.log(`      Email: ${user.email}`);
        console.log(`      Nombre: ${user.full_name}`);
        console.log(`      Rol: ${user.role}`);
        console.log(`      ID: ${user.id}\n`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error verificando usuarios:', error.message);
  } finally {
    await client.end();
  }
}

// Ejecutar verificación
checkUsers();