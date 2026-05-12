#!/usr/bin/env node
'use strict';

/**
 * SYNAPSE Hook Entry Point — UserPromptSubmit
 *
 * Thin wrapper that reads JSON from stdin, delegates to SynapseEngine,
 * and writes <synapse-rules> context to stdout.
 *
 * - Silent exit on missing .synapse/ directory
 * - Silent exit on any error (never blocks the user prompt)
 * - 5s safety timeout as defense-in-depth
 *
 * @module synapse-engine-hook
 */

const path = require('path');
const { resolveHookRuntime, buildHookOutput } = require(
  path.join(__dirname, '..', '..', '.aiox-core', 'core', 'synapse', 'runtime', 'hook-runtime.js'),
);

/** Safety timeout (ms) — defense-in-depth; Claude Code also manages hook timeout. */
const HOOK_TIMEOUT_MS = 5000;

/**
 * Read all data from stdin as a JSON object.
 * @returns {Promise<object>} Parsed JSON input
 */
function readStdin() {
  return new Promise((resolve, reject) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('error', (e) => reject(e));
    process.stdin.on('data', (chunk) => { data += chunk; });
    process.stdin.on('end', () => {
      try { resolve(JSON.parse(data)); }
      catch (e) { reject(e); }
    });
  });
}

/** Main hook execution pipeline. */
async function main() {
  const input = await readStdin();
  const runtime = resolveHookRuntime(input);
  if (!runtime) return;

  const result = await runtime.engine.process(input.prompt, runtime.session);

  // QW-1: Wire updateSession() — persist bracket transitions after each prompt
  if (runtime.sessionId && runtime.sessionsDir) {
    try {
      const { updateSession } = require(
        path.join(runtime.cwd, '.aiox-core', 'core', 'synapse', 'session', 'session-manager.js'),
      );
      updateSession(runtime.sessionId, runtime.sessionsDir, {
        context: { last_bracket: result.bracket || 'FRESH' },
      });
    } catch (_err) {
      // Fire-and-forget — never block the prompt
    }
  }

  const output = JSON.stringify(buildHookOutput(result.xml));

  // Write output robustly across real process.stdout and mocked Jest streams.
  // Some mocks return boolean but never invoke callback; handle both patterns.
  await new Promise((resolve, reject) => {
    let settled = false;
    const finish = (err) => {
      if (settled) return;
      settled = true;
      if (err) reject(err);
      else resolve();
    };

    try {
      const flushed = process.stdout.write(output, (err) => finish(err));
      if (flushed) {
        setImmediate(() => finish());
      } else if (typeof process.stdout.once === 'function') {
        process.stdout.once('drain', () => finish());
      }
    } catch (err) {
      finish(err);
    }
  });
}

/** Entry point runner — lets Node exit naturally after stdout flush. */
function run() {
  const timer = setTimeout(() => {
    // process.exitCode alone won't terminate the process if active handles
    // remain (e.g. stdout backpressure). Use process.exit() to enforce the
    // 5 s hard limit and guarantee the hook never blocks Claude Code.
    process.exit(0);
  }, HOOK_TIMEOUT_MS);
  timer.unref();
  main()
    .then(() => {
      clearTimeout(timer);
      process.exitCode = 0;
    })
    .catch(() => {
      clearTimeout(timer);
      // Silent exit — stderr output triggers "hook error" in Claude Code UI
      process.exitCode = 0;
    });
}

if (require.main === module) run();

module.exports = { readStdin, main, run, HOOK_TIMEOUT_MS };
