/**
 * Tests for AnthropicBudgetTracker (BACKTEST-3 Tier 2 LLM replay).
 *
 * Contract:
 *   constructor({ thresholdUsd, statePath?, clock? })
 *   load(): restore + auto-reset on date rollover
 *   recordSpend(usd): increment + persist + auto-reset
 *   isOverBudget(): true when dailySpend >= threshold (after reset check)
 *   getDailySpend(), getLastResetDate()
 *
 * Persistence file (JSON) at statePath:
 *   {
 *     "anthropicSpend": number,
 *     "anthropicLastResetDate": "YYYY-MM-DD",
 *     // OpenAI keys preserved (dailySpend, lastResetDate, ...)
 *   }
 *
 * Atomic write: temp file + rename.
 *
 * Story: BACKTEST-3-tier2-llm
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { AnthropicBudgetTracker } from '../scripts/backtest/anthropic-budget-tracker.ts';

let tmpDir: string;
let statePath: string;

beforeEach(() => {
  tmpDir = mkdtempSync(join(tmpdir(), 'pm-anthropic-budget-'));
  statePath = join(tmpDir, 'llm-budget.json');
});

afterEach(() => {
  rmSync(tmpDir, { recursive: true, force: true });
});

function makeTracker(opts: { thresholdUsd?: number; clock?: () => Date } = {}) {
  return new AnthropicBudgetTracker({
    thresholdUsd: opts.thresholdUsd ?? 5,
    statePath,
    clock: opts.clock,
  });
}

function ymd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

function seedRaw(content: string) {
  writeFileSync(statePath, content, 'utf-8');
}

describe('AnthropicBudgetTracker', () => {
  // ---------------------------------------------------------------------
  // 1. Empty file / missing state → init clean
  // ---------------------------------------------------------------------
  describe('init', () => {
    it('initializes with zero spend when state file does not exist', async () => {
      const today = new Date('2026-04-30T10:00:00');
      expect(existsSync(statePath)).toBe(false);

      const t = makeTracker({ thresholdUsd: 5, clock: () => today });
      await t.load();

      expect(t.getDailySpend()).toBe(0);
      expect(t.isOverBudget()).toBe(false);
      expect(t.getLastResetDate()).toBe(ymd(today));
    });

    it('isOverBudget=true if threshold is 0 even with no spend', async () => {
      const today = new Date('2026-04-30T10:00:00');
      const t = makeTracker({ thresholdUsd: 0, clock: () => today });
      await t.load();
      // 0 >= 0 → over budget by definition
      expect(t.isOverBudget()).toBe(true);
    });
  });

  // ---------------------------------------------------------------------
  // 2. Partial spend → continue (not over budget)
  // ---------------------------------------------------------------------
  describe('partial spend', () => {
    it('accumulates spend and stays under budget when below threshold', async () => {
      const today = new Date('2026-04-30T10:00:00');
      const t = makeTracker({ thresholdUsd: 5, clock: () => today });
      await t.load();

      await t.recordSpend(0.5);
      await t.recordSpend(1.25);

      expect(t.getDailySpend()).toBeCloseTo(1.75, 5);
      expect(t.isOverBudget()).toBe(false);
    });

    it('restores prior anthropicSpend across instances (same calendar day)', async () => {
      const today = new Date('2026-04-30T10:00:00');
      const t1 = makeTracker({ thresholdUsd: 5, clock: () => today });
      await t1.load();
      await t1.recordSpend(2.5);

      const t2 = makeTracker({ thresholdUsd: 5, clock: () => today });
      await t2.load();

      expect(t2.getDailySpend()).toBeCloseTo(2.5, 5);
      expect(t2.isOverBudget()).toBe(false);
    });
  });

  // ---------------------------------------------------------------------
  // 3. Cap reached → halt signal
  // ---------------------------------------------------------------------
  describe('cap reached', () => {
    it('isOverBudget() === true at exact threshold (boundary)', async () => {
      const today = new Date('2026-04-30T10:00:00');
      const t = makeTracker({ thresholdUsd: 5, clock: () => today });
      await t.load();

      await t.recordSpend(5.0);

      expect(t.getDailySpend()).toBeCloseTo(5.0, 5);
      expect(t.isOverBudget()).toBe(true);
    });

    it('isOverBudget() === true when over threshold', async () => {
      const today = new Date('2026-04-30T10:00:00');
      const t = makeTracker({ thresholdUsd: 5, clock: () => today });
      await t.load();

      await t.recordSpend(7.5);
      expect(t.isOverBudget()).toBe(true);
      expect(t.getDailySpend()).toBeCloseTo(7.5, 5);
    });

    it('rejects negative or non-finite recordSpend (defensive)', async () => {
      const today = new Date('2026-04-30T10:00:00');
      const t = makeTracker({ thresholdUsd: 5, clock: () => today });
      await t.load();

      await t.recordSpend(2.0);
      await t.recordSpend(-1.0); // ignored
      await t.recordSpend(NaN);  // ignored
      await t.recordSpend(Infinity); // ignored

      expect(t.getDailySpend()).toBeCloseTo(2.0, 5);
    });
  });

  // ---------------------------------------------------------------------
  // 4. Atomic write (temp + rename) — no .tmp leftover
  // ---------------------------------------------------------------------
  describe('atomic write', () => {
    it('writes via tmp+rename (no leftover .tmp file after recordSpend)', async () => {
      const today = new Date('2026-04-30T10:00:00');
      const t = makeTracker({ thresholdUsd: 5, clock: () => today });
      await t.load();

      await t.recordSpend(1.0);

      expect(existsSync(statePath)).toBe(true);
      expect(existsSync(`${statePath}.tmp`)).toBe(false);

      const onDisk = JSON.parse(readFileSync(statePath, 'utf-8'));
      expect(onDisk.anthropicSpend).toBeCloseTo(1.0, 5);
      expect(onDisk.anthropicLastResetDate).toBe(ymd(today));
    });

    it('preserves existing OpenAI keys when persisting Anthropic state', async () => {
      // Simulate a llm-budget.json already containing OpenAI runtime state
      seedRaw(JSON.stringify({
        dailySpend: 3.42,
        lastResetDate: '2026-04-30',
        callCount: 17,
        warned80: false,
        warned100: false,
      }));

      const today = new Date('2026-04-30T10:00:00');
      const t = makeTracker({ thresholdUsd: 5, clock: () => today });
      await t.load();

      await t.recordSpend(0.5);

      const merged = JSON.parse(readFileSync(statePath, 'utf-8'));
      // OpenAI keys preserved
      expect(merged.dailySpend).toBeCloseTo(3.42, 5);
      expect(merged.lastResetDate).toBe('2026-04-30');
      expect(merged.callCount).toBe(17);
      expect(merged.warned80).toBe(false);
      expect(merged.warned100).toBe(false);
      // Our keys added
      expect(merged.anthropicSpend).toBeCloseTo(0.5, 5);
      expect(merged.anthropicLastResetDate).toBe(ymd(today));
    });
  });

  // ---------------------------------------------------------------------
  // 5. Corrupt JSON → recover gracefully
  // ---------------------------------------------------------------------
  describe('corrupt state recovery', () => {
    it('treats unparseable JSON as fresh start', async () => {
      seedRaw('not valid json {{{');

      const today = new Date('2026-04-30T10:00:00');
      const t = makeTracker({ thresholdUsd: 5, clock: () => today });
      await t.load();

      expect(t.getDailySpend()).toBe(0);
      expect(t.isOverBudget()).toBe(false);
      expect(t.getLastResetDate()).toBe(ymd(today));
    });

    it('treats empty file as fresh start', async () => {
      seedRaw('');

      const today = new Date('2026-04-30T10:00:00');
      const t = makeTracker({ thresholdUsd: 5, clock: () => today });
      await t.load();

      expect(t.getDailySpend()).toBe(0);
    });

    it('after recovery, recordSpend writes a valid JSON file', async () => {
      seedRaw('garbage');

      const today = new Date('2026-04-30T10:00:00');
      const t = makeTracker({ thresholdUsd: 5, clock: () => today });
      await t.load();
      await t.recordSpend(1.5);

      const onDisk = JSON.parse(readFileSync(statePath, 'utf-8'));
      expect(onDisk.anthropicSpend).toBeCloseTo(1.5, 5);
    });
  });

  // ---------------------------------------------------------------------
  // 6. Day rollover (auto-reset)
  // ---------------------------------------------------------------------
  describe('day rollover', () => {
    it('resets dailySpend to 0 when new day arrives', async () => {
      let now = new Date('2026-04-30T23:55:00');
      const t = makeTracker({ thresholdUsd: 5, clock: () => now });
      await t.load();
      await t.recordSpend(4.0);
      expect(t.isOverBudget()).toBe(false);

      now = new Date('2026-05-01T00:05:00');
      // Next gate check resets
      expect(t.isOverBudget()).toBe(false);
      expect(t.getDailySpend()).toBe(0);
      expect(t.getLastResetDate()).toBe('2026-05-01');
    });

    it('does not reset within same day', async () => {
      let now = new Date('2026-04-30T01:00:00');
      const t = makeTracker({ thresholdUsd: 5, clock: () => now });
      await t.load();
      await t.recordSpend(3.0);

      now = new Date('2026-04-30T23:00:00');
      expect(t.getDailySpend()).toBeCloseTo(3.0, 5);
      expect(t.getLastResetDate()).toBe('2026-04-30');
    });
  });
});
