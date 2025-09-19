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
const axios_1 = __importDefault(require("axios"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const BASE_URL = 'http://localhost:3001/api';
class SystemVerifier {
    constructor() {
        this.results = [];
        this.adminToken = '';
        this.vetToken = '';
        this.clientToken = '';
    }
    async runAllTests() {
        console.log('🔧 INICIANDO VERIFICACIÓN COMPLETA DEL SISTEMA');
        console.log('═══════════════════════════════════════════════');
        // 1. Probar login con todas las credenciales
        await this.testAuthentication();
        // 2. Verificar permisos por rol
        await this.testPermissions();
        // 3. Verificar CRUD en inventario
        await this.testInventoryCRUD();
        // 4. Mostrar resultados
        this.printResults();
    }
    async testAuthentication() {
        console.log('\n📋 PROBANDO AUTENTICACIÓN...');
        // Admin login
        try {
            const adminRes = await axios_1.default.post(`${BASE_URL}/auth/login`, {
                email: 'admin@veterinaria.com',
                password: 'admin123'
            });
            this.adminToken = adminRes.data.token;
            this.results.push({
                module: 'Autenticación',
                test: 'Login Admin',
                status: 'PASS',
                details: 'admin@veterinaria.com'
            });
        }
        catch (error) {
            this.results.push({
                module: 'Autenticación',
                test: 'Login Admin',
                status: 'FAIL',
                details: 'No pudo iniciar sesión'
            });
        }
        // Veterinario login
        try {
            const vetRes = await axios_1.default.post(`${BASE_URL}/auth/login`, {
                email: 'veterinario@veterinaria.com',
                password: 'vet123'
            });
            this.vetToken = vetRes.data.token;
            this.results.push({
                module: 'Autenticación',
                test: 'Login Veterinario',
                status: 'PASS',
                details: 'veterinario@veterinaria.com'
            });
        }
        catch (error) {
            this.results.push({
                module: 'Autenticación',
                test: 'Login Veterinario',
                status: 'FAIL',
                details: 'No pudo iniciar sesión'
            });
        }
        // Cliente login
        try {
            const clientRes = await axios_1.default.post(`${BASE_URL}/auth/login`, {
                email: 'maria@example.com',
                password: 'password123'
            });
            this.clientToken = clientRes.data.token;
            this.results.push({
                module: 'Autenticación',
                test: 'Login Cliente',
                status: 'PASS',
                details: 'maria@example.com'
            });
        }
        catch (error) {
            this.results.push({
                module: 'Autenticación',
                test: 'Login Cliente',
                status: 'FAIL',
                details: 'No pudo iniciar sesión'
            });
        }
    }
    async testPermissions() {
        console.log('\n🔐 PROBANDO PERMISOS...');
        // Test: Cliente NO debe poder crear medicamento
        try {
            await axios_1.default.post(`${BASE_URL}/medicines`, {
                name: 'Test Medicine',
                category: 'antibiotic',
                presentation: 'tablet',
                concentration: '500mg',
                unitPrice: 10,
                currentStock: 100,
                minimumStock: 10,
                maximumStock: 500
            }, {
                headers: {
                    Authorization: `Bearer ${this.clientToken}`
                }
            });
            this.results.push({
                module: 'Permisos',
                test: 'Cliente NO puede crear medicamento',
                status: 'FAIL',
                details: 'Cliente pudo crear (NO debería)'
            });
        }
        catch (error) {
            if (error.response?.status === 403) {
                this.results.push({
                    module: 'Permisos',
                    test: 'Cliente NO puede crear medicamento',
                    status: 'PASS',
                    details: 'Bloqueado correctamente (403)'
                });
            }
            else {
                this.results.push({
                    module: 'Permisos',
                    test: 'Cliente NO puede crear medicamento',
                    status: 'FAIL',
                    details: `Error inesperado: ${error.response?.status}`
                });
            }
        }
        // Test: Admin SÍ debe poder crear medicamento
        try {
            const response = await axios_1.default.post(`${BASE_URL}/medicines`, {
                name: `Test Medicine ${Date.now()}`,
                category: 'antibiotic',
                presentation: 'tablet',
                concentration: '500mg',
                unitPrice: 10,
                currentStock: 100,
                minimumStock: 10,
                maximumStock: 500,
                expirationDate: '2025-12-31',
                storageConditions: 'Room temperature'
            }, {
                headers: {
                    Authorization: `Bearer ${this.adminToken}`
                }
            });
            // Guardar ID para eliminar después
            const medicineId = response.data.medicine.id;
            this.results.push({
                module: 'Permisos',
                test: 'Admin SÍ puede crear medicamento',
                status: 'PASS',
                details: 'Creado exitosamente'
            });
            // Eliminar el medicamento de prueba
            await axios_1.default.delete(`${BASE_URL}/medicines/${medicineId}`, {
                headers: {
                    Authorization: `Bearer ${this.adminToken}`
                }
            });
        }
        catch (error) {
            this.results.push({
                module: 'Permisos',
                test: 'Admin SÍ puede crear medicamento',
                status: 'FAIL',
                details: `Error: ${error.response?.status}`
            });
        }
        // Test: Veterinario SÍ debe poder crear medicamento
        try {
            const response = await axios_1.default.post(`${BASE_URL}/medicines`, {
                name: `Vet Medicine ${Date.now()}`,
                category: 'vitamin',
                presentation: 'liquid',
                concentration: '100ml',
                unitPrice: 15,
                currentStock: 50,
                minimumStock: 5,
                maximumStock: 200,
                expirationDate: '2025-12-31',
                storageConditions: 'Refrigerated'
            }, {
                headers: {
                    Authorization: `Bearer ${this.vetToken}`
                }
            });
            // Guardar ID para eliminar después
            const medicineId = response.data.medicine.id;
            this.results.push({
                module: 'Permisos',
                test: 'Veterinario SÍ puede crear medicamento',
                status: 'PASS',
                details: 'Creado exitosamente'
            });
            // Eliminar el medicamento de prueba
            await axios_1.default.delete(`${BASE_URL}/medicines/${medicineId}`, {
                headers: {
                    Authorization: `Bearer ${this.vetToken}`
                }
            });
        }
        catch (error) {
            this.results.push({
                module: 'Permisos',
                test: 'Veterinario SÍ puede crear medicamento',
                status: 'FAIL',
                details: `Error: ${error.response?.status}`
            });
        }
    }
    async testInventoryCRUD() {
        console.log('\n📦 PROBANDO CRUD DE INVENTARIO...');
        let medicineId = '';
        // CREATE
        try {
            const response = await axios_1.default.post(`${BASE_URL}/medicines`, {
                name: 'Medicina de Prueba CRUD',
                category: 'analgesic',
                presentation: 'capsule',
                concentration: '250mg',
                unitPrice: 25.50,
                currentStock: 75,
                minimumStock: 15,
                maximumStock: 300,
                expirationDate: '2026-06-30',
                storageConditions: 'Dry place',
                description: 'Medicina para pruebas del sistema'
            }, {
                headers: {
                    Authorization: `Bearer ${this.adminToken}`
                }
            });
            medicineId = response.data.medicine.id;
            this.results.push({
                module: 'Inventario CRUD',
                test: 'CREATE - Crear medicamento',
                status: 'PASS',
                details: `ID: ${medicineId}`
            });
        }
        catch (error) {
            this.results.push({
                module: 'Inventario CRUD',
                test: 'CREATE - Crear medicamento',
                status: 'FAIL'
            });
            return;
        }
        // READ
        try {
            const response = await axios_1.default.get(`${BASE_URL}/medicines`, {
                headers: {
                    Authorization: `Bearer ${this.adminToken}`
                }
            });
            const found = response.data.medicines.some((m) => m.id === medicineId);
            this.results.push({
                module: 'Inventario CRUD',
                test: 'READ - Leer medicamentos',
                status: found ? 'PASS' : 'FAIL',
                details: found ? 'Medicamento encontrado' : 'Medicamento no encontrado'
            });
        }
        catch (error) {
            this.results.push({
                module: 'Inventario CRUD',
                test: 'READ - Leer medicamentos',
                status: 'FAIL'
            });
        }
        // UPDATE
        try {
            await axios_1.default.put(`${BASE_URL}/medicines/${medicineId}`, {
                currentStock: 150,
                unitPrice: 30
            }, {
                headers: {
                    Authorization: `Bearer ${this.adminToken}`
                }
            });
            this.results.push({
                module: 'Inventario CRUD',
                test: 'UPDATE - Actualizar medicamento',
                status: 'PASS',
                details: 'Stock y precio actualizados'
            });
        }
        catch (error) {
            this.results.push({
                module: 'Inventario CRUD',
                test: 'UPDATE - Actualizar medicamento',
                status: 'FAIL'
            });
        }
        // DELETE
        try {
            await axios_1.default.delete(`${BASE_URL}/medicines/${medicineId}`, {
                headers: {
                    Authorization: `Bearer ${this.adminToken}`
                }
            });
            this.results.push({
                module: 'Inventario CRUD',
                test: 'DELETE - Eliminar medicamento',
                status: 'PASS',
                details: 'Eliminado exitosamente'
            });
        }
        catch (error) {
            this.results.push({
                module: 'Inventario CRUD',
                test: 'DELETE - Eliminar medicamento',
                status: 'FAIL'
            });
        }
    }
    printResults() {
        console.log('\n\n═══════════════════════════════════════════════');
        console.log('📊 RESULTADOS DE LA VERIFICACIÓN');
        console.log('═══════════════════════════════════════════════\n');
        const groupedResults = {};
        this.results.forEach(result => {
            if (!groupedResults[result.module]) {
                groupedResults[result.module] = [];
            }
            groupedResults[result.module].push(result);
        });
        Object.entries(groupedResults).forEach(([module, results]) => {
            console.log(`📁 ${module.toUpperCase()}`);
            console.log('───────────────────────────────');
            results.forEach(result => {
                const icon = result.status === 'PASS' ? '✅' : '❌';
                const details = result.details ? ` - ${result.details}` : '';
                console.log(`  ${icon} ${result.test}${details}`);
            });
            console.log('');
        });
        const totalTests = this.results.length;
        const passedTests = this.results.filter(r => r.status === 'PASS').length;
        const failedTests = totalTests - passedTests;
        console.log('═══════════════════════════════════════════════');
        console.log('📈 RESUMEN FINAL:');
        console.log(`   Total de pruebas: ${totalTests}`);
        console.log(`   ✅ Exitosas: ${passedTests}`);
        console.log(`   ❌ Fallidas: ${failedTests}`);
        if (failedTests === 0) {
            console.log('\n🎉 ¡TODAS LAS PRUEBAS PASARON EXITOSAMENTE!');
            console.log('   El sistema está funcionando correctamente.');
        }
        else {
            console.log('\n⚠️  HAY PRUEBAS QUE FALLARON');
            console.log('   Revisa los detalles arriba para más información.');
        }
        console.log('\n═══════════════════════════════════════════════');
        console.log(`Verificación completada: ${new Date().toLocaleString('es-ES')}`);
        console.log('═══════════════════════════════════════════════\n');
    }
}
// Ejecutar verificación
const verifier = new SystemVerifier();
verifier.runAllTests().catch(error => {
    console.error('❌ Error ejecutando verificación:', error.message);
    process.exit(1);
});
//# sourceMappingURL=verifySystem.js.map