/**
 * Permission Mode Tests
 *
 * Tests for the permission mode system (Epic 6)
 */

const { PermissionMode } = require('../permission-mode');
const { OperationGuard } = require('../operation-guard');
const path = require('path');
const fs = require('fs').promises;
const os = require('os');

describe('PermissionMode', () => {
  let tempDir;
  let mode;

  beforeEach(async () => {
    // Create temp directory for tests
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'aios-test-'));
    await fs.mkdir(path.join(tempDir, '.aios'), { recursive: true });
    mode = new PermissionMode(tempDir);
  });

  afterEach(async () => {
    // Cleanup temp directory
    try {
      await fs.rm(tempDir, { recursive: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('load()', () => {
    it('should default to "ask" mode when no config exists', async () => {
      const result = await mode.load();
      expect(result).toBe('ask');
      expect(mode.currentMode).toBe('ask');
    });

    it('should load mode from config file', async () => {
      await fs.writeFile(
        path.join(tempDir, '.aios', 'config.yaml'),
        'permissions:\n  mode: auto\n'
      );

      const result = await mode.load();
      expect(result).toBe('auto');
    });

    it('should fallback to "ask" for invalid mode in config', async () => {
      await fs.writeFile(
        path.join(tempDir, '.aios', 'config.yaml'),
        'permissions:\n  mode: invalid_mode\n'
      );

      const result = await mode.load();
      expect(result).toBe('ask');
    });
  });

  describe('setMode()', () => {
    it('should set mode and persist to config', async () => {
      const result = await mode.setMode('auto');

      expect(result.mode).toBe('auto');
      expect(mode.currentMode).toBe('auto');

      // Verify persisted
      const configContent = await fs.readFile(path.join(tempDir, '.aios', 'config.yaml'), 'utf-8');
      expect(configContent).toContain('mode: auto');
    });

    it('should handle alias "yolo" for "auto"', async () => {
      const result = await mode.setMode('yolo');
      expect(result.mode).toBe('auto');
    });

    it('should handle alias "safe" for "explore"', async () => {
      const result = await mode.setMode('safe');
      expect(result.mode).toBe('explore');
    });

    it('should throw error for invalid mode', async () => {
      await expect(mode.setMode('invalid')).rejects.toThrow('Invalid mode');
    });
  });

  describe('getBadge()', () => {
    it('should return correct badge for each mode', async () => {
      mode.currentMode = 'explore';
      expect(mode.getBadge()).toBe('[🔍 Explore]');

      mode.currentMode = 'ask';
      expect(mode.getBadge()).toBe('[⚠️ Ask]');

      mode.currentMode = 'auto';
      expect(mode.getBadge()).toBe('[⚡ Auto]');
    });
  });

  describe('canPerform()', () => {
    it('should allow all reads in all modes', () => {
      for (const modeName of ['explore', 'ask', 'auto']) {
        mode.currentMode = modeName;
        const result = mode.canPerform('read');
        expect(result.allowed).toBe(true);
      }
    });

    it('should block writes in explore mode', () => {
      mode.currentMode = 'explore';
      const result = mode.canPerform('write');
      expect(result.allowed).toBe(false);
    });

    it('should require confirmation for writes in ask mode', () => {
      mode.currentMode = 'ask';
      const result = mode.canPerform('write');
      expect(result.allowed).toBe('confirm');
    });

    it('should allow writes in auto mode', () => {
      mode.currentMode = 'auto';
      const result = mode.canPerform('write');
      expect(result.allowed).toBe(true);
    });
  });

  describe('cycleMode()', () => {
    it('should cycle through modes correctly', async () => {
      mode.currentMode = 'explore';
      mode._loaded = true;

      let result = await mode.cycleMode();
      expect(result.mode).toBe('ask');

      result = await mode.cycleMode();
      expect(result.mode).toBe('auto');

      result = await mode.cycleMode();
      expect(result.mode).toBe('explore');
    });
  });

  describe('isAutonomous()', () => {
    it('should return true only for auto mode', () => {
      mode.currentMode = 'auto';
      expect(mode.isAutonomous()).toBe(true);

      mode.currentMode = 'ask';
      expect(mode.isAutonomous()).toBe(false);

      mode.currentMode = 'explore';
      expect(mode.isAutonomous()).toBe(false);
    });
  });

  describe('isReadOnly()', () => {
    it('should return true only for explore mode', () => {
      mode.currentMode = 'explore';
      expect(mode.isReadOnly()).toBe(true);

      mode.currentMode = 'ask';
      expect(mode.isReadOnly()).toBe(false);

      mode.currentMode = 'auto';
      expect(mode.isReadOnly()).toBe(false);
    });
  });
});

describe('OperationGuard', () => {
  let mode;
  let guard;

  beforeEach(() => {
    mode = new PermissionMode();
    mode._loaded = true;
    guard = new OperationGuard(mode);
  });

  describe('classifyOperation()', () => {
    it('should classify Read tool as read', () => {
      expect(guard.classifyOperation('Read', {})).toBe('read');
    });

    it('should classify Write tool as write', () => {
      expect(guard.classifyOperation('Write', {})).toBe('write');
    });

    it('should classify Edit tool as write', () => {
      expect(guard.classifyOperation('Edit', {})).toBe('write');
    });

    it('should classify Glob tool as read', () => {
      expect(guard.classifyOperation('Glob', {})).toBe('read');
    });

    it('should classify Grep tool as read', () => {
      expect(guard.classifyOperation('Grep', {})).toBe('read');
    });
  });

  describe('classifyBashCommand()', () => {
    it('should classify git status as read', () => {
      expect(guard.classifyBashCommand('git status')).toBe('read');
    });

    it('should classify ls as read', () => {
      expect(guard.classifyBashCommand('ls -la')).toBe('read');
    });

    it('should classify git push as write', () => {
      expect(guard.classifyBashCommand('git push origin main')).toBe('write');
    });

    it('should classify rm -rf as delete', () => {
      expect(guard.classifyBashCommand('rm -rf node_modules')).toBe('delete');
    });

    it('should classify git reset --hard as delete', () => {
      expect(guard.classifyBashCommand('git reset --hard HEAD')).toBe('delete');
    });

    it('should classify npm install as write', () => {
      expect(guard.classifyBashCommand('npm install lodash')).toBe('write');
    });

    it('should classify mkdir as write', () => {
      expect(guard.classifyBashCommand('mkdir new_dir')).toBe('write');
    });
  });

  describe('guard()', () => {
    it('should allow read operations in all modes', async () => {
      for (const modeName of ['explore', 'ask', 'auto']) {
        mode.currentMode = modeName;
        const result = await guard.guard('Read', { file_path: 'test.js' });
        expect(result.proceed).toBe(true);
      }
    });

    it('should block write in explore mode', async () => {
      mode.currentMode = 'explore';
      const result = await guard.guard('Write', { file_path: 'test.js' });
      expect(result.proceed).toBe(false);
      expect(result.blocked).toBe(true);
    });

    it('should request confirmation for write in ask mode', async () => {
      mode.currentMode = 'ask';
      const result = await guard.guard('Write', { file_path: 'test.js' });
      expect(result.proceed).toBe(false);
      expect(result.needsConfirmation).toBe(true);
    });

    it('should allow write in auto mode', async () => {
      mode.currentMode = 'auto';
      const result = await guard.guard('Write', { file_path: 'test.js' });
      expect(result.proceed).toBe(true);
    });

    it('should block destructive bash commands in explore mode', async () => {
      mode.currentMode = 'explore';
      const result = await guard.guard('Bash', { command: 'rm -rf temp' });
      expect(result.proceed).toBe(false);
      expect(result.blocked).toBe(true);
    });

    it('should allow safe bash commands in explore mode', async () => {
      mode.currentMode = 'explore';
      const result = await guard.guard('Bash', { command: 'git status' });
      expect(result.proceed).toBe(true);
    });
  });

  describe('getStats()', () => {
    it('should track operation statistics', async () => {
      mode.currentMode = 'auto';

      await guard.guard('Read', {});
      await guard.guard('Write', {});
      await guard.guard('Bash', { command: 'rm -rf x' });

      const stats = guard.getStats();
      expect(stats.total).toBe(3);
      expect(stats.byOperation.read).toBe(1);
      expect(stats.byOperation.write).toBe(1);
      expect(stats.byOperation.delete).toBe(1);
    });
  });
});
