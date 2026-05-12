/**
 * Unit Tests: Session Context Loader
 * Story 6.1.2.6.2 - Agent Performance Optimization
 *
 * Tests session continuity and agent transition tracking
 */

const fs = require('fs').promises;
const path = require('path');
const SessionContextLoader = require('../../.aiox-core/scripts/session-context-loader');

describe('SessionContextLoader', () => {
  let loader;
  const testSessionPath = path.join(process.cwd(), '.aiox', 'session-state-test.json');

  beforeEach(() => {
    loader = new SessionContextLoader();
    // Override session state path for testing
    loader.sessionStatePath = testSessionPath;
  });

  afterEach(async () => {
    // Clean up test session file
    await loader.clearSession();
  });

  describe('loadContext() - Session Detection', () => {
    test('detects new session when no state exists', () => {
      loader.clearSession();

      const context = loader.loadContext('dev');

      expect(context.sessionType).toBe('new');
      expect(context.message).toBeNull();
      expect(context.previousAgent).toBeNull();
      expect(context.lastCommands).toEqual([]);
      expect(context.workflowActive).toBeNull();
    });

    test('detects existing session after agent activation', () => {
      // Simulate @po activation
      loader.updateSession('po', 'Pax', 'validate-story-draft');

      // Load context for @dev
      const context = loader.loadContext('dev');

      expect(context.sessionType).toBe('existing');
      expect(context.previousAgent).toBeTruthy();
      expect(context.previousAgent.agentId).toBe('po');
      expect(context.message).toContain('Continuing from @po');
    });
  });

  describe('loadContext() - Agent Transition Tracking', () => {
    test('tracks agent transitions correctly', () => {
      // Simulate agent sequence: @po → @dev
      loader.updateSession('po', 'Pax', 'validate-story-draft');
      loader.updateSession('dev', 'Dex', 'develop');

      // Load context for @qa
      const context = loader.loadContext('qa');

      expect(context.previousAgent.agentId).toBe('dev');
      expect(context.previousAgent.agentName).toBe('Dex');
      expect(context.previousAgent.lastCommand).toBe('develop');
    });

    test('skips same agent in previous agent detection', () => {
      // Simulate: @po → @dev → @dev again
      loader.updateSession('po', 'Pax', 'create-story');
      loader.updateSession('dev', 'Dex', 'develop');
      loader.updateSession('dev', 'Dex', 'run-tests');

      // Load context for @dev
      const context = loader.loadContext('dev');

      // Previous agent should be @po, not @dev
      expect(context.previousAgent.agentId).toBe('po');
    });

    test('maintains command history (last 10 commands)', () => {
      loader.updateSession('po', 'Pax', 'create-story');
      loader.updateSession('po', 'Pax', 'validate-story-draft');
      loader.updateSession('dev', 'Dex', 'develop');
      loader.updateSession('dev', 'Dex', 'run-tests');

      const context = loader.loadContext('qa');

      expect(context.lastCommands).toEqual([
        'create-story',
        'validate-story-draft',
        'develop',
        'run-tests',
      ]);
    });

    test('limits command history to 10 entries', () => {
      // Add 15 commands
      for (let i = 1; i <= 15; i++) {
        loader.updateSession('dev', 'Dex', `command-${i}`);
      }

      const context = loader.loadContext('qa');

      expect(context.lastCommands.length).toBe(10);
      expect(context.lastCommands[0]).toBe('command-6'); // Oldest kept
      expect(context.lastCommands[9]).toBe('command-15'); // Latest
    });
  });

  describe('updateSession() - Session State Management', () => {
    test('initializes session ID on first update', () => {
      loader.updateSession('dev', 'Dex', 'develop');

      const sessionState = loader.loadSessionState();

      expect(sessionState.sessionId).toMatch(/^session-/);
      expect(sessionState.startTime).toBeTruthy();
      expect(sessionState.lastActivity).toBeTruthy();
    });

    test('maintains session ID across updates', () => {
      loader.updateSession('po', 'Pax', 'create-story');
      const state1 = loader.loadSessionState();
      const sessionId1 = state1.sessionId;

      loader.updateSession('dev', 'Dex', 'develop');
      const state2 = loader.loadSessionState();
      const sessionId2 = state2.sessionId;

      expect(sessionId1).toBe(sessionId2);
    });

    test('updates lastActivity timestamp', async () => {
      loader.updateSession('dev', 'Dex', 'develop');
      const state1 = loader.loadSessionState();
      const activity1 = state1.lastActivity;

      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 10));

      loader.updateSession('dev', 'Dex', 'run-tests');
      const state2 = loader.loadSessionState();
      const activity2 = state2.lastActivity;

      expect(activity2).toBeGreaterThan(activity1);
    });

    test('limits agent sequence to last 20 activations', () => {
      // Add 25 agent activations
      for (let i = 1; i <= 25; i++) {
        loader.updateSession('dev', 'Dex', `develop-${i}`);
      }

      const sessionState = loader.loadSessionState();

      expect(sessionState.agentSequence.length).toBe(20);
    });
  });

  describe('generateContextMessage() - Message Generation', () => {
    test('generates message with previous agent info', () => {
      loader.updateSession('po', 'Pax', 'validate-story-draft');

      const context = loader.loadContext('dev');

      expect(context.message).toContain('@po');
      expect(context.message).toContain('Pax');
      expect(context.message).toContain('validate-story-draft');
    });

    test('includes time since previous agent activation', () => {
      loader.updateSession('po', 'Pax', 'validate-story-draft');

      const context = loader.loadContext('dev');

      expect(context.message).toMatch(/(just now|minutes ago)/);
    });

    test('includes recent commands in message', () => {
      loader.updateSession('po', 'Pax', 'create-story');
      loader.updateSession('po', 'Pax', 'validate-story-draft');

      const context = loader.loadContext('dev');

      expect(context.message).toContain('Recent commands');
      expect(context.message).toContain('create-story');
      expect(context.message).toContain('validate-story-draft');
    });

    test('includes active workflow if set', () => {
      loader.updateSession('po', 'Pax', 'create-story', {
        workflowActive: 'story-creation',
      });

      const context = loader.loadContext('dev');

      expect(context.message).toContain('Active Workflow: story-creation');
    });

    test('returns null for new sessions', () => {
      loader.clearSession();

      const context = loader.loadContext('dev');

      expect(context.message).toBeNull();
    });
  });

  describe('formatForGreeting() - Display Formatting', () => {
    test('formats context message for agent greeting', () => {
      loader.updateSession('po', 'Pax', 'validate-story-draft');

      const message = loader.formatForGreeting('dev');

      expect(message).toContain('\n');
      expect(message).toContain('@po');
    });

    test('returns empty string for new sessions', () => {
      loader.clearSession();

      const message = loader.formatForGreeting('dev');

      expect(message).toBe('');
    });
  });

  describe('clearSession() - Cleanup', () => {
    test('removes session state file', async () => {
      loader.updateSession('dev', 'Dex', 'develop');

      loader.clearSession();

      const sessionState = loader.loadSessionState();
      expect(Object.keys(sessionState).length).toBe(0);
    });

    test('allows new session after clear', () => {
      loader.updateSession('dev', 'Dex', 'develop');
      loader.clearSession();

      const context = loader.loadContext('dev');

      expect(context.sessionType).toBe('new');
    });
  });

  describe('getPreviousAgent() - Agent History', () => {
    test('returns null if no previous agents', () => {
      const sessionState = { agentSequence: [] };
      const previous = loader.getPreviousAgent(sessionState, 'dev');

      expect(previous).toBeNull();
    });

    test('returns most recent different agent', () => {
      const sessionState = {
        agentSequence: [
          { agentId: 'po', agentName: 'Pax', activatedAt: Date.now() - 10000, lastCommand: 'create-story' },
          { agentId: 'dev', agentName: 'Dex', activatedAt: Date.now() - 5000, lastCommand: 'develop' },
          { agentId: 'qa', agentName: 'Quinn', activatedAt: Date.now(), lastCommand: 'review' },
        ],
      };

      const previous = loader.getPreviousAgent(sessionState, 'qa');

      expect(previous.agentId).toBe('dev');
      expect(previous.agentName).toBe('Dex');
    });
  });

  describe('Error Handling', () => {
    test('handles corrupted session file gracefully', async () => {
      // Write invalid JSON to session file
      await fs.mkdir(path.dirname(testSessionPath), { recursive: true });
      await fs.writeFile(testSessionPath, 'invalid json{', 'utf8');

      const context = loader.loadContext('dev');

      // Should treat as new session
      expect(context.sessionType).toBe('new');
    });

    test('handles missing session file gracefully', () => {
      loader.clearSession();

      const context = loader.loadContext('dev');

      expect(context.sessionType).toBe('new');
    });
  });

  describe('onTaskComplete() - Task Completion Hook (WIS-3)', () => {
    test('records task completion in session state', () => {
      const result = loader.onTaskComplete('develop', {
        success: true,
        agentId: 'dev',
        storyPath: 'docs/stories/test.md',
      });

      expect(result.success).toBe(true);
      expect(result.sessionId).toBeTruthy();
    });

    test('adds command to history', () => {
      loader.onTaskComplete('develop', { success: true });

      const context = loader.loadContext('qa');

      expect(context.lastCommands).toContain('*develop');
    });

    test('normalizes command with * prefix', () => {
      loader.onTaskComplete('run-tests', { success: true });
      loader.onTaskComplete('*review-qa', { success: true });

      const sessionState = loader.loadSessionState();

      expect(sessionState.lastCommands).toContain('*run-tests');
      expect(sessionState.lastCommands).toContain('*review-qa');
    });

    test('updates task history', () => {
      loader.onTaskComplete('develop', {
        success: true,
        agentId: 'dev',
        storyPath: 'docs/stories/test.md',
      });

      const sessionState = loader.loadSessionState();

      expect(sessionState.taskHistory).toBeTruthy();
      expect(sessionState.taskHistory.length).toBe(1);
      expect(sessionState.taskHistory[0].task).toBe('develop');
      expect(sessionState.taskHistory[0].success).toBe(true);
    });

    test('limits task history to 20 entries', () => {
      for (let i = 1; i <= 25; i++) {
        loader.onTaskComplete(`task-${i}`, { success: true });
      }

      const sessionState = loader.loadSessionState();

      expect(sessionState.taskHistory.length).toBe(20);
      expect(sessionState.taskHistory[0].task).toBe('task-6');
      expect(sessionState.taskHistory[19].task).toBe('task-25');
    });

    test('updates current story if provided', () => {
      loader.onTaskComplete('develop', {
        success: true,
        storyPath: 'docs/stories/v2.1/sprint-10/story-wis-3.md',
      });

      const sessionState = loader.loadSessionState();

      expect(sessionState.currentStory).toBe('docs/stories/v2.1/sprint-10/story-wis-3.md');
    });

    test('infers workflow state from task name', () => {
      loader.onTaskComplete('develop', { success: true });

      const sessionState = loader.loadSessionState();

      expect(sessionState.workflowActive).toBe('story_development');
      expect(sessionState.workflowState).toBe('in_development');
    });

    test('infers different workflow states', () => {
      // Test validate-story-draft
      loader.onTaskComplete('validate-story-draft', { success: true });
      let state = loader.loadSessionState();
      expect(state.workflowActive).toBe('story_development');
      expect(state.workflowState).toBe('validated');

      // Test review-qa
      loader.onTaskComplete('review-qa', { success: true });
      state = loader.loadSessionState();
      expect(state.workflowState).toBe('qa_reviewed');

      // Test create-epic
      loader.onTaskComplete('create-epic', { success: true });
      state = loader.loadSessionState();
      expect(state.workflowActive).toBe('epic_creation');
      expect(state.workflowState).toBe('epic_drafted');
    });

    test('handles failed task result', () => {
      loader.onTaskComplete('develop', { success: false });

      const sessionState = loader.loadSessionState();

      expect(sessionState.taskHistory[0].success).toBe(false);
    });
  });

  describe('getWorkflowState() - Workflow State Access (WIS-3)', () => {
    test('returns null when no workflow active', () => {
      loader.clearSession();

      const state = loader.getWorkflowState();

      expect(state).toBeNull();
    });

    test('returns workflow state after task completion', () => {
      loader.onTaskComplete('develop', { success: true });

      const state = loader.getWorkflowState();

      expect(state).toBeTruthy();
      expect(state.workflow).toBe('story_development');
      expect(state.state).toBe('in_development');
      expect(state.lastActivity).toBeTruthy();
    });
  });

  describe('getTaskHistory() - Task History Access (WIS-3)', () => {
    test('returns empty array when no history', () => {
      loader.clearSession();

      const history = loader.getTaskHistory();

      expect(history).toEqual([]);
    });

    test('returns task history entries', () => {
      loader.onTaskComplete('develop', { success: true });
      loader.onTaskComplete('run-tests', { success: true });

      const history = loader.getTaskHistory();

      expect(history.length).toBe(2);
      expect(history[0].task).toBe('develop');
      expect(history[1].task).toBe('run-tests');
    });

    test('limits returned entries based on limit parameter', () => {
      for (let i = 1; i <= 10; i++) {
        loader.onTaskComplete(`task-${i}`, { success: true });
      }

      const history = loader.getTaskHistory(5);

      expect(history.length).toBe(5);
      expect(history[0].task).toBe('task-6');
      expect(history[4].task).toBe('task-10');
    });
  });

  describe('_inferWorkflowState() - Workflow State Inference (WIS-3)', () => {
    test('infers story_development workflow states', () => {
      const states = [
        { task: 'validate-story-draft', expected: { workflow: 'story_development', state: 'validated' } },
        { task: 'develop', expected: { workflow: 'story_development', state: 'in_development' } },
        { task: 'develop-yolo', expected: { workflow: 'story_development', state: 'in_development' } },
        { task: 'review-qa', expected: { workflow: 'story_development', state: 'qa_reviewed' } },
      ];

      states.forEach(({ task, expected }) => {
        const result = loader._inferWorkflowState(task, {});
        expect(result).toEqual(expected);
      });
    });

    test('infers epic_creation workflow states', () => {
      const states = [
        { task: 'create-epic', expected: { workflow: 'epic_creation', state: 'epic_drafted' } },
        { task: 'create-story', expected: { workflow: 'epic_creation', state: 'stories_created' } },
      ];

      states.forEach(({ task, expected }) => {
        const result = loader._inferWorkflowState(task, {});
        expect(result).toEqual(expected);
      });
    });

    test('returns null for unknown tasks', () => {
      const result = loader._inferWorkflowState('unknown-task', {});
      expect(result).toBeNull();
    });

    test('normalizes task name by removing * prefix', () => {
      const result = loader._inferWorkflowState('*develop', {});
      expect(result).toEqual({ workflow: 'story_development', state: 'in_development' });
    });
  });
});
