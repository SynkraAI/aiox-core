/**
 * TaskRouter -- Intelligent Task Distribution Engine
 *
 * Classifies tasks by type/department, identifies eligible agents,
 * ranks by suitability, validates permissions, and assigns or queues.
 *
 * @module core/corporation/task-router
 * @version 1.0.0
 * @story CORP-5 - TaskRouter -- Distribuicao Inteligente
 */

'use strict';

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// =====================================================
// CONSTANTS
// =====================================================

const QUEUE_DIR = '.aios';
const QUEUE_SUBDIR = 'corporation';
const QUEUE_FILE = 'task-queue.json';

/**
 * Task type to department mapping.
 * @type {Object<string, string>}
 */
const TYPE_TO_DEPT = {
  // Engineering
  develop: 'engineering',
  implement: 'engineering',
  code: 'engineering',
  test: 'engineering',
  qa: 'engineering',
  review: 'engineering',
  refactor: 'engineering',
  debug: 'engineering',
  // Platform & Infrastructure
  deploy: 'platform',
  push: 'platform',
  infrastructure: 'platform',
  kubernetes: 'platform',
  docker: 'platform',
  observability: 'platform',
  monitoring: 'platform',
  // Design
  design: 'design',
  ux: 'design',
  ui: 'design',
  wireframe: 'design',
  prototype: 'design',
  animation: 'design',
  // Product
  prd: 'product',
  story: 'product',
  epic: 'product',
  roadmap: 'product',
  discovery: 'product',
  // Research
  research: 'research',
  analyze: 'research',
  competitive: 'research',
  // Data
  data: 'data',
  schema: 'data',
  migration: 'data',
  sql: 'data',
  // Operations
  sprint: 'operations',
  retro: 'operations',
  standup: 'operations',
  process: 'operations',
  // Security
  security: 'security',
  audit: 'security',
  threat: 'security',
  pentest: 'security',
  vulnerability: 'security',
  // Sales
  sales: 'sales',
  negotiate: 'sales',
  prospect: 'sales',
  pipeline: 'sales',
  funnel: 'sales',
  pricing: 'sales',
  // Growth & Marketing
  marketing: 'growth',
  seo: 'growth',
  ads: 'growth',
  campaign: 'growth',
  brand: 'growth',
  // Content
  content: 'content',
  copywriting: 'content',
  blog: 'content',
  newsletter: 'content',
  storytelling: 'content',
  // Customer Success
  onboarding: 'customer_success',
  retention: 'customer_success',
  churn: 'customer_success',
  nps: 'customer_success',
  // Health
  therapy: 'health',
  clinical: 'health',
  mental_health: 'health',
  wellness: 'health',
  // Finance
  valuation: 'finance',
  financial: 'finance',
  investment: 'finance',
  revenue: 'finance',
  // Legal
  legal: 'legal',
  contract: 'legal',
  compliance: 'legal',
  license: 'legal',
  // People
  hiring: 'people',
  culture: 'people',
  talent: 'people',
  leadership: 'people',
  // Education
  learning: 'education',
  training: 'education',
  curriculum: 'education',
  // AI Strategy
  ai: 'ai_strategy',
  ml: 'ai_strategy',
  llm: 'ai_strategy',
  model: 'ai_strategy',
  alignment: 'ai_strategy',
  // Behavioral Science
  behavior: 'behavioral_science',
  nudge: 'behavioral_science',
  habits: 'behavioral_science',
  bias: 'behavioral_science',
  // Community
  devrel: 'community',
  community: 'community',
  advocacy: 'community',
  opensource: 'community',
};

/**
 * Priority ordering for queue sorting (lower number = higher priority).
 * @type {Object<string, number>}
 */
const PRIORITY_ORDER = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

/**
 * Ranking weight configuration.
 */
const RANKING_WEIGHTS = {
  level_match: 0.40,
  dept_match: 0.30,
  availability: 0.20,
  recent_perf: 0.10,
};

/**
 * Level string to number mapping.
 * @type {Object<string, number>}
 */
const LEVEL_MAP = {
  L0: 0,
  L1: 1,
  L2: 2,
  L3: 3,
  L4: 4,
  L5: 5,
};

const DEFAULT_MIN_LEVEL = 'L1';
const DEFAULT_DEPARTMENT = 'research';
const ENTITY_REGISTRY_BONUS = 15;

// =====================================================
// TaskRouter Class
// =====================================================

class TaskRouter {
  /**
   * @param {import('./org-engine').OrgEngine} orgEngine - Loaded OrgEngine instance
   * @param {import('./permission-engine').PermissionEngine} permissionEngine - Permission checker
   * @param {import('./activity-logger').ActivityLogger|null} activityLogger - Event logger
   * @param {Object} [options]
   * @param {string} [options.projectRoot] - Project root path
   * @param {string} [options.registryPath] - Override path to entity-registry.yaml
   */
  constructor(orgEngine, permissionEngine, activityLogger, options = {}) {
    this.org = orgEngine;
    this.permissions = permissionEngine;
    this.logger = activityLogger;
    this.projectRoot = options.projectRoot || process.cwd();
    this.registryPath = options.registryPath
      || path.join(this.projectRoot, '.aios-core', 'data', 'entity-registry.yaml');
    this.queuePath = path.join(
      this.projectRoot, QUEUE_DIR, QUEUE_SUBDIR, QUEUE_FILE,
    );

    // Internal state
    this.activeTasks = new Map(); // agentId -> task
    this.taskQueue = [];          // Pending tasks
    this._registryIndex = null;   // Lazy: taskFile -> usedBy agents
    this._stats = {
      totalRouted: 0,
      totalQueued: 0,
      totalCompleted: 0,
      byDepartment: {},
      byAgent: {},
    };

    // Load persisted queue
    this._loadQueue();
  }

  // =====================================================
  // PUBLIC API
  // =====================================================

  /**
   * Route a task to the best available agent.
   *
   * Pipeline:
   *   1. Classify task -> department
   *   2. Find eligible agents (department + level + availability)
   *   3. Rank agents by suitability score
   *   4. Validate permission for top candidate
   *   5. Assign or queue
   *
   * @param {Object} task
   * @param {string} [task.type] - Task type (e.g., 'develop', 'review')
   * @param {string} [task.description] - Task description (for keyword classification)
   * @param {string} [task.file] - Task file path (for entity registry lookup)
   * @param {string} [task.department] - Target department (optional, auto-detected)
   * @param {string} [task.priority] - 'critical' | 'high' | 'medium' | 'low'
   * @param {string} [task.min_level] - Minimum agent level required
   * @param {string} [task.requested_by] - Agent ID that created this task
   * @returns {Object} TaskAssignment
   *   { assigned_to, department, level, reason, queued?, position?, alternatives? }
   */
  route(task) {
    if (!task || typeof task !== 'object') {
      return { assigned_to: null, reason: 'Invalid task object' };
    }

    // Feature flag check
    if (!this.org.isLoaded()) {
      return { assigned_to: null, reason: 'Corporation not loaded (flat mode)' };
    }

    // 1. Classify
    const classification = this._classify(task);

    // 2. Find eligible agents
    const eligible = this._findEligible(classification);

    // 3. Apply entity registry bonus hints
    const registryHints = this._getRegistryHints(task.file);

    // 4. Rank agents
    const ranked = this._rankAgents(eligible, classification, registryHints);

    // 5. Try to assign (validate permissions)
    for (let i = 0; i < ranked.length; i++) {
      const candidate = ranked[i];
      const permCheck = this.permissions.canPerform(
        candidate.id, 'execute_task', { taskType: task.type },
      );

      if (permCheck.allowed) {
        // Assign
        this.activeTasks.set(candidate.id, {
          ...task,
          classification,
          assigned_at: new Date().toISOString(),
        });

        // Log
        this._logEvent(candidate.id, 'task_assigned', task.type || 'unknown', 'success', {
          department: classification.department,
          priority: task.priority || 'medium',
          score: candidate._score,
        });

        // Stats
        this._updateStats(classification.department, candidate.id);

        // Build alternatives
        const alternatives = ranked
          .slice(i + 1, i + 4)
          .filter(a => a.id !== candidate.id)
          .map(a => ({ id: a.id, score: a._score, level: a.level }));

        return {
          assigned_to: candidate.id,
          department: classification.department,
          level: candidate.level,
          reason: `Best match: ${candidate.title || candidate.id}`,
          alternatives,
        };
      }
    }

    // 6. No one available -- enqueue
    const queuedTask = {
      ...task,
      classification,
      queued_at: new Date().toISOString(),
    };
    this.taskQueue.push(queuedTask);
    this._sortQueue();
    this._persistQueue();

    this._stats.totalQueued++;

    this._logEvent('system', 'task_queued', task.type || 'unknown', 'queued', {
      department: classification.department,
      priority: task.priority || 'medium',
      position: this.taskQueue.length,
    });

    return {
      assigned_to: null,
      queued: true,
      position: this.taskQueue.length,
      department: classification.department,
      reason: 'No eligible agent available, task queued',
    };
  }

  /**
   * Route a task to a specific agent (manual override by CEO).
   *
   * @param {string} agentId - Target agent ID
   * @param {Object} task - Task object
   * @returns {Object} TaskAssignment
   */
  routeToSpecific(agentId, task) {
    if (!this.org.isLoaded()) {
      return { assigned_to: null, reason: 'Corporation not loaded (flat mode)' };
    }

    const agent = this.org.getAgent(agentId);
    if (!agent) {
      return { assigned_to: null, reason: `Unknown agent: ${agentId}` };
    }

    // Check if agent is busy
    if (this.activeTasks.has(agentId)) {
      return {
        assigned_to: null,
        reason: `Agent ${agentId} is currently busy with another task`,
      };
    }

    const classification = this._classify(task);

    // Assign directly (CEO override, skip permission check)
    this.activeTasks.set(agentId, {
      ...task,
      classification,
      assigned_at: new Date().toISOString(),
      manual_override: true,
    });

    this._logEvent(agentId, 'task_assigned', task.type || 'unknown', 'success', {
      department: classification.department,
      manual_override: true,
      requested_by: task.requested_by || 'human',
    });

    this._updateStats(classification.department, agentId);

    return {
      assigned_to: agentId,
      department: agent.department || classification.department,
      level: agent.level,
      reason: `Manual assignment to ${agent.title || agentId}`,
    };
  }

  /**
   * Mark a task as complete, freeing the agent.
   * Processes queued tasks after release.
   *
   * @param {string} agentId - Agent that completed the task
   * @param {string} [result='success'] - Completion result
   * @returns {Object|null} Next task assignment if queue was processed, null otherwise
   */
  complete(agentId, result = 'success') {
    const task = this.activeTasks.get(agentId);
    if (!task) {
      return null;
    }

    this.activeTasks.delete(agentId);
    this._stats.totalCompleted++;

    this._logEvent(agentId, 'task_completed', task.type || 'unknown', result, {
      department: task.classification ? task.classification.department : 'unknown',
    });

    // Process queue -- try to assign next pending task
    return this._processQueue();
  }

  /**
   * Get active tasks.
   *
   * @param {Object} [filters]
   * @param {string} [filters.department] - Filter by department
   * @returns {Object[]} Array of { agentId, task }
   */
  getActiveTasks(filters = {}) {
    const tasks = [];
    for (const [agentId, task] of this.activeTasks) {
      const agent = this.org.getAgent(agentId);
      const dept = task.classification ? task.classification.department : null;

      if (filters.department && dept !== filters.department) continue;

      tasks.push({
        agentId,
        agentTitle: agent ? agent.title : agentId,
        department: dept,
        type: task.type,
        priority: task.priority || 'medium',
        assigned_at: task.assigned_at,
      });
    }
    return tasks;
  }

  /**
   * Get queued tasks.
   *
   * @param {Object} [filters]
   * @param {string} [filters.department] - Filter by department
   * @returns {Object[]} Array of queued tasks
   */
  getQueuedTasks(filters = {}) {
    if (!filters.department) return [...this.taskQueue];

    return this.taskQueue.filter(t =>
      t.classification && t.classification.department === filters.department,
    );
  }

  /**
   * Get router statistics.
   *
   * @returns {Object} Stats summary
   */
  getRouterStats() {
    return {
      totalRouted: this._stats.totalRouted,
      totalQueued: this._stats.totalQueued,
      totalCompleted: this._stats.totalCompleted,
      activeCount: this.activeTasks.size,
      queueLength: this.taskQueue.length,
      byDepartment: { ...this._stats.byDepartment },
      byAgent: { ...this._stats.byAgent },
    };
  }

  // =====================================================
  // PRIVATE -- Classification
  // =====================================================

  /**
   * Classify a task by type and/or description keywords.
   *
   * @param {Object} task
   * @returns {{ department: string, min_level: string, type: string }}
   * @private
   */
  _classify(task) {
    // Direct type mapping
    if (task.type && TYPE_TO_DEPT[task.type]) {
      return {
        department: TYPE_TO_DEPT[task.type],
        min_level: task.min_level || DEFAULT_MIN_LEVEL,
        type: task.type,
      };
    }

    // Fallback: task.department if provided
    if (task.department) {
      return {
        department: task.department,
        min_level: task.min_level || DEFAULT_MIN_LEVEL,
        type: task.type || 'unknown',
      };
    }

    // Keyword classification from description
    if (task.description) {
      const text = task.description.toLowerCase();

      // Check TYPE_TO_DEPT keys first
      for (const [type, dept] of Object.entries(TYPE_TO_DEPT)) {
        if (text.includes(type)) {
          return {
            department: dept,
            min_level: task.min_level || DEFAULT_MIN_LEVEL,
            type: type,
          };
        }
      }
    }

    // Default
    return {
      department: DEFAULT_DEPARTMENT,
      min_level: task.min_level || DEFAULT_MIN_LEVEL,
      type: task.type || 'unknown',
    };
  }

  // =====================================================
  // PRIVATE -- Agent Selection
  // =====================================================

  /**
   * Find agents eligible for a classified task.
   *
   * @param {Object} classification
   * @returns {Object[]} Eligible agent data objects
   * @private
   */
  _findEligible(classification) {
    const deptAgents = this.org.getAgentsByDepartment(classification.department);
    const minLevelNum = this._levelToNum(classification.min_level);

    return deptAgents.filter(agent => {
      // Level filter
      const agentLevelNum = this._levelToNum(agent.level);
      if (agentLevelNum < minLevelNum) return false;

      // Availability filter (not busy)
      if (this.activeTasks.has(agent.id)) return false;

      // Skip human (L5)
      if (agent.type === 'human') return false;

      return true;
    });
  }

  /**
   * Rank agents by suitability score.
   *
   * Score = level_match (40%) + dept_match (30%) + availability (20%) + recent_perf (10%)
   * Plus entity registry bonus if applicable.
   *
   * @param {Object[]} agents
   * @param {Object} classification
   * @param {string[]} registryHints - Agent IDs from entity registry
   * @returns {Object[]} Ranked agents with _score property
   * @private
   */
  _rankAgents(agents, classification, registryHints = []) {
    return agents
      .map(agent => {
        const score = this._calculateScore(agent, classification, registryHints);
        return { ...agent, _score: score };
      })
      .sort((a, b) => b._score - a._score);
  }

  /**
   * Calculate suitability score for an agent.
   *
   * @param {Object} agent
   * @param {Object} classification
   * @param {string[]} registryHints
   * @returns {number} Score (0-100+)
   * @private
   */
  _calculateScore(agent, classification, registryHints = []) {
    let score = 0;

    // Level match (40%): higher level = better match, max at L3-L4 for most tasks
    const agentLevelNum = this._levelToNum(agent.level);
    const minLevelNum = this._levelToNum(classification.min_level);
    // Scale: exact match = full score, higher = slightly less (overqualified)
    const levelDiff = agentLevelNum - minLevelNum;
    if (levelDiff === 0) {
      score += 40 * RANKING_WEIGHTS.level_match / RANKING_WEIGHTS.level_match;
    } else if (levelDiff === 1) {
      score += 35;
    } else if (levelDiff >= 2) {
      score += 25; // overqualified penalty
    }

    // Department match (30%): direct department match
    if (agent.department === classification.department) {
      score += 30;
    }

    // Availability (20%): not busy = full score (already filtered, so always 20)
    score += 20;

    // Recent performance (10%): placeholder -- always give base 5
    score += 5;

    // Entity registry bonus
    if (registryHints.includes(agent.id)) {
      score += ENTITY_REGISTRY_BONUS;
    }

    return Math.round(score * 100) / 100;
  }

  // =====================================================
  // PRIVATE -- Entity Registry
  // =====================================================

  /**
   * Get agent hints from entity registry for a task file.
   *
   * @param {string} [taskFile] - Task file path
   * @returns {string[]} Agent IDs that are associated with this task
   * @private
   */
  _getRegistryHints(taskFile) {
    if (!taskFile) return [];

    // Lazy load registry index
    if (!this._registryIndex) {
      this._buildRegistryIndex();
    }

    // Normalize the file path for lookup
    const normalizedFile = taskFile.replace(/\\/g, '/');
    const fileName = path.basename(normalizedFile, path.extname(normalizedFile));

    return this._registryIndex.get(fileName) || [];
  }

  /**
   * Build reverse index from entity registry: taskName -> [agentIds].
   *
   * @private
   */
  _buildRegistryIndex() {
    this._registryIndex = new Map();

    try {
      if (!fs.existsSync(this.registryPath)) return;

      const raw = fs.readFileSync(this.registryPath, 'utf8');
      const registry = yaml.load(raw);

      if (!registry || !registry.entities) return;

      // Walk all entity categories
      for (const [, categoryEntities] of Object.entries(registry.entities)) {
        if (!categoryEntities || typeof categoryEntities !== 'object') continue;

        for (const [entityId, entity] of Object.entries(categoryEntities)) {
          if (entity && Array.isArray(entity.usedBy) && entity.usedBy.length > 0) {
            this._registryIndex.set(entityId, entity.usedBy);
          }
        }
      }
    } catch {
      // Non-fatal: registry is optional
    }
  }

  // =====================================================
  // PRIVATE -- Queue Management
  // =====================================================

  /**
   * Sort queue by priority (critical > high > medium > low).
   * @private
   */
  _sortQueue() {
    this.taskQueue.sort((a, b) => {
      const aPriority = PRIORITY_ORDER[a.priority] ?? PRIORITY_ORDER.medium;
      const bPriority = PRIORITY_ORDER[b.priority] ?? PRIORITY_ORDER.medium;
      return aPriority - bPriority;
    });
  }

  /**
   * Process queued tasks after an agent is freed.
   * Tries to route the highest-priority queued task.
   *
   * @returns {Object|null} Assignment result if a queued task was routed
   * @private
   */
  _processQueue() {
    if (this.taskQueue.length === 0) return null;

    // Try each queued task (already sorted by priority)
    for (let i = 0; i < this.taskQueue.length; i++) {
      const queuedTask = this.taskQueue[i];
      const result = this.route(queuedTask);

      if (result.assigned_to) {
        // Remove from queue
        this.taskQueue.splice(i, 1);
        this._persistQueue();
        return result;
      }
    }

    return null;
  }

  /**
   * Persist queue to disk.
   * @private
   */
  _persistQueue() {
    try {
      const dir = path.dirname(this.queuePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(
        this.queuePath,
        JSON.stringify(this.taskQueue, null, 2),
        'utf8',
      );
    } catch {
      // Non-fatal: queue persistence is best-effort
    }
  }

  /**
   * Load queue from disk.
   * @private
   */
  _loadQueue() {
    try {
      if (!fs.existsSync(this.queuePath)) return;

      const raw = fs.readFileSync(this.queuePath, 'utf8');
      const parsed = JSON.parse(raw);

      if (Array.isArray(parsed)) {
        this.taskQueue = parsed;
      }
    } catch {
      // Non-fatal: start with empty queue
      this.taskQueue = [];
    }
  }

  // =====================================================
  // PRIVATE -- Helpers
  // =====================================================

  /**
   * Convert level string to number.
   * @param {string} level
   * @returns {number}
   * @private
   */
  _levelToNum(level) {
    if (level in LEVEL_MAP) return LEVEL_MAP[level];
    const num = parseInt(String(level).replace('L', ''), 10);
    return isNaN(num) ? 0 : num;
  }

  /**
   * Update internal stats.
   * @private
   */
  _updateStats(department, agentId) {
    this._stats.totalRouted++;
    this._stats.byDepartment[department] = (this._stats.byDepartment[department] || 0) + 1;
    this._stats.byAgent[agentId] = (this._stats.byAgent[agentId] || 0) + 1;
  }

  /**
   * Log an event via ActivityLogger.
   * @private
   */
  _logEvent(agentId, action, target, result, metadata = {}) {
    if (!this.logger) return;

    try {
      const agent = this.org.getAgent(agentId);
      this.logger.log({
        agent_id: agentId,
        level: agent ? agent.level : 'L0',
        department: agent ? agent.department : 'system',
        action,
        target,
        result,
        metadata,
      });
    } catch {
      // Non-fatal
    }
  }
}

// =====================================================
// FACTORY -- Feature Flag Aware
// =====================================================

/**
 * Create a TaskRouter that respects the corporation.enabled flag.
 * If disabled, returns null.
 *
 * @param {import('./org-engine').OrgEngine} orgEngine
 * @param {import('./permission-engine').PermissionEngine} permissionEngine
 * @param {import('./activity-logger').ActivityLogger|null} activityLogger
 * @param {Object} [options]
 * @returns {TaskRouter|null}
 */
function createTaskRouter(orgEngine, permissionEngine, activityLogger, options = {}) {
  if (!_isCorporationEnabled()) {
    return null;
  }
  return new TaskRouter(orgEngine, permissionEngine, activityLogger, options);
}

/**
 * Check if corporation feature is enabled in core-config.yaml.
 * @private
 */
function _isCorporationEnabled() {
  try {
    const configPath = path.join(process.cwd(), '.aios-core', 'core-config.yaml');
    if (!fs.existsSync(configPath)) return false;

    const content = fs.readFileSync(configPath, 'utf-8');
    const lines = content.split('\n');
    let inCorporation = false;

    for (const line of lines) {
      const trimmed = line.trimStart();
      if (/^corporation\s*:/.test(trimmed)) {
        inCorporation = true;
        continue;
      }
      if (inCorporation && /^\S/.test(trimmed)) break;
      if (inCorporation && /^\s+enabled\s*:\s*true/i.test(line)) return true;
    }

    return false;
  } catch {
    return false;
  }
}

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  TaskRouter,
  createTaskRouter,
  TYPE_TO_DEPT,
  PRIORITY_ORDER,
  RANKING_WEIGHTS,
  LEVEL_MAP,
  ENTITY_REGISTRY_BONUS,
};
