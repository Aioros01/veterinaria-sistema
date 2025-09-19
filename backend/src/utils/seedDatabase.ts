import { AppDataSource } from '../config/database';
import { User, UserRole } from '../entities/User';
import * as dotenv from 'dotenv';

dotenv.config();

const seedDatabase = async () => {
  try {
    await AppDataSource.initialize();
    console.log('📊 Connected to database');

    const userRepository = AppDataSource.getRepository(User);

    // Check if admin exists
    const adminExists = await userRepository.findOne({
      where: { email: 'admin@veterinaria.com' }
    });

    if (!adminExists) {
      // Create admin user
      const admin = userRepository.create({
        firstName: 'Admin',
        lastName: 'Sistema',
        email: 'admin@veterinaria.com',
        password: 'admin123',
        phone: '+1234567890',
        address: 'Veterinaria Central',
        role: UserRole.ADMIN,
        isActive: true,
        emailNotifications: true,
        whatsappNotifications: true
      });

      await userRepository.save(admin);
      console.log('✅ Admin user created successfully');
      console.log('📧 Email: admin@veterinaria.com');
      console.log('🔐 Password: admin123');
    } else {
      console.log('ℹ️ Admin user already exists');
    }

    // Create sample veterinarian
    const vetExists = await userRepository.findOne({
      where: { email: 'vet@veterinaria.com' }
    });

    if (!vetExists) {
      const veterinarian = userRepository.create({
        firstName: 'Dr. Juan',
        lastName: 'Pérez',
        email: 'vet@veterinaria.com',
        password: 'vet123',
        phone: '+1234567891',
        address: 'Consultorio 1',
        role: UserRole.VETERINARIAN,
        isActive: true,
        emailNotifications: true,
        whatsappNotifications: true
      });

      await userRepository.save(veterinarian);
      console.log('✅ Veterinarian user created');
    }

    // Create sample receptionist
    const receptionistExists = await userRepository.findOne({
      where: { email: 'reception@veterinaria.com' }
    });

    if (!receptionistExists) {
      const receptionist = userRepository.create({
        firstName: 'María',
        lastName: 'García',
        email: 'reception@veterinaria.com',
        password: 'reception123',
        phone: '+1234567892',
        address: 'Recepción',
        role: UserRole.RECEPTIONIST,
        isActive: true,
        emailNotifications: true,
        whatsappNotifications: false
      });

      await userRepository.save(receptionist);
      console.log('✅ Receptionist user created');
    }

    // Create sample client
    const clientExists = await userRepository.findOne({
      where: { email: 'cliente@example.com' }
    });

    if (!clientExists) {
      const client = userRepository.create({
        firstName: 'Carlos',
        lastName: 'López',
        email: 'cliente@example.com',
        password: 'cliente123',
        phone: '+1234567893',
        address: 'Calle Principal 123',
        role: UserRole.CLIENT,
        isActive: true,
        emailNotifications: true,
        whatsappNotifications: true
      });

      await userRepository.save(client);
      console.log('✅ Sample client created');
    }

    console.log('\n📋 Default Users:');
    console.log('=====================================');
    console.log('Admin: admin@veterinaria.com / admin123');
    console.log('Veterinarian: vet@veterinaria.com / vet123');
    console.log('Receptionist: reception@veterinaria.com / reception123');
    console.log('Client: cliente@example.com / cliente123');
    console.log('=====================================\n');

    await AppDataSource.destroy();
    console.log('✅ Database seed completed!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();