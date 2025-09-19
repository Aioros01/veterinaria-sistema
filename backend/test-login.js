const axios = require('axios');

async function testLogin(email, password) {
  try {
    const response = await axios.post('http://localhost:3001/api/auth/login', {
      email,
      password
    });
    console.log(`✅ LOGIN EXITOSO: ${email} / ${password}`);
    return true;
  } catch (error) {
    console.log(`❌ LOGIN FALLIDO: ${email} / ${password}`);
    if (error.response) {
      console.log(`   Error: ${error.response.data.message}`);
    }
    return false;
  }
}

async function test() {
  console.log('=== PROBANDO CREDENCIALES ===\n');
  
  // Probar las credenciales que di
  await testLogin('admin@veterinaria.com', 'Admin123!');
  await testLogin('vet@veterinaria.com', 'Vet123!');
  
  // Probar otras posibles
  await testLogin('admin@veterinaria.com', 'admin123');
  await testLogin('admin@veterinaria.com', 'password');
  await testLogin('admin@veterinaria.com', 'Password123');
}

test();
