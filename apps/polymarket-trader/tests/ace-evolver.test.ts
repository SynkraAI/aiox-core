/**
 * Tests for AceEvolver — Adaptive Context Evolution.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AceEvolver } from '../src/learning/ace-evolver.js';
import { eventBus } from '../src/engine/event-bus.js';
import type { TradeExperience, StrategyId, TradeOutcome } from '../src/types/index.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeTrade(overrides: Partial<TradeExperience> = {}): TradeExperience {
  return {
    id: `trade-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date(),
    marketId: 'market-1',
    vertical: 'weather',
    strategy: 'weather_model',
    marketQuestion: 'Will it rain tomorrow?',
    signalConfidence: 0.7,
    modelProbability: 0.65,
    marketProbability: 0.55,
    edgeDetected: 0.10,
    positionSize: 30,
    kellyFraction: 0.12,
    side: 'YES',
    entryPrice: 0.55,
    slippage: 0.002,
    gasFee: 0.01,
    takerFee: 0.005,
    fillTimeMs: 250,
    outcome: 'WIN',
    exitPrice: 1.0,
    pnl: 12.5,
    lesson: '',
    tags: [],
    similarPastTrades: [],
    metadata: {},
    ...overrides,
  };
}

function fillBuffer(
  evolver: AceEvolver,
  count: number,
  outcome: TradeOutcome,
  strategy: StrategyId = 'weather_model',
): void {
  for (let i = 0; i < count; i++) {
    evolver.recordResult(makeTrade({ outcome, strategy }));
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('AceEvolver', () => {
  let evolver: AceEvolver;

  beforeEach(() => {
    evolver = new AceEvolver({ tradesPerEvolution: 100, minTrades: 50 });
  });

  // ---- Recording trades ----

  it('records trades correctly per strategy', () => {
    evolver.recordResult(makeTrade({ strategy: 'weather_model' }));
    evolver.recordResult(makeTrade({ strategy: 'info_arb' }));
    evolver.recordResult(makeTrade({ strategy: 'weather_model' }));

    // No evolution yet, but prompt versions should be retrievable
    const weatherVersion = evolver.getPromptVersion('weather_model');
    expect(weatherVersion.strategy).toBe('weather_model');
    expect(weatherVersion.version).toBe('1.0');
  });

  it('ignores PENDING trades', () => {
    evolver.recordResult(makeTrade({ outcome: 'PENDING' }));
    // Filling 99 more settled trades should NOT trigger evolution (only 99 settled)
    fillBuffer(evolver, 99, 'WIN');
    const result = evolver.checkAndEvolve();
    expect(result).toBeNull();
  });

  // ---- Evolution threshold ----

  it('does NOT evolve before threshold is reached', () => {
    fillBuffer(evolver, 99, 'WIN');
    const result = evolver.checkAndEvolve();
    expect(result).toBeNull();
  });

  it('evolves at exact threshold (100 trades)', () => {
    fillBuffer(evolver, 100, 'WIN');
    const result = evolver.checkAndEvolve();
    expect(result).not.toBeNull();
    expect(result!.strategy).toBe('weather_model');
    expect(result!.fromVersion).toBe('1.0');
    expect(result!.toVersion).toBe('1.1');
  });

  // ---- Win rate behavior ----

  it('high win rate makes parameters more aggressive (lower minEdge)', () => {
    // 80% win rate > 70% threshold
    fillBuffer(evolver, 80, 'WIN');
    fillBuffer(evolver, 20, 'LOSS');

    const result = evolver.checkAndEvolve();
    expect(result).not.toBeNull();
    expect(result!.reason).toContain('increasing aggressiveness');

    const version = evolver.getPromptVersion('weather_model');
    expect(version.parameters.minEdge).toBeLessThan(0.08);
  });

  it('low win rate makes parameters more conservative (higher minEdge)', () => {
    // 40% win rate < 55% threshold
    fillBuffer(evolver, 40, 'WIN');
    fillBuffer(evolver, 60, 'LOSS');

    const result = evolver.checkAndEvolve();
    expect(result).not.toBeNull();
    expect(result!.reason).toContain('increasing conservatism');

    const version = evolver.getPromptVersion('weather_model');
    expect(version.parameters.minEdge).toBeGreaterThan(0.08);
  });

  it('medium win rate produces no parameter changes', () => {
    // 60% win rate — in stable range 55%-70%
    fillBuffer(evolver, 60, 'WIN');
    fillBuffer(evolver, 40, 'LOSS');

    const result = evolver.checkAndEvolve();
    expect(result).not.toBeNull();
    expect(result!.reason).toContain('stable range');
    expect(result!.changes).toHaveLength(0);

    const version = evolver.getPromptVersion('weather_model');
    expect(version.parameters.minEdge).toBe(0.08);
  });

  // ---- Version management ----

  it('version numbers increment correctly across multiple evolutions', () => {
    // First evolution
    fillBuffer(evolver, 100, 'WIN');
    evolver.checkAndEvolve();

    // Second evolution
    fillBuffer(evolver, 100, 'WIN');
    const result = evolver.checkAndEvolve();
    expect(result).not.toBeNull();
    expect(result!.fromVersion).toBe('1.1');
    expect(result!.toVersion).toBe('1.2');
  });

  it('getPromptVersion returns initial state for unknown strategy', () => {
    const version = evolver.getPromptVersion('cross_platform');
    expect(version.version).toBe('1.0');
    expect(version.tradesEvaluated).toBe(0);
    expect(version.winRate).toBe(0);
    expect(version.parameters.minEdge).toBe(0.08);
  });

  // ---- Evolution history ----

  it('tracks evolution history', () => {
    expect(evolver.getHistory()).toHaveLength(0);

    fillBuffer(evolver, 100, 'WIN');
    evolver.checkAndEvolve();

    const history = evolver.getHistory();
    expect(history).toHaveLength(1);
    expect(history[0].strategy).toBe('weather_model');
    expect(history[0].timestamp).toBeInstanceOf(Date);
  });

  // ---- Event emission ----

  it('emits learning:prompt-evolved event on evolution', () => {
    const handler = vi.fn();
    eventBus.on('learning:prompt-evolved', handler);

    fillBuffer(evolver, 100, 'WIN');
    evolver.checkAndEvolve();

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0]).toMatchObject({
      strategy: 'weather_model',
      fromVersion: '1.0',
      toVersion: '1.1',
    });

    eventBus.removeListener('learning:prompt-evolved', handler);
  });

  // ---- Multi-strategy independence ----

  it('multiple strategies evolve independently', () => {
    fillBuffer(evolver, 100, 'WIN', 'weather_model');
    fillBuffer(evolver, 50, 'LOSS', 'info_arb');   // Not enough

    // First check evolves weather_model
    const result1 = evolver.checkAndEvolve();
    expect(result1).not.toBeNull();
    expect(result1!.strategy).toBe('weather_model');

    // info_arb should not have evolved
    const infoArbVersion = evolver.getPromptVersion('info_arb');
    expect(infoArbVersion.version).toBe('1.0');
    expect(infoArbVersion.tradesEvaluated).toBe(0);

    // Add remaining trades to info_arb
    fillBuffer(evolver, 50, 'LOSS', 'info_arb');
    const result2 = evolver.checkAndEvolve();
    expect(result2).not.toBeNull();
    expect(result2!.strategy).toBe('info_arb');
    expect(result2!.reason).toContain('increasing conservatism');
  });

  // ---- Conservative adjustments have correct bounds ----

  it('confidenceWeight increases for low win rate strategies', () => {
    fillBuffer(evolver, 100, 'LOSS', 'weather_model');
    evolver.checkAndEvolve();

    const version = evolver.getPromptVersion('weather_model');
    expect(version.parameters.confidenceWeight).toBeGreaterThan(1.0);
  });

  // ---- Edge cases ----

  it('buffer is cleared after evolution', () => {
    fillBuffer(evolver, 100, 'WIN');
    evolver.checkAndEvolve();

    // Next check should return null — buffer was cleared
    const result = evolver.checkAndEvolve();
    expect(result).toBeNull();
  });

  it('getPromptVersion reflects post-evolution state', () => {
    fillBuffer(evolver, 100, 'WIN');
    evolver.checkAndEvolve();

    const version = evolver.getPromptVersion('weather_model');
    expect(version.version).toBe('1.1');
    expect(version.tradesEvaluated).toBe(100);
    expect(version.winRate).toBe(1.0);
  });

  it('custom config overrides defaults', () => {
    const custom = new AceEvolver({ tradesPerEvolution: 10, minTrades: 5 });
    fillBuffer(custom, 10, 'WIN');
    const result = custom.checkAndEvolve();
    expect(result).not.toBeNull();
  });
});
