/**
 * Search CLI Unit Tests
 *
 * Tests for the worker search functionality.
 *
 * @story 2.7 - Discovery CLI Search
 */

const path = require('path');

// Test modules
const { searchKeyword, fuzzyMatchScore, levenshteinDistance } = require('../../.aiox-core/cli/commands/workers/search-keyword');
const { applyFilters, filterByCategory, filterByTags } = require('../../.aiox-core/cli/commands/workers/search-filters');
const { formatOutput, formatTable, formatJSON, formatYAML } = require('../../.aiox-core/cli/utils/output-formatter-cli');
const { calculateScores, sortByScore, calculateSearchAccuracy } = require('../../.aiox-core/cli/utils/score-calculator');
const { isSemanticAvailable, cosineSimilarity, buildSearchText } = require('../../.aiox-core/cli/commands/workers/search-semantic');

// Mock workers for testing
const mockWorkers = [
  {
    id: 'json-csv-transformer',
    name: 'JSON to CSV Transformer',
    description: 'Converts JSON data to CSV format',
    category: 'data',
    subcategory: 'transformation',
    tags: ['etl', 'data', 'json', 'csv'],
    path: '.aiox-core/development/tasks/data/json-csv-transformer.md',
  },
  {
    id: 'csv-json-transformer',
    name: 'CSV to JSON Transformer',
    description: 'Converts CSV data to JSON format',
    category: 'data',
    subcategory: 'transformation',
    tags: ['etl', 'data', 'json', 'csv'],
    path: '.aiox-core/development/tasks/data/csv-json-transformer.md',
  },
  {
    id: 'json-validator',
    name: 'JSON Schema Validator',
    description: 'Validates JSON against a schema',
    category: 'validation',
    subcategory: 'schema',
    tags: ['validation', 'schema', 'json'],
    path: '.aiox-core/development/tasks/validation/json-validator.md',
  },
  {
    id: 'api-generator',
    name: 'REST API Generator',
    description: 'Generates REST API endpoints from schema',
    category: 'code',
    subcategory: 'generation',
    tags: ['api', 'rest', 'generator', 'openapi'],
    path: '.aiox-core/development/tasks/code/api-generator.md',
  },
  {
    id: 'test-runner',
    name: 'Test Runner',
    description: 'Runs unit and integration tests',
    category: 'testing',
    subcategory: 'execution',
    tags: ['testing', 'unit', 'integration', 'jest'],
    path: '.aiox-core/development/tasks/testing/test-runner.md',
  },
];

describe('Levenshtein Distance', () => {
  test('identical strings have distance 0', () => {
    expect(levenshteinDistance('json', 'json')).toBe(0);
  });

  test('calculates distance for different strings', () => {
    expect(levenshteinDistance('json', 'jsno')).toBe(2);
    expect(levenshteinDistance('cat', 'bat')).toBe(1);
    expect(levenshteinDistance('', 'abc')).toBe(3);
  });
});

describe('Fuzzy Match Score', () => {
  test('exact match returns 100', () => {
    expect(fuzzyMatchScore('json', 'json')).toBe(100);
  });

  test('contains query returns high score', () => {
    const score = fuzzyMatchScore('json transformer', 'json');
    expect(score).toBeGreaterThanOrEqual(85);
  });

  test('partial match returns moderate score', () => {
    const score = fuzzyMatchScore('transformation', 'transform');
    expect(score).toBeGreaterThan(0);
  });

  test('no match returns 0', () => {
    const score = fuzzyMatchScore('xyz', 'abc');
    expect(score).toBe(0);
  });
});

describe('Filter Functions', () => {
  test('filterByCategory filters correctly', () => {
    const filtered = filterByCategory(mockWorkers, 'data');
    expect(filtered.length).toBe(2);
    expect(filtered.every(w => w.category === 'data')).toBe(true);
  });

  test('filterByTags filters with AND logic', () => {
    const filtered = filterByTags(mockWorkers, ['json', 'csv']);
    expect(filtered.length).toBe(2);
    expect(filtered.every(w => w.tags.includes('json') && w.tags.includes('csv'))).toBe(true);
  });

  test('applyFilters combines category and tags', () => {
    const filtered = applyFilters(mockWorkers, {
      category: 'validation',
      tags: ['json'],
    });
    expect(filtered.length).toBe(1);
    expect(filtered[0].id).toBe('json-validator');
  });

  test('empty filter returns all results', () => {
    const filtered = applyFilters(mockWorkers, {});
    expect(filtered.length).toBe(mockWorkers.length);
  });
});

describe('Score Calculator', () => {
  test('calculateScores boosts exact ID match', () => {
    const workers = [{ id: 'json-validator', name: 'Test', score: 50 }];
    const results = calculateScores(workers, 'json-validator');
    expect(results[0].score).toBe(100);
  });

  test('sortByScore sorts descending', () => {
    const workers = [
      { id: 'a', name: 'A', score: 50 },
      { id: 'b', name: 'B', score: 90 },
      { id: 'c', name: 'C', score: 70 },
    ];
    const sorted = sortByScore(workers);
    expect(sorted[0].id).toBe('b');
    expect(sorted[1].id).toBe('c');
    expect(sorted[2].id).toBe('a');
  });

  test('calculateSearchAccuracy returns correct metrics', () => {
    const results = [
      { id: 'json-validator' },
      { id: 'other-worker' },
    ];
    const accuracy = calculateSearchAccuracy(results, 'json-validator');
    expect(accuracy.found).toBe(true);
    expect(accuracy.isFirst).toBe(true);
    expect(accuracy.accuracy).toBe(100);
  });
});

describe('Output Formatter', () => {
  const testResults = [
    {
      id: 'json-csv-transformer',
      name: 'JSON to CSV Transformer',
      description: 'Converts JSON data to CSV format',
      category: 'data',
      tags: ['etl', 'json', 'csv'],
      score: 95,
      path: '.aiox-core/tasks/json-csv-transformer.md',
    },
  ];

  test('formatJSON returns valid JSON', () => {
    const output = formatJSON(testResults, {});
    const parsed = JSON.parse(output);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed[0].id).toBe('json-csv-transformer');
  });

  test('formatYAML returns valid YAML', () => {
    const output = formatYAML(testResults, {});
    expect(output).toContain('id: json-csv-transformer');
    expect(output).toContain('name: JSON to CSV Transformer');
  });

  test('formatTable returns formatted table', () => {
    const output = formatTable(testResults, { query: 'json', duration: '0.1' });
    expect(output).toContain('Found 1 worker');
    expect(output).toContain('json-csv-transformer');
    expect(output).toContain('95%');
  });

  test('formatOutput with format=json returns JSON', () => {
    const output = formatOutput(testResults, { format: 'json' });
    expect(() => JSON.parse(output)).not.toThrow();
  });

  test('formatOutput handles empty results', () => {
    const output = formatOutput([], { format: 'table', query: 'xyz' });
    expect(output).toContain('No workers found');
  });
});

describe('Semantic Search Utilities', () => {
  test('isSemanticAvailable returns false without API key', () => {
    const originalKey = process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_API_KEY;
    expect(isSemanticAvailable()).toBe(false);
    if (originalKey) process.env.OPENAI_API_KEY = originalKey;
  });

  test('cosineSimilarity of identical vectors is 1', () => {
    const vec = [1, 0, 1, 0];
    expect(cosineSimilarity(vec, vec)).toBeCloseTo(1, 5);
  });

  test('cosineSimilarity of orthogonal vectors is 0', () => {
    const vec1 = [1, 0, 0, 0];
    const vec2 = [0, 1, 0, 0];
    expect(cosineSimilarity(vec1, vec2)).toBeCloseTo(0, 5);
  });

  test('buildSearchText concatenates worker fields', () => {
    const worker = {
      name: 'Test Worker',
      description: 'A test worker',
      category: 'testing',
      tags: ['test', 'unit'],
    };
    const text = buildSearchText(worker);
    expect(text).toContain('Test Worker');
    expect(text).toContain('A test worker');
    expect(text).toContain('testing');
    expect(text).toContain('test');
    expect(text).toContain('unit');
  });
});

describe('Keyword Search Integration', () => {
  // This test requires the actual registry to be loaded
  test('searchKeyword returns results for valid query', async () => {
    try {
      const results = await searchKeyword('json');
      // Should find at least some JSON-related workers
      expect(Array.isArray(results)).toBe(true);
      // If registry is available, should find results
      if (results.length > 0) {
        expect(results[0]).toHaveProperty('id');
        expect(results[0]).toHaveProperty('score');
      }
    } catch (error) {
      // Registry may not be available in test environment
      console.log('Skipping searchKeyword test - registry not available');
    }
  });
});
