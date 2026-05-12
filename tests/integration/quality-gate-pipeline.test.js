/**
 * Quality Gate Pipeline Integration Tests
 *
 * Tests the full orchestration of the 3-layer quality gate pipeline.
 *
 * @story 2.10 - Quality Gate Manager
 */

const { QualityGateManager } = require('../../.aiox-core/core/quality-gates/quality-gate-manager');
const { Layer1PreCommit } = require('../../.aiox-core/core/quality-gates/layer1-precommit');
const { Layer2PRAutomation } = require('../../.aiox-core/core/quality-gates/layer2-pr-automation');
const { Layer3HumanReview } = require('../../.aiox-core/core/quality-gates/layer3-human-review');
const { ChecklistGenerator } = require('../../.aiox-core/core/quality-gates/checklist-generator');

describe('Quality Gate Pipeline Integration', () => {
  describe('Full Pipeline Orchestration', () => {
    let manager;

    beforeEach(() => {
      manager = new QualityGateManager({
        layer1: {
          enabled: true,
          failFast: true,
          checks: {
            lint: { enabled: true },
            test: { enabled: true },
            typecheck: { enabled: true },
          },
        },
        layer2: {
          enabled: true,
          coderabbit: { enabled: true },
          quinn: { enabled: true },
        },
        layer3: {
          enabled: true,
          requireSignoff: false,
        },
      });
    });

    it('should have all three layers', () => {
      expect(manager.layers.layer1).toBeInstanceOf(Layer1PreCommit);
      expect(manager.layers.layer2).toBeInstanceOf(Layer2PRAutomation);
      expect(manager.layers.layer3).toBeInstanceOf(Layer3HumanReview);
    });

    it('should run layers in sequence during orchestration', async () => {
      // Mock all layer commands
      manager.layers.layer1.runCommand = jest.fn().mockResolvedValue({
        exitCode: 0,
        stdout: '0 errors',
        stderr: '',
        duration: 100,
      });

      manager.layers.layer2.runCommand = jest.fn().mockResolvedValue({
        exitCode: 0,
        stdout: '',
        stderr: '',
        duration: 100,
      });

      const result = await manager.orchestrate({ verbose: false });

      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('duration');
      expect(result).toHaveProperty('layers');
      expect(result.layers.length).toBeGreaterThanOrEqual(2);
    });

    it('should stop on Layer 1 failure (fail-fast)', async () => {
      // Make Layer 1 fail
      manager.layers.layer1.runCommand = jest.fn().mockResolvedValue({
        exitCode: 1,
        stdout: '5 errors',
        stderr: '',
        duration: 100,
      });

      const result = await manager.orchestrate({ verbose: false });

      expect(result.pass).toBe(false);
      expect(result.stoppedAt).toBe('layer1');
      expect(result.reason).toBe('fail-fast');
      expect(result.exitCode).toBe(1);
    });

    it('should escalate on Layer 2 issues', async () => {
      // Make Layer 1 pass
      manager.layers.layer1.runCommand = jest.fn().mockResolvedValue({
        exitCode: 0,
        stdout: '0 errors',
        stderr: '',
        duration: 100,
      });

      // Make Layer 2 fail with CRITICAL issue
      manager.layers.layer2.runCommand = jest.fn().mockResolvedValue({
        exitCode: 0,
        stdout: 'CRITICAL: Major security issue',
        stderr: '',
        duration: 100,
      });

      const result = await manager.orchestrate({ verbose: false });

      expect(result.pass).toBe(false);
      expect(result.stoppedAt).toBe('layer2');
      expect(result.reason).toBe('escalation');
    });
  });

  describe('Checklist Generator Integration', () => {
    let generator;

    beforeEach(() => {
      generator = new ChecklistGenerator({
        minItems: 5,
      });
    });

    it('should generate checklist with context', async () => {
      const checklist = await generator.generate({
        storyId: 'story-2.10',
        changedFiles: [
          'tests/unit/layer1.test.js',
          '.aiox-core/core/quality-gates/manager.js',
          'docs/architecture/quality-gates.md',
        ],
        layers: [],
      });

      expect(checklist.items.length).toBeGreaterThanOrEqual(5);
      expect(checklist.storyId).toBe('story-2.10');
    });

    it('should add items for test file changes', async () => {
      const checklist = await generator.generate({
        changedFiles: ['tests/unit/something.test.js'],
      });

      const testItem = checklist.items.find(i => i.id === 'test-coverage');
      expect(testItem).toBeDefined();
    });

    it('should add items for config file changes', async () => {
      const checklist = await generator.generate({
        changedFiles: ['config/app.yaml'],
      });

      const configItem = checklist.items.find(i => i.id === 'config-changes');
      expect(configItem).toBeDefined();
    });

    it('should format checklist for display', async () => {
      const checklist = await generator.generate({ storyId: 'test' });
      const formatted = generator.format(checklist);

      expect(formatted).toContain('Strategic Review Checklist');
      expect(formatted).toContain('Story: test');
    });
  });

  describe('Layer Result Aggregation', () => {
    it('should aggregate results from all layers', async () => {
      const manager = new QualityGateManager({
        layer1: { enabled: true },
        layer2: { enabled: true },
        layer3: { enabled: true, requireSignoff: false },
      });

      // Mock all commands to pass
      manager.layers.layer1.runCommand = jest.fn().mockResolvedValue({
        exitCode: 0,
        stdout: '0 errors, 5 warnings',
        stderr: '',
        duration: 1000,
      });

      manager.layers.layer2.runCommand = jest.fn().mockResolvedValue({
        exitCode: 0,
        stdout: 'HIGH: Minor suggestion',
        stderr: '',
        duration: 2000,
      });

      const result = await manager.orchestrate();

      // Check that all layers were executed
      expect(result.layers.length).toBe(3);

      // Check Layer 1 results
      const layer1 = result.layers[0];
      expect(layer1.layer).toBe('Layer 1: Pre-commit');
      expect(layer1.pass).toBe(true);

      // Check Layer 2 results
      const layer2 = result.layers[1];
      expect(layer2.layer).toBe('Layer 2: PR Automation');
      expect(layer2.pass).toBe(true);

      // Check Layer 3 results
      const layer3 = result.layers[2];
      expect(layer3.layer).toBe('Layer 3: Human Review');
    });
  });

  describe('Exit Code Consistency', () => {
    it('should return exit code 0 on success', async () => {
      const manager = new QualityGateManager({
        layer1: { enabled: true },
        layer2: { enabled: true },
        layer3: { enabled: true, requireSignoff: false },
      });

      manager.layers.layer1.runCommand = jest.fn().mockResolvedValue({
        exitCode: 0,
        stdout: '',
        stderr: '',
        duration: 100,
      });

      manager.layers.layer2.runCommand = jest.fn().mockResolvedValue({
        exitCode: 0,
        stdout: '',
        stderr: '',
        duration: 100,
      });

      const result = await manager.orchestrate();
      expect(result.exitCode).toBe(0);
    });

    it('should return exit code 1 on failure', async () => {
      const manager = new QualityGateManager({ layer1: { enabled: true } });

      manager.layers.layer1.runCommand = jest.fn().mockResolvedValue({
        exitCode: 1,
        stdout: 'error',
        stderr: '',
        duration: 100,
      });

      const result = await manager.orchestrate();
      expect(result.exitCode).toBe(1);
    });
  });

  describe('Disabled Layers', () => {
    it('should skip disabled layers', async () => {
      const manager = new QualityGateManager({
        layer1: { enabled: false },
        layer2: { enabled: false },
        layer3: { enabled: false },
      });

      const result = await manager.orchestrate();

      // All layers should be skipped
      result.layers.forEach(layer => {
        expect(layer.results[0].skipped).toBe(true);
      });
    });

    it('should allow partial layer execution', async () => {
      const manager = new QualityGateManager({
        layer1: { enabled: true },
        layer2: { enabled: false },
        layer3: { enabled: false },
      });

      manager.layers.layer1.runCommand = jest.fn().mockResolvedValue({
        exitCode: 0,
        stdout: '',
        stderr: '',
        duration: 100,
      });

      const result = await manager.orchestrate();

      expect(result.layers[0].pass).toBe(true);
      expect(result.layers[1].results[0].skipped).toBe(true);
    });
  });
});

describe('Smoke Tests', () => {
  // QGM-01: Layer 1 passes on clean code
  it('QGM-01: Layer 1 should pass when all checks succeed', async () => {
    const layer = new Layer1PreCommit({ enabled: true });
    layer.runCommand = jest.fn().mockResolvedValue({
      exitCode: 0,
      stdout: '0 errors',
      stderr: '',
      duration: 100,
    });

    const result = await layer.execute();
    expect(result.pass).toBe(true);
  });

  // QGM-02: Layer 1 fails on lint errors
  it('QGM-02: Layer 1 should fail when lint has errors', async () => {
    const layer = new Layer1PreCommit({
      enabled: true,
      checks: { lint: { enabled: true } },
    });
    layer.runCommand = jest.fn().mockResolvedValue({
      exitCode: 1,
      stdout: '5 errors',
      stderr: '',
      duration: 100,
    });

    const result = await layer.execute();
    expect(result.pass).toBe(false);
  });

  // QGM-03: Layer 2 passes with no CRITICAL issues
  it('QGM-03: Layer 2 should pass with no CRITICAL issues', async () => {
    const layer = new Layer2PRAutomation({
      enabled: true,
      coderabbit: { enabled: true, blockOn: ['CRITICAL'] },
    });
    layer.runCommand = jest.fn().mockResolvedValue({
      exitCode: 0,
      stdout: 'HIGH: Minor issue\nMEDIUM: Suggestion',
      stderr: '',
      duration: 100,
    });

    const result = await layer.execute();
    expect(result.pass).toBe(true);
  });

  // QGM-04: Full pipeline runs all layers
  it('QGM-04: Full pipeline should run all layers', async () => {
    const manager = new QualityGateManager({
      layer1: { enabled: true },
      layer2: { enabled: true },
      layer3: { enabled: true, requireSignoff: false },
    });

    manager.layers.layer1.runCommand = jest.fn().mockResolvedValue({
      exitCode: 0, stdout: '', stderr: '', duration: 100,
    });
    manager.layers.layer2.runCommand = jest.fn().mockResolvedValue({
      exitCode: 0, stdout: '', stderr: '', duration: 100,
    });

    const result = await manager.orchestrate();
    expect(result.layers.length).toBe(3);
  });

  // QGM-05: Fail-fast stops pipeline on Layer 1 failure
  it('QGM-05: Pipeline should stop on Layer 1 failure', async () => {
    const manager = new QualityGateManager({
      layer1: { enabled: true, failFast: true },
      layer2: { enabled: true },
    });

    manager.layers.layer1.runCommand = jest.fn().mockResolvedValue({
      exitCode: 1, stdout: 'error', stderr: '', duration: 100,
    });

    const result = await manager.orchestrate();
    expect(result.stoppedAt).toBe('layer1');
    expect(result.layers.length).toBe(1);
  });

  // QGM-06: Layer-specific execution
  it('QGM-06: Should run only specified layer', async () => {
    const manager = new QualityGateManager({
      layer1: { enabled: true },
      layer2: { enabled: true },
      layer3: { enabled: true },
    });

    manager.layers.layer1.runCommand = jest.fn().mockResolvedValue({
      exitCode: 0, stdout: '', stderr: '', duration: 100,
    });

    const result = await manager.runLayer(1);
    expect(result.layer).toBe('Layer 1: Pre-commit');
  });

  // QGM-10: Correct exit codes
  it('QGM-10: Should return correct exit codes', async () => {
    const manager = new QualityGateManager({
      layer1: { enabled: true },
      layer2: { enabled: true },
      layer3: { enabled: true, requireSignoff: false },
    });

    // Pass case
    manager.layers.layer1.runCommand = jest.fn().mockResolvedValue({
      exitCode: 0, stdout: '', stderr: '', duration: 100,
    });
    manager.layers.layer2.runCommand = jest.fn().mockResolvedValue({
      exitCode: 0, stdout: '', stderr: '', duration: 100,
    });

    let result = await manager.orchestrate();
    expect(result.exitCode).toBe(0);

    // Fail case
    manager.layers.layer1.runCommand = jest.fn().mockResolvedValue({
      exitCode: 1, stdout: 'error', stderr: '', duration: 100,
    });

    result = await manager.orchestrate();
    expect(result.exitCode).toBe(1);
  });
});
