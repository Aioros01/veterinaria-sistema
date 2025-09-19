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
exports.closeDatabaseConnection = exports.initializeDatabase = exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const dotenv = __importStar(require("dotenv"));
const User_1 = require("../entities/User");
const Pet_1 = require("../entities/Pet");
const MedicalHistory_1 = require("../entities/MedicalHistory");
const Appointment_1 = require("../entities/Appointment");
const Vaccination_1 = require("../entities/Vaccination");
const Prescription_1 = require("../entities/Prescription");
const Medicine_1 = require("../entities/Medicine");
const MedicineSale_1 = require("../entities/MedicineSale");
const Hospitalization_1 = require("../entities/Hospitalization");
const HospitalizationMedication_1 = require("../entities/HospitalizationMedication");
const HospitalizationNote_1 = require("../entities/HospitalizationNote");
const Consent_1 = require("../entities/Consent");
const ConsentDocumentHistory_1 = require("../entities/ConsentDocumentHistory");
dotenv.config();
// Configuración para CockroachDB en la nube
const config = {
    type: 'cockroachdb',
    url: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    },
    entities: [
        User_1.User,
        Pet_1.Pet,
        MedicalHistory_1.MedicalHistory,
        Appointment_1.Appointment,
        Vaccination_1.Vaccination,
        Prescription_1.Prescription,
        Medicine_1.Medicine,
        MedicineSale_1.MedicineSale,
        Hospitalization_1.Hospitalization,
        HospitalizationMedication_1.HospitalizationMedication,
        HospitalizationNote_1.HospitalizationNote,
        Consent_1.Consent,
        ConsentDocumentHistory_1.ConsentDocumentHistory
    ],
    synchronize: false, // Desactivado porque las tablas ya existen en CockroachDB
    logging: process.env.NODE_ENV === 'development'
};
exports.AppDataSource = new typeorm_1.DataSource(config);
const initializeDatabase = async () => {
    const startTime = performance.now();
    console.log(`[${new Date().toISOString()}] 🔌 Starting database connection...`);
    console.log(`[${new Date().toISOString()}] 📍 Using CockroachDB cloud database`);
    try {
        const connectStart = performance.now();
        await exports.AppDataSource.initialize();
        const connectTime = performance.now() - connectStart;
        console.log(`[${new Date().toISOString()}] ✅ Database connection established successfully`);
        console.log(`[${new Date().toISOString()}] ⏱️  Connection time: ${connectTime.toFixed(2)}ms`);
        if (connectTime > 1000) {
            console.log(`[${new Date().toISOString()}] ⚠️  SLOW DATABASE CONNECTION!`);
        }
        if (process.env.NODE_ENV === 'development') {
            console.log('📊 Database synchronized with entities');
        }
        const totalTime = performance.now() - startTime;
        console.log(`[${new Date().toISOString()}] ⏱️  Total initialization time: ${totalTime.toFixed(2)}ms`);
    }
    catch (error) {
        const errorTime = performance.now() - startTime;
        console.error(`[${new Date().toISOString()}] ❌ Error connecting to database after ${errorTime.toFixed(2)}ms:`, error);
        process.exit(1);
    }
};
exports.initializeDatabase = initializeDatabase;
const closeDatabaseConnection = async () => {
    try {
        if (exports.AppDataSource.isInitialized) {
            await exports.AppDataSource.destroy();
            console.log('Database connection closed');
        }
    }
    catch (error) {
        console.error('Error closing database connection:', error);
    }
};
exports.closeDatabaseConnection = closeDatabaseConnection;
//# sourceMappingURL=database.js.map