/**
 * Unit Tests: Doctor Orchestrator
 * Story INS-4.1: aios doctor rewrite
 *
 * Tests for options forwarding, output format, and fix/dry-run behavior.
 */

const path = require('path');

// Use real modules for orchestrator testing (checks will hit real filesystem)
const { runDoctorChecks, DOCTOR_VERSION } = require('../../../../../.aios-core/core/doctor');

const projectRoot = path.resolve(__dirname, '..', '..', '..', '..', '..');

describe('Doctor Orchestrator', () => {
  describe('version', () => {
    it('should export DOCTOR_VERSION as 2.0.0', () => {
      expect(DOCTOR_VERSION).toBe('2.0.0');
    });
  });

  describe('options forwarding (AC1)', () => {
    it('should accept and use options object', async () => {
      const result = await runDoctorChecks({ projectRoot });
      expect(result).toHaveProperty('formatted');
      expect(result).toHaveProperty('data');
      expect(result.data).toHaveProperty('version', '2.0.0');
      expect(result.data).toHaveProperty('summary');
      expect(result.data).toHaveProperty('checks');
    });

    it('should produce JSON when json option is true', async () => {
      const result = await runDoctorChecks({ json: true, projectRoot });
      expect(result.formatted).toBeTruthy();

      // Should be valid JSON
      const parsed = JSON.parse(result.formatted);
      expect(parsed).toHaveProperty('version');
      expect(parsed).toHaveProperty('summary');
      expect(parsed).toHaveProperty('checks');
    });

    it('should produce text when json option is false', async () => {
      const result = await runDoctorChecks({ json: false, projectRoot });
      expect(result.formatted).toContain('AIOS Doctor');
      expect(result.formatted).toContain('Summary:');
    });
  });

  describe('15 checks (AC2 + INS-4.8)', () => {
    it('should run exactly 15 checks', async () => {
      const result = await runDoctorChecks({ projectRoot });
      expect(result.data.checks).toHaveLength(15);
    });

    it('should return valid status for each check', async () => {
      const result = await runDoctorChecks({ projectRoot });
      const validStatuses = ['PASS', 'WARN', 'FAIL', 'INFO'];

      for (const check of result.data.checks) {
        expect(validStatuses).toContain(check.status);
        expect(check).toHaveProperty('check');
        expect(check).toHaveProperty('message');
      }
    });

    it('should include all expected check names', async () => {
      const result = await runDoctorChecks({ projectRoot });
      const checkNames = result.data.checks.map((c) => c.check);

      expect(checkNames).toContain('settings-json');
      expect(checkNames).toContain('rules-files');
      expect(checkNames).toContain('agent-memory');
      expect(checkNames).toContain('entity-registry');
      expect(checkNames).toContain('git-hooks');
      expect(checkNames).toContain('core-config');
      expect(checkNames).toContain('claude-md');
      expect(checkNames).toContain('ide-sync');
      expect(checkNames).toContain('graph-dashboard');
      expect(checkNames).toContain('code-intel');
      expect(checkNames).toContain('node-version');
      expect(checkNames).toContain('npm-packages');
      expect(checkNames).toContain('skills-count');
      expect(checkNames).toContain('commands-count');
      expect(checkNames).toContain('hooks-claude-count');
    });
  });

  describe('summary (AC3)', () => {
    it('should have pass/warn/fail/info counts that sum to 15', async () => {
      const result = await runDoctorChecks({ projectRoot });
      const { pass, warn, fail, info } = result.data.summary;
      expect(pass + warn + fail + info).toBe(15);
    });

    it('should include Summary line in text output', async () => {
      const result = await runDoctorChecks({ projectRoot });
      expect(result.formatted).toMatch(/Summary: \d+ PASS \| \d+ WARN \| \d+ FAIL \| \d+ INFO/);
    });
  });

  describe('--dry-run (AC4)', () => {
    it('should include fixResults when dryRun is true', async () => {
      const result = await runDoctorChecks({ dryRun: true, projectRoot });
      expect(result.data).toHaveProperty('fixResults');
    });

    it('should not produce file changes with dryRun', async () => {
      const result = await runDoctorChecks({ dryRun: true, projectRoot });
      if (result.data.fixResults) {
        for (const fr of result.data.fixResults) {
          expect(fr.applied).toBe(false);
        }
      }
    });
  });

  describe('JSON output schema (AC3)', () => {
    it('should match expected JSON schema', async () => {
      const result = await runDoctorChecks({ json: true, projectRoot });
      const parsed = JSON.parse(result.formatted);

      expect(parsed).toHaveProperty('version');
      expect(parsed).toHaveProperty('timestamp');
      expect(parsed).toHaveProperty('summary');
      expect(parsed.summary).toHaveProperty('pass');
      expect(parsed.summary).toHaveProperty('warn');
      expect(parsed.summary).toHaveProperty('fail');
      expect(parsed.summary).toHaveProperty('info');
      expect(parsed).toHaveProperty('checks');
      expect(Array.isArray(parsed.checks)).toBe(true);
    });
  });
});
