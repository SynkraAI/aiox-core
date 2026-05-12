const fs = require('fs').promises;
const path = require('path');
const chalk = require('chalk');

/**
 * Test template system for Synkra AIOX automated test generation
 * Provides reusable templates for generating different types of tests
 */
class TestTemplateSystem {
  constructor(options = {}) {
    this.rootPath = options.rootPath || process.cwd();
    this.templatesDir = path.join(this.rootPath, 'aiox-core', 'templates', 'tests');
    this.templateCache = new Map();
    this.frameworks = this.initializeFrameworks();
    this.componentTemplates = this.initializeComponentTemplates();
  }

  /**
   * Initialize test template system
   */
  async initialize() {
    try {
      // Create templates directory
      await fs.mkdir(this.templatesDir, { recursive: true });

      // Create framework-specific template directories
      for (const _framework of Object.keys(this.frameworks)) {
        await fs.mkdir(path.join(this.templatesDir, framework), { recursive: true });
      }

      // Load existing templates
      await this.loadTemplates();

      console.log(chalk.green('✅ Test template system initialized'));
      return true;

    } catch (error) {
      console.error(chalk.red(`Failed to initialize test template system: ${error.message}`));
      throw error;
    }
  }

  /**
   * Get template for specific component type and test type
   */
  async getTemplate(componentType, testType, framework = 'jest', options = {}) {
    const templateKey = `${_framework}-${componentType}-${testType}`;
    
    // Check cache first
    if (this.templateCache.has(templateKey)) {
      return this.templateCache.get(templateKey);
    }

    // Load template from file or generate from base template
    let template = await this.loadTemplateFromFile(templateKey);
    
    if (!template) {
      template = await this.generateTemplate(componentType, testType, _framework, options);
    }

    // Cache the template
    this.templateCache.set(templateKey, template);
    
    return template;
  }

  /**
   * Generate test content using template
   */
  async generateTestContent(component, testFile, config) {
    const template = await this.getTemplate(
      component.type,
      testFile.test_type,
      config.framework,
      {
        qualityLevel: config.qualityLevel,
        mockLevel: config.mockLevel,
        coverageTarget: config.coverageTarget,
      },
    );

    const templateData = {
      component: component,
      testFile: testFile,
      config: config,
      metadata: {
        generatedAt: new Date().toISOString(),
        generator: 'AIOX Test Template System',
        version: '1.0.0',
      },
    };

    return await this.renderTemplate(_template, templateData);
  }

  /**
   * Create custom template
   */
  async createCustomTemplate(templateName, templateContent, options = {}) {
    const templatePath = path.join(this.templatesDir, 'custom', `${templateName}.template.js`);
    
    const templateWrapper = {
      name: templateName,
      type: options.type || 'custom',
      framework: options.framework || 'jest',
      content: templateContent,
      metadata: {
        created: new Date().toISOString(),
        author: options.author || 'system',
        description: options.description || 'Custom test template',
      },
    };

    try {
      await fs.mkdir(path.dirname(templatePath), { recursive: true });
      await fs.writeFile(templatePath, JSON.stringify(templateWrapper, null, 2));
      
      // Add to cache
      this.templateCache.set(templateName, templateWrapper);
      
      console.log(chalk.green(`✅ Custom template created: ${templateName}`));
      return templateWrapper;

    } catch (error) {
      console.error(chalk.red(`Failed to create custom template: ${error.message}`));
      throw error;
    }
  }

  /**
   * Load template from file
   */
  async loadTemplateFromFile(templateKey) {
    const templatePath = path.join(this.templatesDir, `${templateKey}.template.js`);
    
    try {
      const content = await fs.readFile(templatePath, 'utf-8');
      return JSON.parse(content);
    } catch {
      // Template file doesn't exist
      return null;
    }
  }

  /**
   * Generate template from base templates
   */
  async generateTemplate(componentType, testType, _framework, options = {}) {
    const _baseTemplate = this.getBaseTemplate(componentType, testType, framework);
    const _frameworkConfig = this.frameworks[framework];

    const template = {
      name: `${_framework}-${componentType}-${testType}`,
      type: testType,
      framework: framework,
      componentType: componentType,
      imports: this.generateImports(componentType, testType, _framework, options),
      setup: this.generateSetup(componentType, testType, _framework, options),
      testCases: this.generateTestCaseTemplates(componentType, testType, options),
      teardown: this.generateTeardown(componentType, testType, _framework, options),
      mocks: this.generateMockTemplates(componentType, testType, options),
      utilities: this.generateUtilityTemplates(componentType, testType, _framework, options),
      metadata: {
        generated: new Date().toISOString(),
        options: options,
      },
    };

    return template;
  }

  /**
   * Render template with data
   */
  async renderTemplate(_template, data) {
    let content = this.frameworks[template.framework].fileTemplate;

    // Replace template variables
    content = this.replaceTemplateVariables(content, {
      imports: this.renderImports(template.imports, data),
      setup: this.renderSetup(template.setup, data),
      testCases: this.renderTestCases(template.testCases, data),
      teardown: this.renderTeardown(template.teardown, data),
      mocks: this.renderMocks(template.mocks, data),
      utilities: this.renderUtilities(template.utilities, data),
      metadata: this.renderMetadata(template.metadata, data),
    });

    // Format and clean up
    content = this.formatGeneratedCode(content, template.framework);

    return content;
  }

  /**
   * Initialize framework configurations
   */
  initializeFrameworks() {
    return {
      jest: {
        name: 'Jest',
        imports: {
          testFramework: '',
          assertions: '',
          mocks: 'jest',
        },
        syntax: {
          describe: 'describe',
          it: 'it',
          test: 'test',
          expect: 'expect',
          beforeEach: 'beforeEach',
          afterEach: 'afterEach',
          beforeAll: 'beforeAll',
          afterAll: 'afterAll',
          mock: 'jest.mock',
          spyOn: 'jest.spyOn',
        },
        fileTemplate: `{{imports}}

{{mocks}}

{{setup}}

describe('{{component.name}}', () => {
  {{testCases}}
  
  {{teardown}}
});

{{utilities}}

{{metadata}}`,
      },
      mocha: {
        name: 'Mocha',
        imports: {
          testFramework: "const { describe, it, beforeEach, afterEach } = require('mocha');",
          assertions: "const { expect } = require('chai');",
          mocks: "const sinon = require('sinon');",
        },
        syntax: {
          describe: 'describe',
          it: 'it',
          test: 'it',
          expect: 'expect',
          beforeEach: 'beforeEach',
          afterEach: 'afterEach',
          beforeAll: 'before',
          afterAll: 'after',
          mock: 'sinon.mock',
          spyOn: 'sinon.spy',
        },
        fileTemplate: `{{imports}}

{{mocks}}

{{setup}}

describe('{{component.name}}', function() {
  this.timeout(5000);
  
  {{testCases}}
  
  {{teardown}}
});

{{utilities}}

{{metadata}}`,
      },
      vitest: {
        name: 'Vitest',
        imports: {
          testFramework: "import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';",
          assertions: '',
          mocks: '',
        },
        syntax: {
          describe: 'describe',
          it: 'it',
          test: 'test',
          expect: 'expect',
          beforeEach: 'beforeEach',
          afterEach: 'afterEach',
          beforeAll: 'beforeAll',
          afterAll: 'afterAll',
          mock: 'vi.mock',
          spyOn: 'vi.spyOn',
        },
        fileTemplate: `{{imports}}

{{mocks}}

{{setup}}

describe('{{component.name}}', () => {
  {{testCases}}
  
  {{teardown}}
});

{{utilities}}

{{metadata}}`,
      },
    };
  }

  /**
   * Initialize component-specific templates
   */
  initializeComponentTemplates() {
    return {
      agent: {
        imports: [
          "const fs = require('fs').promises;",
          "const path = require('path');",
          "const yaml = require('js-yaml');",
        ],
        setup: {
          variables: [
            'let agentPath;',
            'let agentContent;',
            'let agentConfig;',
          ],
          beforeEach: [
            "agentPath = path.join(__dirname, '../../../aiox-core/agents/{{component.name}}.md');",
            "agentContent = await fs.readFile(agentPath, 'utf-8');",
            'const yamlMatch = agentContent.match(/^---\\s*\\n([\\s\\S]*?)\\n---/);',
            'agentConfig = yamlMatch ? yaml.load(yamlMatch[1]) : {};',
          ],
        },
        testCases: {
          basic: [
            {
              name: 'should have valid YAML frontmatter',
              assertions: [
                'expect(agentConfig).toBeDefined();',
                "expect(agentConfig.name).toBe('{{component.name}}');",
                "expect(agentConfig.type).toBe('agent');",
              ],
            },
            {
              name: 'should have required sections',
              assertions: [
                "expect(agentContent).toContain('## Purpose');",
                "expect(agentContent).toContain('## Capabilities');",
                "expect(agentContent).toContain('## Usage');",
              ],
            },
          ],
          validation: [
            {
              name: 'should validate agent configuration',
              assertions: [
                'expect(agentConfig.version).toMatch(/^\\d+\\.\\d+\\.\\d+$/);',
                'expect(agentConfig.capabilities).toBeInstanceOf(Array);',
                'expect(agentConfig.capabilities.length).toBeGreaterThan(0);',
              ],
            },
          ],
        },
      },
      task: {
        imports: [
          "const fs = require('fs').promises;",
          "const path = require('path');",
        ],
        setup: {
          variables: [
            'let taskPath;',
            'let taskContent;',
            'let TaskClass;',
          ],
          beforeEach: [
            "taskPath = path.join(__dirname, '../../../aiox-core/tasks/{{component.name}}.md');",
            "taskContent = await fs.readFile(taskPath, 'utf-8');",
          ],
        },
        testCases: {
          basic: [
            {
              name: 'should have valid task structure',
              assertions: [
                "expect(taskContent).toContain('# {{component.name}}');",
                "expect(taskContent).toContain('## Purpose');",
                "expect(taskContent).toContain('## Implementation');",
              ],
            },
            {
              name: 'should have implementation code',
              assertions: [
                "expect(taskContent).toContain('class');",
                "expect(taskContent).toContain('async execute(');",
              ],
            },
          ],
          execution: [
            {
              name: 'should execute task successfully',
              setup: 'const taskInstance = new TaskClass();',
              assertions: [
                "const result = await taskInstance.execute(['test-param']);",
                'expect(result).toBeDefined();',
                'expect(result.success).toBe(true);',
              ],
            },
          ],
        },
      },
      workflow: {
        imports: [
          "const fs = require('fs').promises;",
          "const path = require('path');",
          "const yaml = require('js-yaml');",
        ],
        setup: {
          variables: [
            'let workflowPath;',
            'let workflowConfig;',
          ],
          beforeEach: [
            "workflowPath = path.join(__dirname, '../../../aiox-core/workflows/{{component.name}}.yaml');",
            "const workflowContent = await fs.readFile(workflowPath, 'utf-8');",
            'workflowConfig = yaml.load(workflowContent);',
          ],
        },
        testCases: {
          basic: [
            {
              name: 'should have valid workflow structure',
              assertions: [
                'expect(workflowConfig).toBeDefined();',
                "expect(workflowConfig.name).toBe('{{component.name}}');",
                'expect(workflowConfig.steps).toBeInstanceOf(Array);',
              ],
            },
            {
              name: 'should have required metadata',
              assertions: [
                'expect(workflowConfig.version).toBeDefined();',
                'expect(workflowConfig.description).toBeDefined();',
                'expect(workflowConfig.steps.length).toBeGreaterThan(0);',
              ],
            },
          ],
          validation: [
            {
              name: 'should validate workflow steps',
              assertions: [
                'workflowConfig.steps.forEach(step => {',
                '  expect(step.name).toBeDefined();',
                '  expect(step.action).toBeDefined();',
                '});',
              ],
            },
          ],
        },
      },
      util: {
        imports: [
          "const path = require('path');",
        ],
        setup: {
          variables: [
            'let UtilClass;',
            'let utilInstance;',
          ],
          beforeEach: [
            "UtilClass = require('../../../aiox-core/scripts/{{component.name}}');",
            'utilInstance = new UtilClass();',
          ],
        },
        testCases: {
          basic: [
            {
              name: 'should instantiate correctly',
              assertions: [
                'expect(utilInstance).toBeDefined();',
                "expect(utilInstance.constructor.name).toBe('{{componentClass}}');",
              ],
            },
            {
              name: 'should have required methods',
              assertions: [
                "expect(typeof utilInstance.initialize).toBe('function');",
              ],
            },
          ],
          functionality: [
            {
              name: 'should initialize successfully',
              assertions: [
                'const result = await utilInstance.initialize();',
                'expect(result).toBeTruthy();',
              ],
            },
          ],
        },
      },
    };
  }

  /**
   * Generate imports section
   */
  generateImports(componentType, testType, _framework, options) {
    const _frameworkConfig = this.frameworks[framework];
    const componentTemplate = this.componentTemplates[componentType];
    
    const imports = [
      frameworkConfig.imports.testFramework,
      frameworkConfig.imports.assertions,
      frameworkConfig.imports.mocks,
    ].filter(imp => imp);

    // Add component-specific imports
    if (componentTemplate && componentTemplate.imports) {
      imports.push(...componentTemplate.imports);
    }

    // Add integration/e2e specific imports
    if (testType === 'integration') {
      imports.push(
        "const request = require('supertest');",
        "const { setupTestDB, teardownTestDB } = require('../../helpers/db-helper');",
      );
    }

    if (testType === 'e2e') {
      imports.push(
        "const { setupTestEnvironment, cleanupTestEnvironment } = require('../../helpers/e2e-helper');",
      );
    }

    return imports;
  }

  /**
   * Generate setup section
   */
  generateSetup(componentType, testType, _framework, options) {
    const componentTemplate = this.componentTemplates[componentType];
    const setup = {
      variables: [],
      beforeAll: [],
      beforeEach: [],
      afterEach: [],
      afterAll: [],
    };

    // Add component-specific setup
    if (componentTemplate && componentTemplate.setup) {
      setup.variables.push(...(componentTemplate.setup.variables || []));
      setup.beforeEach.push(...(componentTemplate.setup.beforeEach || []));
    }

    // Add test type specific setup
    if (testType === 'integration') {
      setup.beforeAll.push('await setupTestDB();');
      setup.afterAll.push('await teardownTestDB();');
    }

    if (testType === 'e2e') {
      setup.beforeAll.push('await setupTestEnvironment();');
      setup.afterAll.push('await cleanupTestEnvironment();');
    }

    return setup;
  }

  /**
   * Generate test case templates
   */
  generateTestCaseTemplates(componentType, testType, options) {
    const componentTemplate = this.componentTemplates[componentType];
    const testCases = [];

    if (componentTemplate && componentTemplate.testCases) {
      // Add basic test cases
      if (componentTemplate.testCases.basic) {
        testCases.push(...componentTemplate.testCases.basic);
      }

      // Add specific test cases based on quality level
      if (options.qualityLevel === 'comprehensive') {
        if (componentTemplate.testCases.validation) {
          testCases.push(...componentTemplate.testCases.validation);
        }
        if (componentTemplate.testCases.execution) {
          testCases.push(...componentTemplate.testCases.execution);
        }
        if (componentTemplate.testCases.functionality) {
          testCases.push(...componentTemplate.testCases.functionality);
        }
      }
    }

    // Add generic test cases if no specific ones found
    if (testCases.length === 0) {
      testCases.push({
        name: 'should be defined',
        assertions: ['expect({{component.name}}).toBeDefined();'],
      });
    }

    return testCases;
  }

  /**
   * Generate teardown section
   */
  generateTeardown(componentType, testType, _framework, options) {
    const teardown = {
      afterEach: [],
      afterAll: [],
    };

    // Add component-specific teardown
    if (componentType === 'util') {
      teardown.afterEach.push('if (utilInstance && utilInstance.cleanup) await utilInstance.cleanup();');
    }

    return teardown;
  }

  /**
   * Generate mock templates
   */
  generateMockTemplates(componentType, testType, options) {
    const mocks = [];

    if (options.mockLevel === 'extensive') {
      // Add comprehensive mocking
      mocks.push({
        type: 'module',
        target: 'fs',
        implementation: '{ promises: { readFile: jest.fn(), writeFile: jest.fn() } }',
      });
    }

    if (options.mockLevel !== 'minimal') {
      // Add moderate mocking
      if (componentType === 'agent' || componentType === 'workflow') {
        mocks.push({
          type: 'module',
          target: 'js-yaml',
          implementation: '{ load: jest.fn(), dump: jest.fn() }',
        });
      }
    }

    return mocks;
  }

  /**
   * Generate utility templates
   */
  generateUtilityTemplates(componentType, testType, _framework, options) {
    const utilities = [];

    // Add helper functions for specific component types
    if (componentType === 'agent') {
      utilities.push({
        name: 'createMockAgentConfig',
        implementation: `function createMockAgentConfig(overrides = {}) {
  return {
    name: '{{component.name}}',
    type: 'agent',
    version: '1.0.0',
    capabilities: ['test'],
    ...overrides
  };
}`,
      });
    }

    if (testType === 'integration') {
      utilities.push({
        name: 'createTestContext',
        implementation: `function createTestContext() {
  return {
    testId: 'test-' + Date.now(),
    cleanup: []
  };
}`,
      });
    }

    return utilities;
  }

  /**
   * Render template sections
   */
  renderImports(imports, data) {
    return imports.filter(imp => imp).join('\n');
  }

  renderSetup(setup, data) {
    let content = '';
    
    if (setup.variables.length > 0) {
      content += setup.variables.join('\n') + '\n\n';
    }

    if (setup.beforeAll.length > 0) {
      content += `beforeAll(async () => {
  ${setup.beforeAll.join('\n  ')}
});

`;
    }

    if (setup.beforeEach.length > 0) {
      content += `beforeEach(async () => {
  ${setup.beforeEach.join('\n  ')}
});

`;
    }

    return content;
  }

  renderTestCases(testCases, data) {
    return testCases.map(testCase => {
      let caseContent = `  it('${testCase.name}', async () => {\n`;
      
      if (testCase.setup) {
        caseContent += `    ${testCase.setup}\n\n`;
      }
      
      if (testCase.assertions) {
        caseContent += testCase.assertions.map(assertion => `    ${assertion}`).join('\n');
      }
      
      caseContent += '\n  });';
      
      return caseContent;
    }).join('\n\n');
  }

  renderTeardown(teardown, data) {
    let content = '';

    if (teardown.afterEach.length > 0) {
      content += `
afterEach(async () => {
  ${teardown.afterEach.join('\n  ')}
});`;
    }

    if (teardown.afterAll.length > 0) {
      content += `
afterAll(async () => {
  ${teardown.afterAll.join('\n  ')}
});`;
    }

    return content;
  }

  renderMocks(mocks, data) {
    if (mocks.length === 0) return '';

    return mocks.map(mock => {
      if (mock.type === 'module') {
        return `jest.mock('${mock.target}', () => (${mock.implementation}));`;
      }
      return '';
    }).filter(mock => mock).join('\n') + '\n';
  }

  renderUtilities(utilities, data) {
    if (utilities.length === 0) return '';

    return '\n// Test Utilities\n' + 
           utilities.map(util => util.implementation).join('\n\n');
  }

  renderMetadata(metadata, data) {
    return `
// Generated by AIOX Test Template System
// Generated at: ${data.metadata.generatedAt}
// Component: ${data.component.type}/${data.component.name}
// Framework: ${data.config.framework}`;
  }

  /**
   * Replace template variables in content
   */
  replaceTemplateVariables(content, sections) {
    let result = content;
    
    Object.entries(sections).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      result = result.replace(new RegExp(placeholder, 'g'), value || '');
    });

    // Replace component-specific variables
    result = result.replace(/\{\{component\.name\}\}/g, '${data.component.name}');
    result = result.replace(/\{\{component\.type\}\}/g, '${data.component.type}');
    result = result.replace(/\{\{componentClass\}\}/g, '${this.toClassName(data.component.name)}');

    return result;
  }

  /**
   * Format generated code
   */
  formatGeneratedCode(content, framework) {
    // Remove excessive blank lines
    content = content.replace(/\n{3,}/g, '\n\n');
    
    // Ensure proper spacing around blocks
    content = content.replace(/}\n{/g, '}\n\n{');
    
    // Clean up any template artifacts
    content = content.replace(/\{\{[^}]+\}\}/g, '');
    
    return content.trim();
  }

  /**
   * Load all templates from disk
   */
  async loadTemplates() {
    try {
      const templateFiles = await this.findTemplateFiles();
      
      for (const templateFile of templateFiles) {
        try {
          const content = await fs.readFile(templateFile, 'utf-8');
          const template = JSON.parse(content);
          const templateKey = path.basename(templateFile, '.template.js');
          
          this.templateCache.set(templateKey, template);
        } catch (error) {
          console.warn(chalk.yellow(`Failed to load template ${templateFile}: ${error.message}`));
        }
      }

      console.log(chalk.gray(`Loaded ${this.templateCache.size} template(s)`));

    } catch (error) {
      console.warn(chalk.yellow(`Failed to load templates: ${error.message}`));
    }
  }

  /**
   * Find all template files
   */
  async findTemplateFiles() {
    const templateFiles = [];
    
    try {
      const entries = await fs.readdir(this.templatesDir, { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const subDir = path.join(this.templatesDir, entry.name);
          const subFiles = await fs.readdir(subDir);
          
          for (const subFile of subFiles) {
            if (subFile.endsWith('.template.js')) {
              templateFiles.push(path.join(subDir, subFile));
            }
          }
        } else if (entry.name.endsWith('.template.js')) {
          templateFiles.push(path.join(this.templatesDir, entry.name));
        }
      }
    } catch {
      // Templates directory doesn't exist yet
    }

    return templateFiles;
  }

  /**
   * Get base template for component and test type
   */
  getBaseTemplate(componentType, testType, framework) {
    return {
      componentType,
      testType,
      _framework,
      baseStructure: this.frameworks[framework].fileTemplate,
    };
  }

  /**
   * Convert component name to class name
   */
  toClassName(name) {
    return name.split('-')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join('');
  }

  /**
   * Get available templates
   */
  getAvailableTemplates() {
    const templates = {};
    
    for (const [key, template] of this.templateCache.entries()) {
      const [framework, componentType, testType] = key.split('-');
      
      if (!templates[framework]) templates[framework] = {};
      if (!templates[framework][componentType]) templates[framework][componentType] = [];
      
      templates[framework][componentType].push(_testType);
    }

    return templates;
  }

  /**
   * Validate template
   */
  validateTemplate(_template) {
    const required = ['name', 'type', 'framework', 'componentType'];
    
    for (const field of required) {
      if (!template[field]) {
        throw new Error(`Template missing required field: ${field}`);
      }
    }

    if (!this.frameworks[template.framework]) {
      throw new Error(`Unsupported framework: ${template.framework}`);
    }

    return true;
  }
}

module.exports = TestTemplateSystem;