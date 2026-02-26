/**
 * STORY-1.1: CLI Entry Point Unit Tests
 * Tests for bin/aios.js command routing and version checking
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

describe('CLI Entry Point', () => {
  const cliPath = path.join(__dirname, '../../bin/aios.js');

  describe('Node.js Version Check', () => {
    it('should have engines field in package.json requiring Node 18+', () => {
      // Version check is now enforced via package.json engines field
      const packageJsonPath = path.join(__dirname, '../../package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

      expect(packageJson.engines).toBeDefined();
      expect(packageJson.engines.node).toMatch(/>=\s*18/);
    });

    it('should have proper module structure', () => {
      const cliPath = path.join(__dirname, '../../bin/aios.js');
      const cliContent = fs.readFileSync(cliPath, 'utf8');

      // Verify CLI has proper structure
      expect(cliContent).toContain("require('path')");
      expect(cliContent).toContain("require('fs')");
      expect(cliContent).toContain('process.argv');
    });
  });

  describe('Command Routing', () => {
    it('should handle --version flag', (done) => {
      const child = spawn('node', [cliPath, '--version']);
      let output = '';

      child.stdout.on('data', (data) => {
        output += data.toString();
      });

      child.on('close', (code) => {
        expect(code).toBe(0);
        expect(output).toMatch(/\d+\.\d+\.\d+/);
        done();
      });
    });

    it('should handle --help flag', (done) => {
      const child = spawn('node', [cliPath, '--help']);
      let output = '';

      child.stdout.on('data', (data) => {
        output += data.toString();
      });

      child.on('close', (code) => {
        expect(code).toBe(0);
        expect(output).toContain('USAGE');
        expect(output).toContain('npx aios-core@latest');
        done();
      });
    });

    it('should handle info command', (done) => {
      const child = spawn('node', [cliPath, 'info']);
      let output = '';

      child.stdout.on('data', (data) => {
        output += data.toString();
      });

      child.on('close', (code) => {
        expect(code).toBe(0);
        expect(output).toContain('System Information');
        done();
      });
    });

    it('should handle doctor command', (done) => {
      const child = spawn('node', [cliPath, 'doctor']);
      let output = '';
      let errors = '';

      child.stdout.on('data', (data) => {
        output += data.toString();
      });

      child.stderr.on('data', (data) => {
        errors += data.toString();
      });

      child.on('close', (code) => {
        // Doctor may exit with 0 or 1 depending on system state
        const combined = output + errors;
        expect(combined).toContain('AIOS Doctor');
        done();
      });
    });

    it('should error on unknown command', (done) => {
      const child = spawn('node', [cliPath, 'unknown-command']);
      let errors = '';

      child.stderr.on('data', (data) => {
        errors += data.toString();
      });

      child.on('close', (code) => {
        expect(code).toBe(1);
        expect(errors).toContain('Unknown command');
        expect(errors).toContain('unknown-command');
        done();
      });
    });
  });

  describe('Shebang', () => {
    it('should have proper shebang for cross-platform compatibility', () => {
      const cliPath = path.join(__dirname, '../../bin/aios.js');
      const cliContent = fs.readFileSync(cliPath, 'utf8');
      
      expect(cliContent.startsWith('#!/usr/bin/env node')).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should show usage info when unknown command provided', (done) => {
      const child = spawn('node', [cliPath, 'invalid']);
      let errors = '';
      let output = '';

      child.stderr.on('data', (data) => {
        errors += data.toString();
      });

      child.stdout.on('data', (data) => {
        output += data.toString();
      });

      child.on('close', (code) => {
        expect(code).toBe(1);
        const combined = errors + output;
        expect(combined).toContain('Unknown command');
        expect(combined).toContain('--help');
        done();
      });
    }, 15000); // Increase timeout to 15s
  });
});
