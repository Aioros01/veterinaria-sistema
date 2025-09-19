const { AppDataSource } = require('./dist/config/database');

async function checkDatabase() {
  try {
    console.log('Conectando a CockroachDB...');
    await AppDataSource.initialize();

    // Verificar tablas
    const tables = await AppDataSource.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    console.log('\n✅ TABLAS EN COCKROACHDB:');
    console.log('========================');
    tables.forEach(t => console.log('  - ' + t.table_name));

    // Verificar usuarios
    try {
      const users = await AppDataSource.query(`SELECT email, role FROM users`);
      console.log('\n✅ USUARIOS EXISTENTES:');
      console.log('======================');
      if (users.length > 0) {
        users.forEach(u => console.log('  - ' + u.email + ' (rol: ' + u.role + ')'));
      } else {
        console.log('  ⚠️ No hay usuarios creados');
      }
    } catch (e) {
      console.log('\n⚠️ Tabla users no existe o está vacía');
    }

    // Verificar tabla medicine_sales
    try {
      await AppDataSource.query(`SELECT COUNT(*) FROM medicine_sales`);
      console.log('\n✅ Tabla medicine_sales: EXISTE');
    } catch (e) {
      console.log('\n⚠️ Tabla medicine_sales: NO EXISTE');
    }

    // Verificar tabla medicines
    try {
      const medicines = await AppDataSource.query(`SELECT COUNT(*) as count FROM medicines`);
      console.log('✅ Tabla medicines: EXISTE (' + medicines[0].count + ' registros)');
    } catch (e) {
      console.log('⚠️ Tabla medicines: NO EXISTE');
    }

    await AppDataSource.destroy();
    console.log('\n✅ Conexión cerrada correctamente');
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  }
}

checkDatabase();