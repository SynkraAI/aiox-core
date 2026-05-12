/**
 * JSON Schema Validator Module
 * Validates rendered template output against JSON schemas using Ajv
 *
 * @module validator
 * @version 2.0.0
 */

'use strict';

const Ajv = require('ajv');
const addFormats = require('ajv-formats');
const fs = require('fs').promises;
const path = require('path');

/**
 * TemplateValidator class for validating template output
 */
class TemplateValidator {
  /**
   * Create a TemplateValidator instance
   * @param {Object} options - Configuration options
   * @param {string} options.schemasDir - Path to schemas directory
   */
  constructor(options = {}) {
    this.schemasDir = options.schemasDir ||
      path.join(process.cwd(), '.aiox-core', 'product', 'templates', 'engine', 'schemas');

    this.ajv = new Ajv({
      allErrors: true,
      verbose: true,
      strict: false,
      validateFormats: true,
    });

    // Add format validators
    addFormats(this.ajv);

    // Add custom formats
    this.registerCustomFormats();

    // Schema cache
    this.schemas = new Map();
  }

  /**
   * Register custom validation formats
   */
  registerCustomFormats() {
    // Semantic version format
    this.ajv.addFormat('semver', {
      validate: (str) => /^\d+\.\d+\.\d+(-[a-zA-Z0-9.]+)?(\+[a-zA-Z0-9.]+)?$/.test(str),
    });

    // Slug format (URL-safe string)
    this.ajv.addFormat('slug', {
      validate: (str) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(str),
    });

    // Story ID format (e.g., "3.6", "12.1")
    this.ajv.addFormat('story-id', {
      validate: (str) => /^\d+\.\d+$/.test(str),
    });

    // Epic ID format (e.g., "EPIC-S3")
    this.ajv.addFormat('epic-id', {
      validate: (str) => /^EPIC-[A-Z0-9]+$/.test(str),
    });
  }

  /**
   * Load a schema by template type
   * @param {string} templateType - Template type (prd, adr, etc.)
   * @returns {Promise<Object>} Loaded schema
   */
  async loadSchema(templateType) {
    if (this.schemas.has(templateType)) {
      return this.schemas.get(templateType);
    }

    // Handle versioned schema aliases (e.g., prd-v2 -> prd-v2.schema.json)
    const schemaAliases = {
      'prd-v2': 'prd-v2',
    };

    const schemaName = schemaAliases[templateType] || templateType;
    const schemaPath = path.join(this.schemasDir, `${schemaName}.schema.json`);

    try {
      const content = await fs.readFile(schemaPath, 'utf-8');
      const schema = JSON.parse(content);
      this.schemas.set(templateType, schema);
      return schema;
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error(`Schema not found for template type: ${templateType}`);
      }
      throw new Error(`Failed to load schema for ${templateType}: ${error.message}`);
    }
  }

  /**
   * Register a schema directly
   * @param {string} templateType - Template type
   * @param {Object} schema - JSON Schema object
   */
  registerSchema(templateType, schema) {
    this.schemas.set(templateType, schema);
    this.ajv.addSchema(schema, templateType);
  }

  /**
   * Validate data against a template schema
   * @param {Object} data - Data to validate
   * @param {string} templateType - Template type for schema lookup
   * @returns {Promise<Object>} Validation result
   */
  async validate(data, templateType) {
    const schema = await this.loadSchema(templateType);

    // Get cached validator or compile and cache it with AJV
    let validate = this.ajv.getSchema(templateType);
    if (!validate) {
      // Register schema with AJV for proper caching using $id or templateType as key
      const schemaId = schema.$id || templateType;
      if (!this.ajv.getSchema(schemaId)) {
        this.ajv.addSchema(schema, templateType);
      }
      validate = this.ajv.getSchema(templateType);

      // Fallback to compile if addSchema didn't work (edge case)
      if (!validate) {
        validate = this.ajv.compile(schema);
      }
    }

    const isValid = validate(data);

    if (isValid) {
      return {
        isValid: true,
        errors: [],
        data,
      };
    }

    return {
      isValid: false,
      errors: this.formatErrors(validate.errors),
      data,
    };
  }

  /**
   * Validate rendered markdown content structure
   * @param {string} content - Rendered markdown content
   * @param {Object} template - Template with metadata
   * @returns {Object} Validation result
   */
  validateStructure(content, template) {
    const errors = [];
    const metadata = template.metadata || {};

    // Check required sections from template metadata
    if (metadata.required_sections) {
      for (const section of metadata.required_sections) {
        const sectionRegex = new RegExp(`^##?\\s+${section}`, 'mi');
        if (!sectionRegex.test(content)) {
          errors.push(`Missing required section: ${section}`);
        }
      }
    }

    // Check for empty required fields
    if (metadata.variables) {
      for (const variable of metadata.variables) {
        if (variable.required) {
          const placeholder = `{{${variable.name}}}`;
          if (content.includes(placeholder)) {
            errors.push(`Unresolved required variable: ${variable.name}`);
          }
        }
      }
    }

    // Check minimum content length
    if (metadata.min_length && content.length < metadata.min_length) {
      errors.push(`Content too short: ${content.length} < ${metadata.min_length} characters`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Format Ajv errors into readable messages
   * @param {Array} errors - Ajv error objects
   * @returns {Array<string>} Formatted error messages
   */
  formatErrors(errors) {
    if (!errors) return [];

    return errors.map(error => {
      const path = error.instancePath || '/';
      const message = error.message;
      const params = error.params;

      let details = '';
      if (params) {
        if (params.additionalProperty) {
          details = ` (unknown property: ${params.additionalProperty})`;
        } else if (params.missingProperty) {
          details = ` (missing: ${params.missingProperty})`;
        } else if (params.allowedValues) {
          details = ` (allowed: ${params.allowedValues.join(', ')})`;
        }
      }

      return `${path}: ${message}${details}`;
    });
  }

  /**
   * Extract data from rendered markdown for validation
   * @param {string} content - Rendered markdown content
   * @param {Object} template - Template with metadata
   * @returns {Object} Extracted data object
   */
  extractDataFromMarkdown(content, template) {
    const data = {};
    const lines = content.split('\n');

    // Extract frontmatter values (key: value format)
    for (const line of lines) {
      const match = line.match(/^\*\*([^:]+):\*\*\s*(.+)$/);
      if (match) {
        const key = match[1].toLowerCase().replace(/\s+/g, '_');
        const value = match[2].trim();
        data[key] = value;
      }
    }

    // Extract title from first heading
    const titleMatch = content.match(/^#\s+(.+)$/m);
    if (titleMatch) {
      data.title = titleMatch[1].trim();
    }

    return data;
  }

  /**
   * Check if all schemas exist for supported template types
   * @param {Array<string>} templateTypes - Template types to check
   * @returns {Promise<Object>} Check result with missing schemas
   */
  async checkSchemas(templateTypes) {
    const missing = [];
    const found = [];

    for (const type of templateTypes) {
      try {
        await this.loadSchema(type);
        found.push(type);
      } catch {
        missing.push(type);
      }
    }

    return {
      complete: missing.length === 0,
      found,
      missing,
    };
  }

  /**
   * Clear schema cache
   * @param {string} templateType - Specific schema to clear, or all if not provided
   */
  clearCache(templateType) {
    if (templateType) {
      this.schemas.delete(templateType);
    } else {
      this.schemas.clear();
    }
  }
}

module.exports = {
  TemplateValidator,
};
