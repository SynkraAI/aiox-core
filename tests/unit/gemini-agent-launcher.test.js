'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const {
  listAvailableAgents,
  hasAgent,
  buildActivationPrompt,
  commandNameForAgent,
} = require('../../packages/gemini-aiox-extension/commands/lib/agent-launcher');

describe('gemini agent launcher', () => {
  let tmpRoot;

  function write(file, content = '') {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, content, 'utf8');
  }

  beforeEach(() => {
    tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'gemini-launcher-'));
  });

  afterEach(() => {
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  });

  it('lists canonical agents from source-of-truth directory', () => {
    write(path.join(tmpRoot, '.aiox-core', 'development', 'agents', 'dev.md'), '# dev');
    write(path.join(tmpRoot, '.aiox-core', 'development', 'agents', 'architect.md'), '# architect');
    write(path.join(tmpRoot, '.aiox-core', 'development', 'agents', '_README.md'), '# ignore');

    const result = listAvailableAgents(tmpRoot);
    expect(result).toEqual(['architect', 'dev']);
  });

  it('detects agent presence in canonical or gemini mirrored folders', () => {
    write(path.join(tmpRoot, '.gemini', 'rules', 'AIOX', 'agents', 'qa.md'), '# qa');
    expect(hasAgent(tmpRoot, 'qa')).toBe(true);
    expect(hasAgent(tmpRoot, 'missing')).toBe(false);
  });

  it('builds deterministic activation prompt', () => {
    const prompt = buildActivationPrompt('devops');
    expect(prompt).toContain('.aiox-core/development/agents/devops.md');
    expect(prompt).toContain('generate-greeting.js devops');
    expect(prompt).toContain('*exit');
  });

  it('maps command name correctly for master agent', () => {
    expect(commandNameForAgent('aiox-master')).toBe('/aiox-master');
    expect(commandNameForAgent('dev')).toBe('/aiox-dev');
  });
});
