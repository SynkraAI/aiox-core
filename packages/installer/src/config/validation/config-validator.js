/**
 * Configuration Validation Module
 * Story 1.6: Environment Configuration
 *
 * Validates .env and YAML configuration files
 *
 * @module config-validator
 */

const yaml = require('js-yaml');
const path = require('path');

/**
 * Validate .env file format
 *
 * @param {string} content - .env file content
 * @returns {Object} Validation result { valid: boolean, errors: Array<string> }
 */
function validateEnvFormat(content) {
  const errors = [];
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    const lineNum = index + 1;
    const trimmed = line.trim();

    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith('#')) {
      return;
    }

    // Check for KEY=value format (no spaces around =)
    if (!trimmed.match(/^[A-Z_][A-Z0-9_]*=/)) {
      errors.push(`Line ${lineNum}: Invalid format. Expected KEY=value (no spaces around =)`);
      return;
    }

    // Check for spaces around =
    if (trimmed.match(/\s*=\s*/)) {
      const [key, ...rest] = trimmed.split('=');
      if (key.includes(' ') || (rest.length > 0 && rest[0].startsWith(' '))) {
        errors.push(`Line ${lineNum}: Remove spaces around = in "${trimmed}"`);
      }
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate API key format (basic check)
 *
 * @param {string} key - API key to validate
 * @param {string} [provider] - Provider name for specific validation
 * @returns {Object} Validation result { valid: boolean, error: string|null }
 */
function validateApiKeyFormat(key, provider = null) {
  // Null/undefined/empty is valid (skip logic)
  if (key === null || key === undefined || key === '') {
    return { valid: true, error: null };
  }

  const trimmed = typeof key === 'string' ? key.trim() : '';

  // Whitespace-only keys are invalid
  if (key !== '' && trimmed === '') {
    return { valid: false, error: 'API key cannot be only whitespace' };
  }

  // Provider-specific validation
  if (provider) {
    switch (provider.toLowerCase()) {
      case 'openai':
        // OpenAI keys start with sk- and are at least 20 chars
        if (!trimmed.startsWith('sk-') || trimmed.length < 20) {
          return { valid: false, error: 'OpenAI API keys should start with "sk-" and be at least 20 characters' };
        }
        break;

      case 'anthropic':
        // Anthropic keys start with sk-ant- and are longer
        if (!trimmed.startsWith('sk-ant-') || trimmed.length < 30) {
          return { valid: false, error: 'Anthropic API keys should start with "sk-ant-" and be at least 30 characters' };
        }
        break;

      case 'github':
        // GitHub tokens: ghp_ (personal), gho_ (OAuth), ghs_ (server), ghu_ (user), ghr_ (refresh), github_pat_ (fine-grained)
        if (!trimmed.match(/^(ghp_|gho_|ghs_|ghu_|ghr_|github_pat_)/)) {
          return { valid: false, error: 'GitHub tokens should start with ghp_, gho_, ghs_, ghu_, ghr_, or github_pat_' };
        }
        break;

      // Other providers use basic validation
      default:
        break;
    }
  }

  // Check for suspicious patterns (spaces, newlines)
  if (trimmed.match(/\s/)) {
    return { valid: false, error: 'API key should not contain spaces or newlines' };
  }

  // Check for minimum length (general safety)
  if (trimmed.length < 10) {
    return { valid: false, error: 'API key seems too short (minimum 10 characters)' };
  }

  return { valid: true, error: null };
}

/**
 * Validate YAML syntax
 *
 * @param {string} content - YAML content
 * @returns {Object} Validation result { valid: boolean, error: string|null, parsed: Object|null }
 */
function validateYamlSyntax(content) {
  try {
    const parsed = yaml.load(content);
    return { valid: true, error: null, parsed };
  } catch (error) {
    return {
      valid: false,
      error: `YAML syntax error: ${error.message}`,
      parsed: null,
    };
  }
}

/**
 * Validate core-config.yaml structure
 *
 * @param {Object} config - Parsed YAML config
 * @returns {Object} Validation result { valid: boolean, errors: Array<string> }
 */
function validateCoreConfigStructure(config) {
  const errors = [];
  const requiredFields = ['project', 'qa', 'prd', 'architecture'];

  // Check required top-level fields
  requiredFields.forEach(field => {
    if (!config[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  });

  // Validate project section
  if (config.project) {
    if (!config.project.type) {
      errors.push('Missing project.type');
    } else {
      // Accept both lowercase and uppercase project types
      const validTypes = ['GREENFIELD', 'BROWNFIELD', 'EXISTING_AIOX', 'greenfield', 'brownfield', 'existing_aiox'];
      if (!validTypes.includes(config.project.type)) {
        errors.push(`Invalid project.type: ${config.project.type}. Expected greenfield, brownfield, or existing_aiox`);
      }
    }
  }

  // Validate IDE section
  if (config.ide) {
    if (!Array.isArray(config.ide.selected)) {
      errors.push('ide.selected must be an array');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate file path (cross-platform)
 *
 * @param {string} filePath - Path to validate
 * @returns {Object} Validation result { valid: boolean, error: string|null }
 */
function validatePath(filePath) {
  // Check for null/undefined
  if (!filePath) {
    return { valid: false, error: 'Path cannot be empty' };
  }

  // Check for path traversal attempts (before normalization)
  if (filePath.includes('..')) {
    return { valid: false, error: 'Path traversal detected (..)' };
  }

  // Normalize and check again
  const normalized = path.normalize(filePath);
  if (normalized.includes('..')) {
    return { valid: false, error: 'Path traversal detected (..)' };
  }

  // Check for invalid characters (basic check)
  const invalidChars = /[<>"|?*\0]/;
  if (invalidChars.test(filePath)) {
    return { valid: false, error: 'Path contains invalid characters' };
  }

  return { valid: true, error: null };
}

/**
 * Sanitize input to prevent injection
 *
 * @param {string} input - Input to sanitize
 * @returns {string} Sanitized input
 */
function sanitizeInput(input) {
  if (typeof input !== 'string') {
    return '';
  }

  // Remove null bytes
  let sanitized = input.replace(/\0/g, '');

  // Trim whitespace
  sanitized = sanitized.trim();

  // Limit length (prevent DoS)
  const maxLength = 10000;
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  return sanitized;
}

module.exports = {
  validateEnvFormat,
  validateApiKeyFormat,
  validateYamlSyntax,
  validateCoreConfigStructure,
  validatePath,
  sanitizeInput,
};
