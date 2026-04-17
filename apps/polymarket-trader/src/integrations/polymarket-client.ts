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

  /** Rotating offset for market discovery — ensures different markets each scan. */
  private marketOffset = 0;

  async getMarkets(params?: { active?: boolean; closed?: boolean; limit?: number; offset?: number }): Promise<Market[]> {
    const searchParams = new URLSearchParams();
    // Default: only open markets (active=true, closed=false)
    searchParams.set('active', String(params?.active ?? true));
    searchParams.set('closed', String(params?.closed ?? false));
    const limit = params?.limit ?? 100;
    searchParams.set('limit', String(limit));

    // Rotate offset to discover new markets each scan
    const offset = params?.offset ?? this.marketOffset;
    if (offset > 0) searchParams.set('offset', String(offset));

    // Advance offset for next call; reset when we've gone far enough
    this.marketOffset += limit;
    if (this.marketOffset > 500) this.marketOffset = 0;

    const url = `${POLYMARKET_API.gamma}/markets?${searchParams}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Gamma API error: ${response.status}`);

    const data = await response.json() as Array<Record<string, unknown>>;

    // If we got fewer results than limit, reset offset (we've hit the end)
    if (data.length < limit) this.marketOffset = 0;

    const now = Date.now();
    return data
      .map((d) => this.parseMarket(d))
      .filter(m => m.tokens.yes.tokenId !== '')
      // Reject markets whose event end date has already passed
      .filter(m => !m.endDate || new Date(m.endDate).getTime() > now);
  }

  async getMarket(marketId: string): Promise<Market> {
    const response = await fetch(`${POLYMARKET_API.gamma}/markets/${marketId}`);
    if (!response.ok) throw new Error(`Market ${marketId} not found`);
    return this.parseMarket(await response.json() as Record<string, unknown>);
  }

  /**
   * Fetch recently resolved markets to settle open paper positions.
   * Resolved markets have closed=true and outcomePrices at 0 or 1.
   */
  async getResolvedMarkets(marketIds: string[]): Promise<Market[]> {
    if (marketIds.length === 0) return [];

    const resolved: Market[] = [];
    // Batch in groups of 10 to avoid URL length issues
    for (let i = 0; i < marketIds.length; i += 10) {
      const batch = marketIds.slice(i, i + 10);
      for (const id of batch) {
        try {
          const response = await fetch(`${POLYMARKET_API.gamma}/markets/${id}`);
          if (!response.ok) continue;
          const raw = await response.json() as Record<string, unknown>;
          const market = this.parseMarket(raw);
          if (market.closed) {
            resolved.push(market);
          }
        } catch { /* skip unreachable markets */ }
      }
    }
    return resolved;
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
    // Gamma API returns outcomePrices as JSON string: '["0.525", "0.475"]'
    // and clobTokenIds as JSON string with two token IDs
    let yesPriceNum = 0.5;
    let noPriceNum = 0.5;
    let yesTokenId = '';
    let noTokenId = '';

    try {
      const prices = JSON.parse(raw.outcomePrices as string || '[]') as string[];
      yesPriceNum = parseFloat(prices[0] || '0.5');
      noPriceNum = parseFloat(prices[1] || '0.5');
    } catch { /* use defaults */ }

    try {
      const tokenIds = JSON.parse(raw.clobTokenIds as string || '[]') as string[];
      yesTokenId = tokenIds[0] || '';
      noTokenId = tokenIds[1] || '';
    } catch { /* use defaults */ }

    return {
      id: raw.id as string || raw.condition_id as string || '',
      question: raw.question as string || '',
      slug: raw.slug as string || '',
      vertical: detectVertical(raw.question as string || ''),
      endDate: raw.endDateIso as string || raw.end_date_iso as string || '',
      active: raw.active as boolean ?? true,
      closed: raw.closed as boolean ?? false,
      tokens: {
        yes: { tokenId: yesTokenId, price: yesPriceNum, outcome: 'Yes' },
        no: { tokenId: noTokenId, price: noPriceNum, outcome: 'No' },
      },
      volume: parseFloat(raw.volume as string || '0'),
      liquidity: parseFloat(raw.liquidity as string || '0'),
      lastPrice: yesPriceNum,
    };
  }

  isAuthenticated(): boolean {
    return this.authenticated;
  }
}

function detectVertical(question: string): Vertical {
  const q = question.toLowerCase();

  // Weather
  if (q.includes('temperature') || q.includes('weather') || q.includes('°f') || q.includes('°c')
    || q.includes('hurricane') || q.includes('tornado') || q.includes('rainfall') || q.includes('snowfall')
    || q.includes('heat wave') || q.includes('drought') || q.includes('flood')) return 'weather';

  // Legal / Crime → politics (BEFORE crypto to avoid "token"/"market cap" false positives)
  if (q.includes('sentenced') || q.includes('trial') || q.includes('verdict') || q.includes('guilty')
    || q.includes('prison') || q.includes('weinstein') || q.includes('indicted')
    || q.includes('convicted') || q.includes('court') || q.includes('lawsuit')
    || q.includes('arrest') || q.includes('pardon') || q.includes('impeach')) return 'politics';

  // Politics (before crypto — "war", "invasion" etc. should not fall through)
  if (q.includes('election') || q.includes('president') || q.includes('congress') || q.includes('vote')
    || q.includes('senate') || q.includes('governor') || q.includes('trump') || q.includes('biden')
    || q.includes('democrat') || q.includes('republican') || q.includes('parliament')
    || q.includes('prime minister') || q.includes('legislation') || q.includes('poll')
    || q.includes('ceasefire') || q.includes('war') || q.includes('invade') || q.includes('invasion')
    || q.includes('russia') || q.includes('ukraine') || q.includes('china') || q.includes('taiwan')
    || q.includes('tariff') || q.includes('sanction') || q.includes('pope')
    || q.includes('government') || q.includes('minister') || q.includes('nato')) return 'politics';

  // Sports
  if (q.includes('nba') || q.includes('nfl') || q.includes('mlb') || q.includes('nhl')
    || q.includes('champions league') || q.includes('world cup') || q.includes('super bowl')
    || q.includes('playoff') || q.includes('championship') || q.includes('mvp')
    || q.includes('ufc') || q.includes('tennis') || q.includes('formula 1') || q.includes('f1 ')
    || q.includes('stanley cup') || q.includes(' win the 20') || q.includes('serie a')
    || q.includes('premier league') || q.includes('la liga')) return 'sports';

  // Pop Culture
  if (q.includes('oscar') || q.includes('grammy') || q.includes('emmy') || q.includes('movie')
    || q.includes('box office') || q.includes('album') || q.includes('spotify')
    || q.includes('netflix') || q.includes('celebrity') || q.includes('twitter')
    || q.includes('tiktok') || q.includes('viral') || q.includes('streaming')
    || q.includes('rihanna') || q.includes('carti') || q.includes('gta')
    || q.includes('youtube') || q.includes('subscriber')) return 'pop_culture';

  // Crypto (after politics/legal to avoid misclassification)
  if (q.includes('bitcoin') || q.includes('ethereum') || q.includes('crypto') || q.includes('btc')
    || q.includes('eth ') || q.includes('solana') || q.includes('sol ') || q.includes('defi')
    || q.includes('blockchain') || q.includes('nft') || q.includes('stablecoin')
    || q.includes('usdc') || q.includes('usdt') || q.includes('binance')
    || q.includes('coinbase') || q.includes('altcoin')) return 'crypto';

  // Finance / Macro
  if (q.includes('fed ') || q.includes('federal reserve') || q.includes('interest rate')
    || q.includes('inflation') || q.includes('gdp') || q.includes('unemployment')
    || q.includes('s&p') || q.includes('nasdaq') || q.includes('stock')
    || q.includes('recession') || q.includes('treasury') || q.includes('oil price')
    || q.includes('gold price') || q.includes('cpi') || q.includes('market cap')
    || q.includes('dow jones') || q.includes('bond') || q.includes('yield')) return 'finance';

  // Science / Tech
  if (q.includes('spacex') || q.includes('nasa') || q.includes('launch')
    || q.includes('ai ') || q.includes('artificial intelligence') || q.includes('openai')
    || q.includes('fda') || q.includes('drug approval') || q.includes('clinical trial')
    || q.includes('vaccine') || q.includes('asteroid') || q.includes('quantum')
    || q.includes('mars') || q.includes('starship') || q.includes('google')
    || q.includes('apple ') || q.includes('microsoft')) return 'science';

  // Default: pop_culture (safest fallback — misclassification less harmful than crypto)
  return 'pop_culture';
}
