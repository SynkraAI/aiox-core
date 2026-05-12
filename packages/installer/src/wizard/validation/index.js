/**
 * AIOX Installation Validation Module
 * Story 1.8: Installation Validation
 *
 * Validates installation and provides comprehensive reporting
 *
 * @module wizard/validation
 * @version 1.0.0
 */

const { validateFiles } = require('./validators/file-structure-validator');
const { validateConfigs } = require('./validators/config-validator');
const { validateMCPs } = require('./validators/mcp-health-checker');
const { validateDependencies } = require('./validators/dependency-validator');
const { generateReport } = require('./report-generator');
const { offerTroubleshooting } = require('./troubleshooting-system');

/**
 * Main validation function
 *
 * @param {Object} installationContext - Installation context from wizard
 * @param {Object} installationContext.files - File paths to validate
 * @param {Object} installationContext.configs - Configuration objects
 * @param {Object} installationContext.mcps - MCP installation results
 * @param {Object} installationContext.dependencies - Dependency installation results
 * @param {Function} onProgress - Progress callback (optional)
 * @returns {Promise<Object>} Validation report
 */
async function validateInstallation(installationContext, onProgress = () => {}) {
  const validationResults = {
    timestamp: new Date().toISOString(),
    components: {},
    errors: [],
    warnings: [],
    overallStatus: 'unknown',
  };

  try {
    // Phase 1: File Structure Validation (Task 1.8.1)
    onProgress({ step: 'files', message: 'Validating file structure...', progress: 0 });
    validationResults.components.files = await validateFiles(installationContext.files);

    // Phase 2: Configuration Validation (Task 1.8.2)
    onProgress({ step: 'configs', message: 'Validating configurations...', progress: 25 });
    validationResults.components.configs = await validateConfigs(installationContext.configs);

    // Phase 3: MCP Health Checks (Task 1.8.3)
    if (installationContext.mcps) {
      onProgress({ step: 'mcps', message: 'Running MCP health checks...', progress: 50 });
      validationResults.components.mcps = await validateMCPs(installationContext.mcps);
    }

    // Phase 4: Dependency Validation (Task 1.8.4)
    onProgress({ step: 'dependencies', message: 'Validating dependencies...', progress: 75 });
    validationResults.components.dependencies = await validateDependencies(
      installationContext.dependencies,
    );

    // Aggregate errors and warnings
    for (const [component, result] of Object.entries(validationResults.components)) {
      if (result.errors) {
        validationResults.errors.push(...result.errors.map(e => ({ component, ...e })));
      }
      if (result.warnings) {
        validationResults.warnings.push(...result.warnings.map(w => ({ component, ...w })));
      }
    }

    // Determine overall status
    const criticalErrors = validationResults.errors.filter(e => e.severity === 'critical');
    if (criticalErrors.length > 0) {
      validationResults.overallStatus = 'failed';
    } else if (validationResults.errors.length > 0) {
      validationResults.overallStatus = 'partial';
    } else if (validationResults.warnings.length > 0) {
      validationResults.overallStatus = 'warning';
    } else {
      validationResults.overallStatus = 'success';
    }

    onProgress({ step: 'complete', message: 'Validation complete', progress: 100 });

    return validationResults;
  } catch (error) {
    validationResults.overallStatus = 'error';
    validationResults.errors.push({
      component: 'validation',
      severity: 'critical',
      message: `Validation failed: ${error.message}`,
      details: error.stack,
    });

    return validationResults;
  }
}

/**
 * Display validation report to user
 *
 * @param {Object} validationResults - Results from validateInstallation
 */
async function displayValidationReport(validationResults) {
  const report = await generateReport(validationResults);
  console.log(report);
}

/**
 * Offer troubleshooting for errors
 *
 * @param {Array} errors - Array of error objects
 */
async function provideTroubleshooting(errors) {
  await offerTroubleshooting(errors);
}

module.exports = {
  validateInstallation,
  displayValidationReport,
  provideTroubleshooting,
};
