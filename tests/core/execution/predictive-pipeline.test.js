/**
 * Predictive Pipeline Tests
 *
 * Covers: outcome recording, prediction, batch prediction, similarity search,
 * pattern strength, risk assessment, agent/strategy recommendations,
 * pipeline stages, model accuracy, retrain, prune, persistence, events,
 * anomaly detection, confidence scoring, and edge cases.
 */

const fs = require('fs');
const path = require('path');
const {
  PredictivePipeline,
  PipelineStage,
  RiskLevel,
  DEFAULTS,
} = require('../../../.aiox-core/core/execution/predictive-pipeline');

// Helper: create a temporary directory
function makeTmpDir() {
  const dir = path.join(__dirname, `__tmp_pred_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

// Helper: remove directory recursively
function rmDir(dir) {
  try {
    fs.rmSync(dir, { recursive: true, force: true });
  } catch {
    // ignore
  }
}

// Helper: seed pipeline with outcomes
async function seedOutcomes(pipeline, count, overrides = {}) {
  const outcomes = [];
  for (let i = 0; i < count; i++) {
    const o = await pipeline.recordOutcome({
      taskType: overrides.taskType ?? 'build',
      agent: overrides.agent ?? 'agent-1',
      strategy: overrides.strategy ?? 'default',
      duration: overrides.duration ?? 1000 + i * 100,
      success: overrides.success ?? (i % 5 !== 0), // 80% success
      complexity: overrides.complexity ?? 5,
      contextSize: overrides.contextSize ?? 100,
      resources: overrides.resources ?? { memory: 256, cpu: 0.5, apiCalls: 3 },
      metadata: overrides.metadata ?? null,
    });
    outcomes.push(o);
  }
  return outcomes;
}

describe('PredictivePipeline', () => {
  let tmpDir;
  let pipeline;

  beforeEach(() => {
    tmpDir = makeTmpDir();
    pipeline = new PredictivePipeline(tmpDir);
  });

  afterEach(() => {
    rmDir(tmpDir);
  });

  // ═══════════════════════════════════════════════════════════════════════════
  //                          CONSTANTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Constants', () => {
    it('should export PipelineStage with all stages', () => {
      expect(PipelineStage.PREPROCESS).toBe('preprocess');
      expect(PipelineStage.MATCH).toBe('match');
      expect(PipelineStage.PREDICT).toBe('predict');
      expect(PipelineStage.SCORE).toBe('score');
      expect(PipelineStage.RECOMMEND).toBe('recommend');
    });

    it('should export RiskLevel with all levels', () => {
      expect(RiskLevel.LOW).toBe('low');
      expect(RiskLevel.MEDIUM).toBe('medium');
      expect(RiskLevel.HIGH).toBe('high');
      expect(RiskLevel.CRITICAL).toBe('critical');
    });

    it('should export DEFAULTS', () => {
      expect(DEFAULTS.kNeighbors).toBe(5);
      expect(DEFAULTS.minSamplesForPrediction).toBe(3);
      expect(DEFAULTS.anomalyThreshold).toBe(0.3);
      expect(DEFAULTS.ewmaAlpha).toBe(0.3);
      expect(DEFAULTS.highRiskThreshold).toBe(0.6);
      expect(DEFAULTS.maxOutcomes).toBe(10000);
      expect(DEFAULTS.confidenceSampleCap).toBe(20);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  //                          CONSTRUCTOR
  // ═══════════════════════════════════════════════════════════════════════════

  describe('constructor', () => {
    it('should create instance with defaults', () => {
      expect(pipeline).toBeInstanceOf(PredictivePipeline);
      expect(pipeline.kNeighbors).toBe(5);
      expect(pipeline.minSamplesForPrediction).toBe(3);
      expect(pipeline.anomalyThreshold).toBe(0.3);
      expect(pipeline.ewmaAlpha).toBe(0.3);
    });

    it('should extend EventEmitter', () => {
      const { EventEmitter } = require('events');
      expect(pipeline).toBeInstanceOf(EventEmitter);
    });

    it('should accept custom options with nullish coalescing', () => {
      const custom = new PredictivePipeline(tmpDir, {
        kNeighbors: 10,
        minSamplesForPrediction: 5,
        anomalyThreshold: 0.5,
        ewmaAlpha: 0.5,
        highRiskThreshold: 0.8,
        maxOutcomes: 500,
      });
      expect(custom.kNeighbors).toBe(10);
      expect(custom.minSamplesForPrediction).toBe(5);
      expect(custom.anomalyThreshold).toBe(0.5);
      expect(custom.ewmaAlpha).toBe(0.5);
      expect(custom.highRiskThreshold).toBe(0.8);
      expect(custom.maxOutcomes).toBe(500);
    });

    it('should handle 0 as a valid option value (not replaced by default)', () => {
      const custom = new PredictivePipeline(tmpDir, {
        kNeighbors: 0,
        anomalyThreshold: 0,
      });
      // nullish coalescing: 0 is NOT nullish, so it should be kept
      expect(custom.kNeighbors).toBe(0);
      expect(custom.anomalyThreshold).toBe(0);
    });

    it('should default projectRoot to cwd when null', () => {
      const p = new PredictivePipeline(null);
      expect(p.projectRoot).toBe(process.cwd());
    });

    it('should initialize empty stage metrics', () => {
      for (const stage of Object.values(PipelineStage)) {
        const m = pipeline.getStageMetrics(stage);
        expect(m.calls).toBe(0);
        expect(m.totalMs).toBe(0);
        expect(m.errors).toBe(0);
      }
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  //                          RECORD OUTCOME
  // ═══════════════════════════════════════════════════════════════════════════

  describe('recordOutcome', () => {
    it('should record a valid outcome', async () => {
      const result = await pipeline.recordOutcome({
        taskType: 'build',
        agent: 'agent-1',
        strategy: 'parallel',
        duration: 5000,
        success: true,
        complexity: 7,
        contextSize: 200,
        resources: { memory: 512, cpu: 0.8, apiCalls: 5 },
        metadata: { note: 'test' },
      });

      expect(result.id).toMatch(/^pred_/);
      expect(result.taskType).toBe('build');
      expect(result.agent).toBe('agent-1');
      expect(result.duration).toBe(5000);
      expect(result.success).toBe(true);
      expect(result.complexity).toBe(7);
      expect(result.timestamp).toBeGreaterThan(0);
    });

    it('should throw when taskType is missing', async () => {
      await expect(pipeline.recordOutcome({ duration: 100, success: true }))
        .rejects.toThrow('outcome.taskType is required');
    });

    it('should throw when duration is negative', async () => {
      await expect(pipeline.recordOutcome({ taskType: 'x', duration: -1, success: true }))
        .rejects.toThrow('outcome.duration must be a non-negative number');
    });

    it('should throw when duration is not a number', async () => {
      await expect(pipeline.recordOutcome({ taskType: 'x', duration: 'fast', success: true }))
        .rejects.toThrow('outcome.duration must be a non-negative number');
    });

    it('should throw when success is not a boolean', async () => {
      await expect(pipeline.recordOutcome({ taskType: 'x', duration: 100, success: 1 }))
        .rejects.toThrow('outcome.success must be a boolean');
    });

    it('should use defaults for optional fields', async () => {
      const result = await pipeline.recordOutcome({
        taskType: 'test',
        duration: 100,
        success: true,
      });

      expect(result.agent).toBeNull();
      expect(result.strategy).toBeNull();
      expect(result.complexity).toBe(5);
      expect(result.contextSize).toBe(0);
      expect(result.resources).toBeNull();
      expect(result.metadata).toBeNull();
    });

    it('should emit outcome-recorded event', async () => {
      const spy = jest.fn();
      pipeline.on('outcome-recorded', spy);

      await pipeline.recordOutcome({
        taskType: 'deploy',
        duration: 2000,
        success: true,
      });

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy.mock.calls[0][0].taskType).toBe('deploy');
    });

    it('should persist outcomes to disk', async () => {
      await pipeline.recordOutcome({
        taskType: 'build',
        duration: 1000,
        success: true,
      });

      const outcomesPath = path.join(tmpDir, '.aiox', 'predictions', 'outcomes.json');
      expect(fs.existsSync(outcomesPath)).toBe(true);

      const data = JSON.parse(fs.readFileSync(outcomesPath, 'utf8'));
      expect(data).toHaveLength(1);
      expect(data[0].taskType).toBe('build');
    });

    it('should auto-prune when exceeding maxOutcomes', async () => {
      const small = new PredictivePipeline(tmpDir, { maxOutcomes: 5 });

      for (let i = 0; i < 8; i++) {
        await small.recordOutcome({
          taskType: 'build',
          duration: 100 * (i + 1),
          success: true,
        });
      }

      const stats = small.getStats();
      expect(stats.outcomes).toBeLessThanOrEqual(5);
    });

    it('should accept duration of 0', async () => {
      const result = await pipeline.recordOutcome({
        taskType: 'noop',
        duration: 0,
        success: true,
      });
      expect(result.duration).toBe(0);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  //                          PREDICT
  // ═══════════════════════════════════════════════════════════════════════════

  describe('predict', () => {
    it('should return a prediction with all fields', async () => {
      await seedOutcomes(pipeline, 10);

      const result = pipeline.predict({ taskType: 'build', complexity: 5 });

      expect(result).toHaveProperty('taskType', 'build');
      expect(result).toHaveProperty('successProbability');
      expect(result).toHaveProperty('estimatedDuration');
      expect(result).toHaveProperty('resources');
      expect(result).toHaveProperty('confidence');
      expect(result).toHaveProperty('isAnomaly');
      expect(result).toHaveProperty('riskLevel');
      expect(result).toHaveProperty('recommendedAgent');
      expect(result).toHaveProperty('recommendedStrategy');
      expect(result).toHaveProperty('timestamp');
    });

    it('should throw when taskType is missing', () => {
      expect(() => pipeline.predict({})).toThrow('taskSpec.taskType is required');
    });

    it('should throw when taskSpec is null', () => {
      expect(() => pipeline.predict(null)).toThrow('taskSpec.taskType is required');
    });

    it('should return default prediction when no outcomes exist', () => {
      const result = pipeline.predict({ taskType: 'unknown' });

      expect(result.successProbability).toBe(0.5);
      expect(result.sampleSize).toBe(0);
      expect(result.estimatedDuration).toBe(0);
    });

    it('should emit prediction event', async () => {
      await seedOutcomes(pipeline, 5);

      const spy = jest.fn();
      pipeline.on('prediction', spy);

      pipeline.predict({ taskType: 'build' });

      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should emit high-risk-detected for risky tasks', () => {
      // No history → low confidence → potentially high risk
      const spy = jest.fn();
      pipeline.on('high-risk-detected', spy);

      // Predict with no history, anomaly threshold set low
      const p = new PredictivePipeline(tmpDir, { highRiskThreshold: 0.3 });
      p.on('high-risk-detected', spy);
      p.predict({ taskType: 'never-seen-before' });

      // Should have been called at least once (either from pipeline or p)
      expect(spy.mock.calls.length).toBeGreaterThanOrEqual(1);
    });

    it('should predict higher success rate for successful task types', async () => {
      // All successful
      for (let i = 0; i < 10; i++) {
        await pipeline.recordOutcome({
          taskType: 'easy-task',
          duration: 500,
          success: true,
          agent: 'agent-1',
          complexity: 3,
        });
      }

      // All failures
      for (let i = 0; i < 10; i++) {
        await pipeline.recordOutcome({
          taskType: 'hard-task',
          duration: 5000,
          success: false,
          agent: 'agent-1',
          complexity: 9,
        });
      }

      const easyPred = pipeline.predict({ taskType: 'easy-task', complexity: 3, agent: 'agent-1' });
      const hardPred = pipeline.predict({ taskType: 'hard-task', complexity: 9, agent: 'agent-1' });

      expect(easyPred.successProbability).toBeGreaterThan(hardPred.successProbability);
    });

    it('should increment predictions stat', async () => {
      await seedOutcomes(pipeline, 5);

      pipeline.predict({ taskType: 'build' });
      pipeline.predict({ taskType: 'build' });

      expect(pipeline.getStats().predictions).toBe(2);
    });

    it('should include risk level in prediction', async () => {
      await seedOutcomes(pipeline, 10);

      const result = pipeline.predict({ taskType: 'build' });

      expect([RiskLevel.LOW, RiskLevel.MEDIUM, RiskLevel.HIGH, RiskLevel.CRITICAL])
        .toContain(result.riskLevel);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  //                          PREDICT BATCH
  // ═══════════════════════════════════════════════════════════════════════════

  describe('predictBatch', () => {
    it('should predict for multiple tasks', async () => {
      await seedOutcomes(pipeline, 10);

      const results = pipeline.predictBatch([
        { taskType: 'build' },
        { taskType: 'deploy' },
        { taskType: 'test' },
      ]);

      expect(results).toHaveLength(3);
      expect(results[0].taskType).toBe('build');
      expect(results[1].taskType).toBe('deploy');
      expect(results[2].taskType).toBe('test');
    });

    it('should throw when input is not an array', () => {
      expect(() => pipeline.predictBatch('not-an-array')).toThrow('taskSpecs must be an array');
    });

    it('should return empty array for empty input', async () => {
      const results = pipeline.predictBatch([]);
      expect(results).toEqual([]);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  //                          FIND SIMILAR TASKS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('findSimilarTasks', () => {
    it('should find similar tasks ordered by similarity', async () => {
      await seedOutcomes(pipeline, 10);
      await seedOutcomes(pipeline, 5, { taskType: 'deploy', complexity: 8 });

      const similar = pipeline.findSimilarTasks({ taskType: 'build', complexity: 5 });

      expect(similar.length).toBeGreaterThan(0);
      // First result should be most similar
      if (similar.length > 1) {
        expect(similar[0].similarity).toBeGreaterThanOrEqual(similar[1].similarity);
      }
    });

    it('should respect limit option', async () => {
      await seedOutcomes(pipeline, 20);

      const similar = pipeline.findSimilarTasks({ taskType: 'build' }, { limit: 3 });

      expect(similar.length).toBeLessThanOrEqual(3);
    });

    it('should respect minSimilarity option', async () => {
      await seedOutcomes(pipeline, 10);

      const similar = pipeline.findSimilarTasks(
        { taskType: 'build' },
        { minSimilarity: 0.9 },
      );

      for (const s of similar) {
        expect(s.similarity).toBeGreaterThanOrEqual(0.9);
      }
    });

    it('should return empty when no outcomes exist', () => {
      const similar = pipeline.findSimilarTasks({ taskType: 'build' });
      expect(similar).toEqual([]);
    });

    it('should include similarity score in results', async () => {
      await seedOutcomes(pipeline, 5);

      const similar = pipeline.findSimilarTasks({ taskType: 'build' });

      for (const s of similar) {
        expect(typeof s.similarity).toBe('number');
        expect(s.similarity).toBeGreaterThanOrEqual(0);
        expect(s.similarity).toBeLessThanOrEqual(1);
      }
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  //                          PATTERN STRENGTH
  // ═══════════════════════════════════════════════════════════════════════════

  describe('getPatternStrength', () => {
    it('should return zero strength for unknown task type', () => {
      const result = pipeline.getPatternStrength('unknown');

      expect(result.taskType).toBe('unknown');
      expect(result.sampleSize).toBe(0);
      expect(result.strength).toBe(0);
      expect(result.successRate).toBe(0);
      expect(result.avgDuration).toBe(0);
    });

    it('should return correct stats for recorded task type', async () => {
      await seedOutcomes(pipeline, 10, { taskType: 'lint', duration: 500, success: true });

      const result = pipeline.getPatternStrength('lint');

      expect(result.taskType).toBe('lint');
      expect(result.sampleSize).toBe(10);
      expect(result.successRate).toBe(1.0);
      expect(result.avgDuration).toBe(500);
      expect(result.strength).toBeGreaterThan(0);
    });

    it('should increase strength with more samples', async () => {
      await seedOutcomes(pipeline, 3, { taskType: 'test', duration: 1000, success: true });
      const strengthSmall = pipeline.getPatternStrength('test').strength;

      await seedOutcomes(pipeline, 17, { taskType: 'test', duration: 1000, success: true });
      const strengthLarge = pipeline.getPatternStrength('test').strength;

      expect(strengthLarge).toBeGreaterThanOrEqual(strengthSmall);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  //                          RISK ASSESSMENT
  // ═══════════════════════════════════════════════════════════════════════════

  describe('assessRisk', () => {
    it('should identify risk for new task type', () => {
      const risk = pipeline.assessRisk({ taskType: 'brand-new' });

      expect(risk.taskType).toBe('brand-new');
      expect(risk.riskLevel).toBeTruthy();
      expect(risk.factors.length).toBeGreaterThan(0);
      expect(risk.factors.some((f) => f.factor === 'new-task-type')).toBe(true);
    });

    it('should identify low sample size risk', async () => {
      await pipeline.recordOutcome({ taskType: 'rare', duration: 100, success: true });

      const risk = pipeline.assessRisk({ taskType: 'rare' });

      expect(risk.factors.some((f) => f.factor === 'low-sample-size')).toBe(true);
    });

    it('should identify high variance risk', async () => {
      // Record outcomes with wildly varying durations
      for (let i = 0; i < 10; i++) {
        await pipeline.recordOutcome({
          taskType: 'volatile',
          duration: i % 2 === 0 ? 100 : 10000,
          success: true,
        });
      }

      const risk = pipeline.assessRisk({ taskType: 'volatile' });

      expect(risk.factors.some((f) => f.factor === 'high-variance')).toBe(true);
    });

    it('should identify low success rate risk', async () => {
      for (let i = 0; i < 10; i++) {
        await pipeline.recordOutcome({
          taskType: 'flaky',
          duration: 1000,
          success: i >= 8, // only 2/10 succeed
        });
      }

      const risk = pipeline.assessRisk({ taskType: 'flaky' });

      expect(risk.factors.some((f) => f.factor === 'low-success-rate')).toBe(true);
    });

    it('should include mitigations for each risk factor', async () => {
      const risk = pipeline.assessRisk({ taskType: 'brand-new' });

      expect(risk.mitigations.length).toBeGreaterThan(0);
      expect(risk.mitigations.length).toBe(risk.factors.length);
    });

    it('should return low risk for well-known successful task', async () => {
      await seedOutcomes(pipeline, 25, { taskType: 'stable', duration: 1000, success: true });

      const risk = pipeline.assessRisk({ taskType: 'stable' });

      expect(risk.riskScore).toBeLessThan(0.5);
    });

    it('should detect agent-low-success factor', async () => {
      for (let i = 0; i < 10; i++) {
        await pipeline.recordOutcome({
          taskType: 'task-a',
          agent: 'bad-agent',
          duration: 1000,
          success: false,
        });
      }

      const risk = pipeline.assessRisk({ taskType: 'task-a', agent: 'bad-agent' });

      expect(risk.factors.some((f) => f.factor === 'agent-low-success')).toBe(true);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  //                          RECOMMENDATIONS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('recommendAgent', () => {
    it('should recommend best agent for task type', async () => {
      // Agent A: high success
      for (let i = 0; i < 10; i++) {
        await pipeline.recordOutcome({
          taskType: 'compile',
          agent: 'agent-fast',
          duration: 500,
          success: true,
        });
      }
      // Agent B: low success
      for (let i = 0; i < 10; i++) {
        await pipeline.recordOutcome({
          taskType: 'compile',
          agent: 'agent-slow',
          duration: 3000,
          success: i > 7,
        });
      }

      const rec = pipeline.recommendAgent({ taskType: 'compile' });

      expect(rec.taskType).toBe('compile');
      expect(rec.recommendation).not.toBeNull();
      expect(rec.recommendation.agent).toBe('agent-fast');
    });

    it('should return null recommendation when no agents qualify', () => {
      const rec = pipeline.recommendAgent({ taskType: 'unknown-task' });

      expect(rec.recommendation).toBeNull();
    });

    it('should throw when taskType is missing', () => {
      expect(() => pipeline.recommendAgent({})).toThrow('taskSpec.taskType is required');
    });
  });

  describe('recommendStrategy', () => {
    it('should recommend best strategy for task type', async () => {
      for (let i = 0; i < 10; i++) {
        await pipeline.recordOutcome({
          taskType: 'build',
          strategy: 'parallel',
          duration: 500,
          success: true,
        });
      }
      for (let i = 0; i < 10; i++) {
        await pipeline.recordOutcome({
          taskType: 'build',
          strategy: 'sequential',
          duration: 2000,
          success: i > 5,
        });
      }

      const rec = pipeline.recommendStrategy({ taskType: 'build' });

      expect(rec.recommendation).not.toBeNull();
      expect(rec.recommendation.strategy).toBe('parallel');
    });

    it('should return null recommendation when no strategies qualify', () => {
      const rec = pipeline.recommendStrategy({ taskType: 'empty' });

      expect(rec.recommendation).toBeNull();
    });

    it('should throw when taskType is missing', () => {
      expect(() => pipeline.recommendStrategy({})).toThrow('taskSpec.taskType is required');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  //                          PIPELINE STAGES
  // ═══════════════════════════════════════════════════════════════════════════

  describe('getPipelineStages', () => {
    it('should return all 5 stages in order', () => {
      const stages = pipeline.getPipelineStages();

      expect(stages).toEqual([
        'preprocess', 'match', 'predict', 'score', 'recommend',
      ]);
    });
  });

  describe('getStageMetrics', () => {
    it('should return null for unknown stage', () => {
      expect(pipeline.getStageMetrics('nonexistent')).toBeNull();
    });

    it('should track stage calls after prediction', async () => {
      await seedOutcomes(pipeline, 5);
      pipeline.predict({ taskType: 'build' });

      for (const stage of Object.values(PipelineStage)) {
        const m = pipeline.getStageMetrics(stage);
        expect(m.calls).toBe(1);
        expect(m.avgMs).toBeGreaterThanOrEqual(0);
      }
    });

    it('should accumulate metrics across multiple predictions', async () => {
      await seedOutcomes(pipeline, 5);

      pipeline.predict({ taskType: 'build' });
      pipeline.predict({ taskType: 'build' });
      pipeline.predict({ taskType: 'build' });

      const m = pipeline.getStageMetrics(PipelineStage.PREPROCESS);
      expect(m.calls).toBe(3);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  //                          MODEL ACCURACY
  // ═══════════════════════════════════════════════════════════════════════════

  describe('getModelAccuracy', () => {
    it('should return empty accuracy when no outcomes', () => {
      const acc = pipeline.getModelAccuracy();

      expect(acc.totalOutcomes).toBe(0);
      expect(acc.overallSuccessRate).toBe(0);
      expect(Object.keys(acc.perTaskType)).toHaveLength(0);
    });

    it('should compute correct accuracy after outcomes', async () => {
      // 8 successes, 2 failures
      for (let i = 0; i < 10; i++) {
        await pipeline.recordOutcome({
          taskType: 'build',
          duration: 1000,
          success: i < 8,
        });
      }

      const acc = pipeline.getModelAccuracy();

      expect(acc.totalOutcomes).toBe(10);
      expect(acc.overallSuccessRate).toBe(0.8);
      expect(acc.perTaskType.build.count).toBe(10);
      expect(acc.perTaskType.build.successRate).toBe(0.8);
    });

    it('should report per-task-type accuracy', async () => {
      await seedOutcomes(pipeline, 5, { taskType: 'build', success: true });
      await seedOutcomes(pipeline, 5, { taskType: 'deploy', success: false });

      const acc = pipeline.getModelAccuracy();

      expect(acc.perTaskType.build.successRate).toBe(1.0);
      expect(acc.perTaskType.deploy.successRate).toBe(0);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  //                          RETRAIN
  // ═══════════════════════════════════════════════════════════════════════════

  describe('retrain', () => {
    it('should rebuild model from outcomes', async () => {
      await seedOutcomes(pipeline, 10);

      const result = await pipeline.retrain();

      expect(result.version).toBe(2);
      expect(result.outcomeCount).toBe(10);
      expect(result.taskTypes).toBe(1);
    });

    it('should emit model-retrained event', async () => {
      await seedOutcomes(pipeline, 5);

      const spy = jest.fn();
      pipeline.on('model-retrained', spy);

      await pipeline.retrain();

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy.mock.calls[0][0].version).toBe(2);
    });

    it('should increment retrains stat', async () => {
      await seedOutcomes(pipeline, 5);

      await pipeline.retrain();
      await pipeline.retrain();

      expect(pipeline.getStats().retrains).toBe(2);
    });

    it('should persist retrained model', async () => {
      await seedOutcomes(pipeline, 5);
      await pipeline.retrain();

      const modelPath = path.join(tmpDir, '.aiox', 'predictions', 'model.json');
      expect(fs.existsSync(modelPath)).toBe(true);

      const model = JSON.parse(fs.readFileSync(modelPath, 'utf8'));
      expect(model.lastRetrain).toBeGreaterThan(0);
      expect(model.version).toBe(2);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  //                          PRUNE
  // ═══════════════════════════════════════════════════════════════════════════

  describe('prune', () => {
    it('should remove outcomes older than threshold', async () => {
      // Record some outcomes
      await seedOutcomes(pipeline, 5);

      const stats = pipeline.getStats();
      expect(stats.outcomes).toBe(5);

      // Prune everything recorded so far
      const result = await pipeline.prune({ olderThan: Date.now() + 1 });

      expect(result.removed).toBe(5);
      expect(result.remaining).toBe(0);
    });

    it('should not remove anything when no olderThan specified', async () => {
      await seedOutcomes(pipeline, 5);

      const result = await pipeline.prune();

      expect(result.removed).toBe(0);
      expect(result.remaining).toBe(5);
    });

    it('should retrain model after pruning', async () => {
      await seedOutcomes(pipeline, 10);

      await pipeline.prune({ olderThan: Date.now() + 1 });

      const acc = pipeline.getModelAccuracy();
      expect(acc.totalOutcomes).toBe(0);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  //                          STATS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('getStats', () => {
    it('should return comprehensive stats', async () => {
      await seedOutcomes(pipeline, 5);
      pipeline.predict({ taskType: 'build' });

      const stats = pipeline.getStats();

      expect(stats.outcomes).toBe(5);
      expect(stats.taskTypes).toBe(1);
      expect(stats.agents).toBe(1);
      expect(stats.strategies).toBe(1);
      expect(stats.predictions).toBe(1);
      expect(stats.outcomesRecorded).toBe(5);
      expect(stats.modelVersion).toBe(1);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  //                          PERSISTENCE
  // ═══════════════════════════════════════════════════════════════════════════

  describe('persistence', () => {
    it('should survive recreation from same directory', async () => {
      await seedOutcomes(pipeline, 10);

      // Create a new instance pointing to same dir
      const pipeline2 = new PredictivePipeline(tmpDir);
      const stats = pipeline2.getStats();

      expect(stats.outcomes).toBe(10);
    });

    it('should create data directory when it does not exist', async () => {
      const newDir = path.join(tmpDir, 'sub', 'nested');

      const p = new PredictivePipeline(newDir);
      await p.recordOutcome({ taskType: 'build', duration: 100, success: true });

      expect(fs.existsSync(path.join(newDir, '.aiox', 'predictions', 'outcomes.json'))).toBe(true);
    });

    it('should handle corrupted outcomes file gracefully', async () => {
      // Write garbage
      const predDir = path.join(tmpDir, '.aiox', 'predictions');
      fs.mkdirSync(predDir, { recursive: true });
      fs.writeFileSync(path.join(predDir, 'outcomes.json'), 'NOT JSON!!!');

      const p = new PredictivePipeline(tmpDir);
      const stats = p.getStats();

      // Should start empty, not crash
      expect(stats.outcomes).toBe(0);
    });

    it('should handle corrupted model file gracefully', async () => {
      const predDir = path.join(tmpDir, '.aiox', 'predictions');
      fs.mkdirSync(predDir, { recursive: true });
      fs.writeFileSync(path.join(predDir, 'model.json'), '{ broken');

      const p = new PredictivePipeline(tmpDir);

      // Should not crash on predict
      const result = p.predict({ taskType: 'test' });
      expect(result).toBeDefined();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  //                          ANOMALY DETECTION
  // ═══════════════════════════════════════════════════════════════════════════

  describe('anomaly detection', () => {
    it('should detect anomaly for very different task', async () => {
      // Seed with one type
      for (let i = 0; i < 20; i++) {
        await pipeline.recordOutcome({
          taskType: 'build',
          complexity: 5,
          contextSize: 100,
          duration: 1000,
          success: true,
        });
      }

      const spy = jest.fn();
      pipeline.on('anomaly-detected', spy);

      // Predict for a totally different type with different features
      pipeline.predict({ taskType: 'alien-task', complexity: 1, contextSize: 0 });

      expect(spy).toHaveBeenCalled();
      expect(pipeline.getStats().anomaliesDetected).toBeGreaterThan(0);
    });

    it('should not flag anomaly for matching task', async () => {
      await seedOutcomes(pipeline, 10);

      const spy = jest.fn();
      pipeline.on('anomaly-detected', spy);

      pipeline.predict({ taskType: 'build', complexity: 5, contextSize: 100 });

      expect(spy).not.toHaveBeenCalled();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  //                          CONFIDENCE SCORING
  // ═══════════════════════════════════════════════════════════════════════════

  describe('confidence scoring', () => {
    it('should have low confidence with few samples', async () => {
      await seedOutcomes(pipeline, 2, { duration: 1000, success: true });

      const result = pipeline.predict({ taskType: 'build' });

      expect(result.confidence).toBeLessThan(0.5);
    });

    it('should have higher confidence with more consistent samples', async () => {
      // Consistent durations — all identical
      await seedOutcomes(pipeline, 20, { taskType: 'stable', duration: 1000, success: true });

      const result = pipeline.predict({ taskType: 'stable', complexity: 5, contextSize: 100, agent: 'agent-1' });

      // With 5 neighbors (kNeighbors=5), sampleFactor = 5/20 = 0.25
      // With zero variance, varianceFactor = 1.0, so confidence = 0.25
      expect(result.confidence).toBeGreaterThanOrEqual(0.2);
    });

    it('should have lower confidence with high variance', async () => {
      for (let i = 0; i < 20; i++) {
        await pipeline.recordOutcome({
          taskType: 'volatile',
          duration: i % 2 === 0 ? 100 : 50000,
          success: true,
          complexity: 5,
          contextSize: 100,
          agent: 'agent-1',
        });
      }

      const result = pipeline.predict({ taskType: 'volatile', complexity: 5, contextSize: 100, agent: 'agent-1' });

      // Even though we have 20 samples, variance is extreme
      expect(result.coefficientOfVariation).toBeGreaterThan(0);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  //                          SAFE ERROR EMIT
  // ═══════════════════════════════════════════════════════════════════════════

  describe('error handling', () => {
    it('should emit error event when listeners present', () => {
      const spy = jest.fn();
      pipeline.on('error', spy);

      // Trigger _emitSafeError directly
      pipeline._emitSafeError({ type: 'test', error: new Error('boom') });

      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should not throw when no error listeners and _emitSafeError is called', () => {
      // No error listener → should not throw
      expect(() => {
        pipeline._emitSafeError({ type: 'test', error: new Error('boom') });
      }).not.toThrow();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  //                          EWMA & MATH
  // ═══════════════════════════════════════════════════════════════════════════

  describe('internal math', () => {
    it('should compute EWMA correctly', () => {
      const result = pipeline._computeEwma([100, 200, 300]);

      // ewma(0) = 100
      // ewma(1) = 0.3*200 + 0.7*100 = 130
      // ewma(2) = 0.3*300 + 0.7*130 = 181
      expect(result).toBeCloseTo(181, 0);
    });

    it('should return 0 for empty EWMA', () => {
      expect(pipeline._computeEwma([])).toBe(0);
    });

    it('should return single value for EWMA of one', () => {
      expect(pipeline._computeEwma([42])).toBe(42);
    });

    it('should compute coefficient of variation', () => {
      // [10, 10, 10] → cv = 0
      expect(pipeline._coefficientOfVariation([10, 10, 10])).toBe(0);

      // cv > 0 for non-uniform data
      expect(pipeline._coefficientOfVariation([10, 100, 10, 100])).toBeGreaterThan(0);
    });

    it('should return 0 cv for less than 2 values', () => {
      expect(pipeline._coefficientOfVariation([])).toBe(0);
      expect(pipeline._coefficientOfVariation([5])).toBe(0);
    });

    it('should compute cosine similarity', () => {
      // Identical vectors → 1.0
      expect(pipeline._cosineSimilarity([1, 2, 3], [1, 2, 3])).toBeCloseTo(1.0, 5);

      // Orthogonal → 0
      expect(pipeline._cosineSimilarity([1, 0, 0], [0, 1, 0])).toBeCloseTo(0, 5);

      // Zero vector → 0
      expect(pipeline._cosineSimilarity([0, 0, 0], [1, 2, 3])).toBe(0);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  //                          DEEP CLONE
  // ═══════════════════════════════════════════════════════════════════════════

  describe('deep clone', () => {
    it('should return independent copies', () => {
      const original = { a: 1, b: { c: 2 } };
      const cloned = pipeline._deepClone(original);

      cloned.b.c = 99;
      expect(original.b.c).toBe(2);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  //                          EDGE CASES
  // ═══════════════════════════════════════════════════════════════════════════

  describe('edge cases', () => {
    it('should handle concurrent recordOutcome calls', async () => {
      const promises = [];
      for (let i = 0; i < 20; i++) {
        promises.push(pipeline.recordOutcome({
          taskType: 'concurrent',
          duration: 100 * i,
          success: true,
        }));
      }

      const results = await Promise.all(promises);
      const ids = new Set(results.map(r => r.id));
      expect(ids.size).toBe(20);

      const stats = pipeline.getStats();
      expect(stats.outcomes).toBe(20);
    });

    it('should generate unique IDs', async () => {
      const ids = new Set();
      for (let i = 0; i < 50; i++) {
        const result = await pipeline.recordOutcome({
          taskType: 'id-test',
          duration: 100,
          success: true,
        });
        ids.add(result.id);
      }
      expect(ids.size).toBe(50);
    });

    it('should handle task with all optional fields missing', async () => {
      const result = await pipeline.recordOutcome({
        taskType: 'minimal',
        duration: 0,
        success: false,
      });

      expect(result.agent).toBeNull();
      expect(result.strategy).toBeNull();
      expect(result.complexity).toBe(5);
      expect(result.contextSize).toBe(0);
    });

    it('should predict after retrain with no outcomes', async () => {
      await seedOutcomes(pipeline, 5);
      await pipeline.prune({ olderThan: Date.now() + 1 });

      const result = pipeline.predict({ taskType: 'build' });

      expect(result.sampleSize).toBe(0);
      expect(result.successProbability).toBe(0.5);
    });
  });
});
