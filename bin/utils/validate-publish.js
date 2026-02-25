#!/usr/bin/env node
'use strict';

/**
 * Publish Safety Gate — Submodule + File Count + Dependency Validation
 * Story INS-4.10, INS-4.12
 *
 * Prevents publishing incomplete packages by validating:
 * 1. pro/ submodule is populated (not empty or uninitialized)
 * 2. Critical file pro/license/license-api.js exists
 * 3. Package file count meets minimum threshold (>= 50)
 * 4. (INS-4.12) .aios-core/package.json dependency completeness
 *
 * Exit codes: 0 = PASS, 1 = FAIL
 * Usage: node bin/utils/validate-publish.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECT_ROOT = path.join(__dirname, '..', '..');
const PRO_DIR = path.join(PROJECT_ROOT, 'pro');
const CRITICAL_FILE = path.join(PRO_DIR, 'license', 'license-api.js');
const MIN_FILE_COUNT = 50;

// CI environments may not have access to the private pro submodule
const IS_CI = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';

let passed = true;
let fileCount = 0;

// Check 1: pro/ submodule populated
console.log('--- Publish Safety Gate (INS-4.10) ---\n');

if (!fs.existsSync(PRO_DIR)) {
  if (IS_CI) {
    console.log('SKIP: pro/ directory not available (CI — private submodule requires separate access token)');
  } else {
    console.error('FAIL: pro/ directory does not exist.');
    console.error('  Fix: git submodule update --init pro');
    passed = false;
  }
} else {
  const entries = fs.readdirSync(PRO_DIR).filter(e => e !== '.git');
  if (entries.length === 0) {
    if (IS_CI) {
      console.log('SKIP: pro/ submodule empty (CI — private submodule requires separate access token)');
    } else {
      console.error('FAIL: pro/ submodule not initialized (directory is empty).');
      console.error('  Fix: git submodule update --init pro');
      passed = false;
    }
  } else {
    console.log(`PASS: pro/ submodule populated (${entries.length} entries)`);
  }
}

// Check 2: Critical file exists
if (!fs.existsSync(CRITICAL_FILE)) {
  if (IS_CI) {
    console.log('SKIP: pro/license/license-api.js not available (CI — private submodule)');
  } else {
    console.error('FAIL: pro/license/license-api.js not found.');
    console.error('  This is a critical file required for Pro license validation.');
    console.error('  Fix: git submodule update --init --recursive pro');
    passed = false;
  }
} else {
  console.log('PASS: pro/license/license-api.js exists');
}

// Check 3: File count threshold via npm pack --dry-run
try {
  const packOutput = execSync('npm pack --dry-run 2>&1', {
    encoding: 'utf8',
    cwd: PROJECT_ROOT,
    timeout: 30000,
  });
  // npm pack --dry-run outputs lines starting with "npm notice" for each file
  const fileLines = packOutput.split('\n').filter(line =>
    line.includes('npm notice') && !line.includes('Tarball') && !line.includes('name:') &&
    !line.includes('version:') && !line.includes('filename:') && !line.includes('package size:') &&
    !line.includes('unpacked size:') && !line.includes('shasum:') && !line.includes('integrity:') &&
    !line.includes('total files:'),
  );
  fileCount = fileLines.length;

  if (fileCount < MIN_FILE_COUNT) {
    console.error(`FAIL: Package has only ${fileCount} files, expected >= ${MIN_FILE_COUNT}.`);
    console.error('  Check that all directories in "files" array are populated.');
    passed = false;
  } else {
    console.log(`PASS: Package contains ${fileCount} files (minimum: ${MIN_FILE_COUNT})`);
  }
} catch (err) {
  console.error(`FAIL: npm pack --dry-run failed: ${err.message}`);
  passed = false;
}

// Check 4 (INS-4.12): .aios-core dependency completeness
console.log('');
console.log('--- Dependency Completeness (INS-4.12) ---\n');
try {
  const depValidatorPath = path.join(PROJECT_ROOT, 'scripts', 'validate-aios-core-deps.js');
  if (fs.existsSync(depValidatorPath)) {
    execSync(`node "${depValidatorPath}"`, {
      encoding: 'utf8',
      cwd: PROJECT_ROOT,
      timeout: 30000,
      stdio: 'inherit',
    });
    console.log('PASS: .aios-core dependency completeness validated');
  } else {
    console.log('SKIP: scripts/validate-aios-core-deps.js not found');
  }
} catch (_depErr) {
  console.error('FAIL: .aios-core dependency completeness check failed');
  console.error('  Fix: Run "node scripts/validate-aios-core-deps.js" to see details');
  passed = false;
}

// Summary
console.log('');
if (passed) {
  console.log(`PUBLISH SAFETY GATE: PASS (${fileCount} files in package)`);
  process.exit(0);
} else {
  console.error('PUBLISH SAFETY GATE: FAIL — publish blocked. Fix issues above before retrying.');
  process.exit(1);
}
