const axios = require('axios');

const API_URL = 'http://localhost:3001/api';
let authToken = '';

// Datos ficticios de clientes
const clientes = [
  {
    firstName: 'María',
    lastName: 'González',
    email: 'maria.gonzalez@email.com',
    password: 'password123',
    documentType: 'Cédula',
    documentNumber: '1712345678',
    phone: '0991234567',
    address: 'Av. Amazonas N35-123',
    city: 'Quito',
    role: 'client'
  },
  {
    firstName: 'Carlos',
    lastName: 'Rodríguez',
    email: 'carlos.rodriguez@email.com',
    password: 'password123',
    documentType: 'Cédula',
    documentNumber: '1709876543',
    phone: '0998765432',
    address: 'Calle García Moreno 456',
    city: 'Quito',
    role: 'client'
  },
  {
    firstName: 'Ana',
    lastName: 'Martínez',
    email: 'ana.martinez@email.com',
    password: 'password123',
    documentType: 'Cédula',
    documentNumber: '1702345678',
    phone: '0987654321',
    address: 'Av. 6 de Diciembre y Patria',
    city: 'Quito',
    role: 'client'
  },
  {
    firstName: 'Juan',
    lastName: 'López',
    email: 'juan.lopez@email.com',
    password: 'password123',
    documentType: 'Cédula',
    documentNumber: '1705432167',
    phone: '0976543210',
    address: 'Calle Veintimilla 789',
    city: 'Quito',
    role: 'client'
  },
  {
    firstName: 'Laura',
    lastName: 'Pérez',
    email: 'laura.perez@email.com',
    password: 'password123',
    documentType: 'Cédula',
    documentNumber: '1703456789',
    phone: '0965432109',
    address: 'Av. República del Salvador N34-211',
    city: 'Quito',
    role: 'client'
  }
];

// Datos de mascotas por cliente
const mascotasPorCliente = {
  'maria.gonzalez@email.com': [
    {
      name: 'Max',
      species: 'dog',
      breed: 'Golden Retriever',
      birthDate: '2020-03-15',
      gender: 'male',
      weight: 30.5,
      color: 'Dorado',
      microchipNumber: 'CHIP001234',
      isNeutered: true,
      allergies: 'Ninguna conocida',
      specialConditions: 'Displasia de cadera leve'
    },
    {
      name: 'Luna',
      species: 'cat',
      breed: 'Siamés',
      birthDate: '2021-06-20',
      gender: 'female',
      weight: 4.2,
      color: 'Crema con puntos oscuros',
      microchipNumber: 'CHIP001235',
      isNeutered: true,
      allergies: 'Alergia al pollo'
    }
  ],
  'carlos.rodriguez@email.com': [
    {
      name: 'Rocky',
      species: 'dog',
      breed: 'Bulldog Francés',
      birthDate: '2019-11-10',
      gender: 'male',
      weight: 12.3,
      color: 'Negro y blanco',
      microchipNumber: 'CHIP001236',
      isNeutered: false,
      allergies: 'Alergia a ciertos granos',
      specialConditions: 'Problemas respiratorios leves'
    }
  ],
  'ana.martinez@email.com': [
    {
      name: 'Michi',
      species: 'cat',
      breed: 'Persa',
      birthDate: '2022-02-14',
      gender: 'female',
      weight: 3.8,
      color: 'Gris',
      microchipNumber: 'CHIP001237',
      isNeutered: false,
      allergies: 'Ninguna'
    },
    {
      name: 'Coco',
      species: 'bird',
      breed: 'Canario',
      birthDate: '2021-08-05',
      gender: 'male',
      weight: 0.025,
      color: 'Amarillo',
      isNeutered: false
    }
  ],
  'juan.lopez@email.com': [
    {
      name: 'Duke',
      species: 'dog',
      breed: 'Pastor Alemán',
      birthDate: '2018-05-20',
      gender: 'male',
      weight: 35.0,
      color: 'Negro y marrón',
      microchipNumber: 'CHIP001238',
      isNeutered: true,
      allergies: 'Ninguna',
      specialConditions: 'Artritis en desarrollo'
    },
    {
      name: 'Bella',
      species: 'dog',
      breed: 'Poodle',
      birthDate: '2020-12-01',
      gender: 'female',
      weight: 8.5,
      color: 'Blanco',
      microchipNumber: 'CHIP001239',
      isNeutered: true
    }
  ],
  'laura.perez@email.com': [
    {
      name: 'Nemo',
      species: 'rabbit',
      breed: 'Holland Lop',
      birthDate: '2022-09-10',
      gender: 'male',
      weight: 1.8,
      color: 'Blanco con manchas grises',
      isNeutered: false,
      specialConditions: 'Dientes en crecimiento continuo - requiere revisión dental regular'
    }
  ]
};

// Función para hacer login como admin
async function loginAsAdmin() {
  try {
    console.log('🔐 Iniciando sesión como administrador...');
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@veterinaria.com',
      password: 'admin123'
    });
    authToken = response.data.token;
    console.log('✅ Login exitoso como admin');
    return true;
  } catch (error) {
    console.error('❌ Error en login:', error.response?.data || error.message);
    return false;
  }
}

// Función para crear un cliente
async function createClient(clientData) {
  try {
    console.log(`👤 Creando cliente: ${clientData.firstName} ${clientData.lastName}...`);
    const response = await axios.post(
      `${API_URL}/users/admin-create`,
      clientData,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    console.log(`   ✅ Cliente creado: ${clientData.email}`);
    return response.data.user;
  } catch (error) {
    if (error.response?.status === 409 || error.response?.data?.message?.includes('already exists')) {
      console.log(`   ⚠️  Cliente ya existe: ${clientData.email}`);
      // Intentar obtener el cliente existente
      try {
        const usersResponse = await axios.get(
          `${API_URL}/users`,
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
        const existingUser = usersResponse.data.users?.find(u => u.email === clientData.email);
        if (existingUser) {
          return existingUser;
        }
      } catch (searchError) {
        console.log(`   ℹ️  Cliente existe pero no se pudo recuperar`);
      }
    } else {
      console.error(`   ❌ Error creando cliente:`, error.response?.data || error.message);
    }
    return null;
  }
}

// Función para crear una mascota
async function createPet(petData, ownerId) {
  try {
    console.log(`   🐾 Creando mascota: ${petData.name}...`);
    const petWithOwner = { ...petData, ownerId };
    const response = await axios.post(
      `${API_URL}/pets`,
      petWithOwner,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    console.log(`      ✅ Mascota creada: ${petData.name} (${petData.species})`);
    return response.data.pet;
  } catch (error) {
    console.error(`      ❌ Error creando mascota ${petData.name}:`, error.response?.data || error.message);
    return null;
  }
}

// Función para crear historias médicas de ejemplo
async function createMedicalHistory(petId, veterinarianId) {
  const histories = [
    {
      visitDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // Hace 30 días
      reasonForVisit: 'Chequeo general y vacunación anual',
      symptoms: 'Ninguno - visita preventiva',
      diagnosis: 'Paciente en buen estado de salud',
      treatment: 'Vacuna polivalente aplicada. Desparasitación oral.',
      weight: 25.5,
      temperature: 38.5,
      heartRate: 80,
      respiratoryRate: 20,
      physicalExamNotes: 'Mucosas rosadas, hidratación normal, ganglios no inflamados',
      followUpInstructions: 'Próxima vacuna en 12 meses'
    },
    {
      visitDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // Hace 7 días
      reasonForVisit: 'Vómitos y diarrea',
      symptoms: 'Vómitos ocasionales, diarrea leve, apetito disminuido',
      diagnosis: 'Gastroenteritis leve',
      treatment: 'Dieta blanda por 3 días. Probióticos. Hidratación oral.',
      weight: 24.8,
      temperature: 38.8,
      heartRate: 85,
      respiratoryRate: 22,
      physicalExamNotes: 'Leve deshidratación, abdomen sensible a la palpación',
      followUpInstructions: 'Control en 5 días si no hay mejoría'
    }
  ];

  for (const history of histories) {
    try {
      await axios.post(
        `${API_URL}/medical-history`,
        { ...history, petId, veterinarianId },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      console.log(`         📋 Historia médica creada`);
    } catch (error) {
      console.error(`         ❌ Error creando historia médica:`, error.response?.data?.message || error.message);
    }
  }
}

// Función para crear citas
async function createAppointments(petId, veterinarianId) {
  const appointments = [
    {
      appointmentDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // En 2 días
      startTime: '10:00',
      endTime: '10:30',
      type: 'checkup',
      status: 'scheduled',
      reason: 'Control post-tratamiento gastroenteritis',
      estimatedCost: 25.00
    },
    {
      appointmentDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // En 7 días
      startTime: '15:00',
      endTime: '15:30',
      type: 'grooming',
      status: 'scheduled',
      reason: 'Baño y corte de pelo',
      estimatedCost: 35.00
    }
  ];

  for (const appointment of appointments) {
    try {
      await axios.post(
        `${API_URL}/appointments`,
        { ...appointment, petId, veterinarianId },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      console.log(`         📅 Cita creada para ${appointment.reason}`);
    } catch (error) {
      console.error(`         ❌ Error creando cita:`, error.response?.data?.message || error.message);
    }
  }
}

// Función para crear una hospitalización de prueba
async function createHospitalization(petId, veterinarianId) {
  try {
    const hospitalization = {
      admissionDate: new Date().toISOString(),
      diagnosis: 'Fractura de pata delantera derecha',
      reasonForAdmission: 'Cirugía y recuperación post-operatoria',
      treatmentPlan: 'Cirugía ortopédica, antibióticos profilácticos, analgésicos, reposo absoluto por 2 semanas'
    };

    const response = await axios.post(
      `${API_URL}/hospitalizations`,
      { ...hospitalization, petId, veterinarianId },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );

    console.log(`         🏥 Hospitalización creada`);
    return response.data.hospitalization;
  } catch (error) {
    console.error(`         ❌ Error creando hospitalización:`, error.response?.data?.message || error.message);
    return null;
  }
}

// Función principal
async function populateTestData() {
  console.log('🚀 INICIANDO POBLACIÓN DE DATOS DE PRUEBA');
  console.log('=' .repeat(50));

  // Login como admin
  const loginSuccess = await loginAsAdmin();
  if (!loginSuccess) {
    console.error('No se pudo iniciar sesión. Abortando...');
    return;
  }

  // Usar un ID fijo para el veterinario (admin)
  // Como sabemos que el admin existe, usaremos su ID directamente
  let veterinarianId = 'aa6126ff-a3a8-4c67-ab20-6066c5ddc810'; // ID del admin de los logs
  console.log(`👨‍⚕️ Usando veterinario admin con ID: ${veterinarianId}\n`);

  console.log('📝 CREANDO CLIENTES Y MASCOTAS');
  console.log('-'.repeat(50));

  // Crear clientes y sus mascotas
  for (const cliente of clientes) {
    const createdClient = await createClient(cliente);

    if (createdClient && createdClient.id) {
      const mascotas = mascotasPorCliente[cliente.email] || [];

      for (const mascota of mascotas) {
        const createdPet = await createPet(mascota, createdClient.id);

        // Crear datos adicionales solo para algunas mascotas
        if (createdPet && createdPet.id && Math.random() > 0.5) {
          console.log(`      📊 Agregando datos médicos...`);
          await createMedicalHistory(createdPet.id, veterinarianId);
          await createAppointments(createdPet.id, veterinarianId);

          // Crear hospitalización solo para una mascota
          if (mascota.name === 'Max') {
            await createHospitalization(createdPet.id, veterinarianId);
          }
        }
      }
    }
    console.log(''); // Línea en blanco entre clientes
  }

  console.log('=' .repeat(50));
  console.log('✅ POBLACIÓN DE DATOS COMPLETADA');
  console.log('\n📋 RESUMEN:');
  console.log(`   - ${clientes.length} clientes creados/verificados`);
  console.log(`   - ${Object.values(mascotasPorCliente).flat().length} mascotas en total`);
  console.log('\n🔍 DATOS DE BÚSQUEDA PARA PRUEBAS:');
  console.log('   Cédulas: 1712345678, 1709876543, 1702345678');
  console.log('   Nombres: María, Carlos, Ana, Juan, Laura');
  console.log('   Mascotas: Max, Luna, Rocky, Michi, Duke');
  console.log('   Emails: maria.gonzalez@email.com, carlos.rodriguez@email.com');
}

// Ejecutar el script
populateTestData()
  .then(() => {
    console.log('\n✨ Script finalizado exitosamente');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Error fatal:', error);
    process.exit(1);
  });