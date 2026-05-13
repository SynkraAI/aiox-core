'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const {
  validateClaudeIntegration,
} = require('../../.aiox-core/infrastructure/scripts/validate-claude-integration');

describe('validate-claude-integration', () => {
  let tmpRoot;

  function write(file, content = '') {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, content, 'utf8');
  }

  beforeEach(() => {
    tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'validate-claude-'));
  });

  afterEach(() => {
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  });

  it('passes when required Claude files exist', () => {
    write(path.join(tmpRoot, '.claude', 'CLAUDE.md'), '# rules');
    write(path.join(tmpRoot, '.claude', 'hooks', 'hook.js'), '');
    write(path.join(tmpRoot, '.claude', 'commands', 'AIOX', 'agents', 'dev.md'), '# dev');
    write(
      path.join(tmpRoot, '.claude', 'skills', 'AIOX', 'agents', 'dev', 'SKILL.md'),
      '---\nactivation_type: pipeline\n---\n# dev',
    );
    write(path.join(tmpRoot, '.aiox-core', 'development', 'agents', 'dev.md'), '# dev');

    const result = validateClaudeIntegration({ projectRoot: tmpRoot });
    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.metrics.claudeSkills).toBe(1);
    expect(result.metrics.claudeCommands).toBe(1);
  });

  it('fails when Claude agent skills dir is missing', () => {
    write(path.join(tmpRoot, '.aiox-core', 'development', 'agents', 'dev.md'), '# dev');

    const result = validateClaudeIntegration({ projectRoot: tmpRoot });
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.includes('Missing Claude agent skills dir'))).toBe(true);
  });

  it('warns when legacy Claude commands dir is missing but skills are present', () => {
    write(
      path.join(tmpRoot, '.claude', 'skills', 'AIOX', 'agents', 'dev', 'SKILL.md'),
      '---\nactivation_type: pipeline\n---\n# dev',
    );
    write(path.join(tmpRoot, '.aiox-core', 'development', 'agents', 'dev.md'), '# dev');

    const result = validateClaudeIntegration({ projectRoot: tmpRoot });
    expect(result.ok).toBe(true);
    expect(result.warnings.some((e) => e.includes('Missing legacy Claude commands dir'))).toBe(true);
  });

  it('fails when a Claude agent skill is missing pipeline activation type', () => {
    write(path.join(tmpRoot, '.claude', 'commands', 'AIOX', 'agents', 'dev.md'), '# dev');
    write(path.join(tmpRoot, '.claude', 'skills', 'AIOX', 'agents', 'dev', 'SKILL.md'), '# dev');
    write(path.join(tmpRoot, '.aiox-core', 'development', 'agents', 'dev.md'), '# dev');

    const result = validateClaudeIntegration({ projectRoot: tmpRoot });
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.includes('activation_type: pipeline'))).toBe(true);
  });
});
