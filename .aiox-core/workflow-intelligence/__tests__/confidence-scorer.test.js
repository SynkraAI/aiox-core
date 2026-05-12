/**
 * @fileoverview Unit tests for ConfidenceScorer
 * @story WIS-2 - Workflow Registry Enhancement
 */

'use strict';

const {
  ConfidenceScorer,
  createConfidenceScorer,
  SCORING_WEIGHTS,
} = require('../engine/confidence-scorer');

describe('ConfidenceScorer', () => {
  let scorer;

  beforeEach(() => {
    scorer = createConfidenceScorer();
  });

  describe('constructor', () => {
    it('should create scorer with default weights', () => {
      const weights = scorer.getWeights();
      expect(weights.COMMAND_MATCH).toBe(0.4);
      expect(weights.AGENT_MATCH).toBe(0.25);
      expect(weights.HISTORY_DEPTH).toBe(0.2);
      expect(weights.PROJECT_STATE).toBe(0.15);
    });

    it('should accept custom weights', () => {
      const customScorer = createConfidenceScorer({
        weights: {
          COMMAND_MATCH: 0.5,
          AGENT_MATCH: 0.2,
          HISTORY_DEPTH: 0.15,
          PROJECT_STATE: 0.15,
        },
      });
      const weights = customScorer.getWeights();
      expect(weights.COMMAND_MATCH).toBe(0.5);
    });

    it('should throw error if weights do not sum to 1.0', () => {
      expect(() => {
        createConfidenceScorer({
          weights: {
            COMMAND_MATCH: 0.5,
            AGENT_MATCH: 0.5,
            HISTORY_DEPTH: 0.2,
            PROJECT_STATE: 0.15,
          },
        });
      }).toThrow('Scoring weights must sum to 1.0');
    });
  });

  describe('score()', () => {
    it('should return 0 for null suggestion', () => {
      const result = scorer.score(null, { lastCommand: 'test' });
      expect(result).toBe(0);
    });

    it('should return 0 for null context', () => {
      const result = scorer.score({ trigger: 'test' }, null);
      expect(result).toBe(0);
    });

    it('should return high score for exact command match', () => {
      const suggestion = {
        trigger: 'create-epic',
        agentSequence: ['po', 'sm'],
        keyCommands: ['create-epic', 'create-story'],
      };
      const context = {
        lastCommand: 'create-epic',
        lastCommands: ['create-epic'],
        agentId: '@po',
        projectState: {},
      };

      const result = scorer.score(suggestion, context);
      // Score is composed of: command(40%) + agent(25%) + history(20%) + state(15%)
      expect(result).toBeGreaterThanOrEqual(0.7);
    });

    it('should return medium score for partial command match', () => {
      const suggestion = {
        trigger: 'create-epic',
        agentSequence: ['po', 'sm'],
        keyCommands: ['create-epic', 'create-story'],
      };
      const context = {
        lastCommand: 'create-story',
        lastCommands: ['create-story'],
        agentId: '@sm',
        projectState: {},
      };

      const result = scorer.score(suggestion, context);
      expect(result).toBeGreaterThan(0.4);
      expect(result).toBeLessThan(0.8);
    });

    it('should return low score for no command match', () => {
      const suggestion = {
        trigger: 'create-epic',
        agentSequence: ['po', 'sm'],
        keyCommands: ['create-epic', 'create-story'],
      };
      const context = {
        lastCommand: 'push',
        lastCommands: ['push'],
        agentId: '@devops',
        projectState: {},
      };

      const result = scorer.score(suggestion, context);
      expect(result).toBeLessThanOrEqual(0.3);
    });

    it('should return normalized score between 0 and 1', () => {
      const suggestion = { trigger: 'any', agentSequence: [], keyCommands: [] };
      const context = { lastCommand: 'any', lastCommands: [], agentId: '' };

      const result = scorer.score(suggestion, context);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(1);
    });
  });

  describe('matchCommand()', () => {
    it('should return 1.0 for exact match', () => {
      const result = scorer.matchCommand('create-epic', 'create-epic');
      expect(result).toBe(1.0);
    });

    it('should return 1.0 when normalized trigger equals command', () => {
      // "create-epic completed" normalizes to "create-epic"
      const result = scorer.matchCommand('create-epic completed', 'create-epic');
      expect(result).toBe(1.0);
    });

    it('should return partial score for keyword match', () => {
      const result = scorer.matchCommand('create-epic', 'create-story');
      // Both share "create" word, so partial match
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThan(1);
    });

    it('should return 0 for no match', () => {
      const result = scorer.matchCommand('create-epic', 'push');
      expect(result).toBe(0);
    });

    it('should handle null trigger', () => {
      const result = scorer.matchCommand(null, 'test');
      expect(result).toBe(0);
    });

    it('should handle null command', () => {
      const result = scorer.matchCommand('test', null);
      expect(result).toBe(0);
    });
  });

  describe('matchAgent()', () => {
    it('should return high score for first agent in sequence', () => {
      const result = scorer.matchAgent(['po', 'sm', 'dev'], '@po');
      expect(result).toBeGreaterThan(0.6);
    });

    it('should return higher score for later agents', () => {
      const result1 = scorer.matchAgent(['po', 'sm', 'dev'], '@po');
      const result2 = scorer.matchAgent(['po', 'sm', 'dev'], '@dev');
      expect(result2).toBeGreaterThan(result1);
    });

    it('should return 0 for agent not in sequence', () => {
      const result = scorer.matchAgent(['po', 'sm'], '@devops');
      expect(result).toBe(0);
    });

    it('should handle agent with @ prefix', () => {
      const result = scorer.matchAgent(['po'], '@po');
      expect(result).toBeGreaterThan(0);
    });

    it('should handle null agent sequence', () => {
      const result = scorer.matchAgent(null, '@po');
      expect(result).toBe(0);
    });
  });

  describe('matchHistory()', () => {
    it('should return high score when history matches key commands', () => {
      const keyCommands = ['create-epic', 'create-story'];
      const history = ['create-epic', 'create-story', 'validate'];

      const result = scorer.matchHistory(keyCommands, history);
      expect(result).toBeGreaterThan(0.8);
    });

    it('should give recency bonus for recent commands', () => {
      const keyCommands = ['create-epic'];
      const historyRecent = ['create-epic', 'other', 'another'];
      const historyOld = ['other', 'another', 'create-epic'];

      const resultRecent = scorer.matchHistory(keyCommands, historyRecent);
      const resultOld = scorer.matchHistory(keyCommands, historyOld);

      // Recent should get higher score due to recency bonus
      expect(resultRecent).toBeGreaterThanOrEqual(resultOld);
    });

    it('should return 0 for no matching commands', () => {
      const keyCommands = ['create-epic'];
      const history = ['push', 'commit'];

      const result = scorer.matchHistory(keyCommands, history);
      expect(result).toBe(0);
    });

    it('should handle empty history', () => {
      const result = scorer.matchHistory(['test'], []);
      expect(result).toBe(0);
    });

    it('should handle empty key commands', () => {
      const result = scorer.matchHistory([], ['test']);
      expect(result).toBe(0);
    });
  });

  describe('matchProjectState()', () => {
    it('should return neutral score for empty state', () => {
      const result = scorer.matchProjectState({}, {});
      expect(result).toBe(0.5);
    });

    it('should boost score for git-related suggestions when uncommitted changes', () => {
      const suggestion = { trigger: 'git commit' };
      const state = { hasUncommittedChanges: true };

      const result = scorer.matchProjectState(suggestion, state);
      expect(result).toBeGreaterThan(0.5);
    });

    it('should boost score for test suggestions when tests failing', () => {
      const suggestion = { trigger: 'run tests' };
      const state = { failingTests: true };

      const result = scorer.matchProjectState(suggestion, state);
      expect(result).toBeGreaterThan(0.5);
    });

    it('should return 0.5 for null project state', () => {
      const result = scorer.matchProjectState({}, null);
      expect(result).toBe(0.5);
    });
  });

  describe('normalizeCommand()', () => {
    it('should convert to lowercase', () => {
      const result = scorer.normalizeCommand('CREATE-EPIC');
      expect(result).toBe('create-epic');
    });

    it('should remove "completed" suffix', () => {
      const result = scorer.normalizeCommand('create-epic completed');
      expect(result).toBe('create-epic');
    });

    it('should remove "successfully" suffix', () => {
      const result = scorer.normalizeCommand('create-epic successfully');
      expect(result).toBe('create-epic');
    });

    it('should remove * prefix', () => {
      const result = scorer.normalizeCommand('*create-epic');
      expect(result).toBe('create-epic');
    });

    it('should handle null', () => {
      const result = scorer.normalizeCommand(null);
      expect(result).toBe('');
    });
  });

  describe('rankSuggestions()', () => {
    it('should return empty array for empty suggestions', () => {
      const result = scorer.rankSuggestions([], {});
      expect(result).toEqual([]);
    });

    it('should rank suggestions by score descending', () => {
      const suggestions = [
        { trigger: 'push', agentSequence: ['devops'] },
        { trigger: 'create-epic', agentSequence: ['po'] },
      ];
      const context = {
        lastCommand: 'create-epic',
        lastCommands: ['create-epic'],
        agentId: '@po',
      };

      const result = scorer.rankSuggestions(suggestions, context);
      expect(result[0].trigger).toBe('create-epic');
      expect(result[0].score).toBeGreaterThan(result[1].score);
    });

    it('should add score property to each suggestion', () => {
      const suggestions = [{ trigger: 'test' }];
      const context = { lastCommand: 'test' };

      const result = scorer.rankSuggestions(suggestions, context);
      expect(result[0]).toHaveProperty('score');
      expect(typeof result[0].score).toBe('number');
    });
  });

  describe('SCORING_WEIGHTS constant', () => {
    it('should have correct default weights', () => {
      expect(SCORING_WEIGHTS.COMMAND_MATCH).toBe(0.4);
      expect(SCORING_WEIGHTS.AGENT_MATCH).toBe(0.25);
      expect(SCORING_WEIGHTS.HISTORY_DEPTH).toBe(0.2);
      expect(SCORING_WEIGHTS.PROJECT_STATE).toBe(0.15);
    });

    it('should sum to 1.0', () => {
      const sum = Object.values(SCORING_WEIGHTS).reduce((a, b) => a + b, 0);
      expect(sum).toBe(1.0);
    });
  });
});
