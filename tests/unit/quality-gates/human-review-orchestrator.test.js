/**
 * Human Review Orchestrator Unit Tests
 *
 * Tests for Story 3.5 - Human Review Orchestration (Layer 3)
 * Smoke Tests: HUMAN-01 (Orchestration), HUMAN-02 (Blocking)
 *
 * @story 3.5 - Human Review Orchestration
 */

const { HumanReviewOrchestrator } = require('../../../.aiox-core/core/quality-gates/human-review-orchestrator');

describe('HumanReviewOrchestrator', () => {
  let orchestrator;

  beforeEach(() => {
    orchestrator = new HumanReviewOrchestrator({
      statusPath: '.aiox/qa-status-test.json',
      reviewRequestsPath: '.aiox/human-review-requests-test',
    });
  });

  describe('constructor', () => {
    it('should create orchestrator with default config', () => {
      const defaultOrchestrator = new HumanReviewOrchestrator();
      expect(defaultOrchestrator).toBeDefined();
      expect(defaultOrchestrator.focusRecommender).toBeDefined();
      expect(defaultOrchestrator.notificationManager).toBeDefined();
    });

    it('should create orchestrator with custom config', () => {
      expect(orchestrator.statusPath).toBe('.aiox/qa-status-test.json');
      expect(orchestrator.reviewRequestsPath).toBe('.aiox/human-review-requests-test');
    });
  });

  describe('checkLayerPassed', () => {
    it('should return pass=false when layer result is null', () => {
      const result = orchestrator.checkLayerPassed(null, 'Layer 1');
      expect(result.pass).toBe(false);
      expect(result.reason).toBe('Layer 1 not executed');
    });

    it('should return pass=true when layer passed', () => {
      const layerResult = { pass: true, checks: { total: 3, passed: 3, failed: 0 } };
      const result = orchestrator.checkLayerPassed(layerResult, 'Layer 1');
      expect(result.pass).toBe(true);
      expect(result.checksPassed).toBe(3);
    });

    it('should extract issues when layer failed', () => {
      const layerResult = {
        pass: false,
        results: [
          { check: 'lint', pass: false, message: 'Lint errors found' },
          { check: 'test', pass: true, message: 'Tests passed' },
        ],
      };
      const result = orchestrator.checkLayerPassed(layerResult, 'Layer 1');
      expect(result.pass).toBe(false);
      expect(result.issues).toHaveLength(1);
      expect(result.issues[0].check).toBe('lint');
    });
  });

  describe('extractIssues', () => {
    it('should return empty array when no results', () => {
      const issues = orchestrator.extractIssues({});
      expect(issues).toEqual([]);
    });

    it('should extract failed checks as issues', () => {
      const layerResult = {
        results: [
          { check: 'lint', pass: false, message: 'Errors found' },
          { check: 'test', pass: false, message: 'Tests failed', error: 'AssertionError' },
        ],
      };
      const issues = orchestrator.extractIssues(layerResult);
      expect(issues).toHaveLength(2);
      expect(issues[0].check).toBe('lint');
      expect(issues[1].details).toBe('AssertionError');
    });
  });

  describe('determineSeverity', () => {
    it('should return CRITICAL for test failures', () => {
      expect(orchestrator.determineSeverity({ check: 'test' })).toBe('CRITICAL');
    });

    it('should return HIGH for lint failures', () => {
      expect(orchestrator.determineSeverity({ check: 'lint' })).toBe('HIGH');
    });

    it('should return CRITICAL for critical coderabbit issues', () => {
      expect(orchestrator.determineSeverity({ check: 'coderabbit', issues: { critical: 1 } })).toBe('CRITICAL');
    });

    it('should return MEDIUM for other issues', () => {
      expect(orchestrator.determineSeverity({ check: 'other' })).toBe('MEDIUM');
    });
  });

  describe('block (HUMAN-02)', () => {
    it('should block with layer1 failure', () => {
      const layerCheck = {
        pass: false,
        reason: 'Lint errors',
        issues: [{ check: 'lint', message: '5 errors' }],
      };
      const result = orchestrator.block(layerCheck, 'layer1', Date.now());

      expect(result.pass).toBe(false);
      expect(result.status).toBe('blocked');
      expect(result.stoppedAt).toBe('layer1');
      expect(result.message).toContain('linting');
    });

    it('should block with layer2 failure', () => {
      const layerCheck = {
        pass: false,
        reason: 'CodeRabbit issues',
        issues: [],
      };
      const result = orchestrator.block(layerCheck, 'layer2', Date.now());

      expect(result.pass).toBe(false);
      expect(result.stoppedAt).toBe('layer2');
      expect(result.message).toContain('CodeRabbit');
    });
  });

  describe('generateFixRecommendations', () => {
    it('should generate lint fix recommendation', () => {
      const layerCheck = {
        issues: [{ check: 'lint', message: 'Errors found', severity: 'HIGH' }],
      };
      const recs = orchestrator.generateFixRecommendations(layerCheck);
      expect(recs[0].suggestion).toContain('npm run lint:fix');
    });

    it('should generate test fix recommendation', () => {
      const layerCheck = {
        issues: [{ check: 'test', message: 'Tests failed', severity: 'CRITICAL' }],
      };
      const recs = orchestrator.generateFixRecommendations(layerCheck);
      expect(recs[0].suggestion).toContain('npm test');
    });

    it('should generate coderabbit fix recommendation', () => {
      const layerCheck = {
        issues: [{ check: 'coderabbit', message: 'Issues found', severity: 'HIGH' }],
      };
      const recs = orchestrator.generateFixRecommendations(layerCheck);
      expect(recs[0].suggestion).toContain('CodeRabbit');
    });
  });

  describe('orchestrateReview (HUMAN-01)', () => {
    it('should block when Layer 1 fails', async () => {
      const prContext = { changedFiles: ['file.js'] };
      const layer1Result = { pass: false, results: [{ check: 'lint', pass: false, message: 'Error' }] };
      const layer2Result = { pass: true };

      const result = await orchestrator.orchestrateReview(prContext, layer1Result, layer2Result);

      expect(result.pass).toBe(false);
      expect(result.status).toBe('blocked');
      expect(result.stoppedAt).toBe('layer1');
    });

    it('should block when Layer 2 fails', async () => {
      const prContext = { changedFiles: ['file.js'] };
      const layer1Result = { pass: true };
      const layer2Result = { pass: false, results: [{ check: 'coderabbit', pass: false, message: 'Issues' }] };

      const result = await orchestrator.orchestrateReview(prContext, layer1Result, layer2Result);

      expect(result.pass).toBe(false);
      expect(result.status).toBe('blocked');
      expect(result.stoppedAt).toBe('layer2');
    });

    it('should request human review when both layers pass', async () => {
      // Mock file system operations
      orchestrator.saveReviewRequest = jest.fn().mockResolvedValue();
      orchestrator.notifyReviewer = jest.fn().mockResolvedValue({ success: true });

      const prContext = { changedFiles: ['auth/login.js'] };
      const layer1Result = { pass: true, results: [{ check: 'lint', pass: true }] };
      const layer2Result = { pass: true, results: [{ check: 'coderabbit', pass: true }] };

      const result = await orchestrator.orchestrateReview(prContext, layer1Result, layer2Result);

      expect(result.pass).toBe(true);
      expect(result.status).toBe('pending_human_review');
      expect(result.reviewRequest).toBeDefined();
      expect(result.reviewRequest.focusAreas).toBeDefined();
    });
  });

  describe('generateAutomatedSummary', () => {
    it('should generate summary for Layer 1', () => {
      const layer1Result = {
        pass: true,
        results: [
          { check: 'lint', pass: true, message: 'No errors' },
          { check: 'test', pass: true, message: 'All passed' },
        ],
      };
      const summary = orchestrator.generateAutomatedSummary(layer1Result, {});

      expect(summary.layer1.status).toBe('passed');
      expect(summary.layer1.checks).toHaveLength(2);
    });

    it('should generate summary for Layer 2 with CodeRabbit', () => {
      const layer2Result = {
        pass: true,
        results: [
          { check: 'coderabbit', pass: true, issues: { critical: 0, high: 2, medium: 5 } },
        ],
      };
      const summary = orchestrator.generateAutomatedSummary({}, layer2Result);

      expect(summary.layer2.coderabbit).toBeDefined();
      expect(summary.layer2.coderabbit.issues.high).toBe(2);
    });
  });

  describe('estimateReviewTime', () => {
    it('should return base time with no focus areas', () => {
      const focusAreas = { primary: [], secondary: [] };
      expect(orchestrator.estimateReviewTime(focusAreas)).toBe(10);
    });

    it('should add time per primary focus area', () => {
      const focusAreas = {
        primary: [{ area: 'security' }, { area: 'architecture' }],
        secondary: [],
      };
      expect(orchestrator.estimateReviewTime(focusAreas)).toBe(20);
    });

    it('should add half time per secondary focus area', () => {
      const focusAreas = {
        primary: [],
        secondary: [{ area: 'ux' }, { area: 'performance' }],
      };
      expect(orchestrator.estimateReviewTime(focusAreas)).toBe(15);
    });
  });

  describe('generateRequestId', () => {
    it('should generate unique IDs', () => {
      const id1 = orchestrator.generateRequestId();
      const id2 = orchestrator.generateRequestId();
      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^hr-/);
    });
  });

  describe('validateRequestId (Security)', () => {
    it('should accept valid alphanumeric IDs', () => {
      expect(orchestrator.validateRequestId('hr-abc123')).toBe('hr-abc123');
      expect(orchestrator.validateRequestId('hr_test.id')).toBe('hr_test.id');
      expect(orchestrator.validateRequestId('HR-ABC-123')).toBe('HR-ABC-123');
    });

    it('should reject path traversal attempts with ../', () => {
      expect(() => orchestrator.validateRequestId('../../../etc/passwd')).toThrow('Invalid request ID');
      expect(() => orchestrator.validateRequestId('..\\..\\windows\\system32')).toThrow('Invalid request ID');
    });

    it('should reject IDs with slashes', () => {
      expect(() => orchestrator.validateRequestId('path/to/file')).toThrow('Invalid request ID');
      expect(() => orchestrator.validateRequestId('path\\to\\file')).toThrow('Invalid request ID');
    });

    it('should reject IDs with special characters', () => {
      expect(() => orchestrator.validateRequestId('id<script>')).toThrow('Invalid request ID');
      expect(() => orchestrator.validateRequestId('id;rm -rf')).toThrow('Invalid request ID');
      expect(() => orchestrator.validateRequestId('id`whoami`')).toThrow('Invalid request ID');
    });

    it('should reject null or empty IDs', () => {
      expect(() => orchestrator.validateRequestId(null)).toThrow('Request ID is required');
      expect(() => orchestrator.validateRequestId('')).toThrow('Request ID is required');
      expect(() => orchestrator.validateRequestId(undefined)).toThrow('Request ID is required');
    });

    it('should reject non-string IDs', () => {
      expect(() => orchestrator.validateRequestId(123)).toThrow('Request ID is required');
      expect(() => orchestrator.validateRequestId({ id: 'test' })).toThrow('Request ID is required');
    });
  });

  describe('saveReviewRequest (Security)', () => {
    it('should reject requests with malicious IDs', async () => {
      const maliciousRequest = { id: '../../../etc/passwd', status: 'pending' };
      await expect(orchestrator.saveReviewRequest(maliciousRequest)).rejects.toThrow('Invalid request ID');
    });
  });

  describe('completeReview (Security)', () => {
    it('should reject malicious request IDs', async () => {
      await expect(orchestrator.completeReview('../../../etc/passwd', { approved: true }))
        .rejects.toThrow('Invalid request ID');
    });
  });
});
