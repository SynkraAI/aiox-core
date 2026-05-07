/**
 * Unit Tests: Dependency Validator
 */

'use strict';

const fs = require('fs');
const path = require('path');
const childProcess = require('child_process');
const { validateDependencies } = require('../../../../packages/installer/src/wizard/validation/validators/dependency-validator');

jest.mock('fs');
jest.mock('child_process');

function mockExecSuccess(payload) {
  childProcess.exec.mockImplementation((cmd, options, callback) => {
    const cb = typeof options === 'function' ? options : callback;
    cb(null, JSON.stringify(payload), '');
  });
}

function samePath(actual, expected) {
  return path.normalize(String(actual)) === path.normalize(String(expected));
}

function projectFile(projectPath, ...segments) {
  return path.join(projectPath, ...segments);
}

describe('Dependency Validator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fs.statSync.mockImplementation(() => ({ isDirectory: () => true }));
  });

  it('uses the provided projectPath and skips installer-only dependency checks by default', async () => {
    const projectPath = '/tmp/aiox-project';

    fs.existsSync.mockImplementation((targetPath) => (
      samePath(targetPath, projectFile(projectPath, 'package.json'))
      || samePath(targetPath, projectFile(projectPath, 'node_modules'))
      || samePath(targetPath, projectFile(projectPath, 'node_modules', 'react'))
    ));
    fs.readFileSync.mockReturnValue(JSON.stringify({
      name: 'demo-app',
      dependencies: {
        react: '^19.0.0',
      },
    }));
    fs.readdirSync.mockReturnValue(['react']);
    mockExecSuccess({
      metadata: {
        vulnerabilities: { low: 0, moderate: 0, high: 0, critical: 0 },
      },
    });

    const result = await validateDependencies({
      success: true,
      packageManager: 'npm',
      projectPath,
    });

    expect(result.success).toBe(true);
    expect(result.warnings).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'CRITICAL_DEPS_MISSING' }),
      ]),
    );
    expect(result.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          component: 'Dependency Contract',
          status: 'skipped',
        }),
      ]),
    );
    expect(childProcess.exec).toHaveBeenCalledWith(
      'npm audit --json',
      expect.objectContaining({ cwd: projectPath, timeout: 10000 }),
      expect.any(Function),
    );
  });

  it('warns when an explicit required dependency is missing from node_modules', async () => {
    const projectPath = '/tmp/aiox-project';

    fs.existsSync.mockImplementation((targetPath) => (
      samePath(targetPath, projectFile(projectPath, 'package.json'))
      || samePath(targetPath, projectFile(projectPath, 'node_modules'))
      || samePath(targetPath, projectFile(projectPath, 'node_modules', 'react'))
    ));
    fs.readFileSync.mockReturnValue(JSON.stringify({
      name: 'demo-app',
      dependencies: {
        react: '^19.0.0',
      },
    }));
    fs.readdirSync.mockReturnValue(['react']);
    mockExecSuccess({
      metadata: {
        vulnerabilities: { low: 0, moderate: 0, high: 0, critical: 0 },
      },
    });

    const result = await validateDependencies({
      success: true,
      packageManager: 'npm',
      projectPath,
      requiredDependencies: ['react', 'yaml'],
    });

    expect(result.success).toBe(true);
    expect(result.warnings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'CRITICAL_DEPS_MISSING',
          message: expect.stringContaining('yaml'),
        }),
      ]),
    );
  });

  it('treats greenfield projects with no package.json dependencies as a skipped dependency check', async () => {
    const projectPath = '/tmp/aiox-greenfield';

    fs.existsSync.mockImplementation(() => false);

    const result = await validateDependencies({
      success: true,
      projectPath,
    });

    expect(result.success).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          component: 'Dependencies',
          status: 'skipped',
          message: 'No dependencies defined in package.json (greenfield project)',
        }),
      ]),
    );
  });

  it('fails when package.json declares dependencies but node_modules is missing', async () => {
    const projectPath = '/tmp/aiox-broken';

    fs.existsSync.mockImplementation((targetPath) => samePath(targetPath, projectFile(projectPath, 'package.json')));
    fs.readFileSync.mockReturnValue(JSON.stringify({
      name: 'demo-app',
      dependencies: {
        react: '^19.0.0',
      },
    }));

    const result = await validateDependencies({
      success: true,
      projectPath,
    });

    expect(result.success).toBe(false);
    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'NODE_MODULES_MISSING' }),
      ]),
    );
  });
});
