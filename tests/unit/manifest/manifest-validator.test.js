/**
 * Manifest Validator Tests
 *
 * Unit tests for the manifest validation functionality.
 *
 * @module tests/unit/manifest/manifest-validator.test
 * @version 1.0.0
 * @story 2.13 - Manifest System
 */

const path = require('path');
const fs = require('fs').promises;
const {
  ManifestValidator,
  createManifestValidator,
  parseCSV,
  parseCSVLine,
} = require('../../../.aiox-core/core/manifest/manifest-validator');

describe('ManifestValidator', () => {
  const basePath = path.join(__dirname, '..', '..', '..');

  describe('parseCSVLine', () => {
    test('parses simple CSV line', () => {
      const result = parseCSVLine('a,b,c');
      expect(result).toEqual(['a', 'b', 'c']);
    });

    test('parses quoted values with commas', () => {
      const result = parseCSVLine('a,"b,c",d');
      expect(result).toEqual(['a', 'b,c', 'd']);
    });

    test('parses escaped quotes', () => {
      const result = parseCSVLine('a,"say ""hello""",c');
      expect(result).toEqual(['a', 'say "hello"', 'c']);
    });

    test('handles empty values', () => {
      const result = parseCSVLine('a,,c');
      expect(result).toEqual(['a', '', 'c']);
    });

    test('handles trailing empty value', () => {
      const result = parseCSVLine('a,b,');
      expect(result).toEqual(['a', 'b', '']);
    });
  });

  describe('parseCSV', () => {
    test('parses CSV content with header and rows', () => {
      const content = `id,name,status
1,First,active
2,Second,deprecated`;

      const result = parseCSV(content);

      expect(result.header).toEqual(['id', 'name', 'status']);
      expect(result.rows).toHaveLength(2);
      expect(result.rows[0]).toMatchObject({
        id: '1',
        name: 'First',
        status: 'active',
      });
      expect(result.rows[1]).toMatchObject({
        id: '2',
        name: 'Second',
        status: 'deprecated',
      });
    });

    test('adds line numbers to rows', () => {
      const content = `id,name
1,First
2,Second`;

      const result = parseCSV(content);

      expect(result.rows[0]._lineNumber).toBe(2);
      expect(result.rows[1]._lineNumber).toBe(3);
    });

    test('handles empty content', () => {
      const result = parseCSV('');
      expect(result.header).toEqual([]);
      expect(result.rows).toHaveLength(0);
    });
  });

  describe('createManifestValidator', () => {
    test('creates validator with default options', () => {
      const validator = createManifestValidator();
      expect(validator).toBeInstanceOf(ManifestValidator);
    });

    test('creates validator with custom options', () => {
      const validator = createManifestValidator({
        basePath: '/custom',
        verbose: true,
      });
      expect(validator.basePath).toBe('/custom');
      expect(validator.verbose).toBe(true);
    });
  });

  describe('ManifestValidator', () => {
    let validator;

    beforeEach(() => {
      validator = new ManifestValidator({ basePath });
    });

    describe('getAgentsSchema', () => {
      test('returns correct schema for agents', () => {
        const schema = validator.getAgentsSchema();
        expect(schema.required).toContain('id');
        expect(schema.required).toContain('name');
        expect(schema.required).toContain('file_path');
        expect(schema.sourceDir).toBe('.aiox-core/development/agents');
      });
    });

    describe('getWorkersSchema', () => {
      test('returns correct schema for workers', () => {
        const schema = validator.getWorkersSchema();
        expect(schema.required).toContain('id');
        expect(schema.required).toContain('category');
        expect(schema.sourceDir).toBeNull();
      });
    });

    describe('getTasksSchema', () => {
      test('returns correct schema for tasks', () => {
        const schema = validator.getTasksSchema();
        expect(schema.required).toContain('id');
        expect(schema.required).toContain('name');
        expect(schema.sourceDir).toBe('.aiox-core/development/tasks');
      });
    });

    describe('validateHeader', () => {
      test('returns no errors for valid header', () => {
        const header = ['id', 'name', 'file_path', 'status'];
        const schema = { required: ['id', 'name'] };
        const errors = validator.validateHeader(header, schema);
        expect(errors).toHaveLength(0);
      });

      test('returns errors for missing required columns', () => {
        const header = ['id', 'status'];
        const schema = { required: ['id', 'name', 'file_path'] };
        const errors = validator.validateHeader(header, schema);
        expect(errors).toContain('Missing required column: name');
        expect(errors).toContain('Missing required column: file_path');
      });
    });

    describe('validateAll', () => {
      test('validates all manifests', async () => {
        // First generate manifests to ensure they exist
        const { createManifestGenerator } = require('../../../.aiox-core/core/manifest/manifest-generator');
        const generator = createManifestGenerator({ basePath });
        await generator.generateAll();

        const results = await validator.validateAll();

        expect(results.agents).toBeDefined();
        expect(results.workers).toBeDefined();
        expect(results.tasks).toBeDefined();
        expect(results.summary).toBeDefined();
        expect(results.summary.totalManifests).toBe(3);
      });

      test('reports valid manifests correctly', async () => {
        // Ensure manifests are generated
        const { createManifestGenerator } = require('../../../.aiox-core/core/manifest/manifest-generator');
        const generator = createManifestGenerator({ basePath });
        await generator.generateAll();

        const results = await validator.validateAll();

        // Should have valid counts
        expect(results.agents.valid).toBe(true);
        expect(results.agents.rowCount).toBeGreaterThanOrEqual(11);

        expect(results.workers.valid).toBe(true);
        expect(results.workers.rowCount).toBeGreaterThanOrEqual(200);

        expect(results.tasks.valid).toBe(true);
        expect(results.tasks.rowCount).toBeGreaterThanOrEqual(40);
      });
    });

    describe('formatResults', () => {
      test('formats successful validation results', async () => {
        const mockResults = {
          agents: {
            filename: 'agents.csv',
            valid: true,
            rowCount: 11,
            errors: [],
            warnings: [],
            missingFiles: [],
            orphanFiles: [],
          },
          workers: {
            filename: 'workers.csv',
            valid: true,
            rowCount: 203,
            errors: [],
            warnings: [],
            missingFiles: [],
            orphanFiles: [],
          },
          tasks: {
            filename: 'tasks.csv',
            valid: true,
            rowCount: 45,
            errors: [],
            warnings: [],
            missingFiles: [],
            orphanFiles: [],
          },
          summary: {
            totalManifests: 3,
            valid: 3,
            invalid: 0,
            missing: [],
            orphan: [],
          },
        };

        const output = validator.formatResults(mockResults);

        expect(output).toContain('✓ agents.csv: 11 entries');
        expect(output).toContain('✓ workers.csv: 203 entries');
        expect(output).toContain('✓ tasks.csv: 45 entries');
        expect(output).toContain('✅ All manifests valid!');
      });

      test('formats validation errors', async () => {
        const mockResults = {
          agents: {
            filename: 'agents.csv',
            valid: false,
            rowCount: 0,
            errors: ['File not found'],
            warnings: [],
            missingFiles: [],
            orphanFiles: [],
          },
          workers: {
            filename: 'workers.csv',
            valid: true,
            rowCount: 200,
            errors: [],
            warnings: [],
            missingFiles: [],
            orphanFiles: [],
          },
          tasks: {
            filename: 'tasks.csv',
            valid: true,
            rowCount: 40,
            errors: [],
            warnings: [],
            missingFiles: [],
            orphanFiles: [],
          },
          summary: {
            totalManifests: 3,
            valid: 2,
            invalid: 1,
            missing: [],
            orphan: [],
          },
        };

        const output = validator.formatResults(mockResults);

        expect(output).toContain('✗ agents.csv: 0 entries, 1 errors');
        expect(output).toContain('❌ Validation failed');
      });
    });
  });
});
