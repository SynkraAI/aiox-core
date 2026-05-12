/**
 * Handlebars Renderer Module
 * Handles template rendering with custom helpers
 *
 * @module renderer
 * @version 2.0.0
 */

'use strict';

const Handlebars = require('handlebars');

/**
 * Register default Handlebars helpers
 * @param {Object} handlebars - Handlebars instance
 */
function registerDefaultHelpers(handlebars) {
  // Pad number with leading zeros
  handlebars.registerHelper('padNumber', (num, length) => {
    return String(num).padStart(length, '0');
  });

  // Format date with pattern
  handlebars.registerHelper('formatDate', (date, format) => {
    const d = date instanceof Date ? date : new Date(date);

    const patterns = {
      'YYYY': d.getFullYear(),
      'MM': String(d.getMonth() + 1).padStart(2, '0'),
      'DD': String(d.getDate()).padStart(2, '0'),
      'HH': String(d.getHours()).padStart(2, '0'),
      'mm': String(d.getMinutes()).padStart(2, '0'),
      'ss': String(d.getSeconds()).padStart(2, '0'),
    };

    let result = format;
    for (const [pattern, value] of Object.entries(patterns)) {
      result = result.replace(pattern, value);
    }
    return result;
  });

  // Add numbers
  handlebars.registerHelper('add', (a, b) => a + b);

  // Subtract numbers
  handlebars.registerHelper('subtract', (a, b) => a - b);

  // Multiply numbers
  handlebars.registerHelper('multiply', (a, b) => a * b);

  // Divide numbers
  handlebars.registerHelper('divide', (a, b) => a / b);

  // Check equality
  handlebars.registerHelper('eq', (a, b) => a === b);

  // Check not equal
  handlebars.registerHelper('ne', (a, b) => a !== b);

  // Greater than
  handlebars.registerHelper('gt', (a, b) => a > b);

  // Greater than or equal
  handlebars.registerHelper('gte', (a, b) => a >= b);

  // Less than
  handlebars.registerHelper('lt', (a, b) => a < b);

  // Less than or equal
  handlebars.registerHelper('lte', (a, b) => a <= b);

  // Logical AND
  handlebars.registerHelper('and', (...args) => {
    args.pop(); // Remove options object
    return args.every(Boolean);
  });

  // Logical OR
  handlebars.registerHelper('or', (...args) => {
    args.pop(); // Remove options object
    return args.some(Boolean);
  });

  // Logical NOT
  handlebars.registerHelper('not', (value) => !value);

  // Uppercase string
  handlebars.registerHelper('uppercase', (str) => {
    return str ? String(str).toUpperCase() : '';
  });

  // Lowercase string
  handlebars.registerHelper('lowercase', (str) => {
    return str ? String(str).toLowerCase() : '';
  });

  // Capitalize first letter
  handlebars.registerHelper('capitalize', (str) => {
    if (!str) return '';
    const s = String(str);
    return s.charAt(0).toUpperCase() + s.slice(1);
  });

  // Title case string
  handlebars.registerHelper('titlecase', (str) => {
    if (!str) return '';
    return String(str)
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  });

  // Join array with separator
  handlebars.registerHelper('join', (array, separator) => {
    if (!Array.isArray(array)) return '';
    return array.join(typeof separator === 'string' ? separator : ', ');
  });

  // Get array length
  handlebars.registerHelper('length', (array) => {
    return Array.isArray(array) ? array.length : 0;
  });

  // Check if array includes value
  handlebars.registerHelper('includes', (array, value) => {
    return Array.isArray(array) && array.includes(value);
  });

  // First element of array
  handlebars.registerHelper('first', (array) => {
    return Array.isArray(array) && array.length > 0 ? array[0] : null;
  });

  // Last element of array
  handlebars.registerHelper('last', (array) => {
    return Array.isArray(array) && array.length > 0 ? array[array.length - 1] : null;
  });

  // Default value if undefined/null
  handlebars.registerHelper('default', (value, defaultValue) => {
    return value ?? defaultValue;
  });

  // JSON stringify
  handlebars.registerHelper('json', (value, indent) => {
    return JSON.stringify(value, null, typeof indent === 'number' ? indent : 2);
  });

  // Repeat block n times (with @index, @first, @last data variables)
  handlebars.registerHelper('times', (n, options) => {
    let result = '';
    for (let i = 0; i < n; i++) {
      // Create data frame to expose @index, @first, @last like built-in each
      const data = options.data ? Handlebars.createFrame(options.data) : {};
      data.index = i;
      data.first = i === 0;
      data.last = i === n - 1;
      result += options.fn({ index: i, first: i === 0, last: i === n - 1 }, { data });
    }
    return result;
  });

  // Conditional block based on equality
  handlebars.registerHelper('ifEqual', function(a, b, options) {
    return a === b ? options.fn(this) : options.inverse(this);
  });

  // Conditional block based on inequality
  handlebars.registerHelper('unlessEqual', function(a, b, options) {
    return a !== b ? options.fn(this) : options.inverse(this);
  });

  // Slug helper (URL-safe string)
  handlebars.registerHelper('slug', (str) => {
    if (!str) return '';
    return String(str)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  });

  // Truncate string
  handlebars.registerHelper('truncate', (str, length, suffix) => {
    if (!str) return '';
    const s = String(str);
    if (s.length <= length) return s;
    return s.slice(0, length) + (typeof suffix === 'string' ? suffix : '...');
  });

  // Now helper for current date
  handlebars.registerHelper('now', () => new Date());
}

/**
 * TemplateRenderer class for rendering Handlebars templates
 */
class TemplateRenderer {
  /**
   * Create a TemplateRenderer instance
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    this.handlebars = Handlebars.create();
    this.customHelpers = new Map();
    registerDefaultHelpers(this.handlebars);

    // Register any custom helpers from options
    if (options.helpers) {
      for (const [name, fn] of Object.entries(options.helpers)) {
        this.registerHelper(name, fn);
      }
    }
  }

  /**
   * Register a custom Handlebars helper
   * @param {string} name - Helper name
   * @param {Function} fn - Helper function
   */
  registerHelper(name, fn) {
    this.handlebars.registerHelper(name, fn);
    this.customHelpers.set(name, fn);
  }

  /**
   * Register a partial template
   * @param {string} name - Partial name
   * @param {string} content - Partial content
   */
  registerPartial(name, content) {
    this.handlebars.registerPartial(name, content);
  }

  /**
   * Render a template with context
   * @param {Object} template - Template object with body
   * @param {Object} context - Variable values for rendering
   * @returns {string} Rendered content
   */
  render(template, context = {}) {
    const templateBody = typeof template === 'string' ? template : template.body;

    try {
      const compiledTemplate = this.handlebars.compile(templateBody, {
        strict: false,
        noEscape: true,
      });

      // Add metadata to context if available
      const fullContext = {
        ...context,
        _template: template.metadata || {},
        now: new Date(),
      };

      return compiledTemplate(fullContext);
    } catch (error) {
      throw new Error(`Template rendering failed: ${error.message}`);
    }
  }

  /**
   * Render a template string directly
   * @param {string} templateString - Template string
   * @param {Object} context - Variable values for rendering
   * @returns {string} Rendered content
   */
  renderString(templateString, context = {}) {
    return this.render(templateString, context);
  }

  /**
   * Validate template syntax
   * @param {string} templateBody - Template content to validate
   * @returns {Object} Validation result with isValid and errors
   */
  validateSyntax(templateBody) {
    try {
      const compiled = this.handlebars.compile(templateBody);
      // Also try to execute with empty context to catch parse errors
      // that only manifest at execution time (e.g., incomplete expressions)
      compiled({});
      return { isValid: true, errors: [] };
    } catch (error) {
      return {
        isValid: false,
        errors: [error.message],
      };
    }
  }

  /**
   * Extract variable references from template
   * @param {string} templateBody - Template content
   * @returns {Array<string>} List of variable names used in template
   */
  extractVariables(templateBody) {
    const variables = new Set();

    // Match {{variable}}, {{variable.property}}, {{#each variable}}, etc.
    const regex = /\{\{[#/]?(?:each|if|unless|with)?\s*([a-zA-Z_][a-zA-Z0-9_.]*)/g;
    let match;

    while ((match = regex.exec(templateBody)) !== null) {
      const variable = match[1].split('.')[0];
      // Exclude helpers and special keywords
      if (!this.isHelper(variable) && !this.isKeyword(variable)) {
        variables.add(variable);
      }
    }

    return Array.from(variables);
  }

  /**
   * Check if name is a registered helper
   * @param {string} name - Name to check
   * @returns {boolean} True if helper exists
   */
  isHelper(name) {
    return this.customHelpers.has(name) ||
      ['padNumber', 'formatDate', 'add', 'subtract', 'eq', 'ne', 'gt', 'lt',
        'gte', 'lte', 'and', 'or', 'not', 'uppercase', 'lowercase', 'capitalize',
        'titlecase', 'join', 'length', 'includes', 'first', 'last', 'default',
        'json', 'times', 'ifEqual', 'unlessEqual', 'slug', 'truncate', 'now',
        'multiply', 'divide'].includes(name);
  }

  /**
   * Check if name is a Handlebars keyword
   * @param {string} name - Name to check
   * @returns {boolean} True if keyword
   */
  isKeyword(name) {
    return ['this', '@index', '@key', '@first', '@last', '@root'].includes(name);
  }
}

module.exports = {
  TemplateRenderer,
  registerDefaultHelpers,
};
