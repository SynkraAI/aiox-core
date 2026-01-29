#!/usr/bin/env node

/**
 * Timeline Manager - AIOS Gap Implementation
 *
 * Unified facade for timeline persistence across AIOS modules.
 * Integrates FileEvolutionTracker, BuildStateManager, and ContextSnapshot
 * to provide complete timeline visibility that survives between sessions.
 *
 * Features:
 * - Unified timeline across all tracking systems
 * - Cross-session persistence
 * - Trend analysis and insights
 * - Export/import capabilities
 *
 * @module timeline-manager
 * @version 1.0.0
 */

const fs = require('fs');
const path = require('path');
const { FileEvolutionTracker, EvolutionEventType } = require('./file-evolution-tracker');
const { ContextSnapshot } = require('./context-snapshot');

// Optional: BuildStateManager (may not exist in all contexts)
let BuildStateManager;
try {
  BuildStateManager = require('../execution/build-state-manager').BuildStateManager;
} catch {
  BuildStateManager = null;
}

// ═══════════════════════════════════════════════════════════════════════════════════
//                              CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════════

const DEFAULT_CONFIG = {
  timelineDir: '.aios/timeline',
  unifiedIndexFile: 'unified-timeline.json',
  maxTimelineEntries: 5000,
  maxAgeMs: 90 * 24 * 60 * 60 * 1000, // 90 days
  autoSync: true,
  syncIntervalMs: 60000, // 1 minute
};

const TimelineEventSource = {
  FILE_EVOLUTION: 'file_evolution',
  BUILD_STATE: 'build_state',
  CONTEXT_SNAPSHOT: 'context_snapshot',
  USER_ACTION: 'user_action',
  SYSTEM: 'system',
};

// ═══════════════════════════════════════════════════════════════════════════════════
//                              TIMELINE MANAGER CLASS
// ═══════════════════════════════════════════════════════════════════════════════════

class TimelineManager {
  /**
   * Create a new TimelineManager
   *
   * @param {Object} options - Configuration options
   * @param {string} [options.rootPath] - Project root path
   * @param {Object} [options.config] - Config overrides
   */
  constructor(options = {}) {
    this.rootPath = options.rootPath || process.cwd();
    this.config = { ...DEFAULT_CONFIG, ...options.config };
    this.timelineDir = path.join(this.rootPath, this.config.timelineDir);
    this.unifiedIndexPath = path.join(this.timelineDir, this.config.unifiedIndexFile);

    // Initialize sub-systems
    this.fileEvolution = new FileEvolutionTracker({ rootPath: this.rootPath });
    this.contextSnapshot = new ContextSnapshot({ rootPath: this.rootPath });

    // BuildStateManager is optional (requires storyId)
    this._buildStateManagers = new Map();

    // Cache
    this._unifiedTimeline = null;
    this._syncTimer = null;

    // Start auto-sync if enabled
    if (this.config.autoSync) {
      this._startAutoSync();
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────────
  //                              UNIFIED TIMELINE
  // ─────────────────────────────────────────────────────────────────────────────────

  /**
   * Get unified timeline from all sources
   *
   * @param {Object} options - Query options
   * @returns {Object[]} Unified timeline entries
   */
  getUnifiedTimeline(options = {}) {
    const entries = [];

    // Get file evolution records
    const fileRecords = this.fileEvolution.getTimeline({
      since: options.since,
      limit: options.limit ? options.limit * 2 : undefined, // Get more, will filter later
    });

    for (const record of fileRecords) {
      entries.push(this._normalizeEntry(record, TimelineEventSource.FILE_EVOLUTION));
    }

    // Get context snapshots
    const snapshots = this.contextSnapshot.listSnapshots({
      since: options.since,
    });

    for (const snapshot of snapshots) {
      entries.push(this._normalizeEntry(snapshot, TimelineEventSource.CONTEXT_SNAPSHOT));
    }

    // Get build state events (from all known managers)
    for (const [storyId, manager] of this._buildStateManagers) {
      try {
        const logs = manager.getAttemptLog({ limit: 100 });
        for (const log of logs) {
          const parsed = this._parseLogEntry(log, storyId);
          if (parsed) {
            entries.push(this._normalizeEntry(parsed, TimelineEventSource.BUILD_STATE));
          }
        }
      } catch {
        // Manager might be invalid
      }
    }

    // Sort by timestamp
    entries.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    // Apply filters
    let filtered = entries;

    if (options.source) {
      filtered = filtered.filter((e) => e.source === options.source);
    }

    if (options.taskId) {
      filtered = filtered.filter((e) => e.taskId === options.taskId);
    }

    if (options.eventTypes) {
      filtered = filtered.filter((e) => options.eventTypes.includes(e.eventType));
    }

    // Apply limit
    if (options.limit) {
      filtered = filtered.slice(-options.limit);
    }

    return filtered;
  }

  /**
   * Normalize entry to unified format
   * @private
   */
  _normalizeEntry(raw, source) {
    const base = {
      id: raw.id || this._generateId(),
      timestamp: raw.timestamp || new Date().toISOString(),
      source,
    };

    switch (source) {
      case TimelineEventSource.FILE_EVOLUTION:
        return {
          ...base,
          eventType: raw.eventType,
          taskId: raw.taskId,
          filePath: raw.filePath,
          summary: raw.filePath ? `${raw.eventType}: ${raw.filePath}` : `${raw.eventType}`,
          details: {
            git: raw.git,
            diff: raw.diff,
            context: raw.context,
          },
        };

      case TimelineEventSource.CONTEXT_SNAPSHOT:
        return {
          ...base,
          eventType: 'snapshot',
          taskId: raw.storyId,
          summary: raw.description || 'Context snapshot',
          details: {
            storyId: raw.storyId,
            agent: raw.agent,
            modifiedFiles: raw.modifiedFiles,
          },
        };

      case TimelineEventSource.BUILD_STATE:
        return {
          ...base,
          eventType: raw.action || 'build_event',
          taskId: raw.storyId || raw.taskId,
          summary: `${raw.action}: ${raw.subtaskId || raw.storyId}`,
          details: raw,
        };

      default:
        return {
          ...base,
          eventType: raw.eventType || 'unknown',
          taskId: raw.taskId,
          summary: raw.summary || 'Unknown event',
          details: raw,
        };
    }
  }

  /**
   * Parse build log entry
   * @private
   */
  _parseLogEntry(logLine, storyId) {
    // Format: [timestamp] [storyId] [subtaskId] action: {json}
    const match = logLine.match(/\[(.*?)\] \[(.*?)\] \[(.*?)\] (\w+): (.*)/);
    if (!match) return null;

    try {
      return {
        timestamp: match[1],
        storyId: match[2],
        subtaskId: match[3],
        action: match[4],
        details: JSON.parse(match[5]),
      };
    } catch {
      return {
        timestamp: match[1],
        storyId: match[2],
        subtaskId: match[3],
        action: match[4],
        details: {},
      };
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────────
  //                              RECORDING EVENTS
  // ─────────────────────────────────────────────────────────────────────────────────

  /**
   * Record a file change
   *
   * @param {string} filePath - File path
   * @param {string} taskId - Task identifier
   * @param {Object} options - Additional options
   * @returns {Object} Evolution record
   */
  recordFileChange(filePath, taskId, options = {}) {
    return this.fileEvolution.trackFileEvolution(filePath, taskId, options);
  }

  /**
   * Record task start
   *
   * @param {string} taskId - Task identifier
   * @param {Object} options - Task details
   * @returns {Object} Task record
   */
  recordTaskStart(taskId, options = {}) {
    // Record in file evolution
    this.fileEvolution.trackTaskEvolution(taskId, {
      ...options,
      eventType: EvolutionEventType.TASK_START,
    });

    // Create context snapshot
    const snapshot = this.contextSnapshot.capture({
      storyId: taskId,
      description: `Task started: ${taskId}`,
      ...options,
    });

    return snapshot;
  }

  /**
   * Record task completion
   *
   * @param {string} taskId - Task identifier
   * @param {Object} options - Completion details
   * @returns {Object} Completion record
   */
  recordTaskComplete(taskId, options = {}) {
    // Track all modified files
    const records = this.fileEvolution.trackTaskEvolution(taskId, {
      ...options,
      eventType: EvolutionEventType.TASK_COMPLETE,
    });

    // Create completion snapshot
    const snapshot = this.contextSnapshot.capture({
      storyId: taskId,
      description: `Task completed: ${taskId}`,
      state: {
        filesModified: records.length,
        ...options.state,
      },
      ...options,
    });

    return {
      snapshot,
      filesTracked: records.length,
    };
  }

  /**
   * Record a branch point
   *
   * @param {string} taskId - Task identifier
   * @param {string} branchName - Branch name
   * @param {string} baseBranch - Base branch
   * @returns {Object} Branch record
   */
  recordBranchPoint(taskId, branchName, baseBranch = 'main') {
    return this.fileEvolution.recordBranchPoint(taskId, branchName, baseBranch);
  }

  // ─────────────────────────────────────────────────────────────────────────────────
  //                              BUILD STATE INTEGRATION
  // ─────────────────────────────────────────────────────────────────────────────────

  /**
   * Register a build state manager for a story
   *
   * @param {string} storyId - Story identifier
   * @param {Object} options - Manager options
   * @returns {Object} BuildStateManager instance
   */
  registerBuild(storyId, options = {}) {
    if (!BuildStateManager) {
      throw new Error('BuildStateManager not available');
    }

    const manager = new BuildStateManager(storyId, {
      rootPath: this.rootPath,
      ...options,
    });

    this._buildStateManagers.set(storyId, manager);
    return manager;
  }

  /**
   * Get build state manager for a story
   *
   * @param {string} storyId - Story identifier
   * @returns {Object|null} BuildStateManager or null
   */
  getBuildManager(storyId) {
    return this._buildStateManagers.get(storyId) || null;
  }

  // ─────────────────────────────────────────────────────────────────────────────────
  //                              ANALYSIS & INSIGHTS
  // ─────────────────────────────────────────────────────────────────────────────────

  /**
   * Analyze trends in the timeline
   *
   * @param {Object} options - Analysis options
   * @returns {Object} Trend analysis
   */
  analyzeTrends(options = {}) {
    const timeline = this.getUnifiedTimeline({
      since: options.since,
      limit: options.limit || 1000,
    });

    const analysis = {
      period: {
        start: timeline[0]?.timestamp || null,
        end: timeline[timeline.length - 1]?.timestamp || null,
        entryCount: timeline.length,
      },
      bySource: {},
      byEventType: {},
      byTask: {},
      byFile: {},
      activityHeatmap: this._generateActivityHeatmap(timeline),
      insights: [],
    };

    // Aggregate by source
    for (const entry of timeline) {
      analysis.bySource[entry.source] = (analysis.bySource[entry.source] || 0) + 1;

      analysis.byEventType[entry.eventType] = (analysis.byEventType[entry.eventType] || 0) + 1;

      if (entry.taskId) {
        analysis.byTask[entry.taskId] = (analysis.byTask[entry.taskId] || 0) + 1;
      }

      if (entry.filePath) {
        analysis.byFile[entry.filePath] = (analysis.byFile[entry.filePath] || 0) + 1;
      }
    }

    // Generate insights
    analysis.insights = this._generateInsights(analysis, timeline);

    return analysis;
  }

  /**
   * Generate activity heatmap (by hour of day and day of week)
   * @private
   */
  _generateActivityHeatmap(timeline) {
    const heatmap = {
      byHour: Array(24).fill(0),
      byDayOfWeek: Array(7).fill(0),
    };

    for (const entry of timeline) {
      const date = new Date(entry.timestamp);
      heatmap.byHour[date.getHours()]++;
      heatmap.byDayOfWeek[date.getDay()]++;
    }

    return heatmap;
  }

  /**
   * Generate insights from analysis
   * @private
   */
  _generateInsights(analysis, timeline) {
    const insights = [];

    // Most active files
    const topFiles = Object.entries(analysis.byFile)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    if (topFiles.length > 0) {
      insights.push({
        type: 'hot_files',
        title: 'Most Modified Files',
        description: `${topFiles[0][0]} was modified ${topFiles[0][1]} times`,
        data: topFiles,
      });
    }

    // Most active tasks
    const topTasks = Object.entries(analysis.byTask)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    if (topTasks.length > 0) {
      insights.push({
        type: 'active_tasks',
        title: 'Most Active Tasks',
        description: `${topTasks[0][0]} generated ${topTasks[0][1]} events`,
        data: topTasks,
      });
    }

    // Activity patterns
    const peakHour = analysis.activityHeatmap.byHour.indexOf(
      Math.max(...analysis.activityHeatmap.byHour)
    );
    insights.push({
      type: 'activity_pattern',
      title: 'Peak Activity Hour',
      description: `Most activity occurs at ${peakHour}:00`,
      data: { peakHour, distribution: analysis.activityHeatmap.byHour },
    });

    // Failure rate (if we have build events)
    const failures = timeline.filter((e) => e.eventType === 'failure').length;
    const totalBuildEvents = timeline.filter(
      (e) => e.source === TimelineEventSource.BUILD_STATE
    ).length;
    if (totalBuildEvents > 0) {
      const failureRate = ((failures / totalBuildEvents) * 100).toFixed(1);
      insights.push({
        type: 'failure_rate',
        title: 'Build Failure Rate',
        description: `${failureRate}% of build events were failures`,
        data: { failures, total: totalBuildEvents, rate: failureRate },
      });
    }

    return insights;
  }

  /**
   * Detect drift between tasks
   *
   * @param {string[]} taskIds - Task IDs to compare
   * @returns {Object} Drift analysis
   */
  detectDrift(taskIds) {
    return this.fileEvolution.detectDrift(taskIds);
  }

  // ─────────────────────────────────────────────────────────────────────────────────
  //                              PERSISTENCE
  // ─────────────────────────────────────────────────────────────────────────────────

  /**
   * Sync all timelines to unified index
   */
  syncTimelines() {
    const unified = this.getUnifiedTimeline();

    // Ensure directory exists
    if (!fs.existsSync(this.timelineDir)) {
      fs.mkdirSync(this.timelineDir, { recursive: true });
    }

    const index = {
      version: '1.0.0',
      syncedAt: new Date().toISOString(),
      entryCount: unified.length,
      sources: [...new Set(unified.map((e) => e.source))],
      tasks: [...new Set(unified.map((e) => e.taskId).filter(Boolean))],
      entries: unified,
    };

    fs.writeFileSync(this.unifiedIndexPath, JSON.stringify(index, null, 2), 'utf-8');

    return index;
  }

  /**
   * Load unified timeline from persisted index
   *
   * @returns {Object|null} Persisted timeline or null
   */
  loadPersistedTimeline() {
    if (!fs.existsSync(this.unifiedIndexPath)) {
      return null;
    }

    try {
      const content = fs.readFileSync(this.unifiedIndexPath, 'utf-8');
      return JSON.parse(content);
    } catch {
      return null;
    }
  }

  /**
   * Export timeline to file
   *
   * @param {string} outputPath - Output file path
   * @param {Object} options - Export options
   * @returns {Object} Export result
   */
  exportTimeline(outputPath, options = {}) {
    const timeline = this.getUnifiedTimeline(options);
    const format = options.format || 'json';

    let content;
    if (format === 'json') {
      content = JSON.stringify(
        {
          exportedAt: new Date().toISOString(),
          entryCount: timeline.length,
          entries: timeline,
        },
        null,
        2
      );
    } else if (format === 'csv') {
      const headers = ['timestamp', 'source', 'eventType', 'taskId', 'filePath', 'summary'];
      const rows = timeline.map((e) => headers.map((h) => JSON.stringify(e[h] || '')).join(','));
      content = [headers.join(','), ...rows].join('\n');
    } else {
      throw new Error(`Unsupported format: ${format}`);
    }

    fs.writeFileSync(outputPath, content, 'utf-8');

    return {
      path: outputPath,
      format,
      entryCount: timeline.length,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────────
  //                              AUTO-SYNC
  // ─────────────────────────────────────────────────────────────────────────────────

  /**
   * Start auto-sync
   * @private
   */
  _startAutoSync() {
    if (this._syncTimer) return;

    this._syncTimer = setInterval(() => {
      try {
        this.syncTimelines();
      } catch {
        // Ignore sync errors
      }
    }, this.config.syncIntervalMs);
  }

  /**
   * Stop auto-sync
   */
  stopAutoSync() {
    if (this._syncTimer) {
      clearInterval(this._syncTimer);
      this._syncTimer = null;
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────────
  //                              HELPERS
  // ─────────────────────────────────────────────────────────────────────────────────

  /**
   * Generate unique ID
   * @private
   */
  _generateId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `tl-${timestamp}-${random}`;
  }

  /**
   * Get statistics
   *
   * @returns {Object} Combined statistics
   */
  getStatistics() {
    const fileStats = this.fileEvolution.getStatistics();
    const snapshotStats = this.contextSnapshot.getStatistics();

    return {
      fileEvolution: fileStats,
      contextSnapshots: snapshotStats,
      buildManagers: this._buildStateManagers.size,
      unifiedTimeline: {
        path: this.unifiedIndexPath,
        exists: fs.existsSync(this.unifiedIndexPath),
      },
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────────
  //                              FORMATTING
  // ─────────────────────────────────────────────────────────────────────────────────

  /**
   * Format timeline for display
   *
   * @param {Object[]} entries - Timeline entries
   * @returns {string} Formatted output
   */
  formatTimeline(entries) {
    const lines = [];

    lines.push('');
    lines.push('📅 Unified Timeline');
    lines.push('═'.repeat(80));

    const sourceIcons = {
      [TimelineEventSource.FILE_EVOLUTION]: '📄',
      [TimelineEventSource.BUILD_STATE]: '🔨',
      [TimelineEventSource.CONTEXT_SNAPSHOT]: '📸',
      [TimelineEventSource.USER_ACTION]: '👤',
      [TimelineEventSource.SYSTEM]: '⚙️',
    };

    for (const entry of entries) {
      const time = new Date(entry.timestamp).toLocaleString();
      const icon = sourceIcons[entry.source] || '📌';

      lines.push(`${icon} [${time}] ${entry.summary}`);
      if (entry.taskId) {
        lines.push(`   Task: ${entry.taskId} | Type: ${entry.eventType}`);
      }
      lines.push('');
    }

    lines.push('═'.repeat(80));
    return lines.join('\n');
  }

  /**
   * Format analysis for display
   *
   * @param {Object} analysis - Trend analysis
   * @returns {string} Formatted output
   */
  formatAnalysis(analysis) {
    const lines = [];

    lines.push('');
    lines.push('📊 Timeline Analysis');
    lines.push('═'.repeat(80));

    lines.push(`Period: ${analysis.period.start || 'N/A'} - ${analysis.period.end || 'N/A'}`);
    lines.push(`Total entries: ${analysis.period.entryCount}`);
    lines.push('');

    lines.push('By Source:');
    for (const [source, count] of Object.entries(analysis.bySource)) {
      lines.push(`  ${source}: ${count}`);
    }
    lines.push('');

    if (analysis.insights.length > 0) {
      lines.push('Insights:');
      for (const insight of analysis.insights) {
        lines.push(`  💡 ${insight.title}`);
        lines.push(`     ${insight.description}`);
      }
    }

    lines.push('═'.repeat(80));
    return lines.join('\n');
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
//                              EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════

module.exports = {
  TimelineManager,
  TimelineEventSource,
  DEFAULT_CONFIG,
};
