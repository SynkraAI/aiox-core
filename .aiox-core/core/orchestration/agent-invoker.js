/**
 * Agent Invoker - Story 0.7
 *
 * Epic: Epic 0 - ADE Master Orchestrator
 *
 * Provides interface to invoke agents for tasks during orchestration.
 *
 * Features:
 * - AC1: invokeAgent(agentName, taskPath, inputs) method
 * - AC2: Supports agents: @pm, @architect, @analyst, @dev, @qa
 * - AC3: Passes structured context to task
 * - AC4: Awaits completion or timeout
 * - AC5: Parses and validates task output
 * - AC6: Retry logic for transient failures
 * - AC7: Logging of invocations for audit
 *
 * @module core/orchestration/agent-invoker
 * @version 1.0.0
 */

const fs = require('fs-extra');
const path = require('path');
const EventEmitter = require('events');

// ═══════════════════════════════════════════════════════════════════════════════════
//                              SUPPORTED AGENTS (AC2)
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Supported agents for orchestration
 */
const SUPPORTED_AGENTS = {
  pm: {
    name: 'pm',
    displayName: 'Project Manager',
    file: 'pm.md',
    capabilities: ['planning', 'coordination', 'story-management'],
  },
  architect: {
    name: 'architect',
    displayName: 'Architect',
    file: 'architect.md',
    capabilities: ['design', 'architecture', 'technical-decisions'],
  },
  analyst: {
    name: 'analyst',
    displayName: 'Business Analyst',
    file: 'analyst.md',
    capabilities: ['requirements', 'analysis', 'documentation'],
  },
  dev: {
    name: 'dev',
    displayName: 'Developer',
    file: 'dev.md',
    capabilities: ['implementation', 'coding', 'debugging'],
  },
  qa: {
    name: 'qa',
    displayName: 'QA Engineer',
    file: 'qa.md',
    capabilities: ['testing', 'quality', 'validation'],
  },
  devops: {
    name: 'devops',
    displayName: 'DevOps Engineer',
    file: 'devops.md',
    capabilities: ['deployment', 'infrastructure', 'ci-cd'],
  },
  po: {
    name: 'po',
    displayName: 'Product Owner',
    file: 'po.md',
    capabilities: ['backlog', 'prioritization', 'acceptance'],
  },
};

/**
 * Invocation result status
 */
const InvocationStatus = {
  SUCCESS: 'success',
  FAILED: 'failed',
  TIMEOUT: 'timeout',
  SKIPPED: 'skipped',
};

// ═══════════════════════════════════════════════════════════════════════════════════
//                              AGENT INVOKER CLASS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * AgentInvoker - Interface to invoke agents for tasks (AC1)
 */
class AgentInvoker extends EventEmitter {
  /**
   * @param {Object} options - Configuration options
   * @param {string} options.projectRoot - Project root path
   * @param {number} [options.defaultTimeout=300000] - Default timeout (5 min) (AC4)
   * @param {number} [options.maxRetries=3] - Max retries for transient failures (AC6)
   * @param {boolean} [options.validateOutput=true] - Validate task output (AC5)
   * @param {Function} [options.executor] - Custom executor function
   */
  constructor(options = {}) {
    super();

    this.projectRoot = options.projectRoot || process.cwd();
    this.defaultTimeout = options.defaultTimeout ?? 300000; // 5 minutes
    this.maxRetries = options.maxRetries ?? 3;
    this.validateOutput = options.validateOutput ?? true;
    this.executor = options.executor || null;

    // Paths
    this.agentsDir = path.join(this.projectRoot, '.aiox-core', 'development', 'agents');
    this.tasksDir = path.join(this.projectRoot, '.aiox-core', 'development', 'tasks');

    // Audit log (AC7)
    this.invocations = [];
    this.logs = [];
  }

  /**
   * Invoke an agent to execute a task (AC1)
   *
   * @param {string} agentName - Agent name (e.g., 'dev', 'qa', 'architect')
   * @param {string} taskPath - Path to task file or task name
   * @param {Object} [inputs={}] - Inputs to pass to the task
   * @returns {Promise<Object>} Invocation result
   */
  async invokeAgent(agentName, taskPath, inputs = {}) {
    const invocationId = this._generateId();
    const startTime = Date.now();

    this._log(`Invoking @${agentName} for ${taskPath}`, 'info');

    // Record invocation start (AC7)
    const invocation = {
      id: invocationId,
      agentName,
      taskPath,
      inputs,
      startedAt: new Date().toISOString(),
      status: 'in_progress',
      result: null,
      error: null,
      duration: null,
      retries: 0,
    };
    this.invocations.push(invocation);

    try {
      // Validate agent (AC2)
      const agent = await this._loadAgent(agentName);
      if (!agent) {
        throw new Error(`Unknown agent: ${agentName}`);
      }

      // Load task
      const task = await this._loadTask(taskPath);
      if (!task) {
        throw new Error(`Task not found: ${taskPath}`);
      }

      // Build context (AC3)
      const context = this._buildContext(agent, task, inputs);

      // Execute with retry logic (AC6)
      const result = await this._executeWithRetry(() => this._executeTask(agent, task, context), {
        invocation,
      });

      // Validate output if schema exists (AC5)
      if (this.validateOutput && task.outputSchema) {
        this._validateTaskOutput(result, task.outputSchema);
      }

      // Update invocation record
      invocation.status = InvocationStatus.SUCCESS;
      invocation.result = result;
      invocation.duration = Date.now() - startTime;
      invocation.completedAt = new Date().toISOString();

      this._log(`@${agentName} completed ${taskPath} in ${invocation.duration}ms`, 'info');
      this.emit('invocationComplete', invocation);

      return {
        success: true,
        invocationId,
        agentName,
        taskPath,
        result,
        duration: invocation.duration,
      };
    } catch (error) {
      invocation.status = InvocationStatus.FAILED;
      invocation.error = error.message;
      invocation.duration = Date.now() - startTime;
      invocation.completedAt = new Date().toISOString();

      this._log(`@${agentName} failed ${taskPath}: ${error.message}`, 'error');
      this.emit('invocationFailed', invocation);

      return {
        success: false,
        invocationId,
        agentName,
        taskPath,
        error: error.message,
        duration: invocation.duration,
      };
    }
  }

  /**
   * Load agent definition (AC2)
   * @private
   */
  async _loadAgent(agentName) {
    // Normalize agent name (remove @ prefix if present)
    const name = agentName.replace(/^@/, '').toLowerCase();

    // Check if supported
    const agentConfig = SUPPORTED_AGENTS[name];
    if (!agentConfig) {
      this._log(`Agent ${name} not in supported list`, 'warn');
      return null;
    }

    // Load agent file
    const agentPath = path.join(this.agentsDir, agentConfig.file);
    if (!(await fs.pathExists(agentPath))) {
      this._log(`Agent file not found: ${agentPath}`, 'warn');
      // Return config without file content
      return {
        ...agentConfig,
        loaded: false,
        content: null,
      };
    }

    const content = await fs.readFile(agentPath, 'utf8');

    return {
      ...agentConfig,
      loaded: true,
      content,
      path: agentPath,
    };
  }

  /**
   * Load task definition
   * @private
   */
  async _loadTask(taskPath) {
    // Handle both full path and task name
    let fullPath = taskPath;
    if (!path.isAbsolute(taskPath)) {
      // Try as task name first
      const taskName = taskPath.endsWith('.md') ? taskPath : `${taskPath}.md`;
      fullPath = path.join(this.tasksDir, taskName);

      // If not found, try as relative path from project root
      if (!(await fs.pathExists(fullPath))) {
        fullPath = path.join(this.projectRoot, taskPath);
      }
    }

    if (!(await fs.pathExists(fullPath))) {
      this._log(`Task file not found: ${fullPath}`, 'warn');
      return null;
    }

    const content = await fs.readFile(fullPath, 'utf8');

    // Parse task metadata from frontmatter
    const metadata = this._parseTaskMetadata(content);

    return {
      path: fullPath,
      name: path.basename(fullPath, '.md'),
      content,
      ...metadata,
    };
  }

  /**
   * Parse task metadata from markdown frontmatter
   * @private
   */
  _parseTaskMetadata(content) {
    const metadata = {
      title: null,
      description: null,
      agent: null,
      inputs: [],
      outputs: [],
      outputSchema: null,
    };

    // Check for YAML frontmatter
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (frontmatterMatch) {
      try {
        const yaml = require('js-yaml');
        const parsed = yaml.load(frontmatterMatch[1]);
        Object.assign(metadata, parsed);
      } catch (error) {
        this._log(`Failed to parse task frontmatter: ${error.message}`, 'warn');
      }
    }

    // Extract title from first heading
    const titleMatch = content.match(/^#\s+(.+)$/m);
    if (titleMatch && !metadata.title) {
      metadata.title = titleMatch[1];
    }

    return metadata;
  }

  /**
   * Build context for task execution (AC3)
   * @private
   */
  _buildContext(agent, task, inputs) {
    return {
      // Agent info
      agent: {
        name: agent.name,
        displayName: agent.displayName,
        capabilities: agent.capabilities,
      },

      // Task info
      task: {
        name: task.name,
        path: task.path,
        title: task.title,
      },

      // User inputs
      inputs,

      // Environment
      projectRoot: this.projectRoot,
      timestamp: new Date().toISOString(),

      // Orchestration context
      orchestration: {
        timeout: this.defaultTimeout,
        maxRetries: this.maxRetries,
      },
    };
  }

  /**
   * Execute with retry logic (AC6)
   * @private
   */
  async _executeWithRetry(executeFn, options = {}) {
    const { invocation } = options;
    let lastError;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          this._log(`Retry attempt ${attempt}/${this.maxRetries}`, 'info');
          if (invocation) {
            invocation.retries = attempt;
          }
          // Exponential backoff
          await this._delay(1000 * Math.pow(2, attempt - 1));
        }

        return await executeFn();
      } catch (error) {
        lastError = error;

        // Check if error is transient (retryable)
        if (!this._isTransientError(error)) {
          throw error;
        }

        this._log(`Transient error: ${error.message}`, 'warn');
      }
    }

    throw lastError;
  }

  /**
   * Execute task (AC4)
   * @private
   */
  async _executeTask(agent, task, context) {
    // If custom executor provided, use it
    if (this.executor) {
      return await this._executeWithTimeout(
        () => this.executor(agent, task, context),
        this.defaultTimeout,
      );
    }

    // Default: return simulated result
    // In production, this would interface with Claude/LLM
    return {
      status: 'simulated',
      message: `Task ${task.name} executed by @${agent.name}`,
      context: {
        agentName: agent.name,
        taskName: task.name,
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Execute with timeout (AC4)
   * @private
   */
  async _executeWithTimeout(fn, timeout) {
    return Promise.race([
      fn(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Task execution timed out')), timeout),
      ),
    ]);
  }

  /**
   * Validate task output against schema (AC5)
   * @private
   */
  _validateTaskOutput(result, schema) {
    if (!schema) return;

    const errors = [];

    // Check required fields
    if (schema.required) {
      for (const field of schema.required) {
        if (result[field] === undefined) {
          errors.push(`Missing required field: ${field}`);
        }
      }
    }

    // Check field types
    if (schema.properties) {
      for (const [field, spec] of Object.entries(schema.properties)) {
        if (result[field] !== undefined && spec.type) {
          const actualType = Array.isArray(result[field]) ? 'array' : typeof result[field];
          if (actualType !== spec.type) {
            errors.push(`Field ${field}: expected ${spec.type}, got ${actualType}`);
          }
        }
      }
    }

    if (errors.length > 0) {
      throw new Error(`Output validation failed: ${errors.join(', ')}`);
    }
  }

  /**
   * Check if error is transient
   * @private
   */
  _isTransientError(error) {
    const transientPatterns = [
      /timeout/i,
      /ECONNRESET/i,
      /ETIMEDOUT/i,
      /rate.?limit/i,
      /retry/i,
      /temporary/i,
      /503/,
      /504/,
    ];

    return transientPatterns.some((p) => p.test(error.message));
  }

  /**
   * Get supported agents (AC2)
   * @returns {Object} Map of supported agents
   */
  getSupportedAgents() {
    return { ...SUPPORTED_AGENTS };
  }

  /**
   * Check if agent is supported (AC2)
   * @param {string} agentName - Agent name
   * @returns {boolean}
   */
  isAgentSupported(agentName) {
    const name = agentName.replace(/^@/, '').toLowerCase();
    return SUPPORTED_AGENTS[name] !== undefined;
  }

  /**
   * Get all invocations (AC7)
   * @returns {Object[]} All invocation records
   */
  getInvocations() {
    return [...this.invocations];
  }

  /**
   * Get invocation by ID (AC7)
   * @param {string} invocationId - Invocation ID
   * @returns {Object|null} Invocation record
   */
  getInvocation(invocationId) {
    return this.invocations.find((i) => i.id === invocationId) || null;
  }

  /**
   * Get invocations for agent (AC7)
   * @param {string} agentName - Agent name
   * @returns {Object[]} Invocation records for agent
   */
  getInvocationsForAgent(agentName) {
    const name = agentName.replace(/^@/, '').toLowerCase();
    return this.invocations.filter((i) => i.agentName === name);
  }

  /**
   * Get invocation summary (AC7)
   * @returns {Object} Summary statistics
   */
  getInvocationSummary() {
    const total = this.invocations.length;
    const byStatus = {};
    const byAgent = {};
    let totalDuration = 0;

    for (const inv of this.invocations) {
      // By status
      byStatus[inv.status] = (byStatus[inv.status] || 0) + 1;

      // By agent
      byAgent[inv.agentName] = (byAgent[inv.agentName] || 0) + 1;

      // Total duration
      if (inv.duration) {
        totalDuration += inv.duration;
      }
    }

    return {
      total,
      byStatus,
      byAgent,
      totalDuration,
      averageDuration: total > 0 ? totalDuration / total : 0,
    };
  }

  /**
   * Clear invocation history
   */
  clearInvocations() {
    this.invocations = [];
    this.logs = [];
  }

  /**
   * Get logs (AC7)
   * @returns {Object[]} Log entries
   */
  getLogs() {
    return [...this.logs];
  }

  /**
   * Generate unique ID
   * @private
   */
  _generateId() {
    return `inv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Log message (AC7)
   * @private
   */
  _log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    this.logs.push({ timestamp, level, message });
  }

  /**
   * Delay utility
   * @private
   */
  _delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
//                              EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════

module.exports = {
  AgentInvoker,
  SUPPORTED_AGENTS,
  InvocationStatus,
};
