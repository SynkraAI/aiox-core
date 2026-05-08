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
const fs = require('fs-extra');
const os = require('os');
const kimi = require(path.resolve(
  __dirname,
  '..',
  '..',
  '.aiox-core',
  'infrastructure',
  'scripts',
  'ide-sync',
  'transformers',
  'kimi',
));
const { syncIde } = require('../../.aiox-core/infrastructure/scripts/ide-sync/index');

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
      'aios-agent',
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
    expect(out).toContain('```text\n💻 Dex (Builder) ready');
  });

  test('supports object-shaped command catalogs', () => {
    const out = kimi.transform(buildAgentData({
      commands: {
        'create-schema': 'Design database schema',
        'check-health': 'Check health',
      },
    }));
    expect(out).toContain('| `*create-schema` | Design database schema | full, quick |');
    expect(out).toContain('| `*check-health` | Check health | full, quick |');
    expect(out).not.toContain('*undefined');
  });

  test('supports legacy single-key command entries', () => {
    const out = kimi.transform(buildAgentData({
      commands: [
        { 'create-schema': 'Design database schema' },
        { 'create-rls-policies': 'Design RLS policies' },
      ],
    }));
    expect(out).toContain('| `*create-schema` | Design database schema | full |');
    expect(out).toContain('| `*create-rls-policies` | Design RLS policies | full |');
    expect(out).not.toContain('*undefined');
  });

  test('normalizes raw markdown for Kimi lint compatibility', () => {
    const out = kimi.transform(buildAgentData({
      raw: [
        '```',
        'plain greeting',
        '```',
        '- Existing code span stays intact: `@pm *create-epic`',
        "- Glob pattern stays intact: '**/*-repository.js'",
        '- **Epic/PRD/spec work** -> @pm (*create-epic, *create-prd)',
      ].join('\n'),
    }));
    expect(out).toContain('```text\nplain greeting');
    expect(out).toContain('plain greeting\n```');
    expect(out).not.toContain('plain greeting\n```text');
    expect(out).toContain('`@pm *create-epic`');
    expect(out).toContain("'**/*-repository.js'");
    expect(out).toContain('(`*create-epic`, `*create-prd`)');
  });

  test('produces nested layout: <skill-id>/SKILL.md', () => {
    const data = buildAgentData({ id: 'dev' });
    expect(kimi.getFilename(data)).toBe('SKILL.md');
    expect(kimi.getDirname(data)).toBe('aios-dev');
    expect(kimi.format).toBe('kimi-skill');
  });

  test('sync refuses Kimi output paths outside target directory', async () => {
    const tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'kimi-path-guard-'));
    const originalGetDirname = kimi.getDirname;

    try {
      kimi.getDirname = () => '../outside';
      const result = syncIde(
        [buildAgentData()],
        { enabled: true, path: '.kimi/skills', format: 'kimi-skill' },
        'kimi',
        tmpRoot,
        { dryRun: false },
      );

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].error).toMatch(/Unsafe Kimi output path/);
      expect(fs.existsSync(path.join(tmpRoot, 'outside', 'SKILL.md'))).toBe(false);
    } finally {
      kimi.getDirname = originalGetDirname;
      await fs.remove(tmpRoot);
    }
  });
});
