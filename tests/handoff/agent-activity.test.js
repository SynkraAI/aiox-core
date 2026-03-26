'use strict';

/**
 * Tests for Agent Activity Summary Module
 *
 * Tests generateAgentSummary(), formatSummaryForCLI(),
 * formatSummaryForHandoff(), and formatSpan().
 *
 * @see Story AIOX-HO-2.1
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const {
  generateAgentSummary,
  formatSummaryForCLI,
  formatSummaryForHandoff,
  formatSpan,
  MAX_HANDOFF_LINES,
} = require('../../.claude/lib/handoff/agent-activity');

const crossSession = require('../../.claude/lib/handoff/cross-session-handoff');

// Mock child_process for cross-session-handoff (it requires execSync)
jest.mock('child_process', () => ({
  execSync: jest.fn(),
}));

describe('Agent Activity Module (Story AIOX-HO-2.1)', () => {
  // --- formatSpan ---

  describe('formatSpan()', () => {
    test('returns "<1m" for zero or negative milliseconds', () => {
      expect(formatSpan(0)).toBe('<1m');
      expect(formatSpan(-1000)).toBe('<1m');
      expect(formatSpan(null)).toBe('<1m');
      expect(formatSpan(undefined)).toBe('<1m');
    });

    test('returns "<1m" for durations under 60 seconds', () => {
      expect(formatSpan(30000)).toBe('<1m');
      expect(formatSpan(59999)).toBe('<1m');
    });

    test('returns "~Xm" for minute-range durations', () => {
      expect(formatSpan(60000)).toBe('~1m');
      expect(formatSpan(300000)).toBe('~5m');
      expect(formatSpan(2700000)).toBe('~45m');
    });

    test('returns "~Xh Ym" for hour-range durations', () => {
      expect(formatSpan(3600000)).toBe('~1h');
      expect(formatSpan(8100000)).toBe('~2h 15m');
      expect(formatSpan(7200000)).toBe('~2h');
    });
  });

  // --- generateAgentSummary ---

  describe('generateAgentSummary()', () => {
    test('returns empty array for null/empty session state', () => {
      expect(generateAgentSummary(null)).toEqual([]);
      expect(generateAgentSummary({})).toEqual([]);
      expect(generateAgentSummary({ events: [] })).toEqual([]);
    });

    test('generates summary for a single agent with multiple events', () => {
      const state = {
        session: { id: 'test-1', started: '2026-03-25T10:00:00Z', project: 'aios-core' },
        events: [
          { timestamp: '2026-03-25T10:00:00Z', type: 'agent_switch', agent: 'dev', story: 'HO-2.1' },
          { timestamp: '2026-03-25T10:05:00Z', type: 'story_start', agent: 'dev', story: 'HO-2.1', files_modified: 3 },
          { timestamp: '2026-03-25T12:15:00Z', type: 'periodic', agent: 'dev', prompt_count: 30, files_modified: 10 },
        ],
      };

      const summaries = generateAgentSummary(state);
      expect(summaries).toHaveLength(1);

      const dev = summaries[0];
      expect(dev.agent).toBe('dev');
      expect(dev.stories).toContain('HO-2.1');
      expect(dev.filesModified).toBe(13); // 3 + 10
      expect(dev.events).toBe(3);
      expect(dev.activeSpan).toBe('~2h 15m');
    });

    test('generates summaries for multiple agents sorted by event count', () => {
      const state = {
        session: { id: 'test-2', started: '2026-03-25T10:00:00Z', project: 'test' },
        events: [
          { timestamp: '2026-03-25T10:00:00Z', type: 'agent_switch', agent: 'sm', story: 'HO-2.1' },
          { timestamp: '2026-03-25T10:30:00Z', type: 'agent_switch', agent: 'dev', story: 'HO-2.1' },
          { timestamp: '2026-03-25T10:35:00Z', type: 'story_start', agent: 'dev', story: 'HO-2.1', files_modified: 5 },
          { timestamp: '2026-03-25T11:00:00Z', type: 'periodic', agent: 'dev', prompt_count: 15, files_modified: 8 },
          { timestamp: '2026-03-25T12:00:00Z', type: 'story_complete', agent: 'dev', story: 'HO-2.1', files_modified: 12 },
          { timestamp: '2026-03-25T12:30:00Z', type: 'agent_switch', agent: 'qa', story: 'HO-2.1' },
          { timestamp: '2026-03-25T13:00:00Z', type: 'qa_gate', agent: 'qa', story: 'HO-2.1', verdict: 'PASS' },
        ],
      };

      const summaries = generateAgentSummary(state);
      expect(summaries).toHaveLength(3);

      // dev has 4 events (most), should be first
      expect(summaries[0].agent).toBe('dev');
      expect(summaries[0].events).toBe(4);
      expect(summaries[0].filesModified).toBe(25); // 5 + 8 + 12

      // qa has 2 events
      expect(summaries[1].agent).toBe('qa');
      expect(summaries[1].events).toBe(2);

      // sm has 1 event
      expect(summaries[2].agent).toBe('sm');
      expect(summaries[2].events).toBe(1);
    });

    test('extracts decisions from agent_switch details (non-trivial)', () => {
      const state = {
        session: { id: 'test-3', started: '2026-03-25T10:00:00Z', project: 'test' },
        events: [
          {
            timestamp: '2026-03-25T10:00:00Z',
            type: 'agent_switch',
            agent: 'dev',
            details: 'Use CommonJS for hook compatibility',
          },
          {
            timestamp: '2026-03-25T10:05:00Z',
            type: 'agent_switch',
            agent: 'dev',
            details: 'Switched from @sm to @dev', // This should be filtered out
          },
          {
            timestamp: '2026-03-25T10:10:00Z',
            type: 'agent_switch',
            agent: 'dev',
            details: 'Chose flat YAML over js-yaml dependency',
          },
        ],
      };

      const summaries = generateAgentSummary(state);
      expect(summaries[0].decisions).toHaveLength(2);
      expect(summaries[0].decisions[0]).toBe('Use CommonJS for hook compatibility');
      expect(summaries[0].decisions[1]).toBe('Chose flat YAML over js-yaml dependency');
    });

    test('handles events without agent field gracefully', () => {
      const state = {
        session: { id: 'test-4', started: '2026-03-25T10:00:00Z', project: 'test' },
        events: [
          { timestamp: '2026-03-25T10:00:00Z', type: 'periodic', prompt_count: 5 },
          { timestamp: '2026-03-25T10:05:00Z', type: 'agent_switch', agent: 'dev' },
        ],
      };

      const summaries = generateAgentSummary(state);
      expect(summaries).toHaveLength(1);
      expect(summaries[0].agent).toBe('dev');
    });

    test('deduplicates stories across event types', () => {
      const state = {
        session: { id: 'test-5', started: '2026-03-25T10:00:00Z', project: 'test' },
        events: [
          { timestamp: '2026-03-25T10:00:00Z', type: 'agent_switch', agent: 'dev', story: 'HO-2.1' },
          { timestamp: '2026-03-25T10:05:00Z', type: 'story_start', agent: 'dev', story: 'HO-2.1' },
          { timestamp: '2026-03-25T10:10:00Z', type: 'periodic', agent: 'dev', story: 'HO-2.1' },
          { timestamp: '2026-03-25T10:15:00Z', type: 'story_start', agent: 'dev', story: 'HO-2.2' },
        ],
      };

      const summaries = generateAgentSummary(state);
      expect(summaries[0].stories).toHaveLength(2);
      expect(summaries[0].stories).toContain('HO-2.1');
      expect(summaries[0].stories).toContain('HO-2.2');
    });
  });

  // --- formatSummaryForCLI ---

  describe('formatSummaryForCLI()', () => {
    test('returns informative message for empty summaries', () => {
      expect(formatSummaryForCLI([])).toBe('No agent activity recorded in this session.');
      expect(formatSummaryForCLI(null)).toBe('No agent activity recorded in this session.');
    });

    test('produces formatted CLI table with header and rows', () => {
      const summaries = [
        { agent: 'dev', stories: ['HO-2.1'], filesModified: 12, decisions: ['Use CJS'], activeSpan: '~2h 15m', events: 28 },
        { agent: 'qa', stories: ['HO-2.1'], filesModified: 3, decisions: [], activeSpan: '~45m', events: 5 },
      ];

      const output = formatSummaryForCLI(summaries, { project: 'aios-core', totalPrompts: 42 });

      // Verify header
      expect(output).toContain('Session Report -- aios-core');
      expect(output).toContain('Total Prompts: 42');
      expect(output).toContain('Agents Activated: 2 (@dev, @qa)');
      expect(output).toContain('Stories Touched: 1 (HO-2.1)');
      expect(output).toContain('Files Modified: 15');

      // Verify table has headers
      expect(output).toContain('Agent');
      expect(output).toContain('Stories');
      expect(output).toContain('Approx. Active Span');

      // Verify table has data rows
      expect(output).toContain('@dev');
      expect(output).toContain('@qa');
    });

    test('omits Total Prompts line when not provided', () => {
      const summaries = [
        { agent: 'dev', stories: [], filesModified: 0, decisions: [], activeSpan: '<1m', events: 1 },
      ];

      const output = formatSummaryForCLI(summaries);
      expect(output).not.toContain('Total Prompts:');
    });
  });

  // --- formatSummaryForHandoff ---

  describe('formatSummaryForHandoff()', () => {
    test('returns empty string for empty summaries', () => {
      expect(formatSummaryForHandoff([])).toBe('');
      expect(formatSummaryForHandoff(null)).toBe('');
    });

    test('produces markdown section with header and agent lines', () => {
      const summaries = [
        { agent: 'dev', stories: ['HO-2.1'], filesModified: 12, decisions: ['Use CJS'], activeSpan: '~2h 15m', events: 28 },
        { agent: 'qa', stories: ['HO-2.1'], filesModified: 3, decisions: [], activeSpan: '~45m', events: 5 },
      ];

      const output = formatSummaryForHandoff(summaries, { date: '2026-03-25' });

      expect(output).toContain('## Agent Activity');
      expect(output).toContain('Last session (2026-03-25)');
      expect(output).toContain('**@dev**');
      expect(output).toContain('**@qa**');
      expect(output).toContain('12 files');
      expect(output).toContain('~2h 15m');
    });

    test('respects MAX_HANDOFF_LINES limit', () => {
      // Create many agent summaries to test limit
      const summaries = [];
      for (let i = 0; i < 20; i++) {
        summaries.push({
          agent: `agent${i}`,
          stories: [`story-${i}`],
          filesModified: i,
          decisions: [`decision-${i}`],
          activeSpan: '~1m',
          events: 1,
        });
      }

      const output = formatSummaryForHandoff(summaries);
      const lineCount = output.split('\n').length;
      expect(lineCount).toBeLessThanOrEqual(MAX_HANDOFF_LINES);
    });

    test('uses singular/plural labels correctly', () => {
      const summaries = [
        { agent: 'dev', stories: ['HO-2.1'], filesModified: 1, decisions: [], activeSpan: '~1m', events: 1 },
      ];

      const output = formatSummaryForHandoff(summaries);
      expect(output).toContain('1 story');
      expect(output).toContain('1 file');
    });
  });

  // --- Integration: trimHandoff preserves Agent Activity ---

  describe('trimHandoff preserves Agent Activity section (AC: 6)', () => {
    let tmpDir;

    beforeEach(() => {
      tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'handoff-activity-'));
      fs.mkdirSync(path.join(tmpDir, 'docs'), { recursive: true });
      fs.mkdirSync(path.join(tmpDir, '.aiox', 'session-history'), { recursive: true });
    });

    afterEach(() => {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    });

    test('preserves Agent Activity section when trimming a large handoff', () => {
      const filePath = crossSession.getHandoffFilePath('activity-test', tmpDir);

      // Build a large handoff file with Agent Activity section
      const lines = ['# Session Handoff -- activity-test'];
      lines.push('**Date:** 2026-03-25');
      lines.push('**Last session:** Test');
      lines.push('**Next:** Continue');
      lines.push('');
      lines.push('---');
      lines.push('');
      lines.push('## Active Stories');
      lines.push('');
      lines.push('| Story | Status |');
      lines.push('|-------|--------|');
      lines.push('| HO-2.1 | In Progress |');
      lines.push('');

      // Add many work items to exceed 200 lines
      lines.push('## Recent Work');
      lines.push('');
      for (let i = 1; i <= 80; i++) {
        lines.push(`### ${i}. Work item ${i}`);
        lines.push(`- Details for item ${i}`);
        lines.push(`- More details for item ${i}`);
        lines.push('');
      }

      // Agent Activity section
      lines.push('## Agent Activity');
      lines.push('');
      lines.push('Last session (2026-03-25):');
      lines.push('- **@dev**: 1 story, 12 files, ~2h 15m -- Implemented HO-2.1');
      lines.push('- **@qa**: 1 story, 3 files, ~45m -- QA review');
      lines.push('');

      lines.push('## Key Docs');
      lines.push('');
      lines.push('- PRD: `docs/prd.md`');
      lines.push('');
      lines.push('## How to Continue');
      lines.push('');
      lines.push('```');
      lines.push('Resume work');
      lines.push('```');

      fs.writeFileSync(filePath, lines.join('\n'), 'utf8');

      const result = crossSession.trimHandoff(filePath, tmpDir);
      expect(result.trimmed).toBe(true);

      // Verify Agent Activity was preserved
      const trimmed = fs.readFileSync(filePath, 'utf8');
      expect(trimmed).toContain('## Agent Activity');
      expect(trimmed).toContain('**@dev**');
      expect(trimmed).toContain('**@qa**');
    });
  });

  // --- Integration: saveHandoff with agentActivitySection ---

  describe('saveHandoff with agentActivitySection (AC: 3)', () => {
    let tmpDir;

    beforeEach(() => {
      tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'handoff-save-'));
      fs.mkdirSync(path.join(tmpDir, 'docs'), { recursive: true });
    });

    afterEach(() => {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    });

    test('injects Agent Activity section into saved handoff', () => {
      const activitySection = [
        '## Agent Activity',
        '',
        'Last session (2026-03-25):',
        '- **@dev**: 1 story, 12 files, ~2h 15m',
      ].join('\n');

      crossSession.saveHandoff('inject-test', {
        date: '2026-03-25',
        lastSession: 'Test session',
        next: 'Continue',
        agentActivitySection: activitySection,
        keyDocs: { PRD: 'docs/prd.md' },
      }, tmpDir);

      const content = crossSession.readHandoff('inject-test', tmpDir);
      expect(content).toContain('## Agent Activity');
      expect(content).toContain('**@dev**');
      // Agent Activity should appear before Key Docs
      const actIdx = content.indexOf('## Agent Activity');
      const docsIdx = content.indexOf('## Key Docs');
      expect(actIdx).toBeLessThan(docsIdx);
    });
  });
});
