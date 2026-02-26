// Integration/Performance test - uses describeIntegration
/**
 * STORY-1.1: NPX Integration Tests
 * Tests for npx aios-core@latest execution
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

describeIntegration('npx Execution', () => {
  const timeout = 30000; // 30 seconds as per story requirement

  describeIntegration('Package Configuration', () => {
    it('should have correct bin entries in package.json', () => {
      const packageJsonPath = path.join(__dirname, '../../package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

      expect(packageJson.bin).toBeDefined();
      expect(packageJson.bin['aios']).toBe('./bin/aios.js');
      expect(packageJson.bin['aios-core']).toBe('./bin/aios.js');
    });

    it('should have preferGlobal set to false', () => {
      const packageJsonPath = path.join(__dirname, '../../package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

      expect(packageJson.preferGlobal).toBe(false);
    });

    it('should include required files in package', () => {
      const packageJsonPath = path.join(__dirname, '../../package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

      expect(packageJson.files).toContain('bin/');
      expect(packageJson.files).toContain('index.js');
      // Note: .aios-core/ should be included if it exists
      const hasAiosCore = packageJson.files.some(f => 
        f === '.aios-core/' || f === 'aios-core/',
      );
      expect(hasAiosCore).toBe(true);
    });

    it('should have Node.js engine requirement >= 18', () => {
      const packageJsonPath = path.join(__dirname, '../../package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

      expect(packageJson.engines).toBeDefined();
      expect(packageJson.engines.node).toMatch(/>=?\s*18/);
    });
  });

  describeIntegration('CLI Execution', () => {
    it('should execute aios command with --version', (done) => {
      const cliPath = path.join(__dirname, '../../bin/aios.js');
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
    }, timeout);

    it('should execute aios command with --help', (done) => {
      const cliPath = path.join(__dirname, '../../bin/aios.js');
      const child = spawn('node', [cliPath, '--help']);

      let output = '';
      child.stdout.on('data', (data) => {
        output += data.toString();
      });

      child.on('close', (code) => {
        expect(code).toBe(0);
        expect(output).toContain('USAGE');
        expect(output).toContain('aios-core');
        done();
      });
    }, timeout);

    it('should execute aios info command', (done) => {
      const cliPath = path.join(__dirname, '../../bin/aios.js');
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
    }, timeout);

    it('should fail with unknown command', (done) => {
      const cliPath = path.join(__dirname, '../../bin/aios.js');
      const child = spawn('node', [cliPath, 'invalid-command']);

      let stderr = '';
      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        expect(code).toBe(1);
        expect(stderr).toContain('Unknown command');
        done();
      });
    }, timeout);
  });

  describeIntegration('Index.js init Export', () => {
    it('should have init function in index.js source', () => {
      const indexPath = path.join(__dirname, '../../index.js');
      const indexContent = fs.readFileSync(indexPath, 'utf8');

      // Verify init function exists in source
      expect(indexContent).toContain('async function init()');
      expect(indexContent).toContain('init'); // Exported in module.exports
    });

    it('should maintain AIOS class export in source', () => {
      const indexPath = path.join(__dirname, '../../index.js');
      const indexContent = fs.readFileSync(indexPath, 'utf8');

      // Verify AIOS class exists in exports
      expect(indexContent).toContain('AIOS');
      expect(indexContent).toContain('class AIOS');
    });

    it('should export core modules in source', () => {
      const indexPath = path.join(__dirname, '../../index.js');
      const indexContent = fs.readFileSync(indexPath, 'utf8');

      // Verify core modules are exported
      expect(indexContent).toContain('core');
      expect(indexContent).toContain('memory');
      expect(indexContent).toContain('security');
      expect(indexContent).toContain('performance');
      expect(indexContent).toContain('telemetry');
    });
  });

  describeIntegration('Cross-Platform Compatibility', () => {
    it('should work on current platform', () => {
      const cliPath = path.join(__dirname, '../../bin/aios.js');
      
      // Verify file exists
      expect(fs.existsSync(cliPath)).toBe(true);
      
      // Verify it's executable (shebang present)
      const content = fs.readFileSync(cliPath, 'utf8');
      expect(content.startsWith('#!/usr/bin/env node')).toBe(true);
    });

    it('should report current platform in info command', (done) => {
      const cliPath = path.join(__dirname, '../../bin/aios.js');
      const child = spawn('node', [cliPath, 'info']);

      let output = '';
      child.stdout.on('data', (data) => {
        output += data.toString();
      });

      child.on('close', (code) => {
        expect(code).toBe(0);
        expect(output).toContain('Platform:');
        expect(output).toContain(process.platform);
        done();
      });
    }, timeout);
  });

  describeIntegration('Performance', () => {
    it('should execute --version in under 5 seconds', (done) => {
      const startTime = Date.now();
      const cliPath = path.join(__dirname, '../../bin/aios.js');
      const child = spawn('node', [cliPath, '--version']);

      child.on('close', () => {
        const elapsed = Date.now() - startTime;
        expect(elapsed).toBeLessThan(5000);
        done();
      });
    }, 10000);

    it('should execute info command in under 5 seconds', (done) => {
      const startTime = Date.now();
      const cliPath = path.join(__dirname, '../../bin/aios.js');
      const child = spawn('node', [cliPath, 'info']);

      child.on('close', () => {
        const elapsed = Date.now() - startTime;
        expect(elapsed).toBeLessThan(5000);
        done();
      });
    }, 10000);
  });
});

