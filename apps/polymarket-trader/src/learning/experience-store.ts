/**
 * Procedural Memory: Experience Store for trades.
 * Every trade becomes a stored experience that future decisions can query.
 * Uses JSON file storage (zero native deps). Swap to SQLite when needed.
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { randomUUID } from 'crypto';
import { eventBus } from '../engine/event-bus.js';
import type { TradeExperience, Vertical, StrategyId, TradeOutcome } from '../types/index.js';

export class ExperienceStore {
  private trades: TradeExperience[] = [];
  private dbPath: string;
  private dirty = false;
  private flushInterval: ReturnType<typeof setInterval> | null = null;

  constructor(dbPath: string) {
    this.dbPath = dbPath;
    this.load();

    // Auto-flush every 10 seconds if dirty
    this.flushInterval = setInterval(() => {
      if (this.dirty) this.flush();
    }, 10_000);

    this.wireEvents();
  }

  private wireEvents(): void {
    eventBus.on('position:closed', (position) => {
      const pnl = position.unrealizedPnl + position.realizedPnl;
      const outcome: TradeOutcome = pnl > 0 ? 'WIN' : 'LOSS';
      this.updateOutcome(position.marketId, outcome, position.currentPrice, pnl);

      // Fase 1.2: Auto-extract lesson from resolved trade
      const trade = this.trades.find(t => t.marketId === position.marketId && t.outcome === outcome);
      if (trade && !trade.lesson) {
        trade.lesson = this.extractLesson(trade);
        this.dirty = true;
        eventBus.emit('learning:lesson-extracted', { tradeId: trade.id, lesson: trade.lesson });
      }
    });
  }

  /**
   * Fase 1.2: Pattern-based lesson extraction (no LLM yet).
   * Analyzes trade context to generate actionable lesson string.
   */
  private extractLesson(trade: TradeExperience): string {
    const parts: string[] = [];

    if (trade.outcome === 'WIN') {
      parts.push(`WIN on ${trade.vertical}/${trade.strategy}`);
      if (trade.edgeDetected > 0.10) parts.push('high-edge-correct');
      if (trade.signalConfidence > 0.7) parts.push('high-confidence-validated');
    } else {
      parts.push(`LOSS on ${trade.vertical}/${trade.strategy}`);
      if (trade.edgeDetected > 0.10) parts.push('high-edge-WRONG — model overconfident');
      if (trade.signalConfidence > 0.7) parts.push('high-confidence-WRONG — signals misleading');
      if (trade.edgeDetected < 0.05) parts.push('low-edge-loss — should have skipped');
    }

    if (Math.abs(trade.pnl) > 10) parts.push(`large-impact: $${trade.pnl.toFixed(2)}`);
    if (trade.slippage > 0.02) parts.push('high-slippage — consider maker orders');

    return parts.join('; ');
  }

  private load(): void {
    if (existsSync(this.dbPath)) {
      try {
        const raw = readFileSync(this.dbPath, 'utf-8');
        const parsed = JSON.parse(raw) as Array<Record<string, unknown>>;
        this.trades = parsed.map(r => ({
          ...r,
          timestamp: new Date(r.timestamp as string),
        })) as TradeExperience[];
      } catch {
        this.trades = [];
      }
    }
  }

  private flush(): void {
    writeFileSync(this.dbPath, JSON.stringify(this.trades, null, 2), 'utf-8');
    this.dirty = false;
  }

  record(experience: Omit<TradeExperience, 'id'>): TradeExperience {
    const id = randomUUID();
    const full: TradeExperience = { id, ...experience };
    this.trades.push(full);
    this.dirty = true;
    eventBus.emit('learning:trade-recorded', full);
    return full;
  }

  updateOutcome(marketId: string, outcome: TradeOutcome, exitPrice: number, pnl: number): void {
    for (const trade of this.trades) {
      if (trade.marketId === marketId && trade.outcome === 'PENDING') {
        trade.outcome = outcome;
        trade.exitPrice = exitPrice;
        trade.pnl = pnl;
        this.dirty = true;
      }
    }
  }

  updateLesson(tradeId: string, lesson: string): void {
    const trade = this.trades.find(t => t.id === tradeId);
    if (trade) {
      trade.lesson = lesson;
      this.dirty = true;
      eventBus.emit('learning:lesson-extracted', { tradeId, lesson });
    }
  }

  getRecent(limit = 50): TradeExperience[] {
    return this.trades.slice(-limit).reverse();
  }

  getByVertical(vertical: Vertical, limit = 50): TradeExperience[] {
    return this.trades.filter(t => t.vertical === vertical).slice(-limit).reverse();
  }

  getByStrategy(strategy: StrategyId, limit = 50): TradeExperience[] {
    return this.trades.filter(t => t.strategy === strategy).slice(-limit).reverse();
  }

  findSimilar(marketQuestion: string, vertical: Vertical, limit = 5): TradeExperience[] {
    const keywords = marketQuestion.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    return this.trades
      .filter(t => t.vertical === vertical)
      .filter(t => keywords.some(k => t.marketQuestion.toLowerCase().includes(k)))
      .slice(-limit)
      .reverse();
  }

  getStats(): {
    total: number;
    wins: number;
    losses: number;
    pending: number;
    winRate: number;
    totalPnl: number;
    avgPnl: number;
    byVertical: Record<string, { count: number; winRate: number; pnl: number }>;
    byStrategy: Record<string, { count: number; winRate: number; pnl: number }>;
  } {
    const settled = this.trades.filter(t => t.outcome !== 'PENDING');
    const wins = settled.filter(t => t.outcome === 'WIN');
    const losses = settled.filter(t => t.outcome === 'LOSS');
    const pending = this.trades.filter(t => t.outcome === 'PENDING');
    const totalPnl = settled.reduce((sum, t) => sum + t.pnl, 0);

    const byVertical: Record<string, { count: number; winRate: number; pnl: number }> = {};
    const byStrategy: Record<string, { count: number; winRate: number; pnl: number }> = {};

    for (const trade of settled) {
      // By vertical
      if (!byVertical[trade.vertical]) byVertical[trade.vertical] = { count: 0, winRate: 0, pnl: 0 };
      byVertical[trade.vertical].count++;
      byVertical[trade.vertical].pnl += trade.pnl;

      // By strategy
      if (!byStrategy[trade.strategy]) byStrategy[trade.strategy] = { count: 0, winRate: 0, pnl: 0 };
      byStrategy[trade.strategy].count++;
      byStrategy[trade.strategy].pnl += trade.pnl;
    }

    // Calculate win rates
    for (const v of Object.keys(byVertical)) {
      const vWins = settled.filter(t => t.vertical === v && t.outcome === 'WIN').length;
      byVertical[v].winRate = byVertical[v].count > 0 ? vWins / byVertical[v].count : 0;
    }
    for (const s of Object.keys(byStrategy)) {
      const sWins = settled.filter(t => t.strategy === s && t.outcome === 'WIN').length;
      byStrategy[s].winRate = byStrategy[s].count > 0 ? sWins / byStrategy[s].count : 0;
    }

    return {
      total: this.trades.length,
      wins: wins.length,
      losses: losses.length,
      pending: pending.length,
      winRate: settled.length > 0 ? wins.length / settled.length : 0,
      totalPnl,
      avgPnl: settled.length > 0 ? totalPnl / settled.length : 0,
      byVertical,
      byStrategy,
    };
  }

  close(): void {
    if (this.flushInterval) clearInterval(this.flushInterval);
    this.flush();
  }
}
