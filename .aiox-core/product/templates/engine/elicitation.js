/**
 * Variable Elicitation Module
 * Handles interactive prompting for template variables using inquirer.js
 *
 * @module elicitation
 * @version 2.0.0
 */

'use strict';

const inquirer = require('inquirer');

/**
 * Map template variable types to inquirer question types
 * @param {string} type - Template variable type
 * @returns {string} Inquirer question type
 */
function mapQuestionType(type) {
  const typeMap = {
    string: 'input',
    text: 'editor',
    number: 'number',
    boolean: 'confirm',
    choice: 'list',
    multichoice: 'checkbox',
    password: 'password',
    array: 'input',
  };

  return typeMap[type] || 'input';
}

/**
 * Create an inquirer question from a template variable
 * @param {Object} variable - Template variable definition
 * @param {Object} context - Existing context values
 * @returns {Object} Inquirer question configuration
 */
function createQuestion(variable, context = {}) {
  const question = {
    type: mapQuestionType(variable.type),
    name: variable.name,
    message: variable.prompt,
    default: context[variable.name] ?? variable.default,
  };

  // Add choices for choice/multichoice types
  if (variable.choices) {
    question.choices = variable.choices;
  }

  // Add validation
  if (variable.required && variable.type !== 'boolean') {
    question.validate = (input) => {
      if (variable.type === 'array') {
        return input && input.trim().length > 0 ? true : `${variable.name} is required`;
      }
      if (input === undefined || input === null || input === '') {
        return `${variable.name} is required`;
      }
      return true;
    };
  }

  // Add custom validation
  if (variable.validation) {
    const baseValidate = question.validate;
    question.validate = (input) => {
      if (baseValidate) {
        const baseResult = baseValidate(input);
        if (baseResult !== true) return baseResult;
      }

      if (variable.validation.minLength && input.length < variable.validation.minLength) {
        return `${variable.name} must be at least ${variable.validation.minLength} characters`;
      }
      if (variable.validation.maxLength && input.length > variable.validation.maxLength) {
        return `${variable.name} must be at most ${variable.validation.maxLength} characters`;
      }
      if (variable.validation.pattern) {
        const regex = new RegExp(variable.validation.pattern);
        if (!regex.test(input)) {
          return variable.validation.message || `${variable.name} format is invalid`;
        }
      }

      return true;
    };
  }

  // Transform array input
  if (variable.type === 'array') {
    question.filter = (input) => {
      if (typeof input === 'string') {
        return input.split(',').map(s => s.trim()).filter(Boolean);
      }
      return input;
    };
  }

  return question;
}

/**
 * VariableElicitation class for handling interactive prompts
 */
class VariableElicitation {
  /**
   * Create a VariableElicitation instance
   * @param {Object} options - Configuration options
   * @param {boolean} options.interactive - Enable interactive mode (default: true)
   */
  constructor(options = {}) {
    this.interactive = options.interactive !== false;
    this.autoResolvers = new Map();
    this.registerDefaultAutoResolvers();
  }

  /**
   * Register default auto-resolvers for common auto values
   */
  registerDefaultAutoResolvers() {
    // Next number resolvers
    this.autoResolvers.set('next_adr_number', async () => this.getNextNumber('adr'));
    this.autoResolvers.set('next_pmdr_number', async () => this.getNextNumber('pmdr'));
    this.autoResolvers.set('next_dbdr_number', async () => this.getNextNumber('dbdr'));
    this.autoResolvers.set('next_story_number', async () => this.getNextNumber('story'));
    this.autoResolvers.set('next_epic_number', async () => this.getNextNumber('epic'));
    this.autoResolvers.set('next_task_number', async () => this.getNextNumber('task'));

    // Current date/time
    this.autoResolvers.set('current_date', async () => new Date().toISOString().split('T')[0]);
    this.autoResolvers.set('current_datetime', async () => new Date().toISOString());
    this.autoResolvers.set('now', async () => new Date());
  }

  /**
   * Get next number for a document type by scanning existing files
   * @param {string} docType - Document type (adr, pmdr, etc.)
   * @returns {Promise<number>} Next available number
   */
  async getNextNumber(docType) {
    const path = require('path');
    const fg = require('fast-glob');

    const patterns = {
      adr: 'docs/architecture/decisions/adr-*.md',
      pmdr: 'docs/decisions/pmdr-*.md',
      dbdr: 'docs/decisions/dbdr-*.md',
      story: 'docs/stories/**/story-*.md',
      epic: 'docs/epics/epic-*.md',
      task: 'docs/tasks/task-*.md',
    };

    const pattern = patterns[docType] || `**/${docType}-*.md`;

    try {
      const files = fg.sync(pattern, { cwd: process.cwd() });
      const numbers = files.map(f => {
        const match = path.basename(f).match(new RegExp(`${docType}-(\\d+)`));
        return match ? parseInt(match[1], 10) : 0;
      });
      return Math.max(...numbers, 0) + 1;
    } catch {
      return 1;
    }
  }

  /**
   * Register a custom auto-resolver
   * @param {string} name - Resolver name (matches variable.auto value)
   * @param {Function} resolver - Async function that returns the value
   */
  registerAutoResolver(name, resolver) {
    this.autoResolvers.set(name, resolver);
  }

  /**
   * Check if a variable's requiredIf condition is met
   * @param {Object} variable - Variable with potential requiredIf condition
   * @param {Object} values - Current values to check condition against
   * @returns {boolean} True if variable should be required (condition met or no condition)
   */
  isConditionallyRequired(variable, values) {
    if (!variable.requiredIf) {
      return variable.required;
    }
    // requiredIf is the name of another variable that must be truthy
    return !!values[variable.requiredIf];
  }

  /**
   * Elicit values for template variables
   * @param {Array} variables - Template variable definitions
   * @param {Object} context - Pre-provided context values
   * @returns {Promise<Object>} Collected variable values
   */
  async elicit(variables, context = {}) {
    const values = { ...context };
    const questions = [];

    for (const variable of variables) {
      // Skip if value already provided in context
      if (context[variable.name] !== undefined) {
        continue;
      }

      // Handle auto-resolved values
      if (variable.auto && this.autoResolvers.has(variable.auto)) {
        try {
          values[variable.name] = await this.autoResolvers.get(variable.auto)();
          continue;
        } catch (error) {
          console.warn(`Auto-resolver ${variable.auto} failed: ${error.message}`);
        }
      }

      // Check if this is a conditionally required variable that should be skipped
      // (e.g., userFlows is only needed when includeUIUX=true)
      if (variable.requiredIf) {
        const conditionMet = this.isConditionallyRequired(variable, values);
        if (!conditionMet) {
          // Skip this variable - its condition is not met
          continue;
        }
      }

      // Add to questions for interactive prompt
      if (this.interactive) {
        questions.push(createQuestion(variable, context));
      } else if (variable.required && variable.default === undefined) {
        throw new Error(`Required variable ${variable.name} has no default and interactive mode is disabled`);
      } else {
        values[variable.name] = variable.default;
      }
    }

    // Prompt for remaining values
    if (questions.length > 0 && this.interactive) {
      const answers = await inquirer.prompt(questions);
      Object.assign(values, answers);
    }

    return values;
  }

  /**
   * Validate that all required variables have values
   * @param {Array} variables - Template variable definitions
   * @param {Object} values - Collected values
   * @returns {Object} Validation result with isValid and errors
   */
  validate(variables, values) {
    const errors = [];

    for (const variable of variables) {
      // Check if variable is required (either always or conditionally)
      const isRequired = this.isConditionallyRequired(variable, values);

      if (isRequired) {
        const value = values[variable.name];
        if (value === undefined || value === null || value === '') {
          errors.push(`Missing required variable: ${variable.name}`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Merge context with defaults for non-interactive mode
   * @param {Array} variables - Template variable definitions
   * @param {Object} context - Provided context
   * @returns {Object} Merged values with defaults
   */
  mergeDefaults(variables, context = {}) {
    const values = { ...context };

    for (const variable of variables) {
      if (values[variable.name] === undefined && variable.default !== undefined) {
        values[variable.name] = variable.default;
      }
    }

    return values;
  }
}

module.exports = {
  VariableElicitation,
  createQuestion,
  mapQuestionType,
};
