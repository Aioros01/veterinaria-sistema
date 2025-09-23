"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.keepAwakeService = void 0;
const axios_1 = __importDefault(require("axios"));
class KeepAwakeService {
    constructor() {
        this.intervalId = null;
        // URL del propio servicio en Render
        this.baseUrl = process.env.RENDER_EXTERNAL_URL || 'https://veterinaria-backend.onrender.com';
    }
    start() {
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
    async pingServer() {
        try {
            // Ping a múltiples endpoints para asegurar actividad
            const endpoints = ['/health', '/keep-alive', '/api/auth/login'];
            for (const endpoint of endpoints) {
                try {
                    await axios_1.default.get(`${this.baseUrl}${endpoint}`, {
                        timeout: 5000,
                        validateStatus: () => true // Acepta cualquier status
                    });
                    console.log(`✅ Keep-awake ping to ${endpoint} successful at ${new Date().toISOString()}`);
                }
                catch (error) {
                    console.log(`⚠️ Keep-awake ping to ${endpoint} failed:`, error.message);
                }
            }
        }
        catch (error) {
            console.error('❌ Keep-awake service error:', error);
        }
    }
    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            console.log('🛑 Keep-awake service stopped');
        }
    }
}
exports.keepAwakeService = new KeepAwakeService();
//# sourceMappingURL=keepAwake.js.map