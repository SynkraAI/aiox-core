/**
 * Info Command - Show detailed worker information
 *
 * Implements `aiox workers info <id>` CLI command.
 * Displays complete worker metadata, usage examples, and related workers.
 *
 * @module cli/commands/workers/info
 * @version 1.0.0
 * @story 2.8-2.9 - Discovery CLI Info & List
 */

const { Command } = require('commander');
const { getRegistry } = require('../../../core/registry/registry-loader');
const { formatInfo, formatNotFoundError } = require('./formatters/info-formatter');
const { levenshteinDistance } = require('./search-keyword');

/**
 * Create the info command
 * @returns {Command} Commander command instance
 */
function createInfoCommand() {
  const info = new Command('info');

  info
    .description('Show detailed information about a worker')
    .argument('<id>', 'Worker ID to display')
    .option('-f, --format <format>', 'Output format: pretty, json, yaml', 'pretty')
    .option('-v, --verbose', 'Show verbose/debug output')
    .addHelpText('after', `
Examples:
  $ aiox workers info json-csv-transformer
  $ aiox workers info architect-checklist --format=json
  $ aiox workers info create-story --format=yaml
  $ aiox workers info data-analyzer --verbose

Output Formats:
  pretty   Formatted text with sections and boxes (default)
  json     JSON object with all metadata
  yaml     YAML document with all metadata
`)
    .action(executeInfo);

  return info;
}

/**
 * Execute the info command
 * @param {string} id - Worker ID to lookup
 * @param {object} options - Command options
 */
async function executeInfo(id, options) {
  const startTime = Date.now();

  try {
    // Validate ID
    if (!id || id.trim().length === 0) {
      console.error('Error: Worker ID cannot be empty');
      process.exit(1);
    }

    const trimmedId = id.trim().toLowerCase();
    const registry = getRegistry();

    if (options.verbose) {
      console.log(`Looking up worker: "${trimmedId}"`);
      console.log(`Output format: ${options.format}`);
      console.log('');
    }

    // Try to get worker by exact ID
    const worker = await registry.getById(trimmedId);

    if (!worker) {
      // Worker not found - find suggestions
      const suggestions = await findSuggestions(registry, trimmedId);
      console.error(formatNotFoundError(trimmedId, suggestions));
      process.exit(1);
    }

    // Find related workers (same category/subcategory or shared tags)
    const relatedWorkers = await findRelatedWorkers(registry, worker);

    // Format and output
    const output = formatInfo(worker, {
      format: options.format,
      relatedWorkers,
      verbose: options.verbose,
    });

    console.log(output);

    // Performance check
    const duration = Date.now() - startTime;
    if (options.verbose) {
      console.log(`\n[Performance: ${duration}ms]`);
    }

    // Warn if over target
    if (duration > 500) {
      console.warn(`\nWarning: Info command took ${duration}ms (target: < 500ms)`);
    }

  } catch (error) {
    console.error(`Error: ${error.message}`);
    if (options.verbose) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

/**
 * Find worker suggestions for "did you mean?" feature
 * @param {ServiceRegistry} registry - Registry instance
 * @param {string} invalidId - Invalid ID entered by user
 * @returns {Promise<Array>} Array of suggested workers
 */
async function findSuggestions(registry, invalidId) {
  const workers = await registry.getAll();
  const suggestions = [];

  for (const worker of workers) {
    const idLower = worker.id.toLowerCase();

    // Check for partial match
    if (idLower.includes(invalidId) || invalidId.includes(idLower)) {
      suggestions.push({ worker, score: 90 });
      continue;
    }

    // Check Levenshtein distance for similar IDs
    const distance = levenshteinDistance(invalidId, idLower);
    const maxLen = Math.max(invalidId.length, idLower.length);
    const similarity = 1 - (distance / maxLen);

    if (similarity >= 0.5) {
      suggestions.push({ worker, score: Math.round(similarity * 100) });
    }
  }

  // Sort by score descending and return top 5
  suggestions.sort((a, b) => b.score - a.score);
  return suggestions.slice(0, 5).map(s => s.worker);
}

/**
 * Find related workers based on category and tags
 * @param {ServiceRegistry} registry - Registry instance
 * @param {object} worker - Current worker
 * @returns {Promise<Array>} Array of related workers
 */
async function findRelatedWorkers(registry, worker) {
  const related = new Map();

  // Get workers in same category/subcategory
  const categoryWorkers = await registry.getByCategory(worker.category);

  for (const catWorker of categoryWorkers) {
    if (catWorker.id === worker.id) continue;

    // Higher priority for same subcategory
    const score = catWorker.subcategory === worker.subcategory ? 10 : 5;
    related.set(catWorker.id, { worker: catWorker, score });
  }

  // Get workers with shared tags
  for (const tag of worker.tags || []) {
    const tagWorkers = await registry.getByTag(tag);

    for (const tagWorker of tagWorkers) {
      if (tagWorker.id === worker.id) continue;

      if (related.has(tagWorker.id)) {
        // Increment score for shared tag
        related.get(tagWorker.id).score += 2;
      } else {
        related.set(tagWorker.id, { worker: tagWorker, score: 2 });
      }
    }
  }

  // Sort by score descending
  const sorted = Array.from(related.values())
    .sort((a, b) => b.score - a.score);

  return sorted.slice(0, 5).map(r => r.worker);
}

module.exports = {
  createInfoCommand,
  executeInfo,
  findSuggestions,
  findRelatedWorkers,
};
