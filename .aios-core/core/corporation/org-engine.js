/**
 * OrgEngine -- Organizational Hierarchy Engine
 *
 * Loads, validates, and queries the corporate hierarchy defined in org-config.yaml.
 * Provides the foundation for PermissionEngine, TaskRouter, and EscalationManager.
 *
 * @module core/corporation/org-engine
 * @version 1.0.0
 * @story CORP-1
 */

'use strict';

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// =====================================================
// CONSTANTS
// =====================================================

const CONFIG_FILE = 'org-config.yaml';
const SCHEMA_FILE = path.join('schemas', 'org-config.schema.json');

/**
 * Level hierarchy -- higher number = more authority.
 * @type {Object<string, number>}
 */
const LEVEL_ORDER = {
  L0: 0,
  L1: 1,
  L2: 2,
  L3: 3,
  L4: 4,
  L5: 5,
};

/**
 * Keyword-to-department mapping for auto-classification of mind clones.
 * Used when a mind clone is not explicitly listed in org-config.yaml.
 * @type {Object<string, string[]>}
 */
const DEPT_KEYWORDS = {
  security: ['security', 'threat', 'crypto', 'compliance', 'privacy', 'vulnerability', 'pentest', 'breach'],
  ai_strategy: ['ai', 'ml', 'model', 'neural', 'deep learning', 'machine learning', 'llm', 'alignment', 'agi'],
  growth: ['marketing', 'brand', 'seo', 'growth', 'social media', 'ads', 'conversion', 'cro'],
  sales: ['sales', 'pipeline', 'prospecting', 'negotiation', 'pricing', 'outreach', 'cold email', 'funnel', 'closing'],
  people: ['hiring', 'culture', 'talent', 'hr', 'performance review', 'organizational', 'leadership', 'onboarding'],
  finance: ['valuation', 'dcf', 'saas metrics', 'investment', 'financial', 'revenue', 'cash flow', 'debt'],
  legal: ['legal', 'compliance', 'regulation', 'license', 'ip', 'contract', 'privacy law', 'gdpr'],
  education: ['learning', 'curriculum', 'training', 'education', 'mastery', 'teaching', 'edtech'],
  research: ['research', 'analysis', 'competitive', 'innovation', 'disruption', 'market research'],
  engineering: ['code', 'architecture', 'testing', 'infrastructure', 'refactoring', 'clean code', 'tdd'],
  product: ['product', 'prd', 'story', 'epic', 'roadmap', 'positioning', 'discovery', 'pm'],
  design: ['ux', 'ui', 'design', 'usability', 'accessibility', 'interface', 'typography', 'motion'],
  data: ['data', 'database', 'analytics', 'pipeline', 'etl', 'warehouse', 'bi', 'sql'],
  operations: ['agile', 'scrum', 'sprint', 'delivery', 'process', 'lean', 'kanban'],
  health: ['health', 'mental health', 'therapy', 'clinical', 'medical', 'wellness', 'cbt', 'fda', 'hipaa'],
  customer_success: ['customer success', 'retention', 'churn', 'nps', 'health score', 'onboarding', 'expansion revenue'],
  content: ['content', 'copywriting', 'storytelling', 'narrative', 'writing', 'publishing', 'newsletter'],
  behavioral_science: ['behavior', 'habits', 'nudge', 'cognitive bias', 'decision', 'psychology', 'persuasion'],
  community: ['devrel', 'community', 'developer advocacy', 'open source', 'evangelism', 'discord'],
  platform: ['platform', 'kubernetes', 'cloud', 'devops', 'observability', 'sre', 'reliability', 'docker'],
};

const MAX_CHAIN_DEPTH = 10; // Safety limit for escalation chain traversal

// =====================================================
// OrgEngine Class
// =====================================================

class OrgEngine {
  /**
   * @param {string} projectRoot -- Absolute path to the project root
   * @param {Object} [options]
   * @param {string} [options.configPath] -- Override path to org-config.yaml
   * @param {string} [options.agentsDir] -- Override path to agent .md files
   */
  constructor(projectRoot, options = {}) {
    this.projectRoot = projectRoot;
    this.configPath = options.configPath
      || path.join(projectRoot, '.aios-core', 'core', 'corporation', CONFIG_FILE);
    this.schemaPath = options.schemaPath
      || path.join(projectRoot, '.aios-core', 'core', 'corporation', SCHEMA_FILE);
    this.agentsDir = options.agentsDir
      || path.join(projectRoot, '.aios-core', 'development', 'agents');

    // Internal state
    this._config = null;
    this._agentIndex = null;    // agentId -> agent data (flat lookup)
    this._deptIndex = null;     // deptId  -> { ...dept, members: [] }
    this._levelIndex = null;    // level   -> [agentId, ...]
    this._loaded = false;
  }

  // =====================================================
  // PUBLIC API
  // =====================================================

  /**
   * Load and validate org-config.yaml.
   * Builds in-memory indexes for fast queries.
   *
   * @returns {OrgEngine} this (for chaining)
   * @throws {Error} If config is invalid and graceful_degradation is false
   */
  load() {
    if (this._loaded) return this;

    try {
      // 1. Read YAML
      if (!fs.existsSync(this.configPath)) {
        return this._handleLoadFailure('org-config.yaml not found: ' + this.configPath);
      }

      const raw = fs.readFileSync(this.configPath, 'utf8');
      const config = yaml.load(raw);

      if (!config || typeof config !== 'object') {
        return this._handleLoadFailure('org-config.yaml is empty or invalid');
      }

      // 2. Validate schema (lightweight -- check required fields)
      this._validate(config);

      // 3. Store config and build indexes
      this._config = config;
      this._buildIndexes();

      // 4. Auto-classify unregistered mind clones
      this._autoClassifyMindClones();

      this._loaded = true;
      return this;
    } catch (error) {
      return this._handleLoadFailure(error.message || String(error));
    }
  }

  /**
   * Check if the engine has loaded successfully.
   * @returns {boolean}
   */
  isLoaded() {
    return this._loaded;
  }

  /**
   * Get the raw config object.
   * @returns {Object|null}
   */
  getConfig() {
    return this._config;
  }

  /**
   * Get agent info by ID.
   *
   * @param {string} agentId
   * @returns {Object|null} Agent data with { id, level, department, type, title, description, reports_to }
   */
  getAgent(agentId) {
    if (!this._loaded || !this._agentIndex) return null;
    return this._agentIndex.get(agentId) || null;
  }

  /**
   * Get department info by ID.
   *
   * @param {string} deptId
   * @returns {Object|null} Department data with { name, icon, head, description, members }
   */
  getDepartment(deptId) {
    if (!this._loaded || !this._deptIndex) return null;
    return this._deptIndex.get(deptId) || null;
  }

  /**
   * Get all agents in a department.
   *
   * @param {string} deptId
   * @returns {Object[]} Array of agent data objects
   */
  getAgentsByDepartment(deptId) {
    const dept = this.getDepartment(deptId);
    if (!dept) return [];
    return dept.members.map(id => this.getAgent(id)).filter(Boolean);
  }

  /**
   * Get all agents at a specific level.
   *
   * @param {string} level -- 'L0' through 'L5'
   * @returns {Object[]} Array of agent data objects
   */
  getAgentsByLevel(level) {
    if (!this._loaded || !this._levelIndex) return [];
    const ids = this._levelIndex.get(level) || [];
    return ids.map(id => this.getAgent(id)).filter(Boolean);
  }

  /**
   * Get the escalation chain for an agent (reports_to traversal up to L5).
   *
   * @param {string} agentId
   * @returns {Object[]} Array of agent data objects from immediate superior to CEO
   */
  getEscalationChain(agentId) {
    if (!this._loaded) return [];

    const chain = [];
    const visited = new Set();
    let currentId = agentId;

    for (let i = 0; i < MAX_CHAIN_DEPTH; i++) {
      const agent = this.getAgent(currentId);
      if (!agent || !agent.reports_to) break;

      // Loop detection
      if (visited.has(agent.reports_to)) {
        console.warn(`[OrgEngine] Circular reports_to detected: ${agent.reports_to}`);
        break;
      }

      visited.add(agent.reports_to);
      const superior = this.getAgent(agent.reports_to);
      if (!superior) break;

      chain.push(superior);
      currentId = agent.reports_to;
    }

    return chain;
  }

  /**
   * Get direct reports for an agent.
   *
   * @param {string} agentId
   * @returns {Object[]} Array of agent data objects that report to this agent
   */
  getDirectReports(agentId) {
    if (!this._loaded || !this._agentIndex) return [];

    const reports = [];
    for (const [, agent] of this._agentIndex) {
      if (agent.reports_to === agentId) {
        reports.push(agent);
      }
    }
    return reports;
  }

  /**
   * Convert level string to number.
   *
   * @param {string} level -- 'L0' through 'L5'
   * @returns {number} 0-5, or -1 if invalid
   */
  getLevelNumber(level) {
    if (level in LEVEL_ORDER) return LEVEL_ORDER[level];
    return -1;
  }

  /**
   * Check if an agent is in the escalation chain of a superior.
   *
   * @param {string} agentId -- The agent to check
   * @param {string} superiorId -- The potential superior
   * @returns {boolean}
   */
  isInChainOf(agentId, superiorId) {
    const chain = this.getEscalationChain(agentId);
    return chain.some(a => a.id === superiorId);
  }

  /**
   * Get all agents (flattened).
   *
   * @returns {Object[]} Array of all agent data objects
   */
  getAllAgents() {
    if (!this._loaded || !this._agentIndex) return [];
    return Array.from(this._agentIndex.values());
  }

  /**
   * Get all department IDs.
   *
   * @returns {string[]}
   */
  getAllDepartmentIds() {
    if (!this._loaded || !this._deptIndex) return [];
    return Array.from(this._deptIndex.keys());
  }

  // =====================================================
  // PRIVATE METHODS
  // =====================================================

  /**
   * Validate config against required structure.
   * Lightweight validation -- checks required fields exist.
   */
  _validate(config) {
    const errors = [];

    if (!config.version) errors.push('Missing required field: version');
    if (typeof config.enabled !== 'boolean') errors.push('Missing or invalid field: enabled');
    if (!config.levels || typeof config.levels !== 'object') errors.push('Missing or invalid field: levels');
    if (!config.departments || typeof config.departments !== 'object') errors.push('Missing or invalid field: departments');
    if (!config.agents || typeof config.agents !== 'object') errors.push('Missing or invalid field: agents');

    // Validate levels
    if (config.levels) {
      const validLevels = ['L0', 'L1', 'L2', 'L3', 'L4', 'L5'];
      for (const key of Object.keys(config.levels)) {
        if (!validLevels.includes(key)) {
          errors.push(`Invalid level key: ${key} (expected L0-L5)`);
        }
        const lvl = config.levels[key];
        if (!lvl.name) errors.push(`Level ${key} missing required field: name`);
        if (!lvl.type) errors.push(`Level ${key} missing required field: type`);
      }
    }

    // Validate departments
    if (config.departments) {
      for (const [deptId, dept] of Object.entries(config.departments)) {
        if (!dept.name) errors.push(`Department ${deptId} missing required field: name`);
        if (!dept.head) errors.push(`Department ${deptId} missing required field: head`);
      }
    }

    // Validate agents
    if (config.agents) {
      const validLevels = ['L0', 'L1', 'L2', 'L3', 'L4', 'L5'];
      for (const [agentId, agent] of Object.entries(config.agents)) {
        if (!agent.level) errors.push(`Agent ${agentId} missing required field: level`);
        if (agent.level && !validLevels.includes(agent.level)) {
          errors.push(`Agent ${agentId} has invalid level: ${agent.level}`);
        }
        if (!agent.type) errors.push(`Agent ${agentId} missing required field: type`);
      }
    }

    if (errors.length > 0) {
      throw new Error(`org-config.yaml validation failed:\n  - ${errors.join('\n  - ')}`);
    }
  }

  /**
   * Build in-memory indexes for O(1) lookups.
   */
  _buildIndexes() {
    this._agentIndex = new Map();
    this._deptIndex = new Map();
    this._levelIndex = new Map();

    // Index departments
    if (this._config.departments) {
      for (const [deptId, dept] of Object.entries(this._config.departments)) {
        this._deptIndex.set(deptId, {
          id: deptId,
          ...dept,
          members: [],
        });
      }
    }

    // Index agents
    if (this._config.agents) {
      for (const [agentId, agent] of Object.entries(this._config.agents)) {
        const agentData = {
          id: agentId,
          ...agent,
        };
        this._agentIndex.set(agentId, agentData);

        // Add to level index
        if (!this._levelIndex.has(agent.level)) {
          this._levelIndex.set(agent.level, []);
        }
        this._levelIndex.get(agent.level).push(agentId);

        // Add to department index
        if (agent.department && this._deptIndex.has(agent.department)) {
          this._deptIndex.get(agent.department).members.push(agentId);
        }
      }
    }
  }

  /**
   * Auto-classify mind clones not listed in org-config.yaml.
   * Reads agent .md files from the agents directory and classifies
   * based on whenToUse keyword matching.
   */
  _autoClassifyMindClones() {
    if (!fs.existsSync(this.agentsDir)) return;

    let files;
    try {
      files = fs.readdirSync(this.agentsDir).filter(f => f.endsWith('.md'));
    } catch {
      return;
    }

    for (const file of files) {
      const agentId = file.replace('.md', '');

      // Skip if already in the config
      if (this._agentIndex.has(agentId)) continue;

      // Read the agent file to extract whenToUse
      const filePath = path.join(this.agentsDir, file);
      let whenToUse = '';

      try {
        const content = fs.readFileSync(filePath, 'utf8');
        // Extract whenToUse from YAML block
        const yamlMatch = content.match(/```yaml\s*([\s\S]*?)```/);
        if (yamlMatch) {
          const whenToUseMatch = yamlMatch[1].match(/whenToUse:\s*['"]?(.*?)['"]?\s*(?:\n|$)/);
          if (whenToUseMatch) {
            whenToUse = whenToUseMatch[1];
          }
        }
      } catch {
        // Cannot read file, skip
        continue;
      }

      // Classify based on keywords
      const classification = this._classifyByKeywords(whenToUse);

      const agentData = {
        id: agentId,
        level: 'L1',
        department: classification.department,
        type: 'mind_clone',
        title: 'Specialist',
        description: whenToUse || 'Auto-classified mind clone',
        reports_to: this._findDepartmentHead(classification.department),
        source: 'mega_brain',
        _auto_classified: true,
      };

      this._agentIndex.set(agentId, agentData);

      // Add to level index
      if (!this._levelIndex.has('L1')) {
        this._levelIndex.set('L1', []);
      }
      this._levelIndex.get('L1').push(agentId);

      // Add to department index
      if (this._deptIndex.has(classification.department)) {
        this._deptIndex.get(classification.department).members.push(agentId);
      }
    }
  }

  /**
   * Classify an agent by matching whenToUse against department keywords.
   *
   * @param {string} whenToUse
   * @returns {{ department: string, score: number }}
   */
  _classifyByKeywords(whenToUse) {
    const text = (whenToUse || '').toLowerCase();
    let bestDept = 'research'; // default
    let bestScore = 0;

    for (const [dept, keywords] of Object.entries(DEPT_KEYWORDS)) {
      const score = keywords.filter(k => text.includes(k)).length;
      if (score > bestScore) {
        bestScore = score;
        bestDept = dept;
      }
    }

    return { department: bestDept, score: bestScore };
  }

  /**
   * Find the head of a department (for reports_to assignment).
   *
   * @param {string} deptId
   * @returns {string|null}
   */
  _findDepartmentHead(deptId) {
    const dept = this._deptIndex ? this._deptIndex.get(deptId) : null;
    return dept ? dept.head : null;
  }

  /**
   * Handle load failure -- either throw or degrade gracefully.
   */
  _handleLoadFailure(message) {
    // Check if graceful degradation is explicitly disabled
    // If we cannot even read the config, default to graceful
    console.warn(`[OrgEngine] ${message} -- operating in flat mode`);

    this._config = null;
    this._agentIndex = null;
    this._deptIndex = null;
    this._levelIndex = null;
    this._loaded = false;

    return this;
  }
}

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  OrgEngine,
  LEVEL_ORDER,
  DEPT_KEYWORDS,
  MAX_CHAIN_DEPTH,
};
