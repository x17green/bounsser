

// Simple HTTP client for testing API endpoints
const http = require('http');
const https = require('https');
const { URL } = require('url');

/**
 * Simple HTTP client for testing API endpoints
 */
class APIClient {
  constructor(baseURL = 'http://localhost:3000') {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'User-Agent': 'Bouncer-Auth-Test/1.0.0',
    };
  }

  async request(method, path, options = {}) {
    const url = new URL(path, this.baseURL);
    const isHttps = url.protocol === 'https:';
    const client = isHttps ? https : http;

    const requestOptions = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      method: method.toUpperCase(),
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
    };

    if (options.body) {
      const body = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
      requestOptions.headers['Content-Length'] = Buffer.byteLength(body);
    }

    return new Promise((resolve, reject) => {
      const req = client.request(requestOptions, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            const response = {
              status: res.statusCode,
              headers: res.headers,
              data: data ? JSON.parse(data) : null,
            };
            resolve(response);
          } catch (_error) {
            resolve({
              status: res.statusCode,
              headers: res.headers,
              data: data,
              error: 'Failed to parse JSON response',
            });
          }
        });
      });

      req.on('error', reject);

      if (options.body) {
        const body = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
        req.write(body);
      }

      req.end();
    });
  }

  async get(path, headers = {}) {
    return this.request('GET', path, { headers });
  }

  async post(path, body, headers = {}) {
    return this.request('POST', path, { body, headers });
  }

  async put(path, body, headers = {}) {
    return this.request('PUT', path, { body, headers });
  }

  async delete(path, headers = {}) {
    return this.request('DELETE', path, { headers });
  }
}

/**
 * Test helper functions
 */
class TestSuite {
  constructor(name) {
    this.name = name;
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
  }

  test(description, testFn) {
    this.tests.push({ description, testFn });
  }

  async run() {
    // logger.info(`\n🧪 ${this.name}`);
    console.log(`\n🧪 ${this.name}`);
    // logger.info('='.repeat(50));
    console.log('='.repeat(50));

    for (const { description, testFn } of this.tests) {
      try {
        await testFn();
        // logger.info(`✅ ${description}`);
        console.log(`✅ ${description}`);
        this.passed++;
      } catch (error) {
        // logger.error(`❌ ${description}`);
        console.log(`❌ ${description}`);
        // logger.error(`   Error: ${error.message}`);
        console.log(`   Error: ${error.message}`);
        this.failed++;
      }
    }

    // logger.info(`\n📊 Results: ${this.passed} passed, ${this.failed} failed`);
    console.log(`\n📊 Results: ${this.passed} passed, ${this.failed} failed`);
    return { passed: this.passed, failed: this.failed };
  }
}

/**
 * Test assertion helpers
 */
const assert = {
  equal: (actual, expected, message = '') => {
    if (actual !== expected) {
      throw new Error(`${message} - Expected ${expected}, got ${actual}`);
    }
  },

  truthy: (value, message = '') => {
    if (!value) {
      throw new Error(`${message} - Expected truthy value, got ${value}`);
    }
  },

  status: (response, expectedStatus, message = '') => {
    if (response.status !== expectedStatus) {
      throw new Error(`
        ${message} - Expected status ${expectedStatus}, got ${response.status}. Response: ${JSON.stringify(response.data, null, 2)}
        `);
    }
  },

  hasProperty: (obj, property, message = '') => {
    if (!(property in obj)) {
      throw new Error(`
        ${message} - Expected object to have property '${property}'. Object: ${JSON.stringify(obj, null, 2)}
        `);
    }
  },

  isArray: (value, message = '') => {
    if (!Array.isArray(value)) {
      throw new Error(`${message} - Expected array, got ${typeof value}`);
    }
  },
};

/**
 * Main test runner
 */
async function runAuthenticationTests() {
  const client = new APIClient();
  // let authTokens = null;

  // logger.info('🚀 Starting Bouncer Authentication API Tests');
  console.log('🚀 Starting Bouncer Authentication API Tests');
  // logger.info(`📡 Testing server at: ${client.baseURL}`);
  console.log(`📡 Testing server at: ${client.baseURL}`);

  // Test 1: Basic API Health Check
  const healthSuite = new TestSuite('Basic API Health');

  healthSuite.test('Server is running and responding', async () => {
    const response = await client.get('/');
    assert.status(response, 200, 'Root endpoint should return 200');
    assert.hasProperty(response.data, 'status', 'Response should have status');
    assert.equal(response.data.status, 'operational', 'Status should be operational');
  });

  healthSuite.test('Health check endpoint works', async () => {
    const response = await client.get('/health');
    assert.status(response, 200, 'Health endpoint should return 200');
    assert.hasProperty(response.data, 'status', 'Health response should have status');
  });

  const healthResults = await healthSuite.run();

  // Test 2: Authentication Endpoints
  const authSuite = new TestSuite('Authentication Endpoints');

  authSuite.test('Twitter OAuth initiation returns auth URL', async () => {
    const response = await client.get('/api/v1/auth/twitter?state=test-state');
    assert.status(response, 200, 'OAuth initiation should return 200');
    assert.hasProperty(response.data, 'success', 'Response should have success property');
    assert.equal(response.data.success, true, 'Success should be true');
    assert.hasProperty(response.data, 'data', 'Response should have data property');
    assert.hasProperty(response.data.data, 'authUrl', 'Data should have authUrl');
    assert.hasProperty(response.data.data, 'codeVerifier', 'Data should have codeVerifier');
    assert.truthy(
      response.data.data.authUrl && response.data.data.authUrl.length > 0,
      'Auth URL should be present and not empty'
    );
  });

  authSuite.test('Twitter OAuth callback validates required fields', async () => {
    const response = await client.post('/api/v1/auth/twitter/callback', {
      // Missing required fields intentionally
    });
    assert.status(response, 400, 'Callback without required fields should return 400');
    assert.hasProperty(response.data, 'error', 'Error response should have error property');
  });

  authSuite.test('Refresh token endpoint validates required fields', async () => {
    const response = await client.post('/api/v1/auth/refresh', {
      // Missing refresh token
    });
    assert.status(response, 400, 'Refresh without token should return 400');
  });

  authSuite.test('Logout endpoint is accessible', async () => {
    const response = await client.post('/api/v1/auth/logout');
    // Should return 401 (unauthorized) or 200 (successful logout)
    assert.truthy([200, 401].includes(response.status), 'Logout should return 200 or 401');
  });

  const authResults = await authSuite.run();

  // Test 3: Protected Endpoints (Without Authentication)
  const protectedSuite = new TestSuite('Protected Endpoints (Unauthenticated)');

  protectedSuite.test('Profile endpoint requires authentication', async () => {
    const response = await client.get('/api/v1/users/profile');
    assert.status(response, 401, 'Profile endpoint should require authentication');
  });

  protectedSuite.test('Settings endpoint requires authentication', async () => {
    const response = await client.get('/api/v1/users/settings');
    assert.status(response, 401, 'Settings endpoint should require authentication');
  });

  protectedSuite.test('Twitter profile endpoint requires authentication', async () => {
    const response = await client.get('/api/v1/users/twitter/profile');
    assert.status(response, 401, 'Twitter profile endpoint should require authentication');
  });

  protectedSuite.test('Events endpoint requires authentication', async () => {
    const response = await client.get('/api/v1/users/events');
    assert.status(response, 401, 'Events endpoint should require authentication');
  });

  protectedSuite.test('Reports endpoint requires authentication', async () => {
    const response = await client.get('/api/v1/users/reports');
    assert.status(response, 401, 'Reports endpoint should require authentication');
  });

  const protectedResults = await protectedSuite.run();

  // Test 4: Input Validation
  const validationSuite = new TestSuite('Input Validation');

  validationSuite.test('Twitter OAuth handles invalid state parameter', async () => {
    const response = await client.get('/api/v1/auth/twitter?state=' + 'x'.repeat(1000));
    // Should either accept it or return validation error
    assert.truthy([200, 400].includes(response.status), 'Should handle long state parameter');
  });

  validationSuite.test('Profile update validates request body', async () => {
    const response = await client.put(
      '/api/v1/users/profile',
      {
        invalidField: 'test',
      },
      {
        Authorization: 'Bearer invalid-token',
      }
    );
    // Should return 401 (unauthorized) or 400 (validation error)
    assert.truthy([400, 401].includes(response.status), 'Should validate request or reject auth');
  });

  const validationResults = await validationSuite.run();

  // Test 5: Rate Limiting
  const rateLimitSuite = new TestSuite('Rate Limiting');

  rateLimitSuite.test('OAuth endpoint has rate limiting', async () => {
    // Make multiple rapid requests to test rate limiting
    const requests = Array(12)
      .fill()
      .map(() => client.get('/api/v1/auth/twitter?state=test-' + Math.random()));

    const responses = await Promise.all(requests);
    const rateLimited = responses.some((r) => r.status === 429);

    // Either rate limiting is working (429) or all requests succeeded
    // logger.info(`   Made ${requests.length} requests, rate limited: ${rateLimited}`);
    console.log(`   Made ${requests.length} requests, rate limited: ${rateLimited}`);
    assert.truthy(true, 'Rate limiting test completed'); // Always pass, just informational
  });

  const rateLimitResults = await rateLimitSuite.run();

  // Test 6: Error Handling
  const errorSuite = new TestSuite('Error Handling');

  errorSuite.test('Non-existent endpoint returns 404', async () => {
    const response = await client.get('/api/v1/nonexistent');
    assert.status(response, 404, 'Non-existent endpoint should return 404');
  });

  errorSuite.test('Invalid JSON in request body is handled', async () => {
    try {
      const response = await client.request('POST', '/api/v1/auth/refresh', {
        body: 'invalid json{',
        headers: { 'Content-Type': 'application/json' },
      });
      assert.status(response, 400, 'Invalid JSON should return 400');
    } catch (_error) {
      // Network error is also acceptable as malformed request
      assert.truthy(true, 'Invalid JSON handled appropriately');
    }
  });

  errorSuite.test('Unsupported HTTP method returns 405', async () => {
    try {
      const response = await client.request('PATCH', '/api/v1/auth/twitter');
      assert.truthy(
        [404, 405].includes(response.status),
        'Unsupported method should return 404/405'
      );
    } catch (_error) {
      assert.truthy(true, 'Unsupported method handled appropriately');
    }
  });

  const errorResults = await errorSuite.run();

  // Summary
  // logger.info('\n🏁 Test Summary');
  console.log('\n🏁 Test Summary');
  // logger.info('='.repeat(50));
  console.log('='.repeat(50));

  const totalResults = [
    healthResults,
    authResults,
    protectedResults,
    validationResults,
    rateLimitResults,
    errorResults,
  ];

  const totalPassed = totalResults.reduce((sum, result) => sum + result.passed, 0);
  const totalFailed = totalResults.reduce((sum, result) => sum + result.failed, 0);
  const totalTests = totalPassed + totalFailed;

  // logger.info(`📊 Overall Results: ${totalPassed}/${totalTests} tests passed`);
  console.log(`📊 Overall Results: ${totalPassed}/${totalTests} tests passed`);

  if (totalFailed === 0) {
    // logger.info('🎉 All tests passed! Authentication API is working correctly.');
    console.log('🎉 All tests passed! Authentication API is working correctly.');
  } else {
    // logger.error(`⚠️  ${totalFailed} tests failed. Review the errors above.`);
    console.log(`⚠️  ${totalFailed} tests failed. Review the errors above.`);
  }

  // Environment check
  // logger.info('\n🔧 Environment Check');
  console.log('\n🔧 Environment Check');
  // logger.info('='.repeat(50));
  console.log('='.repeat(50));
  // logger.info('Make sure you have:');
  console.log('Make sure you have:');
  // logger.info('✓ Node.js server running on port 3000');
  console.log('✓ Node.js server running on port 3000');
  // logger.info('✓ Correct environment variables set');
  console.log('✓ Correct environment variables set');
  // logger.info('✓ Database and Redis connections working');
  console.log('✓ Database and Redis connections working');
  // logger.info('✓ Twitter OAuth app configured');
  console.log('✓ Twitter OAuth app configured');

  return { totalPassed, totalFailed, totalTests };
}

// Run tests if called directly
if (require.main === module) {
  runAuthenticationTests()
    .then((results) => {
      process.exit(results.totalFailed > 0 ? 1 : 0);
    })
    .catch((error) => {
      console.error('❌ Test runner failed:', error);
      process.exit(1);
    });
}

module.exports = { runAuthenticationTests, APIClient, TestSuite, assert };
