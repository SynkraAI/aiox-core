const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');
const chalk = require('chalk');

/**
 * Framework structure analyzer for Synkra AIOX
 * Discovers and catalogs all framework components
 */
class FrameworkAnalyzer {
  constructor(options = {}) {
    this.rootPath = options.rootPath || process.cwd();
    this.aioxCoreDir = path.join(this.rootPath, 'aiox-core');
    this.excludes = options.excludes || [
      'node_modules',
      '.git',
      '.aiox',
      'dist',
      'build',
      'coverage',
      '.next',
      '.nuxt',
      'tmp',
      'temp',
    ];
  }

  /**
   * Analyze complete framework structure
   */
  async analyzeFrameworkStructure(scope = 'full') {
    const components = {
      agents: [],
      tasks: [],
      workflows: [],
      utils: [],
      templates: [],
      docs: [],
      tests: [],
    };

    try {
      // Analyze each component type based on scope
      if (scope === 'full' || scope === 'agents') {
        components.agents = await this.discoverAgents();
      }

      if (scope === 'full' || scope === 'tasks') {
        components.tasks = await this.discoverTasks();
      }

      if (scope === 'full' || scope === 'workflows') {
        components.workflows = await this.discoverWorkflows();
      }

      if (scope === 'full' || scope === 'utils') {
        components.utils = await this.discoverUtils();
      }

      if (scope === 'full') {
        components.templates = await this.discoverTemplates();
        components.docs = await this.discoverDocs();
        components.tests = await this.discoverTests();
      }

      // Calculate summary
      const totalComponents = Object.values(components).reduce((sum, arr) => sum + arr.length, 0);

      return {
        scope,
        timestamp: new Date().toISOString(),
        total_components: totalComponents,
        components: this.flattenComponents(components),
        breakdown: components,
        agents: components.agents,
        tasks: components.tasks,
        workflows: components.workflows,
        utils: components.utils,
        templates: components.templates,
        docs: components.docs,
        tests: components.tests,
        directory_structure: await this.analyzeDirectoryStructure(),
        dependencies: await this.analyzeDependencies(components),
        metrics: await this.calculateFrameworkMetrics(components),
      };
    } catch (error) {
      console.error(chalk.red(`Framework analysis failed: ${error.message}`));
      throw error;
    }
  }

  /**
   * Discover all agents in the framework
   */
  async discoverAgents() {
    const agents = [];
    const agentsDir = path.join(this.aioxCoreDir, 'agents');

    try {
      await fs.access(agentsDir);
      const files = await this.getMarkdownFiles(agentsDir);

      for (const file of files) {
        try {
          const content = await fs.readFile(file, 'utf-8');
          const agent = await this.parseAgentFile(file, content);
          if (agent) agents.push(agent);
        } catch (error) {
          console.warn(chalk.yellow(`Warning: Failed to parse agent ${file}: ${error.message}`));
        }
      }
    } catch (error) {
      // Agents directory doesn't exist or not accessible
    }

    return agents;
  }

  /**
   * Discover all tasks in the framework
   */
  async discoverTasks() {
    const tasks = [];
    const tasksDir = path.join(this.aioxCoreDir, 'tasks');

    try {
      await fs.access(tasksDir);
      const files = await this.getMarkdownFiles(tasksDir);

      for (const file of files) {
        try {
          const content = await fs.readFile(file, 'utf-8');
          const task = await this.parseTaskFile(file, content);
          if (task) tasks.push(task);
        } catch (error) {
          console.warn(chalk.yellow(`Warning: Failed to parse task ${file}: ${error.message}`));
        }
      }
    } catch (error) {
      // Tasks directory doesn't exist or not accessible
    }

    return tasks;
  }

  /**
   * Discover all workflows in the framework
   */
  async discoverWorkflows() {
    const workflows = [];
    const workflowsDir = path.join(this.aioxCoreDir, 'workflows');

    try {
      await fs.access(workflowsDir);
      const files = await this.getYamlFiles(workflowsDir);

      for (const file of files) {
        try {
          const content = await fs.readFile(file, 'utf-8');
          const workflow = await this.parseWorkflowFile(file, content);
          if (workflow) workflows.push(workflow);
        } catch (error) {
          console.warn(chalk.yellow(`Warning: Failed to parse workflow ${file}: ${error.message}`));
        }
      }
    } catch (error) {
      // Workflows directory doesn't exist or not accessible
    }

    return workflows;
  }

  /**
   * Discover all utilities in the framework
   */
  async discoverUtils() {
    const utils = [];
    const utilsDir = path.join(this.aioxCoreDir, 'utils');

    try {
      await fs.access(utilsDir);
      const files = await this.getJavaScriptFiles(utilsDir);

      for (const file of files) {
        try {
          const content = await fs.readFile(file, 'utf-8');
          const util = await this.parseUtilFile(file, content);
          if (util) utils.push(util);
        } catch (error) {
          console.warn(chalk.yellow(`Warning: Failed to parse util ${file}: ${error.message}`));
        }
      }
    } catch (error) {
      // Utils directory doesn't exist or not accessible
    }

    return utils;
  }

  /**
   * Discover all templates in the framework
   */
  async discoverTemplates() {
    const templates = [];
    const templatesDir = path.join(this.aioxCoreDir, 'templates');

    try {
      await fs.access(templatesDir);
      const files = await this.getAllFiles(templatesDir);

      for (const file of files) {
        try {
          const template = await this.parseTemplateFile(file);
          if (template) templates.push(template);
        } catch (error) {
          console.warn(chalk.yellow(`Warning: Failed to parse template ${file}: ${error.message}`));
        }
      }
    } catch (error) {
      // Templates directory doesn't exist or not accessible
    }

    return templates;
  }

  /**
   * Discover documentation files
   */
  async discoverDocs() {
    const docs = [];
    const docsDir = path.join(this.rootPath, 'docs');

    try {
      await fs.access(docsDir);
      const files = await this.getMarkdownFiles(docsDir);

      for (const file of files) {
        try {
          const doc = await this.parseDocFile(file);
          if (doc) docs.push(doc);
        } catch (error) {
          console.warn(chalk.yellow(`Warning: Failed to parse doc ${file}: ${error.message}`));
        }
      }
    } catch (error) {
      // Docs directory doesn't exist or not accessible
    }

    return docs;
  }

  /**
   * Discover test files
   */
  async discoverTests() {
    const tests = [];
    const testsDir = path.join(this.rootPath, 'tests');

    try {
      await fs.access(testsDir);
      const files = await this.getJavaScriptFiles(testsDir);

      for (const file of files) {
        try {
          const test = await this.parseTestFile(file);
          if (test) tests.push(test);
        } catch (error) {
          console.warn(chalk.yellow(`Warning: Failed to parse test ${file}: ${error.message}`));
        }
      }
    } catch (error) {
      // Tests directory doesn't exist or not accessible
    }

    return tests;
  }

  /**
   * Parse agent file content
   */
  async parseAgentFile(filePath, content) {
    try {
      // Extract YAML frontmatter
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
      let metadata = {};
      
      if (frontmatterMatch) {
        metadata = yaml.load(frontmatterMatch[1]) || {};
      }

      // Extract markdown content
      const markdownContent = content.replace(/^---\n[\s\S]*?\n---\n/, '');
      
      return {
        type: 'agent',
        id: metadata.id || path.basename(filePath, '.md'),
        name: metadata.name || path.basename(filePath, '.md'),
        description: metadata.description || this.extractDescription(markdownContent),
        version: metadata.version || '1.0.0',
        file_path: path.relative(this.rootPath, filePath),
        size: content.length,
        last_modified: (await fs.stat(filePath)).mtime,
        metadata,
        dependencies: this.extractDependencies(content),
        capabilities: metadata.capabilities || [],
        complexity: this.calculateComplexity(content),
        maintainability: this.calculateMaintainability(content),
      };
    } catch (error) {
      console.warn(`Failed to parse agent ${filePath}: ${error.message}`);
      return null;
    }
  }

  /**
   * Parse task file content
   */
  async parseTaskFile(filePath, content) {
    try {
      // Tasks use different structure than agents
      const nameMatch = content.match(/^# Task: (.+)$/m);
      const descMatch = content.match(/## Description\n([\s\S]*?)(?=\n## |$)/);
      const typeMatch = content.match(/## Type\n(.+)$/m);
      const complexityMatch = content.match(/## Complexity\n(.+)$/m);

      return {
        type: 'task',
        id: path.basename(filePath, '.md'),
        name: nameMatch ? nameMatch[1].trim() : path.basename(filePath, '.md'),
        description: descMatch ? descMatch[1].trim() : '',
        task_type: typeMatch ? typeMatch[1].trim() : 'unknown',
        complexity: complexityMatch ? complexityMatch[1].trim().toLowerCase() : 'medium',
        file_path: path.relative(this.rootPath, filePath),
        size: content.length,
        last_modified: (await fs.stat(filePath)).mtime,
        dependencies: this.extractDependencies(content),
        parameters: this.extractTaskParameters(content),
        implementation_status: this.analyzeImplementationStatus(content),
      };
    } catch (error) {
      console.warn(`Failed to parse task ${filePath}: ${error.message}`);
      return null;
    }
  }

  /**
   * Parse workflow file content
   */
  async parseWorkflowFile(filePath, content) {
    try {
      const workflow = yaml.load(content);
      
      return {
        type: 'workflow',
        id: workflow.id || path.basename(filePath, '.yaml'),
        name: workflow.name || path.basename(filePath, '.yaml'),
        description: workflow.description || '',
        version: workflow.version || '1.0.0',
        file_path: path.relative(this.rootPath, filePath),
        size: content.length,
        last_modified: (await fs.stat(filePath)).mtime,
        steps: workflow.steps || [],
        dependencies: workflow.dependencies || [],
        triggers: workflow.triggers || [],
        complexity: this.calculateWorkflowComplexity(workflow),
        validation_status: await this.validateWorkflow(workflow),
      };
    } catch (error) {
      console.warn(`Failed to parse workflow ${filePath}: ${error.message}`);
      return null;
    }
  }

  /**
   * Parse utility file content
   */
  async parseUtilFile(filePath, content) {
    try {
      const stats = await fs.stat(filePath);
      
      return {
        type: 'utility',
        id: path.basename(filePath, '.js'),
        name: path.basename(filePath),
        description: this.extractUtilDescription(content),
        file_path: path.relative(this.rootPath, filePath),
        size: content.length,
        last_modified: stats.mtime,
        exports: this.extractExports(content),
        functions: this.extractFunctions(content),
        dependencies: this.extractImports(content),
        complexity: this.calculateCodeComplexity(content),
        test_coverage: await this.calculateTestCoverage(filePath),
      };
    } catch (error) {
      console.warn(`Failed to parse util ${filePath}: ${error.message}`);
      return null;
    }
  }

  /**
   * Parse template file
   */
  async parseTemplateFile(filePath) {
    try {
      const stats = await fs.stat(filePath);
      const content = await fs.readFile(filePath, 'utf-8');
      
      return {
        type: 'template',
        id: path.basename(filePath),
        name: path.basename(filePath),
        description: this.extractTemplateDescription(content),
        file_path: path.relative(this.rootPath, filePath),
        size: content.length,
        last_modified: stats.mtime,
        template_type: this.detectTemplateType(filePath, content),
        variables: this.extractTemplateVariables(content),
      };
    } catch (error) {
      console.warn(`Failed to parse template ${filePath}: ${error.message}`);
      return null;
    }
  }

  /**
   * Parse documentation file
   */
  async parseDocFile(filePath) {
    try {
      const stats = await fs.stat(filePath);
      const content = await fs.readFile(filePath, 'utf-8');
      
      return {
        type: 'documentation',
        id: path.basename(filePath, '.md'),
        name: path.basename(filePath),
        description: this.extractDescription(content),
        file_path: path.relative(this.rootPath, filePath),
        size: content.length,
        last_modified: stats.mtime,
        doc_type: this.detectDocType(filePath),
        sections: this.extractSections(content),
        word_count: this.countWords(content),
      };
    } catch (error) {
      console.warn(`Failed to parse doc ${filePath}: ${error.message}`);
      return null;
    }
  }

  /**
   * Parse test file
   */
  async parseTestFile(filePath) {
    try {
      const stats = await fs.stat(filePath);
      const content = await fs.readFile(filePath, 'utf-8');
      
      return {
        type: 'test',
        id: path.basename(filePath, '.js'),
        name: path.basename(filePath),
        description: this.extractTestDescription(content),
        file_path: path.relative(this.rootPath, filePath),
        size: content.length,
        last_modified: stats.mtime,
        test_framework: this.detectTestFramework(content),
        test_suites: this.extractTestSuites(content),
        test_count: this.countTests(content),
        coverage_target: this.extractCoverageTarget(filePath),
      };
    } catch (error) {
      console.warn(`Failed to parse test ${filePath}: ${error.message}`);
      return null;
    }
  }

  /**
   * Analyze directory structure
   */
  async analyzeDirectoryStructure() {
    const structure = {
      total_directories: 0,
      total_files: 0,
      depth: 0,
      size_distribution: {},
      file_types: {},
    };

    try {
      await this.walkDirectory(this.rootPath, structure, 0);
    } catch (error) {
      console.warn(`Directory analysis failed: ${error.message}`);
    }

    return structure;
  }

  /**
   * Analyze component dependencies
   */
  async analyzeDependencies(components) {
    const dependencies = {
      internal: new Map(),
      external: new Map(),
      circular: [],
      orphaned: [],
      highly_coupled: [],
    };

    // Analyze dependencies for each component type
    const allComponents = this.flattenComponents(components);
    
    for (const component of allComponents) {
      if (component.dependencies) {
        for (const dep of component.dependencies) {
          if (this.isInternalDependency(dep)) {
            dependencies.internal.set(dep, (dependencies.internal.get(dep) || 0) + 1);
          } else {
            dependencies.external.set(dep, (dependencies.external.get(dep) || 0) + 1);
          }
        }
      }
    }

    // Detect circular dependencies
    dependencies.circular = await this.detectCircularDependencies(allComponents);
    
    // Find orphaned components
    dependencies.orphaned = this.findOrphanedComponents(allComponents);
    
    // Find highly coupled components
    dependencies.highly_coupled = this.findHighlyCoupledComponents(allComponents);

    return {
      internal_count: dependencies.internal.size,
      external_count: dependencies.external.size,
      internal_dependencies: Array.from(dependencies.internal.entries()).map(([name, count]) => ({ name, count })),
      external_dependencies: Array.from(dependencies.external.entries()).map(([name, count]) => ({ name, count })),
      circular_dependencies: dependencies.circular,
      orphaned_components: dependencies.orphaned,
      highly_coupled_components: dependencies.highly_coupled,
    };
  }

  /**
   * Calculate framework-wide metrics
   */
  async calculateFrameworkMetrics(components) {
    const allComponents = this.flattenComponents(components);
    
    return {
      total_size: allComponents.reduce((sum, comp) => sum + (comp.size || 0), 0),
      average_complexity: this.calculateAverageComplexity(allComponents),
      maintainability_index: this.calculateMaintainabilityIndex(allComponents),
      test_coverage: await this.calculateOverallTestCoverage(components),
      documentation_coverage: this.calculateDocumentationCoverage(components),
      code_quality_score: this.calculateCodeQualityScore(allComponents),
      technical_debt: this.calculateTechnicalDebt(allComponents),
    };
  }

  // File discovery helper methods
  async getMarkdownFiles(dir) {
    return this.getFilesByExtension(dir, '.md');
  }

  async getYamlFiles(dir) {
    return this.getFilesByExtension(dir, ['.yaml', '.yml']);
  }

  async getJavaScriptFiles(dir) {
    return this.getFilesByExtension(dir, ['.js', '.mjs']);
  }

  async getAllFiles(dir) {
    const files = [];
    await this.walkDirectory(dir, { files }, 0);
    return files;
  }

  async getFilesByExtension(dir, extensions) {
    const files = [];
    const extArray = Array.isArray(extensions) ? extensions : [extensions];
    
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory() && !this.isExcluded(entry.name)) {
          files.push(...await this.getFilesByExtension(fullPath, extensions));
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name).toLowerCase();
          if (extArray.includes(ext)) {
            files.push(fullPath);
          }
        }
      }
    } catch (error) {
      // Directory not accessible
    }
    
    return files;
  }

  async walkDirectory(dir, result, depth) {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      result.depth = Math.max(result.depth || 0, depth);
      
      for (const entry of entries) {
        if (this.isExcluded(entry.name)) continue;
        
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          result.total_directories = (result.total_directories || 0) + 1;
          await this.walkDirectory(fullPath, result, depth + 1);
        } else if (entry.isFile()) {
          result.total_files = (result.total_files || 0) + 1;
          
          if (result.files) {
            result.files.push(fullPath);
          }
          
          // Track file types
          const ext = path.extname(entry.name).toLowerCase();
          result.file_types = result.file_types || {};
          result.file_types[ext] = (result.file_types[ext] || 0) + 1;
          
          // Track size distribution
          const stats = await fs.stat(fullPath);
          const sizeCategory = this.getSizeCategory(stats.size);
          result.size_distribution = result.size_distribution || {};
          result.size_distribution[sizeCategory] = (result.size_distribution[sizeCategory] || 0) + 1;
        }
      }
    } catch (error) {
      // Directory not accessible
    }
  }

  // Helper methods
  isExcluded(name) {
    return this.excludes.some(exclude => 
      name === exclude || 
      name.startsWith(exclude) || 
      name.startsWith('.'),
    );
  }

  flattenComponents(components) {
    return Object.values(components).flat();
  }

  extractDescription(content) {
    // Extract first paragraph or first meaningful line
    const lines = content.split('\n').filter(line => line.trim());
    return lines.find(line => line.length > 20 && !line.startsWith('#')) || '';
  }

  extractDependencies(content) {
    const deps = [];
    const requireMatches = content.match(/require\(['"`]([^'"`]+)['"`]\)/g) || [];
    const importMatches = content.match(/import .* from ['"`]([^'"`]+)['"`]/g) || [];
    
    requireMatches.forEach(match => {
      const dep = match.match(/['"`]([^'"`]+)['"`]/)[1];
      if (!deps.includes(dep)) deps.push(dep);
    });
    
    importMatches.forEach(match => {
      const dep = match.match(/from ['"`]([^'"`]+)['"`]/)[1];
      if (!deps.includes(dep)) deps.push(dep);
    });
    
    return deps;
  }

  calculateComplexity(content) {
    // Simple complexity calculation based on content patterns
    const lines = content.split('\n').length;
    const functions = (content.match(/function|async|=>/g) || []).length;
    const conditions = (content.match(/if|while|for|switch|catch/g) || []).length;
    const complexity = Math.min(10, (functions + conditions * 2) / lines * 100);
    return Math.max(1, Math.round(complexity));
  }

  calculateMaintainability(content) {
    // Basic maintainability score
    const lines = content.split('\n').length;
    const comments = (content.match(/\/\*[\s\S]*?\*\/|\/\/.*/g) || []).length;
    const commentRatio = comments / lines;
    const maintainability = Math.min(10, 5 + commentRatio * 10);
    return Math.round(maintainability * 10) / 10;
  }

  getSizeCategory(size) {
    if (size < 1024) return 'tiny';
    if (size < 10240) return 'small';
    if (size < 102400) return 'medium';
    if (size < 1048576) return 'large';
    return 'huge';
  }

  isInternalDependency(dep) {
    return dep.startsWith('./') || dep.startsWith('../') || dep.startsWith('/');
  }

  // Stub methods for more complex analysis
  extractTaskParameters(content) { return []; }
  analyzeImplementationStatus(content) { return 'unknown'; }
  calculateWorkflowComplexity(workflow) { return 1; }
  async validateWorkflow(workflow) {
    try {
      const { WorkflowValidator } = require('../../development/scripts/workflow-validator');
      const validator = new WorkflowValidator({ verbose: false });
      // validateRequiredFields works on the parsed object directly
      const result = validator.validateRequiredFields({ workflow }, 'inline');
      if (workflow && workflow.sequence) {
        const seqResult = validator.validatePhaseSequence(workflow.sequence);
        result.errors.push(...(seqResult.errors || []));
        result.warnings.push(...(seqResult.warnings || []));
        if (seqResult.errors && seqResult.errors.length > 0) result.valid = false;
      }
      return result;
    } catch (error) {
      return { valid: false, errors: [{ code: 'VALIDATOR_LOAD_ERROR', message: error.message }], warnings: [] };
    }
  }
  extractUtilDescription(content) { return ''; }
  extractExports(content) { return []; }
  extractFunctions(content) { return []; }
  extractImports(content) { return []; }
  calculateCodeComplexity(content) { return 1; }
  calculateTestCoverage(filePath) { return 0; }
  extractTemplateDescription(content) { return ''; }
  detectTemplateType(filePath, content) { return 'generic'; }
  extractTemplateVariables(content) { return []; }
  detectDocType(filePath) { return 'general'; }
  extractSections(content) { return []; }
  countWords(content) { return content.split(/\s+/).length; }
  extractTestDescription(content) { return ''; }
  detectTestFramework(content) { return 'jest'; }
  extractTestSuites(content) { return []; }
  countTests(content) { return (content.match(/test\(|it\(/g) || []).length; }
  extractCoverageTarget(filePath) { return null; }
  detectCircularDependencies(components) { return []; }
  findOrphanedComponents(components) { return []; }
  findHighlyCoupledComponents(components) { return []; }
  calculateAverageComplexity(components) { return 1; }
  calculateMaintainabilityIndex(components) { return 80; }
  calculateOverallTestCoverage(components) { return 0; }
  calculateDocumentationCoverage(components) { return 0; }
  calculateCodeQualityScore(components) { return 7; }
  calculateTechnicalDebt(components) { return 'low'; }
}

module.exports = FrameworkAnalyzer;