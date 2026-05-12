/**
 * Unit tests for IDE transformers
 * @story 6.19 - IDE Command Auto-Sync System
 */

const claudeCode = require('../../.aiox-core/infrastructure/scripts/ide-sync/transformers/claude-code');
const cursor = require('../../.aiox-core/infrastructure/scripts/ide-sync/transformers/cursor');
const antigravity = require('../../.aiox-core/infrastructure/scripts/ide-sync/transformers/antigravity');

describe('IDE Transformers', () => {
  // Sample agent data for testing
  const sampleAgent = {
    path: '/path/to/dev.md',
    filename: 'dev.md',
    id: 'dev',
    raw: '# dev\n\n```yaml\nagent:\n  name: Dex\n  id: dev\n```\n\nContent',
    yaml: {
      agent: {
        name: 'Dex',
        id: 'dev',
        title: 'Full Stack Developer',
        icon: '💻',
        whenToUse: 'Use for code implementation',
      },
      persona_profile: {
        archetype: 'Builder',
      },
      commands: [
        { name: 'help', visibility: ['full', 'quick', 'key'], description: 'Show help' },
        { name: 'develop', visibility: ['full', 'quick'], description: 'Develop story' },
        { name: 'debug', visibility: ['full'], description: 'Debug mode' },
        { name: 'exit', visibility: ['full', 'quick', 'key'], description: 'Exit agent' },
      ],
      dependencies: {
        tasks: ['task1.md', 'task2.md'],
        tools: ['git', 'context7'],
      },
    },
    agent: {
      name: 'Dex',
      id: 'dev',
      title: 'Full Stack Developer',
      icon: '💻',
      whenToUse: 'Use for code implementation',
    },
    persona_profile: {
      archetype: 'Builder',
    },
    commands: [
      { name: 'help', visibility: ['full', 'quick', 'key'], description: 'Show help' },
      { name: 'develop', visibility: ['full', 'quick'], description: 'Develop story' },
      { name: 'debug', visibility: ['full'], description: 'Debug mode' },
      { name: 'exit', visibility: ['full', 'quick', 'key'], description: 'Exit agent' },
    ],
    dependencies: {
      tasks: ['task1.md', 'task2.md'],
      tools: ['git', 'context7'],
    },
    sections: {
      quickCommands: '- `*help` - Show help',
      collaboration: 'Works with @qa and @sm',
      guide: 'Developer guide content',
    },
    error: null,
  };

  describe('claude-code transformer', () => {
    it('should return raw content (identity transform)', () => {
      const result = claudeCode.transform(sampleAgent);
      expect(result).toContain('# dev');
      expect(result).toContain('```yaml');
    });

    it('should add sync footer if not present', () => {
      const result = claudeCode.transform(sampleAgent);
      expect(result).toContain('Synced from .aiox-core/development/agents/dev.md');
    });

    it('should not duplicate sync footer', () => {
      const agentWithFooter = {
        ...sampleAgent,
        raw:
          sampleAgent.raw +
          '\n---\n*AIOX Agent - Synced from .aiox-core/development/agents/dev.md*',
      };
      const result = claudeCode.transform(agentWithFooter);
      const footerCount = (result.match(/Synced from/g) || []).length;
      expect(footerCount).toBe(1);
    });

    it('should return correct filename', () => {
      expect(claudeCode.getFilename(sampleAgent)).toBe('dev.md');
    });

    it('should have correct format identifier', () => {
      expect(claudeCode.format).toBe('full-markdown-yaml');
    });

    it('should handle agent without raw content', () => {
      const noRaw = { ...sampleAgent, raw: null };
      const result = claudeCode.transform(noRaw);
      expect(result).toContain('Dex');
      expect(result).toContain('Full Stack Developer');
    });
  });

  describe('cursor transformer', () => {
    it('should generate condensed format', () => {
      const result = cursor.transform(sampleAgent);
      expect(result).toContain('# Dex (@dev)');
      expect(result).toContain('💻 **Full Stack Developer**');
      expect(result).toContain('Builder');
    });

    it('should include whenToUse', () => {
      const result = cursor.transform(sampleAgent);
      expect(result).toContain('Use for code implementation');
    });

    it('should include Quick Commands section', () => {
      const result = cursor.transform(sampleAgent);
      expect(result).toContain('## Quick Commands');
      expect(result).toContain('*help');
      expect(result).toContain('*develop');
    });

    it('should include collaboration section', () => {
      const result = cursor.transform(sampleAgent);
      expect(result).toContain('## Collaboration');
      expect(result).toContain('@qa');
    });

    it('should add sync footer', () => {
      const result = cursor.transform(sampleAgent);
      expect(result).toContain('Synced from');
    });

    it('should have correct format identifier', () => {
      expect(cursor.format).toBe('condensed-rules');
    });
  });

  describe('antigravity transformer', () => {
    it('should generate cursor-style format', () => {
      const result = antigravity.transform(sampleAgent);
      expect(result).toContain('# Dex (@dev)');
      expect(result).toContain('💻 **Full Stack Developer**');
    });

    it('should include Quick Commands', () => {
      const result = antigravity.transform(sampleAgent);
      expect(result).toContain('## Quick Commands');
    });

    it('should include All Commands if more than quick+key', () => {
      const result = antigravity.transform(sampleAgent);
      expect(result).toContain('## All Commands');
      expect(result).toContain('*debug');
    });

    it('should have correct format identifier', () => {
      expect(antigravity.format).toBe('cursor-style');
    });
  });

  describe('all transformers', () => {
    const transformers = [claudeCode, cursor, antigravity];

    it('should handle agent with minimal data', () => {
      const minimal = {
        filename: 'minimal.md',
        id: 'minimal',
        agent: null,
        persona_profile: null,
        commands: [],
        dependencies: null,
        sections: {},
        error: null,
      };

      for (const transformer of transformers) {
        expect(() => transformer.transform(minimal)).not.toThrow();
        const result = transformer.transform(minimal);
        expect(typeof result).toBe('string');
        expect(result.length).toBeGreaterThan(0);
      }
    });

    it('should return valid filename for all', () => {
      for (const transformer of transformers) {
        const filename = transformer.getFilename(sampleAgent);
        expect(filename).toBe('dev.md');
      }
    });

    it('should have format property', () => {
      for (const transformer of transformers) {
        expect(typeof transformer.format).toBe('string');
      }
    });
  });
});
