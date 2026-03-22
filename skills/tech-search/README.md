# Tech Research v3 - Deep Technical Research Pipeline

**Version:** 3.0
**Last Updated:** 2026-02-08
**Epic:** TECH-RESEARCH-001
**Skill Path:** `.claude/skills/tech-research/`

---

## Overview

Tech Research is an AIOS skill that transforms technical questions into structured, documented research with actionable findings. It automates the full pipeline: query analysis, multi-source search, coverage evaluation, and synthesis.

### What Changed from v2

| Aspect | v2 | v3 |
|--------|----|----|
| Search execution | Parallel dispatch (main model) | Orchestrator-Worker (Haiku subagents) |
| Model routing | Single model for all phases | Haiku for search/read/eval, Main for synthesis |
| Blog extraction | WebFetch primary, ETL fallback | ETL fetch-page CLI primary, WebFetch fallback |
| Sub-query processing | Sequential in main context | Parallel Task dispatch (subagents) |
| Expected cost | ~$0.20/research (Sonnet) | ~$0.06-$0.12/research (Haiku workers) |

### What Changed from v1

| Aspect | v1 | v2 |
|--------|----|----|
| Clarification | 3 fixed questions (always) | Auto-inference, 0-1 questions |
| Search | Sequential, single thread | Parallel dispatch, multi-query |
| Depth Control | None (subjective) | Coverage evaluation loop with thresholds |
| Cost Control | None (unbounded) | Token budgets per phase via config.yaml |
| Configuration | Hardcoded | External config.yaml, fully tunable |

### Key Features

- **Auto-Clarification**: Pattern matching + technology detection infers context automatically
- **Query Decomposition**: Breaks query into 3-7 atomic, searchable sub-queries
- **Parallel Search**: Dispatches all sub-queries in a single round-trip
- **Coverage Evaluation Loop**: Iterates search waves until coverage >= 80% or diminishing returns
- **Token Budgets**: Configurable limits for each phase to control cost
- **Backward Compatible**: Every v2 feature degrades gracefully if its dependency is missing

---

## Architecture

### Pipeline Phases (v3.0 - Orchestrator-Worker)

```
Query recebida
    |
    v
[Phase -1: Load Config]
    |
    v
[Phase 0: Auto-Clarify] (MAIN MODEL, inline)
    |
    +- Detects patterns + technologies
    |
    v
[Phase 1.5: Decompose] (MAIN MODEL, ultrathink)
    |
    +- Produces 5-7 sub-queries
    |
    v
[Phase 2: Generate Prompt] (MAIN MODEL)
    |
    v
+-----------------------------------------------------------+
|  ORCHESTRATOR-WORKER LOOP (max 3 waves)                   |
|                                                           |
|  [Phase 3: Dispatch Subagents] (HAIKU workers)            |
|      +- Each sub-query -> Task(model: "haiku")            |
|      +- All dispatched in single message (parallel)       |
|      +- Workers: search + ETL deep read + score           |
|      +- Fallback: sequential if Task dispatch fails       |
|      |                                                    |
|      v                                                    |
|  [Phase 3.2: Deep Read] (HAIKU, within subagents)         |
|      +- YouTube -> ETL CLI (always)                       |
|      +- Blogs -> ETL fetch-page CLI (primary)             |
|      +- Other -> WebFetch (fallback)                      |
|      |                                                    |
|      v                                                    |
|  [Phase 3.5: Evaluate Coverage] (HAIKU via Task)          |
|      +- coverage >= 80%?    -> STOP                       |
|      +- new_info < 0.1?     -> STOP                       |
|      +- iteration >= max?   -> FORCE STOP                 |
|      +- else                -> CONTINUE (next wave)       |
|      |                                                    |
|      v                                                    |
|  [Phase 3.6: Compress Wave] (HAIKU via Task)              |
|      +- Compresses wave results into ~400 token summary   |
|      +- Saves wave-N-summary.md to output dir             |
|      +- Next wave reads summaries, not raw data           |
+-----------------------------------------------------------+
    |
    v
[Phase 4: Synthesize] (MAIN MODEL) ← reads wave-*-summary.md
    |
    v
[Phase 4.5: Verify Citations] (MAIN MODEL)
    |
    v
[Phase 5: Document] (MAIN MODEL) -> docs/research/{date}-{slug}/
```

### Model Routing

| Phase | Model | Why |
|-------|-------|-----|
| 0, 1, 1.5, 2 | Main (Opus/Sonnet) | Planning requires deep reasoning |
| 3, 3.2, 3.5, 3.6 | Haiku (via Task tool) | Search parsing, evaluation, and compression |
| 4, 4.5, 5 | Main (Opus/Sonnet) | Synthesis requires judgment and creativity |

### Cost Expectations

| Model | Phases | Estimated Tokens | Cost |
|-------|--------|-----------------|------|
| Main (Opus/Sonnet) | 1.5, 2, 4, 4.5, 5 | ~20,000 | ~$0.60 |
| Haiku | 3, 3.2, 3.5 (x5-7 workers) | ~31,000 | ~$0.03 |
| **Total per research** | All | ~51,000 | **~$0.06-$0.12** |

Note: Actual costs depend on query complexity and number of search waves. The reduction comes from routing ~60% of tokens through Haiku instead of the main model.

### ETL Integration

The skill uses the ETL service at `infrastructure/services/etl/` for zero-cost content extraction:

**YouTube Transcripts:**
```bash
node infrastructure/services/etl/bin/youtube-transcript.js {videoId} --format json
```

**Blog/Article Extraction (PRIMARY for blog domains):**
```bash
node infrastructure/services/etl/bin/fetch-page.js {url}
# Exit 0 = success, 1 = blocked domain (skip), 2-4 = try WebFetch fallback
```

**Supported Blog Domains (ETL primary):**
dev.to, medium.com, marktechpost.com, hashnode.dev, hackernoon.com, freecodecamp.org/news, blog.*, *.blog.*

---

## File Structure

```
.claude/skills/tech-research/
+-- SKILL.md                     # Main workflow definition (v3, ~1000 lines)
+-- config.yaml                  # Token budgets + iteration params
+-- README.md                    # This file
+-- prompts/
|   +-- decompose.md             # Query decomposition prompt (Phase 1.5)
|   +-- evaluate.md              # Coverage evaluation prompt (Phase 3.5)
|   +-- page-extract.md          # Deep page content extraction
|   +-- tech-discovery.md        # Tool/MCP/API discovery
|   +-- verify-citations.md      # Citation integrity verification
|   +-- tool-strategy.md         # Tool hierarchy + fallback chains (v3 ETL-first)
|   +-- executor-matrix.md       # Worker vs Agent + Model Tier classification
+-- templates/
    +-- deep-research-prompt-template.md  # Research prompt template (Phase 2)
    +-- output-structure.md              # Output format reference
```

---

## Quick Start

```
/tech-research "como implementar rate limiting em Node.js"
```

The skill will:
1. Auto-detect focus (technical) and domain (Node.js) -- skip clarification
2. Decompose into sub-queries (definitions, libraries, examples, benchmarks)
3. Search all sub-queries in parallel
4. Evaluate coverage, iterate if needed
5. Synthesize findings into a structured report
6. Save to `docs/research/2026-02-07-rate-limiting-nodejs/`

---

## Usage Guide

### Basic Usage

```
/tech-research "your technical question here"
```

The skill accepts any technical question in Portuguese or English.

### Auto-Clarification Behavior

The skill analyzes your query before asking questions:

- **Query contains technical keywords** (code, api, implementation, etc.) or **known technologies** (React, PostgreSQL, Docker, etc.): Proceeds directly with 0 questions.
- **Query is ambiguous** (e.g., "pesquise sobre performance"): Asks 1 combined clarification question.
- **auto_clarification section missing from SKILL.md** (backward compat): Falls back to original 3-question flow.

### Tuning Token Budgets

Edit `.claude/skills/tech-research/config.yaml`:

```yaml
tokens:
  decomposition_output: 500    # Max tokens for query decomposition output
  source_content_max: 1000     # Max tokens per individual source (truncates longer)
  synthesis_input_max: 5000    # Max total tokens fed to synthesis phase
  final_report_max: 2000       # Soft limit for final report output
```

- **Lower values** = cheaper, faster, more concise reports
- **Higher values** = more thorough but more expensive
- All budgets use soft limits (prompt instructions) except source_content_max (hard truncation)

### Tuning Iteration Parameters

```yaml
iteration:
  max_iterations: 3            # Hard cap on search waves (1 = single wave, no iteration)
  coverage_threshold: 0.8      # Stop when coverage >= 80% (range: 0.0-1.0)
  min_new_info_ratio: 0.1      # Stop when new info < 10% (diminishing returns)
```

- **max_iterations: 1** = disable iteration loop (single search wave, like v1)
- **coverage_threshold: 0.9** = higher quality bar, more iterations
- **min_new_info_ratio: 0.05** = tolerate more diminishing returns before stopping

### Expected Output Structure

```
docs/research/{YYYY-MM-DD}-{slug}/
+-- README.md                    # Index + TL;DR
+-- 00-query-original.md         # Original question + context
+-- 01-deep-research-prompt.md   # Generated research prompt
+-- 02-research-report.md        # Complete findings + Coverage Evaluation Summary
+-- 03-implementation.md         # Code examples + recommendations
```

### Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| Skill asks 3 questions instead of 0-1 | `auto_clarification` section missing or malformed | Verify SKILL.md YAML block is valid |
| Single search wave (no iteration) | `prompts/evaluate.md` missing | Restore file from skill directory |
| No query decomposition | `prompts/decompose.md` missing | Restore file from skill directory |
| config.yaml parse error in logs | Invalid YAML syntax | Validate YAML (check indentation, colons) |
| Sources marked [TRUNCATED] | Source exceeded `source_content_max` budget | Normal behavior; increase budget if needed |

---

## Configuration Reference

### config.yaml

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `tokens.decomposition_output` | int | 500 | Max tokens for Phase 1.5 decomposition output |
| `tokens.source_content_max` | int | 1000 | Max tokens per source; hard truncation with [TRUNCATED] marker |
| `tokens.synthesis_input_max` | int | 5000 | Max total tokens fed to Phase 4 synthesis; lowest-priority sources dropped |
| `tokens.final_report_max` | int | 2000 | Soft limit for final report output (via prompt instruction) |
| `iteration.max_iterations` | int | 3 | Hard cap on search waves; FORCE STOP at this count |
| `iteration.coverage_threshold` | float | 0.8 | Stop when coverage_score >= threshold * 100 |
| `iteration.min_new_info_ratio` | float | 0.1 | Stop when new_info_ratio < this value (2nd+ iteration only) |

All values have built-in defaults in SKILL.md. If config.yaml is missing or fails to parse, defaults are used automatically.

---

## Metrics: v1 vs v2

### v1 Baseline (measured, Story 0.1)

| Query | Type | Tokens | Time | Cost (Sonnet) | Quality |
|-------|------|--------|------|---------------|---------|
| Q1: "o que e RAG?" | Simple | 70,944 | 3m 38s | $0.21 | 4/5 |
| Q2: "rate limiting Node.js" | Technical | 67,012 | 2m 59s | $0.20 | 4/5 |
| Q4: "deep research LLMs" | Deep | 88,543 | 4m 40s | $0.27 | 5/5 |
| **Average** | - | **75,500** | **3m 46s** | **$0.40*** | **4.3/5** |

*Cost recalculated with 80/20 input/output split

### v2 Feature-by-Feature Impact (expected)

| Metric | v1 Baseline | v2 Feature | Expected Impact | Status |
|--------|-------------|------------|-----------------|--------|
| Questions asked | 3 (always) | Auto-clarification | 0-1 questions | Implemented |
| Search approach | Sequential | Parallel dispatch | -50% time | Implemented |
| Cost control | None | Token budgets | Predictable cost | Implemented |
| Search depth | Single wave | Iteration loop | Adaptive depth | Implemented |
| Config | Hardcoded | config.yaml | Tunable | Implemented |
| Average cost | $0.40 | Target: $0.20 | -50% | Needs validation |
| Average time | 3m 46s | Target: 1m 53s | -50% | Needs validation |
| Quality | 4.3/5 | Target: >=3.9/5 | >=90% maintained | Needs validation |

**Note:** Quantitative v2 metrics (cost, time, quality) are projections based on implemented features. Actual measurements require a validation run with the 5 baseline queries.

### What Was Validated vs What Needs Manual Validation

**Validated (implemented and verified):**
- Auto-clarification: pattern matching and technology detection working
- Query decomposition: decompose.md produces 3-7 sub-queries
- Parallel search: WebSearch calls dispatched simultaneously
- Stopping criteria: coverage evaluation loop with configurable thresholds
- Token budgets: config.yaml loaded and enforced across all phases

**Needs manual validation run:**
- Average cost reduction >= 50% (requires executing 5 test queries)
- Average time reduction >= 50% (requires timed execution)
- Quality maintained >= 90% of baseline (requires subjective evaluation)

---

## Backward Compatibility

Every v3 feature has an explicit fallback to v2 behavior:

| Feature | Fallback | Trigger |
|---------|----------|---------|
| ETL for blogs | WebFetch (v2 behavior) | ETL service unavailable or fetch-page.js fails with exit code 2-4 |
| Haiku model routing | Main model (v2 behavior) | Task(model: "haiku") not supported or fails |
| Subagent parallelism | Sequential execution (v2 behavior) | Task tool dispatch fails for any subagent |
| ETL for YouTube | No fallback (ETL has 100% success rate) | Should not fail |

---

## Changelog

### v3.1 (2026-02-08) - Wave Memory Compression

| Change | Description |
|--------|-------------|
| Phase 3.6: Wave Compression | New phase compresses wave results via Haiku into ~400 token summaries saved to wave-N-summary.md. Reduces context accumulation by ~92% across waves. |
| Phase 3 step 4: Load wave context | Wave 2+ reads previous wave summaries instead of carrying raw results. Focuses new queries on gaps from last summary. |
| Phase 4: Reads summaries | Synthesis now reads wave-*-summary.md files instead of raw results. Falls back to raw results if no summaries exist (backward compat). |
| Flow diagram updated | Shows Phase 3.6 compress step and summary file flow between waves and synthesis. |
| Executor matrix updated | Wave Compression registered as AGENT (HAIKU) operation. |

Architecture doc: `docs/research/2026-02-08-open-source-deep-research-multi-agent/04-wave-memory-compression.md`

### v3.0 (2026-02-08) - Story 3.1: Execution Optimization

| Change | Description | AC |
|--------|-------------|-----|
| ETL-first blog extraction | ETL fetch-page CLI is now PRIMARY for blog URLs (dev.to, medium.com, marktechpost.com, hashnode.dev, hackernoon.com, freecodecamp.org/news). WebFetch is FALLBACK 2. | AC1 |
| Haiku model routing | Phases 3, 3.2, 3.5 now use Task(model: "haiku") for search parsing, page extraction, and coverage evaluation. Phases 1.5, 4, 4.5, 5 remain on Main model. | AC2 |
| Subagent parallelism | Phase 3 rewritten to Orchestrator-Worker pattern. Each sub-query dispatched as parallel Task(model: "haiku"). Main model only aggregates and synthesizes. | AC3 |
| Executor matrix updated | Model Tier classification added (HAIKU vs MAIN). AGENT operations split by model tier. | AC4 |
| Tool strategy updated | Content extraction fallback chain updated: ETL first for blogs, Exa crawling second, WebFetch last. Subagent tool access section added. | AC5 |
| Flow diagram | Updated to show Orchestrator-Worker pattern with Haiku agents and model tier labels. | AC4 |

### v2.0 (2026-02-07) - Epic TECH-RESEARCH-001

| Story | Change | Sprint |
|-------|--------|--------|
| 0.1 | Baseline v1 measurement (3 queries, documented metrics) | Sprint 0 |
| 0.2 | Technical spike (model routing viability, parallel search) | Sprint 0 |
| 1.1 | Phase 0: Auto-clarification (pattern matching + tech detection) | Sprint 1 |
| 1.2 | Phase 1.5: Query decomposition + prompts/decompose.md | Sprint 1 |
| 1.3 | Phase 3 rewrite: Parallel search, fallback, dedup, truncation | Sprint 1 |
| 2.1 | Phase 3.5: Coverage evaluation loop + prompts/evaluate.md | Sprint 2 |
| 2.2 | config.yaml: Token budgets + iteration params, config loading | Sprint 2 |
| 2.3 | Consolidation: SKILL.md cleanup, README, epic DoD update | Sprint 2 |

### v1.0 (2026-02-06) - Original

- 5-phase pipeline: Clarify -> Generate Prompt -> Search -> Synthesize -> Document
- 3 fixed clarification questions
- Sequential search, no stopping criteria
- No configuration file

---

## References

- **Epic:** `docs/projects/aios-skills/epics/tech-research-v2/epic.md`
- **Baseline Report:** `docs/research/tech-research-v1-baseline.md`
- **Spike Report:** `docs/research/tech-research-v2-spike.md`
- **Skill Definition:** `.claude/skills/tech-research/SKILL.md`
