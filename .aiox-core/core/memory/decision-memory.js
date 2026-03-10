#!/usr/bin/env node

/**
 * AIOX Decision Memory
 *
 * Story: 9.5 - Decision Memory
 * Epic: Epic 9 - Persistent Memory Layer
 *
 * Cross-session decision tracking system. Records agent decisions,
 * their outcomes, and confidence levels to enable learning from
 * past experience. Implements Phase 2 of the Agent Immortality
 * Protocol (#482) — Persistence layer.
 *
 * Features:
 * - AC1: decision-memory.js in .aiox-core/core/memory/
 * - AC2: Persists in .aiox/decisions.json
 * - AC3: Records decision context, rationale, and outcome
 * - AC4: Categories: architecture, delegation, tooling, recovery, workflow
 * - AC5: Command *decision {description} records manually
 * - AC6: Command *decisions lists recent decisions with outcomes
 * - AC7: Injects relevant past decisions before similar tasks
 * - AC8: Confidence scoring with decay over time
 * - AC9: Pattern detection across decisions (recurring success/failure)
 *
 * @version 1.0.0
 */

const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');
const { atomicWriteSync } = require('../synapse/utils/atomic-write');

// ═══════════════════════════════════════════════════════════════════════════════════
//                              CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════════

const CONFIG = {
  decisionsJsonPath: '.aiox/decisions.json',

  // Confidence decay: decisions lose relevance over time
  confidenceDecayDays: 30,
  minConfidence: 0.1,

  // Pattern detection
  patternThreshold: 3, // Same decision pattern 3x = recognized pattern
  maxDecisions: 500, // Cap stored decisions

  // Context injection
  maxInjectedDecisions: 5, // Max decisions injected per task
  similarityThreshold: 0.3, // Minimum keyword overlap for relevance

  version: '1.0.0',
  schemaVersion: 'aiox-decision-memory-v1',
};

// ═══════════════════════════════════════════════════════════════════════════════════
//                              ENUMS
// ═══════════════════════════════════════════════════════════════════════════════════

const DecisionCategory = {
  ARCHITECTURE: 'architecture',
  DELEGATION: 'delegation',
  TOOLING: 'tooling',
  RECOVERY: 'recovery',
  WORKFLOW: 'workflow',
  TESTING: 'testing',
  DEPLOYMENT: 'deployment',
  GENERAL: 'general',
};

const Outcome = {
  SUCCESS: 'success',
  PARTIAL: 'partial',
  FAILURE: 'failure',
  PENDING: 'pending',
};

const Events = {
  DECISION_RECORDED: 'decision:recorded',
  OUTCOME_UPDATED: 'outcome:updated',
  PATTERN_DETECTED: 'pattern:detected',
  DECISIONS_INJECTED: 'decisions:injected',
};

const CATEGORY_KEYWORDS = {
  [DecisionCategory.ARCHITECTURE]: [
    'architecture', 'design', 'pattern', 'module', 'refactor',
    'structure', 'layer', 'abstraction', 'interface', 'separation',
  ],
  [DecisionCategory.DELEGATION]: [
    'delegate', 'assign', 'agent', 'handoff', 'route',
    'dispatch', 'spawn', 'subagent', 'orchestrat',
  ],
  [DecisionCategory.TOOLING]: [
    'tool', 'cli', 'command', 'script', 'build',
    'lint', 'format', 'bundle', 'compile',
  ],
  [DecisionCategory.RECOVERY]: [
    'recover', 'retry', 'fallback', 'circuit', 'heal',
    'restart', 'rollback', 'backup', 'restore',
  ],
  [DecisionCategory.WORKFLOW]: [
    'workflow', 'pipeline', 'ci', 'deploy', 'release',
    'merge', 'branch', 'review', 'approve',
  ],
  [DecisionCategory.TESTING]: [
    'test', 'spec', 'coverage', 'assert', 'mock',
    'fixture', 'snapshot', 'jest', 'unit', 'integration',
  ],
  [DecisionCategory.DEPLOYMENT]: [
    'deploy', 'release', 'publish', 'ship', 'staging',
    'production', 'rollout', 'canary', 'blue-green',
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════════
//                              DECISION MEMORY
// ═══════════════════════════════════════════════════════════════════════════════════

class DecisionMemory extends EventEmitter {
  /**
   * @param {Object} options
   * @param {string} [options.projectRoot] - Project root directory
   * @param {Object} [options.config] - Override default config
   */
  constructor(options = {}) {
    super();
    this.projectRoot = options.projectRoot || process.cwd();
    this.config = { ...CONFIG, ...options.config };
    this.decisions = [];
    this.patterns = [];
    this._loaded = false;
  }

  /**
   * Load decisions from disk
   * @returns {Promise<void>}
   */
  async load() {
    const filePath = path.resolve(this.projectRoot, this.config.decisionsJsonPath);

    try {
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf-8');
        const data = JSON.parse(raw);

        if (data.schemaVersion === this.config.schemaVersion) {
          this.decisions = data.decisions || [];
          this.patterns = data.patterns || [];
        }
      }
    } catch {
      // Corrupted file — start fresh
      this.decisions = [];
      this.patterns = [];
    }

    this._loaded = true;
  }

  /**
   * Save decisions to disk
   * @returns {Promise<void>}
   */
  async save() {
    await this._ensureLoaded();

    const filePath = path.resolve(this.projectRoot, this.config.decisionsJsonPath);
    const dir = path.dirname(filePath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const data = {
      schemaVersion: this.config.schemaVersion,
      version: this.config.version,
      updatedAt: new Date().toISOString(),
      stats: this.getStats(),
      decisions: this.decisions.slice(-this.config.maxDecisions),
      patterns: this.patterns,
    };

    atomicWriteSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  }

  /**
   * Ensure decisions are loaded from disk before mutating state
   * @private
   */
  async _ensureLoaded() {
    if (!this._loaded) {
      await this.load();
    }
  }

  /**
   * Record a new decision (AC3, AC5)
   * @param {Object} decision
   * @param {string} decision.description - What was decided
   * @param {string} [decision.rationale] - Why this decision was made
   * @param {string[]} [decision.alternatives] - Other options considered
   * @param {string} [decision.category] - Decision category
   * @param {string} [decision.taskContext] - Related task/story
   * @param {string} [decision.agentId] - Agent that made the decision
   * @returns {Object} The recorded decision
   */
  async recordDecision({
    description,
    rationale = '',
    alternatives = [],
    category = null,
    taskContext = '',
    agentId = 'unknown',
  }) {
    await this._ensureLoaded();

    if (!description) {
      throw new Error('Decision description is required');
    }

    const decision = {
      id: this._generateId(),
      description,
      rationale,
      alternatives,
      category: category || this._detectCategory(description),
      taskContext,
      agentId,
      outcome: Outcome.PENDING,
      confidence: 1.0,
      keywords: this._extractKeywords(description),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      outcomeNotes: '',
    };

    this.decisions.push(decision);
    this._detectPatterns(decision);
    this.emit(Events.DECISION_RECORDED, decision);

    return decision;
  }

  /**
   * Update the outcome of a decision (AC3)
   * @param {string} decisionId - Decision ID
   * @param {string} outcome - 'success' | 'partial' | 'failure'
   * @param {string} [notes] - Outcome notes
   * @returns {Object|null} Updated decision
   */
  updateOutcome(decisionId, outcome, notes = '') {
    const decision = this.decisions.find(d => d.id === decisionId);
    if (!decision) return null;

    if (!Object.values(Outcome).includes(outcome)) {
      throw new Error(`Invalid outcome: ${outcome}. Use: ${Object.values(Outcome).join(', ')}`);
    }

    decision.outcome = outcome;
    decision.outcomeNotes = notes;
    decision.updatedAt = new Date().toISOString();

    // Adjust confidence based on outcome
    if (outcome === Outcome.SUCCESS) {
      decision.confidence = Math.min(1.0, decision.confidence + 0.1);
    } else if (outcome === Outcome.FAILURE) {
      decision.confidence = Math.max(this.config.minConfidence, decision.confidence - 0.3);
    }

    this.emit(Events.OUTCOME_UPDATED, decision);
    return decision;
  }

  /**
   * Get relevant past decisions for a task context (AC7)
   * @param {string} taskDescription - Current task description
   * @param {Object} [options]
   * @param {number} [options.limit] - Max results
   * @param {string} [options.category] - Filter by category
   * @param {boolean} [options.successOnly] - Only successful decisions
   * @returns {Object[]} Relevant decisions sorted by relevance
   */
  getRelevantDecisions(taskDescription, options = {}) {
    const limit = options.limit || this.config.maxInjectedDecisions;
    const taskKeywords = this._extractKeywords(taskDescription);

    let candidates = this.decisions.filter(d => d.outcome !== Outcome.PENDING);

    if (options.category) {
      candidates = candidates.filter(d => d.category === options.category);
    }

    if (options.successOnly) {
      candidates = candidates.filter(d => d.outcome === Outcome.SUCCESS);
    }

    // Score by keyword similarity + confidence with time decay
    const scored = candidates.map(d => {
      const similarity = this._keywordSimilarity(taskKeywords, d.keywords);
      const decayed = this._applyTimeDecay(d.confidence, d.createdAt);
      const outcomeBonus = d.outcome === Outcome.SUCCESS ? 0.2 :
        d.outcome === Outcome.FAILURE ? 0.1 : 0; // Failures are also valuable to learn from

      return {
        decision: d,
        score: (similarity * 0.6) + (decayed * 0.25) + (outcomeBonus * 0.15),
      };
    });

    return scored
      .filter(s => s.score >= this.config.similarityThreshold)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(s => ({
        ...s.decision,
        relevanceScore: Math.round(s.score * 100) / 100,
      }));
  }

  /**
   * Inject relevant decisions as context for a task (AC7)
   * @param {string} taskDescription - Task description
   * @returns {string} Formatted context block
   */
  injectDecisionContext(taskDescription) {
    const relevant = this.getRelevantDecisions(taskDescription);

    if (relevant.length === 0) return '';

    const lines = [
      '## 📋 Relevant Past Decisions',
      '',
    ];

    for (const d of relevant) {
      const outcomeIcon = d.outcome === Outcome.SUCCESS ? '✅' :
        d.outcome === Outcome.FAILURE ? '❌' : '⚠️';

      lines.push(`### ${outcomeIcon} ${d.description}`);
      if (d.rationale) lines.push(`**Rationale:** ${d.rationale}`);
      if (d.outcomeNotes) lines.push(`**Outcome:** ${d.outcomeNotes}`);
      lines.push(`**Category:** ${d.category} | **Confidence:** ${Math.round(this._applyTimeDecay(d.confidence, d.createdAt) * 100)}%`);
      lines.push('');
    }

    this.emit(Events.DECISIONS_INJECTED, { task: taskDescription, count: relevant.length });
    return lines.join('\n');
  }

  /**
   * Get recognized patterns (AC9)
   * @returns {Object[]} Detected patterns
   */
  getPatterns() {
    return [...this.patterns];
  }

  /**
   * Get statistics
   * @returns {Object} Stats
   */
  getStats() {
    const total = this.decisions.length;
    const byOutcome = {};
    const byCategory = {};

    for (const d of this.decisions) {
      byOutcome[d.outcome] = (byOutcome[d.outcome] || 0) + 1;
      byCategory[d.category] = (byCategory[d.category] || 0) + 1;
    }

    const successRate = total > 0
      ? (byOutcome[Outcome.SUCCESS] || 0) / Math.max(1, total - (byOutcome[Outcome.PENDING] || 0))
      : 0;

    return {
      total,
      byOutcome,
      byCategory,
      patterns: this.patterns.length,
      successRate: Math.round(successRate * 100),
    };
  }

  /**
   * List recent decisions (AC6)
   * @param {Object} [options]
   * @param {number} [options.limit] - Max results
   * @param {string} [options.category] - Filter by category
   * @returns {Object[]} Recent decisions
   */
  listDecisions(options = {}) {
    const limit = options.limit || 20;
    let results = [...this.decisions];

    if (options.category) {
      results = results.filter(d => d.category === options.category);
    }

    return results.slice(-limit).reverse();
  }

  // ═════════════════════════════════════════════════════════════════════════════
  //                          PRIVATE METHODS
  // ═════════════════════════════════════════════════════════════════════════════

  /**
   * Auto-detect category from description
   * @param {string} text
   * @returns {string} Category
   * @private
   */
  _detectCategory(text) {
    const lower = text.toLowerCase();
    let bestCategory = DecisionCategory.GENERAL;
    let bestScore = 0;

    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      const score = keywords.reduce((count, kw) =>
        count + (lower.includes(kw) ? 1 : 0), 0);

      if (score > bestScore) {
        bestScore = score;
        bestCategory = category;
      }
    }

    return bestCategory;
  }

  /**
   * Extract keywords from text
   * @param {string} text
   * @returns {string[]} Keywords
   * @private
   */
  _extractKeywords(text) {
    const stopWords = new Set([
      'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been',
      'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
      'would', 'could', 'should', 'may', 'might', 'can', 'shall',
      'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from',
      'as', 'into', 'through', 'during', 'before', 'after', 'and',
      'but', 'or', 'nor', 'not', 'so', 'yet', 'both', 'either',
      'neither', 'each', 'every', 'all', 'any', 'few', 'more',
      'most', 'other', 'some', 'such', 'no', 'only', 'own', 'same',
      'than', 'too', 'very', 'just', 'because', 'que', 'para',
      'com', 'por', 'uma', 'como', 'mais', 'dos', 'das', 'nos',
    ]);

    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2 && !stopWords.has(w))
      .slice(0, 20);
  }

  /**
   * Calculate keyword similarity between two keyword sets
   * @param {string[]} keywords1
   * @param {string[]} keywords2
   * @returns {number} Similarity score 0-1
   * @private
   */
  _keywordSimilarity(keywords1, keywords2) {
    if (keywords1.length === 0 || keywords2.length === 0) return 0;

    const set1 = new Set(keywords1);
    const set2 = new Set(keywords2);
    const intersection = [...set1].filter(k => set2.has(k)).length;
    const union = new Set([...set1, ...set2]).size;

    return union > 0 ? intersection / union : 0;
  }

  /**
   * Apply time-based confidence decay
   * @param {number} confidence - Original confidence
   * @param {string} createdAt - ISO date string
   * @returns {number} Decayed confidence
   * @private
   */
  _applyTimeDecay(confidence, createdAt) {
    const ageMs = Date.now() - new Date(createdAt).getTime();
    const ageDays = ageMs / (1000 * 60 * 60 * 24);
    const decayFactor = Math.max(
      this.config.minConfidence,
      1 - (ageDays / this.config.confidenceDecayDays) * 0.5,
    );

    return confidence * decayFactor;
  }

  /**
   * Detect recurring patterns in decisions (AC9)
   * @param {Object} newDecision - The new decision to check against
   * @private
   */
  _detectPatterns(newDecision) {
    const similar = this.decisions.filter(d =>
      d.id !== newDecision.id &&
      d.category === newDecision.category &&
      this._keywordSimilarity(d.keywords, newDecision.keywords) > 0.4,
    );

    if (similar.length >= this.config.patternThreshold - 1) {
      const outcomes = similar.map(d => d.outcome).filter(o => o !== Outcome.PENDING);
      const successCount = outcomes.filter(o => o === Outcome.SUCCESS).length;
      const failureCount = outcomes.filter(o => o === Outcome.FAILURE).length;

      const pattern = {
        id: `pattern-${this.patterns.length + 1}`,
        category: newDecision.category,
        description: `Recurring ${newDecision.category} decision: "${newDecision.description}"`,
        occurrences: similar.length + 1,
        successRate: outcomes.length > 0 ? successCount / outcomes.length : 0,
        recommendation: successCount > failureCount
          ? 'This approach has historically worked well. Consider reusing.'
          : 'This approach has historically underperformed. Consider alternatives.',
        detectedAt: new Date().toISOString(),
        relatedDecisionIds: [...similar.map(d => d.id), newDecision.id],
      };

      // Avoid duplicate patterns
      const exists = this.patterns.some(p =>
        p.category === pattern.category &&
        this._keywordSimilarity(
          this._extractKeywords(p.description),
          this._extractKeywords(pattern.description),
        ) > 0.6,
      );

      if (!exists) {
        this.patterns.push(pattern);
        this.emit(Events.PATTERN_DETECTED, pattern);
      }
    }
  }

  /**
   * Generate unique decision ID
   * @returns {string}
   * @private
   */
  _generateId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `dec-${timestamp}-${random}`;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
//                              EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════

module.exports = {
  DecisionMemory,
  DecisionCategory,
  Outcome,
  Events,
  CONFIG,
};
