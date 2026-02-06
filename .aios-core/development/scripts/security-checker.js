/**
 * Security Checker for AIOS Developer Meta-Agent
 * Validates generated code and configurations for security vulnerabilities
 */

const path = require('path');
const yaml = require('js-yaml');

class SecurityChecker {
  constructor() {
    // Patterns that indicate potential security issues
    this.dangerousPatterns = [
      /eval\s*\(/gi,
      /Function\s*\(/gi,
      /new\s+Function/gi,
      /setTimeout\s*\([^,]+,/gi,
      /setInterval\s*\([^,]+,/gi,
      /require\s*\([^'"]/gi, // Dynamic require
      /import\s*\(/gi, // Dynamic import
      /child_process/gi,
      /exec\s*\(/gi,
      /spawn\s*\(/gi,
      /\.\.\/\.\.\//g, // Path traversal
      /process\.env/gi,
      /__dirname/gi,
      /__filename/gi,
    ];

    // SQL injection patterns
    this.sqlInjectionPatterns = [
      /;\s*DROP\s+TABLE/gi,
      /;\s*DELETE\s+FROM/gi,
      /UNION\s+SELECT/gi,
      /OR\s+1\s*=\s*1/gi,
      /'\s+OR\s+'/gi,
    ];

    // Command injection patterns
    this.commandInjectionPatterns = [
      /[;&|`$()]/g,
      /\$\{.*\}/g,
      />|</g,
    ];

    // Safe patterns that should be allowed
    this.safePatterns = {
      'eval': [
        /\/\*.*eval.*\*\//gs, // eval in comments
        /\/\/.*eval/g, // eval in single-line comments
        /".*eval.*"/g, // eval in strings
        /'.*eval.*'/g,
      ]
    };
  }

  /**
   * Validate generated code for security vulnerabilities
   * @param {string} code - The code to validate
   * @param {string} [language='javascript'] - The programming language
   * @returns {Object} Validation results with valid flag, errors, warnings, and suggestions
   */
  validateCode(code, language = 'javascript') {
    const results = {
      valid: true,
      errors: [],
      warnings: [],
      suggestions: []
    };

    // Validate input
    if (!code || typeof code !== 'string') {
      results.valid = false;
      results.errors.push({
        type: 'invalid_input',
        message: 'Code must be a non-empty string'
      });
      return results;
    }

    // Check for dangerous patterns
    for (const pattern of this.dangerousPatterns) {
      const matches = code.match(pattern);
      if (matches) {
        // Check if it's in a safe context
        let isSafe = false;
        const patternName = pattern.source.split('\\')[0];
        
        if (this.safePatterns[patternName]) {
          for (const safePattern of this.safePatterns[patternName]) {
            if (code.match(safePattern)) {
              isSafe = true;
              break;
            }
          }
        }

        if (!isSafe) {
          results.valid = false;
          results.errors.push({
            type: 'dangerous_pattern',
            pattern: pattern.source,
            matches: matches,
            message: `Dangerous pattern detected: ${matches[0]}`,
            line: this._getLineNumber(code, matches.index)
          });
        }
      }
    }

    // Check for SQL injection (if applicable)
    if (code.includes('SELECT') || code.includes('INSERT') || code.includes('UPDATE')) {
      for (const pattern of this.sqlInjectionPatterns) {
        if (pattern.test(code)) {
          results.valid = false;
          results.errors.push({
            type: 'sql_injection',
            pattern: pattern.source,
            message: 'Potential SQL injection vulnerability detected'
          });
        }
      }
    }

    // Validate input sanitization
    if (code.includes('req.body') || code.includes('req.query') || code.includes('req.params')) {
      if (!code.includes('sanitize') && !code.includes('validate') && !code.includes('escape')) {
        results.warnings.push({
          type: 'input_validation',
          message: 'User input detected without explicit sanitization'
        });
      }
    }

    return results;
  }

  /**
   * Validate YAML configuration for security issues
   */
  validateYAML(yamlContent) {
    const results = {
      valid: true,
      errors: [],
      warnings: []
    };

    try {
      const parsed = yaml.load(yamlContent);
      
      // Check for dangerous YAML features
      if (yamlContent.includes('!!') && !yamlContent.includes('!!str')) {
        results.warnings.push({
          type: 'yaml_tags',
          message: 'YAML tags detected - ensure they are safe'
        });
      }

      // Validate structure
      this.validateYAMLStructure(parsed, results);
      
    } catch (error) {
      results.valid = false;
      results.errors.push({
        type: 'yaml_parse',
        message: `YAML parsing error: ${error.message}`
      });
    }

    return results;
  }

  /**
   * Validate YAML structure recursively
   */
  validateYAMLStructure(obj, results, path = '') {
    if (typeof obj === 'object' && obj !== null) {
      for (const [key, value] of Object.entries(obj)) {
        const currentPath = path ? `${path}.${key}` : key;
        
        // Check for command injection in string values
        if (typeof value === 'string') {
          for (const pattern of this.commandInjectionPatterns) {
            if (pattern.test(_value) && !this.isSafeCommandContext(key, value)) {
              results.warnings.push({
                type: 'command_injection',
                path: currentPath,
                message: `Potential command injection in ${currentPath}`
              });
            }
          }
        }
        
        // Recurse for nested objects
        if (typeof value === 'object') {
          this.validateYAMLStructure(_value, results, currentPath);
        }
      }
    }
  }

  /**
   * Check if command-like string is in safe context
   */
  isSafeCommandContext(key, value) {
    const safeKeys = ['description', 'comment', 'note', 'help', 'usage'];
    return safeKeys.some(safe => key.toLowerCase().includes(safe));
  }

  /**
   * Validate file paths for security issues
   */
  validatePath(filePath) {
    const results = {
      valid: true,
      errors: []
    };

    // Normalize the path
    const normalized = path.normalize(filePath);

    // Check for path traversal
    if (normalized.includes('..')) {
      results.valid = false;
      results.errors.push({
        type: 'path_traversal',
        message: 'Path traversal detected'
      });
    }

    // Check for absolute paths (unless allowed)
    if (path.isAbsolute(normalized)) {
      results.errors.push({
        type: 'absolute_path',
        message: 'Absolute path detected - use relative paths'
      });
    }

    // Check for sensitive directories
    const sensitivePatterns = [
      /node_modules/i,
      /\.git/i,
      /\.env/i,
      /private/i,
      /secret/i,
      /config/i,
    ];

    for (const pattern of sensitivePatterns) {
      if (pattern.test(normalized)) {
        results.warnings = results.warnings || [];
        results.warnings.push({
          type: 'sensitive_path',
          message: `Path contains potentially sensitive directory: ${pattern.source}`
        });
      }
    }

    return results;
  }

  /**
   * Validate user input for common security issues
   */
  sanitizeInput(input, type = 'general') {
    if (typeof input !== 'string') {
      return input;
    }

    let sanitized = input;

    // Remove null bytes
    sanitized = sanitized.replace(/\0/g, '');

    // Type-specific sanitization
    switch (type) {
      case 'filename':
        // Allow only alphanumeric, dash, underscore, and dot
        sanitized = sanitized.replace(/[^a-zA-Z0-9\-_\.]/g, '');
        break;
      
      case 'identifier':
        // Allow only alphanumeric, dash, and underscore
        sanitized = sanitized.replace(/[^a-zA-Z0-9\-_]/g, '');
        break;
      
      case 'yaml':
        // Escape special YAML characters
        sanitized = sanitized
          .replace(/:/g, '\\:')
          .replace(/\|/g, '\\|')
          .replace(/>/g, '\\>')
          .replace(/</g, '\\<');
        break;
      
      case 'general':
      default:
        // Basic HTML/script escaping
        sanitized = sanitized
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#x27;')
          .replace(/\//g, '&#x2F;');
    }

    return sanitized;
  }

  /**
   * Generate security report
   * @param {Array} validations - Array of validation results
   * @returns {Object} Comprehensive security report
   */
  generateReport(validations) {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalChecks: 0,
        passed: 0,
        failed: 0,
        warnings: 0
      },
      details: validations
    };

    // Calculate summary
    for (const validation of validations) {
      report.summary.totalChecks++;
      if (validation.valid) {
        report.summary.passed++;
      } else {
        report.summary.failed++;
      }
      report.summary.warnings += (validation.warnings || []).length;
    }

    report.summary.securityScore = Math.round(
      (report.summary.passed / report.summary.totalChecks) * 100
    );

    return report;
  }

  /**
   * Get line number from string index
   * @private
   * @param {string} text - The text to search
   * @param {number} index - Character index
   * @returns {number} Line number (1-based)
   */
  _getLineNumber(text, index) {
    if (!text || index === undefined) return null;
    const lines = text.substring(0, index).split('\n');
    return lines.length;
  }
}

module.exports = SecurityChecker;