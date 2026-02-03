#!/usr/bin/env node

/**
 * AIOS-FullStack Minimal Installation
 * Wrapper that launches aios-init.js in minimal mode
 *
 * Minimal mode only shows expansion-creator pack,
 * which provides tools to install other expansion packs manually.
 */

const { execSync } = require('child_process');
const path = require('path');

// Get the path to aios-init.js
const initScriptPath = path.join(__dirname, 'aios-init.js');

try {
  // Execute aios-init.js with --minimal flag
  execSync(`node "${initScriptPath}" --minimal`, {
    stdio: 'inherit',
    cwd: process.cwd(),
  });
} catch (error) {
  // Error is already displayed by child process
  process.exit(error.status || 1);
}
