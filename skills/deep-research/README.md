# Deep Research v1.0 - General-Purpose Deep Research Pipeline

**Version:** 1.0
**Last Updated:** 2026-03-08
**Skill Path:** `skills/deep-research/`
**Based on:** tech-search v3.1 architecture

---

## Overview

Deep Research is an AIOS skill that transforms any research question into structured, documented findings with actionable recommendations. Unlike tech-search (which focuses exclusively on technical topics), deep-research handles **any domain**: market analysis, people/biographies, books, strategy, competitive intelligence, industry ecosystems, and more.

### Relationship to tech-search

| Aspect | tech-search | deep-research |
|--------|-------------|---------------|
| **Scope** | Technical topics only | Any topic/domain |
| **Decomposition** | Tech-focused (implementation, best practices, code) | General (evidence, perspectives, applications) |
| **Coverage dimensions** | Fundamentals, Implementation, Comparison, Best Practices, Real-World, Current State | Fundamentals, Evidence & Data, Perspectives, Applications, Trends, Risks & Gaps |
| **Auto-detection** | Technology + library detection | Research type detection (market, people, books, strategy, etc.) |
| **Source priority** | Official docs, GitHub, Stack Overflow | Domain-specific (industry reports, expert interviews, books, etc.) |
| **Architecture** | Orchestrator-Worker (Haiku subagents) | Same |
| **Pipeline phases** | Same 6-phase pipeline | Same |

**Rule of thumb:** If the query involves code, APIs, frameworks, or technical implementation -> use `tech-search`. For everything else -> use `deep-research`.

### Key Features

- **Research Type Auto-Detection**: Identifies market, people, books, strategy, competitive, industry, or cultural research
- **Query Decomposition**: Breaks query into 5-7 atomic, searchable sub-queries tailored to research type
- **Parallel Search**: Dispatches all sub-queries via Haiku subagents in a single round-trip
- **Bilingual Search**: Mixes Portuguese and English queries for broader coverage
- **Coverage Evaluation Loop**: Iterates search waves until coverage >= 80% or diminishing returns
- **Citation Verification**: Verifies all claims against collected sources
- **Token Budgets**: Configurable limits for each phase to control cost

---

## Architecture

### Pipeline Phases (Orchestrator-Worker)

```
Query received
    |
    v
[Phase -1: Load Config]
    |
    v
[Phase 0: Auto-Detect Research Type] (MAIN MODEL, inline)
    |
    +- Detects research type via keywords
    +- Infers context (geographic scope, language, temporal)
    |
    v
[Phase 1.5: Decompose] (MAIN MODEL, ultrathink)
    |
    +- Produces 5-7 sub-queries per research type
    |
    v
[Phase 2: Generate Research Prompt] (MAIN MODEL)
    |
    +- Uses research-prompt-template.md with type-specific extensions
    |
    v
+-----------------------------------------------------------+
|  ORCHESTRATOR-WORKER LOOP (max 3 waves)                   |
|                                                           |
|  [Phase 3: Dispatch Subagents] (HAIKU workers)            |
|      +- Each sub-query -> Task(model: "haiku")            |
|      +- All dispatched in single message (parallel)       |
|      +- Workers: search + deep read + score               |
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
|      +- plateau detected?   -> FORCE STOP (delta < 3%)    |
|      +- timeout > 600s?     -> FORCE STOP                 |
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
[Phase 4: Synthesize] (MAIN MODEL) <- reads wave-*-summary.md
    |
    +-- Quality Gate V4: >= 500 tokens, >= 3 sources, no empty sections
    |
    v
[Phase 4.5: Verify Citations] (MAIN MODEL)
    |
    +-- Veto V4.5: integrity_score < 60% -> HALT
    |
    v
[Phase 5: Document] (MAIN MODEL) -> docs/research/{date}-{slug}/
```

### Model Routing

| Phase | Model | Why |
|-------|-------|-----|
| 0, 1.5, 2 | Main (Opus/Sonnet) | Planning requires deep reasoning |
| 3, 3.2, 3.5, 3.6 | Haiku (via Task tool) | Search parsing, evaluation, compression |
| 4, 4.5, 5 | Main (Opus/Sonnet) | Synthesis requires judgment and creativity |

### Cost Expectations

| Model | Phases | Estimated Tokens | Cost |
|-------|--------|-----------------|------|
| Main (Opus/Sonnet) | 0, 1.5, 2, 4, 4.5, 5 | ~25,000 | ~$0.75 |
| Haiku | 3, 3.2, 3.5, 3.6 (x5-7 workers) | ~35,000 | ~$0.04 |
| **Total per research** | All | ~60,000 | **~$0.08-$0.15** |

---

## File Structure

```
skills/deep-research/
+-- README.md                     # This file
+-- config.yaml                   # Token budgets, iteration params, type detection keywords
+-- checkpoints.yaml              # Veto conditions and quality gates per phase
+-- prompts/
|   +-- decompose.md              # Query decomposition prompt (Phase 1.5)
|   +-- evaluate.md               # Coverage evaluation prompt (Phase 3.5)
|   +-- verify-citations.md       # Citation integrity verification (Phase 4.5)
|   +-- tool-strategy.md          # Tool hierarchy + fallback chains
|   +-- executor-matrix.md        # Worker vs Agent + Model Tier classification
+-- templates/
    +-- research-prompt-template.md  # Research prompt template (Phase 2)
    +-- output-structure.md          # Output format reference
```

---

## Quick Start

```
/deep-research "mercado de mentorias digitais no Brasil"
```

The skill will:
1. Auto-detect research type (market) and scope (Brazil)
2. Decompose into type-specific sub-queries (market size, players, pricing, trends)
3. Search all sub-queries in parallel (bilingual: PT-BR + EN)
4. Evaluate coverage, iterate if needed
5. Synthesize findings into structured report
6. Save to `docs/research/2026-03-08-mentorias-digitais-brasil/`

---

## Usage Guide

### Basic Usage

```
/deep-research "your research question here"
```

The skill accepts any research question in Portuguese or English.

### Research Types

| Type | Auto-detected when query contains | Example |
|------|-----------------------------------|---------|
| **market** | mercado, market, TAM, oportunidade | "tamanho do mercado de EdTech no Brasil" |
| **people** | quem, expert, especialista, fundador | "quem e Alex Hormozi e qual seu metodo" |
| **books** | livro, book, leitura, bibliografia | "melhores livros sobre storytelling" |
| **strategy** | estrategia, positioning, GTM | "como criar esteira de produtos digitais" |
| **product** | produto, MVP, product-market fit | "como validar uma ideia de SaaS" |
| **competitive** | concorrente, competitor, benchmark | "analise competitiva Hotmart vs Eduzz" |
| **industry** | industria, setor, ecossistema | "ecossistema de infoprodutos no Brasil" |
| **cultural** | cultura, tendencia, comportamento | "tendencias de consumo da geracao Z" |
| **academic** | paper, estudo, pesquisa academica | "estudos sobre aprendizagem espacada" |
| **regulatory** | lei, regulacao, compliance, LGPD | "regulamentacao de IA no Brasil" |
| **general** | (default if no type detected) | "impacto da IA na educacao" |

### Coverage Dimensions

| Dimension | Weight | What it covers |
|-----------|--------|----------------|
| Fundamentals | 20 pts | Core concepts, definitions, context |
| Evidence & Data | 25 pts | Statistics, studies, documented results |
| Perspectives | 15 pts | Expert opinions, multiple viewpoints, debates |
| Applications | 20 pts | Real-world examples, case studies, frameworks |
| Trends | 10 pts | Current state, emerging patterns |
| Risks & Gaps | 10 pts | Limitations, challenges, criticisms |

Weights are adjusted per research type (e.g., market research boosts Evidence +5, Trends +5).

### Expected Output Structure

```
docs/research/{YYYY-MM-DD}-{slug}/
+-- README.md                    # Index + TL;DR
+-- 00-query-original.md         # Original question + context
+-- 01-deep-research-prompt.md   # Generated research prompt
+-- 02-research-report.md        # Complete findings
+-- 03-recommendations.md        # Recommendations + next steps
```

---

## Configuration Reference

### config.yaml

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `tokens.decomposition_output` | int | 500 | Max tokens for Phase 1.5 decomposition output |
| `tokens.source_content_max` | int | 1200 | Max tokens per source; hard truncation |
| `tokens.synthesis_input_max` | int | 6000 | Max total tokens fed to Phase 4 synthesis |
| `tokens.final_report_max` | int | 3000 | Soft limit for final report output |
| `iteration.max_iterations` | int | 3 | Hard cap on search waves |
| `iteration.coverage_threshold` | float | 0.8 | Stop when coverage >= threshold |
| `iteration.min_new_info_ratio` | float | 0.1 | Stop when new info < this value |

### Tuning

- **Faster, cheaper**: Reduce `max_iterations` to 1, lower `source_content_max`
- **More thorough**: Increase `coverage_threshold` to 0.9, increase `synthesis_input_max`
- **Bilingual**: Default behavior; queries auto-mix PT-BR and EN

---

## Backward Compatibility

| Feature | Fallback | Trigger |
|---------|----------|---------|
| ETL for blogs | WebFetch | ETL service unavailable |
| Haiku model routing | Main model | Task(model: "haiku") fails |
| Subagent parallelism | Sequential execution | Task dispatch fails |
| Exa search | WebSearch native | Exa MCP unavailable |

---

## Absorbed: create-deep-research-prompt task

This skill absorbs the functionality of `.aiox-core/development/tasks/create-deep-research-prompt.md`:
- **Phase 0** handles research type selection (previously manual in the task)
- **Phase 2** generates the structured research prompt (previously the task's only output)
- **Phases 3-5** execute the research (previously not covered by the task)

The old task remains as reference but is superseded by this skill for all practical purposes.

---

## Changelog

### v1.1 (2026-03-08) - Audit Fixes (@oalanicolas + @pedro-valerio)

| Change | Description | Auditor |
|--------|-------------|---------|
| Veto conditions | Added checkpoints.yaml with blocking veto conditions for all 6 phases | @pedro-valerio |
| Quality gate Phase 4 | Synthesis must have >= 500 tokens, >= 3 sources, no empty sections | @pedro-valerio |
| Citation blocking | integrity_score < 60% now HALTS pipeline (was only warning) | @pedro-valerio |
| Plateau detection | FORCE STOP when coverage_delta < 3% between waves | @pedro-valerio |
| Timeout protection | 600s absolute pipeline timeout | @pedro-valerio |
| Query exhaustion | FORCE STOP when gap-filling queries return no new results | @pedro-valerio |
| Decompose reconceptualized | WHO/WHAT/HOW/WHY/WHERE/RISK framework (was copy of tech-search) | @oalanicolas |
| Decision tree | Handles ambiguous, multi-type, negative, and temporal queries | @oalanicolas |
| Type-specific blueprints | Operational query templates with site: operators per type | @oalanicolas |
| Source credibility matrices | Per-type multiplier tables with query templates and regional variants | @oalanicolas |
| New types | Added academic and regulatory research types | @oalanicolas |
| Disambiguation | Priority order + multi_match_threshold for ambiguous queries | @oalanicolas |
| Fallback hardening | ETL exit code 5+ handling, Exa quota handling, graceful degradation | @pedro-valerio |
| Evidence hierarchy | Queries now prioritize hard data > studies > opinions > anecdotes | @oalanicolas |

### v1.0 (2026-03-08) - Initial Release

| Change | Description |
|--------|-------------|
| Full pipeline | 6-phase Orchestrator-Worker pipeline adapted from tech-search v3.1 |
| General-purpose | Supports market, people, books, strategy, competitive, industry, cultural research |
| Bilingual search | Auto-mixes Portuguese and English queries |
| Type-specific dimensions | Coverage weights adjust per research type |
| Absorbed task | Integrates create-deep-research-prompt functionality |

---

## References

- **Based on:** `skills/tech-search/` (architecture, pipeline design)
- **Absorbed:** `.aiox-core/development/tasks/create-deep-research-prompt.md`
- **Output location:** `docs/research/{date}-{slug}/`
