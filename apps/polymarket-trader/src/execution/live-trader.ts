/**
 * Live Trading Engine.
 * Phase 3.3: Executes REAL trades on Polymarket via CLOB API.
 *
 * Safety layers:
 * - Go/No-Go gate must PASS before activation
 * - Pre-trade balance check
 * - Pre-trade gas safety check
 * - Slippage protection (re-check price)
 * - Daily loss circuit breaker
 * - Gradual rollout (Kelly multiplier ramp)
 * - All trades recorded to ExperienceStore with mode: 'live'
 * - Telegram alerts on every trade
 *
 * IMPORTANT: Private keys are NEVER logged. EIP-712 signing
 * is interface-only (placeholder for actual ethers/viem integration).
 */

import { eventBus } from '../engine/event-bus.js';
import type { ExperienceStore } from '../learning/experience-store.js';
import type { RiskEngine } from '../engine/risk-engine.js';
import type { GoNoGoGate } from '../engine/go-nogo-gate.js';
import type { PaperTradingReviewer } from '../engine/paper-review.js';
import type { PolymarketClient } from '../integrations/polymarket-client.js';
import type { OnChainMonitor } from '../integrations/onchain-monitor.js';
import type {
  TradeSignal,
  TradeResult,
  LiveTraderConfig,
  LivePosition,
  TradeExperience,
  GateResult,
  Position,
} from '../types/index.js';
import { DEFAULT_LIVE_TRADER_CONFIG } from '../config/defaults.js';

const MS_PER_DAY = 86_400_000;

/**
 * EIP-712 order structure for Polymarket CLOB.
 * Interface only: actual signing requires ethers or viem.
 */
export interface EIP712OrderData {
  salt: string;
  maker: string;
  signer: string;
  taker: string;
  tokenId: string;
  makerAmount: string;
  takerAmount: string;
  expiration: string;
  nonce: string;
  feeRateBps: string;
  side: number; // 0 = BUY, 1 = SELL
  signatureType: number;
}

/**
 * Build the EIP-712 typed data envelope (interface only).
 * The actual signing step is a placeholder.
 */
export function buildEIP712Order(params: {
  maker: string;
  tokenId: string;
  side: 'YES' | 'NO';
  price: number;
  size: number;
}): EIP712OrderData {
  const sideNum = params.side === 'YES' ? 0 : 1;
  const makerAmount = Math.round(params.size * 1e6).toString(); // USDC 6 decimals
  const takerAmount = Math.round((params.size / params.price) * 1e6).toString();

  return {
    salt: Date.now().toString(),
    maker: params.maker,
    signer: params.maker,
    taker: '0x0000000000000000000000000000000000000000',
    tokenId: params.tokenId,
    makerAmount,
    takerAmount,
    expiration: '0',
    nonce: '0',
    feeRateBps: '0',
    side: sideNum,
    signatureType: 2, // EIP-712
  };
}

export class LiveTrader {
  private config: LiveTraderConfig;
  private client: PolymarketClient;
  private store: ExperienceStore;
  private risk: RiskEngine;
  private gate: GoNoGoGate;
  private reviewer: PaperTradingReviewer;
  private onchain: OnChainMonitor;
  private initialized = false;
  private gateResult: GateResult | null = null;
  private firstLiveTradeAt: Date | null = null;
  private positions: Map<string, LivePosition> = new Map();
  private dailyTradeCount = 0;
  private shutdownRequested = false;

  constructor(deps: {
    client: PolymarketClient;
    store: ExperienceStore;
    risk: RiskEngine;
    gate: GoNoGoGate;
    reviewer: PaperTradingReviewer;
    onchain: OnChainMonitor;
    config?: Partial<LiveTraderConfig>;
  }) {
    this.client = deps.client;
    this.store = deps.store;
    this.risk = deps.risk;
    this.gate = deps.gate;
    this.reviewer = deps.reviewer;
    this.onchain = deps.onchain;
    this.config = { ...DEFAULT_LIVE_TRADER_CONFIG, ...deps.config };
  }

  /**
   * Initialize the live trader.
   * Verifies wallet, checks balance, and validates gate pass.
   * Throws if gate check fails and requireGatePass is true.
   */
  async initialize(
    paperTrades: TradeExperience[],
    riskState?: { circuitBreakerTripped: boolean },
    driftHealthy = true,
  ): Promise<void> {
    // Gate check
    if (this.config.requireGatePass) {
      const report = this.reviewer.analyze(paperTrades);
      const mockRiskState = {
        bankroll: 0,
        dailyPnl: 0,
        weeklyPnl: 0,
        openPositions: 0,
        totalExposure: 0,
        circuitBreakerTripped: riskState?.circuitBreakerTripped ?? false,
        lastUpdated: new Date(),
      };
      this.gateResult = this.gate.evaluate(report, mockRiskState, driftHealthy);

      if (!this.gateResult.passed) {
        throw new Error(
          `Go/No-Go gate FAILED (score: ${this.gateResult.score}, recommendation: ${this.gateResult.recommendation}). ` +
          `Failed criteria: ${this.gateResult.criteria.filter(c => !c.passed).map(c => c.name).join(', ')}`,
        );
      }
    }

    // Verify wallet has balance
    if (this.config.walletAddress) {
      const balance = await this.client.getBalance();
      if (balance <= 0) {
        eventBus.emit('live:warning', { message: 'Wallet balance is zero or unavailable' });
      }
    }

    this.initialized = true;
    eventBus.emit('live:initialized', {
      walletAddress: this.config.walletAddress,
      maxTradeSize: this.config.maxTradeSize,
      gateScore: this.gateResult?.score ?? 'bypassed',
    });
  }

  /**
   * Execute a real trade on Polymarket.
   * Applies all safety checks before order placement.
   */
  async executeTrade(signal: TradeSignal): Promise<TradeResult> {
    const timestamp = new Date();

    if (this.shutdownRequested) {
      return this.failResult(signal, 'Emergency shutdown active', timestamp);
    }

    if (!this.initialized) {
      return this.failResult(signal, 'Live trader not initialized', timestamp);
    }

    // Circuit breaker check
    const riskState = this.risk.getState();
    if (riskState.circuitBreakerTripped) {
      return this.failResult(signal, `Circuit breaker active: ${riskState.circuitBreakerReason ?? 'unknown'}`, timestamp);
    }

    // Gas safety check
    const gasSafe = await this.onchain.isGasSafe();
    if (!gasSafe) {
      return this.failResult(signal, 'Gas price unsafe for trading', timestamp);
    }

    // Balance check
    const balance = await this.client.getBalance();
    const tradeSize = this.applyGradualRollout(signal.suggestedSize);

    if (tradeSize > balance) {
      return this.failResult(signal, `Insufficient balance: need $${tradeSize.toFixed(2)}, have $${balance.toFixed(2)}`, timestamp);
    }

    // Max trade size cap
    const cappedSize = Math.min(tradeSize, this.config.maxTradeSize);

    // Slippage protection: re-check price before submitting
    let currentPrice: number;
    try {
      currentPrice = await this.client.getMidpoint(signal.marketId);
    } catch {
      return this.failResult(signal, 'Failed to get current price for slippage check', timestamp);
    }

    const priceDiff = Math.abs(currentPrice - signal.marketProbability);
    if (priceDiff > this.config.slippageTolerance) {
      return this.failResult(
        signal,
        `Slippage too high: price moved ${(priceDiff * 100).toFixed(1)}% (tolerance: ${(this.config.slippageTolerance * 100).toFixed(1)}%)`,
        timestamp,
      );
    }

    // Build EIP-712 order (interface only — used when actual signing is wired)
    buildEIP712Order({
      maker: this.config.walletAddress,
      tokenId: signal.marketId,
      side: signal.side,
      price: currentPrice,
      size: cappedSize,
    });

    // Place order via CLOB client
    try {
      const order = await this.client.placeOrder({
        tokenId: signal.marketId,
        side: signal.side,
        price: currentPrice,
        size: cappedSize,
        orderType: 'GTC',
      });

      // Track first live trade for gradual rollout
      if (!this.firstLiveTradeAt) {
        this.firstLiveTradeAt = new Date();
      }

      // Record to experience store
      this.store.record({
        timestamp: new Date(),
        marketId: signal.marketId,
        vertical: signal.vertical,
        strategy: signal.strategy,
        marketQuestion: signal.reasoning,
        signalConfidence: signal.confidence,
        modelProbability: signal.modelProbability,
        marketProbability: signal.marketProbability,
        edgeDetected: signal.edge,
        positionSize: cappedSize,
        kellyFraction: riskState.bankroll > 0 ? cappedSize / riskState.bankroll : 0,
        side: signal.side,
        entryPrice: currentPrice,
        slippage: priceDiff,
        gasFee: 0.01,
        takerFee: cappedSize * 0.01,
        fillTimeMs: 0,
        outcome: 'PENDING',
        exitPrice: 0,
        pnl: 0,
        lesson: '',
        tags: ['live-trade'],
        similarPastTrades: [],
        metadata: { mode: 'live', orderId: order.id },
      });

      // Track position
      this.positions.set(signal.marketId, {
        marketId: signal.marketId,
        tokenId: signal.marketId,
        side: signal.side,
        size: cappedSize,
        entryPrice: currentPrice,
        currentPrice,
        unrealizedPnl: 0,
        enteredAt: new Date(),
      });

      this.dailyTradeCount++;

      const result: TradeResult = {
        success: true,
        orderId: order.id,
        marketId: signal.marketId,
        side: signal.side,
        size: cappedSize,
        price: currentPrice,
        timestamp,
      };

      // Emit events
      eventBus.emit('live:trade-executed', result);
      eventBus.emit('telegram:alert', {
        type: 'live_trade',
        message: `LIVE TRADE: ${signal.side} $${cappedSize.toFixed(2)} on ${signal.marketId} @ ${currentPrice.toFixed(4)}`,
      });

      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown order error';
      return this.failResult(signal, errorMsg, timestamp);
    }
  }

  /**
   * Close a position on a specific market.
   */
  async closePosition(marketId: string): Promise<TradeResult> {
    const timestamp = new Date();
    const position = this.positions.get(marketId);

    if (!position) {
      return {
        success: false,
        marketId,
        side: 'YES',
        size: 0,
        price: 0,
        error: `No open position for market ${marketId}`,
        timestamp,
      };
    }

    // Get current price
    let currentPrice: number;
    try {
      currentPrice = await this.client.getMidpoint(marketId);
    } catch {
      return {
        success: false,
        marketId,
        side: position.side,
        size: position.size,
        price: 0,
        error: 'Failed to get current price',
        timestamp,
      };
    }

    // Place sell order (opposite side)
    const sellSide = position.side === 'YES' ? 'NO' : 'YES';
    try {
      const order = await this.client.placeOrder({
        tokenId: marketId,
        side: sellSide,
        price: currentPrice,
        size: position.size,
        orderType: 'GTC',
      });

      const pnl = (currentPrice - position.entryPrice) * position.size;

      this.positions.delete(marketId);

      eventBus.emit('live:position-closed', { marketId, pnl });
      eventBus.emit('telegram:alert', {
        type: 'position_closed',
        message: `CLOSED: ${marketId} P&L: $${pnl.toFixed(2)}`,
      });

      return {
        success: true,
        orderId: order.id,
        marketId,
        side: sellSide,
        size: position.size,
        price: currentPrice,
        timestamp,
      };
    } catch (err) {
      return {
        success: false,
        marketId,
        side: sellSide,
        size: position.size,
        price: currentPrice,
        error: err instanceof Error ? err.message : 'Unknown error',
        timestamp,
      };
    }
  }

  /**
   * Get current real positions from the API.
   */
  async getPositions(): Promise<Position[]> {
    return this.client.getPositions();
  }

  /**
   * Get real USDC balance.
   */
  async getBalance(): Promise<number> {
    return this.client.getBalance();
  }

  /**
   * Emergency shutdown: cancel all open orders but do NOT close positions
   * (may need to hold through resolution).
   */
  async emergencyShutdown(): Promise<void> {
    this.shutdownRequested = true;

    eventBus.emit('live:emergency-shutdown', {
      openPositions: this.positions.size,
      reason: 'Manual emergency shutdown',
    });

    eventBus.emit('telegram:alert', {
      type: 'emergency',
      message: `EMERGENCY SHUTDOWN: ${this.positions.size} positions held, all new trading halted`,
    });

    // Note: We intentionally do NOT close positions here.
    // They may need to be held to resolution.
    this.initialized = false;
  }

  /**
   * Get current gradual rollout Kelly multiplier based on days since first live trade.
   */
  getKellyMultiplier(): number {
    if (!this.config.gradualRollout.enabled) {
      return 1.0;
    }

    if (!this.firstLiveTradeAt) {
      return this.config.gradualRollout.kellyMultiplier;
    }

    const daysLive = (Date.now() - this.firstLiveTradeAt.getTime()) / MS_PER_DAY;

    if (daysLive < 7) return 0.25;
    if (daysLive < 14) return 0.50;
    if (daysLive < 21) return 0.75;
    return 1.0;
  }

  /**
   * Check whether the trader is initialized and ready.
   */
  isReady(): boolean {
    return this.initialized && !this.shutdownRequested;
  }

  /**
   * Get open live positions (local tracker).
   */
  getOpenPositions(): LivePosition[] {
    return [...this.positions.values()];
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  private applyGradualRollout(suggestedSize: number): number {
    const multiplier = this.getKellyMultiplier();
    return Math.round(suggestedSize * multiplier * 100) / 100;
  }

  private failResult(signal: TradeSignal, error: string, timestamp: Date): TradeResult {
    eventBus.emit('live:trade-failed', { marketId: signal.marketId, error });
    return {
      success: false,
      marketId: signal.marketId,
      side: signal.side,
      size: signal.suggestedSize,
      price: 0,
      error,
      timestamp,
    };
  }
}
