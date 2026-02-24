/**
 * Unit tests for operation-guard
 *
 * Tests OperationGuard: operation classification (tools, bash commands),
 * permission guard enforcement, logging, and statistics.
 */

jest.mock('../../../.aios-core/core/permissions/permission-mode', () => {
  class PermissionMode {
    constructor() { this.mode = 'ask'; }
    async load() {}
    canPerform(op) { return { allowed: true }; }
    getModeInfo() { return { name: 'Ask', description: 'Confirm changes' }; }
  }
  return { PermissionMode };
});

const { OperationGuard } = require('../../../.aios-core/core/permissions/operation-guard');

describe('operation-guard', () => {
  let guard;

  beforeEach(() => {
    guard = new OperationGuard();
  });

  describe('SAFE_COMMANDS', () => {
    test('includes git read commands', () => {
      expect(OperationGuard.SAFE_COMMANDS).toContain('git status');
      expect(OperationGuard.SAFE_COMMANDS).toContain('git log');
      expect(OperationGuard.SAFE_COMMANDS).toContain('git diff');
    });

    test('includes file read commands', () => {
      expect(OperationGuard.SAFE_COMMANDS).toContain('ls');
      expect(OperationGuard.SAFE_COMMANDS).toContain('cat');
      expect(OperationGuard.SAFE_COMMANDS).toContain('grep');
    });

    test('includes version commands', () => {
      expect(OperationGuard.SAFE_COMMANDS).toContain('node --version');
      expect(OperationGuard.SAFE_COMMANDS).toContain('npm --version');
    });
  });

  describe('DESTRUCTIVE_PATTERNS', () => {
    test('matches rm commands', () => {
      const patterns = OperationGuard.DESTRUCTIVE_PATTERNS;
      expect(patterns.some(p => p.test('rm -rf /tmp/dir'))).toBe(true);
    });

    test('matches git destructive commands', () => {
      const patterns = OperationGuard.DESTRUCTIVE_PATTERNS;
      expect(patterns.some(p => p.test('git reset --hard'))).toBe(true);
      expect(patterns.some(p => p.test('git push --force'))).toBe(true);
    });

    test('matches SQL destructive commands', () => {
      const patterns = OperationGuard.DESTRUCTIVE_PATTERNS;
      expect(patterns.some(p => p.test('DROP TABLE users'))).toBe(true);
      expect(patterns.some(p => p.test('DELETE FROM users'))).toBe(true);
    });
  });

  describe('classifyOperation', () => {
    test('classifies Read tool as read', () => {
      expect(guard.classifyOperation('Read')).toBe('read');
    });

    test('classifies Glob tool as read', () => {
      expect(guard.classifyOperation('Glob')).toBe('read');
    });

    test('classifies Grep tool as read', () => {
      expect(guard.classifyOperation('Grep')).toBe('read');
    });

    test('classifies Write tool as write', () => {
      expect(guard.classifyOperation('Write')).toBe('write');
    });

    test('classifies Edit tool as write', () => {
      expect(guard.classifyOperation('Edit')).toBe('write');
    });

    test('classifies NotebookEdit tool as write', () => {
      expect(guard.classifyOperation('NotebookEdit')).toBe('write');
    });

    test('classifies Task/Explore as read', () => {
      expect(guard.classifyOperation('Task', { subagent_type: 'Explore' })).toBe('read');
    });

    test('classifies Task/Plan as read', () => {
      expect(guard.classifyOperation('Task', { subagent_type: 'Plan' })).toBe('read');
    });

    test('classifies Task/Bash as execute', () => {
      expect(guard.classifyOperation('Task', { subagent_type: 'Bash' })).toBe('execute');
    });

    test('classifies MCP tools as execute', () => {
      expect(guard.classifyOperation('mcp__docker')).toBe('execute');
    });

    test('classifies unknown tools as read', () => {
      expect(guard.classifyOperation('UnknownTool')).toBe('read');
    });
  });

  describe('classifyBashCommand', () => {
    test('classifies safe commands as read', () => {
      expect(guard.classifyBashCommand('git status')).toBe('read');
      expect(guard.classifyBashCommand('ls -la')).toBe('read');
      expect(guard.classifyBashCommand('cat file.txt')).toBe('read');
    });

    test('classifies destructive commands as delete', () => {
      expect(guard.classifyBashCommand('rm -rf /tmp/test')).toBe('delete');
      expect(guard.classifyBashCommand('git reset --hard')).toBe('delete');
    });

    test('classifies write commands as write', () => {
      expect(guard.classifyBashCommand('mkdir new-dir')).toBe('write');
      expect(guard.classifyBashCommand('git add .')).toBe('write');
      expect(guard.classifyBashCommand('git commit -m "msg"')).toBe('write');
      expect(guard.classifyBashCommand('npm install')).toBe('write');
    });

    test('classifies unknown commands as execute', () => {
      expect(guard.classifyBashCommand('custom-script.sh')).toBe('execute');
    });
  });

  describe('guard', () => {
    test('allows operations when permission mode allows', async () => {
      const result = await guard.guard('Read', { file_path: '/test.js' });
      expect(result.proceed).toBe(true);
      expect(result.operation).toBe('read');
    });

    test('blocks operations when permission mode denies', async () => {
      guard.permissionMode.canPerform = () => ({ allowed: false });
      const result = await guard.guard('Write', { file_path: '/test.js' });
      expect(result.proceed).toBe(false);
      expect(result.blocked).toBe(true);
      expect(result.message).toContain('Blocked');
    });

    test('returns needsConfirmation when mode requires confirm', async () => {
      guard.permissionMode.canPerform = () => ({ allowed: 'confirm' });
      const result = await guard.guard('Bash', { command: 'npm install' });
      expect(result.proceed).toBe(false);
      expect(result.needsConfirmation).toBe(true);
      expect(result.message).toContain('Confirmation Required');
    });

    test('blocks on unknown permission state', async () => {
      guard.permissionMode.canPerform = () => ({ allowed: 'unknown' });
      const result = await guard.guard('Read');
      expect(result.proceed).toBe(false);
      expect(result.blocked).toBe(true);
    });
  });

  describe('_formatBlockedMessage', () => {
    test('includes command for Bash operations', () => {
      const msg = guard._formatBlockedMessage('Bash', { command: 'npm install' }, 'write', { name: 'Safe' });
      expect(msg).toContain('npm install');
      expect(msg).toContain('Safe Mode');
    });

    test('includes file path for file operations', () => {
      const msg = guard._formatBlockedMessage('Write', { file_path: '/test.js' }, 'write', { name: 'Safe' });
      expect(msg).toContain('/test.js');
    });

    test('truncates long commands', () => {
      const longCmd = 'a'.repeat(200);
      const msg = guard._formatBlockedMessage('Bash', { command: longCmd }, 'execute', { name: 'Safe' });
      expect(msg).toContain('...');
    });
  });

  describe('_formatConfirmMessage', () => {
    test('includes bash command in code block', () => {
      const msg = guard._formatConfirmMessage('Bash', { command: 'git push' }, 'write');
      expect(msg).toContain('git push');
      expect(msg).toContain('```bash');
    });

    test('includes file path for file tools', () => {
      const msg = guard._formatConfirmMessage('Edit', { file_path: '/src/app.js' }, 'write');
      expect(msg).toContain('/src/app.js');
    });
  });

  describe('logging and stats', () => {
    test('logs operations', async () => {
      await guard.guard('Read', { file_path: '/test.js' });
      const log = guard.getLog();
      expect(log).toHaveLength(1);
      expect(log[0].tool).toBe('Read');
      expect(log[0].operation).toBe('read');
    });

    test('limits log to 100 entries', async () => {
      for (let i = 0; i < 105; i++) {
        await guard.guard('Read');
      }
      expect(guard.getLog()).toHaveLength(100);
    });

    test('getStats returns operation and result counts', async () => {
      await guard.guard('Read');
      await guard.guard('Write');
      const stats = guard.getStats();
      expect(stats.total).toBe(2);
      expect(stats.byOperation.read).toBe(1);
      expect(stats.byOperation.write).toBe(1);
      expect(stats.byResult.allowed).toBe(2);
    });

    test('getLog returns a copy', async () => {
      await guard.guard('Read');
      const log = guard.getLog();
      log.push({ fake: true });
      expect(guard.getLog()).toHaveLength(1);
    });
  });
});
