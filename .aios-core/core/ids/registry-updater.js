#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const lockfile = require('proper-lockfile');
const { RegistryLoader } = require(path.resolve(__dirname, 'registry-loader.js'));
const {
  extractEntityId,
  extractKeywords,
  extractPurpose,
  detectDependencies,
  computeChecksum,
  resolveUsedBy,
  SCAN_CONFIG,
  ADAPTABILITY_DEFAULTS,
  REPO_ROOT,
  REGISTRY_PATH,
} = require(path.resolve(__dirname, '../../development/scripts/populate-entity-registry.js'));
const { enrichRegistryEntry } = require(path.resolve(__dirname, '../code-intel/helpers/creation-helper'));
const { classifyLayer } = require(path.resolve(__dirname, 'layer-classifier'));

const LOCK_FILE = path.resolve(REPO_ROOT, '.aios-core/data/.entity-registry.lock');
const BACKUP_DIR = path.resolve(REPO_ROOT, '.aios-core/data/registry-backups');
const AUDIT_LOG_PATH = path.resolve(REPO_ROOT, '.aios-core/data/registry-update-log.jsonl');
const MAX_AUDIT_LOG_SIZE = 5 * 1024 * 1024; // 5MB
const DEBOUNCE_MS = 100;
const LOCK_TIMEOUT_MS = 5000;
const LOCK_RETRY_COUNT = 3;
const LOCK_RETRY_DELAY_MS = 100;
const LOCK_STALE_MS = 10000;

const WATCH_PATHS = SCAN_CONFIG.map((c) => c.basePath);

const INCLUDE_EXTENSIONS = new Set(['.md', '.yaml', '.yml', '.js', '.ts', '.mjs']);

const EXCLUDE_PATTERNS = [
  /node_modules/,
  /\.test\.js$/,
  /\.spec\.js$/,
  /README\.md$/i,
  /registry-update-log\.jsonl$/,
  /\.entity-registry\.lock$/,
  /registry-backups/,
  /entity-registry\.yaml$/,
];

class RegistryUpdater {
  constructor(options = {}) {
    this._registryPath = options.registryPath || REGISTRY_PATH;
    // Resolve repoRoot to real path to handle macOS /var -> /private/var symlink
    // This ensures path.relative() works correctly with resolved file paths
    const rawRepoRoot = options.repoRoot || REPO_ROOT;
    try {
      this._repoRoot = fs.realpathSync(rawRepoRoot);
    } catch {
      this._repoRoot = rawRepoRoot;
    }
    this._debounceMs = options.debounceMs ?? DEBOUNCE_MS;
    this._auditLogPath = options.auditLogPath || AUDIT_LOG_PATH;
    this._lockFile = options.lockFile || LOCK_FILE;
    this._backupDir = options.backupDir || BACKUP_DIR;
    this._watcher = null;
    this._pendingUpdates = new Map();
    this._debounceTimer = null;
    this._isProcessing = false;
    this._loader = new RegistryLoader(this._registryPath);
    this._updateCount = 0;
  }

  /**
   * Start file system watcher (persistent mode).
   * Returns the chokidar watcher instance.
   */
  startWatcher() {
    const chokidar = require('chokidar');

    const watchPaths = WATCH_PATHS.map((p) => {
      const abs = path.resolve(this._repoRoot, p);
      return abs.replace(/\\/g, '/');
    }).filter((p) => fs.existsSync(p));

    if (watchPaths.length === 0) {
      console.warn('[IDS-Updater] No watch paths found. Watcher not started.');
      return null;
    }

    this._watcher = chokidar.watch(watchPaths, {
      persistent: true,
      ignoreInitial: true,
      ignored: (filePath) => this._isExcluded(filePath),
      followSymlinks: true,
      awaitWriteFinish: { stabilityThreshold: 200, pollInterval: 50 },
    });

    this._watcher
      .on('add', (filePath) => this._queueUpdate('add', filePath))
      .on('change', (filePath) => this._queueUpdate('change', filePath))
      .on('unlink', (filePath) => this._queueUpdate('unlink', filePath))
      .on('error', (err) => {
        console.error(`[IDS-Updater] Watcher error: ${err.message}`);
      });

    console.log(`[IDS-Updater] Watching ${watchPaths.length} paths for changes.`);
    return this._watcher;
  }

  /**
   * Stop the file system watcher.
   */
  async stopWatcher() {
    if (this._watcher) {
      await this._watcher.close();
      this._watcher = null;
      console.log('[IDS-Updater] Watcher stopped.');
    }
    if (this._debounceTimer) {
      clearTimeout(this._debounceTimer);
      this._debounceTimer = null;
    }
  }

  /**
   * Process specific files on-demand (CLI / hook mode).
   * Resolves symlinks before filtering and processing.
   * @param {Array<{action: string, filePath: string}>} changes
   */
  async processChanges(changes) {
    if (!changes || changes.length === 0) return { updated: 0, errors: [] };

    const validChanges = changes
      .filter((c) => c && typeof c.filePath === 'string' && c.filePath && c.action)
      .map((c) => {
        const abs = path.isAbsolute(c.filePath)
          ? c.filePath
          : path.resolve(this._repoRoot, c.filePath);
        // For unlink, file doesn't exist so _resolveSymlink returns original path
        // We need to manually resolve the path to match _repoRoot format on macOS
        let resolved = this._resolveSymlink(abs);
        if (c.action === 'unlink' && resolved === abs) {
          // File doesn't exist - normalize path manually for macOS /var -> /private/var
          // This ensures path.relative() works correctly with _repoRoot
          resolved = abs.replace(/^\/var\//, '/private/var/');
        }
        return { action: c.action, filePath: resolved };
      })
      .filter((c) => {
        // For unlink (delete), skip file existence checks - the file no longer exists
        // We only need to verify the path would be in scope and not excluded
        if (c.action === 'unlink') {
          if (this._isExcluded(c.filePath)) return false;
          // For deletions, check if path matches any known category pattern
          const relPath = path.relative(this._repoRoot, c.filePath).replace(/\\/g, '/');
          return this._detectCategory(relPath) !== null;
        }
        // For add/change, use standard inclusion check
        return !this._isExcluded(c.filePath) && this._isIncluded(c.filePath);
      });

    if (validChanges.length === 0) return { updated: 0, errors: [] };

    return this._executeBatch(validChanges);
  }

  /**
   * Hook for agent task completion.
   * @param {object} task - Task metadata
   * @param {string[]} artifacts - List of affected file paths
   */
  async onAgentTaskComplete(task, artifacts) {
    if (!artifacts || artifacts.length === 0) return { updated: 0, errors: [] };

    const changes = [];
    for (const filePath of artifacts) {
      const abs = path.isAbsolute(filePath)
        ? filePath
        : path.resolve(this._repoRoot, filePath);

      if (fs.existsSync(abs)) {
        changes.push({ action: 'change', filePath: abs });
      } else {
        changes.push({ action: 'unlink', filePath: abs });
      }
    }

    const result = await this.processChanges(changes);

    this._logAudit({
      trigger: 'agent-task-complete',
      taskId: task?.id || 'unknown',
      agent: task?.agent || 'unknown',
      artifactCount: artifacts.length,
      updated: result.updated,
    });

    return result;
  }

  // ─── Internal: Queuing & Debouncing ──────────────────────────────

  _queueUpdate(action, filePath) {
    const normalized = path.resolve(filePath).replace(/\\/g, '/');
    this._pendingUpdates.set(normalized, { action, filePath: normalized, timestamp: Date.now() });

    if (this._debounceTimer) {
      clearTimeout(this._debounceTimer);
    }
    this._debounceTimer = setTimeout(() => {
      this._flushPending().catch((err) => {
        console.error(`[IDS-Updater] Flush failed: ${err.message}`);
        this._isProcessing = false;
      });
    }, this._debounceMs);
  }

  async _flushPending() {
    if (this._pendingUpdates.size === 0) return;

    if (this._isProcessing) {
      // Re-schedule flush — don't drop pending updates
      if (!this._debounceTimer) {
        this._debounceTimer = setTimeout(() => {
          this._flushPending().catch((err) => {
            console.error(`[IDS-Updater] Deferred flush failed: ${err.message}`);
            this._isProcessing = false;
          });
        }, this._debounceMs);
      }
      return;
    }

    const batch = Array.from(this._pendingUpdates.values());
    this._pendingUpdates.clear();
    this._debounceTimer = null;

    await this._executeBatch(batch);
  }

  // ─── Internal: Batch Execution with Locking ──────────────────────

  async _executeBatch(batch) {
    this._isProcessing = true;
    const errors = [];
    let updated = 0;

    try {
      await this._withLock(async () => {
        const registry = this._loadRegistry();

        for (const { action, filePath } of batch) {
          try {
            const abs = path.isAbsolute(filePath)
              ? filePath
              : path.resolve(this._repoRoot, filePath);

            let mutated = false;
            switch (action) {
              case 'add':
                mutated = this._handleFileCreate(registry, abs);
                break;
              case 'change':
                mutated = this._handleFileModify(registry, abs);
                break;
              case 'unlink':
                mutated = this._handleFileDelete(registry, abs);
                break;
              default:
                console.warn(`[IDS-Updater] Unknown action: ${action}`);
            }
            if (mutated) updated++;

            this._logAudit({ action, path: path.relative(this._repoRoot, abs).replace(/\\/g, '/'), trigger: 'watcher' });
          } catch (err) {
            const relPath = path.relative(this._repoRoot, filePath).replace(/\\/g, '/');
            errors.push({ path: relPath, error: err.message });
            console.error(`[IDS-Updater] Error processing ${relPath}: ${err.message}`);
          }
        }

        if (updated > 0) {
          this._resolveAllUsedBy(registry);

          // NOG-8: Apply code intelligence enrichment AFTER resolveAllUsedBy
          // so that code-intel usedBy data is merged on top of static graph
          await this._applyCodeIntelEnrichments(registry);
          registry.metadata.lastUpdated = new Date().toISOString();
          registry.metadata.entityCount = this._countEntities(registry);
          this._writeRegistry(registry);
        }
      });
    } catch (err) {
      console.error(`[IDS-Updater] Batch execution failed: ${err.message}`);
      errors.push({ path: 'batch', error: err.message });
    } finally {
      this._isProcessing = false;
    }

    this._updateCount += updated;
    return { updated, errors };
  }

  // ─── Internal: File Handlers (AC 2, 3, 4) ───────────────────────

  _handleFileCreate(registry, absPath) {
    const relPath = path.relative(this._repoRoot, absPath).replace(/\\/g, '/');
    const config = this._detectCategory(relPath);
    if (!config) return false;

    let content = '';
    try {
      content = fs.readFileSync(absPath, 'utf8');
    } catch (err) {
      if (err.code === 'EACCES' || err.code === 'EPERM') {
        console.warn(`[IDS-Updater] Permission denied reading ${relPath} — skipping`);
        return false;
      }
      throw err;
    }

    const entityId = extractEntityId(absPath);
    const category = config.category;

    if (!registry.entities[category]) {
      registry.entities[category] = {};
    }

    const keywords = extractKeywords(absPath, content);
    const purpose = extractPurpose(content, absPath);
    const dependencies = detectDependencies(content, entityId);
    const checksum = computeChecksum(absPath);
    const defaultScore = ADAPTABILITY_DEFAULTS[config.type] || 0.5;

    registry.entities[category][entityId] = {
      path: relPath,
      layer: classifyLayer(relPath),
      type: config.type,
      purpose,
      keywords,
      usedBy: [],
      dependencies,
      adaptability: {
        score: defaultScore,
        constraints: [],
        extensionPoints: [],
      },
      checksum,
      lastVerified: new Date().toISOString(),
    };

    // NOG-8: Enrich with code intelligence data (advisory, never blocks registration)
    this._pendingEnrichments = this._pendingEnrichments || [];
    this._pendingEnrichments.push({ entityId, category, relPath });

    return true;
  }

  _handleFileModify(registry, absPath) {
    const relPath = path.relative(this._repoRoot, absPath).replace(/\\/g, '/');
    const config = this._detectCategory(relPath);
    if (!config) return false;

    const entityId = extractEntityId(absPath);
    const category = config.category;
    const existing = registry.entities[category]?.[entityId];

    if (!existing) {
      return this._handleFileCreate(registry, absPath);
    }

    let content = '';
    try {
      content = fs.readFileSync(absPath, 'utf8');
    } catch (err) {
      if (err.code === 'EACCES' || err.code === 'EPERM') {
        console.warn(`[IDS-Updater] Permission denied reading ${relPath} — skipping`);
        return false;
      }
      throw err;
    }

    const newChecksum = computeChecksum(absPath);

    if (newChecksum !== existing.checksum) {
      existing.checksum = newChecksum;
      existing.purpose = extractPurpose(content, absPath);
      existing.keywords = extractKeywords(absPath, content);
      existing.dependencies = detectDependencies(content, entityId);
    }

    existing.lastVerified = new Date().toISOString();
    return true;
  }

  _handleFileDelete(registry, absPath) {
    const relPath = path.relative(this._repoRoot, absPath).replace(/\\/g, '/');
    const entityId = extractEntityId(absPath);

    let found = false;
    for (const [_category, entities] of Object.entries(registry.entities)) {
      if (entities[entityId] && entities[entityId].path === relPath) {
        delete entities[entityId];
        found = true;

        for (const catEntities of Object.values(registry.entities)) {
          for (const entity of Object.values(catEntities)) {
            if (entity.usedBy) {
              entity.usedBy = entity.usedBy.filter((id) => id !== entityId);
            }
          }
        }

        console.log(`[IDS-Updater] Removed entity: ${entityId} (${relPath})`);
        break;
      }
    }

    if (!found) {
      for (const [_category, entities] of Object.entries(registry.entities)) {
        for (const [id, entity] of Object.entries(entities)) {
          if (entity.path === relPath) {
            delete entities[id];
            for (const catEntities of Object.values(registry.entities)) {
              for (const e of Object.values(catEntities)) {
                if (e.usedBy) {
                  e.usedBy = e.usedBy.filter((uid) => uid !== id);
                }
              }
            }
            console.log(`[IDS-Updater] Removed entity: ${id} (${relPath})`);
            found = true;
            break;
          }
        }
        if (found) break;
      }
    }
    return found;
  }

  // ─── Internal: Code Intelligence Enrichment (NOG-8) ────────────

  /**
   * Apply code intelligence enrichment to newly created entities.
   * Advisory only — never blocks registration. Falls back gracefully.
   * @param {Object} registry - Registry data
   * @private
   */
  async _applyCodeIntelEnrichments(registry) {
    const pending = this._pendingEnrichments || [];
    this._pendingEnrichments = [];

    for (const { entityId, category, relPath } of pending) {
      try {
        const entity = registry.entities[category]?.[entityId];
        if (!entity) continue;

        const enrichment = await enrichRegistryEntry(entityId, relPath);
        if (!enrichment) continue;

        // Pre-populate usedBy if code intel found references
        if (enrichment.usedBy && enrichment.usedBy.length > 0) {
          entity.usedBy = [...new Set([...(entity.usedBy || []), ...enrichment.usedBy])];
        }

        // Pre-populate dependencies if code intel found them
        if (enrichment.dependencies && enrichment.dependencies.nodes && enrichment.dependencies.nodes.length > 0) {
          const existingDeps = Array.isArray(entity.dependencies) ? entity.dependencies : [];
          const newDeps = enrichment.dependencies.nodes.filter((n) => typeof n === 'string');
          entity.dependencies = [...new Set([...existingDeps, ...newDeps])];
        }
      } catch {
        // NOG-8 AC5: Fallback — enrichment failure never blocks registration
      }
    }
  }

  // ─── Internal: Registry I/O ──────────────────────────────────────

  _loadRegistry() {
    const loader = new RegistryLoader(this._registryPath);
    return loader.load();
  }

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

    try {
      fs.writeFileSync(this._registryPath, yamlStr, 'utf8');
    } catch (err) {
      if (err.code === 'ENOSPC') {
        console.error('[IDS-Updater] Disk full — registry write failed. Retrying not possible.');
        throw err;
      }
      throw new Error(`[IDS-Updater] Failed to write registry: ${err.message}`);
    }
  }

  // ─── Internal: File Locking ──────────────────────────────────────

  async _withLock(operation) {
    const lockDir = path.dirname(this._lockFile);
    if (!fs.existsSync(lockDir)) {
      fs.mkdirSync(lockDir, { recursive: true });
    }

    if (!fs.existsSync(this._registryPath)) {
      this._writeRegistry(this._loadRegistry());
    }

    let release;
    try {
      release = await lockfile.lock(this._registryPath, {
        stale: LOCK_STALE_MS,
        retries: {
          retries: LOCK_RETRY_COUNT,
          minTimeout: LOCK_RETRY_DELAY_MS,
          maxTimeout: LOCK_TIMEOUT_MS,
        },
        lockfilePath: this._lockFile,
      });
    } catch (err) {
      throw new Error(`[IDS-Updater] Could not acquire lock: ${err.message}`);
    }

    try {
      await operation();
    } finally {
      try {
        await release();
      } catch {
        // Lock already released or stale
      }
    }
  }

  // ─── Internal: Audit Logging (AC 9) ─────────────────────────────

  _logAudit(entry) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      ...entry,
    };

    try {
      this._rotateLogIfNeeded();
      fs.appendFileSync(this._auditLogPath, JSON.stringify(logEntry) + '\n', 'utf8');
    } catch {
      // Audit logging should never break the main flow
    }
  }

  _rotateLogIfNeeded() {
    try {
      if (!fs.existsSync(this._auditLogPath)) return;
      const stat = fs.statSync(this._auditLogPath);
      if (stat.size >= MAX_AUDIT_LOG_SIZE) {
        if (!fs.existsSync(this._backupDir)) {
          fs.mkdirSync(this._backupDir, { recursive: true });
        }
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupPath = path.join(this._backupDir, `registry-update-log-${timestamp}.jsonl`);
        fs.renameSync(this._auditLogPath, backupPath);
      }
    } catch {
      // Rotation failure should not block operations
    }
  }

  // ─── Internal: Helpers ───────────────────────────────────────────

  _detectCategory(relPath) {
    const normalized = relPath.replace(/\\/g, '/');
    for (const config of SCAN_CONFIG) {
      if (normalized.startsWith(config.basePath)) {
        return config;
      }
    }
    return null;
  }

  _isExcluded(filePath) {
    const normalized = filePath.replace(/\\/g, '/');
    return EXCLUDE_PATTERNS.some((pattern) => pattern.test(normalized));
  }

  _isIncluded(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    if (!INCLUDE_EXTENSIONS.has(ext)) return false;
    const relPath = path.relative(this._repoRoot, filePath).replace(/\\/g, '/');
    return this._detectCategory(relPath) !== null;
  }

  _resolveAllUsedBy(registry) {
    for (const catEntities of Object.values(registry.entities)) {
      for (const entity of Object.values(catEntities)) {
        entity.usedBy = [];
      }
    }
    resolveUsedBy(registry.entities);
  }

  _countEntities(registry) {
    let count = 0;
    for (const catEntities of Object.values(registry.entities)) {
      count += Object.keys(catEntities).length;
    }
    return count;
  }

  /**
   * Resolve symlinks to real path before processing.
   * Used in processChanges() for on-demand mode.
   * Watcher mode uses chokidar's followSymlinks: true instead.
   */
  _resolveSymlink(filePath) {
    try {
      return fs.realpathSync(filePath);
    } catch {
      return filePath;
    }
  }

  /**
   * Get update statistics.
   */
  getStats() {
    return {
      totalUpdates: this._updateCount,
      isWatching: this._watcher !== null,
      pendingUpdates: this._pendingUpdates.size,
    };
  }

  /**
   * Query audit log entries.
   * @param {object} filter - { action, path, since, limit }
   */
  queryAuditLog(filter = {}) {
    if (!fs.existsSync(this._auditLogPath)) return [];

    const lines = fs.readFileSync(this._auditLogPath, 'utf8').trim().split('\n').filter(Boolean);
    let entries = lines.map((line) => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    }).filter(Boolean);

    if (filter.action) {
      entries = entries.filter((e) => e.action === filter.action);
    }
    if (filter.path) {
      entries = entries.filter((e) => e.path && e.path.includes(filter.path));
    }
    if (filter.since) {
      const since = new Date(filter.since).getTime();
      entries = entries.filter((e) => new Date(e.timestamp).getTime() >= since);
    }
    if (filter.limit) {
      entries = entries.slice(-filter.limit);
    }

    return entries;
  }
}

// ─── CLI Entrypoint ────────────────────────────────────────────────

if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.includes('--watch')) {
    const updater = new RegistryUpdater();
    updater.startWatcher();
    console.log('[IDS-Updater] Running in watcher mode. Press Ctrl+C to stop.');

    process.on('SIGINT', async () => {
      console.log('\n[IDS-Updater] Shutting down...');
      await updater.stopWatcher();
      const stats = updater.getStats();
      console.log(`[IDS-Updater] Total updates: ${stats.totalUpdates}`);
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      await updater.stopWatcher();
      process.exit(0);
    });
  } else if (args.includes('--files')) {
    const fileIdx = args.indexOf('--files');
    const files = args.slice(fileIdx + 1);

    if (files.length === 0) {
      console.error('[IDS-Updater] No files specified. Usage: --files file1 file2 ...');
      process.exit(1);
    }

    const updater = new RegistryUpdater();
    const changes = files.map((f) => {
      const abs = path.isAbsolute(f) ? f : path.resolve(REPO_ROOT, f);
      const action = fs.existsSync(abs) ? 'change' : 'unlink';
      return { action, filePath: abs };
    });

    updater.processChanges(changes).then((result) => {
      console.log(`[IDS-Updater] Processed ${result.updated} updates.`);
      if (result.errors.length > 0) {
        console.error('[IDS-Updater] Errors:', result.errors);
        process.exit(1);
      }
      process.exit(0);
    }).catch((err) => {
      console.error(`[IDS-Updater] Fatal error: ${err.message}`);
      process.exit(1);
    });
  } else if (args.includes('--log')) {
    const updater = new RegistryUpdater();
    const limitIdx = args.indexOf('--limit');
    const limit = limitIdx >= 0 ? parseInt(args[limitIdx + 1], 10) : 20;
    const entries = updater.queryAuditLog({ limit });
    for (const entry of entries) {
      console.log(`${entry.timestamp} | ${entry.action || entry.trigger} | ${entry.path || ''}`);
    }
  } else {
    console.log('Usage:');
    console.log('  --watch              Start file watcher (persistent mode)');
    console.log('  --files f1 f2 ...    Process specific files (on-demand mode)');
    console.log('  --log [--limit N]    Query audit log');
  }
}

module.exports = {
  RegistryUpdater,
  WATCH_PATHS,
  INCLUDE_EXTENSIONS,
  EXCLUDE_PATTERNS,
  AUDIT_LOG_PATH,
  LOCK_FILE,
  BACKUP_DIR,
};
