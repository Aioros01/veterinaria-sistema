require('dotenv').config();
const { AppDataSource } = require('./dist/config/database');
const bcrypt = require('bcryptjs');

async function verifyAndCreateUsers() {
  try {
    await AppDataSource.initialize();
    console.log('✅ Conexión establecida');
    
    const userRepo = AppDataSource.getRepository('User');
    
    // Verificar si existe el admin
    let admin = await userRepo.findOne({
      where: { email: 'admin@veterinaria.com' }
    });
    
    if (!admin) {
      console.log('Creando usuario administrador...');
      const hashedPassword = await bcrypt.hash('admin123456', 10);
      admin = userRepo.create({
        email: 'admin@veterinaria.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'Sistema',
        role: 'admin',
        isActive: true
      });
      await userRepo.save(admin);
      console.log('✅ Admin creado: admin@veterinaria.com / admin123456');
    } else {
      // Actualizar contraseña del admin
      const hashedPassword = await bcrypt.hash('admin123456', 10);
      admin.password = hashedPassword;
      await userRepo.save(admin);
      console.log('✅ Contraseña del admin actualizada: admin@veterinaria.com / admin123456');
    }
    
    // Verificar si existe el veterinario
    let vet = await userRepo.findOne({
      where: { email: 'juan.perez@veterinaria.com' }
    });
    
    if (!vet) {
      console.log('Creando usuario veterinario...');
      const hashedPassword = await bcrypt.hash('vet123456', 10);
      vet = userRepo.create({
        email: 'juan.perez@veterinaria.com',
        password: hashedPassword,
        firstName: 'Juan',
        lastName: 'Pérez',
        role: 'veterinarian',
        isActive: true
      });
      await userRepo.save(vet);
      console.log('✅ Veterinario creado: juan.perez@veterinaria.com / vet123456');
    } else {
      // Actualizar contraseña del veterinario
      const hashedPassword = await bcrypt.hash('vet123456', 10);
      vet.password = hashedPassword;
      await userRepo.save(vet);
      console.log('✅ Contraseña del veterinario actualizada: juan.perez@veterinaria.com / vet123456');
    }
    
    // Crear un cliente de prueba
    let cliente = await userRepo.findOne({
      where: { email: 'cliente@example.com' }
    });
    
    if (!cliente) {
      console.log('Creando usuario cliente de prueba...');
      const hashedPassword = await bcrypt.hash('cliente123', 10);
      cliente = userRepo.create({
        email: 'cliente@example.com',
        password: hashedPassword,
        firstName: 'Cliente',
        lastName: 'Prueba',
        role: 'client',
        isActive: true
      });
      await userRepo.save(cliente);
      console.log('✅ Cliente creado: cliente@example.com / cliente123');
    } else {
      // Actualizar contraseña del cliente
      const hashedPassword = await bcrypt.hash('cliente123', 10);
      cliente.password = hashedPassword;
      await userRepo.save(cliente);
      console.log('✅ Contraseña del cliente actualizada: cliente@example.com / cliente123');
    }
    
    console.log('\n📝 CREDENCIALES ACTUALIZADAS:');
    console.log('================================');
    console.log('Admin: admin@veterinaria.com / admin123456');
    console.log('Veterinario: juan.perez@veterinaria.com / vet123456');
    console.log('Cliente: cliente@example.com / cliente123');
    console.log('================================\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

verifyAndCreateUsers();