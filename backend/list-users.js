const axios = require('axios');

const API_URL = 'http://localhost:3001/api';

async function listUsers() {
  console.log('📋 Listing all users...\n');

  try {
    // Login as admin
    console.log('Logging in as admin...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@veterinaria.com',
      password: 'admin123'
    });

    const adminToken = loginResponse.data.token;
    console.log('✅ Logged in as admin\n');

    // Get all users
    console.log('Getting users list...');
    const usersResponse = await axios.get(`${API_URL}/users`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    console.log('\n📋 USERS IN DATABASE:\n');
    console.log('='.repeat(60));

    const users = usersResponse.data.users || usersResponse.data;

    if (!Array.isArray(users)) {
      console.log('Response data:', JSON.stringify(usersResponse.data, null, 2));
      return;
    }

    users.forEach(user => {
      console.log(`
ID: ${user.id}
Email: ${user.email}
Name: ${user.firstName} ${user.lastName}
Role: ${user.role}
Active: ${user.isActive}
${'-'.repeat(60)}`);
    });

    // Count by role
    const roleCount = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});

    console.log('\n📊 SUMMARY:');
    Object.entries(roleCount).forEach(([role, count]) => {
      console.log(`  ${role}: ${count} users`);
    });
    console.log(`  Total: ${users.length} users`);

  } catch (error) {
    console.error('❌ Failed to list users:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Run
listUsers().then(() => {
  console.log('\n✅ Done!');
}).catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});