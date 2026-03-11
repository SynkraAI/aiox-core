#!/usr/bin/env node
/**
 * Claude Code Hook: PreCompact Session Digest
 *
 * Registered as PreCompact event — fires before context compaction.
 * Reads JSON from stdin (Claude Code hook protocol), delegates to
 * the unified hook runner in aiox-core.
 *
 * Stdin format (PreCompact):
 * {
 *   "session_id": "abc123",
 *   "transcript_path": "/path/to/session.jsonl",
 *   "cwd": "/path/to/project",
 *   "hook_event_name": "PreCompact",
 *   "trigger": "auto" | "manual"
 * }
 *
 * @see .aiox-core/hooks/unified/runners/precompact-runner.js
 * @see Story MIS-3 - Session Digest (PreCompact Hook)
 * @see Story MIS-3.1 - Fix Session-Digest Hook Registration
 */

'use strict';

const path = require('path');

// Resolve project root via __dirname (same pattern as synapse-engine.cjs)
// More robust than input.cwd — doesn't depend on external input
const PROJECT_ROOT = path.resolve(__dirname, '..', '..');

/** Safety timeout (ms) — defense-in-depth; Claude Code also manages hook timeout. */
const HOOK_TIMEOUT_MS = 9000;

/**
 * Read all data from stdin as a JSON object.
 * Same pattern as synapse-engine.cjs.
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

/**
 * Resolve runner path — works in both framework-dev and installed projects.
 * Framework-dev: PROJECT_ROOT/.aiox-core/hooks/unified/runners/precompact-runner.js
 * Installed:     PROJECT_ROOT/node_modules/aiox-core/.aiox-core/hooks/unified/runners/precompact-runner.js
 */
function resolveRunnerPath() {
  const fs = require('fs');
  const candidates = [
    path.join(PROJECT_ROOT, '.aiox-core', 'hooks', 'unified', 'runners', 'precompact-runner.js'),
    path.join(PROJECT_ROOT, 'node_modules', 'aiox-core', '.aiox-core', 'hooks', 'unified', 'runners', 'precompact-runner.js'),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

/** Main hook execution pipeline. */
async function main() {
  const input = await readStdin();

  const runnerPath = resolveRunnerPath();
  if (!runnerPath) return; // Runner not available — silent exit

  // Build context object expected by onPreCompact
  const context = {
    sessionId: input.session_id,
    projectDir: input.cwd || PROJECT_ROOT,
    transcriptPath: input.transcript_path,
    trigger: input.trigger || 'auto',
    hookEventName: input.hook_event_name || 'PreCompact',
    permissionMode: input.permission_mode,
    conversation: input,
    provider: 'claude',
  };

  // Spawn a detached child process so the digest is fire-and-forget.
  // Using require() in-process keeps the event loop alive (setImmediate inside
  // the runner), causing the hook to block until the 9 s safety timeout.
  // The child receives context via AIOX_HOOK_CONTEXT env var and calls
  // onPreCompact() exported by the runner module.
  try {
    const { spawn } = require('child_process');
    let contextJson;
    try {
      contextJson = JSON.stringify(context);
    } catch (_) {
      contextJson = '{}';
    }
    const inlineScript = [
      `const ctx = JSON.parse(process.env.AIOX_HOOK_CONTEXT || '{}');`,
      `const { onPreCompact } = require(${JSON.stringify(runnerPath)});`,
      `onPreCompact(ctx).catch(() => {});`,
    ].join('\n');
    const child = spawn(process.execPath, ['-e', inlineScript], {
      detached: true,
      stdio: 'ignore',
      env: { ...process.env, AIOX_HOOK_CONTEXT: contextJson },
    });
    child.on('error', () => {});
    child.unref();
  } catch (_) {
    // Silent — spawn failures must not crash the hook
  }
}

/** Entry point runner — sets safety timeout and executes main(). */
function run() {
  // Safety timeout — force exit only as last resort (no stdout to flush at this point).
  const timer = setTimeout(() => {
    process.exit(0);
  }, HOOK_TIMEOUT_MS);
  timer.unref();

  main()
    .then(() => {
      clearTimeout(timer);
      // Let event loop drain naturally — process.exitCode allows stdout flush
      process.exitCode = 0;
    })
    .catch(() => {
      clearTimeout(timer);
      // Silent exit — never write to stderr (triggers "hook error" in Claude Code)
      process.exitCode = 0;
    });
}

if (require.main === module) run();

module.exports = { readStdin, main, run, HOOK_TIMEOUT_MS };
