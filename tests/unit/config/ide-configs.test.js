/**
 * Unit tests for IDE Configs Metadata
 *
 * Story 1.4: IDE Selection
 * Tests IDE configuration metadata structure
 *
 * Synkra AIOX v2.1 supports 6 IDEs:
 * - Claude Code, Codex CLI, Gemini CLI, Cursor, GitHub Copilot, AntiGravity
 */

const {
  IDE_CONFIGS,
  getIDEKeys,
  getIDEConfig,
  isValidIDE,
  getIDEChoices,
} = require('../../../packages/installer/src/config/ide-configs');

describe('IDE Configs', () => {
  describe('IDE_CONFIGS', () => {
    it('should have 6 IDE configurations', () => {
      const keys = Object.keys(IDE_CONFIGS);
      expect(keys).toHaveLength(6);
    });

    it('should include all expected IDEs', () => {
      const expectedIDEs = [
        'claude-code',
        'codex',
        'gemini',
        'cursor',
        'github-copilot',
        'antigravity',
      ];

      expectedIDEs.forEach((ide) => {
        expect(IDE_CONFIGS).toHaveProperty(ide);
      });
    });

    it('should have valid structure for each IDE', () => {
      Object.entries(IDE_CONFIGS).forEach(([key, config]) => {
        expect(config).toHaveProperty('name');
        expect(config).toHaveProperty('description');
        expect(config).toHaveProperty('configFile');
        expect(config).toHaveProperty('template');
        expect(config).toHaveProperty('requiresDirectory');
        expect(config).toHaveProperty('format');
        expect(config).toHaveProperty('agentFolder');

        expect(typeof config.name).toBe('string');
        expect(typeof config.description).toBe('string');
        expect(typeof config.configFile).toBe('string');
        expect(typeof config.template).toBe('string');
        expect(typeof config.requiresDirectory).toBe('boolean');
        expect(['text', 'json', 'yaml']).toContain(config.format);
        expect(typeof config.agentFolder).toBe('string');
      });
    });

    it('should have correct directory requirements', () => {
      // IDEs that require directories
      expect(IDE_CONFIGS['claude-code'].requiresDirectory).toBe(true);
      expect(IDE_CONFIGS['github-copilot'].requiresDirectory).toBe(true);
      expect(IDE_CONFIGS.antigravity.requiresDirectory).toBe(true);
      expect(IDE_CONFIGS.cursor.requiresDirectory).toBe(true);

      // IDEs that do not require directories (root file only)
      expect(IDE_CONFIGS.codex.requiresDirectory).toBe(false);
    });

    it('should have correct file formats', () => {
      // All current IDEs use text format
      Object.values(IDE_CONFIGS).forEach((config) => {
        expect(config.format).toBe('text');
      });
    });

    it('should have correct config file paths', () => {
      expect(IDE_CONFIGS['claude-code'].configFile).toContain('.claude');
      expect(IDE_CONFIGS.codex.configFile).toBe('AGENTS.md');
      expect(IDE_CONFIGS.gemini.configFile).toContain('.gemini');
      expect(IDE_CONFIGS.cursor.configFile).toContain('.cursor');
      expect(IDE_CONFIGS['github-copilot'].configFile).toContain('.github');
      expect(IDE_CONFIGS.antigravity.configFile).toContain('.antigravity');
    });

    it('should have template paths in ide-rules folder', () => {
      Object.values(IDE_CONFIGS).forEach((config) => {
        expect(config.template).toMatch(/^ide-rules\//);
      });
    });

    it('should have Claude Code and Codex as recommended', () => {
      expect(IDE_CONFIGS['claude-code'].recommended).toBe(true);
      expect(IDE_CONFIGS.codex.recommended).toBe(true);
    });

    it('should have correct agent folder paths', () => {
      expect(IDE_CONFIGS['claude-code'].agentFolder).toContain('.claude');
      expect(IDE_CONFIGS['claude-code'].agentFolder).toContain('agents');
      expect(IDE_CONFIGS.codex.agentFolder).toContain('.codex');
      expect(IDE_CONFIGS.codex.agentFolder).toContain('agents');
      expect(IDE_CONFIGS.gemini.agentFolder).toContain('.gemini');
      expect(IDE_CONFIGS.gemini.agentFolder).toContain('agents');
      expect(IDE_CONFIGS.cursor.agentFolder).toContain('.cursor');
      expect(IDE_CONFIGS.cursor.agentFolder).toContain('rules');
      expect(IDE_CONFIGS['github-copilot'].agentFolder).toContain('.github');
      expect(IDE_CONFIGS['github-copilot'].agentFolder).toContain('agents');
      // AntiGravity uses .agent/workflows instead of .antigravity/agents
      expect(IDE_CONFIGS.antigravity.agentFolder).toContain('.agent');
      expect(IDE_CONFIGS.antigravity.agentFolder).toContain('workflows');
    });
  });

  describe('getIDEKeys', () => {
    it('should return array of IDE keys', () => {
      const keys = getIDEKeys();

      expect(Array.isArray(keys)).toBe(true);
      expect(keys).toHaveLength(6);
    });

    it('should return all IDE keys', () => {
      const keys = getIDEKeys();
      const expectedKeys = [
        'claude-code',
        'codex',
        'gemini',
        'cursor',
        'github-copilot',
        'antigravity',
      ];

      expectedKeys.forEach((key) => {
        expect(keys).toContain(key);
      });
    });
  });

  describe('getIDEConfig', () => {
    it('should return config for valid IDE', () => {
      const config = getIDEConfig('cursor');

      expect(config).toBeDefined();
      expect(config.name).toBe('Cursor');
    });

    it('should return null for invalid IDE', () => {
      const config = getIDEConfig('invalid-ide');

      expect(config).toBeNull();
    });

    it('should return correct config for all IDEs', () => {
      const ides = ['claude-code', 'codex', 'gemini', 'cursor', 'github-copilot', 'antigravity'];

      ides.forEach((ide) => {
        const config = getIDEConfig(ide);
        expect(config).toBeDefined();
        expect(config).toBe(IDE_CONFIGS[ide]);
      });
    });
  });

  describe('isValidIDE', () => {
    it('should return true for valid IDE', () => {
      expect(isValidIDE('cursor')).toBe(true);
      expect(isValidIDE('gemini')).toBe(true);
      expect(isValidIDE('github-copilot')).toBe(true);
      expect(isValidIDE('claude-code')).toBe(true);
      expect(isValidIDE('codex')).toBe(true);
      expect(isValidIDE('antigravity')).toBe(true);
    });

    it('should return false for invalid IDE', () => {
      expect(isValidIDE('invalid-ide')).toBe(false);
      expect(isValidIDE('')).toBe(false);
      expect(isValidIDE(null)).toBe(false);
      expect(isValidIDE(undefined)).toBe(false);
    });

    it('should return true for all valid IDE keys', () => {
      const keys = getIDEKeys();

      keys.forEach((key) => {
        expect(isValidIDE(key)).toBe(true);
      });
    });
  });

  describe('getIDEChoices', () => {
    it('should return array of choices', () => {
      const choices = getIDEChoices();

      expect(Array.isArray(choices)).toBe(true);
      expect(choices).toHaveLength(6);
    });

    it('should have valid choice structure', () => {
      const choices = getIDEChoices();

      choices.forEach((choice) => {
        expect(choice).toHaveProperty('name');
        expect(choice).toHaveProperty('value');
        expect(typeof choice.name).toBe('string');
        expect(typeof choice.value).toBe('string');
      });
    });

    it('should include IDE name in choice name', () => {
      const choices = getIDEChoices();

      choices.forEach((choice) => {
        const ideKey = choice.value;
        const config = getIDEConfig(ideKey);

        expect(choice.name).toContain(config.name);
      });
    });

    it('should use IDE key as choice value', () => {
      const choices = getIDEChoices();
      const keys = getIDEKeys();

      const choiceValues = choices.map((c) => c.value);

      keys.forEach((key) => {
        expect(choiceValues).toContain(key);
      });
    });

    it('should pre-check recommended IDEs', () => {
      const choices = getIDEChoices();
      const claudeCodeChoice = choices.find((c) => c.value === 'claude-code');
      const codexChoice = choices.find((c) => c.value === 'codex');

      expect(claudeCodeChoice.checked).toBe(true);
      expect(codexChoice.checked).toBe(true);
    });
  });
});
