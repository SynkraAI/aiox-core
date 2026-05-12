/**
 * @fileoverview Claude Code Provider
 *
 * AI Provider implementation for Anthropic's Claude Code CLI.
 * Wraps the `claude` CLI command for prompt execution.
 *
 * @see Epic GEMINI-INT - Story 2: AI Provider Factory Pattern
 */

const { spawn, execSync } = require('child_process');
const { AIProvider } = require('./ai-provider');

/**
 * Claude Code provider implementation
 *
 * @class ClaudeProvider
 * @extends AIProvider
 */
class ClaudeProvider extends AIProvider {
  /**
   * Create a Claude provider
   * @param {Object} [config={}] - Provider configuration
   * @param {string} [config.model='claude-3-5-sonnet'] - Model to use
   * @param {number} [config.timeout=300000] - Execution timeout
   * @param {boolean} [config.dangerouslySkipPermissions=false] - Skip permission prompts
   */
  constructor(config = {}) {
    super({
      name: 'claude',
      command: 'claude',
      timeout: config.timeout || 300000,
      maxRetries: config.maxRetries || 3,
      options: {
        model: config.model || 'claude-3-5-sonnet',
        dangerouslySkipPermissions: config.dangerouslySkipPermissions || false,
        ...config,
      },
    });
  }

  /**
   * Check if Claude CLI is available
   * @returns {Promise<boolean>} True if available
   */
  async checkAvailability() {
    try {
      const version = execSync('claude --version', {
        encoding: 'utf8',
        timeout: 5000,
        windowsHide: true,
      }).trim();

      this.isAvailable = true;
      this.version = version;
      return true;
    } catch (error) {
      this.isAvailable = false;
      this.lastError = error;
      return false;
    }
  }

  /**
   * Execute a prompt using Claude CLI
   * @param {string} prompt - The prompt to send
   * @param {Object} [options={}] - Execution options
   * @returns {Promise<AIResponse>} The AI response
   */
  async execute(prompt, options = {}) {
    const startTime = Date.now();
    const workingDir = options.workingDir || process.cwd();
    const timeout = options.timeout || this.timeout;

    // Build command arguments
    const args = ['--print'];

    if (this.options.dangerouslySkipPermissions || options.dangerouslySkipPermissions) {
      args.push('--dangerously-skip-permissions');
    }

    if (options.model || this.options.model) {
      args.push('--model', options.model || this.options.model);
    }

    return new Promise((resolve, reject) => {
      let stdout = '';
      let stderr = '';

      // Spawn claude directly without shell interpolation (safer)
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
        reject(new Error(`Claude execution timed out after ${timeout}ms`));
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
          resolve({
            success: true,
            output: stdout.trim(),
            metadata: {
              duration,
              provider: 'claude',
              model: options.model || this.options.model,
            },
          });
        } else {
          reject(new Error(`Claude exited with code ${code}: ${stderr || stdout}`));
        }
      });

      child.on('error', (error) => {
        clearTimeout(timeoutId);
        reject(new Error(`Claude spawn error: ${error.message}`));
      });
    });
  }

  /**
   * Execute with JSON output parsing
   * @param {string} prompt - The prompt to send
   * @param {Object} [options={}] - Execution options
   * @returns {Promise<Object>} Parsed JSON response
   */
  async executeJson(prompt, options = {}) {
    const jsonPrompt = `${prompt}\n\nRespond with valid JSON only, no markdown or explanation.`;
    const response = await this.execute(jsonPrompt, options);

    try {
      // Try to extract JSON from response
      const jsonMatch = response.output.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      if (jsonMatch) {
        return {
          ...response,
          data: JSON.parse(jsonMatch[0]),
        };
      }
      throw new Error('No valid JSON found in response');
    } catch (parseError) {
      return {
        ...response,
        success: false,
        error: `JSON parse error: ${parseError.message}`,
      };
    }
  }
}

module.exports = { ClaudeProvider };
