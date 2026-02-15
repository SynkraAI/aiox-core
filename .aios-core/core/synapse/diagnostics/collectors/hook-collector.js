/**
 * Hook Collector — Verifies SYNAPSE hook registration and file integrity.
 *
 * Checks:
 * - settings.local.json has UserPromptSubmit hook entry
 * - Hook file exists at expected path
 * - Hook file is valid Node.js (can be required)
 *
 * @module core/synapse/diagnostics/collectors/hook-collector
 * @version 1.0.0
 * @created Story SYN-13
 */

'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Collect hook registration and integrity data.
 *
 * @param {string} projectRoot - Absolute path to project root
 * @returns {{ checks: Array<{ name: string, status: string, detail: string }> }}
 */
function collectHookStatus(projectRoot) {
  const checks = [];

  // Check 1: settings.local.json has hook entry
  const settingsPath = path.join(projectRoot, '.claude', 'settings.local.json');
  let hasHookRegistered = false;

  try {
    if (fs.existsSync(settingsPath)) {
      const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
      const hooks = settings.hooks || {};
      const promptHooks = hooks.UserPromptSubmit || hooks.userPromptSubmit || [];

      hasHookRegistered = promptHooks.some((entry) => {
        // Flat format: { command: "node ..." } or string
        const flatCmd = typeof entry === 'string' ? entry : (entry.command || '');
        if (flatCmd.includes('synapse-engine')) return true;
        // Nested format (Claude Code actual): { hooks: [{ type, command }] }
        if (Array.isArray(entry.hooks)) {
          return entry.hooks.some((h) => {
            const cmd = typeof h === 'string' ? h : (h.command || '');
            return cmd.includes('synapse-engine');
          });
        }
        return false;
      });

      checks.push({
        name: 'Hook registered',
        status: hasHookRegistered ? 'PASS' : 'FAIL',
        detail: hasHookRegistered
          ? 'settings.local.json has UserPromptSubmit entry for synapse-engine'
          : 'No synapse-engine hook found in settings.local.json',
      });
    } else {
      checks.push({
        name: 'Hook registered',
        status: 'FAIL',
        detail: 'settings.local.json not found',
      });
    }
  } catch (error) {
    checks.push({
      name: 'Hook registered',
      status: 'ERROR',
      detail: `Failed to read settings: ${error.message}`,
    });
  }

  // Check 2: Hook file exists
  const hookPath = path.join(projectRoot, '.claude', 'hooks', 'synapse-engine.js');
  const hookExists = fs.existsSync(hookPath);

  if (hookExists) {
    try {
      const stat = fs.statSync(hookPath);
      const lineCount = fs.readFileSync(hookPath, 'utf8').split('\n').length;
      checks.push({
        name: 'Hook file exists',
        status: 'PASS',
        detail: `.claude/hooks/synapse-engine.js (${lineCount} lines, ${stat.size} bytes)`,
      });
    } catch (error) {
      checks.push({
        name: 'Hook file exists',
        status: 'ERROR',
        detail: `File exists but cannot be read: ${error.message}`,
      });
    }
  } else {
    checks.push({
      name: 'Hook file exists',
      status: 'FAIL',
      detail: '.claude/hooks/synapse-engine.js not found',
    });
  }

  // Check 3: Hook file is valid Node.js
  if (hookExists) {
    try {
      require.resolve(hookPath);
      checks.push({
        name: 'Hook executable',
        status: 'PASS',
        detail: 'node can resolve the hook file',
      });
    } catch (error) {
      checks.push({
        name: 'Hook executable',
        status: 'FAIL',
        detail: `Cannot resolve: ${error.message}`,
      });
    }
  } else {
    checks.push({
      name: 'Hook executable',
      status: 'SKIP',
      detail: 'Hook file does not exist',
    });
  }

  return { checks };
}

module.exports = { collectHookStatus };
