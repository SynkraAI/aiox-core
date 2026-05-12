/**
 * Parallel Executor Tests
 * Story GEMINI-INT.17
 */

const {
  ParallelExecutor,
  ParallelMode,
} = require('../../../.aiox-core/core/execution/parallel-executor');

describe('ParallelExecutor', () => {
  let executor;

  beforeEach(() => {
    executor = new ParallelExecutor();
  });

  describe('ParallelMode', () => {
    it('should have all execution modes defined', () => {
      expect(ParallelMode.RACE).toBe('race');
      expect(ParallelMode.CONSENSUS).toBe('consensus');
      expect(ParallelMode.BEST_OF).toBe('best-of');
      expect(ParallelMode.MERGE).toBe('merge');
      expect(ParallelMode.FALLBACK).toBe('fallback');
    });
  });

  describe('constructor', () => {
    it('should use default mode as fallback', () => {
      expect(executor.mode).toBe(ParallelMode.FALLBACK);
    });

    it('should accept custom mode', () => {
      const custom = new ParallelExecutor({ mode: ParallelMode.RACE });
      expect(custom.mode).toBe(ParallelMode.RACE);
    });

    it('should have default consensus similarity', () => {
      expect(executor.consensusSimilarity).toBe(0.85);
    });

    it('should initialize stats', () => {
      expect(executor.stats.executions).toBe(0);
      expect(executor.stats.consensusAgreements).toBe(0);
      expect(executor.stats.fallbacksUsed).toBe(0);
    });
  });

  describe('execute', () => {
    it('should execute both providers in parallel', async () => {
      const claudeExecutor = jest.fn().mockResolvedValue({ success: true, output: 'Claude result' });
      const geminiExecutor = jest.fn().mockResolvedValue({ success: true, output: 'Gemini result' });

      const result = await executor.execute(claudeExecutor, geminiExecutor);

      expect(claudeExecutor).toHaveBeenCalled();
      expect(geminiExecutor).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });

    it('should increment execution count', async () => {
      const claudeExecutor = jest.fn().mockResolvedValue({ success: true, output: 'test' });
      const geminiExecutor = jest.fn().mockResolvedValue({ success: true, output: 'test' });

      await executor.execute(claudeExecutor, geminiExecutor);

      expect(executor.stats.executions).toBe(1);
    });

    it('should handle Claude failure with Gemini fallback', async () => {
      const claudeExecutor = jest.fn().mockRejectedValue(new Error('Claude failed'));
      const geminiExecutor = jest.fn().mockResolvedValue({ success: true, output: 'Gemini result' });

      const result = await executor.execute(claudeExecutor, geminiExecutor);

      expect(result.success).toBe(true);
      expect(result.selectedProvider).toBe('gemini');
      expect(result.usedFallback).toBe(true);
    });

    it('should handle both failures', async () => {
      const claudeExecutor = jest.fn().mockRejectedValue(new Error('Claude failed'));
      const geminiExecutor = jest.fn().mockRejectedValue(new Error('Gemini failed'));

      const result = await executor.execute(claudeExecutor, geminiExecutor);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Both providers failed');
    });

    it('should emit events', async () => {
      const startedHandler = jest.fn();
      const completedHandler = jest.fn();

      executor.on('parallel_started', startedHandler);
      executor.on('parallel_completed', completedHandler);

      const claudeExecutor = jest.fn().mockResolvedValue({ success: true, output: 'test' });
      const geminiExecutor = jest.fn().mockResolvedValue({ success: true, output: 'test' });

      await executor.execute(claudeExecutor, geminiExecutor);

      expect(startedHandler).toHaveBeenCalled();
      expect(completedHandler).toHaveBeenCalled();
    });
  });

  describe('race mode', () => {
    it('should return first successful result', async () => {
      const raceExecutor = new ParallelExecutor({ mode: ParallelMode.RACE });

      const claudeExecutor = jest.fn().mockResolvedValue({ success: true, output: 'Claude' });
      const geminiExecutor = jest.fn().mockResolvedValue({ success: true, output: 'Gemini' });

      const result = await raceExecutor.execute(claudeExecutor, geminiExecutor);

      expect(result.success).toBe(true);
      expect(result.mode).toBe('race');
    });
  });

  describe('consensus mode', () => {
    it('should achieve consensus when outputs are similar', async () => {
      const consensusExecutor = new ParallelExecutor({
        mode: ParallelMode.CONSENSUS,
        consensusSimilarity: 0.5,
      });

      const claudeExecutor = jest.fn().mockResolvedValue({ success: true, output: 'The quick brown fox' });
      const geminiExecutor = jest.fn().mockResolvedValue({ success: true, output: 'The quick brown dog' });

      const result = await consensusExecutor.execute(claudeExecutor, geminiExecutor);

      expect(result.mode).toBe('consensus');
      expect(result).toHaveProperty('similarity');
    });
  });

  describe('best-of mode', () => {
    it('should score and pick best output', async () => {
      const bestOfExecutor = new ParallelExecutor({ mode: ParallelMode.BEST_OF });

      const claudeExecutor = jest.fn().mockResolvedValue({
        success: true,
        output: 'Short response',
      });
      const geminiExecutor = jest.fn().mockResolvedValue({
        success: true,
        output: 'This is a much longer response with more content and details including ```code blocks``` and - bullet points',
      });

      const result = await bestOfExecutor.execute(claudeExecutor, geminiExecutor);

      expect(result.mode).toBe('best-of');
      expect(result).toHaveProperty('scores');
    });
  });

  describe('merge mode', () => {
    it('should merge both outputs', async () => {
      const mergeExecutor = new ParallelExecutor({ mode: ParallelMode.MERGE });

      const claudeExecutor = jest.fn().mockResolvedValue({ success: true, output: 'Claude output' });
      const geminiExecutor = jest.fn().mockResolvedValue({ success: true, output: 'Gemini output' });

      const result = await mergeExecutor.execute(claudeExecutor, geminiExecutor);

      expect(result.mode).toBe('merge');
      expect(result.output).toContain('Claude');
      expect(result.output).toContain('Gemini');
    });
  });

  describe('getStats', () => {
    it('should return stats with calculated rates', async () => {
      const claudeExecutor = jest.fn().mockResolvedValue({ success: true, output: 'test' });
      const geminiExecutor = jest.fn().mockResolvedValue({ success: true, output: 'test' });

      await executor.execute(claudeExecutor, geminiExecutor);

      const stats = executor.getStats();

      expect(stats).toHaveProperty('executions');
      expect(stats).toHaveProperty('consensusRate');
      expect(stats).toHaveProperty('fallbackRate');
    });
  });

  describe('timeout handling', () => {
    it('should timeout slow executors', async () => {
      const timeoutExecutor = new ParallelExecutor({ timeout: 100 });

      const slowExecutor = jest.fn().mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ success: true }), 500)),
      );
      const fastExecutor = jest.fn().mockResolvedValue({ success: true, output: 'fast' });

      const result = await timeoutExecutor.execute(slowExecutor, fastExecutor);

      expect(result.success).toBe(true);
    }, 10000);
  });
});
