const { AppDataSource } = require('./dist/config/database');

async function addTestMedicines() {
  try {
    console.log('🔌 Conectando a la base de datos...');
    await AppDataSource.initialize();

    const medicines = [
      {
        name: 'Amoxicilina 500mg',
        genericName: 'Amoxicilina',
        manufacturer: 'Laboratorio Bayer',
        category: 'antibiotic',
        description: 'Antibiótico de amplio espectro',
        presentation: 'Tabletas',
        concentration: '500mg',
        unitPrice: 2.50,
        currentStock: 5,  // STOCK BAJO para pruebas
        minimumStock: 10,
        maximumStock: 200,
        supplier: 'Distribuidora Farmacéutica',
        expirationDate: '2025-12-31',
        storageConditions: 'Lugar fresco y seco',
        isActive: true
      },
      {
        name: 'Ibuprofeno 400mg',
        genericName: 'Ibuprofeno',
        manufacturer: 'Laboratorio Pfizer',
        category: 'anti_inflammatory',
        description: 'Antiinflamatorio y analgésico',
        presentation: 'Tabletas',
        concentration: '400mg',
        unitPrice: 1.75,
        currentStock: 25,  // STOCK SUFICIENTE
        minimumStock: 15,
        maximumStock: 150,
        supplier: 'Farmacéutica Central',
        expirationDate: '2025-08-15',
        storageConditions: 'Temperatura ambiente',
        isActive: true
      },
      {
        name: 'Simparica 20mg',
        genericName: 'Sarolaner',
        manufacturer: 'Zoetis',
        category: 'antiparasitic',
        description: 'Antiparasitario para perros medianos',
        presentation: 'Tabletas masticables',
        concentration: '20mg',
        unitPrice: 18.50,
        currentStock: 0,  // SIN STOCK para pruebas
        minimumStock: 5,
        maximumStock: 50,
        supplier: 'Veterinaria Distribuidora',
        expirationDate: '2026-03-20',
        storageConditions: 'Lugar fresco y seco',
        isActive: true
      },
      {
        name: 'Meloxicam 1.5mg',
        genericName: 'Meloxicam',
        manufacturer: 'Boehringer Ingelheim',
        category: 'anti_inflammatory',
        description: 'Antiinflamatorio no esteroideo para perros',
        presentation: 'Suspensión oral',
        concentration: '1.5mg/ml',
        unitPrice: 12.30,
        currentStock: 100,  // STOCK ALTO
        minimumStock: 20,
        maximumStock: 200,
        supplier: 'Veterinaria Premium',
        expirationDate: '2025-11-30',
        storageConditions: 'Refrigerado',
        isActive: true
      },
      {
        name: 'Metacam 5mg',
        genericName: 'Meloxicam',
        manufacturer: 'Boehringer Ingelheim',
        category: 'anti_inflammatory',
        description: 'Antiinflamatorio para perros grandes',
        presentation: 'Tabletas',
        concentration: '5mg',
        unitPrice: 3.20,
        currentStock: 8,  // STOCK BAJO
        minimumStock: 12,
        maximumStock: 100,
        supplier: 'Farmacéutica Veterinaria',
        expirationDate: '2025-09-15',
        storageConditions: 'Lugar fresco y seco',
        isActive: true
      },
      {
        name: 'Nexgard 28.3mg',
        genericName: 'Afoxolaner',
        manufacturer: 'Merial',
        category: 'antiparasitic',
        description: 'Antiparasitario para perros grandes',
        presentation: 'Tabletas masticables',
        concentration: '28.3mg',
        unitPrice: 22.00,
        currentStock: 15,  // STOCK NORMAL
        minimumStock: 8,
        maximumStock: 60,
        supplier: 'Distribuidora Veterinaria',
        expirationDate: '2026-01-10',
        storageConditions: 'Temperatura ambiente',
        isActive: true
      },
      {
        name: 'Vitamina B Complex',
        genericName: 'Complejo B',
        manufacturer: 'Laboratorio Nacional',
        category: 'vitamin',
        description: 'Complejo vitamínico B para mascotas',
        presentation: 'Solución inyectable',
        concentration: '2ml',
        unitPrice: 4.80,
        currentStock: 2,  // STOCK CRÍTICO
        minimumStock: 15,
        maximumStock: 80,
        supplier: 'Farmacéutica Local',
        expirationDate: '2025-06-30',
        storageConditions: 'Refrigerado, protegido de la luz',
        isActive: true
      }
    ];

    console.log('📦 Agregando medicamentos de prueba...');

    for (const medicine of medicines) {
      try {
        await AppDataSource.query(`
          INSERT INTO medicines (
            name, "genericName", manufacturer, category, description,
            presentation, concentration, "unitPrice", "currentStock",
            "minimumStock", "maximumStock", supplier, "expirationDate",
            "storageConditions", "isActive", "createdAt", "updatedAt"
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW(), NOW()
          )
        `, [
          medicine.name, medicine.genericName, medicine.manufacturer,
          medicine.category, medicine.description, medicine.presentation,
          medicine.concentration, medicine.unitPrice, medicine.currentStock,
          medicine.minimumStock, medicine.maximumStock, medicine.supplier,
          medicine.expirationDate, medicine.storageConditions, medicine.isActive
        ]);

        console.log(`✅ Agregado: ${medicine.name} (Stock: ${medicine.currentStock})`);
      } catch (error) {
        if (error.message.includes('duplicate key')) {
          console.log(`⚠️  Ya existe: ${medicine.name}`);
        } else {
          console.error(`❌ Error agregando ${medicine.name}:`, error.message);
        }
      }
    }

    console.log('\n📊 RESUMEN DE MEDICAMENTOS PARA PRUEBAS:');
    console.log('🔴 SIN STOCK: Simparica 20mg (0 unidades)');
    console.log('🟡 STOCK BAJO: Amoxicilina 500mg (5/10), Metacam 5mg (8/12), Vitamina B Complex (2/15)');
    console.log('🟢 STOCK NORMAL: Ibuprofeno 400mg (25/15), Nexgard 28.3mg (15/8)');
    console.log('🟢 STOCK ALTO: Meloxicam 1.5mg (100/20)');

    await AppDataSource.destroy();
    console.log('\n✅ ¡Medicamentos agregados exitosamente!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

addTestMedicines();