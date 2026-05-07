/**
 * Result Aggregator
 * Story 10.5 - Parallel Agent Execution
 *
 * Aggregates results from parallel task executions,
 * detects conflicts, and generates consolidated reports.
 */

const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');

class ResultAggregator extends EventEmitter {
  constructor(config = {}) {
    super();

    // Root path for reports
    this.rootPath = config.rootPath ?? process.cwd();
    this.reportDir = config.reportDir ?? path.join(this.rootPath, 'plan');

    // Conflict detection settings
    this.detectConflicts = config.detectConflicts !== false;

    // Aggregation history
    this.history = [];
    this.maxHistory = config.maxHistory ?? 50;
  }

  /**
   * Aggregate results from a wave execution
   * @param {Object} waveResults - Results from WaveExecutor
   * @returns {Promise<Object>} - Aggregated results
   */
  async aggregate(waveResults) {
    const startTime = Date.now();

    const aggregation = {
      id: `agg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      waveIndex: waveResults.waveIndex ?? waveResults.wave,
      startedAt: waveResults.startedAt ?? new Date().toISOString(),
      completedAt: new Date().toISOString(),
      tasks: [],
      conflicts: [],
      metrics: {},
      warnings: [],
    };

    // Collect task results
    const results = waveResults.results || [];
    for (const result of results) {
      aggregation.tasks.push({
        taskId: result.taskId,
        agentId: result.agentId ?? 'unknown',
        success: result.success,
        filesModified: Array.isArray(result.filesModified)
          ? result.filesModified
          : this.extractFilesFromOutput(result.output ?? result.result?.output),
        duration: result.duration ?? 0,
        output: this.summarizeOutput(result.output ?? result.result?.output),
        error: result.error,
      });
    }

    // Detect conflicts
    if (this.detectConflicts) {
      aggregation.conflicts = this.detectFileConflicts(aggregation.tasks);

      if (aggregation.conflicts.length > 0) {
        this.emit('conflicts_detected', {
          waveIndex: aggregation.waveIndex,
          conflicts: aggregation.conflicts,
        });
      }
    }

    // Add warnings for non-critical issues
    aggregation.warnings = this.collectWarnings(aggregation.tasks);

    // Calculate metrics
    aggregation.metrics = this.calculateMetrics(aggregation, startTime);

    // Store in history
    this.history.push({
      id: aggregation.id,
      waveIndex: aggregation.waveIndex,
      success: aggregation.tasks.every((t) => t.success),
      conflicts: aggregation.conflicts.length,
      timestamp: aggregation.completedAt,
    });

    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }

    this.emit('aggregation_complete', aggregation);

    return aggregation;
  }

  /**
   * Aggregate results from multiple waves
   * @param {Array<Object>} allWaveResults - Results from all waves
   * @returns {Promise<Object>} - Consolidated aggregation
   */
  async aggregateAll(allWaveResults) {
    const consolidated = {
      id: `consolidated-${Date.now()}`,
      completedAt: new Date().toISOString(),
      waves: [],
      allTasks: [],
      allConflicts: [],
      overallMetrics: {},
    };

    for (const waveResult of allWaveResults) {
      const aggregation = await this.aggregate(waveResult);
      consolidated.waves.push(aggregation);
      consolidated.allTasks.push(...aggregation.tasks);
      consolidated.allConflicts.push(
        ...aggregation.conflicts.map((c) => ({
          ...c,
          waveIndex: aggregation.waveIndex,
        })),
      );
    }

    // Calculate overall metrics
    consolidated.overallMetrics = this.calculateOverallMetrics(consolidated);

    return consolidated;
  }

  /**
   * Detect file conflicts between tasks
   * @param {Array<Object>} tasks - Task results
   * @returns {Array<Object>} - Detected conflicts
   */
  detectFileConflicts(tasks) {
    const fileModifications = new Map();
    const conflicts = [];

    for (const task of tasks) {
      const files = task.filesModified || [];

      for (const file of files) {
        if (fileModifications.has(file)) {
          const existingTask = fileModifications.get(file);

          conflicts.push({
            file,
            tasks: [existingTask.taskId, task.taskId],
            type: 'concurrent_modification',
            severity: this.assessConflictSeverity(file),
            resolution: this.suggestResolution(file, existingTask.taskId, task.taskId),
          });
        } else {
          fileModifications.set(file, { taskId: task.taskId });
        }
      }
    }

    return conflicts;
  }

  /**
   * Assess conflict severity
   * @param {string} file - File path
   * @returns {string} - Severity level
   */
  assessConflictSeverity(file) {
    // Critical files
    const criticalPatterns = [
      /package\.json$/,
      /tsconfig\.json$/,
      /\.env/,
      /index\.(js|ts)$/,
      /main\.(js|ts)$/,
    ];

    if (criticalPatterns.some((p) => p.test(file))) {
      return 'critical';
    }

    // High severity files
    const highPatterns = [/config/, /schema/, /migration/];

    if (highPatterns.some((p) => p.test(file))) {
      return 'high';
    }

    return 'medium';
  }

  /**
   * Suggest resolution for a conflict
   * @param {string} file - Conflicting file
   * @param {string} task1 - First task ID
   * @param {string} task2 - Second task ID
   * @returns {string} - Resolution suggestion
   */
  suggestResolution(file, task1, task2) {
    if (file.endsWith('.json')) {
      return `Merge JSON changes from ${task1} and ${task2} manually`;
    }

    if (file.includes('test') || file.includes('spec')) {
      return 'Test files can usually be merged automatically';
    }

    return 'Review changes from both tasks and merge carefully';
  }

  /**
   * Extract files from task output
   * @param {string} output - Task output
   * @returns {Array<string>} - Extracted file paths
   */
  extractFilesFromOutput(output) {
    if (!output) return [];

    const files = [];
    const patterns = [
      /(?:created|modified|updated|wrote|edited|changed).*?[`'"]([^`'"]+\.[a-z]+)[`'"]/gi,
      /(?:file|path):\s*[`'"]?([^\s`'"]+\.[a-z]+)[`'"]?/gi,
      /Writing to:\s*([^\s]+)/gi,
      /→\s*([^\s]+\.[a-z]+)/gi,
    ];

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(output)) !== null) {
        const file = match[1];
        if (!files.includes(file) && (file.includes('/') || file.includes('.'))) {
          files.push(file);
        }
      }
    }

    return files;
  }

  /**
   * Summarize task output
   * @param {string} output - Full output
   * @returns {string} - Summarized output
   */
  summarizeOutput(output) {
    if (!output) return '';

    // Take first 500 chars if too long
    if (output.length > 500) {
      return output.substring(0, 500) + '... [truncated]';
    }

    return output;
  }

  /**
   * Collect warnings from task results
   * @param {Array<Object>} tasks - Task results
   * @returns {Array<Object>} - Warnings
   */
  collectWarnings(tasks) {
    const warnings = [];

    for (const task of tasks) {
      // Check for partial success
      if (task.success && task.output && task.output.toLowerCase().includes('warning')) {
        warnings.push({
          taskId: task.taskId,
          type: 'output_warning',
          message: 'Task completed with warnings in output',
        });
      }

      // Check for long duration
      if (task.duration > 5 * 60 * 1000) {
        // > 5 minutes
        warnings.push({
          taskId: task.taskId,
          type: 'long_duration',
          message: `Task took ${Math.round(task.duration / 1000)}s`,
        });
      }

      // Check for empty modifications
      if (task.success && (!task.filesModified || task.filesModified.length === 0)) {
        warnings.push({
          taskId: task.taskId,
          type: 'no_files_modified',
          message: 'Task succeeded but no files were modified',
        });
      }
    }

    return warnings;
  }

  /**
   * Calculate metrics for an aggregation
   * @param {Object} aggregation - Aggregation result
   * @param {number} startTime - Start timestamp
   * @returns {Object} - Metrics
   */
  calculateMetrics(aggregation, startTime) {
    const tasks = aggregation.tasks;
    const successful = tasks.filter((t) => t.success).length;
    const failed = tasks.filter((t) => !t.success).length;
    const totalDuration = tasks.reduce((sum, t) => sum + (t.duration || 0), 0);

    // Calculate wall time
    const wallTime = Date.now() - startTime;

    // Files metrics
    const allFiles = tasks.flatMap((t) => t.filesModified || []);
    const uniqueFiles = [...new Set(allFiles)];

    return {
      totalTasks: tasks.length,
      successful,
      failed,
      successRate: tasks.length > 0 ? Math.round((successful / tasks.length) * 100) : 100,
      totalDuration,
      wallTime,
      parallelEfficiency: wallTime > 0 ? (totalDuration / wallTime).toFixed(2) : 1,
      conflictCount: aggregation.conflicts.length,
      warningCount: aggregation.warnings.length,
      filesModified: uniqueFiles.length,
      duplicateFileEdits: allFiles.length - uniqueFiles.length,
    };
  }

  /**
   * Calculate overall metrics from multiple waves
   * @param {Object} consolidated - Consolidated aggregation
   * @returns {Object} - Overall metrics
   */
  calculateOverallMetrics(consolidated) {
    const allTasks = consolidated.allTasks;
    const successful = allTasks.filter((t) => t.success).length;
    const totalDuration = allTasks.reduce((sum, t) => sum + (t.duration || 0), 0);

    // Calculate wave metrics
    const waveSuccessRates = consolidated.waves.map((w) => w.metrics.successRate);
    const avgWaveSuccessRate =
      waveSuccessRates.length > 0
        ? Math.round(waveSuccessRates.reduce((a, b) => a + b, 0) / waveSuccessRates.length)
        : 100;

    return {
      totalWaves: consolidated.waves.length,
      totalTasks: allTasks.length,
      successful,
      failed: allTasks.length - successful,
      overallSuccessRate:
        allTasks.length > 0 ? Math.round((successful / allTasks.length) * 100) : 100,
      avgWaveSuccessRate,
      totalDuration,
      totalConflicts: consolidated.allConflicts.length,
      criticalConflicts: consolidated.allConflicts.filter((c) => c.severity === 'critical').length,
    };
  }

  /**
   * Generate report file
   * @param {Object} aggregation - Aggregation result
   * @param {string} filename - Report filename
   * @returns {Promise<string>} - Report file path
   */
  async generateReport(aggregation, filename = null) {
    const reportName = filename || `wave-results-${aggregation.waveIndex ?? 'all'}.json`;
    const reportPath = path.join(this.reportDir, reportName);

    // Ensure directory exists
    if (!fs.existsSync(this.reportDir)) {
      fs.mkdirSync(this.reportDir, { recursive: true });
    }

    // Write JSON report
    fs.writeFileSync(reportPath, JSON.stringify(aggregation, null, 2));

    // Also generate markdown summary
    const mdPath = reportPath.replace('.json', '.md');
    fs.writeFileSync(mdPath, this.formatMarkdown(aggregation));

    return reportPath;
  }

  /**
   * Format aggregation as markdown
   * @param {Object} aggregation - Aggregation result
   * @returns {string} - Markdown content
   */
  formatMarkdown(aggregation) {
    const metrics = aggregation.metrics || aggregation.overallMetrics;

    let md = '# Wave Results Report\n\n';
    md += `> **Generated:** ${aggregation.completedAt}\n`;
    md += `> **Success Rate:** ${metrics.successRate ?? metrics.overallSuccessRate}%\n\n`;

    md += '## Summary\n\n';
    md += '| Metric | Value |\n';
    md += '|--------|-------|\n';
    md += `| Total Tasks | ${metrics.totalTasks} |\n`;
    md += `| Successful | ${metrics.successful} |\n`;
    md += `| Failed | ${metrics.failed} |\n`;
    md += `| Duration | ${Math.round(metrics.totalDuration / 1000)}s |\n`;
    md += `| Conflicts | ${metrics.conflictCount ?? metrics.totalConflicts ?? 0} |\n`;
    md += `| Files Modified | ${metrics.filesModified ?? 'N/A'} |\n\n`;

    // Tasks section
    if (aggregation.tasks && aggregation.tasks.length > 0) {
      md += '## Tasks\n\n';
      md += '| Task | Agent | Status | Duration |\n';
      md += '|------|-------|--------|----------|\n';

      for (const task of aggregation.tasks) {
        const status = task.success ? '✅' : '❌';
        const duration = task.duration != null ? `${Math.round(task.duration / 1000)}s` : '-';
        md += `| ${task.taskId} | ${task.agentId} | ${status} | ${duration} |\n`;
      }
      md += '\n';
    }

    // Conflicts section
    const conflicts = aggregation.conflicts || aggregation.allConflicts;
    if (conflicts && conflicts.length > 0) {
      md += '## Conflicts\n\n';
      for (const conflict of conflicts) {
        md += `### ${conflict.file}\n`;
        md += `- **Type:** ${conflict.type}\n`;
        md += `- **Severity:** ${conflict.severity}\n`;
        md += `- **Tasks:** ${conflict.tasks.join(', ')}\n`;
        md += `- **Resolution:** ${conflict.resolution}\n\n`;
      }
    }

    // Warnings section
    if (aggregation.warnings && aggregation.warnings.length > 0) {
      md += '## Warnings\n\n';
      for (const warning of aggregation.warnings) {
        md += `- **${warning.taskId}** [${warning.type}]: ${warning.message}\n`;
      }
      md += '\n';
    }

    md += '---\n*Generated by AIOX Result Aggregator*\n';

    return md;
  }

  /**
   * Get aggregation history
   * @param {number} limit - Max entries
   * @returns {Array} - History entries
   */
  getHistory(limit = 20) {
    return this.history.slice(-limit);
  }

  /**
   * Format status for CLI
   * @returns {string} - Formatted status
   */
  formatStatus() {
    const history = this.getHistory(5);

    let output = '📊 Result Aggregator Status\n';
    output += '━'.repeat(40) + '\n\n';

    output += `**Total Aggregations:** ${this.history.length}\n\n`;

    if (history.length > 0) {
      output += '**Recent Aggregations:**\n';
      for (const entry of history) {
        const icon = entry.success ? '✅' : '❌';
        const conflicts = entry.conflicts > 0 ? ` (${entry.conflicts} conflicts)` : '';
        output += `  ${icon} Wave ${entry.waveIndex}${conflicts}\n`;
      }
    }

    return output;
  }
}

module.exports = ResultAggregator;
module.exports.ResultAggregator = ResultAggregator;
