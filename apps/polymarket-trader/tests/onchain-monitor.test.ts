import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  OnChainMonitor,
  hexToNumber,
  weiToMatic,
  rawUsdcToFormatted,
  weiToGwei,
  encodeBalanceOf,
  type GasInfo,
  type BalanceInfo,
} from '../src/integrations/onchain-monitor.js';

// ---------------------------------------------------------------------------
// Hex/BigInt helpers
// ---------------------------------------------------------------------------

describe('hex/number helpers', () => {
  describe('hexToNumber', () => {
    it('should parse valid hex to number', () => {
      expect(hexToNumber('0xa')).toBe(10);
      expect(hexToNumber('0xff')).toBe(255);
      expect(hexToNumber('0x0')).toBe(0);
      expect(hexToNumber('0x1')).toBe(1);
    });

    it('should return 0 for empty/invalid hex', () => {
      expect(hexToNumber('')).toBe(0);
      expect(hexToNumber('0x')).toBe(0);
      expect(hexToNumber('not-hex')).toBe(0);
    });

    it('should handle large hex values', () => {
      // 1000000 in hex
      expect(hexToNumber('0xf4240')).toBe(1_000_000);
    });
  });

  describe('weiToGwei', () => {
    it('should convert wei hex to gwei', () => {
      // 30 gwei = 30_000_000_000 wei = 0x6FC23AC00
      expect(weiToGwei('0x6FC23AC00')).toBeCloseTo(30, 0);
    });

    it('should return 0 for empty input', () => {
      expect(weiToGwei('')).toBe(0);
      expect(weiToGwei('0x0')).toBe(0);
      expect(weiToGwei('0x')).toBe(0);
    });

    it('should handle typical Polygon gas (~30 gwei)', () => {
      // 50 gwei = 50_000_000_000 wei = 0xBA43B7400
      const gwei = weiToGwei('0xBA43B7400');
      expect(gwei).toBeCloseTo(50, 0);
    });
  });

  describe('weiToMatic', () => {
    it('should convert wei hex to MATIC', () => {
      // 1 MATIC = 10^18 wei = 0xDE0B6B3A7640000
      expect(weiToMatic('0xDE0B6B3A7640000')).toBeCloseTo(1.0, 4);
    });

    it('should return 0 for empty', () => {
      expect(weiToMatic('')).toBe(0);
      expect(weiToMatic('0x0')).toBe(0);
    });

    it('should handle fractional MATIC', () => {
      // 0.5 MATIC = 5 * 10^17 = 0x6F05B59D3B20000
      expect(weiToMatic('0x6F05B59D3B20000')).toBeCloseTo(0.5, 4);
    });
  });

  describe('rawUsdcToFormatted', () => {
    it('should convert raw USDC (6 decimals) to human readable', () => {
      // 100 USDC = 100_000_000 raw = 0x5F5E100
      expect(rawUsdcToFormatted('0x5F5E100')).toBeCloseTo(100, 2);
    });

    it('should handle 500 USDC', () => {
      // 500_000_000 = 0x1DCD6500
      expect(rawUsdcToFormatted('0x1DCD6500')).toBeCloseTo(500, 2);
    });

    it('should return 0 for empty', () => {
      expect(rawUsdcToFormatted('')).toBe(0);
      expect(rawUsdcToFormatted('0x0')).toBe(0);
    });
  });

  describe('encodeBalanceOf', () => {
    it('should encode address into balanceOf call data', () => {
      const data = encodeBalanceOf('0x1234567890abcdef1234567890abcdef12345678');
      expect(data).toMatch(/^0x70a08231/); // balanceOf selector
      expect(data).toHaveLength(2 + 8 + 64); // 0x + 4 bytes selector + 32 bytes address
    });

    it('should pad shorter addresses', () => {
      const data = encodeBalanceOf('0xabc');
      expect(data).toMatch(/^0x70a08231/);
      expect(data).toHaveLength(2 + 8 + 64);
    });
  });
});

// ---------------------------------------------------------------------------
// OnChainMonitor
// ---------------------------------------------------------------------------

describe('OnChainMonitor', () => {
  let monitor: OnChainMonitor;

  beforeEach(() => {
    monitor = new OnChainMonitor({
      rpcUrl: 'https://polygon-rpc.com',
      gasThresholdGwei: 100,
      requestTimeoutMs: 5_000,
    });
  });

  afterEach(() => {
    monitor.stopPolling();
  });

  // -------------------------------------------------------------------------
  // getGasPrice
  // -------------------------------------------------------------------------

  describe('getGasPrice', () => {
    it('should parse gas price from RPC response', async () => {
      // Mock: 30 gwei
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify({ jsonrpc: '2.0', id: 1, result: '0x6FC23AC00' }), { status: 200 }),
      );

      const gas = await monitor.getGasPrice();
      expect(gas.gasPriceGwei).toBeCloseTo(30, 0);
      expect(gas.isSafe).toBe(true); // 30 < 100 threshold
      expect(gas.timestamp).toBeInstanceOf(Date);

      fetchSpy.mockRestore();
    });

    it('should mark gas as unsafe above threshold', async () => {
      // 150 gwei = 150_000_000_000 = 0x22ECB25C00
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify({ jsonrpc: '2.0', id: 1, result: '0x22ECB25C00' }), { status: 200 }),
      );

      const gas = await monitor.getGasPrice();
      expect(gas.gasPriceGwei).toBeCloseTo(150, 0);
      expect(gas.isSafe).toBe(false);

      fetchSpy.mockRestore();
    });

    it('should return safe=false and 0 gwei on failure', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(
        new Error('Network error'),
      );

      const gas = await monitor.getGasPrice();
      expect(gas.gasPriceGwei).toBe(0);
      expect(gas.isSafe).toBe(false);

      fetchSpy.mockRestore();
    });

    it('should return safe=false on HTTP error', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response('', { status: 500 }),
      );

      const gas = await monitor.getGasPrice();
      expect(gas.gasPriceGwei).toBe(0);
      expect(gas.isSafe).toBe(false);

      fetchSpy.mockRestore();
    });

    it('should return safe=false on RPC error response', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify({ jsonrpc: '2.0', id: 1, error: { code: -32000, message: 'err' } }), { status: 200 }),
      );

      const gas = await monitor.getGasPrice();
      expect(gas.gasPriceGwei).toBe(0);
      expect(gas.isSafe).toBe(false);

      fetchSpy.mockRestore();
    });
  });

  // -------------------------------------------------------------------------
  // getBalance
  // -------------------------------------------------------------------------

  describe('getBalance', () => {
    it('should parse MATIC balance from hex', async () => {
      // 1 MATIC
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify({ jsonrpc: '2.0', id: 1, result: '0xDE0B6B3A7640000' }), { status: 200 }),
      );

      const balance = await monitor.getBalance('0x1234567890abcdef1234567890abcdef12345678');
      expect(balance.balanceFormatted).toBeCloseTo(1.0, 4);
      expect(balance.token).toBe('MATIC');
      expect(balance.address).toBe('0x1234567890abcdef1234567890abcdef12345678');

      fetchSpy.mockRestore();
    });

    it('should return zero balance on failure', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(
        new Error('fail'),
      );

      const balance = await monitor.getBalance('0xabc');
      expect(balance.balanceFormatted).toBe(0);
      expect(balance.token).toBe('MATIC');

      fetchSpy.mockRestore();
    });
  });

  // -------------------------------------------------------------------------
  // getUSDCBalance
  // -------------------------------------------------------------------------

  describe('getUSDCBalance', () => {
    it('should parse USDC balance from hex (6 decimals)', async () => {
      // 500 USDC = 500_000_000 = 0x1DCD6500
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify({ jsonrpc: '2.0', id: 1, result: '0x1DCD6500' }), { status: 200 }),
      );

      const balance = await monitor.getUSDCBalance('0x1234567890abcdef1234567890abcdef12345678');
      expect(balance.balanceFormatted).toBeCloseTo(500, 2);
      expect(balance.token).toBe('USDC');

      fetchSpy.mockRestore();
    });

    it('should return zero on failure', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(
        new Error('fail'),
      );

      const balance = await monitor.getUSDCBalance('0xabc');
      expect(balance.balanceFormatted).toBe(0);
      expect(balance.token).toBe('USDC');

      fetchSpy.mockRestore();
    });
  });

  // -------------------------------------------------------------------------
  // isGasSafe
  // -------------------------------------------------------------------------

  describe('isGasSafe', () => {
    it('should return true when gas is below threshold', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify({ jsonrpc: '2.0', id: 1, result: '0x6FC23AC00' }), { status: 200 }),
      );

      const safe = await monitor.isGasSafe();
      expect(safe).toBe(true);

      fetchSpy.mockRestore();
    });

    it('should return false when gas is above threshold', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify({ jsonrpc: '2.0', id: 1, result: '0x22ECB25C00' }), { status: 200 }),
      );

      const safe = await monitor.isGasSafe();
      expect(safe).toBe(false);

      fetchSpy.mockRestore();
    });

    it('should return false on failure (fail-safe)', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(
        new Error('Network error'),
      );

      const safe = await monitor.isGasSafe();
      expect(safe).toBe(false);

      fetchSpy.mockRestore();
    });

    it('should use cached gas info if recent', async () => {
      // First call populates cache
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify({ jsonrpc: '2.0', id: 1, result: '0x6FC23AC00' }), { status: 200 }),
      );

      await monitor.getGasPrice(); // populates lastGasInfo
      const safe = await monitor.isGasSafe(); // should use cached
      expect(safe).toBe(true);
      expect(fetchSpy).toHaveBeenCalledTimes(1); // no second fetch

      fetchSpy.mockRestore();
    });
  });

  // -------------------------------------------------------------------------
  // waitForConfirmation
  // -------------------------------------------------------------------------

  describe('waitForConfirmation', () => {
    it('should return timeout when tx is not confirmed in time', async () => {
      // Always return null receipt (pending)
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(JSON.stringify({ jsonrpc: '2.0', id: 1, result: null }), { status: 200 }),
      );

      const result = await monitor.waitForConfirmation('0xabc', 500, 100);
      expect(result.status).toBe('timeout');
      expect(result.confirmed).toBe(false);
      expect(result.txHash).toBe('0xabc');

      fetchSpy.mockRestore();
    });

    it('should return success when receipt shows status 0x1', async () => {
      // First call via rpcCall returns string (falls through), second via getTransactionReceipt returns receipt
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          result: { status: '0x1', blockNumber: '0x1234' },
        }), { status: 200 }),
      );

      const result = await monitor.waitForConfirmation('0xabc', 10_000, 100);
      expect(result.confirmed).toBe(true);
      expect(result.status).toBe('success');
      expect(result.blockNumber).toBe(0x1234);

      fetchSpy.mockRestore();
    });

    it('should return failed when receipt shows status 0x0', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          result: { status: '0x0', blockNumber: '0x100' },
        }), { status: 200 }),
      );

      const result = await monitor.waitForConfirmation('0xabc', 10_000, 100);
      expect(result.confirmed).toBe(false);
      expect(result.status).toBe('failed');

      fetchSpy.mockRestore();
    });

    it('should handle network errors during polling gracefully', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockRejectedValue(
        new Error('Network error'),
      );

      const result = await monitor.waitForConfirmation('0xabc', 500, 100);
      expect(result.status).toBe('timeout');
      expect(result.confirmed).toBe(false);

      fetchSpy.mockRestore();
    });
  });

  // -------------------------------------------------------------------------
  // Configurable threshold
  // -------------------------------------------------------------------------

  describe('configurable gas threshold', () => {
    it('should use custom threshold', async () => {
      const customMonitor = new OnChainMonitor({ gasThresholdGwei: 50 });

      // 30 gwei -- under 50 threshold
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify({ jsonrpc: '2.0', id: 1, result: '0x6FC23AC00' }), { status: 200 }),
      );

      const gas = await customMonitor.getGasPrice();
      expect(gas.isSafe).toBe(true);

      fetchSpy.mockRestore();
    });

    it('should mark as unsafe with lower threshold', async () => {
      const strictMonitor = new OnChainMonitor({ gasThresholdGwei: 20 });

      // 30 gwei -- above 20 threshold
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify({ jsonrpc: '2.0', id: 1, result: '0x6FC23AC00' }), { status: 200 }),
      );

      const gas = await strictMonitor.getGasPrice();
      expect(gas.isSafe).toBe(false);

      fetchSpy.mockRestore();
    });
  });

  // -------------------------------------------------------------------------
  // Polling
  // -------------------------------------------------------------------------

  describe('polling', () => {
    it('should start and stop gas polling without errors', () => {
      expect(() => monitor.startPolling()).not.toThrow();
      expect(() => monitor.stopPolling()).not.toThrow();
    });

    it('should start and stop with address for balance polling', () => {
      expect(() => monitor.startPolling('0xabc')).not.toThrow();
      expect(() => monitor.stopPolling()).not.toThrow();
    });
  });
});
