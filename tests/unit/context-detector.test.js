/**
 * Unit Tests for ContextDetector
 *
 * Test Coverage:
 * - Hybrid detection (conversation vs file)
 * - Session type detection (new/existing/workflow)
 * - Command extraction from conversation
 * - Workflow pattern matching
 * - Session state file operations
 * - TTL expiration handling
 */

const ContextDetector = require('../../.aiox-core/core/session/context-detector');
const fs = require('fs');
const path = require('path');

describe('ContextDetector', () => {
  let detector;
  const testSessionFile = path.join(__dirname, '.test-session-state.json');

  beforeEach(() => {
    detector = new ContextDetector();
    // Clean up test session file
    if (fs.existsSync(testSessionFile)) {
      fs.unlinkSync(testSessionFile);
    }
  });

  afterEach(() => {
    // Clean up test session file
    if (fs.existsSync(testSessionFile)) {
      fs.unlinkSync(testSessionFile);
    }
  });

  describe('detectSessionType', () => {
    describe('Conversation-based detection (preferred)', () => {
      test('should detect new session when conversation is empty', () => {
        const result = detector.detectSessionType([]);
        expect(result).toBe('new');
      });

      test('should detect existing session with conversation history', () => {
        const conversation = [
          { content: 'Hello' },
          { content: 'How are you?' },
        ];
        const result = detector.detectSessionType(conversation);
        expect(result).toBe('existing');
      });

      test('should detect workflow session with story development pattern', () => {
        const conversation = [
          { content: '*validate-story-draft story-6.1.md' },
          { content: 'Story validated!' },
          { content: '*develop story-6.1.md' },
        ];
        const result = detector.detectSessionType(conversation);
        expect(result).toBe('workflow');
      });

      test('should detect workflow session with epic creation pattern', () => {
        const conversation = [
          { content: '*create-epic Epic 6' },
          { content: '*create-story Story 6.1' },
          { content: '*validate-story-draft story-6.1.md' },
        ];
        const result = detector.detectSessionType(conversation);
        expect(result).toBe('workflow');
      });

      test('should detect workflow session with backlog management pattern', () => {
        const conversation = [
          { content: '*backlog-review' },
          { content: '*backlog-prioritize' },
        ];
        const result = detector.detectSessionType(conversation);
        expect(result).toBe('workflow');
      });

      test('should handle mixed content in conversation', () => {
        const conversation = [
          { content: 'Regular text without commands' },
          { content: '*help' },
          { content: 'More regular text' },
        ];
        const result = detector.detectSessionType(conversation);
        expect(result).toBe('existing');
      });
    });

    describe('File-based detection (fallback)', () => {
      test('should detect new session when file does not exist', () => {
        const result = detector.detectSessionType(null, testSessionFile);
        expect(result).toBe('new');
      });

      test('should detect existing session from valid file', () => {
        const sessionData = {
          sessionId: 'test-session',
          lastActivity: Date.now(),
          lastCommands: ['help', 'status'],
        };
        fs.writeFileSync(testSessionFile, JSON.stringify(sessionData), 'utf8');

        const result = detector.detectSessionType(null, testSessionFile);
        expect(result).toBe('existing');
      });

      test('should detect workflow session from file with active workflow', () => {
        const sessionData = {
          sessionId: 'test-session',
          lastActivity: Date.now(),
          workflowActive: 'story_development',
          lastCommands: ['validate-story-draft', 'develop'],
        };
        fs.writeFileSync(testSessionFile, JSON.stringify(sessionData), 'utf8');

        const result = detector.detectSessionType(null, testSessionFile);
        expect(result).toBe('workflow');
      });

      test('should detect new session when file is expired (TTL)', () => {
        const sessionData = {
          sessionId: 'test-session',
          lastActivity: Date.now() - (2 * 60 * 60 * 1000), // 2 hours ago
          lastCommands: ['help'],
        };
        fs.writeFileSync(testSessionFile, JSON.stringify(sessionData), 'utf8');

        const result = detector.detectSessionType(null, testSessionFile);
        expect(result).toBe('new');
      });

      test('should handle invalid JSON gracefully', () => {
        fs.writeFileSync(testSessionFile, 'invalid json{', 'utf8');

        const result = detector.detectSessionType(null, testSessionFile);
        expect(result).toBe('new');
      });

      test('should detect new session when file has no commands', () => {
        const sessionData = {
          sessionId: 'test-session',
          lastActivity: Date.now(),
          lastCommands: [],
        };
        fs.writeFileSync(testSessionFile, JSON.stringify(sessionData), 'utf8');

        const result = detector.detectSessionType(null, testSessionFile);
        expect(result).toBe('new');
      });
    });

    describe('Hybrid detection priority', () => {
      test('should prefer conversation over file when both available', () => {
        // Create file indicating workflow
        const sessionData = {
          sessionId: 'test-session',
          lastActivity: Date.now(),
          workflowActive: 'story_development',
          lastCommands: ['validate-story-draft', 'develop'],
        };
        fs.writeFileSync(testSessionFile, JSON.stringify(sessionData), 'utf8');

        // Conversation indicates existing (no workflow)
        const conversation = [
          { content: 'Hello' },
          { content: '*help' },
        ];

        const result = detector.detectSessionType(conversation, testSessionFile);
        expect(result).toBe('existing'); // Should use conversation, not file
      });

      test('should fallback to file when conversation is empty', () => {
        const sessionData = {
          sessionId: 'test-session',
          lastActivity: Date.now(),
          lastCommands: ['help', 'status'],
        };
        fs.writeFileSync(testSessionFile, JSON.stringify(sessionData), 'utf8');

        const result = detector.detectSessionType([], testSessionFile);
        expect(result).toBe('existing');
      });
    });
  });

  describe('_extractCommands', () => {
    test('should extract commands from conversation', () => {
      const conversation = [
        { content: '*help' },
        { content: '*validate-story-draft story.md' },
        { content: 'Some text' },
        { content: '*develop story.md' },
      ];

      const commands = detector._extractCommands(conversation);
      expect(commands).toEqual(['help', 'validate-story-draft', 'develop']);
    });

    test('should limit to last 10 commands', () => {
      const conversation = Array(15).fill(null).map((_, i) => ({
        content: `*command-${i}`,
      }));

      const commands = detector._extractCommands(conversation);
      expect(commands.length).toBe(10);
      expect(commands[0]).toBe('command-5'); // Should start from command-5
    });

    test('should handle messages without commands', () => {
      const conversation = [
        { content: 'Hello' },
        { content: 'How are you?' },
      ];

      const commands = detector._extractCommands(conversation);
      expect(commands).toEqual([]);
    });
  });

  describe('updateSessionState', () => {
    test('should create session state file', () => {
      const state = {
        sessionId: 'test-123',
        lastCommands: ['help', 'status'],
        workflowActive: 'story_development',
      };

      detector.updateSessionState(state, testSessionFile);

      expect(fs.existsSync(testSessionFile)).toBe(true);
      const savedData = JSON.parse(fs.readFileSync(testSessionFile, 'utf8'));
      expect(savedData.sessionId).toBe('test-123');
      expect(savedData.lastCommands).toEqual(['help', 'status']);
      expect(savedData.workflowActive).toBe('story_development');
    });

    test('should generate session ID if not provided', () => {
      const state = {
        lastCommands: ['help'],
      };

      detector.updateSessionState(state, testSessionFile);

      const savedData = JSON.parse(fs.readFileSync(testSessionFile, 'utf8'));
      expect(savedData.sessionId).toMatch(/^session-/);
    });

    test('should create directory if it does not exist', () => {
      const deepPath = path.join(__dirname, 'deep', 'nested', 'session.json');

      detector.updateSessionState({ lastCommands: [] }, deepPath);

      expect(fs.existsSync(deepPath)).toBe(true);

      // Cleanup
      fs.unlinkSync(deepPath);
      fs.rmdirSync(path.dirname(deepPath));
      fs.rmdirSync(path.dirname(path.dirname(deepPath)));
    });
  });

  describe('clearExpiredSession', () => {
    test('should remove expired session file', () => {
      const sessionData = {
        sessionId: 'test-session',
        lastActivity: Date.now() - (2 * 60 * 60 * 1000), // 2 hours ago
        lastCommands: ['help'],
      };
      fs.writeFileSync(testSessionFile, JSON.stringify(sessionData), 'utf8');

      detector.clearExpiredSession(testSessionFile);

      expect(fs.existsSync(testSessionFile)).toBe(false);
    });

    test('should keep valid session file', () => {
      const sessionData = {
        sessionId: 'test-session',
        lastActivity: Date.now(), // Current time
        lastCommands: ['help'],
      };
      fs.writeFileSync(testSessionFile, JSON.stringify(sessionData), 'utf8');

      detector.clearExpiredSession(testSessionFile);

      expect(fs.existsSync(testSessionFile)).toBe(true);
    });

    test('should handle non-existent file gracefully', () => {
      expect(() => {
        detector.clearExpiredSession(testSessionFile);
      }).not.toThrow();
    });
  });
});
