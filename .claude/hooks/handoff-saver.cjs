#!/usr/bin/env node
'use strict';

/**
 * Handoff Saver — PreCompact Hook Component
 *
 * Called by precompact-wrapper.cjs BEFORE the session digest.
 * Triggers Tier 3 (Cross-Session Handoff) save.
 *
 * Reads stdin JSON from Claude Code hook protocol, detects active project,
 * and saves/trims the cross-session handoff file.
 *
 * CRITICAL: Errors here MUST NOT block PreCompact.
 * Timeout: 5000ms max.
 *
 * @module handoff-saver
 * @see .claude/rules/unified-handoff.md
 * @see Story AIOX-HO-1
 */

const path = require('path');
const fs = require('fs');

const TIMEOUT_MS = 5000;

/**
 * Read JSON from stdin (Claude Code hook protocol).
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
 * Detect active project from the session handoff files in docs/.
 * @param {string} projectRoot - Project root directory
 * @returns {string[]} Array of project names
 */
function detectProjects(projectRoot) {
  const docsDir = path.join(projectRoot, 'docs');
  try {
    const files = fs.readdirSync(docsDir);
    return files
      .filter((f) => f.startsWith('session-handoff-') && f.endsWith('.md'))
      .map((f) => f.replace('session-handoff-', '').replace('.md', ''));
  } catch (_) {
    return [];
  }
}

/**
 * Main handler: save and trim cross-session handoffs.
 */
async function main() {
  let input;
  try {
    input = await readStdin();
  } catch (_) {
    // No stdin or parse error -- exit silently
    return;
  }

  const projectRoot = input.cwd || path.resolve(__dirname, '..', '..');

  // Load Tier 3 module
  let crossSession;
  try {
    crossSession = require(path.join(projectRoot, '.claude', 'lib', 'handoff', 'cross-session-handoff'));
  } catch (_) {
    // Module not available -- exit silently
    return;
  }

  // Detect and trim all active project handoffs
  const projects = detectProjects(projectRoot);
  for (const project of projects) {
    try {
      const filePath = crossSession.getHandoffFilePath(project, projectRoot);
      if (fs.existsSync(filePath)) {
        crossSession.trimHandoff(filePath, projectRoot);
      }
    } catch (_) {
      // Individual project failure -- continue with others
    }
  }
}

/**
 * Entry point with timeout protection.
 */
function run() {
  const timer = setTimeout(() => {
    process.exitCode = 0;
    process.exit(0);
  }, TIMEOUT_MS);
  timer.unref();

  main()
    .then(() => {
      clearTimeout(timer);
      process.exitCode = 0;
    })
    .catch(() => {
      clearTimeout(timer);
      // Silent exit -- never block PreCompact
      process.exitCode = 0;
    });
}

if (require.main === module) run();

module.exports = { readStdin, detectProjects, main, run, TIMEOUT_MS };
