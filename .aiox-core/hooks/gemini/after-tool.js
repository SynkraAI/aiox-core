#!/usr/bin/env node
/**
 * AIOX After Tool Hook for Gemini CLI
 * Story GEMINI-INT.6 - AIOX Hooks System
 *
 * Executes after tool completion for audit logging.
 */

const fs = require('fs');
const path = require('path');

async function afterTool() {
  const input = process.argv[2] ? JSON.parse(process.argv[2]) : {};
  const toolName = input.tool || '';
  const toolResult = input.result || {};

  // Log execution result
  logToolResult(toolName, toolResult);

  // Track file modifications
  if (toolName === 'write_file' || toolName === 'replace' || toolName === 'edit') {
    trackFileModification(input.args?.path || input.args?.file_path);
  }

  console.log(JSON.stringify({ status: 'success' }));
  process.exit(0);
}

function logToolResult(tool, result) {
  try {
    const projectDir = process.env.GEMINI_PROJECT_DIR || process.cwd();
    const logDir = path.join(projectDir, '.aiox', 'logs');

    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    const logEntry = {
      timestamp: new Date().toISOString(),
      tool,
      success: result.success !== false,
      provider: 'gemini',
      sessionId: process.env.GEMINI_SESSION_ID,
    };

    const logPath = path.join(logDir, 'tool-results.jsonl');
    fs.appendFileSync(logPath, JSON.stringify(logEntry) + '\n');
  } catch (error) {
    // Non-critical
  }
}

function trackFileModification(filePath) {
  if (!filePath) return;

  try {
    const projectDir = process.env.GEMINI_PROJECT_DIR || process.cwd();
    const trackPath = path.join(projectDir, '.aiox', 'session-files.json');

    let files = [];
    if (fs.existsSync(trackPath)) {
      files = JSON.parse(fs.readFileSync(trackPath, 'utf8'));
    }

    if (!files.includes(filePath)) {
      files.push(filePath);
      fs.writeFileSync(trackPath, JSON.stringify(files, null, 2));
    }
  } catch (error) {
    // Non-critical
  }
}

afterTool().catch((error) => {
  console.log(JSON.stringify({ status: 'error', error: error.message }));
  process.exit(0);
});
