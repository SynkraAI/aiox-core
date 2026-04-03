/**
 * @module env-validator
 * @description Story 6.5 -- Environment validation at startup.
 * Checks API keys, directory access, and .env permissions.
 */

import fs from 'node:fs';
import path from 'node:path';

/**
 * @typedef {Object} ValidationResult
 * @property {boolean} valid
 * @property {string[]} errors - Fatal issues (pipeline cannot start)
 * @property {string[]} warnings - Non-fatal issues
 */

/**
 * Validate environment variables and configuration.
 * @param {Object} [options={}]
 * @param {string} [options.envPath] - Path to .env file
 * @param {Object} [options.env] - Environment object (defaults to process.env)
 * @returns {ValidationResult}
 */
export function validateEnv(options = {}) {
  const env = options.env || process.env;
  const errors = [];
  const warnings = [];

  // 1. At least one LLM API key must be present
  const llmKeys = ['DEEPSEEK_API_KEY', 'ANTHROPIC_API_KEY', 'OPENAI_API_KEY'];
  const hasLlmKey = llmKeys.some(key => env[key] && env[key].trim().length > 0);

  if (!hasLlmKey) {
    errors.push(`No LLM API key found. Set one of: ${llmKeys.join(', ')}`);
  }

  // 2. Validate API key formats (if present)
  if (env.DEEPSEEK_API_KEY) {
    const key = env.DEEPSEEK_API_KEY.trim();
    if (key.length < 20) {
      errors.push('DEEPSEEK_API_KEY appears too short (expected 20+ characters)');
    }
    if (key.startsWith('sk-') && key.length < 30) {
      warnings.push('DEEPSEEK_API_KEY looks unusually short for an sk- prefixed key');
    }
  }

  if (env.ANTHROPIC_API_KEY) {
    const key = env.ANTHROPIC_API_KEY.trim();
    if (!key.startsWith('sk-ant-')) {
      warnings.push('ANTHROPIC_API_KEY does not start with "sk-ant-" (expected format)');
    }
  }

  if (env.OPENAI_API_KEY) {
    const key = env.OPENAI_API_KEY.trim();
    if (!key.startsWith('sk-')) {
      warnings.push('OPENAI_API_KEY does not start with "sk-" (expected format)');
    }
  }

  // 3. GITHUB_TOKEN format (if present)
  if (env.GITHUB_TOKEN) {
    const token = env.GITHUB_TOKEN.trim();
    if (token.length < 10) {
      warnings.push('GITHUB_TOKEN appears too short');
    }
    // GitHub tokens start with ghp_, gho_, ghs_, ghr_, or github_pat_
    const validPrefixes = ['ghp_', 'gho_', 'ghs_', 'ghr_', 'github_pat_'];
    if (!validPrefixes.some(p => token.startsWith(p))) {
      warnings.push('GITHUB_TOKEN does not match expected GitHub token format');
    }
  }

  // 4. TELEGRAM_BOT_TOKEN format (if present)
  if (env.TELEGRAM_BOT_TOKEN) {
    const token = env.TELEGRAM_BOT_TOKEN.trim();
    // Format: <bot_id>:<alphanumeric>
    if (!/^\d+:[A-Za-z0-9_-]+$/.test(token)) {
      warnings.push('TELEGRAM_BOT_TOKEN does not match expected format (number:alphanumeric)');
    }
  }

  // 5. JARVIS_KB_ROOT directory check (if set)
  if (env.JARVIS_KB_ROOT) {
    const kbRoot = env.JARVIS_KB_ROOT;
    if (!fs.existsSync(kbRoot)) {
      warnings.push(`JARVIS_KB_ROOT directory does not exist: ${kbRoot}`);
    } else {
      try {
        fs.accessSync(kbRoot, fs.constants.W_OK);
      } catch {
        errors.push(`JARVIS_KB_ROOT is not writable: ${kbRoot}`);
      }
    }
  }

  // 6. Check .env file permissions (Linux/Mac only)
  if (options.envPath && process.platform !== 'win32') {
    try {
      const stat = fs.statSync(options.envPath);
      const mode = stat.mode & 0o777;
      // Check if world-readable (others have read permission)
      if (mode & 0o004) {
        warnings.push(`.env file is world-readable (mode ${mode.toString(8)}). Consider: chmod 600 .env`);
      }
    } catch {
      // File doesn't exist or can't stat -- not an error here
    }
  }

  // 7. Check for empty API key values (set but empty)
  for (const key of llmKeys) {
    if (env[key] !== undefined && env[key].trim() === '') {
      warnings.push(`${key} is set but empty`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate environment and exit if invalid.
 * For use in CLI startup.
 * @param {Object} [options={}]
 */
export function validateEnvOrExit(options = {}) {
  const result = validateEnv(options);

  for (const warning of result.warnings) {
    console.warn(`[HYDRA] WARNING: ${warning}`);
  }

  if (!result.valid) {
    console.error('[HYDRA] Environment validation failed:');
    for (const error of result.errors) {
      console.error(`  - ${error}`);
    }
    console.error('\nFix the errors above and try again.');
    process.exit(1);
  }
}
