'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const {
  syncSkills,
  buildSkillContent,
} = require('../../.aiox-core/infrastructure/scripts/codex-skills-sync/index');

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
});
