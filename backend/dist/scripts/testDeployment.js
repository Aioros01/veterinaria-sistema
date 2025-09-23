"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
class DeploymentTester {
    constructor() {
        this.results = [];
        this.baseUrl = process.env.BACKEND_URL || 'https://veterinaria-backend.onrender.com';
    }
    async runAllTests() {
        console.log('🧪 Starting deployment tests...');
        console.log(`📍 Testing URL: ${this.baseUrl}\n`);
        // Test endpoints
        await this.testEndpoint('/health');
        await this.testEndpoint('/keep-alive');
        await this.testEndpoint('/api/auth/login', 'POST', {
            email: 'admin@veterinaria.com',
            password: 'admin123'
        });
        // Print results
        this.printResults();
    }
    async testEndpoint(endpoint, method = 'GET', data) {
        const url = `${this.baseUrl}${endpoint}`;
        const start = Date.now();
        try {
            const response = await (0, axios_1.default)({
                method,
                url,
                data,
                timeout: 30000,
                validateStatus: () => true
            });
            const responseTime = Date.now() - start;
            this.results.push({
                endpoint,
                status: response.status >= 200 && response.status < 300 ? 'success' : 'failed',
                responseTime,
                data: response.data
            });
            console.log(`✅ ${method} ${endpoint}: ${response.status} (${responseTime}ms)`);
        }
        catch (error) {
            const responseTime = Date.now() - start;
            this.results.push({
                endpoint,
                status: 'failed',
                responseTime,
                error: error.message
            });
            console.log(`❌ ${method} ${endpoint}: ${error.message} (${responseTime}ms)`);
        }
    }
    printResults() {
        console.log('\n📊 TEST RESULTS SUMMARY:');
        console.log('========================');
        const successful = this.results.filter(r => r.status === 'success').length;
        const failed = this.results.filter(r => r.status === 'failed').length;
        console.log(`✅ Successful: ${successful}`);
        console.log(`❌ Failed: ${failed}`);
        if (failed > 0) {
            console.log('\n⚠️  FAILED TESTS:');
            this.results
                .filter(r => r.status === 'failed')
                .forEach(r => {
                console.log(`  - ${r.endpoint}: ${r.error || 'Unknown error'}`);
            });
        }
        const avgResponseTime = this.results
            .filter(r => r.responseTime)
            .reduce((acc, r) => acc + (r.responseTime || 0), 0) / this.results.length;
        console.log(`\n⏱️  Average response time: ${avgResponseTime.toFixed(0)}ms`);
        if (avgResponseTime > 5000) {
            console.log('⚠️  WARNING: Response times are very slow!');
        }
    }
}
// Run tests
const tester = new DeploymentTester();
tester.runAllTests().then(() => {
    console.log('\n✅ Tests completed!');
}).catch(error => {
    console.error('❌ Test runner failed:', error);
    process.exit(1);
});
//# sourceMappingURL=testDeployment.js.map