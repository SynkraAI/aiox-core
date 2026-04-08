/**
 * Auto-Trader: automated market scanning + signal generation loop.
 * Connects the full pipeline: scan markets → analyze → generate signals → execute.
 *
 * This is the "brain" that makes the bot actually trade autonomously.
 */

import { eventBus } from './event-bus.js';
import type { RiskEngine } from './risk-engine.js';
import type { PolymarketClient } from '../integrations/polymarket-client.js';
import type { BrierTracker } from '../learning/brier-tracker.js';
import type { CrowdBiasDetector } from '../strategies/crowd-bias-detector.js';
import type { AdaptiveVolume } from './adaptive-volume.js';
import type { PaperTrader } from '../execution/paper-trader.js';
import type { ExperienceStore } from '../learning/experience-store.js';
import { MarketAnalyzer } from '../intelligence/market-analyzer.js';
import { CrossPlatformArbStrategy } from '../strategies/cross-platform-arb.js';
import type { Market, TradeSignal, Vertical } from '../types/index.js';

export interface AutoTraderConfig {
  /** Poll interval in ms (default from TradingConfig.pollIntervalMs) */
  pollIntervalMs: number;
  /** Enabled verticals */
  enabledVerticals: Vertical[];
  /** Markets to fetch per scan */
  marketsPerScan: number;
  /** Minimum edge to generate signal */
  minEdge: number;
}

/** Blacklisted market entry with expiry. */
interface BlacklistEntry {
  marketId: string;
  reason: string;
  expiresAt: number; // epoch ms
}

/** Minimum confidence to emit a signal (Polystrat lesson). */
const MIN_CONFIDENCE = 0.5;

/** Blacklist TTL: skip markets without edge for 1 hour. */
const BLACKLIST_TTL_MS = 60 * 60 * 1000;

export class AutoTrader {
  private client: PolymarketClient;
  private risk: RiskEngine;
  private brier: BrierTracker;
  private crowdBias: CrowdBiasDetector;
  private adaptiveVolume: AdaptiveVolume;
  private arbStrategy: CrossPlatformArbStrategy;
  private paperTrader: PaperTrader | null = null;
  private experienceStore: ExperienceStore | null = null;
  private marketAnalyzer: MarketAnalyzer | null = null;
  private config: AutoTraderConfig;

  // Market blacklist — skip markets analyzed without edge for TTL period
  private blacklist: Map<string, BlacklistEntry> = new Map();

  // Pattern blacklist — skip patterns with 3+ consecutive losses (Fase 1.3)
  private patternLosses: Map<string, number> = new Map();
  private static readonly PATTERN_LOSS_THRESHOLD = 3;

  private running = false;
  private pollHandle: ReturnType<typeof setInterval> | null = null;
  private resolveHandle: ReturnType<typeof setInterval> | null = null;
  private scanCount = 0;
  private signalCount = 0;
  private blacklistHits = 0;
  private arbSignals = 0;

  constructor(
    client: PolymarketClient,
    risk: RiskEngine,
    brier: BrierTracker,
    crowdBias: CrowdBiasDetector,
    adaptiveVolume: AdaptiveVolume,
    config: AutoTraderConfig,
  ) {
    this.client = client;
    this.risk = risk;
    this.brier = brier;
    this.crowdBias = crowdBias;
    this.adaptiveVolume = adaptiveVolume;
    this.arbStrategy = new CrossPlatformArbStrategy({ minArbPercent: 1.5 });
    this.config = config;
  }

  /** Connect the paper trader for position resolution. */
  setPaperTrader(paper: PaperTrader): void {
    this.paperTrader = paper;
  }

  /** Connect LLM market analyzer for intelligent trading (Fase 2). */
  setMarketAnalyzer(analyzer: MarketAnalyzer): void {
    this.marketAnalyzer = analyzer;
  }

  /** Connect experience store for learning-informed trading (Fase 1.1). */
  setExperienceStore(store: ExperienceStore): void {
    this.experienceStore = store;

    // Wire pattern blacklist: track consecutive losses per pattern (Fase 1.3)
    eventBus.on('position:closed', (position) => {
      const pnl = position.unrealizedPnl + position.realizedPnl;
      const pattern = `${position.market?.vertical || 'unknown'}`;
      if (pnl < 0) {
        const losses = (this.patternLosses.get(pattern) || 0) + 1;
        this.patternLosses.set(pattern, losses);
        if (losses >= AutoTrader.PATTERN_LOSS_THRESHOLD) {
          console.log(`[AutoTrader] Pattern blacklisted: ${pattern} (${losses} consecutive losses)`);
        }
      } else {
        this.patternLosses.set(pattern, 0); // Reset on win
      }
    });
  }

  /** Add market to blacklist (no edge found, skip for TTL). */
  private blacklistMarket(marketId: string, reason: string): void {
    this.blacklist.set(marketId, {
      marketId,
      reason,
      expiresAt: Date.now() + BLACKLIST_TTL_MS,
    });
  }

  /** Check if market is blacklisted (and clean expired entries). */
  private isBlacklisted(marketId: string): boolean {
    const entry = this.blacklist.get(marketId);
    if (!entry) return false;
    if (Date.now() > entry.expiresAt) {
      this.blacklist.delete(marketId);
      return false;
    }
    this.blacklistHits++;
    return true;
  }

  /** Start the auto-trading loop. */
  start(): void {
    if (this.running) return;
    this.running = true;

    console.log(`[AutoTrader] Starting — poll every ${this.config.pollIntervalMs}ms, ${this.config.enabledVerticals.length} verticals, minEdge ${this.config.minEdge}`);

    // Run immediately, then on interval
    void this.scanAndTrade();

    this.pollHandle = setInterval(() => {
      this.scanAndTrade().catch(err => {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`[AutoTrader] Scan failed: ${msg}`);
      });
    }, this.config.pollIntervalMs);

    // Resolution check every 5 minutes — settle closed markets
    if (this.paperTrader) {
      void this.paperTrader.resolveOpenPositions();
      this.resolveHandle = setInterval(() => {
        void this.paperTrader?.resolveOpenPositions();
      }, 5 * 60 * 1000);
    }

    eventBus.emit('auto-trader:started', { pollMs: this.config.pollIntervalMs });
  }

  /** Stop the auto-trading loop. */
  stop(): void {
    if (!this.running) return;
    this.running = false;
    if (this.pollHandle) {
      clearInterval(this.pollHandle);
      this.pollHandle = null;
    }
    if (this.resolveHandle) {
      clearInterval(this.resolveHandle);
      this.resolveHandle = null;
    }
    eventBus.emit('auto-trader:stopped', { scans: this.scanCount, signals: this.signalCount });
  }

  /** Single scan + trade cycle. */
  private async scanAndTrade(): Promise<void> {
    if (!this.running) return;

    this.scanCount++;
    this.adaptiveVolume.recordScan();

    try {
      // 1. Fetch active markets
      const markets = await this.client.getMarkets({
        active: true,
        limit: this.config.marketsPerScan,
      });

      if (markets.length === 0) return;

      // 2. Filter by enabled verticals, Brier halts, positions, and blacklist
      const openPositionIds = new Set(
        this.paperTrader?.getOpenPositions().map(p => p.marketId) ?? [],
      );
      const now = Date.now();
      const MIN_HOURS_BEFORE_EVENT = 24; // Only trade markets with 24h+ until resolution
      const eligible = markets.filter(m => {
        if (!this.config.enabledVerticals.includes(m.vertical)) return false;
        if (this.brier.isVerticalHalted(m.vertical)) return false;
        if (openPositionIds.has(m.id)) return false;
        if (this.isBlacklisted(m.id)) return false;
        // Reject markets whose event already happened or resolves within 24h
        if (m.endDate) {
          const hoursLeft = (new Date(m.endDate).getTime() - now) / (1000 * 60 * 60);
          if (hoursLeft < MIN_HOURS_BEFORE_EVENT) return false;
        }
        return true;
      });

      console.log(`[AutoTrader] Scan #${this.scanCount}: ${markets.length} fetched, ${eligible.length} eligible, ${this.blacklist.size} blacklisted`);

      // 3. Complete-set & cross-market arb scan (structural edge)
      const arbs = this.arbStrategy.scanForArbitrage(eligible);
      for (const arb of arbs) {
        const arbSignals = this.arbStrategy.toSignals(arb);
        this.arbSignals += arbSignals.length;
        console.log(`[AutoTrader] ARB ${arb.type}: profit=${arb.profitPercent.toFixed(2)}% cost=$${arb.totalCost.toFixed(3)} (${arbSignals.length} legs)`);
      }

      // 4. Crowd bias scan — find contrarian opportunities
      const biasSignals = this.crowdBias.scanAll(eligible);
      for (const bias of biasSignals) {
        const bankroll = this.risk.getState().bankroll;
        const signal = this.crowdBias.toTradeSignal(bias, bankroll);
        if (signal.confidence < MIN_CONFIDENCE) continue; // Confidence gate
        const volumeCheck = this.adaptiveVolume.shouldTrade(signal.edge, signal.suggestedSize * signal.edge);
        if (volumeCheck.shouldTrade) {
          this.emitSignal(signal);
        }
      }

      // 5. Main strategy: LLM-first if available, fallback to heuristic
      if (this.marketAnalyzer) {
        // Fase 2: Claude analyzes top candidates
        const bankroll = this.risk.getState().bankroll;
        const llmSignals = await this.marketAnalyzer.analyzeMarkets(eligible, bankroll);
        for (const signal of llmSignals) {
          const volumeCheck = this.adaptiveVolume.shouldTrade(signal.edge, signal.suggestedSize * signal.edge);
          if (volumeCheck.shouldTrade) {
            this.emitSignal(signal);
          }
          // Blacklist analyzed markets to avoid re-analyzing next scan
          this.blacklistMarket(signal.marketId, 'llm_analyzed');
        }
        // Blacklist markets LLM rejected too
        for (const market of eligible) {
          if (!llmSignals.some(s => s.marketId === market.id)) {
            this.blacklistMarket(market.id, 'llm_no_edge');
          }
        }
      } else {
        // Fallback: heuristic analysis (original logic)
        for (const market of eligible) {
          const signal = this.analyzeMarket(market);
          if (!signal) {
            this.blacklistMarket(market.id, 'no_edge');
            continue;
          }

          if (signal.confidence < MIN_CONFIDENCE) {
            this.blacklistMarket(market.id, 'low_confidence');
            continue;
          }

          const volumeCheck = this.adaptiveVolume.shouldTrade(signal.edge, signal.suggestedSize * signal.edge);
          if (!volumeCheck.shouldTrade) continue;

          this.emitSignal(signal);
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[AutoTrader] Scan error: ${msg}`);
      eventBus.emit('system:error', { component: 'auto-trader', error: msg });
    }
  }

  /**
   * Analyze a single market for trading opportunity.
   *
   * UltraPlan v2 Fase 1: Now consults Experience Store before generating signals.
   * Checks similar past trades, pattern blacklist, and adjusts confidence
   * based on historical performance in similar markets.
   */
  private analyzeMarket(market: Market): TradeSignal | null {
    const yesPrice = market.tokens.yes.price;
    const noPrice = market.tokens.no.price;

    // Skip markets with no real pricing or near-certain outcomes
    if (yesPrice <= 0.03 || yesPrice >= 0.97) return null;
    if (market.liquidity < 100) return null;

    // ── Fase 1.3: Pattern blacklist check ──
    const pattern = market.vertical;
    const patternLosses = this.patternLosses.get(pattern) || 0;
    if (patternLosses >= AutoTrader.PATTERN_LOSS_THRESHOLD) return null;

    // ── Fase 1.1: Consult Experience Store for similar trades ──
    let experienceBoost = 0;
    let experiencePenalty = 0;
    let similarTradeCount = 0;

    if (this.experienceStore) {
      const similar = this.experienceStore.findSimilar(market.question, market.vertical, 5);
      similarTradeCount = similar.length;

      if (similar.length > 0) {
        const settled = similar.filter(t => t.outcome !== 'PENDING');
        if (settled.length > 0) {
          const wins = settled.filter(t => t.outcome === 'WIN').length;
          const winRate = wins / settled.length;

          // If we've traded similar markets and lost >60% of the time, skip
          if (settled.length >= 3 && winRate < 0.4) {
            console.log(`[AutoTrader] Skipping "${market.question.substring(0, 50)}..." — similar trades WR=${(winRate * 100).toFixed(0)}% (${wins}/${settled.length})`);
            return null;
          }

          // Boost confidence if we have winning experience
          if (winRate > 0.6) experienceBoost = 0.1;
          // Penalize if poor track record
          if (winRate < 0.5 && settled.length >= 2) experiencePenalty = 0.1;
        }
      }
    }

    // ── Signal 1: Price completeness check ──
    const priceSum = yesPrice + noPrice;
    const priceMismatch = Math.abs(priceSum - 1.0);
    const mismatchSignal = priceMismatch > 0.02 ? priceMismatch : 0;

    // ── Signal 2: Volume/Liquidity ratio ──
    const vlRatio = market.volume > 0 ? market.liquidity / market.volume : 1;
    const liquidityStress = vlRatio < 0.05 ? (0.05 - vlRatio) * 10 : 0;

    // ── Signal 3: Price extremity bias ──
    const priceExtremity = Math.abs(yesPrice - 0.5);
    const extremityEdge = priceExtremity > 0.10 && priceExtremity < 0.35 ? priceExtremity * 0.15 : 0;

    // ── Composite edge ──
    const rawEdge = mismatchSignal + liquidityStress + extremityEdge;
    if (rawEdge < this.config.minEdge) return null;

    // ── Determine side ──
    let side: 'YES' | 'NO';
    if (priceMismatch > 0.02 && priceSum < 1.0) {
      side = yesPrice < noPrice ? 'YES' : 'NO';
    } else if (priceMismatch > 0.02 && priceSum > 1.0) {
      side = yesPrice > noPrice ? 'NO' : 'YES';
    } else {
      side = yesPrice < 0.5 ? 'YES' : 'NO';
    }
    const marketProb = side === 'YES' ? yesPrice : noPrice;

    const edge = Math.min(rawEdge, 0.15);
    const modelProb = side === 'YES'
      ? Math.min(0.95, yesPrice + edge)
      : Math.min(0.95, noPrice + edge);

    // Confidence: base + signal convergence + experience adjustment
    const signalCount = (mismatchSignal > 0 ? 1 : 0) + (liquidityStress > 0 ? 1 : 0) + (extremityEdge > 0 ? 1 : 0);
    const confidence = Math.max(0.1, Math.min(0.95,
      0.3 + signalCount * 0.2 + experienceBoost - experiencePenalty
    ));

    // Kelly-based size (UltraPlan v2: Kelly 5% from config)
    const bankroll = Math.max(this.risk.getState().bankroll, 1);
    const kellyFraction = Math.max(0, edge / (1 - marketProb));
    const suggestedSize = Math.min(bankroll * kellyFraction * 0.05, 25);

    if (suggestedSize < 1) return null;

    // Build reasoning with experience context
    let reasoning = market.question;
    if (similarTradeCount > 0) {
      reasoning += ` [${similarTradeCount} similar past trades found]`;
    }

    return {
      marketId: market.id,
      vertical: market.vertical,
      strategy: 'info_arb',
      side,
      modelProbability: modelProb,
      marketProbability: marketProb,
      edge,
      confidence,
      suggestedSize: Math.round(suggestedSize * 100) / 100,
      reasoning,
      timestamp: new Date(),
    };
  }

  private emitSignal(signal: TradeSignal): void {
    this.signalCount++;
    console.log(`[AutoTrader] Signal #${this.signalCount}: ${signal.vertical} ${signal.side} edge=${(signal.edge*100).toFixed(1)}% size=$${signal.suggestedSize}`);
    eventBus.emit('signal:detected', signal);
  }

  getStats() {
    return {
      running: this.running,
      scans: this.scanCount,
      signals: this.signalCount,
      arbSignals: this.arbSignals,
      blacklistSize: this.blacklist.size,
      blacklistHits: this.blacklistHits,
      volumeTarget: this.adaptiveVolume.getCurrentTarget(),
      volumeStats: this.adaptiveVolume.getStats(),
    };
  }
}
