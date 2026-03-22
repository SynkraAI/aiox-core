## Executor Matrix for Deep Research

Based on tech-search executor matrix, adapted for general-purpose research.

**Principle:** Maximize determinism. Use LLM only when semantic understanding is required.

---

## Operation Classification

### WORKER (Deterministic Code) - 10 operations

| Operation | Implementation | Trigger |
|-----------|----------------|---------|
| **URL Type Detection** | Regex patterns (YouTube, social, news, etc.) | Phase 3 |
| **YouTube VideoId Extraction** | Regex `v=([a-zA-Z0-9_-]{11})` | Phase 3 |
| **Source Credibility Scoring** | Domain pattern matching | Phase 3.5 |
| **URL Deduplication** | Hash set by URL | Phase 3 |
| **Coverage Score Calculation** | Weighted sum of dimensions | Phase 3.5 |
| **New Info Ratio Calculation** | unique_facts / total_facts | Phase 3.5 |
| **Stopping Decision** | If/else with thresholds | Phase 3.5 |
| **Research Type Detection** | Keyword matching from config.yaml | Phase 0 |
| **Date Extraction from URL/Content** | Regex for date patterns | Phase 3.5 |
| **File Path Generation** | String formatting for output dir | Phase 5 |

### AGENT (LLM Required) - 9 operations

| Operation | Why LLM Needed | Phase | Model Tier |
|-----------|----------------|-------|------------|
| **Query Decomposition** | Semantic understanding of research intent | 1.5 | MAIN (ultrathink) |
| **Auto-Clarification** | Pattern detection, research type inference | 0 | MAIN (inline) |
| **Research Prompt Generation** | Structured prompt with context-aware sections | 2 | MAIN |
| **Content Synthesis** | Merging and summarizing multiple diverse sources | 4 | MAIN |
| **Citation Verification** | Checking if claim matches source semantically | 4.5 | MAIN |
| **Gap Analysis** | Identifying missing coverage across dimensions | 3.5 | HAIKU (Task) |
| **Wave Compression** | Summarizing wave results into structured notes | 3.6 | HAIKU (Task) |
| **Relevance Assessment** | Judging if source answers the query | 3.2 | HAIKU (subagent) |
| **Final Report Generation** | Structured writing with insights and recommendations | 5 | MAIN |

### Model Tier Classification

| Tier | Model | When to Use | Cost |
|------|-------|-------------|------|
| **MAIN** | Opus/Sonnet | Deep reasoning, synthesis, final output | $$$ |
| **HAIKU** | Haiku (via Task tool) | Search parsing, extraction, scoring | $ |

**Rule:** If an operation can produce correct output from structured instructions
without deep reasoning, it's HAIKU tier. If it needs judgment, creativity, or
synthesis across diverse sources, it's MAIN tier.

---

## Integration with Pipeline

### Phase 0: Auto-Clarify (MAIN, inline)
```yaml
execution: |
  # WORKER: Research type detection via keyword matching
  1. Match query against config.yaml auto_detection keywords
  2. Assign research_type
  # AGENT: Contextual inference
  3. Infer missing context (geographic scope, temporal scope, language)
```

### Phase 3: Search (HAIKU subagents)
```yaml
execution: |
  # WORKER FIRST (deterministic)
  1. URL type detection -> Classify all URLs
  2. For YouTube URLs -> etl_youtube() (CLI)
  3. credibility scoring -> Score all sources
  # THEN LLM (semantic)
  4. Haiku subagent assesses relevance of each source
  5. Haiku subagent extracts key findings
```

### Phase 3.5: Evaluate Coverage (HAIKU)
```yaml
execution: |
  # WORKER (deterministic)
  1. Calculate coverage scores per dimension
  2. Apply stopping rules
  # LLM (semantic)
  3. IF CONTINUE: Haiku generates targeted gap-filling queries
```

### Phase 3.6: Compress Wave (HAIKU)
```yaml
execution: |
  # AGENT (Haiku)
  1. Summarize wave results into ~400 token structured summary
  2. Save wave-N-summary.md to output dir
  3. Next wave reads summaries, not raw data
```

### Phase 4: Synthesize (MAIN)
```yaml
execution: |
  # AGENT (Main model)
  1. Read all wave-*-summary.md files
  2. Synthesize into coherent research report
  3. Apply research-type-specific report structure
```

### Phase 4.5: Verify Citations (MAIN)
```yaml
execution: |
  # WORKER (deterministic)
  1. Extract claims via patterns (numbers, "X is Y")
  2. Match claims to source URLs (string matching)
  # LLM (semantic)
  3. Main model verifies semantic match between claim and source
```

---

## Cost Expectations

| Model | Phases | Estimated Tokens | Cost |
|-------|--------|-----------------|------|
| Main (Opus/Sonnet) | 0, 1.5, 2, 4, 4.5, 5 | ~25,000 | ~$0.75 |
| Haiku | 3, 3.2, 3.5, 3.6 (x5-7 workers) | ~35,000 | ~$0.04 |
| **Total per research** | All | ~60,000 | **~$0.08-$0.15** |

---

*Executor Matrix v1.0 - Deep Research Skill*
