/**
 * Template Engine v2.0 Test Suite
 * Tests for Story 3.6 - Template Engine Core Refactor
 *
 * Test IDs:
 * - TE-01: Load template with frontmatter
 * - TE-02: Elicit variables interactively
 * - TE-03: Render template with context
 * - TE-04: Validate output with JSON Schema
 * - TE-05: Generate complete document
 * - TE-06: Handle missing variables
 * - TE-07: List supported templates
 */

'use strict';

const path = require('path');
const fs = require('fs').promises;

// Mock inquirer for non-interactive tests
jest.mock('inquirer', () => ({
  prompt: jest.fn().mockResolvedValue({}),
}));

const {
  TemplateEngine,
  TemplateLoader,
  VariableElicitation,
  TemplateRenderer,
  TemplateValidator,
  SUPPORTED_TYPES,
} = require('../../.aiox-core/product/templates/engine');

const inquirer = require('inquirer');

describe('Template Engine v2.0', () => {
  const baseDir = path.join(__dirname, '..', '..');
  const templatesDir = path.join(baseDir, '.aiox-core', 'product', 'templates');
  const schemasDir = path.join(templatesDir, 'engine', 'schemas');

  let engine;

  beforeEach(() => {
    engine = new TemplateEngine({
      baseDir,
      templatesDir,
      schemasDir,
      interactive: false,
    });
    jest.clearAllMocks();
  });

  describe('TE-01: Template Loader', () => {
    let loader;

    beforeEach(() => {
      loader = new TemplateLoader({ templatesDir });
    });

    test('should load template with YAML frontmatter', async () => {
      const template = await loader.load('adr');

      expect(template).toBeDefined();
      expect(template.metadata).toBeDefined();
      expect(template.metadata.template_id).toBe('adr');
      expect(template.metadata.template_name).toBe('Architecture Decision Record');
      expect(template.body).toBeTruthy();
    });

    test('should parse variables from frontmatter', async () => {
      const template = await loader.load('prd');

      expect(template.variables).toBeDefined();
      expect(Array.isArray(template.variables)).toBe(true);
      expect(template.variables.length).toBeGreaterThan(0);

      const titleVar = template.variables.find(v => v.name === 'title');
      expect(titleVar).toBeDefined();
      expect(titleVar.required).toBe(true);
    });

    test('should throw error for missing template', async () => {
      await expect(loader.load('nonexistent')).rejects.toThrow('Template not found');
    });

    test('should cache loaded templates', async () => {
      const template1 = await loader.load('adr');
      const template2 = await loader.load('adr');

      expect(template1).toBe(template2); // Same reference
    });

    test('should list available templates', async () => {
      const templates = await loader.listTemplates();

      expect(Array.isArray(templates)).toBe(true);
      expect(templates).toContain('prd');
      expect(templates).toContain('adr');
    });
  });

  describe('TE-02: Variable Elicitation', () => {
    let elicitation;

    beforeEach(() => {
      elicitation = new VariableElicitation({ interactive: false });
    });

    test('should merge provided context with defaults', async () => {
      const variables = [
        { name: 'title', type: 'string', required: true },
        { name: 'status', type: 'choice', default: 'Draft' },
      ];

      const values = await elicitation.elicit(variables, { title: 'Test Title' });

      expect(values.title).toBe('Test Title');
      expect(values.status).toBe('Draft');
    });

    test('should resolve auto values', async () => {
      const variables = [
        { name: 'now', type: 'string', auto: 'current_date' },
      ];

      const values = await elicitation.elicit(variables, {});

      expect(values.now).toBeDefined();
      expect(values.now).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    test('should validate required variables', () => {
      const variables = [
        { name: 'title', required: true },
        { name: 'description', required: false },
      ];

      const result = elicitation.validate(variables, { description: 'test' });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Missing required variable: title');
    });

    test('should handle interactive mode', async () => {
      const interactiveElicitation = new VariableElicitation({ interactive: true });

      inquirer.prompt.mockResolvedValue({ title: 'Interactive Title' });

      const variables = [
        { name: 'title', type: 'string', required: true, prompt: 'Enter title:' },
      ];

      const values = await interactiveElicitation.elicit(variables, {});

      expect(inquirer.prompt).toHaveBeenCalled();
      expect(values.title).toBe('Interactive Title');
    });
  });

  describe('TE-03: Template Renderer', () => {
    let renderer;

    beforeEach(() => {
      renderer = new TemplateRenderer();
    });

    test('should render simple template', () => {
      const template = { body: '# {{title}}\n\nBy {{author}}' };
      const context = { title: 'Test Document', author: 'Tester' };

      const result = renderer.render(template, context);

      expect(result).toContain('# Test Document');
      expect(result).toContain('By Tester');
    });

    test('should support padNumber helper', () => {
      const template = { body: 'ADR {{padNumber number 3}}' };
      const context = { number: 5 };

      const result = renderer.render(template, context);

      expect(result).toBe('ADR 005');
    });

    test('should support formatDate helper', () => {
      const template = { body: 'Date: {{formatDate now "YYYY-MM-DD"}}' };
      // Use current date to avoid timezone issues between test and renderer
      const testDate = new Date();
      const context = { now: testDate };

      const result = renderer.render(template, context);

      // Verify format matches YYYY-MM-DD pattern with correct values from local date
      const expectedYear = testDate.getFullYear();
      const expectedMonth = String(testDate.getMonth() + 1).padStart(2, '0');
      const expectedDay = String(testDate.getDate()).padStart(2, '0');
      expect(result).toBe(`Date: ${expectedYear}-${expectedMonth}-${expectedDay}`);
    });

    test('should support conditional blocks', () => {
      const template = {
        body: '{{#if showDetails}}Details: {{details}}{{else}}No details{{/if}}',
      };

      expect(renderer.render(template, { showDetails: true, details: 'Some info' }))
        .toBe('Details: Some info');
      expect(renderer.render(template, { showDetails: false }))
        .toBe('No details');
    });

    test('should support each loops', () => {
      const template = {
        body: '{{#each items}}- {{this}}\n{{/each}}',
      };
      const context = { items: ['Item 1', 'Item 2', 'Item 3'] };

      const result = renderer.render(template, context);

      expect(result).toContain('- Item 1');
      expect(result).toContain('- Item 2');
      expect(result).toContain('- Item 3');
    });

    test('should validate template syntax', () => {
      const validTemplate = '{{#if test}}content{{/if}}';
      // Handlebars only catches incomplete expressions at execution time
      const invalidTemplate = '{{';

      expect(renderer.validateSyntax(validTemplate).isValid).toBe(true);
      expect(renderer.validateSyntax(invalidTemplate).isValid).toBe(false);
    });
  });

  describe('TE-04: JSON Schema Validation', () => {
    let validator;

    beforeEach(() => {
      validator = new TemplateValidator({ schemasDir });
    });

    test('should load schema for template type', async () => {
      const schema = await validator.loadSchema('adr');

      expect(schema).toBeDefined();
      expect(schema.title).toBe('ADR Template Variables');
      expect(schema.required).toContain('title');
    });

    test('should validate valid data', async () => {
      const data = {
        number: 1,
        title: 'Use TypeScript for Backend',
        status: 'Proposed',
        deciders: 'Team Lead, Architect',
        context: 'We need to choose a language for the backend that provides type safety.',
        decision: 'We will use TypeScript with Node.js for all backend services.',
        positiveConsequences: ['Better type safety', 'Improved developer experience'],
      };

      const result = await validator.validate(data, 'adr');

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should reject invalid data', async () => {
      const data = {
        number: 1,
        title: 'Test', // Too short
        status: 'Invalid', // Not in enum
        deciders: 'Team',
        context: 'Short', // Too short
        decision: 'Short', // Too short
        positiveConsequences: [], // Empty array
      };

      const result = await validator.validate(data, 'adr');

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('should validate structure of rendered content', async () => {
      const template = {
        metadata: {
          required_sections: ['Context', 'Decision'],
        },
      };

      const validContent = '# ADR 001\n\n## Context\nSome context\n\n## Decision\nSome decision';
      const invalidContent = '# ADR 001\n\n## Context\nSome context';

      expect(validator.validateStructure(validContent, template).isValid).toBe(true);
      expect(validator.validateStructure(invalidContent, template).isValid).toBe(false);
    });
  });

  describe('TE-05: Complete Document Generation', () => {
    test('should generate complete ADR', async () => {
      const context = {
        number: 1,
        title: 'Use Handlebars for Template Engine',
        status: 'Proposed',
        deciders: 'Dex, Pax',
        context: 'We need a templating solution for generating documentation that supports variables, conditionals, and loops.',
        decision: 'We will use Handlebars.js as our template engine because it provides a simple syntax, is well-maintained, and supports custom helpers.',
        positiveConsequences: [
          'Simple and familiar syntax',
          'Good documentation',
          'Active community',
        ],
        negativeConsequences: [
          'Limited logic in templates',
        ],
      };

      const result = await engine.generate('adr', context);

      expect(result.content).toContain('# ADR 001: Use Handlebars for Template Engine');
      expect(result.content).toContain('**Status:** Proposed');
      expect(result.content).toContain('**Deciders:** Dex, Pax');
      expect(result.content).toContain('## Context');
      expect(result.content).toContain('## Decision');
      expect(result.content).toContain('## Consequences');
      expect(result.content).toContain('✅ Simple and familiar syntax');
      expect(result.content).toContain('⚠️ Limited logic in templates');
    });

    test('should generate complete PRD', async () => {
      const context = {
        title: 'Template Engine v2.0',
        version: '2.0',
        status: 'Draft',
        owner: 'Pax',
        problem_statement: 'The current template system is inconsistent and lacks validation.',
        goals: [
          'Unified template format',
          'Schema validation',
          'Interactive variable elicitation',
        ],
      };

      const result = await engine.generate('prd', context);

      expect(result.content).toContain('# Template Engine v2.0');
      expect(result.content).toContain('**Version:** 2.0');
      expect(result.content).toContain('## Problem Statement');
      expect(result.content).toContain('## Goals');
    });
  });

  describe('TE-06: Error Handling', () => {
    test('should throw for unsupported template type', async () => {
      await expect(engine.generate('unsupported', {}))
        .rejects.toThrow('Unsupported template type');
    });

    test('should throw for missing required variables in non-interactive mode', async () => {
      await expect(engine.generate('adr', { title: 'Test' }))
        .rejects.toThrow('has no default and interactive mode is disabled');
    });

    test('should handle template syntax errors gracefully', () => {
      const renderer = new TemplateRenderer();
      const badTemplate = { body: '{{#if test}unterminated' };

      expect(() => renderer.render(badTemplate, {})).toThrow();
    });
  });

  describe('TE-07: Template Listing', () => {
    test('should return supported template types', () => {
      expect(engine.supportedTypes).toEqual(SUPPORTED_TYPES);
      expect(engine.supportedTypes).toContain('prd');
      expect(engine.supportedTypes).toContain('adr');
      expect(engine.supportedTypes).toContain('pmdr');
      expect(engine.supportedTypes).toContain('dbdr');
      expect(engine.supportedTypes).toContain('story');
      expect(engine.supportedTypes).toContain('epic');
      expect(engine.supportedTypes).toContain('task');
    });

    test('should list templates with info', async () => {
      const templates = await engine.listTemplates();

      // 8 supported types: prd, prd-v2, adr, pmdr, dbdr, story, epic, task
      expect(templates.length).toBe(8);

      const adrTemplate = templates.find(t => t.type === 'adr');
      expect(adrTemplate).toBeDefined();
      expect(adrTemplate.name).toBe('Architecture Decision Record');
    });

    test('should get template info', async () => {
      const info = await engine.getTemplateInfo('prd');

      expect(info.type).toBe('prd');
      expect(info.name).toBe('Product Requirements Document');
      // Version can be string or number in YAML
      expect(String(info.version)).toBe('2');
      expect(Array.isArray(info.variables)).toBe(true);
    });
  });

  describe('Custom Helpers', () => {
    test('should support custom registered helpers', () => {
      engine.registerHelper('emphasize', (text) => `**${text}**`);

      const renderer = engine.renderer;
      const result = renderer.render({ body: '{{emphasize message}}' }, { message: 'Important' });

      expect(result).toBe('**Important**');
    });

    test('should support add/subtract helpers', () => {
      const renderer = new TemplateRenderer();

      expect(renderer.render({ body: '{{add 5 3}}' }, {})).toBe('8');
      expect(renderer.render({ body: '{{subtract 10 4}}' }, {})).toBe('6');
    });

    test('should support string helpers', () => {
      const renderer = new TemplateRenderer();

      expect(renderer.render({ body: '{{uppercase "hello"}}' }, {})).toBe('HELLO');
      expect(renderer.render({ body: '{{lowercase "HELLO"}}' }, {})).toBe('hello');
      expect(renderer.render({ body: '{{capitalize "hello world"}}' }, {})).toBe('Hello world');
      expect(renderer.render({ body: '{{slug "Hello World!"}}' }, {})).toBe('hello-world');
    });

    test('should support array helpers', () => {
      const renderer = new TemplateRenderer();
      const context = { items: ['a', 'b', 'c'] };

      expect(renderer.render({ body: '{{join items "-"}}' }, context)).toBe('a-b-c');
      expect(renderer.render({ body: '{{length items}}' }, context)).toBe('3');
      expect(renderer.render({ body: '{{first items}}' }, context)).toBe('a');
      expect(renderer.render({ body: '{{last items}}' }, context)).toBe('c');
    });

    test('should support times helper with @index data variable', () => {
      const renderer = new TemplateRenderer();

      // Test @index access via data frame
      const result = renderer.render({ body: '{{#times 3}}{{@index}}{{/times}}' }, {});
      expect(result).toBe('012');

      // Test @first and @last data variables
      const resultFlags = renderer.render({ body: '{{#times 3}}{{#if @first}}F{{/if}}{{@index}}{{#if @last}}L{{/if}}{{/times}}' }, {});
      expect(resultFlags).toBe('F012L');
    });
  });
});
