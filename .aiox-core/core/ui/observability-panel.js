/**
 * Observability Panel Module
 *
 * Story 11.6: Projeto Bob - Painel de Observabilidade CLI
 *
 * Provides a CLI status panel showing Bob's current work:
 * - Current agent
 * - Pipeline progress
 * - Active terminals
 * - Elapsed time
 *
 * Supports two modes:
 * - minimal: pipeline + errors only (default)
 * - detailed: reasoning + trade-offs + agent explanations
 *
 * @module core/ui/observability-panel
 * @version 1.0.0
 */

'use strict';

const { PanelRenderer } = require('./panel-renderer');

/**
 * Panel modes
 * @enum {string}
 */
const PanelMode = {
  MINIMAL: 'minimal',
  DETAILED: 'detailed',
};

/**
 * Pipeline stages
 * @enum {string}
 */
const PipelineStage = {
  PRD: 'PRD',
  EPIC: 'Epic',
  STORY: 'Story',
  DEV: 'Dev',
  QA: 'QA',
  PUSH: 'Push',
};

/**
 * Default panel state
 * @returns {Object} Initial panel state
 */
function createDefaultState() {
  return {
    mode: PanelMode.MINIMAL,
    refresh_rate: 1000,

    pipeline: {
      stages: Object.values(PipelineStage),
      current_stage: null,
      story_progress: '0/0',
      completed_stages: [],
    },

    current_agent: {
      id: null,
      name: null,
      task: null,
      reason: null,
    },

    active_terminals: {
      count: 0,
      list: [],
    },

    elapsed: {
      story_start: null,
      session_start: null,
    },

    tradeoffs: [],

    errors: [],

    next_steps: [],
  };
}

/**
 * Observability Panel class
 */
class ObservabilityPanel {
  /**
   * Creates a new ObservabilityPanel instance
   * @param {Object} options - Panel options
   */
  constructor(options = {}) {
    this.options = {
      refreshRate: 1000,
      mode: PanelMode.MINIMAL,
      width: 60,
      ...options,
    };

    this.state = createDefaultState();
    this.state.mode = this.options.mode;
    this.state.refresh_rate = this.options.refreshRate;
    this.state.elapsed.session_start = Date.now();

    this.renderer = new PanelRenderer({ width: this.options.width });
    this.refreshInterval = null;
    this.isRunning = false;
  }

  /**
   * Starts the panel refresh loop
   * @returns {void}
   */
  start() {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    this.render();

    this.refreshInterval = setInterval(() => {
      this.render();
    }, this.state.refresh_rate);
  }

  /**
   * Stops the panel refresh loop
   * @returns {void}
   */
  stop() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
    this.isRunning = false;
    this.clearPanel();
  }

  /**
   * Renders the panel to the terminal
   * @returns {void}
   */
  render() {
    const output = this.state.mode === PanelMode.DETAILED
      ? this.renderer.renderDetailed(this.state)
      : this.renderer.renderMinimal(this.state);

    this.clearPanel();
    process.stdout.write(output);
  }

  /**
   * Clears the panel from the terminal
   * @returns {void}
   */
  clearPanel() {
    // Move cursor up and clear lines
    const lineCount = this.state.mode === PanelMode.DETAILED ? 20 : 8;
    process.stdout.write(`\x1B[${lineCount}A\x1B[0J`);
  }

  /**
   * Updates the panel state
   * @param {Object} updates - State updates
   * @returns {void}
   */
  updateState(updates) {
    if (updates.pipeline) {
      this.state.pipeline = { ...this.state.pipeline, ...updates.pipeline };
    }

    if (updates.current_agent) {
      this.state.current_agent = { ...this.state.current_agent, ...updates.current_agent };
    }

    if (updates.active_terminals) {
      this.state.active_terminals = { ...this.state.active_terminals, ...updates.active_terminals };
    }

    if (updates.tradeoffs) {
      this.state.tradeoffs = updates.tradeoffs;
    }

    if (updates.errors) {
      this.state.errors = updates.errors;
    }

    if (updates.next_steps) {
      this.state.next_steps = updates.next_steps;
    }
  }

  /**
   * Sets the current agent
   * @param {string} id - Agent ID (e.g., '@dev')
   * @param {string} name - Agent name (e.g., 'Dex')
   * @param {string} task - Current task
   * @param {string} reason - Why this agent (detailed mode only)
   * @returns {void}
   */
  setCurrentAgent(id, name, task, reason = null) {
    this.state.current_agent = { id, name, task, reason };
  }

  /**
   * Sets the current pipeline stage
   * @param {string} stage - Stage name from PipelineStage
   * @param {string} storyProgress - Progress string (e.g., '3/8')
   * @returns {void}
   */
  setPipelineStage(stage, storyProgress = null) {
    this.state.pipeline.current_stage = stage;
    if (storyProgress) {
      this.state.pipeline.story_progress = storyProgress;
    }
  }

  /**
   * Marks a pipeline stage as completed
   * @param {string} stage - Stage name from PipelineStage
   * @returns {void}
   */
  completePipelineStage(stage) {
    if (!this.state.pipeline.completed_stages.includes(stage)) {
      this.state.pipeline.completed_stages.push(stage);
    }
  }

  /**
   * Adds an active terminal
   * @param {string} agent - Agent ID
   * @param {number} pid - Process ID
   * @param {string} task - Current task
   * @returns {void}
   */
  addTerminal(agent, pid, task) {
    const terminal = { agent, pid, task };
    this.state.active_terminals.list.push(terminal);
    this.state.active_terminals.count = this.state.active_terminals.list.length;
  }

  /**
   * Removes an active terminal
   * @param {number} pid - Process ID to remove
   * @returns {void}
   */
  removeTerminal(pid) {
    this.state.active_terminals.list = this.state.active_terminals.list.filter(
      (t) => t.pid !== pid,
    );
    this.state.active_terminals.count = this.state.active_terminals.list.length;
  }

  /**
   * Starts story timer
   * @returns {void}
   */
  startStoryTimer() {
    this.state.elapsed.story_start = Date.now();
  }

  /**
   * Adds a trade-off decision (detailed mode)
   * @param {string} choice - The choice made (e.g., 'JWT vs Session')
   * @param {string} selected - Selected option (e.g., 'JWT')
   * @param {string} reason - Reason for the choice
   * @returns {void}
   */
  addTradeoff(choice, selected, reason) {
    this.state.tradeoffs.push({ choice, selected, reason });
  }

  /**
   * Adds an error to display
   * @param {string} message - Error message
   * @returns {void}
   */
  addError(message) {
    this.state.errors.push({ message, timestamp: Date.now() });
  }

  /**
   * Clears errors
   * @returns {void}
   */
  clearErrors() {
    this.state.errors = [];
  }

  /**
   * Sets next steps (detailed mode)
   * @param {string[]} steps - Array of next step descriptions
   * @returns {void}
   */
  setNextSteps(steps) {
    this.state.next_steps = steps;
  }

  /**
   * Toggles between minimal and detailed mode
   * @returns {string} Current mode after toggle
   */
  toggleMode() {
    this.state.mode = this.state.mode === PanelMode.MINIMAL
      ? PanelMode.DETAILED
      : PanelMode.MINIMAL;
    return this.state.mode;
  }

  /**
   * Sets the panel mode
   * @param {string} mode - Mode from PanelMode
   * @returns {void}
   */
  setMode(mode) {
    if (Object.values(PanelMode).includes(mode)) {
      this.state.mode = mode;
    }
  }

  /**
   * Gets elapsed time strings
   * @returns {Object} Formatted elapsed times
   */
  getElapsedTime() {
    const now = Date.now();

    const formatDuration = (ms) => {
      if (!ms || ms < 0) return '0s';
      const seconds = Math.floor(ms / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);

      if (hours > 0) {
        return `${hours}h${minutes % 60}m`;
      }
      if (minutes > 0) {
        return `${minutes}m${seconds % 60}s`;
      }
      return `${seconds}s`;
    };

    return {
      story: this.state.elapsed.story_start
        ? formatDuration(now - this.state.elapsed.story_start)
        : '--',
      session: this.state.elapsed.session_start
        ? formatDuration(now - this.state.elapsed.session_start)
        : '--',
    };
  }

  /**
   * Gets the current state (for external consumers)
   * @returns {Object} Current panel state
   */
  getState() {
    return {
      ...this.state,
      elapsed: this.getElapsedTime(),
    };
  }

  /**
   * Renders panel once without starting the loop (for testing)
   * @returns {string} Rendered panel output
   */
  renderOnce() {
    return this.state.mode === PanelMode.DETAILED
      ? this.renderer.renderDetailed(this.state)
      : this.renderer.renderMinimal(this.state);
  }
}

/**
 * Creates a new ObservabilityPanel instance
 * @param {Object} options - Panel options
 * @returns {ObservabilityPanel} Panel instance
 */
function createPanel(options = {}) {
  return new ObservabilityPanel(options);
}

module.exports = {
  ObservabilityPanel,
  createPanel,
  PanelMode,
  PipelineStage,
  createDefaultState,
};
