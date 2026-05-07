'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const { syncSkills } = require(path.join(
  process.cwd(),
  '.aiox-core/infrastructure/scripts/codex-skills-sync/index',
));
const {
  validateCodexSkills,
  normalizeSkillToolTarget,
} = require(path.join(
  process.cwd(),
  '.aiox-core/infrastructure/scripts/codex-skills-sync/validate',
));

describe('Codex Skills Validator', () => {
  let tmpRoot;
  let sourceDir;
  let skillsDir;
  let expectedAgentCount;

  beforeEach(() => {
    tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'aiox-codex-validate-'));
    sourceDir = path.join(process.cwd(), '.aiox-core', 'development', 'agents');
    skillsDir = path.join(tmpRoot, '.codex', 'skills');
    expectedAgentCount = fs.readdirSync(sourceDir).filter(name => name.endsWith('.md')).length;
  });

  afterEach(() => {
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  });

  it('passes when all generated skills are present and valid', () => {
    syncSkills({ sourceDir, localSkillsDir: skillsDir, dryRun: false });

    const result = validateCodexSkills({
      projectRoot: tmpRoot,
      sourceDir,
      skillsDir,
      strict: true,
    });

    expect(result.ok).toBe(true);
    expect(result.checked).toBe(expectedAgentCount);
    expect(result.errors).toEqual([]);
  });

  it('self-tests generated skills with simulated Skill tool payloads', () => {
    syncSkills({ sourceDir, localSkillsDir: skillsDir, dryRun: false });

    const result = validateCodexSkills({
      projectRoot: process.cwd(),
      sourceDir,
      skillsDir,
      strict: true,
      selfTest: true,
    });

    expect(result.ok).toBe(true);
    expect(result.selfTests).toHaveLength(expectedAgentCount);
    expect(result.selfTests.every(test => test.ok)).toBe(true);
  });

  it('fails self-test when a skill source path cannot be resolved', () => {
    syncSkills({ sourceDir, localSkillsDir: skillsDir, dryRun: false });
    const target = path.join(skillsDir, 'aiox-dev', 'SKILL.md');
    const original = fs.readFileSync(target, 'utf8');
    fs.writeFileSync(
      target,
      original.replace('.aiox-core/development/agents/dev.md', '.aiox-core/development/agents/missing-dev.md'),
      'utf8',
    );

    const result = validateCodexSkills({
      projectRoot: process.cwd(),
      sourceDir,
      skillsDir,
      strict: true,
      selfTest: true,
    });

    expect(result.ok).toBe(false);
    const devSelfTest = result.selfTests.find(test => test.skillId === 'aiox-dev');
    expect(devSelfTest).toBeDefined();
    expect(devSelfTest.ok).toBe(false);
    expect(result.errors.some(error => error.includes('self-test source file not found'))).toBe(true);
  });

  it('normalizes Skill tool invocation targets', () => {
    expect(normalizeSkillToolTarget({
      type: 'tool_use',
      name: 'Skill',
      input: {
        skill: 'aiox-dev',
        prompt: 'self-test',
      },
    })).toBe('aiox-dev');
    expect(normalizeSkillToolTarget('$aiox-qa')).toBe('aiox-qa');
  });

  it('fails when a generated skill is missing', () => {
    syncSkills({ sourceDir, localSkillsDir: skillsDir, dryRun: false });
    fs.rmSync(path.join(skillsDir, 'aiox-architect', 'SKILL.md'), { force: true });

    const result = validateCodexSkills({
      projectRoot: tmpRoot,
      sourceDir,
      skillsDir,
      strict: true,
    });

    expect(result.ok).toBe(false);
    expect(result.errors.some(error => error.includes('Missing skill file'))).toBe(true);
  });

  it('fails when greeting command is removed from a skill', () => {
    syncSkills({ sourceDir, localSkillsDir: skillsDir, dryRun: false });
    const target = path.join(skillsDir, 'aiox-dev', 'SKILL.md');
    const original = fs.readFileSync(target, 'utf8');
    fs.writeFileSync(target, original.replace('generate-greeting.js dev', 'generate-greeting.js'), 'utf8');

    const result = validateCodexSkills({
      projectRoot: tmpRoot,
      sourceDir,
      skillsDir,
      strict: true,
    });

    expect(result.ok).toBe(false);
    expect(result.errors.some(error => error.includes('missing canonical greeting command'))).toBe(true);
  });

  it('fails in strict mode when orphaned aiox-* skill dir exists', () => {
    syncSkills({ sourceDir, localSkillsDir: skillsDir, dryRun: false });
    const orphanPath = path.join(skillsDir, 'aiox-legacy');
    fs.mkdirSync(orphanPath, { recursive: true });
    fs.writeFileSync(path.join(orphanPath, 'SKILL.md'), '# legacy', 'utf8');

    const result = validateCodexSkills({
      projectRoot: tmpRoot,
      sourceDir,
      skillsDir,
      strict: true,
    });

    expect(result.ok).toBe(false);
    expect(result.orphaned).toContain('aiox-legacy');
  });

  it('fails in strict mode when a legacy aios-* alias dir exists for a core agent', () => {
    syncSkills({ sourceDir, localSkillsDir: skillsDir, dryRun: false });
    const legacyPath = path.join(skillsDir, 'aios-dev');
    fs.mkdirSync(legacyPath, { recursive: true });
    fs.writeFileSync(path.join(legacyPath, 'SKILL.md'), '# legacy', 'utf8');

    const result = validateCodexSkills({
      projectRoot: tmpRoot,
      sourceDir,
      skillsDir,
      strict: true,
    });

    expect(result.ok).toBe(false);
    expect(result.legacy).toContain('aios-dev');
    expect(result.errors.some(error => error.includes('Legacy skill alias directory'))).toBe(true);
  });

  it('ignores generated squad chief skills that point to an existing squad source', () => {
    syncSkills({ sourceDir, localSkillsDir: skillsDir, dryRun: false });
    const sourcePath = path.join(tmpRoot, 'squads', 'demo-squad', 'agents', 'demo-chief.md');
    fs.mkdirSync(path.dirname(sourcePath), { recursive: true });
    fs.writeFileSync(sourcePath, '# demo chief', 'utf8');

    const squadSkillPath = path.join(skillsDir, 'aiox-demo-chief');
    fs.mkdirSync(squadSkillPath, { recursive: true });
    fs.writeFileSync(
      path.join(squadSkillPath, 'SKILL.md'),
      [
        '---',
        'name: aiox-demo-chief',
        'description: "Generated squad chief skill"',
        '---',
        '',
        '<!-- AIOX-CODEX-LOCAL-SKILLS: generated -->',
        '',
        'Load `squads/demo-squad/agents/demo-chief.md` before adopting this skill.',
      ].join('\n'),
      'utf8',
    );

    const result = validateCodexSkills({
      projectRoot: tmpRoot,
      sourceDir,
      skillsDir,
      strict: true,
    });

    expect(result.ok).toBe(true);
    expect(result.ignored).toContain('aiox-demo-chief');
    expect(result.orphaned).not.toContain('aiox-demo-chief');
  });

  it('ignores generated squad chief skills with an HTML source comment', () => {
    syncSkills({ sourceDir, localSkillsDir: skillsDir, dryRun: false });
    const sourcePath = path.join(tmpRoot, 'squads', 'demo-squad', 'agents', 'demo-chief.md');
    fs.mkdirSync(path.dirname(sourcePath), { recursive: true });
    fs.writeFileSync(sourcePath, '# demo chief', 'utf8');

    const squadSkillPath = path.join(skillsDir, 'aiox-demo-chief');
    fs.mkdirSync(squadSkillPath, { recursive: true });
    fs.writeFileSync(
      path.join(squadSkillPath, 'SKILL.md'),
      [
        '---',
        'name: aiox-demo-chief',
        'description: "Generated squad chief skill"',
        '---',
        '',
        '<!-- AIOX-CODEX-LOCAL-SKILLS: generated -->',
        '<!-- Source: squads/demo-squad/agents/demo-chief.md -->',
      ].join('\n'),
      'utf8',
    );

    const result = validateCodexSkills({
      projectRoot: tmpRoot,
      sourceDir,
      skillsDir,
      strict: true,
    });

    expect(result.ok).toBe(true);
    expect(result.ignored).toContain('aiox-demo-chief');
  });
});
