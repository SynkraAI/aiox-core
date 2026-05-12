#!/usr/bin/env node
'use strict';

/**
 * Registry Healer - Self-Healing Data Integrity
 *
 * Detects and auto-fixes data integrity issues in the entity registry:
 * - Missing files (CRITICAL, non-auto-healable)
 * - Checksum mismatches (HIGH, auto-healable)
 * - Orphaned usedBy references (MEDIUM, auto-healable)
 * - Orphaned dependency references (MEDIUM, auto-healable)
 * - Missing keywords (LOW, auto-healable)
 * - Stale lastVerified timestamps (LOW, auto-healable)
 *
 * @module core/ids/registry-healer
 * @version 1.0.0
 * @story IDS-4a (Self-Healing Registry: Data Integrity)
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const crypto = require('crypto');

const { RegistryLoader } = require(path.resolve(__dirname, 'registry-loader.js'));
const {
  computeChecksum,
  extractKeywords,
  REPO_ROOT,
  REGISTRY_PATH,
} = require(path.resolve(__dirname, '../../development/scripts/populate-entity-registry.js'));

// ─── Constants ─────────────────────────────────────────────────────

const HEALING_LOG_PATH = path.resolve(REPO_ROOT, '.aiox-core/data/registry-healing-log.jsonl');
const HEALING_BACKUP_DIR = path.resolve(REPO_ROOT, '.aiox-core/data/registry-backups/healing');
const MAX_HEALING_LOG_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_BACKUPS = 10;
const STALE_DAYS_THRESHOLD = 7;

const SEVERITY_ORDER = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

// ─── Healing Rules Configuration ───────────────────────────────────

const HEALING_RULES = [
  {
    id: 'missing-file',
    description: 'Referenced file does not exist on disk',
    severity: 'critical',
    autoHealable: false,
    manualAction: 'Verify file location or remove entity from registry',
  },
  {
    id: 'checksum-mismatch',
    description: 'File content changed since last verification',
    severity: 'high',
    autoHealable: true,
  },
  {
    id: 'orphaned-usedBy',
    description: 'usedBy reference points to non-existent entity',
    severity: 'medium',
    autoHealable: true,
  },
  {
    id: 'orphaned-dependency',
    description: 'dependency reference points to non-existent entity',
    severity: 'medium',
    autoHealable: true,
  },
  {
    id: 'missing-keywords',
    description: 'Entity has no keywords for searchability',
    severity: 'low',
    autoHealable: true,
  },
  {
    id: 'stale-verification',
    description: `Entity not verified in over ${STALE_DAYS_THRESHOLD} days`,
    severity: 'low',
    autoHealable: true,
  },
];

// ─── Helper Functions ──────────────────────────────────────────────

/**
 * Calculate the number of days since a given ISO date string.
 * @param {string|undefined} dateStr - ISO date string
 * @returns {number} Days elapsed (Infinity if no date)
 */
function daysSince(dateStr) {
  if (!dateStr) return Infinity;
  const then = new Date(dateStr).getTime();
  if (isNaN(then)) return Infinity;
  return (Date.now() - then) / (1000 * 60 * 60 * 24);
}

/**
 * Build a flat map of all entity IDs from the registry's nested structure.
 * Returns { entityId: { category, ...entityData } }
 * @param {object} entities - Registry entities (nested by category)
 * @returns {Map<string, object>} Flat map entityId -> entity data
 */
function buildEntityIndex(entities) {
  const index = new Map();
  if (!entities) return index;

  for (const [category, categoryEntities] of Object.entries(entities)) {
    if (!categoryEntities || typeof categoryEntities !== 'object') continue;
    for (const [entityId, entityData] of Object.entries(categoryEntities)) {
      index.set(entityId, { ...entityData, _category: category, _entityId: entityId });
    }
  }
  return index;
}

// ─── RegistryHealer Class ──────────────────────────────────────────

class RegistryHealer {
  /**
   * @param {object} options
   * @param {string} [options.registryPath] - Path to entity-registry.yaml
   * @param {string} [options.repoRoot] - Repository root
   * @param {string} [options.healingLogPath] - Path to healing log
   * @param {string} [options.backupDir] - Path to healing backup directory
   */
  constructor(options = {}) {
    this._registryPath = options.registryPath || REGISTRY_PATH;
    this._repoRoot = options.repoRoot || REPO_ROOT;
    this._healingLogPath = options.healingLogPath || HEALING_LOG_PATH;
    this._backupDir = options.backupDir || HEALING_BACKUP_DIR;
    this._loader = new RegistryLoader(this._registryPath);
    this._notificationManager = null;
  }

  /**
   * Lazy-load the NotificationManager to avoid hard dependency failures.
   * @returns {object|null} NotificationManager instance or null
   */
  _getNotificationManager() {
    if (this._notificationManager !== undefined && this._notificationManager !== null) {
      return this._notificationManager;
    }
    try {
      const { NotificationManager } = require(
        path.resolve(__dirname, '../quality-gates/notification-manager.js'),
      );
      this._notificationManager = new NotificationManager({
        channels: ['console', 'file'],
      });
    } catch {
      this._notificationManager = null;
    }
    return this._notificationManager;
  }

  // ─── Health Check (Task 1 & 2) ─────────────────────────────────

  /**
   * Run a full health check on the entity registry.
   * Detects all issue types defined in HEALING_RULES.
   *
   * @returns {object} Health check result
   *   - issues: Array of detected issues
   *   - summary: { total, bySeverity, autoHealable, needsManual }
   *   - timestamp: ISO string
   */
  runHealthCheck() {
    const registry = this._loader.load();
    const entityIndex = buildEntityIndex(registry.entities);
    const issues = [];

    for (const [entityId, entity] of entityIndex) {
      const absPath = path.resolve(this._repoRoot, entity.path);

      // Rule: missing-file (CRITICAL)
      if (!fs.existsSync(absPath)) {
        issues.push(this._createIssue('missing-file', entityId, entity, {
          path: entity.path,
          absPath,
        }));
        // Skip further checks for missing files
        continue;
      }

      // Rule: checksum-mismatch (HIGH)
      try {
        const currentChecksum = computeChecksum(absPath);
        if (entity.checksum && currentChecksum !== entity.checksum) {
          issues.push(this._createIssue('checksum-mismatch', entityId, entity, {
            expected: entity.checksum,
            actual: currentChecksum,
          }));
        }
      } catch {
        // File read error during checksum — treat as warning, not issue
      }

      // Rule: orphaned-usedBy (MEDIUM)
      if (Array.isArray(entity.usedBy)) {
        const orphanedUsedBy = entity.usedBy.filter((ref) => !entityIndex.has(ref));
        if (orphanedUsedBy.length > 0) {
          issues.push(this._createIssue('orphaned-usedBy', entityId, entity, {
            orphanedRefs: orphanedUsedBy,
            totalRefs: entity.usedBy.length,
          }));
        }
      }

      // Rule: orphaned-dependency (MEDIUM)
      if (Array.isArray(entity.dependencies)) {
        const orphanedDeps = entity.dependencies.filter((ref) => !entityIndex.has(ref));
        if (orphanedDeps.length > 0) {
          issues.push(this._createIssue('orphaned-dependency', entityId, entity, {
            orphanedRefs: orphanedDeps,
            totalRefs: entity.dependencies.length,
          }));
        }
      }

      // Rule: missing-keywords (LOW)
      if (!entity.keywords || !Array.isArray(entity.keywords) || entity.keywords.length === 0) {
        issues.push(this._createIssue('missing-keywords', entityId, entity, {
          path: entity.path,
        }));
      }

      // Rule: stale-verification (LOW)
      if (daysSince(entity.lastVerified) > STALE_DAYS_THRESHOLD) {
        issues.push(this._createIssue('stale-verification', entityId, entity, {
          lastVerified: entity.lastVerified || 'never',
          daysSince: Math.floor(daysSince(entity.lastVerified)),
        }));
      }
    }

    // Sort by severity
    issues.sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);

    const summary = this._buildSummary(issues);

    return {
      issues,
      summary,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Create a structured issue object.
   * @param {string} ruleId - Healing rule ID
   * @param {string} entityId - Entity ID
   * @param {object} entity - Entity data
   * @param {object} details - Issue-specific details
   * @returns {object} Issue object
   */
  _createIssue(ruleId, entityId, entity, details) {
    const rule = HEALING_RULES.find((r) => r.id === ruleId);
    return {
      ruleId,
      severity: rule.severity,
      autoHealable: rule.autoHealable,
      description: rule.description,
      entityId,
      entityPath: entity.path,
      category: entity._category,
      details,
      manualAction: rule.manualAction || null,
    };
  }

  /**
   * Build summary statistics from issues array.
   * @param {Array} issues
   * @returns {object} Summary
   */
  _buildSummary(issues) {
    const bySeverity = { critical: 0, high: 0, medium: 0, low: 0 };
    let autoHealable = 0;
    let needsManual = 0;

    for (const issue of issues) {
      bySeverity[issue.severity]++;
      if (issue.autoHealable) {
        autoHealable++;
      } else {
        needsManual++;
      }
    }

    return {
      total: issues.length,
      bySeverity,
      autoHealable,
      needsManual,
      autoHealableRate: issues.length > 0
        ? Math.round((autoHealable / issues.length) * 100)
        : 100,
    };
  }

  // ─── Auto-Healing (Task 3) ─────────────────────────────────────

  /**
   * Heal detected issues.
   *
   * @param {Array} issues - Issues from runHealthCheck()
   * @param {object} [options]
   * @param {boolean} [options.autoOnly=true] - Only heal auto-healable issues
   * @param {boolean} [options.dryRun=false] - Report what would be healed without modifying
   * @returns {object} Healing result
   *   - healed: Array of healed issues with before/after
   *   - skipped: Array of skipped issues
   *   - errors: Array of healing errors
   *   - batchId: Unique batch identifier
   *   - backupPath: Path to pre-healing backup
   */
  heal(issues, options = {}) {
    const { autoOnly = true, dryRun = false } = options;

    const batchId = `heal-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    const healed = [];
    const skipped = [];
    const errors = [];

    // Filter issues
    const toHeal = autoOnly
      ? issues.filter((i) => i.autoHealable)
      : issues;
    const toSkip = autoOnly
      ? issues.filter((i) => !i.autoHealable)
      : [];

    skipped.push(...toSkip.map((i) => ({
      ...i,
      reason: 'Not auto-healable (requires manual intervention)',
    })));

    if (toHeal.length === 0) {
      return { healed, skipped, errors, batchId, backupPath: null };
    }

    // Create backup before healing
    let backupPath = null;
    if (!dryRun) {
      try {
        backupPath = this._createBackup(batchId);
      } catch (err) {
        return {
          healed,
          skipped,
          errors: [{ error: `Backup failed: ${err.message}`, fatal: true }],
          batchId,
          backupPath: null,
        };
      }
    }

    // Load registry for mutation
    const registry = this._loader.load();
    let registryModified = false;

    for (const issue of toHeal) {
      if (dryRun) {
        healed.push({
          ...issue,
          action: 'would-heal',
          before: null,
          after: null,
        });
        continue;
      }

      try {
        const result = this._healIssue(issue, registry);
        if (result.success) {
          healed.push({
            ...issue,
            action: 'healed',
            before: result.before,
            after: result.after,
          });
          registryModified = true;
        } else {
          errors.push({
            entityId: issue.entityId,
            ruleId: issue.ruleId,
            error: result.error,
          });
        }
      } catch (err) {
        errors.push({
          entityId: issue.entityId,
          ruleId: issue.ruleId,
          error: err.message,
        });
      }
    }

    // Write modified registry
    if (registryModified && !dryRun) {
      try {
        this._writeRegistry(registry);
      } catch (err) {
        // Auto-rollback on write failure
        try {
          this.rollback(batchId);
        } catch {
          // Rollback also failed — report both errors
        }
        return {
          healed: [],
          skipped,
          errors: [
            ...errors,
            { error: `Registry write failed, rolled back: ${err.message}`, fatal: true },
          ],
          batchId,
          backupPath,
        };
      }
    }

    // Log healing actions
    if (!dryRun) {
      for (const item of healed) {
        this._logHealingAction(batchId, item);
      }
      for (const err of errors) {
        this._logHealingAction(batchId, { ...err, action: 'error' });
      }
    }

    return { healed, skipped, errors, batchId, backupPath };
  }

  /**
   * Apply healing for a single issue.
   * @param {object} issue
   * @param {object} registry - Mutable registry object
   * @returns {object} { success, before, after, error }
   */
  _healIssue(issue, registry) {
    const { ruleId, entityId, category } = issue;
    const entity = registry.entities?.[category]?.[entityId];

    if (!entity) {
      return { success: false, error: `Entity ${entityId} not found in registry` };
    }

    switch (ruleId) {
      case 'checksum-mismatch':
        return this._healChecksum(entity, issue);

      case 'orphaned-usedBy':
        return this._healOrphanedUsedBy(entity, issue, registry);

      case 'orphaned-dependency':
        return this._healOrphanedDependency(entity, issue, registry);

      case 'missing-keywords':
        return this._healMissingKeywords(entity, issue);

      case 'stale-verification':
        return this._healStaleVerification(entity);

      default:
        return { success: false, error: `No healer for rule: ${ruleId}` };
    }
  }

  /**
   * Heal checksum mismatch by recomputing from file content.
   */
  _healChecksum(entity, _issue) {
    const before = entity.checksum;
    const absPath = path.resolve(this._repoRoot, entity.path);
    const newChecksum = computeChecksum(absPath);
    entity.checksum = newChecksum;
    entity.lastVerified = new Date().toISOString();
    return { success: true, before, after: newChecksum };
  }

  /**
   * Heal orphaned usedBy by removing references to non-existent entities.
   */
  _healOrphanedUsedBy(entity, issue, registry) {
    const entityIndex = buildEntityIndex(registry.entities);
    const before = [...(entity.usedBy || [])];
    entity.usedBy = (entity.usedBy || []).filter((ref) => entityIndex.has(ref));
    return { success: true, before, after: [...entity.usedBy] };
  }

  /**
   * Heal orphaned dependency by removing references to non-existent entities.
   */
  _healOrphanedDependency(entity, issue, registry) {
    const entityIndex = buildEntityIndex(registry.entities);
    const before = [...(entity.dependencies || [])];
    entity.dependencies = (entity.dependencies || []).filter((ref) => entityIndex.has(ref));
    return { success: true, before, after: [...entity.dependencies] };
  }

  /**
   * Heal missing keywords by extracting from file content.
   */
  _healMissingKeywords(entity, _issue) {
    const before = entity.keywords || [];
    const absPath = path.resolve(this._repoRoot, entity.path);

    try {
      const content = fs.readFileSync(absPath, 'utf8');
      const keywords = extractKeywords(absPath, content);
      entity.keywords = keywords;
      return { success: true, before, after: keywords };
    } catch (err) {
      return { success: false, error: `Failed to extract keywords: ${err.message}` };
    }
  }

  /**
   * Heal stale verification by recomputing checksum and updating timestamp.
   */
  _healStaleVerification(entity) {
    const before = entity.lastVerified;
    const absPath = path.resolve(this._repoRoot, entity.path);

    try {
      const newChecksum = computeChecksum(absPath);
      entity.checksum = newChecksum;
      entity.lastVerified = new Date().toISOString();
      return { success: true, before, after: entity.lastVerified };
    } catch (err) {
      return { success: false, error: `Failed to reverify: ${err.message}` };
    }
  }

  // ─── User Warnings (Task 4) ────────────────────────────────────

  /**
   * Emit warnings for issues that require manual intervention.
   * Integrates with AIOX NotificationManager (console + file channels).
   *
   * @param {Array} issues - Non-auto-healable issues
   * @returns {Array} Warning objects emitted
   */
  async emitWarnings(issues) {
    const warnings = [];

    for (const issue of issues) {
      const warning = this._formatWarning(issue);
      warnings.push(warning);

      // Console output
      console.warn(warning.formatted);

      // Notification integration
      const nm = this._getNotificationManager();
      if (nm) {
        try {
          await nm.sendThroughChannels({
            id: nm.generateNotificationId(),
            type: 'ids_health_warning',
            template: 'blocked',
            timestamp: new Date().toISOString(),
            recipient: '@dev',
            subject: `[IDS] ${issue.severity.toUpperCase()}: ${issue.ruleId}`,
            content: warning.formatted,
            metadata: {
              entityId: issue.entityId,
              ruleId: issue.ruleId,
              severity: issue.severity,
            },
            status: 'sent',
          });
        } catch {
          // Notification failure is non-blocking
        }
      }
    }

    return warnings;
  }

  /**
   * Format a warning message with context and suggested actions.
   * @param {object} issue
   * @returns {object} Warning object with formatted text
   */
  _formatWarning(issue) {
    const divider = '\u2501'.repeat(45);
    const lines = [
      '[IDS Self-Healing] WARNING',
      divider,
      `Issue: ${issue.ruleId} (${issue.severity.toUpperCase()})`,
      `Entity: ${issue.entityId}`,
      `Path: ${issue.entityPath}`,
      '',
      `Problem: ${issue.description}`,
    ];

    if (issue.details) {
      lines.push('');
      lines.push('Details:');
      for (const [key, value] of Object.entries(issue.details)) {
        if (key !== 'absPath') {
          lines.push(`  ${key}: ${JSON.stringify(value)}`);
        }
      }
    }

    lines.push('');
    lines.push('Suggested Actions:');

    const suggestedActions = this._getSuggestedActions(issue);
    for (let i = 0; i < suggestedActions.length; i++) {
      lines.push(`  ${i + 1}. ${suggestedActions[i]}`);
    }

    lines.push('');
    lines.push('This issue requires manual intervention and cannot be auto-fixed.');
    lines.push(divider);

    const formatted = lines.join('\n');

    return {
      entityId: issue.entityId,
      ruleId: issue.ruleId,
      severity: issue.severity,
      formatted,
      suggestedActions,
    };
  }

  /**
   * Get suggested manual actions based on issue type.
   * @param {object} issue
   * @returns {string[]} Suggested actions
   */
  _getSuggestedActions(issue) {
    switch (issue.ruleId) {
      case 'missing-file':
        return [
          `Check if file was moved: git log --follow --diff-filter=R -- "*${issue.entityId}*"`,
          'If intentionally deleted, remove from registry',
          `If accidentally deleted, restore from git: git checkout HEAD~1 -- ${issue.entityPath}`,
        ];
      default:
        return [
          'Review the issue details and apply appropriate fix',
          'Run \'aiox ids:health --fix\' after resolving',
        ];
    }
  }

  // ─── Backup & Rollback (Task 7) ────────────────────────────────

  /**
   * Create a backup of the current registry state.
   * @param {string} batchId - Healing batch identifier
   * @returns {string} Path to the backup file
   */
  _createBackup(batchId) {
    if (!fs.existsSync(this._backupDir)) {
      fs.mkdirSync(this._backupDir, { recursive: true });
    }

    const backupPath = path.join(this._backupDir, `${batchId}.yaml`);

    try {
      fs.copyFileSync(this._registryPath, backupPath);
    } catch (err) {
      throw new Error(`Failed to create backup: ${err.message}`);
    }

    // Retain only last MAX_BACKUPS
    this._pruneBackups();

    return backupPath;
  }

  /**
   * Rollback registry to a specific healing batch backup.
   * @param {string} batchId - Healing batch identifier
   * @returns {boolean} Whether rollback succeeded
   */
  rollback(batchId) {
    const backupPath = path.join(this._backupDir, `${batchId}.yaml`);

    if (!fs.existsSync(backupPath)) {
      throw new Error(`Backup not found for batch: ${batchId}`);
    }

    try {
      fs.copyFileSync(backupPath, this._registryPath);
      this._logHealingAction(batchId, {
        action: 'rollback',
        ruleId: 'rollback',
        entityId: 'registry',
        before: 'healed-state',
        after: 'pre-healing-state',
      });
      // Reload after rollback
      this._loader.load();
      return true;
    } catch (err) {
      throw new Error(`Rollback failed: ${err.message}`);
    }
  }

  /**
   * Remove old backups beyond MAX_BACKUPS limit.
   */
  _pruneBackups() {
    if (!fs.existsSync(this._backupDir)) return;

    const files = fs.readdirSync(this._backupDir)
      .filter((f) => f.endsWith('.yaml'))
      .map((f) => ({
        name: f,
        path: path.join(this._backupDir, f),
        mtime: fs.statSync(path.join(this._backupDir, f)).mtimeMs,
      }))
      .sort((a, b) => b.mtime - a.mtime);

    // Remove oldest beyond MAX_BACKUPS
    for (let i = MAX_BACKUPS; i < files.length; i++) {
      try {
        fs.unlinkSync(files[i].path);
      } catch {
        // Best-effort cleanup
      }
    }
  }

  // ─── Healing Audit Log (Task 6) ────────────────────────────────

  /**
   * Log a healing action to the JSONL audit log.
   * @param {string} batchId - Healing batch ID
   * @param {object} entry - Log entry data
   */
  _logHealingAction(batchId, entry) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      batchId,
      action: entry.action || 'heal',
      ruleId: entry.ruleId,
      entityId: entry.entityId,
      entityPath: entry.entityPath || null,
      severity: entry.severity || null,
      before: entry.before !== undefined ? entry.before : null,
      after: entry.after !== undefined ? entry.after : null,
      success: entry.action !== 'error',
      error: entry.error || null,
    };

    try {
      const logDir = path.dirname(this._healingLogPath);
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }

      // Rotate if too large
      this._rotateLogIfNeeded();

      fs.appendFileSync(this._healingLogPath, JSON.stringify(logEntry) + '\n');
    } catch {
      // Logging failure is non-blocking
    }
  }

  /**
   * Rotate the healing log if it exceeds MAX_HEALING_LOG_SIZE.
   */
  _rotateLogIfNeeded() {
    try {
      if (!fs.existsSync(this._healingLogPath)) return;
      const stats = fs.statSync(this._healingLogPath);
      if (stats.size > MAX_HEALING_LOG_SIZE) {
        const rotatedPath = this._healingLogPath + '.old';
        fs.renameSync(this._healingLogPath, rotatedPath);
      }
    } catch {
      // Non-blocking
    }
  }

  /**
   * Query the healing audit log.
   * @param {object} [filter]
   * @param {string} [filter.batchId] - Filter by batch
   * @param {string} [filter.ruleId] - Filter by rule
   * @param {string} [filter.entityId] - Filter by entity
   * @param {number} [filter.limit=50] - Max entries
   * @returns {Array} Log entries
   */
  queryHealingLog(filter = {}) {
    if (!fs.existsSync(this._healingLogPath)) return [];

    const lines = fs.readFileSync(this._healingLogPath, 'utf8')
      .trim()
      .split('\n')
      .filter(Boolean);

    let entries = lines.map((line) => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    }).filter(Boolean);

    if (filter.batchId) {
      entries = entries.filter((e) => e.batchId === filter.batchId);
    }
    if (filter.ruleId) {
      entries = entries.filter((e) => e.ruleId === filter.ruleId);
    }
    if (filter.entityId) {
      entries = entries.filter((e) => e.entityId === filter.entityId);
    }

    const limit = filter.limit || 50;
    return entries.slice(-limit);
  }

  // ─── Registry Write ────────────────────────────────────────────

  /**
   * Write registry to disk (follows registry-updater pattern).
   * @param {object} registryData
   */
  _writeRegistry(registryData) {
    const yamlStr = yaml.dump(registryData, {
      lineWidth: 120,
      noRefs: true,
      sortKeys: false,
    });

    const dir = path.dirname(this._registryPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(this._registryPath, yamlStr, 'utf8');
  }
}

module.exports = {
  RegistryHealer,
  HEALING_RULES,
  HEALING_LOG_PATH,
  HEALING_BACKUP_DIR,
  MAX_BACKUPS,
  STALE_DAYS_THRESHOLD,
  SEVERITY_ORDER,
  daysSince,
  buildEntityIndex,
};
