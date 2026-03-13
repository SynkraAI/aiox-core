/**
 * Testes para instalação condicional de hooks por tier (#544)
 *
 * Valida que hooks pro-only não são copiados quando pro/ não está disponível.
 *
 * @see packages/installer/src/wizard/ide-config-generator.js
 * @issue #544
 */

'use strict';

const path = require('path');
const fs = require('fs-extra');
const os = require('os');

// O módulo sob teste
const {
  copyClaudeHooksFolder,
} = require('../../packages/installer/src/wizard/ide-config-generator');

// Mock do pro-detector
jest.mock('../../bin/utils/pro-detector');
const proDetector = require('../../bin/utils/pro-detector');

function makeTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'hooks-test-'));
}

describe('copyClaudeHooksFolder — tier-aware (#544)', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = makeTempDir();
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('deve copiar apenas hooks free quando pro não está disponível', async () => {
    proDetector.isProAvailable.mockReturnValue(false);

    const copiedFiles = await copyClaudeHooksFolder(tmpDir);
    const fileNames = copiedFiles.map((f) => path.basename(f));

    expect(fileNames).toContain('synapse-engine.cjs');
    expect(fileNames).toContain('README.md');
    expect(fileNames).not.toContain('precompact-session-digest.cjs');
  });

  it('deve copiar todos os hooks incluindo pro quando pro está disponível', async () => {
    proDetector.isProAvailable.mockReturnValue(true);

    const copiedFiles = await copyClaudeHooksFolder(tmpDir);
    const fileNames = copiedFiles.map((f) => path.basename(f));

    expect(fileNames).toContain('synapse-engine.cjs');
    expect(fileNames).toContain('precompact-session-digest.cjs');
    expect(fileNames).toContain('README.md');
  });

  it('deve retornar array vazio quando source === target (framework-dev)', async () => {
    proDetector.isProAvailable.mockReturnValue(false);

    // Aponta projectRoot para o próprio framework root
    const frameworkRoot = path.resolve(__dirname, '..', '..');
    const result = await copyClaudeHooksFolder(frameworkRoot);
    expect(result).toEqual([]);
  });

  it('deve sempre copiar README.md independente do tier', async () => {
    proDetector.isProAvailable.mockReturnValue(false);

    const copiedFiles = await copyClaudeHooksFolder(tmpDir);
    const fileNames = copiedFiles.map((f) => path.basename(f));

    expect(fileNames).toContain('README.md');
  });
});
