/**
 * Healer Manager Tests
 *
 * Tests for the HealerManager class including:
 * - Tier-based healing (Silent, Prompted, Manual)
 * - Backup/restore operations
 * - Security blocklist
 * - Healer registration
 *
 * @story TD-6 - CI Stability & Test Coverage Improvements
 */

const path = require('path');
const fs = require('fs').promises;
const os = require('os');
const HealerManager = require('../../.aiox-core/core/health-check/healers');
const { HealingTier, BackupManager } = require('../../.aiox-core/core/health-check/healers');
const { CheckStatus } = require('../../.aiox-core/core/health-check/base-check');

// Set timeout for all tests in this file
jest.setTimeout(30000);

describe('HealerManager', () => {
  describe('Constructor', () => {
    it('should create instance with default config', () => {
      const manager = new HealerManager();

      expect(manager).toBeDefined();
      expect(manager.maxAutoFixTier).toBe(1);
      expect(manager.dryRun).toBe(false);
      expect(manager.healers).toBeDefined();
      expect(manager.healingLog).toEqual([]);
    });

    it('should create instance with custom config', () => {
      const manager = new HealerManager({
        autoFixTier: 2,
        dryRun: true,
      });

      expect(manager.maxAutoFixTier).toBe(2);
      expect(manager.dryRun).toBe(true);
    });

    it('should initialize security blocklist', () => {
      const manager = new HealerManager();

      expect(manager.blocklist).toBeDefined();
      expect(manager.blocklist.length).toBeGreaterThan(0);
    });
  });

  describe('HealingTier enum', () => {
    it('should have correct tier values', () => {
      expect(HealingTier.NONE).toBe(0);
      expect(HealingTier.SILENT).toBe(1);
      expect(HealingTier.PROMPTED).toBe(2);
      expect(HealingTier.MANUAL).toBe(3);
    });
  });

  describe('registerHealer', () => {
    it('should register a healer', () => {
      const manager = new HealerManager();
      const healer = {
        name: 'test-healer',
        fix: jest.fn(),
      };

      manager.registerHealer('test-check', healer);

      expect(manager.healers.get('test-check')).toBe(healer);
    });

    it('should overwrite existing healer', () => {
      const manager = new HealerManager();
      const healer1 = { name: 'healer-1', fix: jest.fn() };
      const healer2 = { name: 'healer-2', fix: jest.fn() };

      manager.registerHealer('check', healer1);
      manager.registerHealer('check', healer2);

      expect(manager.healers.get('check').name).toBe('healer-2');
    });
  });

  describe('isBlocked', () => {
    it('should block .env files', () => {
      const manager = new HealerManager();

      expect(manager.isBlocked('.env')).toBe(true);
      expect(manager.isBlocked('path/to/.env')).toBe(true);
    });

    it('should block .env.* files', () => {
      const manager = new HealerManager();

      expect(manager.isBlocked('.env.local')).toBe(true);
      expect(manager.isBlocked('.env.production')).toBe(true);
    });

    it('should block credentials files', () => {
      const manager = new HealerManager();

      expect(manager.isBlocked('credentials.json')).toBe(true);
    });

    it('should block secret files', () => {
      const manager = new HealerManager();

      expect(manager.isBlocked('secrets.yaml')).toBe(true);
      expect(manager.isBlocked('secret.json')).toBe(true);
    });

    it('should block key files', () => {
      const manager = new HealerManager();

      expect(manager.isBlocked('private.pem')).toBe(true);
      expect(manager.isBlocked('server.key')).toBe(true);
      expect(manager.isBlocked('id_rsa')).toBe(true);
    });

    it('should block .ssh directory', () => {
      const manager = new HealerManager();

      expect(manager.isBlocked('.ssh/config')).toBe(true);
      expect(manager.isBlocked('.ssh/known_hosts')).toBe(true);
    });

    it('should allow regular files', () => {
      const manager = new HealerManager();

      expect(manager.isBlocked('package.json')).toBe(false);
      expect(manager.isBlocked('src/index.js')).toBe(false);
      expect(manager.isBlocked('.gitignore')).toBe(false);
    });
  });

  describe('applyFixes', () => {
    it('should filter healable results', async () => {
      const manager = new HealerManager();
      const fixMock = jest.fn().mockResolvedValue();

      manager.registerHealer('healable-check', {
        name: 'healer',
        fix: fixMock,
      });

      const checkResults = [
        {
          checkId: 'healable-check',
          healable: true,
          healingTier: 1,
          status: CheckStatus.FAIL,
        },
        {
          checkId: 'non-healable',
          healable: false,
          healingTier: 0,
          status: CheckStatus.FAIL,
        },
        {
          checkId: 'passed-check',
          healable: true,
          healingTier: 1,
          status: CheckStatus.PASS,
        },
      ];

      const results = await manager.applyFixes(checkResults);

      // Only the healable check with FAIL status should be processed
      expect(results).toHaveLength(1);
      expect(results[0].checkId).toBe('healable-check');
    });

    it('should respect maxTier parameter', async () => {
      const manager = new HealerManager({ autoFixTier: 1 });

      manager.registerHealer('tier2-check', {
        name: 'tier2-healer',
        fix: jest.fn(),
      });

      const checkResults = [
        {
          checkId: 'tier2-check',
          healable: true,
          healingTier: 2, // Higher than maxTier
          status: CheckStatus.FAIL,
        },
      ];

      const results = await manager.applyFixes(checkResults, 1);

      // Should not heal because tier is too high
      expect(results).toHaveLength(0);
    });

    it('should log healing results', async () => {
      const manager = new HealerManager({ dryRun: true });

      manager.registerHealer('logged-check', {
        name: 'logger-healer',
        fix: jest.fn(),
      });

      const checkResults = [
        {
          checkId: 'logged-check',
          healable: true,
          healingTier: 1,
          status: CheckStatus.FAIL,
        },
      ];

      await manager.applyFixes(checkResults);

      expect(manager.healingLog).toHaveLength(1);
      expect(manager.healingLog[0].timestamp).toBeDefined();
    });
  });

  describe('heal', () => {
    it('should return manual guide when tier exceeds maxTier', async () => {
      const manager = new HealerManager();

      const checkResult = {
        checkId: 'high-tier-check',
        name: 'High Tier Check',
        healingTier: 3,
        recommendation: 'Manual fix required',
      };

      const result = await manager.heal(checkResult, 1);

      expect(result.tier).toBe(HealingTier.MANUAL);
      expect(result.action).toBe('manual');
    });

    it('should return no-healer message when healer not found', async () => {
      const manager = new HealerManager();

      const checkResult = {
        checkId: 'unknown-check',
        healingTier: 1,
      };

      const result = await manager.heal(checkResult, 1);

      expect(result.success).toBe(false);
      expect(result.message).toContain('No healer registered');
    });

    it('should execute tier 1 healing', async () => {
      const manager = new HealerManager({ dryRun: true });
      const fixMock = jest.fn().mockResolvedValue();

      manager.registerHealer('tier1-check', {
        name: 'tier1-healer',
        fix: fixMock,
        successMessage: 'Fixed!',
      });

      const checkResult = {
        checkId: 'tier1-check',
        healingTier: 1,
        status: CheckStatus.FAIL,
      };

      const result = await manager.heal(checkResult, 1);

      expect(result.success).toBe(true);
      expect(result.tier).toBe(HealingTier.SILENT);
      expect(result.dryRun).toBe(true);
    });

    it('should execute tier 2 healing (prompted)', async () => {
      const manager = new HealerManager();

      manager.registerHealer('tier2-check', {
        name: 'tier2-healer',
        fix: jest.fn(),
        promptMessage: 'Confirm fix?',
        promptQuestion: 'Apply this fix?',
      });

      const checkResult = {
        checkId: 'tier2-check',
        name: 'Tier 2 Check',
        healingTier: 2,
        status: CheckStatus.FAIL,
      };

      const result = await manager.heal(checkResult, 2);

      expect(result.tier).toBe(HealingTier.PROMPTED);
      expect(result.action).toBe('prompt');
      expect(result.prompt).toBeDefined();
      expect(result.prompt.question).toBe('Apply this fix?');
    });

    it('should handle unknown healing tier', async () => {
      const manager = new HealerManager();

      manager.registerHealer('unknown-tier', {
        name: 'unknown-healer',
        fix: jest.fn(),
      });

      const checkResult = {
        checkId: 'unknown-tier',
        healingTier: 99, // Invalid tier
        status: CheckStatus.FAIL,
      };

      const result = await manager.heal(checkResult, 99);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Unknown healing tier');
    });
  });

  describe('executeTier1', () => {
    it('should block files in security blocklist', async () => {
      const manager = new HealerManager();

      manager.registerHealer('blocked-check', {
        name: 'blocked-healer',
        targetFile: '.env',
        fix: jest.fn(),
      });

      const checkResult = {
        checkId: 'blocked-check',
        healingTier: 1,
      };

      const result = await manager.heal(checkResult, 1);

      expect(result.success).toBe(false);
      expect(result.action).toBe('blocked');
    });

    it('should handle fix execution error', async () => {
      const manager = new HealerManager();

      manager.registerHealer('error-check', {
        name: 'error-healer',
        fix: jest.fn().mockRejectedValue(new Error('Fix failed')),
      });

      const checkResult = {
        checkId: 'error-check',
        healingTier: 1,
      };

      const result = await manager.heal(checkResult, 1);

      expect(result.success).toBe(false);
      expect(result.action).toBe('error');
      expect(result.error).toBe('Fix failed');
    });

    it('should skip actual fix in dry run mode', async () => {
      const manager = new HealerManager({ dryRun: true });
      const fixMock = jest.fn();

      manager.registerHealer('dryrun-check', {
        name: 'dryrun-healer',
        fix: fixMock,
      });

      const checkResult = {
        checkId: 'dryrun-check',
        healingTier: 1,
      };

      await manager.heal(checkResult, 1);

      expect(fixMock).not.toHaveBeenCalled();
    });
  });

  describe('executeTier2', () => {
    it('should return prompt with fix function', async () => {
      const manager = new HealerManager({ dryRun: true });
      const fixMock = jest.fn().mockResolvedValue();

      manager.registerHealer('prompt-check', {
        name: 'prompt-healer',
        fix: fixMock,
        promptDescription: 'This will fix the issue',
        risk: 'low',
      });

      const checkResult = {
        checkId: 'prompt-check',
        name: 'Prompt Check',
        healingTier: 2,
        recommendation: 'Apply fix',
      };

      const result = await manager.heal(checkResult, 2);

      expect(result.action).toBe('prompt');
      expect(typeof result.fix).toBe('function');
      expect(result.prompt.risk).toBe('low');
    });

    it('should execute fix when confirmed', async () => {
      const manager = new HealerManager({ dryRun: true });
      const fixMock = jest.fn().mockResolvedValue();

      manager.registerHealer('confirm-check', {
        name: 'confirm-healer',
        fix: fixMock,
      });

      const checkResult = {
        checkId: 'confirm-check',
        healingTier: 2,
      };

      const result = await manager.heal(checkResult, 2);

      // Simulate user confirming
      const fixResult = await result.fix(true);

      expect(fixResult.success).toBe(true);
    });

    it('should not execute fix when declined', async () => {
      const manager = new HealerManager();
      const fixMock = jest.fn();

      manager.registerHealer('decline-check', {
        name: 'decline-healer',
        fix: fixMock,
      });

      const checkResult = {
        checkId: 'decline-check',
        healingTier: 2,
      };

      const result = await manager.heal(checkResult, 2);

      // Simulate user declining
      const fixResult = await result.fix(false);

      expect(fixResult.success).toBe(false);
      expect(fixResult.message).toContain('declined');
      expect(fixMock).not.toHaveBeenCalled();
    });
  });

  describe('createManualGuide', () => {
    it('should create manual guide with default values', () => {
      const manager = new HealerManager();

      const checkResult = {
        checkId: 'manual-check',
        name: 'Manual Check',
        message: 'Issue description',
        recommendation: 'Fix it manually',
      };

      const result = manager.createManualGuide(checkResult);

      expect(result.tier).toBe(HealingTier.MANUAL);
      expect(result.action).toBe('manual');
      expect(result.guide.title).toContain('Manual Check');
      expect(result.guide.description).toBe('Issue description');
    });

    it('should use healer-specific guide when available', () => {
      const manager = new HealerManager();

      manager.registerHealer('guided-check', {
        name: 'guided-healer',
        steps: ['Step 1', 'Step 2', 'Step 3'],
        documentation: 'https://docs.example.com',
        warning: 'Be careful!',
      });

      const checkResult = {
        checkId: 'guided-check',
        name: 'Guided Check',
        message: 'Issue',
        recommendation: 'Default',
      };

      const result = manager.createManualGuide(checkResult);

      expect(result.guide.steps).toEqual(['Step 1', 'Step 2', 'Step 3']);
      expect(result.guide.documentation).toBe('https://docs.example.com');
      expect(result.guide.warning).toBe('Be careful!');
    });
  });

  describe('Healing Log', () => {
    it('should return copy of healing log', () => {
      const manager = new HealerManager();
      manager.healingLog.push({ checkId: 'test', timestamp: new Date().toISOString() });

      const log = manager.getHealingLog();

      expect(log).toHaveLength(1);
      // Should be a copy, not reference
      log.push({ checkId: 'new' });
      expect(manager.healingLog).toHaveLength(1);
    });

    it('should clear healing log', () => {
      const manager = new HealerManager();
      manager.healingLog.push({ checkId: 'test' });

      manager.clearLog();

      expect(manager.healingLog).toHaveLength(0);
    });
  });

  describe('getBackupManager', () => {
    it('should return backup manager instance', () => {
      const manager = new HealerManager();

      const backup = manager.getBackupManager();

      expect(backup).toBeInstanceOf(BackupManager);
    });
  });
});

describe('BackupManager', () => {
  let tempDir;
  let backupManager;

  beforeEach(async () => {
    tempDir = path.join(os.tmpdir(), `backup-test-${Date.now()}`);
    await fs.mkdir(tempDir, { recursive: true });
    backupManager = new BackupManager(tempDir);
  });

  afterEach(async () => {
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (e) {
      // Ignore cleanup errors
    }
  });

  it('should be exported from healers module', () => {
    expect(BackupManager).toBeDefined();
    expect(typeof BackupManager).toBe('function');
  });

  it('should create instance with custom directory', () => {
    const manager = new BackupManager('/custom/path');

    expect(manager).toBeDefined();
  });
});
