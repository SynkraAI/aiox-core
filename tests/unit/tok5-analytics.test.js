// =============================================================================
// tok5-analytics.test.js — Unit tests for TOK-5 Tool Usage Analytics
// =============================================================================
// Tests collect-tool-usage.js and generate-optimization-report.js exports
// Covers: schema validation, sanitization, retention, baseline comparison,
//         promote/demote recommendations, report generation
// =============================================================================

'use strict';

const {
  createEvent,
  sanitizeEvent,
  validateEvent,
  pruneOldEntries,
  generateSampleData,
  RETENTION_DAYS
} = require('../../.aios-core/infrastructure/scripts/collect-tool-usage');

const {
  compareBaseline,
  generateRecommendations,
  generateReport,
  aggregateUsage,
  DEFAULT_THRESHOLDS
} = require('../../.aios-core/infrastructure/scripts/generate-optimization-report');

// --- Helpers ---
function makeSession(id, events, daysAgo = 0) {
  const ts = new Date();
  ts.setDate(ts.getDate() - daysAgo);
  return {
    session_id: id,
    timestamp: ts.toISOString(),
    event_count: events.length,
    events
  };
}

function makeEvent(toolName, count, input, output, sessionId = 'test-session', daysAgo = 0) {
  const event = createEvent(toolName, count, input, output, sessionId);
  if (daysAgo > 0) {
    const ts = new Date();
    ts.setDate(ts.getDate() - daysAgo);
    event.timestamp = ts.toISOString();
  }
  return event;
}

// =============================================================================
// collect-tool-usage.js tests
// =============================================================================
describe('collect-tool-usage.js', () => {
  describe('createEvent', () => {
    it('creates event with all required fields', () => {
      const event = createEvent('Read', 5, 1000, 500, 'sess-1');
      expect(event.tool_name).toBe('Read');
      expect(event.invocation_count).toBe(5);
      expect(event.token_cost_input).toBe(1000);
      expect(event.token_cost_output).toBe(500);
      expect(event.session_id).toBe('sess-1');
      expect(event.timestamp).toBeDefined();
    });

    it('coerces invalid numbers to 0', () => {
      const event = createEvent('Read', 'abc', null, undefined, 'sess-1');
      expect(event.invocation_count).toBe(0);
      expect(event.token_cost_input).toBe(0);
      expect(event.token_cost_output).toBe(0);
    });
  });

  describe('sanitizeEvent', () => {
    it('strips special characters from tool_name', () => {
      const event = sanitizeEvent({ tool_name: 'Read<script>', invocation_count: 1, token_cost_input: 0, token_cost_output: 0, session_id: 'x', timestamp: new Date().toISOString() });
      expect(event.tool_name).toBe('Readscript');
    });

    it('floors numeric values and ensures non-negative', () => {
      const event = sanitizeEvent({ tool_name: 'Read', invocation_count: -5, token_cost_input: 3.7, token_cost_output: 2.2, session_id: 'x', timestamp: new Date().toISOString() });
      expect(event.invocation_count).toBe(0);
      expect(event.token_cost_input).toBe(3);
      expect(event.token_cost_output).toBe(2);
    });
  });

  describe('validateEvent', () => {
    it('passes valid event', () => {
      const event = createEvent('Read', 5, 1000, 500, 'sess-1');
      const result = validateEvent(event);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('fails on missing fields', () => {
      const result = validateEvent({ tool_name: '', invocation_count: 5, token_cost_input: 0, token_cost_output: 0, session_id: 'x', timestamp: '' });
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('fails on negative invocation_count', () => {
      const result = validateEvent({ tool_name: 'Read', invocation_count: -1, token_cost_input: 0, token_cost_output: 0, session_id: 'x', timestamp: new Date().toISOString() });
      expect(result.valid).toBe(false);
    });
  });

  describe('pruneOldEntries', () => {
    it('keeps sessions within retention window', () => {
      const sessions = [
        makeSession('recent', [makeEvent('Read', 1, 100, 50, 'test-session', 5)], 5),
        makeSession('old', [makeEvent('Read', 1, 100, 50, 'test-session', 40)], 40)
      ];
      const { pruned, removed } = pruneOldEntries(sessions);
      expect(pruned).toHaveLength(1);
      expect(pruned[0].session_id).toBe('recent');
      expect(removed).toBe(1);
    });

    it('returns empty for all-old sessions', () => {
      const sessions = [
        makeSession('old1', [makeEvent('Read', 1, 100, 50, 'test-session', 35)], 35),
        makeSession('old2', [makeEvent('Read', 1, 100, 50, 'test-session', 60)], 60)
      ];
      const { pruned, removed } = pruneOldEntries(sessions);
      expect(pruned).toHaveLength(0);
      expect(removed).toBe(2);
    });
  });

  describe('generateSampleData', () => {
    it('generates 10 sample events', () => {
      const events = generateSampleData('test-sess');
      expect(events).toHaveLength(10);
      events.forEach(e => {
        expect(e.session_id).toBe('test-sess');
        expect(e.invocation_count).toBeGreaterThan(0);
      });
    });
  });

  it('RETENTION_DAYS is 30', () => {
    expect(RETENTION_DAYS).toBe(30);
  });
});

// =============================================================================
// generate-optimization-report.js tests
// =============================================================================
describe('generate-optimization-report.js', () => {
  const mockRegistry = {
    tools: {
      Read: { tier: 1, tokenCost: 200 },
      Write: { tier: 1, tokenCost: 200 },
      Bash: { tier: 1, tokenCost: 300 },
      git: { tier: 2, tokenCost: 100 },
      exa: { tier: 3, tokenCost: 500 }
    }
  };

  const mockBaseline = {
    frameworkOverhead: { totalEstimatedTokens: 26143 },
    workflows: {
      'Story Development Cycle (SDC)': {
        median: { totalTokens: 188000 }
      }
    },
    comparison: {
      aiosActual: {
        overheadPercentOfTypicalSession: {
          'Story Development Cycle (SDC)': 13.9
        }
      }
    }
  };

  describe('aggregateUsage', () => {
    it('aggregates tool stats across sessions', () => {
      const sessions = [
        makeSession('s1', [makeEvent('Read', 5, 1000, 500), makeEvent('Write', 3, 600, 300)]),
        makeSession('s2', [makeEvent('Read', 8, 1600, 800)])
      ];
      const { toolStats, sessionCount } = aggregateUsage(sessions);
      expect(sessionCount).toBe(2);
      expect(toolStats.Read.total_invocations).toBe(13);
      expect(toolStats.Read.sessions_used).toBe(2);
      expect(toolStats.Write.total_invocations).toBe(3);
      expect(toolStats.Write.sessions_used).toBe(1);
    });

    it('calculates averages correctly', () => {
      const sessions = [
        makeSession('s1', [makeEvent('Read', 10, 2000, 1000)]),
        makeSession('s2', [makeEvent('Read', 20, 4000, 2000)])
      ];
      const { toolStats } = aggregateUsage(sessions);
      expect(toolStats.Read.avg_invocations_per_session).toBe(15);
    });
  });

  describe('compareBaseline', () => {
    it('returns unavailable when no baseline', () => {
      const result = compareBaseline(null, { sessions: [] }, mockRegistry);
      expect(result.available).toBe(false);
    });

    it('returns unavailable when no sessions', () => {
      const result = compareBaseline(mockBaseline, { sessions: [] }, mockRegistry);
      expect(result.available).toBe(false);
    });

    it('calculates static overhead from registry tokenCost (C1 fix)', () => {
      const usageData = {
        sessions: [
          makeSession('s1', [makeEvent('Read', 5, 1000, 500), makeEvent('Bash', 3, 900, 600)])
        ]
      };
      const result = compareBaseline(mockBaseline, usageData, mockRegistry);
      expect(result.available).toBe(true);
      // Read(200) + Bash(300) = 500 post-opt overhead
      expect(result.post_optimization_overhead_tokens).toBe(500);
      expect(result.baseline_overhead_tokens).toBe(26143);
      expect(result.absolute_reduction_tokens).toBe(25643);
      expect(result.comparison_methodology).toContain('Static schema overhead');
    });

    it('uses fallback when no registry provided', () => {
      const usageData = {
        sessions: [
          makeSession('s1', [makeEvent('Read', 5, 1000, 500)])
        ]
      };
      const result = compareBaseline(mockBaseline, usageData, null);
      expect(result.available).toBe(true);
      // Fallback: (1000+500)/5 = 300 per-invocation cost estimate
      expect(result.post_optimization_overhead_tokens).toBe(300);
    });

    it('includes dynamic_usage section', () => {
      const usageData = {
        sessions: [makeSession('s1', [makeEvent('Read', 5, 1000, 500)])]
      };
      const result = compareBaseline(mockBaseline, usageData, mockRegistry);
      expect(result.dynamic_usage).toBeDefined();
      expect(result.dynamic_usage.total_invocation_tokens).toBe(1500);
      expect(result.dynamic_usage.sessions_analyzed).toBe(1);
    });

    it('correctly assigns target status', () => {
      // With Read(200) only = 200 post-opt vs 26143 baseline = 99% reduction
      const usageData = {
        sessions: [makeSession('s1', [makeEvent('Read', 1, 200, 100)])]
      };
      const result = compareBaseline(mockBaseline, usageData, mockRegistry);
      expect(result.target_25_45_pct).toBe('ACHIEVED');
    });
  });

  describe('generateRecommendations', () => {
    const thresholds = DEFAULT_THRESHOLDS;

    it('recommends promote for heavily used deferred tool', () => {
      // Tool used >10 times/session across 5+ sessions
      const sessions = [];
      for (let i = 0; i < 6; i++) {
        sessions.push(makeSession(`s${i}`, [makeEvent('git', 15, 1500, 750)]));
      }
      const recs = generateRecommendations({ sessions }, mockRegistry, thresholds);
      const gitRec = recs.find(r => r.tool_name === 'git' && r.action === 'promote');
      expect(gitRec).toBeDefined();
      expect(gitRec.current_tier).toBe('tier_2');
      expect(gitRec.recommended_tier).toBe('tier_1');
    });

    it('does not promote Tier 1 tools', () => {
      const sessions = [];
      for (let i = 0; i < 6; i++) {
        sessions.push(makeSession(`s${i}`, [makeEvent('Read', 20, 4000, 2000)]));
      }
      const recs = generateRecommendations({ sessions }, mockRegistry, thresholds);
      const readRec = recs.find(r => r.tool_name === 'Read' && r.action === 'promote');
      expect(readRec).toBeUndefined();
    });

    it('recommends demote for rarely used tool (C2 fix)', () => {
      // Tool used in 0 of 5 sessions = rate 0 < threshold 0.2
      const sessions = [];
      for (let i = 0; i < 5; i++) {
        sessions.push(makeSession(`s${i}`, [makeEvent('Read', 5, 1000, 500)]));
      }
      // git never appears but is tier 2 — should get demote from "never used" check
      const recs = generateRecommendations({ sessions }, mockRegistry, thresholds);
      const gitRec = recs.find(r => r.tool_name === 'git' && r.action === 'demote');
      expect(gitRec).toBeDefined();
    });

    it('demotes tool used in only 1 of 10 sessions (C2 precision)', () => {
      // usage_rate = 1/10 = 0.1, threshold = 1/5 = 0.2 → should demote
      const sessions = [];
      for (let i = 0; i < 10; i++) {
        const events = [makeEvent('Read', 5, 1000, 500)];
        if (i === 0) events.push(makeEvent('git', 1, 100, 50));
        sessions.push(makeSession(`s${i}`, events));
      }
      const recs = generateRecommendations({ sessions }, mockRegistry, thresholds);
      const gitRec = recs.find(r => r.tool_name === 'git' && r.action === 'demote');
      expect(gitRec).toBeDefined();
      expect(gitRec.evidence.usage_rate).toBe(0.1);
      expect(gitRec.evidence.demote_threshold_rate).toBe(0.2);
    });

    it('does NOT demote tool used in 2 of 5 sessions', () => {
      // usage_rate = 2/5 = 0.4, threshold = 1/5 = 0.2 → should NOT demote
      const sessions = [];
      for (let i = 0; i < 5; i++) {
        const events = [makeEvent('Read', 5, 1000, 500)];
        if (i < 2) events.push(makeEvent('git', 3, 300, 150));
        sessions.push(makeSession(`s${i}`, events));
      }
      const recs = generateRecommendations({ sessions }, mockRegistry, thresholds);
      const gitRec = recs.find(r => r.tool_name === 'git' && r.action === 'demote');
      expect(gitRec).toBeUndefined();
    });

    it('does not demote Tier 3 tools', () => {
      const sessions = [];
      for (let i = 0; i < 5; i++) {
        sessions.push(makeSession(`s${i}`, [makeEvent('exa', 1, 500, 250)]));
      }
      const recs = generateRecommendations({ sessions }, mockRegistry, thresholds);
      const exaRec = recs.find(r => r.tool_name === 'exa' && r.action === 'demote');
      expect(exaRec).toBeUndefined();
    });
  });

  describe('generateReport', () => {
    it('generates report with all required fields', () => {
      const comparison = {
        available: true,
        absolute_reduction_tokens: 25000,
        percentage_reduction: 95.6,
        target_25_45_pct: 'ACHIEVED'
      };
      const recs = [
        { action: 'promote', tool_name: 'git' },
        { action: 'demote', tool_name: 'ffmpeg' }
      ];
      const usageData = { sessions: [makeSession('s1', [makeEvent('Read', 1, 100, 50)])] };
      const report = generateReport(comparison, recs, usageData, DEFAULT_THRESHOLDS);

      expect(report.version).toBe('1.0.0');
      expect(report.story).toBe('TOK-5');
      expect(report.total_tokens_saved).toBe(25000);
      expect(report.percentage_reduction).toBe(95.6);
      expect(report.target_status).toBe('ACHIEVED');
      expect(report.recommendations_count).toBe(2);
      expect(report.promote_count).toBe(1);
      expect(report.demote_count).toBe(1);
      expect(report.thresholds_used).toEqual(DEFAULT_THRESHOLDS);
    });

    it('handles no-data comparison', () => {
      const comparison = { available: false, reason: 'No data' };
      const report = generateReport(comparison, [], null, DEFAULT_THRESHOLDS);
      expect(report.target_status).toBe('NO_DATA');
      expect(report.total_tokens_saved).toBe(0);
    });
  });
});
