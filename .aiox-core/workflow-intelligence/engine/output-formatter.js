/**
 * @module OutputFormatter
 * @description CLI output formatting for *next task suggestions
 * @story WIS-3 - *next Task Implementation
 * @version 1.0.0
 */

'use strict';

/**
 * ANSI color codes for terminal output
 * Falls back gracefully if terminal doesn't support colors
 */
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
};

/**
 * Check if terminal supports colors
 * @returns {boolean} True if colors are supported
 */
function supportsColors() {
  // Check for NO_COLOR environment variable (standard)
  if (process.env.NO_COLOR !== undefined) {
    return false;
  }

  // Check for FORCE_COLOR
  if (process.env.FORCE_COLOR !== undefined) {
    return true;
  }

  // Check if stdout is a TTY
  if (process.stdout && typeof process.stdout.isTTY !== 'undefined') {
    return process.stdout.isTTY;
  }

  return false;
}

/**
 * Apply color to text (if supported)
 * @param {string} text - Text to color
 * @param {string} color - Color name
 * @returns {string} Colored text
 */
function colorize(text, color) {
  if (!supportsColors() || !colors[color]) {
    return text;
  }
  return `${colors[color]}${text}${colors.reset}`;
}

/**
 * Format confidence score for display
 * @param {number} confidence - Confidence value 0-1
 * @returns {string} Formatted confidence string
 */
function formatConfidence(confidence) {
  const percent = Math.round(confidence * 100);
  let color = 'green';

  if (percent < 50) {
    color = 'yellow';
  } else if (percent < 30) {
    color = 'gray';
  }

  return colorize(`${percent}%`, color);
}

/**
 * Format workflow name for display
 * @param {string} workflow - Workflow name
 * @returns {string} Formatted workflow name
 */
function formatWorkflowName(workflow) {
  if (!workflow) {
    return colorize('none detected', 'gray');
  }

  // Convert snake_case to Title Case
  return workflow
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Display suggestions in formatted CLI output
 * @param {Object} result - Suggestion result from SuggestionEngine
 */
function displaySuggestions(result) {
  const output = [];

  // Header with workflow info
  output.push('');
  output.push(colorize('  Workflow: ', 'cyan') + formatWorkflowName(result.workflow));

  if (result.currentState) {
    const stateDisplay = result.currentState.replace(/_/g, ' ');
    output.push(
      colorize('  State: ', 'cyan') +
        stateDisplay +
        ` (confidence: ${formatConfidence(result.confidence)})`,
    );
  } else {
    output.push(colorize('  State: ', 'cyan') + colorize('N/A', 'gray'));
  }

  output.push('');

  // Suggestions
  if (result.suggestions && result.suggestions.length > 0) {
    const header = result.isUncertain
      ? colorize('Possible next steps (uncertain):', 'yellow')
      : colorize('Next steps:', 'bold');
    output.push(header);
    output.push('');

    result.suggestions.forEach((suggestion, index) => {
      const num = colorize(`  ${index + 1}.`, 'cyan');
      const cmd = colorize(suggestion.command, 'green');
      const args = suggestion.args ? ` ${colorize(suggestion.args, 'gray')}` : '';
      const desc = suggestion.description ? colorize(` - ${suggestion.description}`, 'dim') : '';

      output.push(`${num} \`${cmd}${args}\`${desc}`);
    });

    output.push('');

    // Confidence note for uncertain suggestions
    if (result.isUncertain) {
      output.push(
        colorize('  Low confidence - context is unclear. Try providing --story flag.', 'yellow'),
      );
      output.push('');
    }
  } else {
    output.push(colorize('Unable to determine workflow from current context.', 'yellow'));
    output.push('');
    output.push('Try:');
    output.push(`  ${colorize('*next --story <path-to-story>', 'cyan')}`);
    output.push(`  ${colorize('*help', 'cyan')}`);
    output.push('');
  }

  console.log(output.join('\n'));
}

/**
 * Display fallback suggestions when WIS is unavailable
 * @param {Object} result - Fallback result
 */
function displayFallback(result) {
  const output = [];

  output.push('');
  output.push(colorize('  Workflow Intelligence unavailable', 'yellow'));
  output.push('');

  if (result && result.suggestions && result.suggestions.length > 0) {
    output.push(colorize('Generic suggestions:', 'bold'));
    output.push('');

    result.suggestions.forEach((suggestion, index) => {
      const num = colorize(`  ${index + 1}.`, 'cyan');
      const cmd = colorize(suggestion.command, 'green');
      const desc = suggestion.description ? colorize(` - ${suggestion.description}`, 'dim') : '';

      output.push(`${num} \`${cmd}\`${desc}`);
    });

    output.push('');
  }

  if (result && result.message) {
    output.push(colorize(`  ${result.message}`, 'gray'));
    output.push('');
  }

  console.log(output.join('\n'));
}

/**
 * Display help text for *next command
 */
function displayHelp() {
  const output = [];

  output.push('');
  output.push(colorize('Usage:', 'bold') + ' *next [options]');
  output.push('');
  output.push('Suggests next commands based on current workflow context.');
  output.push('');
  output.push(colorize('Options:', 'bold'));
  output.push(`  ${colorize('--story <path>', 'cyan')}  Explicit story path for context`);
  output.push(`  ${colorize('--all', 'cyan')}           Show all suggestions (not just top 3)`);
  output.push(`  ${colorize('--help', 'cyan')}          Show this help message`);
  output.push('');
  output.push(colorize('Examples:', 'bold'));
  output.push(
    `  ${colorize('*next', 'green')}                                    ${colorize('# Auto-detect context', 'dim')}`,
  );
  output.push(`  ${colorize('*next --story docs/stories/v4.0.4/sprint-10/story-wis-3.md', 'green')}`);
  output.push(
    `  ${colorize('*next --all', 'green')}                              ${colorize('# Show all suggestions', 'dim')}`,
  );
  output.push('');
  output.push(colorize('How it works:', 'bold'));
  output.push('  1. Analyzes your recent commands and current agent');
  output.push('  2. Matches to known workflow patterns (story development, epic creation, etc.)');
  output.push('  3. Determines your current state in the workflow');
  output.push('  4. Suggests most likely next commands with confidence scores');
  output.push('');
  output.push(colorize('Workflow detection uses:', 'bold'));
  output.push('  - Recent command history (last 10 commands)');
  output.push('  - Current active agent');
  output.push('  - Git branch and status');
  output.push('  - Active story (if any)');
  output.push('');

  console.log(output.join('\n'));
}

/**
 * Display context information (debug mode)
 * @param {Object} context - Built context object
 */
function displayContext(context) {
  const output = [];

  output.push('');
  output.push(colorize('Context Information:', 'bold'));
  output.push(`  ${colorize('Agent:', 'cyan')} @${context.agentId || 'unknown'}`);
  output.push(`  ${colorize('Last Command:', 'cyan')} ${context.lastCommand || 'none'}`);

  if (context.lastCommands && context.lastCommands.length > 0) {
    output.push(
      `  ${colorize('Recent Commands:', 'cyan')} ${context.lastCommands.slice(-5).join(', ')}`,
    );
  }

  output.push(`  ${colorize('Story:', 'cyan')} ${context.storyPath || 'none'}`);
  output.push(`  ${colorize('Branch:', 'cyan')} ${context.branch || 'none'}`);

  if (context.projectState) {
    output.push(
      `  ${colorize('Workflow Phase:', 'cyan')} ${context.projectState.workflowPhase || 'unknown'}`,
    );
  }

  output.push('');

  console.log(output.join('\n'));
}

/**
 * Display error message
 * @param {string} message - Error message
 */
function displayError(message) {
  console.log('');
  console.log(colorize(`  Error: ${message}`, 'yellow'));
  console.log('');
}

/**
 * Display success message after executing a suggestion
 * @param {string} command - Command that was executed
 */
function displayExecuting(command) {
  console.log('');
  console.log(colorize(`  Executing: ${command}`, 'green'));
  console.log('');
}

module.exports = {
  displaySuggestions,
  displayFallback,
  displayHelp,
  displayContext,
  displayError,
  displayExecuting,
  formatConfidence,
  formatWorkflowName,
  colorize,
  supportsColors,
  colors,
};
