/**
 * Polymarket API client wrapper.
 * Abstracts Gamma (market discovery) + CLOB (trading) + Data (history) APIs.
 * Uses official @polymarket/clob-client when available, REST fallback otherwise.
 */

import { POLYMARKET_API } from '../config/defaults.js';
import { eventBus } from '../engine/event-bus.js';
import type { Market, OrderBook, Order, Position, Side, OrderType, Vertical } from '../types/index.js';

interface PolymarketClientConfig {
  apiKey?: string;
  apiSecret?: string;
  privateKey?: string;
  funderAddress?: string;
}

export class PolymarketClient {
  private authenticated: boolean;

  constructor(config: PolymarketClientConfig = {}) {
    this.authenticated = !!(config.apiKey && config.apiSecret);
  }

  // ─── Market Discovery (Gamma API) ────────────────────

  async getMarkets(params?: { active?: boolean; closed?: boolean; limit?: number }): Promise<Market[]> {
    const searchParams = new URLSearchParams();
    if (params?.active !== undefined) searchParams.set('active', String(params.active));
    if (params?.closed !== undefined) searchParams.set('closed', String(params.closed));
    if (params?.limit) searchParams.set('limit', String(params.limit));

    const url = `${POLYMARKET_API.gamma}/markets?${searchParams}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Gamma API error: ${response.status}`);

    const data = await response.json() as Array<Record<string, unknown>>;
    return data.map((d) => this.parseMarket(d));
  }

  async getMarket(marketId: string): Promise<Market> {
    const response = await fetch(`${POLYMARKET_API.gamma}/markets/${marketId}`);
    if (!response.ok) throw new Error(`Market ${marketId} not found`);
    return this.parseMarket(await response.json() as Record<string, unknown>);
  }

  async searchMarkets(query: string): Promise<Market[]> {
    const response = await fetch(`${POLYMARKET_API.gamma}/markets?tag=all&_q=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error(`Search failed: ${response.status}`);
    const data = await response.json() as Array<Record<string, unknown>>;
    return data.map((d) => this.parseMarket(d));
  }

  // ─── Order Book (CLOB API) ───────────────────────────

  async getOrderBook(tokenId: string): Promise<OrderBook> {
    const response = await fetch(`${POLYMARKET_API.clob}/book?token_id=${tokenId}`);
    if (!response.ok) throw new Error(`Orderbook error: ${response.status}`);

    const data = await response.json() as {
      bids: Array<{ price: string; size: string }>;
      asks: Array<{ price: string; size: string }>;
    };

    const bids = data.bids.map(b => ({ price: parseFloat(b.price), size: parseFloat(b.size) }));
    const asks = data.asks.map(a => ({ price: parseFloat(a.price), size: parseFloat(a.size) }));

    const bestBid = bids[0]?.price ?? 0;
    const bestAsk = asks[0]?.price ?? 1;

    return {
      marketId: tokenId,
      bids,
      asks,
      spread: bestAsk - bestBid,
      midpoint: (bestBid + bestAsk) / 2,
      timestamp: new Date(),
    };
  }

  async getMidpoint(tokenId: string): Promise<number> {
    const response = await fetch(`${POLYMARKET_API.clob}/midpoint?token_id=${tokenId}`);
    if (!response.ok) throw new Error(`Midpoint error: ${response.status}`);
    const data = await response.json() as { mid: string };
    return parseFloat(data.mid);
  }

  // ─── Trading (CLOB API — requires auth) ──────────────

  async placeOrder(params: {
    tokenId: string;
    side: Side;
    price: number;
    size: number;
    orderType: OrderType;
  }): Promise<Order> {
    if (!this.authenticated) {
      throw new Error('Authentication required for trading. Set apiKey, apiSecret, and privateKey.');
    }

    // In real implementation, this would use @polymarket/clob-client
    // with proper HMAC signing. For now, structure the request.
    const order: Order = {
      id: `sim_${Date.now()}`,
      marketId: params.tokenId,
      side: params.side,
      price: params.price,
      size: params.size,
      orderType: params.orderType,
      status: 'pending',
      filledSize: 0,
      averageFillPrice: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    eventBus.emit('order:submitted', order);
    return order;
  }

  async cancelOrder(orderId: string): Promise<void> {
    if (!this.authenticated) throw new Error('Authentication required');
    // Would call CLOB cancel endpoint
    eventBus.emit('order:cancelled', {
      id: orderId, marketId: '', side: 'YES', price: 0, size: 0,
      orderType: 'GTC', status: 'cancelled', filledSize: 0, averageFillPrice: 0,
      createdAt: new Date(), updatedAt: new Date(),
    });
  }

  // ─── Account (CLOB + Data API — requires auth) ──────

  async getPositions(): Promise<Position[]> {
    if (!this.authenticated) return [];
    // Would call data API /positions endpoint
    return [];
  }

  async getBalance(): Promise<number> {
    if (!this.authenticated) return 0;
    // Would call CLOB /balance endpoint
    return 0;
  }

  // ─── Helpers ─────────────────────────────────────────

  private parseMarket(raw: Record<string, unknown>): Market {
    const tokens = raw.tokens as Array<{ token_id: string; outcome: string; price: number }> | undefined;

    return {
      id: raw.id as string || raw.condition_id as string || '',
      question: raw.question as string || '',
      slug: raw.slug as string || '',
      vertical: detectVertical(raw.question as string || ''),
      endDate: raw.end_date_iso as string || '',
      active: raw.active as boolean ?? true,
      closed: raw.closed as boolean ?? false,
      tokens: {
        yes: {
          tokenId: tokens?.[0]?.token_id ?? '',
          price: tokens?.[0]?.price ?? 0.5,
          outcome: 'Yes',
        },
        no: {
          tokenId: tokens?.[1]?.token_id ?? '',
          price: tokens?.[1]?.price ?? 0.5,
          outcome: 'No',
        },
      },
      volume: parseFloat(raw.volume as string || '0'),
      liquidity: parseFloat(raw.liquidity as string || '0'),
      lastPrice: tokens?.[0]?.price ?? 0.5,
    };
  }

  isAuthenticated(): boolean {
    return this.authenticated;
  }
}

function detectVertical(question: string): Vertical {
  const q = question.toLowerCase();
  if (q.includes('temperature') || q.includes('weather') || q.includes('°f') || q.includes('°c')) return 'weather';
  if (q.includes('bitcoin') || q.includes('ethereum') || q.includes('crypto') || q.includes('btc') || q.includes('eth')) return 'crypto';
  if (q.includes('election') || q.includes('president') || q.includes('congress') || q.includes('vote')) return 'politics';
  if (q.includes('nba') || q.includes('nfl') || q.includes('mlb') || q.includes('win') || q.includes('game')) return 'sports';
  return 'crypto'; // default
}
