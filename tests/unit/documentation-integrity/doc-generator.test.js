/**
 * Documentation Generator Unit Tests
 *
 * @module tests/unit/documentation-integrity/doc-generator
 * @story 6.9
 */

const path = require('path');
const fs = require('fs');
const os = require('os');

const {
  buildDocContext,
  renderTemplate,
  loadTemplate,
  generateDocs,
  generateDoc,
  TemplateFiles,
  OutputFiles,
} = require('../../../.aiox-core/infrastructure/scripts/documentation-integrity/doc-generator');

describe('Documentation Generator', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'aiox-docgen-test-'));
  });

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('buildDocContext', () => {
    it('should build context for Node.js project', () => {
      const markers = {
        hasPackageJson: true,
        hasTsconfig: true,
      };

      const context = buildDocContext('my-project', 'greenfield', markers);

      expect(context.PROJECT_NAME).toBe('my-project');
      expect(context.INSTALLATION_MODE).toBe('greenfield');
      expect(context.IS_NODE).toBe(true);
      expect(context.IS_TYPESCRIPT).toBe(true);
      expect(context.FILE_EXT).toBe('ts');
      expect(context.TECH_STACK).toContain('Node.js');
    });

    it('should build context for Python project', () => {
      const markers = {
        hasPythonProject: true,
      };

      const context = buildDocContext('py-project', 'brownfield', markers);

      expect(context.IS_PYTHON).toBe(true);
      expect(context.PYTHON_PACKAGE_NAME).toBe('py_project');
      expect(context.TECH_STACK).toContain('Python');
    });

    it('should build context for Go project', () => {
      const markers = {
        hasGoMod: true,
      };

      const context = buildDocContext('go-service', 'greenfield', markers);

      expect(context.IS_GO).toBe(true);
      expect(context.GO_MODULE).toContain('go-service');
      expect(context.TECH_STACK).toContain('Go');
    });

    it('should build context for Rust project', () => {
      const markers = {
        hasCargoToml: true,
      };

      const context = buildDocContext('rust-app', 'greenfield', markers);

      expect(context.IS_RUST).toBe(true);
      expect(context.TECH_STACK).toContain('Rust');
    });

    it('should apply overrides', () => {
      const markers = { hasPackageJson: true };
      const overrides = {
        NODE_VERSION: '20+',
        DEPLOYMENT_PLATFORM: 'Railway',
      };

      const context = buildDocContext('test', 'greenfield', markers, overrides);

      expect(context.NODE_VERSION).toBe('20+');
      expect(context.DEPLOYMENT_PLATFORM).toBe('Railway');
    });

    it('should include generation date', () => {
      const context = buildDocContext('test', 'greenfield', {});
      const today = new Date().toISOString().split('T')[0];

      expect(context.GENERATED_DATE).toBe(today);
    });

    it('should handle multi-stack projects', () => {
      const markers = {
        hasPackageJson: true,
        hasPythonProject: true,
      };

      const context = buildDocContext('full-stack', 'brownfield', markers);

      expect(context.IS_NODE).toBe(true);
      expect(context.IS_PYTHON).toBe(true);
      expect(context.TECH_STACK).toContain('Node.js');
      expect(context.TECH_STACK).toContain('Python');
    });
  });

  describe('renderTemplate', () => {
    it('should replace simple variables', () => {
      const template = 'Hello {{name}}!';
      const context = { name: 'World' };

      const result = renderTemplate(template, context);

      expect(result).toBe('Hello World!');
    });

    it('should handle multiple variables', () => {
      const template = '{{greeting}} {{name}}, welcome to {{place}}!';
      const context = { greeting: 'Hello', name: 'User', place: 'AIOX' };

      const result = renderTemplate(template, context);

      expect(result).toBe('Hello User, welcome to AIOX!');
    });

    it('should process if blocks with true condition', () => {
      const template = '{{#if IS_NODE}}Node.js project{{/if}}';
      const context = { IS_NODE: true };

      const result = renderTemplate(template, context);

      expect(result).toBe('Node.js project');
    });

    it('should process if blocks with false condition', () => {
      const template = '{{#if IS_NODE}}Node.js project{{/if}}';
      const context = { IS_NODE: false };

      const result = renderTemplate(template, context);

      expect(result).toBe('');
    });

    it('should process nested if blocks', () => {
      const template = '{{#if IS_NODE}}{{#if IS_TYPESCRIPT}}TS{{/if}}{{/if}}';
      const context = { IS_NODE: true, IS_TYPESCRIPT: true };

      const result = renderTemplate(template, context);

      expect(result).toBe('TS');
    });

    it('should process each blocks', () => {
      const template = '{{#each items}}{{this}},{{/each}}';
      const context = { items: ['a', 'b', 'c'] };

      const result = renderTemplate(template, context);

      expect(result).toBe('a,b,c,');
    });

    it('should process each blocks with objects', () => {
      const template = '{{#each deps}}{{this.name}}:{{this.version}};{{/each}}';
      const context = {
        deps: [
          { name: 'express', version: '4.0' },
          { name: 'lodash', version: '4.17' },
        ],
      };

      const result = renderTemplate(template, context);

      expect(result).toBe('express:4.0;lodash:4.17;');
    });

    it('should handle empty each blocks', () => {
      const template = 'Deps: {{#each items}}{{this}}{{/each}}';
      const context = { items: [] };

      const result = renderTemplate(template, context);

      expect(result).toBe('Deps: ');
    });

    it('should preserve unmatched variables', () => {
      const template = '{{name}} - {{unknown}}';
      const context = { name: 'Test' };

      const result = renderTemplate(template, context);

      expect(result).toBe('Test - {{unknown}}');
    });
  });

  describe('loadTemplate', () => {
    it('should load source-tree template', () => {
      const template = loadTemplate(TemplateFiles.SOURCE_TREE);

      expect(template).toContain('{{PROJECT_NAME}}');
      expect(template).toContain('Source Tree');
    });

    it('should load coding-standards template', () => {
      const template = loadTemplate(TemplateFiles.CODING_STANDARDS);

      expect(template).toContain('{{PROJECT_NAME}}');
      expect(template).toContain('Coding Standards');
    });

    it('should load tech-stack template', () => {
      const template = loadTemplate(TemplateFiles.TECH_STACK);

      expect(template).toContain('{{PROJECT_NAME}}');
      expect(template).toContain('Tech Stack');
    });

    it('should throw for non-existent template', () => {
      expect(() => loadTemplate('non-existent.md')).toThrow('Template not found');
    });
  });

  describe('generateDocs', () => {
    it('should generate all docs for Node.js project', () => {
      const context = buildDocContext('test-project', 'greenfield', {
        hasPackageJson: true,
      });

      const results = generateDocs(tempDir, context);

      expect(results[OutputFiles.SOURCE_TREE].success).toBe(true);
      expect(results[OutputFiles.CODING_STANDARDS].success).toBe(true);
      expect(results[OutputFiles.TECH_STACK].success).toBe(true);

      // Check files were created
      const docsDir = path.join(tempDir, 'docs', 'architecture');
      expect(fs.existsSync(path.join(docsDir, 'source-tree.md'))).toBe(true);
      expect(fs.existsSync(path.join(docsDir, 'coding-standards.md'))).toBe(true);
      expect(fs.existsSync(path.join(docsDir, 'tech-stack.md'))).toBe(true);
    });

    it('should support dry run mode', () => {
      const context = buildDocContext('test-project', 'greenfield', {
        hasPackageJson: true,
      });

      const results = generateDocs(tempDir, context, { dryRun: true });

      expect(results[OutputFiles.SOURCE_TREE].success).toBe(true);
      expect(results[OutputFiles.SOURCE_TREE].content).toBeTruthy();

      // Check files were NOT created
      const docsDir = path.join(tempDir, 'docs', 'architecture');
      expect(fs.existsSync(docsDir)).toBe(false);
    });

    it('should include project name in generated docs', () => {
      const context = buildDocContext('my-awesome-project', 'greenfield', {
        hasPackageJson: true,
      });

      const results = generateDocs(tempDir, context, { dryRun: true });

      expect(results[OutputFiles.SOURCE_TREE].content).toContain('my-awesome-project');
      expect(results[OutputFiles.CODING_STANDARDS].content).toContain('my-awesome-project');
      expect(results[OutputFiles.TECH_STACK].content).toContain('my-awesome-project');
    });

    it('should create docs directory if it does not exist', () => {
      const context = buildDocContext('test', 'greenfield', {});

      generateDocs(tempDir, context);

      const docsDir = path.join(tempDir, 'docs', 'architecture');
      expect(fs.existsSync(docsDir)).toBe(true);
    });
  });

  describe('generateDoc', () => {
    it('should generate single doc from template', () => {
      const context = {
        PROJECT_NAME: 'single-test',
        GENERATED_DATE: '2025-01-01',
        INSTALLATION_MODE: 'greenfield',
        TECH_STACK: 'Node.js',
        IS_NODE: true,
        IS_PYTHON: false,
        IS_GO: false,
        IS_RUST: false,
        IS_TYPESCRIPT: false,
        FILE_EXT: 'js',
        NODE_VERSION: '18+',
        QUALITY_GATES: ['Lint', 'Tests'],
      };

      const content = generateDoc(TemplateFiles.SOURCE_TREE, context);

      expect(content).toContain('single-test');
      expect(content).toContain('greenfield');
      expect(content).toContain('Node.js');
    });
  });

  describe('TemplateFiles enum', () => {
    it('should have all required templates', () => {
      expect(TemplateFiles.SOURCE_TREE).toBe('source-tree-tmpl.md');
      expect(TemplateFiles.CODING_STANDARDS).toBe('coding-standards-tmpl.md');
      expect(TemplateFiles.TECH_STACK).toBe('tech-stack-tmpl.md');
    });
  });

  describe('OutputFiles enum', () => {
    it('should have all required output files', () => {
      expect(OutputFiles.SOURCE_TREE).toBe('source-tree.md');
      expect(OutputFiles.CODING_STANDARDS).toBe('coding-standards.md');
      expect(OutputFiles.TECH_STACK).toBe('tech-stack.md');
    });
  });
});
