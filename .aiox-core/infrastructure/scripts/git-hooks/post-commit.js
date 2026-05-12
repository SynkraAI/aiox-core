#!/usr/bin/env node

/**
 * Git Post-Commit Hook - AIOX ProjectStatusLoader Cache Invalidation
 *
 * Story ACT-3: Clears the project status cache after every commit
 * so that the next agent activation sees fresh data.
 *
 * Cross-platform: Uses Node.js for Windows/macOS/Linux compatibility.
 *
 * Installation:
 *   Copy or symlink to .husky/post-commit, or add to your git hooks:
 *     node .aiox-core/infrastructure/scripts/git-hooks/post-commit.js
 */

const fs = require('fs');
const path = require('path');

/**
 * Find the project root by walking up from the current directory
 * looking for .aiox-core directory.
 *
 * @returns {string|null} Project root or null
 */
function findProjectRoot() {
  let dir = process.cwd();

  // Walk up looking for .aiox-core
  for (let i = 0; i < 10; i++) {
    if (fs.existsSync(path.join(dir, '.aiox-core'))) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) break; // Reached filesystem root
    dir = parent;
  }

  return process.cwd(); // Fallback
}

/**
 * Clear all project-status cache files in the .aiox directory.
 * Handles both standard cache and worktree-specific cache files.
 */
function clearProjectStatusCache() {
  const projectRoot = findProjectRoot();
  const aioxDir = path.join(projectRoot, '.aiox');

  if (!fs.existsSync(aioxDir)) {
    return; // No .aiox directory - nothing to clear
  }

  try {
    const files = fs.readdirSync(aioxDir);

    for (const file of files) {
      // Match project-status.yaml and project-status-{hash}.yaml
      if (file.startsWith('project-status') && file.endsWith('.yaml')) {
        const filePath = path.join(aioxDir, file);
        try {
          fs.unlinkSync(filePath);
        } catch (err) {
          // Ignore errors (file might be locked by another process)
        }
      }
    }
  } catch (err) {
    // Silently fail - this is a non-critical hook
  }
}

// Execute
clearProjectStatusCache();
