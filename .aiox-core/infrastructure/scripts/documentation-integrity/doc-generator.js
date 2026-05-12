/**
 * Documentation Generator Module
 *
 * Generates project-specific documentation from templates.
 * Supports Node.js, Python, Go, and Rust projects.
 *
 * @module documentation-integrity/doc-generator
 * @version 1.0.0
 * @story 6.9
 */

const fs = require('fs');
const path = require('path');

// Template directory
const TEMPLATES_DIR = path.join(__dirname, '..', '..', 'templates', 'project-docs');

/**
 * Template file names
 * @enum {string}
 */
const TemplateFiles = {
  SOURCE_TREE: 'source-tree-tmpl.md',
  CODING_STANDARDS: 'coding-standards-tmpl.md',
  TECH_STACK: 'tech-stack-tmpl.md',
};

/**
 * Output file names
 * @enum {string}
 */
const OutputFiles = {
  SOURCE_TREE: 'source-tree.md',
  CODING_STANDARDS: 'coding-standards.md',
  TECH_STACK: 'tech-stack.md',
};

/**
 * Documentation context for template rendering
 * @typedef {Object} DocContext
 * @property {string} PROJECT_NAME - Project name
 * @property {string} GENERATED_DATE - Generation date
 * @property {string} INSTALLATION_MODE - Installation mode
 * @property {string} TECH_STACK - Detected tech stack
 * @property {boolean} IS_NODE - Is Node.js project
 * @property {boolean} IS_PYTHON - Is Python project
 * @property {boolean} IS_GO - Is Go project
 * @property {boolean} IS_RUST - Is Rust project
 * @property {boolean} IS_TYPESCRIPT - Uses TypeScript
 */

/**
 * Builds documentation context from detected markers
 *
 * @param {string} projectName - Project name
 * @param {string} mode - Installation mode
 * @param {Object} markers - Detected project markers
 * @param {Object} [overrides] - Optional context overrides
 * @returns {DocContext} Documentation context
 */
function buildDocContext(projectName, mode, markers, overrides = {}) {
  // Detect tech stack from markers
  const techStacks = [];
  if (markers.hasPackageJson) techStacks.push('Node.js');
  if (markers.hasPythonProject) techStacks.push('Python');
  if (markers.hasGoMod) techStacks.push('Go');
  if (markers.hasCargoToml) techStacks.push('Rust');

  // Determine file extension
  let fileExt = 'js';
  if (markers.hasTsconfig) fileExt = 'ts';

  // Build context
  const context = {
    // Basic info
    PROJECT_NAME: projectName,
    GENERATED_DATE: new Date().toISOString().split('T')[0],
    INSTALLATION_MODE: mode,
    TECH_STACK: techStacks.join(', ') || 'Unknown',

    // Language flags
    IS_NODE: markers.hasPackageJson || false,
    IS_PYTHON: markers.hasPythonProject || false,
    IS_GO: markers.hasGoMod || false,
    IS_RUST: markers.hasCargoToml || false,
    IS_TYPESCRIPT: markers.hasTsconfig || false,

    // Node.js specific
    FILE_EXT: fileExt,
    NODE_VERSION: '18+',
    TYPESCRIPT_VERSION: '5.0+',
    NPM_VERSION: '9+',
    SEMICOLONS: 'Required',
    SEMICOLONS_RULE: 'always',
    PRETTIER_SEMI: true,

    // Python specific
    PYTHON_PACKAGE_NAME: projectName.toLowerCase().replace(/[^a-z0-9]/g, '_'),
    PYTHON_VERSION: '3.11+',
    PYTHON_SHORT_VERSION: '311',
    POETRY_VERSION: '1.5+',

    // Go specific
    GO_VERSION: '1.21+',
    GO_MODULE: `github.com/user/${projectName}`,

    // Rust specific
    RUST_VERSION: '1.70+',

    // Deployment
    DEPLOYMENT_PLATFORM: null,
    PRODUCTION_BRANCH: 'main',
    STAGING_BRANCH: 'staging',
    HAS_STAGING: false,

    // Database
    DATABASE: null,
    CACHE: null,

    // Quality gates
    QUALITY_GATES: ['Lint', 'Type Check', 'Tests'],

    // Dependencies (to be populated by analyzer)
    DEPENDENCIES: [],
    DEV_DEPENDENCIES: [],
    ENV_VARS: [],

    // Apply overrides
    ...overrides,
  };

  return context;
}

/**
 * Simple template renderer with Handlebars-like syntax
 * Supports: {{variable}}, {{#if condition}}, {{/if}}, {{#each array}}, {{/each}}
 *
 * @param {string} template - Template string
 * @param {Object} context - Context object
 * @returns {string} Rendered template
 */
function renderTemplate(template, context) {
  let result = template;

  // Process {{#if}} blocks
  result = processIfBlocks(result, context);

  // Process {{#each}} blocks
  result = processEachBlocks(result, context);

  // Replace simple variables {{variable}}
  result = result.replace(/\{\{([^#/}][^}]*)\}\}/g, (match, key) => {
    const value = getNestedValue(context, key.trim());
    return value !== undefined ? String(value) : match;
  });

  // Clean up empty lines from removed blocks
  result = result.replace(/\n{3,}/g, '\n\n');

  return result;
}

/**
 * Process {{#if condition}}...{{/if}} blocks
 *
 * @param {string} template - Template string
 * @param {Object} context - Context object
 * @returns {string} Processed template
 */
function processIfBlocks(template, context) {
  // Match if blocks (non-greedy, innermost first)
  const ifRegex = /\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g;

  let result = template;
  let iterations = 0;
  const maxIterations = 100; // Prevent infinite loops

  while (ifRegex.test(result) && iterations < maxIterations) {
    result = result.replace(ifRegex, (match, condition, content) => {
      const value = context[condition];
      if (value) {
        return content;
      }
      return '';
    });
    iterations++;
  }

  return result;
}

/**
 * Process {{#each array}}...{{/each}} blocks
 *
 * @param {string} template - Template string
 * @param {Object} context - Context object
 * @returns {string} Processed template
 */
function processEachBlocks(template, context) {
  const eachRegex = /\{\{#each\s+(\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g;

  return template.replace(eachRegex, (match, arrayName, content) => {
    const array = context[arrayName];
    if (!Array.isArray(array) || array.length === 0) {
      return '';
    }

    return array
      .map((item) => {
        let itemContent = content;
        if (typeof item === 'object') {
          // Replace {{this.property}} with item properties
          itemContent = itemContent.replace(/\{\{this\.(\w+)\}\}/g, (m, prop) => {
            return item[prop] !== undefined ? String(item[prop]) : m;
          });
        } else {
          // Replace {{this}} with item value
          itemContent = itemContent.replace(/\{\{this\}\}/g, String(item));
        }
        return itemContent;
      })
      .join('');
  });
}

/**
 * Get nested value from object using dot notation
 *
 * @param {Object} obj - Object to search
 * @param {string} path - Dot-notation path
 * @returns {*} Value at path or undefined
 */
function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
}

/**
 * Loads a template file
 *
 * @param {string} templateName - Template file name
 * @returns {string} Template content
 * @throws {Error} If template not found
 */
function loadTemplate(templateName) {
  const templatePath = path.join(TEMPLATES_DIR, templateName);

  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template not found: ${templatePath}`);
  }

  return fs.readFileSync(templatePath, 'utf8');
}

/**
 * Generates all documentation files for a project
 *
 * @param {string} targetDir - Target directory
 * @param {DocContext} context - Documentation context
 * @param {Object} [options] - Generation options
 * @param {boolean} [options.dryRun] - Don't write files, just return content
 * @returns {Object} Generated files with content
 */
function generateDocs(targetDir, context, options = {}) {
  const docsDir = path.join(targetDir, 'docs', 'architecture');
  const results = {};

  // Ensure docs directory exists
  if (!options.dryRun) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  // Generate each doc
  const templates = [
    { template: TemplateFiles.SOURCE_TREE, output: OutputFiles.SOURCE_TREE },
    { template: TemplateFiles.CODING_STANDARDS, output: OutputFiles.CODING_STANDARDS },
    { template: TemplateFiles.TECH_STACK, output: OutputFiles.TECH_STACK },
  ];

  for (const { template, output } of templates) {
    try {
      const templateContent = loadTemplate(template);
      const rendered = renderTemplate(templateContent, context);
      const outputPath = path.join(docsDir, output);

      results[output] = {
        path: outputPath,
        content: rendered,
        success: true,
      };

      if (!options.dryRun) {
        fs.writeFileSync(outputPath, rendered, 'utf8');
      }
    } catch (error) {
      results[output] = {
        path: path.join(docsDir, output),
        content: null,
        success: false,
        error: error.message,
      };
    }
  }

  return results;
}

/**
 * Generates a single documentation file
 *
 * @param {string} templateName - Template file name
 * @param {DocContext} context - Documentation context
 * @returns {string} Rendered content
 */
function generateDoc(templateName, context) {
  const template = loadTemplate(templateName);
  return renderTemplate(template, context);
}

module.exports = {
  buildDocContext,
  renderTemplate,
  loadTemplate,
  generateDocs,
  generateDoc,
  TemplateFiles,
  OutputFiles,
  TEMPLATES_DIR,
};
