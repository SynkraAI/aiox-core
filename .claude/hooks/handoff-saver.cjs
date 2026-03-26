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

  // Generate agent activity summaries from Tier 2 session state (Story AIOX-HO-2.1)
  let agentActivitySection = '';
  try {
    const sessionStateModule = require(path.join(projectRoot, '.claude', 'lib', 'handoff', 'session-state'));
    const agentActivity = require(path.join(projectRoot, '.claude', 'lib', 'handoff', 'agent-activity'));
    const sessionState = sessionStateModule.getSessionState(projectRoot);
    if (sessionState && sessionState.events && sessionState.events.length > 0) {
      const summaries = agentActivity.generateAgentSummary(sessionState);
      agentActivitySection = agentActivity.formatSummaryForHandoff(summaries);
    }
  } catch (_) {
    // Summary generation failure is non-blocking
  }

  // Inject Agent Activity section into existing handoff files
  if (agentActivitySection) {
    const allProjects = detectProjects(projectRoot);
    for (const proj of allProjects) {
      try {
        const fp = crossSession.getHandoffFilePath(proj, projectRoot);
        if (fs.existsSync(fp)) {
          let content = fs.readFileSync(fp, 'utf8');
          // Remove existing Agent Activity section if present
          content = content.replace(/\n?## Agent Activity[\s\S]*?(?=\n## |\n---\n|$)/, '');
          // Find insertion point: before Key Docs or How to Continue
          const insertBefore = content.search(/\n## (Key Docs|Documentacao Chave|How to Continue|Como Continuar)/);
          if (insertBefore > -1) {
            content = content.slice(0, insertBefore) + '\n\n' + agentActivitySection.trim() + '\n' + content.slice(insertBefore);
          } else {
            // Append before footer
            const footerIdx = content.lastIndexOf('\n---\n');
            if (footerIdx > -1) {
              content = content.slice(0, footerIdx) + '\n\n' + agentActivitySection.trim() + '\n' + content.slice(footerIdx);
            } else {
              content += '\n\n' + agentActivitySection.trim() + '\n';
            }
          }
          fs.writeFileSync(fp, content, 'utf8');
        }
      } catch (_) {
        // Individual project failure -- continue with others
      }
    }
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
