#!/usr/bin/env node
'use strict';

/**
 * IDS Pre-Push Hook (Story IDS-3)
 *
 * Runs synchronously before push to ensure registry is up-to-date.
 * Processes all files that differ between local HEAD and remote tracking branch.
 * Exits with 0 (success) even on errors — registry issues should not block push.
 *
 * Usage: node .aios-core/hooks/ids-pre-push.js
 */

const { execSync } = require('child_process');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '../..');

function isDocsOnlyPath(relativePath) {
  const p = String(relativePath || '').replace(/\\/g, '/');
  if (!p) return false;

  if (p.startsWith('docs/')) return true;
  if (p === 'README.md') return true;
  if (p === 'CHANGELOG.md') return true;
  if (p === 'CONTRIBUTING.md') return true;
  if (p === 'CODE_OF_CONDUCT.md') return true;
  if (p === 'AGENTS.md') return true;

  return false;
}

function isDocsOnlyPush(changes) {
  if (!Array.isArray(changes) || changes.length === 0) return false;
  return changes.every((c) => isDocsOnlyPath(c.relativePath));
}

function getChangedFilesSinceRemote() {
  try {
    const trackingBranch = execSync('git rev-parse --abbrev-ref --symbolic-full-name @{u}', {
      cwd: REPO_ROOT,
      encoding: 'utf8',
      timeout: 5000,
    }).trim();

    const output = execSync(`git diff --name-status ${trackingBranch}...HEAD`, {
      cwd: REPO_ROOT,
      encoding: 'utf8',
      timeout: 10000,
    });

    const changes = [];
    const lines = output.trim().split('\n').filter(Boolean);

    for (const line of lines) {
      const [status, ...fileParts] = line.split('\t');

      if (fileParts.length === 0) continue;

      let action;
      let filePath;

      if (status === 'A') {
        action = 'add';
        filePath = fileParts[0];
      } else if (status === 'M') {
        action = 'change';
        filePath = fileParts[0];
      } else if (status === 'D') {
        action = 'unlink';
        filePath = fileParts[0];
      } else if (status.startsWith('R') || status.startsWith('C')) {
        action = status.startsWith('C') ? 'add' : 'change';
        filePath = fileParts[fileParts.length - 1];
      } else {
        continue;
      }

      if (!filePath) continue;
      changes.push({
        action,
        relativePath: filePath,
        filePath: path.resolve(REPO_ROOT, filePath),
      });
    }

    return changes;
  } catch {
    // No tracking branch or git error — skip
    return [];
  }
}

async function main() {
  const changes = getChangedFilesSinceRemote();

  if (changes.length === 0) {
    console.log('[IDS-Hook] No relevant changes for registry update.');
    process.exit(0);
  }

  if (process.env.AIOS_IDS_FORCE !== '1' && isDocsOnlyPush(changes)) {
    console.log('[IDS-Hook] Docs-only push detected, skipping registry update.');
    process.exit(0);
  }

  try {
    const { RegistryUpdater } = require(path.resolve(REPO_ROOT, '.aios-core/core/ids/registry-updater.js'));
    const updater = new RegistryUpdater();
    const result = await updater.processChanges(changes);

    if (result.updated > 0) {
      console.log(`[IDS-Hook] Registry synced: ${result.updated} entities updated before push.`);
    }
  } catch (err) {
    // Pre-push hook should warn but NOT block push
    console.warn(`[IDS-Hook] Registry sync failed (non-blocking): ${err.message}`);
  }

  process.exit(0);
}

main();
