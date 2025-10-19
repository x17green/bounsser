/** @type {import('jest').Config} */
module.exports = {
  // Test environment
  preset: 'ts-jest',
  testEnvironment: 'node',

  // Root directory
  rootDir: './src/',

  // TypeScript configuration
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: {
          module: 'ESNext',
          target: 'ES2022',
          moduleResolution: 'node',
        },
      },
    ],
  },

  // Module resolution
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/core/(.*)$': '<rootDir>/src/core/$1',
    '^@/modules/(.*)$': '<rootDir>/src/modules/$1',
    '^@/shared/(.*)$': '<rootDir>/src/modules/shared/$1',
    '^@/types/(.*)$': '<rootDir>/src/modules/shared/types/$1',
    '^@/utils/(.*)$': '<rootDir>/src/modules/shared/utils/$1',
    '^@/db/(.*)$': '<rootDir>/src/db/$1',
    '^@/workers/(.*)$': '<rootDir>/src/workers/$1',
  },

  // Test file patterns
  testMatch: [
    '<rootDir>/src/**/*.test.ts',
    '<rootDir>/tests/**/*.test.ts',
    '<rootDir>/tests/**/*.spec.ts',
  ],

  // Files to ignore
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/',
    '/coverage/',
    '/docker/',
    '/prisma/migrations/',
    '/src/core/swagger/',
    '\\.spec\\.ts$',
  ],

  // Module paths to ignore
  modulePathIgnorePatterns: ['<rootDir>/dist/', '<rootDir>/build/', '<rootDir>/coverage/'],

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],

  // Global setup and teardown
  globalSetup: '<rootDir>/tests/globalSetup.ts',
  globalTeardown: '<rootDir>/tests/globalTeardown.ts',

  // Coverage configuration
  collectCoverage: false, // Enable with --coverage flag
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'text-summary', 'lcov', 'html', 'json', 'clover'],

  // Coverage collection patterns
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts',
    '!src/**/*.spec.ts',
    '!src/core/server.ts', // Exclude server entry point
    '!src/db/seed.ts', // Exclude seed files
    '!src/**/index.ts', // Exclude barrel exports
  ],

  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
    './src/modules/': {
      branches: 75,
      functions: 75,
      lines: 75,
      statements: 75,
    },
    './src/core/': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },

  // Test timeout
  testTimeout: 30000,

  // Verbose output
  verbose: false,

  // Clear mocks between tests
  clearMocks: true,
  restoreMocks: true,

  // Error handling
  errorOnDeprecated: true,

  // Detect handles that prevent Jest from exiting
  detectOpenHandles: true,
  forceExit: false,

  // Maximum worker processes
  maxWorkers: '50%',

  // Cache directory
  cacheDirectory: '<rootDir>/node_modules/.cache/jest',

  // Watch mode configuration
  watchPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/',
    '/coverage/',
    '/logs/',
    '\\.log$',
  ],

  // Reporter configuration
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'coverage',
        outputName: 'junit.xml',
        classNameTemplate: '{classname}',
        titleTemplate: '{title}',
        ancestorSeparator: ' › ',
        usePathForSuiteName: true,
      },
    ],
  ],

  // Snapshot configuration
  snapshotSerializers: [],

  // Mock configuration
  automock: false,
  unmockedModulePathPatterns: [],
};
