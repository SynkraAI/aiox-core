/**
 * Risk Engine: Kelly criterion, position sizing, circuit breakers.
 * Enforces all risk limits from UltraPlan D6.
 */

import { eventBus } from './event-bus.js';
import { DEFAULT_RISK_LIMITS } from '../config/defaults.js';
import type { KellyResult, RiskLimits, RiskState, TradeSignal } from '../types/index.js';

export class RiskEngine {
  private state: RiskState;
  private limits: RiskLimits;

  constructor(bankroll: number, limits: RiskLimits = DEFAULT_RISK_LIMITS) {
    this.limits = limits;
    this.state = {
      bankroll,
      dailyPnl: 0,
      weeklyPnl: 0,
      openPositions: 0,
      totalExposure: 0,
      circuitBreakerTripped: false,
      lastUpdated: new Date(),
    };

    this.wireEvents();
  }

  private wireEvents(): void {
    eventBus.on('position:opened', () => {
      this.state.openPositions++;
      this.emitState();
    });

    eventBus.on('position:closed', ({ pnl }) => {
      this.state.openPositions--;
      this.state.dailyPnl += pnl;
      this.state.weeklyPnl += pnl;
      this.state.bankroll += pnl;
      this.checkCircuitBreakers();
      this.emitState();
    });
  }

  /**
   * Kelly Criterion for prediction markets.
   * f* = (p - market_price) / (1 - market_price)
   * Then apply fractional Kelly (D6: 15%).
   */
  calculateKelly(modelProbability: number, marketPrice: number): KellyResult {
    const edge = modelProbability - marketPrice;

    if (edge <= 0) {
      return { optimalFraction: 0, adjustedFraction: 0, suggestedSize: 0, edge, probability: modelProbability };
    }

    const optimalFraction = edge / (1 - marketPrice);
    const adjustedFraction = optimalFraction * this.limits.kellyFraction;
    const suggestedSize = Math.min(
      this.state.bankroll * adjustedFraction,
      this.limits.maxPositionSize,
      this.state.bankroll * this.limits.maxBankrollPercent
    );

    return {
      optimalFraction,
      adjustedFraction,
      suggestedSize: Math.max(0, Math.round(suggestedSize * 100) / 100),
      edge,
      probability: modelProbability,
    };
  }

  /**
   * Evaluate whether a signal should be approved for execution.
   * Returns { approved, reason }.
   */
  evaluateSignal(signal: TradeSignal): { approved: boolean; reason: string; suggestedSize: number } {
    // Circuit breaker check
    if (this.state.circuitBreakerTripped) {
      return { approved: false, reason: `Circuit breaker active: ${this.state.circuitBreakerReason}`, suggestedSize: 0 };
    }

    // Max open positions
    if (this.state.openPositions >= this.limits.maxOpenPositions) {
      return { approved: false, reason: `Max open positions (${this.limits.maxOpenPositions}) reached`, suggestedSize: 0 };
    }

    // Minimum edge check
    if (signal.edge < this.limits.minEdge) {
      return { approved: false, reason: `Edge ${(signal.edge * 100).toFixed(1)}% below minimum ${(this.limits.minEdge * 100).toFixed(1)}%`, suggestedSize: 0 };
    }

    // Minimum liquidity check (signal should carry market liquidity)
    // This would be checked via market data, skipping here for now

    // Calculate position size via Kelly
    const kelly = this.calculateKelly(signal.modelProbability, signal.marketProbability);

    if (kelly.suggestedSize < 1) {
      return { approved: false, reason: 'Kelly suggests position too small (<$1)', suggestedSize: 0 };
    }

    return { approved: true, reason: 'Signal approved by Risk Engine', suggestedSize: kelly.suggestedSize };
  }

  private checkCircuitBreakers(): void {
    const dailyLossPercent = -this.state.dailyPnl / (this.state.bankroll - this.state.dailyPnl);
    const weeklyLossPercent = -this.state.weeklyPnl / (this.state.bankroll - this.state.weeklyPnl);

    if (dailyLossPercent >= this.limits.dailyLossLimit) {
      this.tripCircuitBreaker(`Daily loss limit hit: ${(dailyLossPercent * 100).toFixed(1)}%`);
    } else if (weeklyLossPercent >= this.limits.weeklyLossLimit) {
      this.tripCircuitBreaker(`Weekly loss limit hit: ${(weeklyLossPercent * 100).toFixed(1)}%`);
    }
  }

  private tripCircuitBreaker(reason: string): void {
    this.state.circuitBreakerTripped = true;
    this.state.circuitBreakerReason = reason;
    eventBus.emit('risk:circuit-breaker', { reason, action: 'halt-trading' });
  }

  resetCircuitBreaker(): void {
    this.state.circuitBreakerTripped = false;
    this.state.circuitBreakerReason = undefined;
    this.emitState();
  }

  resetDaily(): void {
    this.state.dailyPnl = 0;
    this.emitState();
  }

  resetWeekly(): void {
    this.state.weeklyPnl = 0;
    this.emitState();
  }

  getState(): Readonly<RiskState> {
    return { ...this.state };
  }

  updateBankroll(amount: number): void {
    this.state.bankroll = amount;
    this.emitState();
  }

  private emitState(): void {
    this.state.lastUpdated = new Date();
    eventBus.emit('risk:updated', { ...this.state });
  }
}
