/**
 * Context Manager - Persists workflow state between phases
 *
 * DETERMINISTIC: All operations use file system operations (fs-extra),
 * no AI involvement in state management.
 *
 * Responsibilities:
 * - Save phase outputs to JSON files
 * - Provide context to subsequent phases
 * - Track workflow execution state
 * - Enable workflow resume from any phase
 *
 * @module core/orchestration/context-manager
 * @version 1.0.0
 */

const fs = require('fs-extra');
const path = require('path');

/**
 * Manages workflow execution context and state persistence
 */
class ContextManager {
  /**
   * @param {string} workflowId - Unique workflow identifier
   * @param {string} projectRoot - Project root directory
   */
  constructor(workflowId, projectRoot) {
    this.workflowId = workflowId;
    this.projectRoot = projectRoot;

    // State file path
    this.stateDir = path.join(projectRoot, '.aios', 'workflow-state');
    this.statePath = path.join(this.stateDir, `${workflowId}.json`);
    this.handoffDir = path.join(this.stateDir, 'handoffs');
    this.confidenceDir = path.join(this.stateDir, 'confidence');

    // In-memory cache
    this._stateCache = null;
  }

  /**
   * Ensure state directory exists
   * DETERMINISTIC: Pure fs operation
   */
  async ensureStateDir() {
    await fs.ensureDir(this.stateDir);
    await fs.ensureDir(this.handoffDir);
    await fs.ensureDir(this.confidenceDir);
  }

  /**
   * Initialize or load existing workflow state
   * @returns {Promise<Object>} Current state
   */
  async initialize() {
    await this.ensureStateDir();

    if (await fs.pathExists(this.statePath)) {
      this._stateCache = await fs.readJson(this.statePath);
    } else {
      this._stateCache = this._createInitialState();
      await this._saveState();
    }

    return this._stateCache;
  }

  /**
   * Create initial state structure
   * @private
   */
  _createInitialState() {
    return {
      workflowId: this.workflowId,
      status: 'initialized',
      startedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      currentPhase: 0,
      phases: {},
      metadata: {
        projectRoot: this.projectRoot,
        delivery_confidence: null,
      },
    };
  }

  /**
   * Load state from disk (or cache)
   * @returns {Promise<Object>} Current state
   */
  async loadState() {
    if (this._stateCache) {
      return this._stateCache;
    }

    if (await fs.pathExists(this.statePath)) {
      this._stateCache = await fs.readJson(this.statePath);
      return this._stateCache;
    }

    return this._createInitialState();
  }

  /**
   * Save state to disk
   * DETERMINISTIC: Pure fs operation
   * @private
   */
  async _saveState() {
    await this.ensureStateDir();
    this._stateCache.updatedAt = new Date().toISOString();
    await fs.writeJson(this.statePath, this._stateCache, { spaces: 2 });
  }

  /**
   * Save phase output and update state
   * @param {number} phaseNum - Phase number
   * @param {Object} output - Phase output data
   */
  async savePhaseOutput(phaseNum, output, options = {}) {
    const state = await this.loadState();
    const completedAt = new Date().toISOString();
    state.currentPhase = phaseNum;
    state.status = 'in_progress';
    const handoff = this._buildHandoffPackage(phaseNum, output, state, options, completedAt);

    state.phases[phaseNum] = {
      ...output,
      completedAt,
      handoff,
    };
    state.metadata = state.metadata || {};
    state.metadata.delivery_confidence = this._calculateDeliveryConfidence(state);

    this._stateCache = state;
    await this._saveState();
    await this._saveHandoffFile(handoff);
    await this._saveConfidenceFile(state.metadata.delivery_confidence);
  }

  /**
   * Get context for a specific phase
   * Includes outputs from all previous phases
   * @param {number} phaseNum - Target phase number
   * @returns {Promise<Object>} Context for the phase
   */
  async getContextForPhase(phaseNum) {
    const state = await this.loadState();

    // Collect outputs from all previous phases
    const previousPhases = {};
    for (let i = 1; i < phaseNum; i++) {
      if (state.phases[i]) {
        previousPhases[i] = state.phases[i];
      }
    }

    const previousHandoffs = {};
    for (const [phaseId, phaseData] of Object.entries(previousPhases)) {
      if (phaseData && phaseData.handoff) {
        previousHandoffs[phaseId] = phaseData.handoff;
      }
    }

    return {
      workflowId: this.workflowId,
      currentPhase: phaseNum,
      previousPhases,
      previousHandoffs,
      metadata: state.metadata,
    };
  }

  /**
   * Get all previous phase outputs
   * @returns {Object} Map of phase number to output
   */
  getPreviousPhaseOutputs() {
    if (!this._stateCache) {
      return {};
    }
    return this._stateCache.phases || {};
  }

  /**
   * Get output from a specific phase
   * @param {number} phaseNum - Phase number
   * @returns {Object|null} Phase output or null
   */
  getPhaseOutput(phaseNum) {
    const outputs = this.getPreviousPhaseOutputs();
    return outputs[phaseNum] || null;
  }

  /**
   * Mark workflow as completed
   */
  async markCompleted() {
    const state = await this.loadState();
    state.status = 'completed';
    state.completedAt = new Date().toISOString();
    this._stateCache = state;
    await this._saveState();
  }

  /**
   * Mark workflow as failed
   * @param {string} error - Error message
   * @param {number} failedPhase - Phase that failed
   */
  async markFailed(error, failedPhase) {
    const state = await this.loadState();
    state.status = 'failed';
    state.error = error;
    state.failedPhase = failedPhase;
    state.failedAt = new Date().toISOString();
    this._stateCache = state;
    await this._saveState();
  }

  /**
   * Update workflow metadata
   * @param {Object} metadata - Metadata to merge
   */
  async updateMetadata(metadata) {
    const state = await this.loadState();
    state.metadata = { ...state.metadata, ...metadata };
    this._stateCache = state;
    await this._saveState();
  }

  /**
   * Get the last completed phase number
   * @returns {number} Last completed phase number (0 if none)
   */
  getLastCompletedPhase() {
    const phases = this.getPreviousPhaseOutputs();
    const phaseNums = Object.keys(phases).map(Number);
    return phaseNums.length > 0 ? Math.max(...phaseNums) : 0;
  }

  /**
   * Check if a specific phase was completed
   * @param {number} phaseNum - Phase number
   * @returns {boolean} True if phase was completed
   */
  isPhaseCompleted(phaseNum) {
    const output = this.getPhaseOutput(phaseNum);
    return output !== null && output.completedAt !== undefined;
  }

  /**
   * Get workflow execution summary
   * @returns {Object} Execution summary
   */
  getSummary() {
    const state = this._stateCache || this._createInitialState();
    const phases = Object.keys(state.phases || {}).map(Number);

    return {
      workflowId: state.workflowId,
      status: state.status,
      startedAt: state.startedAt,
      completedAt: state.completedAt,
      currentPhase: state.currentPhase,
      completedPhases: phases,
      totalPhases: phases.length,
      deliveryConfidence: state.metadata?.delivery_confidence || null,
    };
  }

  /**
   * Get latest delivery confidence score metadata.
   * @returns {Object|null} Confidence payload
   */
  getDeliveryConfidence() {
    return this._stateCache?.metadata?.delivery_confidence || null;
  }

  /**
   * Build standardized handoff package for inter-agent transfer.
   * @private
   */
  _buildHandoffPackage(phaseNum, output, state, options, completedAt) {
    const handoffTarget = options.handoffTarget || {};
    const decision = this._extractDecisionLog(output);
    const evidence = this._extractEvidenceLinks(output);
    const risks = this._extractOpenRisks(output);

    return {
      version: '1.0.0',
      workflow_id: this.workflowId,
      generated_at: completedAt,
      from: {
        phase: phaseNum,
        agent: output.agent || null,
        action: output.action || null,
        task: output.task || null,
      },
      to: {
        phase: handoffTarget.phase || null,
        agent: handoffTarget.agent || null,
      },
      context_snapshot: {
        workflow_status: state.status,
        current_phase: state.currentPhase,
        metadata: state.metadata || {},
      },
      decision_log: decision,
      evidence_links: evidence,
      open_risks: risks,
    };
  }

  /**
   * Persist handoff package as a dedicated artifact.
   * @private
   */
  async _saveHandoffFile(handoff) {
    const phase = handoff?.from?.phase || 'unknown';
    const filePath = path.join(this.handoffDir, `${this.workflowId}-phase-${phase}.handoff.json`);
    await fs.ensureDir(this.handoffDir);
    await fs.writeJson(filePath, handoff, { spaces: 2 });
  }

  /**
   * Persist confidence score as a dedicated artifact.
   * @private
   */
  async _saveConfidenceFile(confidence) {
    if (!confidence) return;
    const filePath = path.join(this.confidenceDir, `${this.workflowId}.delivery-confidence.json`);
    await fs.ensureDir(this.confidenceDir);
    await fs.writeJson(filePath, confidence, { spaces: 2 });
  }

  /**
   * @private
   */
  _extractDecisionLog(output = {}) {
    const result = output.result || {};
    const entries = Array.isArray(result.decisions)
      ? result.decisions
      : Array.isArray(result.decision_log)
        ? result.decision_log
        : [];
    const sourcePaths = [];

    if (result.decisionLogPath) sourcePaths.push(result.decisionLogPath);
    if (result.decision_log_path) sourcePaths.push(result.decision_log_path);

    return {
      entries,
      source_paths: sourcePaths,
      count: entries.length,
    };
  }

  /**
   * @private
   */
  _extractEvidenceLinks(output = {}) {
    const evidence = [];
    const result = output.result || {};
    const validation = output.validation || {};

    if (Array.isArray(result.evidence_links)) {
      evidence.push(...result.evidence_links);
    }

    if (Array.isArray(validation.checks)) {
      for (const check of validation.checks) {
        if (check.path) evidence.push(check.path);
        if (check.checklist) evidence.push(check.checklist);
      }
    }

    return [...new Set(evidence)];
  }

  /**
   * @private
   */
  _extractOpenRisks(output = {}) {
    const result = output.result || {};
    const risks = [];

    if (Array.isArray(result.open_risks)) {
      risks.push(...result.open_risks);
    }
    if (Array.isArray(result.risks)) {
      risks.push(...result.risks);
    }
    if (Array.isArray(result.risk_register)) {
      risks.push(...result.risk_register);
    }

    return risks;
  }

  /**
   * Compute delivery confidence score from workflow state.
   * @private
   */
  _calculateDeliveryConfidence(state) {
    const phases = Object.values(state.phases || {});
    const weights = {
      test_coverage: 0.25,
      ac_completion: 0.30,
      risk_score_inv: 0.20,
      debt_score_inv: 0.15,
      regression_clear: 0.10,
    };
    const components = {
      test_coverage: this._calculateTestCoverage(phases),
      ac_completion: this._calculateAcCompletion(phases),
      risk_score_inv: this._calculateRiskInverseScore(phases),
      debt_score_inv: this._calculateDebtInverseScore(phases),
      regression_clear: this._calculateRegressionClear(phases),
    };

    const scoreBase = Object.keys(weights).reduce(
      (acc, key) => acc + (components[key] || 0) * weights[key],
      0,
    );
    const score = Number((scoreBase * 100).toFixed(2));
    const threshold = this._resolveConfidenceThreshold();

    return {
      version: '1.0.0',
      calculated_at: new Date().toISOString(),
      score,
      threshold,
      gate_passed: score >= threshold,
      formula: {
        expression:
          'confidence = (test_coverage*0.25 + ac_completion*0.30 + risk_score_inv*0.20 + debt_score_inv*0.15 + regression_clear*0.10) * 100',
        weights,
      },
      components,
      phase_count: phases.length,
    };
  }

  /**
   * @private
   */
  _resolveConfidenceThreshold() {
    const raw = process.env.AIOS_DELIVERY_CONFIDENCE_THRESHOLD;
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : 70;
  }

  /**
   * @private
   */
  _calculateTestCoverage(phases) {
    let totalChecks = 0;
    let passedChecks = 0;

    for (const phase of phases) {
      const checks = phase?.validation?.checks;
      if (!Array.isArray(checks)) continue;
      for (const check of checks) {
        totalChecks += 1;
        if (check?.passed === true) passedChecks += 1;
      }
    }

    if (totalChecks === 0) {
      return phases.length > 0 ? 1 : 0;
    }

    return passedChecks / totalChecks;
  }

  /**
   * @private
   */
  _calculateAcCompletion(phases) {
    let total = 0;
    let done = 0;
    let hasExplicitData = false;

    for (const phase of phases) {
      const result = phase?.result || {};
      if (Number.isFinite(result.ac_total) && Number.isFinite(result.ac_completed)) {
        hasExplicitData = true;
        total += Math.max(0, result.ac_total);
        done += Math.min(Math.max(0, result.ac_completed), Math.max(0, result.ac_total));
      } else if (Array.isArray(result.acceptance_criteria)) {
        hasExplicitData = true;
        total += result.acceptance_criteria.length;
        done += result.acceptance_criteria.filter((item) => item?.done || item?.status === 'done').length;
      }
    }

    if (hasExplicitData && total > 0) {
      return done / total;
    }

    if (phases.length === 0) {
      return 0;
    }

    const successful = phases.filter((phase) => phase?.result?.status !== 'failed').length;
    return successful / phases.length;
  }

  /**
   * @private
   */
  _calculateRiskInverseScore(phases) {
    const totalRisks = phases.reduce((sum, phase) => {
      const handoffRisks = Array.isArray(phase?.handoff?.open_risks) ? phase.handoff.open_risks.length : 0;
      const resultRisks = this._extractOpenRisks(phase).length;
      return sum + Math.max(handoffRisks, resultRisks);
    }, 0);

    return Math.max(0, 1 - totalRisks / 10);
  }

  /**
   * @private
   */
  _calculateDebtInverseScore(phases) {
    const totalDebt = phases.reduce((sum, phase) => {
      const result = phase?.result || {};
      const explicitCount = Number.isFinite(result.technical_debt_count)
        ? result.technical_debt_count
        : Number.isFinite(result.debt_count)
          ? result.debt_count
          : 0;
      const listCount = [
        result.technical_debt,
        result.debt_items,
        result.todos,
        result.hacks,
      ].reduce((listSum, list) => listSum + (Array.isArray(list) ? list.length : 0), 0);
      return sum + explicitCount + listCount;
    }, 0);

    return Math.max(0, 1 - totalDebt / 10);
  }

  /**
   * @private
   */
  _calculateRegressionClear(phases) {
    let totalRegressionChecks = 0;
    let passedRegressionChecks = 0;

    for (const phase of phases) {
      const checks = phase?.validation?.checks;
      if (!Array.isArray(checks)) continue;

      for (const check of checks) {
        const type = String(check?.type || '').toLowerCase();
        const pathValue = String(check?.path || '').toLowerCase();
        const checklist = String(check?.checklist || '').toLowerCase();
        const isRegression = type.includes('regression')
          || pathValue.includes('regression')
          || checklist.includes('regression');

        if (!isRegression) continue;
        totalRegressionChecks += 1;
        if (check?.passed === true) {
          passedRegressionChecks += 1;
        }
      }
    }

    if (totalRegressionChecks === 0) {
      return this._calculateTestCoverage(phases);
    }

    return passedRegressionChecks / totalRegressionChecks;
  }

  /**
   * Reset workflow state (for re-execution)
   * @param {boolean} keepMetadata - Whether to preserve metadata
   */
  async reset(keepMetadata = true) {
    // Preserve metadata if requested, defaulting to empty object if cache is null
    const savedMetadata = keepMetadata ? (this._stateCache?.metadata ?? {}) : {};
    this._stateCache = this._createInitialState();
    // Merge saved metadata with default metadata from _createInitialState
    this._stateCache.metadata = {
      ...this._stateCache.metadata,
      ...savedMetadata,
    };
    await this._saveState();
  }

  /**
   * Export state for external use
   * @returns {Object} Complete state object
   */
  exportState() {
    return { ...this._stateCache };
  }

  /**
   * Import state from external source
   * @param {Object} state - State to import
   */
  async importState(state) {
    this._stateCache = state;
    await this._saveState();
  }
}

module.exports = ContextManager;
