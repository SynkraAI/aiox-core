/**
 * BACKTEST-3 Phase 2 Tier 2 — Anthropic daily budget tracker.
 *
 * Mirrors the API of `OpenAIBudgetTracker` (src/intelligence/market-analyzer.ts)
 * but persists under a SEPARATE key (`anthropicSpend` + `anthropicLastResetDate`)
 * so OpenAI runtime budget and Anthropic backtest budget don't collide in the
 * shared `data/llm-budget.json` file.
 *
 * Why a separate class:
 *   - Brief BACKTEST-3 explicitly requires `anthropicSpend` key.
 *   - The runtime bot uses OpenAIBudgetTracker for its own daily spend.
 *   - Backtest replay can run alongside the bot — we MUST NOT clobber the
 *     `dailySpend` key the live process is writing.
 *
 * Atomic write: writes to `*.tmp` then renames. Recovers from corrupt JSON.
 *
 * Story: BACKTEST-3-tier2-llm
 */

import { existsSync, readFileSync, writeFileSync, renameSync, unlinkSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { mkdirSync } from 'node:fs';

export interface AnthropicBudgetTrackerOptions {
  /** Daily cap in USD. When dailySpend >= thresholdUsd, isOverBudget()=true. */
  thresholdUsd: number;
  /** Path to JSON state file (default: data/llm-budget.json under cwd). */
  statePath?: string;
  /** Injectable clock for tests. */
  clock?: () => Date;
}

interface PersistedState {
  // Existing OpenAI keys (preserved on read/write — DO NOT clobber)
  dailySpend?: number;
  lastResetDate?: string;
  callCount?: number;
  warned80?: boolean;
  warned100?: boolean;
  // Anthropic keys (BACKTEST-3)
  anthropicSpend?: number;
  anthropicLastResetDate?: string;
}

function formatYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

export class AnthropicBudgetTracker {
  private thresholdUsd: number;
  private statePath: string;
  private clock: () => Date;
  private dailySpend = 0;
  private lastResetDate: string;

  constructor(opts: AnthropicBudgetTrackerOptions) {
    this.thresholdUsd = opts.thresholdUsd;
    this.statePath = opts.statePath ?? join(process.cwd(), 'data', 'llm-budget.json');
    this.clock = opts.clock ?? (() => new Date());
    this.lastResetDate = formatYmd(this.clock());
  }

  /** Restore from disk and auto-reset if calendar day changed. */
  async load(): Promise<void> {
    try {
      if (existsSync(this.statePath)) {
        const raw = readFileSync(this.statePath, 'utf-8');
        const parsed = JSON.parse(raw) as PersistedState;
        if (typeof parsed.anthropicSpend === 'number' && Number.isFinite(parsed.anthropicSpend)) {
          this.dailySpend = parsed.anthropicSpend;
        }
        if (typeof parsed.anthropicLastResetDate === 'string') {
          this.lastResetDate = parsed.anthropicLastResetDate;
        }
      }
    } catch {
      // Corrupt JSON → defaults are safe (0 spend, today's date).
    }
    this.maybeReset();
  }

  /** Reset spend if today's date no longer matches persisted lastResetDate. */
  private maybeReset(): void {
    const today = formatYmd(this.clock());
    if (today !== this.lastResetDate) {
      this.dailySpend = 0;
      this.lastResetDate = today;
      this.persist();
    }
  }

  /**
   * Persist atomically: read existing JSON, merge our two keys, write to .tmp,
   * rename. Preserves OpenAI keys (dailySpend, lastResetDate, callCount, ...).
   */
  private persist(): void {
    try {
      // Read existing state to preserve OpenAI keys
      let merged: PersistedState = {};
      if (existsSync(this.statePath)) {
        try {
          merged = JSON.parse(readFileSync(this.statePath, 'utf-8')) as PersistedState;
        } catch {
          // corrupt — start with empty merged
          merged = {};
        }
      }

      // Apply our keys
      merged.anthropicSpend = this.dailySpend;
      merged.anthropicLastResetDate = this.lastResetDate;

      // Ensure directory exists
      const dir = dirname(this.statePath);
      if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

      // Atomic write: temp file + rename
      const tmp = `${this.statePath}.tmp`;
      writeFileSync(tmp, JSON.stringify(merged, null, 2), 'utf-8');
      renameSync(tmp, this.statePath);
    } catch {
      // Disk write failed — in-memory state still authoritative
      // Best-effort cleanup of any leftover .tmp
      try {
        const tmp = `${this.statePath}.tmp`;
        if (existsSync(tmp)) unlinkSync(tmp);
      } catch {
        // ignore
      }
    }
  }

  /** Increment spend, persist, auto-reset on day boundary. */
  async recordSpend(usd: number): Promise<void> {
    if (typeof usd !== 'number' || !Number.isFinite(usd) || usd < 0) return;
    this.maybeReset();
    this.dailySpend += usd;
    this.persist();
  }

  /** True when dailySpend >= thresholdUsd (after auto-reset check). */
  isOverBudget(): boolean {
    this.maybeReset();
    return this.dailySpend >= this.thresholdUsd;
  }

  getDailySpend(): number {
    return this.dailySpend;
  }

  getLastResetDate(): string {
    return this.lastResetDate;
  }

  getThresholdUsd(): number {
    return this.thresholdUsd;
  }
}
