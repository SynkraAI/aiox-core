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

import './dns-override.js'; // MUST be first — bypass ISP DNS filtering for polymarket/kalshi
import { join } from 'path';
import { existsSync, mkdirSync, readFileSync } from 'fs';

// Load .env file early — ensures all entrypoints (CLI, Telegram, Dashboard) get env vars
try {
  const envPath = join(process.cwd(), '.env');
  const envContent = readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
} catch { /* no .env file, use system env */ }
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
import { KnowledgeStore } from './intelligence/knowledge-store.js';
import { KalshiClient } from './integrations/kalshi-client.js';
// PM-PIVOT-1: CryptoPriceClient deletado, synth eliminado
import { AceEvolver } from './learning/ace-evolver.js';
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
  ace: AceEvolver;
  depthFilter: DepthFilter;
  gasOptimizer: GasOptimizer;
  splitter: SmartOrderSplitter;
  brier: BrierTracker;
  crowdBias: CrowdBiasDetector;
  adaptiveVolume: AdaptiveVolume;
  config: TradingConfig;
  start: () => Promise<void>;
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

  // ACE Evolver: adaptive parameter evolution based on trade results
  const ace = new AceEvolver();

  // Wire ACE to trade results — feed every settled trade for evolution tracking
  eventBus.on('position:closed', () => {
    const trade = store.getRecent(1)[0];
    if (trade && trade.outcome !== 'PENDING') {
      ace.recordResult(trade);
      const evolution = ace.checkAndEvolve();
      if (evolution) {
        logger.info({ strategy: evolution.strategy, from: evolution.fromVersion, to: evolution.toVersion, changes: evolution.changes, reason: evolution.reason }, '🧬 ACE EVOLUTION — strategy parameters adapted');
      }
    }
  });

  // Liquidity Maximizer modules
  const depthFilter = new DepthFilter(client);
  const gasOptimizer = new GasOptimizer();
  const splitter = new SmartOrderSplitter(gasOptimizer, depthFilter);

  // Conclave modules (2026-04-04 recommendations)
  const brier = new BrierTracker(finalConfig.riskLimits.maxOpenPositions > 100 ? 0.30 : 0.25);
  const crowdBias = new CrowdBiasDetector();
  const adaptiveVolume = new AdaptiveVolume();

  // Strategy Scorer: bridge between signal:detected → signal:approved
  // Listens for signal:detected events, scores them, runs through risk engine,
  // and emits signal:approved (consumed by paper trader)
  // StrategyScorer wires itself to eventBus in constructor (signal:detected → signal:approved)
  new StrategyScorer(risk);

  // Load knowledge base for context-augmented analysis
  const knowledgePath = process.env.KNOWLEDGE_BASE_PATH || 'D:/jarvis/mega brain/knowledge/prediction-markets';
  const knowledge = new KnowledgeStore();
  const kbLoaded = knowledge.loadFromDirectory(knowledgePath);
  if (kbLoaded > 0) {
    logger.info(`📚 Knowledge base loaded: ${kbLoaded} documents`);
  }

  // Auto-Trader: the brain that makes it all trade autonomously.
  // PM-PIVOT-1: synth deletado; default maxResolutionHours = 168 (7d).
  const llmBatchSize = Number(process.env.LLM_BATCH_SIZE) || 5;
  const autoTrader = new AutoTrader(client, risk, brier, crowdBias, adaptiveVolume, {
    pollIntervalMs: finalConfig.pollIntervalMs,
    enabledVerticals: finalConfig.enabledVerticals,
    marketsPerScan: unlimitedMode ? 100 : 50,
    minEdge: finalConfig.riskLimits.minEdge,
    maxResolutionHours: Number(process.env.MAX_RESOLUTION_HOURS) || 168,
    minLiquidity: 100,
    llmBatchSize,
  });

  // Connect paper trader to auto-trader for position resolution
  autoTrader.setPaperTrader(paper);

  // Fase 1.1: Connect experience store for learning-informed trading
  autoTrader.setExperienceStore(store);

  // Connect ACE evolver for adaptive parameter evolution
  autoTrader.setAceEvolver(ace);

  // Connect knowledge store to auto-trader for heuristic enhancement
  if (kbLoaded > 0) {
    autoTrader.setKnowledgeStore(knowledge);
  }

  // Multi-platform: connect Kalshi for expanded market discovery.
  // PM-PIVOT-1: synth (CryptoPriceClient) deletado — capital morto > 7d, real-only.
  const kalshi = new KalshiClient();
  autoTrader.setKalshiClient(kalshi);
  // P1 hybrid refactor: share Kalshi client with paper trader for resolution
  paper.setKalshiClient(kalshi);
  logger.info('🌐 Real-only mode: Polymarket + Kalshi (synth deletado em PM-PIVOT-1)');

  // Fase 2: LLM-in-the-Loop — auto-detect best available provider
  const analyzer = new MarketAnalyzer(client, store, {
    apiKey: process.env.ANTHROPIC_API_KEY || '',
    claudeModel: process.env.LLM_CLAUDE_MODEL || 'claude-haiku-4-5-20251001',
    ollamaHost: process.env.OLLAMA_HOST || 'http://localhost:11434',
    ollamaModel: process.env.OLLAMA_MODEL || 'qwen2.5:7b',
    vllmHost: process.env.VLLM_HOST || 'http://localhost:8000',
    vllmModel: process.env.VLLM_MODEL || '',
    openaiApiKey: process.env.OPENAI_API_KEY || '',
    openaiModel: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    maxMarketsPerScan: unlimitedMode ? 30 : 10,
    minVolumeForAnalysis: unlimitedMode ? 1000 : 5000,
    minLiquidityForAnalysis: unlimitedMode ? 500 : 2000,
    // PM-PIVOT-1: OPENAI_DAILY_BUDGET_USD has priority (Conclave Ng — bot morreu por budget esgotado)
    dailyBudgetUsd: parseFloat(process.env.OPENAI_DAILY_BUDGET_USD || process.env.LLM_DAILY_BUDGET || '5'),
  });

  // Connect knowledge to analyzer
  if (kbLoaded > 0) {
    analyzer.setKnowledgeStore(knowledge);
  }

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

  // Wire Brier Tracker: record forecast vs outcome on position close
  eventBus.on('position:closed', (position) => {
    const vertical = position.market?.vertical;
    if (!vertical) return;
    // Find the trade in experience store to get modelProbability
    const recentTrades = store.getRecent(5);
    const trade = recentTrades.find(t => t.marketId === position.marketId);
    if (!trade || trade.outcome === 'PENDING') return;
    const forecast = trade.modelProbability;
    const outcome: 0 | 1 = trade.outcome === 'WIN' ? 1 : 0;
    brier.record(position.marketId, vertical, forecast, outcome);
  });

  eventBus.on('learning:lesson-extracted', ({ tradeId, lesson }) => {
    logger.info({ tradeId, lesson }, '📝 Lesson extracted from trade');
  });

  eventBus.on('learning:prompt-evolved', (result) => {
    logger.info({ strategy: result.strategy, version: result.toVersion, changes: result.changes }, '🧬 Prompt evolved');
  });

  async function start(): Promise<void> {
    logger.info({
      mode: finalConfig.mode,
      unlimited: unlimitedMode,
      verticals: finalConfig.enabledVerticals,
      pollMs: finalConfig.pollIntervalMs,
      maxPositions: finalConfig.riskLimits.maxOpenPositions,
    }, 'Polymarket Trader starting');
    // Detect LLM provider BEFORE starting trading loop — ensures first scan has LLM
    try {
      await initLLM();
    } catch (err) {
      logger.error(`LLM init failed: ${err instanceof Error ? err.message : err}`);
    }
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

  return { client, risk, store, drift, paper, ace, depthFilter, gasOptimizer, splitter, brier, crowdBias, adaptiveVolume, config: finalConfig, start, stop };
}

// Re-exports
export { eventBus } from './engine/event-bus.js';
export { RiskEngine } from './engine/risk-engine.js';
export { ExperienceStore } from './learning/experience-store.js';
export { KnowledgeStore } from './intelligence/knowledge-store.js';
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
