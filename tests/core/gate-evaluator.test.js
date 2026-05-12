/**
 * Gate Evaluator Tests
 *
 * Story: 0.6 - Quality Gates
 * Epic: Epic 0 - ADE Master Orchestrator
 *
 * Tests for gate evaluator that ensures quality between epics.
 *
 * @author @dev (Dex)
 * @version 1.0.0
 */

const path = require('path');
const fs = require('fs-extra');
const os = require('os');

const {
  GateEvaluator,
  GateVerdict,
  DEFAULT_GATE_CONFIG,
} = require('../../.aiox-core/core/orchestration/gate-evaluator');

describe('Gate Evaluator (Story 0.6)', () => {
  let tempDir;
  let evaluator;

  beforeEach(async () => {
    tempDir = path.join(os.tmpdir(), `gate-evaluator-test-${Date.now()}`);
    await fs.ensureDir(tempDir);

    evaluator = new GateEvaluator({
      projectRoot: tempDir,
      strictMode: false,
    });
  });

  afterEach(async () => {
    await fs.remove(tempDir);
  });

  describe('GateVerdict Enum (AC2)', () => {
    it('should have all required verdicts', () => {
      expect(GateVerdict.APPROVED).toBe('approved');
      expect(GateVerdict.NEEDS_REVISION).toBe('needs_revision');
      expect(GateVerdict.BLOCKED).toBe('blocked');
    });
  });

  describe('DEFAULT_GATE_CONFIG (AC5)', () => {
    it('should have config for epic3_to_epic4', () => {
      expect(DEFAULT_GATE_CONFIG.epic3_to_epic4).toBeDefined();
      expect(DEFAULT_GATE_CONFIG.epic3_to_epic4.blocking).toBe(true);
    });

    it('should have config for epic4_to_epic6', () => {
      expect(DEFAULT_GATE_CONFIG.epic4_to_epic6).toBeDefined();
      expect(DEFAULT_GATE_CONFIG.epic4_to_epic6.requireTests).toBe(true);
    });

    // Note: epic6_to_epic7 config removed with Epic 7 revert (commits 51df718, 75cbca1)
  });

  describe('Constructor', () => {
    it('should initialize with default options', () => {
      const e = new GateEvaluator({ projectRoot: tempDir });

      expect(e.projectRoot).toBe(tempDir);
      expect(e.strictMode).toBe(false);
    });

    it('should accept strict mode (AC7)', () => {
      const e = new GateEvaluator({
        projectRoot: tempDir,
        strictMode: true,
      });

      expect(e.strictMode).toBe(true);
    });

    it('should accept custom gate config (AC5)', () => {
      const customConfig = {
        epic3_to_epic4: { blocking: false },
      };

      const e = new GateEvaluator({
        projectRoot: tempDir,
        gateConfig: customConfig,
      });

      expect(e.gateConfig).toEqual(customConfig);
    });
  });

  describe('evaluate (AC1)', () => {
    it('should evaluate gate and return result', async () => {
      const epicResult = {
        specPath: '/path/to/spec.md',
        complexity: 'STANDARD',
        requirements: ['REQ-1', 'REQ-2'],
      };

      const result = await evaluator.evaluate(3, 4, epicResult);

      expect(result).toBeDefined();
      expect(result.gate).toBe('epic3_to_epic4');
      expect(result.fromEpic).toBe(3);
      expect(result.toEpic).toBe(4);
      expect(result.verdict).toBeDefined();
      expect(result.checks).toBeDefined();
    });

    it('should run checks for each gate', async () => {
      const epicResult = {
        specPath: '/path/to/spec.md',
        complexity: 'STANDARD',
      };

      const result = await evaluator.evaluate(3, 4, epicResult);

      expect(result.checks.length).toBeGreaterThan(0);
      expect(result.checks.some((c) => c.name === 'spec_exists')).toBe(true);
    });

    it('should calculate score based on checks', async () => {
      const epicResult = {
        specPath: '/path/to/spec.md',
        complexity: 'STANDARD',
        requirements: ['REQ-1'],
      };

      const result = await evaluator.evaluate(3, 4, epicResult);

      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(5);
    });
  });

  describe('Gate Verdicts (AC2)', () => {
    it('should return APPROVED for passing checks', async () => {
      const epicResult = {
        specPath: '/path/to/spec.md',
        complexity: 'STANDARD',
        requirements: ['REQ-1'],
        score: 4.5,
      };

      const result = await evaluator.evaluate(3, 4, epicResult);

      expect(result.verdict).toBe(GateVerdict.APPROVED);
    });

    it('should return NEEDS_REVISION for minor issues', async () => {
      // Epic 6 -> 7 allows minor issues but not major
      const epicResult = {
        qaReport: { passed: true },
        // Missing verdict - medium severity
      };

      // Use custom config to force needs_revision
      const e = new GateEvaluator({
        projectRoot: tempDir,
        gateConfig: {
          epic3_to_epic4: {
            blocking: false,
            checks: ['spec_exists'],
          },
        },
      });

      const result = await e.evaluate(3, 4, {
        /* missing spec */
      });

      // Without spec, should fail
      expect([GateVerdict.NEEDS_REVISION, GateVerdict.BLOCKED]).toContain(result.verdict);
    });

    it('should return BLOCKED for critical issues (AC3)', async () => {
      const e = new GateEvaluator({
        projectRoot: tempDir,
        gateConfig: {
          epic3_to_epic4: {
            blocking: true,
            checks: ['spec_exists'],
          },
        },
      });

      // Epic result without spec (critical check)
      const result = await e.evaluate(3, 4, {});

      expect(result.verdict).toBe(GateVerdict.BLOCKED);
    });
  });

  describe('BLOCKED halts pipeline (AC3)', () => {
    it('shouldBlock returns true for BLOCKED verdict', () => {
      expect(evaluator.shouldBlock(GateVerdict.BLOCKED)).toBe(true);
      expect(evaluator.shouldBlock(GateVerdict.APPROVED)).toBe(false);
      expect(evaluator.shouldBlock(GateVerdict.NEEDS_REVISION)).toBe(false);
    });
  });

  describe('NEEDS_REVISION returns to previous epic (AC4)', () => {
    it('needsRevision returns true for NEEDS_REVISION verdict', () => {
      expect(evaluator.needsRevision(GateVerdict.NEEDS_REVISION)).toBe(true);
      expect(evaluator.needsRevision(GateVerdict.APPROVED)).toBe(false);
      expect(evaluator.needsRevision(GateVerdict.BLOCKED)).toBe(false);
    });
  });

  describe('Gate Results Storage (AC6)', () => {
    it('should store all gate results', async () => {
      await evaluator.evaluate(3, 4, { specPath: '/spec.md', complexity: 'STANDARD' });
      await evaluator.evaluate(4, 6, { planPath: '/plan.yaml', testResults: [{ passed: true }] });

      const results = evaluator.getResults();

      expect(results).toHaveLength(2);
      expect(results[0].gate).toBe('epic3_to_epic4');
      expect(results[1].gate).toBe('epic4_to_epic6');
    });

    it('should get specific gate result', async () => {
      await evaluator.evaluate(3, 4, { specPath: '/spec.md', complexity: 'STANDARD' });

      const result = evaluator.getResult('epic3_to_epic4');

      expect(result).toBeDefined();
      expect(result.gate).toBe('epic3_to_epic4');
    });

    it('should return null for unknown gate', () => {
      const result = evaluator.getResult('unknown_gate');

      expect(result).toBeNull();
    });
  });

  describe('Strict Mode (AC7)', () => {
    it('should block on any failure in strict mode', async () => {
      const strictEvaluator = new GateEvaluator({
        projectRoot: tempDir,
        strictMode: true,
        gateConfig: {
          epic3_to_epic4: {
            blocking: false, // Would normally not block
            checks: ['spec_exists', 'complexity_assessed'],
          },
        },
      });

      // Missing spec - would normally be needs_revision with blocking: false
      const result = await strictEvaluator.evaluate(3, 4, { complexity: 'STANDARD' });

      // In strict mode, any issue = blocked
      expect(result.verdict).toBe(GateVerdict.BLOCKED);
    });

    it('should not affect approval in strict mode', async () => {
      const strictEvaluator = new GateEvaluator({
        projectRoot: tempDir,
        strictMode: true,
      });

      const result = await strictEvaluator.evaluate(3, 4, {
        specPath: '/spec.md',
        complexity: 'STANDARD',
        requirements: ['REQ-1'],
        score: 5.0,
      });

      expect(result.verdict).toBe(GateVerdict.APPROVED);
    });
  });

  describe('Summary', () => {
    it('should generate summary of all evaluations', async () => {
      await evaluator.evaluate(3, 4, { specPath: '/spec.md', complexity: 'STANDARD' });
      await evaluator.evaluate(4, 6, { planPath: '/plan.yaml' });

      const summary = evaluator.getSummary();

      expect(summary.total).toBe(2);
      expect(summary.approved).toBeGreaterThanOrEqual(0);
      expect(summary.averageScore).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Individual Checks', () => {
    it('should check spec_exists', async () => {
      const result = await evaluator.evaluate(3, 4, { specPath: '/spec.md' });
      const check = result.checks.find((c) => c.name === 'spec_exists');

      expect(check).toBeDefined();
      expect(check.passed).toBe(true);
    });

    it('should fail spec_exists when missing', async () => {
      const e = new GateEvaluator({
        projectRoot: tempDir,
        gateConfig: {
          epic3_to_epic4: { blocking: true, checks: ['spec_exists'] },
        },
      });

      const result = await e.evaluate(3, 4, {});
      const check = result.checks.find((c) => c.name === 'spec_exists');

      expect(check.passed).toBe(false);
    });

    it('should check complexity_assessed', async () => {
      const result = await evaluator.evaluate(3, 4, { complexity: 'STANDARD' });
      const check = result.checks.find((c) => c.name === 'complexity_assessed');

      expect(check).toBeDefined();
      expect(check.passed).toBe(true);
    });

    it('should check plan_complete', async () => {
      const e = new GateEvaluator({
        projectRoot: tempDir,
        gateConfig: {
          epic4_to_epic6: { blocking: true, checks: ['plan_complete'] },
        },
      });

      const result = await e.evaluate(4, 6, { planPath: '/plan.yaml' });
      const check = result.checks.find((c) => c.name === 'plan_complete');

      expect(check).toBeDefined();
      expect(check.passed).toBe(true);
    });

    it('should check qa_report_exists', async () => {
      const e = new GateEvaluator({
        projectRoot: tempDir,
        gateConfig: {
          epic6_to_epic7: { blocking: false, checks: ['qa_report_exists'] },
        },
      });

      const result = await e.evaluate(6, 7, { reportPath: '/qa-report.md' });
      const check = result.checks.find((c) => c.name === 'qa_report_exists');

      expect(check).toBeDefined();
      expect(check.passed).toBe(true);
    });
  });

  describe('Clear', () => {
    it('should clear all results', async () => {
      await evaluator.evaluate(3, 4, { specPath: '/spec.md' });
      expect(evaluator.getResults().length).toBeGreaterThan(0);

      evaluator.clear();

      expect(evaluator.getResults()).toHaveLength(0);
      expect(evaluator.getLogs()).toHaveLength(0);
    });
  });
});

describe('Integration with MasterOrchestrator', () => {
  let tempDir;

  beforeEach(async () => {
    tempDir = path.join(os.tmpdir(), `gate-integration-test-${Date.now()}`);
    await fs.ensureDir(tempDir);
  });

  afterEach(async () => {
    await fs.remove(tempDir);
  });

  it('should integrate GateEvaluator with MasterOrchestrator', async () => {
    const { MasterOrchestrator } = require('../../.aiox-core/core/orchestration');

    const orchestrator = new MasterOrchestrator(tempDir, {
      storyId: 'TEST-001',
      strictGates: false,
    });

    expect(orchestrator.gateEvaluator).toBeDefined();
    expect(orchestrator.gateEvaluator).toBeInstanceOf(GateEvaluator);
  });

  it('should expose getGateEvaluator method', async () => {
    const { MasterOrchestrator } = require('../../.aiox-core/core/orchestration');

    const orchestrator = new MasterOrchestrator(tempDir, {
      storyId: 'TEST-001',
    });

    const evaluator = orchestrator.getGateEvaluator();
    expect(evaluator).toBeDefined();
    expect(evaluator).toBeInstanceOf(GateEvaluator);
  });

  it('should respect strictGates option', async () => {
    const { MasterOrchestrator } = require('../../.aiox-core/core/orchestration');

    const orchestrator = new MasterOrchestrator(tempDir, {
      storyId: 'TEST-001',
      strictGates: true,
    });

    expect(orchestrator.gateEvaluator.strictMode).toBe(true);
  });
});
