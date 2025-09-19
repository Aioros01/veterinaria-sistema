import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
import { User } from '../entities/User';
import { Pet } from '../entities/Pet';
import { MedicalHistory } from '../entities/MedicalHistory';
import { Appointment } from '../entities/Appointment';
import { Vaccination } from '../entities/Vaccination';
import { Prescription } from '../entities/Prescription';
import { Medicine } from '../entities/Medicine';

dotenv.config();

// Configuración optimizada para bases de datos remotas
const config: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'veterinary_db',
  entities: [
    User,
    Pet,
    MedicalHistory,
    Appointment,
    Vaccination,
    Prescription,
    Medicine
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

export const OptimizedDataSource = new DataSource(config);

// Connection pool manager
export class DatabasePool {
  private static instance: DataSource;
  private static connectionPromise: Promise<DataSource> | null = null;
  
  static async getConnection(): Promise<DataSource> {
    if (this.instance && this.instance.isInitialized) {
      return this.instance;
    }
    
    if (this.connectionPromise) {
      return this.connectionPromise;
    }
    
    this.connectionPromise = this.connect();
    return this.connectionPromise;
  }
  
  private static async connect(): Promise<DataSource> {
    try {
      console.log('🔌 Establishing database connection pool...');
      const startTime = Date.now();
      
      this.instance = await OptimizedDataSource.initialize();
      
      const connectionTime = Date.now() - startTime;
      console.log(`✅ Connection pool established in ${connectionTime}ms`);
      
      // Pre-warm connections
      await this.warmUpConnections();
      
      return this.instance;
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      this.connectionPromise = null;
      throw error;
    }
  }
  
  private static async warmUpConnections(): Promise<void> {
    console.log('🔥 Warming up connection pool...');
    
    // Execute simple queries to warm up connections
    const promises = [];
    for (let i = 0; i < 3; i++) {
      promises.push(
        this.instance.query('SELECT 1').catch(() => {})
      );
    }
    
    await Promise.all(promises);
    console.log('✅ Connection pool ready');
  }
  
  static async closeConnection(): Promise<void> {
    if (this.instance && this.instance.isInitialized) {
      await this.instance.destroy();
      console.log('Connection pool closed');
    }
  }
}

// Export singleton instance
export const getOptimizedConnection = () => DatabasePool.getConnection();