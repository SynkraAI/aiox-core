/**
 * Tests for enriched config schemas
 * Story BM-4 — Boundary Schema Enrichment & Template Customization
 *
 * Covers: AC1 (L1 schema), AC2 (L2 schema), AC3 (boundary section), AC5 (error messages)
 */

const path = require('path');
const fs = require('fs');
const yaml = require('js-yaml');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');

const SCHEMAS_DIR = path.join(__dirname, '../../.aios-core/core/config/schemas');
const CONFIG_DIR = path.join(__dirname, '../../.aios-core');

function loadSchema(name) {
  const filePath = path.join(SCHEMAS_DIR, name);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function loadYaml(name) {
  const filePath = path.join(CONFIG_DIR, name);
  return yaml.load(fs.readFileSync(filePath, 'utf8'));
}

function createValidator() {
  const ajv = new Ajv({ allErrors: true, strict: false });
  addFormats(ajv);
  return ajv;
}

describe('schema-validation — enriched schemas', () => {
  let ajv;

  beforeEach(() => {
    ajv = createValidator();
  });

  // AC1: Framework schema enriched with all L1 keys
  describe('framework-config.schema.json (L1)', () => {
    let schema;

    beforeAll(() => {
      schema = loadSchema('framework-config.schema.json');
    });

    test('schema is valid JSON Schema draft-07', () => {
      expect(schema.$schema).toBe('http://json-schema.org/draft-07/schema#');
      expect(schema.type).toBe('object');
    });

    test('schema defines all L1 keys', () => {
      const expectedKeys = [
        'metadata',
        'markdownExploder',
        'resource_locations',
        'performance_defaults',
        'utility_scripts_registry',
        'ide_sync_system',
        'template_overrides',
      ];
      for (const key of expectedKeys) {
        expect(schema.properties).toHaveProperty(key);
      }
    });

    test('schema has additionalProperties: false', () => {
      expect(schema.additionalProperties).toBe(false);
    });

    test('validates real framework-config.yaml without errors', () => {
      const data = loadYaml('framework-config.yaml');
      const validate = ajv.compile(schema);
      const isValid = validate(data);
      if (!isValid) {
        // eslint-disable-next-line no-console
        console.log('Validation errors:', validate.errors);
      }
      expect(isValid).toBe(true);
    });

    test('rejects unknown top-level keys (typo detection)', () => {
      const data = { metadata: { name: 'test', framework_version: '1.0' }, unknown_key: true };
      const validate = ajv.compile(schema);
      const isValid = validate(data);
      expect(isValid).toBe(false);
      expect(validate.errors.some((e) => e.keyword === 'additionalProperties')).toBe(true);
    });

    test('metadata requires name and framework_version', () => {
      const data = { metadata: {} };
      const validate = ajv.compile(schema);
      const isValid = validate(data);
      expect(isValid).toBe(false);
      expect(validate.errors.some((e) => e.params?.missingProperty === 'name')).toBe(true);
    });

    test('template_overrides schema shape is correct', () => {
      const tmpl = schema.properties.template_overrides;
      expect(tmpl.type).toBe('object');
      expect(tmpl.properties.story.properties).toHaveProperty('sections_order');
      expect(tmpl.properties.story.properties).toHaveProperty('optional_sections');
    });
  });

  // AC2: Project schema enriched with all L2 keys
  describe('project-config.schema.json (L2)', () => {
    let schema;

    beforeAll(() => {
      schema = loadSchema('project-config.schema.json');
    });

    test('schema is valid JSON Schema draft-07', () => {
      expect(schema.$schema).toBe('http://json-schema.org/draft-07/schema#');
      expect(schema.type).toBe('object');
    });

    test('schema defines all L2 keys', () => {
      const expectedKeys = [
        'project',
        'documentation_paths',
        'github_integration',
        'coderabbit_integration',
        'squads',
        'logging',
        'story_backlog',
        'pv_mind_context',
        'auto_claude',
        'boundary',
        'template_overrides',
      ];
      for (const key of expectedKeys) {
        expect(schema.properties).toHaveProperty(key);
      }
    });

    test('validates real project-config.yaml without errors', () => {
      const data = loadYaml('project-config.yaml');
      const validate = ajv.compile(schema);
      const isValid = validate(data);
      if (!isValid) {
        // eslint-disable-next-line no-console
        console.log('Validation errors:', validate.errors);
      }
      expect(isValid).toBe(true);
    });
  });

  // AC3: boundary section fully defined
  describe('boundary section in project schema', () => {
    let schema;

    beforeAll(() => {
      schema = loadSchema('project-config.schema.json');
    });

    test('boundary has frameworkProtection, protected, exceptions', () => {
      const boundary = schema.properties.boundary;
      expect(boundary.type).toBe('object');
      expect(boundary.properties.frameworkProtection.type).toBe('boolean');
      expect(boundary.properties.protected.type).toBe('array');
      expect(boundary.properties.exceptions.type).toBe('array');
    });

    test('boundary requires frameworkProtection', () => {
      expect(schema.properties.boundary.required).toContain('frameworkProtection');
    });

    test('valid boundary config passes', () => {
      const data = {
        boundary: {
          frameworkProtection: true,
          protected: ['.aios-core/core/**'],
          exceptions: ['.aios-core/core/config/schemas/**'],
        },
      };
      const validate = ajv.compile(schema);
      expect(validate(data)).toBe(true);
    });

    // AC5: Actionable error messages
    test('invalid frameworkProtection type produces error', () => {
      const data = {
        boundary: {
          frameworkProtection: 'yes',
        },
      };
      const validate = ajv.compile(schema);
      const isValid = validate(data);
      expect(isValid).toBe(false);
      const fieldError = validate.errors.find(
        (e) => e.instancePath === '/boundary/frameworkProtection'
      );
      expect(fieldError).toBeDefined();
      expect(fieldError.message).toContain('boolean');
    });

    test('missing required frameworkProtection produces error', () => {
      const data = {
        boundary: {
          protected: ['.aios-core/core/**'],
        },
      };
      const validate = ajv.compile(schema);
      const isValid = validate(data);
      expect(isValid).toBe(false);
      expect(
        validate.errors.some((e) => e.params?.missingProperty === 'frameworkProtection')
      ).toBe(true);
    });
  });

  // AC5: allErrors reports ALL errors
  describe('validation error messages', () => {
    test('Ajv allErrors: true reports multiple errors at once', () => {
      const schema = loadSchema('project-config.schema.json');
      const data = {
        boundary: {
          frameworkProtection: 'invalid',
          protected: 'not-an-array',
        },
      };
      const validate = ajv.compile(schema);
      validate(data);
      expect(validate.errors.length).toBeGreaterThan(1);
    });
  });
});
