/**
 * @fileoverview Tests for PlanTracker - ADE Epic 4
 * @description Unit tests for implementation plan tracking functionality
 */

const path = require('path');

// Mock fs before requiring the module
jest.mock('fs', () => {
  const actual = jest.requireActual('fs');
  return {
    ...actual,
    existsSync: jest.fn(),
    readFileSync: jest.fn(),
    writeFileSync: jest.fn(),
    mkdirSync: jest.fn(),
    readdirSync: jest.fn(),
    promises: {
      ...actual.promises,
    },
  };
});

// Mock js-yaml
jest.mock('js-yaml', () => ({
  load: jest.fn(),
  dump: jest.fn((obj) => JSON.stringify(obj)),
}));

const fs = require('fs');
const yaml = require('js-yaml');
const {
  PlanTracker,
  Status,
  getPlanProgress,
  updateAfterSubtask,
  CONFIG,
} = require('../../.aiox-core/infrastructure/scripts/plan-tracker');

describe('PlanTracker', () => {
  const projectRoot = '/test/project';
  const storyId = 'STORY-42';

  // Sample implementation plan
  const samplePlan = {
    storyId: 'STORY-42',
    phases: [
      {
        id: 1,
        name: 'Setup',
        subtasks: [
          { id: '1.1', description: 'Create directory structure', status: 'completed' },
          { id: '1.2', description: 'Setup configuration', status: 'in_progress' },
        ],
      },
      {
        id: 2,
        name: 'Implementation',
        subtasks: [
          { id: '2.1', description: 'Implement core logic', status: 'pending' },
          { id: '2.2', description: 'Add error handling', status: 'pending' },
          { id: '2.3', description: 'Write tests', status: 'pending' },
        ],
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockReturnValue('mock yaml content');
    yaml.load.mockReturnValue({ ...samplePlan });
  });

  describe('constructor', () => {
    it('should accept string (legacy) constructor', () => {
      const tracker = new PlanTracker(storyId);
      expect(tracker.storyId).toBe(storyId);
      expect(tracker.rootPath).toBe(process.cwd());
    });

    it('should accept object constructor', () => {
      const tracker = new PlanTracker({
        storyId,
        rootPath: projectRoot,
      });
      expect(tracker.storyId).toBe(storyId);
      expect(tracker.rootPath).toBe(projectRoot);
    });

    it('should use explicit planPath when provided', () => {
      const planPath = '/custom/path/implementation.yaml';
      const tracker = new PlanTracker({
        planPath,
        rootPath: projectRoot,
      });
      expect(tracker.planPath).toBe(planPath);
    });
  });

  describe('load', () => {
    it('should load plan from yaml file', () => {
      const tracker = new PlanTracker({ storyId, rootPath: projectRoot });
      tracker.load();

      expect(yaml.load).toHaveBeenCalled();
      expect(tracker.plan).toBeDefined();
    });

    it('should throw error if plan file not found', () => {
      fs.existsSync.mockReturnValue(false);

      const tracker = new PlanTracker({ storyId, rootPath: projectRoot });

      expect(() => tracker.load()).toThrow(/not found/);
    });
  });

  describe('getStats', () => {
    it('should calculate correct statistics', () => {
      const tracker = new PlanTracker({ storyId, rootPath: projectRoot });
      const stats = tracker.getStats();

      expect(stats.total).toBe(5);
      expect(stats.completed).toBe(1);
      expect(stats.inProgress).toBe(1);
      expect(stats.pending).toBe(3);
      expect(stats.failed).toBe(0);
    });

    it('should calculate percentage correctly', () => {
      const tracker = new PlanTracker({ storyId, rootPath: projectRoot });
      const stats = tracker.getStats();

      expect(stats.percentComplete).toBe(20); // 1/5 = 20%
    });

    it('should identify current task', () => {
      const tracker = new PlanTracker({ storyId, rootPath: projectRoot });
      const stats = tracker.getStats();

      expect(stats.current).toBeDefined();
      expect(stats.current.subtask).toBe('1.2');
      expect(stats.current.phase).toBe('Setup');
    });

    it('should determine overall status correctly', () => {
      const tracker = new PlanTracker({ storyId, rootPath: projectRoot });
      const stats = tracker.getStats();

      expect(stats.status).toBe(Status.IN_PROGRESS);
    });

    it('should return COMPLETED status when all done', () => {
      const completedPlan = {
        phases: [
          {
            id: 1,
            name: 'Setup',
            subtasks: [
              { id: '1.1', description: 'Task 1', status: 'completed' },
              { id: '1.2', description: 'Task 2', status: 'completed' },
            ],
          },
        ],
      };
      yaml.load.mockReturnValue(completedPlan);

      const tracker = new PlanTracker({ storyId, rootPath: projectRoot });
      const stats = tracker.getStats();

      expect(stats.status).toBe(Status.COMPLETED);
      expect(stats.percentComplete).toBe(100);
    });

    it('should return FAILED status when any task failed', () => {
      const failedPlan = {
        phases: [
          {
            id: 1,
            name: 'Setup',
            subtasks: [
              { id: '1.1', description: 'Task 1', status: 'completed' },
              { id: '1.2', description: 'Task 2', status: 'failed' },
            ],
          },
        ],
      };
      yaml.load.mockReturnValue(failedPlan);

      const tracker = new PlanTracker({ storyId, rootPath: projectRoot });
      const stats = tracker.getStats();

      expect(stats.status).toBe(Status.FAILED);
    });
  });

  describe('progressBar', () => {
    it('should generate correct progress bar', () => {
      const tracker = new PlanTracker({ storyId, rootPath: projectRoot });

      const bar0 = tracker.progressBar(0);
      const bar50 = tracker.progressBar(50);
      const bar100 = tracker.progressBar(100);

      expect(bar0).toBe('░░░░░░░░░░');
      expect(bar50).toBe('▓▓▓▓▓░░░░░');
      expect(bar100).toBe('▓▓▓▓▓▓▓▓▓▓');
    });

    it('should support custom width', () => {
      const tracker = new PlanTracker({ storyId, rootPath: projectRoot });

      const bar = tracker.progressBar(50, 20);

      expect(bar.length).toBe(20);
      expect(bar).toBe('▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░');
    });
  });

  describe('generateReport', () => {
    it('should generate visual report', () => {
      const tracker = new PlanTracker({ storyId, rootPath: projectRoot });
      const report = tracker.generateReport();

      expect(report).toContain('Implementation Progress');
      expect(report).toContain('STORY-42');
      expect(report).toContain('Setup');
      expect(report).toContain('%');
    });
  });

  describe('generateDetailedReport', () => {
    it('should include all subtasks', () => {
      const tracker = new PlanTracker({ storyId, rootPath: projectRoot });
      const report = tracker.generateDetailedReport();

      expect(report).toContain('1.1');
      expect(report).toContain('1.2');
      expect(report).toContain('2.1');
      expect(report).toContain('Create directory structure');
    });
  });

  describe('getNextPending', () => {
    it('should return first pending subtask', () => {
      const tracker = new PlanTracker({ storyId, rootPath: projectRoot });
      const stats = tracker.getStats();
      const next = tracker.getNextPending(stats);

      expect(next).toBeDefined();
      expect(next.id).toBe('2.1');
      expect(next.status).toBe(Status.PENDING);
    });

    it('should return null when no pending tasks', () => {
      const completedPlan = {
        phases: [
          {
            id: 1,
            name: 'Setup',
            subtasks: [{ id: '1.1', description: 'Task 1', status: 'completed' }],
          },
        ],
      };
      yaml.load.mockReturnValue(completedPlan);

      const tracker = new PlanTracker({ storyId, rootPath: projectRoot });
      const stats = tracker.getStats();
      const next = tracker.getNextPending(stats);

      expect(next).toBeNull();
    });
  });

  describe('updateSubtaskStatus', () => {
    it('should update subtask status', () => {
      const tracker = new PlanTracker({ storyId, rootPath: projectRoot });
      tracker.load();

      tracker.updateSubtaskStatus('1.2', Status.COMPLETED);

      expect(fs.writeFileSync).toHaveBeenCalled();
    });

    it('should throw error for unknown subtask', () => {
      const tracker = new PlanTracker({ storyId, rootPath: projectRoot });
      tracker.load();

      expect(() => {
        tracker.updateSubtaskStatus('9.9', Status.COMPLETED);
      }).toThrow(/not found/);
    });

    it('should add extra properties to subtask', () => {
      const tracker = new PlanTracker({ storyId, rootPath: projectRoot });
      tracker.load();

      tracker.updateSubtaskStatus('1.2', Status.COMPLETED, {
        completedAt: '2026-01-29',
      });

      const subtask = tracker.plan.phases[0].subtasks[1];
      expect(subtask.completedAt).toBe('2026-01-29');
    });
  });

  describe('startSubtask', () => {
    it('should mark subtask as in_progress', () => {
      const tracker = new PlanTracker({ storyId, rootPath: projectRoot });
      tracker.load();

      tracker.startSubtask('2.1');

      const subtask = tracker.plan.phases[1].subtasks[0];
      expect(subtask.status).toBe(Status.IN_PROGRESS);
    });
  });

  describe('completeSubtask', () => {
    it('should mark subtask as completed with timestamp', () => {
      const tracker = new PlanTracker({ storyId, rootPath: projectRoot });
      tracker.load();

      tracker.completeSubtask('1.2');

      const subtask = tracker.plan.phases[0].subtasks[1];
      expect(subtask.status).toBe(Status.COMPLETED);
      expect(subtask.completedAt).toBeDefined();
    });
  });

  describe('failSubtask', () => {
    it('should mark subtask as failed with error', () => {
      const tracker = new PlanTracker({ storyId, rootPath: projectRoot });
      tracker.load();

      tracker.failSubtask('2.1', 'Test error');

      const subtask = tracker.plan.phases[1].subtasks[0];
      expect(subtask.status).toBe(Status.FAILED);
      expect(subtask.error).toBe('Test error');
      expect(subtask.failedAt).toBeDefined();
    });
  });

  describe('saveProgress', () => {
    it('should write progress report to file', () => {
      const tracker = new PlanTracker({ storyId, rootPath: projectRoot });

      const resultPath = tracker.saveProgress();

      expect(fs.writeFileSync).toHaveBeenCalled();
      expect(resultPath).toContain('build-progress.txt');
    });

    it('should create directory if not exists', () => {
      // Mock directory doesn't exist initially
      fs.existsSync.mockImplementation((p) => {
        // Plan file exists, but output directory doesn't
        if (p.includes('plan') && p.includes('implementation')) return true;
        if (p.includes('plan') && !p.includes('implementation')) return false;
        return true;
      });

      const tracker = new PlanTracker({ storyId, rootPath: projectRoot });
      tracker.saveProgress();

      // mkdirSync is called when directory doesn't exist
      expect(fs.mkdirSync).toHaveBeenCalled();
    });
  });

  describe('updateStatusJson', () => {
    it('should update dashboard status file', () => {
      fs.readFileSync.mockImplementation((p) => {
        if (p.includes('status.json')) {
          return JSON.stringify({ version: '1.0', stories: { inProgress: [], completed: [] } });
        }
        return 'mock yaml content';
      });

      const tracker = new PlanTracker({ storyId, rootPath: projectRoot });

      const resultPath = tracker.updateStatusJson();

      expect(fs.writeFileSync).toHaveBeenCalled();
      expect(resultPath).toContain('status.json');
    });

    it('should add story to inProgress list when in progress', () => {
      // Setup fresh mocks
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockImplementation((p) => {
        if (p.includes('status.json')) {
          return JSON.stringify({ version: '1.0', stories: { inProgress: [], completed: [] } });
        }
        return 'mock yaml content';
      });
      // Ensure fresh sample plan for this test
      yaml.load.mockReturnValue({
        storyId: 'STORY-42',
        phases: [
          {
            id: 1,
            name: 'Setup',
            subtasks: [
              { id: '1.1', description: 'Task 1', status: 'completed' },
              { id: '1.2', description: 'Task 2', status: 'in_progress' },
            ],
          },
        ],
      });

      const tracker = new PlanTracker({ storyId, rootPath: projectRoot });
      tracker.load();
      tracker.updateStatusJson();

      // Verify write was called with status file
      const dashboardWriteCall = fs.writeFileSync.mock.calls.find((c) =>
        c[0].includes('status.json'),
      );

      expect(dashboardWriteCall).toBeDefined();
      const written = JSON.parse(dashboardWriteCall[1]);

      // Verify planProgress contains our story with in_progress status
      expect(written.planProgress).toBeDefined();
      expect(written.planProgress[storyId]).toBeDefined();
      expect(written.planProgress[storyId].status).toBe('in_progress');
    });
  });

  describe('getProgress', () => {
    it('should return progress in expected format (AC2)', () => {
      const tracker = new PlanTracker({ storyId, rootPath: projectRoot });
      const progress = tracker.getProgress();

      expect(progress).toHaveProperty('total');
      expect(progress).toHaveProperty('completed');
      expect(progress).toHaveProperty('inProgress');
      expect(progress).toHaveProperty('pending');
      expect(progress).toHaveProperty('failed');
      expect(progress).toHaveProperty('percentage');
      expect(progress).toHaveProperty('status');
      expect(progress).toHaveProperty('phases');
    });
  });

  describe('toJSON', () => {
    it('should return stats as JSON', () => {
      const tracker = new PlanTracker({ storyId, rootPath: projectRoot });
      const json = tracker.toJSON();

      expect(json.total).toBe(5);
      expect(json.phases).toHaveLength(2);
    });
  });
});

describe('Helper Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fs.existsSync.mockReturnValue(true);
    yaml.load.mockReturnValue({
      phases: [
        {
          id: 1,
          name: 'Test',
          subtasks: [{ id: '1.1', description: 'Test task', status: 'pending' }],
        },
      ],
    });
  });

  describe('getPlanProgress', () => {
    it('should return progress for story', () => {
      const progress = getPlanProgress('STORY-42');

      expect(progress).toBeDefined();
      expect(progress.total).toBe(1);
    });

    it('should return null if plan not found', () => {
      fs.existsSync.mockReturnValue(false);

      const progress = getPlanProgress('STORY-NOTFOUND');

      expect(progress).toBeNull();
    });
  });

  describe('updateAfterSubtask', () => {
    it('should update subtask and return stats', () => {
      const stats = updateAfterSubtask('STORY-42', '1.1', Status.COMPLETED);

      expect(stats).toBeDefined();
      expect(fs.writeFileSync).toHaveBeenCalled();
    });
  });
});

describe('Status Constants', () => {
  it('should export all status values', () => {
    expect(Status.PENDING).toBe('pending');
    expect(Status.IN_PROGRESS).toBe('in_progress');
    expect(Status.COMPLETED).toBe('completed');
    expect(Status.FAILED).toBe('failed');
    expect(Status.BLOCKED).toBe('blocked');
    expect(Status.SKIPPED).toBe('skipped');
  });
});

describe('CONFIG', () => {
  it('should have required configuration values', () => {
    expect(CONFIG.progressBarWidth).toBe(10);
    expect(CONFIG.dashboardStatusPath).toBeDefined();
    expect(CONFIG.buildProgressFile).toBe('build-progress.txt');
    expect(CONFIG.implementationFile).toBe('implementation.yaml');
  });
});
