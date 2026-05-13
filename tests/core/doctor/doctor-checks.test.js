/**
 * Testes unitarios para os checks do Doctor
 *
 * Cobre todos os 15 checks modulares: node-version, core-config,
 * rules-files, agent-memory, entity-registry, git-hooks, ide-sync,
 * settings-json, skills-count, commands-count, hooks-claude-count.
 *
 * @see .aiox-core/core/doctor/checks/
 * @issue #52
 */

'use strict';

const path = require('path');
const fs = require('fs');
const os = require('os');

const PROJECT_ROOT = path.resolve(__dirname, '..', '..', '..');

// ============================================================================
// Helpers
// ============================================================================

function requireFromProjectRoot(modulePath) {
  return require(path.join(PROJECT_ROOT, modulePath));
}

function makeTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'doctor-check-'));
}

function makeContext(projectRoot) {
  return {
    projectRoot,
    frameworkRoot: PROJECT_ROOT,
    options: {},
  };
}

// ============================================================================
// node-version
// ============================================================================

describe('Doctor Check: node-version', () => {
  const { run, name } = requireFromProjectRoot('.aiox-core/core/doctor/checks/node-version');

  it('deve exportar nome correto', () => {
    expect(name).toBe('node-version');
  });

  it('deve retornar PASS quando Node >= 18', async () => {
    // Rodando neste ambiente, Node deve ser >= 18
    const result = await run();
    const major = parseInt(process.version.replace('v', '').split('.')[0], 10);

    expect(result.check).toBe('node-version');
    expect(result.message).toContain('Node.js');

    if (major >= 18) {
      expect(result.status).toBe('PASS');
      expect(result.fixCommand).toBeNull();
      return;
    }

    expect(result.status).toBe('FAIL');
    expect(result.fixCommand).toBeTruthy();
  });
});

// ============================================================================
// core-config
// ============================================================================

describe('Doctor Check: core-config', () => {
  const { run, name } = requireFromProjectRoot('.aiox-core/core/doctor/checks/core-config');
  let tmpDir;

  beforeEach(() => {
    tmpDir = makeTempDir();
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('deve exportar nome correto', () => {
    expect(name).toBe('core-config');
  });

  it('deve retornar FAIL quando core-config.yaml nao existe', async () => {
    const ctx = makeContext(tmpDir);
    const result = await run(ctx);

    expect(result.status).toBe('FAIL');
    expect(result.message).toContain('not found');
    expect(result.fixCommand).toBeTruthy();
  });

  it('deve retornar PASS quando todas as secoes obrigatorias estao presentes', async () => {
    const configDir = path.join(tmpDir, '.aiox-core');
    fs.mkdirSync(configDir, { recursive: true });
    fs.writeFileSync(
      path.join(configDir, 'core-config.yaml'),
      'boundary:\n  protection: true\nproject:\n  name: test\nide:\n  sync: true\n',
    );

    const ctx = makeContext(tmpDir);
    const result = await run(ctx);

    expect(result.status).toBe('PASS');
    expect(result.fixCommand).toBeNull();
  });

  it('deve retornar FAIL quando faltam secoes obrigatorias', async () => {
    const configDir = path.join(tmpDir, '.aiox-core');
    fs.mkdirSync(configDir, { recursive: true });
    fs.writeFileSync(
      path.join(configDir, 'core-config.yaml'),
      'boundary:\n  protection: true\n',
    );

    const ctx = makeContext(tmpDir);
    const result = await run(ctx);

    expect(result.status).toBe('FAIL');
    expect(result.message).toContain('Missing sections');
    expect(result.message).toContain('project');
    expect(result.message).toContain('ide');
  });
});

// ============================================================================
// rules-files
// ============================================================================

describe('Doctor Check: rules-files', () => {
  const { run, name, EXPECTED_RULES } = requireFromProjectRoot('.aiox-core/core/doctor/checks/rules-files');
  let tmpDir;

  beforeEach(() => {
    tmpDir = makeTempDir();
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('deve exportar nome e lista de regras esperadas', () => {
    expect(name).toBe('rules-files');
    expect(EXPECTED_RULES).toBeInstanceOf(Array);
    expect(EXPECTED_RULES.length).toBeGreaterThan(0);
  });

  it('deve retornar FAIL quando diretorio de regras nao existe', async () => {
    const ctx = makeContext(tmpDir);
    const result = await run(ctx);

    expect(result.status).toBe('FAIL');
    expect(result.message).toContain('not found');
  });

  it('deve retornar PASS quando todos os arquivos de regras existem', async () => {
    const rulesDir = path.join(tmpDir, '.claude', 'rules');
    fs.mkdirSync(rulesDir, { recursive: true });
    for (const rule of EXPECTED_RULES) {
      fs.writeFileSync(path.join(rulesDir, rule), '# rule\n');
    }

    const ctx = makeContext(tmpDir);
    const result = await run(ctx);

    expect(result.status).toBe('PASS');
    expect(result.fixCommand).toBeNull();
  });

  it('deve retornar WARN quando faltam ate 3 regras', async () => {
    const rulesDir = path.join(tmpDir, '.claude', 'rules');
    fs.mkdirSync(rulesDir, { recursive: true });
    // Cria todos exceto os 2 ultimos
    for (const rule of EXPECTED_RULES.slice(0, -2)) {
      fs.writeFileSync(path.join(rulesDir, rule), '# rule\n');
    }

    const ctx = makeContext(tmpDir);
    const result = await run(ctx);

    expect(result.status).toBe('WARN');
    expect(result.message).toContain('Missing');
  });

  it('deve retornar FAIL quando faltam mais de 3 regras', async () => {
    const rulesDir = path.join(tmpDir, '.claude', 'rules');
    fs.mkdirSync(rulesDir, { recursive: true });
    // Cria apenas a primeira regra
    fs.writeFileSync(path.join(rulesDir, EXPECTED_RULES[0]), '# rule\n');

    const ctx = makeContext(tmpDir);
    const result = await run(ctx);

    expect(result.status).toBe('FAIL');
  });
});

// ============================================================================
// agent-memory
// ============================================================================

describe('Doctor Check: agent-memory', () => {
  const { run, name, EXPECTED_AGENTS } = requireFromProjectRoot('.aiox-core/core/doctor/checks/agent-memory');
  let tmpDir;

  beforeEach(() => {
    tmpDir = makeTempDir();
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('deve exportar nome e lista de agentes esperados', () => {
    expect(name).toBe('agent-memory');
    expect(EXPECTED_AGENTS).toContain('dev');
    expect(EXPECTED_AGENTS).toContain('qa');
    expect(EXPECTED_AGENTS).toContain('devops');
  });

  it('deve retornar FAIL quando diretorio de agentes nao existe', async () => {
    const ctx = makeContext(tmpDir);
    const result = await run(ctx);

    expect(result.status).toBe('FAIL');
    expect(result.message).toContain('not found');
  });

  it('deve retornar PASS quando todos os MEMORY.md existem', async () => {
    for (const agent of EXPECTED_AGENTS) {
      const agentDir = path.join(tmpDir, '.aiox-core', 'development', 'agents', agent);
      fs.mkdirSync(agentDir, { recursive: true });
      fs.writeFileSync(path.join(agentDir, 'MEMORY.md'), `# ${agent}\n`);
    }

    const ctx = makeContext(tmpDir);
    const result = await run(ctx);

    expect(result.status).toBe('PASS');
    expect(result.message).toContain(`${EXPECTED_AGENTS.length}/${EXPECTED_AGENTS.length}`);
  });

  it('deve retornar WARN quando faltam alguns MEMORY.md', async () => {
    // Cria apenas para os 3 primeiros agentes
    for (const agent of EXPECTED_AGENTS.slice(0, 3)) {
      const agentDir = path.join(tmpDir, '.aiox-core', 'development', 'agents', agent);
      fs.mkdirSync(agentDir, { recursive: true });
      fs.writeFileSync(path.join(agentDir, 'MEMORY.md'), `# ${agent}\n`);
    }
    // Garante que o diretorio base existe
    const baseDir = path.join(tmpDir, '.aiox-core', 'development', 'agents');
    fs.mkdirSync(baseDir, { recursive: true });

    const ctx = makeContext(tmpDir);
    const result = await run(ctx);

    expect(result.status).toBe('WARN');
    expect(result.message).toContain('missing');
  });
});

// ============================================================================
// entity-registry
// ============================================================================

describe('Doctor Check: entity-registry', () => {
  const { run, name } = requireFromProjectRoot('.aiox-core/core/doctor/checks/entity-registry');
  let tmpDir;

  beforeEach(() => {
    tmpDir = makeTempDir();
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('deve exportar nome correto', () => {
    expect(name).toBe('entity-registry');
  });

  it('deve retornar FAIL quando entity-registry.yaml nao existe', async () => {
    const ctx = makeContext(tmpDir);
    const result = await run(ctx);

    expect(result.status).toBe('FAIL');
    expect(result.message).toContain('not found');
  });

  it('deve retornar PASS quando entity-registry.yaml existe e e recente', async () => {
    const dataDir = path.join(tmpDir, '.aiox-core', 'data');
    fs.mkdirSync(dataDir, { recursive: true });
    fs.writeFileSync(path.join(dataDir, 'entity-registry.yaml'), 'entities:\n  - agent: dev\n');

    const ctx = makeContext(tmpDir);
    const result = await run(ctx);

    expect(result.status).toBe('PASS');
    expect(result.message).toContain('lines');
  });

  it('deve retornar WARN quando entity-registry.yaml e antigo (>48h)', async () => {
    const dataDir = path.join(tmpDir, '.aiox-core', 'data');
    fs.mkdirSync(dataDir, { recursive: true });
    const registryPath = path.join(dataDir, 'entity-registry.yaml');
    fs.writeFileSync(registryPath, 'entities:\n  - agent: dev\n');

    // Define mtime para 72h atras
    const oldTime = new Date(Date.now() - 72 * 60 * 60 * 1000);
    fs.utimesSync(registryPath, oldTime, oldTime);

    const ctx = makeContext(tmpDir);
    const result = await run(ctx);

    expect(result.status).toBe('WARN');
    expect(result.message).toContain('old');
  });
});

// ============================================================================
// git-hooks
// ============================================================================

describe('Doctor Check: git-hooks', () => {
  const { run, name } = requireFromProjectRoot('.aiox-core/core/doctor/checks/git-hooks');
  let tmpDir;

  beforeEach(() => {
    tmpDir = makeTempDir();
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('deve exportar nome correto', () => {
    expect(name).toBe('git-hooks');
  });

  it('deve retornar WARN quando .husky nao existe', async () => {
    const ctx = makeContext(tmpDir);
    const result = await run(ctx);

    expect(result.status).toBe('WARN');
    expect(result.message).toContain('.husky');
  });

  it('deve retornar PASS quando todos os hooks existem', async () => {
    const huskyDir = path.join(tmpDir, '.husky');
    fs.mkdirSync(huskyDir, { recursive: true });
    fs.writeFileSync(path.join(huskyDir, 'pre-commit'), '#!/bin/sh\n');
    fs.writeFileSync(path.join(huskyDir, 'pre-push'), '#!/bin/sh\n');

    const ctx = makeContext(tmpDir);
    const result = await run(ctx);

    expect(result.status).toBe('PASS');
    expect(result.message).toContain('pre-commit');
    expect(result.message).toContain('pre-push');
  });

  it('deve retornar WARN quando faltam hooks', async () => {
    const huskyDir = path.join(tmpDir, '.husky');
    fs.mkdirSync(huskyDir, { recursive: true });
    fs.writeFileSync(path.join(huskyDir, 'pre-commit'), '#!/bin/sh\n');

    const ctx = makeContext(tmpDir);
    const result = await run(ctx);

    expect(result.status).toBe('WARN');
    expect(result.message).toContain('pre-push');
  });
});

// ============================================================================
// skills-count
// ============================================================================

describe('Doctor Check: skills-count', () => {
  const { run, name } = requireFromProjectRoot('.aiox-core/core/doctor/checks/skills-count');
  let tmpDir;

  beforeEach(() => {
    tmpDir = makeTempDir();
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('deve exportar nome correto', () => {
    expect(name).toBe('skills-count');
  });

  it('deve retornar FAIL quando diretorio de skills nao existe', async () => {
    const ctx = makeContext(tmpDir);
    const result = await run(ctx);

    expect(result.status).toBe('FAIL');
    expect(result.message).toContain('not found');
  });

  it('deve retornar FAIL quando nenhuma skill e encontrada', async () => {
    const skillsDir = path.join(tmpDir, '.claude', 'skills');
    fs.mkdirSync(skillsDir, { recursive: true });

    const ctx = makeContext(tmpDir);
    const result = await run(ctx);

    expect(result.status).toBe('FAIL');
    expect(result.message).toContain('No skills found');
  });

  it('deve retornar WARN quando skills < 7', async () => {
    const skillsDir = path.join(tmpDir, '.claude', 'skills');
    fs.mkdirSync(skillsDir, { recursive: true });

    for (let i = 0; i < 3; i++) {
      const skillDir = path.join(skillsDir, `skill-${i}`);
      fs.mkdirSync(skillDir, { recursive: true });
      fs.writeFileSync(path.join(skillDir, 'SKILL.md'), '# skill\n');
    }

    const ctx = makeContext(tmpDir);
    const result = await run(ctx);

    expect(result.status).toBe('WARN');
    expect(result.message).toContain('3/7');
  });

  it('deve retornar PASS quando skills >= 7', async () => {
    const skillsDir = path.join(tmpDir, '.claude', 'skills');
    fs.mkdirSync(skillsDir, { recursive: true });

    for (let i = 0; i < 8; i++) {
      const skillDir = path.join(skillsDir, `skill-${i}`);
      fs.mkdirSync(skillDir, { recursive: true });
      fs.writeFileSync(path.join(skillDir, 'SKILL.md'), '# skill\n');
    }

    const ctx = makeContext(tmpDir);
    const result = await run(ctx);

    expect(result.status).toBe('PASS');
    expect(result.message).toContain('8');
  });

  it('deve ignorar diretorios sem SKILL.md', async () => {
    const skillsDir = path.join(tmpDir, '.claude', 'skills');
    fs.mkdirSync(skillsDir, { recursive: true });

    // Diretorio sem SKILL.md
    fs.mkdirSync(path.join(skillsDir, 'empty-skill'), { recursive: true });
    // Arquivo solto (nao diretorio)
    fs.writeFileSync(path.join(skillsDir, 'readme.txt'), 'not a skill\n');

    const ctx = makeContext(tmpDir);
    const result = await run(ctx);

    expect(result.status).toBe('FAIL');
    expect(result.message).toContain('No skills found');
  });
});

// ============================================================================
// commands-count
// ============================================================================

describe('Doctor Check: commands-count', () => {
  const { run, name } = requireFromProjectRoot('.aiox-core/core/doctor/checks/commands-count');
  let tmpDir;

  beforeEach(() => {
    tmpDir = makeTempDir();
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('deve exportar nome correto', () => {
    expect(name).toBe('commands-count');
  });

  it('deve retornar FAIL quando diretorio de commands nao existe', async () => {
    const ctx = makeContext(tmpDir);
    const result = await run(ctx);

    expect(result.status).toBe('FAIL');
    expect(result.message).toContain('not found');
  });

  it('deve retornar FAIL quando commands < 12', async () => {
    const commandsDir = path.join(tmpDir, '.claude', 'commands');
    fs.mkdirSync(commandsDir, { recursive: true });

    for (let i = 0; i < 5; i++) {
      fs.writeFileSync(path.join(commandsDir, `cmd-${i}.md`), '# cmd\n');
    }

    const ctx = makeContext(tmpDir);
    const result = await run(ctx);

    expect(result.status).toBe('FAIL');
    expect(result.message).toContain('5');
  });

  it('deve retornar WARN quando commands >= 12 e < 20', async () => {
    const commandsDir = path.join(tmpDir, '.claude', 'commands');
    fs.mkdirSync(commandsDir, { recursive: true });

    for (let i = 0; i < 15; i++) {
      fs.writeFileSync(path.join(commandsDir, `cmd-${i}.md`), '# cmd\n');
    }

    const ctx = makeContext(tmpDir);
    const result = await run(ctx);

    expect(result.status).toBe('WARN');
    expect(result.message).toContain('15/20');
  });

  it('deve retornar PASS quando commands >= 20', async () => {
    const commandsDir = path.join(tmpDir, '.claude', 'commands');
    fs.mkdirSync(commandsDir, { recursive: true });

    for (let i = 0; i < 25; i++) {
      fs.writeFileSync(path.join(commandsDir, `cmd-${i}.md`), '# cmd\n');
    }

    const ctx = makeContext(tmpDir);
    const result = await run(ctx);

    expect(result.status).toBe('PASS');
  });

  it('deve contar .md recursivamente em subdiretorios', async () => {
    const commandsDir = path.join(tmpDir, '.claude', 'commands');
    const subDir = path.join(commandsDir, 'agents');
    fs.mkdirSync(subDir, { recursive: true });

    for (let i = 0; i < 12; i++) {
      fs.writeFileSync(path.join(commandsDir, `cmd-${i}.md`), '# cmd\n');
    }
    for (let i = 0; i < 10; i++) {
      fs.writeFileSync(path.join(subDir, `agent-${i}.md`), '# agent\n');
    }

    const ctx = makeContext(tmpDir);
    const result = await run(ctx);

    expect(result.status).toBe('PASS');
    expect(result.message).toContain('22');
  });
});

// ============================================================================
// hooks-claude-count
// ============================================================================

describe('Doctor Check: hooks-claude-count', () => {
  const { run, name } = requireFromProjectRoot('.aiox-core/core/doctor/checks/hooks-claude-count');
  let tmpDir;

  beforeEach(() => {
    tmpDir = makeTempDir();
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('deve exportar nome correto', () => {
    expect(name).toBe('hooks-claude-count');
  });

  it('deve retornar FAIL quando diretorio de hooks nao existe', async () => {
    const ctx = makeContext(tmpDir);
    const result = await run(ctx);

    expect(result.status).toBe('FAIL');
    expect(result.message).toContain('not found');
  });

  it('deve retornar FAIL quando nenhum .cjs encontrado', async () => {
    const hooksDir = path.join(tmpDir, '.claude', 'hooks');
    fs.mkdirSync(hooksDir, { recursive: true });

    const ctx = makeContext(tmpDir);
    const result = await run(ctx);

    expect(result.status).toBe('FAIL');
    expect(result.message).toContain('No hook files');
  });

  it('deve retornar WARN quando < 2 hooks', async () => {
    const hooksDir = path.join(tmpDir, '.claude', 'hooks');
    fs.mkdirSync(hooksDir, { recursive: true });
    fs.writeFileSync(path.join(hooksDir, 'pre-tool.cjs'), '// hook\n');

    const ctx = makeContext(tmpDir);
    const result = await run(ctx);

    expect(result.status).toBe('WARN');
    expect(result.message).toContain('1/2');
  });

  it('deve retornar WARN quando hooks existem mas nao estao registrados', async () => {
    const hooksDir = path.join(tmpDir, '.claude', 'hooks');
    fs.mkdirSync(hooksDir, { recursive: true });
    fs.writeFileSync(path.join(hooksDir, 'pre-tool.cjs'), '// hook\n');
    fs.writeFileSync(path.join(hooksDir, 'post-tool.cjs'), '// hook\n');

    const ctx = makeContext(tmpDir);
    const result = await run(ctx);

    expect(result.status).toBe('WARN');
    expect(result.message).toContain('not registered');
  });

  it('deve retornar PASS quando hooks >= 2 e registrados em settings.local.json', async () => {
    const hooksDir = path.join(tmpDir, '.claude', 'hooks');
    fs.mkdirSync(hooksDir, { recursive: true });
    fs.writeFileSync(path.join(hooksDir, 'pre-tool.cjs'), '// hook\n');
    fs.writeFileSync(path.join(hooksDir, 'post-tool.cjs'), '// hook\n');

    const settingsLocal = {
      hooks: {
        PreToolUse: [
          {
            matcher: '*',
            hooks: [{ type: 'command', command: 'node .claude/hooks/pre-tool.cjs' }],
          },
        ],
        PostToolUse: [
          {
            matcher: '*',
            hooks: [{ type: 'command', command: 'node .claude/hooks/post-tool.cjs' }],
          },
        ],
      },
    };
    fs.writeFileSync(
      path.join(tmpDir, '.claude', 'settings.local.json'),
      JSON.stringify(settingsLocal),
    );

    const ctx = makeContext(tmpDir);
    const result = await run(ctx);

    expect(result.status).toBe('PASS');
    expect(result.message).toContain('registered');
  });
});

// ============================================================================
// settings-json
// ============================================================================

describe('Doctor Check: settings-json', () => {
  const { run, name } = requireFromProjectRoot('.aiox-core/core/doctor/checks/settings-json');
  let tmpDir;

  beforeEach(() => {
    tmpDir = makeTempDir();
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('deve exportar nome correto', () => {
    expect(name).toBe('settings-json');
  });

  it('deve retornar FAIL quando settings.json nao existe', async () => {
    const ctx = makeContext(tmpDir);
    const result = await run(ctx);

    expect(result.status).toBe('FAIL');
    expect(result.message).toContain('not found');
  });

  it('deve retornar FAIL quando settings.json e JSON invalido', async () => {
    const claudeDir = path.join(tmpDir, '.claude');
    fs.mkdirSync(claudeDir, { recursive: true });
    fs.writeFileSync(path.join(claudeDir, 'settings.json'), '{ invalid json');

    const ctx = makeContext(tmpDir);
    const result = await run(ctx);

    expect(result.status).toBe('FAIL');
    expect(result.message).toContain('invalid JSON');
  });

  it('deve retornar WARN quando deny rules < 40', async () => {
    const claudeDir = path.join(tmpDir, '.claude');
    fs.mkdirSync(claudeDir, { recursive: true });
    const settings = {
      permissions: {
        deny: Array.from({ length: 10 }, (_, i) => `deny-rule-${i}`),
        allow: [],
      },
    };
    fs.writeFileSync(path.join(claudeDir, 'settings.json'), JSON.stringify(settings));

    const ctx = makeContext(tmpDir);
    const result = await run(ctx);

    expect(result.status).toBe('WARN');
    expect(result.message).toContain('10');
  });

  it('deve retornar PASS quando deny rules >= 40', async () => {
    const claudeDir = path.join(tmpDir, '.claude');
    fs.mkdirSync(claudeDir, { recursive: true });
    const settings = {
      permissions: {
        deny: Array.from({ length: 45 }, (_, i) => `deny-rule-${i}`),
        allow: ['allow-1'],
      },
    };
    fs.writeFileSync(path.join(claudeDir, 'settings.json'), JSON.stringify(settings));

    const ctx = makeContext(tmpDir);
    const result = await run(ctx);

    expect(result.status).toBe('PASS');
    expect(result.message).toContain('45');
  });
});

// ============================================================================
// ide-sync
// ============================================================================

describe('Doctor Check: ide-sync', () => {
  const { run, name } = requireFromProjectRoot('.aiox-core/core/doctor/checks/ide-sync');
  let tmpDir;

  beforeEach(() => {
    tmpDir = makeTempDir();
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('deve exportar nome correto', () => {
    expect(name).toBe('ide-sync');
  });

  it('deve retornar FAIL quando diretorio source nao existe', async () => {
    const ctx = makeContext(tmpDir);
    const result = await run(ctx);

    expect(result.status).toBe('FAIL');
    expect(result.message).toContain('not found');
  });

  it('deve retornar WARN quando diretorio IDE nao existe', async () => {
    const sourceDir = path.join(tmpDir, '.aiox-core', 'development', 'agents');
    fs.mkdirSync(sourceDir, { recursive: true });
    fs.writeFileSync(path.join(sourceDir, 'dev.md'), '# dev\n');

    const ctx = makeContext(tmpDir);
    const result = await run(ctx);

    expect(result.status).toBe('WARN');
  });

  it('deve retornar PASS quando skills e commands coincidem', async () => {
    const sourceDir = path.join(tmpDir, '.aiox-core', 'development', 'agents');
    const ideDir = path.join(tmpDir, '.claude', 'commands', 'AIOX', 'agents');
    const skillDir = path.join(tmpDir, '.claude', 'skills', 'AIOX', 'agents');
    fs.mkdirSync(sourceDir, { recursive: true });
    fs.mkdirSync(ideDir, { recursive: true });
    fs.mkdirSync(skillDir, { recursive: true });

    const agents = ['dev.md', 'qa.md', 'architect.md'];
    for (const agent of agents) {
      const agentId = agent.replace('.md', '');
      fs.writeFileSync(path.join(sourceDir, agent), '# agent\n');
      fs.writeFileSync(path.join(ideDir, agent), '# agent\n');
      fs.mkdirSync(path.join(skillDir, agentId), { recursive: true });
      fs.writeFileSync(path.join(skillDir, agentId, 'SKILL.md'), '# agent\n');
    }

    const ctx = makeContext(tmpDir);
    const result = await run(ctx);

    expect(result.status).toBe('PASS');
    expect(result.message).toContain('3/3 Claude skills synced');
    expect(result.message).toContain('3/3 legacy commands synced');
  });

  it('deve retornar WARN quando commands legados nao coincidem', async () => {
    const sourceDir = path.join(tmpDir, '.aiox-core', 'development', 'agents');
    const ideDir = path.join(tmpDir, '.claude', 'commands', 'AIOX', 'agents');
    const skillDir = path.join(tmpDir, '.claude', 'skills', 'AIOX', 'agents');
    fs.mkdirSync(sourceDir, { recursive: true });
    fs.mkdirSync(ideDir, { recursive: true });
    fs.mkdirSync(skillDir, { recursive: true });

    for (const agentId of ['dev', 'qa']) {
      fs.writeFileSync(path.join(sourceDir, `${agentId}.md`), `# ${agentId}\n`);
      fs.mkdirSync(path.join(skillDir, agentId), { recursive: true });
      fs.writeFileSync(path.join(skillDir, agentId, 'SKILL.md'), `# ${agentId}\n`);
    }
    fs.writeFileSync(path.join(ideDir, 'dev.md'), '# dev\n');

    const ctx = makeContext(tmpDir);
    const result = await run(ctx);

    expect(result.status).toBe('WARN');
    expect(result.message).toContain('legacy commands mismatch');
    expect(result.message).toContain('missing: qa');
    expect(result.message).toContain('count: 1/2');
  });
});
