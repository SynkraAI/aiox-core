/**
 * @fileoverview Base AI Provider Class
 *
 * Abstract base class for AI CLI providers (Claude Code, Gemini CLI, etc.).
 * Defines the common interface for executing prompts and managing AI interactions.
 *
 * @see Epic GEMINI-INT - Story 2: AI Provider Factory Pattern
 */

/**
 * Base class for AI providers
 *
 * @abstract
 * @class AIProvider
 */
class AIProvider {
  /**
   * Create an AI provider
   * @param {Object} config - Provider configuration
   * @param {string} config.name - Provider name
   * @param {string} config.command - CLI command to execute
   * @param {number} [config.timeout=300000] - Execution timeout in ms (default: 5 min)
   * @param {number} [config.maxRetries=3] - Maximum retry attempts
   * @param {Object} [config.options={}] - Additional provider-specific options
   */
  constructor(config) {
    if (new.target === AIProvider) {
      throw new Error('AIProvider is an abstract class and cannot be instantiated directly');
    }

    this.name = config.name;
    this.command = config.command;
    this.timeout = config.timeout || 300000; // 5 minutes default
    this.maxRetries = config.maxRetries || 3;
    this.options = config.options || {};

    // Provider state
    this.isAvailable = null;
    this.version = null;
    this.lastError = null;
  }

  /**
   * Check if the provider CLI is available
   * @returns {Promise<boolean>} True if provider is available
   * @abstract
   */
  async checkAvailability() {
    throw new Error('checkAvailability() must be implemented by subclass');
  }

  /**
   * Execute a prompt and return the response
   * @param {string} prompt - The prompt to send to the AI
   * @param {Object} [options={}] - Execution options
   * @param {string} [options.workingDir] - Working directory for execution
   * @param {Object} [options.env] - Additional environment variables
   * @param {number} [options.timeout] - Override default timeout
   * @param {boolean} [options.jsonOutput=false] - Request JSON formatted output
   * @returns {Promise<AIResponse>} The AI response
   * @abstract
   */
  async execute(prompt, _options = {}) {
    throw new Error('execute() must be implemented by subclass');
  }

  /**
   * Execute with automatic retry logic
   * @param {string} prompt - The prompt to send
   * @param {Object} [options={}] - Execution options
   * @returns {Promise<AIResponse>} The AI response
   */
  async executeWithRetry(prompt, options = {}) {
    let lastError = null;
    const maxRetries = options.maxRetries || this.maxRetries;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.execute(prompt, options);
      } catch (error) {
        lastError = error;
        this.lastError = error;

        if (attempt < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000); // Exponential backoff, max 10s
          console.warn(
            `[${this.name}] Attempt ${attempt}/${maxRetries} failed: ${error.message}. Retrying in ${delay}ms...`,
          );
          await this._sleep(delay);
        }
      }
    }

    throw new Error(`[${this.name}] All ${maxRetries} attempts failed. Last error: ${lastError.message}`);
  }

  /**
   * Get provider information
   * @returns {Object} Provider info
   */
  getInfo() {
    return {
      name: this.name,
      command: this.command,
      version: this.version,
      isAvailable: this.isAvailable,
      timeout: this.timeout,
      maxRetries: this.maxRetries,
    };
  }

  /**
   * Sleep for specified milliseconds
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise<void>}
   * @protected
   */
  _sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Escape a string for shell execution
   * @param {string} str - String to escape
   * @returns {string} Escaped string
   * @protected
   */
  _escapeShell(str) {
    return str.replace(/'/g, "'\\''");
  }
}

/**
 * Standard response structure from AI providers
 * @typedef {Object} AIResponse
 * @property {boolean} success - Whether execution succeeded
 * @property {string} output - The AI response text
 * @property {string} [error] - Error message if failed
 * @property {Object} [metadata] - Additional metadata
 * @property {number} [metadata.duration] - Execution duration in ms
 * @property {number} [metadata.tokens] - Token count (if available)
 * @property {string} [metadata.model] - Model used (if available)
 */

module.exports = { AIProvider };
