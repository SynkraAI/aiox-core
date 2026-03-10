/**
 * Predictive Pipeline
 *
 * Predicts task outcomes BEFORE execution using historical data patterns.
 * Estimates success probability, expected duration, resource needs, and
 * potential failure points based on weighted k-NN with feature similarity.
 *
 * Pipeline stages: preprocess → match → predict → score → recommend
 *
 * @module core/execution/predictive-pipeline
 * @version 1.0.0
 */

const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');

// ═══════════════════════════════════════════════════════════════════════════════
//                              CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Pipeline stage names in execution order
 */
const PipelineStage = {
  PREPROCESS: 'preprocess',
  MATCH: 'match',
  PREDICT: 'predict',
  SCORE: 'score',
  RECOMMEND: 'recommend',
};

/**
 * Risk level thresholds
 */
const RiskLevel = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};

/**
 * Default configuration values
 */
const DEFAULTS = {
  kNeighbors: 5,
  minSamplesForPrediction: 3,
  anomalyThreshold: 0.3,
  ewmaAlpha: 0.3,
  highRiskThreshold: 0.6,
  maxOutcomes: 10000,
  confidenceSampleCap: 20,
};

// ═══════════════════════════════════════════════════════════════════════════════
//                              PIPELINE
// ═══════════════════════════════════════════════════════════════════════════════

class PredictivePipeline extends EventEmitter {
  /**
   * @param {string} projectRoot - Root directory for persistence
   * @param {Object} [options] - Configuration options
   * @param {number} [options.kNeighbors=5] - Number of neighbors for k-NN
   * @param {number} [options.minSamplesForPrediction=3] - Minimum outcomes for prediction
   * @param {number} [options.anomalyThreshold=0.3] - Max similarity for anomaly detection
   * @param {number} [options.ewmaAlpha=0.3] - EWMA smoothing factor (0-1)
   * @param {number} [options.highRiskThreshold=0.6] - Risk score above which high-risk is emitted
   * @param {number} [options.maxOutcomes=10000] - Maximum stored outcomes before auto-prune
   */
  constructor(projectRoot, options = {}) {
    super();

    this.projectRoot = projectRoot ?? process.cwd();
    this.kNeighbors = options.kNeighbors ?? DEFAULTS.kNeighbors;
    this.minSamplesForPrediction = options.minSamplesForPrediction ?? DEFAULTS.minSamplesForPrediction;
    this.anomalyThreshold = options.anomalyThreshold ?? DEFAULTS.anomalyThreshold;
    this.ewmaAlpha = options.ewmaAlpha ?? DEFAULTS.ewmaAlpha;
    this.highRiskThreshold = options.highRiskThreshold ?? DEFAULTS.highRiskThreshold;
    this.maxOutcomes = options.maxOutcomes ?? DEFAULTS.maxOutcomes;
    this.confidenceSampleCap = options.confidenceSampleCap ?? DEFAULTS.confidenceSampleCap;

    // Persistence paths
    this._dataDir = path.join(this.projectRoot, '.aiox', 'predictions');
    this._outcomesPath = path.join(this._dataDir, 'outcomes.json');
    this._modelPath = path.join(this._dataDir, 'model.json');

    // In-memory state
    this._outcomes = [];
    this._model = this._emptyModel();
    this._loaded = false;

    // Serialized write chain
    this._writeChain = Promise.resolve();

    // Stage metrics
    this._stageMetrics = {};
    for (const stage of Object.values(PipelineStage)) {
      this._stageMetrics[stage] = { calls: 0, totalMs: 0, errors: 0 };
    }

    // Global stats
    this._stats = {
      predictions: 0,
      outcomesRecorded: 0,
      anomaliesDetected: 0,
      retrains: 0,
    };
  }

  // ═════════════════════════════════════════════════════════════════════════════
  //                          DATA LOADING
  // ═════════════════════════════════════════════════════════════════════════════

  /**
   * Ensure data is loaded from disk (lazy, idempotent)
   * @private
   */
  _ensureLoaded() {
    if (this._loaded) return;
    this._loadSync();
    this._loaded = true;
  }

  /**
   * Load outcomes and model from disk synchronously
   * @private
   */
  _loadSync() {
    try {
      if (fs.existsSync(this._outcomesPath)) {
        const raw = fs.readFileSync(this._outcomesPath, 'utf8');
        const parsed = JSON.parse(raw);
        this._outcomes = Array.isArray(parsed) ? parsed : [];
      }
    } catch {
      this._outcomes = [];
    }

    try {
      if (fs.existsSync(this._modelPath)) {
        const raw = fs.readFileSync(this._modelPath, 'utf8');
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          this._model = { ...this._emptyModel(), ...parsed };
        }
      }
    } catch {
      this._model = this._emptyModel();
    }
  }

  /**
   * @private
   * @returns {Object} Empty model structure
   */
  _emptyModel() {
    return {
      taskTypeStats: {},
      agentStats: {},
      strategyStats: {},
      lastRetrain: null,
      version: 1,
    };
  }

  // ═════════════════════════════════════════════════════════════════════════════
  //                          PERSISTENCE
  // ═════════════════════════════════════════════════════════════════════════════

  /**
   * Serialize a write operation through the write chain
   * @private
   * @param {Function} writeFn - Async function that performs the write
   * @returns {Promise<void>}
   */
  _enqueueWrite(writeFn) {
    this._writeChain = this._writeChain.then(() => writeFn()).catch((err) => {
      this._emitSafeError({ type: 'persistence', error: err });
      throw err;
    });
    return this._writeChain;
  }

  /**
   * Persist outcomes to disk
   * @private
   * @returns {Promise<void>}
   */
  _persistOutcomes() {
    return this._enqueueWrite(async () => {
      this._ensureDataDir();
      fs.writeFileSync(this._outcomesPath, JSON.stringify(this._outcomes, null, 2));
    });
  }

  /**
   * Persist model to disk
   * @private
   * @returns {Promise<void>}
   */
  _persistModel() {
    return this._enqueueWrite(async () => {
      this._ensureDataDir();
      fs.writeFileSync(this._modelPath, JSON.stringify(this._model, null, 2));
    });
  }

  /**
   * Ensure the data directory exists
   * @private
   */
  _ensureDataDir() {
    if (!fs.existsSync(this._dataDir)) {
      fs.mkdirSync(this._dataDir, { recursive: true });
    }
  }

  // ═════════════════════════════════════════════════════════════════════════════
  //                          SAFE ERROR EMIT
  // ═════════════════════════════════════════════════════════════════════════════

  /**
   * Emit error event only when listeners are present.
   * Avoids unhandled EventEmitter 'error' exceptions.
   * @private
   * @param {Object} payload
   */
  _emitSafeError(payload) {
    if (this.listenerCount('error') > 0) {
      this.emit('error', payload);
      return;
    }
    // Silently degrade — no listeners attached
  }

  // ═════════════════════════════════════════════════════════════════════════════
  //                          DEEP CLONE
  // ═════════════════════════════════════════════════════════════════════════════

  /**
   * Deep clone with structuredClone, JSON fallback
   * @private
   * @param {*} obj
   * @returns {*}
   */
  _deepClone(obj) {
    try {
      return structuredClone(obj);
    } catch {
      return JSON.parse(JSON.stringify(obj));
    }
  }

  // ═════════════════════════════════════════════════════════════════════════════
  //                          RECORD OUTCOMES
  // ═════════════════════════════════════════════════════════════════════════════

  /**
   * Record the actual outcome of a task for future predictions
   * @param {Object} outcome - Outcome data
   * @param {string} outcome.taskType - Type of task executed
   * @param {string} [outcome.agent] - Agent that executed the task
   * @param {string} [outcome.strategy] - Strategy used
   * @param {number} outcome.duration - Execution duration in ms
   * @param {boolean} outcome.success - Whether the task succeeded
   * @param {number} [outcome.complexity] - Task complexity (1-10)
   * @param {number} [outcome.contextSize] - Size of context provided
   * @param {Object} [outcome.resources] - Resources consumed (memory, cpu, apiCalls)
   * @param {Object} [outcome.metadata] - Additional metadata
   * @returns {Promise<Object>} The stored outcome record
   */
  async recordOutcome(outcome) {
    this._ensureLoaded();

    if (!outcome || !outcome.taskType) {
      throw new Error('outcome.taskType is required');
    }
    if (typeof outcome.duration !== 'number' || outcome.duration < 0) {
      throw new Error('outcome.duration must be a non-negative number');
    }
    if (typeof outcome.success !== 'boolean') {
      throw new Error('outcome.success must be a boolean');
    }

    const record = {
      id: this._generateId(),
      taskType: outcome.taskType,
      agent: outcome.agent ?? null,
      strategy: outcome.strategy ?? null,
      duration: outcome.duration,
      success: outcome.success,
      complexity: outcome.complexity ?? 5,
      contextSize: outcome.contextSize ?? 0,
      resources: outcome.resources ?? null,
      metadata: outcome.metadata ?? null,
      timestamp: Date.now(),
    };

    this._outcomes.push(record);
    this._stats.outcomesRecorded++;

    // Update model stats
    this._updateModelStats(record);

    // Auto-prune if exceeding max
    if (this._outcomes.length > this.maxOutcomes) {
      const excess = this._outcomes.length - this.maxOutcomes;
      this._outcomes.splice(0, excess);
      this._recalculateModelStats();
    }

    await this._persistOutcomes();
    await this._persistModel();

    this.emit('outcome-recorded', { id: record.id, taskType: record.taskType });

    return this._deepClone(record);
  }

  /**
   * Update aggregated model statistics from a new outcome
   * @private
   * @param {Object} record
   */
  _updateModelStats(record) {
    // Task type stats
    if (!this._model.taskTypeStats[record.taskType]) {
      this._model.taskTypeStats[record.taskType] = {
        count: 0, successes: 0, totalDuration: 0, durations: [],
      };
    }
    const ts = this._model.taskTypeStats[record.taskType];
    ts.count++;
    if (record.success) ts.successes++;
    ts.totalDuration += record.duration;
    ts.durations.push(record.duration);
    // Keep only last 100 durations for memory
    if (ts.durations.length > 100) ts.durations.shift();

    // Agent stats
    if (record.agent) {
      if (!this._model.agentStats[record.agent]) {
        this._model.agentStats[record.agent] = { count: 0, successes: 0, totalDuration: 0 };
      }
      const as = this._model.agentStats[record.agent];
      as.count++;
      if (record.success) as.successes++;
      as.totalDuration += record.duration;
    }

    // Strategy stats
    if (record.strategy) {
      if (!this._model.strategyStats[record.strategy]) {
        this._model.strategyStats[record.strategy] = { count: 0, successes: 0, totalDuration: 0 };
      }
      const ss = this._model.strategyStats[record.strategy];
      ss.count++;
      if (record.success) ss.successes++;
      ss.totalDuration += record.duration;
    }
  }

  // ═════════════════════════════════════════════════════════════════════════════
  /**
   * Recalculate all model stats from current outcomes.
   * Called after splice/prune to keep stats consistent.
   * @private
   */
  _recalculateModelStats() {
    this._model.taskTypeStats = {};
    this._model.agentStats = {};
    this._model.strategyStats = {};
    for (const outcome of this._outcomes) {
      this._updateModelStats(outcome);
    }
  }

  //                          FEATURE VECTORS
  // ═════════════════════════════════════════════════════════════════════════════

  /**
   * Extract a feature vector from a task spec or outcome
   * @private
   * @param {Object} task
   * @returns {Object} Feature vector
   */
  _extractFeatures(task) {
    const complexity = Number(task.complexity);
    const contextSize = Number(task.contextSize);
    const agentExperience = this._getAgentExperience(task.agent);
    return {
      taskType: task.taskType ?? 'unknown',
      complexity: Number.isFinite(complexity) ? complexity : 5,
      agentExperience: Number.isFinite(agentExperience) ? agentExperience : 0,
      contextSize: Number.isFinite(contextSize) ? contextSize : 0,
    };
  }

  /**
   * Get the number of past outcomes for an agent
   * @private
   * @param {string|null} agent
   * @returns {number}
   */
  _getAgentExperience(agent) {
    if (!agent) return 0;
    return this._model.agentStats[agent]?.count ?? 0;
  }

  /**
   * Compute similarity between two feature vectors.
   * Uses exact match for categorical (taskType) and cosine-like
   * similarity for numeric features.
   * @private
   * @param {Object} a - Feature vector
   * @param {Object} b - Feature vector
   * @returns {number} Similarity score in [0, 1]
   */
  _computeSimilarity(a, b) {
    // Categorical: taskType exact match contributes 0.4 weight
    const typeMatch = a.taskType === b.taskType ? 1.0 : 0.0;

    // Numeric features: normalized distance → similarity
    const numericA = [a.complexity, a.agentExperience, a.contextSize];
    const numericB = [b.complexity, b.agentExperience, b.contextSize];

    const cosineSim = this._cosineSimilarity(numericA, numericB);

    // Weighted combination: 40% categorical, 60% numeric
    return 0.4 * typeMatch + 0.6 * cosineSim;
  }

  /**
   * Cosine similarity between two numeric vectors
   * @private
   * @param {number[]} a
   * @param {number[]} b
   * @returns {number} Similarity in [0, 1]
   */
  _cosineSimilarity(a, b) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);

    if (normA === 0 || normB === 0) return 0;

    return dotProduct / (normA * normB);
  }

  // ═════════════════════════════════════════════════════════════════════════════
  //                          PIPELINE STAGES
  // ═════════════════════════════════════════════════════════════════════════════

  /**
   * Execute a pipeline stage with timing
   * @private
   * @param {string} stageName
   * @param {Function} fn
   * @returns {*} Stage result
   */
  _runStage(stageName, fn) {
    const start = Date.now();
    try {
      const result = fn();
      this._stageMetrics[stageName].calls++;
      this._stageMetrics[stageName].totalMs += Date.now() - start;
      return result;
    } catch (err) {
      this._stageMetrics[stageName].errors++;
      this._stageMetrics[stageName].totalMs += Date.now() - start;
      throw err;
    }
  }

  /**
   * Stage 1: Preprocess — extract and validate features
   * @private
   * @param {Object} taskSpec
   * @returns {Object} Preprocessed features
   */
  _stagePreprocess(taskSpec) {
    return this._runStage(PipelineStage.PREPROCESS, () => {
      if (!taskSpec || !taskSpec.taskType) {
        throw new Error('taskSpec.taskType is required for prediction');
      }
      return this._extractFeatures(taskSpec);
    });
  }

  /**
   * Stage 2: Match — find k nearest neighbors
   * @private
   * @param {Object} features
   * @returns {Object[]} Nearest neighbors with similarity scores
   */
  _stageMatch(features) {
    return this._runStage(PipelineStage.MATCH, () => {
      const scored = this._outcomes.map((outcome) => {
        const outFeatures = this._extractFeatures(outcome);
        const similarity = this._computeSimilarity(features, outFeatures);
        return { outcome, similarity };
      });

      // Sort by similarity descending
      scored.sort((a, b) => b.similarity - a.similarity);

      return scored.slice(0, this.kNeighbors);
    });
  }

  /**
   * Stage 3: Predict — compute predictions from matched neighbors
   * @private
   * @param {Object[]} neighbors - k nearest neighbors
   * @param {Object} features - Original features
   * @returns {Object} Raw predictions
   */
  _stagePredict(neighbors, features) {
    return this._runStage(PipelineStage.PREDICT, () => {
      if (neighbors.length < (this.minSamplesForPrediction || 3)) {
        return this._defaultPrediction(features);
      }

      // Weighted success probability
      let weightSum = 0;
      let successWeight = 0;
      let durationEwma = 0;
      let durationValues = [];
      let resourceEstimates = { memory: 0, cpu: 0, apiCalls: 0 };
      let resourceCount = 0;

      for (const { outcome, similarity } of neighbors) {
        const weight = similarity;
        weightSum += weight;
        if (outcome.success) successWeight += weight;

        durationValues.push(outcome.duration);

        if (outcome.resources) {
          resourceEstimates.memory += (outcome.resources.memory ?? 0) * weight;
          resourceEstimates.cpu += (outcome.resources.cpu ?? 0) * weight;
          resourceEstimates.apiCalls += (outcome.resources.apiCalls ?? 0) * weight;
          resourceCount += weight;
        }
      }

      const successProbability = weightSum > 0 ? successWeight / weightSum : 0.5;

      // EWMA for duration
      durationEwma = this._computeEwma(durationValues.reverse());

      // Normalize resources
      if (resourceCount > 0) {
        resourceEstimates.memory /= resourceCount;
        resourceEstimates.cpu /= resourceCount;
        resourceEstimates.apiCalls /= resourceCount;
      }

      return {
        successProbability,
        estimatedDuration: Math.round(durationEwma),
        resources: resourceEstimates,
        sampleSize: neighbors.length,
        avgSimilarity: weightSum / neighbors.length,
      };
    });
  }

  /**
   * Stage 4: Score — compute confidence and detect anomalies
   * @private
   * @param {Object} prediction - Raw predictions
   * @param {Object[]} neighbors - k nearest neighbors
   * @param {Object} features - Original features
   * @returns {Object} Scored prediction
   */
  _stageScore(prediction, neighbors, features) {
    return this._runStage(PipelineStage.SCORE, () => {
      const durations = neighbors.map((n) => n.outcome.duration);
      const cv = this._coefficientOfVariation(durations);

      // Confidence: min(sampleSize / cap, 1.0) * (1 - cv)
      const sampleFactor = Math.min(prediction.sampleSize / this.confidenceSampleCap, 1.0);
      const varianceFactor = Math.max(1 - cv, 0);
      const confidence = sampleFactor * varianceFactor;

      // Anomaly detection
      const isAnomaly = prediction.avgSimilarity < this.anomalyThreshold;
      if (isAnomaly) {
        this._stats.anomaliesDetected++;
        this.emit('anomaly-detected', {
          taskType: features.taskType,
          avgSimilarity: prediction.avgSimilarity,
        });
      }

      return {
        ...prediction,
        confidence: Math.round(confidence * 1000) / 1000,
        coefficientOfVariation: Math.round(cv * 1000) / 1000,
        isAnomaly,
      };
    });
  }

  /**
   * Stage 5: Recommend — suggest agent and strategy
   * @private
   * @param {Object} scored - Scored prediction
   * @param {Object} features - Original features
   * @returns {Object} Final prediction with recommendations
   */
  _stageRecommend(scored, features) {
    return this._runStage(PipelineStage.RECOMMEND, () => {
      const agentRec = this._findBestAgent(features.taskType);
      const strategyRec = this._findBestStrategy(features.taskType);

      return {
        ...scored,
        recommendedAgent: agentRec,
        recommendedStrategy: strategyRec,
      };
    });
  }

  // ═════════════════════════════════════════════════════════════════════════════
  //                          PUBLIC API
  // ═════════════════════════════════════════════════════════════════════════════

  /**
   * Predict the outcome of a task before execution
   * @param {Object} taskSpec - Task specification
   * @param {string} taskSpec.taskType - Type of task
   * @param {number} [taskSpec.complexity] - Task complexity (1-10)
   * @param {string} [taskSpec.agent] - Agent to execute
   * @param {number} [taskSpec.contextSize] - Size of context
   * @returns {Object} Prediction result
   */
  predict(taskSpec) {
    this._ensureLoaded();

    const features = this._stagePreprocess(taskSpec);
    const neighbors = this._stageMatch(features);
    const raw = this._stagePredict(neighbors, features);
    const scored = this._stageScore(raw, neighbors, features);
    const final = this._stageRecommend(scored, features);

    this._stats.predictions++;

    const result = {
      taskType: features.taskType,
      ...final,
      riskLevel: this._computeRiskLevel(final),
      timestamp: Date.now(),
    };

    this.emit('prediction', result);

    // Emit high-risk event
    if (this._riskScore(final) >= this.highRiskThreshold) {
      this.emit('high-risk-detected', result);
    }

    return result;
  }

  /**
   * Predict outcomes for multiple tasks in batch
   * @param {Object[]} taskSpecs - Array of task specifications
   * @returns {Object[]} Array of prediction results
   */
  predictBatch(taskSpecs) {
    if (!Array.isArray(taskSpecs)) {
      throw new Error('taskSpecs must be an array');
    }
    return taskSpecs.map((spec) => this.predict(spec));
  }

  /**
   * Find tasks similar to the given specification
   * @param {Object} taskSpec - Task specification
   * @param {Object} [opts] - Options
   * @param {number} [opts.limit=10] - Maximum results to return
   * @param {number} [opts.minSimilarity=0] - Minimum similarity threshold
   * @returns {Object[]} Similar tasks with similarity scores
   */
  findSimilarTasks(taskSpec, opts = {}) {
    this._ensureLoaded();

    const limit = opts.limit ?? 10;
    const minSimilarity = opts.minSimilarity ?? 0;
    const features = this._extractFeatures(taskSpec);

    const scored = this._outcomes.map((outcome) => {
      const outFeatures = this._extractFeatures(outcome);
      const similarity = this._computeSimilarity(features, outFeatures);
      return { ...this._deepClone(outcome), similarity };
    });

    return scored
      .filter((s) => s.similarity >= minSimilarity)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  }

  /**
   * Get the strength of a pattern for a given task type
   * @param {string} taskType - The task type to query
   * @returns {Object} Pattern strength info
   */
  getPatternStrength(taskType) {
    this._ensureLoaded();

    const stats = this._model.taskTypeStats[taskType];
    if (!stats) {
      return { taskType, sampleSize: 0, strength: 0, successRate: 0, avgDuration: 0 };
    }

    const cv = this._coefficientOfVariation(stats.durations);
    const sampleFactor = Math.min(stats.count / this.confidenceSampleCap, 1.0);
    const strength = sampleFactor * Math.max(1 - cv, 0);

    return {
      taskType,
      sampleSize: stats.count,
      strength: Math.round(strength * 1000) / 1000,
      successRate: stats.count > 0 ? Math.round((stats.successes / stats.count) * 1000) / 1000 : 0,
      avgDuration: stats.count > 0 ? Math.round(stats.totalDuration / stats.count) : 0,
    };
  }

  /**
   * Assess the risk of executing a task
   * @param {Object} taskSpec - Task specification
   * @returns {Object} Risk assessment
   */
  assessRisk(taskSpec) {
    this._ensureLoaded();

    const features = this._extractFeatures(taskSpec);
    const neighbors = this._stageMatch(features);
    const factors = [];

    // Factor 1: Low sample size
    const typeStats = this._model.taskTypeStats[features.taskType];
    const sampleSize = typeStats?.count ?? 0;
    if (sampleSize < this.minSamplesForPrediction) {
      factors.push({
        factor: 'low-sample-size',
        description: `Only ${sampleSize} historical outcomes for task type "${features.taskType}"`,
        severity: sampleSize === 0 ? 'high' : 'medium',
      });
    }

    // Factor 2: High variance
    if (typeStats && typeStats.durations.length >= 2) {
      const cv = this._coefficientOfVariation(typeStats.durations);
      if (cv > 0.5) {
        factors.push({
          factor: 'high-variance',
          description: `Duration coefficient of variation is ${(cv * 100).toFixed(1)}%`,
          severity: cv > 1.0 ? 'high' : 'medium',
        });
      }
    }

    // Factor 3: New task type
    if (!typeStats) {
      factors.push({
        factor: 'new-task-type',
        description: `Task type "${features.taskType}" has no historical data`,
        severity: 'high',
      });
    }

    // Factor 4: Low success rate
    if (typeStats && typeStats.count >= this.minSamplesForPrediction) {
      const successRate = typeStats.successes / typeStats.count;
      if (successRate < 0.5) {
        factors.push({
          factor: 'low-success-rate',
          description: `Historical success rate is ${(successRate * 100).toFixed(1)}%`,
          severity: successRate < 0.25 ? 'high' : 'medium',
        });
      }
    }

    // Factor 5: Low similarity to known tasks (anomaly)
    if (neighbors.length > 0) {
      const avgSim = neighbors.reduce((s, n) => s + n.similarity, 0) / neighbors.length;
      if (avgSim < this.anomalyThreshold) {
        factors.push({
          factor: 'anomaly',
          description: `Task has low similarity (${(avgSim * 100).toFixed(1)}%) to known patterns`,
          severity: 'high',
        });
      }
    }

    // Factor 6: Overloaded agent
    if (taskSpec.agent) {
      const agentStats = this._model.agentStats[taskSpec.agent];
      if (agentStats && agentStats.count > 0) {
        const agentSuccessRate = agentStats.successes / agentStats.count;
        if (agentSuccessRate < 0.5) {
          factors.push({
            factor: 'agent-low-success',
            description: `Agent "${taskSpec.agent}" has ${(agentSuccessRate * 100).toFixed(1)}% success rate`,
            severity: 'medium',
          });
        }
      }
    }

    const riskScore = this._computeRiskScoreFromFactors(factors);
    const riskLevel = this._riskLevelFromScore(riskScore);

    return {
      taskType: features.taskType,
      riskScore: Math.round(riskScore * 1000) / 1000,
      riskLevel,
      factors,
      mitigations: this._suggestMitigations(factors),
    };
  }

  /**
   * Recommend the best agent for a task type
   * @param {Object} taskSpec - Task specification
   * @returns {Object} Agent recommendation
   */
  recommendAgent(taskSpec) {
    this._ensureLoaded();

    if (!taskSpec || !taskSpec.taskType) {
      throw new Error('taskSpec.taskType is required');
    }

    const best = this._findBestAgent(taskSpec.taskType);
    return {
      taskType: taskSpec.taskType,
      recommendation: best,
    };
  }

  /**
   * Recommend the best strategy for a task type
   * @param {Object} taskSpec - Task specification
   * @returns {Object} Strategy recommendation
   */
  recommendStrategy(taskSpec) {
    this._ensureLoaded();

    if (!taskSpec || !taskSpec.taskType) {
      throw new Error('taskSpec.taskType is required');
    }

    const best = this._findBestStrategy(taskSpec.taskType);
    return {
      taskType: taskSpec.taskType,
      recommendation: best,
    };
  }

  /**
   * Get the pipeline stages in order
   * @returns {string[]} Ordered stage names
   */
  getPipelineStages() {
    return Object.values(PipelineStage);
  }

  /**
   * Get metrics for a specific pipeline stage
   * @param {string} stageName - Stage name
   * @returns {Object|null} Stage metrics or null if not found
   */
  getStageMetrics(stageName) {
    const metrics = this._stageMetrics[stageName];
    if (!metrics) return null;

    return {
      stage: stageName,
      calls: metrics.calls,
      totalMs: metrics.totalMs,
      avgMs: metrics.calls > 0 ? Math.round(metrics.totalMs / metrics.calls * 100) / 100 : 0,
      errors: metrics.errors,
    };
  }

  /**
   * Get overall model accuracy based on recorded outcomes
   * @returns {Object} Model accuracy info
   */
  getModelAccuracy() {
    this._ensureLoaded();

    const totalTasks = Object.values(this._model.taskTypeStats).reduce((s, t) => s + t.count, 0);
    const totalSuccesses = Object.values(this._model.taskTypeStats).reduce((s, t) => s + t.successes, 0);

    const perType = {};
    for (const [type, stats] of Object.entries(this._model.taskTypeStats)) {
      perType[type] = {
        count: stats.count,
        successRate: stats.count > 0 ? Math.round((stats.successes / stats.count) * 1000) / 1000 : 0,
        avgDuration: stats.count > 0 ? Math.round(stats.totalDuration / stats.count) : 0,
      };
    }

    return {
      totalOutcomes: totalTasks,
      overallSuccessRate: totalTasks > 0 ? Math.round((totalSuccesses / totalTasks) * 1000) / 1000 : 0,
      perTaskType: perType,
      lastRetrain: this._model.lastRetrain,
      retrains: this._stats.retrains,
    };
  }

  /**
   * Retrain the model by recalculating all statistics from outcomes
   * @returns {Promise<Object>} Retrain result
   */
  async retrain() {
    this._ensureLoaded();

    // Reset model
    this._model = this._emptyModel();

    // Rebuild from outcomes
    for (const outcome of this._outcomes) {
      this._updateModelStats(outcome);
    }

    this._model.lastRetrain = Date.now();
    this._model.version++;
    this._stats.retrains++;

    await this._persistModel();

    this.emit('model-retrained', {
      version: this._model.version,
      outcomeCount: this._outcomes.length,
      taskTypes: Object.keys(this._model.taskTypeStats).length,
    });

    return {
      version: this._model.version,
      outcomeCount: this._outcomes.length,
      taskTypes: Object.keys(this._model.taskTypeStats).length,
    };
  }

  /**
   * Prune old outcomes
   * @param {Object} [options] - Prune options
   * @param {number} [options.olderThan] - Remove outcomes older than this timestamp
   * @returns {Promise<Object>} Prune result
   */
  async prune(options = {}) {
    this._ensureLoaded();

    const before = this._outcomes.length;

    if (options.olderThan) {
      this._outcomes = this._outcomes.filter((o) => o.timestamp >= options.olderThan);
    }

    const removed = before - this._outcomes.length;

    if (removed > 0) {
      // Retrain after pruning
      this._model = this._emptyModel();
      for (const outcome of this._outcomes) {
        this._updateModelStats(outcome);
      }
      this._model.lastRetrain = Date.now();

      await this._persistOutcomes();
      await this._persistModel();
    }

    return { removed, remaining: this._outcomes.length };
  }

  /**
   * Get general statistics
   * @returns {Object} Stats summary
   */
  getStats() {
    this._ensureLoaded();

    return {
      outcomes: this._outcomes.length,
      taskTypes: Object.keys(this._model.taskTypeStats).length,
      agents: Object.keys(this._model.agentStats).length,
      strategies: Object.keys(this._model.strategyStats).length,
      predictions: this._stats.predictions,
      outcomesRecorded: this._stats.outcomesRecorded,
      anomaliesDetected: this._stats.anomaliesDetected,
      retrains: this._stats.retrains,
      modelVersion: this._model.version,
    };
  }

  // ═════════════════════════════════════════════════════════════════════════════
  //                          HELPERS
  // ═════════════════════════════════════════════════════════════════════════════

  /**
   * Compute EWMA (Exponentially Weighted Moving Average) from values
   * @private
   * @param {number[]} values
   * @returns {number}
   */
  _computeEwma(values) {
    if (values.length === 0) return 0;
    if (values.length === 1) return values[0];

    let ewma = values[0];
    for (let i = 1; i < values.length; i++) {
      ewma = this.ewmaAlpha * values[i] + (1 - this.ewmaAlpha) * ewma;
    }
    return ewma;
  }

  /**
   * Compute coefficient of variation (stddev / mean)
   * @private
   * @param {number[]} values
   * @returns {number}
   */
  _coefficientOfVariation(values) {
    if (values.length < 2) return 0;

    const mean = values.reduce((s, v) => s + v, 0) / values.length;
    if (mean === 0) return 0;

    const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length;
    const stddev = Math.sqrt(variance);

    return stddev / Math.abs(mean);
  }

  /**
   * Default prediction when no matching outcomes exist
   * @private
   * @param {Object} features
   * @returns {Object}
   */
  _defaultPrediction(features) {
    return {
      successProbability: 0.5,
      estimatedDuration: 0,
      resources: { memory: 0, cpu: 0, apiCalls: 0 },
      sampleSize: 0,
      avgSimilarity: 0,
    };
  }

  /**
   * Compute a numeric risk score from prediction data
   * @private
   * @param {Object} prediction
   * @returns {number} Risk score in [0, 1]
   */
  _riskScore(prediction) {
    let score = 0;

    // Low success probability
    score += (1 - prediction.successProbability) * 0.4;

    // Low confidence
    score += (1 - (prediction.confidence ?? 0)) * 0.3;

    // Anomaly
    if (prediction.isAnomaly) score += 0.2;

    // High variance
    score += Math.min((prediction.coefficientOfVariation ?? 0), 1) * 0.1;

    return Math.min(score, 1.0);
  }

  /**
   * Compute risk level from prediction
   * @private
   * @param {Object} prediction
   * @returns {string} Risk level
   */
  _computeRiskLevel(prediction) {
    const score = this._riskScore(prediction);
    return this._riskLevelFromScore(score);
  }

  /**
   * Map a numeric score to a risk level
   * @private
   * @param {number} score
   * @returns {string}
   */
  _riskLevelFromScore(score) {
    if (score >= 0.8) return RiskLevel.CRITICAL;
    if (score >= 0.6) return RiskLevel.HIGH;
    if (score >= 0.3) return RiskLevel.MEDIUM;
    return RiskLevel.LOW;
  }

  /**
   * Compute risk score from risk factors array
   * @private
   * @param {Object[]} factors
   * @returns {number}
   */
  _computeRiskScoreFromFactors(factors) {
    if (factors.length === 0) return 0;

    let score = 0;
    for (const f of factors) {
      if (f.severity === 'high') score += 0.25;
      else if (f.severity === 'medium') score += 0.15;
      else score += 0.05;
    }

    return Math.min(score, 1.0);
  }

  /**
   * Find the best agent for a task type (highest success rate with enough samples)
   * @private
   * @param {string} taskType
   * @returns {Object|null} Agent recommendation or null
   */
  _findBestAgent(taskType) {
    const agentPerformance = {};

    for (const outcome of this._outcomes) {
      if (outcome.taskType !== taskType || !outcome.agent) continue;

      if (!agentPerformance[outcome.agent]) {
        agentPerformance[outcome.agent] = { count: 0, successes: 0, totalDuration: 0 };
      }
      const ap = agentPerformance[outcome.agent];
      ap.count++;
      if (outcome.success) ap.successes++;
      ap.totalDuration += outcome.duration;
    }

    let best = null;
    let bestScore = -1;

    for (const [agent, perf] of Object.entries(agentPerformance)) {
      if (perf.count < this.minSamplesForPrediction) continue;

      const successRate = perf.successes / perf.count;
      // Score: success rate weighted by sample confidence
      const sampleConfidence = Math.min(perf.count / this.confidenceSampleCap, 1.0);
      const score = successRate * sampleConfidence;

      if (score > bestScore) {
        bestScore = score;
        best = {
          agent,
          successRate: Math.round(successRate * 1000) / 1000,
          sampleSize: perf.count,
          avgDuration: Math.round(perf.totalDuration / perf.count),
          score: Math.round(score * 1000) / 1000,
        };
      }
    }

    return best;
  }

  /**
   * Find the best strategy for a task type
   * @private
   * @param {string} taskType
   * @returns {Object|null} Strategy recommendation or null
   */
  _findBestStrategy(taskType) {
    const stratPerformance = {};

    for (const outcome of this._outcomes) {
      if (outcome.taskType !== taskType || !outcome.strategy) continue;

      if (!stratPerformance[outcome.strategy]) {
        stratPerformance[outcome.strategy] = { count: 0, successes: 0, totalDuration: 0 };
      }
      const sp = stratPerformance[outcome.strategy];
      sp.count++;
      if (outcome.success) sp.successes++;
      sp.totalDuration += outcome.duration;
    }

    let best = null;
    let bestScore = -1;

    for (const [strategy, perf] of Object.entries(stratPerformance)) {
      if (perf.count < this.minSamplesForPrediction) continue;

      const successRate = perf.successes / perf.count;
      const sampleConfidence = Math.min(perf.count / this.confidenceSampleCap, 1.0);
      const score = successRate * sampleConfidence;

      if (score > bestScore) {
        bestScore = score;
        best = {
          strategy,
          successRate: Math.round(successRate * 1000) / 1000,
          sampleSize: perf.count,
          avgDuration: Math.round(perf.totalDuration / perf.count),
          score: Math.round(score * 1000) / 1000,
        };
      }
    }

    return best;
  }

  /**
   * Suggest mitigations for risk factors
   * @private
   * @param {Object[]} factors
   * @returns {string[]}
   */
  _suggestMitigations(factors) {
    const mitigations = [];

    for (const f of factors) {
      switch (f.factor) {
        case 'low-sample-size':
          mitigations.push('Run a pilot execution to gather baseline data');
          break;
        case 'high-variance':
          mitigations.push('Break task into smaller, more predictable sub-tasks');
          break;
        case 'new-task-type':
          mitigations.push('Start with a dry-run or sandbox execution');
          break;
        case 'low-success-rate':
          mitigations.push('Review historical failures and adjust strategy before execution');
          break;
        case 'anomaly':
          mitigations.push('Manual review recommended — task does not match known patterns');
          break;
        case 'agent-low-success':
          mitigations.push('Consider using a different agent with higher success rate');
          break;
        default:
          mitigations.push('Monitor execution closely');
      }
    }

    return mitigations;
  }

  /**
   * Generate a unique ID
   * @private
   * @returns {string}
   */
  _generateId() {
    const ts = Date.now().toString(36);
    const rand = Math.random().toString(36).substring(2, 8);
    return `pred_${ts}_${rand}`;
  }
}

module.exports = PredictivePipeline;
module.exports.PredictivePipeline = PredictivePipeline;
module.exports.PipelineStage = PipelineStage;
module.exports.RiskLevel = RiskLevel;
module.exports.DEFAULTS = DEFAULTS;
