/**
 * List Table Formatter
 *
 * Formats worker list as a table with columns.
 *
 * @module cli/commands/workers/formatters/list-table
 * @version 1.0.0
 * @story 2.8-2.9 - Discovery CLI Info & List
 */

const yaml = require('js-yaml');

/**
 * Column definitions with default widths
 */
const COLUMNS = {
  num: { header: '#', width: 4 },
  id: { header: 'ID', width: 30 },
  name: { header: 'NAME', width: 30 },
  category: { header: 'CATEGORY', width: 12 },
  subcategory: { header: 'SUBCATEGORY', width: 15 },
};

/**
 * Format workers as table
 * @param {Array} workers - Array of workers
 * @param {object} options - Formatting options
 * @param {object} options.pagination - Pagination info
 * @param {boolean} options.verbose - Show verbose output
 * @returns {string} Table formatted output
 */
function formatTable(workers, options = {}) {
  const { pagination, verbose = false } = options;

  if (workers.length === 0) {
    return 'No workers found.\n';
  }

  // Calculate dynamic column widths based on content
  const idWidth = Math.min(35, Math.max(COLUMNS.id.width, ...workers.map(w => w.id.length)));
  const nameWidth = Math.min(35, Math.max(COLUMNS.name.width, ...workers.map(w => w.name.length)));
  const categoryWidth = Math.min(15, Math.max(COLUMNS.category.width, ...workers.map(w => (w.category || '').length)));
  const subcategoryWidth = Math.min(15, Math.max(COLUMNS.subcategory.width, ...workers.map(w => (w.subcategory || '').length)));

  let output = '';

  // Table header
  output += `${'#'.padEnd(4)}  `;
  output += `${'ID'.padEnd(idWidth)}  `;
  output += `${'NAME'.padEnd(nameWidth)}  `;
  output += `${'CATEGORY'.padEnd(categoryWidth)}  `;
  output += `${'SUBCATEGORY'.padEnd(subcategoryWidth)}\n`;

  // Header separator
  output += `${'─'.repeat(4)}  `;
  output += `${'─'.repeat(idWidth)}  `;
  output += `${'─'.repeat(nameWidth)}  `;
  output += `${'─'.repeat(categoryWidth)}  `;
  output += `${'─'.repeat(subcategoryWidth)}\n`;

  // Determine starting row number based on pagination
  const startNum = pagination ? pagination.startIndex : 1;

  // Table rows
  workers.forEach((worker, index) => {
    const num = (startNum + index).toString().padEnd(4);
    const id = truncate(worker.id, idWidth).padEnd(idWidth);
    const name = truncate(worker.name, nameWidth).padEnd(nameWidth);
    const category = truncate(worker.category || '', categoryWidth).padEnd(categoryWidth);
    const subcategory = truncate(worker.subcategory || '', subcategoryWidth).padEnd(subcategoryWidth);

    output += `${num}  ${id}  ${name}  ${category}  ${subcategory}\n`;
  });

  // Pagination info
  if (pagination) {
    output += `\n${formatPaginationLine(pagination)}`;
  }

  // Verbose debug info
  if (verbose) {
    output += '\n[Debug Info]\n';
    output += `  Displayed: ${workers.length} workers\n`;
    if (pagination) {
      output += `  Page: ${pagination.page}/${pagination.totalPages}\n`;
    }
  }

  return output;
}

/**
 * Format workers as JSON list
 * @param {Array} workers - Array of workers
 * @param {object} options - Formatting options
 * @param {object} options.pagination - Pagination info
 * @returns {string} JSON string
 */
function formatJSON(workers, options = {}) {
  const { pagination } = options;

  const output = workers.map(worker => ({
    id: worker.id,
    name: worker.name,
    category: worker.category,
    subcategory: worker.subcategory || null,
    tags: worker.tags || [],
    path: worker.path,
  }));

  if (pagination) {
    return JSON.stringify({
      data: output,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        totalItems: pagination.totalItems,
        totalPages: pagination.totalPages,
      },
    }, null, 2);
  }

  return JSON.stringify(output, null, 2);
}

/**
 * Format workers as YAML list
 * @param {Array} workers - Array of workers
 * @param {object} options - Formatting options
 * @param {object} options.pagination - Pagination info
 * @returns {string} YAML string
 */
function formatYAML(workers, options = {}) {
  const { pagination } = options;

  const output = workers.map(worker => ({
    id: worker.id,
    name: worker.name,
    category: worker.category,
    subcategory: worker.subcategory || null,
    tags: worker.tags || [],
    path: worker.path,
  }));

  if (pagination) {
    return yaml.dump({
      data: output,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        totalItems: pagination.totalItems,
        totalPages: pagination.totalPages,
      },
    }, {
      indent: 2,
      lineWidth: 120,
      noRefs: true,
    });
  }

  return yaml.dump(output, {
    indent: 2,
    lineWidth: 120,
    noRefs: true,
  });
}

/**
 * Format count summary
 * @param {object} categories - Categories object with counts
 * @param {number} totalWorkers - Total worker count
 * @param {object} options - Formatting options
 * @returns {string} Count summary output
 */
function formatCount(categories, totalWorkers, options = {}) {
  const { verbose = false } = options;

  let output = `Total: ${totalWorkers} workers\n\n`;

  // Sort categories by count descending
  const sorted = Object.entries(categories)
    .sort((a, b) => b[1].count - a[1].count);

  for (const [name, data] of sorted) {
    output += `${name.toUpperCase().padEnd(15)} ${data.count.toString().padStart(4)} workers\n`;

    // Show subcategories if verbose
    if (verbose && data.subcategories && data.subcategories.length > 0) {
      for (const sub of data.subcategories) {
        output += `  └── ${sub}\n`;
      }
    }
  }

  return output;
}

/**
 * Format list output based on format option
 * @param {Array} workers - Array of workers
 * @param {object} options - Formatting options
 * @param {string} options.format - Output format (table, json, yaml, tree)
 * @param {object} options.pagination - Pagination info
 * @param {boolean} options.verbose - Show verbose output
 * @returns {string} Formatted output
 */
function formatList(workers, options = {}) {
  const format = (options.format || 'table').toLowerCase();

  switch (format) {
    case 'json':
      return formatJSON(workers, options);
    case 'yaml':
      return formatYAML(workers, options);
    case 'table':
    default:
      return formatTable(workers, options);
  }
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
 * Format pagination line
 * @param {object} pagination - Pagination object
 * @returns {string} Pagination line
 */
function formatPaginationLine(pagination) {
  const { startIndex, endIndex, totalItems, page, totalPages } = pagination;

  if (totalItems === 0) return 'No items found.';
  if (totalPages === 1) return `Showing all ${totalItems} workers.`;

  let line = `Showing ${startIndex}-${endIndex} of ${totalItems} workers`;
  line += ` (page ${page}/${totalPages})`;

  const hints = [];
  if (page > 1) hints.push(`--page=${page - 1} prev`);
  if (page < totalPages) hints.push(`--page=${page + 1} next`);

  if (hints.length > 0) {
    line += `  [${hints.join(', ')}]`;
  }

  return line;
}

module.exports = {
  formatTable,
  formatJSON,
  formatYAML,
  formatList,
  formatCount,
  truncate,
};
