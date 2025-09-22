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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.App = void 0;
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv = __importStar(require("dotenv"));
const database_1 = require("./config/database");
const errorHandler_1 = require("./middleware/errorHandler");
const performanceMonitor_1 = require("./middleware/performanceMonitor");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const pet_routes_1 = __importDefault(require("./routes/pet.routes"));
const appointment_routes_1 = __importDefault(require("./routes/appointment.routes"));
const medicalHistory_routes_1 = __importDefault(require("./routes/medicalHistory.routes"));
const vaccination_routes_1 = __importDefault(require("./routes/vaccination.routes"));
const medicine_routes_1 = __importDefault(require("./routes/medicine.routes"));
const dashboard_routes_1 = __importDefault(require("./routes/dashboard.routes"));
const backup_routes_1 = __importDefault(require("./routes/backup.routes"));
const hospitalization_routes_1 = __importDefault(require("./routes/hospitalization.routes"));
const consent_routes_1 = __importDefault(require("./routes/consent.routes"));
const medicineSales_1 = __importDefault(require("./routes/medicineSales"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const cronJobs_1 = require("./utils/cronJobs");
dotenv.config();
class App {
    constructor() {
        this.app = (0, express_1.default)();
        this.port = parseInt(process.env.PORT || '3001');
        this.setupMiddleware();
        this.setupRoutes();
        this.setupErrorHandling();
    }
    setupMiddleware() {
        this.app.use((0, cors_1.default)());
        this.app.use(express_1.default.json());
        this.app.use(express_1.default.urlencoded({ extended: true }));
        // Add performance monitoring to all requests
        this.app.use(performanceMonitor_1.PerformanceMonitor.middleware());
        this.app.use('/uploads', express_1.default.static('uploads'));
    }
    setupRoutes() {
        this.app.get('/health', (req, res) => {
            res.json({ status: 'OK', timestamp: new Date().toISOString() });
        });
        this.app.use('/api/auth', auth_routes_1.default);
        this.app.use('/api/users', user_routes_1.default);
        this.app.use('/api/pets', pet_routes_1.default);
        this.app.use('/api/appointments', appointment_routes_1.default);
        this.app.use('/api/medical-history', medicalHistory_routes_1.default);
        this.app.use('/api/vaccinations', vaccination_routes_1.default);
        this.app.use('/api/medicines', medicine_routes_1.default);
        this.app.use('/api/dashboard', dashboard_routes_1.default);
        this.app.use('/api/backups', backup_routes_1.default);
        this.app.use('/api/hospitalizations', hospitalization_routes_1.default);
        this.app.use('/api/consents', consent_routes_1.default);
        this.app.use('/api/medicine-sales', medicineSales_1.default);
        this.app.use('/api/admin', adminRoutes_1.default);
    }
    setupErrorHandling() {
        this.app.use(errorHandler_1.notFound);
        this.app.use(errorHandler_1.errorHandler);
    }
    async start() {
        try {
            await (0, database_1.initializeDatabase)();
            (0, cronJobs_1.scheduleCronJobs)();
            this.app.listen(this.port, () => {
                console.log(`🚀 Server running on http://localhost:${this.port}`);
                console.log(`📱 Health check: http://localhost:${this.port}/health`);
            });
        }
        catch (error) {
            console.error('Failed to start server:', error);
            process.exit(1);
        }
    }
}
exports.App = App;
const app = new App();
app.start();
//# sourceMappingURL=app.js.map