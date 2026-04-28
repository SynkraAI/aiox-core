/**
 * Tests for OpenAI daily budget cap.
 *
 * Story: PM-PIVOT-1 (AC 5, 17)
 *
 * Contract (defined in story):
 *   class OpenAIBudgetTracker {
 *     constructor(opts: {
 *       thresholdUsd: number;       // OPENAI_DAILY_BUDGET_USD (default 5)
 *       statePath?: string;         // default: data/llm-budget.json
 *       clock?: () => Date;         // injectable for tests
 *     });
 *
 *     load(): Promise<void>;        // restore { dailySpend, lastResetDate } from disk
 *     recordSpend(usd: number): Promise<void>;  // increment + persist + auto-reset on date change
 *     isPaused(): boolean;          // true when dailySpend >= thresholdUsd (after auto-reset)
 *     getDailySpend(): number;
 *     getLastResetDate(): string;   // YYYY-MM-DD
 *   }
 *
 * Behavior:
 *   - Persisted to data/llm-budget.json (or path passed in opts).
 *   - lastResetDate stored as YYYY-MM-DD (local TZ).
 *   - When clock() returns a different YYYY-MM-DD than lastResetDate, dailySpend resets to 0.
 *   - isPaused() triggers callers (analyzeWithLLM) to return null and fall back to heuristics.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { OpenAIBudgetTracker } from '../src/intelligence/market-analyzer.js';

// ---------------------------------------------------------------------------
// Helpers — temp dir per test for clean fs state
// ---------------------------------------------------------------------------

let tmpDir: string;
let statePath: string;

beforeEach(() => {
  tmpDir = mkdtempSync(join(tmpdir(), 'pm-budget-cap-'));
  statePath = join(tmpDir, 'llm-budget.json');
});

afterEach(() => {
  rmSync(tmpDir, { recursive: true, force: true });
});

/** Build a tracker with an injectable clock (default: real time). */
function makeTracker(opts: {
  thresholdUsd?: number;
  clock?: () => Date;
} = {}) {
  return new OpenAIBudgetTracker({
    thresholdUsd: opts.thresholdUsd ?? 5,
    statePath,
    clock: opts.clock,
  });
}

/** Format a date as YYYY-MM-DD (local), matching what the tracker stores. */
function ymd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

/** Pre-seed the on-disk state file before tracker construction. */
function seedState(state: { dailySpend: number; lastResetDate: string }) {
  writeFileSync(statePath, JSON.stringify(state), 'utf-8');
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('OpenAIBudgetTracker', () => {
  // -------------------------------------------------------------------------
  // 1. Under budget → not paused
  // -------------------------------------------------------------------------
  describe('under budget', () => {
    it('isPaused() === false when dailySpend < threshold', async () => {
      const today = new Date('2026-04-27T10:00:00');
      seedState({ dailySpend: 2.0, lastResetDate: ymd(today) });

      const tracker = makeTracker({ thresholdUsd: 5, clock: () => today });
      await tracker.load();

      expect(tracker.getDailySpend()).toBe(2.0);
      expect(tracker.isPaused()).toBe(false);
    });

    it('allows recordSpend() while under threshold', async () => {
      const today = new Date('2026-04-27T10:00:00');
      const tracker = makeTracker({ thresholdUsd: 5, clock: () => today });
      await tracker.load();

      await tracker.recordSpend(1.5);
      await tracker.recordSpend(0.5);

      expect(tracker.getDailySpend()).toBeCloseTo(2.0, 5);
      expect(tracker.isPaused()).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  // 2. At budget (=== threshold) → paused
  // -------------------------------------------------------------------------
  describe('at budget', () => {
    it('isPaused() === true when dailySpend === threshold (boundary)', async () => {
      const today = new Date('2026-04-27T10:00:00');
      seedState({ dailySpend: 5.0, lastResetDate: ymd(today) });

      const tracker = makeTracker({ thresholdUsd: 5, clock: () => today });
      await tracker.load();

      expect(tracker.getDailySpend()).toBe(5.0);
      expect(tracker.isPaused()).toBe(true);
    });

    it('flips to paused exactly when recordSpend pushes total to threshold', async () => {
      const today = new Date('2026-04-27T10:00:00');
      const tracker = makeTracker({ thresholdUsd: 5, clock: () => today });
      await tracker.load();

      await tracker.recordSpend(4.99);
      expect(tracker.isPaused()).toBe(false);

      await tracker.recordSpend(0.01);
      expect(tracker.getDailySpend()).toBeCloseTo(5.0, 5);
      expect(tracker.isPaused()).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // 3. Over budget → paused
  // -------------------------------------------------------------------------
  describe('over budget', () => {
    it('isPaused() === true when dailySpend > threshold', async () => {
      const today = new Date('2026-04-27T10:00:00');
      seedState({ dailySpend: 6.5, lastResetDate: ymd(today) });

      const tracker = makeTracker({ thresholdUsd: 5, clock: () => today });
      await tracker.load();

      expect(tracker.isPaused()).toBe(true);
    });

    it('further recordSpend calls keep tracker paused (no decrement)', async () => {
      const today = new Date('2026-04-27T10:00:00');
      seedState({ dailySpend: 6.0, lastResetDate: ymd(today) });

      const tracker = makeTracker({ thresholdUsd: 5, clock: () => today });
      await tracker.load();

      await tracker.recordSpend(0.5);
      expect(tracker.getDailySpend()).toBeCloseTo(6.5, 5);
      expect(tracker.isPaused()).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // 4. Midnight reset
  // -------------------------------------------------------------------------
  describe('midnight reset', () => {
    it('resets dailySpend to 0 when clock advances to a new YYYY-MM-DD', async () => {
      const yesterday = new Date('2026-04-26T23:30:00');
      seedState({ dailySpend: 10.0, lastResetDate: ymd(yesterday) });

      // Mutable clock so we can simulate time passing.
      let now = new Date('2026-04-27T00:05:00');
      const tracker = makeTracker({ thresholdUsd: 5, clock: () => now });

      await tracker.load();

      // After load with a new local date, the tracker must auto-reset.
      // Either load() itself resets, or the next isPaused/recordSpend call does.
      // Both approaches are spec-compliant; we verify the post-conditions.
      expect(tracker.isPaused()).toBe(false);
      expect(tracker.getDailySpend()).toBe(0);
      expect(tracker.getLastResetDate()).toBe(ymd(now));
    });

    it('mid-day reset on date rollover during a long-running process', async () => {
      let now = new Date('2026-04-27T23:55:00');
      const tracker = makeTracker({ thresholdUsd: 5, clock: () => now });
      await tracker.load();

      // Spend close to threshold today.
      await tracker.recordSpend(4.5);
      expect(tracker.isPaused()).toBe(false);
      expect(tracker.getDailySpend()).toBeCloseTo(4.5, 5);

      // Advance the clock past midnight.
      now = new Date('2026-04-28T00:01:00');

      // The next gate check (isPaused) should trigger reset.
      expect(tracker.isPaused()).toBe(false);
      expect(tracker.getDailySpend()).toBe(0);
      expect(tracker.getLastResetDate()).toBe('2026-04-28');
    });

    it('does NOT reset within the same calendar day even at very different times', async () => {
      let now = new Date('2026-04-27T00:01:00');
      const tracker = makeTracker({ thresholdUsd: 5, clock: () => now });
      await tracker.load();

      await tracker.recordSpend(3.0);

      now = new Date('2026-04-27T23:59:00'); // same day, ~24h later
      // No reset — same YYYY-MM-DD.
      expect(tracker.getDailySpend()).toBeCloseTo(3.0, 5);
      expect(tracker.getLastResetDate()).toBe('2026-04-27');
    });
  });

  // -------------------------------------------------------------------------
  // 5. Persistence (survives restart)
  // -------------------------------------------------------------------------
  describe('persistence', () => {
    it('writes state to disk on recordSpend', async () => {
      const today = new Date('2026-04-27T10:00:00');
      const tracker = makeTracker({ thresholdUsd: 5, clock: () => today });
      await tracker.load();

      await tracker.recordSpend(3.5);

      expect(existsSync(statePath)).toBe(true);
      const onDisk = JSON.parse(readFileSync(statePath, 'utf-8'));
      expect(onDisk.dailySpend).toBeCloseTo(3.5, 5);
      expect(onDisk.lastResetDate).toBe(ymd(today));
    });

    it('restores state across "process restarts" (new tracker instance)', async () => {
      const today = new Date('2026-04-27T10:00:00');

      // Instance #1 — record some spend.
      const t1 = makeTracker({ thresholdUsd: 5, clock: () => today });
      await t1.load();
      await t1.recordSpend(3.5);

      // Instance #2 — same statePath, fresh in-memory state.
      const t2 = makeTracker({ thresholdUsd: 5, clock: () => today });
      await t2.load();

      expect(t2.getDailySpend()).toBeCloseTo(3.5, 5);
      expect(t2.getLastResetDate()).toBe(ymd(today));
      expect(t2.isPaused()).toBe(false);
    });

    it('initializes cleanly when state file does not exist', async () => {
      const today = new Date('2026-04-27T10:00:00');
      // No seedState → file truly absent.
      expect(existsSync(statePath)).toBe(false);

      const tracker = makeTracker({ thresholdUsd: 5, clock: () => today });
      await tracker.load();

      expect(tracker.getDailySpend()).toBe(0);
      expect(tracker.getLastResetDate()).toBe(ymd(today));
      expect(tracker.isPaused()).toBe(false);
    });
  });
});
