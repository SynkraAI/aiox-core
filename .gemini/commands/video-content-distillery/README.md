# Content Distillery Squad

> Transform long YouTube livestreams into structured frameworks, heuristics, mental models, and multi-platform content pieces.

**Version:** 1.0.0
**Author:** jose-amorim
**Category:** Content Extraction & Repurposing
**Target Users:** Jose & David

---

## Overview

Content Distillery is a 9-agent squad that processes YouTube livestreams (1-4 hours) through a multi-phase pipeline:

1. **Ingest** — Download video, generate transcript
2. **Extract** — Pull tacit knowledge, frameworks, heuristics, mental models
3. **Distill** — Progressive summarization (5 layers), PARA classification
4. **Multiply** — 4A Framework angles, format variations, idea scoring
5. **Produce** — Platform-specific content, ecosystem calendar, batch production
6. **Optimize** — YouTube-specific optimization (titles, thumbnails, tags)

One livestream in, 60+ content pieces out.

---

## Quick Start

### Full Pipeline (one command)
```
@content-distillery:distillery-chief *distill https://youtube.com/watch?v=VIDEO_ID
```

### Framework Extraction Only
```
@content-distillery:distillery-chief *extract https://youtube.com/watch?v=VIDEO_ID
```

### Content Derivation from Existing Frameworks
```
@content-distillery:distillery-chief *derive outputs/distillery/SLUG/frameworks.yaml
```

### Cross-Reference Frameworks
```
@content-distillery:distillery-chief *compare outputs/distillery/SLUG_A/ outputs/distillery/SLUG_B/
```

### Check Status
```
@content-distillery:distillery-chief *status
```

---

## Agents (9)

### Orchestrator
| Agent | Role | Based On |
|-------|------|----------|
| **distillery-chief** | Routes requests, manages pipeline, enforces quality gates | Squad-specific orchestrator |

### Tier 0 — Diagnostic
| Agent | Role | Based On |
|-------|------|----------|
| **tacit-extractor** | Extracts tacit knowledge using NDM/RPD methodology | Cedric Chin |
| **model-identifier** | Identifies mental models, frameworks, heuristics from 30+ known models | Shane Parrish |

### Tier 1 — Masters
| Agent | Role | Based On |
|-------|------|----------|
| **knowledge-architect** | Progressive Summarization, PARA, C.O.D.E. framework | Tiago Forte |
| **content-atomizer** | Reverse Pyramid, 64-piece methodology, platform formatting | Gary Vaynerchuk |

### Tier 2 — Systematizers
| Agent | Role | Based On |
|-------|------|----------|
| **idea-multiplier** | 4A Framework, Endless Idea Generator, FOR WHO / SO THAT | Nicolas Cole & Dickie Bush |
| **ecosystem-designer** | Content Map, 2-Hour Content Ecosystem | Dan Koe |
| **production-ops** | Content OS, 730-Day Library, batch production | Justin Welsh |

### Tier 3 — Specialist
| Agent | Role | Based On |
|-------|------|----------|
| **youtube-strategist** | CCN Rule, Clickbait Theory, Format-First Thinking | Paddy Galloway |

---

## Workflows (3)

| Workflow | Phases | Description |
|----------|--------|-------------|
| **full-distillery-pipeline** | 6 | Complete end-to-end: ingest → extract → distill → multiply → produce → optimize |
| **framework-extraction** | 3 | Extraction-only: ingest → extract → cross-reference. Includes comparison mode |
| **content-derivation** | 3 | Content-only: load frameworks → multiply → produce. Includes batch mode |

---

## Tasks (12)

| # | Task | Executor | Description |
|---|------|----------|-------------|
| 1 | **ingest-youtube** | etl-tools | Download video, generate transcript, extract metadata |
| 2 | **extract-tacit-knowledge** | tacit-extractor | Extract relational/somatic/collective knowledge fragments |
| 3 | **identify-frameworks** | model-identifier | Identify mental models, classify frameworks, extract heuristics |
| 4 | **progressive-summarize** | knowledge-architect | 5-layer compression, PARA classification, intermediate packets |
| 5 | **build-knowledge-base** | knowledge-architect | Create/update searchable KB with cross-references |
| 6 | **multiply-ideas** | idea-multiplier | 4A angles, format variations, scoring, calendar |
| 7 | **atomize-content** | content-atomizer | Reverse Pyramid atomization into platform-specific pieces |
| 8 | **design-ecosystem** | ecosystem-designer | Content Map, distribution calendar, ecosystem design |
| 9 | **produce-batch** | production-ops | Template application, final copy, QA, batch production |
| 10 | **optimize-youtube** | youtube-strategist | CCN analysis, titles, thumbnails, tags, descriptions |
| 11 | **distill-single-live** | distillery-chief | One-command full pipeline orchestration |
| 12 | **cross-reference-frameworks** | model-identifier | Compare frameworks across multiple sources |

---

## Templates (3)

| Template | Purpose |
|----------|---------|
| **framework-template.md** | Document extracted frameworks with metadata, components, rules, heuristics |
| **distillation-report.md** | Complete distillation output report with metrics |
| **content-piece-template.md** | Platform-specific content piece with hook, body, CTA |

---

## Checklists (2)

| Checklist | Purpose |
|-----------|---------|
| **distillation-quality.md** | QG-001 through QG-005 validation gates |
| **squad-checklist.md** | Complete squad structure and quality validation |

---

## Quality Gates

| Gate | Name | Type | Blocks? |
|------|------|------|---------|
| QG-001 | Transcription Valid | Routing | Yes |
| QG-002 | Extraction Complete | Blocking | Yes |
| QG-003 | Distillation Validated | Blocking | Yes |
| QG-004 | Content Reviewed | Blocking | Yes |
| QG-005 | YouTube Ready | Advisory | No |

---

## Directory Structure

```
squads/content-distillery/
├── README.md                           # This file
├── config.yaml                         # Squad configuration
├── agents/
│   ├── distillery-chief.md             # Orchestrator
│   ├── tacit-extractor.md              # Tier 0 - Cedric Chin
│   ├── model-identifier.md             # Tier 0 - Shane Parrish
│   ├── knowledge-architect.md          # Tier 1 - Tiago Forte
│   ├── content-atomizer.md             # Tier 1 - Gary Vaynerchuk
│   ├── idea-multiplier.md              # Tier 2 - Cole & Bush
│   ├── ecosystem-designer.md           # Tier 2 - Dan Koe
│   ├── production-ops.md               # Tier 2 - Justin Welsh
│   └── youtube-strategist.md           # Tier 3 - Paddy Galloway
├── workflows/
│   ├── full-distillery-pipeline.md     # 6-phase end-to-end
│   ├── framework-extraction.md         # 3-phase extraction
│   └── content-derivation.md           # 3-phase derivation
├── tasks/
│   ├── ingest-youtube.md
│   ├── extract-tacit-knowledge.md
│   ├── identify-frameworks.md
│   ├── progressive-summarize.md
│   ├── build-knowledge-base.md
│   ├── multiply-ideas.md
│   ├── atomize-content.md
│   ├── design-ecosystem.md
│   ├── produce-batch.md
│   ├── optimize-youtube.md
│   ├── distill-single-live.md
│   └── cross-reference-frameworks.md
├── templates/
│   ├── framework-template.md
│   ├── distillation-report.md
│   └── content-piece-template.md
├── checklists/
│   ├── distillation-quality.md
│   └── squad-checklist.md
├── data/
│   └── content-distillery-kb.md
└── docs/
```

---

## Dependencies

### External Packs
- **etl-data-collector** — YouTube download + transcription
- **transcription-pro** — Audio transcription pipeline

### Tools
- **youtube-transcript** — YouTube captions API
- **whisper** — OpenAI Whisper for transcription
- **ffmpeg** — Audio processing

---

## Usage Examples

### Example 1: Process a Business Livestream
```
@content-distillery:distillery-chief *distill https://youtube.com/watch?v=abc123

# Pipeline runs automatically:
# 1. Downloads video + transcript
# 2. Extracts 5-8 frameworks + 10-15 heuristics
# 3. Creates 5-layer progressive summary
# 4. Generates 80+ content ideas (scored)
# 5. Produces 60+ platform-ready pieces
# 6. Creates 4-week content calendar
```

### Example 2: Extract Frameworks Only
```
@content-distillery:distillery-chief *extract https://youtube.com/watch?v=def456

# Lighter pipeline:
# 1. Downloads video + transcript
# 2. Extracts frameworks, heuristics, mental models
# 3. Updates knowledge base
# 4. No content derivation
```

### Example 3: Compare Two Sources
```
@content-distillery:distillery-chief *compare outputs/distillery/hormozi-live/ outputs/distillery/codie-live/

# Cross-reference mode:
# 1. Loads frameworks from both sources
# 2. Builds comparison matrix
# 3. Identifies reinforcements, contradictions, complements
# 4. Generates meta-frameworks
```

### Example 4: Derive Content from Existing Frameworks
```
@content-distillery:distillery-chief *derive outputs/distillery/hormozi-live/frameworks.yaml

# Content-only pipeline:
# 1. Loads existing frameworks
# 2. Applies 4A Framework (80+ ideas)
# 3. Atomizes into platform pieces
# 4. Builds calendar
# 5. Batch produces
```

---

## Research Foundation

This squad is built on research from 8 elite minds with documented, proven frameworks:

| Mind | Domain | Key Framework |
|------|--------|---------------|
| Cedric Chin | Tacit Knowledge | RPD Model, 3 Kinds of Tacit Knowledge |
| Shane Parrish | Mental Models | Farnam Street Model Library (100+) |
| Tiago Forte | Knowledge Management | BASB, Progressive Summarization, PARA |
| Gary Vaynerchuk | Content Repurposing | Reverse Pyramid, 64-Piece Rule |
| Nicolas Cole & Dickie Bush | Content Strategy | 4A Framework, Endless Idea Generator |
| Dan Koe | Content Ecosystem | Content Map, 2-Hour Ecosystem |
| Justin Welsh | Content Production | Content OS, 730-Day Library |
| Paddy Galloway | YouTube Strategy | CCN Rule, Clickbait Theory |

---

_Content Distillery Squad v1.0.0_
_Created: 2026-02-12_
