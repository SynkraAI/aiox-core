/**
 * Polymarket Autonomous Trading System
 *
 * Architecture: Modular monolith with event bus (UltraPlan D8).
 * All modules communicate via events, not direct calls.
 *
 * Modules:
 * - Engine: Event bus, Risk engine
 * - Integrations: Polymarket API client
 * - Execution: Paper trader, (future: live trader)
 * - Learning: Experience store, Drift monitor
 * - Strategies: (Phase 1)
 * - CLI: Command interface (Constitution Art. I)
 */

import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import pino from 'pino';
import { eventBus } from './engine/event-bus.js';
import { RiskEngine } from './engine/risk-engine.js';
import { ExperienceStore } from './learning/experience-store.js';
import { DriftMonitor } from './learning/drift-monitor.js';
import { PolymarketClient } from './integrations/polymarket-client.js';
import { PaperTrader } from './execution/paper-trader.js';
import { DEFAULT_CONFIG } from './config/defaults.js';
import type { TradingConfig } from './types/index.js';

export const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: { colorize: true },
  },
  level: process.env.LOG_LEVEL || 'info',
});

export interface TradingSystem {
  client: PolymarketClient;
  risk: RiskEngine;
  store: ExperienceStore;
  drift: DriftMonitor;
  paper: PaperTrader;
  config: TradingConfig;
  start: () => void;
  stop: () => void;
}

export function createTradingSystem(config: Partial<TradingConfig> = {}): TradingSystem {
  const finalConfig: TradingConfig = { ...DEFAULT_CONFIG, ...config };

  // Ensure data directory exists
  const dataDir = join(process.cwd(), 'data');
  if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true });

  // Initialize modules
  const client = new PolymarketClient({
    apiKey: process.env.POLYMARKET_API_KEY,
    apiSecret: process.env.POLYMARKET_API_SECRET,
    privateKey: process.env.POLYMARKET_PRIVATE_KEY,
    funderAddress: process.env.POLYMARKET_FUNDER_ADDRESS,
  });

  const bankroll = parseFloat(process.env.POLYMARKET_BANKROLL || '500');
  const risk = new RiskEngine(bankroll, finalConfig.riskLimits);
  const store = new ExperienceStore(join(dataDir, 'trades.db'));
  const drift = new DriftMonitor();
  const paper = new PaperTrader(client, store, risk);

  // Wire system-level event logging
  eventBus.on('risk:circuit-breaker', ({ reason }) => {
    logger.error({ reason }, 'CIRCUIT BREAKER TRIPPED');
  });

  eventBus.on('learning:drift-detected', (metrics) => {
    logger.warn({ metrics }, 'DRIFT DETECTED');
  });

  eventBus.on('signal:approved', (signal) => {
    logger.info({ market: signal.marketId, side: signal.side, edge: signal.edge, size: signal.suggestedSize }, 'Signal approved');
  });

  eventBus.on('learning:trade-recorded', (exp) => {
    logger.info({ market: exp.marketId, vertical: exp.vertical, strategy: exp.strategy }, 'Trade recorded');
  });

  function start(): void {
    logger.info({ mode: finalConfig.mode, verticals: finalConfig.enabledVerticals }, 'Polymarket Trader starting');
    eventBus.emit('system:started');
  }

  function stop(): void {
    store.close();
    logger.info('Polymarket Trader stopped');
    eventBus.emit('system:stopped');
  }

  return { client, risk, store, drift, paper, config: finalConfig, start, stop };
}

// Re-exports
export { eventBus } from './engine/event-bus.js';
export { RiskEngine } from './engine/risk-engine.js';
export { ExperienceStore } from './learning/experience-store.js';
export { DriftMonitor } from './learning/drift-monitor.js';
export { PolymarketClient } from './integrations/polymarket-client.js';
export { KalshiClient } from './integrations/kalshi-client.js';
export { PaperTrader } from './execution/paper-trader.js';
export { CrossPlatformArbStrategy } from './strategies/cross-platform-arb.js';
export { TwitterSentimentAdapter } from './integrations/twitter-sentiment.js';
export { OnChainMonitor } from './integrations/onchain-monitor.js';
export { PaperTradingReviewer } from './engine/paper-review.js';
export { GoNoGoGate } from './engine/go-nogo-gate.js';
export { LiveTrader } from './execution/live-trader.js';
export { WhaleTracker } from './strategies/whale-tracker.js';
export { AirdropOptimizer } from './strategies/airdrop-optimizer.js';
export { PoliticsStrategy } from './strategies/politics-strategy.js';
export { SportsStrategy } from './strategies/sports-strategy.js';
export { TradingBot } from './telegram/bot.js';
export { NotificationManager } from './telegram/notifications.js';
export { DashboardServer, DEFAULT_DASHBOARD_CONFIG } from './dashboard/server.js';
export { DashboardAPI } from './dashboard/api.js';
export { getDashboardHTML } from './dashboard/html.js';
