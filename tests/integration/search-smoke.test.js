/**
 * Search CLI Smoke Tests
 *
 * Integration tests for SEARCH-01 to SEARCH-06 smoke tests.
 *
 * @story 2.7 - Discovery CLI Search
 */

const { searchKeyword } = require('../../.aiox-core/cli/commands/workers/search-keyword');
const { applyFilters } = require('../../.aiox-core/cli/commands/workers/search-filters');
const { formatOutput, formatJSON } = require('../../.aiox-core/cli/utils/output-formatter-cli');
const { getRegistry } = require('../../.aiox-core/core/registry/registry-loader');

describe('Smoke Tests - Search CLI', () => {
  let registry;

  beforeAll(async () => {
    registry = getRegistry();
    await registry.load();
  });

  /**
   * SEARCH-01: Basic Search
   * `aiox workers search "validator"` returns results
   * Pass Criteria: Results array not empty
   */
  test('SEARCH-01: Basic search returns results', async () => {
    const results = await searchKeyword('validator');

    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0]).toHaveProperty('id');
    expect(results[0]).toHaveProperty('score');

    console.log(`SEARCH-01: Found ${results.length} results for "validator"`);
  });

  /**
   * SEARCH-02: Search Speed
   * Search completes in < 30s
   * Pass Criteria: duration < 30000ms
   */
  test('SEARCH-02: Search completes in < 30s', async () => {
    const startTime = Date.now();

    await searchKeyword('test');

    const duration = Date.now() - startTime;

    expect(duration).toBeLessThan(30000);

    console.log(`SEARCH-02: Search completed in ${duration}ms (target: < 30000ms)`);
  });

  /**
   * SEARCH-03: Exact Match
   * Search for exact worker ID returns it first
   * Pass Criteria: results[0].id === query
   */
  test('SEARCH-03: Exact ID match returns first', async () => {
    // Get a real worker ID from registry
    const allWorkers = await registry.getAll();
    const targetWorkerId = allWorkers[0].id;

    const results = await searchKeyword(targetWorkerId);

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].id).toBe(targetWorkerId);
    expect(results[0].score).toBe(100);

    console.log(`SEARCH-03: Exact match for "${targetWorkerId}" returned first with score 100`);
  });

  /**
   * SEARCH-04: Category Filter
   * --category filters correctly
   * Pass Criteria: All results match category
   */
  test('SEARCH-04: Category filter works correctly', async () => {
    const results = await searchKeyword('check');
    const filteredResults = applyFilters(results, { category: 'checklist' });

    expect(filteredResults.every(r => r.category === 'checklist')).toBe(true);

    console.log(`SEARCH-04: Filtered to ${filteredResults.length} results with category "checklist"`);
  });

  /**
   * SEARCH-05: Tag Filter
   * --tags filters correctly
   * Pass Criteria: All results have at least one tag
   */
  test('SEARCH-05: Tag filter works correctly', async () => {
    // Get all workers and find one with tags
    const allWorkers = await registry.getAll();
    const workerWithTags = allWorkers.find(w => w.tags && w.tags.length > 0);

    if (workerWithTags) {
      const targetTag = workerWithTags.tags[0];
      const results = await searchKeyword(workerWithTags.name.split(' ')[0]);
      const filteredResults = applyFilters(results, { tags: [targetTag] });

      expect(filteredResults.every(r => r.tags && r.tags.some(t =>
        t.toLowerCase().includes(targetTag.toLowerCase()),
      ))).toBe(true);

      console.log(`SEARCH-05: Filtered by tag "${targetTag}" returned ${filteredResults.length} results`);
    } else {
      console.log('SEARCH-05: Skipped - no workers with tags found');
    }
  });

  /**
   * SEARCH-06: JSON Output
   * --format=json returns valid JSON
   * Pass Criteria: JSON.parse() succeeds
   */
  test('SEARCH-06: JSON output is valid', async () => {
    const results = await searchKeyword('config');
    const jsonOutput = formatJSON(results, {});

    let parsed;
    expect(() => {
      parsed = JSON.parse(jsonOutput);
    }).not.toThrow();

    expect(Array.isArray(parsed)).toBe(true);
    if (parsed.length > 0) {
      expect(parsed[0]).toHaveProperty('id');
      expect(parsed[0]).toHaveProperty('name');
      expect(parsed[0]).toHaveProperty('score');
    }

    console.log(`SEARCH-06: JSON output parsed successfully with ${parsed.length} results`);
  });
});

describe('Performance Benchmarks', () => {
  test('Search 10 times and measure average', async () => {
    const queries = ['test', 'config', 'validator', 'check', 'agent', 'template', 'workflow', 'script', 'data', 'task'];
    const times = [];

    for (const query of queries) {
      const start = Date.now();
      await searchKeyword(query);
      times.push(Date.now() - start);
    }

    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    const maxTime = Math.max(...times);
    const minTime = Math.min(...times);

    console.log(`Performance: avg=${avgTime.toFixed(0)}ms, min=${minTime}ms, max=${maxTime}ms`);

    // Target: average should be well under 30s
    expect(avgTime).toBeLessThan(30000);
  });

  test('Registry load time is < 500ms', async () => {
    // Force fresh load
    const freshRegistry = getRegistry({ fresh: true });
    freshRegistry.clearCache();

    const start = Date.now();
    await freshRegistry.load();
    const loadTime = Date.now() - start;

    console.log(`Registry load time: ${loadTime}ms (target: < 500ms)`);
    expect(loadTime).toBeLessThan(500);
  });
});
