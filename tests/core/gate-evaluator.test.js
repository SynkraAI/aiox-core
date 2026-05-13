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

  // ── Deep coverage: _loadConfig ───────────────────────────────────

  describe('_loadConfig', () => {
    it('should return custom gateConfig when provided', async () => {
      const custom = { epic3_to_epic4: { blocking: false } };
      const e = new GateEvaluator({ projectRoot: tempDir, gateConfig: custom });

      const config = await e._loadConfig();

      expect(config).toEqual(custom);
    });

    it('should return DEFAULT_GATE_CONFIG when no config file exists', async () => {
      const config = await evaluator._loadConfig();

      expect(config).toEqual(DEFAULT_GATE_CONFIG);
    });

    it('should load and merge config from core-config.yaml', async () => {
      const configDir = path.join(tempDir, '.aiox-core');
      await fs.ensureDir(configDir);
      const yamlContent = `
autoClaude:
  orchestrator:
    gates:
      epic3_to_epic4:
        blocking: false
        minScore: 2.0
`;
      await fs.writeFile(path.join(configDir, 'core-config.yaml'), yamlContent);

      const config = await evaluator._loadConfig();

      expect(config.epic3_to_epic4.blocking).toBe(false);
      expect(config.epic3_to_epic4.minScore).toBe(2.0);
      expect(config.epic4_to_epic6).toBeDefined();
    });

    it('should fall back to defaults on YAML parse error', async () => {
      const configDir = path.join(tempDir, '.aiox-core');
      await fs.ensureDir(configDir);
      await fs.writeFile(path.join(configDir, 'core-config.yaml'), '{{invalid: yaml::');

      const config = await evaluator._loadConfig();

      expect(config).toEqual(DEFAULT_GATE_CONFIG);
    });

    it('should fall back to defaults when config has no gates section', async () => {
      const configDir = path.join(tempDir, '.aiox-core');
      await fs.ensureDir(configDir);
      await fs.writeFile(path.join(configDir, 'core-config.yaml'), 'autoClaude:\n  other: true\n');

      const config = await evaluator._loadConfig();

      expect(config).toEqual(DEFAULT_GATE_CONFIG);
    });
  });

  // ── Deep coverage: _getGateKey ───────────────────────────────────

  describe('_getGateKey', () => {
    it('should format gate key from epic numbers', () => {
      expect(evaluator._getGateKey(3, 4)).toBe('epic3_to_epic4');
      expect(evaluator._getGateKey(4, 6)).toBe('epic4_to_epic6');
      expect(evaluator._getGateKey(6, 7)).toBe('epic6_to_epic7');
    });
  });

  // ── Deep coverage: _getDefaultChecks ─────────────────────────────

  describe('_getDefaultChecks', () => {
    it('should return spec checks for epic 3', () => {
      const checks = evaluator._getDefaultChecks(3, 4);

      expect(checks).toEqual(['spec_exists', 'complexity_assessed']);
    });

    it('should return plan checks for epic 4', () => {
      const checks = evaluator._getDefaultChecks(4, 6);

      expect(checks).toEqual(['plan_complete', 'no_critical_errors']);
    });

    it('should return QA checks for epic 6', () => {
      const checks = evaluator._getDefaultChecks(6, 7);

      expect(checks).toEqual(['qa_report_exists', 'verdict_generated']);
    });

    it('should return empty array for unknown epic', () => {
      const checks = evaluator._getDefaultChecks(99, 100);

      expect(checks).toEqual([]);
    });
  });

  // ── Deep coverage: _determineVerdict edge cases ──────────────────

  describe('_determineVerdict edge cases', () => {
    it('should return BLOCKED for high severity issues when gate is blocking', () => {
      const result = {
        issues: [{ severity: 'high', check: 'plan_complete', message: 'fail' }],
        score: 2.5,
      };

      const verdict = evaluator._determineVerdict(result, { blocking: true });

      expect(verdict).toBe(GateVerdict.BLOCKED);
    });

    it('should return NEEDS_REVISION for high severity issues when gate is non-blocking', () => {
      const result = {
        issues: [{ severity: 'high', check: 'plan_complete', message: 'fail' }],
        score: 2.5,
      };

      const verdict = evaluator._determineVerdict(result, { blocking: false });

      expect(verdict).toBe(GateVerdict.NEEDS_REVISION);
    });

    it('should return APPROVED with allowMinorIssues and only low/medium issues', () => {
      const result = {
        issues: [
          { severity: 'low', check: 'unknown_check', message: 'info' },
          { severity: 'medium', check: 'complexity_assessed', message: 'not assessed' },
        ],
        score: 3.0,
      };

      const verdict = evaluator._determineVerdict(result, { allowMinorIssues: true });

      expect(verdict).toBe(GateVerdict.APPROVED);
    });

    it('should return NEEDS_REVISION for medium issues without allowMinorIssues', () => {
      const result = {
        issues: [{ severity: 'medium', check: 'complexity_assessed', message: 'not assessed' }],
        score: 3.0,
      };

      const verdict = evaluator._determineVerdict(result, {});

      expect(verdict).toBe(GateVerdict.NEEDS_REVISION);
    });

    it('should return BLOCKED when score below minScore and gate is blocking', () => {
      const result = { issues: [], score: 1.5 };

      const verdict = evaluator._determineVerdict(result, { blocking: true, minScore: 3.0 });

      expect(verdict).toBe(GateVerdict.BLOCKED);
    });

    it('should return NEEDS_REVISION when score below minScore and gate is non-blocking', () => {
      const result = { issues: [], score: 1.5 };

      const verdict = evaluator._determineVerdict(result, { blocking: false, minScore: 3.0 });

      expect(verdict).toBe(GateVerdict.NEEDS_REVISION);
    });
  });

  // ── Deep coverage: config-based checks ───────────────────────────

  describe('config-based checks', () => {
    it('should add min_score check when both config and result have score', async () => {
      const e = new GateEvaluator({
        projectRoot: tempDir,
        gateConfig: {
          epic3_to_epic4: { blocking: true, minScore: 4.0, checks: ['spec_exists'] },
        },
      });

      const result = await e.evaluate(3, 4, { specPath: '/spec.md', score: 3.5 });
      const minScoreCheck = result.checks.find((c) => c.name === 'min_score');

      expect(minScoreCheck).toBeDefined();
      expect(minScoreCheck.passed).toBe(false);
      expect(minScoreCheck.message).toContain('3.5');
      expect(minScoreCheck.message).toContain('4');
    });

    it('should not add min_score check when epicResult has no score', async () => {
      const e = new GateEvaluator({
        projectRoot: tempDir,
        gateConfig: {
          epic3_to_epic4: { blocking: true, minScore: 4.0, checks: ['spec_exists'] },
        },
      });

      const result = await e.evaluate(3, 4, { specPath: '/spec.md' });
      const minScoreCheck = result.checks.find((c) => c.name === 'min_score');

      expect(minScoreCheck).toBeUndefined();
    });

    it('should add require_tests check when tests are present', async () => {
      const e = new GateEvaluator({
        projectRoot: tempDir,
        gateConfig: {
          epic4_to_epic6: { blocking: true, requireTests: true, checks: [] },
        },
      });

      const result = await e.evaluate(4, 6, { testResults: [{ passed: true }] });
      const testsCheck = result.checks.find((c) => c.name === 'require_tests');

      expect(testsCheck).toBeDefined();
      expect(testsCheck.passed).toBe(true);
    });

    it('should fail require_tests when testResults is empty array', async () => {
      const e = new GateEvaluator({
        projectRoot: tempDir,
        gateConfig: {
          epic4_to_epic6: { blocking: true, requireTests: true, checks: [] },
        },
      });

      const result = await e.evaluate(4, 6, { testResults: [] });
      const testsCheck = result.checks.find((c) => c.name === 'require_tests');

      expect(testsCheck).toBeDefined();
      expect(testsCheck.passed).toBe(false);
    });

    it('should skip require_tests when testResults is marked as skipped', async () => {
      const e = new GateEvaluator({
        projectRoot: tempDir,
        gateConfig: {
          epic4_to_epic6: { blocking: true, requireTests: true, checks: [] },
        },
      });

      const result = await e.evaluate(4, 6, { testResults: { skipped: true } });
      const testsCheck = result.checks.find((c) => c.name === 'require_tests');

      expect(testsCheck).toBeUndefined();
    });

    it('should add min_coverage check when configured above 0', async () => {
      const e = new GateEvaluator({
        projectRoot: tempDir,
        gateConfig: {
          epic4_to_epic6: { blocking: true, minTestCoverage: 80, checks: [] },
        },
      });

      const result = await e.evaluate(4, 6, { testCoverage: 75 });
      const covCheck = result.checks.find((c) => c.name === 'min_coverage');

      expect(covCheck).toBeDefined();
      expect(covCheck.passed).toBe(false);
      expect(covCheck.message).toContain('75%');
    });

    it('should pass min_coverage when coverage meets threshold', async () => {
      const e = new GateEvaluator({
        projectRoot: tempDir,
        gateConfig: {
          epic4_to_epic6: { blocking: true, minTestCoverage: 80, checks: [] },
        },
      });

      const result = await e.evaluate(4, 6, { testCoverage: 85 });
      const covCheck = result.checks.find((c) => c.name === 'min_coverage');

      expect(covCheck).toBeDefined();
      expect(covCheck.passed).toBe(true);
    });
  });

  // ── Deep coverage: check-specific edge cases ─────────────────────

  describe('check-specific edge cases', () => {
    it('should pass spec_exists via artifacts array', async () => {
      const e = new GateEvaluator({
        projectRoot: tempDir,
        gateConfig: { epic3_to_epic4: { blocking: true, checks: ['spec_exists'] } },
      });

      const result = await e.evaluate(3, 4, {
        artifacts: [{ type: 'spec', path: '/spec.md' }],
      });
      const check = result.checks.find((c) => c.name === 'spec_exists');

      expect(check.passed).toBe(true);
    });

    it('should pass plan_complete via planComplete boolean', async () => {
      const e = new GateEvaluator({
        projectRoot: tempDir,
        gateConfig: { epic4_to_epic6: { blocking: true, checks: ['plan_complete'] } },
      });

      const result = await e.evaluate(4, 6, { planComplete: true });
      const check = result.checks.find((c) => c.name === 'plan_complete');

      expect(check.passed).toBe(true);
    });

    it('should pass implementation_exists via codeChanges array', async () => {
      const e = new GateEvaluator({
        projectRoot: tempDir,
        gateConfig: { epic4_to_epic6: { blocking: true, checks: ['implementation_exists'] } },
      });

      const result = await e.evaluate(4, 6, {
        codeChanges: [{ file: 'src/main.js', type: 'add' }],
      });
      const check = result.checks.find((c) => c.name === 'implementation_exists');

      expect(check.passed).toBe(true);
    });

    it('should detect critical errors in no_critical_errors check', async () => {
      const e = new GateEvaluator({
        projectRoot: tempDir,
        gateConfig: { epic4_to_epic6: { blocking: true, checks: ['no_critical_errors'] } },
      });

      const result = await e.evaluate(4, 6, {
        errors: [
          { severity: 'warning', message: 'minor' },
          { severity: 'critical', message: 'fatal' },
        ],
      });
      const check = result.checks.find((c) => c.name === 'no_critical_errors');

      expect(check.passed).toBe(false);
      expect(check.message).toContain('1 critical');
    });

    it('should pass no_critical_errors when only non-critical errors exist', async () => {
      const e = new GateEvaluator({
        projectRoot: tempDir,
        gateConfig: { epic4_to_epic6: { blocking: true, checks: ['no_critical_errors'] } },
      });

      const result = await e.evaluate(4, 6, {
        errors: [{ severity: 'warning', message: 'minor' }],
      });
      const check = result.checks.find((c) => c.name === 'no_critical_errors');

      expect(check.passed).toBe(true);
    });

    it('should fail tests_pass when some tests fail', async () => {
      const e = new GateEvaluator({
        projectRoot: tempDir,
        gateConfig: { epic6_to_epic7: { blocking: false, checks: ['tests_pass'] } },
      });

      const result = await e.evaluate(6, 7, {
        testResults: [{ passed: true }, { passed: false }],
      });
      const check = result.checks.find((c) => c.name === 'tests_pass');

      expect(check.passed).toBe(false);
      expect(check.message).toContain('failed');
    });

    it('should fail tests_pass when testResults is empty', async () => {
      const e = new GateEvaluator({
        projectRoot: tempDir,
        gateConfig: { epic6_to_epic7: { blocking: false, checks: ['tests_pass'] } },
      });

      const result = await e.evaluate(6, 7, { testResults: [] });
      const check = result.checks.find((c) => c.name === 'tests_pass');

      expect(check.passed).toBe(false);
      expect(check.message).toContain('No test results');
    });

    it('should pass verdict_generated when verdict exists', async () => {
      const e = new GateEvaluator({
        projectRoot: tempDir,
        gateConfig: { epic6_to_epic7: { blocking: false, checks: ['verdict_generated'] } },
      });

      const result = await e.evaluate(6, 7, { verdict: 'approved' });
      const check = result.checks.find((c) => c.name === 'verdict_generated');

      expect(check.passed).toBe(true);
      expect(check.message).toContain('approved');
    });

    it('should pass unknown checks by default', async () => {
      const e = new GateEvaluator({
        projectRoot: tempDir,
        gateConfig: { epic3_to_epic4: { blocking: true, checks: ['custom_check'] } },
      });

      const result = await e.evaluate(3, 4, {});
      const check = result.checks.find((c) => c.name === 'custom_check');

      expect(check.passed).toBe(true);
      expect(check.message).toContain('Unknown check');
    });
  });

  // ── Deep coverage: error handling ────────────────────────────────

  describe('error handling in evaluate', () => {
    it('should return BLOCKED when _runGateChecks throws', async () => {
      const original = evaluator._runGateChecks;
      evaluator._runGateChecks = () => { throw new Error('check explosion'); };

      const result = await evaluator.evaluate(3, 4, {});

      expect(result.verdict).toBe(GateVerdict.BLOCKED);
      expect(result.issues).toHaveLength(1);
      expect(result.issues[0].severity).toBe('critical');
      expect(result.issues[0].message).toContain('check explosion');

      evaluator._runGateChecks = original;
    });
  });

  // ── Deep coverage: logging ───────────────────────────────────────

  describe('logging', () => {
    it('should record logs during evaluation', async () => {
      await evaluator.evaluate(3, 4, { specPath: '/spec.md', complexity: 'STANDARD' });

      const logs = evaluator.getLogs();

      expect(logs.length).toBeGreaterThanOrEqual(2);
      expect(logs[0]).toHaveProperty('timestamp');
      expect(logs[0]).toHaveProperty('level');
      expect(logs[0]).toHaveProperty('message');
    });

    it('should record warn-level log on config load failure', async () => {
      evaluator._log('test warning', 'warn');

      const logs = evaluator.getLogs();
      const warnLog = logs.find((l) => l.level === 'warn');

      expect(warnLog).toBeDefined();
      expect(warnLog.message).toBe('test warning');
    });
  });

  // ── Deep coverage: score calculation ─────────────────────────────

  describe('score calculation', () => {
    it('should return score 5 when all checks pass', async () => {
      const e = new GateEvaluator({
        projectRoot: tempDir,
        gateConfig: {
          epic3_to_epic4: { blocking: true, checks: ['spec_exists', 'complexity_assessed'] },
        },
      });

      const result = await e.evaluate(3, 4, { specPath: '/spec.md', complexity: 'STANDARD' });

      expect(result.score).toBe(5);
    });

    it('should return score 0 when no checks pass', async () => {
      const e = new GateEvaluator({
        projectRoot: tempDir,
        gateConfig: {
          epic3_to_epic4: { blocking: true, checks: ['spec_exists', 'complexity_assessed'] },
        },
      });

      const result = await e.evaluate(3, 4, {});

      expect(result.score).toBe(0);
    });

    it('should return score 5 when no checks exist (empty gate)', async () => {
      const e = new GateEvaluator({
        projectRoot: tempDir,
        gateConfig: { epic99_to_epic100: { blocking: false, checks: [] } },
      });

      const result = await e.evaluate(99, 100, {});

      expect(result.score).toBe(5);
    });

    it('should return proportional score for partial pass', async () => {
      const e = new GateEvaluator({
        projectRoot: tempDir,
        gateConfig: {
          epic3_to_epic4: {
            blocking: false,
            checks: ['spec_exists', 'complexity_assessed', 'requirements_defined'],
          },
        },
      });

      const result = await e.evaluate(3, 4, {
        specPath: '/spec.md',
        // missing complexity and requirements
      });

      expect(result.score).toBeCloseTo(5 / 3, 1);
    });
  });

  // ── Deep coverage: summary edge cases ────────────────────────────

  describe('summary edge cases', () => {
    it('should compute averageScore across multiple evaluations', async () => {
      const e = new GateEvaluator({
        projectRoot: tempDir,
        gateConfig: {
          epic3_to_epic4: { blocking: false, checks: ['spec_exists'] },
          epic4_to_epic6: { blocking: false, checks: ['plan_complete'] },
        },
      });

      await e.evaluate(3, 4, { specPath: '/spec.md' });
      await e.evaluate(4, 6, {});

      const summary = e.getSummary();

      expect(summary.total).toBe(2);
      expect(summary.averageScore).toBeCloseTo(2.5, 1);
      expect(summary.allPassed).toBe(false);
    });

    it('should return allPassed true when all gates approved', async () => {
      const e = new GateEvaluator({
        projectRoot: tempDir,
        gateConfig: {
          epic3_to_epic4: { blocking: false, checks: ['spec_exists'] },
        },
      });

      await e.evaluate(3, 4, { specPath: '/spec.md' });

      const summary = e.getSummary();

      expect(summary.allPassed).toBe(true);
      expect(summary.approved).toBe(1);
    });

    it('should return zero averageScore for empty results', () => {
      const summary = evaluator.getSummary();

      expect(summary.total).toBe(0);
      expect(summary.averageScore).toBe(0);
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
