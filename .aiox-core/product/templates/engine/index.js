/**
 * Template Engine v2.0
 * Main entry point for the AIOX Template Engine
 *
 * @module TemplateEngine
 * @version 2.0.0
 */

'use strict';

const path = require('path');
const fs = require('fs').promises;
const { TemplateLoader } = require('./loader');
const { VariableElicitation } = require('./elicitation');
const { TemplateRenderer } = require('./renderer');
const { TemplateValidator } = require('./validator');

/**
 * Supported template types
 * @constant {Array<string>}
 */
const SUPPORTED_TYPES = ['prd', 'prd-v2', 'adr', 'pmdr', 'dbdr', 'story', 'epic', 'task'];

/**
 * TemplateEngine class - Main orchestrator for template generation
 */
class TemplateEngine {
  /**
   * Create a TemplateEngine instance
   * @param {Object} options - Configuration options
   * @param {string} options.templatesDir - Path to templates directory
   * @param {string} options.schemasDir - Path to schemas directory
   * @param {boolean} options.interactive - Enable interactive mode (default: true)
   * @param {Object} options.helpers - Custom Handlebars helpers
   */
  constructor(options = {}) {
    // Store baseDir as instance property for predictable path resolution
    this.baseDir = options.baseDir || process.cwd();

    this.templatesDir = options.templatesDir ||
      path.join(this.baseDir, '.aiox-core', 'product', 'templates');

    this.schemasDir = options.schemasDir ||
      path.join(this.templatesDir, 'engine', 'schemas');

    this.outputDir = options.outputDir ||
      path.join(this.baseDir, 'docs');

    this.interactive = options.interactive !== false;

    // Initialize components
    this.loader = new TemplateLoader({ templatesDir: this.templatesDir });
    this.elicitation = new VariableElicitation({ interactive: this.interactive });
    this.renderer = new TemplateRenderer({ helpers: options.helpers });
    this.validator = new TemplateValidator({ schemasDir: this.schemasDir });
  }

  /**
   * Get list of supported template types
   * @returns {Array<string>} Supported template types
   */
  get supportedTypes() {
    return [...SUPPORTED_TYPES];
  }

  /**
   * Generate a document from a template
   * @param {string} templateType - Template type (prd, adr, etc.)
   * @param {Object} context - Pre-provided context values
   * @param {Object} options - Generation options
   * @param {boolean} options.validate - Validate output (default: true)
   * @param {boolean} options.save - Save to file (default: false)
   * @param {string} options.outputPath - Custom output path
   * @returns {Promise<Object>} Generation result with content and metadata
   */
  async generate(templateType, context = {}, options = {}) {
    const { validate = true, save = false, outputPath } = options;

    // Validate template type
    if (!SUPPORTED_TYPES.includes(templateType)) {
      throw new Error(
        `Unsupported template type: ${templateType}. ` +
        `Supported types: ${SUPPORTED_TYPES.join(', ')}`,
      );
    }

    // Load template
    const template = await this.loader.load(templateType);

    // Elicit variables
    const variables = await this.elicitation.elicit(template.variables, context);

    // Validate required variables
    const elicitValidation = this.elicitation.validate(template.variables, variables);
    if (!elicitValidation.isValid) {
      throw new Error(`Missing required variables: ${elicitValidation.errors.join(', ')}`);
    }

    // Render template
    const content = this.renderer.render(template, variables);

    // Validate output if schema exists
    let validation = { isValid: true, errors: [] };
    if (validate) {
      try {
        validation = await this.validator.validate(variables, templateType);
        if (!validation.isValid) {
          console.warn('Template validation warnings:', validation.errors);
        }
      } catch (error) {
        // Schema may not exist yet for all template types
        if (!error.message.includes('Schema not found')) {
          throw error;
        }
      }

      // Also validate structure
      const structureValidation = this.validator.validateStructure(content, template);
      if (!structureValidation.isValid) {
        validation.errors.push(...structureValidation.errors);
        validation.isValid = validation.isValid && structureValidation.isValid;
      }
    }

    const result = {
      templateType,
      content,
      variables,
      metadata: template.metadata,
      validation,
      generatedAt: new Date().toISOString(),
    };

    // Save to file if requested
    if (save) {
      const filePath = outputPath || this.resolveOutputPath(templateType, variables);
      await this.saveOutput(content, filePath);
      result.savedTo = filePath;
    }

    return result;
  }

  /**
   * Resolve output path for generated document
   * @param {string} templateType - Template type
   * @param {Object} variables - Template variables
   * @returns {string} Output file path
   */
  resolveOutputPath(templateType, variables) {
    const outputDirs = {
      prd: 'docs/prd',
      'prd-v2': 'docs/prd',
      adr: 'docs/architecture/decisions',
      pmdr: 'docs/decisions',
      dbdr: 'docs/decisions',
      story: 'docs/stories',
      epic: 'docs/epics',
      task: 'docs/tasks',
    };

    const dir = outputDirs[templateType] || 'docs';
    const number = variables.number ? `-${String(variables.number).padStart(3, '0')}` : '';
    const slug = variables.title
      ? `-${variables.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 50)}`
      : '';

    // Use baseDir for predictable path resolution instead of fragile '..' navigation
    return path.join(this.baseDir, dir, `${templateType}${number}${slug}.md`);
  }

  /**
   * Save generated content to file
   * @param {string} content - Content to save
   * @param {string} filePath - Output file path
   */
  async saveOutput(content, filePath) {
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(filePath, content, 'utf-8');
  }

  /**
   * Preview template rendering without saving
   * @param {string} templateType - Template type
   * @param {Object} context - Context values
   * @returns {Promise<string>} Rendered content preview
   */
  async preview(templateType, context = {}) {
    const result = await this.generate(templateType, context, {
      validate: false,
      save: false,
    });
    return result.content;
  }

  /**
   * Load and display template information
   * @param {string} templateType - Template type
   * @returns {Promise<Object>} Template information
   */
  async getTemplateInfo(templateType) {
    const template = await this.loader.load(templateType);

    return {
      type: templateType,
      name: template.metadata.template_name,
      version: template.metadata.version,
      variables: template.variables.map(v => ({
        name: v.name,
        type: v.type,
        required: v.required,
        description: v.prompt,
      })),
    };
  }

  /**
   * List all available templates
   * @returns {Promise<Array>} List of template information
   */
  async listTemplates() {
    const templates = [];

    for (const type of SUPPORTED_TYPES) {
      try {
        const info = await this.getTemplateInfo(type);
        templates.push(info);
      } catch {
        // Template may not exist yet
        templates.push({
          type,
          name: type.toUpperCase(),
          version: 'N/A',
          variables: [],
          status: 'missing',
        });
      }
    }

    return templates;
  }

  /**
   * Register a custom Handlebars helper
   * @param {string} name - Helper name
   * @param {Function} fn - Helper function
   */
  registerHelper(name, fn) {
    this.renderer.registerHelper(name, fn);
  }

  /**
   * Register a custom auto-resolver for elicitation
   * @param {string} name - Resolver name
   * @param {Function} resolver - Async resolver function
   */
  registerAutoResolver(name, resolver) {
    this.elicitation.registerAutoResolver(name, resolver);
  }

  /**
   * Validate an existing document against its schema
   * @param {string} content - Document content
   * @param {string} templateType - Template type
   * @returns {Promise<Object>} Validation result
   */
  async validateDocument(content, templateType) {
    const template = await this.loader.load(templateType);
    const structureResult = this.validator.validateStructure(content, template);

    // Extract data for schema validation
    const data = this.validator.extractDataFromMarkdown(content, template);
    let schemaResult = { isValid: true, errors: [] };

    try {
      schemaResult = await this.validator.validate(data, templateType);
    } catch (error) {
      if (!error.message.includes('Schema not found')) {
        throw error;
      }
    }

    return {
      isValid: structureResult.isValid && schemaResult.isValid,
      structureErrors: structureResult.errors,
      schemaErrors: schemaResult.errors,
    };
  }

  /**
   * Clear all caches
   */
  clearCache() {
    this.loader.clearCache();
    this.validator.clearCache();
  }
}

// Export main class and components
module.exports = {
  TemplateEngine,
  TemplateLoader,
  VariableElicitation,
  TemplateRenderer,
  TemplateValidator,
  SUPPORTED_TYPES,
};
