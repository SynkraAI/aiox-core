#!/usr/bin/env node
'use strict';

/**
 * Publish Safety Gate — Public Tarball + Dependency Validation
 * Story INS-4.10, INS-4.12, PRO-13.5
 *
 * Prevents publishing incomplete packages by validating:
 * 1. Public package file count meets minimum threshold (>= 50)
 * 2. Public package excludes premium pro/ content
 * 3. (INS-4.12) .aiox-core/package.json dependency completeness
 *
 * Exit codes: 0 = PASS, 1 = FAIL
 * Usage: node bin/utils/validate-publish.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECT_ROOT = path.join(__dirname, '..', '..');
const MIN_FILE_COUNT = 50;
const PRO_PATH_PATTERN = /^pro(?:\/|$)/;
const DEFAULT_PACK_TIMEOUT_MS = 300000;
const parsedPackTimeoutMs = Number.parseInt(
  process.env.AIOX_VALIDATE_PUBLISH_PACK_TIMEOUT_MS || '',
  10,
);
const PACK_TIMEOUT_MS =
  Number.isFinite(parsedPackTimeoutMs) && parsedPackTimeoutMs > 0
    ? parsedPackTimeoutMs
    : DEFAULT_PACK_TIMEOUT_MS;
const PACK_MAX_BUFFER = 1024 * 1024 * 20;

let passed = true;
let fileCount = 0;

function parsePackedFiles(packOutput) {
  try {
    const parsed = JSON.parse(packOutput);
    const firstPackage = Array.isArray(parsed) ? parsed[0] : parsed;
    if (firstPackage && Array.isArray(firstPackage.files)) {
      return firstPackage.files
        .map((file) => file && file.path)
        .filter((filePath) => typeof filePath === 'string');
    }
  } catch (_err) {
    // Older npm versions may emit notice lines instead of valid JSON; parse that legacy output.
  }

  return packOutput
    .split('\n')
    .filter(
      (line) =>
        line.includes('npm notice') &&
        !line.includes('Tarball') &&
        !line.includes('name:') &&
        !line.includes('version:') &&
        !line.includes('filename:') &&
        !line.includes('package size:') &&
        !line.includes('unpacked size:') &&
        !line.includes('shasum:') &&
        !line.includes('integrity:') &&
        !line.includes('total files:'),
    )
    .map((line) => {
      const sizedPath = line.match(/npm notice\s+[\d.]+[kMG]?B?\s+(.+)/);
      return sizedPath ? sizedPath[1].trim() : line.replace(/^.*npm notice\s+/, '').trim();
    })
    .filter(Boolean);
}

// Check 1/2: public tarball shape
console.log('--- Publish Safety Gate (PRO-13.5) ---\n');

try {
  const packOutput = execSync('npm pack --dry-run --json', {
    encoding: 'utf8',
    cwd: PROJECT_ROOT,
    timeout: PACK_TIMEOUT_MS,
    maxBuffer: PACK_MAX_BUFFER,
  });
  const packedFiles = parsePackedFiles(packOutput);
  fileCount = packedFiles.length;

  if (fileCount < MIN_FILE_COUNT) {
    console.error(`FAIL: Package has only ${fileCount} files, expected >= ${MIN_FILE_COUNT}.`);
    console.error('  Check that all directories in "files" array are populated.');
    passed = false;
  } else {
    console.log(`PASS: Package contains ${fileCount} files (minimum: ${MIN_FILE_COUNT})`);
  }

  const proFiles = packedFiles.filter((filePath) => PRO_PATH_PATTERN.test(filePath));
  if (proFiles.length > 0) {
    console.error(`FAIL: Public package includes ${proFiles.length} pro/ file(s).`);
    console.error('  Pro content must be distributed through the authenticated artifact channel.');
    for (const filePath of proFiles.slice(0, 20)) {
      console.error(`  - ${filePath}`);
    }
    if (proFiles.length > 20) {
      console.error(`  ... and ${proFiles.length - 20} more`);
    }
    passed = false;
  } else {
    console.log('PASS: Public package excludes pro/ content');
  }
} catch (err) {
  console.error(`FAIL: npm pack --dry-run failed: ${err.message}`);
  passed = false;
}

// Check 4 (INS-4.12): .aiox-core dependency completeness
console.log('');
console.log('--- Dependency Completeness (INS-4.12) ---\n');
try {
  const depValidatorPath = path.join(PROJECT_ROOT, 'scripts', 'validate-aiox-core-deps.js');
  if (fs.existsSync(depValidatorPath)) {
    execSync(`node "${depValidatorPath}"`, {
      encoding: 'utf8',
      cwd: PROJECT_ROOT,
      timeout: 30000,
      stdio: 'inherit',
    });
    console.log('PASS: .aiox-core dependency completeness validated');
  } else {
    console.log('SKIP: scripts/validate-aiox-core-deps.js not found');
  }
} catch (_depErr) {
  console.error('FAIL: .aiox-core dependency completeness check failed');
  console.error('  Fix: Run "node scripts/validate-aiox-core-deps.js" to see details');
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
