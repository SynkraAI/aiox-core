/**
 * Tests for the Kimi transformer (kimi-skill format).
 * Covers:
 *  - skillId normalization (no double aios- prefix)
 *  - preferredActivationAlias support
 *  - YAML object items in array fields render as **KEY:** value (not [object Object])
 *  - Activation Protocol directive is present
 *  - getDirname / getFilename for nested layout
 */

const path = require('path');
const kimi = require(path.resolve(
  __dirname,
  '..',
  '..',
  '.aiox-core',
  'infrastructure',
  'scripts',
  'ide-sync',
  'transformers',
  'kimi'
));

function buildAgentData(overrides = {}) {
  return {
    id: overrides.id || 'dev',
    agent: {
      name: 'Dex',
      title: 'Full Stack Developer',
      icon: '💻',
      whenToUse: 'Use for code implementation and refactoring',
      ...overrides.agent,
    },
    persona_profile: {
      archetype: 'Builder',
      communication: {
        greeting_levels: { named: '💻 Dex (Builder) ready' },
        tone: 'pragmatic',
      },
      ...overrides.persona_profile,
    },
    yaml: overrides.yaml || {},
    commands: overrides.commands || [
      { name: 'help', description: 'Show all commands', visibility: ['full'] },
    ],
    raw: overrides.raw || '',
  };
}

describe('kimi transformer', () => {
  test('normalizes skill id without double aios- prefix', () => {
    expect(kimi.getSkillId({ id: 'dev', agent: {} })).toBe('aios-dev');
    expect(kimi.getSkillId({ id: 'aios-master', agent: {} })).toBe('aios-master');
  });

  test('respects preferredActivationAlias', () => {
    const skillId = kimi.getSkillId({
      id: 'davi-ribas-community-growth-strategist',
      agent: { preferredActivationAlias: 'davi-ribas' },
    });
    expect(skillId).toBe('aios-davi-ribas');
  });

  test('respects preferred_activation_alias', () => {
    const skillId = kimi.getSkillId({
      id: 'davi-ribas-community-growth-strategist',
      agent: { preferred_activation_alias: 'davi-ribas' },
    });
    expect(skillId).toBe('aios-davi-ribas');
  });

  test('sanitizes skill ids used as directories', () => {
    const skillId = kimi.getSkillId({
      id: 'dev',
      agent: { preferredActivationAlias: '../team\\Danger Agent' },
    });
    expect(skillId).toBe('aios-team-danger-agent');
    expect(kimi.getDirname({ id: '..', agent: { preferredActivationAlias: '../../' } })).toBe(
      'aios-agent'
    );
  });

  test('renders YAML object items in arrays without [object Object]', () => {
    const data = buildAgentData({
      yaml: {
        core_principles: [
          { CRITICAL: 'Story has ALL info you need.' },
          'Numbered Options - Always use numbered lists',
        ],
      },
    });
    const out = kimi.transform(data);
    expect(out).not.toMatch(/\[object Object\]/);
    expect(out).toMatch(/\*\*CRITICAL:\*\* Story has ALL info you need\./);
    expect(out).toMatch(/Numbered Options - Always use numbered lists/);
  });

  test('ignores null design_rules without throwing', () => {
    const data = buildAgentData({
      yaml: {
        design_rules: {
          compact: { rule: 'Keep it tight.' },
          empty: null,
        },
      },
    });
    expect(() => kimi.transform(data)).not.toThrow();
    expect(kimi.transform(data)).toContain('Keep it tight.');
  });

  test('emits Activation Protocol directive', () => {
    const out = kimi.transform(buildAgentData());
    expect(out).toMatch(/## Activation Protocol/);
    expect(out).toMatch(/Adopt the persona below immediately/);
    expect(out).toMatch(/EXACTLY as they appear in the Star Commands table/);
  });

  test('produces nested layout: <skill-id>/SKILL.md', () => {
    const data = buildAgentData({ id: 'dev' });
    expect(kimi.getFilename(data)).toBe('SKILL.md');
    expect(kimi.getDirname(data)).toBe('aios-dev');
    expect(kimi.format).toBe('kimi-skill');
  });
});
