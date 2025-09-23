import axios from 'axios';

class KeepAwakeService {
  private intervalId: NodeJS.Timeout | null = null;
  private baseUrl: string;

  constructor() {
    // URL del propio servicio en Render
    this.baseUrl = process.env.RENDER_EXTERNAL_URL || 'https://veterinaria-backend.onrender.com';
  }

  start(): void {
    if (this.intervalId) {
      return; // Ya está corriendo
    }

    console.log('🔄 Starting keep-awake service...');

    // Hacer ping inmediatamente
    this.pingServer();

    // Hacer ping cada 4 minutos (antes de que Render duerma a los 15 min)
    this.intervalId = setInterval(() => {
      this.pingServer();
    }, 4 * 60 * 1000); // 4 minutos
  }

  private async pingServer(): Promise<void> {
    try {
      // Ping a múltiples endpoints para asegurar actividad
      const endpoints = ['/health', '/keep-alive', '/api/auth/login'];

      for (const endpoint of endpoints) {
        try {
          await axios.get(`${this.baseUrl}${endpoint}`, {
            timeout: 5000,
            validateStatus: () => true // Acepta cualquier status
          });
          console.log(`✅ Keep-awake ping to ${endpoint} successful at ${new Date().toISOString()}`);
        } catch (error) {
          console.log(`⚠️ Keep-awake ping to ${endpoint} failed:`, error.message);
        }
      }
    } catch (error) {
      console.error('❌ Keep-awake service error:', error);
    }
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('🛑 Keep-awake service stopped');
    }
  }
}

export const keepAwakeService = new KeepAwakeService();