/**
 * Unified Hook Interface Tests
 * Story GEMINI-INT.8
 */

const {
  UnifiedHook,
  EVENT_MAPPING,
  createContext,
  formatResult,
} = require('../../../.aios-core/hooks/unified/hook-interface');

describe('Unified Hook Interface', () => {
  describe('EVENT_MAPPING', () => {
    it('should map sessionStart for gemini', () => {
      expect(EVENT_MAPPING.sessionStart.gemini).toBe('SessionStart');
    });

    it('should have null claude mapping for sessionStart', () => {
      expect(EVENT_MAPPING.sessionStart.claude).toBeNull();
    });

    it('should map beforeAgent for both CLIs', () => {
      expect(EVENT_MAPPING.beforeAgent.gemini).toBe('BeforeAgent');
      expect(EVENT_MAPPING.beforeAgent.claude).toBe('PreToolUse');
    });

    it('should map beforeTool for both CLIs', () => {
      expect(EVENT_MAPPING.beforeTool.gemini).toBe('BeforeTool');
      expect(EVENT_MAPPING.beforeTool.claude).toBe('PreToolUse');
    });

    it('should map afterTool for both CLIs', () => {
      expect(EVENT_MAPPING.afterTool.gemini).toBe('AfterTool');
      expect(EVENT_MAPPING.afterTool.claude).toBe('PostToolUse');
    });

    it('should map sessionEnd for both CLIs', () => {
      expect(EVENT_MAPPING.sessionEnd.gemini).toBe('SessionEnd');
      expect(EVENT_MAPPING.sessionEnd.claude).toBe('Stop');
    });

    it('should have all required lifecycle events', () => {
      const events = Object.keys(EVENT_MAPPING);
      expect(events).toContain('sessionStart');
      expect(events).toContain('beforeAgent');
      expect(events).toContain('beforeTool');
      expect(events).toContain('afterTool');
      expect(events).toContain('sessionEnd');
    });
  });

  describe('UnifiedHook', () => {
    it('should create hook with required fields', () => {
      const hook = new UnifiedHook({
        name: 'test-hook',
        event: 'beforeTool',
      });

      expect(hook.name).toBe('test-hook');
      expect(hook.event).toBe('beforeTool');
    });

    it('should have default matcher of *', () => {
      const hook = new UnifiedHook({
        name: 'test-hook',
        event: 'beforeTool',
      });

      expect(hook.matcher).toBe('*');
    });

    it('should accept custom matcher', () => {
      const hook = new UnifiedHook({
        name: 'test-hook',
        event: 'beforeTool',
        matcher: 'write_file|shell',
      });

      expect(hook.matcher).toBe('write_file|shell');
    });

    it('should have default timeout of 5000ms', () => {
      const hook = new UnifiedHook({
        name: 'test-hook',
        event: 'beforeTool',
      });

      expect(hook.timeout).toBe(5000);
    });

    it('should accept custom timeout', () => {
      const hook = new UnifiedHook({
        name: 'test-hook',
        event: 'beforeTool',
        timeout: 10000,
      });

      expect(hook.timeout).toBe(10000);
    });

    it('should throw on execute (base class)', async () => {
      const hook = new UnifiedHook({
        name: 'test-hook',
        event: 'beforeTool',
      });

      await expect(hook.execute({})).rejects.toThrow('execute() must be implemented by subclass');
    });

    it('should generate gemini config', () => {
      const hook = new UnifiedHook({
        name: 'test-hook',
        event: 'beforeTool',
        matcher: 'shell',
      });

      const config = hook.toGeminiConfig();

      expect(config).toHaveProperty('matcher', 'shell');
      expect(config.hooks).toHaveLength(1);
      expect(config.hooks[0].name).toBe('test-hook');
      expect(config.hooks[0].type).toBe('command');
    });

    it('should generate claude config', () => {
      const hook = new UnifiedHook({
        name: 'test-hook',
        event: 'beforeTool',
        matcher: 'Bash',
      });

      const config = hook.toClaudeConfig();

      expect(config).toHaveProperty('event', 'PreToolUse');
      expect(config).toHaveProperty('matcher', 'Bash');
    });

    it('should return null for unsupported claude event', () => {
      const hook = new UnifiedHook({
        name: 'test-hook',
        event: 'sessionStart', // No claude equivalent
      });

      const config = hook.toClaudeConfig();

      expect(config).toBeNull();
    });
  });

  describe('createContext', () => {
    it('should create gemini context', () => {
      const context = createContext('gemini');

      expect(context).toHaveProperty('projectDir');
      expect(context).toHaveProperty('sessionId');
      expect(context.provider).toBe('gemini');
    });

    it('should create claude context', () => {
      const context = createContext('claude');

      expect(context).toHaveProperty('projectDir');
      expect(context).toHaveProperty('sessionId');
      expect(context.provider).toBe('claude');
    });

    it('should use environment variables for gemini', () => {
      const originalDir = process.env.GEMINI_PROJECT_DIR;
      process.env.GEMINI_PROJECT_DIR = '/test/gemini/dir';

      const context = createContext('gemini');

      expect(context.projectDir).toBe('/test/gemini/dir');

      // Restore
      if (originalDir) {
        process.env.GEMINI_PROJECT_DIR = originalDir;
      } else {
        delete process.env.GEMINI_PROJECT_DIR;
      }
    });
  });

  describe('formatResult', () => {
    it('should format result for gemini', () => {
      const result = {
        status: 'allow',
        message: 'OK',
        contextInjection: { key: 'value' },
      };

      const formatted = formatResult(result, 'gemini');
      const parsed = JSON.parse(formatted);

      expect(parsed.status).toBe('success');
      expect(parsed.message).toBe('OK');
      expect(parsed.contextInjection).toEqual({ key: 'value' });
    });

    it('should format block result for gemini', () => {
      const result = {
        status: 'block',
        message: 'Blocked',
      };

      const formatted = formatResult(result, 'gemini');
      const parsed = JSON.parse(formatted);

      expect(parsed.status).toBe('block');
    });

    it('should format result for claude', () => {
      const result = {
        status: 'allow',
        message: 'OK',
        contextInjection: { key: 'value' },
      };

      const formatted = formatResult(result, 'claude');
      const parsed = JSON.parse(formatted);

      expect(parsed.continue).toBe(true);
      expect(parsed.message).toBe('OK');
      expect(parsed.context).toEqual({ key: 'value' });
    });

    it('should format block result for claude', () => {
      const result = {
        status: 'block',
        message: 'Blocked',
      };

      const formatted = formatResult(result, 'claude');
      const parsed = JSON.parse(formatted);

      expect(parsed.continue).toBe(false);
    });
  });
});
