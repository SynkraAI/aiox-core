/**
 * Unit tests for panel-renderer module
 *
 * Tests the PanelRenderer class that handles rendering of
 * the observability panel using box drawing and ANSI colors.
 */

const { PanelRenderer, BOX, STATUS } = require('../../../.aios-core/core/ui/panel-renderer');

// Strip all ANSI codes for content assertions
function stripAnsi(str) {
  return str.replace(/\u001B\[[0-9;]*[a-zA-Z]/g, '');
}

describe('PanelRenderer', () => {
  let renderer;
  let originalForceColor;

  beforeAll(() => {
    originalForceColor = process.env.FORCE_COLOR;
    process.env.FORCE_COLOR = '0';
  });

  afterAll(() => {
    if (originalForceColor === undefined) {
      delete process.env.FORCE_COLOR;
    } else {
      process.env.FORCE_COLOR = originalForceColor;
    }
  });

  beforeEach(() => {
    renderer = new PanelRenderer();
  });

  // ============================================================
  // Exports
  // ============================================================
  describe('module exports', () => {
    test('exports PanelRenderer class', () => {
      expect(PanelRenderer).toBeDefined();
      expect(typeof PanelRenderer).toBe('function');
    });

    test('exports BOX constants', () => {
      expect(BOX).toBeDefined();
      expect(BOX.topLeft).toBe('┌');
      expect(BOX.topRight).toBe('┐');
      expect(BOX.bottomLeft).toBe('└');
      expect(BOX.bottomRight).toBe('┘');
      expect(BOX.horizontal).toBe('─');
      expect(BOX.vertical).toBe('│');
      expect(BOX.teeRight).toBe('├');
      expect(BOX.teeLeft).toBe('┤');
    });

    test('exports STATUS indicators', () => {
      expect(STATUS).toBeDefined();
      expect(STATUS.completed).toBeDefined();
      expect(STATUS.current).toBeDefined();
      expect(STATUS.pending).toBeDefined();
      expect(STATUS.error).toBeDefined();
      expect(STATUS.bullet).toBeDefined();
    });
  });

  // ============================================================
  // Constructor
  // ============================================================
  describe('constructor', () => {
    test('initializes with default width of 60', () => {
      expect(renderer.options.width).toBe(60);
    });

    test('accepts custom width', () => {
      const custom = new PanelRenderer({ width: 80 });
      expect(custom.options.width).toBe(80);
    });

    test('merges custom options with defaults', () => {
      const custom = new PanelRenderer({ width: 100, debug: true });
      expect(custom.options.width).toBe(100);
      expect(custom.options.debug).toBe(true);
    });
  });

  // ============================================================
  // horizontalLine
  // ============================================================
  describe('horizontalLine', () => {
    test('creates line of default width minus 2', () => {
      const line = renderer.horizontalLine();
      expect(line.length).toBe(58); // 60 - 2
      expect(line).toBe('─'.repeat(58));
    });

    test('creates line of custom width', () => {
      const line = renderer.horizontalLine(40);
      expect(line.length).toBe(38); // 40 - 2
    });

    test('handles width of 2 (empty line)', () => {
      const line = renderer.horizontalLine(2);
      expect(line).toBe('');
    });
  });

  // ============================================================
  // topBorder
  // ============================================================
  describe('topBorder', () => {
    test('starts with top-left and ends with top-right corner', () => {
      const border = stripAnsi(renderer.topBorder());
      expect(border.startsWith('┌')).toBe(true);
      expect(border.endsWith('┐')).toBe(true);
    });

    test('has correct total length', () => {
      const border = stripAnsi(renderer.topBorder());
      expect(border.length).toBe(60);
    });

    test('respects custom width', () => {
      const border = stripAnsi(renderer.topBorder(40));
      expect(border.length).toBe(40);
    });
  });

  // ============================================================
  // bottomBorder
  // ============================================================
  describe('bottomBorder', () => {
    test('starts with bottom-left and ends with bottom-right corner', () => {
      const border = stripAnsi(renderer.bottomBorder());
      expect(border.startsWith('└')).toBe(true);
      expect(border.endsWith('┘')).toBe(true);
    });

    test('has correct total length', () => {
      const border = stripAnsi(renderer.bottomBorder());
      expect(border.length).toBe(60);
    });
  });

  // ============================================================
  // separator
  // ============================================================
  describe('separator', () => {
    test('starts with tee-right and ends with tee-left', () => {
      const sep = stripAnsi(renderer.separator());
      expect(sep.startsWith('├')).toBe(true);
      expect(sep.endsWith('┤')).toBe(true);
    });

    test('has correct total length', () => {
      const sep = stripAnsi(renderer.separator());
      expect(sep.length).toBe(60);
    });
  });

  // ============================================================
  // contentLine
  // ============================================================
  describe('contentLine', () => {
    test('wraps content with vertical borders', () => {
      const line = stripAnsi(renderer.contentLine('Hello'));
      expect(line.startsWith('│')).toBe(true);
      expect(line.endsWith('│')).toBe(true);
    });

    test('pads content to fill width', () => {
      const line = stripAnsi(renderer.contentLine('Hi'));
      // │ + space + content + padding + space + │ = width
      expect(line.length).toBe(60);
    });

    test('handles empty content', () => {
      const line = stripAnsi(renderer.contentLine(''));
      expect(line.length).toBe(60);
      expect(line.startsWith('│')).toBe(true);
    });

    test('handles content longer than width gracefully', () => {
      const longContent = 'A'.repeat(200);
      // Should not throw
      const line = renderer.contentLine(longContent);
      expect(line).toBeDefined();
    });
  });

  // ============================================================
  // stripAnsi
  // ============================================================
  describe('stripAnsi', () => {
    test('removes ANSI escape codes', () => {
      const colored = '\u001B[31mRed text\u001B[0m';
      expect(renderer.stripAnsi(colored)).toBe('Red text');
    });

    test('returns plain text unchanged', () => {
      expect(renderer.stripAnsi('plain text')).toBe('plain text');
    });

    test('handles empty string', () => {
      expect(renderer.stripAnsi('')).toBe('');
    });

    test('handles multiple ANSI codes', () => {
      const multi = '\u001B[1m\u001B[32mBold Green\u001B[0m';
      expect(renderer.stripAnsi(multi)).toBe('Bold Green');
    });
  });

  // ============================================================
  // formatElapsedTime
  // ============================================================
  describe('formatElapsedTime', () => {
    test('returns dashes when no timestamps', () => {
      const result = renderer.formatElapsedTime({
        elapsed: { story_start: null, session_start: null },
      });
      expect(result.story).toBe('--');
      expect(result.session).toBe('--');
    });

    test('formats seconds', () => {
      const now = Date.now();
      const result = renderer.formatElapsedTime({
        elapsed: { story_start: now - 30000, session_start: now - 5000 },
      });
      // Should contain 's' suffix
      expect(result.story).toMatch(/^\d+s$/);
      expect(result.session).toMatch(/^\d+s$/);
    });

    test('formats minutes and seconds', () => {
      const now = Date.now();
      const result = renderer.formatElapsedTime({
        elapsed: { story_start: now - 125000 }, // 2m5s
      });
      expect(result.story).toMatch(/^\d+m\d+s$/);
    });

    test('formats hours and minutes', () => {
      const now = Date.now();
      const result = renderer.formatElapsedTime({
        elapsed: { story_start: now - 3700000 }, // 1h1m
      });
      expect(result.story).toMatch(/^\d+h\d+m$/);
    });

    test('retorna -- quando story_start é null', () => {
      const result = renderer.formatElapsedTime({
        elapsed: { story_start: null, session_start: null },
      });
      expect(result.story).toBe('--');
      expect(result.session).toBe('--');
    });

    test('trata story_start 0 como falsy (retorna --)', () => {
      const result = renderer.formatElapsedTime({
        elapsed: { story_start: 0, session_start: Date.now() - 5000 },
      });
      // 0 é falsy em JS, então retorna '--'
      expect(result.story).toBe('--');
      expect(result.session).toMatch(/^\d+s$/);
    });
  });

  // ============================================================
  // renderPipeline
  // ============================================================
  describe('renderPipeline', () => {
    test('renders all stages', () => {
      const pipeline = {
        stages: ['Setup', 'Build', 'Test'],
        completed_stages: [],
        current_stage: 'Setup',
      };
      const result = stripAnsi(renderer.renderPipeline(pipeline));
      expect(result).toContain('Setup');
      expect(result).toContain('Build');
      expect(result).toContain('Test');
    });

    test('marks completed stages', () => {
      const pipeline = {
        stages: ['Setup', 'Build'],
        completed_stages: ['Setup'],
        current_stage: 'Build',
      };
      const result = stripAnsi(renderer.renderPipeline(pipeline));
      expect(result).toContain('Setup');
      expect(result).toContain('Build');
    });

    test('renders Story stage with progress', () => {
      const pipeline = {
        stages: ['Story'],
        completed_stages: [],
        current_stage: 'Story',
        story_progress: '3/5',
      };
      const result = stripAnsi(renderer.renderPipeline(pipeline));
      expect(result).toContain('3/5');
    });

    test('renders Story stage with default 0/0 when no progress', () => {
      const pipeline = {
        stages: ['Story'],
        completed_stages: [],
        current_stage: null,
      };
      const result = stripAnsi(renderer.renderPipeline(pipeline));
      expect(result).toContain('0/0');
    });

    test('renders completed Story stage with progress and checkmark', () => {
      const pipeline = {
        stages: ['Story'],
        completed_stages: ['Story'],
        current_stage: null,
        story_progress: '5/5',
      };
      const result = stripAnsi(renderer.renderPipeline(pipeline));
      expect(result).toContain('5/5');
    });

    test('separates stages with arrow', () => {
      const pipeline = {
        stages: ['A', 'B', 'C'],
        completed_stages: [],
        current_stage: 'A',
      };
      const result = stripAnsi(renderer.renderPipeline(pipeline));
      expect(result).toContain('→');
    });

    test('handles empty stages array', () => {
      const pipeline = {
        stages: [],
        completed_stages: [],
        current_stage: null,
      };
      const result = renderer.renderPipeline(pipeline);
      expect(result).toBe('');
    });
  });

  // ============================================================
  // renderMinimal
  // ============================================================
  describe('renderMinimal', () => {
    const minimalState = {
      pipeline: {
        stages: ['Setup', 'Build'],
        completed_stages: ['Setup'],
        current_stage: 'Build',
      },
      current_agent: { id: 'dev', task: 'implementing feature' },
      active_terminals: { count: 1, list: [{ agent: 'dev' }] },
      elapsed: { story_start: Date.now() - 60000, session_start: Date.now() - 30000 },
      errors: [],
    };

    test('returns a multi-line string ending with newline', () => {
      const output = renderer.renderMinimal(minimalState);
      expect(output.endsWith('\n')).toBe(true);
    });

    test('contains Bob Status header', () => {
      const output = stripAnsi(renderer.renderMinimal(minimalState));
      expect(output).toContain('Bob Status');
    });

    test('contains pipeline info', () => {
      const output = stripAnsi(renderer.renderMinimal(minimalState));
      expect(output).toContain('Pipeline:');
    });

    test('contains current agent info', () => {
      const output = stripAnsi(renderer.renderMinimal(minimalState));
      expect(output).toContain('dev');
      expect(output).toContain('implementing feature');
    });

    test('shows terminal count', () => {
      const output = stripAnsi(renderer.renderMinimal(minimalState));
      expect(output).toContain('1 active');
    });

    test('shows "none" when no active terminals', () => {
      const state = { ...minimalState, active_terminals: { count: 0, list: [] } };
      const output = stripAnsi(renderer.renderMinimal(state));
      expect(output).toContain('none');
    });

    test('shows elapsed time', () => {
      const output = stripAnsi(renderer.renderMinimal(minimalState));
      expect(output).toContain('Elapsed:');
      expect(output).toContain('(story)');
      expect(output).toContain('(session)');
    });

    test('shows error section when errors exist', () => {
      const state = {
        ...minimalState,
        errors: [{ message: 'Something went wrong' }],
      };
      const output = stripAnsi(renderer.renderMinimal(state));
      expect(output).toContain('Something went wrong');
    });

    test('does not show error section when no errors', () => {
      const output = renderer.renderMinimal(minimalState);
      const lines = output.split('\n');
      // Count separators — should be only 1 (after header)
      const separatorCount = lines.filter(l => stripAnsi(l).startsWith('├')).length;
      expect(separatorCount).toBe(1);
    });

    test('truncates long error messages to 50 chars', () => {
      const state = {
        ...minimalState,
        errors: [{ message: 'A'.repeat(100) }],
      };
      const output = stripAnsi(renderer.renderMinimal(state));
      // The error message in output should be at most 50 chars
      expect(output).toContain('A'.repeat(50));
      expect(output).not.toContain('A'.repeat(51));
    });

    test('shows only last error', () => {
      const state = {
        ...minimalState,
        errors: [
          { message: 'First error' },
          { message: 'Second error' },
          { message: 'Last error' },
        ],
      };
      const output = stripAnsi(renderer.renderMinimal(state));
      expect(output).toContain('Last error');
      expect(output).not.toContain('First error');
    });

    test('shows fallback agent info when id is missing', () => {
      const state = { ...minimalState, current_agent: { id: null, task: null } };
      const output = stripAnsi(renderer.renderMinimal(state));
      expect(output).toContain('--');
      expect(output).toContain('idle');
    });

    test('limits displayed terminal agents to 3', () => {
      const state = {
        ...minimalState,
        active_terminals: {
          count: 5,
          list: [
            { agent: 'dev' },
            { agent: 'qa' },
            { agent: 'architect' },
            { agent: 'pm' },
            { agent: 'devops' },
          ],
        },
      };
      const output = stripAnsi(renderer.renderMinimal(state));
      expect(output).toContain('5 active');
      expect(output).toContain('dev');
      expect(output).toContain('qa');
      expect(output).toContain('architect');
      expect(output).not.toContain('devops');
    });
  });

  // ============================================================
  // renderDetailed
  // ============================================================
  describe('renderDetailed', () => {
    const detailedState = {
      pipeline: {
        stages: ['Setup', 'Build', 'Test'],
        completed_stages: ['Setup'],
        current_stage: 'Build',
      },
      current_agent: {
        id: 'architect',
        name: 'Aria',
        task: 'designing architecture',
        reason: 'System design phase requires architect expertise',
      },
      active_terminals: {
        count: 2,
        list: [
          { agent: 'dev', pid: 1234, task: 'coding' },
          { agent: 'qa', pid: 5678, task: 'testing' },
        ],
      },
      elapsed: { story_start: Date.now() - 120000, session_start: Date.now() - 60000 },
      tradeoffs: [
        { choice: 'Database', selected: 'PostgreSQL', reason: 'ACID compliance' },
      ],
      next_steps: ['Review architecture', 'Start implementation'],
      errors: [],
    };

    test('returns multi-line string ending with newline', () => {
      const output = renderer.renderDetailed(detailedState);
      expect(output.endsWith('\n')).toBe(true);
    });

    test('contains Modo Educativo header', () => {
      const output = stripAnsi(renderer.renderDetailed(detailedState));
      expect(output).toContain('Modo Educativo');
    });

    test('shows pipeline section', () => {
      const output = stripAnsi(renderer.renderDetailed(detailedState));
      expect(output).toContain('Pipeline:');
    });

    test('shows current agent with name and task', () => {
      const output = stripAnsi(renderer.renderDetailed(detailedState));
      expect(output).toContain('architect');
      expect(output).toContain('Aria');
      expect(output).toContain('designing architecture');
    });

    test('shows agent reason', () => {
      const output = stripAnsi(renderer.renderDetailed(detailedState));
      expect(output).toContain('System design phase');
    });

    test('does not show reason line when reason is absent', () => {
      const state = {
        ...detailedState,
        current_agent: { id: 'dev', name: 'Dex', task: 'coding' },
      };
      const output = stripAnsi(renderer.renderDetailed(state));
      expect(output).not.toContain('Por que');
    });

    test('shows active terminals with PID', () => {
      const output = stripAnsi(renderer.renderDetailed(detailedState));
      expect(output).toContain('PID 1234');
      expect(output).toContain('PID 5678');
      expect(output).toContain('coding');
      expect(output).toContain('testing');
    });

    test('shows "No active terminals" when list empty', () => {
      const state = {
        ...detailedState,
        active_terminals: { count: 0, list: [] },
      };
      const output = stripAnsi(renderer.renderDetailed(state));
      expect(output).toContain('No active terminals');
    });

    test('limits terminals to 4 entries', () => {
      const state = {
        ...detailedState,
        active_terminals: {
          count: 6,
          list: [
            { agent: 'a1', pid: 1, task: 't1' },
            { agent: 'a2', pid: 2, task: 't2' },
            { agent: 'a3', pid: 3, task: 't3' },
            { agent: 'a4', pid: 4, task: 't4' },
            { agent: 'a5', pid: 5, task: 't5' },
            { agent: 'a6', pid: 6, task: 't6' },
          ],
        },
      };
      const output = stripAnsi(renderer.renderDetailed(state));
      expect(output).toContain('a4');
      expect(output).not.toContain('a5');
    });

    test('shows elapsed time section', () => {
      const output = stripAnsi(renderer.renderDetailed(detailedState));
      expect(output).toContain('Elapsed:');
      expect(output).toContain('Story:');
      expect(output).toContain('Session:');
    });

    test('shows tradeoffs section', () => {
      const output = stripAnsi(renderer.renderDetailed(detailedState));
      expect(output).toContain('Trade-offs');
      expect(output).toContain('Database');
      expect(output).toContain('PostgreSQL');
      expect(output).toContain('ACID compliance');
    });

    test('hides tradeoffs section when empty', () => {
      const state = { ...detailedState, tradeoffs: [] };
      const output = stripAnsi(renderer.renderDetailed(state));
      expect(output).not.toContain('Trade-offs');
    });

    test('limits tradeoffs to last 3', () => {
      const state = {
        ...detailedState,
        tradeoffs: [
          { choice: 'A', selected: 'a', reason: 'first' },
          { choice: 'B', selected: 'b', reason: 'second' },
          { choice: 'C', selected: 'c', reason: 'third' },
          { choice: 'D', selected: 'd', reason: 'fourth' },
        ],
      };
      const output = stripAnsi(renderer.renderDetailed(state));
      expect(output).not.toContain('first');
      expect(output).toContain('second');
      expect(output).toContain('third');
      expect(output).toContain('fourth');
    });

    test('shows next steps section', () => {
      const output = stripAnsi(renderer.renderDetailed(detailedState));
      expect(output).toContain('Next Steps:');
      expect(output).toContain('1. Review architecture');
      expect(output).toContain('2. Start implementation');
    });

    test('hides next steps when empty', () => {
      const state = { ...detailedState, next_steps: [] };
      const output = stripAnsi(renderer.renderDetailed(state));
      expect(output).not.toContain('Next Steps:');
    });

    test('limits next steps to 3', () => {
      const state = {
        ...detailedState,
        next_steps: ['Step 1', 'Step 2', 'Step 3', 'Step 4'],
      };
      const output = stripAnsi(renderer.renderDetailed(state));
      expect(output).toContain('3. Step 3');
      expect(output).not.toContain('4. Step 4');
    });

    test('shows errors section when errors exist', () => {
      const state = {
        ...detailedState,
        errors: [{ message: 'Build failed' }, { message: 'Test timeout' }],
      };
      const output = stripAnsi(renderer.renderDetailed(state));
      expect(output).toContain('Errors:');
      expect(output).toContain('Build failed');
      expect(output).toContain('Test timeout');
    });

    test('limits errors to last 2', () => {
      const state = {
        ...detailedState,
        errors: [
          { message: 'Error 1' },
          { message: 'Error 2' },
          { message: 'Error 3' },
        ],
      };
      const output = stripAnsi(renderer.renderDetailed(state));
      expect(output).not.toContain('Error 1');
      expect(output).toContain('Error 2');
      expect(output).toContain('Error 3');
    });

    test('truncates error messages to 45 chars', () => {
      const state = {
        ...detailedState,
        errors: [{ message: 'B'.repeat(100) }],
      };
      const output = stripAnsi(renderer.renderDetailed(state));
      expect(output).toContain('B'.repeat(45));
      expect(output).not.toContain('B'.repeat(46));
    });

    test('handles terminal without PID', () => {
      const state = {
        ...detailedState,
        active_terminals: {
          count: 1,
          list: [{ agent: 'dev', task: 'coding' }],
        },
      };
      const output = stripAnsi(renderer.renderDetailed(state));
      expect(output).not.toContain('PID');
      expect(output).toContain('dev');
    });
  });
});
