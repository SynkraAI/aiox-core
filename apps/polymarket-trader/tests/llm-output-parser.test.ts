/**
 * Tests for parseLlmForecast (BACKTEST-3 Tier 2).
 *
 * Contract:
 *   parseLlmForecast(rawText, fallback) -> { forecastYes, reasoning, ok, source }
 *     - rawText:  LLM response string
 *     - fallback: a number in [0,1] used when parsing fails
 *
 * Spec covered:
 *   1. Valid JSON → parsed
 *   2. JSON wrapped in markdown ``` fences → parsed
 *   3. JSON with prose preamble → parsed
 *   4. Malformed JSON → fallback
 *   5. Missing forecast field → fallback
 *   6. Out-of-range values (negative, >1) → clamped + parsed
 *   7. forecast_yes = 0 and = 1 → accepted exactly
 *   8. Empty/non-string input → fallback
 *
 * Story: BACKTEST-3-tier2-llm
 */

import { describe, it, expect } from 'vitest';
import { parseLlmForecast, clamp01 } from '../scripts/backtest/llm-output-parser.ts';

describe('parseLlmForecast', () => {
  // ---------------------------------------------------------------------
  // 1. Valid JSON
  // ---------------------------------------------------------------------
  describe('valid JSON', () => {
    it('parses a clean object with forecast_yes', () => {
      const r = parseLlmForecast('{"forecast_yes": 0.62, "reasoning": "vol drift"}', 0.5);
      expect(r.ok).toBe(true);
      expect(r.source).toBe('parsed');
      expect(r.forecastYes).toBe(0.62);
      expect(r.reasoning).toBe('vol drift');
    });

    it('parses an object with whitespace and newlines', () => {
      const r = parseLlmForecast('  \n  {  "forecast_yes" : 0.30 ,\n "reasoning" : "low" } \n', 0.5);
      expect(r.ok).toBe(true);
      expect(r.forecastYes).toBe(0.30);
    });

    it('accepts forecastYes (camelCase) as alternative key', () => {
      const r = parseLlmForecast('{"forecastYes": 0.45, "reasoning": "x"}', 0.5);
      expect(r.ok).toBe(true);
      expect(r.forecastYes).toBe(0.45);
    });

    it('accepts probability as alternative key (legacy compat)', () => {
      const r = parseLlmForecast('{"probability": 0.71}', 0.5);
      expect(r.ok).toBe(true);
      expect(r.forecastYes).toBe(0.71);
    });
  });

  // ---------------------------------------------------------------------
  // 2. Markdown code fences
  // ---------------------------------------------------------------------
  describe('markdown fences', () => {
    it('strips ```json ... ``` fences', () => {
      const raw = '```json\n{"forecast_yes": 0.55}\n```';
      const r = parseLlmForecast(raw, 0.5);
      expect(r.ok).toBe(true);
      expect(r.forecastYes).toBe(0.55);
    });

    it('strips bare ``` ... ``` fences', () => {
      const raw = '```\n{"forecast_yes": 0.40}\n```';
      const r = parseLlmForecast(raw, 0.5);
      expect(r.ok).toBe(true);
      expect(r.forecastYes).toBe(0.40);
    });

    it('handles fences with prose around them', () => {
      const raw = 'Here is my forecast:\n```json\n{"forecast_yes": 0.33, "reasoning": "r"}\n```\nLet me know.';
      const r = parseLlmForecast(raw, 0.5);
      expect(r.ok).toBe(true);
      expect(r.forecastYes).toBe(0.33);
    });
  });

  // ---------------------------------------------------------------------
  // 3. Prose preamble
  // ---------------------------------------------------------------------
  describe('prose preamble/postamble', () => {
    it('extracts JSON from text that starts with prose', () => {
      const raw = 'Based on my analysis: {"forecast_yes": 0.81, "reasoning": "strong signal"}';
      const r = parseLlmForecast(raw, 0.5);
      expect(r.ok).toBe(true);
      expect(r.forecastYes).toBe(0.81);
    });

    it('extracts JSON when prose follows', () => {
      const raw = '{"forecast_yes": 0.20} — note: this is contrarian.';
      const r = parseLlmForecast(raw, 0.5);
      expect(r.ok).toBe(true);
      expect(r.forecastYes).toBe(0.20);
    });
  });

  // ---------------------------------------------------------------------
  // 4. Malformed → fallback
  // ---------------------------------------------------------------------
  describe('malformed', () => {
    it('falls back when input has no JSON object at all', () => {
      const r = parseLlmForecast('I think the answer is 60 percent.', 0.42);
      expect(r.ok).toBe(false);
      expect(r.source).toBe('fallback');
      expect(r.forecastYes).toBe(0.42);
    });

    it('falls back when JSON is unparseable (broken syntax)', () => {
      const r = parseLlmForecast('{"forecast_yes": 0.5, "reasoning": "bad,}', 0.42);
      expect(r.ok).toBe(false);
      expect(r.forecastYes).toBe(0.42);
    });

    it('falls back when forecast_yes field is missing', () => {
      const r = parseLlmForecast('{"reasoning": "no forecast"}', 0.55);
      expect(r.ok).toBe(false);
      expect(r.forecastYes).toBe(0.55);
    });

    it('falls back when forecast_yes is a string (non-number)', () => {
      const r = parseLlmForecast('{"forecast_yes": "high"}', 0.5);
      expect(r.ok).toBe(false);
      expect(r.forecastYes).toBe(0.5);
    });
  });

  // ---------------------------------------------------------------------
  // 5. Edge values: 0, 1, out of range
  // ---------------------------------------------------------------------
  describe('edge values', () => {
    it('accepts forecast_yes = 0 (extreme NO)', () => {
      const r = parseLlmForecast('{"forecast_yes": 0}', 0.5);
      expect(r.ok).toBe(true);
      expect(r.forecastYes).toBe(0);
    });

    it('accepts forecast_yes = 1 (extreme YES)', () => {
      const r = parseLlmForecast('{"forecast_yes": 1}', 0.5);
      expect(r.ok).toBe(true);
      expect(r.forecastYes).toBe(1);
    });

    it('clamps negative forecast_yes to 0 but marks parsed=ok', () => {
      const r = parseLlmForecast('{"forecast_yes": -0.2}', 0.5);
      expect(r.ok).toBe(true);
      expect(r.forecastYes).toBe(0);
    });

    it('clamps forecast_yes > 1 to 1', () => {
      const r = parseLlmForecast('{"forecast_yes": 1.5}', 0.5);
      expect(r.ok).toBe(true);
      expect(r.forecastYes).toBe(1);
    });

    it('falls back when forecast_yes is NaN', () => {
      // NaN doesn't survive JSON.parse — must be expressed as null or string.
      // Use null which JSON.parse accepts as the value.
      const r = parseLlmForecast('{"forecast_yes": null}', 0.4);
      expect(r.ok).toBe(false);
      expect(r.forecastYes).toBe(0.4);
    });
  });

  // ---------------------------------------------------------------------
  // 6. Empty/invalid inputs
  // ---------------------------------------------------------------------
  describe('empty inputs', () => {
    it('falls back on empty string', () => {
      const r = parseLlmForecast('', 0.5);
      expect(r.ok).toBe(false);
      expect(r.forecastYes).toBe(0.5);
    });

    it('falls back on whitespace-only', () => {
      const r = parseLlmForecast('   \n\t  ', 0.5);
      expect(r.ok).toBe(false);
      expect(r.forecastYes).toBe(0.5);
    });

    it('falls back when fallback itself is out of range (clamps fallback)', () => {
      const r = parseLlmForecast('not json', 1.5);
      expect(r.ok).toBe(false);
      expect(r.forecastYes).toBe(1); // fallback clamped
    });

    it('truncates very long reasoning to 500 chars', () => {
      const long = 'x'.repeat(2000);
      const r = parseLlmForecast(`{"forecast_yes": 0.5, "reasoning": "${long}"}`, 0.5);
      expect(r.ok).toBe(true);
      expect(r.reasoning.length).toBeLessThanOrEqual(500);
    });
  });
});

describe('clamp01', () => {
  it('returns input within [0,1]', () => {
    expect(clamp01(0)).toBe(0);
    expect(clamp01(0.5)).toBe(0.5);
    expect(clamp01(1)).toBe(1);
  });
  it('clamps negatives to 0 and >1 to 1', () => {
    expect(clamp01(-1)).toBe(0);
    expect(clamp01(2)).toBe(1);
  });
  it('returns 0.5 for NaN/Infinity (neutral)', () => {
    expect(clamp01(NaN)).toBe(0.5);
    expect(clamp01(Infinity)).toBe(0.5);
    expect(clamp01(-Infinity)).toBe(0.5);
  });
});
