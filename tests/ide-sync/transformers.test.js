/**
 * Unit tests for IDE transformers
 * @story 6.19 - IDE Command Auto-Sync System
 */

const path = require('path');

const claudeCode = require('../../.aiox-core/infrastructure/scripts/ide-sync/transformers/claude-code');
const cursor = require('../../.aiox-core/infrastructure/scripts/ide-sync/transformers/cursor');
const antigravity = require('../../.aiox-core/infrastructure/scripts/ide-sync/transformers/antigravity');
const {
  generateRedirect,
  generateRedirectContent,
  getRedirectFilenames,
  sanitizeRedirectId,
} = require('../../.aiox-core/infrastructure/scripts/ide-sync/redirect-generator');

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

    it('should generate Claude skill sidecar content', () => {
      const result = claudeCode.transformSkill(sampleAgent);
      expect(result).toContain('name: aiox-dev');
      expect(result).toContain('user-invocable: true');
      expect(result).toContain('activation_type: pipeline');
      expect(result).toContain('ACORE-CLAUDE-AGENT-SKILL: generated');
      expect(result).toContain('Source: .aiox-core/development/agents/dev.md');
      expect(result).toContain('# dev');
    });

    it('should generate Claude legacy command shim content', () => {
      const result = claudeCode.transformCommand(sampleAgent);
      expect(result).toContain('ACORE-CLAUDE-AGENT-COMMAND: legacy-shim');
      expect(result).toContain('Canonical Skill: .claude/skills/AIOX/agents/dev/SKILL.md');
      expect(result).toContain('Source: .aiox-core/development/agents/dev.md');
      expect(result).toContain('Compatibility Activation');
    });

    it('should use parsed sourcePath when generating Claude artifacts', () => {
      const customSource = {
        ...sampleAgent,
        sourcePath: 'custom/agents/dev.md',
      };

      expect(claudeCode.transformCommand(customSource)).toContain('Source: custom/agents/dev.md');
      expect(claudeCode.transformSkill(customSource)).toContain('Source: custom/agents/dev.md');
    });

    it('should return correct Claude skill relative path', () => {
      expect(claudeCode.getSkillRelativePath(sampleAgent)).toBe('AIOX/agents/dev/SKILL.md');
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
      expect(result).toMatch(/^---\ndescription: 'AIOX agent @dev - Full Stack Developer'\nalwaysApply: false\n---/);
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

    it('should return Cursor .mdc filenames', () => {
      expect(cursor.getFilename(sampleAgent)).toBe('dev.mdc');
    });

    it('should escape redirect frontmatter values for Cursor MDC files', () => {
      const result = generateRedirectContent("old'agent\nname", "new'agent", 'condensed-rules');

      expect(result).toContain("description: 'AIOX redirect from @old''agent name to @new''agent'");
      expect(result).toMatch(/^---\ndescription: 'AIOX redirect/m);
    });

    it('should sanitize redirect filenames and keep paths inside target dir', () => {
      const targetDir = path.join(process.cwd(), 'tmp-redirect-target');
      const result = generateRedirect('../escape/agent', 'dev', targetDir, 'condensed-rules');

      expect(sanitizeRedirectId('../escape/agent')).toBe('escape-agent');
      expect(result.filename).toBe('escape-agent.mdc');
      expect(result.path).toBe(path.resolve(targetDir, 'escape-agent.mdc'));
      expect(path.relative(path.resolve(targetDir), result.path)).toBe('escape-agent.mdc');
      expect(getRedirectFilenames({ '../escape/agent': 'dev' }, 'condensed-rules')).toEqual([
        'escape-agent.mdc',
      ]);
    });

    it('should reject redirect ids that cannot produce safe filenames', () => {
      expect(() => generateRedirect('..', 'dev', process.cwd(), 'condensed-rules')).toThrow(
        'Invalid redirect id',
      );
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
      expect(claudeCode.getFilename(sampleAgent)).toBe('dev.md');
      expect(cursor.getFilename(sampleAgent)).toBe('dev.mdc');
      expect(antigravity.getFilename(sampleAgent)).toBe('dev.md');
    });

    it('should have format property', () => {
      for (const transformer of transformers) {
        expect(typeof transformer.format).toBe('string');
      }
    });
  });
});
