import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
import { User } from '../entities/User';
import { Pet } from '../entities/Pet';
import { MedicalHistory } from '../entities/MedicalHistory';
import { Appointment } from '../entities/Appointment';
import { Vaccination } from '../entities/Vaccination';
import { Prescription } from '../entities/Prescription';
import { Medicine } from '../entities/Medicine';
import { MedicineSale } from '../entities/MedicineSale';
import { Hospitalization } from '../entities/Hospitalization';
import { HospitalizationMedication } from '../entities/HospitalizationMedication';
import { HospitalizationNote } from '../entities/HospitalizationNote';
import { Consent } from '../entities/Consent';
import { ConsentDocumentHistory } from '../entities/ConsentDocumentHistory';

dotenv.config();

// Configuración para CockroachDB en la nube
const config: DataSourceOptions = {
  type: 'cockroachdb',
  url: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  entities: [
    User,
    Pet,
    MedicalHistory,
    Appointment,
    Vaccination,
    Prescription,
    Medicine,
    MedicineSale,
    Hospitalization,
    HospitalizationMedication,
    HospitalizationNote,
    Consent,
    ConsentDocumentHistory
  ],
  synchronize: false, // Desactivado porque las tablas ya existen en CockroachDB
  logging: process.env.NODE_ENV === 'development',
  timeTravelQueries: false // Requerido para CockroachDB
};

export const AppDataSource = new DataSource(config);

export const initializeDatabase = async (): Promise<void> => {
  const startTime = performance.now();
  console.log(`[${new Date().toISOString()}] 🔌 Starting database connection...`);
  console.log(`[${new Date().toISOString()}] 📍 Using CockroachDB cloud database`);

  try {
    const connectStart = performance.now();
    await AppDataSource.initialize();
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
  } catch (error) {
    const errorTime = performance.now() - startTime;
    console.error(`[${new Date().toISOString()}] ❌ Error connecting to database after ${errorTime.toFixed(2)}ms:`, error);
    process.exit(1);
  }
};

export const closeDatabaseConnection = async (): Promise<void> => {
  try {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('Database connection closed');
    }
  } catch (error) {
    console.error('Error closing database connection:', error);
  }
};