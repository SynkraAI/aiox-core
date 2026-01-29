#!/usr/bin/env node

/**
 * File Evolution Tracker - AIOS Gap Implementation
 *
 * Tracks file evolution across tasks, detecting drift and potential conflicts.
 * Extends ContextSnapshot with file-level tracking capabilities.
 *
 * Features:
 * - Track file changes per task (commits, modifications)
 * - Detect branch points and drift between tasks
 * - Identify potential merge conflicts before they happen
 * - Persist evolution timeline for cross-session analysis
 *
 * Integration:
 * - Uses ContextSnapshot for git state capture
 * - Uses BuildStateManager for timeline persistence
 *
 * @module file-evolution-tracker
 * @version 1.0.0
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');
const { ContextSnapshot } = require('./context-snapshot');

// ═══════════════════════════════════════════════════════════════════════════════════
//                              CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════════

const DEFAULT_CONFIG = {
  evolutionDir: '.aios/file-evolution',
  indexFile: 'evolution-index.json',
  maxEvolutionRecords: 1000,
  maxAgeMs: 30 * 24 * 60 * 60 * 1000, // 30 days
  trackBinaryFiles: false,
  ignoredPatterns: [
    /node_modules/,
    /\.git/,
    /dist\//,
    /build\//,
    /coverage\//,
    /\.log$/,
    /\.lock$/,
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════════
//                              ENUMS
// ═══════════════════════════════════════════════════════════════════════════════════

const EvolutionEventType = {
  FILE_CREATED: 'file_created',
  FILE_MODIFIED: 'file_modified',
  FILE_DELETED: 'file_deleted',
  FILE_RENAMED: 'file_renamed',
  BRANCH_POINT: 'branch_point',
  MERGE_POINT: 'merge_point',
  TASK_START: 'task_start',
  TASK_COMPLETE: 'task_complete',
};

const DriftSeverity = {
  NONE: 'none',
  LOW: 'low', // Different files modified
  MEDIUM: 'medium', // Same file, different sections
  HIGH: 'high', // Same file, overlapping sections
  CRITICAL: 'critical', // Same function/class modified
};

// ═══════════════════════════════════════════════════════════════════════════════════
//                              FILE EVOLUTION TRACKER CLASS
// ═══════════════════════════════════════════════════════════════════════════════════

class FileEvolutionTracker {
  /**
   * Create a new FileEvolutionTracker
   *
   * @param {Object} options - Configuration options
   * @param {string} [options.rootPath] - Project root path
   * @param {Object} [options.config] - Config overrides
   */
  constructor(options = {}) {
    this.rootPath = options.rootPath || process.cwd();
    this.config = { ...DEFAULT_CONFIG, ...options.config };
    this.evolutionDir = path.join(this.rootPath, this.config.evolutionDir);
    this.indexPath = path.join(this.evolutionDir, this.config.indexFile);

    // Initialize ContextSnapshot for git state capture
    this.contextSnapshot = new ContextSnapshot({
      rootPath: this.rootPath,
      config: { captureGitState: true },
    });

    // In-memory caches
    this._index = null;
    this._fileCache = new Map(); // filePath -> lastKnownHash
  }

  // ─────────────────────────────────────────────────────────────────────────────────
  //                              EVOLUTION TRACKING
  // ─────────────────────────────────────────────────────────────────────────────────

  /**
   * Track file evolution for a specific task
   *
   * @param {string} filePath - Path to file (relative to root)
   * @param {string} taskId - Task identifier
   * @param {Object} options - Tracking options
   * @returns {Object} Evolution record
   */
  trackFileEvolution(filePath, taskId, options = {}) {
    if (this._shouldIgnoreFile(filePath)) {
      return null;
    }

    const fullPath = path.join(this.rootPath, filePath);
    const now = new Date().toISOString();

    // Get current file state
    const fileState = this._getFileState(fullPath);
    const gitState = this._getGitStateForFile(filePath);

    // Determine event type
    const previousRecord = this._getLastRecordForFile(filePath);
    const eventType = this._determineEventType(fileState, previousRecord);

    const record = {
      id: this._generateId(),
      filePath,
      taskId,
      timestamp: now,
      eventType,

      // File state
      exists: fileState.exists,
      hash: fileState.hash,
      size: fileState.size,
      lineCount: fileState.lineCount,

      // Git state
      git: {
        branch: gitState.branch,
        commit: gitState.commit,
        isStaged: gitState.isStaged,
        isModified: gitState.isModified,
        lastCommitForFile: gitState.lastCommitForFile,
        commitsAhead: gitState.commitsAhead,
      },

      // Task context
      context: {
        storyId: options.storyId || null,
        subtaskId: options.subtaskId || null,
        agent: options.agent || null,
        intent: options.intent || null,
      },

      // Diff summary (if modified)
      diff:
        fileState.exists && previousRecord
          ? this._computeDiffSummary(filePath, previousRecord.hash, fileState.hash)
          : null,

      // Metadata
      metadata: {
        version: '1.0.0',
        trackedAt: now,
      },
    };

    // Save record
    this._saveRecord(record);

    // Update cache
    this._fileCache.set(filePath, fileState.hash);

    return record;
  }

  /**
   * Track all modified files for a task
   *
   * @param {string} taskId - Task identifier
   * @param {Object} options - Tracking options
   * @returns {Object[]} Array of evolution records
   */
  trackTaskEvolution(taskId, options = {}) {
    const modifiedFiles = this._getModifiedFiles();
    const records = [];

    for (const fileInfo of modifiedFiles) {
      const record = this.trackFileEvolution(fileInfo.file, taskId, {
        ...options,
        status: fileInfo.status,
      });
      if (record) {
        records.push(record);
      }
    }

    // Record task event
    const taskRecord = {
      id: this._generateId(),
      filePath: null,
      taskId,
      timestamp: new Date().toISOString(),
      eventType: options.eventType || EvolutionEventType.TASK_START,
      filesTracked: records.length,
      context: {
        storyId: options.storyId || null,
        subtaskId: options.subtaskId || null,
        agent: options.agent || null,
      },
    };

    this._saveRecord(taskRecord);

    return records;
  }

  /**
   * Record a branch point (when task creates a new branch)
   *
   * @param {string} taskId - Task identifier
   * @param {string} branchName - New branch name
   * @param {string} baseBranch - Base branch
   * @returns {Object} Branch point record
   */
  recordBranchPoint(taskId, branchName, baseBranch = 'main') {
    const gitState = this._captureGitState();

    const record = {
      id: this._generateId(),
      filePath: null,
      taskId,
      timestamp: new Date().toISOString(),
      eventType: EvolutionEventType.BRANCH_POINT,
      branch: {
        name: branchName,
        baseBranch,
        baseCommit: gitState.commit,
      },
    };

    this._saveRecord(record);
    return record;
  }

  // ─────────────────────────────────────────────────────────────────────────────────
  //                              DRIFT DETECTION
  // ─────────────────────────────────────────────────────────────────────────────────

  /**
   * Detect drift between tasks
   *
   * @param {string[]} taskIds - Task IDs to compare
   * @returns {Object} Drift analysis
   */
  detectDrift(taskIds) {
    const analysis = {
      tasks: taskIds,
      timestamp: new Date().toISOString(),
      overallSeverity: DriftSeverity.NONE,
      fileConflicts: [],
      recommendations: [],
    };

    // Get file evolution for each task
    const taskEvolutions = {};
    for (const taskId of taskIds) {
      taskEvolutions[taskId] = this.getTaskEvolution(taskId);
    }

    // Find files modified by multiple tasks
    const fileToTasks = new Map();
    for (const [taskId, records] of Object.entries(taskEvolutions)) {
      for (const record of records) {
        if (!record.filePath) continue;

        if (!fileToTasks.has(record.filePath)) {
          fileToTasks.set(record.filePath, new Set());
        }
        fileToTasks.get(record.filePath).add(taskId);
      }
    }

    // Analyze conflicts
    for (const [filePath, tasks] of fileToTasks) {
      if (tasks.size > 1) {
        const conflict = this._analyzeFileConflict(filePath, Array.from(tasks), taskEvolutions);
        analysis.fileConflicts.push(conflict);

        // Update overall severity
        if (
          this._severityLevel(conflict.severity) > this._severityLevel(analysis.overallSeverity)
        ) {
          analysis.overallSeverity = conflict.severity;
        }
      }
    }

    // Generate recommendations
    analysis.recommendations = this._generateRecommendations(analysis);

    return analysis;
  }

  /**
   * Analyze conflict for a specific file
   * @private
   */
  _analyzeFileConflict(filePath, taskIds, taskEvolutions) {
    const conflict = {
      filePath,
      tasks: taskIds,
      severity: DriftSeverity.LOW,
      changes: [],
      overlappingLines: [],
    };

    // Get changes for each task
    for (const taskId of taskIds) {
      const records = taskEvolutions[taskId].filter((r) => r.filePath === filePath);
      const latestRecord = records[records.length - 1];

      if (latestRecord && latestRecord.diff) {
        conflict.changes.push({
          taskId,
          eventType: latestRecord.eventType,
          linesAdded: latestRecord.diff.linesAdded || 0,
          linesRemoved: latestRecord.diff.linesRemoved || 0,
          sections: latestRecord.diff.sections || [],
        });
      }
    }

    // Determine severity based on changes
    if (conflict.changes.length >= 2) {
      // Check for overlapping sections
      const allSections = conflict.changes.flatMap((c) => c.sections || []);
      const hasOverlap = this._checkSectionOverlap(allSections);

      if (hasOverlap) {
        conflict.severity = DriftSeverity.HIGH;
        conflict.overlappingLines = this._findOverlappingLines(allSections);
      } else {
        conflict.severity = DriftSeverity.MEDIUM;
      }
    }

    return conflict;
  }

  /**
   * Check if sections overlap
   * @private
   */
  _checkSectionOverlap(sections) {
    for (let i = 0; i < sections.length; i++) {
      for (let j = i + 1; j < sections.length; j++) {
        const a = sections[i];
        const b = sections[j];
        if (a.startLine <= b.endLine && b.startLine <= a.endLine) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Find overlapping lines
   * @private
   */
  _findOverlappingLines(sections) {
    const lineSet = new Set();
    const overlapping = [];

    for (const section of sections) {
      for (let line = section.startLine; line <= section.endLine; line++) {
        if (lineSet.has(line)) {
          overlapping.push(line);
        }
        lineSet.add(line);
      }
    }

    return [...new Set(overlapping)].sort((a, b) => a - b);
  }

  /**
   * Severity level for comparison
   * @private
   */
  _severityLevel(severity) {
    const levels = {
      [DriftSeverity.NONE]: 0,
      [DriftSeverity.LOW]: 1,
      [DriftSeverity.MEDIUM]: 2,
      [DriftSeverity.HIGH]: 3,
      [DriftSeverity.CRITICAL]: 4,
    };
    return levels[severity] || 0;
  }

  /**
   * Generate recommendations based on drift analysis
   * @private
   */
  _generateRecommendations(analysis) {
    const recommendations = [];

    if (analysis.overallSeverity === DriftSeverity.NONE) {
      return ['No conflicts detected. Safe to proceed with merge.'];
    }

    if (analysis.overallSeverity === DriftSeverity.CRITICAL) {
      recommendations.push(
        'CRITICAL: Multiple tasks modified the same functions/classes. Manual review required.'
      );
      recommendations.push('Consider rebasing one task onto the other before merging.');
    }

    if (analysis.overallSeverity === DriftSeverity.HIGH) {
      recommendations.push(
        'HIGH: Overlapping changes detected. Use Semantic Merge Engine for AI-assisted resolution.'
      );
    }

    if (analysis.overallSeverity === DriftSeverity.MEDIUM) {
      recommendations.push(
        'MEDIUM: Same files modified but different sections. Auto-merge likely to succeed.'
      );
    }

    // File-specific recommendations
    for (const conflict of analysis.fileConflicts) {
      if (
        conflict.severity === DriftSeverity.HIGH ||
        conflict.severity === DriftSeverity.CRITICAL
      ) {
        recommendations.push(
          `Review ${conflict.filePath}: ${conflict.tasks.join(', ')} both modified this file.`
        );
      }
    }

    return recommendations;
  }

  // ─────────────────────────────────────────────────────────────────────────────────
  //                              TIMELINE QUERIES
  // ─────────────────────────────────────────────────────────────────────────────────

  /**
   * Get evolution history for a file
   *
   * @param {string} filePath - File path
   * @param {Object} options - Query options
   * @returns {Object[]} Evolution records
   */
  getFileEvolution(filePath, options = {}) {
    const index = this._loadIndex();
    let records = index.records.filter((r) => r.filePath === filePath);

    if (options.since) {
      const since = new Date(options.since);
      records = records.filter((r) => new Date(r.timestamp) >= since);
    }

    if (options.taskId) {
      records = records.filter((r) => r.taskId === options.taskId);
    }

    if (options.limit) {
      records = records.slice(-options.limit);
    }

    return records;
  }

  /**
   * Get all evolution records for a task
   *
   * @param {string} taskId - Task identifier
   * @returns {Object[]} Evolution records
   */
  getTaskEvolution(taskId) {
    const index = this._loadIndex();
    return index.records.filter((r) => r.taskId === taskId);
  }

  /**
   * Get evolution timeline (all records)
   *
   * @param {Object} options - Query options
   * @returns {Object[]} Evolution records
   */
  getTimeline(options = {}) {
    const index = this._loadIndex();
    let records = [...index.records];

    if (options.since) {
      const since = new Date(options.since);
      records = records.filter((r) => new Date(r.timestamp) >= since);
    }

    if (options.eventTypes) {
      records = records.filter((r) => options.eventTypes.includes(r.eventType));
    }

    // Sort by timestamp
    records.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    if (options.limit) {
      records = records.slice(-options.limit);
    }

    return records;
  }

  /**
   * Get statistics
   *
   * @returns {Object} Statistics
   */
  getStatistics() {
    const index = this._loadIndex();
    const records = index.records;

    const byEventType = {};
    const byTask = {};
    const byFile = {};

    for (const record of records) {
      // By event type
      byEventType[record.eventType] = (byEventType[record.eventType] || 0) + 1;

      // By task
      if (record.taskId) {
        byTask[record.taskId] = (byTask[record.taskId] || 0) + 1;
      }

      // By file
      if (record.filePath) {
        byFile[record.filePath] = (byFile[record.filePath] || 0) + 1;
      }
    }

    // Find most active files
    const topFiles = Object.entries(byFile)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([file, count]) => ({ file, count }));

    return {
      totalRecords: records.length,
      byEventType,
      taskCount: Object.keys(byTask).length,
      fileCount: Object.keys(byFile).length,
      topFiles,
      oldestRecord: records[0]?.timestamp || null,
      newestRecord: records[records.length - 1]?.timestamp || null,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────────
  //                              PERSISTENCE
  // ─────────────────────────────────────────────────────────────────────────────────

  /**
   * Load index from file
   * @private
   */
  _loadIndex() {
    if (this._index) {
      return this._index;
    }

    if (fs.existsSync(this.indexPath)) {
      try {
        const content = fs.readFileSync(this.indexPath, 'utf-8');
        this._index = JSON.parse(content);
      } catch {
        this._index = this._createEmptyIndex();
      }
    } else {
      this._index = this._createEmptyIndex();
    }

    return this._index;
  }

  /**
   * Create empty index
   * @private
   */
  _createEmptyIndex() {
    return {
      version: '1.0.0',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      records: [],
    };
  }

  /**
   * Save record to index
   * @private
   */
  _saveRecord(record) {
    // Ensure directory exists
    if (!fs.existsSync(this.evolutionDir)) {
      fs.mkdirSync(this.evolutionDir, { recursive: true });
    }

    const index = this._loadIndex();
    index.records.push(record);
    index.updatedAt = new Date().toISOString();

    // Cleanup old records if needed
    if (index.records.length > this.config.maxEvolutionRecords) {
      const cutoff = Date.now() - this.config.maxAgeMs;
      index.records = index.records.filter((r) => new Date(r.timestamp).getTime() > cutoff);

      // If still too many, keep only the most recent
      if (index.records.length > this.config.maxEvolutionRecords) {
        index.records = index.records.slice(-this.config.maxEvolutionRecords);
      }
    }

    // Save
    fs.writeFileSync(this.indexPath, JSON.stringify(index, null, 2), 'utf-8');
    this._index = index;
  }

  /**
   * Get last record for a file
   * @private
   */
  _getLastRecordForFile(filePath) {
    const index = this._loadIndex();
    const records = index.records.filter((r) => r.filePath === filePath);
    return records.length > 0 ? records[records.length - 1] : null;
  }

  // ─────────────────────────────────────────────────────────────────────────────────
  //                              FILE STATE HELPERS
  // ─────────────────────────────────────────────────────────────────────────────────

  /**
   * Get current file state
   * @private
   */
  _getFileState(fullPath) {
    const state = {
      exists: false,
      hash: null,
      size: 0,
      lineCount: 0,
    };

    if (!fs.existsSync(fullPath)) {
      return state;
    }

    try {
      const stats = fs.statSync(fullPath);
      state.exists = true;
      state.size = stats.size;

      // Read content for hash and line count
      const content = fs.readFileSync(fullPath, 'utf-8');
      state.hash = this._hashContent(content);
      state.lineCount = content.split('\n').length;
    } catch {
      // Binary file or read error
      state.exists = true;
    }

    return state;
  }

  /**
   * Get git state for a specific file
   * @private
   */
  _getGitStateForFile(filePath) {
    const state = {
      branch: null,
      commit: null,
      isStaged: false,
      isModified: false,
      lastCommitForFile: null,
      commitsAhead: 0,
    };

    try {
      // Current branch
      state.branch = execSync('git rev-parse --abbrev-ref HEAD', {
        cwd: this.rootPath,
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe'],
      }).trim();

      // Current commit
      state.commit = execSync('git rev-parse HEAD', {
        cwd: this.rootPath,
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe'],
      }).trim();

      // Check if staged
      const stagedOutput = execSync('git diff --cached --name-only', {
        cwd: this.rootPath,
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe'],
      });
      state.isStaged = stagedOutput.includes(filePath);

      // Check if modified
      const modifiedOutput = execSync('git diff --name-only', {
        cwd: this.rootPath,
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe'],
      });
      state.isModified = modifiedOutput.includes(filePath);

      // Last commit for this file
      try {
        state.lastCommitForFile = execSync(`git log -1 --format=%H -- "${filePath}"`, {
          cwd: this.rootPath,
          encoding: 'utf-8',
          stdio: ['pipe', 'pipe', 'pipe'],
        }).trim();
      } catch {
        // File might not have any commits
      }

      // Commits ahead of main
      try {
        const aheadOutput = execSync('git rev-list --count main..HEAD', {
          cwd: this.rootPath,
          encoding: 'utf-8',
          stdio: ['pipe', 'pipe', 'pipe'],
        }).trim();
        state.commitsAhead = parseInt(aheadOutput, 10) || 0;
      } catch {
        // Main branch might not exist
      }
    } catch {
      // Git not available or not a repo
    }

    return state;
  }

  /**
   * Capture full git state
   * @private
   */
  _captureGitState() {
    try {
      const branch = execSync('git rev-parse --abbrev-ref HEAD', {
        cwd: this.rootPath,
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe'],
      }).trim();

      const commit = execSync('git rev-parse HEAD', {
        cwd: this.rootPath,
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe'],
      }).trim();

      return { branch, commit };
    } catch {
      return { branch: null, commit: null };
    }
  }

  /**
   * Get modified files from git
   * @private
   */
  _getModifiedFiles() {
    try {
      const output = execSync('git status --porcelain', {
        cwd: this.rootPath,
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      return output
        .split('\n')
        .filter((line) => line.trim())
        .map((line) => ({
          status: line.substring(0, 2).trim(),
          file: line.substring(3),
        }));
    } catch {
      return [];
    }
  }

  /**
   * Determine event type based on file state
   * @private
   */
  _determineEventType(fileState, previousRecord) {
    if (!previousRecord) {
      return fileState.exists ? EvolutionEventType.FILE_CREATED : EvolutionEventType.FILE_DELETED;
    }

    if (!fileState.exists && previousRecord.exists) {
      return EvolutionEventType.FILE_DELETED;
    }

    if (fileState.exists && !previousRecord.exists) {
      return EvolutionEventType.FILE_CREATED;
    }

    if (fileState.hash !== previousRecord.hash) {
      return EvolutionEventType.FILE_MODIFIED;
    }

    return EvolutionEventType.FILE_MODIFIED; // Default
  }

  /**
   * Compute diff summary between two versions
   * @private
   */
  _computeDiffSummary(filePath, oldHash, newHash) {
    if (oldHash === newHash) {
      return null;
    }

    try {
      // Try to get diff stats from git
      const diffOutput = execSync(`git diff --stat HEAD~1 -- "${filePath}"`, {
        cwd: this.rootPath,
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      // Parse diff output
      const match = diffOutput.match(/(\d+) insertion.+?(\d+) deletion/);
      if (match) {
        return {
          linesAdded: parseInt(match[1], 10),
          linesRemoved: parseInt(match[2], 10),
          sections: [],
        };
      }
    } catch {
      // Fall back to simple hash comparison
    }

    return {
      linesAdded: 0,
      linesRemoved: 0,
      hashChanged: true,
    };
  }

  /**
   * Check if file should be ignored
   * @private
   */
  _shouldIgnoreFile(filePath) {
    return this.config.ignoredPatterns.some((pattern) => pattern.test(filePath));
  }

  /**
   * Hash content
   * @private
   */
  _hashContent(content) {
    return crypto.createHash('sha256').update(content).digest('hex').substring(0, 16);
  }

  /**
   * Generate unique ID
   * @private
   */
  _generateId() {
    const timestamp = Date.now().toString(36);
    const random = crypto.randomBytes(4).toString('hex');
    return `evo-${timestamp}-${random}`;
  }

  // ─────────────────────────────────────────────────────────────────────────────────
  //                              FORMATTING
  // ─────────────────────────────────────────────────────────────────────────────────

  /**
   * Format timeline for display
   *
   * @param {Object[]} records - Records to format
   * @returns {string} Formatted output
   */
  formatTimeline(records) {
    const lines = [];

    lines.push('');
    lines.push('📊 File Evolution Timeline');
    lines.push('═'.repeat(70));

    for (const record of records) {
      const time = new Date(record.timestamp).toLocaleString();
      const icon = this._getEventIcon(record.eventType);

      if (record.filePath) {
        lines.push(`${icon} [${time}] ${record.filePath}`);
        lines.push(`   Task: ${record.taskId} | Event: ${record.eventType}`);
        if (record.diff) {
          lines.push(`   +${record.diff.linesAdded} -${record.diff.linesRemoved}`);
        }
      } else {
        lines.push(`${icon} [${time}] ${record.eventType}`);
        lines.push(`   Task: ${record.taskId}`);
      }
      lines.push('');
    }

    lines.push('═'.repeat(70));
    return lines.join('\n');
  }

  /**
   * Get icon for event type
   * @private
   */
  _getEventIcon(eventType) {
    const icons = {
      [EvolutionEventType.FILE_CREATED]: '➕',
      [EvolutionEventType.FILE_MODIFIED]: '📝',
      [EvolutionEventType.FILE_DELETED]: '❌',
      [EvolutionEventType.FILE_RENAMED]: '📛',
      [EvolutionEventType.BRANCH_POINT]: '🔀',
      [EvolutionEventType.MERGE_POINT]: '🔗',
      [EvolutionEventType.TASK_START]: '▶️',
      [EvolutionEventType.TASK_COMPLETE]: '✅',
    };
    return icons[eventType] || '📌';
  }

  /**
   * Format drift analysis
   *
   * @param {Object} analysis - Drift analysis
   * @returns {string} Formatted output
   */
  formatDriftAnalysis(analysis) {
    const lines = [];

    lines.push('');
    lines.push('🔍 Drift Analysis');
    lines.push('═'.repeat(70));
    lines.push(`Tasks: ${analysis.tasks.join(', ')}`);
    lines.push(`Overall Severity: ${analysis.overallSeverity.toUpperCase()}`);
    lines.push('');

    if (analysis.fileConflicts.length > 0) {
      lines.push('File Conflicts:');
      for (const conflict of analysis.fileConflicts) {
        lines.push(`  📄 ${conflict.filePath}`);
        lines.push(`     Severity: ${conflict.severity}`);
        lines.push(`     Tasks: ${conflict.tasks.join(', ')}`);
        if (conflict.overlappingLines.length > 0) {
          lines.push(`     Overlapping lines: ${conflict.overlappingLines.join(', ')}`);
        }
      }
      lines.push('');
    }

    if (analysis.recommendations.length > 0) {
      lines.push('Recommendations:');
      for (const rec of analysis.recommendations) {
        lines.push(`  → ${rec}`);
      }
    }

    lines.push('═'.repeat(70));
    return lines.join('\n');
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
//                              EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════

module.exports = {
  FileEvolutionTracker,
  EvolutionEventType,
  DriftSeverity,
  DEFAULT_CONFIG,
};
