# C2 — Context Window Tracking: Research Report

**Story:** NOG-9 — UAP & SYNAPSE Deep Research
**Wave:** 3 — SYNAPSE Core
**Component:** C2 — Context Bracket System
**Researcher:** Deep Tech Research Agent
**Date:** 2026-02-21
**Status:** Complete

---

## Executive Summary

The AIOS SYNAPSE engine's Context Bracket system currently uses a naive estimation formula (`promptCount * 1500 / maxContext`) with a fixed 1500 tokens/prompt assumption. This research evaluates how production AI coding tools (Claude Code, Aider, Codex CLI, Cursor) actually track context usage, what token counting strategies are available, and what best practices exist for adaptive behavior based on context depletion. The key finding is that the current approach is directionally correct but significantly inaccurate, and the recommended upgrade path is a two-tier approach: character-based estimation for performance-sensitive paths (hooks) plus API-feedback integration for accurate cumulative tracking.

---

## Research Questions & Findings

---

### Q1: How Do AI Coding Tools Track Context Window Usage?

#### Claude Code

Claude Code tracks context through a **transcript JSONL file** where each line represents a conversation event. The `/context` command reads this file and extracts token counts from the most recent valid API response entry.

**Actual formula used:**
```
total_tokens = input_tokens + cache_read_input_tokens + cache_creation_input_tokens
context_percent = (total_tokens / maxContextTokens) * 100
```

Key behaviors:
- **Does NOT estimate** — uses real `usage_metadata` from API responses.
- Sidechain/agent sub-tasks are excluded (they have separate contexts).
- Cache tokens are counted toward context (90% cheaper to re-use, but still occupy window).
- Auto-compaction triggers at ~83.5% usage (~167K tokens on a 200K window) with the remainder reserved as a compaction buffer (~33K tokens as of early 2026, reduced from 45K).
- The `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` environment variable allows adjusting the compaction threshold (1–100).

**Implementation:** Parses the most recent `usage` object from the conversation transcript JSONL. No static estimation is used.

Sources:
- [Claude Code Context Buffer: The 33K-45K Token Problem](https://claudefa.st/blog/guide/mechanics/context-buffer-management)
- [How to Calculate Your Claude Code Context Usage](https://codelynx.dev/posts/calculate-claude-code-context)

#### Aider

Aider uses a **dynamic token budget system** for repo map construction:
- Uses the `litellm` library to call the appropriate model-specific tokenizer.
- Dynamically adjusts repo map size based on available token budget.
- Default map-tokens: 1K; expands automatically when no explicit files are added.
- Reports token limit errors from the API but does NOT enforce its own limits.
- Never uses a fixed static estimate; instead uses model-reported limits and LiteLLM token counting.

Source: [Aider Advanced Model Settings](https://aider.chat/docs/config/adv-model-settings.html)

#### Codex CLI (OpenAI)

- Monitors and reports remaining context space per turn.
- Automatically compacts context by summarizing and discarding less relevant details.
- The `sessionTokenLimit` feature tracks cumulative token usage across turns.
- A GitHub issue from the Qwen code fork (which mirrors Codex) proposed replacing tiktoken with character-based rough estimation specifically for the guardrail path, citing that "high-precision token counting is unnecessary" for limit enforcement.

Source: [Qwen Code Issue #1289 — Replace tiktoken with rough estimator](https://github.com/QwenLM/qwen-code/issues/1289)

#### Cursor

- Uses **model-reported context sizes** from API responses.
- "Max Mode" unlocks larger windows (e.g., Gemini 3 Pro at 1M+ tokens).
- Does not expose granular per-prompt token tracking to the user by default.
- Heavy users report hitting limits quickly on the 200K context models.

#### Summary Table

| Tool | Strategy | Source of Truth | Static Estimate? |
|------|-----------|-----------------|------------------|
| Claude Code | API `usage_metadata` from transcript JSONL | Per-API-call | No |
| Aider | litellm model tokenizer + API response | Per-API-call | No |
| Codex CLI | API response + optional rough char estimate | Per-API-call | Fallback only |
| Cursor | Model API response | Per-API-call | No |
| **SYNAPSE (current)** | `promptCount * 1500` | promptCount heuristic | **Yes — inaccurate** |

---

### Q2: Token Counting Strategies — Accuracy vs. Performance Tradeoff

#### Strategy 1: Native API Token Counting (Most Accurate)

Anthropic provides an official `countTokens` endpoint:

```typescript
// TypeScript — exact count before sending
const response = await client.messages.countTokens({
  model: "claude-sonnet-4-6",
  system: "...",
  messages: [{ role: "user", content: prompt }]
});
// response.input_tokens is the exact count
```

- **Accuracy:** Authoritative — matches billing exactly (with minor caveats for system-added tokens).
- **Cost:** Free (separate rate limit pool, not counted against message RPM).
- **Latency:** Requires an extra HTTP round-trip (~50–200ms).
- **Availability:** All active Claude models support this.
- **Caveat:** Cannot be called from within a hook because the hook has no API key context.

Source: [Anthropic Token Counting Docs](https://platform.claude.com/docs/en/build-with-claude/token-counting)

#### Strategy 2: API Response `usage_metadata` (Most Practical)

Every Claude API response includes `usage`:
```json
{
  "usage": {
    "input_tokens": 14523,
    "output_tokens": 512,
    "cache_read_input_tokens": 8200,
    "cache_creation_input_tokens": 0
  }
}
```

This is the strategy Claude Code itself uses. The hook receives this data per-session via the session file (`session.context.last_tokens_used`). This approach is:
- **Accurate:** Real token data, no estimation.
- **Free:** No extra API call.
- **Retroactive:** Available after each turn, not before.
- **Accessible from hooks:** If stored in session state (which SYNAPSE already tracks via `session.context`).

#### Strategy 3: Character-to-Token Ratio Estimation (Current SYNAPSE Approach — Improved)

The current `estimateTokens(text)` in `utils/tokens.js` already uses `length / 4`, which is the industry-standard heuristic:

```javascript
// Current SYNAPSE implementation (tokens.js)
function estimateTokens(text) {
  return Math.ceil((text || '').length / 4);
}
```

This approximation produces ~±15% error for English prose. For code-heavy prompts (which are typical in a coding assistant), the error can be higher because:
- Code identifiers and symbols tokenize differently than prose.
- Special characters and whitespace patterns affect tokenizer behavior.
- Claude's tokenizer (distinct from GPT's) is not open-source.

The Anthropic TypeScript tokenizer (`@anthropic-ai/tokenizer`) is deprecated and only accurate for pre-Claude 3 models. For Claude 3.x+, the recommended approach is the API endpoint or character-based approximation.

**Improved character estimation for code:**
```javascript
// Better heuristic for mixed code/prose (SYNAPSE could adopt this)
function estimateTokensImproved(text) {
  if (!text) return 0;
  // Code tends to tokenize at ~3 chars/token (more tokens for symbols)
  // Prose at ~4 chars/token
  // Mixed: use 3.5 as conservative estimate
  return Math.ceil(text.length / 3.5);
}
```

#### Strategy 4: WASM/Compiled Tokenizer Libraries

For environments where accuracy matters without API round-trips:

| Library | Language | Accuracy | Performance | Notes |
|---------|----------|----------|-------------|-------|
| `@dqbd/tiktoken` (WASM) | JS/TS | High (for OpenAI) | 3–6x faster than pure JS | GPT models only, not Claude |
| `js-tiktoken` | JS/TS | High (for OpenAI) | Moderate | Pure JS, no WASM |
| `gpt-3-encoder` | JS/TS | Approximate | Fast | Older approach |
| `@anthropic-ai/tokenizer` | JS/TS | **Outdated** | Fast | Deprecated for Claude 3+ |

**Key finding:** There is no accurate, free, offline token counter for Claude 3+ models in JavaScript. The only accurate path is the API endpoint.

Sources:
- [tiktoken-node](https://github.com/ceifa/tiktoken-node)
- [compare-tokenizers (Node.js)](https://github.com/transitive-bullshit/compare-tokenizers)
- [Token Counting Explained: tiktoken, Anthropic, and Gemini 2025](https://www.propelcode.ai/blog/token-counting-tiktoken-anthropic-gemini-guide-2025)

---

### Q3: How Does Claude Code Handle Context Window Limits Internally?

Claude Code uses a **progressive compaction model** with the following mechanics:

#### Compaction Threshold (as of early 2026)

| Parameter | Value |
|-----------|-------|
| Max context window | 200,000 tokens |
| Autocompact buffer | ~33,000 tokens (16.5%) — reduced from 45K |
| Compaction trigger | ~167,000 tokens (83.5% usage) |
| Override env var | `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` (1–100) |

#### Compaction Process

1. Claude Code detects that input token count from the last API response exceeds the compaction threshold.
2. It injects a summarization prompt as a user turn.
3. Claude generates a `<summary>` block.
4. The full conversation history is replaced with that summary.
5. **Information loss is real** — specific variable names, exact errors, early decisions are compressed.

#### Warning System

- **`/context` command:** Displays current token allocation breakdown (system prompt, tools, conversation, autocompact buffer, free space).
- **StatusLine:** The only real-time mechanism that receives context metrics during ongoing conversations.
- No in-message warnings are displayed to the user until compaction actually triggers.

#### Context Awareness in New Models

Claude Sonnet 4.6 (the model running SYNAPSE) features **native context awareness** — it can track its remaining token budget throughout a conversation and adapt accordingly. This is a model-level capability, not an API feature.

Sources:
- [Claude Code Compaction](https://platform.claude.com/docs/en/build-with-claude/compaction)
- [Claude Code Auto-Compact Feature](https://claudelog.com/faqs/what-is-claude-code-auto-compact/)
- [Context Buffer Management](https://claudefa.st/blog/guide/mechanics/context-buffer-management)
- [Compaction on Amazon Bedrock](https://docs.aws.amazon.com/bedrock/latest/userguide/claude-messages-compaction.html)

---

### Q4: Best Practices for Adaptive Behavior Based on Context Window Fullness

Research from JetBrains, Chroma, and academic papers identifies the following evidence-based strategies:

#### Strategy A: Observation Masking (Best for Coding Agents)

JetBrains research on SWE-bench Verified benchmarks (long-horizon tasks, 250 turns, 32B–480B models) found:
- **Observation masking outperforms LLM summarization** in 4 of 5 configurations.
- Masking is 52% cheaper than unmanaged context growth while improving solve rates by 2.6%.
- Masking preserves agent reasoning/action history but replaces older environment outputs with placeholders.
- LLM summarization can actually cause agents to run 15% longer (smoothing signs that agent should stop).

**Relevance to SYNAPSE:** At DEPLETED/CRITICAL brackets, instead of injecting more context, SYNAPSE should drop lower-priority layer content (L3-L6) while preserving L0-L2 (Constitution, Global, Agent).

Source: [JetBrains Research — Efficient Context Management (Dec 2025)](https://blog.jetbrains.com/research/2025/12/efficient-context-management/)

#### Strategy B: Prioritize Recent Over Old

The standard heuristic for context depletion:
- Drop oldest messages first.
- Remove verbose reasoning/chain-of-thought once it has served its purpose.
- Keep: user requests, key decisions, error states, current task.
- Drop: intermediate tool call outputs, verbose assistant reasoning, old exploration.

#### Strategy C: Adaptive Verbosity by Bracket

Industry pattern for context-aware injection:

```
FRESH (>60% remaining):    Inject minimal rules. Trust model's base knowledge.
MODERATE (40-60%):         Inject full rule set. Normal operation.
DEPLETED (25-40%):         Inject reinforcement hints. Memory bridge active.
CRITICAL (<25%):           Issue handoff warning. Minimal injection. Prioritize essentials.
```

This is exactly the pattern SYNAPSE already implements in its `LAYER_CONFIGS` — which is architecturally correct. The issue is that the bracket detection itself is inaccurate.

#### Strategy D: Scratchpad/Context Isolation

Agents that maintain a separate scratchpad for chain-of-thought (kept out of the main context window) outperform those that include all reasoning in the main context. This is relevant to SYNAPSE's L4 (task) and L6 (keyword) layers — these could be dropped earlier at DEPLETED bracket without losing key context.

#### Strategy E: Cache Tokens Awareness

Cached tokens (Claude prompt caching) still consume context window space despite costing less. Systems that ignore cache tokens in their context estimation underestimate actual usage. SYNAPSE's current model does not account for this at all.

Sources:
- [JetBrains Research — Efficient Context Management](https://blog.jetbrains.com/research/2025/12/efficient-context-management/)
- [Context Rot — Chroma Research](https://research.trychroma.com/context-rot)
- [LLM Context Management Guide — 16x Engineer](https://eval.16x.engineer/blog/llm-context-management-guide)
- [Agentic Context Engineering — ArXiv 2510.04618](https://arxiv.org/html/2510.04618)

---

### Q5: Open-Source Context Window Management Libraries and Patterns

#### Library: `@diyor28/context` (iota-uz/context)

A production-grade MIT-licensed TypeScript library extracted from the Foundry project:

```typescript
const builder = new ContextBuilder({
  policy: DEFAULT_POLICY,
  codecs: BUILT_IN_CODECS,
  tokenEstimator: new AnthropicTokenEstimator('claude-sonnet-4-5'),
});

const policy = {
  contextWindow: 200_000,
  completionReserve: 8_000,
  overflowStrategy: 'compact',  // 'compact' | 'truncate' | 'error'
};
```

**Block kinds (priority ordering):** `pinned → reference → memory → state → tool_output → history → turn`

**Key features:**
- Deterministic block ordering by kind.
- Token budget enforcement with configurable overflow strategy (compact, truncate, error).
- Multi-provider support: Anthropic, OpenAI, Gemini.
- Context forking for parallel operations.
- Content addressing/deduplication via stable hashing.
- Sensitivity levels on blocks (public, internal, confidential, secret).

Source: [GitHub — iota-uz/context](https://github.com/iota-uz/context)

#### Library: LiteLLM Token Counter

LiteLLM provides a universal token counting interface that routes to the correct model-specific tokenizer:

```python
from litellm import token_counter
count = token_counter(model="claude-3-5-sonnet", text="your text here")
```

Supports custom tokenizers for self-hosted models. This is what Aider uses internally.

Source: [LiteLLM Token Usage](https://docs.litellm.ai/docs/completion/token_usage)

#### Pattern: Gemini CLI Rough Estimator

The Gemini CLI (open source) uses a character-based rough estimator for guardrail logic (not billing):
```javascript
// Gemini CLI approach — referenced as model for Qwen code issue
function estimateTokens(text) {
  return Math.ceil(text.length / 4);  // English prose baseline
}
```

This is the same approach SYNAPSE already uses in `utils/tokens.js`. The consensus in the industry is that this is appropriate for guardrail use cases but should be supplemented with API-feedback when accuracy matters.

#### Pattern: Portkey Token Tracking

For production LLM observability, Portkey captures token usage across providers by intercepting API responses and accumulating `input_tokens + output_tokens` per request per session. This enables cross-session token tracking without static estimation.

Source: [Portkey — Tracking LLM Token Usage](https://portkey.ai/blog/tracking-llm-token-usage-across-providers-teams-and-workloads/)

---

## Analysis: Current SYNAPSE Context Bracket System

### What Works

The **architectural design** of the Context Bracket system is sound and aligns with industry patterns:

1. **Bracket-based behavior differentiation** — Industry best practice. JetBrains, Codex, Claude Code all use threshold-based behavioral adaptation.
2. **Layer filtering by bracket** — Correct. Reducing injected context at FRESH brackets is optimal. FRESH (800 token budget) vs CRITICAL (2500 token budget) is counterintuitive at first but makes sense: CRITICAL injects more because the model needs more help as context fills.
3. **Memory hints at DEPLETED+** — Correct pattern. JetBrains research confirms that reinforcement of key state is valuable when context starts depleting.
4. **Handoff warning at CRITICAL** — Correct. Alerting the model to prepare for context handoff at >75% usage aligns with Claude Code's own compaction behavior (triggers at ~83.5%).
5. **`estimateTokens` in `utils/tokens.js`** — Character/4 heuristic is the industry-standard fallback.

### What Needs Improvement

#### Problem 1: Static `avgTokensPerPrompt = 1500` Is Inaccurate

The formula `contextPercent = 100 - ((promptCount * 1500) / maxContext * 100)` assumes every prompt uses exactly 1500 tokens. In reality:
- A SYNAPSE-injected context block can be 500–3000+ tokens depending on which layers activate.
- The user's actual prompt varies wildly (10 tokens to 5000+ tokens).
- Tool outputs (file reads, search results) can be 10K–50K tokens per turn.
- The 1500 estimate only covers a fraction of what Claude Code actually sees as `input_tokens`.

**Impact:** At `promptCount = 50`, the estimate says 62.5% remaining (FRESH), but actual usage could be 80%+ (CRITICAL). The bracket system is giving wrong signals.

#### Problem 2: No Account for Cache Tokens

Claude Code tracks `cache_read_input_tokens` and `cache_creation_input_tokens` separately. SYNAPSE does not account for these at all. For a session with heavy prompt caching (which AIOS uses), the actual context usage is systematically underestimated.

#### Problem 3: Session `context.last_tokens_used` Is Available But Unused

The SYNAPSE session schema (session-manager.js, line 49) already stores:
```json
{
  "context": {
    "last_bracket": "FRESH",
    "last_tokens_used": 0,
    "last_context_percent": 100
  }
}
```

The `last_tokens_used` field is there but appears to always be initialized to 0 and never updated with real API token data. If Claude Code's hook input includes token usage data, this field could be populated with real counts.

#### Problem 4: Bracket Thresholds May Be Inverted vs. Reality

The current bracket definition (`context-tracker.js` lines 26–31):
```javascript
FRESH:    { min: 60, max: 100, ... }  // > 60% remaining
MODERATE: { min: 40, max: 60,  ... }  // 40-60% remaining
DEPLETED: { min: 25, max: 40,  ... }  // 25-40% remaining
CRITICAL: { min: 0,  max: 25,  ... }  // < 25% remaining
```

Claude Code auto-compact triggers at ~83.5% usage (16.5% remaining). So CRITICAL in SYNAPSE (<25% remaining) maps roughly to the window that Claude Code considers "about to compact." This alignment is correct in principle, but the estimation is so inaccurate that the bracket transitions happen at wrong times.

---

## Prioritized Recommendations

### P0 — Critical: Read Real Token Data from Hook Input

**Problem:** The hook receives a JSON payload from Claude Code via stdin. Investigate whether this payload includes `usage_metadata` or `input_tokens` from the previous turn.

**Action:** Audit `hook-runtime.js` `resolveHookRuntime(input)` to check if `input.session` or `input` contains real token counts from the previous API call. If present, use them directly instead of `promptCount * 1500`.

```javascript
// Proposed improvement in engine.js process() method:
function extractRealTokensFromSession(session, hookInput) {
  // Priority 1: Real usage from hook input (if available)
  if (hookInput && hookInput.usage && hookInput.usage.input_tokens) {
    const { input_tokens, cache_read_input_tokens = 0, cache_creation_input_tokens = 0 } = hookInput.usage;
    return input_tokens + cache_read_input_tokens + cache_creation_input_tokens;
  }
  // Priority 2: Last known tokens from session state
  if (session && session.context && session.context.last_tokens_used > 0) {
    return session.context.last_tokens_used;
  }
  // Priority 3: Fallback to prompt count estimation
  return null;
}
```

**Effort:** Low (1–2 hours). **Impact:** High — eliminates the core inaccuracy.

### P1 — High: Improve Static Estimation When Real Data Unavailable

**Problem:** The fallback estimate of 1500 tokens/prompt is too low for AIOS use cases where SYNAPSE itself injects 800–2500 tokens per turn, plus user prompts, plus tool outputs.

**Action:** Update `DEFAULTS.avgTokensPerPrompt` to a more realistic value based on actual AIOS session token data. A conservative starting point:

```javascript
const DEFAULTS = {
  // Rationale: SYNAPSE injection (1500) + avg user prompt (800) + tool outputs (3000)
  // = ~5300 tokens/prompt, rounded down for safety
  avgTokensPerPrompt: 4000,
  maxContext: 200000,
};
```

This would make the bracket transitions occur 2.7x sooner than currently, better aligning with reality.

**Effort:** Trivial (5 minutes). **Impact:** Medium — improves accuracy when real data unavailable.

### P1 — High: Populate `session.context.last_tokens_used` from API Responses

**Problem:** The session schema has the right field but it's never updated with real data.

**Action:** After each API call, update session context with the actual token counts:

```javascript
// In the session update flow (wherever prompt_count is incremented):
updateSession(sessionId, sessionsDir, {
  context: {
    last_bracket: bracket,
    last_tokens_used: actualTokensFromApiResponse,  // real count
    last_context_percent: (1 - actualTokensFromApiResponse / 200000) * 100,
  }
});
```

**Effort:** Medium (4–8 hours, requires tracing the session update flow through hook-runtime.js → engine.js → session-manager.js). **Impact:** High — enables accurate tracking across turns.

### P2 — Medium: Update Layer Filtering Logic for FRESH Bracket

**Problem:** FRESH bracket only loads layers `[0, 1, 2, 7]` (Constitution, Global, Agent, Star-Command). This means L3-L6 (workflow, task, squad, keyword) are absent at the start of a session, when context is abundant and the model most needs them for orientation.

**Finding from research:** JetBrains observation masking research shows that keeping reasoning/action context intact is important. Dropping L3-L6 when context is FRESH loses context about what the user is working on, reducing SYNAPSE's value at the start of sessions.

**Action:** Reconsider FRESH bracket to include L3-L5 at minimum:
```javascript
FRESH: { layers: [0, 1, 2, 3, 4, 5, 7], memoryHints: false, handoffWarning: false },
```

CRITICAL should actually reduce injection (masking), not increase it. The current design (CRITICAL = 2500 token budget, more content) may need review.

**Effort:** Low. **Impact:** Medium — improves early-session context quality.

### P2 — Medium: Add Calibration Logging

**Problem:** There is no way to know how accurate the current estimates are versus reality.

**Action:** Add a metrics field to session tracking: `context.estimation_vs_actual` that records the difference between `estimateContextPercent(promptCount)` and the actual percent derived from API responses. This enables data-driven tuning of `avgTokensPerPrompt`.

**Effort:** Low. **Impact:** Medium — enables evidence-based improvement over time.

### P3 — Low: Consider `@diyor28/context` Library for Advanced Cases

**Problem:** The current SYNAPSE context injection pipeline reinvents some patterns that are available in mature libraries.

**Finding:** The `@diyor28/context` library (MIT, TypeScript) provides block-based context management with deterministic ordering, token budgeting, and multi-provider support. Its `AnthropicTokenEstimator` calls the official API for accurate counting.

**Action:** Evaluate whether the SYNAPSE layer system could benefit from this library's token budgeting logic (specifically `contextWindow`, `completionReserve`, `overflowStrategy: 'compact'`). This is not a replacement for SYNAPSE's 8-layer model but could augment the token budget enforcement.

**Effort:** High (significant refactor). **Impact:** Low-Medium for current scope.

---

## Implementation Recommendation: Two-Tier Context Tracking

Based on all research findings, the recommended architecture for SYNAPSE context tracking is:

```
Tier 1: Real-time (per hook invocation)
  → Check hook input payload for usage_metadata
  → Check session.context.last_tokens_used (updated after each turn)
  → If real data available: use it directly for bracket calculation
  → Accuracy: ~100%

Tier 2: Fallback estimation (when no real data)
  → Use promptCount * avgTokensPerPrompt (conservative: 4000)
  → Apply char/4 heuristic to estimate injected SYNAPSE context size
  → Adjust for known SYNAPSE overhead (L0-L2 ~600-1200 tokens baseline)
  → Accuracy: ±30% (good enough for guardrail logic)
```

This two-tier approach is consistent with what Codex CLI proposed in the Qwen Code issue: use real API data when available, fall back to rough estimation only when necessary.

---

## Appendix: Current SYNAPSE Code Audit

### Files Relevant to C2

| File | Role | Issue |
|------|------|-------|
| `.aios-core/core/synapse/context/context-tracker.js` | Bracket calculation + estimation | `avgTokensPerPrompt = 1500` too low; no real token input |
| `.aios-core/core/synapse/utils/tokens.js` | `estimateTokens(text) = length/4` | Correct heuristic, but unused in bracket calculation |
| `.aios-core/core/synapse/session/session-manager.js` | Session CRUD + context field | `last_tokens_used` initialized to 0, never updated with real data |
| `.aios-core/core/synapse/engine.js` | Orchestrator, calls `estimateContextPercent(promptCount)` | Does not read session's `last_tokens_used` |
| `.claude/hooks/synapse-engine.cjs` | Hook entry point, reads stdin JSON | Hook input schema not audited for `usage_metadata` presence |

### Key Code Path

```
synapse-engine.cjs
  → readStdin()           # Receives full JSON from Claude Code hook
  → resolveHookRuntime()  # Parses input, creates/loads session
  → engine.process()
      → estimateContextPercent(session.prompt_count)  # <-- INACCURACY HERE
      → calculateBracket(contextPercent)
      → getActiveLayers(bracket)
```

The fix should be in `engine.process()` — before calling `estimateContextPercent()`, check if the hook input or session contains real token data.

---

## Sources

- [Claude Code Context Buffer Management](https://claudefa.st/blog/guide/mechanics/context-buffer-management)
- [How to Calculate Your Claude Code Context Usage](https://codelynx.dev/posts/calculate-claude-code-context)
- [Anthropic Token Counting Docs](https://platform.claude.com/docs/en/build-with-claude/token-counting)
- [Claude Code Compaction](https://platform.claude.com/docs/en/build-with-claude/compaction)
- [Claude Code Auto-Compact FAQ](https://claudelog.com/faqs/what-is-claude-code-auto-compact/)
- [JetBrains Research — Efficient Context Management (Dec 2025)](https://blog.jetbrains.com/research/2025/12/efficient-context-management/)
- [Context Rot — Chroma Research](https://research.trychroma.com/context-rot)
- [Qwen Code Issue #1289 — Replace tiktoken with rough estimator](https://github.com/QwenLM/qwen-code/issues/1289)
- [GitHub — iota-uz/context library](https://github.com/iota-uz/context)
- [LiteLLM Token Usage](https://docs.litellm.ai/docs/completion/token_usage)
- [LLM Context Management Guide — 16x Engineer](https://eval.16x.engineer/blog/llm-context-management-guide)
- [Agentic Context Engineering — ArXiv 2510.04618](https://arxiv.org/html/2510.04618)
- [Portkey — Token Usage Tracking](https://portkey.ai/blog/tracking-llm-token-usage-across-providers-teams-and-workloads/)
- [Token Counting Explained: tiktoken, Anthropic, Gemini 2025](https://www.propelcode.ai/blog/token-counting-tiktoken-anthropic-gemini-guide-2025)
- [Aider Advanced Model Settings](https://aider.chat/docs/config/adv-model-settings.html)
- [Context Window Management Strategies — Maxim](https://www.getmaxim.ai/articles/context-window-management-strategies-for-long-context-ai-agents-and-chatbots/)
- [Calculating Token Counts — Winder.ai](https://winder.ai/calculating-token-counts-llm-context-windows-practical-guide/)
- [Anthropic Tokenizer TypeScript](https://github.com/anthropics/anthropic-tokenizer-typescript)
- [compare-tokenizers Node.js](https://github.com/transitive-bullshit/compare-tokenizers)
