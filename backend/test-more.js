const axios = require('axios');

async function testLogin(email, password) {
  try {
    await axios.post('http://localhost:3001/api/auth/login', { email, password });
    console.log(`✅ CORRECTO: ${email} / ${password}`);
    return true;
  } catch (error) {
    console.log(`❌ INCORRECTO: ${email} / ${password}`);
    return false;
  }
}

async function test() {
  console.log('=== PROBANDO MÁS CREDENCIALES ===\n');
  
  // Probar veterinarios con contraseñas simples
  await testLogin('vet@veterinaria.com', 'vet123');
  await testLogin('vet@veterinaria.com', 'veterinario123');
  await testLogin('veterinario@veterinaria.com', 'veterinario123');
  await testLogin('juan.perez@veterinaria.com', 'juan123');
  await testLogin('juan.perez@veterinaria.com', 'perez123');
  
  // Probar clientes
  await testLogin('cliente@example.com', 'cliente123');
  await testLogin('maria@example.com', 'maria123');
  await testLogin('carlos@example.com', 'carlos123');
}

test();
