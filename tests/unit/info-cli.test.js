/**
 * Info CLI Unit Tests
 *
 * Tests for the worker info command functionality.
 *
 * @story 2.8-2.9 - Discovery CLI Info & List
 */

const path = require('path');

// Test modules
const {
  formatInfo,
  formatInfoPretty,
  formatInfoJSON,
  formatInfoYAML,
  formatNotFoundError,
  wrapText,
} = require('../../.aiox-core/cli/commands/workers/formatters/info-formatter');
const { findSuggestions, findRelatedWorkers } = require('../../.aiox-core/cli/commands/workers/info');
const { levenshteinDistance } = require('../../.aiox-core/cli/commands/workers/search-keyword');

// Mock worker for testing
const mockWorker = {
  id: 'json-csv-transformer',
  name: 'JSON to CSV Transformer',
  description: 'Converts JSON data to CSV format with configurable column mapping and delimiter options.',
  category: 'data',
  subcategory: 'transformation',
  inputs: ['json (object|array) - JSON data to transform'],
  outputs: ['csv (string) - CSV formatted data'],
  tags: ['etl', 'data', 'json', 'csv', 'transformation'],
  path: '.aiox-core/development/tasks/data/json-csv-transformer.md',
  taskFormat: 'TASK-FORMAT-V1',
  executorTypes: ['Worker', 'Agent'],
  performance: {
    avgDuration: '50ms',
    cacheable: true,
    parallelizable: true,
  },
  agents: ['dev'],
  metadata: {
    source: 'development',
    addedVersion: '1.0.0',
  },
};

const mockRelatedWorkers = [
  { id: 'csv-json-transformer', name: 'CSV to JSON Transformer' },
  { id: 'json-validator', name: 'JSON Schema Validator' },
];

describe('Info Formatter - Pretty Output', () => {
  test('formatInfoPretty includes worker name', () => {
    const output = formatInfoPretty(mockWorker, {});
    expect(output).toContain('JSON to CSV Transformer');
  });

  test('formatInfoPretty includes ID', () => {
    const output = formatInfoPretty(mockWorker, {});
    expect(output).toContain('json-csv-transformer');
  });

  test('formatInfoPretty includes category and subcategory', () => {
    const output = formatInfoPretty(mockWorker, {});
    expect(output).toContain('data');
    expect(output).toContain('transformation');
  });

  test('formatInfoPretty includes description', () => {
    const output = formatInfoPretty(mockWorker, {});
    expect(output).toContain('Converts JSON data to CSV format');
  });

  test('formatInfoPretty includes performance metrics', () => {
    const output = formatInfoPretty(mockWorker, {});
    expect(output).toContain('50ms');
    expect(output).toContain('Cacheable');
    expect(output).toContain('Parallelizable');
  });

  test('formatInfoPretty includes tags', () => {
    const output = formatInfoPretty(mockWorker, {});
    expect(output).toContain('etl');
    expect(output).toContain('json');
    expect(output).toContain('csv');
  });

  test('formatInfoPretty includes usage example', () => {
    const output = formatInfoPretty(mockWorker, {});
    expect(output).toContain('Usage Example');
    expect(output).toContain('aiox task run json-csv-transformer');
  });

  test('formatInfoPretty includes related workers when provided', () => {
    const output = formatInfoPretty(mockWorker, { relatedWorkers: mockRelatedWorkers });
    expect(output).toContain('Related Workers');
    expect(output).toContain('csv-json-transformer');
    expect(output).toContain('json-validator');
  });

  test('formatInfoPretty shows verbose debug info when enabled', () => {
    const output = formatInfoPretty(mockWorker, { verbose: true });
    expect(output).toContain('[Debug Info]');
    expect(output).toContain('development');
  });
});

describe('Info Formatter - JSON Output', () => {
  test('formatInfoJSON returns valid JSON', () => {
    const output = formatInfoJSON(mockWorker, {});
    expect(() => JSON.parse(output)).not.toThrow();
  });

  test('formatInfoJSON includes all required fields', () => {
    const output = formatInfoJSON(mockWorker, {});
    const parsed = JSON.parse(output);
    expect(parsed.id).toBe('json-csv-transformer');
    expect(parsed.name).toBe('JSON to CSV Transformer');
    expect(parsed.category).toBe('data');
    expect(parsed.subcategory).toBe('transformation');
    expect(parsed.tags).toEqual(['etl', 'data', 'json', 'csv', 'transformation']);
    expect(parsed.performance).toBeDefined();
    expect(parsed.metadata).toBeDefined();
  });

  test('formatInfoJSON includes related workers', () => {
    const output = formatInfoJSON(mockWorker, { relatedWorkers: mockRelatedWorkers });
    const parsed = JSON.parse(output);
    expect(parsed.relatedWorkers).toContain('csv-json-transformer');
    expect(parsed.relatedWorkers).toContain('json-validator');
  });
});

describe('Info Formatter - YAML Output', () => {
  test('formatInfoYAML returns valid YAML', () => {
    const output = formatInfoYAML(mockWorker, {});
    expect(output).toContain('id: json-csv-transformer');
    expect(output).toContain('name: JSON to CSV Transformer');
  });

  test('formatInfoYAML includes all required fields', () => {
    const output = formatInfoYAML(mockWorker, {});
    expect(output).toContain('category: data');
    expect(output).toContain('subcategory: transformation');
    expect(output).toContain('tags:');
    expect(output).toContain('- etl');
  });
});

describe('Info Formatter - Format Selection', () => {
  test('formatInfo with format=json returns JSON', () => {
    const output = formatInfo(mockWorker, { format: 'json' });
    expect(() => JSON.parse(output)).not.toThrow();
  });

  test('formatInfo with format=yaml returns YAML', () => {
    const output = formatInfo(mockWorker, { format: 'yaml' });
    expect(output).toContain('id: json-csv-transformer');
  });

  test('formatInfo with format=pretty returns pretty output', () => {
    const output = formatInfo(mockWorker, { format: 'pretty' });
    expect(output).toContain('📦');
  });

  test('formatInfo defaults to pretty format', () => {
    const output = formatInfo(mockWorker, {});
    expect(output).toContain('📦');
  });
});

describe('Not Found Error Formatter', () => {
  test('formatNotFoundError includes invalid ID', () => {
    const output = formatNotFoundError('invalid-worker', []);
    expect(output).toContain("Worker 'invalid-worker' not found");
  });

  test('formatNotFoundError includes suggestions', () => {
    const suggestions = [
      { id: 'json-validator' },
      { id: 'json-transformer' },
    ];
    const output = formatNotFoundError('json-validtor', suggestions);
    expect(output).toContain('Did you mean');
    expect(output).toContain('json-validator');
    expect(output).toContain('json-transformer');
  });

  test('formatNotFoundError includes search hint', () => {
    const output = formatNotFoundError('invalid', []);
    expect(output).toContain('aiox workers search invalid');
  });
});

describe('Text Wrapping', () => {
  test('wrapText wraps long text', () => {
    const longText = 'This is a very long description that should be wrapped at a reasonable width for display in the terminal.';
    const wrapped = wrapText(longText, 40);
    expect(wrapped.length).toBeGreaterThan(1);
    expect(wrapped.every(line => line.length <= 40)).toBe(true);
  });

  test('wrapText handles short text', () => {
    const shortText = 'Short text';
    const wrapped = wrapText(shortText, 40);
    expect(wrapped.length).toBe(1);
    expect(wrapped[0]).toBe('Short text');
  });

  test('wrapText handles empty text', () => {
    const wrapped = wrapText('', 40);
    expect(wrapped).toEqual(['']);
  });

  test('wrapText handles null text', () => {
    const wrapped = wrapText(null, 40);
    expect(wrapped).toEqual(['']);
  });
});

describe('Levenshtein Distance for Suggestions', () => {
  test('similar IDs have low distance', () => {
    const distance = levenshteinDistance('json-validator', 'json-validtor');
    expect(distance).toBeLessThanOrEqual(2);
  });

  test('different IDs have high distance', () => {
    const distance = levenshteinDistance('json-validator', 'api-generator');
    expect(distance).toBeGreaterThan(5);
  });

  test('identical IDs have zero distance', () => {
    const distance = levenshteinDistance('json-validator', 'json-validator');
    expect(distance).toBe(0);
  });
});

describe('Performance Requirements', () => {
  test('formatInfoPretty completes quickly', () => {
    const startTime = Date.now();
    for (let i = 0; i < 100; i++) {
      formatInfoPretty(mockWorker, { relatedWorkers: mockRelatedWorkers });
    }
    const duration = Date.now() - startTime;
    // Should format 100 workers in under 100ms
    expect(duration).toBeLessThan(100);
  });

  test('formatInfoJSON completes quickly', () => {
    const startTime = Date.now();
    for (let i = 0; i < 100; i++) {
      formatInfoJSON(mockWorker, { relatedWorkers: mockRelatedWorkers });
    }
    const duration = Date.now() - startTime;
    // Should format 100 workers in under 50ms
    expect(duration).toBeLessThan(50);
  });
});
