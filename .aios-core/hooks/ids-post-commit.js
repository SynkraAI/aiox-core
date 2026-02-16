#!/usr/bin/env node
'use strict';

/**
 * IDS Post-Commit Hook (Story IDS-3)
 *
 * Runs asynchronously after each commit to update the entity registry
 * with changes from the committed files. Does NOT block the commit.
 *
 * Usage: node .aios-core/hooks/ids-post-commit.js
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

function isDocsOnlyCommit(changes) {
  if (!Array.isArray(changes) || changes.length === 0) return false;
  return changes.every((c) => isDocsOnlyPath(c.relativePath));
}

function getChangedFilesFromLastCommit() {
  try {
    const output = execSync('git diff-tree --no-commit-id --name-status -r HEAD', {
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
        // Rename/copy: use destination path (second path)
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
  } catch (err) {
    console.error(`[IDS-Hook] Failed to get changed files: ${err.message}`);
    return [];
  }
}

async function main() {
  const changes = getChangedFilesFromLastCommit();

  if (changes.length === 0) return;

  if (process.env.AIOS_IDS_FORCE !== '1' && isDocsOnlyCommit(changes)) {
    console.log('[IDS-Hook] Docs-only commit detected, skipping registry update.');
    return;
  }

  try {
    const { RegistryUpdater } = require(path.resolve(REPO_ROOT, '.aios-core/core/ids/registry-updater.js'));
    const updater = new RegistryUpdater();
    const result = await updater.processChanges(changes);

    if (result.updated > 0) {
      console.log(`[IDS-Hook] Registry updated: ${result.updated} entities processed.`);
    }

    if (result.errors.length > 0) {
      console.warn(`[IDS-Hook] ${result.errors.length} errors during update.`);
    }
  } catch (err) {
    // Post-commit hook should NEVER block workflow
    console.error(`[IDS-Hook] Registry update failed (non-blocking): ${err.message}`);
  }
}

main();
