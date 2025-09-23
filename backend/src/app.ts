import 'reflect-metadata';
import express, { Application } from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import { initializeDatabase } from './config/database';
import { errorHandler, notFound } from './middleware/errorHandler';
import { PerformanceMonitor } from './middleware/performanceMonitor';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import petRoutes from './routes/pet.routes';
import appointmentRoutes from './routes/appointment.routes';
import medicalHistoryRoutes from './routes/medicalHistory.routes';
import vaccinationRoutes from './routes/vaccination.routes';
import medicineRoutes from './routes/medicine.routes';
import dashboardRoutes from './routes/dashboard.routes';
import backupRoutes from './routes/backup.routes';
import hospitalizationRoutes from './routes/hospitalization.routes';
import consentRoutes from './routes/consent.routes';
import medicineSalesRoutes from './routes/medicineSales';
import adminRoutes from './routes/adminRoutes';
import keepAliveRoutes from './routes/keepAlive';
import { scheduleCronJobs } from './utils/cronJobs';
import { backupService } from './services/BackupService';
import { keepAwakeService } from './utils/keepAwake';

dotenv.config();

export class App {
  private app: Application;
  private port: number;

  constructor() {
    this.app = express();
    this.port = parseInt(process.env.PORT || '3001');
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private setupMiddleware(): void {
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    
    // Add performance monitoring to all requests
    this.app.use(PerformanceMonitor.middleware());
    
    this.app.use('/uploads', express.static('uploads'));
  }

  private setupRoutes(): void {
    this.app.get('/health', (req, res) => {
      res.json({ status: 'OK', timestamp: new Date().toISOString() });
    });

    // Keep-alive routes
    this.app.use('/', keepAliveRoutes);

    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/users', userRoutes);
    this.app.use('/api/pets', petRoutes);
    this.app.use('/api/appointments', appointmentRoutes);
    this.app.use('/api/medical-history', medicalHistoryRoutes);
    this.app.use('/api/vaccinations', vaccinationRoutes);
    this.app.use('/api/medicines', medicineRoutes);
    this.app.use('/api/dashboard', dashboardRoutes);
    this.app.use('/api/backups', backupRoutes);
    this.app.use('/api/hospitalizations', hospitalizationRoutes);
    this.app.use('/api/consents', consentRoutes);
    this.app.use('/api/medicine-sales', medicineSalesRoutes);
    this.app.use('/api/admin', adminRoutes);
  }

  private setupErrorHandling(): void {
    this.app.use(notFound);
    this.app.use(errorHandler);
  }

  public async start(): Promise<void> {
    try {
      await initializeDatabase();
      
      scheduleCronJobs();

      // Iniciar servicio keep-awake solo en producción
      if (process.env.NODE_ENV === 'production') {
        keepAwakeService.start();
        console.log('🔄 Keep-awake service started for production');
      }

      this.app.listen(this.port, () => {
        console.log(`🚀 Server running on http://localhost:${this.port}`);
        console.log(`📱 Health check: http://localhost:${this.port}/health`);
      });
    } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  }
}

const app = new App();
app.start();