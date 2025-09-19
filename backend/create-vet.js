require('dotenv').config();
const { AppDataSource } = require('./dist/config/database');
const { User } = require('./dist/entities/User');
const bcrypt = require('bcryptjs');

async function createVet() {
  try {
    await AppDataSource.initialize();
    console.log('Conexión establecida');
    
    const userRepo = AppDataSource.getRepository(User);
    
    // Crear veterinario
    const hashedPassword = await bcrypt.hash('vet123456', 10);
    const vet = userRepo.create({
      firstName: 'Dr. Juan',
      lastName: 'Pérez',
      email: 'vet@veterinaria.com',
      password: hashedPassword,
      role: 'veterinarian',
      phone: '555-0001',
      isActive: true
    });
    
    await userRepo.save(vet);
    console.log('✅ Veterinario creado:', vet.email);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createVet();