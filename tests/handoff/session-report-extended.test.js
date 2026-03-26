'use strict';

/**
 * Integration Tests for Extended Session Report (Story AIOX-HO-2.3)
 *
 * Tests that session-report.js correctly integrates:
 * - Agent Activity table (Story 2.1)
 * - Story Details table (Story 2.3)
 * - Event Timeline (Story 2.3)
 *
 * @see Story AIOX-HO-2.3
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

describe('Extended Session Report Integration (Story AIOX-HO-2.3)', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = path.join(os.tmpdir(), `test-session-report-ext-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    fs.mkdirSync(tmpDir, { recursive: true });

    // Create the module directory structure
    const handoffDir = path.join(tmpDir, '.claude', 'lib', 'handoff');
    const commandsDir = path.join(handoffDir, 'commands');
    const formattersDir = path.join(handoffDir, 'formatters');
    const aggregatorsDir = path.join(handoffDir, 'aggregators');
    fs.mkdirSync(commandsDir, { recursive: true });
    fs.mkdirSync(formattersDir, { recursive: true });
    fs.mkdirSync(aggregatorsDir, { recursive: true });

    // Copy the actual modules to the temp directory
    const srcBase = path.resolve(__dirname, '../../.claude/lib/handoff');

    fs.copyFileSync(
      path.join(srcBase, 'session-state.js'),
      path.join(handoffDir, 'session-state.js')
    );
    fs.copyFileSync(
      path.join(srcBase, 'agent-activity.js'),
      path.join(handoffDir, 'agent-activity.js')
    );
    fs.copyFileSync(
      path.join(srcBase, 'formatters', 'event-timeline.js'),
      path.join(formattersDir, 'event-timeline.js')
    );
    fs.copyFileSync(
      path.join(srcBase, 'aggregators', 'story-details.js'),
      path.join(aggregatorsDir, 'story-details.js')
    );
    fs.copyFileSync(
      path.join(srcBase, 'commands', 'session-report.js'),
      path.join(commandsDir, 'session-report.js')
    );
  });

  afterEach(() => {
    // Clear require cache for all modules in tmpDir
    Object.keys(require.cache).forEach((key) => {
      if (key.includes(tmpDir) || key.includes('test-session-report-ext')) {
        delete require.cache[key];
      }
    });

    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch (_) {
      // Ignore cleanup errors
    }
  });

  function setupSessionState(state) {
    const ssPath = path.join(tmpDir, '.aiox', 'current-session');
    fs.mkdirSync(ssPath, { recursive: true });

    const ssModule = require(path.join(tmpDir, '.claude', 'lib', 'handoff', 'session-state'));
    const yaml = ssModule.serializeState(state);
    fs.writeFileSync(path.join(ssPath, 'state.yaml'), yaml, 'utf8');
  }

  test('generates report with agent activity, story details, and event timeline', () => {
    const state = {
      session: { id: 'test-full', started: '2026-03-25T09:00:00Z', project: 'aios-core' },
      events: [
        { timestamp: '2026-03-25T09:00:00Z', type: 'agent_switch', agent: 'sm', story: 'AIOX-HO-2.1' },
        { timestamp: '2026-03-25T09:30:00Z', type: 'story_start', agent: 'dev', story: 'AIOX-HO-2.1', files_modified: 3 },
        { timestamp: '2026-03-25T10:00:00Z', type: 'periodic', agent: 'dev', story: 'AIOX-HO-2.1', prompt_count: 10, files_modified: 5 },
        { timestamp: '2026-03-25T11:00:00Z', type: 'story_complete', agent: 'dev', story: 'AIOX-HO-2.1' },
        { timestamp: '2026-03-25T11:30:00Z', type: 'story_start', agent: 'dev', story: 'AIOX-HO-2.2', files_modified: 2 },
        { timestamp: '2026-03-25T12:00:00Z', type: 'periodic', agent: 'dev', story: 'AIOX-HO-2.2', prompt_count: 20 },
        { timestamp: '2026-03-25T12:30:00Z', type: 'agent_switch', agent: 'qa', story: 'AIOX-HO-2.2' },
      ],
    };

    setupSessionState(state);

    const { generateReport } = require(path.join(tmpDir, '.claude', 'lib', 'handoff', 'commands', 'session-report'));
    const report = generateReport(tmpDir);

    // Should contain base agent activity section (Story 2.1)
    expect(report).toContain('Session Report -- aios-core');
    expect(report).toContain('Agent Activity:');
    expect(report).toContain('@dev');

    // Should contain Story Details section (Story 2.3)
    expect(report).toContain('Story Details:');
    expect(report).toContain('AIOX-HO-2.1');
    expect(report).toContain('AIOX-HO-2.2');
    expect(report).toContain('Done'); // HO-2.1 has story_complete
    expect(report).toContain('InProgress'); // HO-2.2 does not

    // Should contain Event Timeline section (Story 2.3)
    expect(report).toContain('Recent Events (Last 10):');
    expect(report).toContain('[12:30]');
    expect(report).toContain('@qa');
    expect(report).toContain('agent_switch');
  });

  test('returns base report when no events have story field', () => {
    const state = {
      session: { id: 'test-no-story', started: '2026-03-25T09:00:00Z', project: 'aios-core' },
      events: [
        { timestamp: '2026-03-25T09:00:00Z', type: 'agent_switch', agent: 'dev' },
        { timestamp: '2026-03-25T10:00:00Z', type: 'periodic', agent: 'dev', prompt_count: 5 },
      ],
    };

    setupSessionState(state);

    const { generateReport } = require(path.join(tmpDir, '.claude', 'lib', 'handoff', 'commands', 'session-report'));
    const report = generateReport(tmpDir);

    // Should have agent activity
    expect(report).toContain('Agent Activity:');
    expect(report).toContain('@dev');

    // Should NOT have Story Details (no stories)
    expect(report).not.toContain('Story Details:');

    // Should have event timeline
    expect(report).toContain('Recent Events (Last 10):');
  });

  test('returns error message when no session state exists', () => {
    const { generateReport } = require(path.join(tmpDir, '.claude', 'lib', 'handoff', 'commands', 'session-report'));
    const report = generateReport(tmpDir);

    expect(report).toContain('No events recorded');
  });
});
