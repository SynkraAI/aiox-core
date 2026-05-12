/**
 * List Command - List all workers in the registry
 *
 * Implements `aiox workers list` CLI command.
 * Displays workers grouped by category with filtering and pagination.
 *
 * @module cli/commands/workers/list
 * @version 1.0.0
 * @story 2.8-2.9 - Discovery CLI Info & List
 */

const { Command } = require('commander');
const { getRegistry } = require('../../../core/registry/registry-loader');
const { formatTree } = require('./formatters/list-tree');
const { formatList, formatCount } = require('./formatters/list-table');
const { paginate, formatPaginationHint } = require('./utils/pagination');

/**
 * Create the list command
 * @returns {Command} Commander command instance
 */
function createListCommand() {
  const list = new Command('list');

  list
    .description('List all workers in the service registry')
    .option('-c, --category <category>', 'Filter by category')
    .option('-f, --format <format>', 'Output format: tree, table, json, yaml', 'tree')
    .option('-p, --page <n>', 'Page number for pagination', '1')
    .option('-l, --limit <n>', 'Items per page', '20')
    .option('--count', 'Show count summary only')
    .option('-v, --verbose', 'Show verbose/debug output')
    .addHelpText('after', `
Examples:
  $ aiox workers list
  $ aiox workers list --category=task
  $ aiox workers list --format=table
  $ aiox workers list --format=json --category=script
  $ aiox workers list --page=2 --limit=10
  $ aiox workers list --count
  $ aiox workers list --verbose

Output Formats:
  tree     Grouped tree view by category (default)
  table    Tabular list with columns
  json     JSON array of workers
  yaml     YAML list of workers

Categories:
  task       Executable task workflows for agents
  template   Document and code templates
  script     JavaScript utility scripts
  checklist  Quality validation checklists
  workflow   Multi-step workflow definitions
  data       Knowledge base and configuration data
`)
    .action(executeList);

  return list;
}

/**
 * Execute the list command
 * @param {object} options - Command options
 */
async function executeList(options) {
  const startTime = Date.now();

  try {
    const registry = getRegistry();

    if (options.verbose) {
      console.log('Loading worker registry...');
      if (options.category) console.log(`Category filter: ${options.category}`);
      console.log(`Output format: ${options.format}`);
      console.log(`Page: ${options.page}, Limit: ${options.limit}`);
      console.log('');
    }

    // Handle count-only mode
    if (options.count) {
      await executeCountMode(registry, options);
      logPerformance(startTime, options.verbose);
      return;
    }

    // Get workers (optionally filtered by category)
    let workers;
    if (options.category) {
      workers = await registry.getByCategory(options.category.toLowerCase());

      if (workers.length === 0) {
        // Check if category exists
        const categories = await registry.getCategories();
        if (!categories[options.category.toLowerCase()]) {
          console.error(`Error: Category '${options.category}' not found.`);
          console.log('\nAvailable categories:');
          Object.keys(categories).forEach(cat => {
            console.log(`  - ${cat} (${categories[cat].count} workers)`);
          });
          process.exit(1);
        }
      }
    } else {
      workers = await registry.getAll();
    }

    // Sort workers by category, then name
    workers.sort((a, b) => {
      if (a.category !== b.category) {
        return a.category.localeCompare(b.category);
      }
      return a.name.localeCompare(b.name);
    });

    // Format based on output type
    const format = (options.format || 'tree').toLowerCase();

    if (format === 'tree') {
      // Tree format doesn't use pagination (shows all grouped)
      const output = formatTree(workers, {
        verbose: options.verbose,
      });
      console.log(output);
    } else {
      // Table/JSON/YAML formats support pagination
      const page = parseInt(options.page, 10) || 1;
      const limit = parseInt(options.limit, 10) || 20;

      const paginatedResult = paginate(workers, { page, limit });

      const output = formatList(paginatedResult.items, {
        format: format,
        pagination: paginatedResult.pagination,
        verbose: options.verbose,
      });

      console.log(output);

      // Show pagination hint for table format
      if (format === 'table' && paginatedResult.pagination.totalPages > 1) {
        const hint = formatPaginationHint(paginatedResult.pagination);
        if (hint) {
          console.log(hint);
        }
      }
    }

    logPerformance(startTime, options.verbose);

  } catch (error) {
    console.error(`Error: ${error.message}`);
    if (options.verbose) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

/**
 * Execute count-only mode
 * @param {ServiceRegistry} registry - Registry instance
 * @param {object} options - Command options
 */
async function executeCountMode(registry, options) {
  const categories = await registry.getCategories();
  const totalWorkers = await registry.count();

  // If category filter, show just that category
  if (options.category) {
    const category = options.category.toLowerCase();
    const catData = categories[category];

    if (!catData) {
      console.error(`Error: Category '${options.category}' not found.`);
      process.exit(1);
    }

    console.log(`${category.toUpperCase()}: ${catData.count} workers`);

    if (options.verbose && catData.subcategories) {
      console.log(`  Subcategories: ${catData.subcategories.join(', ')}`);
    }
  } else {
    // Show all categories
    const output = formatCount(categories, totalWorkers, {
      verbose: options.verbose,
    });
    console.log(output);
  }
}

/**
 * Log performance metrics
 * @param {number} startTime - Start timestamp
 * @param {boolean} verbose - Show verbose output
 */
function logPerformance(startTime, verbose) {
  const duration = Date.now() - startTime;

  if (verbose) {
    console.log(`\n[Performance: ${duration}ms]`);
  }

  // Warn if over target (1s for list with 200+ workers)
  if (duration > 1000) {
    console.warn(`\nWarning: List command took ${duration}ms (target: < 1000ms)`);
  }
}

module.exports = {
  createListCommand,
  executeList,
};
