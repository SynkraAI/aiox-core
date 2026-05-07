/**
 * Context Injector
 * Story 10.3 - Parallel Agent Execution
 *
 * Injects rich context into subagent prompts including:
 * - Project context
 * - Relevant files
 * - Memory/patterns
 * - Gotchas
 * - Recent decisions
 */

const fs = require('fs');
const path = require('path');

// Import dependencies with fallbacks
const GOTCHAS_MEMORY_MODULE = '../memory/gotchas-memory';
let MemoryQuery, GotchasMemory, SessionMemory;
let gotchasMemoryLoadError = null;
try {
  MemoryQuery = require('../memory/memory-query');
} catch {
  MemoryQuery = null;
}
try {
  const gotchasMemoryModule = require(GOTCHAS_MEMORY_MODULE);
  if (!gotchasMemoryModule || typeof gotchasMemoryModule.GotchasMemory === 'undefined') {
    throw new Error(`Missing named export GotchasMemory from ${GOTCHAS_MEMORY_MODULE}`);
  }
  if (typeof gotchasMemoryModule.GotchasMemory !== 'function') {
    throw new Error(
      `Expected GotchasMemory from ${GOTCHAS_MEMORY_MODULE} to be constructible; got ${typeof gotchasMemoryModule.GotchasMemory}`,
    );
  }
  GotchasMemory = gotchasMemoryModule.GotchasMemory;
} catch (error) {
  gotchasMemoryLoadError = error;
  if (process.env.AIOX_DEBUG) {
    console.warn(
      `[context-injector] Optional dependency '${GOTCHAS_MEMORY_MODULE}' failed to load: ${error.stack || error.message}`,
    );
  }
  GotchasMemory = null;
}
try {
  SessionMemory = require('../memory/session-memory');
} catch {
  SessionMemory = null;
}

class ContextInjector {
  constructor(config = {}) {
    // Token budget for context (prevents overwhelming the LLM)
    this.tokenBudget = config.tokenBudget || 4000;

    // Approximate characters per token
    this.charsPerToken = config.charsPerToken || 4;

    // Cache TTL (5 minutes)
    this.cacheTTL = config.cacheTTL || 5 * 60 * 1000;

    // Context cache
    this.cache = new Map();

    // Dependencies
    this.memoryQuery = config.memoryQuery || (MemoryQuery ? new MemoryQuery() : null);
    this.gotchasMemory = config.gotchasMemory || (GotchasMemory ? new GotchasMemory() : null);
    this.sessionMemory = config.sessionMemory || (SessionMemory ? new SessionMemory() : null);

    // Root path
    this.rootPath = config.rootPath || process.cwd();

    // Metrics
    this.metrics = {
      injections: 0,
      cacheHits: 0,
      avgContextSize: 0,
      avgInjectionTime: 0,
    };
  }

  /**
   * Inject context for a task
   * @param {Object} task - Task to inject context for
   * @param {Object} baseContext - Base context
   * @returns {Promise<string>} - Formatted context string
   */
  async inject(task, _baseContext = {}) {
    const startTime = Date.now();
    const cacheKey = this.getCacheKey(task);

    // Build injection payload
    const injection = {
      // 1. Task description (required)
      task: {
        id: task.id,
        description: task.description,
        acceptanceCriteria: task.acceptanceCriteria || [],
        verification: task.verification,
      },

      // 2. Project context (from cache or fresh)
      project: await this.getProjectContext(cacheKey),

      // 3. Relevant files (task-specific)
      files: await this.getRelevantFiles(task),

      // 4. Memory context
      memory: await this.getRelevantMemory(task),

      // 5. Gotchas
      gotchas: await this.getRelevantGotchas(task),

      // 6. Recent decisions
      decisions: await this.getRecentDecisions(),
    };

    // Format for LLM consumption
    const formatted = this.formatForLLM(injection);

    // Ensure within token budget
    const trimmed = this.trimToTokenBudget(formatted, this.tokenBudget);

    // Update metrics
    const injectionTime = Date.now() - startTime;
    this.updateMetrics(trimmed, injectionTime);

    return trimmed;
  }

  /**
   * Get cache key for a task
   * @param {Object} task - Task
   * @returns {string} - Cache key
   */
  getCacheKey(task) {
    return `${task.type || 'default'}-${task.service || 'core'}`;
  }

  /**
   * Get cached value if valid
   * @param {string} key - Cache key
   * @returns {any|null} - Cached value or null
   */
  getCached(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > this.cacheTTL) {
      this.cache.delete(key);
      return null;
    }

    this.metrics.cacheHits++;
    return cached.value;
  }

  /**
   * Set cache value
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   */
  setCache(key, value) {
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
    });
  }

  /**
   * Get project context
   * @param {string} cacheKey - Cache key for type-specific context
   * @returns {Promise<Object>} - Project context
   */
  async getProjectContext(cacheKey) {
    // Check cache
    const cached = this.getCached(`project-${cacheKey}`);
    if (cached) return cached;

    const context = {
      name: 'unknown',
      framework: null,
      patterns: [],
      conventions: [],
    };

    try {
      // Try to read codebase map
      const codebaseMapPath = path.join(this.rootPath, '.aiox', 'codebase-map.json');
      if (fs.existsSync(codebaseMapPath)) {
        const codebaseMap = JSON.parse(fs.readFileSync(codebaseMapPath, 'utf8'));
        context.name = codebaseMap.name || codebaseMap.projectName || 'project';
        context.framework = codebaseMap.framework || codebaseMap.mainFramework;
        context.patterns = codebaseMap.patterns || [];
        context.entryPoints = codebaseMap.entryPoints || [];
      }

      // Try to read package.json
      const packagePath = path.join(this.rootPath, 'package.json');
      if (fs.existsSync(packagePath)) {
        const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        context.name = pkg.name || context.name;
        context.version = pkg.version;
        context.dependencies = Object.keys(pkg.dependencies || {}).slice(0, 10);
      }

      // Try to detect conventions
      context.conventions = await this.detectConventions();
    } catch (_error) {
      // Silently fail - context is optional enhancement
    }

    // Cache the result
    this.setCache(`project-${cacheKey}`, context);

    return context;
  }

  /**
   * Detect project conventions
   * @returns {Promise<Array>} - Detected conventions
   */
  async detectConventions() {
    const conventions = [];

    try {
      // Check for TypeScript
      if (fs.existsSync(path.join(this.rootPath, 'tsconfig.json'))) {
        conventions.push('TypeScript project');
      }

      // Check for ESLint
      const eslintFiles = ['.eslintrc.js', '.eslintrc.json', '.eslintrc.yaml'];
      if (eslintFiles.some((f) => fs.existsSync(path.join(this.rootPath, f)))) {
        conventions.push('Uses ESLint');
      }

      // Check for Prettier
      if (fs.existsSync(path.join(this.rootPath, '.prettierrc'))) {
        conventions.push('Uses Prettier');
      }

      // Check for tests directory
      if (fs.existsSync(path.join(this.rootPath, 'tests'))) {
        conventions.push('Tests in /tests directory');
      } else if (fs.existsSync(path.join(this.rootPath, '__tests__'))) {
        conventions.push('Tests in /__tests__ directory');
      }
    } catch (_error) {
      // Ignore errors
    }

    return conventions;
  }

  /**
   * Get relevant files for a task
   * @param {Object} task - Task
   * @returns {Promise<Array>} - Relevant files
   */
  async getRelevantFiles(task) {
    const files = [];

    // Add explicitly specified files
    if (task.files) {
      for (const file of task.files) {
        files.push({
          path: file,
          purpose: 'Specified in task',
          exists: fs.existsSync(path.join(this.rootPath, file)),
        });
      }
    }

    // Infer files from task description
    const inferredFiles = this.inferFilesFromDescription(task.description);
    for (const file of inferredFiles) {
      if (!files.some((f) => f.path === file)) {
        files.push({
          path: file,
          purpose: 'Inferred from description',
          exists: fs.existsSync(path.join(this.rootPath, file)),
        });
      }
    }

    return files.slice(0, 10); // Limit to 10 files
  }

  /**
   * Infer files from task description
   * @param {string} description - Task description
   * @returns {Array<string>} - Inferred file paths
   */
  inferFilesFromDescription(description) {
    if (!description) return [];

    const files = [];

    // Match file paths in backticks
    const backtickMatches = description.match(/`([^`]+\.[a-zA-Z]+)`/g) || [];
    for (const match of backtickMatches) {
      files.push(match.replace(/`/g, ''));
    }

    // Match quoted paths
    const quotedMatches = description.match(/['"]([^'"]+\.[a-zA-Z]+)['"]/g) || [];
    for (const match of quotedMatches) {
      files.push(match.replace(/['"]/g, ''));
    }

    return [...new Set(files)];
  }

  /**
   * Get relevant memory for a task
   * @param {Object} task - Task
   * @returns {Promise<Array>} - Relevant memory entries
   */
  async getRelevantMemory(task) {
    if (!this.memoryQuery) return [];

    try {
      const query = task.description || task.id;
      const results = await this.memoryQuery.query(query, { limit: 5 });
      return results.map((r) => ({
        type: r.type,
        content: r.content || r.summary,
        relevance: r.score || r.relevance,
      }));
    } catch (_error) {
      return [];
    }
  }

  /**
   * Get relevant gotchas for a task
   * @param {Object} task - Task
   * @returns {Promise<Array>} - Relevant gotchas
   */
  async getRelevantGotchas(task) {
    if (!this.gotchasMemory) return [];

    try {
      return await this.gotchasMemory.getContextForTask(task.description || task.id);
    } catch (_error) {
      return [];
    }
  }

  /**
   * Get recent decisions from session memory
   * @returns {Promise<Array>} - Recent decisions
   */
  async getRecentDecisions() {
    if (!this.sessionMemory) return [];

    try {
      const decisions = await this.sessionMemory.getDecisions({ limit: 5 });
      return decisions.map((d) => ({
        decision: d.decision || d.content,
        reason: d.reason,
        timestamp: d.timestamp,
      }));
    } catch (_error) {
      return [];
    }
  }

  /**
   * Format injection payload for LLM consumption
   * @param {Object} injection - Injection payload
   * @returns {string} - Formatted markdown
   */
  formatForLLM(injection) {
    let output = '';

    // Task section (always included)
    output += '## Task Context\n\n';
    output += '### Current Task\n';
    output += `**ID:** ${injection.task.id}\n`;
    output += `**Description:** ${injection.task.description}\n\n`;

    // Acceptance Criteria
    if (injection.task.acceptanceCriteria && injection.task.acceptanceCriteria.length > 0) {
      output += '### Acceptance Criteria\n';
      const criteria = Array.isArray(injection.task.acceptanceCriteria)
        ? injection.task.acceptanceCriteria
        : [injection.task.acceptanceCriteria];
      criteria.forEach((ac, i) => {
        output += `${i + 1}. ${ac}\n`;
      });
      output += '\n';
    }

    // Relevant Files
    if (injection.files && injection.files.length > 0) {
      output += '### Relevant Files\n';
      injection.files.forEach((f) => {
        const status = f.exists ? '✓' : '?';
        output += `- [${status}] \`${f.path}\`: ${f.purpose}\n`;
      });
      output += '\n';
    }

    // Project Patterns
    if (injection.project.patterns && injection.project.patterns.length > 0) {
      output += '### Project Patterns\n';
      injection.project.patterns.slice(0, 5).forEach((p) => {
        const name = typeof p === 'string' ? p : p.name;
        output += `- ${name}\n`;
      });
      output += '\n';
    }

    // Conventions
    if (injection.project.conventions && injection.project.conventions.length > 0) {
      output += '### Conventions\n';
      injection.project.conventions.forEach((c) => {
        output += `- ${c}\n`;
      });
      output += '\n';
    }

    // Active Gotchas
    if (injection.gotchas && injection.gotchas.length > 0) {
      output += '### Active Gotchas (Avoid These)\n';
      injection.gotchas.slice(0, 5).forEach((g) => {
        const title = g.title || g.pattern || 'Warning';
        const workaround = g.workaround || g.description || 'Be careful';
        output += `⚠️ **${title}**: ${workaround}\n\n`;
      });
    }

    // Recent Decisions
    if (injection.decisions && injection.decisions.length > 0) {
      output += '### Recent Decisions\n';
      injection.decisions.slice(0, 3).forEach((d) => {
        output += `- ${d.decision}`;
        if (d.reason) output += ` (${d.reason})`;
        output += '\n';
      });
      output += '\n';
    }

    // Relevant Memory
    if (injection.memory && injection.memory.length > 0) {
      output += '### Relevant Context from Memory\n';
      injection.memory.slice(0, 3).forEach((m) => {
        output += `- [${m.type}] ${m.content}\n`;
      });
      output += '\n';
    }

    return output;
  }

  /**
   * Trim content to fit token budget
   * @param {string} content - Content to trim
   * @param {number} tokenBudget - Maximum tokens
   * @returns {string} - Trimmed content
   */
  trimToTokenBudget(content, tokenBudget) {
    const maxChars = tokenBudget * this.charsPerToken;

    if (content.length <= maxChars) {
      return content;
    }

    // Try to trim intelligently by sections
    const sections = content.split(/(?=###)/);
    let trimmed = '';

    // Always include the task section
    if (sections[0]) {
      trimmed = sections[0];
    }

    // Add other sections until budget is reached
    for (let i = 1; i < sections.length; i++) {
      if (trimmed.length + sections[i].length <= maxChars) {
        trimmed += sections[i];
      }
    }

    // If still too long, hard truncate
    if (trimmed.length > maxChars) {
      trimmed = trimmed.substring(0, maxChars - 50) + '\n\n[Context truncated for token budget]\n';
    }

    return trimmed;
  }

  /**
   * Update metrics
   * @param {string} context - Generated context
   * @param {number} time - Injection time
   */
  updateMetrics(context, time) {
    this.metrics.injections++;
    this.metrics.avgContextSize =
      (this.metrics.avgContextSize * (this.metrics.injections - 1) + context.length) /
      this.metrics.injections;
    this.metrics.avgInjectionTime =
      (this.metrics.avgInjectionTime * (this.metrics.injections - 1) + time) /
      this.metrics.injections;
  }

  /**
   * Get metrics
   * @returns {Object} - Current metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      avgContextSize: Math.round(this.metrics.avgContextSize),
      avgInjectionTime: Math.round(this.metrics.avgInjectionTime),
      cacheSize: this.cache.size,
    };
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Format status for CLI
   * @returns {string} - Formatted status
   */
  formatStatus() {
    const metrics = this.getMetrics();

    let output = '💉 Context Injector Status\n';
    output += '━'.repeat(40) + '\n\n';

    output += '**Metrics:**\n';
    output += `  Total Injections: ${metrics.injections}\n`;
    output += `  Cache Hits: ${metrics.cacheHits}\n`;
    output += `  Cache Size: ${metrics.cacheSize}\n`;
    output += `  Avg Context Size: ${metrics.avgContextSize} chars\n`;
    output += `  Avg Injection Time: ${metrics.avgInjectionTime}ms\n`;
    output += `  Token Budget: ${this.tokenBudget}\n`;

    return output;
  }
}

module.exports = ContextInjector;
module.exports.ContextInjector = ContextInjector;
module.exports.gotchasMemoryLoadError = gotchasMemoryLoadError;
