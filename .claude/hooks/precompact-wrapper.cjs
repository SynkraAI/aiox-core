#!/usr/bin/env node
'use strict';

/**
 * PreCompact Hook Wrapper
 *
 * Same isolation pattern as synapse-wrapper.cjs — runs the real hook
 * as a child process to prevent stdout→stderr buffer leak from process.exit().
 *
 * @module precompact-hook-wrapper
 */

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const hookPath = path.join(__dirname, 'precompact-session-digest.cjs');

let stdinData = '';
try {
  stdinData = fs.readFileSync(0, 'utf8');
} catch (_) {
  process.exitCode = 0;
}

if (!stdinData) process.exit(0);

try {
  const stdout = execFileSync(process.execPath, [hookPath], {
    input: stdinData,
    timeout: 12000,
    maxBuffer: 1024 * 1024,
    env: process.env,
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  if (stdout && stdout.length > 0) {
    process.stdout.write(stdout);
  }
} catch (err) {
  if (err.stdout && err.stdout.length > 0) {
    process.stdout.write(err.stdout);
  }
}

process.exitCode = 0;
