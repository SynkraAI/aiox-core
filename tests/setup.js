// Jest setup file
// This file runs before all tests

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.AIOX_DEBUG = 'false';

// Skip integration tests by default (require external services)
// Set SKIP_INTEGRATION_TESTS=false to run them
if (process.env.SKIP_INTEGRATION_TESTS === undefined) {
  process.env.SKIP_INTEGRATION_TESTS = 'true';
}

// Global test timeout (increased for CI environments)
jest.setTimeout(process.env.CI ? 30000 : 10000);

// Mock console methods to reduce noise in tests (comment out for debugging)
// global.console = {
//   ...console,
//   log: jest.fn(),
//   debug: jest.fn(),
//   info: jest.fn(),
//   warn: jest.fn(),
//   error: jest.fn(),
// };

// Helper to conditionally skip integration tests
global.describeIntegration = process.env.SKIP_INTEGRATION_TESTS === 'true'
  ? describe.skip
  : describe;

global.testIntegration = process.env.SKIP_INTEGRATION_TESTS === 'true'
  ? test.skip
  : test;
