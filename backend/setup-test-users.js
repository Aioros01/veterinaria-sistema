const axios = require('axios');

const API_URL = 'http://localhost:3001/api';

async function setupTestUsers() {
  console.log('🔧 Setting up test users...\n');

  try {
    // 1. Login as admin
    console.log('1️⃣ Login as admin...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@veterinaria.com',
      password: 'admin123'
    });

    const adminToken = loginResponse.data.token;
    console.log('✅ Logged in as admin\n');

    // 2. Create a veterinarian
    console.log('2️⃣ Creating veterinarian user...');
    try {
      const vetResponse = await axios.post(
        `${API_URL}/users/admin-create`,
        {
          email: 'vet@veterinaria.com',
          password: 'vet123',
          firstName: 'Juan',
          lastName: 'Veterinario',
          role: 'veterinarian',
          phone: '555-1234'
        },
        {
          headers: { Authorization: `Bearer ${adminToken}` }
        }
      );
      console.log('✅ Veterinarian created:', vetResponse.data.user.email);
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
        console.log('⚠️ Veterinarian already exists');
      } else {
        throw error;
      }
    }

    // 3. Create another veterinarian for testing
    console.log('\n3️⃣ Creating second veterinarian...');
    try {
      const vet2Response = await axios.post(
        `${API_URL}/users/admin-create`,
        {
          email: 'vet2@veterinaria.com',
          password: 'vet123',
          firstName: 'Maria',
          lastName: 'Veterinaria',
          role: 'veterinarian',
          phone: '555-5678'
        },
        {
          headers: { Authorization: `Bearer ${adminToken}` }
        }
      );
      console.log('✅ Second veterinarian created:', vet2Response.data.user.email);
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
        console.log('⚠️ Second veterinarian already exists');
      } else {
        throw error;
      }
    }

    // 4. Create a client
    console.log('\n4️⃣ Creating client user...');
    try {
      const clientResponse = await axios.post(
        `${API_URL}/users/admin-create`,
        {
          email: 'cliente@test.com',
          password: 'cliente123',
          firstName: 'Pedro',
          lastName: 'Cliente',
          role: 'client',
          phone: '555-9999'
        },
        {
          headers: { Authorization: `Bearer ${adminToken}` }
        }
      );
      console.log('✅ Client created:', clientResponse.data.user.email);
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
        console.log('⚠️ Client already exists');
      } else {
        throw error;
      }
    }

    console.log('\n✨ Test users setup completed!');
    console.log('\n📝 Test credentials:');
    console.log('  Admin: admin@veterinaria.com / admin123');
    console.log('  Vet 1: vet@veterinaria.com / vet123');
    console.log('  Vet 2: vet2@veterinaria.com / vet123');
    console.log('  Client: cliente@test.com / cliente123');

  } catch (error) {
    console.error('\n❌ Setup failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Run setup
setupTestUsers().then(() => {
  console.log('\n🎉 Setup completed successfully!');
}).catch(error => {
  console.error('❌ Setup runner failed:', error);
  process.exit(1);
});