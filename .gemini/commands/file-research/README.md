# File Research Squad

**Self-contained file discovery and research pipeline for diverse file types.**

## Overview

The File Research Squad specializes in finding and researching files on the internet - PDFs, EPUBs, academic papers, ebooks, documents, and more.

**Architecture:** Adapted from `tech-search` skill with 6-phase pipeline and parallel Haiku workers.

**Zero external dependencies** - Works with native Claude Code tools, optional MCP enhancement.

## Quick Start

```bash
# Activate the squad
@file-hunter

# Execute file search
*search-files "machine learning research papers 2024"

# Or use the complete workflow
*workflow wf-file-research
```

## What This Squad Does

✅ **Discovers files** - PDFs, EPUBs, DOCs, academic papers, ebooks, research documents
✅ **Validates sources** - Checks link accessibility and credibility
✅ **Extracts metadata** - File size, format, author, publication date, source credibility
✅ **Parallel search** - Up to 5 Haiku workers for fast coverage
✅ **Quality assessment** - Ranks sources by credibility and relevance
✅ **Documentation** - Saves complete research to `docs/file-research/`

## What This Squad Does NOT Do

❌ Download files automatically (only provides links)
❌ Parse/read file contents
❌ Convert file formats
❌ Implement code or production artifacts
❌ Write outside `docs/file-research/` directory

## File Types Supported

### Documents
- PDF, EPUB, MOBI, AZW3, DOC, DOCX

### Academic
- PDF, TEX, BIB, arXiv papers

### Ebooks
- EPUB, MOBI, AZW, AZW3, FB2

### Other
- TXT, MD, HTML

## Pipeline Architecture

```
Query → Auto-Clarify → Decompose (MAIN MODEL)
                            |
        [Sub-query 1]  [Sub-query 2]  ... [Sub-query 5]
             |              |                   |
        [Haiku Worker] [Haiku Worker]    [Haiku Worker]
        (search+scrape) (search+scrape)  (search+scrape)
             |              |                   |
             +--------------+-------------------+
                            |
                      Aggregate Results
                            |
                    Evaluate Coverage (HAIKU)
                            |
                      (coverage OK?) ── NO ──→ [Wave 2, max 2]
                            | YES
                            |
                      Synthesize (MAIN MODEL)
                            |
                      Document (MAIN MODEL)
```

## 6-Phase Workflow

### Phase 1: Auto-Clarify
- Pattern matching on query
- File type detection
- Temporal scope detection (recent/historical)
- Domain inference

### Phase 2: Decompose
- Deep query analysis with extended thinking
- Generate 5-7 orthogonal sub-queries
- Include file type operators (filetype:pdf, filetype:epub)
- Incorporate site restrictions when relevant

### Phase 3: Parallel Search
- Dispatch 5 Haiku workers in parallel
- Each worker: WebSearch → filter by file type → WebFetch metadata → return JSON
- Tool hierarchy: Apify (scraping) → Exa → WebSearch
- Max 3 deep reads per worker

### Phase 4: Evaluate Coverage
- Calculate coverage score (0-100)
- Assess source quality (HIGH/MEDIUM/LOW credibility)
- Decide: CONTINUE (wave 2) or STOP
- Max 2 waves total

### Phase 5: Synthesize
- Consolidate all findings
- Rank sources by credibility and relevance
- Identify best sources for each sub-topic
- Generate recommendations

### Phase 6: Document
- Save to `docs/file-research/{YYYY-MM-DD}-{slug}/`
- Complete research report
- Download links organized by category
- Metadata tables (size, format, source, credibility)

## MCP Integration

### Preferred Tools (via Docker)

| MCP | Use Case |
|-----|----------|
| **Apify** | Web scraping for file discovery, specialized file scrapers |
| **Exa** | Enhanced web search with better file indexing |

### Fallback Tools (Always Available)

- `WebSearch` - Native web search
- `WebFetch` - Page content extraction
- `Task` - Parallel Haiku workers

## Output Structure

```
docs/file-research/{YYYY-MM-DD}-{slug}/
├── README.md                    # Index + TL;DR
├── 00-query-original.md         # Original query + context
├── 01-search-strategy.md        # Generated sub-queries + operators
├── 02-research-report.md        # Complete findings
├── 03-file-catalog.md           # Organized file links with metadata
└── 04-recommendations.md        # Best sources + next steps
```

## Security & Scope

### ✅ Allowed
- Read/write in `docs/file-research/` only
- WebSearch, WebFetch, Task tool usage
- MCP tool usage (Apify, Exa)

### ❌ Forbidden
- Writing outside `docs/file-research/`
- Downloading files automatically
- Creating agents, skills, or production code
- Modifying framework files

## Example Queries

```
"React hooks best practices PDF 2024"
"machine learning research papers EPUB"
"UX design books MOBI"
"academic papers on quantum computing arXiv"
"Python programming ebooks free download"
"data science cheat sheets PDF"
```

## Agent

- **file-hunter** - Main research agent executing the 6-phase pipeline

## Tasks

- **search-files** - Execute complete file search pipeline
- **validate-sources** - Validate link accessibility and credibility
- **extract-metadata** - Extract file metadata (size, format, author, date)

## Workflows

- **wf-file-research** - Complete 6-phase file research workflow

## Checklists

- **file-quality-checklist** - Quality validation for research outputs

## Data Files

- **file-search-operators** - Specialized search operators by file type

## Configuration

See `config.yaml` for complete configuration options.

**Max workers:** 5 parallel Haiku workers
**Max waves:** 2 search iterations
**Worker model:** Haiku (cost-efficient)
**Output directory:** `docs/file-research/`

## Related Resources

- **Based on:** `tech-search` skill (`.aios/skills/tech-search/`)
- **Similar squads:** N/A (first file-focused research squad)

## Version

**v1.0.0** - Initial release (2026-02-14)

---

**Created by:** aios-master
**License:** MIT
**Status:** ⚠️ Pending validation (@architect, @squad-creator, @qa)
