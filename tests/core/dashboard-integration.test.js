/**
 * Dashboard Integration Tests
 *
 * Story: 0.8 - Dashboard Integration
 * Epic: Epic 0 - ADE Master Orchestrator
 *
 * Tests for dashboard integration with orchestrator.
 *
 * @author @dev (Dex)
 * @version 1.0.0
 */

const path = require('path');
const fs = require('fs-extra');
const os = require('os');

const {
  DashboardIntegration,
  NotificationType,
} = require('../../.aiox-core/core/orchestration/dashboard-integration');

const { MasterOrchestrator, OrchestratorState } = require('../../.aiox-core/core/orchestration');

describe('Dashboard Integration (Story 0.8)', () => {
  let tempDir;
  let orchestrator;
  let dashboard;

  beforeEach(async () => {
    tempDir = path.join(os.tmpdir(), `dashboard-test-${Date.now()}`);
    await fs.ensureDir(tempDir);

    orchestrator = new MasterOrchestrator(tempDir, {
      storyId: 'TEST-001',
      dashboardAutoUpdate: false, // Disable auto-update for tests
    });

    dashboard = new DashboardIntegration({
      projectRoot: tempDir,
      orchestrator,
      autoUpdate: false,
    });
  });

  afterEach(async () => {
    dashboard.stop();
    await fs.remove(tempDir);
  });

  describe('NotificationType Enum (AC7)', () => {
    it('should have all notification types', () => {
      expect(NotificationType.INFO).toBe('info');
      expect(NotificationType.SUCCESS).toBe('success');
      expect(NotificationType.WARNING).toBe('warning');
      expect(NotificationType.ERROR).toBe('error');
      expect(NotificationType.BLOCKED).toBe('blocked');
      expect(NotificationType.COMPLETE).toBe('complete');
    });
  });

  describe('Constructor', () => {
    it('should initialize with default options', () => {
      const d = new DashboardIntegration({ projectRoot: tempDir });

      expect(d.projectRoot).toBe(tempDir);
      expect(d.autoUpdate).toBe(true);
      expect(d.updateInterval).toBe(5000);
    });

    it('should accept custom options', () => {
      const d = new DashboardIntegration({
        projectRoot: tempDir,
        autoUpdate: false,
        updateInterval: 1000,
      });

      expect(d.autoUpdate).toBe(false);
      expect(d.updateInterval).toBe(1000);
    });

    it('should bind orchestrator events when provided', () => {
      const d = new DashboardIntegration({
        projectRoot: tempDir,
        orchestrator,
      });

      // Should have event bindings (can't easily test internals)
      expect(d.orchestrator).toBe(orchestrator);
    });
  });

  describe('Status File Update (AC1)', () => {
    it('should update status file', async () => {
      await dashboard.start();
      await dashboard.updateStatus();

      expect(await fs.pathExists(dashboard.statusPath)).toBe(true);
    });

    it('should write valid JSON', async () => {
      await dashboard.start();
      await dashboard.updateStatus();

      const content = await fs.readJson(dashboard.statusPath);
      expect(content).toBeDefined();
      expect(content.orchestrator).toBeDefined();
    });

    it('should return status path', () => {
      const statusPath = dashboard.getStatusPath();
      // Normalize path separators for cross-platform compatibility (Windows uses \, Unix uses /)
      const normalizedPath = statusPath.replace(/\\/g, '/');
      expect(normalizedPath).toContain('.aiox/dashboard/status.json');
    });
  });

  describe('Status Content (AC2)', () => {
    it('should include currentEpic', async () => {
      const status = dashboard.buildStatus();

      expect(status.orchestrator['TEST-001']).toBeDefined();
      expect(status.orchestrator['TEST-001'].currentEpic).toBeDefined();
    });

    it('should include progress', async () => {
      const status = dashboard.buildStatus();

      expect(status.orchestrator['TEST-001'].progress).toBeDefined();
      expect(status.orchestrator['TEST-001'].progress.overall).toBeDefined();
    });

    it('should include timestamps', async () => {
      const status = dashboard.buildStatus();

      expect(status.orchestrator['TEST-001'].updatedAt).toBeDefined();
    });

    it('should include status flags', async () => {
      const status = dashboard.buildStatus();

      expect(status.orchestrator['TEST-001'].blocked).toBeDefined();
    });
  });

  describe('Event Emitter (AC3)', () => {
    it('should emit statusUpdated event', async () => {
      let emitted = false;
      dashboard.on('statusUpdated', () => {
        emitted = true;
      });

      await dashboard.start();
      await dashboard.updateStatus();

      expect(emitted).toBe(true);
    });

    it('should emit started event', async () => {
      let emitted = false;
      dashboard.on('started', () => {
        emitted = true;
      });

      await dashboard.start();

      expect(emitted).toBe(true);
    });

    it('should emit stopped event', async () => {
      let emitted = false;
      dashboard.on('stopped', () => {
        emitted = true;
      });

      await dashboard.start();
      dashboard.stop();

      expect(emitted).toBe(true);
    });
  });

  describe('Progress Percentage (AC4)', () => {
    it('should return progress percentage', () => {
      const progress = dashboard.getProgressPercentage();

      expect(typeof progress).toBe('number');
      expect(progress).toBeGreaterThanOrEqual(0);
      expect(progress).toBeLessThanOrEqual(100);
    });
  });

  describe('History (AC5)', () => {
    it('should track history entries', () => {
      dashboard.addToHistory({
        type: 'epicComplete',
        epicNum: 3,
        timestamp: new Date().toISOString(),
      });

      const history = dashboard.getHistory();

      expect(history).toHaveLength(1);
      expect(history[0].type).toBe('epicComplete');
    });

    it('should limit history to 100 entries', () => {
      for (let i = 0; i < 150; i++) {
        dashboard.addToHistory({ type: 'test', index: i });
      }

      const history = dashboard.getHistory();

      expect(history).toHaveLength(100);
      // Should keep latest entries
      expect(history[0].index).toBe(50);
    });

    it('should get history for specific epic', () => {
      dashboard.addToHistory({ type: 'epicComplete', epicNum: 3 });
      dashboard.addToHistory({ type: 'epicComplete', epicNum: 4 });
      dashboard.addToHistory({ type: 'epicFailed', epicNum: 3 });

      const epic3History = dashboard.getHistoryForEpic(3);

      expect(epic3History).toHaveLength(2);
    });
  });

  describe('Logs Path (AC6)', () => {
    it('should include logsPath in status', async () => {
      const status = dashboard.buildStatus();

      expect(status.orchestrator['TEST-001'].logsPath).toBeDefined();
      expect(status.orchestrator['TEST-001'].logsPath).toContain('TEST-001.log');
    });
  });

  describe('Notifications (AC7)', () => {
    it('should add notifications', () => {
      dashboard.addNotification({
        type: NotificationType.INFO,
        title: 'Test',
        message: 'Test message',
      });

      const notifications = dashboard.getNotifications();

      expect(notifications).toHaveLength(1);
      expect(notifications[0].title).toBe('Test');
      expect(notifications[0].read).toBe(false);
    });

    it('should emit notification event', () => {
      let emitted = null;
      dashboard.on('notification', (notif) => {
        emitted = notif;
      });

      dashboard.addNotification({
        type: NotificationType.WARNING,
        title: 'Warning',
        message: 'Warning message',
      });

      expect(emitted).toBeDefined();
      expect(emitted.type).toBe(NotificationType.WARNING);
    });

    it('should get unread notifications only', () => {
      dashboard.addNotification({ type: NotificationType.INFO, title: '1' });
      dashboard.addNotification({ type: NotificationType.INFO, title: '2' });

      // Mark first as read
      const notifs = dashboard.getNotifications();
      dashboard.markNotificationRead(notifs[0].id);

      const unread = dashboard.getNotifications(true);
      expect(unread).toHaveLength(1);
      expect(unread[0].title).toBe('2');
    });

    it('should mark all notifications as read', () => {
      dashboard.addNotification({ type: NotificationType.INFO, title: '1' });
      dashboard.addNotification({ type: NotificationType.INFO, title: '2' });

      dashboard.markAllNotificationsRead();

      const unread = dashboard.getNotifications(true);
      expect(unread).toHaveLength(0);
    });

    it('should clear notifications', () => {
      dashboard.addNotification({ type: NotificationType.INFO, title: '1' });
      dashboard.addNotification({ type: NotificationType.INFO, title: '2' });

      dashboard.clearNotifications();

      expect(dashboard.getNotifications()).toHaveLength(0);
    });

    it('should limit notifications to 50', () => {
      for (let i = 0; i < 60; i++) {
        dashboard.addNotification({ type: NotificationType.INFO, title: `${i}` });
      }

      const notifications = dashboard.getNotifications();
      expect(notifications).toHaveLength(50);
    });
  });

  describe('Read Status', () => {
    it('should read status from file', async () => {
      await dashboard.start();
      await dashboard.updateStatus();

      const status = await dashboard.readStatus();

      expect(status).toBeDefined();
      expect(status.orchestrator['TEST-001']).toBeDefined();
    });

    it('should return null if file does not exist', async () => {
      const status = await dashboard.readStatus();

      expect(status).toBeNull();
    });
  });

  describe('Clear', () => {
    it('should clear all state', () => {
      dashboard.addToHistory({ type: 'test' });
      dashboard.addNotification({ type: NotificationType.INFO, title: 'test' });

      dashboard.clear();

      expect(dashboard.getHistory()).toHaveLength(0);
      expect(dashboard.getNotifications()).toHaveLength(0);
    });
  });
});

describe('Integration with MasterOrchestrator', () => {
  let tempDir;

  beforeEach(async () => {
    tempDir = path.join(os.tmpdir(), `dashboard-orch-test-${Date.now()}`);
    await fs.ensureDir(tempDir);
  });

  afterEach(async () => {
    await fs.remove(tempDir);
  });

  it('should integrate DashboardIntegration with MasterOrchestrator', async () => {
    const orchestrator = new MasterOrchestrator(tempDir, {
      storyId: 'TEST-001',
    });

    expect(orchestrator.dashboardIntegration).toBeDefined();
    expect(orchestrator.dashboardIntegration).toBeInstanceOf(DashboardIntegration);
  });

  it('should expose getDashboardIntegration method', async () => {
    const orchestrator = new MasterOrchestrator(tempDir, {
      storyId: 'TEST-001',
    });

    const dashboard = orchestrator.getDashboardIntegration();
    expect(dashboard).toBeDefined();
    expect(dashboard).toBeInstanceOf(DashboardIntegration);
  });

  it('should expose getDashboardStatus method', async () => {
    const orchestrator = new MasterOrchestrator(tempDir, {
      storyId: 'TEST-001',
    });

    const status = orchestrator.getDashboardStatus();
    expect(status).toBeDefined();
    expect(status.orchestrator['TEST-001']).toBeDefined();
  });

  it('should expose getExecutionHistory method', async () => {
    const orchestrator = new MasterOrchestrator(tempDir, {
      storyId: 'TEST-001',
    });

    const history = orchestrator.getExecutionHistory();
    expect(Array.isArray(history)).toBe(true);
  });

  it('should expose getNotifications method', async () => {
    const orchestrator = new MasterOrchestrator(tempDir, {
      storyId: 'TEST-001',
    });

    const notifications = orchestrator.getNotifications();
    expect(Array.isArray(notifications)).toBe(true);
  });

  it('should allow adding notifications', async () => {
    const orchestrator = new MasterOrchestrator(tempDir, {
      storyId: 'TEST-001',
    });

    orchestrator.addNotification({
      type: NotificationType.INFO,
      title: 'Test',
      message: 'Test message',
    });

    const notifications = orchestrator.getNotifications();
    expect(notifications).toHaveLength(1);
  });
});
