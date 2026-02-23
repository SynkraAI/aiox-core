'use strict';

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

  // ── Deep mode coverage (P1 requested by maintainer) ──────────────

  describe('RACE mode - edge cases', () => {
    it('returns gemini when claude fails in race', async () => {
      const raceExec = new ParallelExecutor({ mode: ParallelMode.RACE });
      const claude = jest.fn().mockResolvedValue({ success: false, error: 'down' });
      const gemini = jest.fn().mockResolvedValue({ success: true, output: 'gemini wins' });

      const result = await raceExec.execute(claude, gemini);

      expect(result.selectedProvider).toBe('gemini');
      expect(result.mode).toBe('race');
    });
  });

  describe('CONSENSUS mode - edge cases', () => {
    it('reports no consensus for very different outputs', async () => {
      const consensusExec = new ParallelExecutor({
        mode: ParallelMode.CONSENSUS,
        consensusSimilarity: 0.95,
      });
      const claude = jest.fn().mockResolvedValue({ success: true, output: 'apples oranges bananas' });
      const gemini = jest.fn().mockResolvedValue({ success: true, output: 'zzz xxx yyy completely different' });

      const result = await consensusExec.execute(claude, gemini);

      expect(result.consensus).toBe(false);
      expect(result.warning).toContain('did not reach consensus');
    });

    it('falls back when gemini fails', async () => {
      const consensusExec = new ParallelExecutor({ mode: ParallelMode.CONSENSUS });
      const claude = jest.fn().mockResolvedValue({ success: true, output: 'ok' });
      const gemini = jest.fn().mockRejectedValue(new Error('down'));

      const result = await consensusExec.execute(claude, gemini);

      expect(result.selectedProvider).toBe('claude');
      expect(result.mode).toBe('fallback');
    });

    it('increments consensusAgreements on agreement', async () => {
      const consensusExec = new ParallelExecutor({
        mode: ParallelMode.CONSENSUS,
        consensusSimilarity: 0.5,
      });
      const claude = jest.fn().mockResolvedValue({ success: true, output: 'same words here' });
      const gemini = jest.fn().mockResolvedValue({ success: true, output: 'same words here' });

      await consensusExec.execute(claude, gemini);

      expect(consensusExec.stats.consensusAgreements).toBe(1);
    });
  });

  describe('BEST_OF mode - edge cases', () => {
    it('picks claude when only claude succeeds', async () => {
      const bestExec = new ParallelExecutor({ mode: ParallelMode.BEST_OF });
      const claude = jest.fn().mockResolvedValue({ success: true, output: 'ok' });
      const gemini = jest.fn().mockResolvedValue({ success: false });

      const result = await bestExec.execute(claude, gemini);

      expect(result.selectedProvider).toBe('claude');
    });

    it('picks gemini when only gemini succeeds', async () => {
      const bestExec = new ParallelExecutor({ mode: ParallelMode.BEST_OF });
      const claude = jest.fn().mockResolvedValue({ success: false });
      const gemini = jest.fn().mockResolvedValue({ success: true, output: 'ok' });

      const result = await bestExec.execute(claude, gemini);

      expect(result.selectedProvider).toBe('gemini');
    });

    it('returns failure when both fail', async () => {
      const bestExec = new ParallelExecutor({ mode: ParallelMode.BEST_OF });
      const claude = jest.fn().mockResolvedValue({ success: false });
      const gemini = jest.fn().mockResolvedValue({ success: false });

      const result = await bestExec.execute(claude, gemini);

      expect(result.success).toBe(false);
    });
  });

  describe('MERGE mode - edge cases', () => {
    it('returns single output when claude fails', async () => {
      const mergeExec = new ParallelExecutor({ mode: ParallelMode.MERGE });
      const claude = jest.fn().mockResolvedValue({ success: false });
      const gemini = jest.fn().mockResolvedValue({ success: true, output: 'gemini only' });

      const result = await mergeExec.execute(claude, gemini);

      expect(result.mode).toBe('merge');
      expect(result.output).toBe('gemini only');
    });
  });

  describe('FALLBACK mode - stats tracking', () => {
    it('increments fallbacksUsed when claude fails', async () => {
      const claude = jest.fn().mockRejectedValue(new Error('down'));
      const gemini = jest.fn().mockResolvedValue({ success: true, output: 'ok' });

      await executor.execute(claude, gemini);

      expect(executor.stats.fallbacksUsed).toBe(1);
    });
  });

  describe('_calculateSimilarity', () => {
    it('returns 1 for identical strings', () => {
      expect(executor._calculateSimilarity('hello world', 'hello world')).toBe(1);
    });

    it('returns 0 for completely different strings', () => {
      expect(executor._calculateSimilarity('aaa', 'bbb')).toBe(0);
    });

    it('returns 0 when either input is null', () => {
      expect(executor._calculateSimilarity(null, 'hello')).toBe(0);
      expect(executor._calculateSimilarity('hello', null)).toBe(0);
    });

    it('is case insensitive', () => {
      expect(executor._calculateSimilarity('Hello World', 'hello world')).toBe(1);
    });
  });

  describe('_scoreOutput', () => {
    it('returns 0 for null/empty', () => {
      expect(executor._scoreOutput(null)).toBe(0);
      expect(executor._scoreOutput('')).toBe(0);
    });

    it('scores length > 100 higher', () => {
      const short = 'a'.repeat(50);
      const medium = 'a'.repeat(150);
      expect(executor._scoreOutput(medium)).toBeGreaterThan(executor._scoreOutput(short));
    });

    it('scores code blocks higher', () => {
      const withCode = 'x'.repeat(101) + ' ```code``` ';
      const withoutCode = 'x'.repeat(101);
      expect(executor._scoreOutput(withCode)).toBeGreaterThan(executor._scoreOutput(withoutCode));
    });
  });

  describe('getStats computed rates', () => {
    it('computes consensusRate and fallbackRate', () => {
      executor.stats.executions = 10;
      executor.stats.consensusAgreements = 3;
      executor.stats.fallbacksUsed = 2;

      const stats = executor.getStats();

      expect(stats.consensusRate).toBeCloseTo(0.3);
      expect(stats.fallbackRate).toBeCloseTo(0.2);
    });

    it('returns 0 rates when no executions', () => {
      const stats = executor.getStats();
      expect(stats.consensusRate).toBe(0);
      expect(stats.fallbackRate).toBe(0);
    });
  });
});
