/**
 * Human Review Orchestrator (Layer 3 Enhancement)
 *
 * Orchestrates the complete 3-layer quality gate flow with:
 * - Layer 1+2 pass detection
 * - Layer 1+2 fail blocking
 * - Human review request system
 * - Focus area recommendations
 * - Notification management
 *
 * @module core/quality-gates/human-review-orchestrator
 * @version 1.0.0
 * @story 3.5 - Human Review Orchestration (Layer 3)
 */

const fs = require('fs').promises;
const path = require('path');
const { FocusAreaRecommender } = require('./focus-area-recommender');
const { NotificationManager } = require('./notification-manager');

/**
 * Human Review Orchestrator
 * Implements the 3-layer orchestration flow
 */
class HumanReviewOrchestrator {
  /**
   * Create a new orchestrator
   * @param {Object} config - Orchestrator configuration
   */
  constructor(config = {}) {
    this.config = config;
    this.focusRecommender = new FocusAreaRecommender(config.focusAreas || {});
    this.notificationManager = new NotificationManager(config.notifications || {});
    this.statusPath = config.statusPath || '.aiox/qa-status.json';
    this.reviewRequestsPath = config.reviewRequestsPath || '.aiox/human-review-requests';
    // Status queue for serializing concurrent writes to status file
    this.statusQueue = Promise.resolve();
  }

  /**
   * Orchestrate the full review flow
   * @param {Object} prContext - PR/change context
   * @param {Object} layer1Result - Layer 1 results
   * @param {Object} layer2Result - Layer 2 results
   * @returns {Promise<Object>} Orchestration result
   */
  async orchestrateReview(prContext, layer1Result, layer2Result) {
    const startTime = Date.now();

    // Step 1: Check Layer 1 pass/fail
    const layer1Check = this.checkLayerPassed(layer1Result, 'Layer 1');
    if (!layer1Check.pass) {
      return this.block(layer1Check, 'layer1', startTime);
    }

    // Step 2: Check Layer 2 pass/fail
    const layer2Check = this.checkLayerPassed(layer2Result, 'Layer 2');
    if (!layer2Check.pass) {
      return this.block(layer2Check, 'layer2', startTime);
    }

    // Step 3: Both layers passed - generate human review request
    const reviewRequest = await this.generateHumanReviewRequest(
      prContext,
      layer1Result,
      layer2Result,
    );

    // Step 4: Send notification to human reviewer
    await this.notifyReviewer(reviewRequest);

    // Step 5: Save the review request
    await this.saveReviewRequest(reviewRequest);

    return {
      pass: true,
      status: 'pending_human_review',
      duration: Date.now() - startTime,
      message: 'Layers 1+2 passed. Human review requested.',
      reviewRequest,
      layers: {
        layer1: layer1Check,
        layer2: layer2Check,
      },
    };
  }

  /**
   * Check if a layer passed
   * @param {Object} layerResult - Layer result object
   * @param {string} layerName - Layer name for messaging
   * @returns {Object} Check result
   */
  checkLayerPassed(layerResult, layerName) {
    if (!layerResult) {
      return {
        pass: false,
        layer: layerName,
        reason: `${layerName} not executed`,
        issues: [],
      };
    }

    const pass = layerResult.pass === true;
    const issues = this.extractIssues(layerResult);

    return {
      pass,
      layer: layerName,
      duration: layerResult.duration || 0,
      checksRun: layerResult.checks?.total || 0,
      checksPassed: layerResult.checks?.passed || 0,
      checksFailed: layerResult.checks?.failed || 0,
      reason: pass ? `${layerName} passed` : `${layerName} failed`,
      issues,
    };
  }

  /**
   * Extract issues from layer result
   * @param {Object} layerResult - Layer result
   * @returns {Array} Extracted issues
   */
  extractIssues(layerResult) {
    const issues = [];

    if (!layerResult.results) return issues;

    layerResult.results.forEach((result) => {
      if (!result.pass) {
        issues.push({
          check: result.check,
          message: result.message,
          severity: this.determineSeverity(result),
          details: result.error || result.details || null,
        });
      }
    });

    return issues;
  }

  /**
   * Determine severity from result
   * @param {Object} result - Check result
   * @returns {string} Severity level
   */
  determineSeverity(result) {
    if (result.check === 'lint') return 'HIGH';
    if (result.check === 'test') return 'CRITICAL';
    if (result.check === 'typecheck') return 'HIGH';
    if (result.issues?.critical > 0) return 'CRITICAL';
    if (result.issues?.high > 0) return 'HIGH';
    return 'MEDIUM';
  }

  /**
   * Block the review flow due to layer failure
   * @param {Object} layerCheck - Failed layer check
   * @param {string} stoppedAt - Layer that caused the block
   * @param {number} startTime - Orchestration start time
   * @returns {Object} Block result
   */
  block(layerCheck, stoppedAt, startTime) {
    const blockMessages = {
      layer1: 'Fix linting, tests, and type errors before human review',
      layer2: 'Fix CodeRabbit and Quinn issues before human review',
    };

    return {
      pass: false,
      status: 'blocked',
      stoppedAt,
      duration: Date.now() - startTime,
      message: blockMessages[stoppedAt] || 'Fix issues before proceeding',
      reason: layerCheck.reason,
      issues: layerCheck.issues,
      fixFirst: this.generateFixRecommendations(layerCheck),
    };
  }

  /**
   * Generate fix recommendations for blocked issues
   * @param {Object} layerCheck - Layer check result
   * @returns {Array} Fix recommendations
   */
  generateFixRecommendations(layerCheck) {
    const recommendations = [];

    layerCheck.issues.forEach((issue) => {
      const rec = {
        issue: issue.message,
        severity: issue.severity,
        suggestion: null,
      };

      switch (issue.check) {
        case 'lint':
          rec.suggestion = 'Run `npm run lint:fix` to auto-fix linting issues';
          break;
        case 'test':
          rec.suggestion = 'Run `npm test` and fix failing tests';
          break;
        case 'typecheck':
          rec.suggestion = 'Run `npm run typecheck` and resolve type errors';
          break;
        case 'coderabbit':
          rec.suggestion = 'Review CodeRabbit feedback and address CRITICAL/HIGH issues';
          break;
        case 'quinn':
          rec.suggestion = 'Review Quinn suggestions and address blocking items';
          break;
        default:
          rec.suggestion = `Address ${issue.check} issues before proceeding`;
      }

      recommendations.push(rec);
    });

    return recommendations;
  }

  /**
   * Generate human review request with focus areas
   * @param {Object} prContext - PR context
   * @param {Object} layer1Result - Layer 1 result
   * @param {Object} layer2Result - Layer 2 result
   * @returns {Promise<Object>} Review request
   */
  async generateHumanReviewRequest(prContext, layer1Result, layer2Result) {
    // Generate focus area recommendations
    const focusAreas = await this.focusRecommender.recommend({
      prContext,
      layer1Result,
      layer2Result,
    });

    // Generate summary from automated reviews
    const automatedSummary = this.generateAutomatedSummary(layer1Result, layer2Result);

    return {
      id: this.generateRequestId(),
      createdAt: new Date().toISOString(),
      prContext,
      focusAreas,
      automatedSummary,
      skipAreas: ['syntax', 'formatting', 'simple-logic'],
      estimatedTime: this.estimateReviewTime(focusAreas),
      reviewer: await this.assignReviewer(prContext),
      status: 'pending',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
    };
  }

  /**
   * Generate automated review summary
   * @param {Object} layer1Result - Layer 1 results
   * @param {Object} layer2Result - Layer 2 results
   * @returns {Object} Summary object
   */
  generateAutomatedSummary(layer1Result, layer2Result) {
    const summary = {
      layer1: {
        status: layer1Result?.pass ? 'passed' : 'failed',
        checks: [],
      },
      layer2: {
        status: layer2Result?.pass ? 'passed' : 'failed',
        coderabbit: null,
        quinn: null,
      },
    };

    // Layer 1 summary
    if (layer1Result?.results) {
      layer1Result.results.forEach((r) => {
        summary.layer1.checks.push({
          check: r.check,
          status: r.pass ? 'passed' : (r.skipped ? 'skipped' : 'failed'),
          message: r.message,
        });
      });
    }

    // Layer 2 CodeRabbit summary
    const coderabbitResult = layer2Result?.results?.find((r) => r.check === 'coderabbit');
    if (coderabbitResult) {
      summary.layer2.coderabbit = {
        status: coderabbitResult.pass ? 'passed' : (coderabbitResult.skipped ? 'skipped' : 'issues_found'),
        issues: coderabbitResult.issues || { critical: 0, high: 0, medium: 0, low: 0 },
        details: coderabbitResult.details?.slice(0, 5) || [], // Top 5 issues
      };
    }

    // Layer 2 Quinn summary
    const quinnResult = layer2Result?.results?.find((r) => r.check === 'quinn');
    if (quinnResult) {
      summary.layer2.quinn = {
        status: quinnResult.pass ? 'passed' : (quinnResult.skipped ? 'skipped' : 'issues_found'),
        suggestions: quinnResult.suggestions || 0,
        blocking: quinnResult.blocking || 0,
        details: quinnResult.details?.slice(0, 5) || [], // Top 5 suggestions
      };
    }

    return summary;
  }

  /**
   * Estimate review time based on focus areas
   * @param {Object} focusAreas - Focus area recommendations
   * @returns {number} Estimated minutes
   */
  estimateReviewTime(focusAreas) {
    const baseTime = 10; // Base 10 minutes
    const perAreaTime = 5; // 5 minutes per focus area

    const areaCount = (focusAreas.primary?.length || 0) +
                     (focusAreas.secondary?.length || 0) * 0.5;

    return Math.round(baseTime + (areaCount * perAreaTime));
  }

  /**
   * Assign a reviewer based on context
   * @param {Object} prContext - PR context
   * @returns {Promise<string>} Assigned reviewer
   */
  async assignReviewer(_prContext) {
    // Use round-robin or auto-assignment
    const reviewers = ['@architect', '@tech-lead', '@senior-dev'];

    try {
      let status = {};
      try {
        status = JSON.parse(await fs.readFile(this.statusPath, 'utf8'));
      } catch {
        // No status file
      }

      const lastIndex = status.lastReviewerIndex || 0;
      const nextIndex = (lastIndex + 1) % reviewers.length;

      return reviewers[nextIndex];
    } catch {
      return reviewers[0];
    }
  }

  /**
   * Generate unique request ID
   * @returns {string} Request ID
   */
  generateRequestId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `hr-${timestamp}-${random}`;
  }

  /**
   * Validate request ID to prevent path traversal attacks
   * @param {string} id - Request ID to validate
   * @returns {string} Validated ID
   * @throws {Error} If ID contains invalid characters
   */
  validateRequestId(id) {
    if (!id || typeof id !== 'string') {
      throw new Error('Request ID is required and must be a string');
    }

    // Only allow alphanumeric, hyphens, underscores, and dots
    const validIdPattern = /^[A-Za-z0-9_.-]+$/;
    if (!validIdPattern.test(id)) {
      throw new Error('Invalid request ID: contains disallowed characters');
    }

    // Ensure the ID doesn't resolve outside the intended directory
    const sanitizedId = path.basename(id);
    if (sanitizedId !== id) {
      throw new Error('Invalid request ID: path traversal detected');
    }

    return id;
  }

  /**
   * Notify the assigned reviewer
   * @param {Object} reviewRequest - Review request object
   * @returns {Promise<Object>} Notification result
   */
  async notifyReviewer(reviewRequest) {
    return await this.notificationManager.sendReviewRequest(reviewRequest);
  }

  /**
   * Save review request to file system
   * @param {Object} reviewRequest - Review request
   * @returns {Promise<void>}
   */
  async saveReviewRequest(reviewRequest) {
    // Validate ID to prevent path traversal
    const validatedId = this.validateRequestId(reviewRequest.id);

    const requestPath = path.join(
      this.reviewRequestsPath,
      `${validatedId}.json`,
    );

    // Additional containment check
    const resolvedPath = path.resolve(requestPath);
    const resolvedBase = path.resolve(this.reviewRequestsPath);
    if (!resolvedPath.startsWith(resolvedBase + path.sep)) {
      throw new Error('Path traversal attempt detected');
    }

    await fs.mkdir(this.reviewRequestsPath, { recursive: true });
    await fs.writeFile(requestPath, JSON.stringify(reviewRequest, null, 2));

    // Update status file
    await this.updateStatus(reviewRequest);
  }

  /**
   * Update the QA status file (thread-safe via queue)
   * @param {Object} reviewRequest - Review request
   * @returns {Promise<void>}
   */
  async updateStatus(reviewRequest) {
    // Chain the update operation onto the queue to serialize concurrent writes
    this.statusQueue = this.statusQueue.then(async () => {
      let status = {};

      try {
        status = JSON.parse(await fs.readFile(this.statusPath, 'utf8'));
      } catch {
        // Create new status
      }

      status.lastHumanReviewRequest = {
        id: reviewRequest.id,
        createdAt: reviewRequest.createdAt,
        reviewer: reviewRequest.reviewer,
        status: reviewRequest.status,
        estimatedTime: reviewRequest.estimatedTime,
      };

      // Update reviewer index for round-robin
      const reviewers = ['@architect', '@tech-lead', '@senior-dev'];
      const currentIndex = reviewers.indexOf(reviewRequest.reviewer);
      if (currentIndex !== -1) {
        status.lastReviewerIndex = currentIndex;
      }

      await fs.mkdir(path.dirname(this.statusPath), { recursive: true });
      await fs.writeFile(this.statusPath, JSON.stringify(status, null, 2));
    }).catch((err) => {
      // Log but don't break the queue for future updates
      console.error('Failed to update status:', err.message);
    });

    // Wait for this update to complete
    await this.statusQueue;
  }

  /**
   * Get pending review requests
   * @returns {Promise<Array>} Pending requests
   */
  async getPendingRequests() {
    try {
      const files = await fs.readdir(this.reviewRequestsPath);
      const requests = [];

      for (const file of files) {
        if (file.endsWith('.json')) {
          const content = await fs.readFile(
            path.join(this.reviewRequestsPath, file),
            'utf8',
          );
          const request = JSON.parse(content);
          if (request.status === 'pending') {
            requests.push(request);
          }
        }
      }

      return requests;
    } catch {
      return [];
    }
  }

  /**
   * Complete a review request
   * @param {string} requestId - Request ID
   * @param {Object} reviewResult - Review result
   * @returns {Promise<Object>} Updated request
   */
  async completeReview(requestId, reviewResult) {
    // Validate ID to prevent path traversal
    const validatedId = this.validateRequestId(requestId);

    const requestPath = path.join(this.reviewRequestsPath, `${validatedId}.json`);

    // Additional containment check
    const resolvedPath = path.resolve(requestPath);
    const resolvedBase = path.resolve(this.reviewRequestsPath);
    if (!resolvedPath.startsWith(resolvedBase + path.sep)) {
      throw new Error('Path traversal attempt detected');
    }

    try {
      const request = JSON.parse(await fs.readFile(requestPath, 'utf8'));

      request.status = reviewResult.approved ? 'approved' : 'changes_requested';
      request.completedAt = new Date().toISOString();
      request.reviewResult = reviewResult;
      request.actualTime = reviewResult.timeSpent || null;

      await fs.writeFile(requestPath, JSON.stringify(request, null, 2));

      return request;
    } catch (error) {
      throw new Error(`Failed to complete review ${requestId}: ${error.message}`);
    }
  }
}

module.exports = { HumanReviewOrchestrator };
