/**
 * Input Validators with Security Best Practices
 * 
 * OWASP-compliant validators for all wizard inputs
 * Protects against: command injection, path traversal, XSS, buffer overflow
 * 
 * @see docs/stories/v4.0.4/sprint-1/story-1.2-interactive-wizard-foundation.md
 * @module wizard/validators
 */

const path = require('path');

/**
 * Maximum input lengths to prevent buffer overflow
 */
const INPUT_LIMITS = {
  projectName: 100,
  path: 255,
  generic: 500,
};

/**
 * Allowed project types (whitelist)
 */
const ALLOWED_PROJECT_TYPES = ['greenfield', 'brownfield'];

/**
 * Shell-special characters that need escaping/rejection
 */
const SHELL_SPECIAL_CHARS = /[;&|$`()\\<>\n]/;

/**
 * Validate project type against whitelist
 * 
 * @param {string} input - User input
 * @returns {boolean|string} True if valid, error message if invalid
 */
function validateProjectType(input) {
  if (!input || typeof input !== 'string') {
    return 'Project type is required';
  }

  const normalized = input.toLowerCase().trim();
  
  if (!ALLOWED_PROJECT_TYPES.includes(normalized)) {
    return `Invalid project type. Must be one of: ${ALLOWED_PROJECT_TYPES.join(', ')}`;
  }

  return true;
}

/**
 * Validate and sanitize path input
 * Prevents path traversal attacks (../../../etc/passwd)
 * 
 * Security policy:
 * - Cross-drive access is DISALLOWED for security (e.g., C:\ vs D:\ on Windows)
 * - Path must resolve within baseDir (no up-level traversal)
 * - Uses path.relative() and root comparison for robust validation across platforms
 * 
 * @param {string} input - Path input
 * @param {string} baseDir - Base directory (default: process.cwd())
 * @returns {boolean|string} True if valid, error message if invalid
 */
function validatePath(input, baseDir = process.cwd()) {
  if (!input || typeof input !== 'string') {
    return 'Path is required';
  }

  // Check length
  if (input.length > INPUT_LIMITS.path) {
    return `Path too long (max ${INPUT_LIMITS.path} characters)`;
  }

  // Reject shell-special characters in paths
  if (SHELL_SPECIAL_CHARS.test(input)) {
    return 'Path contains invalid characters';
  }

  // Resolve and verify path is within base directory
  // Normalize both paths to handle trailing slashes and relative segments
  const normalizedBaseDir = path.resolve(baseDir);
  const resolved = path.resolve(normalizedBaseDir, input);
  
  // On Windows, check for cross-drive access (e.g., C:\ vs D:\)
  // Cross-drive targets are disallowed for security - path must stay within same root
  const baseRoot = path.parse(normalizedBaseDir).root;
  const resolvedRoot = path.parse(resolved).root;
  
  if (baseRoot !== resolvedRoot) {
    return 'Path must be within project directory (cross-drive access not allowed)';
  }
  
  // Use path.relative to detect traversal attempts
  // If resolved is within baseDir, relative path won't start with '..'
  const relativePath = path.relative(normalizedBaseDir, resolved);
  
  // Check for up-level traversal indicators
  // Empty string means paths are identical, which is valid
  if (relativePath && (relativePath.startsWith('..') || relativePath.includes('..'))) {
    return 'Path must be within project directory (path traversal detected)';
  }

  return true;
}

/**
 * Sanitize text input
 * Removes/escapes shell-special characters
 * 
 * @param {string} input - Text input
 * @param {number} maxLength - Maximum length (default: INPUT_LIMITS.generic)
 * @returns {boolean|string} True if valid, error message if invalid
 */
function validateTextInput(input, maxLength = INPUT_LIMITS.generic) {
  if (!input || typeof input !== 'string') {
    return 'Input is required';
  }

  // Trim whitespace
  const trimmed = input.trim();

  // Check length
  if (trimmed.length === 0) {
    return 'Input cannot be empty';
  }

  if (trimmed.length > maxLength) {
    return `Input too long (max ${maxLength} characters)`;
  }

  // Reject shell-special characters
  if (SHELL_SPECIAL_CHARS.test(trimmed)) {
    return 'Input contains invalid characters (shell-special characters not allowed)';
  }

  // Check for potential command injection patterns
  const injectionPatterns = [
    /\$\(/,           // $(command)
    /`[^`]+`/,        // `command`
    /&&/,             // command chaining
    /\|\|/,           // command chaining
    /<script/i,       // XSS-style
    /<img/i,          // XSS-style
  ];

  for (const pattern of injectionPatterns) {
    if (pattern.test(trimmed)) {
      return 'Input contains potentially malicious patterns';
    }
  }

  return true;
}

/**
 * Validate project name
 * Stricter than generic text - only alphanumeric, dash, underscore
 * 
 * @param {string} input - Project name
 * @returns {boolean|string} True if valid, error message if invalid
 */
function validateProjectName(input) {
  if (!input || typeof input !== 'string') {
    return 'Project name is required';
  }

  const trimmed = input.trim();

  // Check length
  if (trimmed.length === 0) {
    return 'Project name cannot be empty';
  }

  if (trimmed.length > INPUT_LIMITS.projectName) {
    return `Project name too long (max ${INPUT_LIMITS.projectName} characters)`;
  }

  // Only allow alphanumeric, dash, underscore
  if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
    return 'Project name can only contain letters, numbers, dashes, and underscores';
  }

  // Must start with letter or number
  if (!/^[a-zA-Z0-9]/.test(trimmed)) {
    return 'Project name must start with a letter or number';
  }

  return true;
}

/**
 * Create inquirer-compatible validator function
 * Converts validator return to inquirer format
 * 
 * @param {Function} validatorFn - Validator function
 * @returns {Function} Inquirer-compatible validator
 */
function createInquirerValidator(validatorFn) {
  return (input) => {
    const result = validatorFn(input);
    return result === true ? true : result;
  };
}

/**
 * Sanitize string by escaping shell-special characters
 * Use ONLY if you absolutely need to preserve special chars
 * Prefer validation/rejection instead
 * 
 * @param {string} input - String to sanitize
 * @returns {string} Sanitized string
 */
function sanitizeShellInput(input) {
  if (typeof input !== 'string') {
    return '';
  }

  // Escape shell-special characters
  const sanitized = input
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/`/g, '\\`')
    .replace(/\$/g, '\\$')
    .replace(/;/g, '\\;')
    .replace(/&/g, '\\&')
    .replace(/\|/g, '\\|')
    .replace(/</g, '\\<')
    .replace(/>/g, '\\>')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/\n/g, '\\n');
  
  return sanitized;
}

/**
 * Validate list selection (for IDE, MCP, etc.)
 * 
 * @param {string} input - Selected value
 * @param {string[]} allowedValues - Whitelist of allowed values
 * @returns {boolean|string} True if valid, error message if invalid
 */
function validateListSelection(input, allowedValues) {
  if (!input || typeof input !== 'string') {
    return 'Selection is required';
  }

  if (!allowedValues.includes(input)) {
    return `Invalid selection. Must be one of: ${allowedValues.join(', ')}`;
  }

  return true;
}

module.exports = {
  // Core validators
  validateProjectType,
  validatePath,
  validateTextInput,
  validateProjectName,
  validateListSelection,
  
  // Utility functions
  createInquirerValidator,
  sanitizeShellInput,
  
  // Constants (export for testing)
  INPUT_LIMITS,
  ALLOWED_PROJECT_TYPES,
  SHELL_SPECIAL_CHARS,
};

