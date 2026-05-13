'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const {
  syncSkills,
  buildSkillContent,
  getSkillId,
  getLegacySkillId,
} = require(path.join(
  process.cwd(),
  '.aiox-core/infrastructure/scripts/codex-skills-sync/index',
));
const {
  validateCodexSkills,
} = require(path.join(
  process.cwd(),
  '.aiox-core/infrastructure/scripts/codex-skills-sync/validate',
));

describe('Codex Skills Sync', () => {
  let tmpRoot;
  let expectedAgentCount;

  beforeEach(() => {
    tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'aiox-codex-skills-'));
    expectedAgentCount = fs.readdirSync(path.join(process.cwd(), '.aiox-core', 'development', 'agents'))
      .filter(name => name.endsWith('.md')).length;
  });

  afterEach(() => {
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  });

  it('generates one SKILL.md per AIOX agent in local .codex/skills', () => {
    const localSkillsDir = path.join(tmpRoot, '.codex', 'skills');
    const result = syncSkills({
      sourceDir: path.join(process.cwd(), '.aiox-core', 'development', 'agents'),
      localSkillsDir,
      dryRun: false,
    });

    expect(result.generated).toBe(expectedAgentCount);
    const expected = path.join(localSkillsDir, 'aiox-architect', 'SKILL.md');
    expect(fs.existsSync(expected)).toBe(true);

    const content = fs.readFileSync(expected, 'utf8');
    expect(content).toContain('name: aiox-architect');
    expect(content).toContain('Activation Protocol');
    expect(content).toContain('.aiox-core/development/agents/architect.md');
    expect(content).toContain('generate-greeting.js architect');
  });

  it('supports global installation path when --global mode is enabled', () => {
    const localSkillsDir = path.join(tmpRoot, '.codex', 'skills');
    const globalSkillsDir = path.join(tmpRoot, '.codex-home', 'skills');

    const result = syncSkills({
      sourceDir: path.join(process.cwd(), '.aiox-core', 'development', 'agents'),
      localSkillsDir,
      globalSkillsDir,
      global: true,
      dryRun: false,
    });

    expect(result.generated).toBe(expectedAgentCount);
    expect(result.globalSkillsDir).toBe(globalSkillsDir);
    expect(fs.existsSync(path.join(globalSkillsDir, 'aiox-dev', 'SKILL.md'))).toBe(true);
  });

  it('treats globalOnly as global output and skips local writes', () => {
    const localSkillsDir = path.join(tmpRoot, '.codex', 'skills');
    const globalSkillsDir = path.join(tmpRoot, '.codex-home', 'skills');

    const result = syncSkills({
      sourceDir: path.join(process.cwd(), '.aiox-core', 'development', 'agents'),
      localSkillsDir,
      globalSkillsDir,
      globalOnly: true,
      dryRun: false,
    });

    expect(result.generated).toBe(expectedAgentCount);
    expect(result.globalSkillsDir).toBe(globalSkillsDir);
    expect(fs.existsSync(path.join(localSkillsDir, 'aiox-dev', 'SKILL.md'))).toBe(false);
    expect(fs.existsSync(path.join(globalSkillsDir, 'aiox-dev', 'SKILL.md'))).toBe(true);
  });

  it('buildSkillContent emits valid frontmatter and starter commands', () => {
    const sample = {
      id: 'dev',
      filename: 'dev.md',
      agent: { name: 'Dex', title: 'Developer', whenToUse: 'Build features safely.' },
      commands: [{ name: 'help', description: 'Show commands', visibility: ['quick', 'key', 'full'] }],
    };
    const content = buildSkillContent(sample);
    expect(content.startsWith('---')).toBe(true);
    expect(content).toContain('name: aiox-dev');
    expect(content).toContain('`*help` - Show commands');
  });

  it('derives legacy aliases for migrated core agents', () => {
    expect(getSkillId('aios-dev')).toBe('aiox-dev');
    expect(getLegacySkillId('dev')).toBe('aios-dev');
    expect(getLegacySkillId('aiox-master')).toBe('aios-master');
    expect(getLegacySkillId('aios-master')).toBe('aios-master');
  });

  it('strict validation rejects legacy aliases that duplicate full skill payloads', () => {
    const localSkillsDir = path.join(tmpRoot, '.codex', 'skills');
    syncSkills({
      sourceDir: path.join(process.cwd(), '.aiox-core', 'development', 'agents'),
      localSkillsDir,
      dryRun: false,
    });

    const canonicalDir = path.join(localSkillsDir, 'aiox-dev');
    const legacyDir = path.join(localSkillsDir, 'aios-dev');
    fs.mkdirSync(legacyDir, { recursive: true });
    fs.copyFileSync(path.join(canonicalDir, 'SKILL.md'), path.join(legacyDir, 'SKILL.md'));

    const result = validateCodexSkills({
      sourceDir: path.join(process.cwd(), '.aiox-core', 'development', 'agents'),
      skillsDir: localSkillsDir,
      strict: true,
    });

    expect(result.ok).toBe(false);
    expect(result.legacy).toContain('aios-dev');
    expect(result.legacyAliases).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          dir: 'aios-dev',
          canonicalSkillId: 'aiox-dev',
          classification: 'duplicate-full-payload',
          fatal: true,
        }),
      ]),
    );
    expect(result.errors.join('\n')).toContain('Legacy skill alias duplicates full activation payload');
  });

  it('strict validation reports intentional legacy aliases without treating them as duplicate payloads', () => {
    const localSkillsDir = path.join(tmpRoot, '.codex', 'skills');
    syncSkills({
      sourceDir: path.join(process.cwd(), '.aiox-core', 'development', 'agents'),
      localSkillsDir,
      dryRun: false,
    });

    const legacyDir = path.join(localSkillsDir, 'aios-dev');
    fs.mkdirSync(legacyDir, { recursive: true });
    fs.writeFileSync(
      path.join(legacyDir, 'SKILL.md'),
      [
        '<!-- AIOX-CODEX-LEGACY-ALIAS: redirect -->',
        '# aios-dev',
        '',
        'This legacy alias redirects to canonical skill `aiox-dev`.',
        '',
      ].join('\n'),
      'utf8',
    );

    const result = validateCodexSkills({
      sourceDir: path.join(process.cwd(), '.aiox-core', 'development', 'agents'),
      skillsDir: localSkillsDir,
      strict: true,
    });

    expect(result.ok).toBe(true);
    expect(result.legacy).toContain('aios-dev');
    expect(result.legacyAliases).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          dir: 'aios-dev',
          canonicalSkillId: 'aiox-dev',
          classification: 'intentional-redirect',
          fatal: false,
        }),
      ]),
    );
    expect(result.warnings.join('\n')).toContain('Intentional legacy skill alias directory');
  });

  it('strict validation rejects legacy aliases that include extra non-redirect content', () => {
    const localSkillsDir = path.join(tmpRoot, '.codex', 'skills');
    syncSkills({
      sourceDir: path.join(process.cwd(), '.aiox-core', 'development', 'agents'),
      localSkillsDir,
      dryRun: false,
    });

    const legacyDir = path.join(localSkillsDir, 'aios-dev');
    fs.mkdirSync(legacyDir, { recursive: true });
    fs.writeFileSync(
      path.join(legacyDir, 'SKILL.md'),
      [
        '<!-- AIOX-CODEX-LEGACY-ALIAS: redirect -->',
        '# aios-dev',
        '',
        'This legacy alias redirects to canonical skill `aiox-dev`.',
        '',
        'When activated, load the developer persona and command list from this file.',
        '',
      ].join('\n'),
      'utf8',
    );

    const result = validateCodexSkills({
      sourceDir: path.join(process.cwd(), '.aiox-core', 'development', 'agents'),
      skillsDir: localSkillsDir,
      strict: true,
    });

    expect(result.ok).toBe(false);
    expect(result.legacyAliases).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          dir: 'aios-dev',
          canonicalSkillId: 'aiox-dev',
          classification: 'non-thin-legacy-alias',
          fatal: true,
        }),
      ]),
    );
    expect(result.errors.join('\n')).toContain('Legacy skill alias is not a thin redirect');
    expect(result.errors.join('\n')).toContain('contains non-redirect content');
  });

  it('strict validation rejects orphaned canonical dirs that duplicate full skill payloads', () => {
    const localSkillsDir = path.join(tmpRoot, '.codex', 'skills');
    syncSkills({
      sourceDir: path.join(process.cwd(), '.aiox-core', 'development', 'agents'),
      localSkillsDir,
      dryRun: false,
    });

    const duplicateDir = path.join(localSkillsDir, 'aiox-dev-copy');
    fs.mkdirSync(duplicateDir, { recursive: true });
    fs.copyFileSync(path.join(localSkillsDir, 'aiox-dev', 'SKILL.md'), path.join(duplicateDir, 'SKILL.md'));

    const result = validateCodexSkills({
      sourceDir: path.join(process.cwd(), '.aiox-core', 'development', 'agents'),
      skillsDir: localSkillsDir,
      strict: true,
    });

    expect(result.ok).toBe(false);
    expect(result.duplicatePayloads).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          dir: 'aiox-dev-copy',
          canonicalSkillId: 'aiox-dev',
          canonicalAgentPath: '.aiox-core/development/agents/dev.md',
        }),
      ]),
    );
    expect(result.errors.join('\n')).toContain('Duplicate full skill payload');
  });
});
