import { describe, it, expect, beforeEach } from 'vitest';
import { DriftMonitor } from '../src/learning/drift-monitor.js';
import type { TradeExperience } from '../src/types/index.js';

function makeTrade(overrides: Partial<TradeExperience> = {}): TradeExperience {
  return {
    id: `trade-${Math.random().toString(36).slice(2)}`,
    timestamp: new Date(),
    marketId: 'test-market',
    vertical: 'weather',
    strategy: 'weather_model',
    marketQuestion: 'Test question',
    signalConfidence: 0.8,
    modelProbability: 0.7,
    marketProbability: 0.6,
    edgeDetected: 0.1,
    positionSize: 20,
    kellyFraction: 0.04,
    side: 'YES',
    entryPrice: 0.6,
    slippage: 0.005,
    gasFee: 0.01,
    takerFee: 0.2,
    fillTimeMs: 150,
    outcome: 'WIN',
    exitPrice: 1.0,
    pnl: 7.8,
    lesson: '',
    tags: [],
    similarPastTrades: [],
    metadata: {},
    ...overrides,
  };
}

describe('DriftMonitor', () => {
  let monitor: DriftMonitor;

  beforeEach(() => {
    monitor = new DriftMonitor(10); // Small window for testing
  });

  it('should start without baseline', () => {
    const report = monitor.getReport();
    expect(report.baselineEstablished).toBe(false);
    expect(report.totalTrades).toBe(0);
  });

  it('should be healthy when no data', () => {
    expect(monitor.isHealthy()).toBe(true);
  });

  it('should establish baseline after window size trades', () => {
    for (let i = 0; i < 10; i++) {
      monitor.addTrade(makeTrade());
    }
    const report = monitor.getReport();
    expect(report.baselineEstablished).toBe(true);
    expect(report.totalTrades).toBe(10);
  });

  it('should detect degrading win rate', () => {
    // Establish baseline with good trades
    for (let i = 0; i < 10; i++) {
      monitor.addTrade(makeTrade({ outcome: 'WIN', pnl: 5 }));
    }

    // Add losing trades
    for (let i = 0; i < 10; i++) {
      monitor.addTrade(makeTrade({ outcome: 'LOSS', pnl: -10 }));
    }

    const report = monitor.getReport();
    expect(report.metrics.winRate.trend).toBe('degrading');
  });

  it('should detect stable performance', () => {
    // Uniform trades
    for (let i = 0; i < 20; i++) {
      const outcome = i % 3 === 0 ? 'LOSS' : 'WIN';
      monitor.addTrade(makeTrade({
        outcome: outcome as 'WIN' | 'LOSS',
        pnl: outcome === 'WIN' ? 5 : -5,
      }));
    }

    const report = monitor.getReport();
    expect(report.metrics.winRate.current).toBeGreaterThan(0);
  });

  it('should compute metrics correctly', () => {
    // 7 wins, 3 losses = 70% win rate
    for (let i = 0; i < 7; i++) {
      monitor.addTrade(makeTrade({ outcome: 'WIN', pnl: 5 }));
    }
    for (let i = 0; i < 3; i++) {
      monitor.addTrade(makeTrade({ outcome: 'LOSS', pnl: -5 }));
    }

    const report = monitor.getReport();
    expect(report.metrics.winRate.current).toBeCloseTo(0.7, 1);
  });
});
