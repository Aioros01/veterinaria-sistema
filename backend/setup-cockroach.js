const { Client } = require('pg');
require('dotenv').config();

// Configuración de CockroachDB
const cockroachConfig = {
  connectionString: 'postgresql://cris_mena0228:WXYmxAr3IUHInCg0cqf4jg@veterinaria-15765.j77.aws-us-east-1.cockroachlabs.cloud:26257/defaultdb?sslmode=require'
};

async function setupCockroachDB() {
  console.log('🚀 Configurando tablas en CockroachDB...\n');
  
  const client = new Client(cockroachConfig);
  
  try {
    console.log('📡 Conectando a CockroachDB...');
    await client.connect();
    console.log('✅ Conectado a CockroachDB\n');
    
    // Crear enum para roles
    console.log('📋 Creando tipos de datos...');
    await client.query(`
      CREATE TYPE IF NOT EXISTS users_role_enum AS ENUM ('ADMIN', 'VETERINARIAN', 'RECEPTIONIST', 'CLIENT');
    `).catch(() => console.log('   ℹ️ Tipo users_role_enum ya existe'));
    
    // Crear tabla users
    console.log('📋 Creando tabla users...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        role users_role_enum NOT NULL DEFAULT 'CLIENT',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('   ✓ Tabla users creada');
    
    // Crear tabla pets
    console.log('📋 Creando tabla pets...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS pets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL,
        species VARCHAR(50) NOT NULL,
        breed VARCHAR(100),
        age INT,
        weight DECIMAL(10,2),
        owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('   ✓ Tabla pets creada');
    
    // Crear tabla appointments
    console.log('📋 Creando tabla appointments...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS appointments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
        veterinarian_id UUID REFERENCES users(id),
        appointment_date TIMESTAMP NOT NULL,
        reason TEXT,
        status VARCHAR(50) DEFAULT 'scheduled',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('   ✓ Tabla appointments creada');
    
    // Crear tabla medical_histories
    console.log('📋 Creando tabla medical_histories...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS medical_histories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
        veterinarian_id UUID REFERENCES users(id),
        visit_date TIMESTAMP NOT NULL,
        diagnosis TEXT,
        treatment TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('   ✓ Tabla medical_histories creada');
    
    // Crear tabla vaccinations
    console.log('📋 Creando tabla vaccinations...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS vaccinations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
        vaccine_name VARCHAR(255) NOT NULL,
        vaccination_date DATE NOT NULL,
        next_dose_date DATE,
        veterinarian_id UUID REFERENCES users(id),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('   ✓ Tabla vaccinations creada');
    
    // Crear tabla medicines
    console.log('📋 Creando tabla medicines...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS medicines (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        stock_quantity INT DEFAULT 0,
        unit_price DECIMAL(10,2),
        expiration_date DATE,
        supplier VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('   ✓ Tabla medicines creada');
    
    // Crear tabla prescriptions
    console.log('📋 Creando tabla prescriptions...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS prescriptions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        medical_history_id UUID REFERENCES medical_histories(id) ON DELETE CASCADE,
        medicine_id UUID REFERENCES medicines(id),
        dosage VARCHAR(255),
        frequency VARCHAR(255),
        duration VARCHAR(255),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('   ✓ Tabla prescriptions creada');
    
    console.log('\n✅ ¡Todas las tablas creadas exitosamente!');
    
  } catch (error) {
    console.error('❌ Error durante la configuración:', error);
  } finally {
    await client.end();
  }
}

// Ejecutar configuración
setupCockroachDB();