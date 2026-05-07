/**
 * Pro Command Module
 *
 * CLI commands for AIOX Pro license management and feature gating.
 *
 * Subcommands:
 *   aiox pro activate --key <KEY>    Activate a license key
 *   aiox pro status                   Show license status
 *   aiox pro deactivate               Deactivate the current license
 *   aiox pro features                 List all pro features
 *   aiox pro validate                 Force online revalidation
 *   aiox pro setup                    Install or verify the AIOX Pro package
 *
 * @module cli/commands/pro
 * @version 1.1.0
 * @story PRO-6 — License Key & Feature Gating System
 */

'use strict';

const { Command } = require('commander');
const path = require('path');
const fs = require('fs');
const readline = require('readline');
const { createBuyerCommand } = require('./buyer');

// BUG-6 fix (INS-1): Dynamic licensePath resolution
// In framework-dev: __dirname = aiox-core/.aiox-core/cli/commands/pro → ../../../../pro/license
// In project-dev: pro is installed via npm as @aiox-squads/pro or a legacy scope.
function resolveLicensePath() {
  // 1. Try relative path (framework-dev mode)
  const relativePath = path.resolve(__dirname, '..', '..', '..', '..', 'pro', 'license');
  if (fs.existsSync(relativePath)) {
    return relativePath;
  }

  // 2. Try npm packages — canonical then fallback
  const npmCandidates = [
    '@aiox-squads/pro',
    '@aiox-fullstack/pro',
    '@aios-fullstack/pro',
  ];

  for (const pkgName of npmCandidates) {
    try {
      const proPkg = require.resolve(`${pkgName}/package.json`);
      const proDir = path.dirname(proPkg);
      const npmPath = path.join(proDir, 'license');
      if (fs.existsSync(npmPath)) {
        return npmPath;
      }
    } catch {
      // package not installed
    }
  }

  // 3. Try project root node_modules (both scopes)
  const projectRoot = process.cwd();
  const scopePaths = [
    path.join(projectRoot, 'node_modules', '@aiox-squads', 'pro', 'license'),
    path.join(projectRoot, 'node_modules', '@aiox-fullstack', 'pro', 'license'),
    path.join(projectRoot, 'node_modules', '@aios-fullstack', 'pro', 'license'),
  ];

  for (const cwdPath of scopePaths) {
    if (fs.existsSync(cwdPath)) {
      return cwdPath;
    }
  }

  // Return relative path as default (will fail gracefully in loadLicenseModules)
  return relativePath;
}

const licensePath = resolveLicensePath();

/**
 * Lazy-load license modules (avoids failing if pro module not installed)
 */
function loadLicenseModules() {
  try {
    const { featureGate } = require(path.join(licensePath, 'feature-gate'));
    const { licenseApi } = require(path.join(licensePath, 'license-api'));
    const {
      writeLicenseCache,
      readLicenseCache,
      deleteLicenseCache,
      hasPendingDeactivation,
      setPendingDeactivation,
      clearPendingDeactivation,
    } = require(path.join(licensePath, 'license-cache'));
    const {
      generateMachineId,
      maskKey,
      validateKeyFormat,
    } = require(path.join(licensePath, 'license-crypto'));
    const { ProFeatureError, LicenseActivationError } = require(path.join(licensePath, 'errors'));

    return {
      featureGate,
      licenseApi,
      writeLicenseCache,
      readLicenseCache,
      deleteLicenseCache,
      hasPendingDeactivation,
      setPendingDeactivation,
      clearPendingDeactivation,
      generateMachineId,
      maskKey,
      validateKeyFormat,
      ProFeatureError,
      LicenseActivationError,
    };
  } catch (error) {
    console.error('AIOX Pro license module not available.');
    console.error('Install AIOX Pro: aiox pro setup');
    console.error('Or via wrapper: npx aiox-pro install');
    process.exit(1);
  }
}

/**
 * Get AIOX Core version from package.json
 */
function getAioxCoreVersion() {
  try {
    const pkgPath = path.resolve(__dirname, '..', '..', '..', '..', 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    return pkg.version || 'unknown';
  } catch {
    return 'unknown';
  }
}

/**
 * Format date for display
 */
function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Ask user for confirmation
 */
async function confirm(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

// ---------------------------------------------------------------------------
// aiox pro activate
// ---------------------------------------------------------------------------

async function activateAction(options) {
  const {
    licenseApi,
    writeLicenseCache,
    generateMachineId,
    maskKey,
    validateKeyFormat,
    featureGate,
    LicenseActivationError,
  } = loadLicenseModules();

  const key = options.key;

  if (!key) {
    console.error('Error: License key is required');
    console.error('Usage: aiox pro activate --key PRO-XXXX-XXXX-XXXX-XXXX');
    process.exit(1);
  }

  // Validate key format
  if (!validateKeyFormat(key)) {
    console.error('Error: Invalid license key format');
    console.error('Expected format: PRO-XXXX-XXXX-XXXX-XXXX');
    process.exit(1);
  }

  console.log('\nActivating AIOX Pro license...');
  console.log(`Key: ${maskKey(key)}`);
  console.log('');

  try {
    const machineId = generateMachineId();
    const aioxCoreVersion = getAioxCoreVersion();

    const result = await licenseApi.activate(key, machineId, aioxCoreVersion);

    // Write encrypted cache
    const cacheData = {
      key: result.key,
      activatedAt: result.activatedAt,
      expiresAt: result.expiresAt,
      features: result.features,
      seats: result.seats,
      cacheValidDays: result.cacheValidDays,
      gracePeriodDays: result.gracePeriodDays,
    };

    const writeResult = writeLicenseCache(cacheData);
    if (!writeResult.success) {
      console.error(`Warning: Could not save license cache: ${writeResult.error}`);
    }

    // Reload feature gate
    featureGate.reload();

    // Display success
    console.log('License activated successfully!\n');
    console.log('  Status:       Active');
    console.log(`  Key:          ${maskKey(result.key)}`);
    console.log(`  Features:     ${result.features.join(', ')}`);
    console.log(`  Seats:        ${result.seats.used}/${result.seats.max} used`);
    console.log(`  Valid until:  ${formatDate(result.expiresAt)}`);
    console.log(`  Cache:        ${result.cacheValidDays} days offline operation`);
    console.log('');

    // Scaffold pro content into project (Story INS-3.1)
    // Lazy-load to avoid crashing if pro-scaffolder or js-yaml is unavailable
    const projectRoot = path.resolve(__dirname, '..', '..', '..', '..');
    // Try canonical then fallback package path
    const proSourceDir = [
      path.join(projectRoot, 'node_modules', '@aiox-fullstack', 'pro'),
      path.join(projectRoot, 'node_modules', '@aios-fullstack', 'pro'),
    ].find(p => fs.existsSync(p));

    if (proSourceDir) {
      let scaffoldProContent;
      try {
        ({ scaffoldProContent } = require('../../../../packages/installer/src/pro/pro-scaffolder'));
      } catch {
        console.log('Note: Pro scaffolder not available. Skipping content scaffolding.');
        console.log('');
      }

      if (scaffoldProContent) {
        console.log('Scaffolding pro content...');
        const scaffoldResult = await scaffoldProContent(projectRoot, proSourceDir, {
          onProgress: ({ item, status, message }) => {
            if (status === 'done') {
              console.log(`  + ${message}`);
            } else if (status === 'warning') {
              console.log(`  ! ${message}`);
            }
          },
        });

        if (scaffoldResult.success) {
          console.log(`\nPro content installed (${scaffoldResult.copiedFiles.length} files)`);
          if (scaffoldResult.skippedFiles.length > 0) {
            console.log(`  ${scaffoldResult.skippedFiles.length} files unchanged (already up to date)`);
          }
          if (scaffoldResult.warnings.length > 0) {
            for (const warning of scaffoldResult.warnings) {
              console.log(`  Warning: ${warning}`);
            }
          }
        } else {
          console.error('\nWarning: Pro content scaffolding failed.');
          for (const err of scaffoldResult.errors) {
            console.error(`  ${err}`);
          }
          console.error('Pro features are activated but content was not copied.');
          console.error('Try running "aiox pro activate" again to retry scaffolding.');
        }
        console.log('');
      }
    } else {
      console.log('Note: AIOX Pro package not found in node_modules.');
      console.log('Pro content will be scaffolded when the package is installed.');
      console.log('');
    }

  } catch (error) {
    if (error instanceof LicenseActivationError) {
      console.error(`\nActivation failed: ${error.message}`);
      console.error(`Error code: ${error.code}`);
      if (error.details && Object.keys(error.details).length > 0) {
        console.error('Details:', JSON.stringify(error.details, null, 2));
      }
    } else {
      console.error(`\nActivation failed: ${error.message}`);
    }
    process.exit(1);
  }
}

// ---------------------------------------------------------------------------
// aiox pro status
// ---------------------------------------------------------------------------

function statusAction() {
  const {
    featureGate,
    readLicenseCache,
    maskKey,
    hasPendingDeactivation,
  } = loadLicenseModules();

  console.log('\nAIOX Pro License Status\n');

  const cache = readLicenseCache();
  const state = featureGate.getLicenseState();
  const info = featureGate.getLicenseInfo();

  // State display
  const stateEmoji = {
    'Active': '\u2705',     // Green check
    'Grace': '\u26A0\uFE0F', // Warning
    'Expired': '\u274C',    // Red X
    'Not Activated': '\u2796', // Minus
  };

  console.log(`  License:       ${stateEmoji[state] || ''} ${state}`);

  if (!cache) {
    console.log('\n  No license activated.');
    console.log('  Activate: aiox pro activate --key PRO-XXXX-XXXX-XXXX-XXXX');
    console.log('  Purchase: https://synkra.ai/pro');
    console.log('');
    return;
  }

  // Key (masked)
  console.log(`  Key:           ${maskKey(cache.key)}`);

  // Features
  if (info && info.features) {
    console.log(`  Features:      ${info.features.join(', ')}`);
  }

  // Seats
  if (cache.seats) {
    console.log(`  Seats:         ${cache.seats.used}/${cache.seats.max} used`);
  }

  // Cache validity
  if (cache.activatedAt) {
    const activatedDate = new Date(cache.activatedAt);
    const cacheValidDays = cache.cacheValidDays || 30;
    const expiryDate = new Date(activatedDate.getTime() + cacheValidDays * 24 * 60 * 60 * 1000);
    const daysRemaining = Math.ceil((expiryDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000));

    if (daysRemaining > 0) {
      console.log(`  Cache:         Valid until ${formatDate(expiryDate)} (${daysRemaining} days remaining)`);
    } else {
      console.log(`  Cache:         Expired ${formatDate(expiryDate)}`);
    }
  }

  // Grace period warning
  if (info && info.inGrace) {
    const gracePeriodDays = cache.gracePeriodDays || 7;
    console.log(`\n  \u26A0\uFE0F  Grace Period Active (${gracePeriodDays} days)`);
    console.log('  Please revalidate your license: aiox pro validate');
  }

  // Pending deactivation warning
  const pending = hasPendingDeactivation();
  if (pending && pending.pending) {
    console.log('\n  \u26A0\uFE0F  Pending Offline Deactivation');
    console.log('  A deactivation is pending sync to the server.');
    console.log('  This will be synced on next online activation or validation.');
  }

  // Next validation
  console.log(`\n  Next validation: ${state === 'Active' ? 'Background (when online)' : 'Required'}`);
  console.log('');
}

// ---------------------------------------------------------------------------
// aiox pro deactivate
// ---------------------------------------------------------------------------

async function deactivateAction(options) {
  const {
    licenseApi,
    readLicenseCache,
    deleteLicenseCache,
    setPendingDeactivation,
    generateMachineId,
    maskKey,
    featureGate,
  } = loadLicenseModules();

  const cache = readLicenseCache();

  if (!cache) {
    console.log('\nNo license is currently activated.');
    return;
  }

  // Confirm unless forced
  if (!options.force) {
    console.log('\nDeactivating AIOX Pro License');
    console.log(`Key: ${maskKey(cache.key)}`);
    console.log('\nThis will:');
    console.log('  - Remove the license from this machine');
    console.log('  - Free up a seat for use on another machine');
    console.log('  - Disable all Pro features (Core features remain available)');
    console.log('  - Preserve all your data and configurations');
    console.log('');

    const confirmed = await confirm('Are you sure you want to deactivate? (y/N): ');
    if (!confirmed) {
      console.log('Deactivation cancelled.');
      return;
    }
  }

  console.log('\nDeactivating license...');

  try {
    const machineId = generateMachineId();

    // Try online deactivation first
    const isOnline = await licenseApi.isOnline();

    if (isOnline) {
      try {
        await licenseApi.deactivate(cache.key, machineId);
        console.log('');
        console.log('License deactivated successfully.');
        console.log('Seat has been freed for use on another machine.');
      } catch (error) {
        // Online deactivation failed, fall back to offline
        console.log(`\n\u26A0\uFE0F  Could not reach server: ${error.message}`);
        console.log('Proceeding with offline deactivation...');
        setPendingDeactivation(cache.key);
        console.log('\nSeat will be freed when you next connect online.');
      }
    } else {
      // Offline deactivation
      console.log('\n\u26A0\uFE0F  No internet connection detected.');
      console.log('Performing offline deactivation...');
      setPendingDeactivation(cache.key);
      console.log('\nSeat will be freed on next online connection.');
    }

    // Delete local cache
    deleteLicenseCache();

    // Reload feature gate
    featureGate.reload();

    console.log('');
    console.log('Your data and configurations have been preserved.');
    console.log('Core features remain available.');
    console.log('');
    console.log('To reactivate: aiox pro activate --key <KEY>');
    console.log('');

  } catch (error) {
    console.error(`\nDeactivation error: ${error.message}`);
    process.exit(1);
  }
}

// ---------------------------------------------------------------------------
// aiox pro features
// ---------------------------------------------------------------------------

function featuresAction() {
  const { featureGate } = loadLicenseModules();

  console.log('\nAIOX Pro Features\n');

  const byModule = featureGate.listByModule();
  const modules = Object.keys(byModule).sort();

  for (const moduleName of modules) {
    const features = byModule[moduleName];

    console.log(`${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}:`);

    for (const feature of features) {
      const status = feature.available
        ? '\u2705'  // Green check
        : '\u274C'; // Red X

      console.log(`  ${status} ${feature.name}`);
      console.log(`     ID: ${feature.id}`);
      if (feature.description) {
        console.log(`     ${feature.description}`);
      }
    }
    console.log('');
  }

  const available = featureGate.listAvailable();
  const total = Object.values(byModule).reduce((sum, arr) => sum + arr.length, 0);

  console.log(`Summary: ${available.length}/${total} features available`);
  console.log('');
}

// ---------------------------------------------------------------------------
// aiox pro validate
// ---------------------------------------------------------------------------

async function validateAction() {
  const {
    licenseApi,
    readLicenseCache,
    writeLicenseCache,
    generateMachineId,
    maskKey,
    featureGate,
    LicenseActivationError,
  } = loadLicenseModules();

  console.log('\nValidating AIOX Pro license...\n');

  const cache = readLicenseCache();

  if (!cache) {
    console.log('No license is currently activated.');
    console.log('Activate: aiox pro activate --key PRO-XXXX-XXXX-XXXX-XXXX');
    return;
  }

  console.log(`Key: ${maskKey(cache.key)}`);

  try {
    const machineId = generateMachineId();

    const result = await licenseApi.validate(cache.key, machineId);

    if (!result.valid) {
      console.log('\n\u274C License validation failed.');
      console.log('The license may have been revoked or expired.');
      console.log('Please contact support or activate a new license.');
      return;
    }

    // Update cache with refreshed data
    const updatedCache = {
      ...cache,
      features: result.features,
      seats: result.seats,
      expiresAt: result.expiresAt,
      cacheValidDays: result.cacheValidDays,
      gracePeriodDays: result.gracePeriodDays,
      lastValidated: new Date().toISOString(),
    };

    const writeResult = writeLicenseCache(updatedCache);
    if (!writeResult.success) {
      console.log(`Warning: Could not update cache: ${writeResult.error}`);
    }

    // Reload feature gate
    featureGate.reload();

    // Display result
    console.log('\n\u2705 License validated successfully!\n');
    console.log(`  Features:     ${result.features.join(', ')}`);
    console.log(`  Seats:        ${result.seats.used}/${result.seats.max} used`);
    console.log(`  Valid until:  ${formatDate(result.expiresAt)}`);
    console.log(`  Cache:        Refreshed for ${result.cacheValidDays} days`);
    console.log('');

  } catch (error) {
    if (error instanceof LicenseActivationError) {
      console.error(`\nValidation failed: ${error.message}`);
      console.error(`Error code: ${error.code}`);
    } else {
      console.error(`\nValidation failed: ${error.message}`);
    }
    process.exit(1);
  }
}

// ---------------------------------------------------------------------------
// aiox pro setup (AC-12: Install-gate)
// ---------------------------------------------------------------------------

/**
 * Setup and verify AIOX Pro installation.
 *
 * Tries canonical @aiox-squads/pro first, then legacy fallbacks.
 *
 * @param {object} options - Command options
 * @param {boolean} options.verify - Only verify without installing
 */
async function setupAction(options) {
  const PRO_PACKAGES = ['@aiox-squads/pro', '@aiox-fullstack/pro', '@aios-fullstack/pro'];

  console.log('\nAIOX Pro - Setup\n');

  if (options.verify) {
    console.log('Verifying AIOX Pro installation...\n');

    try {
      const { execSync } = require('child_process');
      let found = false;
      for (const pkg of PRO_PACKAGES) {
        try {
          const result = execSync(`npm ls ${pkg} --json`, { stdio: 'pipe', timeout: 15000 });
          const parsed = JSON.parse(result.toString());
          const deps = parsed.dependencies || {};
          if (deps[pkg]) {
            console.log(`✅ ${pkg}@${deps[pkg].version} is installed`);
            found = true;
            break;
          }
        } catch { /* try next */ }
      }
      if (!found) {
        console.log('❌ AIOX Pro is not installed');
        console.log('');
        console.log('Install with:');
        console.log('  aiox pro setup');
        console.log('  # or npx aiox-pro install');
      }
    } catch {
      console.log('❌ AIOX Pro is not installed');
      console.log('');
      console.log('Install with:');
      console.log('  aiox pro setup');
      console.log('  # or npx aiox-pro install');
    }
    return;
  }

  // Install mode — try canonical first, fallback second
  console.log('AIOX Pro is available on the public npm registry.');
  console.log('No special tokens or configuration needed.\n');

  const { execSync } = require('child_process');
  let installedPackage = null;

  function getInstallErrorOutput(error) {
    return [
      error?.message,
      error?.stderr?.toString?.(),
      error?.stdout?.toString?.(),
    ].filter(Boolean).join('\n');
  }

  function isPackageNotFoundError(error, pkg) {
    const output = getInstallErrorOutput(error).toLowerCase();
    const packageName = pkg.toLowerCase();

    if (!output.includes(packageName)) {
      return false;
    }

    return output.includes('e404')
      || output.includes('npm err! 404')
      || output.includes(' is not in this registry')
      || output.includes(' not found');
  }

  for (const pkg of PRO_PACKAGES) {
    try {
      console.log(`Installing ${pkg}...\n`);
      execSync(`npm install ${pkg}`, { stdio: 'inherit', timeout: 120000 });
      console.log(`\n✅ ${pkg} installed successfully!`);
      installedPackage = pkg;
      break;
    } catch (error) {
      if (isPackageNotFoundError(error, pkg)) {
        continue;
      }

      console.error(`\n❌ Failed to install ${pkg}.`);
      const details = getInstallErrorOutput(error);
      if (details) {
        console.error(details);
      }
      process.exit(1);
    }
  }

  if (!installedPackage) {
    console.error('\n❌ Installation failed.');
    console.log('\nTry manually:');
    console.log('  aiox pro setup');
    console.log('  # or npx aiox-pro install');
    process.exit(1);
  }

  console.log('\n--- Setup Complete ---');
  console.log('');
  console.log('To activate your license:');
  console.log('  aiox pro activate --key PRO-XXXX-XXXX-XXXX-XXXX');
  console.log('');
  console.log('To check license status:');
  console.log('  aiox pro status');
  console.log('');
  console.log('Documentation: https://synkra.ai/pro/docs');
  console.log('');
}

// ---------------------------------------------------------------------------
// aiox pro update (Story 122.3)
// ---------------------------------------------------------------------------

async function updateAction(options) {
  const proUpdaterPath = path.resolve(__dirname, '..', '..', '..', 'core', 'pro', 'pro-updater');
  let updatePro, formatUpdateResult;

  try {
    ({ updatePro, formatUpdateResult } = require(proUpdaterPath));
  } catch {
    console.error('❌ Pro updater module not found.');
    console.error('Please ensure aiox-core is installed correctly.');
    process.exit(1);
  }

  const projectRoot = process.cwd();

  // Validate license before updating (unless --check)
  if (!options.check && !options.dryRun) {
    try {
      const { featureGate } = loadLicenseModules();
      const state = featureGate.getLicenseState();
      if (state !== 'Active' && state !== 'Grace') {
        console.error('\n❌ AIOX Pro license is not active.');
        console.error('Activate your license first: aiox pro activate --key PRO-XXXX-XXXX-XXXX-XXXX');
        process.exit(1);
      }
    } catch {
      // License modules not available — proceed anyway (first update scenario)
    }
  }

  try {
    const result = await updatePro(projectRoot, {
      check: options.check || false,
      dryRun: options.dryRun || false,
      force: options.force || false,
      includeCoreUpdate: options.includeCore || false,
      skipScaffold: options.skipScaffold || false,
      onProgress: (phase, message) => {
        if (phase === 'detect') console.log(`  🔍 ${message}`);
        else if (phase === 'check') console.log(`  📡 ${message}`);
        else if (phase === 'core') console.log(`  📦 ${message}`);
        else if (phase === 'update') console.log(`  ⬆️  ${message}`);
        else if (phase === 'scaffold') console.log(`  🔧 ${message}`);
      },
    });

    console.log(formatUpdateResult(result));

    if (!result.success) {
      process.exit(1);
    }
  } catch (error) {
    console.error(`\n❌ ${error.message}`);
    process.exit(1);
  }
}

// ---------------------------------------------------------------------------
// Command builder
// ---------------------------------------------------------------------------

/**
 * Create the `aiox pro` command with all subcommands.
 * @returns {Command}
 */
function createProCommand() {
  const proCmd = new Command('pro')
    .description('AIOX Pro license management');

  // aiox pro activate
  proCmd
    .command('activate')
    .description('Activate a license key')
    .requiredOption('-k, --key <key>', 'License key (PRO-XXXX-XXXX-XXXX-XXXX)')
    .action(activateAction);

  // aiox pro status
  proCmd
    .command('status')
    .description('Show current license status')
    .action(statusAction);

  // aiox pro deactivate
  proCmd
    .command('deactivate')
    .description('Deactivate the current license')
    .option('-f, --force', 'Skip confirmation prompt')
    .action(deactivateAction);

  // aiox pro features
  proCmd
    .command('features')
    .description('List all pro features and their availability')
    .action(featuresAction);

  // aiox pro validate
  proCmd
    .command('validate')
    .description('Force online license revalidation')
    .action(validateAction);

  // aiox pro setup (AC-12: Install-gate)
  proCmd
    .command('setup')
    .description('Install and verify AIOX Pro')
    .option('--verify', 'Only verify installation without installing')
    .action(setupAction);

  // aiox pro update (Story 122.3)
  proCmd
    .command('update')
    .description('Update AIOX Pro to latest version and sync assets')
    .option('--check', 'Check for updates without applying')
    .option('--dry-run', 'Show update plan without executing')
    .option('-f, --force', 'Force reinstall even if up-to-date')
    .option('--include-core', 'Also update aiox-core')
    .option('--skip-scaffold', 'Skip re-scaffolding assets after update')
    .action(updateAction);

  // aiox pro buyer — Cohort admin operations (Story 123.8)
  proCmd.addCommand(createBuyerCommand());

  return proCmd;
}

module.exports = {
  createProCommand,
};
