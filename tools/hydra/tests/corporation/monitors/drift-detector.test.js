import { jest } from '@jest/globals';
import os from 'node:os';
import fs from 'node:fs';
import path from 'node:path';
import { DriftDetector, DEFAULT_THRESHOLD, CRITICAL_THRESHOLD, HEALTH_STATUS, MIN_SAMPLES_FOR_DETECTION } from '../../../src/corporation/monitors/drift-detector.js';
import { DriftBaseline } from '../../../src/corporation/monitors/drift-baseline.js';

// =====================================================
// HELPERS
// =====================================================

function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'drift-detector-'));
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

/**
 * Seed an agent with N normal interactions to build a baseline.
 */
function seedBaseline(detector, agentId, count = 15) {
  for (let i = 0; i < count; i++) {
    detector.evaluate(agentId, makeInteraction({
      duration_ms: 900 + Math.floor(Math.random() * 200), // 900-1100ms
      output_length: 450 + Math.floor(Math.random() * 100), // 450-550
    }));
  }
}

// =====================================================
// TESTS
// =====================================================

describe('DriftDetector', () => {
  let tmpDir;
  let detector;

  beforeEach(() => {
    tmpDir = makeTmpDir();
    detector = new DriftDetector({ dataDir: tmpDir });
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  // --- Constructor ---

  describe('constructor', () => {
    test('uses default threshold', () => {
      expect(detector.threshold).toBe(DEFAULT_THRESHOLD);
    });

    test('accepts custom threshold', () => {
      const d = new DriftDetector({ threshold: 0.5, dataDir: tmpDir });
      expect(d.threshold).toBe(0.5);
    });

    test('accepts pre-configured baseline', () => {
      const baseline = new DriftBaseline({ dataDir: tmpDir });
      const d = new DriftDetector({ baseline });
      expect(d.baseline).toBe(baseline);
    });
  });

  // --- evaluate() ---

  describe('evaluate', () => {
    test('returns healthy with insufficient data', () => {
      const result = detector.evaluate('dev', makeInteraction());
      expect(result.score).toBe(0);
      expect(result.status).toBe(HEALTH_STATUS.HEALTHY);
      expect(result.alert).toBe(false);
      expect(result.reason).toContain('Insufficient');
    });

    test('returns low score for normal interactions after baseline', () => {
      seedBaseline(detector, 'dev');
      const result = detector.evaluate('dev', makeInteraction({
        duration_ms: 1000,
        output_length: 500,
      }));
      expect(result.score).toBeLessThan(DEFAULT_THRESHOLD);
      expect(result.status).toBe(HEALTH_STATUS.HEALTHY);
      expect(result.alert).toBe(false);
    });

    test('detects duration anomaly', () => {
      // Build stable baseline at ~1000ms
      for (let i = 0; i < 15; i++) {
        detector.evaluate('dev', makeInteraction({ duration_ms: 1000 }));
      }
      // Spike to 10x normal
      const result = detector.evaluate('dev', makeInteraction({ duration_ms: 10000 }));
      expect(result.dimensions.duration).toBeGreaterThan(0);
      expect(result.score).toBeGreaterThan(0);
    });

    test('detects error rate spike', () => {
      // Build baseline with no errors
      for (let i = 0; i < 15; i++) {
        detector.evaluate('dev', makeInteraction({ error: false }));
      }
      // Trigger error
      const result = detector.evaluate('dev', makeInteraction({ error: true }));
      expect(result.dimensions.error_rate).toBeGreaterThan(0);
    });

    test('detects output length anomaly', () => {
      // Build baseline with consistent output length ~500
      for (let i = 0; i < 15; i++) {
        detector.evaluate('dev', makeInteraction({ output_length: 500 }));
      }
      // Drastic change
      const result = detector.evaluate('dev', makeInteraction({ output_length: 50 }));
      expect(result.dimensions.output_length).toBeGreaterThan(0);
    });

    test('detects tool pattern change', () => {
      // Build baseline with consistent tool usage
      for (let i = 0; i < 15; i++) {
        detector.evaluate('dev', makeInteraction({ tools_used: ['read', 'write', 'grep'] }));
      }
      // Completely different tools
      const result = detector.evaluate('dev', makeInteraction({
        tools_used: ['deploy', 'ssh', 'docker'],
      }));
      expect(result.dimensions.tool_pattern).toBeGreaterThan(0);
    });

    test('fires onAlert callback when threshold exceeded', () => {
      const alerts = [];
      const d = new DriftDetector({
        dataDir: tmpDir,
        onAlert: (result) => alerts.push(result),
        threshold: 0.1, // Very low threshold for easy triggering
      });

      // Build stable baseline
      for (let i = 0; i < 15; i++) {
        d.evaluate('dev', makeInteraction({ duration_ms: 100, error: false }));
      }

      // Trigger drift
      d.evaluate('dev', makeInteraction({
        duration_ms: 10000,
        error: true,
        tools_used: ['unknown_tool'],
        output_length: 0,
      }));

      expect(alerts.length).toBeGreaterThanOrEqual(1);
      expect(alerts[0].agentId).toBe('dev');
      expect(alerts[0].alert).toBe(true);
    });

    test('handles onAlert callback errors gracefully', () => {
      const d = new DriftDetector({
        dataDir: tmpDir,
        onAlert: () => { throw new Error('callback boom'); },
        threshold: 0.01,
      });

      for (let i = 0; i < 15; i++) {
        d.evaluate('dev', makeInteraction());
      }

      // Should not throw even with broken callback
      expect(() => {
        d.evaluate('dev', makeInteraction({ error: true, duration_ms: 99999 }));
      }).not.toThrow();
    });
  });

  // --- Score retrieval ---

  describe('score retrieval', () => {
    test('getLatestScore returns null for unknown agent', () => {
      expect(detector.getLatestScore('ghost')).toBeNull();
    });

    test('getLatestScore returns last evaluation', () => {
      seedBaseline(detector, 'dev');
      detector.evaluate('dev', makeInteraction());
      const score = detector.getLatestScore('dev');
      expect(score).not.toBeNull();
      expect(score.agentId).toBe('dev');
    });

    test('getAllScores returns scores for all agents', () => {
      seedBaseline(detector, 'dev');
      seedBaseline(detector, 'qa');
      const scores = detector.getAllScores();
      expect(Object.keys(scores)).toContain('dev');
      expect(Object.keys(scores)).toContain('qa');
    });

    test('getTopDrifters returns sorted by score', () => {
      // Create agents with different drift levels
      seedBaseline(detector, 'agent-a');
      seedBaseline(detector, 'agent-b');

      // Agent B gets a spike
      for (let i = 0; i < 3; i++) {
        detector.evaluate('agent-b', makeInteraction({ error: true, duration_ms: 50000 }));
      }

      const top = detector.getTopDrifters(5);
      expect(top.length).toBeGreaterThanOrEqual(2);
      // Agent-b should have higher score
      expect(top[0].score).toBeGreaterThanOrEqual(top[1].score);
    });
  });

  // --- Alerting ---

  describe('alerting', () => {
    test('getAlertingAgents returns only agents above threshold', () => {
      seedBaseline(detector, 'healthy-agent');
      detector.evaluate('healthy-agent', makeInteraction()); // Normal

      const alerting = detector.getAlertingAgents();
      const healthyInAlerts = alerting.find(a => a.agentId === 'healthy-agent');
      expect(healthyInAlerts).toBeUndefined();
    });
  });

  // --- Trends ---

  describe('trends', () => {
    test('returns insufficient_data with few evaluations', () => {
      detector.evaluate('dev', makeInteraction());
      const trend = detector.getTrend('dev');
      expect(trend.trend).toBe('insufficient_data');
    });

    test('detects stable trend', () => {
      // Use fixed values to ensure consistency (no randomness)
      for (let i = 0; i < 20; i++) {
        detector.evaluate('dev', makeInteraction({
          duration_ms: 1000,
          output_length: 500,
        }));
      }
      const trend = detector.getTrend('dev');
      expect(['stable', 'improving']).toContain(trend.trend);
    });

    test('returns trend for unknown agent', () => {
      const trend = detector.getTrend('ghost');
      expect(trend.trend).toBe('insufficient_data');
      expect(trend.direction).toBe(0);
    });
  });

  // --- Health status ---

  describe('health status', () => {
    test('returns healthy for unknown agent', () => {
      expect(detector.getHealthStatus('ghost')).toBe(HEALTH_STATUS.HEALTHY);
    });

    test('maps scores to correct status', () => {
      // Use direct scoring via scoreToStatus (test through evaluate)
      seedBaseline(detector, 'dev');
      const result = detector.evaluate('dev', makeInteraction());
      expect([HEALTH_STATUS.HEALTHY, HEALTH_STATUS.WARNING]).toContain(result.status);
    });
  });

  // --- Persistence ---

  describe('persistence', () => {
    test('save delegates to baseline', () => {
      seedBaseline(detector, 'dev');
      expect(() => detector.save()).not.toThrow();

      // Verify file was written
      const files = fs.readdirSync(tmpDir);
      expect(files).toContain('baselines.json');
    });
  });

  // --- Constants ---

  describe('constants', () => {
    test('default threshold is 0.3', () => {
      expect(DEFAULT_THRESHOLD).toBe(0.3);
    });

    test('critical threshold is 0.7', () => {
      expect(CRITICAL_THRESHOLD).toBe(0.7);
    });

    test('min samples is 10', () => {
      expect(MIN_SAMPLES_FOR_DETECTION).toBe(10);
    });

    test('HEALTH_STATUS has all expected values', () => {
      expect(HEALTH_STATUS.HEALTHY).toBe('healthy');
      expect(HEALTH_STATUS.WARNING).toBe('warning');
      expect(HEALTH_STATUS.DEGRADED).toBe('degraded');
      expect(HEALTH_STATUS.CRITICAL).toBe('critical');
    });
  });
});
