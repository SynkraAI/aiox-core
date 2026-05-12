/**
 * Integration Tests - Story 12.9 Task 8.3
 *
 * Tests for local npx execution and package integrity.
 * These tests verify the package works correctly when installed via npx.
 */

'use strict';

const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

const PKG_DIR = path.resolve(__dirname, '../../../packages/aiox-install');

describe('Integration - Task 8.3: Local NPX Execution', () => {
  const runNpxIntegration = process.env.RUN_NPX_INTEGRATION === '1';
  describe('Package Structure Validation', () => {
    it('should have valid package.json', () => {
      // Given
      const pkgJsonPath = path.join(PKG_DIR, 'package.json');

      // When
      const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));

      // Then
      expect(pkgJson.name).toBe('@synkra/aiox-install');
      expect(pkgJson.bin).toBeDefined();
      expect(pkgJson.bin['aiox-install']).toBe('./bin/aiox-install.js');
      expect(pkgJson.bin['edmcp']).toBe('./bin/edmcp.js');
    });

    it('should have all required files in package', () => {
      // Given
      const requiredFiles = [
        'package.json',
        'README.md',
        'bin/aiox-install.js',
        'bin/edmcp.js',
        'src/installer.js',
        'src/os-detector.js',
        'src/dep-checker.js',
        'src/edmcp/index.js',
      ];

      // When/Then
      for (const file of requiredFiles) {
        const filePath = path.join(PKG_DIR, file);
        expect(fs.existsSync(filePath)).toBe(true);
      }
    });

    it('should have executable shebang in bin files', () => {
      // Given
      const binFiles = ['bin/aiox-install.js', 'bin/edmcp.js'];
      const expectedShebang = '#!/usr/bin/env node';

      // When/Then
      for (const file of binFiles) {
        const content = fs.readFileSync(path.join(PKG_DIR, file), 'utf8');
        expect(content.startsWith(expectedShebang)).toBe(true);
      }
    });

    it('should have correct Node.js engine requirement', () => {
      // Given
      const pkgJsonPath = path.join(PKG_DIR, 'package.json');

      // When
      const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));

      // Then
      expect(pkgJson.engines).toBeDefined();
      expect(pkgJson.engines.node).toBe('>=18.0.0');
    });

    it('should have all required dependencies declared', () => {
      // Given
      const pkgJsonPath = path.join(PKG_DIR, 'package.json');
      const requiredDeps = [
        '@clack/prompts',
        'chalk',
        'commander',
        'execa',
        'fs-extra',
        'js-yaml',
        'ora',
        'semver',
      ];

      // When
      const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));

      // Then
      for (const dep of requiredDeps) {
        expect(pkgJson.dependencies[dep]).toBeDefined();
      }
    });

    it('should have publishConfig for public access', () => {
      // Given
      const pkgJsonPath = path.join(PKG_DIR, 'package.json');

      // When
      const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));

      // Then
      expect(pkgJson.publishConfig).toBeDefined();
      expect(pkgJson.publishConfig.access).toBe('public');
    });
  });

  describe('CLI Execution Tests', () => {
    it('should execute aiox-install --version via node', () => {
      // Given
      const binPath = path.join(PKG_DIR, 'bin/aiox-install.js');

      // When
      const result = execSync(`node "${binPath}" --version`, {
        encoding: 'utf8',
        timeout: 10000,
      }).trim();

      // Then
      expect(result).toMatch(/^\d+\.\d+\.\d+$/);
    });

    it('should execute edmcp --version via node', () => {
      // Given
      const binPath = path.join(PKG_DIR, 'bin/edmcp.js');

      // When
      const result = execSync(`node "${binPath}" --version`, {
        encoding: 'utf8',
        timeout: 10000,
      }).trim();

      // Then
      expect(result).toMatch(/^\d+\.\d+\.\d+$/);
    });

    it('should show help for aiox-install', () => {
      // Given
      const binPath = path.join(PKG_DIR, 'bin/aiox-install.js');

      // When
      const result = execSync(`node "${binPath}" --help`, {
        encoding: 'utf8',
        timeout: 10000,
      });

      // Then
      expect(result).toContain('aiox-install');
      expect(result).toContain('--dry-run');
      expect(result).toContain('--verbose');
      expect(result).toContain('--profile');
    });

    it('should show help for edmcp', () => {
      // Given
      const binPath = path.join(PKG_DIR, 'bin/edmcp.js');

      // When
      const result = execSync(`node "${binPath}" --help`, {
        encoding: 'utf8',
        timeout: 10000,
      });

      // Then
      expect(result).toContain('edmcp');
      expect(result).toContain('list');
      expect(result).toContain('add');
      expect(result).toContain('remove');
    });

    it('should handle invalid arguments gracefully', () => {
      // Given
      const binPath = path.join(PKG_DIR, 'bin/aiox-install.js');

      // When
      const result = execSync(`node "${binPath}" --invalid-flag 2>&1 || true`, {
        encoding: 'utf8',
        timeout: 10000,
      });

      // Then
      expect(result).toContain('error');
    });
  });

  describe('Module Loading Tests', () => {
    it('should be able to require installer module', () => {
      // Given/When
      const installer = require(path.join(PKG_DIR, 'src/installer.js'));

      // Then
      expect(installer.runInstaller).toBeDefined();
      expect(typeof installer.runInstaller).toBe('function');
    });

    it('should be able to require os-detector module', () => {
      // Given/When
      const osDetector = require(path.join(PKG_DIR, 'src/os-detector.js'));

      // Then
      expect(osDetector.detectOS).toBeDefined();
      expect(typeof osDetector.detectOS).toBe('function');
    });

    it('should be able to require dep-checker module', () => {
      // Given/When
      const depChecker = require(path.join(PKG_DIR, 'src/dep-checker.js'));

      // Then
      expect(depChecker.checkAllDependencies).toBeDefined();
      expect(typeof depChecker.checkAllDependencies).toBe('function');
    });

    it('should be able to require edmcp module', () => {
      // Given/When
      const edmcp = require(path.join(PKG_DIR, 'src/edmcp/index.js'));

      // Then
      expect(edmcp.listMcps).toBeDefined();
      expect(edmcp.addMcp).toBeDefined();
      expect(edmcp.removeMcp).toBeDefined();
    });
  });

  (runNpxIntegration ? describe : describe.skip)('NPX Local Execution Simulation', () => {
    it('should execute via npm exec (simulates npx .)', () => {
      // Given - We simulate npx . by running npm exec in the package directory

      // When
      const result = execSync('npm exec -- aiox-install --version', {
        cwd: PKG_DIR,
        encoding: 'utf8',
        timeout: 90000,
        env: { ...process.env, npm_config_yes: 'true' },
      }).trim();

      // Then
      expect(result).toMatch(/\d+\.\d+\.\d+/);
    });

    it('should execute edmcp via npm exec', () => {
      // Given

      // When
      const result = execSync('npm exec -- edmcp --version', {
        cwd: PKG_DIR,
        encoding: 'utf8',
        timeout: 90000,
        env: { ...process.env, npm_config_yes: 'true' },
      }).trim();

      // Then
      expect(result).toMatch(/\d+\.\d+\.\d+/);
    });
  });

  describe('Version Consistency', () => {
    it('should have consistent version across package.json and CLI output', () => {
      // Given
      const pkgJsonPath = path.join(PKG_DIR, 'package.json');
      const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
      const binPath = path.join(PKG_DIR, 'bin/aiox-install.js');

      // When
      const cliVersion = execSync(`node "${binPath}" --version`, {
        encoding: 'utf8',
        timeout: 10000,
      }).trim();

      // Then
      expect(cliVersion).toBe(pkgJson.version);
    });
  });
});
