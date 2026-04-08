/**
 * Smart Order Splitter: reduces slippage by splitting large orders.
 * Chunks orders into smaller pieces, executes with intervals,
 * prefers maker (limit) orders, and respects gas timing.
 */

import { eventBus } from '../engine/event-bus.js';
import { SPLIT_ORDER_CONFIG } from '../config/defaults.js';
import type { GasOptimizer } from '../engine/gas-optimizer.js';
import type { DepthFilter } from '../engine/depth-filter.js';
import type { SplitOrderConfig, TradeSignal } from '../types/index.js';

interface SplitChunk {
  index: number;
  size: number;
  status: 'pending' | 'filled' | 'cancelled' | 'skipped';
  fillPrice?: number;
  executedAt?: Date;
}

interface SplitResult {
  originalSize: number;
  adjustedSize: number;
  chunks: SplitChunk[];
  totalFilled: number;
  avgFillPrice: number;
  totalSlippage: number;
  makerChunks: number;
  takerChunks: number;
  savedFees: number;
}

export class SmartOrderSplitter {
  private config: SplitOrderConfig;
  private gasOptimizer: GasOptimizer | null;
  private depthFilter: DepthFilter | null;
  private stats = {
    totalSplits: 0,
    chunksExecuted: 0,
    chunksCancelled: 0,
    totalSaved: 0,
    avgChunksPerOrder: 0,
  };

  constructor(
    gasOptimizer: GasOptimizer | null = null,
    depthFilter: DepthFilter | null = null,
    config: Partial<SplitOrderConfig> = {},
  ) {
    this.config = { ...SPLIT_ORDER_CONFIG, ...config };
    this.gasOptimizer = gasOptimizer;
    this.depthFilter = depthFilter;
  }

  /**
   * Determine if an order should be split.
   * Orders below $20 are too small to split.
   */
  shouldSplit(signal: TradeSignal): boolean {
    return signal.suggestedSize > 20;
  }

  /**
   * Split and execute a trade signal.
   * Returns aggregated result of all chunks.
   */
  async splitAndExecute(signal: TradeSignal): Promise<SplitResult> {
    this.stats.totalSplits++;

    // Adjust size based on depth
    let adjustedSize = signal.suggestedSize;
    if (this.depthFilter) {
      adjustedSize = await this.depthFilter.adjustSignalSize(signal.marketId, adjustedSize);
      if (adjustedSize === 0) {
        return this.emptyResult(signal.suggestedSize, 'depth filter blocked');
      }
    }

    // Calculate chunk sizes
    const numChunks = Math.min(this.config.chunks, Math.ceil(adjustedSize / 5)); // Min $5 per chunk
    const chunkSize = adjustedSize / numChunks;

    const chunks: SplitChunk[] = Array.from({ length: numChunks }, (_, i) => ({
      index: i,
      size: i === numChunks - 1
        ? adjustedSize - chunkSize * (numChunks - 1)  // Last chunk gets remainder
        : chunkSize,
      status: 'pending' as const,
    }));

    let makerChunks = 0;
    let takerChunks = 0;
    let totalFilled = 0;
    let weightedPrice = 0;

    // Execute chunks with intervals
    for (const chunk of chunks) {
      // Gas check
      if (this.gasOptimizer && this.config.gasOptimize) {
        const gasAction = this.gasOptimizer.shouldExecuteNow();
        if (gasAction === 'delay') {
          chunk.status = 'skipped';
          this.stats.chunksCancelled++;
          continue;
        }
      }

      // Simulate chunk execution
      const useMaker = this.config.preferMaker && Math.random() > 0.3; // 70% maker success rate
      const slippagePerChunk = useMaker ? 0.001 : 0.005; // 0.1% maker vs 0.5% taker
      const fillPrice = signal.marketProbability * (1 + slippagePerChunk);

      chunk.status = 'filled';
      chunk.fillPrice = fillPrice;
      chunk.executedAt = new Date();

      if (useMaker) makerChunks++;
      else takerChunks++;

      totalFilled += chunk.size;
      weightedPrice += fillPrice * chunk.size;

      this.stats.chunksExecuted++;

      // Emit chunk event
      eventBus.emit('order:chunk-filled', {
        marketId: signal.marketId,
        chunkIndex: chunk.index,
        size: chunk.size,
        price: fillPrice,
        mode: useMaker ? 'maker' : 'taker',
      });

      // Wait between chunks (except last)
      if (chunk.index < numChunks - 1) {
        await this.delay(this.config.intervalMs);
      }
    }

    const avgFillPrice = totalFilled > 0 ? weightedPrice / totalFilled : 0;
    const actualSlippage = totalFilled * (avgFillPrice - signal.marketProbability);
    const savedFees = this.calculateFeeSavings(makerChunks, takerChunks, chunkSize);

    this.stats.totalSaved += savedFees;
    this.stats.avgChunksPerOrder = this.stats.chunksExecuted / this.stats.totalSplits;

    return {
      originalSize: signal.suggestedSize,
      adjustedSize,
      chunks,
      totalFilled,
      avgFillPrice: Math.round(avgFillPrice * 10000) / 10000,
      totalSlippage: Math.round((actualSlippage) * 100) / 100,
      makerChunks,
      takerChunks,
      savedFees: Math.round(savedFees * 100) / 100,
    };
  }

  private calculateFeeSavings(makerCount: number, takerCount: number, avgChunkSize: number): number {
    // Maker rebate: +0.5%, Taker fee: -1%
    const makerCost = makerCount * avgChunkSize * (-0.005); // Negative = savings
    const takerCost = takerCount * avgChunkSize * 0.01;
    const naiveCost = (makerCount + takerCount) * avgChunkSize * 0.01; // All taker
    return naiveCost - (makerCost + takerCost);
  }

  private emptyResult(originalSize: number, _reason: string): SplitResult {
    return {
      originalSize,
      adjustedSize: 0,
      chunks: [],
      totalFilled: 0,
      avgFillPrice: 0,
      totalSlippage: 0,
      makerChunks: 0,
      takerChunks: 0,
      savedFees: 0,
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getStats() {
    return { ...this.stats };
  }
}
