import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OrderManager } from '../src/execution/order-manager.js';
import { eventBus } from '../src/engine/event-bus.js';
import type { TradeSignal } from '../src/types/index.js';

interface ApprovedSignal extends TradeSignal {
  composite: number;
}

function makeApproved(overrides: Partial<ApprovedSignal> = {}): ApprovedSignal {
  return {
    marketId: 'market-xyz',
    vertical: 'crypto',
    strategy: 'crypto_sentiment',
    side: 'YES',
    modelProbability: 0.70,
    marketProbability: 0.55,
    edge: 0.15,
    confidence: 0.80,
    suggestedSize: 25,
    reasoning: 'Test approved signal',
    timestamp: new Date(),
    composite: 0.65,
    ...overrides,
  };
}

describe('OrderManager', () => {
  let manager: OrderManager;

  beforeEach(() => {
    eventBus.removeAllListeners();
    // Instant execution for tests (no simulated delay)
    manager = new OrderManager({ simulatedExecMs: 0 });
  });

  // ---------------------------------------------------------------
  // Order creation
  // ---------------------------------------------------------------

  describe('order creation', () => {
    it('should create an order from an approved signal', () => {
      const signal = makeApproved();
      const order = manager.submitFromSignal(signal);

      expect(order.id).toBeTruthy();
      expect(order.marketId).toBe('market-xyz');
      expect(order.side).toBe('YES');
      expect(order.price).toBe(0.55);
      expect(order.size).toBe(25);
      expect(order.orderType).toBe('GTC');
    });

    it('should emit order:submitted on creation', () => {
      const submitted = vi.fn();
      eventBus.on('order:submitted', submitted);

      manager.submitFromSignal(makeApproved());

      expect(submitted).toHaveBeenCalledTimes(1);
      expect(submitted.mock.calls[0][0].marketId).toBe('market-xyz');
    });

    it('should emit order:filled after execution', async () => {
      const filled = vi.fn();
      eventBus.on('order:filled', filled);

      manager.submitFromSignal(makeApproved());

      // Wait for async execution to complete (fire-and-forget in submitFromSignal)
      await vi.waitFor(() => {
        expect(filled).toHaveBeenCalledTimes(1);
      }, { timeout: 2000, interval: 50 });

      expect(filled.mock.calls[0][0].status).toBe('filled');
      expect(filled.mock.calls[0][0].filledSize).toBe(25);
    });
  });

  // ---------------------------------------------------------------
  // Max concurrent orders
  // ---------------------------------------------------------------

  describe('concurrency limit', () => {
    it('should queue orders beyond max concurrent', () => {
      // Create manager with max 2 concurrent and slow execution
      const slowManager = new OrderManager({
        maxConcurrentOrders: 2,
        simulatedExecMs: 500,
      });

      slowManager.submitFromSignal(makeApproved({ marketId: 'a' }));
      slowManager.submitFromSignal(makeApproved({ marketId: 'b' }));
      slowManager.submitFromSignal(makeApproved({ marketId: 'c' }));

      expect(slowManager.getActiveCount()).toBe(2);
      expect(slowManager.getWaitingCount()).toBe(1);
    });

    it('should drain waiting queue as active orders complete', async () => {
      const mgr = new OrderManager({
        maxConcurrentOrders: 1,
        simulatedExecMs: 0,
      });

      const filled = vi.fn();
      eventBus.on('order:filled', filled);

      mgr.submitFromSignal(makeApproved({ marketId: 'first' }));
      mgr.submitFromSignal(makeApproved({ marketId: 'second' }));

      await vi.waitFor(() => {
        expect(filled).toHaveBeenCalledTimes(2);
      }, { timeout: 2000, interval: 50 });
    });
  });

  // ---------------------------------------------------------------
  // Slippage protection
  // ---------------------------------------------------------------

  describe('slippage protection', () => {
    it('should reject order when price moved >2%', async () => {
      const failed = vi.fn();
      eventBus.on('order:failed', failed);

      // Signal price = 0.55, current = 0.60 → ~9% slippage
      manager.updateMarketPrice('market-xyz', 0.60);
      manager.submitFromSignal(makeApproved({ marketProbability: 0.55 }));

      await vi.waitFor(() => {
        expect(failed).toHaveBeenCalledTimes(1);
      });

      expect(failed.mock.calls[0][0].reason).toMatch(/Slippage/);
    });

    it('should allow order when price movement is within tolerance', async () => {
      const filled = vi.fn();
      eventBus.on('order:filled', filled);

      // Signal price = 0.55, current = 0.555 → ~0.9% → OK
      manager.updateMarketPrice('market-xyz', 0.555);
      manager.submitFromSignal(makeApproved({ marketProbability: 0.55 }));

      await vi.waitFor(() => {
        expect(filled).toHaveBeenCalledTimes(1);
      });
    });
  });

  // ---------------------------------------------------------------
  // Cancellation
  // ---------------------------------------------------------------

  describe('order cancellation', () => {
    it('should cancel a waiting order', () => {
      const cancelled = vi.fn();
      eventBus.on('order:cancelled', cancelled);

      const slowManager = new OrderManager({
        maxConcurrentOrders: 1,
        simulatedExecMs: 5000,
      });

      slowManager.submitFromSignal(makeApproved({ marketId: 'active' }));
      const queued = slowManager.submitFromSignal(makeApproved({ marketId: 'queued' }));

      const success = slowManager.cancelOrder(queued.id);
      expect(success).toBe(true);
      expect(cancelled).toHaveBeenCalledTimes(1);
      expect(slowManager.getWaitingCount()).toBe(0);
    });

    it('should return false for unknown order id', () => {
      expect(manager.cancelOrder('nonexistent-id')).toBe(false);
    });
  });

  // ---------------------------------------------------------------
  // Order history
  // ---------------------------------------------------------------

  describe('order history', () => {
    it('should track all orders in history', async () => {
      manager.submitFromSignal(makeApproved({ marketId: 'hist-1' }));
      manager.submitFromSignal(makeApproved({ marketId: 'hist-2' }));

      const history = manager.getOrderHistory();
      expect(history).toHaveLength(2);
      expect(history[0].marketId).toBe('hist-1');
      expect(history[1].marketId).toBe('hist-2');
    });

    it('should return only open orders from getOpenOrders', async () => {
      const filled = vi.fn();
      eventBus.on('order:filled', filled);

      manager.submitFromSignal(makeApproved({ marketId: 'will-fill' }));

      await vi.waitFor(() => {
        expect(filled).toHaveBeenCalledTimes(1);
      }, { timeout: 2000, interval: 50 });

      // After fill, getOpenOrders should be empty
      expect(manager.getOpenOrders()).toHaveLength(0);
      // But full history still has it
      expect(manager.getOrderHistory()).toHaveLength(1);
    });
  });

  // ---------------------------------------------------------------
  // Event bus wiring
  // ---------------------------------------------------------------

  describe('event wiring', () => {
    it('should create orders from signal:approved events', async () => {
      const submitted = vi.fn();
      eventBus.on('order:submitted', submitted);

      eventBus.emit('signal:approved', makeApproved({ marketId: 'event-driven' }));

      expect(submitted).toHaveBeenCalledTimes(1);
      expect(submitted.mock.calls[0][0].marketId).toBe('event-driven');
    });
  });
});
