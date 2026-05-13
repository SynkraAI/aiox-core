/**
 * Testes unitarios para o Doctor Index (orchestrator)
 *
 * Cobre runDoctorChecks com todas as opcoes: fix, json, dryRun, quiet.
 *
 * @see .aiox-core/core/doctor/index.js
 * @issue #52
 */

'use strict';

const path = require('path');
const fs = require('fs');
const os = require('os');

const PROJECT_ROOT = path.resolve(__dirname, '..', '..', '..');
const { runDoctorChecks, DOCTOR_VERSION } = require(path.join(PROJECT_ROOT, '.aiox-core/core/doctor'));

function makeTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'doctor-index-'));
}

describe('Doctor Orchestrator (index)', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = makeTempDir();
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('deve exportar DOCTOR_VERSION', () => {
    expect(DOCTOR_VERSION).toBe('2.0.0');
  });

  it('deve retornar resultados estruturados com summary', async () => {
    const { data } = await runDoctorChecks({ projectRoot: tmpDir });

    expect(data).toHaveProperty('version', DOCTOR_VERSION);
    expect(data).toHaveProperty('timestamp');
    expect(data).toHaveProperty('summary');
    expect(data).toHaveProperty('checks');
    expect(data.summary).toHaveProperty('pass');
    expect(data.summary).toHaveProperty('warn');
    expect(data.summary).toHaveProperty('fail');
    expect(data.summary).toHaveProperty('info');
    expect(data.fixResults).toBeNull();
  });

  it('deve retornar formatted text por padrao', async () => {
    const { formatted } = await runDoctorChecks({ projectRoot: tmpDir });

    expect(typeof formatted).toBe('string');
    expect(formatted.length).toBeGreaterThan(0);
  });

  it('deve retornar formatted JSON quando json=true', async () => {
    const { formatted, data } = await runDoctorChecks({
      projectRoot: tmpDir,
      json: true,
    });

    expect(typeof formatted).toBe('string');
    const parsed = JSON.parse(formatted);
    expect(parsed).toHaveProperty('version');
    expect(parsed).toHaveProperty('checks');
  });

  it('deve aplicar fixes quando fix=true', async () => {
    const { data } = await runDoctorChecks({
      projectRoot: tmpDir,
      fix: true,
    });

    expect(data.fixResults).not.toBeNull();
    expect(Array.isArray(data.fixResults)).toBe(true);
  });

  it('deve retornar dry-run results quando dryRun=true', async () => {
    const { data } = await runDoctorChecks({
      projectRoot: tmpDir,
      dryRun: true,
    });

    expect(data.fixResults).not.toBeNull();
    for (const fix of data.fixResults) {
      expect(fix.applied).toBe(false);
    }
  });

  it('deve funcionar com quiet=true', async () => {
    const { formatted } = await runDoctorChecks({
      projectRoot: tmpDir,
      quiet: true,
    });

    expect(typeof formatted).toBe('string');
  });

  it('deve usar cwd como projectRoot padrao', async () => {
    const { data } = await runDoctorChecks();

    expect(data).toHaveProperty('checks');
    expect(data.checks.length).toBeGreaterThan(0);
  });

  it('deve conter todos os checks esperados', async () => {
    const { data } = await runDoctorChecks({ projectRoot: tmpDir });

    const checkNames = data.checks.map((c) => c.check);
    expect(checkNames).toContain('node-version');
    expect(checkNames).toContain('core-config');
    expect(checkNames).toContain('rules-files');
    expect(checkNames).toContain('agent-memory');
    expect(checkNames).toContain('entity-registry');
  });

  it('deve tratar erros em checks individuais sem parar', async () => {
    // Rodar contra um diretorio vazio — nenhum check deve lançar exceção
    const { data } = await runDoctorChecks({ projectRoot: tmpDir });

    // Todos os checks devem ter resultado, mesmo com diretório vazio
    expect(data.checks.length).toBeGreaterThan(0);
    for (const check of data.checks) {
      expect(check).toHaveProperty('status');
      expect(['PASS', 'WARN', 'FAIL', 'INFO']).toContain(check.status);
    }
  });

  it('summary counts devem bater com resultados', async () => {
    const { data } = await runDoctorChecks({ projectRoot: tmpDir });

    const pass = data.checks.filter((c) => c.status === 'PASS').length;
    const warn = data.checks.filter((c) => c.status === 'WARN').length;
    const fail = data.checks.filter((c) => c.status === 'FAIL').length;
    const info = data.checks.filter((c) => c.status === 'INFO').length;

    expect(data.summary.pass).toBe(pass);
    expect(data.summary.warn).toBe(warn);
    expect(data.summary.fail).toBe(fail);
    expect(data.summary.info).toBe(info);
  });
});
