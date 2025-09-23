import axios from 'axios';

interface TestResult {
  endpoint: string;
  status: 'success' | 'failed';
  responseTime?: number;
  error?: string;
  data?: any;
}

class DeploymentTester {
  private baseUrl: string;
  private results: TestResult[] = [];

  constructor() {
    this.baseUrl = process.env.BACKEND_URL || 'https://veterinaria-backend.onrender.com';
  }

  async runAllTests(): Promise<void> {
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

  private async testEndpoint(
    endpoint: string,
    method: 'GET' | 'POST' = 'GET',
    data?: any
  ): Promise<void> {
    const url = `${this.baseUrl}${endpoint}`;
    const start = Date.now();

    try {
      const response = await axios({
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
    } catch (error: any) {
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

  private printResults(): void {
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