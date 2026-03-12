# Knowledge Base Builder Squad

Transform complete libraries of course materials into structured knowledge bases and interactive learning applications.

---

## Overview

The Knowledge Base Builder squad processes multi-format educational content (PDFs, video transcripts, documents, slides) and produces:

1. **Structured Knowledge Base** -- Concepts, definitions, relationships, and taxonomy with full source traceability
2. **Next.js Web App** -- Interactive application with search, graph view, progress tracking, quizzes
3. **Obsidian Vault** -- Local knowledge vault with wikilinks, graph view, and Dataview dashboards

Every concept in the knowledge base links back to its exact source: page number in a PDF, timestamp in a video transcript, or slide number in a presentation.

---

## Quick Start

```
1. Activate: @kb-chief (or @knowledge-builder)
2. Provide materials path: *ingest /path/to/course-materials/
3. Review Phase 1 knowledge base
4. Approve Phase 2: *app
5. Receive: Next.js app + Obsidian vault
```

**Activation Aliases:**
- `@kb-chief` (primary)
- `@knowledge-builder` (alias)

---

## Architecture

```
         [KB Chief] (Orchestrator)
              |
     Phase 1: Knowledge Base
     -------------------------
     [Doc Parser]          Tier 0: Processing
     [Content Analyzer]    Tier 0: Processing
              |
     [Concept Extractor]   Tier 1: Extraction
     [Taxonomy Architect]  Tier 1: Organization
     [Knowledge Linker]    Tier 1: Linking
              |
     === USER VALIDATION GATE ===
              |
     Phase 2: Applications
     -------------------------
     [App Architect]       Tier 2: Product (Next.js + Obsidian)
     [Quality Validator]   Tier 2: QA
```

---

## Agents (8)

| Agent | Tier | Role |
|-------|------|------|
| **kb-chief** | Orchestrator | Pipeline coordination, phase gate management |
| **doc-parser** | Tier 0 | Multi-format document processing (PDF, DOCX, SRT, VTT, PPTX) |
| **content-analyzer** | Tier 0 | Content structure analysis, topic segmentation |
| **concept-extractor** | Tier 1 | Concept, definition, and relationship extraction |
| **taxonomy-architect** | Tier 1 | Hierarchy design, tag system, navigation paths |
| **knowledge-linker** | Tier 1 | Source traceability, cross-references, citations |
| **app-architect** | Tier 2 | Dual-stack app generation (Next.js + Obsidian) |
| **quality-validator** | Tier 2 | Quality assurance with 34-point validation checklist |

---

## Workflows (4)

| Workflow | Duration | Description |
|----------|----------|-------------|
| **wf-full-pipeline** | 4-8 hours | Complete Phase 1 + Phase 2 pipeline |
| **wf-phase1-knowledge-base** | 2-4 hours | Knowledge base construction only |
| **wf-phase2-app-builder** | 2-4 hours | App generation from existing knowledge base |
| **wf-ingest-materials** | 1-2 hours | Material ingestion and normalization only |

---

## Tasks (10)

| Task | Category | Agent |
|------|----------|-------|
| task-inventory-materials | Ingestion | kb-chief |
| task-parse-documents | Ingestion | doc-parser |
| task-analyze-content | Analysis | content-analyzer |
| task-extract-concepts | Extraction | concept-extractor |
| task-design-taxonomy | Organization | taxonomy-architect |
| task-link-sources | Linking | knowledge-linker |
| task-validate-phase1 | Validation | quality-validator |
| task-generate-nextjs-app | App Gen | app-architect |
| task-generate-obsidian-vault | App Gen | app-architect |
| task-validate-phase2 | Validation | quality-validator |

---

## Supported Input Formats

| Format | Extension | Parser |
|--------|-----------|--------|
| PDF | .pdf | PyMuPDF (fitz) + pdfplumber |
| Word | .docx, .doc | python-docx + tools/document-processing |
| PowerPoint | .pptx | tools/document-processing/pptx |
| Subtitles | .srt, .vtt | subtitle-parser |
| Plain Text | .txt, .md | Direct read |
| Spreadsheet | .xlsx | tools/document-processing/xlsx |
| HTML | .html | BeautifulSoup / MarkItDown |
| Other | .pages, .rtf, .epub | Pandoc conversion |

---

## Output Structure

```
knowledge-base/
  data/                    # Structured JSON (app consumption)
    concepts.json
    taxonomy.json
    graph.json
    sources.json
    search-index.json
  markdown/                # Human-readable Markdown
    concepts/
    topics/
    glossary.md
    index.md
  obsidian-vault/          # Obsidian-ready vault
    Concepts/
    Topics/
    Sources/
    Learning Paths/
    .obsidian/
  raw/                     # Preserved original materials
  app/                     # Next.js application
  reports/                 # Quality and processing reports
```

---

## Quality Gates

| Gate | Phase | Severity | Criteria |
|------|-------|----------|----------|
| QG-INVENTORY | 1 | Info | All files classified |
| QG-PARSE | 1 | Blocking | >= 95% parse success |
| QG-ANALYSIS | 1 | Warning | >= 90% blocks classified |
| QG-EXTRACTION | 1 | Blocking | >= 20 concepts, 90% defined |
| QG-TAXONOMY | 1 | Blocking | 0 orphans, depth 2-5 |
| QG-LINKS | 1 | Blocking | 100% traceability |
| PHASE1-COMPLETE | 1 | Blocking | Score >= 7.0 + user approval |
| PHASE2-COMPLETE | 2 | Blocking | Both stacks pass checks |

---

## Features (Phase 2 App)

| Feature | Next.js | Obsidian |
|---------|---------|----------|
| Advanced Search | Fuse.js fuzzy search + facets | Native search + Dataview |
| Progress Tracking | localStorage + dashboard | Properties + Dataview |
| Graph View | D3.js interactive graph | Native graph view |
| Quizzes | React interactive components | Callout toggles |
| Personal Notes | Per-concept annotations | Direct note editing |
| Learning Paths | Guided sequential UI | MOC notes with checkboxes |
| Export | PDF, MD, JSON | Native Obsidian export |
| Source Linking | Deep links to source pages | Wikilinks to source notes |

---

## Integration with Existing Tools

- **tools/document-processing/** -- DOCX, PPTX, XLSX parsing
- **tools/video-transcriber/** -- Pre-process video content into transcripts

---

## Commands

| Command | Description |
|---------|-------------|
| `*help` | Show capabilities and workflows |
| `*ingest` | Start material ingestion pipeline |
| `*build` | Build knowledge base from processed materials |
| `*validate` | Run quality validation |
| `*app` | Generate interactive applications (Phase 2) |
| `*status` | Show pipeline progress |
| `*inventory` | Display material inventory |
| `*export` | Export knowledge base |

---

## Performance Targets

| Metric | Target |
|--------|--------|
| Material Coverage | >= 95% |
| Concept Accuracy | >= 90% |
| Source Traceability | 100% |
| Taxonomy Depth | 3-4 levels |
| Graph Connectivity | >= 80% |
| Overall Quality | >= 8.0/10 |

---

**Version:** 1.0.0
**Created:** 2026-02-13
**Agents:** 8
**Tasks:** 10
**Workflows:** 4
**Checklists:** 1 (34 checks)
**Templates:** 3
