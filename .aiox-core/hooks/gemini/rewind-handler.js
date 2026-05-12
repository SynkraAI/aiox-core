#!/usr/bin/env node
/**
 * AIOX Rewind Handler
 * Story GEMINI-INT.14 - /rewind Integration
 *
 * Syncs Gemini's /rewind command with AIOX state.
 */

const fs = require('fs');
const path = require('path');

/**
 * Sanitize sessionId to prevent path traversal
 * Only allow alphanumeric, dash, and underscore
 */
function sanitizeSessionId(sessionId) {
  if (!sessionId) return null;
  // Remove any path separators and only keep safe characters
  return sessionId.replace(/[^a-zA-Z0-9_-]/g, '');
}

async function handleRewind() {
  const projectDir = process.env.GEMINI_PROJECT_DIR || process.cwd();
  const rawSessionId = process.env.GEMINI_SESSION_ID;

  // Sanitize sessionId to prevent path traversal
  const sessionId = sanitizeSessionId(rawSessionId);

  // Sync with AIOX memory layer
  try {
    const memoryDir = path.join(projectDir, '.aiox', 'memory');

    if (fs.existsSync(memoryDir) && sessionId) {
      // Clear session-specific memory (only if sessionId is valid)
      const sessionMemory = path.join(memoryDir, `session-${sessionId}.json`);
      // Verify the resolved path is still within memoryDir (defense in depth)
      const resolvedPath = path.resolve(sessionMemory);
      const resolvedMemoryDir = path.resolve(memoryDir);
      if (resolvedPath.startsWith(resolvedMemoryDir) && fs.existsSync(sessionMemory)) {
        fs.unlinkSync(sessionMemory);
      }
    }

    // Log the rewind event
    const logDir = path.join(projectDir, '.aiox', 'logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    const rewindLog = {
      timestamp: new Date().toISOString(),
      sessionId,
      action: 'rewind',
      provider: 'gemini',
    };

    const logPath = path.join(logDir, 'rewind.jsonl');
    fs.appendFileSync(logPath, JSON.stringify(rewindLog) + '\n');

    console.log(JSON.stringify({ status: 'success', synced: true }));
  } catch (error) {
    console.log(JSON.stringify({ status: 'error', error: error.message }));
  }

  process.exit(0);
}

handleRewind();
