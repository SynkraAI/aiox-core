/**
 * Human Review Orchestration Integration Tests
 *
 * Tests for Story 3.5 - Human Review Orchestration (Layer 3)
 * End-to-End Tests: HUMAN-01 to HUMAN-05
 *
 * @story 3.5 - Human Review Orchestration
 */

const { HumanReviewOrchestrator } = require('../../.aiox-core/core/quality-gates/human-review-orchestrator');
const { FocusAreaRecommender } = require('../../.aiox-core/core/quality-gates/focus-area-recommender');
const { NotificationManager } = require('../../.aiox-core/core/quality-gates/notification-manager');
const { QualityGateManager } = require('../../.aiox-core/core/quality-gates/quality-gate-manager');

describe('Human Review Orchestration Integration Tests', () => {
  describe('HUMAN-01: Orchestration Flow', () => {
    let orchestrator;

    beforeEach(() => {
      orchestrator = new HumanReviewOrchestrator({
        statusPath: '.aiox/qa-status-integration-test.json',
        reviewRequestsPath: '.aiox/human-review-requests-integration-test',
      });
      // Mock file operations to avoid actual file I/O
      orchestrator.saveReviewRequest = jest.fn().mockResolvedValue();
      orchestrator.notifyReviewer = jest.fn().mockResolvedValue({ success: true });
    });

    it('should execute 3-layer flow in correct sequence', async () => {
      const prContext = {
        prNumber: 123,
        changedFiles: ['src/services/auth.service.js', 'src/components/Login.tsx'],
      };

      const layer1Result = {
        pass: true,
        layer: 'Layer 1: Pre-commit',
        duration: 5000,
        results: [
          { check: 'lint', pass: true, message: 'No errors' },
          { check: 'test', pass: true, message: 'All tests passed' },
          { check: 'typecheck', pass: true, message: 'No type errors' },
        ],
        checks: { total: 3, passed: 3, failed: 0 },
      };

      const layer2Result = {
        pass: true,
        layer: 'Layer 2: PR Automation',
        duration: 30000,
        results: [
          { check: 'coderabbit', pass: true, issues: { critical: 0, high: 0, medium: 2, low: 5 } },
          { check: 'quinn', pass: true, suggestions: 3, blocking: 0 },
        ],
        checks: { total: 2, passed: 2, failed: 0 },
      };

      const result = await orchestrator.orchestrateReview(prContext, layer1Result, layer2Result);

      // Verify orchestration completed successfully
      expect(result.pass).toBe(true);
      expect(result.status).toBe('pending_human_review');
      expect(result.layers.layer1.pass).toBe(true);
      expect(result.layers.layer2.pass).toBe(true);
      expect(result.reviewRequest).toBeDefined();
      expect(result.reviewRequest.focusAreas).toBeDefined();
    });

    it('should stop at Layer 1 when it fails', async () => {
      const prContext = { changedFiles: ['file.js'] };

      const layer1Result = {
        pass: false,
        results: [
          { check: 'lint', pass: false, message: '5 errors found' },
        ],
      };

      const layer2Result = { pass: true }; // Should not matter

      const result = await orchestrator.orchestrateReview(prContext, layer1Result, layer2Result);

      expect(result.pass).toBe(false);
      expect(result.stoppedAt).toBe('layer1');
      expect(result.reviewRequest).toBeUndefined();
    });

    it('should stop at Layer 2 when it fails after Layer 1 passes', async () => {
      const prContext = { changedFiles: ['file.js'] };

      const layer1Result = { pass: true, results: [] };

      const layer2Result = {
        pass: false,
        results: [
          { check: 'coderabbit', pass: false, issues: { critical: 1 }, message: 'Critical issue found' },
        ],
      };

      const result = await orchestrator.orchestrateReview(prContext, layer1Result, layer2Result);

      expect(result.pass).toBe(false);
      expect(result.stoppedAt).toBe('layer2');
    });
  });

  describe('HUMAN-02: Blocking Behavior', () => {
    let orchestrator;

    beforeEach(() => {
      orchestrator = new HumanReviewOrchestrator();
    });

    it('should provide fix recommendations when blocking', async () => {
      const prContext = { changedFiles: ['file.js'] };

      const layer1Result = {
        pass: false,
        results: [
          { check: 'lint', pass: false, message: '10 errors' },
          { check: 'test', pass: false, message: '2 tests failed' },
        ],
      };

      const result = await orchestrator.orchestrateReview(prContext, layer1Result, {});

      expect(result.pass).toBe(false);
      expect(result.status).toBe('blocked');
      expect(result.fixFirst).toBeDefined();
      expect(result.fixFirst.length).toBeGreaterThan(0);
      expect(result.fixFirst.some(f => f.suggestion.includes('lint'))).toBe(true);
    });

    it('should include clear blocking message', async () => {
      const prContext = { changedFiles: ['file.js'] };

      const layer1Result = {
        pass: false,
        results: [{ check: 'typecheck', pass: false, message: 'Type errors' }],
      };

      const result = await orchestrator.orchestrateReview(prContext, layer1Result, {});

      expect(result.message).toContain('linting');
    });
  });

  describe('HUMAN-03: Notification System', () => {
    let orchestrator;
    let notificationSpy;

    beforeEach(() => {
      orchestrator = new HumanReviewOrchestrator({
        notifications: { channels: ['console'] },
      });
      orchestrator.saveReviewRequest = jest.fn().mockResolvedValue();

      // Spy on notification manager
      notificationSpy = jest.spyOn(orchestrator.notificationManager, 'sendReviewRequest')
        .mockResolvedValue({ success: true, notificationId: 'notif-test' });
    });

    afterEach(() => {
      notificationSpy.mockRestore();
    });

    it('should notify reviewer when layers 1+2 pass', async () => {
      const prContext = { changedFiles: ['src/auth/login.js'] };

      const layer1Result = { pass: true, results: [] };
      const layer2Result = { pass: true, results: [] };

      await orchestrator.orchestrateReview(prContext, layer1Result, layer2Result);

      expect(notificationSpy).toHaveBeenCalled();
      const notificationCall = notificationSpy.mock.calls[0][0];
      expect(notificationCall.reviewer).toBeDefined();
      expect(notificationCall.focusAreas).toBeDefined();
    });

    it('should include review request details in notification', async () => {
      const prContext = { changedFiles: ['src/services/payment.service.js'] };

      const layer1Result = { pass: true, results: [] };
      const layer2Result = { pass: true, results: [] };

      await orchestrator.orchestrateReview(prContext, layer1Result, layer2Result);

      const reviewRequest = notificationSpy.mock.calls[0][0];
      expect(reviewRequest.id).toMatch(/^hr-/);
      expect(reviewRequest.estimatedTime).toBeGreaterThan(0);
      expect(reviewRequest.expiresAt).toBeDefined();
    });
  });

  describe('HUMAN-04: Focus Area Recommendations', () => {
    let recommender;

    beforeEach(() => {
      recommender = new FocusAreaRecommender();
    });

    it('should highlight strategic aspects - security', async () => {
      const context = {
        prContext: {
          changedFiles: [
            'src/auth/login.controller.js',
            'src/auth/password.util.js',
            'src/middleware/jwt.middleware.js',
          ],
        },
      };

      const recommendations = await recommender.recommend(context);

      expect(recommendations.primary.some(p => p.area === 'security')).toBe(true);
      expect(recommendations.highlightedAspects).toContain('Security-sensitive code changes');
    });

    it('should highlight strategic aspects - architecture', async () => {
      const context = {
        prContext: {
          changedFiles: [
            'src/core/base-service.js',
            'src/interfaces/repository.interface.ts',
          ],
        },
      };

      const recommendations = await recommender.recommend(context);

      expect(recommendations.primary.some(p => p.area === 'architecture')).toBe(true);
    });

    it('should highlight strategic aspects - business logic', async () => {
      const context = {
        prContext: {
          changedFiles: [
            'src/services/order.service.js',
            'src/handlers/checkout.handler.js',
          ],
        },
      };

      const recommendations = await recommender.recommend(context);

      expect(recommendations.primary.some(p => p.area === 'business-logic')).toBe(true);
    });

    it('should provide review questions for focus areas', async () => {
      const context = {
        prContext: {
          changedFiles: ['src/auth/session.js'],
        },
      };

      const recommendations = await recommender.recommend(context);
      const securityArea = recommendations.primary.find(p => p.area === 'security');

      expect(securityArea).toBeDefined();
      expect(securityArea.questions).toBeDefined();
      expect(securityArea.questions.length).toBeGreaterThan(0);
    });

    it('should exclude automated-covered areas', async () => {
      const context = {
        prContext: { changedFiles: ['src/file.js'] },
      };

      const recommendations = await recommender.recommend(context);

      expect(recommendations.skip).toContain('syntax');
      expect(recommendations.skip).toContain('formatting');
      expect(recommendations.skip).toContain('simple-logic');
    });
  });

  describe('HUMAN-05: Time Reduction Estimation', () => {
    let orchestrator;

    beforeEach(() => {
      orchestrator = new HumanReviewOrchestrator();
      orchestrator.saveReviewRequest = jest.fn().mockResolvedValue();
      orchestrator.notifyReviewer = jest.fn().mockResolvedValue({ success: true });
    });

    it('should estimate review time based on focus areas', async () => {
      const prContext = {
        changedFiles: ['src/auth/login.js'], // Single security file
      };

      const layer1Result = { pass: true, results: [] };
      const layer2Result = { pass: true, results: [] };

      const result = await orchestrator.orchestrateReview(prContext, layer1Result, layer2Result);

      // Base 10min + focus areas
      expect(result.reviewRequest.estimatedTime).toBeGreaterThanOrEqual(10);
      expect(result.reviewRequest.estimatedTime).toBeLessThanOrEqual(35); // Max with 3 primary + 2 secondary
    });

    it('should target ~30min review time (75% reduction from 2-4h)', async () => {
      const prContext = {
        changedFiles: [
          'src/auth/login.js',
          'src/services/order.service.js',
          'src/components/Dashboard.tsx',
          'config/settings.yaml',
        ],
      };

      const layer1Result = { pass: true, results: [] };
      const layer2Result = { pass: true, results: [] };

      const result = await orchestrator.orchestrateReview(prContext, layer1Result, layer2Result);

      // Should be around 30 minutes or less (targeting 75% reduction)
      expect(result.reviewRequest.estimatedTime).toBeLessThanOrEqual(35);
    });
  });

  describe('Integration with QualityGateManager', () => {
    let manager;

    beforeEach(() => {
      manager = new QualityGateManager({
        layer1: { enabled: true },
        layer2: { enabled: true },
        layer3: { enabled: true },
      });
    });

    it('should have human review orchestrator available', () => {
      expect(manager.humanReviewOrchestrator).toBeDefined();
    });

    it('should have orchestrateHumanReview method', () => {
      expect(typeof manager.orchestrateHumanReview).toBe('function');
    });

    it('should integrate orchestration with full pipeline', async () => {
      // Mock layer executions
      manager.layers.layer1.execute = jest.fn().mockResolvedValue({
        pass: true,
        layer: 'Layer 1: Pre-commit',
        results: [{ check: 'lint', pass: true }],
      });

      manager.layers.layer2.execute = jest.fn().mockResolvedValue({
        pass: true,
        layer: 'Layer 2: PR Automation',
        results: [{ check: 'coderabbit', pass: true }],
      });

      // Mock file operations
      manager.humanReviewOrchestrator.saveReviewRequest = jest.fn().mockResolvedValue();
      manager.humanReviewOrchestrator.notifyReviewer = jest.fn().mockResolvedValue({ success: true });

      const result = await manager.orchestrateHumanReview({
        prNumber: 123,
        changedFiles: ['src/auth/login.js'],
      });

      expect(result.status).toBe('pending_human_review');
      expect(result.reviewRequest).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    let orchestrator;

    beforeEach(() => {
      orchestrator = new HumanReviewOrchestrator();
    });

    it('should handle null layer results gracefully', async () => {
      const prContext = { changedFiles: ['file.js'] };

      const result = await orchestrator.orchestrateReview(prContext, null, null);

      expect(result.pass).toBe(false);
      expect(result.status).toBe('blocked');
    });

    it('should handle missing prContext gracefully', async () => {
      orchestrator.saveReviewRequest = jest.fn().mockResolvedValue();
      orchestrator.notifyReviewer = jest.fn().mockResolvedValue({ success: true });

      const layer1Result = { pass: true, results: [] };
      const layer2Result = { pass: true, results: [] };

      const result = await orchestrator.orchestrateReview({}, layer1Result, layer2Result);

      expect(result.pass).toBe(true);
      expect(result.reviewRequest.focusAreas).toBeDefined();
    });
  });
});
