/**
 * List CLI Unit Tests
 *
 * Tests for the worker list command functionality.
 *
 * @story 2.8-2.9 - Discovery CLI Info & List
 */

const path = require('path');

// Test modules
const { formatTree, formatTreeCollapsed, groupWorkers } = require('../../.aiox-core/cli/commands/workers/formatters/list-tree');
const { formatTable, formatJSON, formatYAML, formatList, formatCount, truncate } = require('../../.aiox-core/cli/commands/workers/formatters/list-table');
const { paginate, formatPaginationInfo, formatPaginationHint } = require('../../.aiox-core/cli/commands/workers/utils/pagination');

// Mock workers for testing
const mockWorkers = [
  {
    id: 'json-csv-transformer',
    name: 'JSON to CSV Transformer',
    category: 'data',
    subcategory: 'transformation',
    tags: ['etl', 'json', 'csv'],
    path: '.aiox-core/tasks/json-csv-transformer.md',
  },
  {
    id: 'csv-json-transformer',
    name: 'CSV to JSON Transformer',
    category: 'data',
    subcategory: 'transformation',
    tags: ['etl', 'json', 'csv'],
    path: '.aiox-core/tasks/csv-json-transformer.md',
  },
  {
    id: 'json-validator',
    name: 'JSON Schema Validator',
    category: 'data',
    subcategory: 'validation',
    tags: ['validation', 'schema', 'json'],
    path: '.aiox-core/tasks/json-validator.md',
  },
  {
    id: 'unit-test-runner',
    name: 'Unit Test Runner',
    category: 'testing',
    subcategory: 'unit',
    tags: ['testing', 'unit', 'jest'],
    path: '.aiox-core/tasks/unit-test-runner.md',
  },
  {
    id: 'api-generator',
    name: 'REST API Generator',
    category: 'code',
    subcategory: 'generation',
    tags: ['api', 'rest', 'openapi'],
    path: '.aiox-core/tasks/api-generator.md',
  },
];

describe('Group Workers', () => {
  test('groups workers by category', () => {
    const groups = groupWorkers(mockWorkers);
    expect(groups).toHaveProperty('data');
    expect(groups).toHaveProperty('testing');
    expect(groups).toHaveProperty('code');
  });

  test('counts workers per category', () => {
    const groups = groupWorkers(mockWorkers);
    expect(groups.data.count).toBe(3);
    expect(groups.testing.count).toBe(1);
    expect(groups.code.count).toBe(1);
  });

  test('groups by subcategory within category', () => {
    const groups = groupWorkers(mockWorkers);
    expect(groups.data.subcategories).toHaveProperty('transformation');
    expect(groups.data.subcategories).toHaveProperty('validation');
    expect(groups.data.subcategories.transformation.length).toBe(2);
    expect(groups.data.subcategories.validation.length).toBe(1);
  });

  test('handles workers without subcategory', () => {
    const workerNoSub = [{ id: 'test', name: 'Test', category: 'other' }];
    const groups = groupWorkers(workerNoSub);
    expect(groups.other.subcategories).toHaveProperty('general');
  });
});

describe('Tree Formatter', () => {
  test('formatTree includes total count', () => {
    const output = formatTree(mockWorkers, {});
    expect(output).toContain('5 workers available');
  });

  test('formatTree includes category headers', () => {
    const output = formatTree(mockWorkers, {});
    expect(output).toContain('DATA');
    expect(output).toContain('TESTING');
    expect(output).toContain('CODE');
  });

  test('formatTree includes subcategory headers', () => {
    const output = formatTree(mockWorkers, {});
    expect(output).toContain('Transformation');
    expect(output).toContain('Validation');
  });

  test('formatTree includes worker IDs', () => {
    const output = formatTree(mockWorkers, { maxPerSubcategory: 10 });
    expect(output).toContain('json-csv-transformer');
    expect(output).toContain('json-validator');
  });

  test('formatTree includes usage hints', () => {
    const output = formatTree(mockWorkers, {});
    expect(output).toContain('aiox workers info <id>');
    expect(output).toContain('aiox workers search <query>');
  });

  test('formatTree shows verbose debug when enabled', () => {
    const output = formatTree(mockWorkers, { verbose: true });
    expect(output).toContain('[Debug Info]');
    expect(output).toContain('Total workers: 5');
  });

  test('formatTreeCollapsed hides individual workers', () => {
    const output = formatTreeCollapsed(mockWorkers, {});
    expect(output).toContain('DATA');
    expect(output).not.toContain('json-csv-transformer');
  });

  test('formatTree handles empty array', () => {
    const output = formatTree([], {});
    expect(output).toContain('No workers found');
  });
});

describe('Table Formatter', () => {
  test('formatTable includes header row', () => {
    const output = formatTable(mockWorkers, {});
    expect(output).toContain('#');
    expect(output).toContain('ID');
    expect(output).toContain('NAME');
    expect(output).toContain('CATEGORY');
  });

  test('formatTable includes worker data', () => {
    const output = formatTable(mockWorkers, {});
    expect(output).toContain('json-csv-transformer');
    expect(output).toContain('JSON to CSV Transformer');
    expect(output).toContain('data');
  });

  test('formatTable handles pagination info', () => {
    const pagination = {
      page: 2,
      limit: 10,
      totalItems: 25,
      totalPages: 3,
      startIndex: 11,
      endIndex: 20,
    };
    const output = formatTable(mockWorkers, { pagination });
    expect(output).toContain('11-20 of 25');
  });

  test('formatTable handles empty array', () => {
    const output = formatTable([], {});
    expect(output).toContain('No workers found');
  });
});

describe('JSON Formatter', () => {
  test('formatJSON returns valid JSON', () => {
    const output = formatJSON(mockWorkers, {});
    expect(() => JSON.parse(output)).not.toThrow();
  });

  test('formatJSON includes all workers', () => {
    const output = formatJSON(mockWorkers, {});
    const parsed = JSON.parse(output);
    expect(parsed.length).toBe(5);
  });

  test('formatJSON includes worker properties', () => {
    const output = formatJSON(mockWorkers, {});
    const parsed = JSON.parse(output);
    expect(parsed[0].id).toBe('json-csv-transformer');
    expect(parsed[0].name).toBe('JSON to CSV Transformer');
    expect(parsed[0].category).toBe('data');
    expect(parsed[0].subcategory).toBe('transformation');
    expect(parsed[0].tags).toEqual(['etl', 'json', 'csv']);
  });

  test('formatJSON includes pagination when provided', () => {
    const pagination = {
      page: 1,
      limit: 10,
      totalItems: 50,
      totalPages: 5,
    };
    const output = formatJSON(mockWorkers, { pagination });
    const parsed = JSON.parse(output);
    expect(parsed).toHaveProperty('data');
    expect(parsed).toHaveProperty('pagination');
    expect(parsed.pagination.totalItems).toBe(50);
  });
});

describe('YAML Formatter', () => {
  test('formatYAML returns valid YAML', () => {
    const output = formatYAML(mockWorkers, {});
    expect(output).toContain('- id: json-csv-transformer');
    expect(output).toContain('  name: JSON to CSV Transformer');
  });

  test('formatYAML includes all workers', () => {
    const output = formatYAML(mockWorkers, {});
    expect(output).toContain('json-csv-transformer');
    expect(output).toContain('csv-json-transformer');
    expect(output).toContain('json-validator');
  });
});

describe('Count Formatter', () => {
  test('formatCount shows total count', () => {
    const categories = {
      data: { count: 3, subcategories: ['transformation', 'validation'] },
      testing: { count: 1, subcategories: ['unit'] },
    };
    const output = formatCount(categories, 4, {});
    expect(output).toContain('Total: 4 workers');
  });

  test('formatCount shows category counts', () => {
    const categories = {
      data: { count: 3, subcategories: ['transformation', 'validation'] },
      testing: { count: 1, subcategories: ['unit'] },
    };
    const output = formatCount(categories, 4, {});
    expect(output).toContain('DATA');
    expect(output).toContain('3 workers');
    expect(output).toContain('TESTING');
    expect(output).toContain('1 workers');
  });

  test('formatCount shows subcategories in verbose mode', () => {
    const categories = {
      data: { count: 3, subcategories: ['transformation', 'validation'] },
    };
    const output = formatCount(categories, 3, { verbose: true });
    expect(output).toContain('transformation');
    expect(output).toContain('validation');
  });
});

describe('Format Selection', () => {
  test('formatList with format=json returns JSON', () => {
    const output = formatList(mockWorkers, { format: 'json' });
    expect(() => JSON.parse(output)).not.toThrow();
  });

  test('formatList with format=yaml returns YAML', () => {
    const output = formatList(mockWorkers, { format: 'yaml' });
    expect(output).toContain('- id:');
  });

  test('formatList with format=table returns table', () => {
    const output = formatList(mockWorkers, { format: 'table' });
    expect(output).toContain('#');
    expect(output).toContain('ID');
  });

  test('formatList defaults to table format', () => {
    const output = formatList(mockWorkers, {});
    expect(output).toContain('#');
    expect(output).toContain('ID');
  });
});

describe('Pagination', () => {
  test('paginate returns correct slice', () => {
    const items = Array.from({ length: 50 }, (_, i) => ({ id: `item-${i}` }));
    const result = paginate(items, { page: 2, limit: 10 });
    expect(result.items.length).toBe(10);
    expect(result.items[0].id).toBe('item-10');
    expect(result.items[9].id).toBe('item-19');
  });

  test('paginate calculates correct pagination info', () => {
    const items = Array.from({ length: 50 }, (_, i) => ({ id: `item-${i}` }));
    const result = paginate(items, { page: 2, limit: 10 });
    expect(result.pagination.page).toBe(2);
    expect(result.pagination.limit).toBe(10);
    expect(result.pagination.totalItems).toBe(50);
    expect(result.pagination.totalPages).toBe(5);
    expect(result.pagination.startIndex).toBe(11);
    expect(result.pagination.endIndex).toBe(20);
    expect(result.pagination.hasNextPage).toBe(true);
    expect(result.pagination.hasPrevPage).toBe(true);
  });

  test('paginate handles first page', () => {
    const items = Array.from({ length: 50 }, (_, i) => ({ id: `item-${i}` }));
    const result = paginate(items, { page: 1, limit: 10 });
    expect(result.pagination.hasPrevPage).toBe(false);
    expect(result.pagination.hasNextPage).toBe(true);
  });

  test('paginate handles last page', () => {
    const items = Array.from({ length: 50 }, (_, i) => ({ id: `item-${i}` }));
    const result = paginate(items, { page: 5, limit: 10 });
    expect(result.pagination.hasPrevPage).toBe(true);
    expect(result.pagination.hasNextPage).toBe(false);
  });

  test('paginate handles single page', () => {
    const items = Array.from({ length: 5 }, (_, i) => ({ id: `item-${i}` }));
    const result = paginate(items, { page: 1, limit: 10 });
    expect(result.pagination.totalPages).toBe(1);
    expect(result.pagination.hasPrevPage).toBe(false);
    expect(result.pagination.hasNextPage).toBe(false);
  });

  test('paginate handles empty array', () => {
    const result = paginate([], { page: 1, limit: 10 });
    expect(result.items.length).toBe(0);
    expect(result.pagination.totalItems).toBe(0);
    expect(result.pagination.totalPages).toBe(0);
  });

  test('formatPaginationInfo returns correct text', () => {
    const pagination = {
      startIndex: 11,
      endIndex: 20,
      totalItems: 50,
      page: 2,
      totalPages: 5,
    };
    const output = formatPaginationInfo(pagination);
    expect(output).toContain('11-20 of 50');
    expect(output).toContain('page 2/5');
  });

  test('formatPaginationHint includes navigation hints', () => {
    const pagination = {
      page: 2,
      totalPages: 5,
      hasPrevPage: true,
      hasNextPage: true,
    };
    const output = formatPaginationHint(pagination);
    expect(output).toContain('--page=1');
    expect(output).toContain('--page=3');
  });
});

describe('String Truncation', () => {
  test('truncate shortens long strings', () => {
    const long = 'This is a very long string that should be truncated';
    const result = truncate(long, 20);
    expect(result.length).toBe(20);
    expect(result.endsWith('…')).toBe(true);
  });

  test('truncate leaves short strings unchanged', () => {
    const short = 'Short';
    const result = truncate(short, 20);
    expect(result).toBe('Short');
  });

  test('truncate handles empty string', () => {
    const result = truncate('', 20);
    expect(result).toBe('');
  });

  test('truncate handles null/undefined', () => {
    expect(truncate(null, 20)).toBe('');
    expect(truncate(undefined, 20)).toBe('');
  });
});

describe('Performance Requirements', () => {
  // Create large mock dataset
  const largeMockWorkers = Array.from({ length: 250 }, (_, i) => ({
    id: `worker-${i}`,
    name: `Worker ${i}`,
    category: ['data', 'testing', 'code', 'template'][i % 4],
    subcategory: ['transformation', 'validation', 'unit', 'generation'][i % 4],
    tags: ['tag1', 'tag2', 'tag3'],
    path: `.aiox-core/tasks/worker-${i}.md`,
  }));

  test('formatTree handles 200+ workers under 100ms', () => {
    const startTime = Date.now();
    formatTree(largeMockWorkers, {});
    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(100);
  });

  test('formatTable handles 200+ workers under 100ms', () => {
    const startTime = Date.now();
    formatTable(largeMockWorkers, {});
    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(100);
  });

  test('paginate handles 200+ workers under 10ms', () => {
    const startTime = Date.now();
    paginate(largeMockWorkers, { page: 5, limit: 20 });
    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(10);
  });

  test('groupWorkers handles 200+ workers under 50ms', () => {
    const startTime = Date.now();
    groupWorkers(largeMockWorkers);
    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(50);
  });
});
