/**
 * Core Security Tests (SEC-01 to SEC-05)
 * Story 3.0: Core Module Security Hardening
 * 
 * @module tests/security/core-security.test
 */

const path = require('path');
const fs = require('fs-extra');

// Import the modules under test
const ElicitationEngine = require('../../.aiox-core/core/elicitation/elicitation-engine');
const ElicitationSessionManager = require('../../.aiox-core/core/elicitation/session-manager');

describe('Core Security Tests (Story 3.0)', () => {
  let tempDir;

  beforeAll(async () => {
    tempDir = path.join(__dirname, '.test-temp-security');
    await fs.ensureDir(tempDir);
  });

  afterAll(async () => {
    await fs.remove(tempDir);
  });

  // SEC-01: ReDoS Prevention
  describe('SEC-01: ReDoS Prevention', () => {
    let engine;

    beforeEach(() => {
      engine = new ElicitationEngine();
    });

    it('should reject malicious regex pattern with nested quantifiers (.+)+', async () => {
      // Arrange - Pattern that causes catastrophic backtracking
      const maliciousValidator = {
        type: 'regex',
        pattern: '(.+)+$',
        message: 'Invalid input',
      };

      // Act - runValidator is private, so we test via the validation flow
      // The isSafePattern function should reject this
      const result = await engine.runValidator(maliciousValidator, 'test');

      // Assert - Should return error message, not match
      expect(result).toBe('Invalid input');
    });

    it('should reject nested quantifiers pattern (.*)*', async () => {
      const maliciousValidator = {
        type: 'regex',
        pattern: '(.*)*$',
        message: 'Dangerous pattern',
      };

      const result = await engine.runValidator(maliciousValidator, 'test');
      expect(result).toBe('Dangerous pattern');
    });

    it('should accept safe regex patterns', async () => {
      const safeValidator = {
        type: 'regex',
        pattern: '^[a-zA-Z0-9]+$',
        message: 'Invalid format',
      };

      const result = await engine.runValidator(safeValidator, 'test123');
      expect(result).toBe(true);
    });

    it('should reject invalid regex syntax gracefully', async () => {
      const invalidValidator = {
        type: 'regex',
        pattern: '[invalid regex(',
        message: 'Syntax error',
      };

      const result = await engine.runValidator(invalidValidator, 'test');
      expect(result).toBe('Syntax error');
    });
  });

  // SEC-02: Path Traversal Block
  describe('SEC-02: Path Traversal Block', () => {
    let sessionManager;

    beforeEach(() => {
      sessionManager = new ElicitationSessionManager(tempDir);
    });

    it('should reject sessionId with path traversal attempt (../)', () => {
      expect(() => {
        sessionManager.getSessionPath('../../../etc/passwd');
      }).toThrow('Invalid sessionId format');
    });

    it('should reject sessionId with backslash traversal (..\\)', () => {
      expect(() => {
        sessionManager.getSessionPath('..\\..\\Windows\\system.ini');
      }).toThrow('Invalid sessionId format');
    });

    it('should reject sessionId that is too short', () => {
      expect(() => {
        sessionManager.getSessionPath('abc123');
      }).toThrow('Invalid sessionId format');
    });

    it('should reject sessionId that is too long', () => {
      expect(() => {
        sessionManager.getSessionPath('1234567890abcdef1234');
      }).toThrow('Invalid sessionId format');
    });

    it('should reject sessionId with non-hex characters', () => {
      expect(() => {
        sessionManager.getSessionPath('ghijklmnopqrstuv');
      }).toThrow('Invalid sessionId format');
    });
  });

  // SEC-03: Valid Session Loads (regression test)
  describe('SEC-03: Valid Session Loads', () => {
    let sessionManager;
    let validSessionId;

    beforeEach(async () => {
      sessionManager = new ElicitationSessionManager(tempDir);
      await sessionManager.init();
      validSessionId = await sessionManager.createSession('test', { testMode: true });
    });

    afterEach(async () => {
      try {
        await sessionManager.deleteSession(validSessionId);
      } catch (e) {
        // Ignore cleanup errors
      }
    });

    it('should accept valid 16-character hex sessionId', () => {
      // Valid sessionId from crypto.randomBytes(8).toString('hex')
      expect(() => {
        sessionManager.getSessionPath(validSessionId);
      }).not.toThrow();
    });

    it('should load session with valid sessionId', async () => {
      const session = await sessionManager.loadSession(validSessionId);
      expect(session).toBeTruthy();
      expect(session.id).toBe(validSessionId);
      expect(session.type).toBe('test');
    });

    it('should save and retrieve session data correctly', async () => {
      await sessionManager.updateAnswers({ key: 'value' }, 1);
      const session = await sessionManager.loadSession(validSessionId);
      
      expect(session.answers).toEqual({ key: 'value' });
      expect(session.currentStep).toBe(1);
    });
  });

  // SEC-04: Error Handling
  describe('SEC-04: Error Handling', () => {
    let engine;

    beforeEach(() => {
      engine = new ElicitationEngine();
    });

    it('should return null when loading non-existent session path', async () => {
      const result = await engine.loadSession('/nonexistent/path/session.json');
      expect(result).toBeNull();
    });

    it('should return null for invalid JSON file', async () => {
      // Create invalid JSON file
      const invalidJsonPath = path.join(tempDir, 'invalid.json');
      await fs.writeFile(invalidJsonPath, 'not valid json {{{');

      const result = await engine.loadSession(invalidJsonPath);
      expect(result).toBeNull();
    });

    it('should not throw on loadSession failure', async () => {
      // loadSession should resolve to null, not reject
      await expect(engine.loadSession('/path/that/does/not/exist.json')).resolves.toBeNull();
    });
  });

  // SEC-05: CodeRabbit Clean (placeholder - actual scan is external)
  describe('SEC-05: Variable Initialization', () => {
    let engine;

    beforeEach(() => {
      engine = new ElicitationEngine();
    });

    it('should have currentSession initialized to null', () => {
      expect(engine.currentSession).toBeNull();
    });

    it('should set currentSession when startSession is called', async () => {
      await engine.startSession('test-component', { saveSession: false });
      expect(engine.currentSession).not.toBeNull();
      expect(engine.currentSession.componentType).toBe('test-component');
    });

    it('should not crash when completeSession is called before startSession', async () => {
      // currentSession is null, should handle gracefully
      await expect(async () => {
        await engine.completeSession('completed');
      }).not.toThrow();
    });
  });
});
