'use strict';

/**
 * IncrementalDecisionEngine — IDS Story IDS-2
 *
 * Analyzes developer/agent intent and recommends REUSE, ADAPT, or CREATE
 * based on existing artifacts in the Entity Registry.
 *
 * Algorithm: TF-IDF keyword overlap (60%) + purpose similarity (40%)
 * Decision: REUSE (>=90%) | ADAPT (60-89% + constraints) | CREATE (<60%)
 *
 * Source: ADR-IDS-001 — Incremental Development System
 */

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'is', 'are', 'for', 'to', 'of', 'in', 'on',
  'and', 'or', 'but', 'not', 'with', 'that', 'this', 'it', 'be',
  'as', 'at', 'by', 'from', 'has', 'have', 'had', 'was', 'were',
  'will', 'would', 'can', 'could', 'should', 'do', 'does', 'did',
  'i', 'we', 'you', 'my', 'our', 'your', 'its', 'their',
]);

const MIN_KEYWORD_LENGTH = 3;
const MAX_KEYWORDS_PER_ENTITY = 15;
const KEYWORD_OVERLAP_WEIGHT = 0.6;
const PURPOSE_SIMILARITY_WEIGHT = 0.4;
const THRESHOLD_MINIMUM = 0.4;
const MAX_RESULTS = 20;
const CACHE_TTL_MS = 300_000; // 300 seconds
const ADAPT_IMPACT_THRESHOLD = 0.30; // Calibrate after 90 days (ADR-IDS-001 Roundtable #2)

class IncrementalDecisionEngine {
  /**
   * @param {import('./registry-loader').RegistryLoader} registryLoader
   */
  constructor(registryLoader) {
    if (!registryLoader) {
      throw new Error('[IDS] IncrementalDecisionEngine requires a RegistryLoader instance');
    }
    this._loader = registryLoader;
    this._analysisCache = new Map();
    this._analysisCacheTimestamps = new Map();
    this._idfCache = null;
    this._idfCacheTimestamp = 0;
  }

  // ================================================================
  // Task 1: Main API — analyze(intent, context)
  // ================================================================

  /**
   * Analyze intent and return ranked recommendations with decisions.
   * @param {string} intent — Natural language description of what is needed
   * @param {object} [context={}] — Optional context (category, type filters)
   * @returns {object} Analysis result with recommendations, summary, rationale
   */
  analyze(intent, context = {}) {
    if (!intent || typeof intent !== 'string' || !intent.trim()) {
      return {
        intent,
        recommendations: [],
        summary: { totalEntities: 0, matchesFound: 0, decision: 'CREATE', confidence: 'low' },
        rationale: 'Empty or invalid intent provided.',
        warnings: ['Empty or invalid intent provided'],
      };
    }

    const cacheKey = `${intent.trim().toLowerCase()}|${JSON.stringify(context)}`;
    const cached = this._getFromCache(cacheKey);
    if (cached) return cached;

    try {
      this._loader._ensureLoaded();
    } catch (err) {
      throw new Error(`[IDS] Failed to load registry: ${err.message}`);
    }
    let allEntities;
    try {
      allEntities = this._loader._getAllEntities();
    } catch (err) {
      throw new Error(`[IDS] Failed to retrieve entities: ${err.message}`);
    }
    const totalEntities = allEntities.length;

    // Edge case: empty registry
    if (totalEntities === 0) {
      const result = {
        intent,
        recommendations: [],
        summary: { totalEntities: 0, matchesFound: 0, decision: 'CREATE', confidence: 'low' },
        rationale: 'Registry is empty — no existing artifacts to evaluate.',
        warnings: ['Registry is empty — no existing artifacts to evaluate'],
        justification: this._buildCreateJustification(intent, [], allEntities),
      };
      this._setCache(cacheKey, result);
      return result;
    }

    const intentKeywords = this._extractKeywords(intent);
    const intentPurpose = intent.trim().toLowerCase();

    // Filter by context if provided
    let candidates = allEntities;
    if (context.type) {
      candidates = candidates.filter(
        (e) => e.type && e.type.toLowerCase() === context.type.toLowerCase(),
      );
    }
    if (context.category) {
      candidates = candidates.filter(
        (e) => e.category && e.category.toLowerCase() === context.category.toLowerCase(),
      );
    }

    // Score all candidate entities
    const evaluations = [];
    for (const entity of candidates) {
      const keywordScore = this._calculateKeywordOverlap(intentKeywords, entity);
      const purposeScore = this._calculatePurposeSimilarity(intentPurpose, entity);
      const relevanceScore =
        keywordScore * KEYWORD_OVERLAP_WEIGHT + purposeScore * PURPOSE_SIMILARITY_WEIGHT;

      if (relevanceScore >= THRESHOLD_MINIMUM) {
        evaluations.push({
          entity,
          keywordScore,
          purposeScore,
          relevanceScore,
          canAdapt: entity.adaptability || { score: 0.5, constraints: [], extensionPoints: [] },
        });
      }
    }

    // Sort by relevance descending
    evaluations.sort((a, b) => b.relevanceScore - a.relevanceScore);
    const topEvaluations = evaluations.slice(0, MAX_RESULTS);

    // Build recommendations with decision + impact + rationale (lazy impact)
    const recommendations = topEvaluations.map((evaluation) => {
      const adaptationImpact = this._calculateImpact(evaluation.entity, totalEntities);
      const decision = this._applyDecisionMatrix({ ...evaluation, adaptationImpact });
      const rationale = this._generateEntityRationale(evaluation, decision, adaptationImpact);

      const rec = {
        entityId: evaluation.entity.id,
        entityPath: evaluation.entity.path,
        entityType: evaluation.entity.type,
        entityPurpose: evaluation.entity.purpose,
        relevanceScore: this._round(evaluation.relevanceScore),
        keywordScore: this._round(evaluation.keywordScore),
        purposeScore: this._round(evaluation.purposeScore),
        decision: decision.action,
        confidence: decision.confidence,
        rationale,
      };

      if (decision.action === 'ADAPT') {
        rec.adaptationImpact = adaptationImpact;
      }

      return rec;
    });

    // Overall summary
    const topDecision = recommendations.length > 0 ? recommendations[0].decision : 'CREATE';
    const topConfidence = recommendations.length > 0 ? recommendations[0].confidence : 'low';

    const result = {
      intent,
      recommendations,
      summary: {
        totalEntities,
        matchesFound: evaluations.length,
        decision: topDecision,
        confidence: topConfidence,
      },
      rationale: this._generateOverallRationale(recommendations, topDecision, evaluations),
    };

    // Sparse registry warning
    if (totalEntities > 0 && totalEntities < 10) {
      result.warnings = result.warnings || [];
      result.warnings.push('Registry sparse — results may be incomplete');
    }

    // CREATE justification (ADR-IDS-001 Roundtable #4)
    if (topDecision === 'CREATE') {
      result.justification = this._buildCreateJustification(intent, evaluations, allEntities);
    }

    this._setCache(cacheKey, result);
    return result;
  }

  // ================================================================
  // Task 2: Semantic Matching
  // ================================================================

  /**
   * Extract keywords from text using stop-word filtered tokenization.
   * @param {string} text
   * @returns {string[]}
   */
  _extractKeywords(text) {
    if (!text) return [];
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, ' ')
      .split(/\s+/)
      .filter((word) => word.length >= MIN_KEYWORD_LENGTH && !STOP_WORDS.has(word))
      .slice(0, MAX_KEYWORDS_PER_ENTITY);
  }

  /**
   * Calculate TF-IDF weighted keyword overlap between intent and entity.
   * @returns {number} Score 0-1
   */
  _calculateKeywordOverlap(intentKeywords, entity) {
    if (!intentKeywords.length) return 0;
    const entityKeywords = (entity.keywords || []).map((k) => k.toLowerCase());
    if (!entityKeywords.length) return 0;

    const idfScores = this._getIdfScores();
    let overlapScore = 0;
    let maxPossibleScore = 0;

    for (const intentKw of intentKeywords) {
      const idf = idfScores.get(intentKw) || 1;
      maxPossibleScore += idf;

      // Exact match
      if (entityKeywords.includes(intentKw)) {
        overlapScore += idf;
        continue;
      }

      // Partial/prefix match (fuzzy fallback)
      const partialMatch = entityKeywords.some(
        (ekw) => ekw.startsWith(intentKw) || intentKw.startsWith(ekw),
      );
      if (partialMatch) {
        overlapScore += idf * 0.5;
      }
    }

    return maxPossibleScore > 0 ? overlapScore / maxPossibleScore : 0;
  }

  /**
   * Build IDF (Inverse Document Frequency) scores for all keywords in registry.
   * Cached with TTL for performance.
   * @returns {Map<string, number>}
   */
  _getIdfScores() {
    const now = Date.now();
    if (this._idfCache && now - this._idfCacheTimestamp < CACHE_TTL_MS) {
      return this._idfCache;
    }

    const allEntities = this._loader._getAllEntities();
    const totalDocs = allEntities.length || 1;
    const keywordDocCount = new Map();

    for (const entity of allEntities) {
      const seen = new Set();
      for (const kw of entity.keywords || []) {
        const lower = kw.toLowerCase();
        if (!seen.has(lower)) {
          seen.add(lower);
          keywordDocCount.set(lower, (keywordDocCount.get(lower) || 0) + 1);
        }
      }
    }

    const idfScores = new Map();
    for (const [keyword, count] of keywordDocCount) {
      idfScores.set(keyword, Math.log(totalDocs / count) + 1);
    }

    this._idfCache = idfScores;
    this._idfCacheTimestamp = now;
    return idfScores;
  }

  /**
   * Calculate purpose similarity using token overlap (Jaccard-like).
   * @returns {number} Score 0-1
   */
  _calculatePurposeSimilarity(intentPurpose, entity) {
    if (!intentPurpose || !entity.purpose) return 0;

    const intentTokens = this._extractKeywords(intentPurpose);
    const purposeTokens = this._extractKeywords(entity.purpose);
    if (!intentTokens.length || !purposeTokens.length) return 0;

    const intentSet = new Set(intentTokens);
    const purposeSet = new Set(purposeTokens);

    let matches = 0;
    for (const token of intentSet) {
      if (purposeSet.has(token)) {
        matches++;
        continue;
      }
      // Fuzzy: prefix match
      for (const pToken of purposeSet) {
        if (pToken.startsWith(token) || token.startsWith(pToken)) {
          matches += 0.5;
          break;
        }
      }
    }

    const denominator = Math.min(intentSet.size, purposeSet.size);
    return denominator > 0 ? Math.min(matches / denominator, 1) : 0;
  }

  // ================================================================
  // Task 3: Decision Matrix
  // ================================================================

  /**
   * Apply decision matrix to a scored evaluation.
   * REUSE (>=90%) | ADAPT (60-89% + adaptability >=0.6 + impact <30%) | CREATE
   * @returns {{ action: string, confidence: string }}
   */
  _applyDecisionMatrix(evaluation) {
    const { relevanceScore, canAdapt, adaptationImpact } = evaluation;

    if (relevanceScore >= 0.9) {
      return { action: 'REUSE', confidence: 'high' };
    }

    if (
      relevanceScore >= 0.6 &&
      canAdapt.score >= 0.6 &&
      adaptationImpact.percentage < ADAPT_IMPACT_THRESHOLD
    ) {
      const confidence = relevanceScore >= 0.8 ? 'high' : 'medium';
      return { action: 'ADAPT', confidence };
    }

    const confidence = relevanceScore >= 0.6 ? 'medium' : 'low';
    return { action: 'CREATE', confidence };
  }

  // ================================================================
  // Task 4: Impact Analysis
  // ================================================================

  /**
   * Calculate adaptation impact by traversing usedBy relationships (BFS).
   * @param {object} entity
   * @param {number} totalEntities
   * @returns {object} Impact report
   */
  _calculateImpact(entity, totalEntities) {
    const directConsumers = entity.usedBy || [];
    const visited = new Set();
    const queue = [...directConsumers];
    const allAffected = new Set(directConsumers);

    while (queue.length > 0) {
      const consumerId = queue.shift();
      if (visited.has(consumerId)) continue;
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

    const directCount = directConsumers.length;
    const indirectCount = allAffected.size - directCount;
    const percentage = totalEntities > 0 ? allAffected.size / totalEntities : 0;

    return {
      directConsumers,
      directCount,
      indirectCount,
      totalAffected: allAffected.size,
      percentage: this._round(percentage),
      affectedEntities: [...allAffected],
    };
  }

  // ================================================================
  // Task 5: Rationale Generation
  // ================================================================

  /**
   * Generate rationale for a single entity recommendation.
   */
  _generateEntityRationale(evaluation, decision, impact) {
    const { entity, relevanceScore, keywordScore, purposeScore, canAdapt } = evaluation;
    const parts = [];

    if (decision.action === 'REUSE') {
      parts.push(`Strong match (${this._pct(relevanceScore)} relevance).`);
      parts.push(
        `Keywords align (${this._pct(keywordScore)}), purpose matches (${this._pct(purposeScore)}).`,
      );
      parts.push(`Recommendation: Use "${entity.id}" directly without modification.`);
    } else if (decision.action === 'ADAPT') {
      parts.push(`Good match (${this._pct(relevanceScore)} relevance) with adaptation potential.`);
      parts.push(
        `Adaptability: ${canAdapt.score}, impact: ${this._pct(impact.percentage)} of entities affected.`,
      );
      if (canAdapt.extensionPoints && canAdapt.extensionPoints.length > 0) {
        parts.push(`Adaptation points: ${canAdapt.extensionPoints.join(', ')}.`);
      }
      if (canAdapt.constraints && canAdapt.constraints.length > 0) {
        parts.push(`Constraints: ${canAdapt.constraints.join('; ')}.`);
      }
    } else {
      parts.push(`Insufficient match (${this._pct(relevanceScore)} relevance).`);
      if (relevanceScore >= 0.6 && canAdapt.score < 0.6) {
        parts.push(`Relevance adequate but adaptability too low (${canAdapt.score}).`);
      } else if (relevanceScore >= 0.6 && impact.percentage >= ADAPT_IMPACT_THRESHOLD) {
        parts.push(
          `Relevance adequate but adaptation impact too high (${this._pct(impact.percentage)}).`,
        );
      }
    }

    return parts.join(' ');
  }

  /**
   * Generate overall rationale summarizing the analysis.
   */
  _generateOverallRationale(recommendations, topDecision, evaluations) {
    if (recommendations.length === 0) {
      return 'No matches found above minimum threshold. CREATE is recommended.';
    }

    const reuseCount = recommendations.filter((r) => r.decision === 'REUSE').length;
    const adaptCount = recommendations.filter((r) => r.decision === 'ADAPT').length;
    const createCount = recommendations.filter((r) => r.decision === 'CREATE').length;

    const parts = [`Found ${evaluations.length} match(es) above threshold.`];
    if (reuseCount > 0) parts.push(`${reuseCount} can be reused directly.`);
    if (adaptCount > 0) parts.push(`${adaptCount} can be adapted.`);
    if (createCount > 0) parts.push(`${createCount} evaluated but insufficient for reuse/adaptation.`);
    parts.push(`Top recommendation: ${topDecision} "${recommendations[0].entityId}".`);

    return parts.join(' ');
  }

  // ================================================================
  // Task 9: CREATE Decision Requirements (ADR-IDS-001 Roundtable #4)
  // ================================================================

  /**
   * Build CREATE justification with evaluated patterns and rejection reasons.
   * Required fields: evaluated_patterns, rejection_reasons, new_capability.
   */
  _buildCreateJustification(intent, evaluations, allEntities) {
    const evaluated = evaluations.slice(0, 5);
    const evaluatedPatterns = evaluated.map((e) => e.entity.id);
    const rejectionReasons = {};

    for (const evaluation of evaluated) {
      const { entity, relevanceScore, canAdapt } = evaluation;
      const impact = this._calculateImpact(entity, allEntities.length);
      const reasons = [];

      if (relevanceScore < 0.6) {
        reasons.push(`Low relevance (${this._pct(relevanceScore)})`);
      }
      if (canAdapt.score < 0.6) {
        reasons.push(`Low adaptability (${canAdapt.score})`);
      }
      if (impact.percentage >= ADAPT_IMPACT_THRESHOLD) {
        reasons.push(`High adaptation impact (${this._pct(impact.percentage)})`);
      }
      if (reasons.length === 0) {
        reasons.push('Does not meet combined ADAPT criteria');
      }

      rejectionReasons[entity.id] = reasons.join('; ');
    }

    const reviewDate = new Date();
    reviewDate.setDate(reviewDate.getDate() + 30);

    return {
      evaluated_patterns: evaluatedPatterns,
      rejection_reasons: rejectionReasons,
      new_capability: intent.trim(),
      review_scheduled: reviewDate.toISOString().split('T')[0],
    };
  }

  /**
   * Review CREATE decisions across the registry.
   * Scans entities with createJustification metadata and returns review report.
   * (Task 9.4 — 30-day review automation)
   */
  reviewCreateDecisions() {
    try {
      this._loader._ensureLoaded();
    } catch (err) {
      throw new Error(`[IDS] Failed to load registry: ${err.message}`);
    }
    let allEntities;
    try {
      allEntities = this._loader._getAllEntities();
    } catch (err) {
      throw new Error(`[IDS] Failed to retrieve entities: ${err.message}`);
    }
    const now = new Date();
    const report = {
      pendingReview: [],
      promotionCandidates: [],
      monitoring: [],
      deprecationReview: [],
      totalReviewed: 0,
    };

    for (const entity of allEntities) {
      const justification = entity.createJustification;
      if (!justification) continue;

      report.totalReviewed++;
      const status = this.getPromotionStatus(entity);

      const entry = {
        entityId: entity.id,
        path: entity.path,
        reusageCount: (entity.usedBy || []).length,
        reviewScheduled: justification.review_scheduled,
        status,
      };

      // Check if review is due
      if (justification.review_scheduled) {
        const reviewDate = new Date(justification.review_scheduled);
        if (reviewDate <= now) {
          report.pendingReview.push(entry);
        }
      }

      // Categorize by promotion status
      if (status === 'promotion-candidate') {
        report.promotionCandidates.push(entry);
      } else if (status === 'deprecation-review') {
        report.deprecationReview.push(entry);
      } else {
        report.monitoring.push(entry);
      }
    }

    return report;
  }

  /**
   * Determine promotion status for an entity created via CREATE decision.
   * (Task 9.6 — Promotion pathway logic)
   *
   * - Used 3+ times -> promotion-candidate
   * - Used 1-2 times -> monitoring
   * - Never reused after 60 days -> deprecation-review
   */
  getPromotionStatus(entity) {
    if (!entity) return 'unknown';

    const reusageCount = (entity.usedBy || []).length;

    if (reusageCount >= 3) {
      return 'promotion-candidate';
    }

    if (reusageCount >= 1) {
      return 'monitoring';
    }

    // Check if 60 days have passed since creation/last verification
    const referenceDate = entity.createdAt
      || (entity.createJustification && entity.createJustification.created_at)
      || entity.lastVerified;

    if (referenceDate) {
      const refDate = new Date(referenceDate);
      const daysSince = (Date.now() - refDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSince > 60) {
        return 'deprecation-review';
      }
    }

    return 'monitoring';
  }

  // ================================================================
  // Task 7: Performance — Caching
  // ================================================================

  /**
   * Clear all internal caches.
   */
  clearCache() {
    this._analysisCache.clear();
    this._analysisCacheTimestamps.clear();
    this._idfCache = null;
    this._idfCacheTimestamp = 0;
  }

  _getFromCache(key) {
    const timestamp = this._analysisCacheTimestamps.get(key);
    if (timestamp && Date.now() - timestamp < CACHE_TTL_MS) {
      return this._analysisCache.get(key);
    }
    this._analysisCache.delete(key);
    this._analysisCacheTimestamps.delete(key);
    return null;
  }

  _setCache(key, value) {
    this._analysisCache.set(key, value);
    this._analysisCacheTimestamps.set(key, Date.now());
  }

  // ================================================================
  // Utilities
  // ================================================================

  _round(n) {
    return Math.round(n * 1000) / 1000;
  }

  _pct(n) {
    return `${(n * 100).toFixed(1)}%`;
  }
}

module.exports = {
  IncrementalDecisionEngine,
  STOP_WORDS,
  THRESHOLD_MINIMUM,
  ADAPT_IMPACT_THRESHOLD,
  KEYWORD_OVERLAP_WEIGHT,
  PURPOSE_SIMILARITY_WEIGHT,
  MAX_RESULTS,
  CACHE_TTL_MS,
};
