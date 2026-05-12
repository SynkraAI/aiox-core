/**
 * Elicitation Engine Tests
 *
 * Tests for the ElicitationEngine class including:
 * - Input validation
 * - ReDoS pattern safety
 * - Session management
 * - Condition evaluation
 * - Smart defaults
 *
 * @story TD-6 - CI Stability & Test Coverage Improvements
 */

const path = require('path');
const os = require('os');

// Mock inquirer before requiring the engine
jest.mock('inquirer', () => ({
  prompt: jest.fn().mockResolvedValue({}),
}));

// Mock fs-extra to avoid actual file operations
jest.mock('fs-extra', () => ({
  ensureDir: jest.fn().mockResolvedValue(),
  writeJson: jest.fn().mockResolvedValue(),
  readJson: jest.fn().mockResolvedValue({}),
  pathExists: jest.fn().mockResolvedValue(false),
}));

// Mock chalk to avoid color output issues in tests
jest.mock('chalk', () => ({
  blue: (str) => str,
  yellow: (str) => str,
  gray: (str) => str,
  red: (str) => str,
  cyan: (str) => str,
  green: (str) => str,
}));

// Mock the security checker to force using BasicInputValidator
jest.mock('../../.aiox-core/infrastructure/scripts/security-checker', () => {
  throw new Error('Not found');
});

const ElicitationEngine = require('../../.aiox-core/core/elicitation/elicitation-engine');

// Set timeout for all tests
jest.setTimeout(30000);

describe('ElicitationEngine', () => {
  describe('Constructor', () => {
    it('should create instance with default security checker', () => {
      const engine = new ElicitationEngine();

      expect(engine).toBeDefined();
      expect(engine.securityChecker).toBeDefined();
      expect(engine.sessionManager).toBeDefined();
      expect(engine.sessionData).toEqual({});
      expect(engine.currentSession).toBeNull();
    });

    it('should initialize with empty session file', () => {
      const engine = new ElicitationEngine();

      expect(engine.sessionFile).toBeNull();
    });
  });

  describe('startSession', () => {
    it('should initialize session data', async () => {
      const engine = new ElicitationEngine();

      await engine.startSession('agent', { customOption: true });

      expect(engine.sessionData.componentType).toBe('agent');
      expect(engine.sessionData.startTime).toBeDefined();
      expect(engine.sessionData.answers).toEqual({});
      expect(engine.sessionData.currentStep).toBe(0);
      expect(engine.sessionData.options.customOption).toBe(true);
    });

    it('should set currentSession reference', async () => {
      const engine = new ElicitationEngine();

      await engine.startSession('workflow');

      expect(engine.currentSession).toBe(engine.sessionData);
    });

    it('should handle saveSession option', async () => {
      const engine = new ElicitationEngine();
      const fs = require('fs-extra');

      await engine.startSession('task', { saveSession: true });

      expect(engine.sessionData.saveSession).toBe(true);
      expect(engine.sessionFile).toContain('task-');
      expect(fs.ensureDir).toHaveBeenCalled();
    });
  });

  describe('evaluateCondition', () => {
    let engine;

    beforeEach(async () => {
      engine = new ElicitationEngine();
      await engine.startSession('test');
      engine.sessionData.answers = {
        name: 'TestAgent',
        type: 'workflow',
        features: ['logging', 'metrics'],
      };
    });

    it('should evaluate equals condition correctly', () => {
      const condition = { field: 'type', operator: 'equals', value: 'workflow' };
      expect(engine.evaluateCondition(condition)).toBe(true);

      const falseCondition = { field: 'type', operator: 'equals', value: 'task' };
      expect(engine.evaluateCondition(falseCondition)).toBe(false);
    });

    it('should evaluate notEquals condition correctly', () => {
      const condition = { field: 'type', operator: 'notEquals', value: 'task' };
      expect(engine.evaluateCondition(condition)).toBe(true);

      const falseCondition = { field: 'type', operator: 'notEquals', value: 'workflow' };
      expect(engine.evaluateCondition(falseCondition)).toBe(false);
    });

    it('should evaluate includes condition correctly', () => {
      const condition = { field: 'features', operator: 'includes', value: 'logging' };
      expect(engine.evaluateCondition(condition)).toBe(true);

      const falseCondition = { field: 'features', operator: 'includes', value: 'auth' };
      expect(engine.evaluateCondition(falseCondition)).toBe(false);
    });

    it('should evaluate exists condition correctly', () => {
      const condition = { field: 'name', operator: 'exists' };
      expect(engine.evaluateCondition(condition)).toBe(true);

      const falseCondition = { field: 'nonexistent', operator: 'exists' };
      expect(engine.evaluateCondition(falseCondition)).toBe(false);
    });

    it('should return true for unknown operator', () => {
      const condition = { field: 'name', operator: 'unknown', value: 'test' };
      expect(engine.evaluateCondition(condition)).toBe(true);
    });
  });

  describe('getSmartDefault', () => {
    let engine;

    beforeEach(async () => {
      engine = new ElicitationEngine();
      await engine.startSession('test');
      engine.sessionData.answers = {
        agentName: 'My Agent Name',
        useLogging: true,
      };
    });

    it('should get value from previous answer', () => {
      const config = { type: 'fromAnswer', source: 'agentName' };
      expect(engine.getSmartDefault(config)).toBe('My Agent Name');
    });

    it('should apply transform to previous answer', () => {
      const config = {
        type: 'fromAnswer',
        source: 'agentName',
        transform: (val) => val.toUpperCase(),
      };
      expect(engine.getSmartDefault(config)).toBe('MY AGENT NAME');
    });

    it('should handle conditional defaults - true case', () => {
      const config = {
        type: 'conditional',
        condition: { field: 'useLogging', operator: 'equals', value: true },
        ifTrue: 'debug',
        ifFalse: 'error',
      };
      expect(engine.getSmartDefault(config)).toBe('debug');
    });

    it('should handle conditional defaults - false case', () => {
      engine.sessionData.answers.useLogging = false;
      const config = {
        type: 'conditional',
        condition: { field: 'useLogging', operator: 'equals', value: true },
        ifTrue: 'debug',
        ifFalse: 'error',
      };
      expect(engine.getSmartDefault(config)).toBe('error');
    });

    it('should return undefined for unknown type', () => {
      const config = { type: 'unknown' };
      expect(engine.getSmartDefault(config)).toBeUndefined();
    });
  });

  describe('generateDefault', () => {
    let engine;

    beforeEach(async () => {
      engine = new ElicitationEngine();
      await engine.startSession('test');
      engine.sessionData.answers = {
        displayName: 'My Cool Agent',
      };
    });

    it('should generate kebabCase from source', () => {
      const config = { generator: 'kebabCase', source: 'displayName' };
      expect(engine.generateDefault(config)).toBe('my-cool-agent');
    });

    it('should handle kebabCase with special characters', () => {
      engine.sessionData.answers.displayName = 'My Agent!@#$%';
      const config = { generator: 'kebabCase', source: 'displayName' };
      expect(engine.generateDefault(config)).toBe('my-agent');
    });

    it('should generate timestamp', () => {
      const config = { generator: 'timestamp' };
      const result = engine.generateDefault(config);
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it('should generate version', () => {
      const config = { generator: 'version' };
      expect(engine.generateDefault(config)).toBe('1.0.0');
    });

    it('should return empty string for unknown generator', () => {
      const config = { generator: 'unknown' };
      expect(engine.generateDefault(config)).toBe('');
    });
  });

  describe('validateStepAnswers', () => {
    let engine;

    beforeEach(async () => {
      engine = new ElicitationEngine();
      await engine.startSession('test');
    });

    it('should pass validation when no requirements', async () => {
      const answers = { name: 'test' };
      const step = {};

      const result = await engine.validateStepAnswers(answers, step);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail validation for missing required field', async () => {
      const answers = { name: '' };
      const step = { required: ['name', 'description'] };

      const result = await engine.validateStepAnswers(answers, step);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('name is required');
      expect(result.errors).toContain('description is required');
    });

    it('should pass validation when required fields present', async () => {
      const answers = { name: 'test', description: 'A test' };
      const step = { required: ['name', 'description'] };

      const result = await engine.validateStepAnswers(answers, step);

      expect(result.valid).toBe(true);
    });

    it('should run custom validators', async () => {
      const answers = { name: 'test' };
      const step = {
        validators: [(val) => (val.name.length > 10 ? true : 'Name too short')],
      };

      const result = await engine.validateStepAnswers(answers, step);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Name too short');
    });
  });

  describe('runValidator', () => {
    let engine;

    beforeEach(async () => {
      engine = new ElicitationEngine();
      await engine.startSession('test');
    });

    it('should run function validator', async () => {
      const validator = (val) => (val.length > 3 ? true : 'Too short');

      expect(await engine.runValidator(validator, 'test')).toBe(true);
      expect(await engine.runValidator(validator, 'ab')).toBe('Too short');
    });

    it('should validate regex pattern', async () => {
      const validator = {
        type: 'regex',
        pattern: '^[a-z-]+$',
        message: 'Must be lowercase with hyphens',
      };

      expect(await engine.runValidator(validator, 'my-agent')).toBe(true);
      expect(await engine.runValidator(validator, 'My Agent')).toBe(
        'Must be lowercase with hyphens',
      );
    });

    it('should reject unsafe regex patterns', async () => {
      const validator = {
        type: 'regex',
        pattern: '(.+)+$', // ReDoS pattern
      };

      const result = await engine.runValidator(validator, 'test');
      // Should return the default unsafe pattern message
      expect(result).toContain('Invalid or unsafe');
    });

    it('should validate length - min', async () => {
      const validator = { type: 'length', min: 5 };

      expect(await engine.runValidator(validator, 'hello')).toBe(true);
      expect(await engine.runValidator(validator, 'hi')).toBe('Must be at least 5 characters');
    });

    it('should validate length - max', async () => {
      const validator = { type: 'length', max: 10 };

      expect(await engine.runValidator(validator, 'hello')).toBe(true);
      expect(await engine.runValidator(validator, 'this is too long')).toBe(
        'Must be at most 10 characters',
      );
    });

    it('should return true for unknown validator type', async () => {
      const validator = { type: 'unknown' };
      expect(await engine.runValidator(validator, 'test')).toBe(true);
    });

    it('should return true for non-object non-function validator', async () => {
      expect(await engine.runValidator('string', 'test')).toBe(true);
      expect(await engine.runValidator(123, 'test')).toBe(true);
    });
  });

  describe('getSessionSummary', () => {
    it('should return session summary', async () => {
      const engine = new ElicitationEngine();
      await engine.startSession('agent');
      engine.sessionData.answers = { name: 'test', type: 'workflow' };
      engine.sessionData.currentStep = 2;

      const summary = engine.getSessionSummary();

      expect(summary.componentType).toBe('agent');
      expect(summary.completedSteps).toBe(3);
      expect(summary.answers).toBe(2);
      expect(summary.duration).toBeGreaterThanOrEqual(0);
    });

    it('should handle empty session gracefully', async () => {
      const engine = new ElicitationEngine();
      // Initialize with minimal session to avoid null reference
      await engine.startSession('empty');
      const summary = engine.getSessionSummary();

      expect(summary.componentType).toBe('empty');
      expect(summary.duration).toBeGreaterThanOrEqual(0);
    });
  });

  describe('mockSession', () => {
    it('should set mocked answers', async () => {
      const engine = new ElicitationEngine();
      const mockAnswers = { name: 'MockAgent', type: 'task' };

      await engine.mockSession(mockAnswers);

      expect(engine.mockedAnswers).toEqual(mockAnswers);
      expect(engine.isMocked).toBe(true);
    });
  });

  describe('completeSession', () => {
    it('should complete session with status when saveSession is false', async () => {
      const engine = new ElicitationEngine();
      await engine.startSession('test', { saveSession: false });

      await engine.completeSession('completed');

      expect(engine.currentSession.status).toBe('completed');
      expect(engine.currentSession.completedAt).toBeDefined();
    });

    it('should handle null currentSession gracefully', async () => {
      const engine = new ElicitationEngine();

      // Should not throw when currentSession is null
      await expect(engine.completeSession('completed')).resolves.toBeUndefined();
    });

    it('should set completedAt timestamp', async () => {
      const engine = new ElicitationEngine();
      await engine.startSession('test');

      await engine.completeSession('success');

      expect(engine.currentSession.completedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });
  });
});

describe('BasicInputValidator', () => {
  let engine;

  beforeEach(() => {
    engine = new ElicitationEngine();
  });

  it('should pass valid input', () => {
    const result = engine.securityChecker.checkCode('normal input text');

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should block eval patterns', () => {
    const result = engine.securityChecker.checkCode('eval("malicious")');

    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('should block Function constructor', () => {
    const result = engine.securityChecker.checkCode('new Function("return 1")');

    expect(result.valid).toBe(false);
  });

  it('should block script tags', () => {
    const result = engine.securityChecker.checkCode('<script>alert(1)</script>');

    expect(result.valid).toBe(false);
  });

  it('should block javascript: protocol', () => {
    const result = engine.securityChecker.checkCode('javascript:void(0)');

    expect(result.valid).toBe(false);
  });
});
