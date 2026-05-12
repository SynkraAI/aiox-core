'use strict';

const path = require('path');
const { RegistryLoader } = require('../../../.aiox-core/core/ids/registry-loader');
const {
  IncrementalDecisionEngine,
  STOP_WORDS,
  THRESHOLD_MINIMUM,
  ADAPT_IMPACT_THRESHOLD,
  KEYWORD_OVERLAP_WEIGHT,
  PURPOSE_SIMILARITY_WEIGHT,
  MAX_RESULTS,
  CACHE_TTL_MS,
} = require('../../../.aiox-core/core/ids/incremental-decision-engine');

const FIXTURES = path.resolve(__dirname, 'fixtures');
const VALID_REGISTRY = path.join(FIXTURES, 'valid-registry.yaml');
const EMPTY_REGISTRY = path.join(FIXTURES, 'empty-registry.yaml');

describe('IncrementalDecisionEngine', () => {
  let loader;
  let engine;

  beforeEach(() => {
    loader = new RegistryLoader(VALID_REGISTRY);
    loader.load();
    engine = new IncrementalDecisionEngine(loader);
  });

  // ==============================================================
  // Task 1: Constructor & Main API
  // ==============================================================

  describe('constructor', () => {
    it('requires a RegistryLoader instance', () => {
      expect(() => new IncrementalDecisionEngine(null)).toThrow(
        /requires a RegistryLoader instance/,
      );
      expect(() => new IncrementalDecisionEngine()).toThrow(
        /requires a RegistryLoader instance/,
      );
    });

    it('creates engine with valid loader', () => {
      const e = new IncrementalDecisionEngine(loader);
      expect(e).toBeDefined();
    });
  });

  describe('analyze()', () => {
    it('returns result structure with recommendations and summary', () => {
      const result = engine.analyze('create documentation from templates');

      expect(result).toHaveProperty('intent');
      expect(result).toHaveProperty('recommendations');
      expect(result).toHaveProperty('summary');
      expect(result).toHaveProperty('rationale');
      expect(result.summary).toHaveProperty('totalEntities');
      expect(result.summary).toHaveProperty('matchesFound');
      expect(result.summary).toHaveProperty('decision');
      expect(result.summary).toHaveProperty('confidence');
    });

    it('returns recommendations sorted by relevance score', () => {
      const result = engine.analyze('documentation template creation');

      if (result.recommendations.length > 1) {
        for (let i = 0; i < result.recommendations.length - 1; i++) {
          expect(result.recommendations[i].relevanceScore).toBeGreaterThanOrEqual(
            result.recommendations[i + 1].relevanceScore,
          );
        }
      }
    });

    it('recommendations include required fields', () => {
      const result = engine.analyze('validate story quality checklist');

      if (result.recommendations.length > 0) {
        const rec = result.recommendations[0];
        expect(rec).toHaveProperty('entityId');
        expect(rec).toHaveProperty('entityPath');
        expect(rec).toHaveProperty('entityType');
        expect(rec).toHaveProperty('relevanceScore');
        expect(rec).toHaveProperty('keywordScore');
        expect(rec).toHaveProperty('purposeScore');
        expect(rec).toHaveProperty('decision');
        expect(rec).toHaveProperty('confidence');
        expect(rec).toHaveProperty('rationale');
      }
    });

    it('supports context filtering by type', () => {
      const result = engine.analyze('documentation', { type: 'task' });

      for (const rec of result.recommendations) {
        expect(rec.entityType).toBe('task');
      }
    });

    it('supports context filtering by category', () => {
      const result = engine.analyze('agent persona', { category: 'agents' });

      expect(result).toBeDefined();
      for (const rec of result.recommendations) {
        expect(rec.entityId).toBeDefined();
        // All results should come from the agents category in the registry
        const entity = loader._findById(rec.entityId);
        expect(entity.category).toBe('agents');
      }
    });
  });

  // ==============================================================
  // Edge cases: empty/invalid input
  // ==============================================================

  describe('edge cases — invalid input', () => {
    it('handles null intent', () => {
      const result = engine.analyze(null);
      expect(result.recommendations).toEqual([]);
      expect(result.summary.decision).toBe('CREATE');
      expect(result.warnings).toContain('Empty or invalid intent provided');
    });

    it('handles empty string intent', () => {
      const result = engine.analyze('');
      expect(result.recommendations).toEqual([]);
      expect(result.summary.decision).toBe('CREATE');
    });

    it('handles whitespace-only intent', () => {
      const result = engine.analyze('   ');
      expect(result.recommendations).toEqual([]);
      expect(result.summary.decision).toBe('CREATE');
    });

    it('handles non-string intent', () => {
      const result = engine.analyze(123);
      expect(result.recommendations).toEqual([]);
      expect(result.warnings).toBeDefined();
    });
  });

  // ==============================================================
  // Edge cases: empty/sparse registry (AC: 5 edge cases)
  // ==============================================================

  describe('edge cases — empty registry', () => {
    it('returns CREATE with empty registry rationale when 0 entities', () => {
      const emptyLoader = new RegistryLoader(EMPTY_REGISTRY);
      emptyLoader.load();
      const emptyEngine = new IncrementalDecisionEngine(emptyLoader);

      const result = emptyEngine.analyze('create a new task');

      expect(result.summary.decision).toBe('CREATE');
      expect(result.summary.confidence).toBe('low');
      expect(result.summary.totalEntities).toBe(0);
      expect(result.rationale).toContain('empty');
      expect(result.warnings).toContain(
        'Registry is empty — no existing artifacts to evaluate',
      );
    });

    it('returns CREATE justification for empty registry', () => {
      const emptyLoader = new RegistryLoader(EMPTY_REGISTRY);
      emptyLoader.load();
      const emptyEngine = new IncrementalDecisionEngine(emptyLoader);

      const result = emptyEngine.analyze('create a new task');

      expect(result.justification).toBeDefined();
      expect(result.justification.evaluated_patterns).toEqual([]);
      expect(result.justification.new_capability).toBe('create a new task');
      expect(result.justification.review_scheduled).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('edge cases — sparse registry (<10 entities)', () => {
    it('adds sparse registry warning when <10 entities', () => {
      // valid-registry.yaml has 5 entities
      const result = engine.analyze('some query');

      expect(result.warnings).toBeDefined();
      expect(result.warnings).toContain('Registry sparse — results may be incomplete');
    });
  });

  describe('edge cases — no matches above threshold', () => {
    it('returns CREATE when no matches exceed minimum threshold', () => {
      const result = engine.analyze('quantum computing blockchain hypervisor');

      expect(result.summary.decision).toBe('CREATE');
      expect(result.recommendations.length).toBe(0);
    });
  });

  // ==============================================================
  // Task 2: Semantic Matching
  // ==============================================================

  describe('_extractKeywords()', () => {
    it('extracts meaningful keywords from text', () => {
      const keywords = engine._extractKeywords('create documentation from templates');

      expect(keywords).toContain('create');
      expect(keywords).toContain('documentation');
      expect(keywords).toContain('templates');
      // Stop words filtered
      expect(keywords).not.toContain('from');
    });

    it('filters stop words', () => {
      const keywords = engine._extractKeywords('the quick brown fox is a fast runner');

      for (const kw of keywords) {
        expect(STOP_WORDS.has(kw)).toBe(false);
      }
    });

    it('filters short words (< 3 chars)', () => {
      const keywords = engine._extractKeywords('go to do it an');

      expect(keywords.every((kw) => kw.length >= 3)).toBe(true);
    });

    it('returns empty array for null input', () => {
      expect(engine._extractKeywords(null)).toEqual([]);
      expect(engine._extractKeywords('')).toEqual([]);
    });

    it('handles special characters', () => {
      const keywords = engine._extractKeywords('validate.story@draft#2026');

      // Should tokenize on non-alphanumeric
      expect(keywords).toContain('validate');
      expect(keywords).toContain('story');
      expect(keywords).toContain('draft');
      expect(keywords).toContain('2026');
    });

    it('converts to lowercase', () => {
      const keywords = engine._extractKeywords('CREATE Documentation TEMPLATE');

      for (const kw of keywords) {
        expect(kw).toBe(kw.toLowerCase());
      }
    });

    it('limits to MAX_KEYWORDS_PER_ENTITY', () => {
      const longText = Array.from({ length: 30 }, (_, i) => `keyword${i}`).join(' ');
      const keywords = engine._extractKeywords(longText);

      expect(keywords.length).toBeLessThanOrEqual(15);
    });
  });

  describe('semantic matching accuracy', () => {
    it('finds entities matching keywords from intent', () => {
      const result = engine.analyze('validate story quality checklist');

      expect(result.recommendations.length).toBeGreaterThan(0);
      expect(result.recommendations.some((r) => r.entityId === 'validate-story')).toBe(true);
    });

    it('finds entities matching purpose description', () => {
      const result = engine.analyze('documentation files from templates');

      expect(result.recommendations.length).toBeGreaterThan(0);
      expect(result.recommendations.some((r) => r.entityId === 'create-doc')).toBe(true);
    });

    it('ranks better matches higher', () => {
      const result = engine.analyze('validate story');

      expect(result.recommendations.length).toBeGreaterThan(0);
      const vsIdx = result.recommendations.findIndex((r) => r.entityId === 'validate-story');
      expect(vsIdx).toBe(0); // Should be top-ranked
    });
  });

  // ==============================================================
  // Task 3: Decision Matrix — Boundary Values
  // ==============================================================

  describe('_applyDecisionMatrix()', () => {
    it('returns REUSE for relevance >= 90%', () => {
      const decision = engine._applyDecisionMatrix({
        relevanceScore: 0.9,
        canAdapt: { score: 0.8, constraints: [], extensionPoints: [] },
        adaptationImpact: { percentage: 0.1 },
      });

      expect(decision.action).toBe('REUSE');
      expect(decision.confidence).toBe('high');
    });

    it('returns REUSE at exactly 90% boundary', () => {
      const decision = engine._applyDecisionMatrix({
        relevanceScore: 0.9,
        canAdapt: { score: 0.5, constraints: [], extensionPoints: [] },
        adaptationImpact: { percentage: 0.5 },
      });

      expect(decision.action).toBe('REUSE');
    });

    it('returns ADAPT for 60-89% with high adaptability and low impact', () => {
      const decision = engine._applyDecisionMatrix({
        relevanceScore: 0.75,
        canAdapt: { score: 0.7, constraints: [], extensionPoints: [] },
        adaptationImpact: { percentage: 0.15 },
      });

      expect(decision.action).toBe('ADAPT');
      expect(decision.confidence).toBe('medium');
    });

    it('returns ADAPT with high confidence when relevance >= 80%', () => {
      const decision = engine._applyDecisionMatrix({
        relevanceScore: 0.85,
        canAdapt: { score: 0.8, constraints: [], extensionPoints: [] },
        adaptationImpact: { percentage: 0.1 },
      });

      expect(decision.action).toBe('ADAPT');
      expect(decision.confidence).toBe('high');
    });

    it('returns CREATE at 59% boundary (below ADAPT threshold)', () => {
      const decision = engine._applyDecisionMatrix({
        relevanceScore: 0.59,
        canAdapt: { score: 0.8, constraints: [], extensionPoints: [] },
        adaptationImpact: { percentage: 0.1 },
      });

      expect(decision.action).toBe('CREATE');
      expect(decision.confidence).toBe('low');
    });

    it('returns CREATE at exactly 60% with low adaptability', () => {
      const decision = engine._applyDecisionMatrix({
        relevanceScore: 0.6,
        canAdapt: { score: 0.5, constraints: [], extensionPoints: [] },
        adaptationImpact: { percentage: 0.1 },
      });

      expect(decision.action).toBe('CREATE');
      expect(decision.confidence).toBe('medium');
    });

    it('returns CREATE at 60% with high adaptation impact', () => {
      const decision = engine._applyDecisionMatrix({
        relevanceScore: 0.6,
        canAdapt: { score: 0.8, constraints: [], extensionPoints: [] },
        adaptationImpact: { percentage: 0.35 },
      });

      expect(decision.action).toBe('CREATE');
      expect(decision.confidence).toBe('medium');
    });

    it('returns ADAPT at exactly 60% boundary with all conditions met', () => {
      const decision = engine._applyDecisionMatrix({
        relevanceScore: 0.6,
        canAdapt: { score: 0.6, constraints: [], extensionPoints: [] },
        adaptationImpact: { percentage: 0.29 },
      });

      expect(decision.action).toBe('ADAPT');
    });

    it('returns REUSE at 100%', () => {
      const decision = engine._applyDecisionMatrix({
        relevanceScore: 1.0,
        canAdapt: { score: 0.1, constraints: [], extensionPoints: [] },
        adaptationImpact: { percentage: 0.9 },
      });

      expect(decision.action).toBe('REUSE');
      expect(decision.confidence).toBe('high');
    });

    it('returns CREATE at 89% when adaptability is 0.59', () => {
      const decision = engine._applyDecisionMatrix({
        relevanceScore: 0.89,
        canAdapt: { score: 0.59, constraints: [], extensionPoints: [] },
        adaptationImpact: { percentage: 0.1 },
      });

      expect(decision.action).toBe('CREATE');
    });

    it('returns CREATE at 89% when impact is exactly 30%', () => {
      const decision = engine._applyDecisionMatrix({
        relevanceScore: 0.89,
        canAdapt: { score: 0.8, constraints: [], extensionPoints: [] },
        adaptationImpact: { percentage: 0.30 },
      });

      expect(decision.action).toBe('CREATE');
    });
  });

  // ==============================================================
  // Task 4: Impact Analysis
  // ==============================================================

  describe('_calculateImpact()', () => {
    it('calculates direct consumers from usedBy', () => {
      const entity = loader._findById('create-doc');
      const impact = engine._calculateImpact(entity, loader.getEntityCount());

      expect(impact.directConsumers).toContain('po');
      expect(impact.directConsumers).toContain('sm');
      expect(impact.directCount).toBe(2);
    });

    it('returns zero impact for entity with no consumers', () => {
      const entity = loader._findById('po');
      const impact = engine._calculateImpact(entity, loader.getEntityCount());

      expect(impact.directCount).toBe(0);
      expect(impact.totalAffected).toBe(0);
      expect(impact.percentage).toBe(0);
    });

    it('calculates percentage relative to total entities', () => {
      const entity = loader._findById('create-doc');
      const total = loader.getEntityCount();
      const impact = engine._calculateImpact(entity, total);

      expect(impact.percentage).toBeLessThanOrEqual(1);
      expect(impact.percentage).toBeGreaterThanOrEqual(0);
      expect(impact.percentage).toBe(engine._round(impact.totalAffected / total));
    });

    it('handles entity with no usedBy field', () => {
      const mockEntity = { id: 'test', usedBy: undefined };
      const impact = engine._calculateImpact(mockEntity, 10);

      expect(impact.directCount).toBe(0);
      expect(impact.totalAffected).toBe(0);
    });

    it('traverses indirect impacts via BFS', () => {
      // template-engine is used by create-doc, which is used by po and sm
      const entity = loader._findById('template-engine');
      const impact = engine._calculateImpact(entity, loader.getEntityCount());

      expect(impact.directConsumers).toContain('create-doc');
      expect(impact.directCount).toBe(1);
      // Indirect: po and sm use create-doc
      expect(impact.affectedEntities).toContain('po');
      expect(impact.affectedEntities).toContain('sm');
      expect(impact.indirectCount).toBe(2);
    });
  });

  // ==============================================================
  // Task 5: Rationale Generation
  // ==============================================================

  describe('rationale generation', () => {
    it('generates rationale for REUSE decision', () => {
      const evaluation = {
        entity: { id: 'test', purpose: 'test purpose' },
        relevanceScore: 0.95,
        keywordScore: 0.9,
        purposeScore: 1.0,
        canAdapt: { score: 0.8, constraints: [], extensionPoints: [] },
      };
      const decision = { action: 'REUSE', confidence: 'high' };
      const impact = { percentage: 0.1, directCount: 1, indirectCount: 0 };

      const rationale = engine._generateEntityRationale(evaluation, decision, impact);

      expect(rationale).toContain('Strong match');
      expect(rationale).toContain('directly without modification');
    });

    it('generates rationale for ADAPT decision with extension points', () => {
      const evaluation = {
        entity: { id: 'test', purpose: 'test purpose' },
        relevanceScore: 0.75,
        keywordScore: 0.7,
        purposeScore: 0.8,
        canAdapt: { score: 0.8, constraints: ['API stable'], extensionPoints: ['Custom helpers'] },
      };
      const decision = { action: 'ADAPT', confidence: 'medium' };
      const impact = { percentage: 0.15, directCount: 2, indirectCount: 1 };

      const rationale = engine._generateEntityRationale(evaluation, decision, impact);

      expect(rationale).toContain('adaptation potential');
      expect(rationale).toContain('Custom helpers');
      expect(rationale).toContain('API stable');
    });

    it('generates rationale for CREATE decision', () => {
      const evaluation = {
        entity: { id: 'test', purpose: 'test purpose' },
        relevanceScore: 0.45,
        keywordScore: 0.3,
        purposeScore: 0.6,
        canAdapt: { score: 0.4, constraints: [], extensionPoints: [] },
      };
      const decision = { action: 'CREATE', confidence: 'low' };
      const impact = { percentage: 0.05, directCount: 0, indirectCount: 0 };

      const rationale = engine._generateEntityRationale(evaluation, decision, impact);

      expect(rationale).toContain('Insufficient match');
    });

    it('explains low adaptability when relevance is adequate', () => {
      const evaluation = {
        entity: { id: 'test', purpose: 'test' },
        relevanceScore: 0.7,
        keywordScore: 0.7,
        purposeScore: 0.7,
        canAdapt: { score: 0.3, constraints: [], extensionPoints: [] },
      };
      const decision = { action: 'CREATE', confidence: 'medium' };
      const impact = { percentage: 0.1, directCount: 0, indirectCount: 0 };

      const rationale = engine._generateEntityRationale(evaluation, decision, impact);

      expect(rationale).toContain('adaptability too low');
    });

    it('generates overall rationale with match counts', () => {
      const result = engine.analyze('create documentation template');

      expect(result.rationale).toBeDefined();
      expect(typeof result.rationale).toBe('string');
      expect(result.rationale.length).toBeGreaterThan(0);
    });
  });

  // ==============================================================
  // Task 7: Performance
  // ==============================================================

  describe('performance (AC: 9)', () => {
    it('completes analysis in <500ms for typical queries', () => {
      const start = performance.now();
      engine.analyze('validate story drafts before implementation');
      const elapsed = performance.now() - start;

      expect(elapsed).toBeLessThan(500);
    });

    it('benefits from caching on repeated queries', () => {
      // First call
      const start1 = performance.now();
      engine.analyze('template rendering engine');
      const elapsed1 = performance.now() - start1;

      // Second call (cached)
      const start2 = performance.now();
      engine.analyze('template rendering engine');
      const elapsed2 = performance.now() - start2;

      // Cached should be faster or at least similar
      expect(elapsed2).toBeLessThan(elapsed1 * 2);
    });

    it('returns same result from cache', () => {
      const first = engine.analyze('documentation creation');
      const second = engine.analyze('documentation creation');

      expect(first).toBe(second); // Same reference from cache
    });

    it('clearCache invalidates all caches', () => {
      const first = engine.analyze('documentation');
      engine.clearCache();
      const second = engine.analyze('documentation');

      expect(first).not.toBe(second);
      expect(first.summary).toEqual(second.summary);
    });
  });

  // ==============================================================
  // Task 8: Testing edge cases
  // ==============================================================

  describe('all matches scenario', () => {
    it('handles query matching many entities', () => {
      // A broad query that might match multiple entities
      const result = engine.analyze('agent task template script documentation');

      expect(result.summary.matchesFound).toBeGreaterThanOrEqual(0);
      expect(result.recommendations.length).toBeLessThanOrEqual(MAX_RESULTS);
    });
  });

  // ==============================================================
  // Task 9: CREATE Decision Requirements
  // ==============================================================

  describe('CREATE justification (AC: 11)', () => {
    it('includes justification when decision is CREATE', () => {
      const result = engine.analyze('quantum blockchain hypervisor zettabyte');

      expect(result.summary.decision).toBe('CREATE');
      expect(result.justification).toBeDefined();
      expect(result.justification).toHaveProperty('evaluated_patterns');
      expect(result.justification).toHaveProperty('rejection_reasons');
      expect(result.justification).toHaveProperty('new_capability');
      expect(result.justification).toHaveProperty('review_scheduled');
    });

    it('evaluated_patterns is an array of entity IDs', () => {
      const result = engine.analyze('nonexistent feature xyz');

      if (result.justification) {
        expect(Array.isArray(result.justification.evaluated_patterns)).toBe(true);
      }
    });

    it('rejection_reasons maps entity IDs to reason strings', () => {
      // Use a query that might partially match but still result in CREATE
      const result = engine.analyze('create something slightly related documentation');

      if (result.justification && Object.keys(result.justification.rejection_reasons).length > 0) {
        for (const [id, reason] of Object.entries(result.justification.rejection_reasons)) {
          expect(typeof id).toBe('string');
          expect(typeof reason).toBe('string');
          expect(reason.length).toBeGreaterThan(0);
        }
      }
    });

    it('review_scheduled is 30 days from now', () => {
      const result = engine.analyze('brand new capability xyz');

      if (result.justification) {
        const expected = new Date();
        expected.setDate(expected.getDate() + 30);
        const expectedDate = expected.toISOString().split('T')[0];

        expect(result.justification.review_scheduled).toBe(expectedDate);
      }
    });

    it('new_capability contains the original intent', () => {
      const intent = 'unique novel capability never seen before';
      const result = engine.analyze(intent);

      if (result.justification) {
        expect(result.justification.new_capability).toBe(intent);
      }
    });
  });

  describe('reviewCreateDecisions() (AC: 12)', () => {
    it('returns review report structure', () => {
      const report = engine.reviewCreateDecisions();

      expect(report).toHaveProperty('pendingReview');
      expect(report).toHaveProperty('promotionCandidates');
      expect(report).toHaveProperty('monitoring');
      expect(report).toHaveProperty('deprecationReview');
      expect(report).toHaveProperty('totalReviewed');
      expect(Array.isArray(report.pendingReview)).toBe(true);
      expect(Array.isArray(report.promotionCandidates)).toBe(true);
    });

    it('handles registry with no CREATE justification metadata', () => {
      const report = engine.reviewCreateDecisions();

      // Valid registry fixture has no createJustification metadata
      expect(report.totalReviewed).toBe(0);
    });
  });

  describe('getPromotionStatus() (Task 9.6)', () => {
    it('returns promotion-candidate for 3+ usedBy', () => {
      const entity = { id: 'popular', usedBy: ['a', 'b', 'c'] };
      expect(engine.getPromotionStatus(entity)).toBe('promotion-candidate');
    });

    it('returns monitoring for 1-2 usedBy', () => {
      const entity = { id: 'used', usedBy: ['a'] };
      expect(engine.getPromotionStatus(entity)).toBe('monitoring');
    });

    it('returns monitoring for 2 usedBy', () => {
      const entity = { id: 'used', usedBy: ['a', 'b'] };
      expect(engine.getPromotionStatus(entity)).toBe('monitoring');
    });

    it('returns deprecation-review for 0 usedBy after 60 days', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 61);

      const entity = {
        id: 'unused',
        usedBy: [],
        createdAt: pastDate.toISOString().split('T')[0],
        createJustification: { created_at: pastDate.toISOString().split('T')[0] },
      };

      expect(engine.getPromotionStatus(entity)).toBe('deprecation-review');
    });

    it('returns monitoring for 0 usedBy within 60 days', () => {
      const recentDate = new Date();
      recentDate.setDate(recentDate.getDate() - 10);

      const entity = {
        id: 'new',
        usedBy: [],
        createJustification: { review_scheduled: recentDate.toISOString().split('T')[0] },
      };

      expect(engine.getPromotionStatus(entity)).toBe('monitoring');
    });

    it('returns unknown for null entity', () => {
      expect(engine.getPromotionStatus(null)).toBe('unknown');
    });
  });

  // ==============================================================
  // Exported constants
  // ==============================================================

  describe('exported constants', () => {
    it('exports all configuration constants', () => {
      expect(THRESHOLD_MINIMUM).toBe(0.4);
      expect(ADAPT_IMPACT_THRESHOLD).toBe(0.30);
      expect(KEYWORD_OVERLAP_WEIGHT).toBe(0.6);
      expect(PURPOSE_SIMILARITY_WEIGHT).toBe(0.4);
      expect(MAX_RESULTS).toBe(20);
      expect(CACHE_TTL_MS).toBe(300_000);
    });

    it('STOP_WORDS is a Set with expected entries', () => {
      expect(STOP_WORDS instanceof Set).toBe(true);
      expect(STOP_WORDS.has('the')).toBe(true);
      expect(STOP_WORDS.has('is')).toBe(true);
      expect(STOP_WORDS.has('validate')).toBe(false);
    });
  });

  // ==============================================================
  // CLI integration test (Task 8.6)
  // ==============================================================

  describe('CLI command integration', () => {
    const { execSync } = require('child_process');
    const cliPath = path.resolve(__dirname, '..', '..', '..', 'bin', 'aiox-ids.js');

    it('shows help when called without arguments', () => {
      const output = execSync(`node "${cliPath}" --help`, { encoding: 'utf8' });

      expect(output).toContain('ids:query');
      expect(output).toContain('ids:create-review');
      expect(output).toContain('--json');
    });

    it('returns JSON output with --json flag', () => {
      const output = execSync(
        `node "${cliPath}" ids:query "validate story" --json`,
        { encoding: 'utf8' },
      );

      const result = JSON.parse(output);
      expect(result).toHaveProperty('intent');
      expect(result).toHaveProperty('recommendations');
      expect(result).toHaveProperty('summary');
    });

    it('returns formatted output for query', () => {
      const output = execSync(
        `node "${cliPath}" ids:query "documentation template"`,
        { encoding: 'utf8' },
      );

      expect(output).toContain('IDS Analysis');
      expect(output).toContain('Decision:');
      expect(output).toContain('Rationale:');
    });

    it('handles create-review command', () => {
      const output = execSync(
        `node "${cliPath}" ids:create-review --json`,
        { encoding: 'utf8' },
      );

      const result = JSON.parse(output);
      expect(result).toHaveProperty('totalReviewed');
      expect(result).toHaveProperty('pendingReview');
    });

    it('returns error for missing intent', () => {
      expect.assertions(1);
      try {
        execSync(`node "${cliPath}" ids:query`, { encoding: 'utf8', stdio: 'pipe' });
      } catch (error) {
        expect(error.stderr || error.stdout).toContain('Intent is required');
      }
    });
  });
});
