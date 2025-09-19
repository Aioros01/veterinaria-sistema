const { AppDataSource } = require('./dist/config/database');

async function analyzeSystem() {
  try {
    console.log('=== ANÁLISIS COMPLETO DEL SISTEMA DE MEDICAMENTOS ===\n');
    await AppDataSource.initialize();

    // 1. Medicamentos en stock
    console.log('📦 MEDICAMENTOS EN INVENTARIO:');
    const medicines = await AppDataSource.query(`
      SELECT name, "currentStock", "minimumStock", "unitPrice"
      FROM medicines
      ORDER BY name
    `);
    medicines.forEach(m => {
      const status = m.currentStock <= m.minimumStock ? '🔴 STOCK BAJO' : '✅';
      console.log(`  ${status} ${m.name}: ${m.currentStock} unidades (mín: ${m.minimumStock}) - $${m.unitPrice}`);
    });

    // 2. Prescripciones
    console.log('\n💊 PRESCRIPCIONES:');
    const prescriptions = await AppDataSource.query(`
      SELECT "medicineName", quantity, "purchaseStatus"
      FROM prescriptions
      LIMIT 10
    `);
    prescriptions.forEach(p => {
      console.log(`  - ${p.medicineName}: ${p.quantity} unidades (Estado: ${p.purchaseStatus})`);
    });

    // 3. Ventas registradas
    console.log('\n🛒 VENTAS DE MEDICAMENTOS:');
    const salesCount = await AppDataSource.query(`SELECT COUNT(*) as count FROM medicine_sales`);
    console.log(`  Total ventas registradas: ${salesCount[0].count}`);

    if (salesCount[0].count > 0) {
      const sales = await AppDataSource.query(`
        SELECT ms.quantity, ms."purchaseLocation", ms."finalPrice", m.name
        FROM medicine_sales ms
        LEFT JOIN medicines m ON ms."medicineId" = m.id
        LIMIT 5
      `);
      sales.forEach(s => {
        console.log(`  - ${s.name || 'Medicina'}: ${s.quantity} unidades, ${s.purchaseLocation}, $${s.finalPrice}`);
      });
    }

    await AppDataSource.destroy();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

analyzeSystem();