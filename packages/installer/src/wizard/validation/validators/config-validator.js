/**
 * Configuration Validator
 * Task 1.8.2: Validates .env, core-config.yaml, and .mcp.json
 *
 * @module wizard/validation/validators/config-validator
 */

const fs = require('fs');
const yaml = require('js-yaml');

/**
 * Validate configurations
 *
 * @param {Object} configContext - Configuration context
 * @param {Object} configContext.env - Environment config result
 * @param {Object} configContext.mcps - MCP installation result
 * @param {string} configContext.coreConfig - Path to core-config.yaml
 * @returns {Promise<Object>} Validation result
 */
async function validateConfigs(configContext = {}) {
  const results = {
    success: true,
    checks: [],
    errors: [],
    warnings: [],
  };

  try {
    // Validate .env file format and content (Story 1.6)
    await validateEnvFile(results);

    // Validate core-config.yaml YAML syntax (Story 1.6)
    await validateCoreConfig(results, configContext.coreConfig);

    // Validate .mcp.json schema compliance (Story 1.5)
    await validateMCPConfig(results);

    // Validate .gitignore entries (security)
    await validateGitignore(results);

    return results;
  } catch (error) {
    results.success = false;
    results.errors.push({
      severity: 'critical',
      message: `Configuration validation failed: ${error.message}`,
      code: 'CONFIG_VALIDATION_ERROR',
      details: error.stack,
    });

    return results;
  }
}

/**
 * Validate .env file
 * @private
 */
async function validateEnvFile(results) {
  const envPath = '.env';

  if (!fs.existsSync(envPath)) {
    results.success = false;
    results.errors.push({
      severity: 'critical',
      message: '.env file not found',
      file: envPath,
      code: 'ENV_FILE_MISSING',
    });
    return;
  }

  try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    const validLines = lines.filter(line => {
      const trimmed = line.trim();
      return trimmed && !trimmed.startsWith('#');
    });

    // Check for required variables (basic validation)
    const requiredVars = ['NODE_ENV'];
    const envVars = {};

    validLines.forEach(line => {
      const match = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
      if (match) {
        envVars[match[1]] = match[2];
      }
    });

    for (const varName of requiredVars) {
      if (!envVars[varName]) {
        results.warnings.push({
          severity: 'low',
          message: `Recommended environment variable missing: ${varName}`,
          file: envPath,
          code: 'ENV_VAR_MISSING',
        });
      }
    }

    // Security check: Verify no hardcoded sensitive data in comments
    const sensitivePattern = /(password|secret|key|token).*=.*[^${]/i;
    lines.forEach((line, index) => {
      if (sensitivePattern.test(line) && !line.trim().startsWith('#')) {
        results.warnings.push({
          severity: 'medium',
          message: `Possible hardcoded credential on line ${index + 1}`,
          file: envPath,
          line: index + 1,
          code: 'POTENTIAL_HARDCODED_CREDENTIAL',
        });
      }
    });

    results.checks.push({
      component: 'Environment Config',
      file: envPath,
      status: 'success',
      message: `Validated (${validLines.length} variables)`,
    });
  } catch (error) {
    results.errors.push({
      severity: 'high',
      message: `.env file validation failed: ${error.message}`,
      file: envPath,
      code: 'ENV_VALIDATION_ERROR',
    });
    results.success = false;
  }
}

/**
 * Validate core-config.yaml
 * @private
 */
async function validateCoreConfig(results, configPath = '.aiox-core/core-config.yaml') {
  if (!fs.existsSync(configPath)) {
    results.warnings.push({
      severity: 'medium',
      message: 'core-config.yaml not found',
      file: configPath,
      code: 'CORE_CONFIG_MISSING',
    });
    return;
  }

  try {
    const yamlContent = fs.readFileSync(configPath, 'utf8');
    const parsed = yaml.load(yamlContent);

    if (!parsed || typeof parsed !== 'object') {
      results.errors.push({
        severity: 'high',
        message: 'core-config.yaml is empty or invalid',
        file: configPath,
        code: 'CORE_CONFIG_INVALID',
      });
      results.success = false;
      return;
    }

    // Basic schema validation
    const requiredKeys = ['markdownExploder', 'qa', 'prd', 'architecture'];
    const missingKeys = requiredKeys.filter(key => !(key in parsed));

    if (missingKeys.length > 0) {
      results.warnings.push({
        severity: 'low',
        message: `core-config.yaml missing recommended keys: ${missingKeys.join(', ')}`,
        file: configPath,
        code: 'CORE_CONFIG_INCOMPLETE',
      });
    }

    results.checks.push({
      component: 'Core Config',
      file: configPath,
      status: 'success',
      message: 'Valid YAML syntax',
    });
  } catch (error) {
    results.errors.push({
      severity: 'high',
      message: `core-config.yaml parsing failed: ${error.message}`,
      file: configPath,
      code: 'CORE_CONFIG_PARSE_ERROR',
    });
    results.success = false;
  }
}

/**
 * Validate .mcp.json
 * @private
 */
async function validateMCPConfig(results) {
  const mcpConfigPath = '.mcp.json';

  if (!fs.existsSync(mcpConfigPath)) {
    // MCP config is optional
    results.checks.push({
      component: 'MCP Config',
      file: mcpConfigPath,
      status: 'skipped',
      message: 'Not installed (optional)',
    });
    return;
  }

  try {
    const mcpContent = fs.readFileSync(mcpConfigPath, 'utf8');
    const parsed = JSON.parse(mcpContent);

    if (!parsed.mcpServers || typeof parsed.mcpServers !== 'object') {
      results.errors.push({
        severity: 'medium',
        message: '.mcp.json missing mcpServers key',
        file: mcpConfigPath,
        code: 'MCP_CONFIG_INVALID_SCHEMA',
      });
      return;
    }

    const mcpCount = Object.keys(parsed.mcpServers).length;
    results.checks.push({
      component: 'MCP Config',
      file: mcpConfigPath,
      status: 'success',
      message: `Valid schema (${mcpCount} MCP${mcpCount !== 1 ? 's' : ''})`,
    });
  } catch (error) {
    if (error instanceof SyntaxError) {
      results.errors.push({
        severity: 'high',
        message: `.mcp.json has invalid JSON syntax: ${error.message}`,
        file: mcpConfigPath,
        code: 'MCP_CONFIG_PARSE_ERROR',
      });
      results.success = false;
    } else {
      results.warnings.push({
        severity: 'medium',
        message: `.mcp.json validation failed: ${error.message}`,
        file: mcpConfigPath,
      });
    }
  }
}

/**
 * Check if a gitignore entry exists (handles variations like node_modules, node_modules/, /node_modules)
 * @private
 * @param {string[]} lines - gitignore lines
 * @param {string} entry - entry to check
 * @returns {boolean}
 */
function hasGitignoreEntry(lines, entry) {
  // Normalize the entry to check (remove leading/trailing slashes)
  const normalizedEntry = entry.replace(/^\//, '').replace(/\/$/, '');

  return lines.some(line => {
    const normalizedLine = line.replace(/^\//, '').replace(/\/$/, '');
    // Check exact match or variations
    return normalizedLine === normalizedEntry ||
           normalizedLine === entry ||
           line === entry ||
           line === `/${entry}` ||
           line === `${entry}/`;
  });
}

/**
 * Validate .gitignore entries
 * @private
 */
async function validateGitignore(results) {
  const gitignorePath = '.gitignore';

  if (!fs.existsSync(gitignorePath)) {
    results.warnings.push({
      severity: 'medium',
      message: '.gitignore not found - sensitive files may be committed',
      file: gitignorePath,
      code: 'GITIGNORE_MISSING',
    });
    return;
  }

  try {
    const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
    const lines = gitignoreContent.split('\n').map(l => l.trim());

    // Critical entries - .env is always critical, node_modules is critical but has variations
    const criticalEntries = ['.env'];
    const recommendedEntries = ['.env.local', '*.key', '*.pem', '.aiox/install-log.txt'];

    // Check critical entries
    for (const entry of criticalEntries) {
      if (!hasGitignoreEntry(lines, entry)) {
        results.errors.push({
          severity: 'high',
          message: `.gitignore missing critical entry: ${entry}`,
          file: gitignorePath,
          code: 'GITIGNORE_CRITICAL_MISSING',
          solution: `Add "${entry}" to .gitignore`,
        });
        results.success = false;
      }
    }

    // Check node_modules - it's critical but accepts variations
    if (!hasGitignoreEntry(lines, 'node_modules')) {
      results.errors.push({
        severity: 'high',
        message: '.gitignore missing critical entry: node_modules',
        file: gitignorePath,
        code: 'GITIGNORE_CRITICAL_MISSING',
        solution: 'Add "node_modules" or "node_modules/" to .gitignore',
      });
      results.success = false;
    }

    // Check recommended entries
    for (const entry of recommendedEntries) {
      const hasEntry = lines.some(line => {
        if (entry.includes('*')) {
          const pattern = entry.replace(/\*/g, '.*');
          return new RegExp(`^${pattern}$`).test(line);
        }
        return hasGitignoreEntry(lines, entry);
      });

      if (!hasEntry) {
        results.warnings.push({
          severity: 'low',
          message: `.gitignore missing recommended entry: ${entry}`,
          file: gitignorePath,
          code: 'GITIGNORE_RECOMMENDED_MISSING',
        });
      }
    }

    results.checks.push({
      component: 'Git Ignore',
      file: gitignorePath,
      status: 'success',
      message: 'Validated',
    });
  } catch (error) {
    results.warnings.push({
      severity: 'medium',
      message: `.gitignore validation failed: ${error.message}`,
      file: gitignorePath,
    });
  }
}

module.exports = {
  validateConfigs,
};
