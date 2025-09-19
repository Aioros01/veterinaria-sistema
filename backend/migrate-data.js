const { Client } = require('pg');
require('dotenv').config();

// Configuración de Supabase (origen)
const supabaseConfig = {
  connectionString: process.env.DATABASE_URL || 
    'postgresql://postgres:XRRTa933@db.xahomsbzocjfsigwfgzi.supabase.co:5432/postgres'
};

// Configuración de CockroachDB (destino)
const cockroachConfig = {
  connectionString: 'postgresql://cris_mena0228:WXYmxAr3IUHInCg0cqf4jg@veterinaria-15765.j77.aws-us-east-1.cockroachlabs.cloud:26257/defaultdb?sslmode=require'
};

async function migrateData() {
  console.log('🚀 Migrando datos de Supabase a CockroachDB...\n');
  
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
    
    // Migrar usuarios
    console.log('📋 Migrando usuarios...');
    const users = await supabase.query('SELECT * FROM users');
    console.log(`   ✓ ${users.rows.length} usuarios encontrados`);
    
    for (const user of users.rows) {
      // Saltar usuarios con datos incompletos
      if (!user.username || !user.email || !user.password) {
        console.log(`   ⚠️ Saltando usuario incompleto: ${user.email || 'sin email'}`);
        continue;
      }
      
      // Convertir rol a mayúsculas para coincidir con el enum
      const role = user.role ? user.role.toUpperCase() : 'CLIENT';
      
      await cockroach.query(
        `INSERT INTO users (id, username, password, email, full_name, phone, role, is_active, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
         ON CONFLICT (id) DO NOTHING`,
        [user.id, user.username, user.password, user.email, user.full_name || user.username, 
         user.phone, role, user.is_active !== false, user.created_at, user.updated_at]
      );
    }
    console.log('   ✓ Usuarios migrados exitosamente\n');
    
    // Migrar mascotas
    console.log('📋 Migrando mascotas...');
    const pets = await supabase.query('SELECT * FROM pets');
    console.log(`   ✓ ${pets.rows.length} mascotas encontradas`);
    
    for (const pet of pets.rows) {
      await cockroach.query(
        `INSERT INTO pets (id, name, species, breed, age, weight, owner_id, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
         ON CONFLICT (id) DO NOTHING`,
        [pet.id, pet.name, pet.species, pet.breed, pet.age, 
         pet.weight, pet.owner_id, pet.created_at, pet.updated_at]
      );
    }
    console.log('   ✓ Mascotas migradas exitosamente\n');
    
    // Migrar citas
    console.log('📋 Migrando citas...');
    const appointments = await supabase.query('SELECT * FROM appointments');
    console.log(`   ✓ ${appointments.rows.length} citas encontradas`);
    
    for (const appointment of appointments.rows) {
      await cockroach.query(
        `INSERT INTO appointments (id, pet_id, veterinarian_id, appointment_date, reason, status, notes, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
         ON CONFLICT (id) DO NOTHING`,
        [appointment.id, appointment.pet_id, appointment.veterinarian_id, appointment.appointment_date, 
         appointment.reason, appointment.status, appointment.notes, appointment.created_at, appointment.updated_at]
      );
    }
    console.log('   ✓ Citas migradas exitosamente\n');
    
    // Migrar historiales médicos
    console.log('📋 Migrando historiales médicos...');
    const histories = await supabase.query('SELECT * FROM medical_histories');
    console.log(`   ✓ ${histories.rows.length} historiales encontrados`);
    
    for (const history of histories.rows) {
      await cockroach.query(
        `INSERT INTO medical_histories (id, pet_id, veterinarian_id, visit_date, diagnosis, treatment, notes, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
         ON CONFLICT (id) DO NOTHING`,
        [history.id, history.pet_id, history.veterinarian_id, history.visit_date, 
         history.diagnosis, history.treatment, history.notes, history.created_at, history.updated_at]
      );
    }
    console.log('   ✓ Historiales médicos migrados exitosamente\n');
    
    // Migrar vacunaciones
    console.log('📋 Migrando vacunaciones...');
    const vaccinations = await supabase.query('SELECT * FROM vaccinations');
    console.log(`   ✓ ${vaccinations.rows.length} vacunaciones encontradas`);
    
    for (const vaccination of vaccinations.rows) {
      await cockroach.query(
        `INSERT INTO vaccinations (id, pet_id, vaccine_name, vaccination_date, next_dose_date, veterinarian_id, notes, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
         ON CONFLICT (id) DO NOTHING`,
        [vaccination.id, vaccination.pet_id, vaccination.vaccine_name, vaccination.vaccination_date, 
         vaccination.next_dose_date, vaccination.veterinarian_id, vaccination.notes, vaccination.created_at, vaccination.updated_at]
      );
    }
    console.log('   ✓ Vacunaciones migradas exitosamente\n');
    
    // Migrar medicinas
    console.log('📋 Migrando medicinas...');
    const medicines = await supabase.query('SELECT * FROM medicines');
    console.log(`   ✓ ${medicines.rows.length} medicinas encontradas`);
    
    for (const medicine of medicines.rows) {
      await cockroach.query(
        `INSERT INTO medicines (id, name, description, stock_quantity, unit_price, expiration_date, supplier, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
         ON CONFLICT (id) DO NOTHING`,
        [medicine.id, medicine.name, medicine.description, medicine.stock_quantity, 
         medicine.unit_price, medicine.expiration_date, medicine.supplier, medicine.created_at, medicine.updated_at]
      );
    }
    console.log('   ✓ Medicinas migradas exitosamente\n');
    
    // Migrar prescripciones
    console.log('📋 Migrando prescripciones...');
    const prescriptions = await supabase.query('SELECT * FROM prescriptions');
    console.log(`   ✓ ${prescriptions.rows.length} prescripciones encontradas`);
    
    for (const prescription of prescriptions.rows) {
      await cockroach.query(
        `INSERT INTO prescriptions (id, medical_history_id, medicine_id, dosage, frequency, duration, notes, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
         ON CONFLICT (id) DO NOTHING`,
        [prescription.id, prescription.medical_history_id, prescription.medicine_id, prescription.dosage, 
         prescription.frequency, prescription.duration, prescription.notes, prescription.created_at, prescription.updated_at]
      );
    }
    console.log('   ✓ Prescripciones migradas exitosamente\n');
    
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