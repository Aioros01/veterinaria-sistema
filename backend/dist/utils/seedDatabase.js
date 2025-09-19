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
const database_1 = require("../config/database");
const User_1 = require("../entities/User");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const seedDatabase = async () => {
    try {
        await database_1.AppDataSource.initialize();
        console.log('📊 Connected to database');
        const userRepository = database_1.AppDataSource.getRepository(User_1.User);
        // Check if admin exists
        const adminExists = await userRepository.findOne({
            where: { email: 'admin@veterinaria.com' }
        });
        if (!adminExists) {
            // Create admin user
            const admin = userRepository.create({
                firstName: 'Admin',
                lastName: 'Sistema',
                email: 'admin@veterinaria.com',
                password: 'admin123',
                phone: '+1234567890',
                address: 'Veterinaria Central',
                role: User_1.UserRole.ADMIN,
                isActive: true,
                emailNotifications: true,
                whatsappNotifications: true
            });
            await userRepository.save(admin);
            console.log('✅ Admin user created successfully');
            console.log('📧 Email: admin@veterinaria.com');
            console.log('🔐 Password: admin123');
        }
        else {
            console.log('ℹ️ Admin user already exists');
        }
        // Create sample veterinarian
        const vetExists = await userRepository.findOne({
            where: { email: 'vet@veterinaria.com' }
        });
        if (!vetExists) {
            const veterinarian = userRepository.create({
                firstName: 'Dr. Juan',
                lastName: 'Pérez',
                email: 'vet@veterinaria.com',
                password: 'vet123',
                phone: '+1234567891',
                address: 'Consultorio 1',
                role: User_1.UserRole.VETERINARIAN,
                isActive: true,
                emailNotifications: true,
                whatsappNotifications: true
            });
            await userRepository.save(veterinarian);
            console.log('✅ Veterinarian user created');
        }
        // Create sample receptionist
        const receptionistExists = await userRepository.findOne({
            where: { email: 'reception@veterinaria.com' }
        });
        if (!receptionistExists) {
            const receptionist = userRepository.create({
                firstName: 'María',
                lastName: 'García',
                email: 'reception@veterinaria.com',
                password: 'reception123',
                phone: '+1234567892',
                address: 'Recepción',
                role: User_1.UserRole.RECEPTIONIST,
                isActive: true,
                emailNotifications: true,
                whatsappNotifications: false
            });
            await userRepository.save(receptionist);
            console.log('✅ Receptionist user created');
        }
        // Create sample client
        const clientExists = await userRepository.findOne({
            where: { email: 'cliente@example.com' }
        });
        if (!clientExists) {
            const client = userRepository.create({
                firstName: 'Carlos',
                lastName: 'López',
                email: 'cliente@example.com',
                password: 'cliente123',
                phone: '+1234567893',
                address: 'Calle Principal 123',
                role: User_1.UserRole.CLIENT,
                isActive: true,
                emailNotifications: true,
                whatsappNotifications: true
            });
            await userRepository.save(client);
            console.log('✅ Sample client created');
        }
        console.log('\n📋 Default Users:');
        console.log('=====================================');
        console.log('Admin: admin@veterinaria.com / admin123');
        console.log('Veterinarian: vet@veterinaria.com / vet123');
        console.log('Receptionist: reception@veterinaria.com / reception123');
        console.log('Client: cliente@example.com / cliente123');
        console.log('=====================================\n');
        await database_1.AppDataSource.destroy();
        console.log('✅ Database seed completed!');
    }
    catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};
seedDatabase();
//# sourceMappingURL=seedDatabase.js.map