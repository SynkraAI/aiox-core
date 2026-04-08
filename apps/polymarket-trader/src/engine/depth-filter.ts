/**
 * Orderbook Depth Filter: prevents trading in illiquid markets.
 * Checks bid/ask depth before approving signals.
 * Assigns a tier (deep/moderate/shallow/skip) and caps position size accordingly.
 */

import { eventBus } from './event-bus.js';
import { DEPTH_FILTER_CONFIG } from '../config/defaults.js';
import type { PolymarketClient } from '../integrations/polymarket-client.js';
import type { DepthCheckResult } from '../types/index.js';

interface DepthCacheEntry {
  result: DepthCheckResult;
  cachedAt: number;
}

export class DepthFilter {
  private client: PolymarketClient;
  private cache: Map<string, DepthCacheEntry> = new Map();
  private config = DEPTH_FILTER_CONFIG;
  private stats = { checked: 0, passed: 0, reduced: 0, skipped: 0 };

  constructor(client: PolymarketClient) {
    this.client = client;
  }

  /**
   * Check orderbook depth for a market.
   * Returns tier + max safe position size.
   */
  async checkDepth(marketId: string): Promise<DepthCheckResult> {
    // Check cache
    const cached = this.cache.get(marketId);
    if (cached && Date.now() - cached.cachedAt < this.config.cacheTtlMs) {
      return cached.result;
    }

    this.stats.checked++;

    let bidDepth = 0;
    let askDepth = 0;
    let spread = 0;

    try {
      const book = await this.client.getOrderBook(marketId);
      bidDepth = book.bids.reduce((sum, b) => sum + b.price * b.size, 0);
      askDepth = book.asks.reduce((sum, a) => sum + a.price * a.size, 0);
      spread = book.spread;
    } catch {
      // If orderbook fails, treat as shallow
      bidDepth = 0;
      askDepth = 0;
    }

    const totalDepth = bidDepth + askDepth;
    const { tiers } = this.config;

    let tier: DepthCheckResult['tier'];
    let maxSizePercent: number;

    if (totalDepth >= tiers.deep.minDepth) {
      tier = 'deep';
      maxSizePercent = tiers.deep.maxSizePercent;
      this.stats.passed++;
    } else if (totalDepth >= tiers.moderate.minDepth) {
      tier = 'moderate';
      maxSizePercent = tiers.moderate.maxSizePercent;
      this.stats.reduced++;
    } else if (totalDepth >= tiers.shallow.minDepth) {
      tier = 'shallow';
      maxSizePercent = tiers.shallow.maxSizePercent;
      this.stats.reduced++;
    } else {
      tier = 'skip';
      maxSizePercent = 0;
      this.stats.skipped++;
    }

    // Max safe size = 1% of total depth (avoid moving the market)
    const maxSafeSize = Math.min(totalDepth * 0.01, totalDepth * maxSizePercent);

    const result: DepthCheckResult = {
      marketId,
      bidDepth: Math.round(bidDepth),
      askDepth: Math.round(askDepth),
      totalDepth: Math.round(totalDepth),
      tier,
      maxSafeSize: Math.round(maxSafeSize * 100) / 100,
      spread,
    };

    // Cache
    this.cache.set(marketId, { result, cachedAt: Date.now() });

    // Emit event for monitoring
    if (tier === 'skip') {
      eventBus.emit('depth:skipped', { marketId, totalDepth, reason: 'insufficient depth' });
    }

    return result;
  }

  /**
   * Adjust signal size based on depth.
   * Returns adjusted size (0 = skip this market).
   */
  async adjustSignalSize(marketId: string, originalSize: number): Promise<number> {
    if (!this.config.enabled) return originalSize;

    const depth = await this.checkDepth(marketId);

    if (depth.tier === 'skip') return 0;

    return Math.min(originalSize, depth.maxSafeSize);
  }

  getStats() {
    return { ...this.stats };
  }

  clearCache(): void {
    this.cache.clear();
  }
}
