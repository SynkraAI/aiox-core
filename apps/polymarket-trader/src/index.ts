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
import { DepthFilter } from './engine/depth-filter.js';
import { GasOptimizer } from './engine/gas-optimizer.js';
import { AdaptiveVolume } from './engine/adaptive-volume.js';
import { AutoTrader } from './engine/auto-trader.js';
import { SmartOrderSplitter } from './execution/smart-order-splitter.js';
import { BrierTracker } from './learning/brier-tracker.js';
import { CrowdBiasDetector } from './strategies/crowd-bias-detector.js';
import { StrategyScorer } from './engine/strategy-scorer.js';
import { MarketAnalyzer } from './intelligence/market-analyzer.js';
import { DEFAULT_CONFIG, PAPER_UNLIMITED_CONFIG } from './config/defaults.js';
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
  depthFilter: DepthFilter;
  gasOptimizer: GasOptimizer;
  splitter: SmartOrderSplitter;
  brier: BrierTracker;
  crowdBias: CrowdBiasDetector;
  adaptiveVolume: AdaptiveVolume;
  config: TradingConfig;
  start: () => void;
  stop: () => void;
}

export function createTradingSystem(config: Partial<TradingConfig> = {}): TradingSystem {
  // Detect paper unlimited mode via env or explicit config
  const unlimitedMode = process.env.PAPER_UNLIMITED === 'true' || process.env.PAPER_UNLIMITED === '1';
  const baseConfig = unlimitedMode ? PAPER_UNLIMITED_CONFIG : DEFAULT_CONFIG;
  const finalConfig: TradingConfig = { ...baseConfig, ...config };

  if (unlimitedMode) {
    logger.info('🔓 PAPER UNLIMITED MODE — no limits, all verticals, max learning speed');
  }

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

  // Liquidity Maximizer modules
  const depthFilter = new DepthFilter(client);
  const gasOptimizer = new GasOptimizer();
  const splitter = new SmartOrderSplitter(gasOptimizer, depthFilter);

  // Conclave modules (2026-04-04 recommendations)
  const brier = new BrierTracker(finalConfig.riskLimits.maxOpenPositions > 100 ? 0.30 : 0.25);
  const crowdBias = new CrowdBiasDetector();
  const adaptiveVolume = new AdaptiveVolume();

  // Strategy Scorer: bridge between signal:detected → signal:approved
  // Without this, signals are detected but never approved for paper trading
  const scorer = new StrategyScorer(risk);

  // Auto-Trader: the brain that makes it all trade autonomously
  const autoTrader = new AutoTrader(client, risk, brier, crowdBias, adaptiveVolume, {
    pollIntervalMs: finalConfig.pollIntervalMs,
    enabledVerticals: finalConfig.enabledVerticals,
    marketsPerScan: unlimitedMode ? 100 : 50,
    minEdge: finalConfig.riskLimits.minEdge,
  });

  // Connect paper trader to auto-trader for position resolution
  autoTrader.setPaperTrader(paper);

  // Fase 1.1: Connect experience store for learning-informed trading
  autoTrader.setExperienceStore(store);

  // Fase 2: LLM-in-the-Loop — auto-detect best available provider
  const analyzer = new MarketAnalyzer(client, store, {
    apiKey: process.env.ANTHROPIC_API_KEY || '',
    claudeModel: process.env.LLM_CLAUDE_MODEL || 'claude-haiku-4-5-20251001',
    ollamaHost: process.env.OLLAMA_HOST || 'http://localhost:11434',
    ollamaModel: process.env.OLLAMA_MODEL || 'qwen2.5:7b',
    vllmHost: process.env.VLLM_HOST || 'http://localhost:8000',
    vllmModel: process.env.VLLM_MODEL || '',
    maxMarketsPerScan: unlimitedMode ? 20 : 10,
    dailyBudgetUsd: parseFloat(process.env.LLM_DAILY_BUDGET || '5'),
  });

  // Initialize is async — detect provider at startup
  const initLLM = async () => {
    const provider = await analyzer.initialize();
    if (provider !== 'none') {
      autoTrader.setMarketAnalyzer(analyzer);
      logger.info(`🧠 LLM-in-the-Loop ENABLED — provider: ${provider}`);
    } else {
      logger.warn('⚠️ No LLM provider available — running heuristic-only mode');
      logger.warn('   Set OLLAMA_MODEL, VLLM_HOST, or ANTHROPIC_API_KEY to enable intelligence');
    }
  };

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
    logger.info({
      mode: finalConfig.mode,
      unlimited: unlimitedMode,
      verticals: finalConfig.enabledVerticals,
      pollMs: finalConfig.pollIntervalMs,
      maxPositions: finalConfig.riskLimits.maxOpenPositions,
    }, 'Polymarket Trader starting');
    // Detect LLM provider before starting trading loop
    initLLM().catch(err => {
      logger.error(`LLM init failed: ${err instanceof Error ? err.message : err}`);
    });
    gasOptimizer.start();
    autoTrader.start();
    eventBus.emit('system:started');
  }

  function stop(): void {
    autoTrader.stop();
    gasOptimizer.stop();
    store.close();
    logger.info('Polymarket Trader stopped');
    eventBus.emit('system:stopped');
  }

  return { client, risk, store, drift, paper, depthFilter, gasOptimizer, splitter, brier, crowdBias, adaptiveVolume, config: finalConfig, start, stop };
}

// Re-exports
export { eventBus } from './engine/event-bus.js';
export { RiskEngine } from './engine/risk-engine.js';
export { ExperienceStore } from './learning/experience-store.js';
export { DriftMonitor } from './learning/drift-monitor.js';
export { PolymarketClient } from './integrations/polymarket-client.js';
export { KalshiClient } from './integrations/kalshi-client.js';
export { PaperTrader } from './execution/paper-trader.js';
export { DepthFilter } from './engine/depth-filter.js';
export { GasOptimizer } from './engine/gas-optimizer.js';
export { SmartOrderSplitter } from './execution/smart-order-splitter.js';
export { BrierTracker } from './learning/brier-tracker.js';
export { CrowdBiasDetector } from './strategies/crowd-bias-detector.js';
export { AdaptiveVolume } from './engine/adaptive-volume.js';
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
export { PAPER_UNLIMITED_CONFIG, PAPER_UNLIMITED_RISK_LIMITS } from './config/defaults.js';
