/**
 * Jest configuration for @synkra/aiox-install package
 */

module.exports = {
  testEnvironment: 'node',
  roots: ['../../tests/packages/aiox-install'],
  testMatch: ['**/*.test.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
  ],
  coverageDirectory: '../../coverage/packages/aiox-install',
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  modulePathIgnorePatterns: [
    '<rootDir>/node_modules/',
  ],
  verbose: true,
};
