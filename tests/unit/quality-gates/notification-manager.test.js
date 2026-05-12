/**
 * Notification Manager Unit Tests
 *
 * Tests for Story 3.5 - Human Review Orchestration (Layer 3)
 * Smoke Test: HUMAN-03 (Notification)
 *
 * @story 3.5 - Human Review Orchestration
 */

const { NotificationManager } = require('../../../.aiox-core/core/quality-gates/notification-manager');

describe('NotificationManager', () => {
  let notificationManager;

  beforeEach(() => {
    notificationManager = new NotificationManager({
      notificationsPath: '.aiox/notifications-test',
      channels: ['console'], // Only console for tests
    });
  });

  describe('constructor', () => {
    it('should create manager with default config', () => {
      const defaultManager = new NotificationManager();
      expect(defaultManager).toBeDefined();
      expect(defaultManager.channels).toContain('console');
      expect(defaultManager.channels).toContain('file');
    });

    it('should create manager with custom config', () => {
      expect(notificationManager.notificationsPath).toBe('.aiox/notifications-test');
      expect(notificationManager.channels).toEqual(['console']);
    });
  });

  describe('loadTemplates', () => {
    it('should load all notification templates', () => {
      const templates = notificationManager.loadTemplates();

      expect(templates.reviewRequest).toBeDefined();
      expect(templates.blocked).toBeDefined();
      expect(templates.approved).toBeDefined();
      expect(templates.changesRequested).toBeDefined();
      expect(templates.reminder).toBeDefined();
    });

    it('should have correct priorities', () => {
      const templates = notificationManager.loadTemplates();

      expect(templates.reviewRequest.priority).toBe('normal');
      expect(templates.blocked.priority).toBe('high');
    });
  });

  describe('generateNotificationId', () => {
    it('should generate unique IDs', () => {
      const id1 = notificationManager.generateNotificationId();
      const id2 = notificationManager.generateNotificationId();

      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^notif-/);
    });
  });

  describe('formatReviewRequestContent (HUMAN-03)', () => {
    it('should format review request with all sections', () => {
      const reviewRequest = {
        id: 'hr-test-123',
        reviewer: '@tech-lead',
        estimatedTime: 20,
        expiresAt: '2025-12-04T00:00:00Z',
        automatedSummary: {
          layer1: {
            checks: [
              { check: 'lint', status: 'passed', message: 'No errors' },
            ],
          },
          layer2: {
            coderabbit: {
              issues: { critical: 0, high: 2, medium: 5 },
            },
          },
        },
        focusAreas: {
          primary: [
            {
              area: 'security',
              reason: 'Auth files modified',
              questions: ['Is input validation comprehensive?'],
            },
          ],
          secondary: [
            { area: 'ux', reason: 'UI changes' },
          ],
        },
        skipAreas: ['syntax', 'formatting'],
      };

      const content = notificationManager.formatReviewRequestContent(reviewRequest);

      expect(content).toContain('Human Review Required');
      expect(content).toContain('hr-test-123');
      expect(content).toContain('@tech-lead');
      expect(content).toContain('~20 minutes');
      expect(content).toContain('Security');
      expect(content).toContain('syntax');
    });

    it('should include Layer 1 summary', () => {
      const reviewRequest = {
        id: 'test',
        reviewer: '@dev',
        estimatedTime: 10,
        expiresAt: '2025-12-04',
        automatedSummary: {
          layer1: {
            checks: [
              { check: 'lint', status: 'passed', message: 'Clean' },
              { check: 'test', status: 'passed', message: 'All pass' },
            ],
          },
        },
        focusAreas: { primary: [], secondary: [] },
        skipAreas: [],
      };

      const content = notificationManager.formatReviewRequestContent(reviewRequest);

      expect(content).toContain('Layer 1');
      expect(content).toContain('lint');
    });
  });

  describe('formatBlockingContent', () => {
    it('should format blocking notification', () => {
      const blockResult = {
        stoppedAt: 'layer1',
        reason: 'Lint errors found',
        issues: [
          { severity: 'HIGH', check: 'lint', message: '5 errors' },
        ],
        fixFirst: [
          { issue: 'Lint errors', suggestion: 'Run npm run lint:fix' },
        ],
      };

      const content = notificationManager.formatBlockingContent(blockResult);

      expect(content).toContain('Review Blocked');
      expect(content).toContain('layer1');
      expect(content).toContain('Lint errors');
      expect(content).toContain('npm run lint:fix');
    });

    it('should include how to fix section', () => {
      const blockResult = {
        stoppedAt: 'layer2',
        reason: 'CodeRabbit issues',
        issues: [],
        fixFirst: [
          { issue: 'Critical issues', suggestion: 'Review CodeRabbit feedback' },
        ],
      };

      const content = notificationManager.formatBlockingContent(blockResult);

      expect(content).toContain('How to Fix');
      expect(content).toContain('CodeRabbit');
    });
  });

  describe('formatCompletionContent', () => {
    it('should format approval notification', () => {
      const completedRequest = {
        id: 'hr-123',
        status: 'approved',
        reviewer: '@tech-lead',
        completedAt: '2025-12-03T12:00:00Z',
        actualTime: 25,
        reviewResult: {
          comments: 'LGTM! Good architecture.',
        },
      };

      const content = notificationManager.formatCompletionContent(completedRequest);

      expect(content).toContain('Review Approved');
      expect(content).toContain('@tech-lead');
      expect(content).toContain('LGTM');
      expect(content).toContain('approved for merge');
    });

    it('should format changes requested notification', () => {
      const completedRequest = {
        id: 'hr-456',
        status: 'changes_requested',
        reviewer: '@architect',
        completedAt: '2025-12-03T14:00:00Z',
        reviewResult: {
          comments: 'Needs refactoring',
          requestedChanges: [
            'Split the service into smaller modules',
            'Add unit tests for edge cases',
          ],
        },
      };

      const content = notificationManager.formatCompletionContent(completedRequest);

      expect(content).toContain('Changes Requested');
      expect(content).toContain('Needs refactoring');
      expect(content).toContain('Split the service');
      expect(content).toContain('re-submit for review');
    });
  });

  describe('formatReminderContent', () => {
    it('should format reminder with pending time', () => {
      const reviewRequest = {
        id: 'hr-789',
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
        estimatedTime: 15,
        focusAreas: {
          primary: [{ area: 'security' }],
        },
      };

      const content = notificationManager.formatReminderContent(reviewRequest);

      expect(content).toContain('Review Reminder');
      expect(content).toContain('hr-789');
      expect(content).toContain('hours');
      expect(content).toContain('security');
    });
  });

  describe('sendThroughChannels', () => {
    it('should send through console channel', async () => {
      // Mock console.log
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const notification = {
        subject: 'Test Subject',
        recipient: '@dev',
        timestamp: new Date().toISOString(),
        content: 'Test content',
      };

      const results = await notificationManager.sendThroughChannels(notification);

      expect(results.console.success).toBe(true);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should handle unknown channel gracefully', async () => {
      notificationManager.channels = ['unknown-channel'];

      const notification = {
        subject: 'Test',
        recipient: '@dev',
        timestamp: new Date().toISOString(),
        content: 'Test',
      };

      const results = await notificationManager.sendThroughChannels(notification);

      expect(results['unknown-channel'].success).toBe(false);
      expect(results['unknown-channel'].error).toBe('Unknown channel');
    });
  });

  describe('sendReviewRequest (HUMAN-03)', () => {
    beforeEach(() => {
      // Mock file operations
      notificationManager.sendThroughChannels = jest.fn().mockResolvedValue({
        console: { success: true },
      });
      notificationManager.saveNotification = jest.fn().mockResolvedValue();
    });

    it('should send review request notification', async () => {
      const reviewRequest = {
        id: 'hr-test',
        reviewer: '@tech-lead',
        estimatedTime: 20,
        expiresAt: '2025-12-04',
        automatedSummary: {},
        focusAreas: { primary: [] },
        skipAreas: [],
      };

      const result = await notificationManager.sendReviewRequest(reviewRequest);

      expect(result.success).toBe(true);
      expect(result.notificationId).toMatch(/^notif-/);
      expect(notificationManager.sendThroughChannels).toHaveBeenCalled();
      expect(notificationManager.saveNotification).toHaveBeenCalled();
    });
  });

  describe('sendBlockingNotification', () => {
    beforeEach(() => {
      notificationManager.sendThroughChannels = jest.fn().mockResolvedValue({
        console: { success: true },
      });
      notificationManager.saveNotification = jest.fn().mockResolvedValue();
    });

    it('should send blocking notification', async () => {
      const blockResult = {
        stoppedAt: 'layer1',
        reason: 'Failed',
        issues: [],
        fixFirst: [],
      };

      const result = await notificationManager.sendBlockingNotification(blockResult);

      expect(result.success).toBe(true);
      expect(notificationManager.sendThroughChannels).toHaveBeenCalled();
    });
  });

  describe('sendCompletionNotification', () => {
    beforeEach(() => {
      notificationManager.sendThroughChannels = jest.fn().mockResolvedValue({
        console: { success: true },
      });
      notificationManager.saveNotification = jest.fn().mockResolvedValue();
    });

    it('should send completion notification for approval', async () => {
      const completedRequest = {
        id: 'hr-test',
        status: 'approved',
        reviewer: '@dev',
        completedAt: new Date().toISOString(),
      };

      const result = await notificationManager.sendCompletionNotification(completedRequest);

      expect(result.success).toBe(true);
    });

    it('should send completion notification for changes requested', async () => {
      const completedRequest = {
        id: 'hr-test',
        status: 'changes_requested',
        reviewer: '@dev',
        completedAt: new Date().toISOString(),
      };

      const result = await notificationManager.sendCompletionNotification(completedRequest);

      expect(result.success).toBe(true);
    });
  });

  describe('sendReminder', () => {
    beforeEach(() => {
      notificationManager.sendThroughChannels = jest.fn().mockResolvedValue({
        console: { success: true },
      });
      notificationManager.saveNotification = jest.fn().mockResolvedValue();
    });

    it('should send reminder notification', async () => {
      const reviewRequest = {
        id: 'hr-test',
        reviewer: '@dev',
        createdAt: new Date().toISOString(),
        expiresAt: new Date().toISOString(),
        estimatedTime: 15,
        focusAreas: { primary: [] },
      };

      const result = await notificationManager.sendReminder(reviewRequest);

      expect(result.success).toBe(true);
      expect(notificationManager.sendThroughChannels).toHaveBeenCalled();
    });
  });
});
