import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { User } from './src/entities/User';
import { Pet } from './src/entities/Pet';
import { MedicalHistory } from './src/entities/MedicalHistory';
import { Appointment } from './src/entities/Appointment';
import { Vaccination } from './src/entities/Vaccination';
import { Prescription } from './src/entities/Prescription';
import { Medicine } from './src/entities/Medicine';
import { MedicineSale } from './src/entities/MedicineSale';
import { Hospitalization } from './src/entities/Hospitalization';
import { HospitalizationMedication } from './src/entities/HospitalizationMedication';
import { HospitalizationNote } from './src/entities/HospitalizationNote';
import { Consent } from './src/entities/Consent';
import { ConsentDocumentHistory } from './src/entities/ConsentDocumentHistory';

dotenv.config();

// Configuración para CLI de TypeORM (migraciones)
export const AppDataSource = new DataSource({
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
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
  logging: true,
  timeTravelQueries: false
});