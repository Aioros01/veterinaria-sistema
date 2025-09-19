"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const bcrypt = __importStar(require("bcrypt"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
async function seedDatabase() {
    const dataSource = new typeorm_1.DataSource({
        type: 'postgres',
        url: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        },
        synchronize: false,
        logging: true
    });
    try {
        console.log('🌱 Iniciando población de base de datos...');
        await dataSource.initialize();
        console.log('✅ Conexión establecida');
        // Limpiar datos existentes (opcional)
        console.log('🧹 Limpiando datos de prueba anteriores...');
        // Hashear contraseñas
        const hashedPassword = await bcrypt.hash('password123', 10);
        const adminPassword = await bcrypt.hash('admin123', 10);
        const vetPassword = await bcrypt.hash('vet123', 10);
        // Crear usuarios
        console.log('👥 Creando usuarios...');
        // Admin
        const adminResult = await dataSource.query(`
      INSERT INTO users (
        id, "firstName", "lastName", email, password, phone, 
        address, city, "postalCode", role, "isActive",
        "emailNotifications", "whatsappNotifications",
        "createdAt", "updatedAt"
      ) VALUES (
        gen_random_uuid(),
        'Admin',
        'Sistema',
        'admin@veterinaria.com',
        $1,
        '555-0001',
        'Calle Principal 123',
        'Ciudad Central',
        '10001',
        'admin',
        true,
        true,
        false,
        NOW(),
        NOW()
      ) ON CONFLICT (email) DO UPDATE SET
        password = $1,
        "updatedAt" = NOW()
      RETURNING id
    `, [adminPassword]);
        const adminId = adminResult[0]?.id;
        console.log('✅ Admin creado');
        // Veterinario
        const vetResult = await dataSource.query(`
      INSERT INTO users (
        id, "firstName", "lastName", email, password, phone, 
        address, city, "postalCode", role, "isActive",
        "emailNotifications", "whatsappNotifications",
        "createdAt", "updatedAt"
      ) VALUES (
        gen_random_uuid(),
        'Dr. Juan',
        'Pérez',
        'veterinario@veterinaria.com',
        $1,
        '555-0002',
        'Av. Médica 456',
        'Ciudad Central',
        '10002',
        'veterinarian',
        true,
        true,
        true,
        NOW(),
        NOW()
      ) ON CONFLICT (email) DO UPDATE SET
        password = $1,
        "updatedAt" = NOW()
      RETURNING id
    `, [vetPassword]);
        const vetId = vetResult[0]?.id;
        console.log('✅ Veterinario creado');
        // Cliente 1
        const client1Result = await dataSource.query(`
      INSERT INTO users (
        id, "firstName", "lastName", email, password, phone, 
        address, city, "postalCode", role, "isActive",
        "emailNotifications", "whatsappNotifications",
        "createdAt", "updatedAt"
      ) VALUES (
        gen_random_uuid(),
        'María',
        'García',
        'maria@example.com',
        $1,
        '555-1001',
        'Calle Flores 789',
        'Ciudad Norte',
        '10003',
        'cliente',
        true,
        true,
        true,
        NOW(),
        NOW()
      ) ON CONFLICT (email) DO UPDATE SET
        password = $1,
        "updatedAt" = NOW()
      RETURNING id
    `, [hashedPassword]);
        const client1Id = client1Result[0]?.id;
        console.log('✅ Cliente María creado');
        // Cliente 2
        const client2Result = await dataSource.query(`
      INSERT INTO users (
        id, "firstName", "lastName", email, password, phone, 
        address, city, "postalCode", role, "isActive",
        "emailNotifications", "whatsappNotifications",
        "createdAt", "updatedAt"
      ) VALUES (
        gen_random_uuid(),
        'Carlos',
        'López',
        'carlos@example.com',
        $1,
        '555-1002',
        'Av. Parque 321',
        'Ciudad Sur',
        '10004',
        'cliente',
        true,
        false,
        true,
        NOW(),
        NOW()
      ) ON CONFLICT (email) DO UPDATE SET
        password = $1,
        "updatedAt" = NOW()
      RETURNING id
    `, [hashedPassword]);
        const client2Id = client2Result[0]?.id;
        console.log('✅ Cliente Carlos creado');
        // Crear mascotas solo si tenemos IDs de clientes
        if (client1Id && client2Id) {
            console.log('🐾 Creando mascotas...');
            // Mascota 1 - Perro de María
            const pet1Result = await dataSource.query(`
        INSERT INTO pets (
          id, name, species, breed, "birthDate", gender, 
          weight, color, "microchipNumber", "isNeutered",
          "isActive", "ownerId", "createdAt", "updatedAt",
          "createdBy", "updatedBy"
        ) VALUES (
          gen_random_uuid(),
          'Max',
          'dog',
          'Labrador Retriever',
          '2020-03-15',
          'male',
          25.5,
          'Dorado',
          'CHIP123456789',
          true,
          true,
          $1::uuid,
          NOW(),
          NOW(),
          $2,
          $3
        ) ON CONFLICT DO NOTHING
        RETURNING id
      `, [client1Id, client1Id, client1Id]);
            const pet1Id = pet1Result[0]?.id;
            if (pet1Id)
                console.log('✅ Mascota Max creada');
            // Mascota 2 - Gato de María
            const pet2Result = await dataSource.query(`
        INSERT INTO pets (
          id, name, species, breed, "birthDate", gender, 
          weight, color, "isNeutered",
          "isActive", "ownerId", "createdAt", "updatedAt",
          "createdBy", "updatedBy"
        ) VALUES (
          gen_random_uuid(),
          'Luna',
          'cat',
          'Siamés',
          '2021-07-20',
          'female',
          4.2,
          'Crema con puntos oscuros',
          false,
          true,
          $1::uuid,
          NOW(),
          NOW(),
          $2,
          $3
        ) ON CONFLICT DO NOTHING
        RETURNING id
      `, [client1Id, client1Id, client1Id]);
            const pet2Id = pet2Result[0]?.id;
            if (pet2Id)
                console.log('✅ Mascota Luna creada');
            // Mascota 3 - Perro de Carlos
            const pet3Result = await dataSource.query(`
        INSERT INTO pets (
          id, name, species, breed, "birthDate", gender, 
          weight, color, "isNeutered",
          "isActive", "ownerId", "createdAt", "updatedAt",
          "createdBy", "updatedBy"
        ) VALUES (
          gen_random_uuid(),
          'Rocky',
          'dog',
          'Bulldog Francés',
          '2019-11-10',
          'male',
          12.3,
          'Atigrado',
          true,
          true,
          $1::uuid,
          NOW(),
          NOW(),
          $2,
          $3
        ) ON CONFLICT DO NOTHING
        RETURNING id
      `, [client2Id, client2Id, client2Id]);
            const pet3Id = pet3Result[0]?.id;
            if (pet3Id)
                console.log('✅ Mascota Rocky creada');
            // Crear citas si tenemos mascotas y veterinario
            if (vetId && pet1Id && pet2Id && pet3Id) {
                console.log('📅 Creando citas...');
                // Cita futura para Max
                await dataSource.query(`
          INSERT INTO appointments (
            id, "appointmentDate", "startTime", "endTime",
            type, status, reason, "petId", "veterinarianId",
            "createdAt", "updatedAt", "createdBy", "updatedBy"
          ) VALUES (
            gen_random_uuid(),
            CURRENT_DATE + INTERVAL '3 days',
            '10:00',
            '10:30',
            'checkup',
            'scheduled',
            'Chequeo anual y vacunación',
            $1,
            $2,
            NOW(),
            NOW(),
            $3,
            $3
          ) ON CONFLICT DO NOTHING
        `, [pet1Id, vetId, client1Id]);
                console.log('✅ Cita para Max creada');
                // Cita futura para Luna
                await dataSource.query(`
          INSERT INTO appointments (
            id, "appointmentDate", "startTime", "endTime",
            type, status, reason, "petId", "veterinarianId",
            "createdAt", "updatedAt", "createdBy", "updatedBy"
          ) VALUES (
            gen_random_uuid(),
            CURRENT_DATE + INTERVAL '5 days',
            '15:00',
            '15:30',
            'vaccination',
            'scheduled',
            'Vacuna triple felina',
            $1,
            $2,
            NOW(),
            NOW(),
            $3,
            $3
          ) ON CONFLICT DO NOTHING
        `, [pet2Id, vetId, client1Id]);
                console.log('✅ Cita para Luna creada');
                // Historial médico para Max
                console.log('📋 Creando historiales médicos...');
                await dataSource.query(`
          INSERT INTO medical_histories (
            id, "visitDate", "reasonForVisit", symptoms, 
            diagnosis, treatment, weight, temperature,
            "heartRate", "respiratoryRate", "physicalExamNotes",
            "followUpInstructions", "petId", "veterinarianId",
            "createdAt", "updatedAt", "createdBy", "updatedBy"
          ) VALUES (
            gen_random_uuid(),
            CURRENT_DATE - INTERVAL '30 days',
            'Vacunación anual',
            'Ninguno - Visita de rutina',
            'Paciente sano',
            'Aplicación de vacuna antirrábica y polivalente',
            25.2,
            38.5,
            80,
            20,
            'Paciente en buen estado general. Mucosas rosadas, hidratación normal.',
            'Regresar en un año para siguiente vacunación',
            $1,
            $2,
            NOW(),
            NOW(),
            $2,
            $2
          ) ON CONFLICT DO NOTHING
        `, [pet1Id, vetId]);
                console.log('✅ Historial médico para Max creado');
                // Vacunaciones para Max
                console.log('💉 Creando registros de vacunación...');
                await dataSource.query(`
          INSERT INTO vaccinations (
            id, "vaccineName", "vaccinationDate", "nextDueDate",
            "batchNumber", notes, "petId", "veterinarianId",
            "createdAt", "updatedAt", "createdBy", "updatedBy"
          ) VALUES (
            gen_random_uuid(),
            'Antirrábica',
            CURRENT_DATE - INTERVAL '30 days',
            CURRENT_DATE + INTERVAL '335 days',
            'BATCH-2024-001',
            'Aplicada sin complicaciones',
            $1,
            $2,
            NOW(),
            NOW(),
            $2,
            $2
          ) ON CONFLICT DO NOTHING
        `, [pet1Id, vetId]);
                console.log('✅ Vacunación para Max creada');
            }
            // Crear medicamentos
            console.log('💊 Creando medicamentos...');
            await dataSource.query(`
        INSERT INTO medicines (
          id, name, "activeIngredient", presentation,
          concentration, "laboratoryName", category,
          "minimumStock", "currentStock", "unitPrice",
          "requiresPrescription", "storageConditions",
          "isActive", "createdAt", "updatedAt"
        ) VALUES 
        (
          gen_random_uuid(),
          'Amoxicilina',
          'Amoxicilina trihidrato',
          'Tabletas',
          '500mg',
          'Lab Veterinario SA',
          'antibiotic',
          10,
          50,
          15.99,
          true,
          'Mantener en lugar fresco y seco',
          true,
          NOW(),
          NOW()
        ),
        (
          gen_random_uuid(),
          'Carprofeno',
          'Carprofeno',
          'Tabletas',
          '50mg',
          'PetMeds Lab',
          'antiinflammatory',
          5,
          25,
          35.50,
          true,
          'Temperatura ambiente',
          true,
          NOW(),
          NOW()
        ),
        (
          gen_random_uuid(),
          'Frontline Plus',
          'Fipronil + S-metopreno',
          'Pipeta',
          '2.68ml',
          'Boehringer Ingelheim',
          'antiparasitic',
          20,
          45,
          28.99,
          false,
          'No exponer a altas temperaturas',
          true,
          NOW(),
          NOW()
        )
        ON CONFLICT DO NOTHING
      `);
            console.log('✅ Medicamentos creados');
        }
        console.log('\n🎉 Base de datos poblada exitosamente!');
        console.log('\n📝 Credenciales de acceso:');
        console.log('================================');
        console.log('Admin:');
        console.log('  Email: admin@veterinaria.com');
        console.log('  Password: admin123');
        console.log('\nVeterinario:');
        console.log('  Email: veterinario@veterinaria.com');
        console.log('  Password: vet123');
        console.log('\nCliente 1 (María):');
        console.log('  Email: maria@example.com');
        console.log('  Password: password123');
        console.log('\nCliente 2 (Carlos):');
        console.log('  Email: carlos@example.com');
        console.log('  Password: password123');
        console.log('================================\n');
        await dataSource.destroy();
        console.log('✅ Conexión cerrada');
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}
seedDatabase();
//# sourceMappingURL=seedDatabase.js.map