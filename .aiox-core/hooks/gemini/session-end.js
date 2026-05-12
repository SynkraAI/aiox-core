#!/usr/bin/env node
/**
 * AIOX Session End Hook for Gemini CLI
 * Story GEMINI-INT.6 - AIOX Hooks System
 *
 * Executes at session end to persist state to Memory Layer.
 */

const fs = require('fs');
const path = require('path');

async function sessionEnd() {
  const projectDir = process.env.GEMINI_PROJECT_DIR || process.cwd();
  const sessionId = process.env.GEMINI_SESSION_ID || 'unknown';

  // Persist session summary
  try {
    const sessionDir = path.join(projectDir, '.aiox', 'sessions');
    if (!fs.existsSync(sessionDir)) {
      fs.mkdirSync(sessionDir, { recursive: true });
    }

    // Load session files if tracked
    let modifiedFiles = [];
    const sessionFilesPath = path.join(projectDir, '.aiox', 'session-files.json');
    if (fs.existsSync(sessionFilesPath)) {
      modifiedFiles = JSON.parse(fs.readFileSync(sessionFilesPath, 'utf8'));
      // Clean up
      fs.unlinkSync(sessionFilesPath);
    }

    // Count tool executions
    let toolCount = 0;
    const toolLogPath = path.join(projectDir, '.aiox', 'logs', 'tool-results.jsonl');
    if (fs.existsSync(toolLogPath)) {
      const content = fs.readFileSync(toolLogPath, 'utf8');
      toolCount = content.split('\n').filter((l) => l.includes(sessionId)).length;
    }

    // Create session summary
    const summary = {
      sessionId,
      provider: 'gemini',
      startedAt: process.env.GEMINI_SESSION_START || new Date().toISOString(),
      endedAt: new Date().toISOString(),
      filesModified: modifiedFiles.length,
      toolExecutions: toolCount,
      files: modifiedFiles,
    };

    // Save session
    const sessionPath = path.join(sessionDir, `${sessionId}.json`);
    fs.writeFileSync(sessionPath, JSON.stringify(summary, null, 2));

    // Update recent sessions index
    updateRecentSessions(sessionDir, sessionId);

    console.log(JSON.stringify({ status: 'success', summary }));
  } catch (error) {
    console.log(JSON.stringify({ status: 'error', error: error.message }));
  }

  process.exit(0);
}

function updateRecentSessions(sessionDir, sessionId) {
  try {
    const indexPath = path.join(sessionDir, 'recent.json');
    let recent = [];

    if (fs.existsSync(indexPath)) {
      recent = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
    }

    // Add to front, keep last 20
    recent.unshift({
      sessionId,
      timestamp: new Date().toISOString(),
      provider: 'gemini',
    });

    recent = recent.slice(0, 20);

    fs.writeFileSync(indexPath, JSON.stringify(recent, null, 2));
  } catch (error) {
    // Non-critical
  }
}

sessionEnd();
