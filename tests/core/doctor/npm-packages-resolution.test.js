const fs = require('fs');
const os = require('os');
const path = require('path');

const npmPackages = require('../../../.aiox-core/core/doctor/checks/npm-packages');

/**
 * Regression tests for the npm-packages doctor check.
 *
 * The check used to answer "does .aiox-core/node_modules/<dep>/ exist?" That is
 * a different question from "will this dependency load?". Node resolves a bare
 * specifier by walking up the directory tree, so a dependency absent from the
 * project can still load from an ancestor node_modules — a developer's home
 * directory, for instance. The check reported PASS while a clean install of the
 * same project threw MODULE_NOT_FOUND.
 *
 * That false PASS is worse than no check: it actively disarms suspicion. These
 * tests pin the behaviour that a dep resolving from outside the project, or not
 * resolving at all, is a FAIL.
 */
describe('doctor check: npm-packages resolution boundary', () => {
  let tmpRoot;

  /** Minimal installed package: package.json + index.js. */
  function writePackage(nodeModulesDir, name, version = '1.0.0') {
    const pkgDir = path.join(nodeModulesDir, name);
    fs.mkdirSync(pkgDir, { recursive: true });
    fs.writeFileSync(
      path.join(pkgDir, 'package.json'),
      JSON.stringify({ name, version, main: 'index.js' }),
    );
    fs.writeFileSync(path.join(pkgDir, 'index.js'), 'module.exports = {};\n');
  }

  /**
   * Build a project fixture.
   *
   * @param {object} opts
   * @param {string[]} opts.declared   deps declared in .aiox-core/package.json
   * @param {string[]} opts.inCore     deps installed under .aiox-core/node_modules
   * @param {string[]} opts.inRoot     deps installed under <root>/node_modules (hoisted)
   * @param {string[]} opts.inAncestor deps installed ABOVE the project root
   */
  function makeProject({ declared = [], inCore = [], inRoot = [], inAncestor = [] } = {}) {
    // An extra directory level so we can plant an ancestor node_modules that the
    // project itself does not contain — the scenario the old check missed.
    const ancestor = fs.mkdtempSync(path.join(os.tmpdir(), 'aiox-npmpkg-'));
    const projectRoot = path.join(ancestor, 'project');

    const coreDir = path.join(projectRoot, '.aiox-core');
    fs.mkdirSync(coreDir, { recursive: true });
    fs.writeFileSync(path.join(coreDir, 'index.js'), 'module.exports = {};\n');
    fs.writeFileSync(
      path.join(coreDir, 'package.json'),
      JSON.stringify({
        name: '@aiox-squads/core-internal',
        version: '0.0.0',
        dependencies: Object.fromEntries(declared.map((d) => [d, '^1.0.0'])),
      }),
    );

    const rootNodeModules = path.join(projectRoot, 'node_modules');
    fs.mkdirSync(rootNodeModules, { recursive: true });
    inRoot.forEach((d) => writePackage(rootNodeModules, d));

    if (inCore.length > 0) {
      const coreNodeModules = path.join(coreDir, 'node_modules');
      fs.mkdirSync(coreNodeModules, { recursive: true });
      inCore.forEach((d) => writePackage(coreNodeModules, d));
    }

    if (inAncestor.length > 0) {
      const ancestorNodeModules = path.join(ancestor, 'node_modules');
      fs.mkdirSync(ancestorNodeModules, { recursive: true });
      inAncestor.forEach((d) => writePackage(ancestorNodeModules, d));
    }

    return { ancestor, projectRoot };
  }

  afterEach(() => {
    if (tmpRoot) {
      fs.rmSync(tmpRoot, { recursive: true, force: true });
      tmpRoot = undefined;
    }
  });

  it('passes when declared deps are installed under .aiox-core/node_modules', async () => {
    const { ancestor, projectRoot } = makeProject({
      declared: ['alpha', 'beta'],
      inCore: ['alpha', 'beta'],
    });
    tmpRoot = ancestor;

    const result = await npmPackages.run({ projectRoot });

    expect(result.status).toBe('PASS');
  });

  it('passes when declared deps are hoisted to the project root node_modules', async () => {
    // Valid layout: the consumer declares @aiox-squads/core, npm hoists its
    // transitive deps to the root. Nothing lives in .aiox-core/node_modules.
    const { ancestor, projectRoot } = makeProject({
      declared: ['alpha', 'beta'],
      inRoot: ['alpha', 'beta'],
    });
    tmpRoot = ancestor;

    const result = await npmPackages.run({ projectRoot });

    expect(result.status).toBe('PASS');
  });

  it('FAILS when a declared dep resolves only from outside the project', async () => {
    // The regression: `gamma` is declared and loadable here, but lives above the
    // project root. `git clone && npm ci` on another machine has no such
    // ancestor and throws MODULE_NOT_FOUND.
    const { ancestor, projectRoot } = makeProject({
      declared: ['alpha', 'gamma'],
      inCore: ['alpha'],
      inAncestor: ['gamma'],
    });
    tmpRoot = ancestor;

    const result = await npmPackages.run({ projectRoot });

    expect(result.status).toBe('FAIL');
    expect(result.message).toMatch(/gamma/);
    expect(result.message).toMatch(/outside the project/);
  });

  it('FAILS when a declared dep cannot be resolved at all', async () => {
    const { ancestor, projectRoot } = makeProject({
      declared: ['alpha', 'absent-package'],
      inCore: ['alpha'],
    });
    tmpRoot = ancestor;

    const result = await npmPackages.run({ projectRoot });

    expect(result.status).toBe('FAIL');
    expect(result.message).toMatch(/absent-package/);
  });

  it('FAILS when the project has no node_modules at all', async () => {
    const ancestor = fs.mkdtempSync(path.join(os.tmpdir(), 'aiox-npmpkg-'));
    tmpRoot = ancestor;
    const projectRoot = path.join(ancestor, 'project');
    fs.mkdirSync(projectRoot, { recursive: true });

    const result = await npmPackages.run({ projectRoot });

    expect(result.status).toBe('FAIL');
    expect(result.message).toMatch(/node_modules not found/);
  });
});
