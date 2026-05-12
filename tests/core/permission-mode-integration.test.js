/**
 * Permission Mode Integration Tests
 *
 * Story: ACT-4 - PermissionMode Integration Fix
 * Epic: EPIC-ACT - Unified Agent Activation Pipeline
 *
 * Tests that PermissionMode and OperationGuard are properly wired
 * and enforce permission checks during agent operations.
 *
 * @author @dev (Dex)
 * @version 1.0.0
 */

const path = require('path');
const fs = require('fs');
const os = require('os');

const { PermissionMode } = require('../../.aiox-core/core/permissions/permission-mode');
const { OperationGuard } = require('../../.aiox-core/core/permissions/operation-guard');
const {
  createGuard,
  checkOperation,
  getModeBadge,
  setMode,
  cycleMode,
  enforcePermission,
} = require('../../.aiox-core/core/permissions');

describe('Permission Mode Integration (Story ACT-4)', () => {
  let tempDir;
  let configPath;

  beforeEach(() => {
    tempDir = path.join(os.tmpdir(), `permission-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    const aioxDir = path.join(tempDir, '.aiox');
    fs.mkdirSync(aioxDir, { recursive: true });
    configPath = path.join(aioxDir, 'config.yaml');
  });

  afterEach(() => {
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  // --- AC 1: environment-bootstrap creates config with permissions.mode: ask ---
  describe('AC1: Default permission mode initialization', () => {
    test('PermissionMode defaults to "ask" when config file does not exist', async () => {
      const emptyDir = path.join(os.tmpdir(), `perm-empty-${Date.now()}`);
      fs.mkdirSync(emptyDir, { recursive: true });

      try {
        const mode = new PermissionMode(emptyDir);
        const loaded = await mode.load();
        expect(loaded).toBe('ask');
        expect(mode.currentMode).toBe('ask');
      } finally {
        fs.rmSync(emptyDir, { recursive: true, force: true });
      }
    });

    test('PermissionMode reads "ask" from config when set', async () => {
      fs.writeFileSync(configPath, 'permissions:\n  mode: ask\n');
      const mode = new PermissionMode(tempDir);
      const loaded = await mode.load();
      expect(loaded).toBe('ask');
    });

    test('PermissionMode falls back to "ask" for invalid mode in config', async () => {
      fs.writeFileSync(configPath, 'permissions:\n  mode: invalid-mode\n');

      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      const mode = new PermissionMode(tempDir);
      const loaded = await mode.load();
      expect(loaded).toBe('ask');
      warnSpy.mockRestore();
    });
  });

  // --- AC 4: Explore mode blocks file writes and git operations ---
  describe('AC4: Explore mode (read-only) prevents writes', () => {
    let guard;

    beforeEach(async () => {
      fs.writeFileSync(configPath, 'permissions:\n  mode: explore\n');
      const mode = new PermissionMode(tempDir);
      await mode.load();
      guard = new OperationGuard(mode);
    });

    test('explore mode allows Read tool', async () => {
      const result = await guard.guard('Read', { file_path: '/some/file.js' });
      expect(result.proceed).toBe(true);
      expect(result.operation).toBe('read');
    });

    test('explore mode allows Grep tool', async () => {
      const result = await guard.guard('Grep', { pattern: 'test' });
      expect(result.proceed).toBe(true);
    });

    test('explore mode allows Glob tool', async () => {
      const result = await guard.guard('Glob', { pattern: '**/*.js' });
      expect(result.proceed).toBe(true);
    });

    test('explore mode blocks Write tool', async () => {
      const result = await guard.guard('Write', { file_path: '/some/file.js', content: 'test' });
      expect(result.proceed).toBe(false);
      expect(result.blocked).toBe(true);
      expect(result.message).toContain('Explore');
    });

    test('explore mode blocks Edit tool', async () => {
      const result = await guard.guard('Edit', { file_path: '/some/file.js', old_string: 'a', new_string: 'b' });
      expect(result.proceed).toBe(false);
      expect(result.blocked).toBe(true);
    });

    test('explore mode blocks git commit via Bash', async () => {
      const result = await guard.guard('Bash', { command: 'git commit -m "test"' });
      expect(result.proceed).toBe(false);
      expect(result.blocked).toBe(true);
    });

    test('explore mode blocks git push via Bash', async () => {
      const result = await guard.guard('Bash', { command: 'git push origin main' });
      expect(result.proceed).toBe(false);
      expect(result.blocked).toBe(true);
    });

    test('explore mode allows git status via Bash', async () => {
      const result = await guard.guard('Bash', { command: 'git status' });
      expect(result.proceed).toBe(true);
    });

    test('explore mode allows git log via Bash', async () => {
      const result = await guard.guard('Bash', { command: 'git log --oneline -5' });
      expect(result.proceed).toBe(true);
    });

    test('explore mode blocks rm -rf via Bash', async () => {
      const result = await guard.guard('Bash', { command: 'rm -rf node_modules' });
      expect(result.proceed).toBe(false);
      expect(result.blocked).toBe(true);
    });
  });

  // --- AC 5: Ask mode prompts for confirmation on destructive ops ---
  describe('AC5: Ask mode (default) prompts for confirmation', () => {
    let guard;

    beforeEach(async () => {
      fs.writeFileSync(configPath, 'permissions:\n  mode: ask\n');
      const mode = new PermissionMode(tempDir);
      await mode.load();
      guard = new OperationGuard(mode);
    });

    test('ask mode allows Read tool without confirmation', async () => {
      const result = await guard.guard('Read', { file_path: '/some/file.js' });
      expect(result.proceed).toBe(true);
    });

    test('ask mode requires confirmation for Write tool', async () => {
      const result = await guard.guard('Write', { file_path: '/some/file.js' });
      expect(result.proceed).toBe(false);
      expect(result.needsConfirmation).toBe(true);
      expect(result.message).toContain('Confirmation Required');
    });

    test('ask mode requires confirmation for Edit tool', async () => {
      const result = await guard.guard('Edit', { file_path: '/some/file.js' });
      expect(result.proceed).toBe(false);
      expect(result.needsConfirmation).toBe(true);
    });

    test('ask mode requires confirmation for git commit', async () => {
      const result = await guard.guard('Bash', { command: 'git commit -m "test"' });
      expect(result.proceed).toBe(false);
      expect(result.needsConfirmation).toBe(true);
    });

    test('ask mode requires confirmation for rm command', async () => {
      const result = await guard.guard('Bash', { command: 'rm -rf dist' });
      expect(result.proceed).toBe(false);
      expect(result.needsConfirmation).toBe(true);
    });

    test('ask mode allows git status without confirmation', async () => {
      const result = await guard.guard('Bash', { command: 'git status' });
      expect(result.proceed).toBe(true);
    });
  });

  // --- AC 6: Auto mode allows all operations ---
  describe('AC6: Auto mode allows all operations', () => {
    let guard;

    beforeEach(async () => {
      fs.writeFileSync(configPath, 'permissions:\n  mode: auto\n');
      const mode = new PermissionMode(tempDir);
      await mode.load();
      guard = new OperationGuard(mode);
    });

    test('auto mode allows Read tool', async () => {
      const result = await guard.guard('Read', { file_path: '/some/file.js' });
      expect(result.proceed).toBe(true);
    });

    test('auto mode allows Write tool', async () => {
      const result = await guard.guard('Write', { file_path: '/some/file.js' });
      expect(result.proceed).toBe(true);
    });

    test('auto mode allows Edit tool', async () => {
      const result = await guard.guard('Edit', { file_path: '/some/file.js' });
      expect(result.proceed).toBe(true);
    });

    test('auto mode allows git commit', async () => {
      const result = await guard.guard('Bash', { command: 'git commit -m "test"' });
      expect(result.proceed).toBe(true);
    });

    test('auto mode allows git push', async () => {
      const result = await guard.guard('Bash', { command: 'git push origin main' });
      expect(result.proceed).toBe(true);
    });

    test('auto mode allows rm -rf', async () => {
      const result = await guard.guard('Bash', { command: 'rm -rf node_modules' });
      expect(result.proceed).toBe(true);
    });

    test('auto mode allows npm install', async () => {
      const result = await guard.guard('Bash', { command: 'npm install express' });
      expect(result.proceed).toBe(true);
    });
  });

  // --- AC 7: Badge reflects current mode ---
  describe('AC7: Badge display reflects current mode', () => {
    test('badge shows [Explore] for explore mode', async () => {
      fs.writeFileSync(configPath, 'permissions:\n  mode: explore\n');
      const badge = await getModeBadge(tempDir);
      expect(badge).toContain('Explore');
      expect(badge).toContain('🔍');
    });

    test('badge shows [Ask] for ask mode', async () => {
      fs.writeFileSync(configPath, 'permissions:\n  mode: ask\n');
      const badge = await getModeBadge(tempDir);
      expect(badge).toContain('Ask');
      expect(badge).toContain('⚠️');
    });

    test('badge shows [Auto] for auto mode', async () => {
      fs.writeFileSync(configPath, 'permissions:\n  mode: auto\n');
      const badge = await getModeBadge(tempDir);
      expect(badge).toContain('Auto');
      expect(badge).toContain('⚡');
    });

    test('badge defaults to [Ask] when config missing', async () => {
      const emptyDir = path.join(os.tmpdir(), `badge-empty-${Date.now()}`);
      fs.mkdirSync(emptyDir, { recursive: true });
      try {
        const badge = await getModeBadge(emptyDir);
        expect(badge).toContain('Ask');
      } finally {
        fs.rmSync(emptyDir, { recursive: true, force: true });
      }
    });
  });

  // --- AC 2: *yolo command cycles modes ---
  describe('AC2: *yolo toggle cycles modes correctly', () => {
    test('cycles from ask to auto', async () => {
      fs.writeFileSync(configPath, 'permissions:\n  mode: ask\n');
      const result = await cycleMode(tempDir);
      expect(result.mode).toBe('auto');
      expect(result.badge).toContain('Auto');
    });

    test('cycles from auto to explore', async () => {
      fs.writeFileSync(configPath, 'permissions:\n  mode: auto\n');
      const result = await cycleMode(tempDir);
      expect(result.mode).toBe('explore');
      expect(result.badge).toContain('Explore');
    });

    test('cycles from explore back to ask', async () => {
      fs.writeFileSync(configPath, 'permissions:\n  mode: explore\n');
      const result = await cycleMode(tempDir);
      expect(result.mode).toBe('ask');
      expect(result.badge).toContain('Ask');
    });

    test('full cycle: ask -> auto -> explore -> ask', async () => {
      fs.writeFileSync(configPath, 'permissions:\n  mode: ask\n');

      // ask -> auto
      let result = await cycleMode(tempDir);
      expect(result.mode).toBe('auto');

      // auto -> explore
      result = await cycleMode(tempDir);
      expect(result.mode).toBe('explore');

      // explore -> ask
      result = await cycleMode(tempDir);
      expect(result.mode).toBe('ask');
    });

    test('cycleMode persists the new mode to config file', async () => {
      fs.writeFileSync(configPath, 'permissions:\n  mode: ask\n');
      await cycleMode(tempDir);

      // Read config directly to verify persistence
      const configContent = fs.readFileSync(configPath, 'utf-8');
      expect(configContent).toContain('mode: auto');
    });

    test('cycleMode returns a message string', async () => {
      fs.writeFileSync(configPath, 'permissions:\n  mode: ask\n');
      const result = await cycleMode(tempDir);
      expect(result.message).toBeDefined();
      expect(typeof result.message).toBe('string');
      expect(result.message).toContain('Auto');
    });
  });

  // --- AC 8: Integration test - explore mode blocks writes ---
  describe('AC8: Integration - enforcePermission API', () => {
    test('enforcePermission returns "allow" for read ops in explore mode', async () => {
      fs.writeFileSync(configPath, 'permissions:\n  mode: explore\n');
      const result = await enforcePermission('Read', { file_path: '/test.js' }, tempDir);
      expect(result.action).toBe('allow');
    });

    test('enforcePermission returns "deny" for write ops in explore mode', async () => {
      fs.writeFileSync(configPath, 'permissions:\n  mode: explore\n');
      const result = await enforcePermission('Write', { file_path: '/test.js' }, tempDir);
      expect(result.action).toBe('deny');
      expect(result.message).toBeDefined();
    });

    test('enforcePermission returns "prompt" for write ops in ask mode', async () => {
      fs.writeFileSync(configPath, 'permissions:\n  mode: ask\n');
      const result = await enforcePermission('Write', { file_path: '/test.js' }, tempDir);
      expect(result.action).toBe('prompt');
      expect(result.message).toBeDefined();
    });

    test('enforcePermission returns "allow" for write ops in auto mode', async () => {
      fs.writeFileSync(configPath, 'permissions:\n  mode: auto\n');
      const result = await enforcePermission('Write', { file_path: '/test.js' }, tempDir);
      expect(result.action).toBe('allow');
    });

    test('enforcePermission returns "deny" for git push in explore mode', async () => {
      fs.writeFileSync(configPath, 'permissions:\n  mode: explore\n');
      const result = await enforcePermission('Bash', { command: 'git push origin main' }, tempDir);
      expect(result.action).toBe('deny');
    });

    test('enforcePermission returns "prompt" for git push in ask mode', async () => {
      fs.writeFileSync(configPath, 'permissions:\n  mode: ask\n');
      const result = await enforcePermission('Bash', { command: 'git push origin main' }, tempDir);
      expect(result.action).toBe('prompt');
    });

    test('enforcePermission returns "allow" for git push in auto mode', async () => {
      fs.writeFileSync(configPath, 'permissions:\n  mode: auto\n');
      const result = await enforcePermission('Bash', { command: 'git push origin main' }, tempDir);
      expect(result.action).toBe('allow');
    });
  });

  // --- Additional: OperationGuard classification ---
  describe('OperationGuard command classification', () => {
    let guard;

    beforeEach(async () => {
      const mode = new PermissionMode(tempDir);
      mode.currentMode = 'ask';
      mode._loaded = true;
      guard = new OperationGuard(mode);
    });

    test('classifies Read tool as read', () => {
      expect(guard.classifyOperation('Read')).toBe('read');
    });

    test('classifies Write tool as write', () => {
      expect(guard.classifyOperation('Write')).toBe('write');
    });

    test('classifies Edit tool as write', () => {
      expect(guard.classifyOperation('Edit')).toBe('write');
    });

    test('classifies Glob tool as read', () => {
      expect(guard.classifyOperation('Glob')).toBe('read');
    });

    test('classifies Grep tool as read', () => {
      expect(guard.classifyOperation('Grep')).toBe('read');
    });

    test('classifies git status as read', () => {
      expect(guard.classifyBashCommand('git status')).toBe('read');
    });

    test('classifies git push as write', () => {
      expect(guard.classifyBashCommand('git push origin main')).toBe('write');
    });

    test('classifies git commit as write', () => {
      expect(guard.classifyBashCommand('git commit -m "test"')).toBe('write');
    });

    test('classifies rm -rf as delete', () => {
      expect(guard.classifyBashCommand('rm -rf node_modules')).toBe('delete');
    });

    test('classifies npm install as write', () => {
      expect(guard.classifyBashCommand('npm install express')).toBe('write');
    });

    test('classifies git log as read', () => {
      expect(guard.classifyBashCommand('git log --oneline')).toBe('read');
    });

    test('classifies git diff as read', () => {
      expect(guard.classifyBashCommand('git diff')).toBe('read');
    });
  });

  // --- Additional: setMode function ---
  describe('setMode function', () => {
    test('sets mode to explore and persists', async () => {
      fs.writeFileSync(configPath, 'permissions:\n  mode: ask\n');
      const result = await setMode('explore', tempDir);
      expect(result.mode).toBe('explore');

      const configContent = fs.readFileSync(configPath, 'utf-8');
      expect(configContent).toContain('mode: explore');
    });

    test('sets mode to auto and persists', async () => {
      fs.writeFileSync(configPath, 'permissions:\n  mode: ask\n');
      const result = await setMode('auto', tempDir);
      expect(result.mode).toBe('auto');
    });

    test('handles yolo alias for auto', async () => {
      fs.writeFileSync(configPath, 'permissions:\n  mode: ask\n');
      const result = await setMode('yolo', tempDir);
      expect(result.mode).toBe('auto');
    });

    test('throws on invalid mode', async () => {
      fs.writeFileSync(configPath, 'permissions:\n  mode: ask\n');
      await expect(setMode('invalid', tempDir)).rejects.toThrow('Invalid mode');
    });
  });

  // --- Additional: OperationGuard logging ---
  describe('OperationGuard operation logging', () => {
    test('logs operations for audit trail', async () => {
      fs.writeFileSync(configPath, 'permissions:\n  mode: auto\n');
      const mode = new PermissionMode(tempDir);
      await mode.load();
      const guard = new OperationGuard(mode);

      await guard.guard('Read', { file_path: '/file1.js' });
      await guard.guard('Write', { file_path: '/file2.js' });
      await guard.guard('Bash', { command: 'git status' });

      const log = guard.getLog();
      expect(log).toHaveLength(3);
      expect(log[0].operation).toBe('read');
      expect(log[1].operation).toBe('write');
      expect(log[2].operation).toBe('read');
    });

    test('getStats returns correct counts', async () => {
      fs.writeFileSync(configPath, 'permissions:\n  mode: auto\n');
      const mode = new PermissionMode(tempDir);
      await mode.load();
      const guard = new OperationGuard(mode);

      await guard.guard('Read', {});
      await guard.guard('Write', {});
      await guard.guard('Write', {});

      const stats = guard.getStats();
      expect(stats.total).toBe(3);
      expect(stats.byOperation.read).toBe(1);
      expect(stats.byOperation.write).toBe(2);
      expect(stats.byResult.allowed).toBe(3);
    });
  });

  // --- Additional: createGuard convenience function ---
  describe('createGuard convenience function', () => {
    test('creates guard with loaded mode', async () => {
      fs.writeFileSync(configPath, 'permissions:\n  mode: explore\n');
      const { mode, guard } = await createGuard(tempDir);
      expect(mode.currentMode).toBe('explore');
      expect(guard).toBeInstanceOf(OperationGuard);
    });
  });

  // --- Additional: PermissionMode helper methods ---
  describe('PermissionMode helper methods', () => {
    test('isAutonomous returns true for auto mode', async () => {
      fs.writeFileSync(configPath, 'permissions:\n  mode: auto\n');
      const mode = new PermissionMode(tempDir);
      await mode.load();
      expect(mode.isAutonomous()).toBe(true);
    });

    test('isAutonomous returns false for ask mode', async () => {
      fs.writeFileSync(configPath, 'permissions:\n  mode: ask\n');
      const mode = new PermissionMode(tempDir);
      await mode.load();
      expect(mode.isAutonomous()).toBe(false);
    });

    test('isReadOnly returns true for explore mode', async () => {
      fs.writeFileSync(configPath, 'permissions:\n  mode: explore\n');
      const mode = new PermissionMode(tempDir);
      await mode.load();
      expect(mode.isReadOnly()).toBe(true);
    });

    test('isReadOnly returns false for ask mode', async () => {
      fs.writeFileSync(configPath, 'permissions:\n  mode: ask\n');
      const mode = new PermissionMode(tempDir);
      await mode.load();
      expect(mode.isReadOnly()).toBe(false);
    });

    test('getHelp returns formatted help text', () => {
      const help = PermissionMode.getHelp();
      expect(help).toContain('Permission Modes');
      expect(help).toContain('explore');
      expect(help).toContain('ask');
      expect(help).toContain('auto');
      expect(help).toContain('*yolo');
    });
  });
});
