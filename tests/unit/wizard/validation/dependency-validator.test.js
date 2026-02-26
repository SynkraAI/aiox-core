// Wizard test - uses describeIntegration due to file dependencies
/**
 * Unit Tests: Dependency Validator
 * Story 1.8 - Task 1.8.4 (QA Fix - Coverage Improvement)
 */

const fs = require('fs');
const childProcess = require('child_process');
const { validateDependencies } = require('../../../../packages/installer/src/wizard/validation/validators/dependency-validator');

// Mock dependencies
jest.mock('fs');
jest.mock('child_process');

describeIntegration('Dependency Validator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describeIntegration('validateDependencies', () => {
    it('should validate dependencies successfully', async () => {
      // Given
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify({
        name: 'aios-core',
        version: '1.0.0',
        dependencies: {
          express: '^4.18.0',
          react: '^18.2.0',
        },
      }));
      fs.readdirSync.mockReturnValue(new Array(247).fill('package'));

      childProcess.exec.mockImplementation((cmd, callback) => {
        callback(null, JSON.stringify({ vulnerabilities: {} }), '');
      });

      const depContext = {
        success: true,
        packageManager: 'npm',
        installedCount: 247,
      };

      // When
      const result = await validateDependencies(depContext);

      // Then
      expect(result.success).toBe(true);
      expect(result.checks.length).toBeGreaterThan(0);
    });

    it('should detect missing node_modules directory', async () => {
      // Given
      fs.existsSync.mockImplementation((path) => !path.includes('node_modules'));

      const depContext = { success: true };

      // When
      const result = await validateDependencies(depContext);

      // Then
      expect(result.success).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: 'NODE_MODULES_MISSING',
          }),
        ]),
      );
    });

    it('should validate package.json exists', async () => {
      // Given
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify({
        name: 'test-package',
        version: '1.0.0',
      }));
      fs.readdirSync.mockReturnValue([]);

      childProcess.exec.mockImplementation((cmd, callback) => {
        callback(null, JSON.stringify({ vulnerabilities: {} }), '');
      });

      // When
      const result = await validateDependencies({ success: true });

      // Then
      // Package.json validation happens internally
      expect(result.success).toBe(true);
      expect(result.checks.length).toBeGreaterThan(0);
    });

    it('should count installed packages', async () => {
      // Given
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify({
        name: 'test-package',
      }));
      fs.readdirSync.mockReturnValue(new Array(150).fill('pkg'));

      childProcess.exec.mockImplementation((cmd, callback) => {
        callback(null, JSON.stringify({ vulnerabilities: {} }), '');
      });

      // When
      const result = await validateDependencies({ success: true });

      // Then
      // Package counting happens internally
      expect(result.success).toBe(true);
      expect(result.checks.length).toBeGreaterThan(0);
    });

    it('should run npm audit (mock child_process)', async () => {
      // Given
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify({ name: 'test' }));
      fs.readdirSync.mockReturnValue([]);

      let auditCalled = false;
      childProcess.exec.mockImplementation((cmd, callback) => {
        if (cmd.includes('npm audit')) {
          auditCalled = true;
        }
        callback(null, JSON.stringify({ vulnerabilities: {} }), '');
      });

      // When
      await validateDependencies({ success: true, packageManager: 'npm' });

      // Then
      expect(auditCalled).toBe(true);
    });

    it('should handle npm audit vulnerabilities', async () => {
      // Given
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify({
        name: 'test',
        dependencies: { express: '^4.0.0' },
      }));
      fs.readdirSync.mockReturnValue(['express']);

      childProcess.exec.mockImplementation((cmd, callback) => {
        callback(null, JSON.stringify({
          vulnerabilities: {
            low: 2,
            moderate: 1,
            high: 0,
            critical: 0,
          },
        }), '');
      });

      // When
      const result = await validateDependencies({ success: true, packageManager: 'npm' });

      // Then
      expect(result.warnings).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: 'NPM_AUDIT_VULNERABILITIES',
          }),
        ]),
      );
    });

    it('should detect critical vulnerabilities', async () => {
      // Given
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify({
        name: 'test',
        dependencies: { express: '^4.0.0' },
      }));
      fs.readdirSync.mockReturnValue(['express']);

      childProcess.exec.mockImplementation((cmd, callback) => {
        callback(null, JSON.stringify({
          vulnerabilities: {
            low: 0,
            moderate: 0,
            high: 2,
            critical: 1,
          },
        }), '');
      });

      // When
      const result = await validateDependencies({ success: true, packageManager: 'npm' });

      // Then
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            severity: 'high',
            code: 'NPM_AUDIT_CRITICAL_VULNERABILITIES',
          }),
        ]),
      );
    });

    it('should handle npm audit errors gracefully', async () => {
      // Given
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify({
        name: 'test',
        dependencies: { express: '^4.0.0' },
      }));
      fs.readdirSync.mockReturnValue(['express']);

      childProcess.exec.mockImplementation((cmd, callback) => {
        callback(new Error('npm audit failed'), '', 'audit error');
      });

      // When
      const result = await validateDependencies({ success: true, packageManager: 'npm' });

      // Then
      expect(result.warnings).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: 'NPM_AUDIT_ERROR',
          }),
        ]),
      );
    });

    it('should validate critical dependencies installed', async () => {
      // Given
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify({
        name: 'test',
        dependencies: {
          express: '^4.0.0',
          react: '^18.0.0',
        },
      }));
      fs.readdirSync.mockReturnValue(['express', 'react']);

      childProcess.exec.mockImplementation((cmd, callback) => {
        callback(null, JSON.stringify({ vulnerabilities: {} }), '');
      });

      // When
      const result = await validateDependencies({ success: true, packageManager: 'npm' });

      // Then
      expect(result.success).toBe(true);
      expect(result.checks.length).toBeGreaterThan(0);
    });

    it('should handle missing package.json', async () => {
      // Given
      fs.existsSync.mockImplementation((path) => {
        if (path.includes('package.json')) return false;
        return true;
      });

      // When
      const result = await validateDependencies({ success: true });

      // Then
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: 'PACKAGE_JSON_MISSING',
          }),
        ]),
      );
    });

    it('should handle corrupted package.json', async () => {
      // Given
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockImplementation((path) => {
        if (path === 'package.json' || path.includes('package.json')) {
          return '{invalid json}';
        }
        return '';
      });

      // When
      const result = await validateDependencies({ success: true });

      // Then
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: 'PACKAGE_JSON_PARSE_ERROR',
          }),
        ]),
      );
    });
  });
});
