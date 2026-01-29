# Synkra AIOS Testing Guide

> **EN** | [PT](../pt/guides/testing-guide.md) | [ES](../es/guides/testing-guide.md)

---

> Comprehensive guide to the testing strategy, tools, and best practices for Synkra AIOS.

**Version:** 2.1.0
**Last Updated:** 2026-01-29

---

## Table of Contents

1. [Overview](#overview)
2. [Testing Strategy](#testing-strategy)
3. [Unit Tests](#unit-tests)
4. [Integration Tests](#integration-tests)
5. [End-to-End Tests](#end-to-end-tests)
6. [Agent Tests](#agent-tests)
7. [Cross-Platform Testing](#cross-platform-testing)
8. [Coverage and Metrics](#coverage-and-metrics)
9. [CI/CD Integration](#cicd-integration)
10. [Writing Good Tests](#writing-good-tests)
11. [Mocking and Fixtures](#mocking-and-fixtures)
12. [NPM Commands Reference](#npm-commands-reference)
13. [Troubleshooting](#troubleshooting)

---

## Overview

AIOS follows a comprehensive testing strategy that ensures code quality across all layers of the framework. Our testing philosophy is built on:

- **Test-Driven Development (TDD)** for core functionality
- **Layered Testing** with unit, integration, and E2E tests
- **Cross-Platform Verification** for Windows, macOS, and Linux
- **Agent-Specific Testing** for AI agent behaviors
- **Automated Quality Gates** integrated with CI/CD

### Testing Pyramid

```
                    ┌─────────────┐
                    │     E2E     │  ← Few, Slow, Expensive
                    │   Tests     │
                    ├─────────────┤
                    │ Integration │  ← Some, Medium Speed
                    │   Tests     │
                    ├─────────────┤
                    │    Unit     │  ← Many, Fast, Cheap
                    │   Tests     │
                    └─────────────┘
```

| Layer       | Count | Speed | Coverage Target |
| ----------- | ----- | ----- | --------------- |
| Unit        | 100+  | < 30s | 80%+ lines      |
| Integration | 30-50 | 1-5m  | Critical paths  |
| E2E         | 10-20 | 5-15m | User flows      |

---

## Testing Strategy

### Directory Structure

```
tests/
├── unit/                    # Unit tests
│   ├── quality-gates/       # Quality gate components
│   ├── squad/               # Squad system tests
│   ├── mcp/                 # MCP configuration tests
│   ├── manifest/            # Manifest handling tests
│   └── documentation-integrity/  # Doc generator tests
├── integration/             # Integration tests
│   ├── squad/               # Squad designer integration
│   ├── windows/             # Windows-specific tests
│   └── *.test.js            # General integration tests
├── e2e/                     # End-to-end tests
│   └── story-creation-clickup.test.js
├── performance/             # Performance benchmarks
│   ├── decision-logging-benchmark.test.js
│   └── tools-system-benchmark.test.js
├── security/                # Security tests
│   └── core-security.test.js
├── health-check/            # Health check system tests
│   ├── engine.test.js
│   └── healers.test.js
├── regression/              # Regression tests
│   └── tools-migration.test.js
├── setup.js                 # Global test setup
└── fixtures/                # Test fixtures and mocks
```

### Test Naming Convention

| Type        | Pattern                       | Example                              |
| ----------- | ----------------------------- | ------------------------------------ |
| Unit        | `*.test.js` or `*.spec.js`    | `greeting-builder.test.js`           |
| Integration | `*.test.js` in `integration/` | `contextual-greeting.test.js`        |
| E2E         | `*.test.js` in `e2e/`         | `story-creation-clickup.test.js`     |
| Benchmark   | `*-benchmark.test.js`         | `decision-logging-benchmark.test.js` |

---

## Unit Tests

Unit tests verify individual functions and classes in isolation.

### Configuration (jest.config.js)

```javascript
module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',

  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*.spec.js',
    '**/.aios-core/**/__tests__/**/*.test.js',
  ],

  testTimeout: 30000,
  verbose: true,

  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],

  coverageThreshold: {
    global: {
      branches: 25,
      functions: 30,
      lines: 30,
      statements: 30,
    },
    '.aios-core/core/': {
      lines: 45,
    },
  },
};
```

### Writing Unit Tests

```javascript
/**
 * Quality Gate Manager Unit Tests
 *
 * @story 2.10 - Quality Gate Manager
 */

const {
  QualityGateManager,
} = require('../../../.aios-core/core/quality-gates/quality-gate-manager');

describe('QualityGateManager', () => {
  let manager;

  beforeEach(() => {
    manager = new QualityGateManager({
      layer1: { enabled: true },
      layer2: { enabled: true },
      layer3: { enabled: true },
    });
  });

  describe('constructor', () => {
    it('should create manager with default config', () => {
      const defaultManager = new QualityGateManager();
      expect(defaultManager).toBeDefined();
      expect(defaultManager.layers).toBeDefined();
    });

    it('should create manager with custom config', () => {
      const customManager = new QualityGateManager({
        layer1: { enabled: false },
      });
      expect(customManager.layers.layer1.enabled).toBe(false);
    });
  });

  describe('runLayer', () => {
    it('should throw error for invalid layer number', async () => {
      await expect(manager.runLayer(4)).rejects.toThrow('Invalid layer number: 4');
    });
  });

  describe('formatDuration', () => {
    it('should format milliseconds', () => {
      expect(manager.formatDuration(500)).toBe('500ms');
    });

    it('should format seconds', () => {
      expect(manager.formatDuration(5000)).toBe('5.0s');
    });

    it('should format minutes', () => {
      expect(manager.formatDuration(120000)).toBe('2.0m');
    });
  });
});
```

### Test Organization Best Practices

```javascript
describe('ComponentName', () => {
  // Setup and teardown
  beforeAll(() => {
    /* Global setup */
  });
  afterAll(() => {
    /* Global cleanup */
  });
  beforeEach(() => {
    /* Per-test setup */
  });
  afterEach(() => {
    /* Per-test cleanup */
  });

  // Group by method/feature
  describe('methodName', () => {
    it('should handle valid input', () => {});
    it('should throw on invalid input', () => {});
    it('should handle edge cases', () => {});
  });

  describe('another method', () => {
    // More tests...
  });
});
```

---

## Integration Tests

Integration tests verify that multiple components work together correctly.

### Setup for Integration Tests

```javascript
// tests/setup.js
process.env.NODE_ENV = 'test';
process.env.AIOS_DEBUG = 'false';

// Skip integration tests by default
if (process.env.SKIP_INTEGRATION_TESTS === undefined) {
  process.env.SKIP_INTEGRATION_TESTS = 'true';
}

// Global test timeout (increased for CI)
jest.setTimeout(process.env.CI ? 30000 : 10000);

// Helper to conditionally skip integration tests
global.describeIntegration =
  process.env.SKIP_INTEGRATION_TESTS === 'true' ? describe.skip : describe;

global.testIntegration = process.env.SKIP_INTEGRATION_TESTS === 'true' ? test.skip : test;
```

### Writing Integration Tests

```javascript
/**
 * Integration Tests for Contextual Greeting System
 *
 * End-to-end testing of:
 * - All 3 session types
 * - Git configured vs unconfigured
 * - Command visibility filtering
 * - Fallback scenarios
 */

const GreetingBuilder = require('../../.aios-core/development/scripts/greeting-builder');

describe('Contextual Greeting Integration Tests', () => {
  let builder;

  beforeEach(() => {
    builder = new GreetingBuilder();
  });

  describeIntegration('End-to-End Greeting Generation', () => {
    test('should generate complete new session greeting', async () => {
      const greeting = await builder.build({
        sessionType: 'new',
        agent: 'dev',
        gitConfigured: true,
      });

      expect(greeting).toContain('Welcome');
      expect(greeting).toContain('Quick Commands');
    });

    test('should handle git unconfigured gracefully', async () => {
      const greeting = await builder.build({
        sessionType: 'new',
        agent: 'dev',
        gitConfigured: false,
      });

      expect(greeting).not.toContain('git commit');
    });
  });
});
```

### Running Integration Tests

```bash
# Run all tests including integration
SKIP_INTEGRATION_TESTS=false npm test

# Run only integration tests
npm test -- --testPathPattern=integration

# Run specific integration test
npm test -- tests/integration/contextual-greeting.test.js
```

---

## End-to-End Tests

E2E tests verify complete user workflows from start to finish.

### E2E Test Structure

```javascript
/**
 * E2E Test: Story Creation with ClickUp
 *
 * Tests the complete flow:
 * 1. User initiates story creation
 * 2. Story is generated from template
 * 3. Story is synced to ClickUp
 * 4. Local file is updated with ClickUp ID
 */

describe('Story Creation E2E', () => {
  const TEST_PROJECT = 'test-project';

  beforeAll(async () => {
    // Setup test environment
    await setupTestProject(TEST_PROJECT);
  });

  afterAll(async () => {
    // Cleanup test artifacts
    await cleanupTestProject(TEST_PROJECT);
  });

  test('should create story and sync to ClickUp', async () => {
    // Step 1: Create story
    const story = await createStory({
      title: 'Test Story',
      type: 'feature',
    });

    expect(story.id).toBeDefined();
    expect(story.file).toMatch(/\.md$/);

    // Step 2: Verify ClickUp sync
    const clickupTask = await getClickUpTask(story.clickupId);
    expect(clickupTask.name).toBe('Test Story');

    // Step 3: Verify local file update
    const localContent = await readFile(story.file);
    expect(localContent).toContain(story.clickupId);
  }, 60000); // Extended timeout for E2E
});
```

### E2E Test Best Practices

| Practice                 | Description                                 |
| ------------------------ | ------------------------------------------- |
| **Isolated Environment** | Each E2E test should have its own test data |
| **Explicit Cleanup**     | Always clean up created resources           |
| **Extended Timeouts**    | E2E tests need longer timeouts (30-60s)     |
| **Real Services**        | Use real services, not mocks                |
| **Idempotent**           | Tests should be repeatable                  |

---

## Agent Tests

Testing AI agents requires special considerations for persona behavior and command execution.

### Agent Test Categories

| Category          | Tests                | Purpose                         |
| ----------------- | -------------------- | ------------------------------- |
| **Persona**       | Response style, tone | Verify agent stays in character |
| **Commands**      | Task execution       | Verify commands work correctly  |
| **Fallback**      | Error handling       | Verify graceful degradation     |
| **Compatibility** | Legacy support       | Verify old agents still work    |

### Agent Backward Compatibility Tests

```javascript
/**
 * Agent Backward Compatibility Tests
 *
 * Ensures agents from previous AIOS versions continue to work.
 */

const { loadAgent } = require('../../.aios-core/core/registry/agent-loader');

describe('Agent Backward Compatibility', () => {
  describe('Legacy Agent Format (v1.x)', () => {
    test('should load agent without visibility metadata', async () => {
      const agent = await loadAgent('legacy-agent-v1');

      expect(agent).toBeDefined();
      expect(agent.name).toBeDefined();
      expect(agent.commands).toBeDefined();
    });

    test('should apply default visibility when missing', async () => {
      const agent = await loadAgent('legacy-agent-v1');

      // Default visibility should be applied
      agent.commands.forEach((cmd) => {
        expect(cmd.visibility).toBeDefined();
      });
    });
  });

  describe('Current Agent Format (v2.x)', () => {
    test('should load agent with full metadata', async () => {
      const agent = await loadAgent('dev');

      expect(agent.slashPrefix).toBeDefined();
      expect(agent.icon).toBeDefined();
      expect(agent.persona).toBeDefined();
    });
  });
});
```

### Testing Agent Commands

```javascript
describe('Agent Commands', () => {
  let agent;

  beforeAll(async () => {
    agent = await activateAgent('dev');
  });

  test('*help should display available commands', async () => {
    const result = await agent.executeCommand('*help');

    expect(result.output).toContain('Available Commands');
    expect(result.exitCode).toBe(0);
  });

  test('*create-story should validate required fields', async () => {
    await expect(agent.executeCommand('*create-story')).rejects.toThrow(
      'Missing required field: title'
    );
  });
});
```

---

## Cross-Platform Testing

AIOS supports Windows, macOS, and Linux. Cross-platform testing ensures consistent behavior.

### Platform-Specific Test Files

```
tests/
├── integration/
│   ├── windows/
│   │   └── shell-compat.test.js    # Windows shell tests
│   ├── macos/
│   │   └── permission.test.js      # macOS permission tests
│   └── linux/
│       └── symlink.test.js         # Linux symlink tests
```

### Cross-Platform Test Utilities

```javascript
/**
 * Cross-platform test utilities
 */

const os = require('os');
const path = require('path');

const isWindows = process.platform === 'win32';
const isMacOS = process.platform === 'darwin';
const isLinux = process.platform === 'linux';

// Platform-specific describe
const describeWindows = isWindows ? describe : describe.skip;
const describeMacOS = isMacOS ? describe : describe.skip;
const describeLinux = isLinux ? describe : describe.skip;

// Normalize path separators for assertions
function normalizePath(p) {
  return p.replace(/\\/g, '/');
}

// Get platform-appropriate temp directory
function getTempDir() {
  return path.join(os.tmpdir(), 'aios-tests');
}

module.exports = {
  isWindows,
  isMacOS,
  isLinux,
  describeWindows,
  describeMacOS,
  describeLinux,
  normalizePath,
  getTempDir,
};
```

### Windows-Specific Tests

```javascript
/**
 * Windows Shell Compatibility Tests
 */

const { describeWindows } = require('../utils/platform');

describeWindows('Windows Shell Compatibility', () => {
  test('should handle Windows path separators', () => {
    const path = 'C:\\Users\\test\\project';
    const normalized = normalizePath(path);

    expect(normalized).toBe('C:/Users/test/project');
  });

  test('should execute PowerShell commands', async () => {
    const result = await executeShell('Get-Location', { shell: 'powershell' });

    expect(result.exitCode).toBe(0);
  });

  test('should handle cmd.exe fallback', async () => {
    const result = await executeShell('dir', { shell: 'cmd' });

    expect(result.exitCode).toBe(0);
  });
});
```

### CI Matrix Configuration

```yaml
# .github/workflows/test.yml
name: Cross-Platform Tests

on: [push, pull_request]

jobs:
  test:
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
        node-version: [18, 20, 22]

    runs-on: ${{ matrix.os }}

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}

      - run: npm ci
      - run: npm test

      - name: Run Platform-Specific Tests
        run: npm run test:platform
```

---

## Coverage and Metrics

### Coverage Configuration

```javascript
// jest.config.js - Coverage section
module.exports = {
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
    // Exclude I/O-heavy modules (better for integration tests)
    '!.aios-core/core/health-check/checks/**',
    '!.aios-core/core/config/**',
    '!.aios-core/core/manifest/**',
    '!.aios-core/core/registry/**',
    '!.aios-core/core/utils/**',
  ],

  coverageThreshold: {
    global: {
      branches: 25,
      functions: 30,
      lines: 30,
      statements: 30,
    },
    '.aios-core/core/': {
      lines: 45,
    },
  },

  coveragePathIgnorePatterns: ['/node_modules/', '/coverage/', '/.husky/', '/dist/'],
};
```

### Coverage Targets

| Module            | Target | Current | Notes            |
| ----------------- | ------ | ------- | ---------------- |
| **Global**        | 30%    | ~31%    | Minimum baseline |
| **Core**          | 45%    | ~47%    | Business logic   |
| **Quality Gates** | 80%    | TBD     | Critical path    |
| **Squad System**  | 70%    | TBD     | User-facing      |

### Viewing Coverage Reports

```bash
# Generate coverage report
npm run test:coverage

# Open HTML report (macOS)
open coverage/lcov-report/index.html

# Open HTML report (Windows)
start coverage/lcov-report/index.html

# Open HTML report (Linux)
xdg-open coverage/lcov-report/index.html
```

### Coverage Report Structure

```
coverage/
├── lcov-report/          # HTML report
│   ├── index.html        # Overview
│   └── .aios-core/       # Per-module coverage
├── lcov.info             # LCOV format (for CI)
├── coverage-summary.json # JSON summary
└── clover.xml            # Clover format
```

---

## CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  unit-tests:
    name: Unit Tests
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm test

      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with:
          files: ./coverage/lcov.info
          fail_ci_if_error: true

  integration-tests:
    name: Integration Tests
    runs-on: ubuntu-latest
    needs: unit-tests

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run integration tests
        run: SKIP_INTEGRATION_TESTS=false npm test -- --testPathPattern=integration
        env:
          CLICKUP_API_KEY: ${{ secrets.CLICKUP_API_KEY }}

  quality-gate:
    name: Quality Gate
    runs-on: ubuntu-latest
    needs: [unit-tests, integration-tests]

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'

      - run: npm ci

      - name: Lint
        run: npm run lint

      - name: TypeCheck
        run: npm run typecheck

      - name: Coverage threshold
        run: npm run test:coverage -- --coverageReporters=text-summary
```

### Pre-commit Hook

```bash
#!/bin/sh
# .husky/pre-commit

# Run lint-staged
npx lint-staged

# Run quick unit tests
npm test -- --passWithNoTests --testPathIgnorePatterns=integration,e2e
```

### Quality Gate Integration

The AIOS Quality Gate System (see [Quality Gates Guide](./quality-gates.md)) integrates testing at multiple layers:

| Layer       | Test Type               | When         |
| ----------- | ----------------------- | ------------ |
| **Layer 1** | Unit + Lint + TypeCheck | Pre-commit   |
| **Layer 2** | Integration + AI Review | PR creation  |
| **Layer 3** | E2E + Human Review      | Before merge |

---

## Writing Good Tests

### Test Structure (AAA Pattern)

```javascript
test('should calculate total price with discount', () => {
  // Arrange - Setup test data and conditions
  const cart = new ShoppingCart();
  cart.addItem({ name: 'Widget', price: 100 });
  cart.addItem({ name: 'Gadget', price: 50 });
  const discount = 0.1; // 10% discount

  // Act - Execute the code under test
  const total = cart.calculateTotal(discount);

  // Assert - Verify the results
  expect(total).toBe(135); // (100 + 50) * 0.9
});
```

### Test Naming Guidelines

| Bad             | Good                                                     |
| --------------- | -------------------------------------------------------- |
| `test('test1')` | `test('should return null for empty input')`             |
| `test('works')` | `test('should calculate tax correctly')`                 |
| `test('error')` | `test('should throw ValidationError for invalid email')` |

### Edge Cases to Test

```javascript
describe('validateEmail', () => {
  // Happy path
  test('should accept valid email', () => {
    expect(validateEmail('user@example.com')).toBe(true);
  });

  // Edge cases
  test('should reject empty string', () => {
    expect(validateEmail('')).toBe(false);
  });

  test('should reject null', () => {
    expect(validateEmail(null)).toBe(false);
  });

  test('should reject undefined', () => {
    expect(validateEmail(undefined)).toBe(false);
  });

  // Boundary conditions
  test('should accept email with single char local part', () => {
    expect(validateEmail('a@example.com')).toBe(true);
  });

  test('should reject email without @ symbol', () => {
    expect(validateEmail('userexample.com')).toBe(false);
  });

  // Special characters
  test('should accept email with plus sign', () => {
    expect(validateEmail('user+tag@example.com')).toBe(true);
  });
});
```

### Async Test Patterns

```javascript
// Using async/await (recommended)
test('should fetch user data', async () => {
  const user = await fetchUser(123);
  expect(user.name).toBe('John');
});

// Testing promise rejection
test('should reject for non-existent user', async () => {
  await expect(fetchUser(999)).rejects.toThrow('User not found');
});

// Testing with done callback (legacy)
test('should callback with data', (done) => {
  fetchUserCallback(123, (err, user) => {
    expect(err).toBeNull();
    expect(user.name).toBe('John');
    done();
  });
});
```

### Test Isolation

```javascript
describe('FileManager', () => {
  let tempDir;
  let fileManager;

  beforeEach(async () => {
    // Create isolated temp directory for each test
    tempDir = await createTempDir();
    fileManager = new FileManager(tempDir);
  });

  afterEach(async () => {
    // Clean up after each test
    await removeTempDir(tempDir);
  });

  test('should create file', async () => {
    await fileManager.write('test.txt', 'content');
    const exists = await fileManager.exists('test.txt');
    expect(exists).toBe(true);
  });

  test('should not see files from other tests', async () => {
    // This test starts with a fresh directory
    const files = await fileManager.list();
    expect(files).toHaveLength(0);
  });
});
```

---

## Mocking and Fixtures

### Jest Mocking Basics

```javascript
// Mock a module
jest.mock('fs-extra');
const fs = require('fs-extra');

// Mock implementation
fs.readFile.mockResolvedValue('file content');
fs.writeFile.mockResolvedValue(undefined);

// Mock return value
fs.existsSync.mockReturnValue(true);

// Mock implementation for specific call
fs.readFile.mockImplementation((path) => {
  if (path === 'config.json') {
    return Promise.resolve('{"key": "value"}');
  }
  return Promise.reject(new Error('File not found'));
});
```

### Creating Test Fixtures

```javascript
// tests/fixtures/agent-fixtures.js
const MOCK_AGENT = {
  name: 'test-agent',
  slashPrefix: 'test',
  icon: '🧪',
  persona: {
    role: 'Test Agent',
    expertise: ['testing'],
  },
  commands: [
    {
      name: '*test',
      description: 'Run tests',
      visibility: 'all',
    },
  ],
};

const MOCK_SQUAD = {
  name: 'test-squad',
  version: '1.0.0',
  agents: [MOCK_AGENT],
  tasks: [],
};

module.exports = {
  MOCK_AGENT,
  MOCK_SQUAD,
};
```

### Using Fixtures in Tests

```javascript
const { MOCK_AGENT, MOCK_SQUAD } = require('../fixtures/agent-fixtures');

describe('AgentLoader', () => {
  test('should load agent from fixture', async () => {
    // Mock the file system to return fixture data
    jest.spyOn(fs, 'readFile').mockResolvedValue(JSON.stringify(MOCK_AGENT));

    const agent = await loadAgent('test-agent');

    expect(agent.name).toBe(MOCK_AGENT.name);
    expect(agent.commands).toHaveLength(1);
  });
});
```

### Mocking External Services

```javascript
// Mock ClickUp API
jest.mock('../../.aios-core/integrations/clickup-client');
const clickupClient = require('../../.aios-core/integrations/clickup-client');

describe('Story Sync', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Setup default mock implementations
    clickupClient.createTask.mockResolvedValue({
      id: 'task-123',
      name: 'Test Task',
    });

    clickupClient.updateTask.mockResolvedValue({
      id: 'task-123',
      status: 'in progress',
    });
  });

  test('should create task in ClickUp', async () => {
    const result = await syncStory({ title: 'New Feature' });

    expect(clickupClient.createTask).toHaveBeenCalledWith({
      name: 'New Feature',
      list_id: expect.any(String),
    });
    expect(result.clickupId).toBe('task-123');
  });

  test('should handle ClickUp API errors', async () => {
    clickupClient.createTask.mockRejectedValue(new Error('API rate limited'));

    await expect(syncStory({ title: 'New Feature' })).rejects.toThrow(
      'Failed to sync: API rate limited'
    );
  });
});
```

### Snapshot Testing

```javascript
describe('GreetingBuilder', () => {
  test('should generate consistent greeting format', async () => {
    const builder = new GreetingBuilder();
    const greeting = await builder.build({
      agent: 'dev',
      sessionType: 'new',
      timestamp: new Date('2025-01-01T00:00:00Z'), // Fixed timestamp
    });

    // Snapshot comparison
    expect(greeting).toMatchSnapshot();
  });
});
```

---

## NPM Commands Reference

### Basic Commands

| Command                 | Description                    |
| ----------------------- | ------------------------------ |
| `npm test`              | Run all tests                  |
| `npm run test:watch`    | Run tests in watch mode        |
| `npm run test:coverage` | Run tests with coverage report |

### Filtered Test Commands

```bash
# Run tests matching pattern
npm test -- --testPathPattern=unit

# Run specific test file
npm test -- tests/unit/greeting-builder.test.js

# Run tests matching name
npm test -- --testNamePattern="should validate"

# Run tests in specific directory
npm test -- tests/integration/
```

### Coverage Commands

```bash
# Generate full coverage report
npm run test:coverage

# Coverage with specific reporter
npm test -- --coverage --coverageReporters=text

# Coverage for specific files
npm test -- --coverage --collectCoverageFrom="src/**/*.js"
```

### Watch Mode Options

```bash
# Watch all tests
npm run test:watch

# Watch specific files
npm test -- --watch --testPathPattern=unit

# Watch only changed files
npm test -- --watchAll=false --watch
```

### Debug Mode

```bash
# Run with verbose output
npm test -- --verbose

# Run single test for debugging
npm test -- --runInBand tests/unit/specific.test.js

# Run with Node debugger
node --inspect-brk node_modules/.bin/jest --runInBand
```

### CI-Specific Commands

```bash
# Run in CI mode (no colors, coverage, etc.)
npm test -- --ci

# Run with max workers
npm test -- --maxWorkers=4

# Bail on first failure
npm test -- --bail

# Run only changed files (Git)
npm test -- --changedSince=main
```

---

## Troubleshooting

### Common Issues

| Issue            | Solution                                          |
| ---------------- | ------------------------------------------------- |
| Tests timeout    | Increase `testTimeout` in config or specific test |
| Async tests hang | Ensure all promises are awaited or returned       |
| Mock not working | Check mock is before `require()`                  |
| Coverage low     | Add `--collectCoverageFrom` patterns              |
| Tests flaky      | Check for shared state, use `beforeEach` cleanup  |

### Debugging Hanging Tests

```javascript
// Add timeout to specific test
test('slow operation', async () => {
  // ...
}, 60000); // 60 second timeout

// Debug with console output
test('debug test', async () => {
  console.log('Step 1');
  await step1();
  console.log('Step 2');
  await step2();
  console.log('Done');
});
```

### Fixing Mock Issues

```javascript
// Wrong: Mock after require
const myModule = require('./myModule');
jest.mock('./myModule');

// Correct: Mock before require
jest.mock('./myModule');
const myModule = require('./myModule');

// Or use jest.doMock for dynamic mocking
beforeEach(() => {
  jest.resetModules();
  jest.doMock('./myModule', () => ({
    func: jest.fn().mockReturnValue('mocked'),
  }));
});
```

### Resolving Coverage Issues

```javascript
// Coverage not collecting? Check paths
module.exports = {
  collectCoverageFrom: [
    // Use relative paths from project root
    'src/**/*.js',
    // Exclude patterns
    '!**/node_modules/**',
  ],
  // Root directories to search
  roots: ['<rootDir>'],
};
```

---

## Related Documentation

- [Quality Gates Guide](./quality-gates.md) - Automated quality checks
- [CI/CD Architecture](../architecture/cicd.md) - Pipeline configuration
- [Contributing Guide](./contributing.md) - Development workflow

---

_Synkra AIOS v2.1 Testing Guide_
