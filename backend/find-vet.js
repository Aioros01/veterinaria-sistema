const axios = require('axios');

async function testLogin(email, password) {
  try {
    await axios.post('http://localhost:3001/api/auth/login', { email, password });
    console.log(`✅ VETERINARIO ENCONTRADO: ${email} / ${password}`);
    return true;
  } catch (error) {
    return false;
  }
}

async function findVet() {
  console.log('Buscando credenciales de veterinarios...\n');
  
  const vets = ['vet@veterinaria.com', 'veterinario@veterinaria.com', 'juan.perez@veterinaria.com'];
  const passwords = ['vet123', 'veterinario123', 'password123', 'juan123', 'password', '123456'];
  
  for (const email of vets) {
    for (const password of passwords) {
      await testLogin(email, password);
    }
  }
}

findVet();
