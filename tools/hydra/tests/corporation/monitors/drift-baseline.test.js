import { jest } from '@jest/globals';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { DriftBaseline, DEFAULT_WINDOW_SIZE } from '../../../src/corporation/monitors/drift-baseline.js';

// =====================================================
// HELPERS
// =====================================================

function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'drift-baseline-'));
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

// =====================================================
// TESTS
// =====================================================

describe('DriftBaseline', () => {
  let tmpDir;
  let baseline;

  beforeEach(() => {
    tmpDir = makeTmpDir();
    baseline = new DriftBaseline({ dataDir: tmpDir, windowSize: 10 });
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  // --- Constructor ---

  describe('constructor', () => {
    test('uses default window size when not specified', () => {
      const b = new DriftBaseline({ dataDir: tmpDir });
      expect(b.windowSize).toBe(DEFAULT_WINDOW_SIZE);
    });

    test('accepts custom window size', () => {
      expect(baseline.windowSize).toBe(10);
    });
  });

  // --- record() ---

  describe('record', () => {
    test('records an interaction and returns computed stats', () => {
      const stats = baseline.record('dev', makeInteraction());
      expect(stats).toBeDefined();
      expect(stats.avg_duration_ms).toBe(1000);
      expect(stats.avg_output_length).toBe(500);
      expect(stats.error_rate).toBe(0);
      expect(stats.total_interactions).toBe(1);
    });

    test('throws on missing agentId', () => {
      expect(() => baseline.record('', makeInteraction())).toThrow('agentId is required');
      expect(() => baseline.record(null, makeInteraction())).toThrow('agentId is required');
    });

    test('throws on missing interaction', () => {
      expect(() => baseline.record('dev', null)).toThrow('interaction must be an object');
    });

    test('accumulates interactions up to window size', () => {
      for (let i = 0; i < 15; i++) {
        baseline.record('dev', makeInteraction({ duration_ms: 100 * (i + 1) }));
      }
      const b = baseline.getBaseline('dev');
      // Window size is 10, so only last 10 interactions are kept
      expect(b.sample_size).toBe(10);
      // Last 10 durations: 600..1500, avg = 1050
      expect(b.avg_duration_ms).toBe(1050);
    });

    test('handles interaction with defaults', () => {
      const stats = baseline.record('qa', { duration_ms: 200 });
      expect(stats.avg_duration_ms).toBe(200);
      expect(stats.avg_output_length).toBe(0);
      expect(stats.error_rate).toBe(0);
    });

    test('tracks error rate correctly', () => {
      baseline.record('dev', makeInteraction({ error: false }));
      baseline.record('dev', makeInteraction({ error: true }));
      baseline.record('dev', makeInteraction({ error: false }));
      baseline.record('dev', makeInteraction({ error: true }));

      const b = baseline.getBaseline('dev');
      expect(b.error_rate).toBe(0.5);
      expect(b.error_count).toBe(2);
    });

    test('tracks tool frequency', () => {
      baseline.record('dev', makeInteraction({ tools_used: ['read', 'write'] }));
      baseline.record('dev', makeInteraction({ tools_used: ['read', 'grep'] }));

      const b = baseline.getBaseline('dev');
      expect(b.tool_frequency.read).toBe(2);
      expect(b.tool_frequency.write).toBe(1);
      expect(b.tool_frequency.grep).toBe(1);
    });

    test('tracks task type distribution', () => {
      baseline.record('dev', makeInteraction({ task_type: 'develop' }));
      baseline.record('dev', makeInteraction({ task_type: 'develop' }));
      baseline.record('dev', makeInteraction({ task_type: 'test' }));

      const b = baseline.getBaseline('dev');
      expect(b.task_distribution.develop).toBe(2);
      expect(b.task_distribution.test).toBe(1);
    });
  });

  // --- getBaseline() ---

  describe('getBaseline', () => {
    test('returns null for unknown agent', () => {
      expect(baseline.getBaseline('nonexistent')).toBeNull();
    });

    test('returns stats with sample_size', () => {
      baseline.record('dev', makeInteraction());
      const b = baseline.getBaseline('dev');
      expect(b.sample_size).toBe(1);
    });
  });

  // --- getAllBaselines() ---

  describe('getAllBaselines', () => {
    test('returns empty object when no data', () => {
      expect(baseline.getAllBaselines()).toEqual({});
    });

    test('returns all agent baselines', () => {
      baseline.record('dev', makeInteraction());
      baseline.record('qa', makeInteraction({ duration_ms: 2000 }));

      const all = baseline.getAllBaselines();
      expect(Object.keys(all)).toEqual(['dev', 'qa']);
      expect(all.dev.avg_duration_ms).toBe(1000);
      expect(all.qa.avg_duration_ms).toBe(2000);
    });
  });

  // --- hasBaseline() ---

  describe('hasBaseline', () => {
    test('returns false with insufficient data', () => {
      baseline.record('dev', makeInteraction());
      expect(baseline.hasBaseline('dev', 5)).toBe(false);
    });

    test('returns true with enough data', () => {
      for (let i = 0; i < 5; i++) {
        baseline.record('dev', makeInteraction());
      }
      expect(baseline.hasBaseline('dev', 5)).toBe(true);
    });

    test('returns false for unknown agent', () => {
      expect(baseline.hasBaseline('ghost')).toBe(false);
    });
  });

  // --- getRecentInteractions() ---

  describe('getRecentInteractions', () => {
    test('returns empty array for unknown agent', () => {
      expect(baseline.getRecentInteractions('ghost')).toEqual([]);
    });

    test('returns last N interactions', () => {
      for (let i = 0; i < 5; i++) {
        baseline.record('dev', makeInteraction({ duration_ms: (i + 1) * 100 }));
      }
      const recent = baseline.getRecentInteractions('dev', 3);
      expect(recent).toHaveLength(3);
      expect(recent[0].duration_ms).toBe(300);
      expect(recent[2].duration_ms).toBe(500);
    });
  });

  // --- Persistence ---

  describe('persistence', () => {
    test('save and load round-trip', () => {
      baseline.record('dev', makeInteraction({ duration_ms: 1000 }));
      baseline.record('qa', makeInteraction({ duration_ms: 2000 }));
      baseline.save();

      const loaded = new DriftBaseline({ dataDir: tmpDir });
      loaded.load();

      const devBaseline = loaded.getBaseline('dev');
      expect(devBaseline.avg_duration_ms).toBe(1000);
      const qaBaseline = loaded.getBaseline('qa');
      expect(qaBaseline.avg_duration_ms).toBe(2000);
    });

    test('load handles missing file gracefully', () => {
      const b = new DriftBaseline({ dataDir: path.join(tmpDir, 'nonexistent') });
      expect(() => b.load()).not.toThrow();
    });

    test('load handles corrupted file gracefully', () => {
      fs.mkdirSync(tmpDir, { recursive: true });
      fs.writeFileSync(path.join(tmpDir, 'baselines.json'), 'not json!', 'utf-8');
      const b = new DriftBaseline({ dataDir: tmpDir });
      expect(() => b.load()).not.toThrow();
      expect(b.getAllBaselines()).toEqual({});
    });
  });

  // --- reset() ---

  describe('reset', () => {
    test('clears data for specific agent', () => {
      baseline.record('dev', makeInteraction());
      baseline.record('qa', makeInteraction());
      baseline.reset('dev');
      expect(baseline.getBaseline('dev')).toBeNull();
      expect(baseline.getBaseline('qa')).not.toBeNull();
    });

    test('resetAll clears all data', () => {
      baseline.record('dev', makeInteraction());
      baseline.record('qa', makeInteraction());
      baseline.resetAll();
      expect(baseline.getAllBaselines()).toEqual({});
    });
  });

  // --- Statistics ---

  describe('statistics', () => {
    test('computes standard deviation correctly', () => {
      // Values: 100, 200, 300 -> mean=200, stddev ~100
      baseline.record('dev', makeInteraction({ duration_ms: 100 }));
      baseline.record('dev', makeInteraction({ duration_ms: 200 }));
      baseline.record('dev', makeInteraction({ duration_ms: 300 }));

      const b = baseline.getBaseline('dev');
      expect(b.avg_duration_ms).toBe(200);
      expect(b.std_duration_ms).toBe(100);
    });

    test('computes median correctly for odd count', () => {
      baseline.record('dev', makeInteraction({ duration_ms: 300 }));
      baseline.record('dev', makeInteraction({ duration_ms: 100 }));
      baseline.record('dev', makeInteraction({ duration_ms: 200 }));

      const b = baseline.getBaseline('dev');
      expect(b.median_duration_ms).toBe(200);
    });

    test('computes median correctly for even count', () => {
      baseline.record('dev', makeInteraction({ duration_ms: 100 }));
      baseline.record('dev', makeInteraction({ duration_ms: 200 }));
      baseline.record('dev', makeInteraction({ duration_ms: 300 }));
      baseline.record('dev', makeInteraction({ duration_ms: 400 }));

      const b = baseline.getBaseline('dev');
      expect(b.median_duration_ms).toBe(250);
    });

    test('computes p95 correctly', () => {
      for (let i = 1; i <= 20; i++) {
        baseline.record('dev', makeInteraction({ duration_ms: i * 100 }));
      }
      // Window is 10, so last 10 values: 1100..2000
      const b = baseline.getBaseline('dev');
      expect(b.p95_duration_ms).toBeGreaterThanOrEqual(1900);
    });

    test('computes avg_tools_per_interaction', () => {
      baseline.record('dev', makeInteraction({ tools_used: ['a', 'b', 'c'] }));
      baseline.record('dev', makeInteraction({ tools_used: ['a'] }));

      const b = baseline.getBaseline('dev');
      expect(b.avg_tools_per_interaction).toBe(2);
    });
  });
});
