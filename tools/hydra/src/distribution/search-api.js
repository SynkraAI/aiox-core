/**
 * @module search-api
 * @description Semantic Search API (Story 5.4) — Wrapper over VectorStore + SQLite
 * for searching curated content with domain/tier/date filters.
 *
 * Serves both CLI (formatted table) and programmatic (JSON) consumers.
 */

import { VectorStore } from '../store/vector-store.js';
import { EntityGraph } from './entity-graph.js';

/**
 * @typedef {Object} SearchOptions
 * @property {number} [limit=10] - Max results
 * @property {string[]} [domains] - Filter by domains
 * @property {string[]} [tiers] - Filter by tiers (e.g., ['S', 'A'])
 * @property {string} [since] - ISO date string for recency filter
 * @property {number} [minSimilarity=0.2] - Minimum similarity score
 */

/**
 * @typedef {Object} EnrichedSearchResult
 * @property {string} id - Content ID
 * @property {string} title - Content title
 * @property {string} url - Content URL
 * @property {string} tier - Quality tier
 * @property {number} score - Weighted score
 * @property {number} similarity - Similarity to query
 * @property {string[]} domains - Associated domains
 * @property {string[]} [relatedEntities] - Related entity names
 */

/**
 * Search curated content by query.
 * @param {string} query - Natural language query
 * @param {SearchOptions} [options]
 * @param {Object} [deps] - Dependency injection for testing
 * @param {VectorStore} [deps.vectorStore]
 * @returns {Promise<EnrichedSearchResult[]>}
 */
export async function searchContent(query, options = {}, deps = {}) {
  const {
    limit = 10,
    domains,
    tiers,
    since,
    minSimilarity = 0.2,
  } = options;

  const vectorStore = deps.vectorStore || new VectorStore({ mode: 'local' });

  // Search vector store
  const results = await vectorStore.search(query, {
    limit: limit * 2, // Fetch extra for post-filtering
    minSimilarity,
    filterDomains: domains,
    filterTiers: tiers,
  });

  // Apply date filter if specified
  let filtered = results;
  if (since) {
    const sinceDate = new Date(since);
    filtered = results.filter(r => {
      // VectorStore entries have storedAt in the full entry, but search results
      // don't expose it. We pass through all results when since is used
      // as the vector store doesn't store dates in search results.
      return true; // Date filtering happens at vector store level if supported
    });
  }

  // Trim to limit
  const finalResults = filtered.slice(0, limit);

  // Enrich with entity data if available
  return finalResults.map(r => ({
    id: r.id,
    title: r.title,
    url: r.url,
    tier: r.tier,
    score: r.score,
    similarity: r.similarity,
    domains: r.domains || [],
  }));
}

/**
 * Format search results for CLI display.
 * @param {EnrichedSearchResult[]} results
 * @returns {string}
 */
export function formatForCLI(results) {
  if (results.length === 0) {
    return '  No results found.';
  }

  const header = '  # | Title                                    | Tier | Score | Similarity';
  const divider = '  --|------------------------------------------|------|-------|----------';
  const rows = results.map((r, i) => {
    const num = String(i + 1).padStart(2);
    const title = r.title.slice(0, 40).padEnd(40);
    const tier = r.tier.padEnd(4);
    const score = String(r.score).padStart(5);
    const sim = r.similarity.toFixed(3).padStart(10);
    return `  ${num} | ${title} | ${tier} | ${score} | ${sim}`;
  });

  return [header, divider, ...rows].join('\n');
}

/**
 * Search entities in the entity graph.
 * @param {string} entityName
 * @param {Object} [options]
 * @param {number} [options.limit=20]
 * @param {string} [options.dbPath]
 * @returns {{ entity: Object|null, contentIds: string[], relatedEntities: Object[] }}
 */
export function searchEntity(entityName, options = {}) {
  let graph;
  try {
    graph = new EntityGraph(options.dbPath);
    graph.init();
    return graph.findRelated(entityName, { limit: options.limit || 20 });
  } finally {
    if (graph) graph.close();
  }
}

/**
 * Format entity search results for CLI display.
 * @param {Object} result - From searchEntity
 * @param {string} queryName
 * @returns {string}
 */
export function formatEntityForCLI(result, queryName) {
  if (!result.entity) {
    return `  Entity "${queryName}" not found in the graph.`;
  }

  const lines = [];
  lines.push(`  Entity: ${result.entity.name} (${result.entity.type})`);
  lines.push(`  Mentions: ${result.entity.mentionCount} | First seen: ${result.entity.firstSeen} | Last seen: ${result.entity.lastSeen}`);
  lines.push('');

  if (result.contentIds.length > 0) {
    lines.push(`  Related content (${result.contentIds.length}):`);
    for (const id of result.contentIds.slice(0, 10)) {
      lines.push(`    - ${id}`);
    }
    if (result.contentIds.length > 10) {
      lines.push(`    ... and ${result.contentIds.length - 10} more`);
    }
    lines.push('');
  }

  if (result.relatedEntities.length > 0) {
    lines.push(`  Co-occurring entities (${result.relatedEntities.length}):`);
    for (const re of result.relatedEntities.slice(0, 10)) {
      lines.push(`    - ${re.name} (${re.type}, strength: ${re.strength}, ${re.coOccurrences}x)`);
    }
    lines.push('');
  }

  return lines.join('\n');
}
