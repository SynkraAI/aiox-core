/**
 * Jest Configuration for MMOS Squad Tests
 *
 * @story STORY-10.3
 */

module.exports = {
  testEnvironment: 'node',
  testMatch: [
    '**/tests/**/*.test.js',
  ],
  collectCoverageFrom: [
    'adapters/**/*.js',
    '!**/node_modules/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  verbose: true,
  testTimeout: 30000,
  modulePathIgnorePatterns: [
    '<rootDir>/node_modules/',
  ],
};
