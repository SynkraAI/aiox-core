#!/usr/bin/env node
/**
 * Validate Package Completeness for npm Publishing
 *
 * Ensures the npm tarball contains all critical files and excludes
 * private content before publishing. Runs as prepublishOnly hook.
 *
 * @script scripts/validate-package-completeness.js
 * @story INS-2 - Release Pipeline: Preview to Latest
 *
 * Usage:
 *   node scripts/validate-package-completeness.js
 *   node scripts/validate-package-completeness.js --verbose
 *
 * Exit codes:
 *   0 - Package is complete and safe to publish
 *   1 - Validation failed (missing files, leaked content, or config issues)
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const VERBOSE = process.argv.includes('--verbose') || process.env.VERBOSE === 'true';

// ─── Configuration ──────────────────────────────────────────────────────────

/**
 * Files/directories that MUST be present in the tarball.
 * Paths are relative to package root, checked as prefixes against tarball entries.
 */
const REQUIRED_PATHS = [
  // Hooks (critical - these were missing in v4.0.0)
  '.claude/hooks/synapse-engine.js',
  '.claude/hooks/precompact-session-digest.js',
  // Rules
  '.claude/rules/',
  // CLI binaries
  'bin/aios.js',
  'bin/aios-minimal.js',
  // Core framework
  '.aios-core/core-config.yaml',
  '.aios-core/constitution.md',
  '.aios-core/development/agents/',
  '.aios-core/development/tasks/',
];

/**
 * Paths that MUST NOT appear in the tarball (leak prevention).
 */
const EXCLUDED_PATHS = [
  'pro/',
  '.env',
  '.git/',
  'node_modules/',
  '.aios/',
  'tests/',
];

/**
 * Entries required in package.json "files" array.
 */
const REQUIRED_FILES_ENTRIES = [
  '.claude/hooks/',
  '.claude/rules/',
  '.aios-core/',
  'bin/',
];

/**
 * Bin entries that must point to existing files.
 */
const REQUIRED_BIN_ENTRIES = ['aios', 'aios-core'];

/**
 * Runtime dependencies that must be present.
 */
const REQUIRED_DEPENDENCIES = ['js-yaml', 'execa', 'chalk', 'commander', 'fs-extra'];

// ─── Helpers ────────────────────────────────────────────────────────────────

let totalChecks = 0;
let passedChecks = 0;
let failedChecks = 0;
const failures = [];

function log(msg) {
  console.log(msg);
}

function verbose(msg) {
  if (VERBOSE) {
    console.log(`  [verbose] ${msg}`);
  }
}

function check(description, passed, detail) {
  totalChecks++;
  if (passed) {
    passedChecks++;
    log(`  PASS  ${description}`);
  } else {
    failedChecks++;
    const msg = detail ? `${description} -- ${detail}` : description;
    failures.push(msg);
    log(`  FAIL  ${description}`);
    if (detail) {
      log(`         ${detail}`);
    }
  }
}

function getTarballContents() {
  try {
    const output = execSync('npm pack --dry-run --json 2>&1', {
      cwd: ROOT,
      encoding: 'utf8',
      timeout: 30000,
    });

    // npm pack --json outputs a JSON array
    const parsed = JSON.parse(output);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      throw new Error('npm pack --json returned empty result');
    }

    const files = parsed[0].files || [];
    return files.map((f) => f.path);
  } catch (parseError) {
    // Fallback: parse text output from npm pack --dry-run
    verbose(`JSON parse failed, falling back to text output: ${parseError.message}`);
    try {
      const output = execSync('npm pack --dry-run 2>&1', {
        cwd: ROOT,
        encoding: 'utf8',
        timeout: 30000,
      });

      // Text output has lines like "npm notice 1.2kB .claude/hooks/synapse-engine.js"
      const lines = output.split('\n');
      return lines
        .filter((line) => line.includes('npm notice') && !line.includes('=== Tarball'))
        .map((line) => {
          // Extract file path (last token after size)
          const match = line.match(/npm notice\s+[\d.]+[kMG]?B?\s+(.+)/);
          return match ? match[1].trim() : null;
        })
        .filter(Boolean);
    } catch (fallbackError) {
      log(`  FAIL  Could not run npm pack: ${fallbackError.message}`);
      return null;
    }
  }
}

function loadPackageJson() {
  const pkgPath = path.join(ROOT, 'package.json');
  return JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
}

// ─── Validation Phases ──────────────────────────────────────────────────────

function validateTarballContents(tarballFiles) {
  log('\n--- Phase 1: Tarball Contents ---\n');

  if (!tarballFiles) {
    check('npm pack --dry-run executed', false, 'Failed to get tarball contents');
    return;
  }

  verbose(`Tarball contains ${tarballFiles.length} files`);

  // Check required paths exist
  for (const required of REQUIRED_PATHS) {
    const isDir = required.endsWith('/');
    let found;

    if (isDir) {
      found = tarballFiles.some((f) => f.startsWith(required) || f.startsWith(`package/${required}`));
    } else {
      found = tarballFiles.some((f) => f === required || f === `package/${required}`);
    }

    check(
      `Required: ${required}`,
      found,
      found ? undefined : `Not found in tarball (${tarballFiles.length} files scanned)`
    );
  }

  // Check excluded paths do NOT exist
  for (const excluded of EXCLUDED_PATHS) {
    const leaked = tarballFiles.filter(
      (f) => f.startsWith(excluded) || f.startsWith(`package/${excluded}`)
    );

    check(
      `Excluded: ${excluded} not in tarball`,
      leaked.length === 0,
      leaked.length > 0 ? `LEAK DETECTED: ${leaked.slice(0, 3).join(', ')}` : undefined
    );
  }
}

function validatePackageJson(pkg) {
  log('\n--- Phase 2: package.json Validation ---\n');

  // Check "files" array includes required entries
  const filesArray = pkg.files || [];

  for (const entry of REQUIRED_FILES_ENTRIES) {
    const found = filesArray.some((f) => f === entry || f.startsWith(entry));
    check(
      `files[] includes "${entry}"`,
      found,
      found ? undefined : `Add "${entry}" to package.json "files" array`
    );
  }

  // Check bin entries point to existing files
  const binEntries = pkg.bin || {};
  for (const name of REQUIRED_BIN_ENTRIES) {
    const binPath = binEntries[name];
    if (!binPath) {
      check(`bin.${name} defined`, false, `Missing bin entry for "${name}"`);
      continue;
    }

    const fullPath = path.join(ROOT, binPath);
    const exists = fs.existsSync(fullPath);
    check(
      `bin.${name} -> ${binPath} exists`,
      exists,
      exists ? undefined : `File not found: ${fullPath}`
    );
  }

  // Check runtime dependencies
  const deps = pkg.dependencies || {};
  for (const dep of REQUIRED_DEPENDENCIES) {
    check(
      `dependency: ${dep}`,
      dep in deps,
      dep in deps ? undefined : `Missing runtime dependency "${dep}"`
    );
  }
}

function validateBinScripts() {
  log('\n--- Phase 3: Bin Script Validation ---\n');

  const pkg = loadPackageJson();
  const binEntries = pkg.bin || {};

  for (const [name, binPath] of Object.entries(binEntries)) {
    const fullPath = path.join(ROOT, binPath);
    if (!fs.existsSync(fullPath)) {
      verbose(`Skipping shebang check for missing file: ${binPath}`);
      continue;
    }

    const content = fs.readFileSync(fullPath, 'utf8');
    const firstLine = content.split('\n')[0];
    const hasShebang = firstLine.startsWith('#!/usr/bin/env node');

    check(
      `${name} (${binPath}) has correct shebang`,
      hasShebang,
      hasShebang ? undefined : `Expected "#!/usr/bin/env node", got "${firstLine.substring(0, 40)}"`
    );
  }
}

// ─── Main ───────────────────────────────────────────────────────────────────

function main() {
  log('='.repeat(60));
  log('AIOS-Core Package Completeness Validation');
  log('='.repeat(60));

  const pkg = loadPackageJson();
  log(`\nPackage: ${pkg.name}@${pkg.version}`);

  // Phase 1: Tarball contents
  const tarballFiles = getTarballContents();
  validateTarballContents(tarballFiles);

  // Phase 2: package.json
  validatePackageJson(pkg);

  // Phase 3: Bin scripts
  validateBinScripts();

  // Summary
  log('\n' + '='.repeat(60));
  log(`Results: ${passedChecks}/${totalChecks} passed, ${failedChecks} failed`);

  if (failures.length > 0) {
    log('\nFailures:');
    for (const f of failures) {
      log(`  - ${f}`);
    }
    log('\n' + '='.repeat(60));
    log('BLOCKED: Package is NOT safe to publish.');
    log('Fix the issues above before running npm publish.');
    log('='.repeat(60));
    process.exit(1);
  }

  log('\n' + '='.repeat(60));
  log('PASSED: Package is complete and safe to publish.');
  log('='.repeat(60));
  process.exit(0);
}

main();
