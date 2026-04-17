/**
 * Paper Trading Engine.
 * Simulates trade execution with real market data.
 * All trades are logged to Procedural Memory exactly like real trades.
 * D4: 30 days mandatory paper trading before real capital.
 */

import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { eventBus } from '../engine/event-bus.js';
import { ExperienceStore } from '../learning/experience-store.js';
import { RiskEngine } from '../engine/risk-engine.js';
import type { PolymarketClient } from '../integrations/polymarket-client.js';
import type { KalshiClient } from '../integrations/kalshi-client.js';
import type { TradeSignal, TradeExperience, Side } from '../types/index.js';

interface PaperPosition {
  marketId: string;
  tokenId: string;
  side: Side;
  size: number;
  entryPrice: number;
  enteredAt: Date;
  signal: TradeSignal;
}

export class PaperTrader {
  private positions: Map<string, PaperPosition> = new Map();
  private client: PolymarketClient;
  private kalshi: KalshiClient | null = null;
  private store: ExperienceStore;
  private risk: RiskEngine;
  private startedAt: Date;
  private tradeCount = 0;
  private positionsFile: string;

  constructor(client: PolymarketClient, store: ExperienceStore, risk: RiskEngine) {
    this.client = client;
    this.store = store;
    this.risk = risk;
    this.startedAt = new Date();
    this.positionsFile = join(process.cwd(), 'data', 'open-positions.json');
    this.loadPositions();
    this.wireEvents();
  }

  /** Connect Kalshi client for cross-platform position resolution (P1 of hybrid refactor). */
  setKalshiClient(kalshi: KalshiClient): void {
    this.kalshi = kalshi;
  }

  /** Load persisted positions from disk (survives restarts). */
  private loadPositions(): void {
    try {
      if (!existsSync(this.positionsFile)) return;
      const raw = JSON.parse(readFileSync(this.positionsFile, 'utf-8')) as PaperPosition[];
      for (const p of raw) {
        p.enteredAt = new Date(p.enteredAt);
        p.signal.timestamp = new Date(p.signal.timestamp);
        this.positions.set(p.marketId, p);
      }
      if (raw.length > 0) {
        console.log(`[PaperTrader] Restored ${raw.length} open positions from disk`);
      }
    } catch (err) {
      console.error(`[PaperTrader] Failed to load positions: ${err instanceof Error ? err.message : err}`);
    }
  }

  /** Persist open positions to disk. */
  private savePositions(): void {
    try {
      const data = [...this.positions.values()];
      writeFileSync(this.positionsFile, JSON.stringify(data, null, 2));
    } catch { /* non-critical — positions still in memory */ }
  }

  private wireEvents(): void {
    eventBus.on('signal:approved', (signal) => {
      this.executePaperTrade(signal);
    });
  }

  async executePaperTrade(signal: TradeSignal): Promise<void> {
    const startTime = Date.now();

    // Get real market data for realistic simulation
    let currentPrice: number;
    let orderBook: { spread: number; midpoint: number } | null = null;
    try {
      const tokenId = signal.side === 'YES' ? signal.marketId : signal.marketId;
      currentPrice = await this.client.getMidpoint(tokenId);
      // Fase 3.1: Try to get orderbook for realistic slippage estimation
      try {
        orderBook = await this.client.getOrderBook(tokenId);
      } catch { /* orderbook unavailable, use estimate */ }
    } catch {
      currentPrice = signal.marketProbability;
    }

    // Fase 3.1: Orderbook-based slippage estimation (real data when available)
    let slippage: number;
    let fillPrice: number;
    let executionMode: 'maker' | 'taker';

    if (orderBook && orderBook.spread < 0.03) {
      // Fase 3.2: Maker-first execution simulation
      // If spread is tight (<3%), simulate maker order (limit at midpoint)
      // Maker fee = 0% + potential rebate
      executionMode = 'maker';
      slippage = orderBook.spread * 0.25; // Maker gets better fill (25% of spread)
      fillPrice = signal.side === 'YES'
        ? orderBook.midpoint + slippage
        : orderBook.midpoint - slippage;
    } else if (signal.suggestedSize > 20) {
      // Fase 3.3: Large orders use orderbook depth for slippage
      // Walk the book: larger orders eat more liquidity
      executionMode = 'taker';
      const sizeImpact = Math.min(signal.suggestedSize / 500, 0.03); // 0-3% impact
      const baseSlippage = orderBook ? orderBook.spread * 0.5 : 0.005;
      slippage = baseSlippage + sizeImpact;
      fillPrice = signal.side === 'YES'
        ? currentPrice + slippage
        : currentPrice - slippage;
    } else {
      // Small taker order — standard slippage
      executionMode = 'taker';
      slippage = 0.005 + (signal.suggestedSize / 1000) * 0.015;
      fillPrice = signal.side === 'YES'
        ? currentPrice + slippage
        : currentPrice - slippage;
    }

    // Fase 3.2: Fee calculation based on execution mode
    const takerFee = executionMode === 'maker'
      ? 0 // Maker = 0% fee (+ potential rebate)
      : signal.suggestedSize * 0.01; // Taker ~1%
    const gasFee = 0.01; // Negligible on Polygon

    const fillTimeMs = Date.now() - startTime;

    // Record to Procedural Memory
    const experience: Omit<TradeExperience, 'id'> = {
      timestamp: new Date(),
      marketId: signal.marketId,
      vertical: signal.vertical,
      strategy: signal.strategy,
      marketQuestion: signal.marketQuestion || signal.reasoning,
      signalConfidence: signal.confidence,
      modelProbability: signal.modelProbability,
      marketProbability: signal.marketProbability,
      edgeDetected: signal.edge,
      positionSize: signal.suggestedSize,
      kellyFraction: this.risk.getState().bankroll > 0
        ? signal.suggestedSize / this.risk.getState().bankroll
        : 0,
      side: signal.side,
      entryPrice: fillPrice,
      slippage,
      gasFee,
      takerFee,
      fillTimeMs,
      outcome: 'PENDING',
      exitPrice: 0,
      pnl: 0,
      lesson: '',
      // P4 hybrid refactor: tag source as real|synth so gate can filter honestly.
      // Synth markets are always prefixed `synth-*` in auto-trader; everything else is real.
      tags: [
        'paper-trade',
        `exec-${executionMode}`,
        signal.marketId.startsWith('synth-') ? 'source:synth' : 'source:real',
      ],
      similarPastTrades: [],
      metadata: {
        paperTrade: true,
        realMarketPrice: currentPrice,
        executionMode,
        orderbookSpread: orderBook?.spread ?? null,
        orderbookMidpoint: orderBook?.midpoint ?? null,
        source: signal.marketId.startsWith('synth-') ? 'synth' : 'real',
      },
    };

    // Track position FIRST (before store.record) to avoid race condition
    this.positions.set(signal.marketId, {
      marketId: signal.marketId,
      tokenId: signal.marketId,
      side: signal.side,
      size: signal.suggestedSize,
      entryPrice: fillPrice,
      enteredAt: new Date(),
      signal,
    });
    this.savePositions();

    // Record to Procedural Memory (after position tracked)
    this.store.record(experience);
    this.tradeCount++;

    // Emit position opened
    eventBus.emit('position:opened', {
      marketId: signal.marketId,
      market: {
        id: signal.marketId, question: signal.reasoning, slug: '', vertical: signal.vertical,
        endDate: '', active: true, closed: false, tokens: { yes: { tokenId: '', price: currentPrice, outcome: 'Yes' }, no: { tokenId: '', price: 1 - currentPrice, outcome: 'No' } },
        volume: 0, liquidity: 0, lastPrice: currentPrice,
      },
      side: signal.side,
      size: signal.suggestedSize,
      averageEntry: fillPrice,
      currentPrice,
      unrealizedPnl: 0,
      realizedPnl: 0,
    });
  }

  /**
   * Resolve a paper position (when market settles).
   */
  resolvePosition(marketId: string, outcome: 'YES' | 'NO'): void {
    const position = this.positions.get(marketId);
    if (!position) return;

    const won = position.side === outcome;
    const exitPrice = won ? 1.0 : 0.0;
    const grossPnl = won
      ? (exitPrice - position.entryPrice) * position.size
      : -position.entryPrice * position.size;

    // Emit position closed with P&L
    eventBus.emit('position:closed', {
      marketId,
      market: {
        id: marketId, question: '', slug: '', vertical: position.signal.vertical,
        endDate: '', active: false, closed: true,
        tokens: { yes: { tokenId: '', price: exitPrice, outcome: 'Yes' }, no: { tokenId: '', price: 1 - exitPrice, outcome: 'No' } },
        volume: 0, liquidity: 0, lastPrice: exitPrice,
      },
      side: position.side,
      size: position.size,
      averageEntry: position.entryPrice,
      currentPrice: exitPrice,
      unrealizedPnl: 0,
      realizedPnl: grossPnl,
      pnl: grossPnl,
    });

    this.positions.delete(marketId);
    this.savePositions();
  }

  getStatus(): {
    mode: 'paper';
    startedAt: Date;
    daysRunning: number;
    tradeCount: number;
    openPositions: number;
    readyForLive: boolean;
  } {
    const daysRunning = Math.floor((Date.now() - this.startedAt.getTime()) / (1000 * 60 * 60 * 24));
    const stats = this.store.getStats();

    return {
      mode: 'paper',
      startedAt: this.startedAt,
      daysRunning,
      tradeCount: this.tradeCount,
      openPositions: this.positions.size,
      readyForLive: daysRunning >= 30 && stats.total >= 500 && stats.winRate > 0.60,
    };
  }

  getOpenPositions(): PaperPosition[] {
    return [...this.positions.values()];
  }

  /**
   * Check open positions against Gamma API for resolved markets.
   * Called periodically by the auto-trader to settle paper positions.
   *
   * P1 of hybrid refactor: now also resolves Kalshi positions (marketId starts with `kalshi:`).
   * Synthetic markets (`synth-*`) are resolved elsewhere by AutoTrader.resolveSyntheticPositions.
   */
  async resolveOpenPositions(): Promise<number> {
    if (this.positions.size === 0) return 0;

    const allIds = [...this.positions.keys()];
    const polyIds = allIds.filter(id => !id.startsWith('kalshi:') && !id.startsWith('synth-'));
    const kalshiIds = allIds.filter(id => id.startsWith('kalshi:'));
    let resolved = 0;

    // Polymarket branch
    if (polyIds.length > 0) {
      try {
        const resolvedMarkets = await this.client.getResolvedMarkets(polyIds);
        for (const market of resolvedMarkets) {
          const yesWon = market.tokens.yes.price >= 0.99;
          const noWon = market.tokens.no.price >= 0.99;
          if (!yesWon && !noWon) continue;
          const outcome: 'YES' | 'NO' = yesWon ? 'YES' : 'NO';
          this.resolvePosition(market.id, outcome);
          resolved++;
          console.log(`[PaperTrader] Resolved Polymarket ${market.id}: ${outcome} won — "${market.question.slice(0, 60)}"`);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`[PaperTrader] Polymarket resolution check error: ${msg}`);
      }
    }

    // Kalshi branch (P1 hybrid refactor)
    if (this.kalshi && kalshiIds.length > 0) {
      for (const marketId of kalshiIds) {
        try {
          const ticker = marketId.substring('kalshi:'.length);
          const km = await this.kalshi.getMarket(ticker);
          if (!km) continue;
          // Kalshi settled markets expose yes/no prices at 0 or 1 in parseMarket
          const yesWon = km.tokens.yes.price >= 0.99;
          const noWon = km.tokens.no.price >= 0.99;
          // Also treat `closed` status as settled (parseMarket sets closed=true for settled)
          if (!km.closed && !yesWon && !noWon) continue;
          if (!yesWon && !noWon) continue;
          const outcome: 'YES' | 'NO' = yesWon ? 'YES' : 'NO';
          this.resolvePosition(marketId, outcome);
          resolved++;
          console.log(`[PaperTrader] Resolved Kalshi ${ticker}: ${outcome} won — "${km.question.slice(0, 60)}"`);
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          console.error(`[PaperTrader] Kalshi resolution error for ${marketId}: ${msg}`);
        }
      }
    }

    return resolved;
  }
}
