const fs = require('fs').promises;
const path = require('path');
const chalk = require('chalk');

/**
 * Test generator for AIOS-FULLSTACK automated test generation
 * Orchestrates test file creation using the template system
 */
class TestGenerator {
  constructor(options = {}) {
    this.rootPath = options.rootPath || process.cwd();
    this.templateSystem = options.templateSystem;
    this.generationCache = new Map();
    this.generationStats = {
      total_generated: 0,
      successful: 0,
      failed: 0,
      generation_time: 0
    };
  }

  /**
   * Initialize test generator
   */
  async initialize() {
    try {
      if (!this.templateSystem) {
        throw new Error('Template system not provided');
      }

      // Ensure template system is initialized
      if (typeof this.templateSystem.initialize === 'function') {
        await this.templateSystem.initialize();
      }

      console.log(chalk.green('✅ Test generator initialized'));
      return true;

    } catch (_error) {
      console.error(chalk.red(`Failed to initialize test generator: ${error.message}`));
      throw error;
    }
  }

  /**
   * Generate test file for a component
   */
  async generateTestFile(component, testFile, config) {
    const startTime = Date.now();
    
    try {
      console.log(chalk.blue(`🧪 Generating ${testFile.test_type} test for ${component.name}`));

      // Validate inputs
      this.validateGenerationInputs(component, testFile, config);

      // Generate test content using template system
      const testContent = await this.generateTestContent(component, testFile, config);

      // Apply post-processing
      const processedContent = await this.postProcessTestContent(testContent, component, config);

      // Update generation stats
      this.updateGenerationStats(true, Date.now() - startTime);

      console.log(chalk.green(`✅ Generated ${testFile.test_type} test for ${component.name}`));
      
      return processedContent;

    } catch (_error) {
      this.updateGenerationStats(false, Date.now() - startTime);
      console.error(chalk.red(`Failed to generate test for ${component.name}: ${error.message}`));
      throw error;
    }
  }

  /**
   * Generate multiple test files for a component
   */
  async generateTestSuite(component, testSuite, config) {
    const generatedFiles = [];
    const errors = [];

    console.log(chalk.blue(`📋 Generating test suite for ${component.name}`));
    console.log(chalk.gray(`   Test files: ${testSuite.test_files.length}`));

    for (const testFile of testSuite.test_files) {
      try {
        const testContent = await this.generateTestFile(component, testFile, config);
        
        generatedFiles.push({
          file_path: testFile.file_path,
          test_type: testFile.test_type,
          content: testContent,
          test_count: testFile.test_count
        });

      } catch (_error) {
        errors.push({
          file_path: testFile.file_path,
          test_type: testFile.test_type,
          error: error.message
        });
      }
    }

    const result = {
      component_id: component.id,
      generated_files: generatedFiles,
      errors: errors,
      success_rate: generatedFiles.length / testSuite.test_files.length
    };

    console.log(chalk.green(`✅ Test suite generated for ${component.name}`));
    console.log(chalk.gray(`   Generated: ${generatedFiles.length}/${testSuite.test_files.length} files`));
    console.log(chalk.gray(`   Success rate: ${Math.round(result.success_rate * 100)}%`));

    return result;
  }

  /**
   * Generate test content using template system
   */
  async generateTestContent(component, testFile, config) {
    // Use template system to generate base content
    const baseContent = await this.templateSystem.generateTestContent(component, testFile, config);

    // Enhance with component-specific analysis
    const enhancedContent = await this.enhanceTestContent(baseContent, component, testFile, config);

    // Apply framework-specific optimizations
    const optimizedContent = await this.optimizeForFramework(enhancedContent, config.framework);

    return optimizedContent;
  }

  /**
   * Enhance test content with component-specific logic
   */
  async enhanceTestContent(baseContent, component, testFile, config) {
    let enhancedContent = baseContent;

    try {
      // Analyze component to identify testable elements
      const componentAnalysis = await this.analyzeComponent(component);

      // Add component-specific test cases
      const additionalTestCases = await this.generateAdditionalTestCases(
        componentAnalysis, 
        testFile.test_type, 
        config
      );

      if (additionalTestCases.length > 0) {
        enhancedContent = this.injectAdditionalTestCases(enhancedContent, additionalTestCases);
      }

      // Add dynamic imports if needed
      const dynamicImports = await this.generateDynamicImports(componentAnalysis, config);
      if (dynamicImports) {
        enhancedContent = this.injectDynamicImports(enhancedContent, dynamicImports);
      }

      // Add component-specific setup/teardown
      const setupTeardown = await this.generateSetupTeardown(componentAnalysis, testFile.test_type);
      if (setupTeardown) {
        enhancedContent = this.injectSetupTeardown(enhancedContent, setupTeardown);
      }

    } catch (_error) {
      console.warn(chalk.yellow(`Failed to enhance test content: ${error.message}`));
      // Return base content if enhancement fails
    }

    return enhancedContent;
  }

  /**
   * Analyze component to identify testable elements
   */
  async analyzeComponent(component) {
    const analysis = {
      component_id: component.id,
      type: component.type,
      name: component.name,
      file_path: component.filePath,
      exports: [],
      functions: [],
      classes: [],
      dependencies: [],
      async_operations: false,
      error_handling: false,
      configuration: null
    };

    try {
      if (!component.filePath) {
        return analysis;
      }

      // Read component file
      const content = await fs.readFile(component.filePath, 'utf-8');
      
      if (component.type === 'util') {
        // Analyze JavaScript utility
        analysis.exports = this.extractExports(content);
        analysis.functions = this.extractFunctions(content);
        analysis.classes = this.extractClasses(content);
        analysis.dependencies = this.extractDependencies(content);
        analysis.async_operations = content.includes('async') || content.includes('await');
        analysis.error_handling = content.includes('try') || content.includes('catch');
      } else if (component.type === 'agent') {
        // Analyze agent markdown
        analysis.configuration = this.extractAgentConfig(content);
      } else if (component.type === 'workflow') {
        // Analyze workflow YAML
        analysis.configuration = this.extractWorkflowConfig(content);
      } else if (component.type === 'task') {
        // Analyze task markdown with embedded JavaScript
        analysis.functions = this.extractFunctions(content);
        analysis.configuration = this.extractTaskConfig(content);
      }

    } catch (_error) {
      console.warn(chalk.yellow(`Failed to analyze component ${component.id}: ${error.message}`));
    }

    return analysis;
  }

  /**
   * Generate additional test cases based on component analysis
   */
  async generateAdditionalTestCases(componentAnalysis, _testType, config) {
    const additionalCases = [];

    // Generate test cases for exported functions
    for (const func of componentAnalysis.functions) {
      if (func.visibility === 'public') {
        additionalCases.push(...this.generateFunctionTestCases(func, _testType, config));
      }
    }

    // Generate test cases for classes
    for (const cls of componentAnalysis.classes) {
      additionalCases.push(...this.generateClassTestCases(cls, _testType, config));
    }

    // Generate async/error handling test cases
    if (componentAnalysis.async_operations) {
      additionalCases.push(...this.generateAsyncTestCases(_testType, config));
    }

    if (componentAnalysis.error_handling) {
      additionalCases.push(...this.generateErrorHandlingTestCases(_testType, config));
    }

    return additionalCases;
  }

  /**
   * Generate test cases for a function
   */
  generateFunctionTestCases(func, _testType, config) {
    const testCases = [];

    // Basic functionality test
    testCases.push({
      name: `should execute ${func.name} successfully`,
      type: 'functionality',
      setup: func.async ? 'const result = await ' : 'const result = ',
      assertions: [
        `expect(result).toBeDefined();`,
        func.async ? `expect(typeof result).toBe('object');` : `expect(result).toBeTruthy();`
      ]
    });

    // Parameter validation test
    if (func.parameters && func.parameters.length > 0) {
      testCases.push({
        name: `should handle invalid parameters for ${func.name}`,
        type: 'validation',
        setup: `const invalidCall = () => ${func.name}();`,
        assertions: [
          `expect(invalidCall).toThrow();`
        ]
      });
    }

    // Edge case tests for complex functions
    if (config.qualityLevel === 'comprehensive') {
      testCases.push({
        name: `should handle edge cases for ${func.name}`,
        type: 'edge_case',
        setup: `// Edge case testing for ${func.name}`,
        assertions: [
          `// Add edge case assertions here`
        ]
      });
    }

    return testCases;
  }

  /**
   * Generate test cases for a class
   */
  generateClassTestCases(cls, _testType, config) {
    const testCases = [];

    // Constructor test
    testCases.push({
      name: `should instantiate ${cls.name} correctly`,
      type: 'instantiation',
      setup: `const instance = new ${cls.name}();`,
      assertions: [
        `expect(instance).toBeInstanceOf(${cls.name});`,
        `expect(instance).toBeDefined();`
      ]
    });

    // Method tests
    for (const method of cls.methods || []) {
      testCases.push({
        name: `should execute ${cls.name}.${method.name} correctly`,
        type: 'method',
        setup: `const instance = new ${cls.name}();\nconst result = ${method.async ? 'await ' : ''}instance.${method.name}();`,
        assertions: [
          `expect(result).toBeDefined();`
        ]
      });
    }

    return testCases;
  }

  /**
   * Generate async operation test cases
   */
  generateAsyncTestCases(_testType, config) {
    return [
      {
        name: 'should handle async operations correctly',
        type: 'async',
        setup: '// Async operation test setup',
        assertions: [
          '// Add async-specific assertions',
          'expect(result).resolves.toBeDefined();'
        ]
      },
      {
        name: 'should handle async operation timeouts',
        type: 'timeout',
        setup: '// Timeout test setup',
        assertions: [
          'expect(longRunningOperation).rejects.toThrow("timeout");'
        ]
      }
    ];
  }

  /**
   * Generate error handling test cases
   */
  generateErrorHandlingTestCases(_testType, config) {
    return [
      {
        name: 'should handle errors gracefully',
        type: 'error_handling',
        setup: '// Error simulation setup',
        assertions: [
          'expect(errorHandlerFunction).not.toThrow();',
          'expect(result.error).toBeDefined();'
        ]
      }
    ];
  }

  /**
   * Optimize content for specific test framework
   */
  async optimizeForFramework(content, framework) {
    switch (framework) {
      case 'jest':
        return this.optimizeForJest(content);
      case 'mocha':
        return this.optimizeForMocha(content);
      case 'vitest':
        return this.optimizeForVitest(content);
      default:
        return content;
    }
  }

  /**
   * Optimize for Jest framework
   */
  optimizeForJest(content) {
    // Add Jest-specific optimizations
    let optimized = content;

    // Add jest-specific expect extensions if needed
    if (content.includes('toBeInstanceOf') && !content.includes('expect.extend')) {
      optimized = `const { expect } = require('@jest/globals');\n\n${optimized}`;
    }

    // Add performance timing for slow tests
    if (content.includes('async') && content.length > 5000) {
      optimized = optimized.replace(
        /describe\('([^']+)', \(\) => \{/,
        "describe('$1', () => {\n  jest.setTimeout(10000);\n"
      );
    }

    return optimized;
  }

  /**
   * Optimize for Mocha framework
   */
  optimizeForMocha(content) {
    // Add Mocha-specific optimizations
    let optimized = content;

    // Set timeout for async tests
    if (content.includes('async')) {
      optimized = optimized.replace(
        /describe\('([^']+)', function\(\) \{/,
        "describe('$1', function() {\n  this.timeout(5000);\n"
      );
    }

    return optimized;
  }

  /**
   * Optimize for Vitest framework
   */
  optimizeForVitest(content) {
    // Add Vitest-specific optimizations
    let optimized = content;

    // Use vi mock utilities
    optimized = optimized.replace(/jest\.mock/g, 'vi.mock');
    optimized = optimized.replace(/jest\.spyOn/g, 'vi.spyOn');

    return optimized;
  }

  /**
   * Post-process test content
   */
  async postProcessTestContent(content, component, config) {
    let processed = content;

    // Replace template variables
    processed = this.replaceTemplateVariables(processed, component, config);

    // Format code
    processed = this.formatTestCode(processed);

    // Add generation metadata
    processed = this.addGenerationMetadata(processed, component, config);

    // Validate syntax
    await this.validateTestSyntax(processed, config.framework);

    return processed;
  }

  /**
   * Replace template variables with actual values
   */
  replaceTemplateVariables(content, component, config) {
    let result = content;

    // Replace component variables
    result = result.replace(/\${data\.component\.name}/g, component.name);
    result = result.replace(/\${data\.component\.type}/g, component.type);
    result = result.replace(/\${this\.toClassName\(data\.component\.name\)}/g, this.toClassName(component.name));

    // Replace config variables
    result = result.replace(/\${data\.config\.framework}/g, config.framework);
    result = result.replace(/\${data\.metadata\.generatedAt}/g, new Date().toISOString());

    return result;
  }

  /**
   * Format test code
   */
  formatTestCode(content) {
    // Basic code formatting
    let formatted = content;

    // Fix indentation
    formatted = formatted.replace(/\n {2,}/g, match => '\n' + '  '.repeat(Math.floor(match.length / 2)));

    // Remove excessive blank lines
    formatted = formatted.replace(/\n{3,}/g, '\n\n');

    // Ensure proper spacing around blocks
    formatted = formatted.replace(/}\n{/g, '}\n\n{');

    return formatted.trim();
  }

  /**
   * Add generation metadata as comments
   */
  addGenerationMetadata(content, component, config) {
    const metadata = `
// Generated by AIOS Test Generator
// Generated at: ${new Date().toISOString()}
// Component: ${component.type}/${component.name}
// Framework: ${config.framework}
// Quality Level: ${config.qualityLevel}

${content}`;

    return metadata;
  }

  /**
   * Validate test syntax
   */
  async validateTestSyntax(content, framework) {
    try {
      // Basic syntax validation
      if (framework === 'jest' || framework === 'vitest') {
        // Check for required Jest/Vitest patterns
        if (!content.includes('describe(') && !content.includes('test(') && !content.includes('it(')) {
          throw new Error('No test cases found');
        }
      } else if (framework === 'mocha') {
        // Check for required Mocha patterns
        if (!content.includes('describe(') && !content.includes('it(')) {
          throw new Error('No test cases found');
        }
      }

      // Check for balanced brackets
      const openBrackets = (content.match(/\{/g) || []).length;
      const closeBrackets = (content.match(/\}/g) || []).length;
      
      if (openBrackets !== closeBrackets) {
        throw new Error('Unbalanced brackets in generated test');
      }

    } catch (_error) {
      console.warn(chalk.yellow(`Test syntax validation warning: ${error.message}`));
    }
  }

  // Helper methods for content injection and analysis

  injectAdditionalTestCases(content, testCases) {
    if (testCases.length === 0) return content;

    const additionalTests = testCases.map(testCase => {
      let caseContent = `  it('${testCase.name}', async () => {\n`;
      
      if (testCase.setup) {
        caseContent += `    ${testCase.setup}\n\n`;
      }
      
      caseContent += testCase.assertions.map(assertion => `    ${assertion}`).join('\n');
      caseContent += '\n  });';
      
      return caseContent;
    }).join('\n\n');

    // Find insertion point (before closing of describe block)
    const insertionPoint = content.lastIndexOf('});');
    if (insertionPoint !== -1) {
      return content.slice(0, insertionPoint) + '\n\n' + additionalTests + '\n\n' + content.slice(insertionPoint);
    }

    return content + '\n\n' + additionalTests;
  }

  injectDynamicImports(content, imports) {
    if (!imports) return content;

    const importSection = imports.join('\n');
    const existingImports = content.match(/^(const|import|require).*$/gm);
    
    if (existingImports && existingImports.length > 0) {
      // Add after existing imports
      const lastImportIndex = content.lastIndexOf(existingImports[existingImports.length - 1]);
      const insertionPoint = lastImportIndex + existingImports[existingImports.length - 1].length;
      return content.slice(0, insertionPoint) + '\n' + importSection + content.slice(insertionPoint);
    } else {
      // Add at the beginning
      return importSection + '\n\n' + content;
    }
  }

  injectSetupTeardown(content, setupTeardown) {
    if (!setupTeardown) return content;

    let injected = content;

    // Find describe block and inject setup/teardown
    const describeMatch = content.match(/describe\([^{]+\{/);
    if (describeMatch) {
      const insertionPoint = describeMatch.index + describeMatch[0].length;
      injected = content.slice(0, insertionPoint) + '\n' + setupTeardown + content.slice(insertionPoint);
    }

    return injected;
  }

  // Component analysis helper methods

  extractExports(content) {
    const exports = [];
    
    // Extract module.exports
    const moduleExports = content.match(/module\.exports\s*=\s*([^;]+)/);
    if (moduleExports) {
      exports.push({ type: 'module.exports', value: moduleExports[1] });
    }

    // Extract named exports
    const namedExports = content.match(/exports\.(\w+)/g);
    if (namedExports) {
      namedExports.forEach(exp => {
        const name = exp.replace('exports.', '');
        exports.push({ type: 'named', name: name });
      });
    }

    return exports;
  }

  extractFunctions(content) {
    const functions = [];
    
    // Extract function declarations
    const functionDeclarations = content.match(/(?:async\s+)?function\s+(\w+)\s*\([^)]*\)/g);
    if (functionDeclarations) {
      functionDeclarations.forEach(func => {
        const match = func.match(/(?:async\s+)?function\s+(\w+)\s*\(([^)]*)\)/);
        if (match) {
          functions.push({
            name: match[1],
            parameters: match[2] ? match[2].split(',').map(p => p.trim()) : [],
            async: func.includes('async'),
            visibility: 'public'
          });
        }
      });
    }

    // Extract arrow functions
    const arrowFunctions = content.match(/(\w+)\s*=\s*(?:async\s+)?\([^)]*\)\s*=>/g);
    if (arrowFunctions) {
      arrowFunctions.forEach(func => {
        const match = func.match(/(\w+)\s*=\s*(async\s+)?\(([^)]*)\)\s*=>/);
        if (match) {
          functions.push({
            name: match[1],
            parameters: match[3] ? match[3].split(',').map(p => p.trim()) : [],
            async: !!match[2],
            visibility: 'public'
          });
        }
      });
    }

    return functions;
  }

  extractClasses(content) {
    const classes = [];
    
    const classDeclarations = content.match(/class\s+(\w+)(?:\s+extends\s+\w+)?\s*\{[^}]*\}/g);
    if (classDeclarations) {
      classDeclarations.forEach(cls => {
        const nameMatch = cls.match(/class\s+(\w+)/);
        if (nameMatch) {
          const methods = cls.match(/(\w+)\s*\([^)]*\)\s*\{/g) || [];
          classes.push({
            name: nameMatch[1],
            methods: methods.map(method => {
              const methodMatch = method.match(/(\w+)\s*\(/);
              return {
                name: methodMatch ? methodMatch[1] : 'unknown',
                async: method.includes('async')
              };
            }).filter(m => m.name !== 'constructor')
          });
        }
      });
    }

    return classes;
  }

  extractDependencies(content) {
    const dependencies = [];
    
    const requires = content.match(/require\(['"]([^'"]+)['"]\)/g);
    if (requires) {
      requires.forEach(req => {
        const match = req.match(/require\(['"]([^'"]+)['"]\)/);
        if (match) {
          dependencies.push({
            name: match[1],
            type: match[1].startsWith('./') || match[1].startsWith('../') ? 'local' : 'external'
          });
        }
      });
    }

    return dependencies;
  }

  extractAgentConfig(content) {
    const yamlMatch = content.match(/^---\s*\n([\s\S]*?)\n---/);
    if (yamlMatch) {
      try {
        const yaml = require('js-yaml');
        return yaml.load(yamlMatch[1]);
      } catch (_error) {
        return null;
      }
    }
    return null;
  }

  extractWorkflowConfig(content) {
    try {
      const yaml = require('js-yaml');
      return yaml.load(content);
    } catch (_error) {
      return null;
    }
  }

  extractTaskConfig(content) {
    // Extract YAML frontmatter from task markdown
    return this.extractAgentConfig(content);
  }

  generateDynamicImports(componentAnalysis, config) {
    const imports = [];

    // Add imports for dependencies
    for (const dep of componentAnalysis.dependencies) {
      if (dep.type === 'local') {
        imports.push(`const ${this.toVariableName(dep.name)} = require('${dep.name}');`);
      }
    }

    // Add framework-specific test utilities
    if (config.framework === 'jest') {
      if (componentAnalysis.async_operations) {
        imports.push(`const { jest } = require('@jest/globals');`);
      }
    }

    return imports.length > 0 ? imports : null;
  }

  generateSetupTeardown(componentAnalysis, testType) {
    const setup = [];
    
    if (componentAnalysis.type === 'util' && componentAnalysis.classes.length > 0) {
      setup.push(`  let instance;\n`);
      setup.push(`  beforeEach(() => {\n    instance = new ${componentAnalysis.classes[0].name}();\n  });\n`);
      setup.push(`  afterEach(() => {\n    if (instance && instance.cleanup) instance.cleanup();\n  });\n`);
    }

    return setup.length > 0 ? setup.join('\n') : null;
  }

  // Utility methods

  validateGenerationInputs(component, testFile, config) {
    if (!component || !component.name) {
      throw new Error('Invalid component: missing name');
    }

    if (!testFile || !testFile.test_type) {
      throw new Error('Invalid test file: missing test_type');
    }

    if (!config || !config.framework) {
      throw new Error('Invalid config: missing framework');
    }

    const validFrameworks = ['jest', 'mocha', 'vitest'];
    if (!validFrameworks.includes(config.framework)) {
      throw new Error(`Unsupported framework: ${config.framework}`);
    }
  }

  updateGenerationStats(success, duration) {
    this.generationStats.total_generated++;
    if (success) {
      this.generationStats.successful++;
    } else {
      this.generationStats.failed++;
    }
    this.generationStats.generation_time += duration;
  }

  toClassName(name) {
    return name.split('-')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join('');
  }

  toVariableName(_path) {
    return path.split('/').pop().replace(/[-\.]/g, '_');
  }

  /**
   * Get generation statistics
   */
  getGenerationStats() {
    return {
      ...this.generationStats,
      success_rate: this.generationStats.total_generated > 0 
        ? this.generationStats.successful / this.generationStats.total_generated 
        : 0,
      average_generation_time: this.generationStats.total_generated > 0
        ? this.generationStats.generation_time / this.generationStats.total_generated
        : 0
    };
  }

  /**
   * Clear generation cache
   */
  clearCache() {
    this.generationCache.clear();
    console.log(chalk.gray('Test generation cache cleared'));
  }
}

module.exports = TestGenerator;