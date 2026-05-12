'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');
const yaml = require('js-yaml');
const crypto = require('crypto');

const {
  RegistryHealer,
  HEALING_RULES,
  SEVERITY_ORDER,
  daysSince,
  buildEntityIndex,
  MAX_BACKUPS,
  STALE_DAYS_THRESHOLD,
} = require('../../../.aiox-core/core/ids/registry-healer');

// Test constants — unique temp dir per test run
const TEST_ROOT = path.join(os.tmpdir(), `ids-healer-test-${process.pid}-${Date.now()}`);
const TEST_REGISTRY_PATH = path.join(TEST_ROOT, 'entity-registry.yaml');
const TEST_HEALING_LOG = path.join(TEST_ROOT, 'registry-healing-log.jsonl');
const TEST_BACKUP_DIR = path.join(TEST_ROOT, 'registry-backups', 'healing');

// ─── Test Helpers ──────────────────────────────────────────────────

function createTestDir() {
  fs.mkdirSync(TEST_ROOT, { recursive: true });
}

function cleanupTestDir() {
  try {
    fs.rmSync(TEST_ROOT, { recursive: true, force: true });
  } catch {
    // Best-effort cleanup
  }
}

/**
 * Create a test file with given content.
 * @param {string} relativePath - Path relative to TEST_ROOT
 * @param {string} content - File content
 * @returns {string} Absolute path to created file
 */
function createTestFile(relativePath, content = '# Test File\n\nSome content here.') {
  const absPath = path.join(TEST_ROOT, relativePath);
  fs.mkdirSync(path.dirname(absPath), { recursive: true });
  fs.writeFileSync(absPath, content, 'utf8');
  return absPath;
}

/**
 * Compute sha256 checksum for a string.
 * @param {string} content
 * @returns {string} sha256 prefixed checksum
 */
function checksumFor(content) {
  return 'sha256:' + crypto.createHash('sha256').update(content).digest('hex');
}

/**
 * Build a registry object for testing.
 */
function buildTestRegistry(entities = {}) {
  return {
    metadata: {
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      entityCount: Object.values(entities).reduce((sum, cat) => sum + Object.keys(cat).length, 0),
      checksumAlgorithm: 'sha256',
    },
    entities,
    categories: Object.keys(entities).map((id) => ({ id, description: `${id} category` })),
  };
}

/**
 * Write a registry YAML file for testing.
 */
function writeTestRegistry(entities = {}) {
  const registry = buildTestRegistry(entities);
  fs.mkdirSync(path.dirname(TEST_REGISTRY_PATH), { recursive: true });
  fs.writeFileSync(TEST_REGISTRY_PATH, yaml.dump(registry, { lineWidth: 120, noRefs: true }), 'utf8');
  return registry;
}

/**
 * Create a RegistryHealer configured for testing.
 */
function createTestHealer() {
  return new RegistryHealer({
    registryPath: TEST_REGISTRY_PATH,
    repoRoot: TEST_ROOT,
    healingLogPath: TEST_HEALING_LOG,
    backupDir: TEST_BACKUP_DIR,
  });
}

// ─── Tests ─────────────────────────────────────────────────────────

describe('RegistryHealer', () => {
  beforeEach(() => {
    createTestDir();
  });

  afterEach(() => {
    cleanupTestDir();
  });

  // ─── Utility Functions ─────────────────────────────────────────

  describe('daysSince()', () => {
    it('returns Infinity for undefined input', () => {
      expect(daysSince(undefined)).toBe(Infinity);
    });

    it('returns Infinity for invalid date', () => {
      expect(daysSince('not-a-date')).toBe(Infinity);
    });

    it('returns approximately 0 for current timestamp', () => {
      const now = new Date().toISOString();
      expect(daysSince(now)).toBeLessThan(1);
    });

    it('returns correct day count for past date', () => {
      const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString();
      const result = daysSince(tenDaysAgo);
      expect(result).toBeGreaterThan(9.5);
      expect(result).toBeLessThan(10.5);
    });
  });

  describe('buildEntityIndex()', () => {
    it('returns empty Map for null entities', () => {
      const index = buildEntityIndex(null);
      expect(index.size).toBe(0);
    });

    it('builds flat index from nested entity structure', () => {
      const entities = {
        tasks: {
          'task-a': { path: 'tasks/task-a.md', type: 'task' },
          'task-b': { path: 'tasks/task-b.md', type: 'task' },
        },
        scripts: {
          'script-a': { path: 'scripts/script-a.js', type: 'script' },
        },
      };
      const index = buildEntityIndex(entities);
      expect(index.size).toBe(3);
      expect(index.get('task-a')._category).toBe('tasks');
      expect(index.get('script-a')._category).toBe('scripts');
    });

    it('skips non-object category entries', () => {
      const entities = {
        tasks: null,
        scripts: 'invalid',
      };
      const index = buildEntityIndex(entities);
      expect(index.size).toBe(0);
    });
  });

  // ─── HEALING_RULES Configuration ────────────────────────────────

  describe('HEALING_RULES', () => {
    it('defines 6 healing rules', () => {
      expect(HEALING_RULES).toHaveLength(6);
    });

    it('each rule has required fields', () => {
      for (const rule of HEALING_RULES) {
        expect(rule).toHaveProperty('id');
        expect(rule).toHaveProperty('description');
        expect(rule).toHaveProperty('severity');
        expect(rule).toHaveProperty('autoHealable');
        expect(['critical', 'high', 'medium', 'low']).toContain(rule.severity);
      }
    });

    it('missing-file is critical and non-auto-healable', () => {
      const rule = HEALING_RULES.find((r) => r.id === 'missing-file');
      expect(rule.severity).toBe('critical');
      expect(rule.autoHealable).toBe(false);
    });

    it('checksum-mismatch is high and auto-healable', () => {
      const rule = HEALING_RULES.find((r) => r.id === 'checksum-mismatch');
      expect(rule.severity).toBe('high');
      expect(rule.autoHealable).toBe(true);
    });

    it('has correct auto-healable distribution (5 of 6 = 83%)', () => {
      const autoHealable = HEALING_RULES.filter((r) => r.autoHealable);
      expect(autoHealable.length).toBe(5);
      // 5/6 = 83.3% > 80% threshold
      expect((autoHealable.length / HEALING_RULES.length) * 100).toBeGreaterThanOrEqual(80);
    });
  });

  // ─── Health Check (Detection) ──────────────────────────────────

  describe('runHealthCheck()', () => {
    it('returns empty issues for a healthy registry', () => {
      const content = '# Healthy File\n\nContent here.';
      const checksum = checksumFor(content);
      createTestFile('tasks/healthy-task.md', content);

      writeTestRegistry({
        tasks: {
          'healthy-task': {
            path: 'tasks/healthy-task.md',
            type: 'task',
            keywords: ['healthy', 'task'],
            usedBy: [],
            dependencies: [],
            checksum,
            lastVerified: new Date().toISOString(),
          },
        },
      });

      const healer = createTestHealer();
      const result = healer.runHealthCheck();

      expect(result.issues).toHaveLength(0);
      expect(result.summary.total).toBe(0);
      expect(result.timestamp).toBeDefined();
    });

    it('detects missing files (CRITICAL)', () => {
      writeTestRegistry({
        tasks: {
          'missing-task': {
            path: 'tasks/does-not-exist.md',
            type: 'task',
            keywords: ['missing'],
            usedBy: [],
            dependencies: [],
            checksum: 'sha256:abc123',
            lastVerified: new Date().toISOString(),
          },
        },
      });

      const healer = createTestHealer();
      const result = healer.runHealthCheck();

      expect(result.issues).toHaveLength(1);
      expect(result.issues[0].ruleId).toBe('missing-file');
      expect(result.issues[0].severity).toBe('critical');
      expect(result.issues[0].autoHealable).toBe(false);
      expect(result.issues[0].entityId).toBe('missing-task');
    });

    it('detects checksum mismatches (HIGH)', () => {
      const content = '# Changed File\n\nNew content.';
      createTestFile('tasks/changed-task.md', content);

      writeTestRegistry({
        tasks: {
          'changed-task': {
            path: 'tasks/changed-task.md',
            type: 'task',
            keywords: ['changed'],
            usedBy: [],
            dependencies: [],
            checksum: 'sha256:old_wrong_checksum_value_here',
            lastVerified: new Date().toISOString(),
          },
        },
      });

      const healer = createTestHealer();
      const result = healer.runHealthCheck();

      const checksumIssues = result.issues.filter((i) => i.ruleId === 'checksum-mismatch');
      expect(checksumIssues).toHaveLength(1);
      expect(checksumIssues[0].severity).toBe('high');
      expect(checksumIssues[0].autoHealable).toBe(true);
      expect(checksumIssues[0].details.expected).toBe('sha256:old_wrong_checksum_value_here');
      expect(checksumIssues[0].details.actual).toBeDefined();
    });

    it('detects orphaned usedBy references (MEDIUM)', () => {
      const content = '# Task A';
      createTestFile('tasks/task-a.md', content);

      writeTestRegistry({
        tasks: {
          'task-a': {
            path: 'tasks/task-a.md',
            type: 'task',
            keywords: ['task', 'a'],
            usedBy: ['nonexistent-entity', 'another-missing'],
            dependencies: [],
            checksum: checksumFor(content),
            lastVerified: new Date().toISOString(),
          },
        },
      });

      const healer = createTestHealer();
      const result = healer.runHealthCheck();

      const orphanedIssues = result.issues.filter((i) => i.ruleId === 'orphaned-usedBy');
      expect(orphanedIssues).toHaveLength(1);
      expect(orphanedIssues[0].severity).toBe('medium');
      expect(orphanedIssues[0].details.orphanedRefs).toEqual(['nonexistent-entity', 'another-missing']);
    });

    it('detects orphaned dependency references (MEDIUM)', () => {
      const content = '# Task B';
      createTestFile('tasks/task-b.md', content);

      writeTestRegistry({
        tasks: {
          'task-b': {
            path: 'tasks/task-b.md',
            type: 'task',
            keywords: ['task', 'b'],
            usedBy: [],
            dependencies: ['missing-dep'],
            checksum: checksumFor(content),
            lastVerified: new Date().toISOString(),
          },
        },
      });

      const healer = createTestHealer();
      const result = healer.runHealthCheck();

      const depIssues = result.issues.filter((i) => i.ruleId === 'orphaned-dependency');
      expect(depIssues).toHaveLength(1);
      expect(depIssues[0].severity).toBe('medium');
      expect(depIssues[0].details.orphanedRefs).toEqual(['missing-dep']);
    });

    it('detects missing keywords (LOW)', () => {
      const content = '# No Keywords';
      createTestFile('tasks/no-kw.md', content);

      writeTestRegistry({
        tasks: {
          'no-kw': {
            path: 'tasks/no-kw.md',
            type: 'task',
            keywords: [],
            usedBy: [],
            dependencies: [],
            checksum: checksumFor(content),
            lastVerified: new Date().toISOString(),
          },
        },
      });

      const healer = createTestHealer();
      const result = healer.runHealthCheck();

      const kwIssues = result.issues.filter((i) => i.ruleId === 'missing-keywords');
      expect(kwIssues).toHaveLength(1);
      expect(kwIssues[0].severity).toBe('low');
      expect(kwIssues[0].autoHealable).toBe(true);
    });

    it('detects stale lastVerified timestamps (LOW)', () => {
      const content = '# Stale Entity';
      createTestFile('tasks/stale-task.md', content);
      const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString();

      writeTestRegistry({
        tasks: {
          'stale-task': {
            path: 'tasks/stale-task.md',
            type: 'task',
            keywords: ['stale'],
            usedBy: [],
            dependencies: [],
            checksum: checksumFor(content),
            lastVerified: tenDaysAgo,
          },
        },
      });

      const healer = createTestHealer();
      const result = healer.runHealthCheck();

      const staleIssues = result.issues.filter((i) => i.ruleId === 'stale-verification');
      expect(staleIssues).toHaveLength(1);
      expect(staleIssues[0].severity).toBe('low');
      expect(staleIssues[0].details.daysSince).toBeGreaterThanOrEqual(9);
    });

    it('skips further checks for missing files', () => {
      // A missing file should not also trigger checksum-mismatch etc
      writeTestRegistry({
        tasks: {
          'gone-task': {
            path: 'tasks/gone.md',
            type: 'task',
            keywords: [],
            usedBy: ['nonexistent'],
            dependencies: ['nope'],
            checksum: 'sha256:wrong',
            lastVerified: '2020-01-01',
          },
        },
      });

      const healer = createTestHealer();
      const result = healer.runHealthCheck();

      // Should only have 1 issue: missing-file (not checksum, orphaned, etc)
      expect(result.issues).toHaveLength(1);
      expect(result.issues[0].ruleId).toBe('missing-file');
    });

    it('sorts issues by severity (critical first)', () => {
      const content1 = '# File A';
      createTestFile('tasks/file-a.md', content1);

      writeTestRegistry({
        tasks: {
          'missing-task': {
            path: 'tasks/nonexistent.md',
            type: 'task',
            keywords: ['missing'],
            usedBy: [],
            dependencies: [],
            checksum: 'sha256:abc',
            lastVerified: new Date().toISOString(),
          },
          'file-a': {
            path: 'tasks/file-a.md',
            type: 'task',
            keywords: [],
            usedBy: [],
            dependencies: [],
            checksum: checksumFor(content1),
            lastVerified: new Date().toISOString(),
          },
        },
      });

      const healer = createTestHealer();
      const result = healer.runHealthCheck();

      expect(result.issues.length).toBeGreaterThan(1);
      // First issue should be critical (missing-file)
      expect(result.issues[0].severity).toBe('critical');
    });

    it('builds correct summary statistics', () => {
      const content = '# Multi Issue';
      createTestFile('tasks/multi.md', content);

      writeTestRegistry({
        tasks: {
          'missing-one': {
            path: 'tasks/not-here.md',
            type: 'task',
            keywords: ['missing'],
            usedBy: [],
            dependencies: [],
            checksum: 'sha256:abc',
            lastVerified: new Date().toISOString(),
          },
          'multi': {
            path: 'tasks/multi.md',
            type: 'task',
            keywords: [],
            usedBy: ['phantom'],
            dependencies: [],
            checksum: 'sha256:wrong_checksum',
            lastVerified: '2020-01-01',
          },
        },
      });

      const healer = createTestHealer();
      const result = healer.runHealthCheck();

      expect(result.summary.total).toBeGreaterThan(0);
      expect(result.summary.bySeverity.critical).toBeGreaterThanOrEqual(1);
      expect(result.summary.autoHealable).toBeGreaterThan(0);
      expect(result.summary.needsManual).toBeGreaterThanOrEqual(1);
      expect(result.summary.autoHealableRate).toBeGreaterThan(0);
    });
  });

  // ─── Auto-Healing ──────────────────────────────────────────────

  describe('heal()', () => {
    it('heals checksum mismatches by recomputing', () => {
      const content = '# Updated Content';
      createTestFile('tasks/fix-checksum.md', content);
      const correctChecksum = checksumFor(content);

      writeTestRegistry({
        tasks: {
          'fix-checksum': {
            path: 'tasks/fix-checksum.md',
            type: 'task',
            keywords: ['fix'],
            usedBy: [],
            dependencies: [],
            checksum: 'sha256:old_stale_value',
            lastVerified: new Date().toISOString(),
          },
        },
      });

      const healer = createTestHealer();
      const healthResult = healer.runHealthCheck();
      const checksumIssues = healthResult.issues.filter((i) => i.ruleId === 'checksum-mismatch');
      expect(checksumIssues).toHaveLength(1);

      const healResult = healer.heal(healthResult.issues, { autoOnly: true });

      expect(healResult.healed.length).toBeGreaterThanOrEqual(1);
      const checksumHeal = healResult.healed.find((h) => h.ruleId === 'checksum-mismatch');
      expect(checksumHeal).toBeDefined();
      expect(checksumHeal.before).toBe('sha256:old_stale_value');
      expect(checksumHeal.after).toBe(correctChecksum);
      expect(healResult.batchId).toBeDefined();
      expect(healResult.backupPath).toBeDefined();
    });

    it('heals orphaned usedBy references by removing them', () => {
      const content = '# Orphan Test';
      createTestFile('tasks/orphan-used.md', content);

      writeTestRegistry({
        tasks: {
          'orphan-used': {
            path: 'tasks/orphan-used.md',
            type: 'task',
            keywords: ['orphan'],
            usedBy: ['real-entity', 'phantom-entity'],
            dependencies: [],
            checksum: checksumFor(content),
            lastVerified: new Date().toISOString(),
          },
          'real-entity': {
            path: 'tasks/orphan-used.md',
            type: 'task',
            keywords: ['real'],
            usedBy: [],
            dependencies: [],
            checksum: checksumFor(content),
            lastVerified: new Date().toISOString(),
          },
        },
      });

      const healer = createTestHealer();
      const healthResult = healer.runHealthCheck();
      const orphanIssues = healthResult.issues.filter((i) => i.ruleId === 'orphaned-usedBy');
      expect(orphanIssues).toHaveLength(1);

      const healResult = healer.heal(healthResult.issues, { autoOnly: true });

      const orphanHeal = healResult.healed.find((h) => h.ruleId === 'orphaned-usedBy');
      expect(orphanHeal).toBeDefined();
      expect(orphanHeal.before).toContain('phantom-entity');
      expect(orphanHeal.after).not.toContain('phantom-entity');
      expect(orphanHeal.after).toContain('real-entity');
    });

    it('heals orphaned dependency references by removing them', () => {
      const content = '# Dep Test';
      createTestFile('tasks/dep-test.md', content);

      writeTestRegistry({
        tasks: {
          'dep-test': {
            path: 'tasks/dep-test.md',
            type: 'task',
            keywords: ['dep'],
            usedBy: [],
            dependencies: ['existing-dep', 'phantom-dep'],
            checksum: checksumFor(content),
            lastVerified: new Date().toISOString(),
          },
          'existing-dep': {
            path: 'tasks/dep-test.md',
            type: 'task',
            keywords: ['existing'],
            usedBy: [],
            dependencies: [],
            checksum: checksumFor(content),
            lastVerified: new Date().toISOString(),
          },
        },
      });

      const healer = createTestHealer();
      const healthResult = healer.runHealthCheck();
      const healResult = healer.heal(healthResult.issues, { autoOnly: true });

      const depHeal = healResult.healed.find((h) => h.ruleId === 'orphaned-dependency');
      expect(depHeal).toBeDefined();
      expect(depHeal.before).toContain('phantom-dep');
      expect(depHeal.after).not.toContain('phantom-dep');
    });

    it('heals missing keywords by extracting from file', () => {
      const content = '# My Task\n\nSome content.';
      createTestFile('tasks/no-keywords.md', content);

      writeTestRegistry({
        tasks: {
          'no-keywords': {
            path: 'tasks/no-keywords.md',
            type: 'task',
            keywords: [],
            usedBy: [],
            dependencies: [],
            checksum: checksumFor(content),
            lastVerified: new Date().toISOString(),
          },
        },
      });

      const healer = createTestHealer();
      const healthResult = healer.runHealthCheck();
      const healResult = healer.heal(healthResult.issues, { autoOnly: true });

      const kwHeal = healResult.healed.find((h) => h.ruleId === 'missing-keywords');
      expect(kwHeal).toBeDefined();
      expect(kwHeal.before).toEqual([]);
      expect(kwHeal.after.length).toBeGreaterThan(0);
    });

    it('heals stale verification by updating timestamp', () => {
      const content = '# Stale Verify';
      createTestFile('tasks/stale-verify.md', content);
      const oldDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString();

      writeTestRegistry({
        tasks: {
          'stale-verify': {
            path: 'tasks/stale-verify.md',
            type: 'task',
            keywords: ['stale'],
            usedBy: [],
            dependencies: [],
            checksum: checksumFor(content),
            lastVerified: oldDate,
          },
        },
      });

      const healer = createTestHealer();
      const healthResult = healer.runHealthCheck();
      const healResult = healer.heal(healthResult.issues, { autoOnly: true });

      const staleHeal = healResult.healed.find((h) => h.ruleId === 'stale-verification');
      expect(staleHeal).toBeDefined();
      expect(staleHeal.before).toBe(oldDate);
      // After should be a recent timestamp
      const afterDate = new Date(staleHeal.after);
      expect(afterDate.getTime()).toBeGreaterThan(Date.now() - 60000);
    });

    it('skips non-auto-healable issues when autoOnly is true', () => {
      writeTestRegistry({
        tasks: {
          'missing-task': {
            path: 'tasks/nonexistent.md',
            type: 'task',
            keywords: ['missing'],
            usedBy: [],
            dependencies: [],
            checksum: 'sha256:abc',
            lastVerified: new Date().toISOString(),
          },
        },
      });

      const healer = createTestHealer();
      const healthResult = healer.runHealthCheck();
      const healResult = healer.heal(healthResult.issues, { autoOnly: true });

      expect(healResult.healed).toHaveLength(0);
      expect(healResult.skipped).toHaveLength(1);
      expect(healResult.skipped[0].ruleId).toBe('missing-file');
      expect(healResult.skipped[0].reason).toContain('manual intervention');
    });

    it('supports dryRun mode without modifying registry', () => {
      const content = '# Dry Run';
      createTestFile('tasks/dry-run.md', content);

      writeTestRegistry({
        tasks: {
          'dry-run': {
            path: 'tasks/dry-run.md',
            type: 'task',
            keywords: [],
            usedBy: [],
            dependencies: [],
            checksum: 'sha256:wrong',
            lastVerified: '2020-01-01',
          },
        },
      });

      const registryBefore = fs.readFileSync(TEST_REGISTRY_PATH, 'utf8');

      const healer = createTestHealer();
      const healthResult = healer.runHealthCheck();
      const healResult = healer.heal(healthResult.issues, { autoOnly: true, dryRun: true });

      expect(healResult.healed.length).toBeGreaterThan(0);
      expect(healResult.healed[0].action).toBe('would-heal');
      expect(healResult.backupPath).toBeNull();

      // Registry should not have been modified
      const registryAfter = fs.readFileSync(TEST_REGISTRY_PATH, 'utf8');
      expect(registryAfter).toBe(registryBefore);
    });

    it('creates backup before healing', () => {
      const content = '# Backup Test';
      createTestFile('tasks/backup-test.md', content);

      writeTestRegistry({
        tasks: {
          'backup-test': {
            path: 'tasks/backup-test.md',
            type: 'task',
            keywords: [],
            usedBy: [],
            dependencies: [],
            checksum: 'sha256:wrong',
            lastVerified: new Date().toISOString(),
          },
        },
      });

      const healer = createTestHealer();
      const healthResult = healer.runHealthCheck();
      const healResult = healer.heal(healthResult.issues, { autoOnly: true });

      expect(healResult.backupPath).toBeDefined();
      expect(fs.existsSync(healResult.backupPath)).toBe(true);
    });

    it('persists healed changes to the registry file', () => {
      const content = '# Persist Test';
      createTestFile('tasks/persist-test.md', content);
      const correctChecksum = checksumFor(content);

      writeTestRegistry({
        tasks: {
          'persist-test': {
            path: 'tasks/persist-test.md',
            type: 'task',
            keywords: ['persist'],
            usedBy: [],
            dependencies: [],
            checksum: 'sha256:old_value',
            lastVerified: new Date().toISOString(),
          },
        },
      });

      const healer = createTestHealer();
      const healthResult = healer.runHealthCheck();
      healer.heal(healthResult.issues, { autoOnly: true });

      // Read the registry back and verify
      const updatedContent = fs.readFileSync(TEST_REGISTRY_PATH, 'utf8');
      const updated = yaml.load(updatedContent);
      expect(updated.entities.tasks['persist-test'].checksum).toBe(correctChecksum);
    });
  });

  // ─── Warning Generation ────────────────────────────────────────

  describe('emitWarnings()', () => {
    it('generates formatted warnings for non-auto-healable issues', async () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();

      writeTestRegistry({
        tasks: {
          'missing-file-task': {
            path: 'tasks/gone.md',
            type: 'task',
            keywords: ['gone'],
            usedBy: [],
            dependencies: [],
            checksum: 'sha256:abc',
            lastVerified: new Date().toISOString(),
          },
        },
      });

      const healer = createTestHealer();
      const healthResult = healer.runHealthCheck();
      const manualIssues = healthResult.issues.filter((i) => !i.autoHealable);

      const warnings = await healer.emitWarnings(manualIssues);

      expect(warnings).toHaveLength(1);
      expect(warnings[0].ruleId).toBe('missing-file');
      expect(warnings[0].severity).toBe('critical');
      expect(warnings[0].formatted).toContain('WARNING');
      expect(warnings[0].formatted).toContain('missing-file');
      expect(warnings[0].formatted).toContain('missing-file-task');
      expect(warnings[0].suggestedActions.length).toBeGreaterThan(0);

      // Verify console.warn was called
      expect(warnSpy).toHaveBeenCalled();
      warnSpy.mockRestore();
    });

    it('includes suggested manual actions in warnings', async () => {
      jest.spyOn(console, 'warn').mockImplementation();

      writeTestRegistry({
        tasks: {
          'deleted-task': {
            path: 'tasks/deleted.md',
            type: 'task',
            keywords: ['deleted'],
            usedBy: [],
            dependencies: [],
            checksum: 'sha256:abc',
            lastVerified: new Date().toISOString(),
          },
        },
      });

      const healer = createTestHealer();
      const healthResult = healer.runHealthCheck();
      const manualIssues = healthResult.issues.filter((i) => !i.autoHealable);
      const warnings = await healer.emitWarnings(manualIssues);

      expect(warnings[0].suggestedActions).toEqual(
        expect.arrayContaining([expect.stringContaining('git log --follow')]),
      );

      console.warn.mockRestore();
    });
  });

  // ─── Rollback ──────────────────────────────────────────────────

  describe('rollback()', () => {
    it('restores registry from backup', () => {
      const content = '# Rollback Test';
      createTestFile('tasks/rollback-test.md', content);

      writeTestRegistry({
        tasks: {
          'rollback-test': {
            path: 'tasks/rollback-test.md',
            type: 'task',
            keywords: [],
            usedBy: [],
            dependencies: [],
            checksum: 'sha256:original',
            lastVerified: new Date().toISOString(),
          },
        },
      });

      const originalContent = fs.readFileSync(TEST_REGISTRY_PATH, 'utf8');

      const healer = createTestHealer();
      const healthResult = healer.runHealthCheck();
      const healResult = healer.heal(healthResult.issues, { autoOnly: true });

      // Registry should be modified
      const modifiedContent = fs.readFileSync(TEST_REGISTRY_PATH, 'utf8');
      expect(modifiedContent).not.toBe(originalContent);

      // Rollback
      const success = healer.rollback(healResult.batchId);
      expect(success).toBe(true);

      // Registry should be restored
      const restoredContent = fs.readFileSync(TEST_REGISTRY_PATH, 'utf8');
      expect(restoredContent).toBe(originalContent);
    });

    it('throws error for non-existent backup', () => {
      writeTestRegistry({});
      const healer = createTestHealer();

      expect(() => healer.rollback('nonexistent-batch-id')).toThrow(/Backup not found/);
    });

    it('logs rollback action to healing log', () => {
      const content = '# Rollback Log Test';
      createTestFile('tasks/rb-log.md', content);

      writeTestRegistry({
        tasks: {
          'rb-log': {
            path: 'tasks/rb-log.md',
            type: 'task',
            keywords: [],
            usedBy: [],
            dependencies: [],
            checksum: 'sha256:wrong',
            lastVerified: new Date().toISOString(),
          },
        },
      });

      const healer = createTestHealer();
      const healthResult = healer.runHealthCheck();
      const healResult = healer.heal(healthResult.issues, { autoOnly: true });
      healer.rollback(healResult.batchId);

      const log = healer.queryHealingLog({ batchId: healResult.batchId });
      const rollbackEntry = log.find((e) => e.action === 'rollback');
      expect(rollbackEntry).toBeDefined();
      expect(rollbackEntry.entityId).toBe('registry');
    });
  });

  // ─── Healing Audit Log ─────────────────────────────────────────

  describe('queryHealingLog()', () => {
    it('returns empty array when no log exists', () => {
      const healer = createTestHealer();
      const entries = healer.queryHealingLog();
      expect(entries).toEqual([]);
    });

    it('logs healing actions and can be queried', () => {
      const content = '# Log Query Test';
      createTestFile('tasks/log-query.md', content);

      writeTestRegistry({
        tasks: {
          'log-query': {
            path: 'tasks/log-query.md',
            type: 'task',
            keywords: [],
            usedBy: [],
            dependencies: [],
            checksum: 'sha256:wrong',
            lastVerified: new Date().toISOString(),
          },
        },
      });

      const healer = createTestHealer();
      const healthResult = healer.runHealthCheck();
      const healResult = healer.heal(healthResult.issues, { autoOnly: true });

      const allEntries = healer.queryHealingLog();
      expect(allEntries.length).toBeGreaterThan(0);

      // Filter by batch
      const batchEntries = healer.queryHealingLog({ batchId: healResult.batchId });
      expect(batchEntries.length).toBeGreaterThan(0);
      expect(batchEntries.every((e) => e.batchId === healResult.batchId)).toBe(true);
    });

    it('each log entry has required fields', () => {
      const content = '# Log Fields Test';
      createTestFile('tasks/log-fields.md', content);

      writeTestRegistry({
        tasks: {
          'log-fields': {
            path: 'tasks/log-fields.md',
            type: 'task',
            keywords: [],
            usedBy: [],
            dependencies: [],
            checksum: 'sha256:wrong',
            lastVerified: new Date().toISOString(),
          },
        },
      });

      const healer = createTestHealer();
      const healthResult = healer.runHealthCheck();
      healer.heal(healthResult.issues, { autoOnly: true });

      const entries = healer.queryHealingLog();
      for (const entry of entries) {
        expect(entry).toHaveProperty('timestamp');
        expect(entry).toHaveProperty('batchId');
        expect(entry).toHaveProperty('action');
        expect(entry).toHaveProperty('ruleId');
        expect(entry).toHaveProperty('entityId');
        expect(entry).toHaveProperty('success');
      }
    });

    it('supports limit parameter', () => {
      const content = '# Limit Test';
      createTestFile('tasks/limit-test.md', content);

      writeTestRegistry({
        tasks: {
          'limit-test': {
            path: 'tasks/limit-test.md',
            type: 'task',
            keywords: [],
            usedBy: ['phantom-a', 'phantom-b'],
            dependencies: ['phantom-c'],
            checksum: 'sha256:wrong',
            lastVerified: '2020-01-01',
          },
        },
      });

      const healer = createTestHealer();
      const healthResult = healer.runHealthCheck();
      healer.heal(healthResult.issues, { autoOnly: true });

      const allEntries = healer.queryHealingLog();
      expect(allEntries.length).toBeGreaterThan(1);

      const limited = healer.queryHealingLog({ limit: 1 });
      expect(limited).toHaveLength(1);
    });
  });

  // ─── Backup Pruning ────────────────────────────────────────────

  describe('backup pruning', () => {
    it('retains at most MAX_BACKUPS backup files', () => {
      const content = '# Prune Test';
      createTestFile('tasks/prune-test.md', content);

      // Create more than MAX_BACKUPS healing runs
      for (let i = 0; i < MAX_BACKUPS + 3; i++) {
        writeTestRegistry({
          tasks: {
            'prune-test': {
              path: 'tasks/prune-test.md',
              type: 'task',
              keywords: [],
              usedBy: [],
              dependencies: [],
              checksum: `sha256:wrong${i}`,
              lastVerified: new Date().toISOString(),
            },
          },
        });

        const healer = createTestHealer();
        const healthResult = healer.runHealthCheck();
        healer.heal(healthResult.issues, { autoOnly: true });
      }

      // Count backup files
      const backupFiles = fs.readdirSync(TEST_BACKUP_DIR)
        .filter((f) => f.endsWith('.yaml'));
      expect(backupFiles.length).toBeLessThanOrEqual(MAX_BACKUPS);
    });
  });

  // ─── Auto-Healable Rate Verification ───────────────────────────

  describe('80%+ auto-healable rate (AC: 10)', () => {
    it('achieves at least 80% auto-healable rate across all rule types', () => {
      // Create a registry with ALL 6 issue types present
      const content = '# Rate Test';
      createTestFile('tasks/rate-test.md', content);
      const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString();

      writeTestRegistry({
        tasks: {
          // missing-file (critical, NOT auto-healable) = 1
          'missing-entity': {
            path: 'tasks/nonexistent.md',
            type: 'task',
            keywords: ['missing'],
            usedBy: [],
            dependencies: [],
            checksum: 'sha256:abc',
            lastVerified: new Date().toISOString(),
          },
          // checksum-mismatch (high, auto-healable) = 1
          'bad-checksum': {
            path: 'tasks/rate-test.md',
            type: 'task',
            keywords: ['rate'],
            usedBy: ['phantom-ref'],       // orphaned-usedBy (medium, auto-healable) = 1
            dependencies: ['phantom-dep'], // orphaned-dependency (medium, auto-healable) = 1
            checksum: 'sha256:wrong_checksum_here',
            lastVerified: tenDaysAgo,      // stale-verification (low, auto-healable) = 1
          },
          // missing-keywords (low, auto-healable) = 1
          'no-kw-entity': {
            path: 'tasks/rate-test.md',
            type: 'task',
            keywords: [],
            usedBy: [],
            dependencies: [],
            checksum: checksumFor(content),
            lastVerified: new Date().toISOString(),
          },
        },
      });

      const healer = createTestHealer();
      const result = healer.runHealthCheck();

      // Expect issues from all categories
      expect(result.summary.total).toBeGreaterThanOrEqual(6);
      // Auto-healable rate should be >= 80% (5 out of 6 rule types are auto-healable)
      expect(result.summary.autoHealableRate).toBeGreaterThanOrEqual(80);
    });
  });

  // ─── SEVERITY_ORDER ────────────────────────────────────────────

  describe('SEVERITY_ORDER', () => {
    it('has correct ordering (critical=0, low=3)', () => {
      expect(SEVERITY_ORDER.critical).toBe(0);
      expect(SEVERITY_ORDER.high).toBe(1);
      expect(SEVERITY_ORDER.medium).toBe(2);
      expect(SEVERITY_ORDER.low).toBe(3);
    });
  });

  // ─── Constructor ───────────────────────────────────────────────

  describe('constructor', () => {
    it('accepts custom options', () => {
      const healer = new RegistryHealer({
        registryPath: '/custom/path.yaml',
        repoRoot: '/custom/root',
        healingLogPath: '/custom/log.jsonl',
        backupDir: '/custom/backups',
      });

      expect(healer._registryPath).toBe('/custom/path.yaml');
      expect(healer._repoRoot).toBe('/custom/root');
      expect(healer._healingLogPath).toBe('/custom/log.jsonl');
      expect(healer._backupDir).toBe('/custom/backups');
    });
  });
});
