#!/usr/bin/env node

/**
 * AIOX QA Loop Orchestrator
 *
 * Story: 6.5 - QA Loop Orchestrator
 * Epic: Epic 6 - QA Evolution
 *
 * Orchestrates the automated QA review → fix → re-review cycle.
 * Implements the qa-loop.yaml workflow with full state management.
 *
 * Features:
 * - AC1: Loop automático: review → fix → re-review
 * - AC2: Máximo 5 iterações (configurável via autoClaude.qaLoop.maxIterations)
 * - AC3: Após 5 iterações: escalate para humano com full context
 * - AC4: Track iteração atual em qa/loop-status.json
 * - AC5: Pode ser interrompido manualmente via *stop-qa-loop
 * - AC6: Summary ao final com histórico de iterações
 * - AC7: Integra com status.json para dashboard
 *
 * @author @architect (Aria)
 * @version 1.0.0
 */

const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');

// ═══════════════════════════════════════════════════════════════════════════════════
//                              CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════════

const CONFIG = {
  // AC2: Default max iterations
  defaultMaxIterations: 5,
  configPath: 'autoClaude.qaLoop.maxIterations',

  // AC4: Status file location
  statusFileName: 'loop-status.json',
  statusDir: 'qa',

  // AC7: Dashboard integration paths
  dashboardStatusPath: '.aiox/dashboard/status.json',
  legacyStatusPath: '.aiox/status.json',

  // Workflow definition
  workflowPath: '.aiox-core/development/workflows/qa-loop.yaml',

  // Timeouts (milliseconds)
  reviewTimeout: 1800000, // 30 minutes
  fixTimeout: 3600000, // 60 minutes

  // Retry configuration
  maxRetries: 2,
  retryDelay: 5000,

  // Session persistence (AC4 enhancement)
  abandonedThreshold: 3600000, // 1 hour - consider loop abandoned if no update
  persistenceIndexPath: '.aiox/qa-loops-index.json', // Track all active loops
};

// ═══════════════════════════════════════════════════════════════════════════════════
//                              STATUS ENUM
// ═══════════════════════════════════════════════════════════════════════════════════

const LoopStatus = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  STOPPED: 'stopped',
  ESCALATED: 'escalated',
};

const Verdict = {
  APPROVE: 'APPROVE',
  REJECT: 'REJECT',
  BLOCKED: 'BLOCKED',
};

const StatusEmoji = {
  [LoopStatus.PENDING]: '⏳',
  [LoopStatus.IN_PROGRESS]: '🔄',
  [LoopStatus.COMPLETED]: '✅',
  [LoopStatus.STOPPED]: '⏹️',
  [LoopStatus.ESCALATED]: '🚨',
};

const VerdictEmoji = {
  [Verdict.APPROVE]: '✅',
  [Verdict.REJECT]: '❌',
  [Verdict.BLOCKED]: '🚫',
};

// ═══════════════════════════════════════════════════════════════════════════════════
//                              QA LOOP ORCHESTRATOR CLASS
// ═══════════════════════════════════════════════════════════════════════════════════

class QALoopOrchestrator {
  /**
   * Create a new QALoopOrchestrator instance
   *
   * @param {string} storyId - Story ID (e.g., 'STORY-42')
   * @param {Object} options - Configuration options
   * @param {number} [options.maxIterations] - Maximum loop iterations (AC2)
   * @param {string} [options.rootPath] - Project root path (defaults to cwd)
   * @param {boolean} [options.verbose] - Enable verbose logging
   */
  constructor(storyId, options = {}) {
    this.storyId = storyId;
    this.rootPath = options.rootPath || process.cwd();
    this.maxIterations = options.maxIterations || this._loadMaxIterations();
    this.verbose = options.verbose !== false;

    this.status = null;
    this._initPaths();
  }

  /**
   * Initialize file paths
   * @private
   */
  _initPaths() {
    // AC4: Status file path
    this.statusPath = path.join(
      this.rootPath,
      CONFIG.statusDir,
      this.storyId,
      CONFIG.statusFileName
    );

    // Dashboard paths (AC7)
    this.dashboardPath = path.join(this.rootPath, CONFIG.dashboardStatusPath);
    this.legacyStatusPath = path.join(this.rootPath, CONFIG.legacyStatusPath);

    // Workflow path
    this.workflowPath = path.join(this.rootPath, CONFIG.workflowPath);
  }

  /**
   * Load max iterations from config (AC2)
   * @private
   * @returns {number} Max iterations
   */
  _loadMaxIterations() {
    // Try to load from project config
    const configPaths = [
      path.join(this.rootPath, '.aiox/config.yaml'),
      path.join(this.rootPath, '.aiox/config.yml'),
      path.join(this.rootPath, 'aiox.config.js'),
    ];

    for (const configPath of configPaths) {
      if (fs.existsSync(configPath)) {
        try {
          let config;
          if (configPath.endsWith('.js')) {
            config = require(configPath);
          } else {
            config = yaml.load(fs.readFileSync(configPath, 'utf-8'));
          }

          // Navigate to autoClaude.qaLoop.maxIterations
          const value = config?.autoClaude?.qaLoop?.maxIterations;
          if (typeof value === 'number' && value > 0) {
            return value;
          }
        } catch {
          // Continue to next config
        }
      }
    }

    return CONFIG.defaultMaxIterations;
  }

  // ═══════════════════════════════════════════════════════════════════════════════════
  //                              STATUS MANAGEMENT (AC4)
  // ═══════════════════════════════════════════════════════════════════════════════════

  /**
   * Load loop status from file
   * @returns {Object|null} Status object or null if not found
   */
  loadStatus() {
    if (fs.existsSync(this.statusPath)) {
      try {
        this.status = JSON.parse(fs.readFileSync(this.statusPath, 'utf-8'));
        return this.status;
      } catch (error) {
        console.error(`Error loading status: ${error.message}`);
        return null;
      }
    }
    return null;
  }

  /**
   * Check if loop was abandoned (no update for CONFIG.abandonedThreshold)
   * @returns {boolean} True if abandoned
   */
  isAbandoned() {
    if (!this.status) {
      this.loadStatus();
    }

    if (!this.status || this.status.status !== LoopStatus.IN_PROGRESS) {
      return false;
    }

    const lastUpdate = new Date(this.status.updatedAt).getTime();
    const now = Date.now();
    return now - lastUpdate > CONFIG.abandonedThreshold;
  }

  /**
   * Recover from abandoned state
   * @returns {Object} Updated status
   */
  recoverFromAbandoned() {
    if (!this.status) {
      throw new Error('No status to recover');
    }

    this._log(`\n⚠️  Detected abandoned QA loop for ${this.storyId}`);
    this._log(`   Last update: ${this.status.updatedAt}`);
    this._log(`   Recovering...`);

    // Mark as interrupted and save
    this.status.wasAbandoned = true;
    this.status.recoveredAt = new Date().toISOString();

    // Add recovery note to history
    if (this.status.history.length > 0) {
      const lastEntry = this.status.history[this.status.history.length - 1];
      if (!lastEntry.fixedAt) {
        lastEntry.interruptedAt = this.status.recoveredAt;
        lastEntry.interruptReason = 'Session ended unexpectedly';
      }
    }

    this.saveStatus();
    this._updateLoopsIndex();

    return this.status;
  }

  /**
   * Update the global loops index for cross-session tracking
   * @private
   */
  _updateLoopsIndex() {
    const indexPath = path.join(this.rootPath, CONFIG.persistenceIndexPath);
    let index = { version: '1.0', loops: {}, updatedAt: null };

    // Load existing index
    if (fs.existsSync(indexPath)) {
      try {
        index = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
      } catch {
        // Reset if corrupted
        index = { version: '1.0', loops: {}, updatedAt: null };
      }
    }

    // Update this loop's entry
    index.loops[this.storyId] = {
      status: this.status.status,
      currentIteration: this.status.currentIteration,
      maxIterations: this.status.maxIterations,
      statusPath: this.statusPath,
      updatedAt: this.status.updatedAt,
      wasAbandoned: this.status.wasAbandoned || false,
    };

    // Clean up completed/old loops (keep last 50)
    const loopEntries = Object.entries(index.loops);
    if (loopEntries.length > 50) {
      const sorted = loopEntries.sort(
        (a, b) => new Date(b[1].updatedAt) - new Date(a[1].updatedAt)
      );
      index.loops = Object.fromEntries(sorted.slice(0, 50));
    }

    index.updatedAt = new Date().toISOString();

    // Ensure directory exists
    const dir = path.dirname(indexPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(indexPath, JSON.stringify(index, null, 2), 'utf-8');
  }

  /**
   * Save loop status to file
   * @returns {string} Path to saved file
   */
  saveStatus() {
    if (!this.status) {
      throw new Error('No status to save');
    }

    this.status.updatedAt = new Date().toISOString();

    // Ensure directory exists
    const dir = path.dirname(this.statusPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(this.statusPath, JSON.stringify(this.status, null, 2), 'utf-8');

    // AC7: Update dashboard
    this.updateStatusJson();

    return this.statusPath;
  }

  /**
   * Initialize new loop status
   * @private
   * @returns {Object} Initial status
   */
  _initStatus() {
    this.status = {
      storyId: this.storyId,
      currentIteration: 0,
      maxIterations: this.maxIterations,
      status: LoopStatus.PENDING,
      startedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      history: [],
    };
    return this.status;
  }

  /**
   * Increment iteration counter
   * @returns {number} New iteration number
   */
  incrementIteration() {
    if (!this.status) {
      throw new Error('Status not initialized');
    }

    this.status.currentIteration++;
    this.saveStatus();
    return this.status.currentIteration;
  }

  /**
   * Add entry to history
   * @param {Object} entry - History entry
   */
  addHistoryEntry(entry) {
    if (!this.status) {
      throw new Error('Status not initialized');
    }

    this.status.history.push({
      iteration: this.status.currentIteration,
      reviewedAt: null,
      verdict: null,
      issuesFound: 0,
      fixedAt: null,
      issuesFixed: null,
      duration: null,
      ...entry,
    });

    this.saveStatus();
  }

  /**
   * Update last history entry
   * @param {Object} updates - Fields to update
   */
  updateLastHistoryEntry(updates) {
    if (!this.status || this.status.history.length === 0) {
      throw new Error('No history to update');
    }

    const lastEntry = this.status.history[this.status.history.length - 1];
    Object.assign(lastEntry, updates);
    this.saveStatus();
  }

  // ═══════════════════════════════════════════════════════════════════════════════════
  //                              CORE LOOP (AC1)
  // ═══════════════════════════════════════════════════════════════════════════════════

  /**
   * Run the complete QA loop
   * @returns {Promise<Object>} Loop result
   */
  async runLoop() {
    this._log('');
    this._log('╔══════════════════════════════════════════════════════════════╗');
    this._log('║                     QA Loop Orchestrator                      ║');
    this._log('╚══════════════════════════════════════════════════════════════╝');
    this._log('');
    this._log(`Story: ${this.storyId}`);
    this._log(`Max Iterations: ${this.maxIterations}`);
    this._log('');

    // Initialize or load status with abandoned detection
    const existingStatus = this.loadStatus();
    if (existingStatus && existingStatus.status === LoopStatus.IN_PROGRESS) {
      // Check if abandoned (AC4 enhancement - session persistence)
      if (this.isAbandoned()) {
        this.recoverFromAbandoned();
        this._log('⚠️  Recovered from abandoned session, resuming...');
      } else {
        this._log('⚠️  Resuming existing loop...');
      }
    } else {
      this._initStatus();
    }

    this.status.status = LoopStatus.IN_PROGRESS;
    this.saveStatus();
    this._updateLoopsIndex();

    try {
      // AC1: Loop until approved, max iterations, or stopped
      while (this.status.currentIteration < this.maxIterations) {
        // Check if stopped (AC5)
        if (this.status.status === LoopStatus.STOPPED) {
          this._log('\n⏹️  Loop stopped by user');
          break;
        }

        // Run iteration
        const result = await this.runIteration();

        // Check result
        if (result.verdict === Verdict.APPROVE) {
          this.status.status = LoopStatus.COMPLETED;
          this.saveStatus();
          break;
        }

        if (result.verdict === Verdict.BLOCKED) {
          await this.escalateToHuman('Review verdict is BLOCKED');
          break;
        }

        // Check max iterations (AC2, AC3)
        if (this.status.currentIteration >= this.maxIterations) {
          await this.escalateToHuman(
            `Max iterations (${this.maxIterations}) reached without APPROVE`
          );
          break;
        }
      }

      // AC6: Generate summary
      const summary = this.generateSummary();
      this._log(summary);

      return {
        success: this.status.status === LoopStatus.COMPLETED,
        status: this.status,
        summary,
      };
    } catch (error) {
      this._log(`\n❌ Error in QA loop: ${error.message}`);
      this.status.status = LoopStatus.ESCALATED;
      this.status.escalationReason = error.message;
      this.saveStatus();
      throw error;
    }
  }

  /**
   * Run a single iteration of the loop
   * @returns {Promise<Object>} Iteration result
   */
  async runIteration() {
    this.incrementIteration();
    const iterationStart = Date.now();

    this._log('');
    this._log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    this._log(`  Iteration ${this.status.currentIteration}/${this.maxIterations}`);
    this._log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

    // Initialize history entry
    this.addHistoryEntry({
      iteration: this.status.currentIteration,
    });

    // Phase 1: Execute review
    const reviewResult = await this.executeReview();

    // Update history with review result
    this.updateLastHistoryEntry({
      reviewedAt: new Date().toISOString(),
      verdict: reviewResult.verdict,
      issuesFound: reviewResult.issuesFound,
    });

    // Check verdict
    if (reviewResult.verdict === Verdict.APPROVE) {
      this._log('\n✅ Review APPROVED - loop complete');
      return reviewResult;
    }

    if (reviewResult.verdict === Verdict.BLOCKED) {
      this._log('\n🚫 Review BLOCKED - escalating');
      return reviewResult;
    }

    // Phase 2: Create fix request
    const fixRequest = await this.executeFixRequest(reviewResult);

    // Phase 3: Execute fixes
    const fixResult = await this.executeFix(fixRequest);

    // Update history with fix result
    this.updateLastHistoryEntry({
      fixedAt: new Date().toISOString(),
      issuesFixed: fixResult.issuesFixed,
      duration: Date.now() - iterationStart,
    });

    return {
      verdict: reviewResult.verdict,
      issuesFound: reviewResult.issuesFound,
      issuesFixed: fixResult.issuesFixed,
      duration: Date.now() - iterationStart,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════════════
  //                              PHASE EXECUTION
  // ═══════════════════════════════════════════════════════════════════════════════════

  /**
   * Execute the review phase
   * @returns {Promise<Object>} Review result with verdict and issues
   */
  async executeReview() {
    this._log('\n📋 Phase 1: QA Review');
    this._log('   Agent: @qa');
    this._log('   Task: qa-review-story.md');

    // TODO: In production, this would invoke the QA agent
    // For now, we simulate the interface

    // Simulate review execution
    // In real implementation:
    // const result = await this.invokeAgent('qa', 'qa-review-story.md', {
    //   storyId: this.storyId,
    //   iteration: this.status.currentIteration,
    // });

    // Return simulated result structure
    return {
      verdict: Verdict.REJECT, // Would come from actual review
      issuesFound: 0,
      gateFile: null,
    };
  }

  /**
   * Execute the fix request creation phase
   * @param {Object} reviewResult - Result from review phase
   * @returns {Promise<Object>} Fix request
   */
  async executeFixRequest(reviewResult) {
    this._log('\n📝 Phase 2: Create Fix Request');
    this._log('   Agent: @qa');
    this._log('   Task: qa-create-fix-request.md');

    // TODO: In production, this would invoke the QA agent
    // For now, we return a simulated structure

    return {
      prioritizedIssues: [],
      fixRequestPath: null,
    };
  }

  /**
   * Execute the fix phase
   * @param {Object} fixRequest - Fix request from previous phase
   * @returns {Promise<Object>} Fix result
   */
  async executeFix(fixRequest) {
    this._log('\n🔧 Phase 3: Apply Fixes');
    this._log('   Agent: @dev');
    this._log('   Task: dev-apply-qa-fixes.md');

    // TODO: In production, this would invoke the Dev agent
    // For now, we return a simulated structure

    return {
      issuesFixed: 0,
      fixesApplied: [],
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════════════
  //                              ESCALATION (AC3)
  // ═══════════════════════════════════════════════════════════════════════════════════

  /**
   * Escalate to human with full context
   * @param {string} reason - Escalation reason
   * @returns {Promise<void>}
   */
  async escalateToHuman(reason) {
    this._log('\n🚨 ESCALATION TO HUMAN');
    this._log(`   Reason: ${reason}`);

    this.status.status = LoopStatus.ESCALATED;
    this.status.escalationReason = reason;
    this.status.escalatedAt = new Date().toISOString();
    this.saveStatus();

    // Generate escalation report
    const report = this._generateEscalationReport(reason);
    this._log(report);

    // Save escalation report
    const reportPath = path.join(path.dirname(this.statusPath), `escalation-${Date.now()}.md`);
    fs.writeFileSync(reportPath, report, 'utf-8');
    this._log(`\n📄 Escalation report saved to: ${reportPath}`);
  }

  /**
   * Generate escalation report
   * @private
   * @param {string} reason - Escalation reason
   * @returns {string} Markdown report
   */
  _generateEscalationReport(reason) {
    const lines = [];

    lines.push('# QA Loop Escalation Report');
    lines.push('');
    lines.push(`**Story:** ${this.storyId}`);
    lines.push(`**Escalated At:** ${new Date().toISOString()}`);
    lines.push(`**Reason:** ${reason}`);
    lines.push('');
    lines.push('## Loop Summary');
    lines.push('');
    lines.push(`- **Iterations Completed:** ${this.status.currentIteration}/${this.maxIterations}`);
    lines.push(`- **Status:** ${this.status.status}`);
    lines.push('');
    lines.push('## Iteration History');
    lines.push('');

    for (const entry of this.status.history) {
      const emoji = VerdictEmoji[entry.verdict] || '❓';
      lines.push(`### Iteration ${entry.iteration}`);
      lines.push(`- **Verdict:** ${emoji} ${entry.verdict || 'N/A'}`);
      lines.push(`- **Issues Found:** ${entry.issuesFound}`);
      lines.push(`- **Issues Fixed:** ${entry.issuesFixed ?? 'N/A'}`);
      lines.push(`- **Reviewed At:** ${entry.reviewedAt || 'N/A'}`);
      lines.push(`- **Fixed At:** ${entry.fixedAt || 'N/A'}`);
      lines.push('');
    }

    lines.push('## Recommended Actions');
    lines.push('');
    lines.push('1. **Review the QA gate files** in `qa/{storyId}/`');
    lines.push('2. **Manually address blocking issues** identified in reviews');
    lines.push('3. **Resume loop** with: `*resume-qa-loop ' + this.storyId + '`');
    lines.push('4. **Or approve manually** if issues are acceptable');
    lines.push('');

    return lines.join('\n');
  }

  // ═══════════════════════════════════════════════════════════════════════════════════
  //                              DASHBOARD INTEGRATION (AC7)
  // ═══════════════════════════════════════════════════════════════════════════════════

  /**
   * Update dashboard status.json
   * @returns {string} Path to updated file
   */
  updateStatusJson() {
    // Update dashboard status
    this._updateStatusFile(this.dashboardPath);

    // Update legacy status for backwards compatibility
    this._updateStatusFile(this.legacyStatusPath);

    return this.dashboardPath;
  }

  /**
   * Update a specific status file
   * @private
   * @param {string} statusPath - Path to status file
   */
  _updateStatusFile(statusPath) {
    let dashboardStatus = {};

    if (fs.existsSync(statusPath)) {
      try {
        dashboardStatus = JSON.parse(fs.readFileSync(statusPath, 'utf-8'));
      } catch {
        dashboardStatus = {};
      }
    }

    // Initialize structure if needed
    if (!dashboardStatus.version) dashboardStatus.version = '1.0';
    if (!dashboardStatus.qaLoop) dashboardStatus.qaLoop = {};

    // Update qaLoop section for this story
    dashboardStatus.qaLoop[this.storyId] = {
      status: this.status.status,
      currentIteration: this.status.currentIteration,
      maxIterations: this.status.maxIterations,
      lastVerdict:
        this.status.history.length > 0
          ? this.status.history[this.status.history.length - 1].verdict
          : null,
      lastIssuesFound:
        this.status.history.length > 0
          ? this.status.history[this.status.history.length - 1].issuesFound
          : 0,
      escalationReason: this.status.escalationReason || null,
      updatedAt: new Date().toISOString(),
    };

    dashboardStatus.updatedAt = new Date().toISOString();

    // Ensure directory exists
    const dir = path.dirname(statusPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(statusPath, JSON.stringify(dashboardStatus, null, 2), 'utf-8');
  }

  // ═══════════════════════════════════════════════════════════════════════════════════
  //                              CONTROL METHODS (AC5)
  // ═══════════════════════════════════════════════════════════════════════════════════

  /**
   * Stop the loop
   * @returns {Object} Current status
   */
  stop() {
    if (!this.status) {
      this.loadStatus();
    }

    if (!this.status) {
      throw new Error(`No active loop found for ${this.storyId}`);
    }

    this.status.status = LoopStatus.STOPPED;
    this.status.stoppedAt = new Date().toISOString();
    this.saveStatus();

    this._log(`\n⏹️  QA loop stopped for ${this.storyId}`);
    this._log(`   Iteration: ${this.status.currentIteration}/${this.maxIterations}`);

    return this.status;
  }

  /**
   * Resume a stopped or escalated loop
   * @returns {Promise<Object>} Loop result
   */
  async resume() {
    this.loadStatus();

    if (!this.status) {
      throw new Error(`No loop found for ${this.storyId}`);
    }

    if (this.status.status !== LoopStatus.STOPPED && this.status.status !== LoopStatus.ESCALATED) {
      throw new Error(
        `Cannot resume loop with status '${this.status.status}'. ` +
          `Must be '${LoopStatus.STOPPED}' or '${LoopStatus.ESCALATED}'.`
      );
    }

    this._log(`\n▶️  Resuming QA loop for ${this.storyId}`);
    this._log(`   From iteration: ${this.status.currentIteration}/${this.maxIterations}`);

    this.status.status = LoopStatus.IN_PROGRESS;
    this.status.resumedAt = new Date().toISOString();
    this.saveStatus();

    return this.runLoop();
  }

  /**
   * Reset the loop (start fresh)
   * @returns {Object} New status
   */
  reset() {
    // Delete existing status file
    if (fs.existsSync(this.statusPath)) {
      fs.unlinkSync(this.statusPath);
    }

    this._initStatus();
    this.saveStatus();

    this._log(`\n🔄 QA loop reset for ${this.storyId}`);

    return this.status;
  }

  // ═══════════════════════════════════════════════════════════════════════════════════
  //                              SUMMARY GENERATION (AC6)
  // ═══════════════════════════════════════════════════════════════════════════════════

  /**
   * Generate loop summary
   * @returns {string} Summary report
   */
  generateSummary() {
    if (!this.status) {
      return 'No status available';
    }

    const lines = [];
    const emoji = StatusEmoji[this.status.status] || '❓';

    lines.push('');
    lines.push('╔══════════════════════════════════════════════════════════════╗');
    lines.push('║                      QA Loop Summary                          ║');
    lines.push('╚══════════════════════════════════════════════════════════════╝');
    lines.push('');
    lines.push(`Story:       ${this.storyId}`);
    lines.push(`Status:      ${emoji} ${this.status.status.toUpperCase()}`);
    lines.push(`Iterations:  ${this.status.currentIteration}/${this.status.maxIterations}`);

    if (this.status.history.length > 0) {
      const lastEntry = this.status.history[this.status.history.length - 1];
      const verdictEmoji = VerdictEmoji[lastEntry.verdict] || '❓';
      lines.push(`Last Verdict: ${verdictEmoji} ${lastEntry.verdict || 'N/A'}`);
    }

    lines.push('');
    lines.push('─'.repeat(60));
    lines.push('');
    lines.push('Iteration History:');
    lines.push('');

    // Calculate totals
    let totalIssuesFound = 0;
    let totalIssuesFixed = 0;
    let totalDuration = 0;

    for (const entry of this.status.history) {
      const emoji = VerdictEmoji[entry.verdict] || '❓';
      const fixed = entry.issuesFixed !== null ? entry.issuesFixed : '-';
      const duration = entry.duration ? `${Math.round(entry.duration / 1000)}s` : '-';

      lines.push(
        `  ${entry.iteration}. ${emoji} ${(entry.verdict || 'N/A').padEnd(8)} ` +
          `| Found: ${String(entry.issuesFound).padStart(2)} | ` +
          `Fixed: ${String(fixed).padStart(2)} | ` +
          `Duration: ${duration}`
      );

      totalIssuesFound += entry.issuesFound || 0;
      totalIssuesFixed += entry.issuesFixed || 0;
      totalDuration += entry.duration || 0;
    }

    lines.push('');
    lines.push('─'.repeat(60));
    lines.push('');
    lines.push(`Total Issues Found: ${totalIssuesFound}`);
    lines.push(`Total Issues Fixed: ${totalIssuesFixed}`);
    lines.push(`Total Duration: ${Math.round(totalDuration / 1000)}s`);

    if (this.status.escalationReason) {
      lines.push('');
      lines.push(`⚠️  Escalation Reason: ${this.status.escalationReason}`);
    }

    lines.push('');

    return lines.join('\n');
  }

  /**
   * Get current status
   * @returns {Object} Status object
   */
  getStatus() {
    if (!this.status) {
      this.loadStatus();
    }
    return this.status;
  }

  // ═══════════════════════════════════════════════════════════════════════════════════
  //                              UTILITY METHODS
  // ═══════════════════════════════════════════════════════════════════════════════════

  /**
   * Log message if verbose
   * @private
   * @param {string} message - Message to log
   */
  _log(message) {
    if (this.verbose) {
      console.log(message);
    }
  }

  /**
   * Convert status to JSON
   * @returns {Object} Status object
   */
  toJSON() {
    return this.status;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
//                              HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Quick helper to get loop status for a story
 * @param {string} storyId - Story ID
 * @returns {Object|null} Status or null
 */
function getLoopStatus(storyId) {
  const orchestrator = new QALoopOrchestrator(storyId, { verbose: false });
  return orchestrator.getStatus();
}

/**
 * Start a new QA loop for a story
 * @param {string} storyId - Story ID
 * @param {Object} options - Options
 * @returns {Promise<Object>} Loop result
 */
async function startLoop(storyId, options = {}) {
  const orchestrator = new QALoopOrchestrator(storyId, options);
  return orchestrator.runLoop();
}

/**
 * Stop an active QA loop
 * @param {string} storyId - Story ID
 * @returns {Object} Final status
 */
function stopLoop(storyId) {
  const orchestrator = new QALoopOrchestrator(storyId, { verbose: false });
  return orchestrator.stop();
}

/**
 * Resume a stopped QA loop
 * @param {string} storyId - Story ID
 * @param {Object} options - Options
 * @returns {Promise<Object>} Loop result
 */
async function resumeLoop(storyId, options = {}) {
  const orchestrator = new QALoopOrchestrator(storyId, options);
  return orchestrator.resume();
}

/**
 * List all tracked QA loops (AC4 enhancement - session persistence)
 * @param {Object} options - Options
 * @param {string} [options.rootPath] - Project root path
 * @param {string} [options.filter] - Filter by status: 'active', 'abandoned', 'all'
 * @returns {Object} Loops index with filtered results
 */
function listLoops(options = {}) {
  const rootPath = options.rootPath || process.cwd();
  const filter = options.filter || 'all';
  const indexPath = path.join(rootPath, CONFIG.persistenceIndexPath);

  if (!fs.existsSync(indexPath)) {
    return { version: '1.0', loops: {}, count: 0, filtered: filter };
  }

  try {
    const index = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
    let loops = index.loops;

    // Apply filter
    if (filter === 'active') {
      loops = Object.fromEntries(
        Object.entries(loops).filter(([, v]) => v.status === LoopStatus.IN_PROGRESS)
      );
    } else if (filter === 'abandoned') {
      const now = Date.now();
      loops = Object.fromEntries(
        Object.entries(loops).filter(([, v]) => {
          if (v.status !== LoopStatus.IN_PROGRESS) return false;
          const lastUpdate = new Date(v.updatedAt).getTime();
          return now - lastUpdate > CONFIG.abandonedThreshold;
        })
      );
    }

    return {
      version: index.version,
      loops,
      count: Object.keys(loops).length,
      filtered: filter,
      updatedAt: index.updatedAt,
    };
  } catch (error) {
    console.error(`Error loading loops index: ${error.message}`);
    return { version: '1.0', loops: {}, count: 0, filtered: filter, error: error.message };
  }
}

/**
 * Check for and report abandoned loops
 * @param {Object} options - Options
 * @returns {Array} List of abandoned loop story IDs
 */
function checkAbandonedLoops(options = {}) {
  const result = listLoops({ ...options, filter: 'abandoned' });
  return Object.keys(result.loops);
}

// ═══════════════════════════════════════════════════════════════════════════════════
//                              CLI INTERFACE
// ═══════════════════════════════════════════════════════════════════════════════════

function printHelp() {
  console.log(`
📊 QA Loop Orchestrator - AIOX QA Evolution (Story 6.5)

Usage:
  node qa-loop-orchestrator.js <story-id> [command] [options]
  *qa-loop <story-id> [command] [options]

Commands:
  start           Start QA loop (default)
  status          Show current loop status
  stop            Stop loop (sets status to 'stopped') (AC5)
  resume          Resume from last iteration
  escalate        Force escalation to human (AC3)
  reset           Reset loop and start fresh
  summary         Show iteration summary (AC6)
  list            List all tracked loops (--filter=active|abandoned|all)
  check-abandoned Check for abandoned loops and report

Options:
  --max-iterations <n>   Set max iterations (default: 5) (AC2)
  --quiet, -q            Suppress verbose output
  --help, -h             Show this help message

Examples:
  node qa-loop-orchestrator.js STORY-42
  node qa-loop-orchestrator.js STORY-42 start
  node qa-loop-orchestrator.js STORY-42 status
  node qa-loop-orchestrator.js STORY-42 stop
  node qa-loop-orchestrator.js STORY-42 resume
  node qa-loop-orchestrator.js STORY-42 --max-iterations 3

Acceptance Criteria Coverage:
  AC1: Loop automático: review → fix → re-review
  AC2: Máximo 5 iterações (configurável via autoClaude.qaLoop.maxIterations)
  AC3: Após 5 iterações: escalate para humano com full context
  AC4: Track iteração atual em qa/loop-status.json
  AC5: Pode ser interrompido manualmente via *stop-qa-loop
  AC6: Summary ao final com histórico de iterações
  AC7: Integra com status.json para dashboard

Status File Schema (AC4):
  {
    "storyId": "STORY-42",
    "currentIteration": 2,
    "maxIterations": 5,
    "status": "in_progress",
    "history": [
      {
        "iteration": 1,
        "reviewedAt": "2026-01-28T10:00:00Z",
        "verdict": "REJECT",
        "issuesFound": 3,
        "fixedAt": "2026-01-28T11:00:00Z",
        "issuesFixed": 3
      }
    ]
  }
`);
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 1 || args.includes('--help') || args.includes('-h')) {
    printHelp();
    process.exit(args.includes('--help') || args.includes('-h') ? 0 : 1);
  }

  // Parse arguments
  let storyId = null;
  let command = 'start';
  let maxIterations = null;
  let quiet = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--max-iterations' && args[i + 1]) {
      maxIterations = parseInt(args[++i], 10);
    } else if (arg === '--quiet' || arg === '-q') {
      quiet = true;
    } else if (!arg.startsWith('-')) {
      if (!storyId) {
        storyId = arg;
      } else if (command === 'start') {
        command = arg;
      }
    }
  }

  if (!storyId) {
    console.error('Error: Story ID required');
    process.exit(1);
  }

  const options = {
    verbose: !quiet,
  };

  if (maxIterations) {
    options.maxIterations = maxIterations;
  }

  try {
    const orchestrator = new QALoopOrchestrator(storyId, options);

    switch (command) {
      case 'start':
        await orchestrator.runLoop();
        break;

      case 'status':
        const status = orchestrator.getStatus();
        if (status) {
          console.log(JSON.stringify(status, null, 2));
        } else {
          console.log(`No active loop found for ${storyId}`);
        }
        break;

      case 'stop':
        orchestrator.stop();
        console.log(`✅ Loop stopped for ${storyId}`);
        break;

      case 'resume':
        await orchestrator.resume();
        break;

      case 'escalate':
        orchestrator.loadStatus();
        if (!orchestrator.status) {
          orchestrator._initStatus();
        }
        await orchestrator.escalateToHuman('Manual escalation requested');
        break;

      case 'reset':
        orchestrator.reset();
        console.log(`✅ Loop reset for ${storyId}`);
        break;

      case 'summary':
        orchestrator.loadStatus();
        console.log(orchestrator.generateSummary());
        break;

      case 'list': {
        // Parse filter option
        let filter = 'all';
        const filterArg = args.find((a) => a.startsWith('--filter='));
        if (filterArg) {
          filter = filterArg.split('=')[1];
        }
        const listResult = listLoops({ filter });
        console.log('\n📋 QA Loops Index');
        console.log('─'.repeat(60));
        console.log(`Filter: ${listResult.filtered} | Count: ${listResult.count}`);
        console.log('');
        for (const [id, loop] of Object.entries(listResult.loops)) {
          const emoji = StatusEmoji[loop.status] || '❓';
          const abandoned = loop.wasAbandoned ? ' (recovered)' : '';
          console.log(
            `  ${emoji} ${id}: ${loop.status} - ${loop.currentIteration}/${loop.maxIterations}${abandoned}`
          );
        }
        if (listResult.count === 0) {
          console.log('  No loops found');
        }
        console.log('');
        break;
      }

      case 'check-abandoned': {
        const abandoned = checkAbandonedLoops();
        if (abandoned.length === 0) {
          console.log('✅ No abandoned loops found');
        } else {
          console.log(`\n⚠️  Found ${abandoned.length} abandoned loop(s):`);
          for (const id of abandoned) {
            console.log(`   - ${id}`);
          }
          console.log('\nUse "resume <story-id>" to recover');
        }
        break;
      }

      default:
        console.error(`Unknown command: ${command}`);
        printHelp();
        process.exit(1);
    }
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    process.exit(1);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
//                              EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════

module.exports = {
  QALoopOrchestrator,
  LoopStatus,
  Verdict,
  StatusEmoji,
  VerdictEmoji,
  // Helper functions
  getLoopStatus,
  startLoop,
  stopLoop,
  resumeLoop,
  // Session persistence helpers (AC4 enhancement)
  listLoops,
  checkAbandonedLoops,
  // Config for external use
  CONFIG,
};

// Run CLI if executed directly
if (require.main === module) {
  main();
}
