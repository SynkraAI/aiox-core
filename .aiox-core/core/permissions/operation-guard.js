/**
 * Operation Guard
 *
 * Intercepts tool operations and enforces permission rules
 * based on current permission mode.
 *
 * @module permissions/operation-guard
 * @version 1.0.0
 */

const { PermissionMode } = require('./permission-mode');

class OperationGuard {
  /**
   * Commands that are always safe (read-only operations)
   */
  static SAFE_COMMANDS = [
    // Git read operations
    'git status',
    'git log',
    'git diff',
    'git branch',
    'git show',
    'git ls-files',
    'git remote -v',

    // File system read operations
    'ls',
    'pwd',
    'cat',
    'head',
    'tail',
    'wc',
    'find',
    'grep',
    'which',
    'file',
    'stat',

    // Package manager read operations
    'npm list',
    'npm outdated',
    'npm audit',
    'npm view',
    'npm search',
    'yarn list',
    'yarn info',
    'bun pm ls',

    // Version checks
    'node --version',
    'npm --version',
    'yarn --version',
    'bun --version',
    'git --version',
    'python --version',
    'python3 --version',

    // System info
    'uname',
    'whoami',
    'hostname',
    'date',
    'uptime',
    'df -h',
    'free -h',
    'env',
    'printenv',

    // Network read operations
    'curl -I',
    'ping -c',
    'nslookup',
    'dig',

    // Process info
    'ps aux',
    'top -l 1',
    'htop',

    // gh CLI read operations
    'gh auth status',
    'gh repo view',
    'gh pr list',
    'gh pr view',
    'gh issue list',
    'gh issue view',
    'gh api',
  ];

  /**
   * Patterns that indicate destructive operations
   */
  static DESTRUCTIVE_PATTERNS = [
    // File deletion
    /\brm\s+(-[rf]+\s+)?/,
    /\brmdir\b/,
    /\bunlink\b/,

    // Git destructive operations
    /\bgit\s+reset\s+--hard\b/,
    /\bgit\s+push\s+--force\b/,
    /\bgit\s+push\s+-f\b/,
    /\bgit\s+clean\s+-[fd]+/,
    /\bgit\s+checkout\s+\.\s*$/,
    /\bgit\s+restore\s+\.\s*$/,
    /\bgit\s+stash\s+drop\b/,
    /\bgit\s+branch\s+-[dD]\b/,

    // Database destructive operations
    /\bDROP\s+(TABLE|DATABASE|INDEX|VIEW)\b/i,
    /\bDELETE\s+FROM\b/i,
    /\bTRUNCATE\b/i,
    /\bALTER\s+TABLE\b.*\bDROP\b/i,

    // System destructive
    /\bkill\s+-9\b/,
    /\bkillall\b/,
    /\bshutdown\b/,
    /\breboot\b/,

    // Package manager destructive
    /\bnpm\s+uninstall\b/,
    /\byarn\s+remove\b/,
    /\bbun\s+remove\b/,
  ];

  /**
   * Patterns that indicate write operations
   */
  static WRITE_PATTERNS = [
    // Redirects
    /[^<]>/, // > but not <>
    />>/,

    // File creation/modification
    /\bmkdir\b/,
    /\btouch\b/,
    /\bmv\b/,
    /\bcp\b/,
    /\bln\b/,
    /\bchmod\b/,
    /\bchown\b/,

    // Editors
    /\bsed\s+-i\b/,
    /\bawk\s+-i\b/,

    // Git write operations
    /\bgit\s+add\b/,
    /\bgit\s+commit\b/,
    /\bgit\s+push\b/,
    /\bgit\s+merge\b/,
    /\bgit\s+rebase\b/,
    /\bgit\s+cherry-pick\b/,
    /\bgit\s+stash\b/,

    // Package manager write operations
    /\bnpm\s+install\b/,
    /\bnpm\s+i\b/,
    /\bnpm\s+ci\b/,
    /\byarn\s+add\b/,
    /\byarn\s+install\b/,
    /\bbun\s+install\b/,
    /\bbun\s+add\b/,
  ];

  /**
   * Create an OperationGuard instance
   * @param {PermissionMode} permissionMode - Permission mode instance
   */
  constructor(permissionMode = null) {
    this.permissionMode = permissionMode || new PermissionMode();
    this.operationLog = [];
  }

  /**
   * Classify an operation type based on tool and parameters
   * @param {string} tool - Tool name (Read, Write, Edit, Bash, etc.)
   * @param {Object} params - Tool parameters
   * @returns {string} Operation type (read, write, execute, delete)
   */
  classifyOperation(tool, params = {}) {
    // Read-only tools
    if (['Read', 'Glob', 'Grep', 'WebFetch', 'WebSearch'].includes(tool)) {
      return 'read';
    }

    // Write tools
    if (['Write', 'Edit', 'NotebookEdit'].includes(tool)) {
      return 'write';
    }

    // Task tool - depends on subagent type
    if (tool === 'Task') {
      const readOnlyAgents = ['Explore', 'Plan', 'claude-code-guide'];
      if (readOnlyAgents.includes(params.subagent_type)) {
        return 'read';
      }
      return 'execute';
    }

    // Bash needs deeper analysis
    if (tool === 'Bash') {
      return this.classifyBashCommand(params.command || '');
    }

    // MCP tools - generally execute
    if (tool.startsWith('mcp__')) {
      return 'execute';
    }

    // Default to read (safe)
    return 'read';
  }

  /**
   * Classify a bash command
   * @param {string} command - Bash command string
   * @returns {string} Operation type
   */
  classifyBashCommand(command) {
    const normalizedCmd = command.trim().toLowerCase();

    // Check safe commands first (most specific match)
    for (const safe of OperationGuard.SAFE_COMMANDS) {
      if (normalizedCmd.startsWith(safe.toLowerCase())) {
        return 'read';
      }
    }

    // Check destructive patterns
    for (const pattern of OperationGuard.DESTRUCTIVE_PATTERNS) {
      if (pattern.test(command)) {
        return 'delete';
      }
    }

    // Check write patterns
    for (const pattern of OperationGuard.WRITE_PATTERNS) {
      if (pattern.test(command)) {
        return 'write';
      }
    }

    // Default unknown bash commands to execute
    return 'execute';
  }

  /**
   * Guard an operation - check if it should proceed
   * @param {string} tool - Tool name
   * @param {Object} params - Tool parameters
   * @returns {Promise<Object>} Guard result
   */
  async guard(tool, params = {}) {
    // Ensure mode is loaded
    await this.permissionMode.load();

    const operation = this.classifyOperation(tool, params);
    const check = this.permissionMode.canPerform(operation);

    // Log the operation
    this._logOperation(tool, params, operation, check);

    // Operation allowed
    if (check.allowed === true) {
      return { proceed: true, operation };
    }

    // Operation blocked
    if (check.allowed === false) {
      const modeInfo = this.permissionMode.getModeInfo();
      return {
        proceed: false,
        blocked: true,
        operation,
        message: this._formatBlockedMessage(tool, params, operation, modeInfo),
      };
    }

    // Operation needs confirmation
    if (check.allowed === 'confirm') {
      return {
        proceed: false,
        needsConfirmation: true,
        operation,
        tool,
        params,
        message: this._formatConfirmMessage(tool, params, operation),
      };
    }

    // Unknown state - block to be safe
    return {
      proceed: false,
      blocked: true,
      message: 'Unknown permission state',
    };
  }

  /**
   * Format blocked message
   * @private
   */
  _formatBlockedMessage(tool, params, operation, modeInfo) {
    let detail = '';
    if (tool === 'Bash' && params.command) {
      detail = `\nCommand: \`${params.command.substring(0, 100)}${params.command.length > 100 ? '...' : ''}\``;
    } else if (params.file_path) {
      detail = `\nFile: \`${params.file_path}\``;
    }

    return `🔒 **Blocked in ${modeInfo.name} Mode**

Operation: **${operation}**
Tool: \`${tool}\`${detail}

**To enable this operation:**
- \`*mode ask\` - Confirm before changes
- \`*mode auto\` - Full autonomy`;
  }

  /**
   * Format confirmation message
   * @private
   */
  _formatConfirmMessage(tool, params, operation) {
    let detail = '';
    if (tool === 'Bash' && params.command) {
      detail = `\n\n\`\`\`bash\n${params.command}\n\`\`\``;
    } else if (params.file_path) {
      detail = `\n\nFile: \`${params.file_path}\``;
    }

    return `⚠️ **Confirmation Required**

Operation: **${operation}**
Tool: \`${tool}\`${detail}`;
  }

  /**
   * Log operation for debugging/audit
   * @private
   */
  _logOperation(tool, params, operation, check) {
    const entry = {
      timestamp: new Date().toISOString(),
      tool,
      operation,
      allowed: check.allowed,
      command: tool === 'Bash' ? params.command?.substring(0, 100) : undefined,
      file: params.file_path,
    };

    this.operationLog.push(entry);

    // Keep only last 100 entries
    if (this.operationLog.length > 100) {
      this.operationLog = this.operationLog.slice(-100);
    }
  }

  /**
   * Get operation log
   * @returns {Array} Operation log entries
   */
  getLog() {
    return [...this.operationLog];
  }

  /**
   * Get statistics about operations
   * @returns {Object} Stats
   */
  getStats() {
    const stats = {
      total: this.operationLog.length,
      byOperation: { read: 0, write: 0, execute: 0, delete: 0 },
      byResult: { allowed: 0, blocked: 0, confirmed: 0 },
    };

    for (const entry of this.operationLog) {
      stats.byOperation[entry.operation] = (stats.byOperation[entry.operation] || 0) + 1;

      if (entry.allowed === true) stats.byResult.allowed++;
      else if (entry.allowed === false) stats.byResult.blocked++;
      else if (entry.allowed === 'confirm') stats.byResult.confirmed++;
    }

    return stats;
  }
}

module.exports = { OperationGuard };
