/**
 * Subagent Dispatcher
 * Story 10.2 - Parallel Agent Execution
 * Story GEMINI-INT.3 - Multi-Provider Support
 *
 * Dispatches tasks to specialized subagents based on task type.
 * Supports multiple AI providers (Claude, Gemini) with routing and fallback.
 * Injects relevant context from Memory Layer.
 */

const EventEmitter = require('events');
const { spawn } = require('child_process');
const _path = require('path');

// Import AI Provider Factory
let AIProviderFactory;
try {
  AIProviderFactory = require('../../infrastructure/integrations/ai-providers');
} catch {
  AIProviderFactory = null;
}

// Import dependencies with fallbacks
let MemoryQuery, GotchasMemory;
try {
  MemoryQuery = require('../memory/memory-query');
} catch {
  MemoryQuery = null;
}
try {
  GotchasMemory = require('../memory/gotchas-memory');
} catch {
  GotchasMemory = null;
}

class SubagentDispatcher extends EventEmitter {
  constructor(config = {}) {
    super();

    // Agent mapping: task type → agent
    this.agentMapping = config.agentMapping || {
      database: '@data-engineer',
      db: '@data-engineer',
      migration: '@data-engineer',
      api: '@dev',
      backend: '@dev',
      frontend: '@dev',
      component: '@dev',
      feature: '@dev',
      bugfix: '@dev',
      test: '@qa',
      testing: '@qa',
      review: '@qa',
      deploy: '@devops',
      infrastructure: '@devops',
      ci: '@devops',
      architecture: '@architect',
      design: '@architect',
      documentation: '@pm',
      docs: '@pm',
      planning: '@pm',
      analysis: '@analyst',
      research: '@analyst',
    };

    // Default agent when no match
    this.defaultAgent = config.defaultAgent || '@dev';

    // AI Provider configuration (Story GEMINI-INT.3)
    this.providerMapping = config.providerMapping || {
      // Tasks that benefit from Claude's deep reasoning
      '@architect': 'claude',
      '@analyst': 'claude',
      security: 'claude',

      // Tasks that work well with Gemini's speed
      '@dev': 'auto', // Use configured default
      '@qa': 'gemini',
      '@pm': 'gemini',
      documentation: 'gemini',
      formatting: 'gemini',
    };

    // Default provider (from config or claude)
    this.defaultProvider = config.defaultProvider || 'claude';

    // Enable multi-provider features
    this.multiProviderEnabled = config.multiProviderEnabled !== false;

    // Parallel execution mode
    this.parallelMode = config.parallelMode || 'fallback'; // fallback, race, consensus, best-of

    // Retry configuration
    this.maxRetries = config.maxRetries || 2;
    this.retryDelay = config.retryDelay || 2000;

    // Timeout configuration
    this.claudeTimeout = config.claudeTimeout || 10 * 60 * 1000; // 10 minutes

    // Dependencies
    this.memoryQuery = config.memoryQuery || (MemoryQuery ? new MemoryQuery() : null);
    this.gotchasMemory = config.gotchasMemory || (GotchasMemory ? new GotchasMemory() : null);

    // Dispatch log
    this.dispatchLog = [];
    this.maxLogSize = 100;

    // Root path for project
    this.rootPath = config.rootPath || process.cwd();
  }

  /**
   * Dispatch a task to the appropriate subagent
   * @param {Object} task - Task to dispatch
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} - Dispatch result
   */
  async dispatch(task, context = {}) {
    const agentId = this.resolveAgent(task);
    const startTime = Date.now();

    // Resolve provider (Story GEMINI-INT.3)
    const providerName = this.resolveProvider(task, agentId);

    // Create dispatch record
    const dispatchRecord = {
      id: `dispatch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      taskId: task.id,
      agentId,
      provider: providerName,
      startedAt: new Date().toISOString(),
      attempts: 0,
    };

    this.emit('dispatch_started', dispatchRecord);
    this.log('dispatch_started', dispatchRecord);

    // Enrich context
    const enrichedContext = await this.enrichContext(task, context);
    dispatchRecord.contextSize = JSON.stringify(enrichedContext).length;

    // Execute with retries
    let lastError = null;
    for (let attempt = 1; attempt <= this.maxRetries + 1; attempt++) {
      dispatchRecord.attempts = attempt;

      try {
        const result = await this.spawnSubagent(agentId, task, enrichedContext);

        dispatchRecord.completedAt = new Date().toISOString();
        dispatchRecord.success = result.success;
        dispatchRecord.duration = Date.now() - startTime;
        dispatchRecord.outputSize = result.output?.length || 0;

        this.emit('dispatch_completed', dispatchRecord);
        this.log('dispatch_completed', dispatchRecord);

        return {
          success: result.success,
          output: result.output,
          agentId,
          taskId: task.id,
          duration: dispatchRecord.duration,
          filesModified: result.filesModified || [],
        };
      } catch (error) {
        lastError = error;

        this.log('dispatch_attempt_failed', {
          ...dispatchRecord,
          attempt,
          error: error.message,
        });

        if (attempt <= this.maxRetries) {
          this.emit('dispatch_retry', { taskId: task.id, attempt, error: error.message });
          await this.sleep(this.retryDelay);
        }
      }
    }

    // All retries failed
    dispatchRecord.completedAt = new Date().toISOString();
    dispatchRecord.success = false;
    dispatchRecord.error = lastError?.message || 'Unknown error';
    dispatchRecord.duration = Date.now() - startTime;

    this.emit('dispatch_failed', dispatchRecord);
    this.log('dispatch_failed', dispatchRecord);

    return {
      success: false,
      error: lastError?.message || 'Unknown error',
      agentId,
      taskId: task.id,
      duration: dispatchRecord.duration,
      filesModified: [],
    };
  }

  /**
   * Resolve which agent should handle a task
   * @param {Object} task - Task to resolve agent for
   * @returns {string} - Agent identifier
   */
  resolveAgent(task) {
    // Check explicit agent assignment
    if (task.agent) {
      return task.agent.startsWith('@') ? task.agent : `@${task.agent}`;
    }

    // Check task type
    if (task.type && this.agentMapping[task.type.toLowerCase()]) {
      return this.agentMapping[task.type.toLowerCase()];
    }

    // Check task tags
    if (task.tags && Array.isArray(task.tags)) {
      for (const tag of task.tags) {
        if (this.agentMapping[tag.toLowerCase()]) {
          return this.agentMapping[tag.toLowerCase()];
        }
      }
    }

    // Infer from task description
    const description = (task.description || '').toLowerCase();

    const inferencePatterns = [
      { patterns: ['database', 'sql', 'migration', 'schema'], agent: '@data-engineer' },
      { patterns: ['test', 'spec', 'coverage', 'assert'], agent: '@qa' },
      { patterns: ['deploy', 'docker', 'ci/cd', 'pipeline', 'kubernetes'], agent: '@devops' },
      { patterns: ['architect', 'design pattern', 'structure'], agent: '@architect' },
      { patterns: ['document', 'readme', 'guide'], agent: '@pm' },
      { patterns: ['analyze', 'research', 'investigate'], agent: '@analyst' },
    ];

    for (const { patterns, agent } of inferencePatterns) {
      if (patterns.some((p) => description.includes(p))) {
        return agent;
      }
    }

    // Default
    return this.defaultAgent;
  }

  /**
   * Resolve which AI provider should handle a task (Story GEMINI-INT.3)
   * @param {Object} task - Task to resolve provider for
   * @param {string} agentId - Resolved agent ID
   * @returns {string} - Provider name ('claude', 'gemini', or 'auto')
   */
  resolveProvider(task, agentId) {
    // Check for explicit @gemini or @claude tag in task
    if (task.provider) {
      return task.provider.toLowerCase();
    }

    // Check task tags for provider hints
    if (task.tags && Array.isArray(task.tags)) {
      if (task.tags.includes('@gemini') || task.tags.includes('gemini')) {
        return 'gemini';
      }
      if (task.tags.includes('@claude') || task.tags.includes('claude')) {
        return 'claude';
      }
    }

    // Check description for provider hints
    const description = (task.description || '').toLowerCase();
    if (description.includes('@gemini')) return 'gemini';
    if (description.includes('@claude')) return 'claude';

    // Check agent mapping
    if (this.providerMapping[agentId]) {
      const mapped = this.providerMapping[agentId];
      if (mapped !== 'auto') return mapped;
    }

    // Check task type mapping
    if (task.type && this.providerMapping[task.type.toLowerCase()]) {
      const mapped = this.providerMapping[task.type.toLowerCase()];
      if (mapped !== 'auto') return mapped;
    }

    // Return default
    return this.defaultProvider;
  }

  /**
   * Get AI provider instance (Story GEMINI-INT.3)
   * @param {string} providerName - Provider name
   * @returns {Object|null} - Provider instance or null
   */
  getAIProvider(providerName) {
    if (!AIProviderFactory) {
      return null;
    }

    try {
      return AIProviderFactory.getProvider(providerName);
    } catch (error) {
      this.log('provider_error', { provider: providerName, error: error.message });
      return null;
    }
  }

  /**
   * Enrich context with memory and gotchas
   * @param {Object} task - Task being dispatched
   * @param {Object} context - Base context
   * @returns {Promise<Object>} - Enriched context
   */
  async enrichContext(task, context) {
    const enriched = { ...context };

    // Get relevant memory
    if (this.memoryQuery) {
      try {
        const memory = await this.memoryQuery.getContextForAgent(
          this.resolveAgent(task),
          task.description,
        );
        enriched.memory = memory.relevantMemory || [];
        enriched.patterns = memory.suggestedPatterns || [];
      } catch (error) {
        this.log('memory_query_failed', { taskId: task.id, error: error.message });
      }
    }

    // Get relevant gotchas
    if (this.gotchasMemory) {
      try {
        const gotchas = await this.gotchasMemory.getContextForTask(task.description);
        enriched.gotchas = gotchas.filter((g) => this.isRelevantGotcha(g, task));
      } catch (error) {
        this.log('gotchas_query_failed', { taskId: task.id, error: error.message });
      }
    }

    // Add project context
    enriched.projectContext = await this.getProjectContext();

    return enriched;
  }

  /**
   * Check if a gotcha is relevant to a task
   * @param {Object} gotcha - Gotcha to check
   * @param {Object} task - Task being executed
   * @returns {boolean} - True if relevant
   */
  isRelevantGotcha(gotcha, task) {
    const taskText =
      `${task.description} ${task.type || ''} ${(task.tags || []).join(' ')}`.toLowerCase();

    // Check if gotcha pattern appears in task
    if (gotcha.pattern && taskText.includes(gotcha.pattern.toLowerCase())) {
      return true;
    }

    // Check if gotcha category matches task type
    if (gotcha.category && task.type && gotcha.category.toLowerCase() === task.type.toLowerCase()) {
      return true;
    }

    // Check for keyword overlap
    const gotchaKeywords = (gotcha.description || '').toLowerCase().split(/\s+/);
    const taskKeywords = taskText.split(/\s+/);
    const overlap = gotchaKeywords.filter((k) => taskKeywords.includes(k) && k.length > 3);

    return overlap.length >= 2;
  }

  /**
   * Get project context
   * @returns {Promise<Object>} - Project context
   */
  async getProjectContext() {
    // This would read from .aios/codebase-map.json or similar
    return {
      rootPath: this.rootPath,
      framework: 'aios-core',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Spawn a subagent to execute a task (Updated for Story GEMINI-INT.3)
   * @param {string} agentId - Agent identifier
   * @param {Object} task - Task to execute
   * @param {Object} context - Enriched context
   * @returns {Promise<Object>} - Execution result
   */
  async spawnSubagent(agentId, task, context) {
    // Build the prompt
    const prompt = this.buildPrompt(agentId, task, context);

    // Resolve provider
    const providerName = this.resolveProvider(task, agentId);

    // Try to use AI Provider Factory if available
    if (this.multiProviderEnabled && AIProviderFactory) {
      return this.executeWithProvider(prompt, providerName, task);
    }

    // Fallback to direct Claude CLI
    return this.executeClaude(prompt);
  }

  /**
   * Execute prompt using AI Provider Factory (Story GEMINI-INT.3)
   * @param {string} prompt - Prompt to execute
   * @param {string} providerName - Provider to use
   * @param {Object} task - Original task for context
   * @returns {Promise<Object>} - Execution result
   */
  async executeWithProvider(prompt, providerName, task) {
    const startTime = Date.now();

    // Get primary provider
    const provider = this.getAIProvider(providerName);

    if (!provider) {
      this.log('provider_unavailable', { provider: providerName });
      // Fallback to legacy Claude execution
      return this.executeClaude(prompt);
    }

    // Check availability
    const isAvailable = await provider.checkAvailability();

    if (!isAvailable) {
      this.log('provider_not_available', { provider: providerName });

      // Try fallback provider
      const fallbackName = providerName === 'claude' ? 'gemini' : 'claude';
      const fallback = this.getAIProvider(fallbackName);

      if (fallback && (await fallback.checkAvailability())) {
        this.log('using_fallback_provider', { original: providerName, fallback: fallbackName });
        return this.executeWithSingleProvider(fallback, prompt, task);
      }

      // Last resort: legacy Claude
      return this.executeClaude(prompt);
    }

    // Execute with selected provider
    return this.executeWithSingleProvider(provider, prompt, task);
  }

  /**
   * Execute with a single provider instance (Story GEMINI-INT.3)
   * @param {Object} provider - Provider instance
   * @param {string} prompt - Prompt to execute
   * @param {Object} task - Original task
   * @returns {Promise<Object>} - Execution result
   */
  async executeWithSingleProvider(provider, prompt, task) {
    try {
      const response = await provider.executeWithRetry(prompt, {
        workingDir: this.rootPath,
      });

      this.emit('provider_execution_complete', {
        provider: provider.name,
        taskId: task.id,
        success: response.success,
        duration: response.metadata?.duration,
      });

      return {
        success: response.success,
        output: response.output,
        filesModified: this.extractModifiedFiles(response.output),
        provider: provider.name,
        metadata: response.metadata,
      };
    } catch (error) {
      this.emit('provider_execution_failed', {
        provider: provider.name,
        taskId: task.id,
        error: error.message,
      });

      throw error;
    }
  }

  /**
   * Execute with parallel providers (Story GEMINI-INT.3 - Advanced)
   * Runs both Claude and Gemini, returns based on parallelMode
   * @param {string} prompt - Prompt to execute
   * @param {Object} task - Original task
   * @returns {Promise<Object>} - Best/merged result
   */
  async executeParallel(prompt, task) {
    if (!AIProviderFactory) {
      return this.executeClaude(prompt);
    }

    const claude = this.getAIProvider('claude');
    const gemini = this.getAIProvider('gemini');

    // Check availability
    const [claudeAvail, geminiAvail] = await Promise.all([
      claude?.checkAvailability() || false,
      gemini?.checkAvailability() || false,
    ]);

    if (!claudeAvail && !geminiAvail) {
      throw new Error('No AI providers available');
    }

    if (!claudeAvail) return this.executeWithSingleProvider(gemini, prompt, task);
    if (!geminiAvail) return this.executeWithSingleProvider(claude, prompt, task);

    // Execute in parallel
    const startTime = Date.now();

    this.emit('parallel_execution_started', {
      taskId: task.id,
      mode: this.parallelMode,
    });

    const results = await Promise.allSettled([
      this.executeWithSingleProvider(claude, prompt, task),
      this.executeWithSingleProvider(gemini, prompt, task),
    ]);

    const claudeResult = results[0].status === 'fulfilled' ? results[0].value : null;
    const geminiResult = results[1].status === 'fulfilled' ? results[1].value : null;

    this.emit('parallel_execution_complete', {
      taskId: task.id,
      duration: Date.now() - startTime,
      claudeSuccess: !!claudeResult?.success,
      geminiSuccess: !!geminiResult?.success,
    });

    // Select result based on mode
    return this.selectParallelResult(claudeResult, geminiResult, task);
  }

  /**
   * Select result from parallel execution based on mode
   * @param {Object|null} claudeResult - Claude result
   * @param {Object|null} geminiResult - Gemini result
   * @param {Object} task - Original task
   * @returns {Object} - Selected result
   */
  selectParallelResult(claudeResult, geminiResult, task) {
    switch (this.parallelMode) {
      case 'race':
        // Return first successful result
        return claudeResult?.success ? claudeResult : geminiResult || claudeResult;

      case 'consensus':
        // Both must succeed and be similar
        if (claudeResult?.success && geminiResult?.success) {
          // Simple check: both succeeded
          return {
            ...claudeResult,
            consensus: true,
            providers: ['claude', 'gemini'],
          };
        }
        // Return whichever succeeded
        return claudeResult?.success ? claudeResult : geminiResult;

      case 'best-of':
        // Return longer/more complete response (simple heuristic)
        if (claudeResult?.success && geminiResult?.success) {
          const claudeLen = claudeResult.output?.length || 0;
          const geminiLen = geminiResult.output?.length || 0;
          return claudeLen >= geminiLen ? claudeResult : geminiResult;
        }
        return claudeResult?.success ? claudeResult : geminiResult;

      case 'fallback':
      default:
        // Claude primary, Gemini fallback
        return claudeResult?.success ? claudeResult : geminiResult || claudeResult;
    }
  }

  /**
   * Build prompt for subagent
   * @param {string} agentId - Agent identifier
   * @param {Object} task - Task to execute
   * @param {Object} context - Context
   * @returns {string} - Formatted prompt
   */
  buildPrompt(agentId, task, context) {
    let prompt = `You are ${agentId}, a specialized agent in the AIOS framework.\n\n`;

    prompt += '## Task\n';
    prompt += `**ID:** ${task.id}\n`;
    prompt += `**Description:** ${task.description}\n\n`;

    if (task.acceptanceCriteria) {
      prompt += '## Acceptance Criteria\n';
      const criteria = Array.isArray(task.acceptanceCriteria)
        ? task.acceptanceCriteria
        : [task.acceptanceCriteria];
      criteria.forEach((ac, i) => {
        prompt += `${i + 1}. ${ac}\n`;
      });
      prompt += '\n';
    }

    if (task.files && task.files.length > 0) {
      prompt += '## Files to Modify\n';
      task.files.forEach((f) => {
        prompt += `- \`${f}\`\n`;
      });
      prompt += '\n';
    }

    if (context.gotchas && context.gotchas.length > 0) {
      prompt += '## Active Gotchas (Avoid These Mistakes)\n';
      context.gotchas.forEach((g) => {
        prompt += `⚠️ **${g.title || g.pattern}**: ${g.workaround || g.description}\n`;
      });
      prompt += '\n';
    }

    if (context.patterns && context.patterns.length > 0) {
      prompt += '## Suggested Patterns\n';
      context.patterns.slice(0, 3).forEach((p) => {
        prompt += `- ${p.name || p}: ${p.description || ''}\n`;
      });
      prompt += '\n';
    }

    prompt += '## Instructions\n';
    prompt += '1. Implement the task completely\n';
    prompt += '2. Follow existing patterns in the codebase\n';
    prompt += '3. After completing, verify your changes work\n';
    prompt += '4. Respond with a summary of what you did\n';

    return prompt;
  }

  /**
   * Execute prompt via Claude CLI using stdin for robust handling.
   * This approach avoids shell-related parsing issues and command injection.
   * 
   * @param {string} prompt - The prompt content to send to Claude
   * @returns {Promise<Object>} - Execution result with success flag and output
   */
  executeClaude(prompt) {
    if (!prompt || typeof prompt !== 'string') {
      return Promise.reject(new Error('executeClaude requires a non-empty string prompt'));
    }

    return new Promise((resolve, reject) => {
      const args = ['--print', '--dangerously-skip-permissions'];

      const child = spawn('claude', args, {
        cwd: this.rootPath,
        env: { ...process.env },
        stdio: ['pipe', 'pipe', 'pipe'],
        timeout: this.claudeTimeout,
      });

      child.on('error', (error) => {
        reject(error);
      });

      let stdinError = null;
      // Prevent unhandled stream errors if the pipe breaks or process exits early
      child.stdin.on('error', (err) => {
        stdinError = err;
        this.log('stdin_write_error', { error: err.message, code: err.code });
      });

      // Write prompt via stdin to avoid shell-related issues and command injection
      if (child.stdin.writable) {
        child.stdin.write(prompt);
        child.stdin.end();
      } else {
        child.kill();
        reject(new Error('Claude stdin was not writable immediately after spawn'));
        return;
      }

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code, signal) => {
        if (stdinError) {
          reject(new Error(`Claude CLI stdin write failed (prompt not delivered): ${stdinError.message}`));
        } else if (code === 0) {
          resolve({
            success: true,
            output: stdout,
            filesModified: this.extractModifiedFiles(stdout),
          });
        } else if (signal) {
          reject(new Error(`Claude CLI killed by signal ${signal} (timeout or external kill): ${stderr || stdout}`));
        } else {
          reject(new Error(`Claude CLI exited with code ${code}: ${stderr || stdout}`));
        }
      });
    });
  }

  /**
   * Extract modified files from Claude output
   * @param {string} output - Claude output
   * @returns {Array<string>} - List of modified files
   */
  extractModifiedFiles(output) {
    const files = [];

    // Match common patterns
    const patterns = [
      /(?:created|modified|updated|wrote|edited).*?[`']([^`']+)[`']/gi,
      /(?:file|path):\s*[`']?([^\s`']+\.[a-z]+)[`']?/gi,
    ];

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(output)) !== null) {
        const file = match[1];
        if ((!files.includes(file) && file.includes('/')) || file.includes('.')) {
          files.push(file);
        }
      }
    }

    return files;
  }

  /**
   * Log an event
   * @param {string} type - Event type
   * @param {Object} data - Event data
   */
  log(type, data) {
    const entry = {
      type,
      timestamp: new Date().toISOString(),
      ...data,
    };

    this.dispatchLog.push(entry);

    if (this.dispatchLog.length > this.maxLogSize) {
      this.dispatchLog.shift();
    }
  }

  /**
   * Get dispatch log
   * @param {number} limit - Max entries
   * @returns {Array} - Log entries
   */
  getLog(limit = 20) {
    return this.dispatchLog.slice(-limit);
  }

  /**
   * Sleep for milliseconds
   * @param {number} ms - Milliseconds
   * @returns {Promise<void>}
   */
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get agent mapping
   * @returns {Object} - Current agent mapping
   */
  getAgentMapping() {
    return { ...this.agentMapping };
  }

  /**
   * Update agent mapping
   * @param {Object} mapping - New mappings to add/update
   */
  updateAgentMapping(mapping) {
    this.agentMapping = { ...this.agentMapping, ...mapping };
  }

  /**
   * Format status for CLI
   * @returns {string} - Formatted status
   */
  formatStatus() {
    const recentDispatches = this.getLog(10);

    let output = '📤 Subagent Dispatcher Status\n';
    output += '━'.repeat(40) + '\n\n';

    // Multi-provider status (Story GEMINI-INT.3)
    output += '**AI Providers:**\n';
    output += `  Multi-Provider: ${this.multiProviderEnabled ? '✅ Enabled' : '❌ Disabled'}\n`;
    output += `  Default: ${this.defaultProvider}\n`;
    output += `  Parallel Mode: ${this.parallelMode}\n\n`;

    output += '**Agent Mapping:**\n';
    const agents = [...new Set(Object.values(this.agentMapping))];
    for (const agent of agents) {
      const types = Object.entries(this.agentMapping)
        .filter(([_, a]) => a === agent)
        .map(([t]) => t);
      const provider = this.providerMapping[agent] || 'auto';
      output += `  ${agent} (${provider}): ${types.slice(0, 3).join(', ')}${types.length > 3 ? '...' : ''}\n`;
    }
    output += '\n';

    if (recentDispatches.length > 0) {
      output += '**Recent Dispatches:**\n';
      for (const dispatch of recentDispatches.slice(-5)) {
        const icon = dispatch.success === true ? '✅' : dispatch.success === false ? '❌' : '🔄';
        const providerIcon = dispatch.provider === 'gemini' ? '🔷' : '🟣';
        output += `  ${icon} ${providerIcon} ${dispatch.taskId || 'N/A'} → ${dispatch.agentId || 'N/A'}`;
        if (dispatch.duration) output += ` (${dispatch.duration}ms)`;
        output += '\n';
      }
    }

    return output;
  }

  /**
   * Get provider statistics (Story GEMINI-INT.3)
   * @returns {Object} - Provider usage stats
   */
  getProviderStats() {
    const dispatches = this.getLog(100);
    const stats = {
      claude: { total: 0, success: 0, failed: 0, avgDuration: 0 },
      gemini: { total: 0, success: 0, failed: 0, avgDuration: 0 },
    };

    for (const dispatch of dispatches) {
      if (dispatch.type !== 'dispatch_completed' && dispatch.type !== 'dispatch_failed') continue;

      const provider = dispatch.provider || 'claude';
      if (!stats[provider]) continue;

      stats[provider].total++;
      if (dispatch.success) {
        stats[provider].success++;
      } else {
        stats[provider].failed++;
      }

      if (dispatch.duration) {
        const current = stats[provider].avgDuration * (stats[provider].total - 1);
        stats[provider].avgDuration = (current + dispatch.duration) / stats[provider].total;
      }
    }

    return stats;
  }
}

module.exports = SubagentDispatcher;
module.exports.SubagentDispatcher = SubagentDispatcher;
