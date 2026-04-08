/**
 * Paper Trading Engine.
 * Simulates trade execution with real market data.
 * All trades are logged to Procedural Memory exactly like real trades.
 * D4: 30 days mandatory paper trading before real capital.
 */

import { eventBus } from '../engine/event-bus.js';
import { ExperienceStore } from '../learning/experience-store.js';
import { RiskEngine } from '../engine/risk-engine.js';
import type { PolymarketClient } from '../integrations/polymarket-client.js';
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
  private store: ExperienceStore;
  private risk: RiskEngine;
  private startedAt: Date;
  private tradeCount = 0;

  constructor(client: PolymarketClient, store: ExperienceStore, risk: RiskEngine) {
    this.client = client;
    this.store = store;
    this.risk = risk;
    this.startedAt = new Date();
    this.wireEvents();
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
      marketQuestion: signal.reasoning,
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
      tags: ['paper-trade', `exec-${executionMode}`],
      similarPastTrades: [],
      metadata: {
        paperTrade: true,
        realMarketPrice: currentPrice,
        executionMode,
        orderbookSpread: orderBook?.spread ?? null,
        orderbookMidpoint: orderBook?.midpoint ?? null,
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
   */
  async resolveOpenPositions(): Promise<number> {
    if (this.positions.size === 0) return 0;

    const marketIds = [...this.positions.keys()];
    let resolved = 0;

    try {
      const resolvedMarkets = await this.client.getResolvedMarkets(marketIds);

      for (const market of resolvedMarkets) {
        // outcomePrices: YES=1.0 means YES won, NO=1.0 means NO won
        const yesWon = market.tokens.yes.price >= 0.99;
        const noWon = market.tokens.no.price >= 0.99;

        if (!yesWon && !noWon) continue; // Not fully resolved yet

        const outcome: 'YES' | 'NO' = yesWon ? 'YES' : 'NO';
        this.resolvePosition(market.id, outcome);
        resolved++;
        console.log(`[PaperTrader] Resolved ${market.id}: ${outcome} won — "${market.question.slice(0, 60)}"`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[PaperTrader] Resolution check error: ${msg}`);
    }

    return resolved;
  }
}
