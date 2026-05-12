/**
 * List Tree Formatter
 *
 * Formats worker list as a tree view grouped by category/subcategory.
 *
 * @module cli/commands/workers/formatters/list-tree
 * @version 1.0.0
 * @story 2.8-2.9 - Discovery CLI Info & List
 */

/**
 * Tree drawing characters
 */
const TREE = {
  branch: '├──',
  lastBranch: '└──',
  vertical: '│',
  empty: '   ',
};

/**
 * Group workers by category and subcategory
 * @param {Array} workers - Array of workers
 * @returns {object} Grouped workers
 */
function groupWorkers(workers) {
  const groups = {};

  for (const worker of workers) {
    const category = worker.category || 'uncategorized';
    const subcategory = worker.subcategory || 'general';

    if (!groups[category]) {
      groups[category] = {
        count: 0,
        subcategories: {},
      };
    }

    if (!groups[category].subcategories[subcategory]) {
      groups[category].subcategories[subcategory] = [];
    }

    groups[category].subcategories[subcategory].push(worker);
    groups[category].count++;
  }

  return groups;
}

/**
 * Format workers as tree view
 * @param {Array} workers - Array of workers
 * @param {object} options - Formatting options
 * @param {boolean} options.collapsed - Show collapsed view (hide individual workers)
 * @param {number} options.maxPerSubcategory - Max workers to show per subcategory
 * @param {boolean} options.verbose - Show verbose output
 * @returns {string} Tree formatted output
 */
function formatTree(workers, options = {}) {
  const { collapsed = false, maxPerSubcategory = 4, verbose = false } = options;

  if (workers.length === 0) {
    return 'No workers found.\n';
  }

  const groups = groupWorkers(workers);
  const categories = Object.keys(groups).sort();

  let output = '';
  output += `${workers.length} workers available in ${categories.length} categories:\n\n`;

  for (let catIdx = 0; catIdx < categories.length; catIdx++) {
    const category = categories[catIdx];
    const group = groups[category];
    const isLastCategory = catIdx === categories.length - 1;

    // Category header (uppercase)
    output += `${category.toUpperCase()} (${group.count} workers)\n`;

    // Subcategories
    const subcategories = Object.keys(group.subcategories).sort();

    for (let subIdx = 0; subIdx < subcategories.length; subIdx++) {
      const subcategory = subcategories[subIdx];
      const subWorkers = group.subcategories[subcategory];
      const isLastSubcategory = subIdx === subcategories.length - 1;
      const subPrefix = isLastSubcategory ? TREE.lastBranch : TREE.branch;

      // Subcategory header with count
      const subcategoryTitle = capitalize(subcategory);
      output += `${subPrefix} ${subcategoryTitle} (${subWorkers.length})\n`;

      // Workers (if not collapsed)
      if (!collapsed) {
        const workersToShow = subWorkers.slice(0, maxPerSubcategory);
        const hiddenCount = subWorkers.length - workersToShow.length;
        const continuePrefix = isLastSubcategory ? TREE.empty : TREE.vertical;

        for (let workerIdx = 0; workerIdx < workersToShow.length; workerIdx++) {
          const worker = workersToShow[workerIdx];
          const isLastWorker = workerIdx === workersToShow.length - 1 && hiddenCount === 0;
          const workerPrefix = isLastWorker ? TREE.lastBranch : TREE.branch;

          output += `${continuePrefix}   ${workerPrefix} ${worker.id}\n`;
        }

        // Show hidden count
        if (hiddenCount > 0) {
          output += `${continuePrefix}   ${TREE.lastBranch} ... (+${hiddenCount} more)\n`;
        }
      }
    }

    // Add blank line between categories (except last)
    if (!isLastCategory) {
      output += '\n';
    }
  }

  // Footer hints
  output += '\nUse \'aiox workers info <id>\' for details.\n';
  output += 'Use \'aiox workers search <query>\' to search.\n';

  // Verbose debug info
  if (verbose) {
    output += '\n[Debug Info]\n';
    output += `  Total workers: ${workers.length}\n`;
    output += `  Categories: ${categories.join(', ')}\n`;
  }

  return output;
}

/**
 * Format workers as collapsed tree (categories only)
 * @param {Array} workers - Array of workers
 * @param {object} options - Formatting options
 * @returns {string} Collapsed tree output
 */
function formatTreeCollapsed(workers, options = {}) {
  return formatTree(workers, { ...options, collapsed: true });
}

/**
 * Capitalize first letter
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

module.exports = {
  formatTree,
  formatTreeCollapsed,
  groupWorkers,
};
