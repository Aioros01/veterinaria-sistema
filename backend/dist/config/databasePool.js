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
exports.getOptimizedConnection = exports.DatabasePool = exports.OptimizedDataSource = void 0;
const typeorm_1 = require("typeorm");
const dotenv = __importStar(require("dotenv"));
const User_1 = require("../entities/User");
const Pet_1 = require("../entities/Pet");
const MedicalHistory_1 = require("../entities/MedicalHistory");
const Appointment_1 = require("../entities/Appointment");
const Vaccination_1 = require("../entities/Vaccination");
const Prescription_1 = require("../entities/Prescription");
const Medicine_1 = require("../entities/Medicine");
dotenv.config();
// Configuración optimizada para bases de datos remotas
const config = {
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'veterinary_db',
    entities: [
        User_1.User,
        Pet_1.Pet,
        MedicalHistory_1.MedicalHistory,
        Appointment_1.Appointment,
        Vaccination_1.Vaccination,
        Prescription_1.Prescription,
        Medicine_1.Medicine
    ],
    synchronize: false, // IMPORTANTE: Desactivar en producción
    logging: false, // Desactivar logs para mejor performance
    // OPTIMIZACIONES PARA BASE DE DATOS REMOTA
    poolSize: 10, // Mantener pool de conexiones
    extra: {
        max: 10, // Máximo de conexiones
        min: 2, // Mínimo de conexiones activas
        idleTimeoutMillis: 30000, // Timeout para conexiones inactivas
        connectionTimeoutMillis: 5000, // Timeout de conexión
        statement_timeout: 30000, // Timeout para queries
        query_timeout: 30000,
        // Optimizaciones SSL para Supabase
        ssl: process.env.DATABASE_URL ? {
            rejectUnauthorized: false
        } : false,
        // Keep alive para mantener conexión activa
        keepAlive: true,
        keepAliveInitialDelayMillis: 10000,
    },
    // Cache de queries
    cache: {
        type: "ioredis",
        duration: 60000, // 1 minuto de cache
        options: {
            host: "localhost",
            port: 6379
        }
    }
};
exports.OptimizedDataSource = new typeorm_1.DataSource(config);
// Connection pool manager
class DatabasePool {
    static async getConnection() {
        if (this.instance && this.instance.isInitialized) {
            return this.instance;
        }
        if (this.connectionPromise) {
            return this.connectionPromise;
        }
        this.connectionPromise = this.connect();
        return this.connectionPromise;
    }
    static async connect() {
        try {
            console.log('🔌 Establishing database connection pool...');
            const startTime = Date.now();
            this.instance = await exports.OptimizedDataSource.initialize();
            const connectionTime = Date.now() - startTime;
            console.log(`✅ Connection pool established in ${connectionTime}ms`);
            // Pre-warm connections
            await this.warmUpConnections();
            return this.instance;
        }
        catch (error) {
            console.error('❌ Database connection failed:', error);
            this.connectionPromise = null;
            throw error;
        }
    }
    static async warmUpConnections() {
        console.log('🔥 Warming up connection pool...');
        // Execute simple queries to warm up connections
        const promises = [];
        for (let i = 0; i < 3; i++) {
            promises.push(this.instance.query('SELECT 1').catch(() => { }));
        }
        await Promise.all(promises);
        console.log('✅ Connection pool ready');
    }
    static async closeConnection() {
        if (this.instance && this.instance.isInitialized) {
            await this.instance.destroy();
            console.log('Connection pool closed');
        }
    }
}
exports.DatabasePool = DatabasePool;
DatabasePool.connectionPromise = null;
// Export singleton instance
const getOptimizedConnection = () => DatabasePool.getConnection();
exports.getOptimizedConnection = getOptimizedConnection;
//# sourceMappingURL=databasePool.js.map