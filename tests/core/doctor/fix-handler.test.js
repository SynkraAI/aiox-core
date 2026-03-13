/**
 * Testes unitarios para o Doctor Fix Handler
 *
 * Cobre applyFixes com dry-run, fix real, erros e checks sem fixer.
 *
 * @see .aiox-core/core/doctor/fix-handler.js
 * @issue #52
 */

'use strict';

const path = require('path');
const fs = require('fs');
const os = require('os');

const PROJECT_ROOT = path.resolve(__dirname, '..', '..', '..');
const { applyFixes } = require(path.join(PROJECT_ROOT, '.aiox-core/core/doctor/fix-handler'));
const { EXPECTED_RULES } = require(path.join(PROJECT_ROOT, '.aiox-core/core/doctor/checks/rules-files'));

function makeTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'doctor-fix-'));
}

describe('Doctor Fix Handler', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = makeTempDir();
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('deve ignorar resultados com status PASS', async () => {
    const results = [
      { check: 'node-version', status: 'PASS', message: 'ok' },
      { check: 'core-config', status: 'INFO', message: 'info' },
    ];

    const context = {
      projectRoot: tmpDir,
      frameworkRoot: path.resolve(__dirname, '..', '..', '..'),
      options: {},
    };

    const fixResults = await applyFixes(results, context);
    expect(fixResults).toEqual([]);
  });

  it('deve retornar "No auto-fix available" para checks sem fixer', async () => {
    const results = [
      { check: 'unknown-check', status: 'FAIL', message: 'broken' },
    ];

    const context = {
      projectRoot: tmpDir,
      frameworkRoot: path.resolve(__dirname, '..', '..', '..'),
      options: {},
    };

    const fixResults = await applyFixes(results, context);
    expect(fixResults).toHaveLength(1);
    expect(fixResults[0].applied).toBe(false);
    expect(fixResults[0].message).toBe('No auto-fix available');
  });

  it('deve retornar dry-run description para rules-files', async () => {
    const results = [
      { check: 'rules-files', status: 'FAIL', message: 'missing rules' },
    ];

    const context = {
      projectRoot: tmpDir,
      frameworkRoot: path.resolve(__dirname, '..', '..', '..'),
      options: { dryRun: true },
    };

    const fixResults = await applyFixes(results, context);
    expect(fixResults).toHaveLength(1);
    expect(fixResults[0].applied).toBe(false);
    expect(fixResults[0].message).toContain('[DRY RUN]');
    expect(fixResults[0].message).toContain('Copy missing rules');
  });

  it('deve copiar regras faltantes quando fix = true (rules-files)', async () => {
    const rulesTarget = path.join(tmpDir, '.claude', 'rules');
    // Nao cria o diretorio — o fixer deve criar

    const results = [
      { check: 'rules-files', status: 'FAIL', message: 'missing rules' },
    ];

    const context = {
      projectRoot: tmpDir,
      frameworkRoot: path.resolve(__dirname, '..', '..', '..'),
      options: {},
    };

    const fixResults = await applyFixes(results, context);
    expect(fixResults).toHaveLength(1);
    expect(fixResults[0].applied).toBe(true);
    expect(fixResults[0].message).toContain('Copied');

    // Verifica que o diretorio foi criado
    expect(fs.existsSync(rulesTarget)).toBe(true);
  });

  it('deve criar MEMORY.md stubs para agentes faltantes', async () => {
    const results = [
      { check: 'agent-memory', status: 'WARN', message: 'missing agents' },
    ];

    const context = {
      projectRoot: tmpDir,
      frameworkRoot: path.resolve(__dirname, '..', '..', '..'),
      options: {},
    };

    const fixResults = await applyFixes(results, context);
    expect(fixResults).toHaveLength(1);
    expect(fixResults[0].applied).toBe(true);
    expect(fixResults[0].message).toContain('Created');
    expect(fixResults[0].message).toContain('MEMORY.md');
  });

  it('deve retornar dry-run description para agent-memory', async () => {
    const results = [
      { check: 'agent-memory', status: 'WARN', message: 'missing' },
    ];

    const context = {
      projectRoot: tmpDir,
      frameworkRoot: path.resolve(__dirname, '..', '..', '..'),
      options: { dryRun: true },
    };

    const fixResults = await applyFixes(results, context);
    expect(fixResults).toHaveLength(1);
    expect(fixResults[0].message).toContain('[DRY RUN]');
    expect(fixResults[0].message).toContain('MEMORY.md');
  });

  it('deve tratar fix de claude-md como redirect para install --force', async () => {
    const results = [
      { check: 'claude-md', status: 'FAIL', message: 'missing sections' },
    ];

    const context = {
      projectRoot: tmpDir,
      frameworkRoot: path.resolve(__dirname, '..', '..', '..'),
      options: {},
    };

    const fixResults = await applyFixes(results, context);
    expect(fixResults).toHaveLength(1);
    expect(fixResults[0].applied).toBe(true);
    expect(fixResults[0].message).toContain('install --force');
  });

  it('deve tratar fix de settings-json', async () => {
    const results = [
      { check: 'settings-json', status: 'FAIL', message: 'missing deny rules' },
    ];

    const context = {
      projectRoot: tmpDir,
      frameworkRoot: path.resolve(__dirname, '..', '..', '..'),
      options: {},
    };

    const fixResults = await applyFixes(results, context);
    expect(fixResults).toHaveLength(1);
    // Pode ser applied=true (com generator) ou message com install --force
    expect(fixResults[0].check).toBe('settings-json');
  });

  it('deve processar multiplos resultados WARN/FAIL em sequencia', async () => {
    const results = [
      { check: 'node-version', status: 'PASS', message: 'ok' },
      { check: 'rules-files', status: 'WARN', message: 'missing 2' },
      { check: 'unknown-check', status: 'FAIL', message: 'broken' },
      { check: 'agent-memory', status: 'WARN', message: 'missing agents' },
    ];

    const context = {
      projectRoot: tmpDir,
      frameworkRoot: path.resolve(__dirname, '..', '..', '..'),
      options: {},
    };

    const fixResults = await applyFixes(results, context);
    // PASS ignorado, 3 processados (rules-files, unknown-check, agent-memory)
    expect(fixResults).toHaveLength(3);
    expect(fixResults[0].check).toBe('rules-files');
    expect(fixResults[1].check).toBe('unknown-check');
    expect(fixResults[1].applied).toBe(false);
    expect(fixResults[2].check).toBe('agent-memory');
  });
});
