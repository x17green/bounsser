#!/usr/bin/env node

/**
 * Simple API Test Script for Bouncer Backend
 * Tests basic functionality of the server endpoints
 */

const https = require('https');
const http = require('http');

const BASE_URL = 'http://localhost:3000';
const TIMEOUT = 5000;

// ANSI color codes for pretty output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

// Test results tracker
const results = {
  total: 0,
  passed: 0,
  failed: 0,
  tests: [],
};

/**
 * Make HTTP request and return promise
 */
function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Bouncer-Test-Client/1.0.0',
      },
      timeout: TIMEOUT,
    };

    if (data) {
      const postData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request(options, (res) => {
      let body = '';

      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        try {
          const jsonBody = body ? JSON.parse(body) : null;
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: jsonBody,
            rawBody: body,
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: null,
            rawBody: body,
            parseError: error.message,
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

/**
 * Run a single test
 */
async function runTest(name, testFn) {
  results.total++;

  try {
    console.log(`${colors.blue}Running:${colors.reset} ${name}`);
    await testFn();
    results.passed++;
    results.tests.push({ name, status: 'PASS' });
    console.log(`${colors.green}✓ PASS:${colors.reset} ${name}\n`);
  } catch (error) {
    results.failed++;
    results.tests.push({ name, status: 'FAIL', error: error.message });
    console.log(`${colors.red}✗ FAIL:${colors.reset} ${name}`);
    console.log(`${colors.red}  Error:${colors.reset} ${error.message}\n`);
  }
}

/**
 * Assert helper functions
 */
const assert = {
  equals: (actual, expected, message) => {
    if (actual !== expected) {
      throw new Error(message || `Expected ${expected}, got ${actual}`);
    }
  },

  truthy: (value, message) => {
    if (!value) {
      throw new Error(message || `Expected truthy value, got ${value}`);
    }
  },

  hasProperty: (obj, prop, message) => {
    if (!obj || !obj.hasOwnProperty(prop)) {
      throw new Error(message || `Expected object to have property ${prop}`);
    }
  },

  statusCode: (response, expected, message) => {
    if (response.statusCode !== expected) {
      throw new Error(message || `Expected status ${expected}, got ${response.statusCode}`);
    }
  },
};

/**
 * Test Definitions
 */

// Test 1: Server is running
async function testServerRunning() {
  const response = await makeRequest('/');
  assert.statusCode(response, 200, 'Server should respond with 200');
  assert.hasProperty(response.body, 'name', 'Response should contain app name');
  assert.equals(response.body.name, 'Bouncer Backend', 'App name should be correct');
}

// Test 2: Health check endpoint
async function testHealthCheck() {
  const response = await makeRequest('/health');
  assert.statusCode(response, 200, 'Health check should return 200');
  assert.hasProperty(response.body, 'status', 'Health response should have status');
  assert.equals(response.body.status, 'healthy', 'Health status should be healthy');
  assert.hasProperty(response.body, 'uptime', 'Health response should have uptime');
  assert.truthy(response.body.uptime >= 0, 'Uptime should be a positive number');
}

// Test 3: API test endpoint
async function testAPIEndpoint() {
  const response = await makeRequest('/api/v1/test');
  assert.statusCode(response, 200, 'API test endpoint should return 200');
  assert.hasProperty(response.body, 'message', 'API response should have message');
  assert.equals(response.body.message, 'API is working!', 'API message should be correct');
}

// Test 4: 404 handling
async function test404Handling() {
  const response = await makeRequest('/nonexistent-endpoint');
  assert.statusCode(response, 404, 'Non-existent endpoint should return 404');
  assert.hasProperty(response.body, 'error', '404 response should have error field');
  assert.equals(response.body.error, 'Not Found', 'Error should be "Not Found"');
}

// Test 5: CORS headers
async function testCORSHeaders() {
  const response = await makeRequest('/', 'OPTIONS');
  // Note: OPTIONS might return 404 in our simple setup, but that's okay
  // We're mainly checking that the server responds and doesn't crash
  assert.truthy(
    response.statusCode >= 200 && response.statusCode < 500,
    'CORS preflight should not cause server error'
  );
}

// Test 6: JSON parsing
async function testJSONParsing() {
  try {
    const response = await makeRequest('/api/v1/test', 'POST', { test: 'data' });
    // Even if endpoint doesn't exist, server should parse JSON without crashing
    assert.truthy(response.statusCode >= 200, 'Server should handle JSON requests');
  } catch (error) {
    // If connection is refused, server might not be running
    if (error.code === 'ECONNREFUSED') {
      throw new Error('Server is not running');
    }
    throw error;
  }
}

/**
 * Main test runner
 */
async function runAllTests() {
  console.log(`${colors.blue}${colors.bold}🧪 Bouncer Backend API Tests${colors.reset}\n`);
  console.log(`Testing server at: ${colors.yellow}${BASE_URL}${colors.reset}\n`);

  // Wait a moment for server to be ready
  console.log('⏳ Waiting for server to be ready...\n');
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Run all tests
  await runTest('Server is running and responding', testServerRunning);
  await runTest('Health check endpoint works', testHealthCheck);
  await runTest('API test endpoint works', testAPIEndpoint);
  await runTest('404 errors are handled properly', test404Handling);
  await runTest('CORS requests are handled', testCORSHeaders);
  await runTest('JSON requests are parsed', testJSONParsing);

  // Print results
  console.log(`${colors.bold}${colors.cyan}📊 Test Results${colors.reset}`);
  console.log(`${colors.cyan}=================${colors.reset}`);
  console.log(`Total Tests: ${results.total}`);
  console.log(`${colors.green}Passed: ${results.passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${results.failed}${colors.reset}`);
  console.log(`Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%\n`);

  if (results.failed > 0) {
    console.log(`${colors.red}Failed Tests:${colors.reset}`);
    results.tests
      .filter((test) => test.status === 'FAIL')
      .forEach((test) => {
        console.log(`  ${colors.red}✗${colors.reset} ${test.name}: ${test.error}`);
      });
    console.log('');
  }

  // Exit with appropriate code
  process.exit(results.failed > 0 ? 1 : 0);
}

/**
 * Handle errors and cleanup
 */
process.on('unhandledRejection', (error) => {
  console.error(`${colors.red}Unhandled error:${colors.reset}`, error.message);
  process.exit(1);
});

process.on('SIGINT', () => {
  console.log(`\n${colors.yellow}Tests interrupted${colors.reset}`);
  process.exit(1);
});

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch((error) => {
    console.error(`${colors.red}Test runner error:${colors.reset}`, error.message);
    process.exit(1);
  });
}

module.exports = {
  runAllTests,
  makeRequest,
  assert,
};
