/**
 * Dependency Validator
 * Task 1.8.4: Validates dependency installation
 *
 * @module wizard/validation/validators/dependency-validator
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

/**
 * Validate dependencies
 *
 * @param {Object} depsContext - Dependency installation context
 * @param {boolean} depsContext.success - Installation success status
 * @param {string} depsContext.packageManager - Package manager used
 * @param {boolean} depsContext.offlineMode - Offline mode flag
 * @param {string} depsContext.projectType - Project type (GREENFIELD, BROWNFIELD, etc.)
 * @returns {Promise<Object>} Validation result
 */
async function validateDependencies(depsContext = {}) {
  const results = {
    success: true,
    checks: [],
    errors: [],
    warnings: [],
  };
  const projectRoot = depsContext.projectPath || depsContext.targetDir || process.cwd();

  try {
    // Check if dependencies were installed (skip for greenfield with no deps defined)
    if (depsContext.success === false) {
      results.success = false;
      results.errors.push({
        severity: 'critical',
        message: 'Dependencies not installed - installation failed',
        code: 'DEPS_INSTALL_FAILED',
      });
      return results;
    }

    // Check node_modules existence
    const nodeModulesPath = path.join(projectRoot, 'node_modules');
    const packageJsonPath = path.join(projectRoot, 'package.json');
    const packageJsonExists = fs.existsSync(packageJsonPath);
    const isGreenfieldNoPackageJson =
      depsContext.skipped === true &&
      depsContext.reason === 'no-package-json' &&
      !packageJsonExists;

    // For greenfield projects, check if package.json has dependencies
    let hasDependencies = false;
    if (packageJsonExists) {
      try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        hasDependencies = !!(
          (packageJson.dependencies && Object.keys(packageJson.dependencies).length > 0) ||
          (packageJson.devDependencies && Object.keys(packageJson.devDependencies).length > 0)
        );
      } catch {
        // If we can't parse package.json, assume no dependencies
        hasDependencies = false;
      }
    }

    if (!fs.existsSync(nodeModulesPath)) {
      // For greenfield projects with no dependencies, this is OK
      if (!hasDependencies) {
        results.checks.push({
          component: 'Dependencies',
          file: 'node_modules',
          status: 'skipped',
          message: 'No dependencies defined in package.json (greenfield project)',
        });
        return results;
      }

      // Otherwise, it's an error
      results.success = false;
      results.errors.push({
        severity: 'critical',
        message: 'node_modules directory not found',
        file: nodeModulesPath,
        code: 'NODE_MODULES_MISSING',
      });
      return results;
    }

    results.checks.push({
      component: 'Dependencies',
      file: 'node_modules',
      status: 'success',
      message: 'Directory exists',
    });

    if (isGreenfieldNoPackageJson) {
      results.checks.push({
        component: 'Package Manifest',
        file: packageJsonPath,
        status: 'skipped',
        message: 'No package.json found (greenfield project)',
      });
    } else {
      // Validate package.json integrity
      await validatePackageJson(results, projectRoot);
    }

    // Validate any explicit dependency contract supplied by the caller.
    await checkRequiredDependencies(results, projectRoot, depsContext.requiredDependencies);

    if (isGreenfieldNoPackageJson) {
      results.checks.push({
        component: 'Security Audit',
        status: 'skipped',
        message: 'No package.json found (greenfield project)',
      });
    } else {
      // Run npm audit (non-blocking - warnings only)
      await runSecurityAudit(results, depsContext.packageManager, projectRoot);
    }

    // Count installed packages
    await countInstalledPackages(results, nodeModulesPath);

    return results;
  } catch (error) {
    results.errors.push({
      severity: 'high',
      message: `Dependency validation failed: ${error.message}`,
      code: 'DEPS_VALIDATION_ERROR',
      details: error.stack,
    });
    results.success = false;

    return results;
  }
}

/**
 * Validate package.json
 * @private
 */
async function validatePackageJson(results, projectRoot) {
  const packageJsonPath = path.join(projectRoot, 'package.json');

  if (!fs.existsSync(packageJsonPath)) {
    results.errors.push({
      severity: 'critical',
      message: 'package.json not found',
      file: packageJsonPath,
      code: 'PACKAGE_JSON_MISSING',
    });
    results.success = false;
    return;
  }

  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    if (!packageJson.dependencies && !packageJson.devDependencies) {
      results.warnings.push({
        severity: 'medium',
        message: 'package.json has no dependencies',
        file: packageJsonPath,
        code: 'NO_DEPENDENCIES',
      });
    }

    results.checks.push({
      component: 'Package Manifest',
      file: packageJsonPath,
      status: 'success',
      message: 'Valid JSON',
    });
  } catch (error) {
    results.errors.push({
      severity: 'high',
      message: `package.json parsing failed: ${error.message}`,
      file: packageJsonPath,
      code: 'PACKAGE_JSON_PARSE_ERROR',
    });
    results.success = false;
  }
}

/**
 * Check explicitly required dependencies for the target project.
 *
 * This validator is used against the installed project, not the installer
 * workspace itself. A caller may provide a narrow manifest of packages that
 * must exist after installation; when none is supplied we skip this check to
 * avoid false warnings about the installer's own internal dependencies.
 * @private
 */
async function checkRequiredDependencies(results, projectRoot, requiredDependencies = []) {
  if (!Array.isArray(requiredDependencies) || requiredDependencies.length === 0) {
    results.checks.push({
      component: 'Dependency Contract',
      status: 'skipped',
      message: 'No explicit required dependency manifest provided',
    });
    return;
  }

  const nodeModulesPath = path.join(projectRoot, 'node_modules');
  const missingDeps = [];

  for (const dep of requiredDependencies) {
    const depPath = path.join(nodeModulesPath, dep);
    if (!fs.existsSync(depPath)) {
      missingDeps.push(dep);
    }
  }

  if (missingDeps.length > 0) {
    results.warnings.push({
      severity: 'high',
      message: `Required dependencies missing: ${missingDeps.join(', ')}`,
      code: 'CRITICAL_DEPS_MISSING',
      solution: 'Re-run dependency installation',
    });
  } else {
    results.checks.push({
      component: 'Dependency Contract',
      status: 'success',
      message: `All ${requiredDependencies.length} required dependencies installed`,
    });
  }
}

/**
 * Run security audit
 * @private
 */
async function runSecurityAudit(results, packageManager = 'npm', projectRoot = process.cwd()) {
  try {
    const auditCommand = packageManager === 'yarn' ? 'yarn audit --json' : 'npm audit --json';

    const { stdout } = await execAsync(auditCommand, {
      timeout: 10000,
      cwd: projectRoot,
    });

    let auditResults;

    if (packageManager === 'npm') {
      auditResults = JSON.parse(stdout);
      const vulnerabilities = auditResults.metadata?.vulnerabilities;

      if (vulnerabilities) {
        const total =
          vulnerabilities.low +
          vulnerabilities.moderate +
          vulnerabilities.high +
          vulnerabilities.critical;

        if (total > 0) {
          results.warnings.push({
            severity: vulnerabilities.critical > 0 ? 'high' : 'medium',
            message: `${total} vulnerabilities found (${vulnerabilities.critical} critical, ${vulnerabilities.high} high, ${vulnerabilities.moderate} moderate, ${vulnerabilities.low} low)`,
            code: 'VULNERABILITIES_FOUND',
            solution: 'Run \'npm audit fix\' to resolve',
          });
        } else {
          results.checks.push({
            component: 'Security Audit',
            status: 'success',
            message: 'No vulnerabilities found',
          });
        }
      }
    } else {
      // Yarn audit format is different
      results.checks.push({
        component: 'Security Audit',
        status: 'skipped',
        message: 'Yarn audit not implemented in validation',
      });
    }
  } catch (error) {
    // Audit may fail if there are vulnerabilities (exit code 1)
    // This is expected - parse the error output
    if (error.stdout) {
      try {
        const auditResults = JSON.parse(error.stdout);
        const vulnerabilities = auditResults.metadata?.vulnerabilities;

        if (vulnerabilities) {
          const total =
            vulnerabilities.low +
            vulnerabilities.moderate +
            vulnerabilities.high +
            vulnerabilities.critical;

          results.warnings.push({
            severity: vulnerabilities.critical > 0 ? 'high' : 'medium',
            message: `${total} vulnerabilities found`,
            code: 'VULNERABILITIES_FOUND',
            solution: `Run '${packageManager} audit fix' to resolve`,
          });
        }
      } catch {
        // Could not parse audit output - skip
        results.checks.push({
          component: 'Security Audit',
          status: 'skipped',
          message: 'Audit output could not be parsed',
        });
      }
    } else {
      // Audit command failed completely
      results.checks.push({
        component: 'Security Audit',
        status: 'skipped',
        message: 'Audit failed to run',
      });
    }
  }
}

/**
 * Count installed packages
 * @private
 */
async function countInstalledPackages(results, nodeModulesPath) {
  try {
    const packages = fs.readdirSync(nodeModulesPath);
    const packageCount = packages.filter(pkg => {
      // Filter out .bin, .cache, etc.
      if (pkg.startsWith('.')) return false;

      // Check if it's a directory
      const pkgPath = path.join(nodeModulesPath, pkg);
      try {
        return fs.statSync(pkgPath).isDirectory();
      } catch {
        return false;
      }
    }).length;

    results.checks.push({
      component: 'Package Count',
      status: 'success',
      message: `${packageCount} packages installed`,
    });
  } catch {
    // Not critical if we can't count packages
    results.checks.push({
      component: 'Package Count',
      status: 'skipped',
      message: 'Could not count packages',
    });
  }
}

module.exports = {
  validateDependencies,
};
