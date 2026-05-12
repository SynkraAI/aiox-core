#!/usr/bin/env node

/**
 * Story-Worktree Integration Hooks
 * Story 1.4: Integrates WorktreeManager with story lifecycle
 *
 * Hooks:
 * - onStoryStart: Auto-creates worktree when story moves to "In Progress"
 * - onStoryDone: Offers merge or cleanup when story moves to "Done"
 *
 * @module story-worktree-hooks
 */

const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');

// Lazy load WorktreeManager to avoid circular deps
let WorktreeManager = null;

/**
 * Load configuration from core-config.yaml
 */
async function loadConfig(rootPath) {
  const configPath = path.join(rootPath, '.aiox-core', 'core-config.yaml');
  try {
    const content = await fs.readFile(configPath, 'utf-8');
    return yaml.load(content);
  } catch (e) {
    return {};
  }
}

/**
 * Get worktree settings from config
 */
function getWorktreeSettings(config) {
  const defaults = {
    enabled: true,
    autoCreate: 'on_story_start', // on_story_start | manual | never
    autoCleanup: 'manual', // on_story_done | manual | never
    maxWorktrees: 10,
    staleDays: 30,
  };

  const settings = config?.autoClaude?.worktree || {};
  return { ...defaults, ...settings };
}

/**
 * Extract story ID from story file path or content
 */
function extractStoryId(storyPath, content) {
  // Try from filename first (e.g., story-1.4.md -> 1.4)
  const filenameMatch = path.basename(storyPath).match(/story[_-]?([\d.-]+)/i);
  if (filenameMatch) {
    return `story-${filenameMatch[1]}`;
  }

  // Try from content (e.g., # Story 1.4: Title)
  const contentMatch = content?.match(/^#\s*Story\s+([\d.]+)/im);
  if (contentMatch) {
    return `story-${contentMatch[1]}`;
  }

  // Fallback to sanitized filename
  return path.basename(storyPath, '.md').replace(/[^a-z0-9-]/gi, '-');
}

/**
 * Get story status from content
 */
function getStoryStatus(content) {
  const statusMatch = content.match(/\*\*Status:\*\*\s*([^\n]+)/i);
  if (statusMatch) {
    return statusMatch[1].trim().toLowerCase();
  }
  return 'unknown';
}

/**
 * Hook: Called when story moves to "In Progress"
 *
 * @param {string} rootPath - Project root
 * @param {string} storyPath - Path to story file
 * @param {Object} options - Hook options
 * @returns {Promise<Object>} Result with worktree info or skip reason
 */
async function onStoryStart(rootPath, storyPath, options = {}) {
  const config = await loadConfig(rootPath);
  const settings = getWorktreeSettings(config);

  // Check if worktree auto-creation is enabled
  if (!settings.enabled) {
    return { skipped: true, reason: 'Worktree feature disabled in config' };
  }

  if (settings.autoCreate === 'never') {
    return { skipped: true, reason: 'autoCreate set to never' };
  }

  if (settings.autoCreate === 'manual' && !options.force) {
    return { skipped: true, reason: 'autoCreate set to manual (use --force to override)' };
  }

  // Load WorktreeManager
  if (!WorktreeManager) {
    WorktreeManager = require('./worktree-manager');
  }

  const manager = new WorktreeManager(rootPath, {
    maxWorktrees: settings.maxWorktrees,
    staleDays: settings.staleDays,
  });

  // Read story to get ID
  const content = await fs.readFile(storyPath, 'utf-8');
  const storyId = extractStoryId(storyPath, content);

  // Check if worktree already exists
  const exists = await manager.exists(storyId);
  if (exists) {
    const existing = await manager.get(storyId);
    return {
      skipped: true,
      reason: 'Worktree already exists',
      warning: true,
      worktree: existing,
    };
  }

  // Create worktree
  try {
    const worktree = await manager.create(storyId);
    return {
      success: true,
      action: 'created',
      storyId,
      worktree,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      storyId,
    };
  }
}

/**
 * Hook: Called when story moves to "Done"
 *
 * @param {string} rootPath - Project root
 * @param {string} storyPath - Path to story file
 * @param {Object} options - Hook options
 * @returns {Promise<Object>} Result with available actions
 */
async function onStoryDone(rootPath, storyPath, options = {}) {
  const config = await loadConfig(rootPath);
  const settings = getWorktreeSettings(config);

  if (!settings.enabled) {
    return { skipped: true, reason: 'Worktree feature disabled in config' };
  }

  // Load WorktreeManager
  if (!WorktreeManager) {
    WorktreeManager = require('./worktree-manager');
  }

  const manager = new WorktreeManager(rootPath, {
    maxWorktrees: settings.maxWorktrees,
    staleDays: settings.staleDays,
  });

  // Read story to get ID
  const content = await fs.readFile(storyPath, 'utf-8');
  const storyId = extractStoryId(storyPath, content);

  // Check if worktree exists
  const exists = await manager.exists(storyId);
  if (!exists) {
    return {
      skipped: true,
      reason: 'No worktree found for this story',
      storyId,
    };
  }

  const worktree = await manager.get(storyId);

  // Auto-cleanup if configured
  if (settings.autoCleanup === 'on_story_done' && !options.keepWorktree) {
    // Check for uncommitted changes
    if (worktree.uncommittedChanges > 0) {
      return {
        success: false,
        action: 'cleanup_blocked',
        reason: `Worktree has ${worktree.uncommittedChanges} uncommitted changes`,
        worktree,
        availableActions: ['merge', 'cleanup --force'],
      };
    }

    try {
      await manager.remove(storyId);
      return {
        success: true,
        action: 'cleaned_up',
        storyId,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        storyId,
      };
    }
  }

  // Return available actions for manual handling
  return {
    success: true,
    action: 'pending_decision',
    storyId,
    worktree,
    availableActions:
      worktree.uncommittedChanges > 0 ? ['merge', 'cleanup --force'] : ['merge', 'cleanup'],
    suggestion:
      worktree.uncommittedChanges > 0
        ? 'Worktree has uncommitted changes. Consider merging first.'
        : 'Worktree is clean. You can merge or cleanup.',
  };
}

/**
 * Get worktree status for a story
 *
 * @param {string} rootPath - Project root
 * @param {string} storyPath - Path to story file
 * @returns {Promise<Object>} Worktree status or null
 */
async function getWorktreeStatus(rootPath, storyPath) {
  const config = await loadConfig(rootPath);
  const settings = getWorktreeSettings(config);

  if (!settings.enabled) {
    return { enabled: false };
  }

  // Load WorktreeManager
  if (!WorktreeManager) {
    WorktreeManager = require('./worktree-manager');
  }

  const manager = new WorktreeManager(rootPath);

  // Read story to get ID
  const content = await fs.readFile(storyPath, 'utf-8');
  const storyId = extractStoryId(storyPath, content);

  const exists = await manager.exists(storyId);

  if (!exists) {
    return {
      enabled: true,
      hasWorktree: false,
      storyId,
    };
  }

  const worktree = await manager.get(storyId);

  return {
    enabled: true,
    hasWorktree: true,
    storyId,
    worktree: {
      path: worktree.path,
      branch: worktree.branch,
      status: worktree.status,
      uncommittedChanges: worktree.uncommittedChanges,
      createdAt: worktree.createdAt,
    },
  };
}

/**
 * Format worktree status for display
 */
function formatWorktreeStatus(status) {
  if (!status.enabled) {
    return '⚫ Worktree: Disabled';
  }

  if (!status.hasWorktree) {
    return '○ Worktree: None';
  }

  const w = status.worktree;
  const statusIcon = w.status === 'active' ? '🟢' : '🟡';
  const changesInfo = w.uncommittedChanges > 0 ? ` (${w.uncommittedChanges} changes)` : ' (clean)';

  return `${statusIcon} Worktree: ${w.branch}${changesInfo}`;
}

/**
 * CLI handler
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help')) {
    console.log(`
Story-Worktree Integration Hooks

Usage:
  node story-worktree-hooks.js start <story-path> [--force]
  node story-worktree-hooks.js done <story-path> [--keep-worktree]
  node story-worktree-hooks.js status <story-path>

Commands:
  start   Trigger onStoryStart hook (creates worktree if autoCreate enabled)
  done    Trigger onStoryDone hook (offers merge/cleanup)
  status  Get worktree status for a story

Options:
  --force          Force worktree creation even if autoCreate is manual
  --keep-worktree  Don't auto-cleanup even if autoCleanup is on_story_done
  --json           Output as JSON
    `);
    return;
  }

  const command = args[0];
  const storyPath = args[1];
  const jsonOutput = args.includes('--json');

  if (!storyPath) {
    console.error('Error: Story path required');
    process.exit(1);
  }

  // Find project root
  let rootPath = process.cwd();
  while (rootPath !== '/') {
    try {
      await fs.access(path.join(rootPath, '.aiox-core'));
      break;
    } catch {
      rootPath = path.dirname(rootPath);
    }
  }

  let result;

  switch (command) {
    case 'start':
      result = await onStoryStart(rootPath, path.resolve(storyPath), {
        force: args.includes('--force'),
      });
      break;

    case 'done':
      result = await onStoryDone(rootPath, path.resolve(storyPath), {
        keepWorktree: args.includes('--keep-worktree'),
      });
      break;

    case 'status':
      result = await getWorktreeStatus(rootPath, path.resolve(storyPath));
      if (!jsonOutput) {
        console.log(formatWorktreeStatus(result));
        return;
      }
      break;

    default:
      console.error(`Unknown command: ${command}`);
      process.exit(1);
  }

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    if (result.success) {
      console.log(`✅ ${result.action}: ${result.storyId}`);
      if (result.worktree) {
        console.log(`   Branch: ${result.worktree.branch}`);
        console.log(`   Path: ${result.worktree.path}`);
      }
    } else if (result.skipped) {
      const icon = result.warning ? '⚠️' : 'ℹ️';
      console.log(`${icon} Skipped: ${result.reason}`);
    } else {
      console.error(`❌ Error: ${result.error}`);
      process.exit(1);
    }

    if (result.availableActions) {
      console.log(`\nAvailable actions: ${result.availableActions.join(', ')}`);
    }
    if (result.suggestion) {
      console.log(`\n💡 ${result.suggestion}`);
    }
  }
}

// Export for programmatic use
module.exports = {
  onStoryStart,
  onStoryDone,
  getWorktreeStatus,
  formatWorktreeStatus,
  getWorktreeSettings,
  extractStoryId,
};

// Run CLI if called directly
if (require.main === module) {
  main().catch((error) => {
    console.error('Error:', error.message);
    process.exit(1);
  });
}
