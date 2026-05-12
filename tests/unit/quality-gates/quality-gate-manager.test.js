/**
 * Quality Gate Manager Unit Tests
 *
 * @story 2.10 - Quality Gate Manager
 */

const { QualityGateManager } = require('../../../.aiox-core/core/quality-gates/quality-gate-manager');

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
      expect(defaultManager.layers.layer1).toBeDefined();
      expect(defaultManager.layers.layer2).toBeDefined();
      expect(defaultManager.layers.layer3).toBeDefined();
    });

    it('should create manager with custom config', () => {
      const customManager = new QualityGateManager({
        layer1: { enabled: false },
        layer2: { enabled: true },
        layer3: { enabled: false },
      });
      expect(customManager.layers.layer1.enabled).toBe(false);
      expect(customManager.layers.layer2.enabled).toBe(true);
      expect(customManager.layers.layer3.enabled).toBe(false);
    });
  });

  describe('runLayer', () => {
    it('should throw error for invalid layer number', async () => {
      await expect(manager.runLayer(4)).rejects.toThrow('Invalid layer number: 4');
      await expect(manager.runLayer(0)).rejects.toThrow('Invalid layer number: 0');
    });

    it('should run Layer 1', async () => {
      // Mock runCommand to avoid actual command execution
      manager.layers.layer1.runCommand = jest.fn().mockResolvedValue({
        exitCode: 0,
        stdout: '0 errors',
        stderr: '',
        duration: 100,
      });

      const result = await manager.runLayer(1, { verbose: false });
      expect(result).toBeDefined();
      expect(result.layer).toBe('Layer 1: Pre-commit');
    });

    it('should run Layer 2', async () => {
      // Mock runCommand to avoid actual WSL/CodeRabbit calls
      manager.layers.layer2.runCommand = jest.fn().mockResolvedValue({
        exitCode: 0,
        stdout: 'No issues found',
        stderr: '',
        duration: 50,
      });

      const result = await manager.runLayer(2, { verbose: false });
      expect(result).toBeDefined();
      expect(result.layer).toBe('Layer 2: PR Automation');
    });

    it('should run Layer 3', async () => {
      // Mock file operations to avoid actual filesystem access
      manager.layers.layer3.runCommand = jest.fn().mockResolvedValue({
        exitCode: 0,
        stdout: 'Review complete',
        stderr: '',
        duration: 50,
      });

      const result = await manager.runLayer(3, { verbose: false });
      expect(result).toBeDefined();
      expect(result.layer).toBe('Layer 3: Human Review');
    });
  });

  describe('getDuration', () => {
    it('should return 0 when not started', () => {
      expect(manager.getDuration()).toBe(0);
    });

    it('should return duration after execution', async () => {
      manager.startTime = Date.now() - 1000;
      manager.endTime = Date.now();
      const duration = manager.getDuration();
      expect(duration).toBeGreaterThanOrEqual(1000);
      expect(duration).toBeLessThan(1100);
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

  describe('failFast', () => {
    it('should return fail-fast result', () => {
      manager.startTime = Date.now();
      const result = manager.failFast({ pass: false, layer: 'Layer 1' });

      expect(result.pass).toBe(false);
      expect(result.status).toBe('failed');
      expect(result.stoppedAt).toBe('layer1');
      expect(result.reason).toBe('fail-fast');
      expect(result.exitCode).toBe(1);
    });
  });

  describe('escalate', () => {
    it('should return escalation result', () => {
      manager.startTime = Date.now();
      const result = manager.escalate({ pass: false, layer: 'Layer 2' });

      expect(result.pass).toBe(false);
      expect(result.status).toBe('blocked');
      expect(result.stoppedAt).toBe('layer2');
      expect(result.reason).toBe('escalation');
      expect(result.exitCode).toBe(1);
    });
  });

  describe('determineOverallStatus', () => {
    it('should return not-started when no layer1', () => {
      expect(manager.determineOverallStatus({})).toBe('not-started');
    });

    it('should return layer1-failed when layer1 failed', () => {
      expect(manager.determineOverallStatus({ layer1: { pass: false } })).toBe('layer1-failed');
    });

    it('should return layer1-complete when only layer1 passed', () => {
      expect(manager.determineOverallStatus({ layer1: { pass: true } })).toBe('layer1-complete');
    });

    it('should return layer2-blocked when layer2 failed', () => {
      expect(manager.determineOverallStatus({
        layer1: { pass: true },
        layer2: { pass: false },
      })).toBe('layer2-blocked');
    });

    it('should return layer3-pending when awaiting human review', () => {
      expect(manager.determineOverallStatus({
        layer1: { pass: true },
        layer2: { pass: true },
        layer3: { pass: true },
      })).toBe('layer3-pending');
    });
  });
});
