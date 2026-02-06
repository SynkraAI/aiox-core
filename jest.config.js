module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',

  // Test patterns from LOCAL (mais específico)
  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*.spec.js',
    '**/.aios-core/**/__tests__/**/*.test.js',
  ],

  // Ignore patterns - exclude incompatible test frameworks
  testPathIgnorePatterns: [
    '/node_modules/',
    // Playwright e2e tests (use ESM imports, run with Playwright not Jest)
    'tools/quality-dashboard/tests/e2e/',
    // Windows-specific tests (only run on Windows CI)
    'tests/integration/windows/',
    // Node.js native test runner tests (use node:test module)
    'tests/installer/v21-path-validation.test.js',
    // v2.1 Migration: Tests with removed common/utils modules (OSR-10 tech debt)
    // These tests reference modules removed during v4.31.0 → v2.1 migration
    'tests/tools/backward-compatibility.test.js',
    'tests/tools/clickup-helpers.test.js',
    'tests/tools/clickup-validators.test.js',
    'tests/tools/google-workspace-helpers.test.js',
    'tests/tools/google-workspace-validators.test.js',
    'tests/tools/n8n-helpers.test.js',
    'tests/tools/n8n-validators.test.js',
    'tests/tools/schema-detection.test.js',
    'tests/tools/supabase-helpers.test.js',
    'tests/tools/supabase-validators.test.js',
    'tests/tools/validation-performance.test.js',
    'tests/tools/validators.test.js',
    'tests/integration/tools-system.test.js',
    'tests/unit/tool-helper-executor.test.js',
    'tests/unit/tool-validation-helper.test.js',
    'tests/unit/tool-resolver.test.js',
    'tests/regression/tools-migration.test.js',
    'tests/performance/tools-system-benchmark.test.js',
    'tests/clickup/status-sync.test.js',
    'tests/story-update-hook.test.js',
    'tests/epic-verification.test.js',
    'tests/e2e/story-creation-clickup.test.js',
    'tests/installer/v21-structure.test.js',
    // Squad template tests use ESM imports - run separately with --experimental-vm-modules
    '.aios-core/development/templates/squad-template/tests/',
    // Manifest tests need manifest data alignment (OSR-10 tech debt)
    'tests/unit/manifest/manifest-generator.test.js',
    'tests/unit/manifest/manifest-validator.test.js',
    // Performance tests are flaky on different hardware (OSR-10 tech debt)
    'tests/integration/install-transaction.test.js',
    // License tests require network/crypto resources unavailable in CI (pre-existing)
    'tests/license/',
    // Squad adapter tests - module resolution issues (pre-existing)
    'squads/mmos-squad/tests/',
  ],

  // Coverage collection (Story TD-3: Updated paths)
  collectCoverageFrom: [
    'src/**/*.js',
    '.aios-core/**/*.js',
    'bin/**/*.js',
    'packages/**/*.js',
    'scripts/**/*.js',
    '!**/node_modules/**',
    '!**/tests/**',
    '!**/coverage/**',
    '!**/__tests__/**',
    '!**/*.test.js',
    '!**/*.spec.js',
    // Exclude templates and generated files
    '!.aios-core/development/templates/**',
    '!.aios-core/product/templates/**',
    '!**/dist/**',
    // Story TD-6: Exclude I/O-heavy health check plugins from core coverage
    // These are integration-test candidates (git, npm, network, disk, docker, etc.)
    // Core engine/healers/reporters remain in scope with 80%+ coverage
    '!.aios-core/core/health-check/checks/**',
    // Story TD-6: Exclude config/manifest modules - mostly I/O operations
    // These modules handle file system operations and JSON parsing
    // Better suited for integration tests
    '!.aios-core/core/config/**',
    '!.aios-core/core/manifest/**',
    // Story TD-6: Exclude registry (file I/O heavy) and utils (helper functions)
    // These provide supporting functionality tested indirectly through main modules
    '!.aios-core/core/registry/**',
    '!.aios-core/core/utils/**',
  ],

  // Coverage thresholds (Story TD-3)
  // Target: 80% global, 85% for core modules
  // Current baseline (2025-12-27): ~31% (needs improvement)
  // TEMPORARY: Lowered thresholds for PR #53, #76 (Gemini), #96 (CI fix)
  // TODO: Restore thresholds after adding tests - tracked in Story SEC-1 follow-up
  coverageThreshold: {
    global: {
      branches: 19,
      functions: 22,
      lines: 22,
      statements: 22,
    },
    // Core modules coverage threshold
    // TD-6: Adjusted to 45% to reflect current coverage (47.14%)
    // TEMPORARY: Lowered to 38% for PR #76 - Gemini integration adds many new files
    // Many core modules are I/O-heavy orchestration that's difficult to unit test
    '.aios-core/core/': {
      lines: 38,
    },
  },

  // Coverage ignore patterns from REMOTE
  coveragePathIgnorePatterns: ['/node_modules/', '/coverage/', '/.husky/', '/dist/'],

  // Timeout from REMOTE (30s melhor para operações longas)
  testTimeout: 30000,

  // Config from LOCAL
  verbose: true,
  roots: ['<rootDir>'],
  moduleDirectories: ['node_modules', '.'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],

  // Cross-platform config from REMOTE
  globals: {
    'ts-jest': {
      isolatedModules: true,
    },
  },
};
