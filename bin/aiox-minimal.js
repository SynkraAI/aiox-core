#!/usr/bin/env node

/**
 * AIOX-FullStack Minimal Installation
 *
 * DEPRECATED (since v3.11.1, scheduled for removal in v5.0.0):
 * The --minimal mode was designed for squads which have been
 * replaced by the Squads system (OSR-8). This command now runs the
 * standard wizard through the main router.
 */

const { spawn } = require('child_process');
const path = require('path');

// Show deprecation warning
console.log('\n⚠️  DEPRECATION WARNING: aiox-minimal is deprecated.');
console.log('   The --minimal mode (squads) was replaced by Squads.');
console.log('   Running standard installation wizard instead.\n');

// Get the path to the main router (aiox.js)
const routerPath = path.join(__dirname, 'aiox.js');

// Forward all arguments to the main router
const args = process.argv.slice(2);

// Spawn the main router
const child = spawn('node', [routerPath, ...args], {
  stdio: 'inherit',
  cwd: process.cwd(),
});

child.on('close', (code) => {
  process.exit(code || 0);
});

child.on('error', (error) => {
  console.error('❌ Failed to start AIOX:', error.message);
  process.exit(1);
});
