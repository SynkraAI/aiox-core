#!/usr/bin/env node
/**
 * AIOX Before Tool Hook for Gemini CLI
 * Story GEMINI-INT.6 - AIOX Hooks System
 *
 * Executes before tool execution for security validation.
 * Can block dangerous operations.
 * Exit code 2 = block, Exit code 0 = allow.
 */

const fs = require('fs');
const path = require('path');

// Patterns to block
const BLOCKED_PATTERNS = [
  /api[_-]?key\s*[:=]\s*['"][^'"]+['"]/i,
  /password\s*[:=]\s*['"][^'"]+['"]/i,
  /secret\s*[:=]\s*['"][^'"]+['"]/i,
  /AKIA[0-9A-Z]{16}/i, // AWS key
  /ghp_[a-zA-Z0-9]{36}/, // GitHub token
  /sk-[a-zA-Z0-9]{48}/, // OpenAI key
];

// Dangerous commands to warn about
const DANGEROUS_COMMANDS = [
  'rm -rf /',
  'rm -rf ~',
  'rm -rf *',
  'git push --force',
  'git reset --hard',
  'DROP DATABASE',
  'DROP TABLE',
];

async function beforeTool() {
  const input = process.argv[2] ? JSON.parse(process.argv[2]) : {};
  const toolName = input.tool || '';
  const toolArgs = input.args || {};

  const result = {
    status: 'allow',
    warnings: [],
  };

  // Check for file write operations
  if (toolName === 'write_file' || toolName === 'replace') {
    const content = toolArgs.content || toolArgs.new_content || '';

    // Check for secrets
    for (const pattern of BLOCKED_PATTERNS) {
      if (pattern.test(content)) {
        result.status = 'block';
        result.message = 'Blocked: Potential secret or credential detected in content';
        console.log(JSON.stringify(result));
        process.exit(2); // Exit 2 = block
      }
    }

    // Check for sensitive file paths
    const filePath = toolArgs.path || toolArgs.file_path || '';
    if (filePath.includes('.env') && !filePath.includes('.env.example')) {
      result.warnings.push('Writing to .env file - ensure no secrets are committed');
    }
  }

  // Check shell commands
  if (toolName === 'shell' || toolName === 'bash' || toolName === 'execute') {
    const command = toolArgs.command || '';

    for (const dangerous of DANGEROUS_COMMANDS) {
      if (command.toLowerCase().includes(dangerous.toLowerCase())) {
        result.status = 'block';
        result.message = `Blocked: Dangerous command detected: ${dangerous}`;
        console.log(JSON.stringify(result));
        process.exit(2);
      }
    }
  }

  // Log the tool execution for audit
  logToolExecution(toolName, toolArgs);

  console.log(JSON.stringify(result));
  process.exit(0);
}

function logToolExecution(tool, args) {
  try {
    const projectDir = process.env.GEMINI_PROJECT_DIR || process.cwd();
    const logDir = path.join(projectDir, '.aiox', 'logs');

    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    const logEntry = {
      timestamp: new Date().toISOString(),
      tool,
      argsKeys: Object.keys(args),
      provider: 'gemini',
    };

    const logPath = path.join(logDir, 'tool-audit.jsonl');
    fs.appendFileSync(logPath, JSON.stringify(logEntry) + '\n');
  } catch (error) {
    // Non-critical
  }
}

// Execute
beforeTool().catch((error) => {
  console.log(JSON.stringify({ status: 'allow', error: error.message }));
  process.exit(0);
});
