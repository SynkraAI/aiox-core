/**
 * Surface Checker Tests
 *
 * Story 11.4: Bob Surface Criteria
 *
 * Tests for the surface-checker module that determines when
 * Bob should interrupt and ask for human decision.
 *
 * @jest-environment node
 */

const path = require('path');
const {
  SurfaceChecker,
  createSurfaceChecker,
  shouldSurface,
} = require('../../.aiox-core/core/orchestration/surface-checker');

describe('SurfaceChecker', () => {
  let checker;

  beforeEach(() => {
    checker = new SurfaceChecker();
    checker.load();
  });

  describe('load()', () => {
    it('should load criteria file successfully', () => {
      const newChecker = new SurfaceChecker();
      const result = newChecker.load();
      expect(result).toBe(true);
      expect(newChecker.criteria).not.toBeNull();
    });

    it('should return false for non-existent file', () => {
      const newChecker = new SurfaceChecker('/non/existent/path.yaml');
      const result = newChecker.load();
      expect(result).toBe(false);
    });
  });

  describe('validate()', () => {
    it('should validate properly formatted criteria file', () => {
      const result = checker.validate();
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return errors for unloaded checker', () => {
      const newChecker = new SurfaceChecker('/non/existent/path.yaml');
      const result = newChecker.validate();
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Criteria file not loaded');
    });
  });

  describe('evaluateCondition()', () => {
    describe('comparison operators', () => {
      it('should evaluate greater than correctly', () => {
        expect(checker.evaluateCondition('estimated_cost > 5', { estimated_cost: 10 })).toBe(true);
        expect(checker.evaluateCondition('estimated_cost > 5', { estimated_cost: 5 })).toBe(false);
        expect(checker.evaluateCondition('estimated_cost > 5', { estimated_cost: 3 })).toBe(false);
      });

      it('should evaluate greater than or equal correctly', () => {
        expect(checker.evaluateCondition('errors_in_task >= 2', { errors_in_task: 2 })).toBe(true);
        expect(checker.evaluateCondition('errors_in_task >= 2', { errors_in_task: 3 })).toBe(true);
        expect(checker.evaluateCondition('errors_in_task >= 2', { errors_in_task: 1 })).toBe(false);
      });

      it('should evaluate less than correctly', () => {
        expect(checker.evaluateCondition('count < 10', { count: 5 })).toBe(true);
        expect(checker.evaluateCondition('count < 10', { count: 10 })).toBe(false);
      });

      it('should evaluate less than or equal correctly', () => {
        expect(checker.evaluateCondition('count <= 10', { count: 10 })).toBe(true);
        expect(checker.evaluateCondition('count <= 10', { count: 5 })).toBe(true);
        expect(checker.evaluateCondition('count <= 10', { count: 15 })).toBe(false);
      });

      it('should handle missing fields with default 0', () => {
        expect(checker.evaluateCondition('missing > 5', {})).toBe(false);
        expect(checker.evaluateCondition('missing >= 0', {})).toBe(true);
      });
    });

    describe('equality operators', () => {
      it('should evaluate string equality correctly', () => {
        expect(
          checker.evaluateCondition("risk_level == 'HIGH'", { risk_level: 'HIGH' }),
        ).toBe(true);
        expect(
          checker.evaluateCondition("risk_level == 'HIGH'", { risk_level: 'LOW' }),
        ).toBe(false);
      });

      it('should evaluate number equality correctly', () => {
        expect(checker.evaluateCondition('count == 5', { count: 5 })).toBe(true);
        expect(checker.evaluateCondition('count == 5', { count: 3 })).toBe(false);
      });
    });

    describe('IN operator', () => {
      it('should evaluate IN operator for destructive actions', () => {
        expect(
          checker.evaluateCondition('action_type IN destructive_actions', {
            action_type: 'delete_files',
          }),
        ).toBe(true);
        expect(
          checker.evaluateCondition('action_type IN destructive_actions', {
            action_type: 'force_push',
          }),
        ).toBe(true);
        expect(
          checker.evaluateCondition('action_type IN destructive_actions', {
            action_type: 'read_file',
          }),
        ).toBe(false);
      });
    });

    describe('scope comparison', () => {
      it('should evaluate scope change when explicitly flagged', () => {
        expect(
          checker.evaluateCondition('requested_scope > approved_scope', {
            scope_expanded: true,
          }),
        ).toBe(true);
        expect(
          checker.evaluateCondition('requested_scope > approved_scope', {
            scope_expanded: false,
          }),
        ).toBe(false);
      });

      it('should evaluate scope change by length comparison', () => {
        expect(
          checker.evaluateCondition('requested_scope > approved_scope', {
            requested_scope: 'full refactor of authentication system',
            approved_scope: 'fix login bug',
          }),
        ).toBe(true);
      });
    });

    describe('OR conditions', () => {
      it('should evaluate OR conditions correctly', () => {
        expect(
          checker.evaluateCondition('requires_api_key OR requires_payment', {
            requires_api_key: true,
            requires_payment: false,
          }),
        ).toBe(true);
        expect(
          checker.evaluateCondition('requires_api_key OR requires_payment', {
            requires_api_key: false,
            requires_payment: true,
          }),
        ).toBe(true);
        expect(
          checker.evaluateCondition('requires_api_key OR requires_payment', {
            requires_api_key: false,
            requires_payment: false,
          }),
        ).toBe(false);
      });
    });

    describe('boolean fields', () => {
      it('should evaluate boolean fields correctly', () => {
        expect(checker.evaluateCondition('requires_api_key', { requires_api_key: true })).toBe(
          true,
        );
        expect(checker.evaluateCondition('requires_api_key', { requires_api_key: false })).toBe(
          false,
        );
        expect(checker.evaluateCondition('requires_api_key', {})).toBe(false);
      });
    });
  });

  describe('interpolateMessage()', () => {
    it('should interpolate simple variables', () => {
      const result = checker.interpolateMessage('Cost: ${estimated_cost}', {
        estimated_cost: 10.5,
      });
      expect(result).toContain('10.50');
    });

    it('should handle missing variables', () => {
      const result = checker.interpolateMessage('Value: ${missing}', {});
      expect(result).toBe('Value: ${missing}');
    });

    it('should interpolate multiple variables', () => {
      const result = checker.interpolateMessage(
        'Error count: ${errors_in_task}, Summary: ${error_summary}',
        {
          errors_in_task: 3,
          error_summary: 'Connection failed',
        },
      );
      expect(result).toBe('Error count: 3, Summary: Connection failed');
    });

    it('should handle null/undefined context values', () => {
      const result = checker.interpolateMessage('Value: ${value}', { value: null });
      expect(result).toBe('Value: ');
    });
  });

  describe('shouldSurface()', () => {
    describe('C001: Cost Threshold', () => {
      it('should surface when cost exceeds threshold', () => {
        const result = checker.shouldSurface({ estimated_cost: 10 });
        expect(result.should_surface).toBe(true);
        expect(result.criterion_id).toBe('C001');
        expect(result.action).toBe('confirm_before_proceed');
        expect(result.severity).toBe('warning');
        expect(result.can_bypass).toBe(true);
      });

      it('should not surface when cost is below threshold', () => {
        const result = checker.shouldSurface({ estimated_cost: 3 });
        expect(result.should_surface).toBe(false);
      });
    });

    describe('C002: Risk Threshold', () => {
      it('should surface when risk level is HIGH', () => {
        const result = checker.shouldSurface({
          risk_level: 'HIGH',
          risk_details: 'Production database affected',
        });
        expect(result.should_surface).toBe(true);
        expect(result.criterion_id).toBe('C002');
        expect(result.action).toBe('present_and_ask_go_nogo');
        expect(result.severity).toBe('critical');
      });

      it('should not surface when risk level is LOW', () => {
        const result = checker.shouldSurface({ risk_level: 'LOW' });
        expect(result.should_surface).toBe(false);
      });
    });

    describe('C003: Multiple Options', () => {
      it('should surface when multiple valid options exist', () => {
        const result = checker.shouldSurface({
          valid_options_count: 3,
          options_with_tradeoffs: '1. Option A\n2. Option B\n3. Option C',
        });
        expect(result.should_surface).toBe(true);
        expect(result.criterion_id).toBe('C003');
        expect(result.action).toBe('present_options_with_tradeoffs');
        expect(result.can_bypass).toBe(false);
      });

      it('should not surface when only one option exists', () => {
        const result = checker.shouldSurface({ valid_options_count: 1 });
        expect(result.should_surface).toBe(false);
      });
    });

    describe('C004: Consecutive Errors', () => {
      it('should surface when 2 or more errors in same task', () => {
        const result = checker.shouldSurface({
          errors_in_task: 2,
          error_summary: 'Failed to connect twice',
        });
        expect(result.should_surface).toBe(true);
        expect(result.criterion_id).toBe('C004');
        expect(result.action).toBe('pause_and_ask_help');
        expect(result.severity).toBe('error');
        expect(result.can_bypass).toBe(false);
      });

      it('should not surface when less than 2 errors', () => {
        const result = checker.shouldSurface({ errors_in_task: 1 });
        expect(result.should_surface).toBe(false);
      });
    });

    describe('C005: Destructive Action', () => {
      it('should surface for delete_files action', () => {
        const result = checker.shouldSurface({
          action_type: 'delete_files',
          action_description: 'Delete all temp files',
          affected_files: '10 files',
        });
        expect(result.should_surface).toBe(true);
        expect(result.criterion_id).toBe('C005');
        expect(result.action).toBe('always_confirm');
        expect(result.severity).toBe('critical');
        expect(result.can_bypass).toBe(false);
      });

      it('should surface for force_push action', () => {
        const result = checker.shouldSurface({
          action_type: 'force_push',
          action_description: 'Force push to main',
        });
        expect(result.should_surface).toBe(true);
        expect(result.criterion_id).toBe('C005');
        expect(result.can_bypass).toBe(false);
      });

      it('should surface for drop_table action', () => {
        const result = checker.shouldSurface({
          action_type: 'drop_table',
          action_description: 'Drop users table',
        });
        expect(result.should_surface).toBe(true);
        expect(result.criterion_id).toBe('C005');
      });

      it('should not surface for safe actions', () => {
        const result = checker.shouldSurface({
          action_type: 'read_file',
          action_description: 'Read config file',
        });
        expect(result.should_surface).toBe(false);
      });
    });

    describe('C006: Scope Change', () => {
      it('should surface when scope is expanded', () => {
        const result = checker.shouldSurface({
          scope_expanded: true,
          approved_scope: 'Fix login bug',
          requested_scope: 'Refactor entire auth system',
          scope_difference: 'Major expansion',
        });
        expect(result.should_surface).toBe(true);
        expect(result.criterion_id).toBe('C006');
        expect(result.action).toBe('confirm_scope_expansion');
      });
    });

    describe('C007: External Dependency', () => {
      it('should surface when API key is required', () => {
        const result = checker.shouldSurface({
          requires_api_key: true,
          dependency_description: 'OpenAI API key required',
        });
        expect(result.should_surface).toBe(true);
        expect(result.criterion_id).toBe('C007');
        expect(result.action).toBe('confirm_before_proceed');
      });

      it('should surface when payment is required', () => {
        const result = checker.shouldSurface({
          requires_payment: true,
          dependency_description: 'AWS charges apply',
        });
        expect(result.should_surface).toBe(true);
        expect(result.criterion_id).toBe('C007');
      });
    });

    describe('Evaluation Order', () => {
      it('should evaluate destructive actions first (highest priority)', () => {
        // Even with high cost and high risk, destructive action should trigger
        const result = checker.shouldSurface({
          action_type: 'force_push',
          estimated_cost: 100,
          risk_level: 'HIGH',
        });
        expect(result.criterion_id).toBe('C005');
      });

      it('should check risk before cost', () => {
        const result = checker.shouldSurface({
          risk_level: 'HIGH',
          estimated_cost: 10,
        });
        expect(result.criterion_id).toBe('C002');
      });
    });

    describe('No Surface Needed', () => {
      it('should not surface when no criteria are met', () => {
        const result = checker.shouldSurface({
          estimated_cost: 2,
          risk_level: 'LOW',
          errors_in_task: 0,
          action_type: 'read_file',
        });
        expect(result.should_surface).toBe(false);
        expect(result.criterion_id).toBeNull();
        expect(result.action).toBeNull();
      });

      it('should not surface with empty context', () => {
        const result = checker.shouldSurface({});
        expect(result.should_surface).toBe(false);
      });
    });
  });

  describe('getActionConfig()', () => {
    it('should return action configuration', () => {
      const config = checker.getActionConfig('confirm_before_proceed');
      expect(config).not.toBeNull();
      expect(config.type).toBe('yes_no');
      expect(config.default).toBe('no');
    });

    it('should return null for unknown action', () => {
      const config = checker.getActionConfig('unknown_action');
      expect(config).toBeNull();
    });
  });

  describe('getDestructiveActions()', () => {
    it('should return list of destructive actions', () => {
      const actions = checker.getDestructiveActions();
      expect(Array.isArray(actions)).toBe(true);
      expect(actions).toContain('delete_files');
      expect(actions).toContain('force_push');
      expect(actions).toContain('drop_table');
      expect(actions).toContain('rm_rf');
    });
  });

  describe('isDestructiveAction()', () => {
    it('should return true for destructive actions', () => {
      expect(checker.isDestructiveAction('delete_files')).toBe(true);
      expect(checker.isDestructiveAction('force_push')).toBe(true);
      expect(checker.isDestructiveAction('reset_hard')).toBe(true);
    });

    it('should return false for safe actions', () => {
      expect(checker.isDestructiveAction('read_file')).toBe(false);
      expect(checker.isDestructiveAction('create_file')).toBe(false);
      expect(checker.isDestructiveAction('git_commit')).toBe(false);
    });
  });

  describe('getMetadata()', () => {
    it('should return metadata from criteria file', () => {
      const metadata = checker.getMetadata();
      expect(metadata).not.toBeNull();
      expect(metadata.story).toBe('11.4');
      expect(metadata.author).toBe('@dev (Dex)');
    });
  });

  describe('getCriteria()', () => {
    it('should return all criteria definitions', () => {
      const criteria = checker.getCriteria();
      expect(criteria).not.toBeNull();
      expect(criteria.cost_threshold).toBeDefined();
      expect(criteria.risk_threshold).toBeDefined();
      expect(criteria.destructive_action).toBeDefined();
    });
  });
});

describe('createSurfaceChecker()', () => {
  it('should create and load a SurfaceChecker', () => {
    const checker = createSurfaceChecker();
    expect(checker).toBeInstanceOf(SurfaceChecker);
    expect(checker.criteria).not.toBeNull();
  });
});

describe('shouldSurface() convenience function', () => {
  it('should work as a standalone function', () => {
    const result = shouldSurface({ estimated_cost: 10 });
    expect(result.should_surface).toBe(true);
    expect(result.criterion_id).toBe('C001');
  });

  it('should return no surface for empty context', () => {
    const result = shouldSurface({});
    expect(result.should_surface).toBe(false);
  });
});
