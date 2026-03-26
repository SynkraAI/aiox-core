'use strict';

/**
 * Tests for Productivity Metrics Module (Story AIOX-HO-2.4)
 *
 * Tests:
 * - computeSessionMetrics(): prompts per agent, stories, QA, commits, agent duration
 * - aggregateHistoricalMetrics(): multi-session aggregation
 * - calculateTrend(): improving, declining, stable, edge cases, inverted
 * - formatMetricsForCLI(): CLI table formatting
 * - saveMetrics() / readMetrics(): cache persistence
 * - metrics-trend command: generateMetricsTrend() with archived sessions
 * - session-report integration: metrics section appended
 * - Performance: <1s for 20 sessions
 *
 * @see Story AIOX-HO-2.4
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const {
  computeSessionMetrics,
  aggregateHistoricalMetrics,
  calculateTrend,
  formatMetricsForCLI,
  formatDurationMinutes,
  saveMetrics,
  readMetrics,
  getMetricsPath,
} = require('../../.claude/lib/handoff/metrics');

const { serializeState } = require('../../.claude/lib/handoff/session-state');

describe('Productivity Metrics (Story AIOX-HO-2.4)', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = path.join(
      os.tmpdir(),
      `test-metrics-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    );
    fs.mkdirSync(tmpDir, { recursive: true });
  });

  afterEach(() => {
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch (_) {
      // Ignore cleanup errors
    }
  });

  // --- computeSessionMetrics ---

  describe('computeSessionMetrics()', () => {
    test('returns empty metrics for null/empty session state', () => {
      const m1 = computeSessionMetrics(null);
      expect(m1.total_prompts).toBe(0);
      expect(m1.stories.started).toBe(0);
      expect(m1.commits).toBe(0);

      const m2 = computeSessionMetrics({ session: {}, events: [] });
      expect(m2.total_prompts).toBe(0);
    });

    test('computes prompts per agent from periodic events (* 5)', () => {
      const state = {
        session: { id: 'test-1', started: '2026-03-25T09:00:00Z', project: 'aios-core' },
        events: [
          { timestamp: '2026-03-25T09:00:00Z', type: 'periodic', agent: 'dev', prompt_count: 5 },
          { timestamp: '2026-03-25T09:30:00Z', type: 'periodic', agent: 'dev', prompt_count: 10 },
          { timestamp: '2026-03-25T10:00:00Z', type: 'periodic', agent: 'qa', prompt_count: 15 },
        ],
      };

      const m = computeSessionMetrics(state);
      expect(m.prompts_per_agent.dev).toBe(10); // 2 periodic events * 5
      expect(m.prompts_per_agent.qa).toBe(5); // 1 periodic event * 5
      expect(m.total_prompts).toBe(15);
    });

    test('counts stories started and completed separately', () => {
      const state = {
        session: { id: 'test-stories', started: '2026-03-25T09:00:00Z', project: 'test' },
        events: [
          { timestamp: '2026-03-25T09:00:00Z', type: 'story_start', agent: 'dev', story: 'HO-2.1' },
          { timestamp: '2026-03-25T10:00:00Z', type: 'story_start', agent: 'dev', story: 'HO-2.2' },
          { timestamp: '2026-03-25T11:00:00Z', type: 'story_complete', agent: 'dev', story: 'HO-2.1' },
        ],
      };

      const m = computeSessionMetrics(state);
      expect(m.stories.started).toBe(2);
      expect(m.stories.completed).toBe(1);
      expect(m.stories.completion_rate).toBe(0.5);
    });

    test('handles zero stories (no completions)', () => {
      const state = {
        session: { id: 'test-no-stories', started: '2026-03-25T09:00:00Z', project: 'test' },
        events: [
          { timestamp: '2026-03-25T09:00:00Z', type: 'agent_switch', agent: 'dev' },
        ],
      };

      const m = computeSessionMetrics(state);
      expect(m.stories.started).toBe(0);
      expect(m.stories.completed).toBe(0);
      expect(m.stories.completion_rate).toBe(0);
    });

    test('handles all stories completed', () => {
      const state = {
        session: { id: 'test-all-done', started: '2026-03-25T09:00:00Z', project: 'test' },
        events: [
          { timestamp: '2026-03-25T09:00:00Z', type: 'story_start', agent: 'dev', story: 'S1' },
          { timestamp: '2026-03-25T10:00:00Z', type: 'story_complete', agent: 'dev', story: 'S1' },
        ],
      };

      const m = computeSessionMetrics(state);
      expect(m.stories.started).toBe(1);
      expect(m.stories.completed).toBe(1);
      expect(m.stories.completion_rate).toBe(1);
    });

    test('computes QA pass rate from qa_gate events', () => {
      const state = {
        session: { id: 'test-qa', started: '2026-03-25T09:00:00Z', project: 'test' },
        events: [
          { timestamp: '2026-03-25T09:00:00Z', type: 'qa_gate', agent: 'qa', verdict: 'PASS' },
          { timestamp: '2026-03-25T09:30:00Z', type: 'qa_gate', agent: 'qa', verdict: 'PASS' },
          { timestamp: '2026-03-25T10:00:00Z', type: 'qa_gate', agent: 'qa', verdict: 'FAIL' },
        ],
      };

      const m = computeSessionMetrics(state);
      expect(m.qa.total_gates).toBe(3);
      expect(m.qa.passed).toBe(2);
      expect(m.qa.failed).toBe(1);
      expect(m.qa.pass_rate).toBeCloseTo(0.667, 2);
    });

    test('handles zero QA gate events', () => {
      const state = {
        session: { id: 'test-no-qa', started: '2026-03-25T09:00:00Z', project: 'test' },
        events: [
          { timestamp: '2026-03-25T09:00:00Z', type: 'periodic', agent: 'dev', prompt_count: 5 },
        ],
      };

      const m = computeSessionMetrics(state);
      expect(m.qa.total_gates).toBe(0);
      expect(m.qa.pass_rate).toBe(0);
    });

    test('handles all QA pass and all QA fail', () => {
      const allPass = {
        session: { id: 'qa-all-pass', started: '2026-03-25T09:00:00Z', project: 'test' },
        events: [
          { timestamp: '2026-03-25T09:00:00Z', type: 'qa_gate', agent: 'qa', verdict: 'PASS' },
          { timestamp: '2026-03-25T10:00:00Z', type: 'qa_gate', agent: 'qa', verdict: 'PASS' },
        ],
      };
      expect(computeSessionMetrics(allPass).qa.pass_rate).toBe(1);

      const allFail = {
        session: { id: 'qa-all-fail', started: '2026-03-25T09:00:00Z', project: 'test' },
        events: [
          { timestamp: '2026-03-25T09:00:00Z', type: 'qa_gate', agent: 'qa', verdict: 'FAIL' },
          { timestamp: '2026-03-25T10:00:00Z', type: 'qa_gate', agent: 'qa', verdict: 'FAIL' },
        ],
      };
      expect(computeSessionMetrics(allFail).qa.pass_rate).toBe(0);
    });

    test('counts commit events', () => {
      const state = {
        session: { id: 'test-commits', started: '2026-03-25T09:00:00Z', project: 'test' },
        events: [
          { timestamp: '2026-03-25T09:00:00Z', type: 'commit', agent: 'dev', commit_hash: 'abc123' },
          { timestamp: '2026-03-25T10:00:00Z', type: 'commit', agent: 'dev', commit_hash: 'def456' },
          { timestamp: '2026-03-25T11:00:00Z', type: 'commit', agent: 'dev', commit_hash: 'ghi789' },
        ],
      };

      const m = computeSessionMetrics(state);
      expect(m.commits).toBe(3);
    });

    test('handles zero commits', () => {
      const state = {
        session: { id: 'test-no-commits', started: '2026-03-25T09:00:00Z', project: 'test' },
        events: [
          { timestamp: '2026-03-25T09:00:00Z', type: 'periodic', agent: 'dev' },
        ],
      };

      const m = computeSessionMetrics(state);
      expect(m.commits).toBe(0);
    });

    test('computes average agent duration (single agent)', () => {
      const state = {
        session: { id: 'test-dur', started: '2026-03-25T09:00:00Z', project: 'test' },
        events: [
          { timestamp: '2026-03-25T09:00:00Z', type: 'agent_switch', agent: 'dev' },
          { timestamp: '2026-03-25T11:00:00Z', type: 'periodic', agent: 'dev' },
        ],
      };

      const m = computeSessionMetrics(state);
      // 2 hours = 120 minutes
      expect(m.avg_agent_duration_minutes).toBe(120);
    });

    test('computes average agent duration (multiple agents)', () => {
      const state = {
        session: { id: 'test-multi-dur', started: '2026-03-25T09:00:00Z', project: 'test' },
        events: [
          { timestamp: '2026-03-25T09:00:00Z', type: 'agent_switch', agent: 'sm' },
          { timestamp: '2026-03-25T10:00:00Z', type: 'periodic', agent: 'sm' },
          // sm: 1h = 60min
          { timestamp: '2026-03-25T10:00:00Z', type: 'agent_switch', agent: 'dev' },
          { timestamp: '2026-03-25T13:00:00Z', type: 'periodic', agent: 'dev' },
          // dev: 3h = 180min
        ],
      };

      const m = computeSessionMetrics(state);
      // avg = (60 + 180) / 2 = 120
      expect(m.avg_agent_duration_minutes).toBe(120);
    });

    test('handles no agents (no timestamp-bearing events)', () => {
      const state = {
        session: { id: 'test-no-agents', started: '2026-03-25T09:00:00Z', project: 'test' },
        events: [
          { type: 'periodic', prompt_count: 5 },
        ],
      };

      const m = computeSessionMetrics(state);
      expect(m.avg_agent_duration_minutes).toBe(0);
    });

    test('extracts date from session header', () => {
      const state = {
        session: { id: 'test-date', started: '2026-03-25T09:00:00Z', project: 'aios-core' },
        events: [
          { timestamp: '2026-03-25T09:00:00Z', type: 'periodic', agent: 'dev', prompt_count: 5 },
        ],
      };

      const m = computeSessionMetrics(state);
      expect(m.date).toBe('2026-03-25');
      expect(m.session_id).toBe('test-date');
      expect(m.project).toBe('aios-core');
    });
  });

  // --- aggregateHistoricalMetrics ---

  describe('aggregateHistoricalMetrics()', () => {
    test('returns empty aggregation for null/empty input', () => {
      const a1 = aggregateHistoricalMetrics(null);
      expect(a1.sessions_analyzed).toBe(0);

      const a2 = aggregateHistoricalMetrics([]);
      expect(a2.sessions_analyzed).toBe(0);
    });

    test('aggregates single session correctly', () => {
      const states = [
        {
          session: { id: 's1', started: '2026-03-25T09:00:00Z', project: 'test' },
          events: [
            { timestamp: '2026-03-25T09:00:00Z', type: 'periodic', agent: 'dev' },
            { timestamp: '2026-03-25T10:00:00Z', type: 'periodic', agent: 'dev' },
            { timestamp: '2026-03-25T10:30:00Z', type: 'story_start', agent: 'dev', story: 'S1' },
            { timestamp: '2026-03-25T11:00:00Z', type: 'story_complete', agent: 'dev', story: 'S1' },
            { timestamp: '2026-03-25T11:30:00Z', type: 'commit', agent: 'dev' },
          ],
        },
      ];

      const a = aggregateHistoricalMetrics(states);
      expect(a.sessions_analyzed).toBe(1);
      expect(a.avg_prompts_per_session).toBe(10); // 2 periodic * 5
      expect(a.stories.total_started).toBe(1);
      expect(a.stories.total_completed).toBe(1);
      expect(a.avg_commits_per_session).toBe(1);
    });

    test('aggregates multiple sessions with averages', () => {
      const states = [
        {
          session: { id: 's1', started: '2026-03-24T09:00:00Z', project: 'test' },
          events: [
            { timestamp: '2026-03-24T09:00:00Z', type: 'periodic', agent: 'dev' },
            { timestamp: '2026-03-24T10:00:00Z', type: 'commit', agent: 'dev' },
            { timestamp: '2026-03-24T11:00:00Z', type: 'commit', agent: 'dev' },
          ],
        },
        {
          session: { id: 's2', started: '2026-03-25T09:00:00Z', project: 'test' },
          events: [
            { timestamp: '2026-03-25T09:00:00Z', type: 'periodic', agent: 'dev' },
            { timestamp: '2026-03-25T09:30:00Z', type: 'periodic', agent: 'dev' },
            { timestamp: '2026-03-25T10:00:00Z', type: 'periodic', agent: 'dev' },
            { timestamp: '2026-03-25T11:00:00Z', type: 'commit', agent: 'dev' },
            { timestamp: '2026-03-25T11:30:00Z', type: 'commit', agent: 'dev' },
            { timestamp: '2026-03-25T12:00:00Z', type: 'commit', agent: 'dev' },
            { timestamp: '2026-03-25T12:30:00Z', type: 'commit', agent: 'dev' },
          ],
        },
      ];

      const a = aggregateHistoricalMetrics(states);
      expect(a.sessions_analyzed).toBe(2);
      // Session 1: 1 periodic * 5 = 5, Session 2: 3 periodic * 5 = 15, avg = 10
      expect(a.avg_prompts_per_session).toBe(10);
      // Session 1: 2 commits, Session 2: 4 commits, avg = 3.0
      expect(a.avg_commits_per_session).toBe(3);
      // Date range
      expect(a.date_range.start).toBe('2026-03-24');
      expect(a.date_range.end).toBe('2026-03-25');
    });

    test('computes correct average QA pass rate across sessions', () => {
      const states = [
        {
          session: { id: 's1', started: '2026-03-24T09:00:00Z', project: 'test' },
          events: [
            { timestamp: '2026-03-24T09:00:00Z', type: 'qa_gate', agent: 'qa', verdict: 'PASS' },
            { timestamp: '2026-03-24T10:00:00Z', type: 'qa_gate', agent: 'qa', verdict: 'PASS' },
          ],
        },
        {
          session: { id: 's2', started: '2026-03-25T09:00:00Z', project: 'test' },
          events: [
            { timestamp: '2026-03-25T09:00:00Z', type: 'qa_gate', agent: 'qa', verdict: 'PASS' },
            { timestamp: '2026-03-25T10:00:00Z', type: 'qa_gate', agent: 'qa', verdict: 'FAIL' },
          ],
        },
      ];

      const a = aggregateHistoricalMetrics(states);
      // Session 1: 100%, Session 2: 50%, avg = 75%
      expect(a.qa.avg_pass_rate).toBe(0.75);
    });
  });

  // --- calculateTrend ---

  describe('calculateTrend()', () => {
    test('returns stable arrow when values are within 10%', () => {
      expect(calculateTrend(100, 100)).toBe('\u2192');
      expect(calculateTrend(105, 100)).toBe('\u2192');
      expect(calculateTrend(95, 100)).toBe('\u2192');
    });

    test('returns improving arrow when current exceeds historical + 10%', () => {
      expect(calculateTrend(120, 100)).toBe('\u2191');
      expect(calculateTrend(50, 40)).toBe('\u2191');
    });

    test('returns declining arrow when current below historical - 10%', () => {
      expect(calculateTrend(80, 100)).toBe('\u2193');
      expect(calculateTrend(30, 40)).toBe('\u2193');
    });

    test('handles inverted metrics (lower is better)', () => {
      // Current is higher than avg by >10%: for inverted, this is declining
      expect(calculateTrend(120, 100, true)).toBe('\u2193');
      // Current is lower than avg by >10%: for inverted, this is improving
      expect(calculateTrend(80, 100, true)).toBe('\u2191');
    });

    test('handles edge case: both zero', () => {
      expect(calculateTrend(0, 0)).toBe('\u2192');
    });

    test('handles edge case: historical is zero, current non-zero', () => {
      expect(calculateTrend(10, 0)).toBe('\u2191');
      expect(calculateTrend(10, 0, true)).toBe('\u2193');
    });
  });

  // --- formatMetricsForCLI ---

  describe('formatMetricsForCLI()', () => {
    test('returns fallback for null metrics', () => {
      expect(formatMetricsForCLI(null)).toBe('No metrics available.');
    });

    test('formats metrics as CLI table', () => {
      const metrics = {
        total_prompts: 42,
        prompts_per_agent: { dev: 25, qa: 10, sm: 7 },
        stories: { started: 2, completed: 1, completion_rate: 0.5 },
        qa: { total_gates: 3, passed: 2, failed: 1, pass_rate: 0.667 },
        commits: 5,
        avg_agent_duration_minutes: 180,
      };

      const output = formatMetricsForCLI(metrics);
      expect(output).toContain('Metrics:');
      expect(output).toContain('@dev');
      expect(output).toContain('25');
      expect(output).toContain('@qa');
      expect(output).toContain('Stories Started');
      expect(output).toContain('Completion Rate');
      expect(output).toContain('50%');
      expect(output).toContain('QA Pass Rate');
      expect(output).toContain('2/3 (67%)');
      expect(output).toContain('Commits');
      expect(output).toContain('5');
      expect(output).toContain('3h');
    });

    test('shows N/A for QA when no gates', () => {
      const metrics = {
        total_prompts: 10,
        prompts_per_agent: {},
        stories: { started: 0, completed: 0, completion_rate: 0 },
        qa: { total_gates: 0, passed: 0, failed: 0, pass_rate: 0 },
        commits: 0,
        avg_agent_duration_minutes: 0,
      };

      const output = formatMetricsForCLI(metrics);
      expect(output).toContain('N/A');
    });
  });

  // --- formatDurationMinutes ---

  describe('formatDurationMinutes()', () => {
    test('returns "<1m" for zero or negative', () => {
      expect(formatDurationMinutes(0)).toBe('<1m');
      expect(formatDurationMinutes(-10)).toBe('<1m');
      expect(formatDurationMinutes(null)).toBe('<1m');
    });

    test('formats minutes only', () => {
      expect(formatDurationMinutes(45)).toBe('45m');
    });

    test('formats hours and minutes', () => {
      expect(formatDurationMinutes(120)).toBe('2h');
      expect(formatDurationMinutes(180)).toBe('3h');
      expect(formatDurationMinutes(150)).toBe('2h 30m');
    });
  });

  // --- saveMetrics / readMetrics ---

  describe('saveMetrics() / readMetrics()', () => {
    test('saves and reads metrics from cache file', () => {
      const metrics = {
        session_id: 'test-cache',
        total_prompts: 42,
        commits: 5,
      };

      const savedPath = saveMetrics(metrics, tmpDir);
      expect(fs.existsSync(savedPath)).toBe(true);

      const loaded = readMetrics(tmpDir);
      expect(loaded).not.toBeNull();
      expect(loaded.session_id).toBe('test-cache');
      expect(loaded.total_prompts).toBe(42);
    });

    test('readMetrics returns null when file does not exist', () => {
      const loaded = readMetrics(tmpDir);
      expect(loaded).toBeNull();
    });

    test('saves with JSON indentation (readable)', () => {
      saveMetrics({ test: true }, tmpDir);
      const raw = fs.readFileSync(getMetricsPath(tmpDir), 'utf8');
      expect(raw).toContain('\n'); // Indented
      expect(raw).toContain('  '); // Spaces
    });
  });

  // --- getMetricsPath ---

  describe('getMetricsPath()', () => {
    test('returns correct path', () => {
      const p = getMetricsPath('/tmp/test');
      expect(p).toBe(path.join('/tmp/test', '.aiox', 'current-session', 'metrics.json'));
    });
  });
});

// --- metrics-trend command ---

describe('Metrics Trend Command (Story AIOX-HO-2.4)', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = path.join(
      os.tmpdir(),
      `test-metrics-trend-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    );
    fs.mkdirSync(tmpDir, { recursive: true });

    // Create the module directory structure and copy all required modules
    const handoffDir = path.join(tmpDir, '.claude', 'lib', 'handoff');
    const commandsDir = path.join(handoffDir, 'commands');
    fs.mkdirSync(commandsDir, { recursive: true });

    const srcBase = path.resolve(__dirname, '../../.claude/lib/handoff');

    fs.copyFileSync(
      path.join(srcBase, 'session-state.js'),
      path.join(handoffDir, 'session-state.js'),
    );
    fs.copyFileSync(
      path.join(srcBase, 'metrics.js'),
      path.join(handoffDir, 'metrics.js'),
    );
    fs.copyFileSync(
      path.join(srcBase, 'commands', 'session-history.js'),
      path.join(commandsDir, 'session-history.js'),
    );
    fs.copyFileSync(
      path.join(srcBase, 'commands', 'metrics-trend.js'),
      path.join(commandsDir, 'metrics-trend.js'),
    );
  });

  afterEach(() => {
    // Clear require cache for all modules in tmpDir
    Object.keys(require.cache).forEach((key) => {
      if (key.includes(tmpDir) || key.includes('test-metrics-trend')) {
        delete require.cache[key];
      }
    });

    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch (_) {
      // Ignore
    }
  });

  function createArchivedState(project, filename, state) {
    const archiveDir = path.join(tmpDir, '.aiox', 'session-history', project);
    fs.mkdirSync(archiveDir, { recursive: true });
    const filePath = path.join(archiveDir, filename);
    fs.writeFileSync(filePath, serializeState(state), 'utf8');
    return filePath;
  }

  function setupCurrentSession(state) {
    const ssPath = path.join(tmpDir, '.aiox', 'current-session');
    fs.mkdirSync(ssPath, { recursive: true });

    const ssModule = require(path.join(tmpDir, '.claude', 'lib', 'handoff', 'session-state'));
    const yaml = ssModule.serializeState(state);
    fs.writeFileSync(path.join(ssPath, 'state.yaml'), yaml, 'utf8');
  }

  test('returns usage message when project is missing', () => {
    const { generateMetricsTrend } = require(
      path.join(tmpDir, '.claude', 'lib', 'handoff', 'commands', 'metrics-trend'),
    );

    const result = generateMetricsTrend('');
    expect(result).toContain('Usage');
    expect(result).toContain('metrics-trend');
  });

  test('returns empty result when no archived sessions exist', () => {
    setupCurrentSession({
      session: { id: 'cur', started: '2026-03-25T09:00:00Z', project: 'test' },
      events: [
        { timestamp: '2026-03-25T09:00:00Z', type: 'periodic', agent: 'dev', prompt_count: 5 },
      ],
    });

    const { generateMetricsTrend } = require(
      path.join(tmpDir, '.claude', 'lib', 'handoff', 'commands', 'metrics-trend'),
    );

    const result = generateMetricsTrend('test-project', { projectRoot: tmpDir });
    expect(result).toContain('Sessions Analyzed: 0');
    expect(result).toContain('No archived sessions found');
  });

  test('generates trend report with archived sessions', () => {
    // Current session
    setupCurrentSession({
      session: { id: 'current', started: '2026-03-25T09:00:00Z', project: 'aios-core' },
      events: [
        { timestamp: '2026-03-25T09:00:00Z', type: 'periodic', agent: 'dev' },
        { timestamp: '2026-03-25T09:30:00Z', type: 'periodic', agent: 'dev' },
        { timestamp: '2026-03-25T10:00:00Z', type: 'story_start', agent: 'dev', story: 'S1' },
        { timestamp: '2026-03-25T11:00:00Z', type: 'story_complete', agent: 'dev', story: 'S1' },
        { timestamp: '2026-03-25T11:30:00Z', type: 'commit', agent: 'dev' },
        { timestamp: '2026-03-25T12:00:00Z', type: 'qa_gate', agent: 'qa', verdict: 'PASS' },
      ],
    });

    // Archived sessions
    createArchivedState('aios-core', 'state-2026-03-24T10-00-00-000Z.yaml', {
      session: { id: 'hist-1', started: '2026-03-24T09:00:00Z', project: 'aios-core' },
      events: [
        { timestamp: '2026-03-24T09:00:00Z', type: 'periodic', agent: 'dev' },
        { timestamp: '2026-03-24T10:00:00Z', type: 'story_start', agent: 'dev', story: 'H1' },
        { timestamp: '2026-03-24T11:00:00Z', type: 'story_complete', agent: 'dev', story: 'H1' },
        { timestamp: '2026-03-24T12:00:00Z', type: 'commit', agent: 'dev' },
        { timestamp: '2026-03-24T13:00:00Z', type: 'qa_gate', agent: 'qa', verdict: 'PASS' },
      ],
    });

    const { generateMetricsTrend } = require(
      path.join(tmpDir, '.claude', 'lib', 'handoff', 'commands', 'metrics-trend'),
    );

    const result = generateMetricsTrend('aios-core', { projectRoot: tmpDir });
    expect(result).toContain('Productivity Metrics Trend -- aios-core');
    expect(result).toContain('Sessions Analyzed: 1');
    expect(result).toContain('Prompts per Session');
    expect(result).toContain('Stories Completed');
    expect(result).toContain('QA Pass Rate');
    expect(result).toContain('Commits per Session');
    expect(result).toContain('Trend Indicators');
  });

  test('respects --last N option', () => {
    // Create 5 archived sessions
    for (let i = 1; i <= 5; i++) {
      createArchivedState(
        'aios-core',
        `state-2026-03-${String(20 + i).padStart(2, '0')}T10-00-00-000Z.yaml`,
        {
          session: {
            id: `sess-${i}`,
            started: `2026-03-${20 + i}T10:00:00Z`,
            project: 'aios-core',
          },
          events: [
            {
              timestamp: `2026-03-${20 + i}T10:00:00Z`,
              type: 'periodic',
              agent: 'dev',
            },
          ],
        },
      );
    }

    setupCurrentSession({
      session: { id: 'cur', started: '2026-03-25T09:00:00Z', project: 'aios-core' },
      events: [
        { timestamp: '2026-03-25T09:00:00Z', type: 'periodic', agent: 'dev' },
      ],
    });

    const { generateMetricsTrend } = require(
      path.join(tmpDir, '.claude', 'lib', 'handoff', 'commands', 'metrics-trend'),
    );

    // Only last 3
    const result = generateMetricsTrend('aios-core', { projectRoot: tmpDir, last: 3 });
    expect(result).toContain('Last 3 sessions');
    expect(result).toContain('Sessions Analyzed: 3');
  });

  test('DEFAULT_SESSIONS is 20', () => {
    const { DEFAULT_SESSIONS } = require(
      path.join(tmpDir, '.claude', 'lib', 'handoff', 'commands', 'metrics-trend'),
    );
    expect(DEFAULT_SESSIONS).toBe(20);
  });
});

// --- session-report metrics integration ---

describe('Session Report Metrics Integration (Story AIOX-HO-2.4)', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = path.join(
      os.tmpdir(),
      `test-report-metrics-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    );
    fs.mkdirSync(tmpDir, { recursive: true });

    // Create the module directory structure
    const handoffDir = path.join(tmpDir, '.claude', 'lib', 'handoff');
    const commandsDir = path.join(handoffDir, 'commands');
    const formattersDir = path.join(handoffDir, 'formatters');
    const aggregatorsDir = path.join(handoffDir, 'aggregators');
    fs.mkdirSync(commandsDir, { recursive: true });
    fs.mkdirSync(formattersDir, { recursive: true });
    fs.mkdirSync(aggregatorsDir, { recursive: true });

    const srcBase = path.resolve(__dirname, '../../.claude/lib/handoff');

    fs.copyFileSync(
      path.join(srcBase, 'session-state.js'),
      path.join(handoffDir, 'session-state.js'),
    );
    fs.copyFileSync(
      path.join(srcBase, 'agent-activity.js'),
      path.join(handoffDir, 'agent-activity.js'),
    );
    fs.copyFileSync(
      path.join(srcBase, 'metrics.js'),
      path.join(handoffDir, 'metrics.js'),
    );
    fs.copyFileSync(
      path.join(srcBase, 'formatters', 'event-timeline.js'),
      path.join(formattersDir, 'event-timeline.js'),
    );
    fs.copyFileSync(
      path.join(srcBase, 'aggregators', 'story-details.js'),
      path.join(aggregatorsDir, 'story-details.js'),
    );
    fs.copyFileSync(
      path.join(srcBase, 'commands', 'session-report.js'),
      path.join(commandsDir, 'session-report.js'),
    );
  });

  afterEach(() => {
    Object.keys(require.cache).forEach((key) => {
      if (key.includes(tmpDir) || key.includes('test-report-metrics')) {
        delete require.cache[key];
      }
    });

    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch (_) {
      // Ignore
    }
  });

  function setupSessionState(state) {
    const ssPath = path.join(tmpDir, '.aiox', 'current-session');
    fs.mkdirSync(ssPath, { recursive: true });

    const ssModule = require(path.join(tmpDir, '.claude', 'lib', 'handoff', 'session-state'));
    const yaml = ssModule.serializeState(state);
    fs.writeFileSync(path.join(ssPath, 'state.yaml'), yaml, 'utf8');
  }

  test('session report includes metrics section', () => {
    const state = {
      session: { id: 'test-rpt', started: '2026-03-25T09:00:00Z', project: 'aios-core' },
      events: [
        { timestamp: '2026-03-25T09:00:00Z', type: 'agent_switch', agent: 'dev' },
        { timestamp: '2026-03-25T09:30:00Z', type: 'periodic', agent: 'dev', prompt_count: 5 },
        { timestamp: '2026-03-25T10:00:00Z', type: 'story_start', agent: 'dev', story: 'HO-2.4' },
        { timestamp: '2026-03-25T11:00:00Z', type: 'commit', agent: 'dev', commit_hash: 'abc' },
        { timestamp: '2026-03-25T12:00:00Z', type: 'periodic', agent: 'dev', prompt_count: 10 },
      ],
    };

    setupSessionState(state);

    const { generateReport } = require(
      path.join(tmpDir, '.claude', 'lib', 'handoff', 'commands', 'session-report'),
    );
    const report = generateReport(tmpDir);

    // Should contain existing sections
    expect(report).toContain('Session Report -- aios-core');
    expect(report).toContain('Agent Activity:');

    // Should contain new Metrics section
    expect(report).toContain('Metrics:');
    expect(report).toContain('Prompts per Agent (@dev)');
    expect(report).toContain('Stories Started');
    expect(report).toContain('Commits');
    expect(report).toContain('Metrics cached at');
  });

  test('session report works without metrics module (graceful fallback)', () => {
    // Create a state but do NOT copy the metrics module -- should still generate base report
    const handoffDir = path.join(tmpDir, '.claude', 'lib', 'handoff');
    // Remove the metrics.js if it was copied
    try {
      fs.unlinkSync(path.join(handoffDir, 'metrics.js'));
    } catch (_) {
      // May not exist
    }

    const state = {
      session: { id: 'test-no-metrics', started: '2026-03-25T09:00:00Z', project: 'test' },
      events: [
        { timestamp: '2026-03-25T09:00:00Z', type: 'agent_switch', agent: 'dev' },
        { timestamp: '2026-03-25T10:00:00Z', type: 'periodic', agent: 'dev', prompt_count: 5 },
      ],
    };

    setupSessionState(state);

    // Clear cache to ensure fresh require
    Object.keys(require.cache).forEach((key) => {
      if (key.includes(tmpDir)) delete require.cache[key];
    });

    const { generateReport } = require(
      path.join(tmpDir, '.claude', 'lib', 'handoff', 'commands', 'session-report'),
    );
    const report = generateReport(tmpDir);

    // Should still have base report
    expect(report).toContain('Agent Activity:');
    // Should NOT have Metrics section
    expect(report).not.toContain('Metrics:');
  });
});

// --- Performance ---

describe('Metrics Performance (Story AIOX-HO-2.4)', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = path.join(
      os.tmpdir(),
      `test-metrics-perf-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    );
    fs.mkdirSync(tmpDir, { recursive: true });

    // Copy modules for metrics-trend command
    const handoffDir = path.join(tmpDir, '.claude', 'lib', 'handoff');
    const commandsDir = path.join(handoffDir, 'commands');
    fs.mkdirSync(commandsDir, { recursive: true });

    const srcBase = path.resolve(__dirname, '../../.claude/lib/handoff');
    fs.copyFileSync(
      path.join(srcBase, 'session-state.js'),
      path.join(handoffDir, 'session-state.js'),
    );
    fs.copyFileSync(
      path.join(srcBase, 'metrics.js'),
      path.join(handoffDir, 'metrics.js'),
    );
    fs.copyFileSync(
      path.join(srcBase, 'commands', 'session-history.js'),
      path.join(commandsDir, 'session-history.js'),
    );
    fs.copyFileSync(
      path.join(srcBase, 'commands', 'metrics-trend.js'),
      path.join(commandsDir, 'metrics-trend.js'),
    );
  });

  afterEach(() => {
    Object.keys(require.cache).forEach((key) => {
      if (key.includes(tmpDir) || key.includes('test-metrics-perf')) {
        delete require.cache[key];
      }
    });

    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch (_) {
      // Ignore
    }
  });

  test('computes metrics for 20 archived sessions in under 1 second', () => {
    const ssModule = require(path.join(tmpDir, '.claude', 'lib', 'handoff', 'session-state'));

    // Create 20 archived sessions with realistic event counts
    for (let i = 0; i < 20; i++) {
      const day = String((i % 28) + 1).padStart(2, '0');
      const month = String(Math.floor(i / 28) + 3).padStart(2, '0');

      const events = [];
      for (let e = 0; e < 15; e++) {
        const types = ['periodic', 'agent_switch', 'story_start', 'commit', 'qa_gate', 'story_complete'];
        events.push({
          timestamp: `2026-${month}-${day}T${String(8 + e).padStart(2, '0')}:00:00Z`,
          type: types[e % types.length],
          agent: e % 2 === 0 ? 'dev' : 'qa',
          prompt_count: e % 3 === 0 ? (e + 1) * 5 : undefined,
          story: e % 4 === 0 ? `STORY-${i}-${e}` : undefined,
          verdict: types[e % types.length] === 'qa_gate' ? (e % 2 === 0 ? 'PASS' : 'FAIL') : undefined,
          commit_hash: types[e % types.length] === 'commit' ? `hash-${i}-${e}` : undefined,
        });
      }

      const archiveDir = path.join(tmpDir, '.aiox', 'session-history', 'perf-test');
      fs.mkdirSync(archiveDir, { recursive: true });
      const filePath = path.join(
        archiveDir,
        `state-2026-${month}-${day}T${String(i).padStart(2, '0')}-00-00-000Z.yaml`,
      );
      fs.writeFileSync(filePath, ssModule.serializeState({
        session: { id: `perf-${i}`, started: `2026-${month}-${day}T08:00:00Z`, project: 'perf-test' },
        events,
      }), 'utf8');
    }

    // Setup current session
    const curPath = path.join(tmpDir, '.aiox', 'current-session');
    fs.mkdirSync(curPath, { recursive: true });
    fs.writeFileSync(
      path.join(curPath, 'state.yaml'),
      ssModule.serializeState({
        session: { id: 'cur', started: '2026-03-25T09:00:00Z', project: 'perf-test' },
        events: [
          { timestamp: '2026-03-25T09:00:00Z', type: 'periodic', agent: 'dev' },
        ],
      }),
      'utf8',
    );

    const { generateMetricsTrend } = require(
      path.join(tmpDir, '.claude', 'lib', 'handoff', 'commands', 'metrics-trend'),
    );

    const start = Date.now();
    const result = generateMetricsTrend('perf-test', { projectRoot: tmpDir });
    const elapsed = Date.now() - start;

    expect(elapsed).toBeLessThan(1000); // <1s
    expect(result).toContain('Productivity Metrics Trend -- perf-test');
    expect(result).toContain('Sessions Analyzed:');
  });
});
