/**
 * Executor Assignment Tests
 *
 * Story: 11.1 - Dynamic Executor Assignment
 * Epic: Epic 11 - Projeto Bob
 *
 * Tests the executor assignment module for automatic story-to-executor mapping.
 *
 * @author @dev (Dex)
 * @version 1.0.0
 */

const {
  detectStoryType,
  assignExecutor,
  assignExecutorFromContent,
  validateExecutorAssignment,
  getStoryTypes,
  getStoryTypeConfig,
  getExecutorWorkTypes,
  EXECUTOR_ASSIGNMENT_TABLE,
  DEFAULT_ASSIGNMENT,
} = require('../../.aiox-core/core/orchestration/executor-assignment');

describe('ExecutorAssignment', () => {
  describe('detectStoryType (AC1, Task 1.1)', () => {
    it('should detect code_general type from feature keywords', () => {
      const content = 'Implement user authentication handler with JWT tokens';
      expect(detectStoryType(content)).toBe('code_general');
    });

    it('should detect code_general type from service keywords', () => {
      const content = 'Create a new user service module';
      expect(detectStoryType(content)).toBe('code_general');
    });

    it('should detect database type from schema keywords', () => {
      const content = 'Create user table schema with constraints';
      expect(detectStoryType(content)).toBe('database');
    });

    it('should detect database type from RLS keywords', () => {
      const content = 'Implement RLS policies for user table database protection';
      expect(detectStoryType(content)).toBe('database');
    });

    it('should detect database type from migration keywords', () => {
      const content = 'Add migration for new column in users table';
      expect(detectStoryType(content)).toBe('database');
    });

    it('should detect infrastructure type from CI/CD keywords', () => {
      const content = 'Setup CI/CD pipeline with GitHub Actions';
      expect(detectStoryType(content)).toBe('infrastructure');
    });

    it('should detect infrastructure type from deploy keywords', () => {
      const content = 'Configure Docker deployment to production environment';
      expect(detectStoryType(content)).toBe('infrastructure');
    });

    it('should detect ui_ux type from component keywords', () => {
      const content = 'Create responsive UI component for user profile';
      expect(detectStoryType(content)).toBe('ui_ux');
    });

    it('should detect ui_ux type from accessibility keywords', () => {
      const content = 'Improve accessibility (a11y) of navigation menu';
      expect(detectStoryType(content)).toBe('ui_ux');
    });

    it('should detect research type from investigation keywords', () => {
      const content = 'Research and compare authentication libraries';
      expect(detectStoryType(content)).toBe('research');
    });

    it('should detect research type from POC keywords', () => {
      const content = 'Create POC for real-time notifications';
      expect(detectStoryType(content)).toBe('research');
    });

    it('should detect architecture type from design decision keywords', () => {
      const content = 'Architecture decision for microservice vs monolith';
      expect(detectStoryType(content)).toBe('architecture');
    });

    it('should detect architecture type from scalability keywords', () => {
      const content = 'Design scalability pattern for high traffic';
      expect(detectStoryType(content)).toBe('architecture');
    });

    it('should default to code_general for empty content', () => {
      expect(detectStoryType('')).toBe('code_general');
      expect(detectStoryType(null)).toBe('code_general');
      expect(detectStoryType(undefined)).toBe('code_general');
    });

    it('should handle mixed keywords with highest score', () => {
      // More database keywords than code_general
      const content = 'Create schema for user table with migration, add index and constraints for foreign_key';
      expect(detectStoryType(content)).toBe('database');
    });

    it('should be case-insensitive', () => {
      const content = 'IMPLEMENT JWT AUTHENTICATION HANDLER';
      expect(detectStoryType(content)).toBe('code_general');
    });
  });

  describe('assignExecutor (AC2, Task 1.2)', () => {
    it('should assign @dev as executor for code_general', () => {
      const assignment = assignExecutor('code_general');
      expect(assignment.executor).toBe('@dev');
      expect(assignment.quality_gate).toBe('@architect');
    });

    it('should assign @data-engineer as executor for database', () => {
      const assignment = assignExecutor('database');
      expect(assignment.executor).toBe('@data-engineer');
      expect(assignment.quality_gate).toBe('@dev');
    });

    it('should assign @devops as executor for infrastructure', () => {
      const assignment = assignExecutor('infrastructure');
      expect(assignment.executor).toBe('@devops');
      expect(assignment.quality_gate).toBe('@architect');
    });

    it('should assign @ux-design-expert as executor for ui_ux', () => {
      const assignment = assignExecutor('ui_ux');
      expect(assignment.executor).toBe('@ux-design-expert');
      expect(assignment.quality_gate).toBe('@dev');
    });

    it('should assign @analyst as executor for research', () => {
      const assignment = assignExecutor('research');
      expect(assignment.executor).toBe('@analyst');
      expect(assignment.quality_gate).toBe('@pm');
    });

    it('should assign @architect as executor for architecture', () => {
      const assignment = assignExecutor('architecture');
      expect(assignment.executor).toBe('@architect');
      expect(assignment.quality_gate).toBe('@pm');
    });

    it('should include quality_gate_tools for each type', () => {
      for (const type of getStoryTypes()) {
        const assignment = assignExecutor(type);
        expect(Array.isArray(assignment.quality_gate_tools)).toBe(true);
        expect(assignment.quality_gate_tools.length).toBeGreaterThan(0);
      }
    });

    it('should return default assignment for unknown type', () => {
      const assignment = assignExecutor('unknown_type');
      expect(assignment.executor).toBe(DEFAULT_ASSIGNMENT.executor);
      expect(assignment.quality_gate).toBe(DEFAULT_ASSIGNMENT.quality_gate);
    });

    it('should return a new array for quality_gate_tools (immutability)', () => {
      const assignment1 = assignExecutor('code_general');
      const assignment2 = assignExecutor('code_general');
      expect(assignment1.quality_gate_tools).not.toBe(assignment2.quality_gate_tools);
    });
  });

  describe('Executor != Quality Gate (AC3, AC5)', () => {
    it('should never have executor equal to quality_gate in table', () => {
      for (const [type, config] of Object.entries(EXECUTOR_ASSIGNMENT_TABLE)) {
        expect(config.executor).not.toBe(config.quality_gate);
      }
    });

    it('should never return assignment with executor equal to quality_gate', () => {
      for (const type of getStoryTypes()) {
        const assignment = assignExecutor(type);
        expect(assignment.executor).not.toBe(assignment.quality_gate);
      }
    });
  });

  describe('validateExecutorAssignment (AC5, Task 5)', () => {
    it('should validate correct assignment', () => {
      const result = validateExecutorAssignment({
        executor: '@dev',
        quality_gate: '@architect',
        quality_gate_tools: ['code_review'],
      });
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail when executor is missing', () => {
      const result = validateExecutorAssignment({
        quality_gate: '@architect',
        quality_gate_tools: ['code_review'],
      });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Missing required field: executor');
    });

    it('should fail when quality_gate is missing', () => {
      const result = validateExecutorAssignment({
        executor: '@dev',
        quality_gate_tools: ['code_review'],
      });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Missing required field: quality_gate');
    });

    it('should fail when quality_gate_tools is missing', () => {
      const result = validateExecutorAssignment({
        executor: '@dev',
        quality_gate: '@architect',
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('quality_gate_tools'))).toBe(true);
    });

    it('should fail when quality_gate_tools is empty', () => {
      const result = validateExecutorAssignment({
        executor: '@dev',
        quality_gate: '@architect',
        quality_gate_tools: [],
      });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('quality_gate_tools cannot be empty');
    });

    it('should fail when executor equals quality_gate', () => {
      const result = validateExecutorAssignment({
        executor: '@dev',
        quality_gate: '@dev',
        quality_gate_tools: ['code_review'],
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('cannot be the same'))).toBe(true);
    });

    it('should warn about unknown executor', () => {
      const result = validateExecutorAssignment({
        executor: '@unknown-agent',
        quality_gate: '@architect',
        quality_gate_tools: ['code_review'],
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('Unknown executor'))).toBe(true);
    });
  });

  describe('assignExecutorFromContent (Task 1)', () => {
    it('should combine detection and assignment', () => {
      const content = 'Create migration for adding user_roles table';
      const assignment = assignExecutorFromContent(content);

      expect(assignment.executor).toBe('@data-engineer');
      expect(assignment.quality_gate).toBe('@dev');
    });

    it('should work with multiline story content', () => {
      const content = `
        # Story: Implement User Authentication

        ## Description
        Create a JWT-based authentication handler for the API.

        ## Acceptance Criteria
        - Implement login endpoint
        - Implement refresh token logic
        - Add authentication middleware
      `;
      const assignment = assignExecutorFromContent(content);

      expect(assignment.executor).toBe('@dev');
    });
  });

  describe('Utility Functions', () => {
    describe('getStoryTypes', () => {
      it('should return all story types', () => {
        const types = getStoryTypes();
        expect(types).toContain('code_general');
        expect(types).toContain('database');
        expect(types).toContain('infrastructure');
        expect(types).toContain('ui_ux');
        expect(types).toContain('research');
        expect(types).toContain('architecture');
      });
    });

    describe('getStoryTypeConfig', () => {
      it('should return config for valid type', () => {
        const config = getStoryTypeConfig('database');
        expect(config).toBeDefined();
        expect(config.executor).toBe('@data-engineer');
        expect(config.keywords).toContain('schema');
      });

      it('should return null for invalid type', () => {
        const config = getStoryTypeConfig('invalid_type');
        expect(config).toBeNull();
      });
    });

    describe('getExecutorWorkTypes', () => {
      it('should map executors to their work types', () => {
        const map = getExecutorWorkTypes();

        expect(map['@dev']).toContain('code_general');
        expect(map['@data-engineer']).toContain('database');
        expect(map['@devops']).toContain('infrastructure');
        expect(map['@ux-design-expert']).toContain('ui_ux');
        expect(map['@analyst']).toContain('research');
        expect(map['@architect']).toContain('architecture');
      });
    });
  });

  describe('Assignment Table Completeness (AC2)', () => {
    const expectedMappings = [
      { type: 'code_general', executor: '@dev', qg: '@architect' },
      { type: 'database', executor: '@data-engineer', qg: '@dev' },
      { type: 'infrastructure', executor: '@devops', qg: '@architect' },
      { type: 'ui_ux', executor: '@ux-design-expert', qg: '@dev' },
      { type: 'research', executor: '@analyst', qg: '@pm' },
      { type: 'architecture', executor: '@architect', qg: '@pm' },
    ];

    expectedMappings.forEach(({ type, executor, qg }) => {
      it(`should map ${type} to executor ${executor} and QG ${qg}`, () => {
        const assignment = assignExecutor(type);
        expect(assignment.executor).toBe(executor);
        expect(assignment.quality_gate).toBe(qg);
      });
    });
  });

  describe('Edge Cases (Task 6.4)', () => {
    it('should handle story with equal keyword scores', () => {
      // When scores are equal, should return one of them deterministically
      const content = 'feature schema'; // 1 code_general, 1 database
      const type = detectStoryType(content);
      expect(['code_general', 'database']).toContain(type);
    });

    it('should handle very long content', () => {
      const content = 'implement '.repeat(1000) + 'feature handler service';
      const type = detectStoryType(content);
      expect(type).toBe('code_general');
    });

    it('should handle special characters in content', () => {
      const content = 'Create CI/CD pipeline with feature-branch deployment';
      const type = detectStoryType(content);
      expect(type).toBe('infrastructure');
    });

    it('should handle non-string content', () => {
      expect(detectStoryType(123)).toBe('code_general');
      expect(detectStoryType({})).toBe('code_general');
      expect(detectStoryType([])).toBe('code_general');
    });
  });
});
