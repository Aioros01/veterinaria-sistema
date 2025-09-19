const { Client } = require('pg');
const bcrypt = require('bcrypt');

// Configuración de CockroachDB
const cockroachConfig = {
  connectionString: 'postgresql://cris_mena0228:WXYmxAr3IUHInCg0cqf4jg@veterinaria-15765.j77.aws-us-east-1.cockroachlabs.cloud:26257/defaultdb?sslmode=require'
};

async function createUsers() {
  console.log('🚀 Creando usuarios en CockroachDB...\n');
  
  const client = new Client(cockroachConfig);
  
  try {
    console.log('📡 Conectando a CockroachDB...');
    await client.connect();
    console.log('✅ Conectado a CockroachDB\n');
    
    // Hash de contraseñas
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Usuarios a crear
    const users = [
      {
        username: 'admin',
        password: hashedPassword,
        email: 'admin@veterinaria.com',
        full_name: 'Administrador',
        role: 'ADMIN'
      },
      {
        username: 'veterinario',
        password: hashedPassword,
        email: 'vet@veterinaria.com',
        full_name: 'Dr. Veterinario',
        role: 'VETERINARIAN'
      },
      {
        username: 'recepcionista',
        password: hashedPassword,
        email: 'reception@veterinaria.com',
        full_name: 'Recepcionista',
        role: 'RECEPTIONIST'
      },
      {
        username: 'cliente',
        password: hashedPassword,
        email: 'cliente@example.com',
        full_name: 'Cliente de Prueba',
        role: 'CLIENT'
      }
    ];
    
    console.log('📋 Creando usuarios...');
    for (const user of users) {
      try {
        await client.query(
          `INSERT INTO users (username, password, email, full_name, role, is_active) 
           VALUES ($1, $2, $3, $4, $5, true) 
           ON CONFLICT (username) DO UPDATE 
           SET password = $2, email = $3, full_name = $4, role = $5`,
          [user.username, user.password, user.email, user.full_name, user.role]
        );
        console.log(`   ✓ Usuario ${user.username} creado`);
      } catch (error) {
        console.log(`   ⚠️ Error creando ${user.username}: ${error.message}`);
      }
    }
    
    console.log('\n✅ ¡Usuarios creados exitosamente!');
    console.log('\n📝 Credenciales para ingresar:');
    console.log('   Usuario: admin');
    console.log('   Contraseña: admin123');
    console.log('   (Todos los usuarios tienen la misma contraseña)');
    
  } catch (error) {
    console.error('❌ Error durante la creación de usuarios:', error);
  } finally {
    await client.end();
  }
}

// Ejecutar
createUsers();