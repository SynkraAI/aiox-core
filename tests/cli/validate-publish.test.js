'use strict';

/**
 * Publish Safety Gate Tests (Story INS-4.10)
 *
 * Tests validate-publish.js behavior via source analysis and
 * behavioral verification with mocked filesystem/child_process.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SCRIPT_PATH = path.join(__dirname, '..', '..', 'bin', 'utils', 'validate-publish.js');

// The behavioral test shells out with a 330s pack timeout; keep Jest's outer budget higher.
jest.setTimeout(360000);

describe('Publish Safety Gate (Story INS-4.10 / PRO-13.5)', () => {
  let scriptSource;

  beforeAll(() => {
    scriptSource = fs.readFileSync(SCRIPT_PATH, 'utf8');
  });

  describe('PRO-13.5: Public tarball boundary', () => {
    test('script blocks pro/ paths in npm pack output', () => {
      expect(scriptSource).toContain('PRO_PATH_PATTERN');
      expect(scriptSource).toContain('Public package includes');
      expect(scriptSource).toContain('Public package excludes pro/ content');
    });

    test('legacy npm notice parser strips size prefixes before path checks', () => {
      expect(scriptSource).toContain('npm notice\\s+[\\d.]+[kMG]?B?\\s+(.+)');
    });

    test('script exits with code 1 on failure', () => {
      expect(scriptSource).toContain('process.exit(1)');
    });

    test('script exits with code 0 on success', () => {
      expect(scriptSource).toContain('process.exit(0)');
    });
  });

  describe('AC1: File count threshold', () => {
    test('minimum threshold is >= 50', () => {
      expect(scriptSource).toContain('MIN_FILE_COUNT = 50');
    });

    test('uses npm pack --dry-run for file counting', () => {
      expect(scriptSource).toContain('npm pack --dry-run');
    });

    test('error message includes file count on failure', () => {
      expect(scriptSource).toMatch(/Package has only.*files, expected >= /);
    });
  });

  describe('AC4: Standalone script design', () => {
    test('script has shebang for standalone execution', () => {
      expect(scriptSource.startsWith('#!/usr/bin/env node')).toBe(true);
    });

    test('script uses only Node.js builtins (fs, path, child_process)', () => {
      // Should not require any external packages
      const requires = scriptSource.match(/require\(['"]([^'"]+)['"]\)/g) || [];
      const modules = requires.map((r) => r.match(/require\(['"]([^'"]+)['"]\)/)[1]);
      const builtins = ['fs', 'path', 'child_process'];
      modules.forEach((mod) => {
        expect(builtins).toContain(mod);
      });
    });

    test('script resolves PROJECT_ROOT from __dirname', () => {
      expect(scriptSource).toContain("path.join(__dirname, '..', '..')");
    });
  });

  describe('AC3: CI integration', () => {
    test('npm-publish.yml includes publish safety gate step', () => {
      const workflowPath = path.join(
        __dirname,
        '..',
        '..',
        '.github',
        'workflows',
        'npm-publish.yml',
      );
      const workflow = fs.readFileSync(workflowPath, 'utf8');
      expect(workflow).toContain('Publish safety gate (INS-4.10)');
      expect(workflow).toContain('node bin/utils/validate-publish.js');
    });
  });

  describe('AC1/AC3: prepublishOnly wiring', () => {
    test('package.json prepublishOnly calls validate-publish.js first', () => {
      const pkgPath = path.join(__dirname, '..', '..', 'package.json');
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      expect(pkg.scripts.prepublishOnly).toMatch(/^node bin\/utils\/validate-publish\.js && /);
    });

    test('package.json has standalone validate:publish script', () => {
      const pkgPath = path.join(__dirname, '..', '..', 'package.json');
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      expect(pkg.scripts['validate:publish']).toBe('node bin/utils/validate-publish.js');
    });
  });

  describe('AC5: Behavioral validation (real execution)', () => {
    test('script runs successfully and proves public package excludes pro/', () => {
      const result = execSync(`node "${SCRIPT_PATH}" 2>&1`, {
        encoding: 'utf8',
        cwd: path.join(__dirname, '..', '..'),
        timeout: 330000,
      });
      expect(result).toContain('PUBLISH SAFETY GATE: PASS');
      expect(result).toContain('PASS: Public package excludes pro/ content');
    });

    test('script produces human-readable output with pass/fail indicators', () => {
      expect(scriptSource).toContain('PASS:');
      expect(scriptSource).toContain('FAIL:');
      expect(scriptSource).toContain('PUBLISH SAFETY GATE: PASS');
      expect(scriptSource).toContain('PUBLISH SAFETY GATE: FAIL');
    });
  });
});
