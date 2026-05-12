/**
 * Quality Gate Manager
 *
 * Orchestrates the 3-layer quality gate pipeline:
 * - Layer 1: Pre-commit (lint, test, typecheck)
 * - Layer 2: PR Automation (CodeRabbit, Quinn)
 * - Layer 3: Human Review (checklist, sign-off)
 *
 * @module core/quality-gates/quality-gate-manager
 * @version 1.0.0
 * @story 2.10 - Quality Gate Manager
 */

const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');
const { Layer1PreCommit } = require('./layer1-precommit');
const { Layer2PRAutomation } = require('./layer2-pr-automation');
const { Layer3HumanReview } = require('./layer3-human-review');
const { HumanReviewOrchestrator } = require('./human-review-orchestrator');
const { NotificationManager } = require('./notification-manager');

/**
 * Default configuration path
 */
const DEFAULT_CONFIG_PATH = '.aiox-core/core/quality-gates/quality-gate-config.yaml';

/**
 * Quality Gate Manager - Main orchestrator
 */
class QualityGateManager {
  /**
   * Create a new QualityGateManager
   * @param {Object} config - Configuration object
   */
  constructor(config = {}) {
    this.config = config;
    this.layers = {
      layer1: new Layer1PreCommit(config.layer1 || {}),
      layer2: new Layer2PRAutomation(config.layer2 || {}),
      layer3: new Layer3HumanReview(config.layer3 || {}),
    };
    this.humanReviewOrchestrator = new HumanReviewOrchestrator(config.humanReview || {});
    this.notificationManager = new NotificationManager(config.notifications || {});
    this.results = [];
    this.startTime = null;
    this.endTime = null;
  }

  /**
   * Load configuration from file
   * @param {string} configPath - Path to config file
   * @returns {Promise<QualityGateManager>} New instance with loaded config
   */
  static async load(configPath = DEFAULT_CONFIG_PATH) {
    try {
      const content = await fs.readFile(configPath, 'utf8');
      const config = yaml.load(content);
      return new QualityGateManager(config);
    } catch (_error) {
      console.warn(`Could not load config from ${configPath}, using defaults`);
      return new QualityGateManager({});
    }
  }

  /**
   * Run a specific layer
   * @param {number} layerNum - Layer number (1, 2, or 3)
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} Layer result
   */
  async runLayer(layerNum, context = {}) {
    const layerMap = {
      1: 'layer1',
      2: 'layer2',
      3: 'layer3',
    };

    const layerKey = layerMap[layerNum];
    if (!layerKey) {
      throw new Error(`Invalid layer number: ${layerNum}. Use 1, 2, or 3.`);
    }

    const layer = this.layers[layerKey];
    return await layer.execute(context);
  }

  /**
   * Run Layer 1: Pre-commit checks
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} Layer 1 results
   */
  async runLayer1(context = {}) {
    return await this.layers.layer1.execute(context);
  }

  /**
   * Run Layer 2: PR Automation
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} Layer 2 results
   */
  async runLayer2(context = {}) {
    return await this.layers.layer2.execute(context);
  }

  /**
   * Run Layer 3: Human Review
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} Layer 3 results
   */
  async runLayer3(context = {}) {
    return await this.layers.layer3.execute(context);
  }

  /**
   * Orchestrate the full quality gate pipeline
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} Pipeline results
   */
  async orchestrate(context = {}) {
    this.startTime = Date.now();
    this.results = [];

    const { verbose = false } = context;

    if (verbose) {
      console.log('\n🔍 Quality Gate Pipeline');
      console.log('━'.repeat(50));
    }

    // Layer 1: Pre-commit
    const l1Result = await this.runLayer1(context);
    this.results.push(l1Result);

    if (!l1Result.pass) {
      this.endTime = Date.now();
      return this.failFast(l1Result, context);
    }

    // Layer 2: PR Automation
    const l2Result = await this.runLayer2(context);
    this.results.push(l2Result);

    if (!l2Result.pass) {
      this.endTime = Date.now();
      return this.escalate(l2Result, context);
    }

    // Layer 3: Human Review
    const l3Context = {
      ...context,
      previousLayers: [l1Result, l2Result],
    };
    const l3Result = await this.runLayer3(l3Context);
    this.results.push(l3Result);

    this.endTime = Date.now();

    // Determine overall pass status
    const signoffResult = l3Result.results?.find((r) => r.check === 'signoff');
    const allPassed = l1Result.pass && l2Result.pass;
    const pendingReview = signoffResult && !signoffResult.signedOff && signoffResult.required;

    return this.getOrchestratedResult(allPassed, pendingReview, context);
  }

  /**
   * Handle fail-fast on Layer 1 failure
   * @param {Object} result - Layer 1 result
   * @param {Object} context - Execution context
   * @returns {Object} Fail-fast result
   */
  failFast(result, context = {}) {
    const { verbose = false } = context;

    if (verbose) {
      console.log('\n━'.repeat(50));
      console.log('❌ Layer 1 failed - fix before proceeding');
      console.log('Pipeline stopped (fail-fast)');
    }

    return {
      pass: false,
      status: 'failed',
      stoppedAt: 'layer1',
      reason: 'fail-fast',
      duration: this.getDuration(),
      layers: this.results,
      exitCode: 1,
      message: 'Layer 1 failed - fix lint/test/typecheck errors before proceeding',
    };
  }

  /**
   * Handle escalation on Layer 2 issues
   * @param {Object} result - Layer 2 result
   * @param {Object} context - Execution context
   * @returns {Object} Escalation result
   */
  escalate(result, context = {}) {
    const { verbose = false } = context;

    if (verbose) {
      console.log('\n━'.repeat(50));
      console.log('⚠️ Layer 2 issues found - review required');
    }

    return {
      pass: false,
      status: 'blocked',
      stoppedAt: 'layer2',
      reason: 'escalation',
      duration: this.getDuration(),
      layers: this.results,
      exitCode: 1,
      message: 'Layer 2 found blocking issues - review and fix before proceeding',
    };
  }

  /**
   * Get orchestrated result
   * @param {boolean} allPassed - All layers passed
   * @param {boolean} pendingReview - Awaiting human review
   * @param {Object} context - Execution context
   * @returns {Object} Final result
   */
  getOrchestratedResult(allPassed, pendingReview, context = {}) {
    const { verbose = false } = context;

    let status, message, exitCode;

    if (allPassed && !pendingReview) {
      status = 'passed';
      message = 'All quality gates passed';
      exitCode = 0;
    } else if (allPassed && pendingReview) {
      status = 'pending';
      message = 'Quality gates passed - awaiting human review';
      exitCode = 0;
    } else {
      status = 'failed';
      message = 'Quality gates failed';
      exitCode = 1;
    }

    if (verbose) {
      console.log('\n━'.repeat(50));
      const icon = status === 'passed' ? '✅' :
        status === 'pending' ? '⏳' : '❌';
      console.log(`Result: ${icon} ${status.toUpperCase()}`);
      console.log(`Duration: ${this.formatDuration(this.getDuration())}`);
    }

    return {
      pass: exitCode === 0,
      status,
      duration: this.getDuration(),
      layers: this.results,
      exitCode,
      message,
    };
  }

  /**
   * Get current gate status
   * @returns {Promise<Object>} Current status
   */
  async getStatus() {
    const statusPath = this.config.status?.location || '.aiox/qa-status.json';

    try {
      const content = await fs.readFile(statusPath, 'utf8');
      const status = JSON.parse(content);

      return {
        lastRun: status.lastRun,
        layer1: status.layer1 || null,
        layer2: status.layer2 || null,
        layer3: status.layer3 || null,
        signoffs: status.signoffs || {},
        overall: this.determineOverallStatus(status),
      };
    } catch {
      return {
        lastRun: null,
        layer1: null,
        layer2: null,
        layer3: null,
        signoffs: {},
        overall: 'unknown',
      };
    }
  }

  /**
   * Determine overall status from stored data
   * @param {Object} status - Stored status
   * @returns {string} Overall status
   */
  determineOverallStatus(status) {
    if (!status.layer1) return 'not-started';
    if (!status.layer1.pass) return 'layer1-failed';
    if (!status.layer2) return 'layer1-complete';
    if (!status.layer2.pass) return 'layer2-blocked';
    if (!status.layer3) return 'layer2-complete';
    return 'layer3-pending';
  }

  /**
   * Save current results to status file
   * @returns {Promise<void>}
   */
  async saveStatus() {
    const statusPath = this.config.status?.location || '.aiox/qa-status.json';

    const status = {
      lastRun: new Date().toISOString(),
      duration: this.getDuration(),
      layer1: this.results[0] || null,
      layer2: this.results[1] || null,
      layer3: this.results[2] || null,
    };

    // Preserve existing signoffs
    try {
      const existing = JSON.parse(await fs.readFile(statusPath, 'utf8'));
      status.signoffs = existing.signoffs || {};
      status.lastReviewerIndex = existing.lastReviewerIndex;
    } catch {
      status.signoffs = {};
    }

    await fs.mkdir(path.dirname(statusPath), { recursive: true });
    await fs.writeFile(statusPath, JSON.stringify(status, null, 2));
  }

  /**
   * Save detailed report
   * @param {string} storyId - Story identifier
   * @returns {Promise<string>} Report path
   */
  async saveReport(storyId = 'unknown') {
    const reportDir = this.config.reports?.location || '.aiox/qa-reports';
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = path.join(reportDir, `qa-report-${storyId}-${timestamp}.json`);

    const report = {
      storyId,
      timestamp: new Date().toISOString(),
      duration: this.getDuration(),
      results: this.results,
      metrics: {
        layer1Duration: this.results[0]?.duration || 0,
        layer2Duration: this.results[1]?.duration || 0,
        layer3Duration: this.results[2]?.duration || 0,
        totalDuration: this.getDuration(),
      },
    };

    await fs.mkdir(reportDir, { recursive: true });
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

    return reportPath;
  }

  /**
   * Get execution duration
   * @returns {number} Duration in milliseconds
   */
  getDuration() {
    if (!this.startTime) return 0;
    const end = this.endTime || Date.now();
    return end - this.startTime;
  }

  /**
   * Format duration for display
   * @param {number} ms - Duration in milliseconds
   * @returns {string} Formatted duration
   */
  formatDuration(ms) {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  }

  /**
   * Format results for display
   * @returns {string} Formatted output
   */
  formatResults() {
    const lines = ['', '🔍 Quality Gate Pipeline Results', '━'.repeat(50), ''];

    this.results.forEach((layer, _index) => {
      const icon = layer.pass ? '✅' : '❌';
      lines.push(`${icon} ${layer.layer} - ${layer.pass ? 'PASSED' : 'FAILED'}`);

      layer.results?.forEach((result) => {
        const checkIcon = result.pass ? '✓' : '✗';
        const skipped = result.skipped ? ' (skipped)' : '';
        lines.push(`   ${checkIcon} ${result.check}: ${result.message}${skipped}`);
      });

      lines.push('');
    });

    lines.push('━'.repeat(50));
    lines.push(`Total Duration: ${this.formatDuration(this.getDuration())}`);

    return lines.join('\n');
  }

  /**
   * Orchestrate full 3-layer review flow (Story 3.5)
   *
   * Flow:
   * 1. Run Layer 1 (pre-commit) → fail-fast if fails
   * 2. Run Layer 2 (PR automation) → block if fails
   * 3. If 1+2 pass → Request human review with focus areas
   * 4. Notify human reviewer
   *
   * @param {Object} prContext - PR/change context
   * @returns {Promise<Object>} Orchestration result
   */
  async orchestrateHumanReview(prContext = {}) {
    this.startTime = Date.now();
    this.results = [];

    const { verbose = false, changedFiles = [] } = prContext;

    if (verbose) {
      console.log('\n🔍 3-Layer Quality Gate Orchestration');
      console.log('━'.repeat(50));
      console.log('Story 3.5: Human Review Orchestration (Layer 3)');
      console.log('━'.repeat(50));
    }

    // Layer 1: Pre-commit checks
    if (verbose) console.log('\n📋 Phase 1: Running Layer 1 (Pre-commit)...');
    const l1Result = await this.runLayer1({ ...prContext, verbose });
    this.results.push(l1Result);

    if (!l1Result.pass) {
      this.endTime = Date.now();
      const blockResult = this.humanReviewOrchestrator.block(
        { pass: false, layer: 'Layer 1', issues: this.extractIssues(l1Result), reason: 'Layer 1 failed' },
        'layer1',
        this.startTime,
      );

      if (verbose) {
        console.log('\n🚫 BLOCKED: Fix Layer 1 issues first');
        blockResult.fixFirst?.forEach((fix) => {
          console.log(`  → ${fix.suggestion}`);
        });
      }

      // Send blocking notification
      await this.notificationManager.sendBlockingNotification(blockResult);

      return {
        ...blockResult,
        layers: this.results,
        exitCode: 1,
      };
    }

    // Layer 2: PR Automation
    if (verbose) console.log('\n🤖 Phase 2: Running Layer 2 (PR Automation)...');
    const l2Result = await this.runLayer2({ ...prContext, verbose });
    this.results.push(l2Result);

    if (!l2Result.pass) {
      this.endTime = Date.now();
      const blockResult = this.humanReviewOrchestrator.block(
        { pass: false, layer: 'Layer 2', issues: this.extractIssues(l2Result), reason: 'Layer 2 failed' },
        'layer2',
        this.startTime,
      );

      if (verbose) {
        console.log('\n🚫 BLOCKED: Fix Layer 2 issues first');
        blockResult.fixFirst?.forEach((fix) => {
          console.log(`  → ${fix.suggestion}`);
        });
      }

      // Send blocking notification
      await this.notificationManager.sendBlockingNotification(blockResult);

      return {
        ...blockResult,
        layers: this.results,
        exitCode: 1,
      };
    }

    // Both layers passed - Request human review
    if (verbose) {
      console.log('\n✅ Layers 1+2 PASSED');
      console.log('\n👤 Phase 3: Requesting Human Review...');
    }

    const orchestrationResult = await this.humanReviewOrchestrator.orchestrateReview(
      { ...prContext, changedFiles },
      l1Result,
      l2Result,
    );

    // Run Layer 3 setup
    const l3Context = {
      ...prContext,
      previousLayers: [l1Result, l2Result],
    };
    const l3Result = await this.runLayer3(l3Context);
    this.results.push(l3Result);

    this.endTime = Date.now();

    if (verbose) {
      console.log('\n' + '━'.repeat(50));
      console.log('📊 Orchestration Summary');
      console.log('━'.repeat(50));
      console.log('✅ Layer 1: PASSED');
      console.log('✅ Layer 2: PASSED');
      console.log(`⏳ Layer 3: ${orchestrationResult.reviewRequest ? 'HUMAN REVIEW REQUESTED' : 'PENDING'}`);
      console.log(`\n📬 Review assigned to: ${orchestrationResult.reviewRequest?.reviewer || 'TBD'}`);
      console.log(`⏱️ Estimated review time: ~${orchestrationResult.reviewRequest?.estimatedTime || 30} minutes`);

      if (orchestrationResult.reviewRequest?.focusAreas?.primary?.length > 0) {
        console.log('\n🎯 Focus Areas:');
        orchestrationResult.reviewRequest.focusAreas.primary.forEach((area) => {
          console.log(`  • ${area.area}: ${area.reason}`);
        });
      }

      console.log(`\n⏭️ Skip: ${orchestrationResult.reviewRequest?.skipAreas?.join(', ') || 'syntax, formatting'}`);
      console.log('\nTotal Duration: ' + this.formatDuration(this.getDuration()));
    }

    return {
      pass: true,
      status: 'pending_human_review',
      duration: this.getDuration(),
      layers: this.results,
      reviewRequest: orchestrationResult.reviewRequest,
      exitCode: 0,
      message: 'Layers 1+2 passed. Human review requested.',
    };
  }

  /**
   * Extract issues from layer result for orchestration
   * @param {Object} layerResult - Layer result
   * @returns {Array} Extracted issues
   */
  extractIssues(layerResult) {
    const issues = [];

    if (!layerResult.results) return issues;

    layerResult.results.forEach((result) => {
      if (!result.pass && !result.skipped) {
        issues.push({
          check: result.check,
          message: result.message,
          severity: result.issues?.critical > 0 ? 'CRITICAL' : 'HIGH',
        });
      }
    });

    return issues;
  }

  /**
   * Complete a human review
   * @param {string} requestId - Review request ID
   * @param {Object} reviewResult - Review result (approved, comments, etc)
   * @returns {Promise<Object>} Completion result
   */
  async completeHumanReview(requestId, reviewResult) {
    const completedRequest = await this.humanReviewOrchestrator.completeReview(
      requestId,
      reviewResult,
    );

    await this.notificationManager.sendCompletionNotification(completedRequest);

    return completedRequest;
  }

  /**
   * Get pending human review requests
   * @returns {Promise<Array>} Pending requests
   */
  async getPendingReviews() {
    return await this.humanReviewOrchestrator.getPendingRequests();
  }
}

module.exports = { QualityGateManager };
