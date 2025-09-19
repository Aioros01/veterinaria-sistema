require('dotenv').config();
const { AppDataSource } = require('./dist/config/database');
const { Pet } = require('./dist/entities/Pet');

async function checkPets() {
  try {
    await AppDataSource.initialize();
    console.log('Conexión establecida');
    
    const petRepo = AppDataSource.getRepository(Pet);
    const pets = await petRepo.find({
      relations: ['owner']
    });
    
    console.log(`\n✅ Total de mascotas en la BD: ${pets.length}`);
    
    if (pets.length > 0) {
      console.log('\nMascotas encontradas:');
      pets.forEach(pet => {
        console.log(`- ${pet.name} (${pet.species}) - Dueño: ${pet.owner?.email || 'Sin dueño'}`);
      });
    } else {
      console.log('No hay mascotas registradas en la base de datos');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkPets();