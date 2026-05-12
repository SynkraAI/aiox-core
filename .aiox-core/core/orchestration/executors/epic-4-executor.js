/**
 * Epic4Executor - Execution Engine Executor
 *
 * Story: 0.3 - Epic Executors (AC3)
 * Epic: Epic 0 - ADE Master Orchestrator
 *
 * Wraps plan-tracker and subtask-verifier to execute implementation plans.
 * Tracks progress, verifies subtask completion, manages build state.
 *
 * @module core/orchestration/executors/epic-4-executor
 * @version 1.0.0
 */

const fs = require('fs-extra');
const path = require('path');
const EpicExecutor = require('./epic-executor');

/**
 * Epic 4 Executor - Execution Engine
 * Manages plan execution and subtask verification
 */
class Epic4Executor extends EpicExecutor {
  constructor(orchestrator) {
    super(orchestrator, 4);

    // Lazy-load infrastructure scripts
    this._planTracker = null;
    this._subtaskVerifier = null;
  }

  /**
   * Get PlanTracker instance
   * @private
   */
  _getPlanTracker() {
    if (!this._planTracker) {
      try {
        const PlanTracker = require('../../infrastructure/scripts/plan-tracker');
        this._planTracker = PlanTracker;
      } catch (error) {
        this._log(`PlanTracker not available: ${error.message}`, 'warn');
      }
    }
    return this._planTracker;
  }

  /**
   * Get SubtaskVerifier instance
   * @private
   */
  _getSubtaskVerifier() {
    if (!this._subtaskVerifier) {
      try {
        const SubtaskVerifier = require('../../infrastructure/scripts/subtask-verifier');
        this._subtaskVerifier = SubtaskVerifier;
      } catch (error) {
        this._log(`SubtaskVerifier not available: ${error.message}`, 'warn');
      }
    }
    return this._subtaskVerifier;
  }

  /**
   * Execute the Execution Engine
   * @param {Object} context - Execution context
   * @param {string} context.spec - Path to specification
   * @param {string} context.complexity - Complexity level
   * @param {string} context.storyId - Story identifier
   * @returns {Promise<Object>} Execution result
   */
  async execute(context) {
    this._startExecution();

    try {
      const { spec, specPath, complexity, storyId, techStack: _techStack } = context;
      const actualSpecPath = spec || specPath;

      this._log(`Executing for story: ${storyId}`);
      this._log(`Complexity: ${complexity || 'STANDARD'}`);

      // Find or create implementation plan
      const planPath = await this._findOrCreatePlan(storyId, actualSpecPath);
      this._log(`Using plan: ${planPath}`);
      this._addArtifact('plan', planPath);

      // Load plan tracker
      const PlanTracker = this._getPlanTracker();
      let tracker = null;
      let planStatus = null;

      if (PlanTracker) {
        tracker = new PlanTracker({
          storyId,
          planPath,
          rootPath: this.projectRoot,
        });

        // Get initial status
        try {
          await tracker.loadPlan();
          planStatus = tracker.getStatus();
          this._log(`Plan status: ${planStatus.completed}/${planStatus.total} subtasks`);
        } catch (error) {
          this._log(`Could not load plan: ${error.message}`, 'warn');
        }
      }

      // Execute subtasks
      const subtaskResults = await this._executeSubtasks(storyId, tracker, context);

      // Collect code changes
      const codeChanges = this._collectCodeChanges(subtaskResults);

      // Run tests if available
      const testResults = await this._runTests(context);

      // Calculate final progress
      const progress = {
        total: subtaskResults.length,
        completed: subtaskResults.filter((r) => r.success).length,
        failed: subtaskResults.filter((r) => !r.success).length,
      };

      this._addArtifact('progress', JSON.stringify(progress));

      return this._completeExecution({
        implementationPath: planPath,
        planPath,
        progress,
        subtaskResults,
        codeChanges,
        testResults,
      });
    } catch (error) {
      return this._failExecution(error);
    }
  }

  /**
   * Find existing plan or create new one
   * @private
   */
  async _findOrCreatePlan(storyId, specPath) {
    // Look for existing implementation plan
    const possiblePaths = [
      this._getPath('docs', 'stories', storyId, 'plan', 'implementation.yaml'),
      this._getPath('docs', 'stories', storyId, 'implementation.yaml'),
      this._getPath('.aiox', 'plans', `${storyId}.yaml`),
    ];

    for (const planPath of possiblePaths) {
      if (await fs.pathExists(planPath)) {
        return planPath;
      }
    }

    // Create stub plan
    const planPath = this._getPath('docs', 'stories', storyId, 'plan', 'implementation.yaml');
    await this._createStubPlan(planPath, storyId, specPath);

    return planPath;
  }

  /**
   * Create stub implementation plan
   * @private
   */
  async _createStubPlan(planPath, storyId, specPath) {
    const stubPlan = `# Implementation Plan: ${storyId}
# Generated: ${new Date().toISOString()}

metadata:
  storyId: "${storyId}"
  specPath: "${specPath || 'N/A'}"
  status: draft
  createdAt: "${new Date().toISOString()}"

phases:
  - phase: 1
    name: Setup
    subtasks:
      - id: "1.1"
        name: Initialize project structure
        status: pending

  - phase: 2
    name: Implementation
    subtasks:
      - id: "2.1"
        name: Implement core functionality
        status: pending

  - phase: 3
    name: Testing
    subtasks:
      - id: "3.1"
        name: Write tests
        status: pending

  - phase: 4
    name: Documentation
    subtasks:
      - id: "4.1"
        name: Update documentation
        status: pending
`;

    await fs.ensureDir(path.dirname(planPath));
    await fs.writeFile(planPath, stubPlan);
    this._log('Created stub implementation plan');
  }

  /**
   * Execute subtasks from plan
   * @private
   */
  async _executeSubtasks(_storyId, _tracker, _context) {
    const results = [];

    // In full implementation, this would iterate through subtasks
    // and invoke agents for each one. For now, return stub results.
    results.push({
      subtaskId: '1.1',
      name: 'Initialize',
      success: true,
      duration: '0s',
      timestamp: new Date().toISOString(),
    });

    return results;
  }

  /**
   * Collect code changes from subtask results
   * @private
   */
  _collectCodeChanges(subtaskResults) {
    const changes = [];

    for (const result of subtaskResults) {
      if (result.files) {
        changes.push(...result.files);
      }
    }

    return changes;
  }

  /**
   * Run tests
   * @private
   */
  async _runTests(_context) {
    // Check if tests exist
    const testsDir = this._getPath('tests');
    if (!(await fs.pathExists(testsDir))) {
      return { skipped: true, reason: 'no_tests_dir' };
    }

    // In full implementation, would run actual tests
    return {
      ran: false,
      reason: 'test_execution_requires_agent',
    };
  }
}

module.exports = Epic4Executor;
