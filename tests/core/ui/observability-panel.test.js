/**
 * Observability Panel Tests
 *
 * Story 11.6: Projeto Bob - Painel de Observabilidade CLI
 *
 * Tests for:
 * - AC1: Panel shows current_agent
 * - AC2: Panel shows pipeline_progress
 * - AC3: Panel shows active_terminals
 * - AC4: Panel shows elapsed_time
 * - AC5: Modo minimal (default)
 * - AC6: Modo detailed (educativo)
 * - AC7: CLI-first (terminal rendering)
 * - AC8: Real-time updates
 *
 * @module tests/core/ui/observability-panel
 */

'use strict';

const {
  ObservabilityPanel,
  createPanel,
  PanelMode,
  PipelineStage,
  createDefaultState,
} = require('../../../.aiox-core/core/ui/observability-panel');

const { PanelRenderer, BOX, STATUS } = require('../../../.aiox-core/core/ui/panel-renderer');

describe('ObservabilityPanel', () => {
  describe('createPanel', () => {
    it('should create a panel with default options', () => {
      const panel = createPanel();

      expect(panel).toBeInstanceOf(ObservabilityPanel);
      expect(panel.state.mode).toBe(PanelMode.MINIMAL);
      expect(panel.state.refresh_rate).toBe(1000);
    });

    it('should create a panel with custom options', () => {
      const panel = createPanel({
        mode: PanelMode.DETAILED,
        refreshRate: 500,
        width: 80,
      });

      expect(panel.state.mode).toBe(PanelMode.DETAILED);
      expect(panel.state.refresh_rate).toBe(500);
      expect(panel.options.width).toBe(80);
    });
  });

  describe('createDefaultState', () => {
    it('should create valid default state', () => {
      const state = createDefaultState();

      expect(state.mode).toBe(PanelMode.MINIMAL);
      expect(state.refresh_rate).toBe(1000);
      expect(state.pipeline).toBeDefined();
      expect(state.pipeline.stages).toEqual(Object.values(PipelineStage));
      expect(state.current_agent).toBeDefined();
      expect(state.active_terminals).toBeDefined();
      expect(state.elapsed).toBeDefined();
      expect(state.tradeoffs).toEqual([]);
      expect(state.errors).toEqual([]);
      expect(state.next_steps).toEqual([]);
    });
  });

  describe('AC1: Current Agent Display', () => {
    it('should set current agent correctly', () => {
      const panel = createPanel();

      panel.setCurrentAgent('@dev', 'Dex', 'implementing jwt-handler.ts');

      expect(panel.state.current_agent.id).toBe('@dev');
      expect(panel.state.current_agent.name).toBe('Dex');
      expect(panel.state.current_agent.task).toBe('implementing jwt-handler.ts');
    });

    it('should set agent with reason for detailed mode', () => {
      const panel = createPanel({ mode: PanelMode.DETAILED });

      panel.setCurrentAgent('@dev', 'Dex', 'implementing jwt-handler.ts', 'Story tipo "código geral"');

      expect(panel.state.current_agent.reason).toBe('Story tipo "código geral"');
    });

    it('should render current agent in output', () => {
      const panel = createPanel();
      panel.setCurrentAgent('@dev', 'Dex', 'implementing feature');

      const output = panel.renderOnce();

      expect(output).toContain('@dev');
      expect(output).toContain('implementing feature');
    });
  });

  describe('AC2: Pipeline Progress Display', () => {
    it('should set pipeline stage correctly', () => {
      const panel = createPanel();

      panel.setPipelineStage(PipelineStage.DEV, '3/8');

      expect(panel.state.pipeline.current_stage).toBe('Dev');
      expect(panel.state.pipeline.story_progress).toBe('3/8');
    });

    it('should mark stages as completed', () => {
      const panel = createPanel();

      panel.completePipelineStage(PipelineStage.PRD);
      panel.completePipelineStage(PipelineStage.EPIC);

      expect(panel.state.pipeline.completed_stages).toContain('PRD');
      expect(panel.state.pipeline.completed_stages).toContain('Epic');
    });

    it('should not duplicate completed stages', () => {
      const panel = createPanel();

      panel.completePipelineStage(PipelineStage.PRD);
      panel.completePipelineStage(PipelineStage.PRD);

      expect(panel.state.pipeline.completed_stages.filter((s) => s === 'PRD').length).toBe(1);
    });

    it('should render pipeline progress in output', () => {
      const panel = createPanel();
      panel.completePipelineStage(PipelineStage.PRD);
      panel.setPipelineStage(PipelineStage.STORY, '3/8');

      const output = panel.renderOnce();

      expect(output).toContain('Pipeline');
      expect(output).toContain('3/8');
    });
  });

  describe('AC3: Active Terminals Display', () => {
    it('should add active terminal', () => {
      const panel = createPanel();

      panel.addTerminal('@dev', 12345, 'jwt-handler.ts');

      expect(panel.state.active_terminals.count).toBe(1);
      expect(panel.state.active_terminals.list[0]).toEqual({
        agent: '@dev',
        pid: 12345,
        task: 'jwt-handler.ts',
      });
    });

    it('should add multiple terminals', () => {
      const panel = createPanel();

      panel.addTerminal('@dev', 12345, 'jwt-handler.ts');
      panel.addTerminal('@data-engineer', 12346, 'migration pending');

      expect(panel.state.active_terminals.count).toBe(2);
    });

    it('should remove terminal by PID', () => {
      const panel = createPanel();

      panel.addTerminal('@dev', 12345, 'jwt-handler.ts');
      panel.addTerminal('@data-engineer', 12346, 'migration pending');
      panel.removeTerminal(12345);

      expect(panel.state.active_terminals.count).toBe(1);
      expect(panel.state.active_terminals.list[0].agent).toBe('@data-engineer');
    });

    it('should render active terminals in output', () => {
      const panel = createPanel();
      panel.addTerminal('@dev', 12345, 'jwt-handler.ts');

      const output = panel.renderOnce();

      expect(output).toContain('Terminals');
      expect(output).toContain('@dev');
    });
  });

  describe('AC4: Elapsed Time Display', () => {
    it('should track session elapsed time', () => {
      const panel = createPanel();

      const elapsed = panel.getElapsedTime();

      expect(elapsed.session).toBeDefined();
      expect(elapsed.session).not.toBe('--');
    });

    it('should track story elapsed time after starting', () => {
      const panel = createPanel();

      panel.startStoryTimer();
      const elapsed = panel.getElapsedTime();

      expect(elapsed.story).toBeDefined();
      expect(elapsed.story).not.toBe('--');
    });

    it('should return -- for story time when not started', () => {
      const panel = createPanel();

      const elapsed = panel.getElapsedTime();

      expect(elapsed.story).toBe('--');
    });

    it('should format time correctly', () => {
      const panel = createPanel();
      // Set story start to 65 seconds ago
      panel.state.elapsed.story_start = Date.now() - 65000;

      const elapsed = panel.getElapsedTime();

      // Should be around 1m5s
      expect(elapsed.story).toMatch(/1m\d+s/);
    });

    it('should render elapsed time in output', () => {
      const panel = createPanel();

      const output = panel.renderOnce();

      expect(output).toContain('Elapsed');
      expect(output).toContain('story');
      expect(output).toContain('session');
    });
  });

  describe('AC5: Minimal Mode (Default)', () => {
    it('should default to minimal mode', () => {
      const panel = createPanel();

      expect(panel.state.mode).toBe(PanelMode.MINIMAL);
    });

    it('should render compact output in minimal mode', () => {
      const panel = createPanel();
      panel.setCurrentAgent('@dev', 'Dex', 'implementing feature');
      panel.setPipelineStage(PipelineStage.DEV, '3/8');

      const output = panel.renderOnce();
      const lines = output.split('\n').filter((l) => l.length > 0);

      // Minimal mode should have fewer lines (roughly 7-8)
      expect(lines.length).toBeLessThan(15);
    });

    it('should show errors in minimal mode', () => {
      const panel = createPanel();
      panel.addError('Build failed: syntax error');

      const output = panel.renderOnce();

      expect(output).toContain('Build failed');
    });

    it('should NOT show trade-offs in minimal mode', () => {
      const panel = createPanel();
      panel.addTradeoff('JWT vs Session', 'JWT', 'stateless');

      const output = panel.renderOnce();

      // Trade-offs section should not appear in minimal mode
      expect(output).not.toContain('Trade-offs considerados');
    });
  });

  describe('AC6: Detailed Mode (Educativo)', () => {
    it('should render detailed output when set', () => {
      const panel = createPanel({ mode: PanelMode.DETAILED });

      const output = panel.renderOnce();

      expect(output).toContain('Modo Educativo');
    });

    it('should show trade-offs in detailed mode', () => {
      const panel = createPanel({ mode: PanelMode.DETAILED });
      panel.addTradeoff('JWT vs Session', 'JWT', 'stateless');

      const output = panel.renderOnce();

      expect(output).toContain('Trade-offs considerados');
      expect(output).toContain('JWT vs Session');
      expect(output).toContain('JWT');
    });

    it('should show next steps in detailed mode', () => {
      const panel = createPanel({ mode: PanelMode.DETAILED });
      panel.setNextSteps([
        '@dev termina implementação',
        'Quality Gate por @architect',
        '@devops push e PR',
      ]);

      const output = panel.renderOnce();

      expect(output).toContain('Next Steps');
      expect(output).toContain('@dev termina implementação');
    });

    it('should show agent reason in detailed mode', () => {
      const panel = createPanel({ mode: PanelMode.DETAILED });
      panel.setCurrentAgent('@dev', 'Dex', 'implementing', 'Story tipo "código geral"');

      const output = panel.renderOnce();

      expect(output).toContain('Por que @dev');
      expect(output).toContain('código geral');
    });

    it('should render more lines than minimal mode', () => {
      const panel = createPanel({ mode: PanelMode.DETAILED });
      panel.setCurrentAgent('@dev', 'Dex', 'implementing feature');
      panel.addTerminal('@dev', 12345, 'jwt-handler.ts');
      panel.addTradeoff('JWT vs Session', 'JWT', 'stateless');

      const output = panel.renderOnce();
      const lines = output.split('\n').filter((l) => l.length > 0);

      // Detailed mode should have more lines
      expect(lines.length).toBeGreaterThan(10);
    });
  });

  describe('AC5-6: Mode Toggle', () => {
    it('should toggle between modes', () => {
      const panel = createPanel();

      expect(panel.state.mode).toBe(PanelMode.MINIMAL);

      const newMode = panel.toggleMode();
      expect(newMode).toBe(PanelMode.DETAILED);
      expect(panel.state.mode).toBe(PanelMode.DETAILED);

      const nextMode = panel.toggleMode();
      expect(nextMode).toBe(PanelMode.MINIMAL);
    });

    it('should set mode directly', () => {
      const panel = createPanel();

      panel.setMode(PanelMode.DETAILED);
      expect(panel.state.mode).toBe(PanelMode.DETAILED);

      panel.setMode(PanelMode.MINIMAL);
      expect(panel.state.mode).toBe(PanelMode.MINIMAL);
    });

    it('should ignore invalid mode', () => {
      const panel = createPanel();

      panel.setMode('invalid');
      expect(panel.state.mode).toBe(PanelMode.MINIMAL);
    });
  });

  describe('AC7: CLI-First (Terminal Rendering)', () => {
    it('should use box drawing characters', () => {
      const panel = createPanel();

      const output = panel.renderOnce();

      // Should contain Unicode box drawing characters
      expect(output).toContain(BOX.topLeft);
      expect(output).toContain(BOX.bottomRight);
      expect(output).toContain(BOX.vertical);
    });

    it('should use chalk for styling (colors disabled in non-TTY)', () => {
      const panel = createPanel();

      const output = panel.renderOnce();

      // In non-TTY environments (like Jest), chalk disables colors
      // Verify the output structure is valid regardless of color codes
      expect(output).toContain('Bob Status');
      expect(output).toContain('Pipeline');

      // If running in TTY, ANSI codes would be present
      // We just verify the rendering works
      expect(typeof output).toBe('string');
      expect(output.length).toBeGreaterThan(100);
    });

    it('should render consistent width', () => {
      const panel = createPanel({ width: 60 });

      const output = panel.renderOnce();
      const lines = output.split('\n');

      // Check that box lines have consistent structure
      const topLine = lines.find((l) => l.includes(BOX.topLeft));
      const bottomLine = lines.find((l) => l.includes(BOX.bottomLeft));

      expect(topLine).toBeDefined();
      expect(bottomLine).toBeDefined();
    });
  });

  describe('AC8: Real-time Updates', () => {
    it('should start and stop refresh loop', () => {
      const panel = createPanel({ refreshRate: 100 });

      // Mock stdout.write to prevent actual output
      const originalWrite = process.stdout.write;
      process.stdout.write = jest.fn();

      panel.start();
      expect(panel.isRunning).toBe(true);
      expect(panel.refreshInterval).not.toBeNull();

      panel.stop();
      expect(panel.isRunning).toBe(false);
      expect(panel.refreshInterval).toBeNull();

      // Restore
      process.stdout.write = originalWrite;
    });

    it('should not start if already running', () => {
      const panel = createPanel();

      // Mock stdout.write to prevent actual output
      const originalWrite = process.stdout.write;
      process.stdout.write = jest.fn();

      panel.start();
      const firstInterval = panel.refreshInterval;

      panel.start();
      expect(panel.refreshInterval).toBe(firstInterval);

      panel.stop();
      process.stdout.write = originalWrite;
    });

    it('should update state while running', () => {
      const panel = createPanel();

      // Mock stdout.write
      const originalWrite = process.stdout.write;
      process.stdout.write = jest.fn();

      panel.start();

      panel.setCurrentAgent('@qa', 'Quinn', 'running tests');
      expect(panel.state.current_agent.id).toBe('@qa');

      panel.stop();
      process.stdout.write = originalWrite;
    });

    it('should use configured refresh rate', () => {
      const panel = createPanel({ refreshRate: 500 });

      expect(panel.state.refresh_rate).toBe(500);
    });
  });

  describe('State Management', () => {
    it('should update state with updateState method', () => {
      const panel = createPanel();

      panel.updateState({
        pipeline: { current_stage: 'QA' },
        current_agent: { id: '@qa' },
      });

      expect(panel.state.pipeline.current_stage).toBe('QA');
      expect(panel.state.current_agent.id).toBe('@qa');
    });

    it('should get full state with getState method', () => {
      const panel = createPanel();
      panel.setCurrentAgent('@dev', 'Dex', 'implementing');
      panel.startStoryTimer();

      const state = panel.getState();

      expect(state.current_agent.id).toBe('@dev');
      expect(state.elapsed.story).toBeDefined();
      expect(state.elapsed.session).toBeDefined();
    });

    it('should add and clear errors', () => {
      const panel = createPanel();

      panel.addError('Error 1');
      panel.addError('Error 2');

      expect(panel.state.errors.length).toBe(2);

      panel.clearErrors();
      expect(panel.state.errors.length).toBe(0);
    });
  });
});

describe('PanelRenderer', () => {
  let renderer;

  beforeEach(() => {
    renderer = new PanelRenderer({ width: 60 });
  });

  describe('Border rendering', () => {
    it('should render top border', () => {
      const border = renderer.topBorder();

      expect(border).toContain(BOX.topLeft);
      expect(border).toContain(BOX.topRight);
      expect(border).toContain(BOX.horizontal);
    });

    it('should render bottom border', () => {
      const border = renderer.bottomBorder();

      expect(border).toContain(BOX.bottomLeft);
      expect(border).toContain(BOX.bottomRight);
    });

    it('should render separator', () => {
      const sep = renderer.separator();

      expect(sep).toContain(BOX.teeRight);
      expect(sep).toContain(BOX.teeLeft);
    });
  });

  describe('Content line rendering', () => {
    it('should render content with borders', () => {
      const line = renderer.contentLine('Test content');

      expect(line).toContain(BOX.vertical);
      expect(line).toContain('Test content');
    });

    it('should strip ANSI codes for length calculation', () => {
      const stripped = renderer.stripAnsi('\x1B[32mGreen text\x1B[0m');

      expect(stripped).toBe('Green text');
    });
  });

  describe('Pipeline rendering', () => {
    it('should render pipeline with stages', () => {
      const pipeline = {
        stages: ['PRD', 'Epic', 'Story', 'Dev', 'QA', 'Push'],
        current_stage: 'Dev',
        story_progress: '3/8',
        completed_stages: ['PRD', 'Epic'],
      };

      const output = renderer.renderPipeline(pipeline);

      expect(output).toContain('PRD');
      expect(output).toContain('Dev');
      expect(output).toContain('→');
    });
  });

  describe('Minimal mode rendering', () => {
    it('should render valid minimal panel', () => {
      const state = {
        mode: 'minimal',
        pipeline: {
          stages: ['PRD', 'Epic', 'Story', 'Dev', 'QA', 'Push'],
          current_stage: 'Dev',
          story_progress: '3/8',
          completed_stages: ['PRD'],
        },
        current_agent: {
          id: '@dev',
          name: 'Dex',
          task: 'implementing',
        },
        active_terminals: {
          count: 1,
          list: [{ agent: '@dev', pid: 12345, task: 'jwt-handler.ts' }],
        },
        elapsed: {
          story_start: Date.now() - 60000,
          session_start: Date.now() - 300000,
        },
        errors: [],
      };

      const output = renderer.renderMinimal(state);

      expect(output).toContain('Bob Status');
      expect(output).toContain('Pipeline');
      expect(output).toContain('@dev');
      expect(output).toContain('Terminals');
      expect(output).toContain('Elapsed');
    });
  });

  describe('Detailed mode rendering', () => {
    it('should render valid detailed panel', () => {
      const state = {
        mode: 'detailed',
        pipeline: {
          stages: ['PRD', 'Epic', 'Story', 'Dev', 'QA', 'Push'],
          current_stage: 'Dev',
          story_progress: '3/8',
          completed_stages: ['PRD'],
        },
        current_agent: {
          id: '@dev',
          name: 'Dex',
          task: 'implementing',
          reason: 'Story tipo código geral',
        },
        active_terminals: {
          count: 1,
          list: [{ agent: '@dev', pid: 12345, task: 'jwt-handler.ts' }],
        },
        elapsed: {
          story_start: Date.now() - 60000,
          session_start: Date.now() - 300000,
        },
        tradeoffs: [{ choice: 'JWT vs Session', selected: 'JWT', reason: 'stateless' }],
        next_steps: ['@dev finish', '@qa review'],
        errors: [],
      };

      const output = renderer.renderDetailed(state);

      expect(output).toContain('Modo Educativo');
      expect(output).toContain('Current Agent');
      expect(output).toContain('Active Terminals');
      expect(output).toContain('Trade-offs considerados');
      expect(output).toContain('Next Steps');
    });
  });

  describe('Time formatting', () => {
    it('should format seconds correctly', () => {
      const state = {
        elapsed: {
          story_start: Date.now() - 30000, // 30 seconds
          session_start: Date.now() - 30000,
        },
      };

      const formatted = renderer.formatElapsedTime(state);

      expect(formatted.story).toMatch(/\d+s/);
    });

    it('should format minutes correctly', () => {
      const state = {
        elapsed: {
          story_start: Date.now() - 90000, // 1.5 minutes
          session_start: Date.now() - 90000,
        },
      };

      const formatted = renderer.formatElapsedTime(state);

      expect(formatted.story).toMatch(/1m\d+s/);
    });

    it('should format hours correctly', () => {
      const state = {
        elapsed: {
          story_start: Date.now() - 3700000, // ~1 hour
          session_start: Date.now() - 3700000,
        },
      };

      const formatted = renderer.formatElapsedTime(state);

      expect(formatted.story).toMatch(/1h\d+m/);
    });

    it('should return -- for null timestamps', () => {
      const state = {
        elapsed: {
          story_start: null,
          session_start: Date.now(),
        },
      };

      const formatted = renderer.formatElapsedTime(state);

      expect(formatted.story).toBe('--');
    });
  });
});

describe('Constants', () => {
  describe('PanelMode', () => {
    it('should have minimal and detailed modes', () => {
      expect(PanelMode.MINIMAL).toBe('minimal');
      expect(PanelMode.DETAILED).toBe('detailed');
    });
  });

  describe('PipelineStage', () => {
    it('should have all required stages', () => {
      expect(PipelineStage.PRD).toBe('PRD');
      expect(PipelineStage.EPIC).toBe('Epic');
      expect(PipelineStage.STORY).toBe('Story');
      expect(PipelineStage.DEV).toBe('Dev');
      expect(PipelineStage.QA).toBe('QA');
      expect(PipelineStage.PUSH).toBe('Push');
    });
  });

  describe('Box drawing characters', () => {
    it('should have all required characters', () => {
      expect(BOX.topLeft).toBe('┌');
      expect(BOX.topRight).toBe('┐');
      expect(BOX.bottomLeft).toBe('└');
      expect(BOX.bottomRight).toBe('┘');
      expect(BOX.horizontal).toBe('─');
      expect(BOX.vertical).toBe('│');
    });
  });

  describe('Status indicators', () => {
    it('should have all required indicators', () => {
      expect(STATUS.completed).toBeDefined();
      expect(STATUS.current).toBeDefined();
      expect(STATUS.pending).toBeDefined();
      expect(STATUS.error).toBeDefined();
      expect(STATUS.bullet).toBeDefined();
    });
  });
});
