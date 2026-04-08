/**
 * Order Manager: converts approved signals into Orders,
 * manages an order queue with concurrency limits, retry logic,
 * and slippage protection.
 *
 * Phase 1.6 — Execution layer.
 */

import { randomUUID } from 'crypto';
import { eventBus } from '../engine/event-bus.js';
import { MAKER_MODE_CONFIG } from '../config/defaults.js';
import type { Order, OrderStatus, OrderMode, TradeSignal } from '../types/index.js';

/** Approved signal payload emitted by StrategyScorer. */
interface ApprovedSignal extends TradeSignal {
  composite: number;
}

export interface OrderManagerConfig {
  /** Max orders executing at the same time (default 5). */
  maxConcurrentOrders: number;
  /** Max retry attempts for failed orders (default 3). */
  maxRetries: number;
  /** Base delay for exponential backoff in ms (default 1000). */
  retryBaseDelayMs: number;
  /** Reject order if price moved more than this fraction since signal (default 0.02 = 2%). */
  maxSlippage: number;
  /** Simulated execution time in ms (default 500). Set 0 for instant. */
  simulatedExecMs: number;
  /** Prefer maker (limit) orders for fee savings. */
  preferMaker: boolean;
}

const DEFAULT_CONFIG: OrderManagerConfig = {
  maxConcurrentOrders: 5,
  maxRetries: 3,
  retryBaseDelayMs: 1000,
  maxSlippage: 0.02,
  simulatedExecMs: 500,
  preferMaker: MAKER_MODE_CONFIG.enabled,
};

interface PendingOrder {
  order: Order;
  signal: ApprovedSignal;
  retries: number;
}

export class OrderManager {
  private config: OrderManagerConfig;

  /** Currently executing orders. */
  private active: Map<string, PendingOrder> = new Map();

  /** Queue of orders waiting for a concurrency slot. */
  private waiting: PendingOrder[] = [];

  /** Full history (including completed). */
  private history: Order[] = [];

  /** Current simulated market prices per market (for slippage check). */
  private marketPrices: Map<string, number> = new Map();

  /** Maker/taker tracking for fee optimization. */
  private makerStats = { makerFills: 0, takerFills: 0, totalRebates: 0, totalFees: 0 };

  constructor(config: Partial<OrderManagerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.wireEvents();
  }

  // ------------------------------------------------------------------
  // Event wiring
  // ------------------------------------------------------------------

  private wireEvents(): void {
    eventBus.on('signal:approved', (payload: ApprovedSignal) => {
      this.submitFromSignal(payload);
    });
  }

  // ------------------------------------------------------------------
  // Public API
  // ------------------------------------------------------------------

  /** Create and enqueue an order from an approved signal. */
  submitFromSignal(signal: ApprovedSignal): Order {
    const order: Order = {
      id: randomUUID(),
      marketId: signal.marketId,
      side: signal.side,
      price: signal.marketProbability,
      size: signal.suggestedSize,
      orderType: 'GTC',
      status: 'pending',
      filledSize: 0,
      averageFillPrice: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.history.push(order);

    const pending: PendingOrder = { order, signal, retries: 0 };

    if (this.active.size < this.config.maxConcurrentOrders) {
      this.execute(pending);
    } else {
      this.waiting.push(pending);
    }

    eventBus.emit('order:submitted', { ...order });
    return order;
  }

  /** Update the known market price for a market (used by slippage check). */
  updateMarketPrice(marketId: string, price: number): void {
    this.marketPrices.set(marketId, price);
  }

  /** Cancel a pending or active order by id. */
  cancelOrder(id: string): boolean {
    // Check waiting queue
    const waitIdx = this.waiting.findIndex((p) => p.order.id === id);
    if (waitIdx !== -1) {
      const removed = this.waiting.splice(waitIdx, 1)[0];
      this.updateOrderStatus(removed.order, 'cancelled');
      eventBus.emit('order:cancelled', { ...removed.order });
      return true;
    }

    // Check active
    const active = this.active.get(id);
    if (active) {
      this.active.delete(id);
      this.updateOrderStatus(active.order, 'cancelled');
      eventBus.emit('order:cancelled', { ...active.order });
      this.drainWaiting();
      return true;
    }

    return false;
  }

  getOpenOrders(): Order[] {
    const openStatuses: OrderStatus[] = ['pending', 'partial'];
    return this.history.filter((o) => openStatuses.includes(o.status));
  }

  getOrderHistory(): readonly Order[] {
    return this.history;
  }

  getActiveCount(): number {
    return this.active.size;
  }

  getWaitingCount(): number {
    return this.waiting.length;
  }

  // ------------------------------------------------------------------
  // Execution
  // ------------------------------------------------------------------

  private async execute(pending: PendingOrder): Promise<void> {
    const { order, signal } = pending;
    this.active.set(order.id, pending);

    // Slippage protection
    const currentPrice = this.marketPrices.get(order.marketId);
    if (currentPrice !== undefined) {
      const priceDiff = Math.abs(currentPrice - signal.marketProbability);
      const slippagePercent = priceDiff / signal.marketProbability;
      if (slippagePercent > this.config.maxSlippage) {
        this.active.delete(order.id);
        this.updateOrderStatus(order, 'cancelled');
        eventBus.emit('order:failed', {
          ...order,
          reason: `Slippage ${(slippagePercent * 100).toFixed(1)}% exceeds max ${(this.config.maxSlippage * 100).toFixed(1)}%`,
        });
        this.drainWaiting();
        return;
      }
    }

    // Simulate execution delay
    if (this.config.simulatedExecMs > 0) {
      await this.delay(this.config.simulatedExecMs);
    }

    // Simulate fill (in paper mode, always fills successfully)
    const fillSuccess = this.simulateFill(order);

    if (fillSuccess) {
      this.active.delete(order.id);
      this.updateOrderStatus(order, 'filled');
      order.filledSize = order.size;
      order.averageFillPrice = order.price;
      eventBus.emit('order:filled', { ...order });
      this.drainWaiting();
    } else {
      this.active.delete(order.id);
      await this.handleFailure(pending);
    }
  }

  private async handleFailure(pending: PendingOrder): Promise<void> {
    pending.retries++;

    if (pending.retries > this.config.maxRetries) {
      this.updateOrderStatus(pending.order, 'cancelled');
      eventBus.emit('order:failed', {
        ...pending.order,
        reason: `Max retries (${this.config.maxRetries}) exhausted`,
      });
      this.drainWaiting();
      return;
    }

    // Exponential backoff
    const backoff = this.config.retryBaseDelayMs * Math.pow(2, pending.retries - 1);
    await this.delay(backoff);

    // Re-enqueue for execution
    if (this.active.size < this.config.maxConcurrentOrders) {
      await this.execute(pending);
    } else {
      this.waiting.unshift(pending); // priority: retries go to front
    }
  }

  /** Pull the next waiting order into an active slot. */
  private drainWaiting(): void {
    while (this.waiting.length > 0 && this.active.size < this.config.maxConcurrentOrders) {
      const next = this.waiting.shift()!;
      this.execute(next);
    }
  }

  /**
   * Determine order mode: maker (limit) or taker (market).
   * Maker = limit order below best ask → earns rebate.
   * Taker = market order → pays fee.
   */
  private determineOrderMode(_order: Order): OrderMode {
    if (!this.config.preferMaker) return 'taker';

    // 70% of orders attempt maker (limit below best ask)
    // In live mode this would check orderbook spread
    const attemptMaker = Math.random() < 0.7;
    return attemptMaker ? 'maker' : 'taker';
  }

  /**
   * Simulate whether an order fills.
   * Tracks maker/taker fees and rebates.
   */
  private simulateFill(order: Order): boolean {
    const mode = this.determineOrderMode(order);

    if (mode === 'maker') {
      // Maker: limit order — 85% fill rate (may not fill if price moves)
      const filled = Math.random() < 0.85;
      if (filled) {
        const rebate = order.size * MAKER_MODE_CONFIG.estimatedRebatePercent;
        this.makerStats.makerFills++;
        this.makerStats.totalRebates += rebate;
        eventBus.emit('order:maker-fill', { orderId: order.id, rebate, mode: 'maker' });
      }
      return filled;
    }

    // Taker: market order — always fills
    const fee = order.size * MAKER_MODE_CONFIG.estimatedTakerFeePercent;
    this.makerStats.takerFills++;
    this.makerStats.totalFees += fee;
    eventBus.emit('order:taker-fill', { orderId: order.id, fee, mode: 'taker' });
    return true;
  }

  private updateOrderStatus(order: Order, status: OrderStatus): void {
    order.status = status;
    order.updatedAt = new Date();
  }

  getMakerStats() {
    const total = this.makerStats.makerFills + this.makerStats.takerFills;
    return {
      ...this.makerStats,
      makerRatio: total > 0 ? this.makerStats.makerFills / total : 0,
      netFeeSavings: this.makerStats.totalRebates - this.makerStats.totalFees,
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
