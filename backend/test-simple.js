const axios = require('axios');

const API_URL = 'http://localhost:3001/api';

async function test() {
  try {
    // Login as vet
    console.log('Login as vet...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'vet@veterinaria.com',
      password: 'vet123'
    });
    console.log('✅ Login successful');

    const token = loginResponse.data.token;

    // Try create client
    console.log('\nTrying to create client...');
    const createResponse = await axios.post(
      `${API_URL}/users/create-client`,
      {
        email: `test-${Date.now()}@test.com`,
        password: 'test123',
        firstName: 'Test',
        lastName: 'Client',
        phone: '555-1111'
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    console.log('✅ Client created:', createResponse.data);

    // Test reset password on a client
    console.log('\nGetting users...');
    const usersResponse = await axios.get(`${API_URL}/users`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const clients = (usersResponse.data.users || usersResponse.data).filter(u => u.role === 'client');

    if (clients.length > 0) {
      const client = clients[0];
      console.log(`\nResetting password for client: ${client.email}...`);

      const resetResponse = await axios.post(
        `${API_URL}/users/${client.id}/reset-password`,
        { newPassword: 'newpass123' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('✅ Password reset:', resetResponse.data);
    }

    console.log('\n✨ All tests passed!');
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

test();