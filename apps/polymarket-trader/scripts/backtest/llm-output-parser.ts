/**
 * BACKTEST-3 Phase 2 Tier 2 — LLM output parser.
 *
 * Parses forecast JSON from an LLM response. Defensive parsing because LLMs
 * occasionally:
 *   - wrap JSON in markdown ```json fences
 *   - prepend prose before/after JSON
 *   - emit malformed JSON (trailing commas, unquoted keys)
 *   - return values out of [0, 1]
 *
 * Contract:
 *   parseLlmForecast(rawText, fallback) -> { forecastYes, reasoning, ok, source }
 *     - rawText:  the LLM response string
 *     - fallback: a number in [0, 1] (typically the market mid_price_t12h)
 *                 used when parsing fails
 *     - ok:       true iff a clean JSON parse + valid forecast_yes was found
 *     - source:   'parsed' | 'fallback'
 *
 * Pure module — no I/O, no SDK calls. Testable in isolation.
 *
 * Story: BACKTEST-3-tier2-llm
 */

export interface ParsedForecast {
  /** Probability that outcome=YES, in [0,1]. Always defined (clamped + fallback). */
  forecastYes: number;
  /** Free-text reasoning (truncated to 500 chars). May be empty. */
  reasoning: string;
  /** True iff parsed cleanly from LLM output (not from fallback). */
  ok: boolean;
  /** Origin of the value returned. */
  source: 'parsed' | 'fallback';
}

/**
 * Parse forecast JSON from LLM raw text. Defensive: tries multiple strategies
 * before giving up to fallback.
 */
export function parseLlmForecast(rawText: string, fallback: number): ParsedForecast {
  const safeFallback = clamp01(fallback);

  if (typeof rawText !== 'string' || rawText.trim().length === 0) {
    return { forecastYes: safeFallback, reasoning: '', ok: false, source: 'fallback' };
  }

  // Strategy 1: strip markdown code fences (```json ... ``` or ``` ... ```)
  const stripped = stripMarkdownFences(rawText);

  // Strategy 2: greedy match on first JSON-looking object
  const candidates = extractJsonCandidates(stripped);
  if (candidates.length === 0) {
    return { forecastYes: safeFallback, reasoning: '', ok: false, source: 'fallback' };
  }

  for (const cand of candidates) {
    try {
      const parsed = JSON.parse(cand) as Record<string, unknown>;
      const rawForecast =
        (parsed['forecast_yes'] as number | undefined) ??
        (parsed['forecastYes'] as number | undefined) ??
        (parsed['probability'] as number | undefined);
      if (typeof rawForecast !== 'number' || !Number.isFinite(rawForecast)) continue;
      if (rawForecast < 0 || rawForecast > 1) {
        // Out-of-range: clamp + mark as parsed (LLM tried, just got it slightly wrong)
        const clamped = clamp01(rawForecast);
        const reasoning = String(parsed['reasoning'] ?? '').slice(0, 500);
        return { forecastYes: clamped, reasoning, ok: true, source: 'parsed' };
      }
      const reasoning = String(parsed['reasoning'] ?? '').slice(0, 500);
      return { forecastYes: rawForecast, reasoning, ok: true, source: 'parsed' };
    } catch {
      // try next candidate
    }
  }

  return { forecastYes: safeFallback, reasoning: '', ok: false, source: 'fallback' };
}

/**
 * Strip ```json ... ``` or ``` ... ``` markdown code fences if present.
 * Returns the inner content. If no fences, returns input unchanged.
 */
function stripMarkdownFences(s: string): string {
  // Match ```json\n...\n``` or ```\n...\n``` (greedy on inner)
  const fenced = s.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced && fenced[1]) return fenced[1].trim();
  return s.trim();
}

/**
 * Extract candidate JSON object strings from arbitrary text. Returns substrings
 * starting with `{` and ending with the matching `}`. Handles nested braces.
 *
 * Returns at most 3 candidates (first three top-level objects found).
 */
function extractJsonCandidates(s: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let start = -1;
  for (let i = 0; i < s.length; i++) {
    const ch = s.charAt(i);
    if (ch === '{') {
      if (depth === 0) start = i;
      depth++;
    } else if (ch === '}') {
      depth--;
      if (depth === 0 && start !== -1) {
        out.push(s.substring(start, i + 1));
        start = -1;
        if (out.length >= 3) break;
      } else if (depth < 0) {
        // unmatched '}' — reset
        depth = 0;
        start = -1;
      }
    }
  }
  return out;
}

/** Clamp x into [0,1]. NaN / non-numeric → 0.5 (neutral). */
export function clamp01(x: number): number {
  if (typeof x !== 'number' || !Number.isFinite(x)) return 0.5;
  if (x < 0) return 0;
  if (x > 1) return 1;
  return x;
}
