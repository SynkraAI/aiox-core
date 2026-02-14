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
 * - All errors logged to stderr with [synapse-hook] prefix
 * - 5s safety timeout as defense-in-depth
 *
 * @module synapse-engine-hook
 */

const path = require('path');
const fs = require('fs');

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
  const { sessionId, cwd, prompt } = input;
  if (!cwd) return;
  const synapsePath = path.join(cwd, '.synapse');
  if (!fs.existsSync(synapsePath)) return;

  const { loadSession } = require(
    path.join(cwd, '.aios-core', 'core', 'synapse', 'session', 'session-manager.js'),
  );
  const { SynapseEngine } = require(
    path.join(cwd, '.aios-core', 'core', 'synapse', 'engine.js'),
  );

  const sessionsDir = path.join(synapsePath, 'sessions');
  const session = loadSession(sessionId, sessionsDir) || { prompt_count: 0 };

  // SYN-13: Read _active-agent.json bridge file as fallback for missing active_agent
  if (!session.active_agent || !session.active_agent.id) {
    const bridgePath = path.join(sessionsDir, '_active-agent.json');
    try {
      if (fs.existsSync(bridgePath)) {
        const bridgeData = JSON.parse(fs.readFileSync(bridgePath, 'utf8'));
        if (bridgeData && bridgeData.id) {
          session.active_agent = bridgeData;
        }
      }
    } catch (_err) {
      // Graceful: bridge read failure is non-blocking
    }
  }

  const engine = new SynapseEngine(synapsePath);
  const result = await engine.process(prompt, session);

  process.stdout.write(JSON.stringify({
    hookSpecificOutput: { additionalContext: result.xml || '' },
  }));
}

/**
 * Safely exit the process — no-op inside Jest workers to prevent worker crashes.
 * @param {number} code - Exit code
 */
function safeExit(code) {
  if (process.env.JEST_WORKER_ID) return;
  process.exit(code);
}

/** Entry point runner — sets safety timeout and executes main(). */
function run() {
  const timer = setTimeout(() => safeExit(0), HOOK_TIMEOUT_MS);
  timer.unref();
  main().catch((err) => {
    console.error(`[synapse-hook] ${err.message}`);
    safeExit(0);
  });
}

if (require.main === module) run();

module.exports = { readStdin, main, run, HOOK_TIMEOUT_MS };
