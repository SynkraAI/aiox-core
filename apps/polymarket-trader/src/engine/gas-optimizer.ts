/**
 * Polygon Gas Fee Optimizer.
 * Tracks gas prices, queues trades for low-gas windows, batches execution.
 * In paper mode: simulates gas tracking for realistic fee estimation.
 */

import { eventBus } from './event-bus.js';
import { GAS_OPTIMIZER_CONFIG } from '../config/defaults.js';
import type { GasWindow } from '../types/index.js';

interface QueuedAction {
  id: string;
  action: () => Promise<void>;
  queuedAt: number;
  priority: 'normal' | 'urgent';
}

export class GasOptimizer {
  private config = GAS_OPTIMIZER_CONFIG;
  private currentGwei = 30;  // Default Polygon
  private gasTier: 'low' | 'medium' | 'high' = 'low';
  private queue: QueuedAction[] = [];
  private pollHandle: ReturnType<typeof setInterval> | null = null;
  private history: GasWindow[] = [];
  private stats = { executed: 0, queued: 0, delayed: 0, savings: 0 };

  constructor() {
    // Build 24h gas history template (typical Polygon patterns)
    for (let h = 0; h < 24; h++) {
      const isOptimal = this.config.optimalHoursUTC.includes(h);
      this.history.push({
        hour: h,
        avgGwei: isOptimal ? 25 : h >= 14 && h <= 18 ? 80 : 45,
        tier: isOptimal ? 'low' : h >= 14 && h <= 18 ? 'high' : 'medium',
      });
    }
  }

  /** Start polling gas prices. */
  start(): void {
    if (this.pollHandle) return;

    this.pollHandle = setInterval(() => {
      void this.pollGasPrice();
    }, this.config.pollIntervalMs);

    // Initial poll
    void this.pollGasPrice();
  }

  /** Stop polling. */
  stop(): void {
    if (this.pollHandle) {
      clearInterval(this.pollHandle);
      this.pollHandle = null;
    }
  }

  /** Get current gas recommendation. */
  getRecommendation(): { gwei: number; tier: 'low' | 'medium' | 'high'; action: string } {
    const tierConfig = this.gasTier === 'low'
      ? this.config.tiers.low
      : this.gasTier === 'medium'
        ? this.config.tiers.medium
        : this.config.tiers.high;

    return {
      gwei: this.currentGwei,
      tier: this.gasTier,
      action: tierConfig.action,
    };
  }

  /**
   * Should a trade execute now or be queued?
   * Returns 'execute' | 'queue' | 'delay'.
   */
  shouldExecuteNow(priority: 'normal' | 'urgent' = 'normal'): 'execute' | 'queue' | 'delay' {
    if (!this.config.enabled) return 'execute';
    if (priority === 'urgent') return 'execute';

    if (this.gasTier === 'low') return 'execute';
    if (this.gasTier === 'medium') return 'queue';
    return 'delay';
  }

  /** Queue an action for execution during low-gas window. */
  queueAction(id: string, action: () => Promise<void>, priority: 'normal' | 'urgent' = 'normal'): void {
    this.queue.push({ id, action, queuedAt: Date.now(), priority });
    this.stats.queued++;
    eventBus.emit('gas:queued', { id, gwei: this.currentGwei, tier: this.gasTier });
  }

  /** Force drain queue (execute all regardless of gas). */
  async drainQueue(): Promise<void> {
    const items = [...this.queue];
    this.queue = [];

    for (const item of items) {
      try {
        await item.action();
        this.stats.executed++;
      } catch (err) {
        eventBus.emit('system:error', {
          component: 'gas-optimizer',
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }
  }

  /** Get optimal trading windows (next 24h). */
  getOptimalWindows(): GasWindow[] {
    return this.history.filter(w => w.tier === 'low');
  }

  /** Estimated savings from using maker + gas optimization vs naive taker. */
  estimateSavings(tradeCount: number, avgSize: number): {
    naiveCost: number;
    optimizedCost: number;
    savings: number;
  } {
    // Naive: all taker at any gas
    const naiveFeePercent = 0.01; // 1% taker
    const naiveGasCost = tradeCount * 0.05; // ~$0.05 avg gas per trade
    const naiveCost = tradeCount * avgSize * naiveFeePercent + naiveGasCost;

    // Optimized: 70% maker + low gas windows
    const makerFeePercent = -0.005; // -0.5% rebate
    const takerFeePercent = 0.01;
    const makerRatio = 0.7;
    const optimizedFee = tradeCount * avgSize * (makerRatio * makerFeePercent + (1 - makerRatio) * takerFeePercent);
    const optimizedGas = tradeCount * 0.02; // Low gas window avg
    const optimizedCost = optimizedFee + optimizedGas;

    const savings = naiveCost - optimizedCost;
    this.stats.savings = savings;

    return {
      naiveCost: Math.round(naiveCost * 100) / 100,
      optimizedCost: Math.round(optimizedCost * 100) / 100,
      savings: Math.round(savings * 100) / 100,
    };
  }

  getStats() {
    return {
      ...this.stats,
      currentGwei: this.currentGwei,
      gasTier: this.gasTier,
      queueSize: this.queue.length,
    };
  }

  // -- Private --

  private async pollGasPrice(): Promise<void> {
    try {
      const response = await fetch(this.config.rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_gasPrice',
          params: [],
          id: 1,
        }),
        signal: AbortSignal.timeout(5000),
      });

      if (response.ok) {
        const data = await response.json() as { result?: string };
        if (data.result) {
          this.currentGwei = parseInt(data.result, 16) / 1e9;
        }
      }
    } catch {
      // Keep last known gas price on error
    }

    // Update tier
    const { tiers } = this.config;
    if (this.currentGwei <= tiers.low.maxGwei) {
      this.gasTier = 'low';
    } else if (this.currentGwei <= tiers.medium.maxGwei) {
      this.gasTier = 'medium';
    } else {
      this.gasTier = 'high';
    }

    // Auto-drain queue on low gas
    if (this.gasTier === 'low' && this.queue.length > 0) {
      await this.drainQueue();
    }

    // Expire old queued items
    const now = Date.now();
    const expired = this.queue.filter(q => now - q.queuedAt > this.config.maxQueueTimeMs);
    if (expired.length > 0) {
      this.queue = this.queue.filter(q => now - q.queuedAt <= this.config.maxQueueTimeMs);
      // Force execute expired items
      for (const item of expired) {
        try {
          await item.action();
          this.stats.executed++;
        } catch { /* already logged */ }
      }
    }

    eventBus.emit('gas:updated', { gwei: this.currentGwei, tier: this.gasTier });
  }
}
