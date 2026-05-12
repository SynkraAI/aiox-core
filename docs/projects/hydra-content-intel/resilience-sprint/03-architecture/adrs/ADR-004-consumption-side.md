# ADR-004: Mind-Clone Feed Consumption (Consumption-Side Architecture)

**Format:** Michael Nygard
**Date:** 2026-05-12
**Status:** Accepted
**Deciders:** Aria (@architect), pragmatic synthesis (no conclave — conclave for Resilience Sprint already closed 2026-05-11; user-approved key parameters 2026-05-12)
**Conclave experts consulted:** None (this ADR closes a gap discovered AFTER the writer-side conclave; key design parameters were directly user-approved on 2026-05-12)
**Related PRD requirements:** Story 1.12 (Connect Feeds to Consultation Engine — added v0.8); v0.8 concerns C-07, C-08, C-09, C-10; risks RA-6, RA-7, RA-8, RA-9
**Related ADRs:** [ADR-001](./ADR-001-streaming-pattern.md), [ADR-002](./ADR-002-vector-search.md), [ADR-003](./ADR-003-observability-stack.md) — these cover the **writer side** of HYDRA. ADR-004 closes the **consumer side** gap.

---

## Context

### How the gap appeared

The Resilience Sprint as conceived through v0.6 (PO validation 2026-05-11) had a clean architectural shape: fix the OOM in the writer (`pipeline.js` → `pipeline/orchestrator.js`, JSON → SQLite, streaming), unify the distribution path (`DistributionService`), add observability. Three ADRs (001/002/003) captured the writer-side decisions with 3/3 conclave consensus.

What the writer-side conclave **did not surface** — because no one asked — was a question about the consumer. The whole apparatus exists to feed mind clones with up-to-date research. On 2026-05-12, an empirical validation (`node self-consultation.js consult --expert alison-darcy`) returned `mindCloneEnrichment.relevantMemory: []` while a 164KB feed file sat at `D:/jarvis/mega brain/knowledge-feed/alison-darcy/2026-05-08-hydra-feed.md`. A grep of the consumer codebase confirmed:

```
grep -r "knowledge-feed\|hydra-feed" D:/AIOS/.aios-core/  → No matches found
```

The writer was complete. The consumer was never wired. Every clone consultation since 25.150 feeds were written (08/Mai sessions) has answered from frozen knowledge while hallucinating plausibly about content it could not see.

### Why this cannot wait for Sprint #2

1. **The sprint's stated goal becomes vacuous without consumption.** PRD §1.5 reads "scheduler back up, scheduler producing feeds." But producing feeds that no one reads is not a user outcome; it is a midpoint output.
2. **Silent failure is strictly worse than OOM.** The OOM crashes loudly, logs to disk, and the absence of a heartbeat eventually becomes visible. The feed-disconnect bug is invisible: every consult appears to work, the LLM returns confident prose, and the operator has no signal anything is wrong.
3. **The cost of waiting is proportional to writer throughput.** If the writer-side fixes ship in Sprint #1 (Stories 1.1-1.11) but consumption ships in Sprint #2 (3-4 weeks later), the system will produce an additional 50k+ orphan feed files in that gap. The sprint's deliverable provably useless during that window is a worse signal than the in-scope expansion.

### What the current consumer does (so the change is precise)

`self-consultation.js` line 256-275 builds a `mindCloneEnrichment` object today:

- `advisorContext` — pulled from `jarvis-mind-clone-map.yaml`
- `relevantMemory` — file paths in `.claude/agent-memory/{callingAgent}/*.md`, filtered to `feedback_*.md` or files whose name contains the expert ID, `slice(0, 5)`
- `source` — `'skill-md'` or `'legacy-md'`

The field name `relevantMemory` already exists. **Today it carries `string[]` file paths from agent-memory, NOT HYDRA feeds.** Story 1.12's spec (AC #2) repurposes this same field for `FeedEntry[]` — a semantic and shape change in one move. See Decision Point 6 below for how we handle that.

---

## Decision

**Add a consumer-side `feed-reader` module co-located with the writer-side `distribution-service`. Inject HYDRA feed content into the consultation prompt as a dedicated "Recent Knowledge" section. Constrain by 30k tokens PER EXPERT, S/A tier by default, and signal staleness explicitly when the feed is empty so the LLM is instructed not to fabricate. Quarantine pre-fix feed entries (generated before 2026-05-12) so a fabrication loop cannot form.**

Concretely, six decisions:

### 1. Feed Reader module location — co-located with writer

**Decision:** `D:/AIOS/tools/hydra/src/distribution/feed-reader.js`, sitting alongside `distribution-service.js`, `feed-writer.js`, `mind-clone-router.js`, `entity-graph.js`.

**Why co-locate:**
- The writer (`feed-writer.js`) and reader (`feed-reader.js`) share a single domain concept: the `FeedEntry` shape and the `knowledge-feed/{cloneId}/YYYY-MM-DD-hydra-feed.md` file format. Drift between writer and reader is the failure mode we are most exposed to (writer adds a field, reader breaks; or vice versa). Co-location keeps them in the same diff scope.
- The HYDRA codebase has no `src/consumption/` directory today. Creating one for a single 70-90 LOC module crosses a directory boundary for the sake of architectural symmetry without paying for itself.
- The `distribution/` directory is already semantically "the boundary between HYDRA and the rest of AIOS" (the same directory houses `mind-clone-router.js`). Reading the feeds back is the inverse of writing them; it belongs at the same boundary.
- A shared `feed-types.js` (PO suggestion S-06) can live in the same directory and be imported by both sides — see Decision Point 7.

**Alternative considered and rejected:** `src/consumption/feed-reader.js`. This would have created clean writer/reader symmetry but at the cost of a one-module directory and a longer import path from `self-consultation.js`. Symmetry is not load-bearing here.

### 2. Token budget policy — 30k tokens PER EXPERT (user-approved 2026-05-12)

**Decision:** `loadCloneFeeds(cloneId, { maxTokens: 30000 })` enforces a per-expert budget. Conclave mode (N experts) consumes N × 30k tokens of feed content total — by design, not by accident. Truncate oldest first within each expert's budget.

**Trade-offs documented:**

| Policy | Cost per 5-expert conclave | Information density per expert | Conclave-aware tuning needed? |
|---|---|---|---|
| **30k per expert** (CHOSEN) | ~R$1.50 (DeepSeek) / ~R$11 (Claude Sonnet) | High — each expert sees a fully-loaded context window | No (uniform) |
| 30k total, split N ways | ~R$0.30 (DeepSeek) | Low — 6k each in a 5-expert conclave starves the feature | No |
| Unlimited | Unbounded — a 50-day feed window × 5 experts could exceed 1M tokens | Maximum | Yes (or risk runaway cost) |

The user explicitly approved per-expert on 2026-05-12 with the framing "richer context per expert vs higher API cost". The cost ceiling is acceptable: ~R$1.50 per 5-expert DeepSeek conclave puts ~10 conclaves/day at R$15/day, an order of magnitude below the operator's existing LLM spend on the pipeline writer side.

This resolves PO concern **C-07**.

### 3. Tier filter default — S/A by default, B excluded if older than 7 days

**Decision:** `loadCloneFeeds(cloneId, { minTier: 'A' })` admits S and A by default. B-tier entries are admitted **only if** `generated_at >= now - 7 days`. Callers can override (`minTier: 'B'`, `minTier: 'S'`) for specific needs.

**Why:**
- Tier S/A are the high-relevance entries — the items HYDRA's scoring stage marked as worth a clone's attention. They should be the default consumption surface.
- Tier B is "marginal but recent" — sometimes useful for a question about something just-happened, almost never useful at depth. The 7-day cutoff for B captures this: recent B is signal; week-old B is noise that bloats the token budget.
- The default is generous enough that "I asked a recent thing and the answer felt thin" is unlikely; restrictive enough that a clone with 30 days × 8 tier-B items/day doesn't waste 27k tokens on items the scoring stage already marked marginal.

**No tier filter rejected** because the budget would otherwise be consumed by tier-B noise. **S-only default rejected** because A-tier carries real signal — the threshold between A and S is a 5-point scoring delta, well within noise.

### 4. Staleness signaling — explicit "no recent feed" prompt to mitigate hallucination

**Decision:** If `loadCloneFeeds(cloneId)` returns an empty array (no entries in the last 30 days), the consultation prompt receives **this exact section instead** of the "Recent Knowledge" block:

```
## Recent Knowledge (HYDRA feed)
⚠️ No recent feed entries found for this expert in the last 30 days.
Answer from your frozen knowledge only — do NOT fabricate recent sources, URLs,
publication dates, statistics, or events that you cannot verify from training data.
If the question requires recent information you don't have, say so explicitly.
```

**Why an explicit "do not fabricate" instruction:**

The research literature on hallucination mitigation is consistent that LLMs hallucinate most aggressively when **(a) the question implies recency** and **(b) the model has nothing to ground in**. Schulhoff et al. (Prompt Report, 2024) and the broader prompt-engineering literature on Claude 3+ and DeepSeek both show that explicit "do not fabricate; state uncertainty" instructions reduce confabulation rates substantially when applied to recency-sensitive queries. Anthropic's own published guidance for Claude includes this pattern in their recommended templates for retrieval-augmented contexts.

**The empty-feed case is the highest-risk path for fabrication** because the rest of the prompt (advisor context, principles, project) gives the model enough scaffolding to write confident prose, but no factual ground. The staleness signal is cheap insurance.

### 5. Source attribution — every entry's URL preserved in the injected prompt

**Decision:** Every `FeedEntry` injected into the prompt MUST carry its `source_url`. The prompt template explicitly instructs the LLM: "When you cite information from the Recent Knowledge section, cite the URL inline."

**Why mandatory:**
- **Traceability.** When the operator later asks "where did this clone get that claim?", the answer is in the consultation prompt itself, not in opaque LLM training.
- **Hallucination detection.** A clone that cites a URL not present in the injected feed is fabricating. This becomes a testable property: a downstream auditor can diff cited URLs against injected URLs.
- **Cost rationalization.** The 30k-token-per-expert budget is justified only if the model uses the content faithfully. Mandatory citation is the contract that makes that faithful use observable.

The frontmatter format already documented (per spawn prompt: clone_id, date, items_count, domains, relevance_avg + per-item Source URL, Author, Relevance, Matched keywords, Content ID, Key Insights) already preserves URLs. The reader passes them through verbatim.

### 6. Quarantine policy for pre-fix feeds (resolves C-09)

**Decision:** Every feed entry with `generated_at < 2026-05-12T00:00:00Z` is marked `quarantined: true` by `feed-reader.js`. Quarantined entries are still loaded (we do not strip them), but each quarantined entry is wrapped in a per-entry warning in the injected prompt:

```
## Recent Knowledge (HYDRA feed, last 30 days)
[2026-05-08] [S] Some title here
URL: https://example.com/...
⚠️ Pre-2026-05-12 entry — extraction predates anti-hallucination injection check.
Treat factual claims in this entry with skepticism; verify URL before citing.
[content excerpt]
---
```

**Why quarantine and not delete:**
- Most pre-fix entries are source-grounded (URL + raw excerpt), not synthesized. Deleting them all would discard real signal alongside potential noise. The 08/Mai squad sessions produced 25.150 entries; throwing them away because *some fraction* may be hallucinated is over-correction.
- The quarantine flag is cheap (one boolean per entry, set by date comparison) and the warning text is short (~40 tokens per quarantined entry).
- After 2026-06-12 (30 days post-fix), the rolling 30-day window naturally excludes all pre-fix entries and the quarantine path becomes dead code — to be cleaned up in Sprint #2.

**Why this matters (the fabrication loop):**
PO risk RA-7 spelled it out: the 08/Mai feed writes happened *before* the anti-hallucination injection check was in place at the extract stage. Some unknown fraction of those entries may contain LLM-synthesized content rather than raw sources. If a clone now reads a hallucination it (or a peer) emitted on 08/Mai and treats it as fact, the clone has fabricated a citation on top of a fabrication. This is the worst failure mode in the entire consumption path. The quarantine warning breaks the chain.

This resolves PO concern **C-09**.

### 7. Shape compatibility — rename to `feedEntries`, retain `relevantMemory` as legacy alias

**Decision:** `mindCloneEnrichment` grows a new field `feedEntries: FeedEntry[]` (the HYDRA feed payload). The existing `relevantMemory: string[]` (agent-memory file paths, unchanged in semantics) is retained for one release cycle, mirroring the `pipeline.js` shim retention policy from PRD v0.7. Future readers should use `feedEntries`. Existing readers continue to work without modification.

**Why this matters (not a cosmetic change):**

The C-10 audit (separate deliverable, `audits/C-10-relevantMemory-audit.md`) found that the existing `relevantMemory` field carries agent-memory file paths and is consumed by `subagent-dispatcher.js` and `mind-clone-pipeline.js` (greeting builder). **Repurposing the field to carry HYDRA feed entries would silently break both consumers.** The greeting builder counts entries (`${relevantMemory.length} relevant memory entry(ies) available — invoke *recall to access`). The subagent dispatcher copies the array into `enriched.memory`. Both expect string paths, not structured objects.

By introducing `feedEntries` as a new field and keeping `relevantMemory` untouched, we get:
- **Zero break in existing consumers.** No diff in `subagent-dispatcher.js`. No diff in `mind-clone-pipeline.js`.
- **Single source of truth for the new shape.** `feedEntries: FeedEntry[]` is unambiguous.
- **No backward-compat shim** in the consultation prompt either — the prompt builder reads from `feedEntries`, and the legacy code paths read from `relevantMemory`, and they do not interfere.

Sprint #2 may delete `relevantMemory` from `mindCloneEnrichment` IF the C-10 audit confirms no live consumer remains. That's a 15-minute cleanup, deferred to keep this sprint focused.

This resolves PO concern **C-10**.

---

## Consequences

### Positive

1. **HYDRA becomes end-to-end functional.** Feeds are written by the resilient pipeline (ADR-001/002/003) and read by the consumer (ADR-004). The sprint deliverable is no longer half a system.
2. **Hallucination surface area shrinks.** Clones answering questions about content HYDRA has indexed will see the indexed content instead of guessing. The staleness signal (Decision 4) prevents the worst regression — confident answers grounded in nothing.
3. **Cost transparency at the consumer.** The 30k-per-expert budget is explicit and predictable. A 5-expert DeepSeek conclave costs ~R$1.50, observable in the operator's billing.
4. **No new external dependencies.** Filesystem reads, in-process token counting, prompt-template concatenation. No vector store, no embedding model, no new SaaS.
5. **Backward compatible with existing consumers (C-10).** `relevantMemory` field semantics preserved; `feedEntries` is purely additive.
6. **Quarantine breaks the fabrication loop (C-09, RA-7).** Pre-2026-05-12 entries are marked, warned-about in-prompt, and naturally age out of the 30-day window.

### Negative

1. **Token cost per conclave scales linearly with expert count.** A 5-expert conclave consumes 150k tokens of feed content alone, plus question/context/principles/advisor blocks. At DeepSeek pricing (~R$0.10/M output, ~R$0.30/M input on cached prompts), the budgeted ~R$1.50 per conclave is acceptable but visibly non-zero. The user accepted this on 2026-05-12.
2. **30-day rolling window discards older entries silently.** A question about a six-month-old source will not see the feed for that source unless it was re-ingested recently. **Trade-off accepted:** the consultation surface is "what's recent and relevant", not "what's ever been written". For "everything ever written" the operator has `hydra search` (writer side, ADR-002).
3. **Quarantine flag is short-term dead-code surface.** After 2026-06-12, no entry will ever match the quarantine predicate. Cleanup in Sprint #2.
4. **Filesystem glob scales O(files).** At 162 clones × 365 days × 1 feed/day = 59k files/year, the glob is fine. Beyond 5-10 years, an SQLite index of feed files (date/tier/clone) would beat the glob. Out of scope; revisit when feed-file count crosses 100k.
5. **The shape break risk on `relevantMemory` was real and remains documented (C-10).** We avoided the break by adding `feedEntries` rather than overloading the existing field, but the documentation must persist so a future refactorer does not undo this choice.

### Risks (from PO v0.8 §Q6 — RA-6, RA-7, RA-8, RA-9)

| Risk | Severity | Mitigation in ADR-004 |
|---|---|---|
| **RA-6** — Token budget blowup in conclave | HIGH/MEDIUM | Decision 2: 30k per expert is explicit and predictable; cost ceiling at ~R$1.50 per 5-expert DeepSeek conclave accepted by user 2026-05-12. |
| **RA-7** — Feedback loop with pre-fix hallucinated feeds | MEDIUM/MEDIUM | Decision 6: per-entry quarantine flag + in-prompt warning. Naturally ages out by 2026-06-12. |
| **RA-8** — Backward-compat break on `relevantMemory` shape | LOW/HIGH | Decision 7: new `feedEntries` field; legacy field preserved unchanged. Zero break in existing consumers. |
| **RA-9** — Date parsing brittleness across OS | LOW/LOW | Parse date from frontmatter `date:` field, NOT from filename (which can drift if writer convention changes). Filename used only as a glob shortcut. |

### Things we are NOT doing (and why)

- **No SQLite index of feed files.** At current scale (162 clones × 365 days = ~59k/year), filesystem glob is adequate. SQLite would add a write path that races the writer-side and creates a new failure mode (index drift from filesystem). Revisit when file count crosses 100k or glob latency exceeds 100ms.
- **No vector search at consultation time.** ADR-002 owns vector search for `hydra search`. Putting an embedding model in the consultation hot path adds latency, cost, and a load-bearing dependency on the embedding service. The 30-day × tier filter is a coarser but adequate proxy for "relevant to this clone" — because the feeds are *already routed by relevance* upstream (writer side does the matching).
- **No summarization layer.** A "summarize feed entries before injecting" approach would reduce token cost but introduce a second LLM call (cost), a second hallucination surface (summary inaccuracy), and a third failure mode (summarizer downtime). Truncate-oldest-first is dumber and more predictable.
- **No async/streaming injection.** The consultation prompt is built synchronously in `self-consultation.js`; the LLM call that follows is the slow part. Feed reading is filesystem-bounded (≤30 files per clone in the typical case) and completes in ≤50ms. Streaming the feed read would add complexity without measurable benefit.
- **No write-back from consultation to feed.** Clones consume feeds; they do not append to them. The writer side (DistributionService) is the only path that writes `knowledge-feed/`. This separation is enforced by the directory structure (writer-side has the lock; reader-side has read-only filesystem access).
- **No retroactive cleansing of pre-fix entries.** Deleting or rewriting 25.150 entries is more risky than warning about them in-prompt. The warning + 30-day aging is sufficient.

### Things requiring future work (post-sprint)

- **SQLite index of feed files** if/when filesystem glob latency becomes measurable (target threshold: 100ms median over 162 clones).
- **Cleanup of the legacy `relevantMemory` field** once C-10 audit re-runs and confirms zero live consumers (no earlier than 2026-06-12).
- **Cleanup of the quarantine flag and warning code path** after 2026-06-12 when no live entry will match the predicate.
- **`hydra feed audit-pre-fix --before 2026-05-12 --output report.md` tooling** if the operator wants a one-time human review of pre-fix entries beyond the in-prompt warning. Lower priority once the quarantine is in place.
- **Telemetry on feed injection** — pino logs at `info` level: "Injected N feed entries for {cloneId}, ~M tokens, X quarantined". Cheap to add; defer to keep Story 1.12 small.

---

## Alternatives considered

### Alternative A — Lazy load on demand (clone reads its own feed inside the prompt)

The prompt would instruct the LLM to call a tool to fetch its feed. The model decides what to read.

**Rejected because:**
- Tool-calling latency adds 1-3 seconds per consultation; most consultations would unnecessarily round-trip.
- The model is the worst possible judge of what to load — it does not know what's in the feed before reading it. It would either load too much (cost blowup) or too little (the bug we are fixing).
- The current consultation surface (`self-consultation.js`) does not run inside an agent loop; it returns a prompt string for a parent agent to act on. Tool-calling inside the consult function would require a new orchestration layer.

### Alternative B — RAG with vector search at consultation time

Embed the question, retrieve top-K matching feed entries by cosine similarity to the question.

**Rejected because:**
- ADR-002 deferred sqlite-vss; the LRU cosine cache is sized for `hydra search` not for synchronous consultation reads.
- Adds an embedding-model dependency to the consultation hot path. The consultation flow today has zero LLM dependencies of its own; injecting a `query → embed → cosine → retrieve` chain doubles the failure surface.
- The feeds are **already filtered upstream** by domain/relevance for each clone (writer-side `mind-clone-router.js`). The set of entries in `knowledge-feed/{cloneId}/` is by construction "things this clone would care about". A vector re-rank on top is a marginal refinement at significant complexity cost.
- **Defer:** if Sprint #3+ shows the 30k budget regularly truncates useful content, revisit. Until then, recency + tier is good enough.

### Alternative C — Summarization layer (summarize feeds → inject summaries)

A second LLM call summarizes the 30-day window before injection. Reduces token cost.

**Rejected because:**
- Adds a second LLM call (cost ≈ the savings).
- Adds a second hallucination surface (the summarizer can fabricate; we are trying to *reduce* hallucination, not multiply it).
- The summary loses the URL anchoring (Decision 5) — clones citing a summarized version of an entry cannot cite the original URL faithfully.
- Truncate-oldest-first is predictable; LLM summarization is not.

### Alternative D — Inject only the most recent N entries (e.g., top 10), drop token budget

Simpler than token-counting; just cap on entry count.

**Rejected because:**
- Entry size varies wildly (some 200 tokens, some 4k+). A 10-entry cap can range from 2k to 40k tokens — the operator has no cost predictability.
- Token budget gives stable cost ceilings, which the operator can reason about against billing.
- The implementation cost is the same (count tokens vs count entries — one extra `encode().length` call per entry).

### Alternative E — Defer Story 1.12 to Sprint #2

The PO validation report (§v0.8.1 Q1) considered this and rejected it. Restated here:

**Rejected because:**
- Without 1.12, the sprint ships HYDRA fixed-but-useless. Stakeholder framing of the sprint deliverable becomes negative.
- 25.150 feeds already on disk × 3-4 weeks of additional writer-side runs = 50k+ more silent-orphan files before consumer ships.
- The 1.12 scope (~250-280 LOC + tests, per S-06) is smaller than Story 1.5 alone. Decomposition cost exceeds the benefit.

---

## References

- **PRD v0.9** (Story 1.12 + v0.8 change log): `D:/AIOS/docs/projects/hydra-content-intel/resilience-sprint/02-prd/prd.md` §5 lines 826-878, §1.6 line 85
- **PO v0.8 re-validation** (concerns C-06..C-10, risks RA-6..RA-9): `D:/AIOS/docs/projects/hydra-content-intel/resilience-sprint/04-validation/po-validation-report.md` §v0.8.1-§v0.8.6
- **Current consultation engine code**: `D:/AIOS/.aios-core/core/jarvis/self-consultation.js` lines 256-275 (enrichment build), 343-387 (prompt template), 392-396 (batchConsult / conclave path)
- **Existing distribution module siblings**: `D:/AIOS/tools/hydra/src/distribution/distribution-service.js` (architecture §4.11), `feed-writer.js`, `mind-clone-router.js`, `entity-graph.js`
- **Existing feed file example**: `D:/jarvis/mega brain/knowledge-feed/alison-darcy/2026-05-08-hydra-feed.md` (164KB, the empirical bug evidence)
- **Empirical bug discovery**: 2026-05-12 consult test on alison-darcy returned `mindCloneEnrichment.relevantMemory: []` (no agent-memory files matched the existing filter, AND no HYDRA feed entries because the wiring did not exist)
- **C-10 audit**: `D:/AIOS/docs/projects/hydra-content-intel/resilience-sprint/03-architecture/audits/C-10-relevantMemory-audit.md`
- **User decisions 2026-05-12**: per-expert token budget (30k × N for conclave); feed-reader co-located with distribution; synthetic characterization fixture out-of-scope here

## Related ADRs

- [ADR-001](./ADR-001-streaming-pattern.md) — Writer-side streaming. ADR-004 reads what ADR-001's pipeline writes.
- [ADR-002](./ADR-002-vector-search.md) — Writer-side vector store for `hydra search`. ADR-004 does NOT use this — consumption uses filesystem glob + recency/tier filter.
- [ADR-003](./ADR-003-observability-stack.md) — Writer-side observability. Future consumption telemetry (pino info logs on injection) would slot into the same `pipeline_items`/`audit_log` substrate; out of scope for Story 1.12 itself.

---

*ADR-004 authored 2026-05-12 by Aria (@architect) to close the consumption-side gap discovered post-conclave. Pragmatic synthesis (no new conclave) on user-approved parameters and PO v0.8 concerns. Zero conflict with ADR-001/002/003 — writer side is unchanged.*
