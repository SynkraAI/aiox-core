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
import type { KnowledgeStore } from '../intelligence/knowledge-store.js';
import type { KalshiClient } from '../integrations/kalshi-client.js';
import type { CryptoPriceClient } from '../integrations/crypto-price-client.js';
import type { AceEvolver } from '../learning/ace-evolver.js';
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
  /** Max hours until market resolves (0 = no limit). Training mode: set to 24 for fast feedback. */
  maxResolutionHours: number;
}

/** Blacklisted market entry with expiry. */
interface BlacklistEntry {
  marketId: string;
  reason: string;
  expiresAt: number; // epoch ms
}

/** Minimum confidence to emit a signal (Polystrat lesson). */
const MIN_CONFIDENCE = 0.5;

/** Blacklist TTL by reason — traded markets stay longer, rejected ones rotate faster. */
const BLACKLIST_TTL_TRADED_MS = 60 * 60 * 1000;    // 1 hour for markets we traded
const BLACKLIST_TTL_ANALYZED_MS = 30 * 60 * 1000;  // 30 min for LLM-analyzed but no edge
const BLACKLIST_TTL_HEURISTIC_MS = 10 * 60 * 1000; // 10 min for heuristic-rejected (prices may shift)

export class AutoTrader {
  private client: PolymarketClient;
  private risk: RiskEngine;
  private brier: BrierTracker;
  private crowdBias: CrowdBiasDetector;
  private adaptiveVolume: AdaptiveVolume;
  private arbStrategy: CrossPlatformArbStrategy;
  private paperTrader: PaperTrader | null = null;
  private experienceStore: ExperienceStore | null = null;
  private aceEvolver: AceEvolver | null = null;
  private marketAnalyzer: MarketAnalyzer | null = null;
  private knowledgeStore: KnowledgeStore | null = null;
  private kalshiClient: KalshiClient | null = null;
  private cryptoClient: CryptoPriceClient | null = null;
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

  /** Connect Kalshi client for multi-platform market discovery. */
  setKalshiClient(kalshi: KalshiClient): void {
    this.kalshiClient = kalshi;
  }

  /** Connect crypto price client for synthetic crypto markets. */
  setCryptoClient(crypto: CryptoPriceClient): void {
    this.cryptoClient = crypto;
  }

  /** Connect knowledge store for domain-informed heuristic trading. */
  setKnowledgeStore(knowledge: KnowledgeStore): void {
    this.knowledgeStore = knowledge;
  }

  /** Connect ACE evolver for adaptive parameter evolution. */
  setAceEvolver(ace: AceEvolver): void {
    this.aceEvolver = ace;
  }

  /** Connect experience store for learning-informed trading (Fase 1.1). */
  setExperienceStore(store: ExperienceStore): void {
    this.experienceStore = store;

    // Wire pattern blacklist: track consecutive losses per granular pattern (Fase 1.3 v2)
    // Uses vertical:coin (e.g. "crypto:BTC", "crypto:SOL") instead of whole vertical
    eventBus.on('position:closed', (position) => {
      const pnl = position.unrealizedPnl + position.realizedPnl;
      const vertical = position.market?.vertical || 'unknown';
      const question = position.signal?.marketQuestion || position.marketId || '';
      const coinMatch = question.match(/\b(Bitcoin|Ethereum|Solana|BTC|ETH|SOL)\b/i);
      const coin = coinMatch ? coinMatch[1].toUpperCase().replace('BITCOIN', 'BTC').replace('ETHEREUM', 'ETH').replace('SOLANA', 'SOL') : '';
      const pattern = coin ? `${vertical}:${coin}` : vertical;

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

  /** Add market to blacklist with reason-based TTL. */
  private blacklistMarket(marketId: string, reason: string): void {
    let ttl: number;
    switch (reason) {
      case 'llm_analyzed': ttl = BLACKLIST_TTL_TRADED_MS; break;
      case 'llm_no_edge':  ttl = BLACKLIST_TTL_ANALYZED_MS; break;
      default:             ttl = BLACKLIST_TTL_HEURISTIC_MS; break;
    }
    this.blacklist.set(marketId, {
      marketId,
      reason,
      expiresAt: Date.now() + ttl,
    });
  }

  /** Resolve expired synthetic crypto positions using live price data. */
  private async resolveSyntheticPositions(): Promise<void> {
    if (!this.cryptoClient || !this.paperTrader) return;

    const positions = this.paperTrader.getOpenPositions();
    const synthPositions = positions.filter(p => p.marketId.startsWith('synth-'));
    if (synthPositions.length === 0) return;

    for (const pos of synthPositions) {
      // Parse synthetic market info from signal
      const signal = pos.signal;
      if (!signal) continue;

      // Check if market has expired
      const question = signal.marketQuestion || '';
      const match = question.match(/in (\d+)h\?$/);
      if (!match) continue;

      const enteredAt = new Date(pos.enteredAt).getTime();
      const hoursStr = match[1];
      const endTime = enteredAt + parseInt(hoursStr) * 60 * 60 * 1000;
      if (Date.now() < endTime) continue; // Not yet expired

      // Determine coin and target from marketId: synth-bitcoin-above-85000-24h-...
      const parts = pos.marketId.split('-');
      if (parts.length < 5) continue;
      const coinSlug = parts[1]; // bitcoin, ethereum, solana
      const direction = parts[2]; // above, below
      const targetPrice = parseFloat(parts[3]);

      const symbolMap: Record<string, string> = { bitcoin: 'BTCUSDT', ethereum: 'ETHUSDT', solana: 'SOLUSDT' };
      const symbol = symbolMap[coinSlug];
      if (!symbol) continue;

      const currentPrice = await this.cryptoClient.getPrice(symbol);
      if (currentPrice <= 0) continue;

      const outcome: 'YES' | 'NO' = direction === 'above'
        ? (currentPrice >= targetPrice ? 'YES' : 'NO')
        : (currentPrice <= targetPrice ? 'YES' : 'NO');

      this.paperTrader.resolvePosition(pos.marketId, outcome);
      console.log(`[AutoTrader] CRYPTO RESOLVED: ${question.slice(0, 60)} → ${outcome} (price=$${currentPrice.toFixed(2)}, target=$${targetPrice})`);
    }
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
      void this.resolveSyntheticPositions();
      this.resolveHandle = setInterval(() => {
        void this.paperTrader?.resolveOpenPositions();
        void this.resolveSyntheticPositions();
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
      // 1. Fetch active markets (Polymarket + Kalshi)
      const polyMarkets = await this.client.getMarkets({
        active: true,
        limit: this.config.marketsPerScan,
      });

      let kalshiMarkets: Market[] = [];
      if (this.kalshiClient) {
        try {
          kalshiMarkets = await this.kalshiClient.getMarkets({ limit: 50, status: 'open' });
        } catch {
          // Kalshi fetch failed — continue with Polymarket only
        }
      }

      let cryptoMarkets: Market[] = [];
      if (this.cryptoClient) {
        try {
          cryptoMarkets = await this.cryptoClient.generateMarkets();
        } catch {
          // Crypto generation failed — continue without
        }
      }

      const markets = [...polyMarkets, ...kalshiMarkets, ...cryptoMarkets];
      if (markets.length === 0) return;

      // 2. Filter by enabled verticals, Brier halts, positions, and blacklist
      const openPositionIds = new Set(
        this.paperTrader?.getOpenPositions().map(p => p.marketId) ?? [],
      );
      const now = Date.now();
      const MIN_HOURS_BEFORE_EVENT = 2; // Allow markets resolving in 2h+ (was 24h — too restrictive)
      const SHORT_TERM_DAYS = 14;       // Markets resolving within 14 days = short-term (priority)
      const maxResHours = this.config.maxResolutionHours || 0;
      const eligible = markets.filter(m => {
        if (!this.config.enabledVerticals.includes(m.vertical)) return false;
        if (this.brier.isVerticalHalted(m.vertical)) return false;
        if (openPositionIds.has(m.id)) return false;
        if (this.isBlacklisted(m.id)) return false;
        if (m.endDate) {
          const hoursLeft = (new Date(m.endDate).getTime() - now) / (1000 * 60 * 60);
          // Reject markets that already happened or resolve within 2h (too close to settle)
          if (hoursLeft < MIN_HOURS_BEFORE_EVENT) return false;
          // Training mode: reject markets that resolve too far in the future
          if (maxResHours > 0 && hoursLeft > maxResHours) return false;
        } else if (maxResHours > 0) {
          // No endDate = unknown resolution time — skip in training mode
          return false;
        }
        return true;
      });

      // Sort: short-term markets FIRST (faster feedback loop), then by volume
      eligible.sort((a, b) => {
        const aDays = a.endDate ? (new Date(a.endDate).getTime() - now) / (1000 * 60 * 60 * 24) : 9999;
        const bDays = b.endDate ? (new Date(b.endDate).getTime() - now) / (1000 * 60 * 60 * 24) : 9999;
        const aShort = aDays <= SHORT_TERM_DAYS ? 0 : 1;
        const bShort = bDays <= SHORT_TERM_DAYS ? 0 : 1;
        if (aShort !== bShort) return aShort - bShort; // short-term first
        return (b.volume * b.liquidity) - (a.volume * a.liquidity); // then by volume×liquidity
      });

      const shortCount = eligible.filter(m => {
        const d = m.endDate ? (new Date(m.endDate).getTime() - now) / (1000 * 60 * 60 * 24) : 9999;
        return d <= SHORT_TERM_DAYS;
      }).length;
      const modeTag = maxResHours > 0 ? ` [TRAINING ≤${maxResHours}h]` : '';
      const srcParts = [`PM:${polyMarkets.length}`];
      if (kalshiMarkets.length > 0) srcParts.push(`KA:${kalshiMarkets.length}`);
      if (cryptoMarkets.length > 0) srcParts.push(`CR:${cryptoMarkets.length}`);
      const kalshiTag = srcParts.length > 1 ? ` [${srcParts.join('+')}]` : '';
      console.log(`[AutoTrader] Scan #${this.scanCount}: ${markets.length} fetched${kalshiTag}, ${eligible.length} eligible (${shortCount} short-term), ${this.blacklist.size} blacklisted${modeTag}`);

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
        // Only blacklist markets the LLM explicitly analyzed and rejected (shouldTrade=false).
        // Markets not sent to LLM (e.g. batch limit) should NOT be blacklisted — they deserve a chance next scan.
        const analyzedIds = new Set(llmSignals.map(s => s.marketId));
        for (const market of eligible) {
          if (!analyzedIds.has(market.id)) {
            // Not analyzed by LLM this round — skip blacklist, will be picked up next scan
            continue;
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

    // ── Fase 1.3 v2: Granular pattern blacklist check (vertical:coin) ──
    const coinMatch = market.question.match(/\b(Bitcoin|Ethereum|Solana|BTC|ETH|SOL)\b/i);
    const coin = coinMatch ? coinMatch[1].toUpperCase().replace('BITCOIN', 'BTC').replace('ETHEREUM', 'ETH').replace('SOLANA', 'SOL') : '';
    const granularPattern = coin ? `${market.vertical}:${coin}` : market.vertical;
    const patternLosses = this.patternLosses.get(granularPattern) || 0;
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

          // ── Overconfidence dampener ──
          // If similar trades show a pattern of high-edge losses (model was overconfident),
          // apply additional penalty to reduce edge estimate
          const overconfidentLosses = settled.filter(t =>
            t.outcome === 'LOSS' && t.edgeDetected > 0.10
          ).length;
          if (overconfidentLosses >= 2) {
            const overconfRate = overconfidentLosses / settled.length;
            experiencePenalty += overconfRate * 0.15; // Up to 15% extra penalty
            console.log(`[AutoTrader] Overconfidence dampener: ${overconfidentLosses}/${settled.length} similar trades were high-edge losses, penalty +${(overconfRate * 15).toFixed(0)}%`);
          }
        }
      }
    }

    // ── Signal 1: Price completeness mismatch ──
    // YES+NO should sum to ~1.0. Deviation indicates inefficiency.
    const priceSum = yesPrice + noPrice;
    const priceMismatch = Math.abs(priceSum - 1.0);
    const mismatchSignal = priceMismatch > 0.03 ? priceMismatch * 0.5 : 0; // dampened, not raw

    // ── Signal 2: Volume/Liquidity stress ──
    const vlRatio = market.volume > 0 ? market.liquidity / market.volume : 1;
    const liquidityStress = vlRatio < 0.05 ? 0.02 : 0; // binary flag, not scaled

    // ── Signal 3: Price mid-range opportunity ──
    // Markets in 20-80% range have more room for mispricing than extremes
    const priceExtremity = Math.abs(yesPrice - 0.5);
    const midRangeEdge = priceExtremity > 0.05 && priceExtremity < 0.30 ? 0.02 : 0;

    // ── Signal 4: Knowledge-informed vertical bias (KB-augmented) ──
    let knowledgeEdge = 0;
    let knowledgeBiasCount = 0;
    if (this.knowledgeStore) {
      const brief = this.knowledgeStore.getVerticalBrief(market.vertical);
      knowledgeBiasCount = brief.biases.length;
      // Favorite-longshot bias: prices near extremes are systematically mispriced
      if (brief.biases.includes('favorite-longshot') && priceExtremity > 0.30) {
        knowledgeEdge = 0.015;
      }
      // Anchoring bias: markets tend to anchor to round numbers
      const nearRound = Math.min(Math.abs(yesPrice % 0.10), Math.abs((yesPrice % 0.10) - 0.10));
      if (brief.biases.includes('anchoring') && nearRound < 0.02) {
        knowledgeEdge = Math.max(knowledgeEdge, 0.01);
      }
    }

    // ── Composite edge: use MAX of signals, not sum (they aren't additive) ──
    const rawEdge = Math.max(mismatchSignal, liquidityStress, midRangeEdge, knowledgeEdge);
    // Use ACE-evolved minEdge if available, otherwise fall back to config
    const aceParams = this.aceEvolver?.getPromptVersion('info_arb' as any)?.parameters;
    const effectiveMinEdge = aceParams?.minEdge ?? this.config.minEdge;
    if (rawEdge < effectiveMinEdge) return null;

    // ── Determine side: bet on the underdog (contrarian) ──
    // If YES < 50%, market says NO is likely → bet YES if we have edge (contrarian)
    // If YES > 50%, market says YES is likely → bet NO if we have edge (contrarian)
    // Avoid extremes: don't bet on 3% YES or 97% YES (near-certain outcomes)
    const side: 'YES' | 'NO' = yesPrice < 0.5 ? 'YES' : 'NO';
    const marketProb = side === 'YES' ? yesPrice : noPrice;

    const edge = Math.min(rawEdge, 0.05); // cap at 5% — heuristic has LOW conviction
    const modelProb = side === 'YES'
      ? Math.min(0.90, yesPrice + edge)
      : Math.min(0.90, noPrice + edge);

    // Confidence: base + signal convergence + experience + knowledge adjustment
    const signalCount = (mismatchSignal > 0 ? 1 : 0) + (liquidityStress > 0 ? 1 : 0) + (midRangeEdge > 0 ? 1 : 0) + (knowledgeEdge > 0 ? 1 : 0);
    const knowledgeBoost = knowledgeBiasCount > 0 ? 0.05 * Math.min(knowledgeBiasCount, 3) : 0;
    const confidence = Math.max(0.1, Math.min(0.95,
      0.3 + signalCount * 0.2 + experienceBoost - experiencePenalty + knowledgeBoost
    ));

    // Kelly-based size via Risk Engine (unified calculation)
    // Short-term markets (< 14 days) get 1.5x boost — faster feedback, more conviction
    const daysToEnd = market.endDate
      ? Math.max(0, (new Date(market.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : 9999;
    const horizonBoost = daysToEnd <= 14 ? 1.5 : 1.0;
    const kelly = this.risk.calculateKelly(modelProb, marketProb);
    const suggestedSize = Math.min(kelly.suggestedSize * horizonBoost, 25);

    if (suggestedSize < 1) return null;

    // Build reasoning with experience + knowledge context
    let reasoning = market.question;
    if (similarTradeCount > 0) {
      reasoning += ` [${similarTradeCount} similar past trades]`;
    }
    if (knowledgeEdge > 0) {
      reasoning += ` [KB: ${knowledgeBiasCount} biases detected, +${(knowledgeEdge * 100).toFixed(1)}% edge]`;
    }

    return {
      marketId: market.id,
      marketQuestion: market.question,
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
    // Prevent duplicate trades: skip if we already have an open position on this market
    const openPositionIds = new Set(
      this.paperTrader?.getOpenPositions().map(p => p.marketId) ?? [],
    );
    if (openPositionIds.has(signal.marketId)) return;

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
