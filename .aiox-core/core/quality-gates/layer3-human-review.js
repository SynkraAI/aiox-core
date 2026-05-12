/**
 * Layer 3: Human Review
 *
 * Strategic review requiring human oversight:
 * - Checklist generation
 * - Reviewer assignment
 * - Sign-off tracking
 *
 * @module core/quality-gates/layer3-human-review
 * @version 1.0.0
 * @story 2.10 - Quality Gate Manager
 */

const fs = require('fs').promises;
const path = require('path');
const { BaseLayer } = require('./base-layer');
const { ChecklistGenerator } = require('./checklist-generator');

/**
 * Layer 3: Human Review
 * @extends BaseLayer
 */
class Layer3HumanReview extends BaseLayer {
  /**
   * Create Layer 3 instance
   * @param {Object} config - Layer 3 configuration
   */
  constructor(config = {}) {
    super('Layer 3: Human Review', config);
    this.requireSignoff = config.requireSignoff !== false;
    this.assignmentStrategy = config.assignmentStrategy || 'auto';
    this.defaultReviewer = config.defaultReviewer || '@architect';
    this.checklistConfig = config.checklist || {};
    this.signoffConfig = config.signoff || {};
    this.checklistGenerator = new ChecklistGenerator(this.checklistConfig);
  }

  /**
   * Execute Layer 3 review setup
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} Layer results
   */
  async execute(context = {}) {
    this.reset();
    this.startTimer();

    const { verbose = false, storyId: _storyId = null } = context;

    if (!this.enabled) {
      this.addResult({
        check: 'layer3',
        pass: true,
        skipped: true,
        message: 'Layer 3 disabled',
      });
      this.stopTimer();
      return this.getSummary();
    }

    if (verbose) {
      console.log('\n👤 Layer 3: Human Review');
      console.log('━'.repeat(50));
    }

    // Generate review checklist
    const checklistResult = await this.generateChecklist(context);
    this.addResult(checklistResult);

    // Assign reviewer
    const assignmentResult = await this.assignReviewer(context);
    this.addResult(assignmentResult);

    // Check for existing sign-off
    const signoffResult = await this.checkSignoff(context);
    this.addResult(signoffResult);

    this.stopTimer();

    if (verbose) {
      const summary = this.getSummary();
      const icon = signoffResult.signedOff ? '✅' : '⏳';
      console.log(`\n${icon} Layer 3 ${signoffResult.signedOff ? 'SIGNED OFF' : 'PENDING'} (${this.formatDuration(summary.duration)})`);
    }

    return this.getSummary();
  }

  /**
   * Generate strategic review checklist
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} Checklist result
   */
  async generateChecklist(context = {}) {
    const { verbose = false, storyId = null, changedFiles = [] } = context;

    if (verbose) {
      console.log('  📋 Generating review checklist...');
    }

    try {
      const checklist = await this.checklistGenerator.generate({
        storyId,
        changedFiles,
        layers: context.previousLayers || [],
      });

      const result = {
        check: 'checklist',
        pass: true,
        items: checklist.items.length,
        checklist,
        message: `Checklist generated (${checklist.items.length} items)`,
      };

      if (verbose) {
        console.log(`  ✓ Checklist: ${checklist.items.length} items generated`);
        checklist.items.slice(0, 3).forEach((item) => {
          console.log(`    • ${item.text}`);
        });
        if (checklist.items.length > 3) {
          console.log(`    ... and ${checklist.items.length - 3} more`);
        }
      }

      return result;
    } catch (error) {
      return {
        check: 'checklist',
        pass: false,
        error: error.message,
        message: `Checklist error: ${error.message}`,
      };
    }
  }

  /**
   * Assign a reviewer based on strategy
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} Assignment result
   */
  async assignReviewer(context = {}) {
    const { verbose = false, changedFiles = [] } = context;

    if (verbose) {
      console.log('  👤 Assigning reviewer...');
    }

    try {
      let reviewer;

      switch (this.assignmentStrategy) {
        case 'auto':
          reviewer = await this.autoAssignReviewer(changedFiles);
          break;
        case 'round-robin':
          reviewer = await this.roundRobinAssign();
          break;
        case 'manual':
        default:
          reviewer = this.defaultReviewer;
      }

      const result = {
        check: 'assignment',
        pass: true,
        reviewer,
        strategy: this.assignmentStrategy,
        message: `Assigned to ${reviewer}`,
      };

      if (verbose) {
        console.log(`  ✓ Assigned to: ${reviewer}`);
      }

      return result;
    } catch (error) {
      return {
        check: 'assignment',
        pass: true, // Don't block on assignment errors
        reviewer: this.defaultReviewer,
        error: error.message,
        message: `Defaulted to ${this.defaultReviewer}: ${error.message}`,
      };
    }
  }

  /**
   * Auto-assign reviewer based on changed files
   * @param {Array} changedFiles - List of changed files
   * @returns {Promise<string>} Assigned reviewer
   */
  async autoAssignReviewer(changedFiles = []) {
    // Mapping of file patterns to reviewers
    const reviewerMapping = {
      'docs/architecture/': '@architect',
      'docs/stories/': '@sm',
      'docs/prd/': '@po',
      '.aiox-core/agents/': '@aiox-master',
      '.aiox-core/core/': '@architect',
      'tests/': '@qa',
      'src/': '@dev',
      '.github/': '@devops',
    };

    // Count matches for each reviewer
    const reviewerScores = {};

    changedFiles.forEach((file) => {
      Object.entries(reviewerMapping).forEach(([pattern, reviewer]) => {
        if (file.includes(pattern.replace(/\//g, path.sep)) || file.includes(pattern)) {
          reviewerScores[reviewer] = (reviewerScores[reviewer] || 0) + 1;
        }
      });
    });

    // Return reviewer with highest score, or default
    const sorted = Object.entries(reviewerScores).sort((a, b) => b[1] - a[1]);
    return sorted.length > 0 ? sorted[0][0] : this.defaultReviewer;
  }

  /**
   * Round-robin reviewer assignment
   * @returns {Promise<string>} Assigned reviewer
   */
  async roundRobinAssign() {
    const reviewers = ['@architect', '@qa', '@dev', '@sm'];
    const statusPath = '.aiox/qa-status.json';

    try {
      const status = JSON.parse(await fs.readFile(statusPath, 'utf8'));
      const lastIndex = status.lastReviewerIndex || 0;
      const nextIndex = (lastIndex + 1) % reviewers.length;

      // Update status
      status.lastReviewerIndex = nextIndex;
      await fs.writeFile(statusPath, JSON.stringify(status, null, 2));

      return reviewers[nextIndex];
    } catch {
      return reviewers[0];
    }
  }

  /**
   * Check for existing sign-off
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} Sign-off status
   */
  async checkSignoff(context = {}) {
    const { verbose = false, storyId = null } = context;

    if (verbose) {
      console.log('  ✍️ Checking sign-off status...');
    }

    try {
      const statusPath = '.aiox/qa-status.json';
      let status = {};

      try {
        status = JSON.parse(await fs.readFile(statusPath, 'utf8'));
      } catch {
        // No status file yet
      }

      const signoff = status.signoffs?.[storyId];

      if (signoff) {
        // Check if sign-off has expired
        const expiry = this.signoffConfig.expiry || 86400000; // 24 hours
        const isExpired = Date.now() - signoff.timestamp > expiry;

        if (!isExpired) {
          if (verbose) {
            console.log(`  ✓ Signed off by ${signoff.reviewer} at ${new Date(signoff.timestamp).toLocaleString()}`);
          }

          return {
            check: 'signoff',
            pass: true,
            signedOff: true,
            reviewer: signoff.reviewer,
            timestamp: signoff.timestamp,
            message: `Signed off by ${signoff.reviewer}`,
          };
        }
      }

      if (verbose) {
        console.log('  ⏳ Awaiting sign-off');
      }

      return {
        check: 'signoff',
        pass: !this.requireSignoff, // Pass if sign-off not required
        signedOff: false,
        required: this.requireSignoff,
        message: this.requireSignoff ? 'Awaiting sign-off' : 'Sign-off optional',
      };
    } catch (error) {
      return {
        check: 'signoff',
        pass: !this.requireSignoff,
        signedOff: false,
        error: error.message,
        message: `Sign-off check error: ${error.message}`,
      };
    }
  }

  /**
   * Record a sign-off
   * @param {string} storyId - Story identifier
   * @param {string} reviewer - Reviewer who signed off
   * @returns {Promise<Object>} Sign-off result
   */
  async recordSignoff(storyId, reviewer) {
    const statusPath = '.aiox/qa-status.json';
    let status = {};

    try {
      status = JSON.parse(await fs.readFile(statusPath, 'utf8'));
    } catch {
      // Create new status file
    }

    if (!status.signoffs) {
      status.signoffs = {};
    }

    status.signoffs[storyId] = {
      reviewer,
      timestamp: Date.now(),
    };

    await fs.mkdir(path.dirname(statusPath), { recursive: true });
    await fs.writeFile(statusPath, JSON.stringify(status, null, 2));

    return {
      success: true,
      storyId,
      reviewer,
      timestamp: status.signoffs[storyId].timestamp,
    };
  }
}

module.exports = { Layer3HumanReview };
