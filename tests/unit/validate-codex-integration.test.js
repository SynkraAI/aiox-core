'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const {
  validateCodexIntegration,
} = require('../../.aiox-core/infrastructure/scripts/validate-codex-integration');

describe('validate-codex-integration', () => {
  let tmpRoot;

  function write(file, content = '') {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, content, 'utf8');
  }

  beforeEach(() => {
    tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'validate-codex-'));
  });

  afterEach(() => {
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  });

  it('passes when required Codex files exist', () => {
    write(path.join(tmpRoot, 'AGENTS.md'), '# rules');
    write(path.join(tmpRoot, '.codex', 'agents', 'dev.md'), '# dev');
    write(path.join(tmpRoot, '.codex', 'skills', 'aiox-dev', 'SKILL.md'), '# skill');
    write(path.join(tmpRoot, '.aiox-core', 'development', 'agents', 'dev.md'), '# dev');

    const result = validateCodexIntegration({ projectRoot: tmpRoot });
    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('fails when codex agents/skills dirs are missing', () => {
    const result = validateCodexIntegration({ projectRoot: tmpRoot });
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.includes('Missing Codex agents dir'))).toBe(true);
    expect(result.errors.some((e) => e.includes('Missing Codex skills dir'))).toBe(true);
    expect(result.warnings.some((w) => w.includes('Codex instructions file not found yet'))).toBe(true);
  });
});
