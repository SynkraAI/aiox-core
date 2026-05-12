#!/usr/bin/env node
'use strict';

/**
 * SYNAPSE Hook Wrapper — UserPromptSubmit
 *
 * Runs synapse-engine.cjs as a child process to isolate stdout/stderr.
 *
 * WHY: When Claude Code runs a hook directly, process.exit() in the hook
 * can cause unflushed stdout buffers to spill into stderr (Node.js pipe
 * race condition). Claude Code interprets ANY stderr output as a hook error.
 *
 * This wrapper runs the real hook via execFileSync which captures stdout/stderr
 * in memory buffers, then forwards only stdout to Claude Code.
 *
 * @module synapse-hook-wrapper
 */

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const hookPath = path.join(__dirname, 'synapse-engine.cjs');

// Read all stdin (Claude Code hook protocol sends JSON)
let stdinData = '';
try {
  stdinData = fs.readFileSync(0, 'utf8');
} catch (_) {
  // No stdin — exit silently
  process.exitCode = 0;
}

if (!stdinData) process.exit(0);

try {
  const stdout = execFileSync(process.execPath, [hookPath], {
    input: stdinData,
    timeout: 8000,
    maxBuffer: 1024 * 1024,
    env: process.env,
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  // Forward only stdout to Claude Code — stderr is discarded
  if (stdout && stdout.length > 0) {
    process.stdout.write(stdout);
  }
} catch (err) {
  // If hook crashed but produced stdout, still forward it
  if (err.stdout && err.stdout.length > 0) {
    process.stdout.write(err.stdout);
  }
  // Never write to stderr — silent exit
}

process.exitCode = 0;
