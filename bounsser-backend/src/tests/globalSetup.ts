import { config } from 'dotenv';

// Global setup function that runs once before all tests
export default async function globalSetup(): Promise<void> {
  console.log('🧪 Setting up global test environment...');

  // Load test environment variables
  config({ path: '.env.test' });

  // Set test environment
  process.env.NODE_ENV = 'test';

  // Set default test database URL if not provided
  if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/bouncer_test';
  }

  // Set default Redis URL for tests
  if (!process.env.REDIS_URL) {
    process.env.REDIS_URL = 'redis://localhost:6379/1';
  }

  // Set test-specific configuration
  process.env.JWT_SECRET =
    'test-jwt-secret-key-for-testing-only-do-not-use-in-production-minimum-32-chars';
  process.env.JWT_REFRESH_SECRET =
    'test-jwt-refresh-secret-key-for-testing-only-do-not-use-in-production-min32';
  process.env.SESSION_SECRET =
    'test-session-secret-key-minimum-32-characters-required-for-validation';
  process.env.API_KEY = 'test-api-key';
  process.env.RATE_LIMIT_WINDOW_MS = '60000';
  process.env.RATE_LIMIT_MAX = '100';

  // Disable external services in tests
  process.env.TWITTER_API_ENABLED = 'false';
  process.env.EMAIL_ENABLED = 'false';
  process.env.WEBHOOK_ENABLED = 'false';

  // Set test logging level
  process.env.LOG_LEVEL = 'error';

  console.log('✅ Global test setup completed');
}
