/**
 * Layer 1: Pre-commit Unit Tests
 *
 * @story 2.10 - Quality Gate Manager
 */

const { Layer1PreCommit } = require('../../../.aiox-core/core/quality-gates/layer1-precommit');

describe('Layer1PreCommit', () => {
  let layer;

  beforeEach(() => {
    layer = new Layer1PreCommit({
      enabled: true,
      failFast: true,
      checks: {
        lint: { enabled: true, command: 'npm run lint' },
        test: { enabled: true, command: 'npm test' },
        typecheck: { enabled: true, command: 'npm run typecheck' },
      },
    });
  });

  describe('constructor', () => {
    it('should create layer with default config', () => {
      const defaultLayer = new Layer1PreCommit();
      expect(defaultLayer).toBeDefined();
      expect(defaultLayer.name).toBe('Layer 1: Pre-commit');
      expect(defaultLayer.enabled).toBe(true);
      expect(defaultLayer.failFast).toBe(true);
    });

    it('should create layer with custom config', () => {
      const customLayer = new Layer1PreCommit({
        enabled: false,
        failFast: false,
        checks: {
          lint: { enabled: false },
        },
      });
      expect(customLayer.enabled).toBe(false);
      expect(customLayer.failFast).toBe(false);
      expect(customLayer.checks.lint.enabled).toBe(false);
    });
  });

  describe('execute', () => {
    it('should return skipped result when disabled', async () => {
      const disabledLayer = new Layer1PreCommit({ enabled: false });
      const result = await disabledLayer.execute();

      expect(result.enabled).toBe(false);
      expect(result.results[0].skipped).toBe(true);
    });

    it('should have required properties in result', async () => {
      // Mock the runCommand to avoid actual command execution
      layer.runCommand = jest.fn().mockResolvedValue({
        exitCode: 0,
        stdout: '0 errors\n0 warnings',
        stderr: '',
        duration: 100,
      });

      const result = await layer.execute({ verbose: false });

      expect(result).toHaveProperty('layer');
      expect(result).toHaveProperty('pass');
      expect(result).toHaveProperty('duration');
      expect(result).toHaveProperty('results');
    });
  });

  describe('runLint', () => {
    it('should parse lint results correctly', async () => {
      layer.runCommand = jest.fn().mockResolvedValue({
        exitCode: 0,
        stdout: '0 errors, 5 warnings',
        stderr: '',
        duration: 1000,
      });

      const result = await layer.runLint();

      expect(result.check).toBe('lint');
      expect(result.pass).toBe(true);
      expect(result.warnings).toBe(5);
      expect(result.errors).toBe(0);
    });

    it('should fail on lint errors', async () => {
      layer.runCommand = jest.fn().mockResolvedValue({
        exitCode: 1,
        stdout: '3 errors, 2 warnings',
        stderr: '',
        duration: 1000,
      });

      const result = await layer.runLint();

      expect(result.pass).toBe(false);
      expect(result.errors).toBe(3);
    });
  });

  describe('runTests', () => {
    it('should parse test results correctly', async () => {
      layer.runCommand = jest.fn().mockResolvedValue({
        exitCode: 0,
        stdout: '10 pass, 0 fail, 2 skip',
        stderr: '',
        duration: 5000,
      });

      const result = await layer.runTests();

      expect(result.check).toBe('test');
      expect(result.pass).toBe(true);
      expect(result.tests.passed).toBe(10);
      expect(result.tests.failed).toBe(0);
      expect(result.tests.skipped).toBe(2);
    });

    it('should fail when tests fail', async () => {
      layer.runCommand = jest.fn().mockResolvedValue({
        exitCode: 1,
        stdout: '8 pass, 2 fail',
        stderr: '',
        duration: 5000,
      });

      const result = await layer.runTests();

      expect(result.pass).toBe(false);
      expect(result.tests.failed).toBe(2);
    });
  });

  describe('runTypeCheck', () => {
    it('should pass when no type errors', async () => {
      layer.runCommand = jest.fn().mockResolvedValue({
        exitCode: 0,
        stdout: '',
        stderr: '',
        duration: 2000,
      });

      const result = await layer.runTypeCheck();

      expect(result.check).toBe('typecheck');
      expect(result.pass).toBe(true);
      expect(result.errors).toBe(0);
    });

    it('should fail on type errors', async () => {
      layer.runCommand = jest.fn().mockResolvedValue({
        exitCode: 1,
        stdout: '',
        stderr: '5 errors found',
        duration: 2000,
      });

      const result = await layer.runTypeCheck();

      expect(result.pass).toBe(false);
      expect(result.errors).toBe(5);
    });
  });

  describe('getSummary', () => {
    it('should return correct summary after execution', async () => {
      layer.runCommand = jest.fn().mockResolvedValue({
        exitCode: 0,
        stdout: '0 errors',
        stderr: '',
        duration: 100,
      });

      await layer.execute();
      const summary = layer.getSummary();

      expect(summary.layer).toBe('Layer 1: Pre-commit');
      expect(summary.checks).toHaveProperty('total');
      expect(summary.checks).toHaveProperty('passed');
      expect(summary.checks).toHaveProperty('failed');
    });
  });

  describe('formatDuration', () => {
    it('should format milliseconds', () => {
      expect(layer.formatDuration(500)).toBe('500ms');
    });

    it('should format seconds', () => {
      expect(layer.formatDuration(5000)).toBe('5.0s');
    });

    it('should format minutes', () => {
      expect(layer.formatDuration(120000)).toBe('2.0m');
    });
  });
});
