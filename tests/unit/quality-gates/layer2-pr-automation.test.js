/**
 * Layer 2: PR Automation Unit Tests
 *
 * @story 2.10 - Quality Gate Manager
 */

const { Layer2PRAutomation } = require('../../../.aiox-core/core/quality-gates/layer2-pr-automation');

describe('Layer2PRAutomation', () => {
  let layer;

  beforeEach(() => {
    layer = new Layer2PRAutomation({
      enabled: true,
      coderabbit: {
        enabled: true,
        blockOn: ['CRITICAL'],
        warnOn: ['HIGH'],
      },
      quinn: {
        enabled: true,
        autoReview: true,
      },
    });
  });

  describe('constructor', () => {
    it('should create layer with default config', () => {
      const defaultLayer = new Layer2PRAutomation();
      expect(defaultLayer).toBeDefined();
      expect(defaultLayer.name).toBe('Layer 2: PR Automation');
      expect(defaultLayer.enabled).toBe(true);
    });

    it('should create layer with custom config', () => {
      const customLayer = new Layer2PRAutomation({
        enabled: false,
        coderabbit: { enabled: false },
      });
      expect(customLayer.enabled).toBe(false);
      expect(customLayer.coderabbit.enabled).toBe(false);
    });
  });

  describe('execute', () => {
    it('should return skipped result when disabled', async () => {
      const disabledLayer = new Layer2PRAutomation({ enabled: false });
      const result = await disabledLayer.execute();

      expect(result.enabled).toBe(false);
      expect(result.results[0].skipped).toBe(true);
    });
  });

  describe('parseCodeRabbitOutput', () => {
    it('should parse CRITICAL issues', () => {
      const output = 'CRITICAL: SQL injection vulnerability found';
      const issues = layer.parseCodeRabbitOutput(output);

      expect(issues.length).toBe(1);
      expect(issues[0].severity).toBe('CRITICAL');
      expect(issues[0].message).toContain('SQL injection');
    });

    it('should parse multiple severity levels', () => {
      const output = `
        CRITICAL: Major security issue
        HIGH: Performance problem
        MEDIUM: Code style issue
        LOW: Minor suggestion
      `;
      const issues = layer.parseCodeRabbitOutput(output);

      expect(issues.length).toBe(4);
      expect(issues.filter(i => i.severity === 'CRITICAL').length).toBe(1);
      expect(issues.filter(i => i.severity === 'HIGH').length).toBe(1);
      expect(issues.filter(i => i.severity === 'MEDIUM').length).toBe(1);
      expect(issues.filter(i => i.severity === 'LOW').length).toBe(1);
    });

    it('should return empty array for clean output', () => {
      const output = 'No issues found. Code looks good!';
      const issues = layer.parseCodeRabbitOutput(output);

      expect(issues.length).toBe(0);
    });
  });

  describe('runCodeRabbit', () => {
    it('should pass when no CRITICAL issues', async () => {
      layer.runCommand = jest.fn().mockResolvedValue({
        exitCode: 0,
        stdout: 'HIGH: Minor issue\nMEDIUM: Suggestion',
        stderr: '',
        duration: 5000,
      });

      const result = await layer.runCodeRabbit();

      expect(result.pass).toBe(true);
      expect(result.issues.critical).toBe(0);
      expect(result.issues.high).toBe(1);
    });

    it('should fail on CRITICAL issues', async () => {
      layer.runCommand = jest.fn().mockResolvedValue({
        exitCode: 0,
        stdout: 'CRITICAL: Security vulnerability',
        stderr: '',
        duration: 5000,
      });

      const result = await layer.runCodeRabbit();

      expect(result.pass).toBe(false);
      expect(result.issues.critical).toBe(1);
    });

    it('should handle graceful degradation when not installed', async () => {
      layer.runCommand = jest.fn().mockRejectedValue(
        new Error('command not found'),
      );

      const result = await layer.runCodeRabbit();

      expect(result.pass).toBe(true);
      expect(result.skipped).toBe(true);
      expect(result.message).toContain('not installed');
    });
  });

  describe('runQuinnReview', () => {
    it('should return suggestions', async () => {
      const result = await layer.runQuinnReview();

      expect(result.check).toBe('quinn');
      expect(result).toHaveProperty('suggestions');
    });
  });

  describe('getSummary', () => {
    it('should return correct summary', async () => {
      layer.runCommand = jest.fn().mockResolvedValue({
        exitCode: 0,
        stdout: '',
        stderr: '',
        duration: 100,
      });

      await layer.execute();
      const summary = layer.getSummary();

      expect(summary.layer).toBe('Layer 2: PR Automation');
      expect(summary).toHaveProperty('pass');
      expect(summary).toHaveProperty('duration');
    });
  });
});
