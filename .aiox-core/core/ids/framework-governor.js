'use strict';

/**
 * FrameworkGovernor — IDS Story IDS-7
 *
 * Facade class that integrates aiox-master with the IDS Entity Registry for
 * framework governance. Wraps DecisionEngine, RegistryLoader, and RegistryUpdater
 * to provide pre-check, impact analysis, post-registration, health, and stats.
 *
 * All public methods are advisory (non-blocking) and apply graceful degradation
 * with a 2s timeout and fallback on error.
 *
 * @example
 *   const { RegistryLoader } = require('.aiox-core/core/ids/registry-loader');
 *   const { IncrementalDecisionEngine } = require('.aiox-core/core/ids/incremental-decision-engine');
 *   const { RegistryUpdater } = require('.aiox-core/core/ids/registry-updater');
 *   const { FrameworkGovernor } = require('.aiox-core/core/ids/framework-governor');
 *
 *   const loader = new RegistryLoader();
 *   const engine = new IncrementalDecisionEngine(loader);
 *   const updater = new RegistryUpdater();
 *   const governor = new FrameworkGovernor(loader, engine, updater);
 *
 *   const result = await governor.preCheck('validate yaml schema', 'task');
 *
 * Story: IDS-7 (aiox-master IDS Governor Integration)
 */

const path = require('path');

// Optional dependency — RegistryHealer (IDS-4a, may not exist yet)
let _RegistryHealer = null;
try {
  _RegistryHealer = require(path.resolve(__dirname, 'registry-healer.js')).RegistryHealer;
} catch (_err) {
  // RegistryHealer not available — governor works in degraded mode
}

const TIMEOUT_MS = 2000;
const RISK_THRESHOLDS = {
  LOW: 0.1,
  MEDIUM: 0.3,
  HIGH: 0.5,
};

class FrameworkGovernor {
  /**
   * @param {import('./registry-loader').RegistryLoader} registryLoader
   * @param {import('./incremental-decision-engine').IncrementalDecisionEngine} decisionEngine
   * @param {import('./registry-updater').RegistryUpdater} registryUpdater
   * @param {object|null} [registryHealer=null] — Optional RegistryHealer instance (IDS-4a)
   */
  constructor(registryLoader, decisionEngine, registryUpdater, registryHealer = null) {
    if (!registryLoader) {
      throw new Error('[IDS-Governor] RegistryLoader instance is required');
    }
    if (!decisionEngine) {
      throw new Error('[IDS-Governor] IncrementalDecisionEngine instance is required');
    }
    if (!registryUpdater) {
      throw new Error('[IDS-Governor] RegistryUpdater instance is required');
    }

    this._loader = registryLoader;
    this._engine = decisionEngine;
    this._updater = registryUpdater;
    this._healer = registryHealer || null;
  }

  // ================================================================
  // Public API
  // ================================================================

  /**
   * Pre-operation registry query. Wraps DecisionEngine.analyze() with timeout
   * and graceful degradation.
   *
   * @param {string} intent — Natural language description of what is being created
   * @param {string} [entityType] — Optional entity type filter (agent, task, workflow, template, checklist)
   * @returns {Promise<object>} Advisory result with recommendations, topDecision, shouldProceed, alternatives
   */
  async preCheck(intent, entityType) {
    if (intent == null || typeof intent !== 'string') {
      throw new Error('[IDS-Governor] preCheck requires a string intent parameter');
    }
    return this._withTimeout(async () => {
      const context = {};
      if (entityType) {
        context.type = entityType;
      }

      const analysis = this._engine.analyze(intent, context);

      const topMatch = analysis.recommendations.length > 0
        ? analysis.recommendations[0]
        : null;

      return {
        intent,
        entityType: entityType || 'any',
        topDecision: analysis.summary.decision,
        confidence: analysis.summary.confidence,
        shouldProceed: true, // Always advisory — user decides
        matchesFound: analysis.summary.matchesFound,
        recommendations: analysis.recommendations.slice(0, 5),
        alternatives: analysis.recommendations.slice(0, 3).map((r) => ({
          entityId: r.entityId,
          decision: r.decision,
          relevance: r.relevanceScore,
          path: r.entityPath,
        })),
        rationale: analysis.rationale,
        advisory: true,
        topMatch: topMatch ? {
          entityId: topMatch.entityId,
          decision: topMatch.decision,
          relevance: topMatch.relevanceScore,
          path: topMatch.entityPath,
          adaptability: topMatch.adaptability || null,
        } : null,
      };
    }, {
      intent,
      entityType: entityType || 'any',
      topDecision: 'CREATE',
      confidence: 'low',
      shouldProceed: true,
      matchesFound: 0,
      recommendations: [],
      alternatives: [],
      rationale: 'IDS check unavailable — proceeding with CREATE.',
      advisory: true,
      topMatch: null,
      error: null,
    });
  }

  /**
   * Impact analysis for modifications. BFS traversal of usedBy graph to find
   * direct and indirect consumers.
   *
   * @param {string} entityId — The entity ID to analyze impact for
   * @returns {Promise<object>} Impact report with directConsumers, indirectConsumers, riskLevel
   */
  async impactAnalysis(entityId) {
    if (!entityId || typeof entityId !== 'string') {
      throw new Error('[IDS-Governor] impactAnalysis requires a non-empty entityId string');
    }
    return this._withTimeout(async () => {
      this._loader._ensureLoaded();

      const entity = this._loader._findById(entityId);
      if (!entity) {
        return {
          entityId,
          found: false,
          directConsumers: [],
          indirectConsumers: [],
          totalAffected: 0,
          riskLevel: 'NONE',
          adaptabilityScore: null,
          message: `Entity "${entityId}" not found in registry.`,
        };
      }

      // BFS traversal of usedBy graph
      const directConsumers = entity.usedBy || [];
      const visited = new Set();
      const queue = [...directConsumers];
      const allAffected = new Set(directConsumers);

      while (queue.length > 0) {
        const consumerId = queue.shift();
        if (visited.has(consumerId)) {
          continue;
        }
        visited.add(consumerId);

        const consumer = this._loader._findById(consumerId);
        if (consumer && consumer.usedBy) {
          for (const indirect of consumer.usedBy) {
            if (!allAffected.has(indirect)) {
              allAffected.add(indirect);
              queue.push(indirect);
            }
          }
        }
      }

      const indirectConsumers = [...allAffected].filter(
        (id) => !directConsumers.includes(id),
      );

      const totalEntities = this._loader.getEntityCount();
      const percentage = totalEntities > 0 ? allAffected.size / totalEntities : 0;

      const riskLevel = this._calculateRiskLevel(percentage);
      const adaptabilityScore = entity.adaptability ? entity.adaptability.score : null;
      const adaptabilityConstraints = entity.adaptability ? entity.adaptability.constraints : [];

      return {
        entityId,
        found: true,
        entityPath: entity.path || null,
        entityType: entity.type || null,
        directConsumers,
        indirectConsumers,
        totalAffected: allAffected.size,
        affectedPercentage: Math.round(percentage * 10000) / 10000,
        riskLevel,
        adaptabilityScore,
        adaptabilityConstraints,
        thresholdWarning: adaptabilityScore !== null && adaptabilityScore < 0.3
          ? 'Low adaptability score — modifications may break consumers.'
          : null,
        dependencies: entity.dependencies || [],
      };
    }, {
      entityId,
      found: false,
      directConsumers: [],
      indirectConsumers: [],
      totalAffected: 0,
      riskLevel: 'UNKNOWN',
      adaptabilityScore: null,
      message: 'IDS impact analysis unavailable — proceed with caution.',
      error: null,
    });
  }

  /**
   * Post-operation auto-registration. Wraps RegistryUpdater.onAgentTaskComplete()
   * for automatic audit logging (per @po SF-1).
   *
   * @param {string} filePath — Path to the newly created file
   * @param {object} [metadata={}] — Optional metadata (type, purpose, keywords, agent)
   * @returns {Promise<object>} Registration result
   */
  async postRegister(filePath, metadata = {}) {
    if (!filePath || typeof filePath !== 'string') {
      throw new Error('[IDS-Governor] postRegister requires a non-empty filePath string');
    }
    return this._withTimeout(async () => {
      const task = {
        id: metadata.taskId || 'framework-governor-register',
        agent: metadata.agent || 'aiox-master',
        type: metadata.type || 'create',
      };

      const artifacts = [filePath];

      const result = await this._updater.onAgentTaskComplete(task, artifacts);

      return {
        registered: result.updated > 0,
        filePath,
        updated: result.updated,
        errors: result.errors || [],
        metadata: {
          type: metadata.type || 'unknown',
          purpose: metadata.purpose || '',
          keywords: metadata.keywords || [],
          agent: task.agent,
        },
      };
    }, {
      registered: false,
      filePath,
      updated: 0,
      errors: ['IDS registration unavailable — entity not registered.'],
      metadata: {},
      error: null,
    });
  }

  /**
   * Health check wrapper. Uses RegistryHealer if available (IDS-4a),
   * otherwise returns graceful fallback.
   *
   * @returns {Promise<object>} Health check result
   */
  async healthCheck() {
    return this._withTimeout(async () => {
      if (!this._healer) {
        // Degraded mode — healer not available
        const entityCount = this._loader.getEntityCount();
        return {
          available: false,
          healerStatus: 'not-configured',
          message: 'RegistryHealer not available (IDS-4a pending). Basic stats provided.',
          basicStats: {
            entityCount,
            registryLoaded: entityCount > 0,
          },
        };
      }

      // Full health check via RegistryHealer
      const healthResult = this._healer.runHealthCheck
        ? await this._healer.runHealthCheck()
        : { status: 'unknown' };

      return {
        available: true,
        healerStatus: 'active',
        ...healthResult,
      };
    }, {
      available: false,
      healerStatus: 'error',
      message: 'Health check timed out or failed.',
      error: null,
    });
  }

  /**
   * Registry statistics aggregation.
   *
   * @returns {Promise<object>} Stats with entity counts by type, category, health score
   */
  async getStats() {
    return this._withTimeout(async () => {
      this._loader._ensureLoaded();

      const allEntities = this._loader._getAllEntities();
      const metadata = this._loader.getMetadata();
      const categories = this._loader.getCategories();

      // Count by type
      const byType = {};
      for (const entity of allEntities) {
        const type = entity.type || 'unknown';
        byType[type] = (byType[type] || 0) + 1;
      }

      // Count by category
      const byCategory = {};
      for (const entity of allEntities) {
        const category = entity.category || 'unknown';
        byCategory[category] = (byCategory[category] || 0) + 1;
      }

      // Calculate health score (percentage of entities with checksums and recent verification)
      let verifiedCount = 0;
      for (const entity of allEntities) {
        if (entity.checksum && entity.lastVerified) {
          verifiedCount++;
        }
      }
      const healthScore = allEntities.length > 0
        ? Math.round((verifiedCount / allEntities.length) * 100)
        : 0;

      return {
        totalEntities: allEntities.length,
        byType,
        byCategory,
        categories: categories.map((c) => c.id || c),
        lastUpdated: metadata.lastUpdated || null,
        registryVersion: metadata.version || '1.0.0',
        healthScore,
        healerAvailable: !!this._healer,
      };
    }, {
      totalEntities: 0,
      byType: {},
      byCategory: {},
      categories: [],
      lastUpdated: null,
      registryVersion: 'unknown',
      healthScore: 0,
      healerAvailable: false,
      error: null,
    });
  }

  // ================================================================
  // Formatting — CLI output helpers
  // ================================================================

  /**
   * Format preCheck result as CLI advisory message.
   * @param {object} result — Result from preCheck()
   * @returns {string} Formatted CLI output
   */
  static formatPreCheckOutput(result) {
    const lines = [];
    const border = '-'.repeat(55);

    lines.push(border);
    lines.push('  IDS Registry Check (Advisory)');
    lines.push(border);
    lines.push('');
    lines.push(`  Intent: "${result.intent}"`);
    lines.push(`  Entity Type: ${result.entityType}`);
    lines.push('');

    if (result.matchesFound === 0) {
      lines.push('  No matches found. Proceed with CREATE.');
    } else {
      lines.push(`  Matches Found (${result.matchesFound}):`);
      for (let i = 0; i < result.recommendations.length; i++) {
        const rec = result.recommendations[i];
        const pct = rec.relevanceScore ? `${(rec.relevanceScore * 100).toFixed(1)}%` : '?%';
        lines.push(`  ${i + 1}. ${rec.entityId} (${pct}) -> ${rec.decision}`);
        if (rec.entityPath) {
          lines.push(`     Path: ${rec.entityPath}`);
        }
      }
      lines.push('');
      lines.push(`  Recommendation: ${result.topDecision}`);
    }

    lines.push('');
    lines.push('  NOTE: This check is advisory. You may proceed regardless.');
    lines.push(border);

    return lines.join('\n');
  }

  /**
   * Format impactAnalysis result as CLI output.
   * @param {object} result — Result from impactAnalysis()
   * @returns {string} Formatted CLI output
   */
  static formatImpactOutput(result) {
    const lines = [];
    const border = '-'.repeat(55);

    lines.push(border);
    lines.push('  IDS Impact Analysis');
    lines.push(border);
    lines.push('');
    lines.push(`  Entity: ${result.entityId}`);

    if (!result.found) {
      lines.push('  Status: Not found in registry');
      lines.push(border);
      return lines.join('\n');
    }

    lines.push(`  Path: ${result.entityPath || 'N/A'}`);
    lines.push(`  Type: ${result.entityType || 'N/A'}`);
    lines.push(`  Risk Level: ${result.riskLevel}`);
    lines.push('');

    lines.push(`  Direct Consumers (${result.directConsumers.length}):`);
    if (result.directConsumers.length === 0) {
      lines.push('    (none — safe to modify)');
    } else {
      for (const c of result.directConsumers) {
        lines.push(`    - ${c}`);
      }
    }

    if (result.indirectConsumers.length > 0) {
      lines.push(`  Indirect Consumers (${result.indirectConsumers.length}):`);
      for (const c of result.indirectConsumers) {
        lines.push(`    - ${c}`);
      }
    }

    lines.push('');
    lines.push(`  Total Affected: ${result.totalAffected}`);

    if (result.adaptabilityScore !== null) {
      lines.push(`  Adaptability Score: ${result.adaptabilityScore}`);
    }

    if (result.thresholdWarning) {
      lines.push(`  WARNING: ${result.thresholdWarning}`);
    }

    lines.push(border);

    return lines.join('\n');
  }

  /**
   * Format getStats result as CLI output.
   * @param {object} result — Result from getStats()
   * @returns {string} Formatted CLI output
   */
  static formatStatsOutput(result) {
    const lines = [];
    const border = '-'.repeat(55);

    lines.push(border);
    lines.push('  IDS Registry Statistics');
    lines.push(border);
    lines.push('');
    lines.push(`  Total Entities: ${result.totalEntities}`);
    lines.push(`  Registry Version: ${result.registryVersion}`);
    lines.push(`  Last Updated: ${result.lastUpdated || 'N/A'}`);
    lines.push(`  Health Score: ${result.healthScore}%`);
    lines.push(`  Healer Available: ${result.healerAvailable ? 'Yes' : 'No'}`);
    lines.push('');

    lines.push('  By Type:');
    for (const [type, count] of Object.entries(result.byType)) {
      lines.push(`    ${type}: ${count}`);
    }

    lines.push('');
    lines.push('  By Category:');
    for (const [category, count] of Object.entries(result.byCategory)) {
      lines.push(`    ${category}: ${count}`);
    }

    lines.push(border);

    return lines.join('\n');
  }

  // ================================================================
  // Internal helpers
  // ================================================================

  /**
   * Execute an async function with timeout and graceful degradation.
   * @param {Function} fn — Async function to execute
   * @param {object} fallback — Fallback result on timeout or error
   * @returns {Promise<object>}
   */
  async _withTimeout(fn, fallback) {
    let timer;
    try {
      const result = await Promise.race([
        fn(),
        new Promise((_, reject) => {
          timer = setTimeout(() => reject(new Error('IDS operation timed out')), TIMEOUT_MS);
        }),
      ]);
      clearTimeout(timer);
      return result;
    } catch (error) {
      clearTimeout(timer);
      console.warn(`[IDS-Governor] Operation degraded: ${error.message}`);
      return { ...fallback, error: error.message };
    }
  }

  /**
   * Calculate risk level from affected percentage.
   * @param {number} percentage — Fraction of entities affected (0 to 1)
   * @returns {string} Risk level (NONE, LOW, MEDIUM, HIGH, CRITICAL)
   */
  _calculateRiskLevel(percentage) {
    if (percentage === 0) {
      return 'NONE';
    }
    if (percentage <= RISK_THRESHOLDS.LOW) {
      return 'LOW';
    }
    if (percentage <= RISK_THRESHOLDS.MEDIUM) {
      return 'MEDIUM';
    }
    if (percentage <= RISK_THRESHOLDS.HIGH) {
      return 'HIGH';
    }
    return 'CRITICAL';
  }
}

module.exports = { FrameworkGovernor, TIMEOUT_MS, RISK_THRESHOLDS };
