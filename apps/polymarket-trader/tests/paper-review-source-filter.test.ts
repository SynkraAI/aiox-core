/**
 * PaperTradingReviewer realOnly filter (originally part of crypto-price-client.test.ts;
 * extracted in PM-PIVOT-1 because crypto-price-client itself was deleted).
 *
 * Asserts that `analyze({ realOnly: true })` filters by `tags:source:real` or by the
 * `synth-*` marketId prefix fallback.
 */

import { describe, it, expect } from 'vitest';

describe('PaperTradingReviewer realOnly filter (P4)', () => {
  it('filters trades by source:real tag or marketId fallback', async () => {
    const { PaperTradingReviewer } = await import('../src/engine/paper-review.js');
    const reviewer = new PaperTradingReviewer();
    const now = new Date();
    const trades = [
      {
        id: 't1', timestamp: now, marketId: '0xabc', vertical: 'crypto' as const,
        strategy: 'info_arb' as const, marketQuestion: 'q', signalConfidence: 0.5,
        modelProbability: 0.6, marketProbability: 0.5, edgeDetected: 0.1, positionSize: 10,
        kellyFraction: 0.02, side: 'YES' as const, entryPrice: 0.5, slippage: 0, gasFee: 0,
        takerFee: 0, fillTimeMs: 0, outcome: 'WIN' as const, exitPrice: 1, pnl: 5,
        lesson: '', tags: ['source:real'], similarPastTrades: [], metadata: { source: 'real' },
      },
      {
        id: 't2', timestamp: now, marketId: 'synth-bitcoin-above-85000-24h-123', vertical: 'crypto' as const,
        strategy: 'info_arb' as const, marketQuestion: 'q', signalConfidence: 0.5,
        modelProbability: 0.6, marketProbability: 0.5, edgeDetected: 0.1, positionSize: 10,
        kellyFraction: 0.02, side: 'NO' as const, entryPrice: 0.5, slippage: 0, gasFee: 0,
        takerFee: 0, fillTimeMs: 0, outcome: 'WIN' as const, exitPrice: 1, pnl: 5,
        lesson: '', tags: ['source:synth'], similarPastTrades: [], metadata: { source: 'synth' },
      },
    ];

    const realOnly = reviewer.analyze(trades, { realOnly: true });
    expect(realOnly.totalTrades).toBe(1);

    const all = reviewer.analyze(trades);
    expect(all.totalTrades).toBe(2);
  });
});
