/**
 * Search Command - Main entry point for worker search
 *
 * Implements `aiox workers search <query>` CLI command.
 * Supports semantic search (OpenAI embeddings) and keyword fallback.
 *
 * @module cli/commands/workers/search
 * @version 1.0.0
 * @story 2.7 - Discovery CLI Search
 */

const { Command } = require('commander');
const path = require('path');

// Local modules
const { searchSemantic, isSemanticAvailable } = require('./search-semantic');
const { searchKeyword } = require('./search-keyword');
const { applyFilters } = require('./search-filters');
const { formatOutput } = require('../../utils/output-formatter-cli');
const { calculateScores, sortByScore } = require('../../utils/score-calculator');

/**
 * Create the search command
 * @returns {Command} Commander command instance
 */
function createSearchCommand() {
  const search = new Command('search');

  search
    .description('Search for workers in the service registry')
    .argument('<query>', 'Search query (words, phrases, or patterns)')
    .option('-c, --category <category>', 'Filter by category')
    .option('-t, --tags <tags>', 'Filter by tags (comma-separated)')
    .option('-f, --format <format>', 'Output format: table, json, yaml', 'table')
    .option('-l, --limit <n>', 'Max results', '10')
    .option('--semantic', 'Force semantic search (requires OPENAI_API_KEY)')
    .option('--keyword', 'Force keyword search')
    .option('-v, --verbose', 'Show verbose output')
    .addHelpText('after', `
Examples:
  $ aiox workers search "json csv"
  $ aiox workers search "data transformation" --category=etl
  $ aiox workers search "validation" --tags=schema,json
  $ aiox workers search "api" --format=json --limit=5
  $ aiox workers search "transform" --semantic
  $ aiox workers search "convert" --keyword
`)
    .action(executeSearch);

  return search;
}

/**
 * Execute the search command
 * @param {string} query - Search query
 * @param {object} options - Command options
 */
async function executeSearch(query, options) {
  const startTime = Date.now();

  try {
    // Validate query
    if (!query || query.trim().length === 0) {
      console.error('Error: Search query cannot be empty');
      process.exit(1);
    }

    const trimmedQuery = query.trim();
    const limit = parseInt(options.limit, 10) || 10;
    const tags = options.tags ? options.tags.split(',').map(t => t.trim()) : [];

    if (options.verbose) {
      console.log(`Searching for: "${trimmedQuery}"`);
      if (options.category) console.log(`  Category filter: ${options.category}`);
      if (tags.length > 0) console.log(`  Tag filters: ${tags.join(', ')}`);
      console.log(`  Output format: ${options.format}`);
      console.log(`  Limit: ${limit}`);
      console.log('');
    }

    // Determine search strategy
    let results;
    let searchMethod;

    if (options.keyword) {
      // Force keyword search
      searchMethod = 'keyword';
      results = await searchKeyword(trimmedQuery);
    } else if (options.semantic) {
      // Force semantic search
      if (!isSemanticAvailable()) {
        console.error('Error: Semantic search requires OPENAI_API_KEY environment variable');
        console.log('Hint: Set OPENAI_API_KEY or use --keyword for fallback search');
        process.exit(1);
      }
      searchMethod = 'semantic';
      results = await searchSemantic(trimmedQuery);
    } else {
      // Auto-detect: use semantic if available, otherwise keyword
      if (isSemanticAvailable()) {
        searchMethod = 'semantic';
        results = await searchSemantic(trimmedQuery);
      } else {
        searchMethod = 'keyword';
        results = await searchKeyword(trimmedQuery);
      }
    }

    // Apply filters
    results = applyFilters(results, {
      category: options.category,
      tags: tags,
    });

    // Calculate and sort by scores
    results = calculateScores(results, trimmedQuery);
    results = sortByScore(results);

    // Apply limit
    results = results.slice(0, limit);

    // Calculate duration
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    // Format and output results
    const output = formatOutput(results, {
      format: options.format,
      query: trimmedQuery,
      duration: duration,
      searchMethod: searchMethod,
      verbose: options.verbose,
    });

    console.log(output);

    // Performance check
    const durationMs = Date.now() - startTime;
    if (durationMs > 30000) {
      console.warn(`\nWarning: Search took ${(durationMs / 1000).toFixed(1)}s (target: < 30s)`);
    }

  } catch (error) {
    console.error(`Search error: ${error.message}`);
    if (options.verbose) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

module.exports = {
  createSearchCommand,
  executeSearch,
};
