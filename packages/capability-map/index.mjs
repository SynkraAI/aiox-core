/**
 * @aios/capability-map — Queryable capability registry.
 *
 * Reads data/capability-map.yaml and provides lookup functions
 * for the Content Forge to find the best squad/skill for each task.
 */

import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const yaml = require('js-yaml');

const __dirname = dirname(fileURLToPath(import.meta.url));
const DEFAULT_MAP_PATH = resolve(__dirname, '..', '..', 'data', 'capability-map.yaml');

let _cache = null;
let _cachePath = null;

/**
 * Load the capability map from YAML.
 * @param {string} [mapPath] - Path to capability-map.yaml
 * @returns {object} Parsed capability map
 */
function loadMap(mapPath) {
  const p = mapPath || DEFAULT_MAP_PATH;
  if (_cache && _cachePath === p) return _cache;

  if (!existsSync(p)) {
    throw new Error(`Capability map not found at ${p}`);
  }

  const raw = readFileSync(p, 'utf-8');
  _cache = yaml.load(raw);
  if (!_cache?.capabilities || Object.keys(_cache.capabilities).length === 0) {
    throw new Error(`Capability map at ${p} is empty or missing 'capabilities' key`);
  }
  _cachePath = p;
  return _cache;
}

/**
 * Find the best squad/skill for a capability.
 * @param {string} capability - Capability key (e.g., 'carousel_copy')
 * @param {string} [mapPath] - Optional path to capability-map.yaml
 * @returns {object|null} Capability entry or null if not found
 */
function findBest(capability, mapPath) {
  const map = loadMap(mapPath);
  const entry = map.capabilities?.[capability];
  if (!entry) return null;

  return {
    capability,
    best: entry.best,
    agent: entry.agent || null,
    workflow: entry.workflow || null,
    why: entry.why,
    requires: entry.requires || null,
    cost: entry.cost || null,
    note: entry.note || null,
  };
}

/**
 * Find alternatives for a capability, optionally filtered by context.
 * @param {string} capability - Capability key
 * @param {string} [context] - Context string to match against 'when' field
 * @param {string} [mapPath] - Optional path to capability-map.yaml
 * @returns {object[]} Array of alternative entries
 */
function findAlternatives(capability, context, mapPath) {
  const map = loadMap(mapPath);
  const entry = map.capabilities?.[capability];
  if (!entry?.alternatives) return [];

  let alts = entry.alternatives;

  // Filter by context if provided
  if (context) {
    const lower = context.toLowerCase();
    alts = alts.filter((alt) =>
      alt.when && alt.when.toLowerCase().includes(lower)
    );
  }

  return alts;
}

/**
 * List all available capabilities.
 * @param {string} [mapPath] - Optional path to capability-map.yaml
 * @returns {string[]} Array of capability keys
 */
function listCapabilities(mapPath) {
  const map = loadMap(mapPath);
  return Object.keys(map.capabilities || {});
}

/**
 * Search capabilities by keyword in any field.
 * @param {string} query - Search query
 * @param {string} [mapPath] - Optional path to capability-map.yaml
 * @returns {object[]} Matching capabilities with scores
 */
function searchCapabilities(query, mapPath) {
  const map = loadMap(mapPath);
  const lower = query.toLowerCase();
  const results = [];

  for (const [key, entry] of Object.entries(map.capabilities || {})) {
    const searchable = JSON.stringify(entry).toLowerCase();
    if (key.includes(lower) || searchable.includes(lower)) {
      results.push({
        capability: key,
        best: entry.best,
        why: entry.why,
        relevance: key.includes(lower) ? 'high' : 'medium',
      });
    }
  }

  return results.sort((a, b) =>
    a.relevance === 'high' && b.relevance !== 'high' ? -1 : 1
  );
}

/**
 * Clear the internal cache (useful for testing).
 */
function clearCache() {
  _cache = null;
  _cachePath = null;
}

// ── CLI ──────────────────────────────────────────────

const [, , command, arg] = process.argv;

if (command === 'find') {
  if (!arg) {
    console.error('Usage: node index.mjs find <capability>');
    process.exit(1);
  }
  const result = findBest(arg);
  if (!result) {
    console.error(`Capability "${arg}" not found.`);
    console.log(`Available: ${listCapabilities().join(', ')}`);
    process.exit(1);
  }
  console.log(JSON.stringify(result, null, 2));
}

if (command === 'list') {
  const caps = listCapabilities();
  console.log(`Capabilities (${caps.length}):`);
  for (const cap of caps) {
    const entry = findBest(cap);
    console.log(`  ${cap} → ${entry.best}${entry.agent ? ` (${entry.agent})` : ''}`);
  }
}

if (command === 'search') {
  if (!arg) {
    console.error('Usage: node index.mjs search <query>');
    process.exit(1);
  }
  const results = searchCapabilities(arg);
  console.log(`Results for "${arg}" (${results.length}):`);
  for (const r of results) {
    console.log(`  [${r.relevance}] ${r.capability} → ${r.best}`);
  }
}

// ── Exports ──────────────────────────────────────────

export {
  loadMap,
  findBest,
  findAlternatives,
  listCapabilities,
  searchCapabilities,
  clearCache,
};
