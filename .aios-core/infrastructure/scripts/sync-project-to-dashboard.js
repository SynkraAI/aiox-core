#!/usr/bin/env node
/**
 * Sync Project Info to Dashboard
 *
 * Reads project info from session.json and updates dashboard/status.json
 * This allows the dashboard to show project context like the terminal does
 *
 * Usage:
 *   node sync-project-to-dashboard.js
 */

const fs = require('fs').promises;
const path = require('path');

const SESSION_FILE = '.aios/session.json';
const DASHBOARD_STATUS_FILE = '.aios/dashboard/status.json';

async function syncProjectToDashboard() {
  // Find project root (supports running from subdirectories)
  let projectRoot = process.cwd();

  // Normalize path (remove trailing slash)
  projectRoot = path.normalize(projectRoot);

  // Debug: log current directory
  // console.log('[DEBUG] Starting from:', projectRoot);

  // Strategy 1: If running from apps/dashboard (with or without trailing slash)
  if (projectRoot.endsWith(path.join('apps', 'dashboard')) ||
      projectRoot.endsWith(path.join('apps', 'dashboard', path.sep))) {
    projectRoot = path.resolve(projectRoot, '../..');
    // console.log('[DEBUG] Detected apps/dashboard, moved to:', projectRoot);
  }

  // Strategy 2: Walk up until we find .aios-core directory
  while (!require('fs').existsSync(path.join(projectRoot, '.aios-core')) && projectRoot !== '/') {
    const oldRoot = projectRoot;
    projectRoot = path.dirname(projectRoot);
    // console.log('[DEBUG] Walking up from', oldRoot, 'to', projectRoot);

    // Prevent infinite loop
    if (projectRoot === oldRoot) break;
  }

  // Final validation
  if (!require('fs').existsSync(path.join(projectRoot, '.aios-core'))) {
    console.error('❌ Error: Could not find AIOS project root');
    console.error('   Searched from:', process.cwd());
    process.exit(1);
  }

  try {
    // Read session.json (terminal data source)
    const sessionPath = path.join(projectRoot, SESSION_FILE);
    const sessionData = JSON.parse(await fs.readFile(sessionPath, 'utf-8'));

    // Read dashboard status.json
    const dashboardPath = path.join(projectRoot, DASHBOARD_STATUS_FILE);
    let dashboardData = {};

    try {
      dashboardData = JSON.parse(await fs.readFile(dashboardPath, 'utf-8'));
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
      // File doesn't exist, create default structure
      dashboardData = {
        version: '1.0',
        stories: { inProgress: [], completed: [] },
        updatedAt: new Date().toISOString(),
      };
    }

    // Extract project info from session.json
    const projectInfo = {
      name: sessionData.project?.name,
      emoji: sessionData.project?.emoji,
      type: sessionData.project?.type,
    };

    const statusInfo = {
      progress: sessionData.status?.progress,
      emoji: sessionData.status?.emoji,
      phase: sessionData.status?.phase,
    };

    const contextInfo = {
      epic: sessionData.context?.epic,
      story: sessionData.context?.story,
      task: sessionData.context?.task,
    };

    // Update dashboard data (preserve existing fields)
    dashboardData.project = projectInfo;
    dashboardData.status = statusInfo;
    dashboardData.context = contextInfo;
    dashboardData.updatedAt = new Date().toISOString();

    // Write back to dashboard status.json
    await fs.writeFile(
      dashboardPath,
      JSON.stringify(dashboardData, null, 2),
      'utf-8',
    );

    console.log('✅ Dashboard status.json synced with session.json');
    console.log(`📊 Project: ${projectInfo.emoji} ${projectInfo.name}`);
    console.log(`📈 Progress: [${statusInfo.progress}] ${statusInfo.emoji}`);
    if (contextInfo.epic || contextInfo.story || contextInfo.task) {
      const contextParts = [contextInfo.epic, contextInfo.story, contextInfo.task]
        .filter(Boolean);
      console.log(`📍 Context: ${contextParts.join(' → ')}`);
    }

  } catch (error) {
    console.error('❌ Error syncing project to dashboard:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  syncProjectToDashboard();
}

module.exports = { syncProjectToDashboard };
