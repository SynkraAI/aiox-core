/**
 * Info Command Formatter
 *
 * Formats worker information for pretty, JSON, and YAML output.
 *
 * @module cli/commands/workers/formatters/info-formatter
 * @version 1.0.0
 * @story 2.8-2.9 - Discovery CLI Info & List
 */

const yaml = require('js-yaml');

/**
 * Box drawing characters
 */
const BOX = {
  horizontal: '━',
  vertical: '│',
  topLeft: '┌',
  topRight: '┐',
  bottomLeft: '└',
  bottomRight: '┘',
};

/**
 * Format worker info as pretty text with boxes
 * @param {object} worker - Worker object
 * @param {object} options - Formatting options
 * @param {Array} options.relatedWorkers - Related workers
 * @param {boolean} options.verbose - Show verbose output
 * @returns {string} Formatted output
 */
function formatInfoPretty(worker, options = {}) {
  const { relatedWorkers = [], verbose = false } = options;
  const lineWidth = 50;

  let output = '';

  // Header with worker name
  output += `\n📦 ${worker.name}\n`;
  output += BOX.horizontal.repeat(lineWidth) + '\n\n';

  // Metadata section
  output += `ID:           ${worker.id}\n`;
  output += `Category:     ${worker.category}`;
  if (worker.subcategory) {
    output += ` / ${worker.subcategory}`;
  }
  output += '\n';
  output += `Executor:     ${(worker.executorTypes || ['Agent']).join(', ')}\n`;
  output += `Task Format:  ${worker.taskFormat || 'TASK-FORMAT-V1'}\n`;
  output += `Path:         ${worker.path}\n`;

  // Description section
  output += '\nDescription:\n';
  const description = worker.description || 'No description available';
  // Word wrap description at ~60 chars
  const wrapped = wrapText(description, 58);
  wrapped.forEach(line => {
    output += `  ${line}\n`;
  });

  // Inputs section
  if (worker.inputs && worker.inputs.length > 0) {
    output += '\nInputs:\n';
    worker.inputs.forEach(input => {
      output += `  - ${input}\n`;
    });
  }

  // Outputs section
  if (worker.outputs && worker.outputs.length > 0) {
    output += '\nOutputs:\n';
    worker.outputs.forEach(out => {
      output += `  - ${out}\n`;
    });
  }

  // Performance section
  if (worker.performance) {
    output += '\nPerformance:\n';
    if (worker.performance.avgDuration) {
      output += `  Avg Duration:    ${worker.performance.avgDuration}\n`;
    }
    if (worker.performance.cacheable !== undefined) {
      output += `  Cacheable:       ${worker.performance.cacheable ? 'Yes' : 'No'}\n`;
    }
    if (worker.performance.parallelizable !== undefined) {
      output += `  Parallelizable:  ${worker.performance.parallelizable ? 'Yes' : 'No'}\n`;
    }
  }

  // Tags section
  if (worker.tags && worker.tags.length > 0) {
    output += `\nTags: ${worker.tags.join(', ')}\n`;
  }

  // Agents section
  if (worker.agents && worker.agents.length > 0) {
    output += `\nAgents: ${worker.agents.map(a => '@' + a).join(', ')}\n`;
  }

  output += '\n' + BOX.horizontal.repeat(lineWidth) + '\n';

  // Usage example section
  output += '\nUsage Example:\n';
  output += `  aiox task run ${worker.id}\n`;

  // Related workers section
  if (relatedWorkers.length > 0) {
    output += '\nRelated Workers:\n';
    relatedWorkers.slice(0, 5).forEach(related => {
      output += `  - ${related.id}\n`;
    });
  }

  // Verbose debug info
  if (verbose) {
    output += '\n[Debug Info]\n';
    output += `  Source: ${worker.metadata?.source || 'unknown'}\n`;
    output += `  Added Version: ${worker.metadata?.addedVersion || 'unknown'}\n`;
    if (worker.path) {
      output += `  Full Path: ${worker.path}\n`;
    }
  }

  return output;
}

/**
 * Format worker info as JSON
 * @param {object} worker - Worker object
 * @param {object} options - Formatting options
 * @param {Array} options.relatedWorkers - Related workers
 * @returns {string} JSON string
 */
function formatInfoJSON(worker, options = {}) {
  const { relatedWorkers = [] } = options;

  const output = {
    id: worker.id,
    name: worker.name,
    description: worker.description,
    category: worker.category,
    subcategory: worker.subcategory || null,
    inputs: worker.inputs || [],
    outputs: worker.outputs || [],
    tags: worker.tags || [],
    path: worker.path,
    taskFormat: worker.taskFormat,
    executorTypes: worker.executorTypes || [],
    performance: worker.performance || null,
    agents: worker.agents || [],
    metadata: worker.metadata || {},
    relatedWorkers: relatedWorkers.slice(0, 5).map(w => w.id),
  };

  return JSON.stringify(output, null, 2);
}

/**
 * Format worker info as YAML
 * @param {object} worker - Worker object
 * @param {object} options - Formatting options
 * @param {Array} options.relatedWorkers - Related workers
 * @returns {string} YAML string
 */
function formatInfoYAML(worker, options = {}) {
  const { relatedWorkers = [] } = options;

  const output = {
    id: worker.id,
    name: worker.name,
    description: worker.description,
    category: worker.category,
    subcategory: worker.subcategory || null,
    inputs: worker.inputs || [],
    outputs: worker.outputs || [],
    tags: worker.tags || [],
    path: worker.path,
    taskFormat: worker.taskFormat,
    executorTypes: worker.executorTypes || [],
    performance: worker.performance || null,
    agents: worker.agents || [],
    metadata: worker.metadata || {},
    relatedWorkers: relatedWorkers.slice(0, 5).map(w => w.id),
  };

  return yaml.dump(output, {
    indent: 2,
    lineWidth: 120,
    noRefs: true,
  });
}

/**
 * Format info output based on format option
 * @param {object} worker - Worker object
 * @param {object} options - Formatting options
 * @param {string} options.format - Output format (pretty, json, yaml)
 * @param {Array} options.relatedWorkers - Related workers
 * @param {boolean} options.verbose - Show verbose output
 * @returns {string} Formatted output
 */
function formatInfo(worker, options = {}) {
  const format = (options.format || 'pretty').toLowerCase();

  switch (format) {
    case 'json':
      return formatInfoJSON(worker, options);
    case 'yaml':
      return formatInfoYAML(worker, options);
    case 'pretty':
    default:
      return formatInfoPretty(worker, options);
  }
}

/**
 * Format error message with suggestions
 * @param {string} id - Invalid worker ID
 * @param {Array} suggestions - Array of suggested workers
 * @returns {string} Formatted error message
 */
function formatNotFoundError(id, suggestions = []) {
  let output = `Error: Worker '${id}' not found in registry.\n`;

  if (suggestions.length > 0) {
    output += '\nDid you mean:\n';
    suggestions.slice(0, 5).forEach(worker => {
      output += `  - ${worker.id}\n`;
    });
  }

  output += `\nUse 'aiox workers search ${id}' to find workers.`;

  return output;
}

/**
 * Wrap text to specified width
 * @param {string} text - Text to wrap
 * @param {number} width - Max line width
 * @returns {Array<string>} Array of wrapped lines
 */
function wrapText(text, width) {
  if (!text) return [''];

  const words = text.split(/\s+/);
  const lines = [];
  let currentLine = '';

  for (const word of words) {
    if (currentLine.length + word.length + 1 <= width) {
      currentLine += (currentLine ? ' ' : '') + word;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }

  if (currentLine) lines.push(currentLine);

  return lines.length > 0 ? lines : [''];
}

module.exports = {
  formatInfo,
  formatInfoPretty,
  formatInfoJSON,
  formatInfoYAML,
  formatNotFoundError,
  wrapText,
};
