'use strict';

/**
 * Unit tests for condition-evaluator module
 *
 * Tests the ConditionEvaluator class that evaluates workflow conditions
 * based on detected tech stack profile.
 *
 * Fixes #472 — unknown conditions must return false (fail-safe)
 */

const ConditionEvaluator = require('../../../.aiox-core/core/orchestration/condition-evaluator');

describe('ConditionEvaluator', () => {
  const FULL_PROFILE = {
    hasDatabase: true,
    hasFrontend: true,
    hasBackend: true,
    hasTypeScript: true,
    hasTests: true,
    database: {
      type: 'supabase',
      hasSchema: true,
      hasMigrations: true,
      hasRLS: true,
      envVarsConfigured: true,
    },
    frontend: {
      framework: 'react',
      buildTool: 'vite',
      styling: 'tailwind',
      componentLibrary: 'shadcn',
    },
    backend: {
      type: 'express',
      hasAPI: true,
    },
  };

  const EMPTY_PROFILE = {
    hasDatabase: false,
    hasFrontend: false,
    hasBackend: false,
    hasTypeScript: false,
    hasTests: false,
    database: { type: null, hasRLS: false, hasMigrations: false, envVarsConfigured: false },
    frontend: { framework: null, styling: null },
    backend: { type: null, hasAPI: false },
  };

  let evaluator;

  beforeEach(() => {
    jest.spyOn(console, 'warn').mockImplementation();
    evaluator = new ConditionEvaluator(FULL_PROFILE);
  });

  afterEach(() => {
    console.warn.mockRestore();
  });

  // ── Constructor ───────────────────────────────────────────────────

  describe('constructor', () => {
    test('stores profile and initializes state', () => {
      expect(evaluator.profile).toBe(FULL_PROFILE);
      expect(evaluator._qaApproved).toBe(false);
      expect(evaluator._phaseOutputs).toEqual({});
    });
  });

  // ── State setters ─────────────────────────────────────────────────

  describe('state setters', () => {
    test('setQAApproval updates flag', () => {
      evaluator.setQAApproval(true);
      expect(evaluator._qaApproved).toBe(true);
    });

    test('setPhaseOutputs updates outputs', () => {
      const outputs = { 1: { status: 'success' } };
      evaluator.setPhaseOutputs(outputs);
      expect(evaluator._phaseOutputs).toBe(outputs);
    });
  });

  // ── evaluate — basic built-in conditions ──────────────────────────

  describe('evaluate - basic conditions', () => {
    test('null/undefined/empty returns true', () => {
      expect(evaluator.evaluate(null)).toBe(true);
      expect(evaluator.evaluate(undefined)).toBe(true);
      expect(evaluator.evaluate('')).toBe(true);
    });

    test('project_has_database', () => {
      expect(evaluator.evaluate('project_has_database')).toBe(true);
      const ev = new ConditionEvaluator(EMPTY_PROFILE);
      expect(ev.evaluate('project_has_database')).toBe(false);
    });

    test('project_has_frontend', () => {
      expect(evaluator.evaluate('project_has_frontend')).toBe(true);
      const ev = new ConditionEvaluator(EMPTY_PROFILE);
      expect(ev.evaluate('project_has_frontend')).toBe(false);
    });

    test('project_has_backend', () => {
      expect(evaluator.evaluate('project_has_backend')).toBe(true);
    });

    test('project_has_typescript', () => {
      expect(evaluator.evaluate('project_has_typescript')).toBe(true);
    });

    test('project_has_tests', () => {
      expect(evaluator.evaluate('project_has_tests')).toBe(true);
    });
  });

  // ── evaluate — database conditions ───────────────────────────────

  describe('evaluate - database conditions', () => {
    test('supabase_configured', () => {
      expect(evaluator.evaluate('supabase_configured')).toBe(true);
    });

    test('supabase_configured false without env vars', () => {
      const profile = {
        ...FULL_PROFILE,
        database: { ...FULL_PROFILE.database, envVarsConfigured: false },
      };
      const ev = new ConditionEvaluator(profile);
      expect(ev.evaluate('supabase_configured')).toBe(false);
    });

    test('database_has_rls', () => {
      expect(evaluator.evaluate('database_has_rls')).toBe(true);
    });

    test('database_has_migrations', () => {
      expect(evaluator.evaluate('database_has_migrations')).toBe(true);
    });
  });

  // ── evaluate — frontend conditions ───────────────────────────────

  describe('evaluate - frontend conditions', () => {
    test('frontend_has_react', () => {
      expect(evaluator.evaluate('frontend_has_react')).toBe(true);
    });

    test('frontend_has_vue', () => {
      expect(evaluator.evaluate('frontend_has_vue')).toBe(false);
    });

    test('frontend_has_tailwind', () => {
      expect(evaluator.evaluate('frontend_has_tailwind')).toBe(true);
    });
  });

  // ── evaluate — workflow state conditions ──────────────────────────

  describe('evaluate - workflow state', () => {
    test('qa_review_approved from flag', () => {
      expect(evaluator.evaluate('qa_review_approved')).toBe(false);
      evaluator.setQAApproval(true);
      expect(evaluator.evaluate('qa_review_approved')).toBe(true);
    });

    test('qa_review_approved from phase output status', () => {
      evaluator.setPhaseOutputs({ 7: { status: 'approved' } });
      expect(evaluator.evaluate('qa_review_approved')).toBe(true);
    });

    test('qa_review_approved from result.approved', () => {
      evaluator.setPhaseOutputs({ 7: { result: { approved: true } } });
      expect(evaluator.evaluate('qa_review_approved')).toBe(true);
    });

    test('phase_2_completed requires success status', () => {
      expect(evaluator.evaluate('phase_2_completed')).toBe(false);
      evaluator.setPhaseOutputs({ 2: { status: 'success' } });
      expect(evaluator.evaluate('phase_2_completed')).toBe(true);
    });

    test('phase_3_completed accepts skipped status', () => {
      evaluator.setPhaseOutputs({ 3: { status: 'skipped' } });
      expect(evaluator.evaluate('phase_3_completed')).toBe(true);
    });

    test('all_collection_phases_complete when all present', () => {
      evaluator.setPhaseOutputs({
        1: { status: 'success' },
        2: { status: 'success' },
        3: { status: 'success' },
      });
      expect(evaluator.evaluate('all_collection_phases_complete')).toBe(true);
    });

    test('all_collection_phases_complete fails when one missing', () => {
      evaluator.setPhaseOutputs({
        1: { status: 'success' },
        2: { status: 'success' },
      });
      expect(evaluator.evaluate('all_collection_phases_complete')).toBe(false);
    });
  });

  // ── evaluate — composite conditions ──────────────────────────────

  describe('evaluate - composite', () => {
    test('has_any_data_to_analyze', () => {
      expect(evaluator.evaluate('has_any_data_to_analyze')).toBe(true);
      const ev = new ConditionEvaluator(EMPTY_PROFILE);
      expect(ev.evaluate('has_any_data_to_analyze')).toBe(false);
    });
  });

  // ── evaluate — negation ───────────────────────────────────────────

  describe('evaluate - negation', () => {
    test('negates built-in condition', () => {
      expect(evaluator.evaluate('!project_has_database')).toBe(false);
      const ev = new ConditionEvaluator(EMPTY_PROFILE);
      expect(ev.evaluate('!project_has_database')).toBe(true);
    });
  });

  // ── evaluate — logical operators ──────────────────────────────────

  describe('evaluate - logical operators', () => {
    test('AND both true', () => {
      expect(evaluator.evaluate('project_has_database && project_has_frontend')).toBe(true);
    });

    test('AND one false', () => {
      const ev = new ConditionEvaluator(EMPTY_PROFILE);
      expect(ev.evaluate('project_has_database && project_has_frontend')).toBe(false);
    });

    test('OR one true', () => {
      const ev = new ConditionEvaluator({
        ...EMPTY_PROFILE,
        hasDatabase: true,
        database: { type: 'pg' },
      });
      expect(ev.evaluate('project_has_database || project_has_frontend')).toBe(true);
    });

    test('OR all false', () => {
      const ev = new ConditionEvaluator(EMPTY_PROFILE);
      expect(ev.evaluate('project_has_database || project_has_frontend')).toBe(false);
    });

    test('mixed AND/OR uses OR-of-ANDs evaluation', () => {
      // "a && b || c" → ["a && b", "c"]
      const ev = new ConditionEvaluator({
        ...EMPTY_PROFILE,
        hasBackend: true,
        backend: { type: 'express' },
      });
      // group1: project_has_database && project_has_frontend → false
      // group2: project_has_backend → true
      expect(ev.evaluate('project_has_database && project_has_frontend || project_has_backend')).toBe(true);
      expect(console.warn).toHaveBeenCalled();
    });
  });

  // ── evaluate — dot notation ───────────────────────────────────────

  describe('evaluate - dot notation', () => {
    test('boolean property access returns true', () => {
      expect(evaluator.evaluate('database.hasRLS')).toBe(true);
      expect(evaluator.evaluate('database.envVarsConfigured')).toBe(true);
    });

    test('equality check matches exact value', () => {
      expect(evaluator.evaluate('database.type === "supabase"')).toBe(true);
      expect(evaluator.evaluate('database.type === "postgresql"')).toBe(false);
    });

    test('equality with single quotes', () => {
      expect(evaluator.evaluate("frontend.framework === 'react'")).toBe(true);
    });

    test('returns false for null value path', () => {
      const ev = new ConditionEvaluator(EMPTY_PROFILE);
      expect(ev.evaluate('database.type')).toBe(false);
    });

    test('handles intermediate null gracefully', () => {
      const ev = new ConditionEvaluator({ database: null });
      expect(ev.evaluate('database.type.subfield')).toBe(false);
    });
  });

  // ── BUG #472 regression — unknown condition must be fail-safe ──────

  describe('evaluate - unknown conditions (fix #472)', () => {
    test('unknown condition returns false — not true (fail-safe)', () => {
      // Before fix: returned true (permissive — phases ran when they should be skipped)
      // After fix:  returns false (deny-by-default)
      expect(evaluator.evaluate('typo_in_condition_name')).toBe(false);
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('Unknown condition'),
      );
    });

    test('typo in known condition name is treated as unknown → false', () => {
      // "project_has_databse" looks like "project_has_database" but is not registered
      expect(evaluator.evaluate('project_has_databse')).toBe(false);
    });

    test('unknown condition in AND short-circuits correctly', () => {
      // Unknown returns false, so AND with any value = false
      expect(evaluator.evaluate('project_has_database && unknown_guard')).toBe(false);
    });

    test('unknown condition in OR falls through to other operands', () => {
      // unknown → false, project_has_database → true → OR result is true
      expect(evaluator.evaluate('unknown_guard || project_has_database')).toBe(true);
    });

    test('phase is skipped when guard condition name is unknown', () => {
      // Key workflow impact: a phase with an unknown condition should be SKIPPED
      const ev = new ConditionEvaluator(EMPTY_PROFILE);
      const result = ev.shouldExecutePhase({
        phase: 5,
        condition: 'obsolete_condition_from_v1',
      });
      expect(result.shouldExecute).toBe(false);
    });
  });

  // ── shouldExecutePhase ────────────────────────────────────────────

  describe('shouldExecutePhase', () => {
    test('no condition means always execute', () => {
      const result = evaluator.shouldExecutePhase({ phase: 1 });
      expect(result.shouldExecute).toBe(true);
      expect(result.reason).toBe('no_condition');
    });

    test('condition met', () => {
      const result = evaluator.shouldExecutePhase({
        phase: 2,
        condition: 'project_has_database',
      });
      expect(result.shouldExecute).toBe(true);
      expect(result.reason).toBe('condition_met');
    });

    test('condition not met', () => {
      const ev = new ConditionEvaluator(EMPTY_PROFILE);
      const result = ev.shouldExecutePhase({
        phase: 2,
        condition: 'project_has_database',
      });
      expect(result.shouldExecute).toBe(false);
      expect(result.reason).toContain('condition_not_met');
    });
  });

  // ── getFailedConditions ───────────────────────────────────────────

  describe('getFailedConditions', () => {
    test('returns empty for no condition', () => {
      expect(evaluator.getFailedConditions({ phase: 1 })).toEqual([]);
    });

    test('returns empty when all AND conditions pass', () => {
      const failed = evaluator.getFailedConditions({
        condition: 'project_has_database && project_has_frontend',
      });
      expect(failed).toEqual([]);
    });

    test('returns each failed AND condition', () => {
      const ev = new ConditionEvaluator(EMPTY_PROFILE);
      const failed = ev.getFailedConditions({
        condition: 'project_has_database && project_has_frontend',
      });
      expect(failed).toContain('project_has_database');
      expect(failed).toContain('project_has_frontend');
    });

    test('returns all conditions for OR when all fail', () => {
      const ev = new ConditionEvaluator(EMPTY_PROFILE);
      const failed = ev.getFailedConditions({
        condition: 'project_has_database || project_has_frontend',
      });
      expect(failed).toHaveLength(2);
    });

    test('returns empty for OR when one passes', () => {
      const failed = evaluator.getFailedConditions({
        condition: 'project_has_database || project_has_frontend',
      });
      expect(failed).toEqual([]);
    });

    test('handles mixed AND/OR when all groups fail', () => {
      const ev = new ConditionEvaluator(EMPTY_PROFILE);
      const failed = ev.getFailedConditions({
        condition: 'project_has_database && project_has_frontend || project_has_backend',
      });
      expect(failed.length).toBeGreaterThan(0);
    });

    test('returns empty for mixed AND/OR when one group passes', () => {
      const failed = evaluator.getFailedConditions({
        condition: 'project_has_database && project_has_frontend || project_has_backend',
      });
      expect(failed).toEqual([]);
    });
  });

  // ── getSkipExplanation ────────────────────────────────────────────

  describe('getSkipExplanation', () => {
    test('returns execute message when all conditions are met', () => {
      const explanation = evaluator.getSkipExplanation({ condition: 'project_has_database' });
      expect(explanation).toContain('should execute');
    });

    test('returns human-readable text for project_has_database failure', () => {
      const ev = new ConditionEvaluator(EMPTY_PROFILE);
      const explanation = ev.getSkipExplanation({ condition: 'project_has_database' });
      expect(explanation).toContain('No database detected');
    });

    test('returns human-readable text for project_has_frontend failure', () => {
      const ev = new ConditionEvaluator(EMPTY_PROFILE);
      const explanation = ev.getSkipExplanation({ condition: 'project_has_frontend' });
      expect(explanation).toContain('No frontend framework detected');
    });
  });

  // ── evaluateAllPhases ─────────────────────────────────────────────

  describe('evaluateAllPhases', () => {
    test('categorizes phases into applicable and skipped', () => {
      const ev = new ConditionEvaluator(EMPTY_PROFILE);
      const phases = [
        { phase: 1, phase_name: 'Architecture' },
        { phase: 2, phase_name: 'Database', condition: 'project_has_database' },
        { phase: 3, phase_name: 'Frontend', condition: 'project_has_frontend' },
        { phase: 4, phase_name: 'Consolidation' },
      ];

      const summary = ev.evaluateAllPhases(phases);

      expect(summary.applicable).toContain(1);
      expect(summary.applicable).toContain(4);
      expect(summary.skipped).toContain(2);
      expect(summary.skipped).toContain(3);
      expect(summary.details[1].shouldExecute).toBe(true);
      expect(summary.details[2].shouldExecute).toBe(false);
    });

    test('all phases applicable with full stack', () => {
      const phases = [
        { phase: 1, phase_name: 'Arch' },
        { phase: 2, phase_name: 'DB', condition: 'project_has_database' },
        { phase: 3, phase_name: 'FE', condition: 'project_has_frontend' },
      ];

      const summary = evaluator.evaluateAllPhases(phases);

      expect(summary.applicable).toEqual([1, 2, 3]);
      expect(summary.skipped).toEqual([]);
    });

    test('uses step field when phase is not set', () => {
      const phases = [{ step: 'init' }];
      const summary = evaluator.evaluateAllPhases(phases);
      expect(summary.details['init']).toBeDefined();
    });
  });
});
