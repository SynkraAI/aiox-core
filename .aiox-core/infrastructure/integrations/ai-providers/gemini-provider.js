/**
 * @fileoverview Gemini CLI Provider
 *
 * AI Provider implementation for Google's Gemini CLI.
 * Wraps the `gemini` CLI command for prompt execution.
 * Supports JSON output mode for structured responses.
 *
 * @see Epic GEMINI-INT - Story 2: AI Provider Factory Pattern
 * @see Epic GEMINI-INT - Story 4: JSON Output Integration
 */

const { spawn, execSync } = require('child_process');
const { AIProvider } = require('./ai-provider');

/**
 * Gemini CLI provider implementation
 *
 * @class GeminiProvider
 * @extends AIProvider
 */
class GeminiProvider extends AIProvider {
  /**
   * Create a Gemini provider
   * @param {Object} [config={}] - Provider configuration
   * @param {string} [config.model='gemini-2.0-flash'] - Model to use (gemini-2.0-flash or gemini-2.0-pro)
   * @param {number} [config.timeout=300000] - Execution timeout
   * @param {boolean} [config.previewFeatures=true] - Enable preview features for Gemini 3
   * @param {boolean} [config.jsonOutput=false] - Use JSON output format by default
   */
  constructor(config = {}) {
    super({
      name: 'gemini',
      command: 'gemini',
      timeout: config.timeout || 300000,
      maxRetries: config.maxRetries || 3,
      options: {
        model: config.model || 'gemini-2.0-flash',
        previewFeatures: config.previewFeatures !== false, // Default true
        jsonOutput: config.jsonOutput || false,
        ...config,
      },
    });
  }

  /**
   * Check if Gemini CLI is available
   * @returns {Promise<boolean>} True if available
   */
  async checkAvailability() {
    try {
      const version = execSync('gemini --version', {
        encoding: 'utf8',
        timeout: 5000,
        windowsHide: true,
      }).trim();

      this.isAvailable = true;
      this.version = version;

      // Check authentication
      try {
        const authStatus = execSync('gemini auth status 2>&1', {
          encoding: 'utf8',
          timeout: 5000,
          windowsHide: true,
        });
        this.isAuthenticated = !authStatus.toLowerCase().includes('not authenticated');
      } catch {
        this.isAuthenticated = false;
      }

      return true;
    } catch (error) {
      this.isAvailable = false;
      this.lastError = error;
      return false;
    }
  }

  /**
   * Execute a prompt using Gemini CLI
   * @param {string} prompt - The prompt to send
   * @param {Object} [options={}] - Execution options
   * @param {boolean} [options.jsonOutput] - Use JSON output format
   * @param {string} [options.model] - Override model
   * @returns {Promise<AIResponse>} The AI response
   */
  async execute(prompt, options = {}) {
    const startTime = Date.now();
    const workingDir = options.workingDir || process.cwd();
    const timeout = options.timeout || this.timeout;
    const useJsonOutput = options.jsonOutput ?? this.options.jsonOutput;

    // Build command arguments (without prompt - will use stdin)
    const args = [];

    // JSON output mode for programmatic integration
    if (useJsonOutput) {
      args.push('--output-format', 'json');
    }

    // Model selection (if specified)
    if (options.model || this.options.model) {
      args.push('--model', options.model || this.options.model);
    }

    return new Promise((resolve, reject) => {
      let stdout = '';
      let stderr = '';

      // Spawn gemini directly without shell interpolation (safer)
      const child = spawn(this.command, args, {
        cwd: workingDir,
        env: { ...process.env, ...options.env },
        windowsHide: true,
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      // Write prompt via stdin to avoid shell injection
      child.stdin.write(prompt);
      child.stdin.end();

      const timeoutId = setTimeout(() => {
        child.kill('SIGTERM');
        reject(new Error(`Gemini execution timed out after ${timeout}ms`));
      }, timeout);

      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        clearTimeout(timeoutId);
        const duration = Date.now() - startTime;

        if (code === 0) {
          // Parse JSON output if requested
          if (useJsonOutput) {
            try {
              const parsed = JSON.parse(stdout);
              resolve({
                success: true,
                output: parsed.response || parsed.text || stdout,
                data: parsed,
                metadata: {
                  duration,
                  provider: 'gemini',
                  model: options.model || this.options.model,
                  stats: parsed.stats,
                },
              });
            } catch (parseError) {
              // JSON parsing failed, return raw output
              resolve({
                success: true,
                output: stdout.trim(),
                metadata: {
                  duration,
                  provider: 'gemini',
                  model: options.model || this.options.model,
                  jsonParseError: parseError.message,
                },
              });
            }
          } else {
            resolve({
              success: true,
              output: stdout.trim(),
              metadata: {
                duration,
                provider: 'gemini',
                model: options.model || this.options.model,
              },
            });
          }
        } else {
          reject(new Error(`Gemini exited with code ${code}: ${stderr || stdout}`));
        }
      });

      child.on('error', (error) => {
        clearTimeout(timeoutId);
        reject(new Error(`Gemini spawn error: ${error.message}`));
      });
    });
  }

  /**
   * Execute with JSON output mode
   * @param {string} prompt - The prompt to send
   * @param {Object} [options={}] - Execution options
   * @returns {Promise<AIResponse>} Response with parsed data
   */
  async executeJson(prompt, options = {}) {
    return this.execute(prompt, { ...options, jsonOutput: true });
  }

  /**
   * Execute with a specific model (convenience method)
   * @param {string} prompt - The prompt to send
   * @param {'flash'|'pro'} modelType - Model type shorthand
   * @param {Object} [options={}] - Execution options
   * @returns {Promise<AIResponse>} The AI response
   */
  async executeWithModel(prompt, modelType, options = {}) {
    const modelMap = {
      flash: 'gemini-2.0-flash',
      pro: 'gemini-2.0-pro',
    };

    return this.execute(prompt, {
      ...options,
      model: modelMap[modelType] || modelType,
    });
  }

  /**
   * Execute and parse structured JSON response (Story 4)
   * Handles various JSON response formats from Gemini
   * @param {string} prompt - The prompt to send
   * @param {Object} [options={}] - Execution options
   * @returns {Promise<Object>} Parsed JSON data
   */
  async executeStructured(prompt, options = {}) {
    const response = await this.executeJson(prompt, options);

    if (!response.success) {
      throw new Error(response.error || 'Execution failed');
    }

    // If already parsed by executeJson
    if (response.data) {
      return response.data;
    }

    // Try to extract JSON from output
    return this.parseJsonFromOutput(response.output);
  }

  /**
   * Parse JSON from potentially mixed output (Story 4)
   * @param {string} output - Raw output that may contain JSON
   * @returns {Object} Parsed JSON object
   */
  parseJsonFromOutput(output) {
    if (!output) {
      throw new Error('Empty output');
    }

    // Try direct parse first
    try {
      return JSON.parse(output);
    } catch {
      // Continue with extraction
    }

    // Try to find JSON object
    const objectMatch = output.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      try {
        return JSON.parse(objectMatch[0]);
      } catch {
        // Continue
      }
    }

    // Try to find JSON array
    const arrayMatch = output.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      try {
        return JSON.parse(arrayMatch[0]);
      } catch {
        // Continue
      }
    }

    // Try to find JSON in code blocks
    const codeBlockMatch = output.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
      try {
        return JSON.parse(codeBlockMatch[1].trim());
      } catch {
        // Continue
      }
    }

    throw new Error('No valid JSON found in output');
  }

  /**
   * Execute with schema validation (Story 4)
   * @param {string} prompt - The prompt to send
   * @param {Object} schema - Expected schema (simple field validation)
   * @param {Object} [options={}] - Execution options
   * @returns {Promise<Object>} Validated JSON data
   */
  async executeWithSchema(prompt, schema, options = {}) {
    const data = await this.executeStructured(prompt, options);

    // Simple schema validation
    const errors = this.validateSchema(data, schema);

    if (errors.length > 0) {
      throw new Error(`Schema validation failed: ${errors.join(', ')}`);
    }

    return data;
  }

  /**
   * Simple schema validation (Story 4)
   * @param {Object} data - Data to validate
   * @param {Object} schema - Schema with required fields
   * @returns {Array<string>} Validation errors
   */
  validateSchema(data, schema) {
    const errors = [];

    if (!schema || typeof schema !== 'object') {
      return errors;
    }

    // Check required fields
    if (schema.required && Array.isArray(schema.required)) {
      for (const field of schema.required) {
        if (!(field in data)) {
          errors.push(`Missing required field: ${field}`);
        }
      }
    }

    // Check field types
    if (schema.properties && typeof schema.properties === 'object') {
      for (const [field, spec] of Object.entries(schema.properties)) {
        if (field in data && spec.type) {
          const actualType = Array.isArray(data[field]) ? 'array' : typeof data[field];
          if (actualType !== spec.type) {
            errors.push(`Field ${field} should be ${spec.type}, got ${actualType}`);
          }
        }
      }
    }

    return errors;
  }

  /**
   * Get provider info including Gemini-specific details
   * @returns {Object} Provider info
   */
  getInfo() {
    return {
      ...super.getInfo(),
      isAuthenticated: this.isAuthenticated,
      previewFeatures: this.options.previewFeatures,
      defaultModel: this.options.model,
    };
  }
}

module.exports = { GeminiProvider };
