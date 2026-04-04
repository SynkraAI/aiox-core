import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  WhaleTracker,
  calculateFollowDelay,
  calculateFollowSize,
  calculateWhaleConfidence,
  MIN_WHALE_POSITION_SIZE,
  MIN_WIN_RATE,
  MIN_TRADES_FOR_QUALIFICATION,
  MAX_FOLLOW_PERCENT,
  MAX_FOLLOW_SIZE_USD,
  MIN_MARKET_VOLUME,
  CROWD_PENALTY,
  VERTICAL_BOOST,
  SMALL_POSITION_PENALTY,
  TYPICAL_SIZE_THRESHOLD,
  CROWD_THRESHOLD,
  type WhaleSignal,
  type WhaleStats,
} from '../src/strategies/whale-tracker.js';
import { eventBus } from '../src/engine/event-bus.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeWhaleStats(overrides: Partial<WhaleStats> = {}): WhaleStats {
  return {
    address: '0xwhale1',
    totalTrades: 100,
    wins: 65,
    losses: 35,
    winRate: 0.65,
    totalPnl: 5000,
    avgPositionSize: 1000,
    verticalEdge: { crypto: 0.70, weather: 0.55 },
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('WhaleTracker', () => {
  let tracker: WhaleTracker;

  beforeEach(() => {
    tracker = new WhaleTracker();
    eventBus.removeAllListeners();
  });

  // ─── Watchlist Management ──────────────────────────

  describe('watchlist management', () => {
    it('should add a wallet to the watchlist', () => {
      tracker.addWallet('0xABC123', 'Big Player');
      const list = tracker.getWatchlist();
      expect(list).toHaveLength(1);
      expect(list[0].address).toBe('0xabc123'); // Normalized to lowercase
      expect(list[0].label).toBe('Big Player');
    });

    it('should not add duplicate wallets', () => {
      tracker.addWallet('0xABC', 'Player 1');
      tracker.addWallet('0xabc', 'Player 1 Dupe');
      expect(tracker.getWatchlist()).toHaveLength(1);
    });

    it('should remove a wallet from the watchlist', () => {
      tracker.addWallet('0xABC', 'Player 1');
      tracker.addWallet('0xDEF', 'Player 2');
      tracker.removeWallet('0xABC');
      const list = tracker.getWatchlist();
      expect(list).toHaveLength(1);
      expect(list[0].address).toBe('0xdef');
    });

    it('should return empty watchlist initially', () => {
      expect(tracker.getWatchlist()).toHaveLength(0);
    });

    it('should handle removing non-existent wallet gracefully', () => {
      tracker.removeWallet('0xNONEXISTENT');
      expect(tracker.getWatchlist()).toHaveLength(0);
    });
  });

  // ─── Whale Stats ───────────────────────────────────

  describe('whale performance', () => {
    it('should return null for untracked wallet', () => {
      expect(tracker.getWhalePerformance('0xunknown')).toBeNull();
    });

    it('should return cached stats after setWhaleStats', () => {
      const stats = makeWhaleStats({ address: '0xwhale1' });
      tracker.setWhaleStats('0xWhale1', stats);
      const result = tracker.getWhalePerformance('0xWhale1');
      expect(result).not.toBeNull();
      expect(result!.winRate).toBe(0.65);
      expect(result!.totalTrades).toBe(100);
    });

    it('should also clear stats cache on removeWallet', () => {
      tracker.addWallet('0xwhale1', 'Whale');
      tracker.setWhaleStats('0xwhale1', makeWhaleStats());
      tracker.removeWallet('0xwhale1');
      expect(tracker.getWhalePerformance('0xwhale1')).toBeNull();
    });
  });

  // ─── Follow Delay ──────────────────────────────────

  describe('follow delay calculation', () => {
    it('should calculate delay within range', () => {
      const delay = calculateFollowDelay(300_000, 900_000, 0.5);
      expect(delay).toBe(600_000); // Midpoint
    });

    it('should return min delay when random is 0', () => {
      const delay = calculateFollowDelay(300_000, 900_000, 0);
      expect(delay).toBe(300_000);
    });

    it('should return max delay when random is 1', () => {
      const delay = calculateFollowDelay(300_000, 900_000, 1);
      expect(delay).toBe(900_000);
    });
  });

  // ─── Follow Size ───────────────────────────────────

  describe('follow size calculation', () => {
    it('should cap at maxFollowSizeUsd', () => {
      // 10% of $1000 = $100, but cap is $50
      const size = calculateFollowSize(1000, 0.10, 50);
      expect(size).toBe(50);
    });

    it('should use proportional size when smaller than cap', () => {
      // 10% of $200 = $20, which is under $50 cap
      const size = calculateFollowSize(200, 0.10, 50);
      expect(size).toBe(20);
    });

    it('should handle zero whale size', () => {
      const size = calculateFollowSize(0, 0.10, 50);
      expect(size).toBe(0);
    });

    it('should round to 2 decimal places', () => {
      const size = calculateFollowSize(333, 0.10, 50);
      expect(size).toBe(33.3);
    });
  });

  // ─── Confidence Scoring ────────────────────────────

  describe('confidence scoring', () => {
    it('should use win rate as base confidence', () => {
      const confidence = calculateWhaleConfidence({
        winRate: 0.65,
        hasVerticalEdge: false,
        isCrowded: false,
        isSmallForWhale: false,
      });
      expect(confidence).toBe(0.65);
    });

    it('should boost confidence for vertical edge', () => {
      const confidence = calculateWhaleConfidence({
        winRate: 0.65,
        hasVerticalEdge: true,
        isCrowded: false,
        isSmallForWhale: false,
      });
      expect(confidence).toBe(0.75); // 0.65 + 0.10
    });

    it('should apply crowd penalty', () => {
      const confidence = calculateWhaleConfidence({
        winRate: 0.65,
        hasVerticalEdge: false,
        isCrowded: true,
        isSmallForWhale: false,
      });
      expect(confidence).toBe(0.5); // 0.65 - 0.15
    });

    it('should apply small position penalty', () => {
      const confidence = calculateWhaleConfidence({
        winRate: 0.65,
        hasVerticalEdge: false,
        isCrowded: false,
        isSmallForWhale: true,
      });
      expect(confidence).toBe(0.55); // 0.65 - 0.10
    });

    it('should combine all modifiers', () => {
      const confidence = calculateWhaleConfidence({
        winRate: 0.65,
        hasVerticalEdge: true,
        isCrowded: true,
        isSmallForWhale: true,
      });
      // 0.65 + 0.10 - 0.15 - 0.10 = 0.50
      expect(confidence).toBe(0.5);
    });

    it('should clamp confidence to [0, 1]', () => {
      const low = calculateWhaleConfidence({
        winRate: 0.10,
        hasVerticalEdge: false,
        isCrowded: true,
        isSmallForWhale: true,
      });
      expect(low).toBe(0); // 0.10 - 0.15 - 0.10 = -0.15 -> 0

      const high = calculateWhaleConfidence({
        winRate: 0.95,
        hasVerticalEdge: true,
        isCrowded: false,
        isSmallForWhale: false,
      });
      expect(high).toBe(1); // 0.95 + 0.10 = 1.05 -> 1
    });
  });

  // ─── Scan Whale Activity ───────────────────────────

  describe('scanWhaleActivity', () => {
    it('should return empty array for empty watchlist', async () => {
      const signals = await tracker.scanWhaleActivity();
      expect(signals).toHaveLength(0);
    });

    it('should skip wallets without stats', async () => {
      tracker.addWallet('0xwhale1', 'Whale 1');
      // No stats set
      const signals = await tracker.scanWhaleActivity();
      expect(signals).toHaveLength(0);
    });

    it('should skip wallets below min trades', async () => {
      tracker.addWallet('0xwhale1', 'Whale 1');
      tracker.setWhaleStats('0xwhale1', makeWhaleStats({
        totalTrades: 10, // Below MIN_TRADES_FOR_QUALIFICATION (50)
        winRate: 0.70,
      }));
      const signals = await tracker.scanWhaleActivity();
      expect(signals).toHaveLength(0);
    });

    it('should skip wallets below min win rate', async () => {
      tracker.addWallet('0xwhale1', 'Whale 1');
      tracker.setWhaleStats('0xwhale1', makeWhaleStats({
        totalTrades: 100,
        winRate: 0.40, // Below MIN_WIN_RATE (0.55)
      }));
      const signals = await tracker.scanWhaleActivity();
      expect(signals).toHaveLength(0);
    });
  });

  // ─── Signal Conversion ─────────────────────────────

  describe('toTradeSignal', () => {
    it('should convert WhaleSignal to TradeSignal', () => {
      const whaleSignal: WhaleSignal = {
        walletAddress: '0xwhale1',
        walletLabel: 'Big Player',
        marketId: 'market-1',
        side: 'YES',
        size: 1000,
        timestamp: new Date(),
        whaleWinRate: 0.65,
        confidence: 0.70,
      };

      const tradeSignal = tracker.toTradeSignal(whaleSignal, 'crypto');

      expect(tradeSignal.marketId).toBe('market-1');
      expect(tradeSignal.strategy).toBe('whale_follow');
      expect(tradeSignal.side).toBe('YES');
      expect(tradeSignal.vertical).toBe('crypto');
      expect(tradeSignal.confidence).toBe(0.70);
      // Max follow: min(10% of 1000 = 100, 50) = 50
      expect(tradeSignal.suggestedSize).toBe(50);
      expect(tradeSignal.reasoning).toContain('Big Player');
      expect(tradeSignal.reasoning).toContain('65.0%');
    });

    it('should emit signal:detected event', () => {
      const spy = vi.fn();
      eventBus.on('signal:detected', spy);

      const whaleSignal: WhaleSignal = {
        walletAddress: '0xwhale1',
        walletLabel: 'Whale',
        marketId: 'market-1',
        side: 'NO',
        size: 500,
        timestamp: new Date(),
        whaleWinRate: 0.60,
        confidence: 0.60,
      };

      tracker.toTradeSignal(whaleSignal);
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy.mock.calls[0][0].strategy).toBe('whale_follow');
    });

    it('should use default vertical when not provided', () => {
      const whaleSignal: WhaleSignal = {
        walletAddress: '0xwhale1',
        walletLabel: 'Whale',
        marketId: 'market-1',
        side: 'YES',
        size: 600,
        timestamp: new Date(),
        whaleWinRate: 0.60,
        confidence: 0.60,
      };

      const signal = tracker.toTradeSignal(whaleSignal);
      expect(signal.vertical).toBe('crypto');
    });

    it('should calculate edge as winRate minus 0.50', () => {
      const whaleSignal: WhaleSignal = {
        walletAddress: '0xwhale1',
        walletLabel: 'Whale',
        marketId: 'market-1',
        side: 'YES',
        size: 600,
        timestamp: new Date(),
        whaleWinRate: 0.70,
        confidence: 0.70,
      };

      const signal = tracker.toTradeSignal(whaleSignal);
      expect(signal.edge).toBeCloseTo(0.20); // 0.70 - 0.50
    });
  });

  // ─── Config ────────────────────────────────────────

  describe('config', () => {
    it('should use default config', () => {
      const config = tracker.getConfig();
      expect(config.minPositionSize).toBe(MIN_WHALE_POSITION_SIZE);
      expect(config.minWinRate).toBe(MIN_WIN_RATE);
      expect(config.maxFollowSizeUsd).toBe(MAX_FOLLOW_SIZE_USD);
    });

    it('should accept custom config overrides', () => {
      const custom = new WhaleTracker({
        minPositionSize: 1000,
        minWinRate: 0.60,
        maxFollowSizeUsd: 100,
      });
      const config = custom.getConfig();
      expect(config.minPositionSize).toBe(1000);
      expect(config.minWinRate).toBe(0.60);
      expect(config.maxFollowSizeUsd).toBe(100);
    });
  });

  // ─── Constants ─────────────────────────────────────

  describe('constants', () => {
    it('should have correct default values', () => {
      expect(MIN_WHALE_POSITION_SIZE).toBe(500);
      expect(MIN_WIN_RATE).toBe(0.55);
      expect(MIN_TRADES_FOR_QUALIFICATION).toBe(50);
      expect(MAX_FOLLOW_PERCENT).toBe(0.10);
      expect(MAX_FOLLOW_SIZE_USD).toBe(50);
      expect(MIN_MARKET_VOLUME).toBe(10_000);
      expect(CROWD_PENALTY).toBe(0.15);
      expect(VERTICAL_BOOST).toBe(0.10);
      expect(SMALL_POSITION_PENALTY).toBe(0.10);
      expect(TYPICAL_SIZE_THRESHOLD).toBe(0.50);
      expect(CROWD_THRESHOLD).toBe(2);
    });
  });
});
