/**
 * YAML Validator for AIOS Developer Meta-Agent
 * Ensures YAML files maintain proper structure and syntax
 */

const yaml = require('js-yaml');
const fs = require('fs-extra');

class YAMLValidator {
  constructor() {
    this.validationRules = {
      agent: {
        required: ['agent', 'persona', 'commands'],
        optional: ['dependencies', 'security', 'customization'],
        structure: {
          agent: {
            required: ['name', 'id', 'title', 'icon', 'whenToUse'],
            optional: ['customization']
          },
          persona: {
            required: ['role', 'style', 'identity', 'focus'],
            optional: []
          }
        }
      },
      manifest: {
        required: ['bundle', 'agents'],
        optional: ['workflows'],
        structure: {
          bundle: {
            required: ['name', 'icon', 'description'],
            optional: []
          }
        }
      },
      workflow: {
        required: ['workflow', 'stages'],
        optional: ['transitions', 'resources', 'validation'],
        structure: {
          workflow: {
            required: ['id', 'name', 'description', 'type', 'scope'],
            optional: []
          }
        }
      }
    };
  }

  /**
   * Validate YAML content
   */
  async validate(content, type = 'general') {
    const results = {
      valid: true,
      errors: [],
      warnings: [],
      parsed: null
    };

    try {
      // Parse YAML
      results.parsed = yaml.load(content, {
        schema: yaml.SAFE_SCHEMA,
        onWarning: (warning) => {
          results.warnings.push({
            type: 'yaml_warning',
            message: warning.toString()
          });
        }
      });

      // Type-specific validation
      if (type !== 'general' && this.validationRules[type]) {
        this.validateStructure(results.parsed, type, results);
      }

      // General validations
      this.validateGeneral(results.parsed, results);

    } catch (error) {
      results.valid = false;
      results.errors.push({
        type: 'parse_error',
        message: error.message,
        line: error.mark ? error.mark.line : null,
        column: error.mark ? error.mark.column : null
      });
    }

    return results;
  }

  /**
   * Validate YAML file
   */
  async validateFile(filePath, type = 'general') {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      const results = await this.validate(content, type);
      results.filePath = filePath;
      return results;
    } catch (error) {
      return {
        valid: false,
        filePath,
        errors: [{
          type: 'file_error',
          message: `Could not read file: ${error.message}`
        }]
      };
    }
  }

  /**
   * Validate structure based on type
   */
  validateStructure(data, type, results) {
    const rules = this.validationRules[type];

    // Check required top-level fields
    for (const field of rules.required) {
      if (!data.hasOwnProperty(field)) {
        results.valid = false;
        results.errors.push({
          type: 'missing_required',
          field,
          message: `Missing required field: ${field}`
        });
      }
    }

    // Check structure of specific fields
    if (rules.structure) {
      for (const [field, fieldRules] of Object.entries(rules.structure)) {
        if (data[field]) {
          this.validateFieldStructure(
            data[field], 
            field, 
            fieldRules, 
            results
          );
        }
      }
    }

    // Warn about unknown fields
    const allKnownFields = [
      ...(rules.required || []),
      ...(rules.optional || [])
    ];
    
    for (const field of Object.keys(data)) {
      if (!allKnownFields.includes(field)) {
        results.warnings.push({
          type: 'unknown_field',
          field,
          message: `Unknown field: ${field}`
        });
      }
    }
  }

  /**
   * Validate field structure
   */
  validateFieldStructure(data, fieldName, rules, results) {
    // Check required subfields
    for (const subfield of rules.required || []) {
      if (!data.hasOwnProperty(subfield)) {
        results.valid = false;
        results.errors.push({
          type: 'missing_required',
          field: `${fieldName}.${subfield}`,
          message: `Missing required field: ${fieldName}.${subfield}`
        });
      }
    }

    // Check field types
    this.validateFieldTypes(data, fieldName, results);
  }

  /**
   * Validate field types
   */
  validateFieldTypes(data, fieldName, results) {
    for (const [key, value] of Object.entries(data)) {
      const fullPath = `${fieldName}.${key}`;
      
      // Check for null/undefined
      if (value === null || value === undefined) {
        results.warnings.push({
          type: 'null_value',
          field: fullPath,
          message: `Null or undefined value at ${fullPath}`
        });
      }

      // Type-specific checks
      if (key === 'id' || key === 'name') {
        if (typeof value !== 'string' || value.trim() === '') {
          results.errors.push({
            type: 'invalid_type',
            field: fullPath,
            message: `${fullPath} must be a non-empty string`
          });
        }
      }

      if (key === 'icon' && typeof value === 'string') {
        // Check if it's a valid emoji or icon string
        if (value.length === 0) {
          results.warnings.push({
            type: 'empty_icon',
            field: fullPath,
            message: 'Icon field is empty'
          });
        }
      }
    }
  }

  /**
   * General validations for all YAML
   */
  validateGeneral(data, results) {
    // Check for circular references
    try {
      JSON.stringify(data);
    } catch (error) {
      if (error.message.includes('circular')) {
        results.valid = false;
        results.errors.push({
          type: 'circular_reference',
          message: 'Circular reference detected in YAML structure'
        });
      }
    }

    // Check for excessively deep nesting
    const maxDepth = this.getMaxDepth(data);
    if (maxDepth > 10) {
      results.warnings.push({
        type: 'deep_nesting',
        depth: maxDepth,
        message: `Deep nesting detected (${maxDepth} levels)`
      });
    }
  }

  /**
   * Get maximum depth of object
   */
  getMaxDepth(obj, currentDepth = 0) {
    if (typeof obj !== 'object' || obj === null) {
      return currentDepth;
    }

    let maxDepth = currentDepth;
    for (const value of Object.values(obj)) {
      if (typeof value === 'object') {
        const depth = this.getMaxDepth(value, currentDepth + 1);
        maxDepth = Math.max(maxDepth, depth);
      }
    }

    return maxDepth;
  }

  /**
   * Fix common YAML issues
   */
  async autoFix(content, type = 'general') {
    let fixed = content;

    // Fix common indentation issues
    fixed = this.fixIndentation(fixed);

    // Fix quote issues
    fixed = this.fixQuotes(fixed);

    // Validate the fixed content
    const validation = await this.validate(fixed, type);
    
    return {
      content: fixed,
      validation,
      changed: content !== fixed
    };
  }

  /**
   * Fix indentation issues
   * @param {string} content - YAML content to fix
   * @returns {string} Fixed YAML content
   */
  fixIndentation(content) {
    const lines = content.split('\n');
    const fixedLines = [];
    const indentStack = [0];
    let currentLevel = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      
      // Skip empty lines and comments
      if (!trimmed || trimmed.startsWith('#')) {
        fixedLines.push(line);
        continue;
      }

      // Handle list items
      if (trimmed.startsWith('-')) {
        const baseIndent = indentStack[indentStack.length - 1];
        fixedLines.push(' '.repeat(baseIndent) + trimmed);
        
        // If list item has a key-value pair, prepare for nested content
        if (trimmed.includes(':') && !trimmed.endsWith(':')) {
          const afterDash = trimmed.substring(1).trim();
          if (afterDash.includes(':')) {
            currentLevel = baseIndent + 2;
          }
        }
      }
      // Handle key-value pairs
      else if (trimmed.includes(':')) {
        // Find appropriate indent level
        const colonIndex = trimmed.indexOf(':');
        const _key = trimmed.substring(0, colonIndex);
        
        // Pop stack until we find the right level
        while (indentStack.length > 1 && 
               line.length - line.trimStart().length < indentStack[indentStack.length - 1]) {
          indentStack.pop();
        }
        
        currentLevel = indentStack[indentStack.length - 1];
        fixedLines.push(' '.repeat(currentLevel) + trimmed);
        
        // If this opens a new block, push new indent level
        if (trimmed.endsWith(':') || (i + 1 < lines.length && lines[i + 1].trim() && 
            lines[i + 1].length - lines[i + 1].trimStart().length > currentLevel)) {
          indentStack.push(currentLevel + 2);
        }
      } else {
        // Regular content line
        fixedLines.push(' '.repeat(currentLevel) + trimmed);
      }
    }

    return fixedLines.join('\n');
  }

  /**
   * Fix quote issues
   */
  fixQuotes(content) {
    // Fix unquoted strings that need quotes
    return content.replace(
      /^(\s*\w+):\s*([^"'\n]*[:{}\[\]|>&*!%@`][^"'\n]*)$/gm,
      '$1: "$2"'
    );
  }

  /**
   * Generate validation report
   */
  generateReport(validation) {
    const report = [];
    
    report.push(`YAML Validation Report`);
    report.push(`=====================`);
    report.push(`Valid: ${validation.valid ? '✅ Yes' : '❌ No'}`);
    
    if (validation.errors.length > 0) {
      report.push(`\nErrors (${validation.errors.length}):`);
      for (const error of validation.errors) {
        report.push(`  - ${error.message}`);
        if (error.line) {
          report.push(`    Line: ${error.line}, Column: ${error.column}`);
        }
      }
    }

    if (validation.warnings.length > 0) {
      report.push(`\nWarnings (${validation.warnings.length}):`);
      for (const warning of validation.warnings) {
        report.push(`  - ${warning.message}`);
      }
    }

    return report.join('\n');
  }
}

module.exports = YAMLValidator;