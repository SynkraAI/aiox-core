/**
 * Panel Renderer Module
 *
 * Story 11.6: Projeto Bob - Painel de Observabilidade CLI
 *
 * Handles rendering of the observability panel in the terminal
 * using box drawing characters and ANSI colors via chalk.
 *
 * @module core/ui/panel-renderer
 * @version 1.0.0
 */

'use strict';

const chalk = require('chalk');

/**
 * Box drawing characters (Unicode)
 */
const BOX = {
  topLeft: '┌',
  topRight: '┐',
  bottomLeft: '└',
  bottomRight: '┘',
  horizontal: '─',
  vertical: '│',
  teeRight: '├',
  teeLeft: '┤',
};

/**
 * Status indicators
 */
const STATUS = {
  completed: chalk.green('✓'),
  current: chalk.yellow('●'),
  pending: chalk.gray('○'),
  error: chalk.red('✗'),
  bullet: chalk.gray('•'),
};

/**
 * Panel Renderer class
 */
class PanelRenderer {
  /**
   * Creates a new PanelRenderer instance
   * @param {Object} options - Renderer options
   */
  constructor(options = {}) {
    this.options = {
      width: 60,
      ...options,
    };
  }

  /**
   * Creates a horizontal line
   * @param {number} width - Line width
   * @returns {string} Horizontal line
   */
  horizontalLine(width = this.options.width) {
    return BOX.horizontal.repeat(width - 2);
  }

  /**
   * Creates a top border
   * @param {number} width - Border width
   * @returns {string} Top border line
   */
  topBorder(width = this.options.width) {
    return chalk.cyan(`${BOX.topLeft}${this.horizontalLine(width)}${BOX.topRight}`);
  }

  /**
   * Creates a bottom border
   * @param {number} width - Border width
   * @returns {string} Bottom border line
   */
  bottomBorder(width = this.options.width) {
    return chalk.cyan(`${BOX.bottomLeft}${this.horizontalLine(width)}${BOX.bottomRight}`);
  }

  /**
   * Creates a separator line
   * @param {number} width - Line width
   * @returns {string} Separator line
   */
  separator(width = this.options.width) {
    return chalk.cyan(`${BOX.teeRight}${this.horizontalLine(width)}${BOX.teeLeft}`);
  }

  /**
   * Creates a content line with borders
   * @param {string} content - Line content
   * @param {number} width - Total line width
   * @returns {string} Bordered content line
   */
  contentLine(content, width = this.options.width) {
    const stripped = this.stripAnsi(content);
    const padding = width - stripped.length - 4;
    const paddedContent = content + ' '.repeat(Math.max(0, padding));
    return `${chalk.cyan(BOX.vertical)} ${paddedContent} ${chalk.cyan(BOX.vertical)}`;
  }

  /**
   * Strips ANSI codes from string for length calculation
   * @param {string} str - String with potential ANSI codes
   * @returns {string} String without ANSI codes
   */
  stripAnsi(str) {
    // eslint-disable-next-line no-control-regex
    return str.replace(/\x1B\[[0-9;]*[a-zA-Z]/g, '');
  }

  /**
   * Formats elapsed time for display
   * @param {Object} state - Panel state
   * @returns {Object} Formatted times
   */
  formatElapsedTime(state) {
    const now = Date.now();

    const formatDuration = (ms) => {
      if (!ms || ms < 0) return '--';
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
      story: state.elapsed.story_start
        ? formatDuration(now - state.elapsed.story_start)
        : '--',
      session: state.elapsed.session_start
        ? formatDuration(now - state.elapsed.session_start)
        : '--',
    };
  }

  /**
   * Renders the pipeline progress
   * @param {Object} pipeline - Pipeline state
   * @returns {string} Formatted pipeline string
   */
  renderPipeline(pipeline) {
    const parts = pipeline.stages.map((stage) => {
      const isCompleted = pipeline.completed_stages.includes(stage);
      const isCurrent = pipeline.current_stage === stage;

      if (stage === 'Story') {
        // Show story progress
        const progress = pipeline.story_progress || '0/0';
        if (isCurrent) {
          return chalk.yellow(`[${progress}]`);
        }
        if (isCompleted) {
          return chalk.green(`[${progress} ${STATUS.completed}]`);
        }
        return chalk.gray(`[${progress}]`);
      }

      if (isCompleted) {
        return chalk.green(`[${stage} ${STATUS.completed}]`);
      }
      if (isCurrent) {
        return chalk.yellow(`[${stage} ${STATUS.current}]`);
      }
      return chalk.gray(`[${stage}]`);
    });

    return parts.join(chalk.gray(' → '));
  }

  /**
   * Renders the minimal mode panel
   * @param {Object} state - Panel state
   * @returns {string} Rendered panel
   */
  renderMinimal(state) {
    const lines = [];
    const w = this.options.width;
    const elapsed = this.formatElapsedTime(state);

    // Header
    lines.push(this.topBorder(w));
    lines.push(this.contentLine(chalk.bold.cyan('🔧 Bob Status'), w));
    lines.push(this.separator(w));

    // Pipeline
    const pipelineStr = `Pipeline: ${this.renderPipeline(state.pipeline)}`;
    lines.push(this.contentLine(pipelineStr, w));

    // Current Agent
    const agentId = state.current_agent.id || '--';
    const agentTask = state.current_agent.task || 'idle';
    lines.push(this.contentLine(`Current:  ${chalk.yellow(`[${agentId}]`)} ${agentTask}`, w));

    // Active Terminals
    const termCount = state.active_terminals.count;
    const termAgents = state.active_terminals.list
      .map((t) => t.agent)
      .slice(0, 3)
      .join(', ');
    const termStr = termCount > 0
      ? `${termCount} active (${termAgents})`
      : chalk.gray('none');
    lines.push(this.contentLine(`Terminals: ${termStr}`, w));

    // Elapsed Time
    lines.push(this.contentLine(
      `Elapsed:  ${chalk.cyan(elapsed.story)} (story) | ${chalk.cyan(elapsed.session)} (session)`,
      w,
    ));

    // Errors (if any)
    if (state.errors.length > 0) {
      lines.push(this.separator(w));
      const errorMsg = state.errors[state.errors.length - 1].message;
      lines.push(this.contentLine(`${STATUS.error} ${chalk.red(errorMsg.slice(0, 50))}`, w));
    }

    // Footer
    lines.push(this.bottomBorder(w));

    return lines.join('\n') + '\n';
  }

  /**
   * Renders the detailed mode panel
   * @param {Object} state - Panel state
   * @returns {string} Rendered panel
   */
  renderDetailed(state) {
    const lines = [];
    const w = this.options.width;
    const elapsed = this.formatElapsedTime(state);

    // Header
    lines.push(this.topBorder(w));
    lines.push(this.contentLine(chalk.bold.cyan('🔧 Bob Status — Modo Educativo'), w));
    lines.push(this.separator(w));

    // Pipeline section
    lines.push(this.contentLine(chalk.bold('Pipeline:'), w));
    lines.push(this.contentLine(`  ${this.renderPipeline(state.pipeline)}`, w));
    lines.push(this.contentLine('', w));

    // Current Agent section
    lines.push(this.contentLine(chalk.bold('Current Agent:'), w));
    const agentId = state.current_agent.id || '--';
    const agentName = state.current_agent.name || '';
    const agentTask = state.current_agent.task || 'idle';
    lines.push(this.contentLine(
      `  ${chalk.yellow(agentId)} ${agentName ? `(${agentName})` : ''} ${agentTask}`,
      w,
    ));
    if (state.current_agent.reason) {
      lines.push(this.contentLine(
        `  ${chalk.gray(`Por que ${agentId}?`)} ${state.current_agent.reason}`,
        w,
      ));
    }
    lines.push(this.contentLine('', w));

    // Active Terminals section
    lines.push(this.contentLine(chalk.bold('Active Terminals:'), w));
    if (state.active_terminals.list.length > 0) {
      state.active_terminals.list.slice(0, 4).forEach((terminal) => {
        const pidStr = terminal.pid ? `(PID ${terminal.pid})` : '';
        lines.push(this.contentLine(
          `  ${STATUS.bullet} ${chalk.yellow(terminal.agent.padEnd(12))} ${chalk.gray(pidStr)} — ${terminal.task}`,
          w,
        ));
      });
    } else {
      lines.push(this.contentLine(`  ${chalk.gray('No active terminals')}`, w));
    }
    lines.push(this.contentLine('', w));

    // Elapsed Time section
    lines.push(this.contentLine(chalk.bold('Elapsed:'), w));
    lines.push(this.contentLine(
      `  Story: ${chalk.cyan(elapsed.story)} | Session: ${chalk.cyan(elapsed.session)}`,
      w,
    ));
    lines.push(this.contentLine('', w));

    // Trade-offs section (if any)
    if (state.tradeoffs.length > 0) {
      lines.push(this.contentLine(chalk.bold('Trade-offs considerados:'), w));
      state.tradeoffs.slice(-3).forEach((tradeoff) => {
        lines.push(this.contentLine(
          `  ${STATUS.bullet} ${tradeoff.choice}: ${chalk.green(tradeoff.selected)} (${tradeoff.reason})`,
          w,
        ));
      });
      lines.push(this.contentLine('', w));
    }

    // Next Steps section (if any)
    if (state.next_steps.length > 0) {
      lines.push(this.contentLine(chalk.bold('Next Steps:'), w));
      state.next_steps.slice(0, 3).forEach((step, i) => {
        lines.push(this.contentLine(`  ${i + 1}. ${step}`, w));
      });
    }

    // Errors (if any)
    if (state.errors.length > 0) {
      lines.push(this.separator(w));
      lines.push(this.contentLine(chalk.bold.red('Errors:'), w));
      state.errors.slice(-2).forEach((error) => {
        lines.push(this.contentLine(`  ${STATUS.error} ${chalk.red(error.message.slice(0, 45))}`, w));
      });
    }

    // Footer
    lines.push(this.bottomBorder(w));

    return lines.join('\n') + '\n';
  }
}

module.exports = {
  PanelRenderer,
  BOX,
  STATUS,
};
