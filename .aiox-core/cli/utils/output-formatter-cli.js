/**
 * CLI Output Formatter
 *
 * Formats search results for CLI output in table, JSON, or YAML format.
 *
 * @module cli/utils/output-formatter-cli
 * @version 1.0.0
 * @story 2.7 - Discovery CLI Search
 */

const yaml = require('js-yaml');

/**
 * Format output based on specified format
 * @param {Array} results - Search results
 * @param {object} options - Formatting options
 * @param {string} options.format - Output format: table, json, yaml
 * @param {string} options.query - Original search query
 * @param {string} options.duration - Search duration
 * @param {string} options.searchMethod - Search method used
 * @param {boolean} options.verbose - Show verbose output
 * @returns {string} Formatted output string
 */
function formatOutput(results, options = {}) {
  const { format = 'table', query, duration, searchMethod, verbose } = options;

  switch (format.toLowerCase()) {
    case 'json':
      return formatJSON(results, options);
    case 'yaml':
      return formatYAML(results, options);
    case 'table':
    default:
      return formatTable(results, options);
  }
}

/**
 * Format results as table
 * @param {Array} results - Search results
 * @param {object} options - Options
 * @returns {string} Table formatted string
 */
function formatTable(results, options = {}) {
  const { query = '', duration = '0', searchMethod = 'keyword', verbose = false } = options;

  if (results.length === 0) {
    return `No workers found matching "${query}".\n\nTry different search terms or check available categories with 'aiox workers list --categories'.`;
  }

  // Header
  let output = `Found ${results.length} worker${results.length !== 1 ? 's' : ''} (took ${duration}s):\n\n`;

  // Column widths
  const idWidth = Math.min(25, Math.max(4, ...results.map(r => r.id.length)));
  const nameWidth = Math.min(30, Math.max(4, ...results.map(r => r.name.length)));
  const categoryWidth = Math.min(15, Math.max(8, ...results.map(r => (r.category || '').length)));

  // Table header
  output += `  ${'#'.padEnd(3)}  ${'ID'.padEnd(idWidth)}  ${'NAME'.padEnd(nameWidth)}  ${'CATEGORY'.padEnd(categoryWidth)}  SCORE\n`;
  output += `  ${'─'.repeat(3)}  ${'─'.repeat(idWidth)}  ${'─'.repeat(nameWidth)}  ${'─'.repeat(categoryWidth)}  ${'─'.repeat(5)}\n`;

  // Table rows
  results.forEach((result, index) => {
    const num = (index + 1).toString().padEnd(3);
    const id = truncate(result.id, idWidth).padEnd(idWidth);
    const name = truncate(result.name, nameWidth).padEnd(nameWidth);
    const category = truncate(result.category || '', categoryWidth).padEnd(categoryWidth);
    const score = `${result.score}%`;

    output += `  ${num}  ${id}  ${name}  ${category}  ${score}\n`;
  });

  // Footer
  output += '\nUse \'aiox workers info <id>\' for details.';

  // Verbose info
  if (verbose) {
    output += `\n\n[Debug: method=${searchMethod}]`;
  }

  return output;
}

/**
 * Format results as JSON
 * @param {Array} results - Search results
 * @param {object} options - Options
 * @returns {string} JSON formatted string
 */
function formatJSON(results, options = {}) {
  const output = results.map(result => ({
    id: result.id,
    name: result.name,
    description: result.description,
    category: result.category,
    subcategory: result.subcategory || null,
    tags: result.tags || [],
    score: result.score,
    path: result.path,
  }));

  return JSON.stringify(output, null, 2);
}

/**
 * Format results as YAML
 * @param {Array} results - Search results
 * @param {object} options - Options
 * @returns {string} YAML formatted string
 */
function formatYAML(results, options = {}) {
  const output = results.map(result => ({
    id: result.id,
    name: result.name,
    description: result.description,
    category: result.category,
    subcategory: result.subcategory || null,
    tags: result.tags || [],
    score: result.score,
    path: result.path,
  }));

  return yaml.dump(output, {
    indent: 2,
    lineWidth: 120,
    noRefs: true,
  });
}

/**
 * Truncate string with ellipsis
 * @param {string} str - String to truncate
 * @param {number} maxLen - Maximum length
 * @returns {string} Truncated string
 */
function truncate(str, maxLen) {
  if (!str) return '';
  if (str.length <= maxLen) return str;
  return str.substring(0, maxLen - 1) + '…';
}

/**
 * Format a single worker for detailed view
 * @param {object} worker - Worker object
 * @returns {string} Formatted worker details
 */
function formatWorkerDetails(worker) {
  let output = '';

  output += `📦 ${worker.name}\n`;
  output += `${'─'.repeat(40)}\n`;
  output += `ID:          ${worker.id}\n`;
  output += `Category:    ${worker.category}`;
  if (worker.subcategory) {
    output += ` / ${worker.subcategory}`;
  }
  output += '\n';

  output += `\n📝 Description:\n${worker.description}\n`;

  if (worker.tags && worker.tags.length > 0) {
    output += `\n🏷️  Tags: ${worker.tags.join(', ')}\n`;
  }

  if (worker.inputs && worker.inputs.length > 0) {
    output += '\n📥 Inputs:\n';
    worker.inputs.forEach(input => {
      output += `   • ${input}\n`;
    });
  }

  if (worker.outputs && worker.outputs.length > 0) {
    output += '\n📤 Outputs:\n';
    worker.outputs.forEach(out => {
      output += `   • ${out}\n`;
    });
  }

  output += `\n📁 Path: ${worker.path}\n`;
  output += `📋 Format: ${worker.taskFormat}\n`;

  if (worker.executorTypes && worker.executorTypes.length > 0) {
    output += `⚙️  Executors: ${worker.executorTypes.join(', ')}\n`;
  }

  if (worker.performance) {
    output += '\n⏱️  Performance:\n';
    if (worker.performance.avgDuration) {
      output += `   • Avg Duration: ${worker.performance.avgDuration}\n`;
    }
    if (worker.performance.cacheable !== undefined) {
      output += `   • Cacheable: ${worker.performance.cacheable ? 'Yes' : 'No'}\n`;
    }
    if (worker.performance.parallelizable !== undefined) {
      output += `   • Parallelizable: ${worker.performance.parallelizable ? 'Yes' : 'No'}\n`;
    }
  }

  return output;
}

/**
 * Format category summary
 * @param {object} categories - Categories object from registry
 * @returns {string} Formatted categories
 */
function formatCategories(categories) {
  let output = 'Available Categories:\n\n';

  const sortedCategories = Object.entries(categories)
    .sort((a, b) => b[1].count - a[1].count);

  for (const [name, data] of sortedCategories) {
    output += `  ${name.padEnd(20)} ${data.count.toString().padStart(4)} workers\n`;
    if (data.subcategories && data.subcategories.length > 0) {
      output += `    └─ ${data.subcategories.join(', ')}\n`;
    }
  }

  return output;
}

module.exports = {
  formatOutput,
  formatTable,
  formatJSON,
  formatYAML,
  formatWorkerDetails,
  formatCategories,
  truncate,
};
