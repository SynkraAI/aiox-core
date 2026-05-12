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
    write(path.join(tmpRoot, '.aiox-core', 'development', 'agents', 'dev.md'), '# dev');

    const result = validateClaudeIntegration({ projectRoot: tmpRoot });
    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('fails when claude agents dir is missing', () => {
    const result = validateClaudeIntegration({ projectRoot: tmpRoot });
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.includes('Missing Claude agents dir'))).toBe(true);
  });
});

