const axios = require('axios');

const API_URL = 'http://localhost:3001/api';

async function resetVetPassword() {
  console.log('🔐 Resetting veterinarian password...\n');

  try {
    // Login as admin
    console.log('Logging in as admin...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@veterinaria.com',
      password: 'admin123'
    });

    const adminToken = loginResponse.data.token;
    console.log('✅ Logged in as admin\n');

    // Reset vet password
    const vetId = 'f07f07b7-39b5-4468-9903-a4d57b034976'; // vet@veterinaria.com
    console.log('Resetting password for vet@veterinaria.com...');

    const resetResponse = await axios.post(
      `${API_URL}/users/${vetId}/reset-password`,
      { newPassword: 'vet123' },
      {
        headers: { Authorization: `Bearer ${adminToken}` }
      }
    );

    console.log('✅ Password reset successfully!');
    console.log('\n📝 New credentials:');
    console.log('  Email: vet@veterinaria.com');
    console.log('  Password: vet123');

  } catch (error) {
    console.error('❌ Failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Run
resetVetPassword().then(() => {
  console.log('\n✅ Done!');
}).catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});