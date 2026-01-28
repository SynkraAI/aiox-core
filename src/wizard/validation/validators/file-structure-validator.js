/**
 * File Structure Validator
 * Task 1.8.1: Validates file structure created during installation
 *
 * @module wizard/validation/validators/file-structure-validator
 */

const fs = require('fs');

/**
 * Validate file structure
 *
 * @param {Object} fileContext - File paths to validate
 * @param {Array<string>} fileContext.ideConfigs - IDE config file paths
 * @param {string} fileContext.env - .env file path
 * @param {string} fileContext.coreConfig - core-config.yaml path
 * @param {string} fileContext.mcpConfig - .mcp.json path
 * @returns {Promise<Object>} Validation result
 */
async function validateFiles(fileContext = {}) {
  const results = {
    success: true,
    checks: [],
    errors: [],
    warnings: [],
  };

  try {
    // Validate IDE configs (Story 1.4)
    if (fileContext.ideConfigs && fileContext.ideConfigs.length > 0) {
      for (const configPath of fileContext.ideConfigs) {
        const exists = fs.existsSync(configPath);
        const check = {
          component: 'IDE Config',
          file: configPath,
          status: exists ? 'success' : 'failed',
          message: exists ? 'File created' : 'File missing',
        };

        results.checks.push(check);

        if (!exists) {
          results.success = false;
          results.errors.push({
            severity: 'high',
            message: `IDE config file missing: ${configPath}`,
            file: configPath,
            code: 'FILE_MISSING',
          });
        }
      }
    }

    // Validate .env file (Story 1.6)
    const envPath = fileContext.env || '.env';
    const envExists = fs.existsSync(envPath);
    results.checks.push({
      component: 'Environment',
      file: envPath,
      status: envExists ? 'success' : 'failed',
      message: envExists ? 'Created' : 'Missing',
    });

    if (!envExists) {
      results.success = false;
      results.errors.push({
        severity: 'critical',
        message: '.env file missing - environment configuration incomplete',
        file: envPath,
        code: 'ENV_FILE_MISSING',
      });
    } else {
      // Check .env file permissions (Unix/macOS only)
      if (process.platform !== 'win32') {
        try {
          const stats = fs.statSync(envPath);
          const mode = stats.mode & parseInt('777', 8);
          const expectedMode = parseInt('600', 8);

          if (mode !== expectedMode) {
            results.warnings.push({
              severity: 'medium',
              message: `.env file permissions should be 600 (currently ${mode.toString(8)})`,
              file: envPath,
              code: 'ENV_PERMISSIONS_INSECURE',
              solution: `Run: chmod 600 ${envPath}`,
            });
          }
        } catch {
          // Permission check failed - not critical, ignore error
        }
      }
    }

    // Validate .env.example (Story 1.6)
    const envExamplePath = '.env.example';
    if (fs.existsSync(envExamplePath)) {
      results.checks.push({
        component: 'Environment',
        file: envExamplePath,
        status: 'success',
        message: 'Created',
      });
    }

    // Validate core-config.yaml (Story 1.6)
    const coreConfigPath = fileContext.coreConfig || '.aios-core/core-config.yaml';
    const coreConfigExists = fs.existsSync(coreConfigPath);
    results.checks.push({
      component: 'Core Config',
      file: coreConfigPath,
      status: coreConfigExists ? 'success' : 'failed',
      message: coreConfigExists ? 'Created' : 'Missing',
    });

    if (!coreConfigExists) {
      results.success = false;
      results.errors.push({
        severity: 'high',
        message: 'core-config.yaml missing - framework configuration incomplete',
        file: coreConfigPath,
        code: 'CORE_CONFIG_MISSING',
      });
    }

    // Validate .mcp.json (Story 1.5) - Optional, only check if exists
    const mcpConfigPath = fileContext.mcpConfig || '.mcp.json';
    if (fs.existsSync(mcpConfigPath)) {
      results.checks.push({
        component: 'MCP Config',
        file: mcpConfigPath,
        status: 'success',
        message: 'Created',
      });
    }
    // Note: .mcp.json is optional, no warning if missing

    // Validate directory structure - only .aios-core is required
    const requiredDirs = ['.aios-core'];
    for (const dir of requiredDirs) {
      if (fs.existsSync(dir) && fs.statSync(dir).isDirectory()) {
        results.checks.push({
          component: 'Directory',
          file: dir,
          status: 'success',
          message: 'Exists',
        });
      } else {
        results.errors.push({
          severity: 'high',
          message: `Required directory missing: ${dir}`,
          file: dir,
          code: 'DIRECTORY_MISSING',
        });
      }
    }

    return results;
  } catch (error) {
    results.success = false;
    results.errors.push({
      severity: 'critical',
      message: `File validation failed: ${error.message}`,
      code: 'VALIDATION_ERROR',
      details: error.stack,
    });

    return results;
  }
}

module.exports = {
  validateFiles,
};
