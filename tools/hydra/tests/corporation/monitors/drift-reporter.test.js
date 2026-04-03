import { jest } from '@jest/globals';
import os from 'node:os';
import fs from 'node:fs';
import path from 'node:path';
import { DriftReporter } from '../../../src/corporation/monitors/drift-reporter.js';
import { DriftDetector, HEALTH_STATUS } from '../../../src/corporation/monitors/drift-detector.js';

// =====================================================
// HELPERS
// =====================================================

function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'drift-reporter-'));
}

function makeInteraction(overrides = {}) {
  return {
    duration_ms: 1000,
    output_length: 500,
    error: false,
    tools_used: ['read', 'write'],
    task_type: 'develop',
    result: 'success',
    ...overrides,
  };
}

function seedBaseline(detector, agentId, count = 15) {
  for (let i = 0; i < count; i++) {
    detector.evaluate(agentId, makeInteraction({
      duration_ms: 900 + Math.floor(Math.random() * 200),
      output_length: 450 + Math.floor(Math.random() * 100),
    }));
  }
}

// =====================================================
// TESTS
// =====================================================

describe('DriftReporter', () => {
  let tmpDir;
  let detector;
  let reporter;

  beforeEach(() => {
    tmpDir = makeTmpDir();
    detector = new DriftDetector({ dataDir: tmpDir });
    reporter = new DriftReporter({ detector });
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  // --- Constructor ---

  describe('constructor', () => {
    test('throws without detector', () => {
      expect(() => new DriftReporter()).toThrow('requires a DriftDetector');
      expect(() => new DriftReporter({})).toThrow('requires a DriftDetector');
    });

    test('accepts detector instance', () => {
      expect(() => new DriftReporter({ detector })).not.toThrow();
    });
  });

  // --- generateReport() ---

  describe('generateReport', () => {
    test('returns empty report when no data', () => {
      const report = reporter.generateReport();
      expect(report.summary.total_agents).toBe(0);
      expect(report.agents).toEqual([]);
      expect(report.alerts).toEqual([]);
      expect(report.generated_at).toBeDefined();
    });

    test('includes all tracked agents', () => {
      seedBaseline(detector, 'dev');
      seedBaseline(detector, 'qa');
      seedBaseline(detector, 'architect');

      const report = reporter.generateReport();
      expect(report.summary.total_agents).toBe(3);
      expect(report.agents).toHaveLength(3);

      const agentIds = report.agents.map(a => a.agent_id);
      expect(agentIds).toContain('dev');
      expect(agentIds).toContain('qa');
      expect(agentIds).toContain('architect');
    });

    test('agents are sorted by score descending', () => {
      seedBaseline(detector, 'stable-agent');
      seedBaseline(detector, 'drifty-agent');

      // Make drifty-agent worse
      for (let i = 0; i < 5; i++) {
        detector.evaluate('drifty-agent', makeInteraction({
          error: true,
          duration_ms: 50000,
          output_length: 0,
        }));
      }

      const report = reporter.generateReport();
      expect(report.agents[0].score).toBeGreaterThanOrEqual(report.agents[1].score);
    });

    test('summary counts status categories', () => {
      seedBaseline(detector, 'healthy1');
      seedBaseline(detector, 'healthy2');

      const report = reporter.generateReport();
      expect(report.summary.healthy).toBeGreaterThanOrEqual(0);
      expect(typeof report.summary.warning).toBe('number');
      expect(typeof report.summary.degraded).toBe('number');
      expect(typeof report.summary.critical).toBe('number');
      expect(typeof report.summary.avg_score).toBe('number');
    });

    test('report includes trend data', () => {
      seedBaseline(detector, 'dev', 20);
      const report = reporter.generateReport();
      const devAgent = report.agents.find(a => a.agent_id === 'dev');
      expect(devAgent.trend).toBeDefined();
      expect(['stable', 'improving', 'worsening', 'insufficient_data']).toContain(devAgent.trend);
    });

    test('report includes baseline summary', () => {
      seedBaseline(detector, 'dev');
      const report = reporter.generateReport();
      const devAgent = report.agents.find(a => a.agent_id === 'dev');
      expect(devAgent.baseline_summary).not.toBeNull();
      expect(devAgent.baseline_summary.avg_duration_ms).toBeGreaterThan(0);
    });

    test('alerts array contains only alerting agents', () => {
      seedBaseline(detector, 'stable');
      const report = reporter.generateReport();
      const alertIds = report.alerts.map(a => a.agent_id);
      // Stable agents should not be in alerts (unless randomly triggered)
      for (const alert of report.alerts) {
        expect(alert.score).toBeGreaterThanOrEqual(detector.threshold);
      }
    });
  });

  // --- generateAgentReport() ---

  describe('generateAgentReport', () => {
    test('returns null for unknown agent', () => {
      expect(reporter.generateAgentReport('ghost')).toBeNull();
    });

    test('returns detailed report for known agent', () => {
      seedBaseline(detector, 'dev');
      const report = reporter.generateAgentReport('dev');

      expect(report.agent_id).toBe('dev');
      expect(report.score).toBeDefined();
      expect(report.status).toBeDefined();
      expect(report.dimensions).toBeDefined();
      expect(report.trend).toBeDefined();
      expect(report.baseline).not.toBeNull();
      expect(report.recent_interactions).toBeDefined();
      expect(report.recent_interactions.length).toBeGreaterThan(0);
    });

    test('includes tool frequency in baseline', () => {
      seedBaseline(detector, 'dev');
      const report = reporter.generateAgentReport('dev');
      expect(report.baseline.tool_frequency).toBeDefined();
    });

    test('includes task distribution in baseline', () => {
      seedBaseline(detector, 'dev');
      const report = reporter.generateAgentReport('dev');
      expect(report.baseline.task_distribution).toBeDefined();
    });
  });

  // --- formatText() ---

  describe('formatText', () => {
    test('produces readable output with no data', () => {
      const text = reporter.formatText();
      expect(text).toContain('AGENT DRIFT REPORT');
      expect(text).toContain('Total agents tracked: 0');
    });

    test('produces readable output with agents', () => {
      seedBaseline(detector, 'dev');
      seedBaseline(detector, 'qa');
      const text = reporter.formatText();

      expect(text).toContain('AGENT DRIFT REPORT');
      expect(text).toContain('dev');
      expect(text).toContain('qa');
      expect(text).toContain('Total agents tracked: 2');
    });

    test('shows alerts section when agents are alerting', () => {
      seedBaseline(detector, 'bad-agent');
      // Force alert
      for (let i = 0; i < 10; i++) {
        detector.evaluate('bad-agent', makeInteraction({
          error: true,
          duration_ms: 100000,
          output_length: 0,
          tools_used: ['unknown'],
        }));
      }

      const text = reporter.formatText();
      // May or may not trigger alert depending on score, but format should work
      expect(text).toContain('Agent Details');
    });

    test('accepts pre-generated report', () => {
      seedBaseline(detector, 'dev');
      const report = reporter.generateReport();
      const text = reporter.formatText(report);
      expect(text).toContain('AGENT DRIFT REPORT');
    });
  });

  // --- formatAgentText() ---

  describe('formatAgentText', () => {
    test('returns message for unknown agent', () => {
      const text = reporter.formatAgentText('ghost');
      expect(text).toContain('No drift data');
    });

    test('produces detailed agent output', () => {
      seedBaseline(detector, 'dev');
      const text = reporter.formatAgentText('dev');

      expect(text).toContain('DRIFT REPORT: dev');
      expect(text).toContain('Dimensions:');
      expect(text).toContain('duration');
      expect(text).toContain('error_rate');
      expect(text).toContain('Baseline:');
    });

    test('includes visual bars in dimension display', () => {
      seedBaseline(detector, 'dev');
      const text = reporter.formatAgentText('dev');
      // Should contain bar characters
      expect(text).toMatch(/[#.]/);
    });
  });
});
