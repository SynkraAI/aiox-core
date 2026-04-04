/**
 * On-Chain Monitor for Polymarket trading on Polygon.
 *
 * Monitors gas prices, token balances (MATIC/POL & USDC), and
 * transaction confirmations via public Polygon RPC endpoints.
 * Provides safety checks before trade execution.
 *
 * Zero external dependencies -- uses native fetch() for JSON-RPC calls.
 */

import { eventBus } from '../engine/event-bus.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface GasInfo {
  gasPriceGwei: number;
  isSafe: boolean;
  timestamp: Date;
}

export interface BalanceInfo {
  address: string;
  balanceWei: string;
  balanceFormatted: number;   // human-readable (MATIC or USDC)
  token: 'MATIC' | 'USDC';
  timestamp: Date;
}

export interface TxConfirmation {
  txHash: string;
  confirmed: boolean;
  blockNumber: number | null;
  status: 'success' | 'failed' | 'pending' | 'timeout';
  timestamp: Date;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Polygon USDC contract (PoS bridged) */
const USDC_CONTRACT = '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359';

/** Default public Polygon RPC */
const DEFAULT_RPC_URL = 'https://polygon-rpc.com';

/** Default gas threshold in gwei */
const DEFAULT_GAS_THRESHOLD_GWEI = 100;

/** Default poll intervals */
const DEFAULT_GAS_POLL_MS = 30_000;   // 30 seconds
const DEFAULT_BALANCE_POLL_MS = 60_000; // 60 seconds

// ---------------------------------------------------------------------------
// Hex/BigInt helpers
// ---------------------------------------------------------------------------

/**
 * Parse a hex string (0x...) to a number.
 * Uses BigInt internally for safety with large values.
 */
export function hexToNumber(hex: string): number {
  if (!hex || hex === '0x' || hex === '0x0') return 0;
  try {
    return Number(BigInt(hex));
  } catch {
    return 0;
  }
}

/**
 * Convert wei (as hex) to MATIC (18 decimals).
 */
export function weiToMatic(weiHex: string): number {
  if (!weiHex || weiHex === '0x' || weiHex === '0x0') return 0;
  try {
    const wei = BigInt(weiHex);
    // Divide by 10^18, keeping reasonable precision
    const matic = Number(wei) / 1e18;
    return Math.round(matic * 1e6) / 1e6; // 6 decimal places
  } catch {
    return 0;
  }
}

/**
 * Convert USDC raw amount (hex, 6 decimals) to human readable.
 */
export function rawUsdcToFormatted(rawHex: string): number {
  if (!rawHex || rawHex === '0x' || rawHex === '0x0') return 0;
  try {
    const raw = BigInt(rawHex);
    return Number(raw) / 1e6; // USDC has 6 decimals
  } catch {
    return 0;
  }
}

/**
 * Convert gwei (number) from raw gas price in wei.
 */
export function weiToGwei(weiHex: string): number {
  if (!weiHex || weiHex === '0x' || weiHex === '0x0') return 0;
  try {
    const wei = BigInt(weiHex);
    return Number(wei) / 1e9;
  } catch {
    return 0;
  }
}

// ---------------------------------------------------------------------------
// JSON-RPC helper
// ---------------------------------------------------------------------------

interface RpcResponse {
  result?: string;
  error?: { code: number; message: string };
}

/**
 * Call a JSON-RPC method on the configured endpoint.
 * Returns null on any failure -- never throws.
 */
async function rpcCall(
  rpcUrl: string,
  method: string,
  params: unknown[],
  timeoutMs: number,
): Promise<string | null> {
  try {
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method,
        params,
      }),
      signal: AbortSignal.timeout(timeoutMs),
    });

    if (!response.ok) return null;

    const json = (await response.json()) as RpcResponse;
    if (json.error || !json.result) return null;

    return json.result;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// ERC-20 balanceOf encoding
// ---------------------------------------------------------------------------

/**
 * Encode an ERC-20 balanceOf(address) call.
 * balanceOf selector: 0x70a08231
 */
export function encodeBalanceOf(address: string): string {
  const cleaned = address.toLowerCase().replace('0x', '');
  const padded = cleaned.padStart(64, '0');
  return `0x70a08231${padded}`;
}

// ---------------------------------------------------------------------------
// OnChainMonitor
// ---------------------------------------------------------------------------

export interface OnChainConfig {
  rpcUrl?: string;
  gasThresholdGwei?: number;
  gasPollMs?: number;
  balancePollMs?: number;
  requestTimeoutMs?: number;
}

export class OnChainMonitor {
  private rpcUrl: string;
  private gasThresholdGwei: number;
  private gasPollMs: number;
  private balancePollMs: number;
  private requestTimeoutMs: number;
  private gasPollTimer: ReturnType<typeof setInterval> | null = null;
  private balancePollTimer: ReturnType<typeof setInterval> | null = null;
  private lastGasInfo: GasInfo | null = null;

  constructor(config: OnChainConfig = {}) {
    this.rpcUrl = config.rpcUrl ?? DEFAULT_RPC_URL;
    this.gasThresholdGwei = config.gasThresholdGwei ?? DEFAULT_GAS_THRESHOLD_GWEI;
    this.gasPollMs = config.gasPollMs ?? DEFAULT_GAS_POLL_MS;
    this.balancePollMs = config.balancePollMs ?? DEFAULT_BALANCE_POLL_MS;
    this.requestTimeoutMs = config.requestTimeoutMs ?? 10_000;
  }

  /**
   * Get current gas price on Polygon.
   * Returns gas info with safety assessment.
   * Returns safe default (0 gwei, isSafe=false) on failure.
   */
  async getGasPrice(): Promise<GasInfo> {
    try {
      const result = await rpcCall(this.rpcUrl, 'eth_gasPrice', [], this.requestTimeoutMs);

      if (!result) {
        return { gasPriceGwei: 0, isSafe: false, timestamp: new Date() };
      }

      const gwei = weiToGwei(result);
      const isSafe = gwei > 0 && gwei < this.gasThresholdGwei;

      const gasInfo: GasInfo = { gasPriceGwei: gwei, isSafe, timestamp: new Date() };
      this.lastGasInfo = gasInfo;

      eventBus.emit('data:gas-update', gasInfo);

      return gasInfo;
    } catch {
      return { gasPriceGwei: 0, isSafe: false, timestamp: new Date() };
    }
  }

  /**
   * Get native MATIC/POL balance for an address.
   * Returns zero balance on failure.
   */
  async getBalance(address: string): Promise<BalanceInfo> {
    const defaultResult: BalanceInfo = {
      address,
      balanceWei: '0x0',
      balanceFormatted: 0,
      token: 'MATIC',
      timestamp: new Date(),
    };

    try {
      const result = await rpcCall(
        this.rpcUrl,
        'eth_getBalance',
        [address, 'latest'],
        this.requestTimeoutMs,
      );

      if (!result) return defaultResult;

      const formatted = weiToMatic(result);
      const balanceInfo: BalanceInfo = {
        address,
        balanceWei: result,
        balanceFormatted: formatted,
        token: 'MATIC',
        timestamp: new Date(),
      };

      eventBus.emit('data:balance-update', balanceInfo);

      return balanceInfo;
    } catch {
      return defaultResult;
    }
  }

  /**
   * Get USDC balance on Polygon for an address.
   * Returns zero balance on failure.
   */
  async getUSDCBalance(address: string): Promise<BalanceInfo> {
    const defaultResult: BalanceInfo = {
      address,
      balanceWei: '0x0',
      balanceFormatted: 0,
      token: 'USDC',
      timestamp: new Date(),
    };

    try {
      const callData = encodeBalanceOf(address);
      const result = await rpcCall(
        this.rpcUrl,
        'eth_call',
        [{ to: USDC_CONTRACT, data: callData }, 'latest'],
        this.requestTimeoutMs,
      );

      if (!result) return defaultResult;

      const formatted = rawUsdcToFormatted(result);
      const balanceInfo: BalanceInfo = {
        address,
        balanceWei: result,
        balanceFormatted: formatted,
        token: 'USDC',
        timestamp: new Date(),
      };

      eventBus.emit('data:balance-update', balanceInfo);

      return balanceInfo;
    } catch {
      return defaultResult;
    }
  }

  /**
   * Wait for a transaction to be confirmed on-chain.
   * Polls eth_getTransactionReceipt until confirmed or timeout.
   * Returns timeout status if transaction is not confirmed within the timeout.
   */
  async waitForConfirmation(
    txHash: string,
    timeoutMs = 60_000,
    pollIntervalMs = 3_000,
  ): Promise<TxConfirmation> {
    const deadline = Date.now() + timeoutMs;

    while (Date.now() < deadline) {
      try {
        const receipt = await this.getTransactionReceipt(txHash);

        if (receipt) {
          const status = receipt.status === '0x1' ? 'success' : 'failed';
          const blockNumber = receipt.blockNumber ? hexToNumber(receipt.blockNumber) : null;

          return {
            txHash,
            confirmed: status === 'success',
            blockNumber,
            status,
            timestamp: new Date(),
          };
        }
      } catch {
        // Continue polling
      }

      // Wait before next poll
      await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
    }

    return {
      txHash,
      confirmed: false,
      blockNumber: null,
      status: 'timeout',
      timestamp: new Date(),
    };
  }

  /**
   * Internal: fetch full transaction receipt object.
   */
  private async getTransactionReceipt(
    txHash: string,
  ): Promise<{ status: string; blockNumber: string } | null> {
    try {
      const response = await fetch(this.rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'eth_getTransactionReceipt',
          params: [txHash],
        }),
        signal: AbortSignal.timeout(this.requestTimeoutMs),
      });

      if (!response.ok) return null;

      const json = (await response.json()) as { result: { status: string; blockNumber: string } | null };
      return json.result ?? null;
    } catch {
      return null;
    }
  }

  /**
   * Check if current gas price is safe for trading.
   * Uses cached value if available, otherwise fetches fresh.
   * Returns false on any failure (fail-safe).
   */
  async isGasSafe(): Promise<boolean> {
    // Use cached if fresh (< 1 minute old)
    if (this.lastGasInfo && (Date.now() - this.lastGasInfo.timestamp.getTime()) < 60_000) {
      return this.lastGasInfo.isSafe;
    }

    const gasInfo = await this.getGasPrice();
    return gasInfo.isSafe;
  }

  /**
   * Start polling gas and balance at configured intervals.
   * Address is required for balance polling.
   */
  startPolling(address?: string): void {
    this.stopPolling();

    // Poll gas
    this.gasPollTimer = setInterval(() => {
      void this.getGasPrice();
    }, this.gasPollMs);

    // Poll balance if address provided
    if (address) {
      this.balancePollTimer = setInterval(() => {
        void this.getBalance(address);
        void this.getUSDCBalance(address);
      }, this.balancePollMs);
    }
  }

  /**
   * Stop all polling intervals.
   */
  stopPolling(): void {
    if (this.gasPollTimer) {
      clearInterval(this.gasPollTimer);
      this.gasPollTimer = null;
    }
    if (this.balancePollTimer) {
      clearInterval(this.balancePollTimer);
      this.balancePollTimer = null;
    }
  }
}
