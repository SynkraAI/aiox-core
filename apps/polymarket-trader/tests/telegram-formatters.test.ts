import { describe, it, expect } from 'vitest';
import {
  escapeMarkdownV2,
  progressBar,
  statusDot,
  formatStatus,
  formatPnL,
  formatPositions,
  formatTrades,
  formatRisk,
  formatHealth,
  formatDrift,
  formatStrategies,
  formatMarkets,
  formatWhaleActivity,
  formatGate,
  formatTradeAlert,
  formatError,
  formatConfig,
  type SystemStatusData,
  type PnlData,
  type PositionData,
  type MarketData,
  type WhaleActivityData,
  type ConfigData,
} from '../src/telegram/formatters.js';
import type { RiskState, DriftMetrics, GateResult, TradeSignal, TradeExperience } from '../src/types/index.js';
import type { HealthReport } from '../src/engine/health-monitor.js';

describe('escapeMarkdownV2', () => {
  it('should escape all special characters', () => {
    const input = 'Hello_World *bold* [link](url) ~strike~ `code` >quote #+-.=|{}!';
    const escaped = escapeMarkdownV2(input);
    expect(escaped).toContain('\\_');
    expect(escaped).toContain('\\*');
    expect(escaped).toContain('\\[');
    expect(escaped).toContain('\\]');
    expect(escaped).toContain('\\(');
    expect(escaped).toContain('\\)');
    expect(escaped).toContain('\\~');
    expect(escaped).toContain('\\`');
    expect(escaped).toContain('\\>');
    expect(escaped).toContain('\\#');
    expect(escaped).toContain('\\+');
    expect(escaped).toContain('\\-');
    expect(escaped).toContain('\\.');
    expect(escaped).toContain('\\=');
    expect(escaped).toContain('\\|');
    expect(escaped).toContain('\\{');
    expect(escaped).toContain('\\}');
    expect(escaped).toContain('\\!');
  });

  it('should handle empty string', () => {
    expect(escapeMarkdownV2('')).toBe('');
  });

  it('should not double-escape already escaped characters', () => {
    const input = 'plain text';
    expect(escapeMarkdownV2(input)).toBe('plain text');
  });

  it('should handle numbers and regular text', () => {
    expect(escapeMarkdownV2('abc123')).toBe('abc123');
  });
});

describe('progressBar', () => {
  it('should show full bar at 100%', () => {
    const bar = progressBar(10, 10, 10);
    expect(bar).toContain('100%');
  });

  it('should show empty bar at 0%', () => {
    const bar = progressBar(0, 10, 10);
    expect(bar).toContain('0%');
  });

  it('should show partial bar at 50%', () => {
    const bar = progressBar(5, 10, 10);
    expect(bar).toContain('50%');
  });

  it('should handle zero max gracefully', () => {
    const bar = progressBar(5, 0, 10);
    expect(bar).toContain('0%');
  });

  it('should clamp values above max', () => {
    const bar = progressBar(20, 10, 10);
    expect(bar).toContain('100%');
  });
});

describe('statusDot', () => {
  it('should return green for ok/healthy', () => {
    expect(statusDot('ok')).toBe('\u{1F7E2}');
    expect(statusDot('healthy')).toBe('\u{1F7E2}');
  });

  it('should return yellow for warn/degraded', () => {
    expect(statusDot('warn')).toBe('\u{1F7E1}');
    expect(statusDot('degraded')).toBe('\u{1F7E1}');
  });

  it('should return red for fail/critical', () => {
    expect(statusDot('fail')).toBe('\u{1F534}');
    expect(statusDot('critical')).toBe('\u{1F534}');
  });

  it('should return white for unknown', () => {
    expect(statusDot('unknown')).toBe('\u26AA');
  });
});

describe('formatStatus', () => {
  const data: SystemStatusData = {
    mode: 'paper',
    uptime: 7200000, // 2h
    openPositions: 3,
    dailyPnl: 12.50,
    totalPnl: 145.30,
    winRate: 0.65,
    health: 'healthy',
    circuitBreaker: false,
    enabledStrategies: ['info_arb', 'whale_follow'],
    enabledVerticals: ['crypto', 'weather'],
    bankroll: 500,
  };

  it('should contain mode, uptime, and health info', () => {
    const result = formatStatus(data);
    expect(result).toContain('PAPER');
    expect(result).toContain('2h');
    expect(result).toContain('HEALTHY');
  });

  it('should contain P&L info', () => {
    const result = formatStatus(data);
    expect(result).toContain('12.50');
    expect(result).toContain('145.30');
  });

  it('should contain strategy and vertical info', () => {
    const result = formatStatus(data);
    expect(result).toContain('info_arb');
    expect(result).toContain('crypto');
  });
});

describe('formatPnL', () => {
  const data: PnlData = {
    totalPnl: 200,
    dailyPnl: 15,
    weeklyPnl: 50,
    monthlyPnl: 200,
    totalTrades: 100,
    wins: 65,
    losses: 35,
    winRate: 0.65,
    avgPnl: 2.0,
    bestDay: 30,
    worstDay: -10,
  };

  it('should contain all P&L periods', () => {
    const result = formatPnL(data);
    expect(result).toContain('Today');
    expect(result).toContain('Week');
    expect(result).toContain('Month');
    expect(result).toContain('All Time');
  });

  it('should contain trade counts', () => {
    const result = formatPnL(data);
    expect(result).toContain('100');
    expect(result).toContain('65W');
  });
});

describe('formatPositions', () => {
  it('should handle empty positions', () => {
    const result = formatPositions([]);
    expect(result).toContain('No open positions');
  });

  it('should format position data', () => {
    const positions: PositionData[] = [{
      marketId: 'market-123',
      side: 'YES',
      size: 25,
      entryPrice: 0.65,
      currentPrice: 0.70,
      unrealizedPnl: 5,
      enteredAt: new Date(Date.now() - 3600000),
    }];

    const result = formatPositions(positions);
    expect(result).toContain('POSITIONS');
    expect(result).toContain('YES');
    expect(result).toContain('25.00');
  });
});

describe('formatTrades', () => {
  const makeTrade = (pnl: number, outcome: 'WIN' | 'LOSS' | 'PENDING'): TradeExperience => ({
    id: 'trade-1',
    timestamp: new Date(),
    marketId: 'market-1',
    vertical: 'crypto',
    strategy: 'info_arb',
    marketQuestion: 'Will BTC reach $100K?',
    signalConfidence: 0.8,
    modelProbability: 0.7,
    marketProbability: 0.6,
    edgeDetected: 0.1,
    positionSize: 25,
    kellyFraction: 0.05,
    side: 'YES',
    entryPrice: 0.60,
    slippage: 0.01,
    gasFee: 0.01,
    takerFee: 0.25,
    fillTimeMs: 100,
    outcome,
    exitPrice: outcome === 'PENDING' ? 0 : 0.70,
    pnl,
    lesson: '',
    tags: [],
    similarPastTrades: [],
    metadata: {},
  });

  it('should handle empty trades', () => {
    const result = formatTrades([], 1, 10);
    expect(result).toContain('No trades found');
  });

  it('should show page info', () => {
    const trades = [makeTrade(5, 'WIN'), makeTrade(-3, 'LOSS')];
    const result = formatTrades(trades, 1, 10);
    expect(result).toContain('Page 1/1');
  });

  it('should paginate correctly', () => {
    const trades = Array.from({ length: 25 }, (_, i) => makeTrade(i, 'WIN'));
    const result = formatTrades(trades, 2, 10);
    expect(result).toContain('Page 2/3');
    expect(result).toContain('11\\-20');
  });
});

describe('formatRisk', () => {
  it('should format risk state', () => {
    const state: RiskState = {
      bankroll: 500,
      dailyPnl: -10,
      weeklyPnl: 20,
      openPositions: 3,
      totalExposure: 75,
      circuitBreakerTripped: false,
      lastUpdated: new Date(),
    };

    const result = formatRisk(state);
    expect(result).toContain('500.00');
    expect(result).toContain('OK');
  });

  it('should show circuit breaker reason when tripped', () => {
    const state: RiskState = {
      bankroll: 500,
      dailyPnl: -60,
      weeklyPnl: -80,
      openPositions: 0,
      totalExposure: 0,
      circuitBreakerTripped: true,
      circuitBreakerReason: 'Daily loss limit hit',
      lastUpdated: new Date(),
    };

    const result = formatRisk(state);
    expect(result).toContain('TRIPPED');
    expect(result).toContain('Daily loss limit hit');
  });
});

describe('formatHealth', () => {
  it('should format health report', () => {
    const report: HealthReport = {
      timestamp: new Date(),
      overall: 'healthy',
      checks: [
        { name: 'api-connectivity', status: 'ok', message: 'API reachable' },
        { name: 'circuit-breaker', status: 'fail', message: 'Tripped' },
      ],
    };

    const result = formatHealth(report);
    expect(result).toContain('HEALTH');
    expect(result).toContain('api\\-connectivity');
    expect(result).toContain('API reachable');
  });
});

describe('formatDrift', () => {
  it('should show baseline not established message', () => {
    const metrics: DriftMetrics = {
      winRate: { current: 0, baseline: 0, zScore: 0, trend: 'stable', sampleSize: 0, alertTriggered: false },
      evPerTrade: { current: 0, baseline: 0, zScore: 0, trend: 'stable', sampleSize: 0, alertTriggered: false },
      edgeAccuracy: { current: 0, baseline: 0, zScore: 0, trend: 'stable', sampleSize: 0, alertTriggered: false },
      executionQuality: { current: 0, baseline: 0, zScore: 0, trend: 'stable', sampleSize: 0, alertTriggered: false },
    };

    const result = formatDrift(metrics, false, 10);
    expect(result).toContain('not yet established');
  });

  it('should show metrics when baseline established', () => {
    const metrics: DriftMetrics = {
      winRate: { current: 0.65, baseline: 0.60, zScore: 0.5, trend: 'improving', sampleSize: 50, alertTriggered: false },
      evPerTrade: { current: 2.0, baseline: 1.5, zScore: 0.3, trend: 'stable', sampleSize: 50, alertTriggered: false },
      edgeAccuracy: { current: 0.85, baseline: 0.80, zScore: 0.4, trend: 'improving', sampleSize: 50, alertTriggered: false },
      executionQuality: { current: 0.95, baseline: 0.90, zScore: 0.2, trend: 'stable', sampleSize: 50, alertTriggered: false },
    };

    const result = formatDrift(metrics, true, 150);
    expect(result).toContain('Win Rate');
    expect(result).toContain('EV/Trade');
    expect(result).toContain('0.6500');
  });
});

describe('formatStrategies', () => {
  it('should handle empty stats', () => {
    const result = formatStrategies({});
    expect(result).toContain('No strategy data');
  });

  it('should format strategy entries', () => {
    const result = formatStrategies({
      info_arb: { count: 50, winRate: 0.65, pnl: 100 },
      whale_follow: { count: 20, winRate: 0.55, pnl: 30 },
    });
    expect(result).toContain('info\\_arb');
    expect(result).toContain('whale\\_follow');
    expect(result).toContain('50');
  });
});

describe('formatMarkets', () => {
  it('should handle empty markets', () => {
    expect(formatMarkets([])).toContain('No markets found');
  });

  it('should format market data', () => {
    const markets: MarketData[] = [{
      id: 'mkt-1',
      question: 'Will BTC hit 100K?',
      yesPrice: 0.65,
      noPrice: 0.35,
      volume: 50000,
      vertical: 'crypto',
    }];

    const result = formatMarkets(markets);
    expect(result).toContain('BTC');
    expect(result).toContain('0.65');
    expect(result).toContain('crypto');
  });
});

describe('formatWhaleActivity', () => {
  it('should handle empty signals', () => {
    expect(formatWhaleActivity([])).toContain('No recent whale activity');
  });

  it('should format whale signals', () => {
    const signals: WhaleActivityData[] = [{
      walletLabel: 'BigWhale',
      walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
      marketId: 'market-123',
      side: 'YES',
      size: 5000,
      whaleWinRate: 0.70,
      confidence: 0.65,
      timestamp: new Date(),
    }];

    const result = formatWhaleActivity(signals);
    expect(result).toContain('BigWhale');
    expect(result).toContain('5000');
  });
});

describe('formatGate', () => {
  it('should format GO result', () => {
    const result: GateResult = {
      passed: true,
      score: 100,
      recommendation: 'GO',
      criteria: [
        { name: 'Win rate', required: '>= 60%', actual: '65%', passed: true },
      ],
    };

    const formatted = formatGate(result);
    expect(formatted).toContain('GO');
    expect(formatted).toContain('100');
  });

  it('should format NO_GO result', () => {
    const result: GateResult = {
      passed: false,
      score: 40,
      recommendation: 'NO_GO',
      criteria: [
        { name: 'Win rate', required: '>= 60%', actual: '45%', passed: false },
      ],
    };

    const formatted = formatGate(result);
    expect(formatted).toContain('NO\\_GO');
  });
});

describe('formatTradeAlert', () => {
  it('should format signal data', () => {
    const signal: TradeSignal = {
      marketId: 'market-123',
      vertical: 'crypto',
      strategy: 'info_arb',
      side: 'YES',
      modelProbability: 0.75,
      marketProbability: 0.60,
      edge: 0.15,
      confidence: 0.80,
      suggestedSize: 25,
      reasoning: 'Strong edge detected based on model divergence',
      timestamp: new Date(),
    };

    const result = formatTradeAlert(signal);
    expect(result).toContain('NEW SIGNAL');
    expect(result).toContain('info_arb');
    expect(result).toContain('YES');
    expect(result).toContain('25.00');
  });
});

describe('formatError', () => {
  it('should format Error objects', () => {
    const result = formatError(new Error('Something broke'));
    expect(result).toContain('Something broke');
    expect(result).toContain('ERROR');
  });

  it('should format string errors', () => {
    const result = formatError('plain error');
    expect(result).toContain('plain error');
  });
});

describe('formatConfig', () => {
  it('should format config data', () => {
    const data: ConfigData = {
      mode: 'paper',
      enabledVerticals: ['crypto', 'weather'],
      enabledStrategies: ['info_arb'],
      riskLimits: {
        maxPositionSize: 50,
        kellyFraction: 0.15,
        minEdge: 0.08,
        dailyLossLimit: 0.10,
        weeklyLossLimit: 0.20,
        maxOpenPositions: 10,
        maxBankrollPercent: 0.05,
        minLiquidity: 5000,
      },
      pollIntervalMs: 60000,
      telegramAlerts: true,
    };

    const result = formatConfig(data);
    expect(result).toContain('PAPER');
    expect(result).toContain('info_arb');
    expect(result).toContain('50');
  });
});
