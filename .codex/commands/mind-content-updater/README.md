# Mind Content Updater Squad

> Automated source discovery, collection, and analysis for MMOS mind cloning.

## Overview

The Mind Content Updater squad automates the tedious research phase of MMOS mind cloning. It discovers all available content for a person across the web, collects it into organized markdown files, performs lightweight pre-analysis, and generates the `sources_master.yaml` inventory that MMOS needs.

## Prerequisites

- AIOS 2.1+ Framework
- `video-transcriber` tool installed (for YouTube content):
  ```bash
  pip install -e tools/video-transcriber/
  brew install ffmpeg yt-dlp
  ```
- Exa MCP available (optional, enhances discovery with semantic search)

## Agent

| Agent | Role | Commands |
|-------|------|----------|
| **Mind Content Updater** | Source Discovery & Collection Specialist | `*discover`, `*collect`, `*analyze`, `*harvest`, `*status`, `*inventory` |

## Usage

### Activate the Agent

```bash
# In Claude Code
@mind-content-updater *help

# Or use slash prefix
/mcu:agents:mind-content-updater
```

### Quick Start - Full Pipeline

```bash
@mind-content-updater *harvest sam_altman
```

This runs the complete pipeline:
1. **Discover** - Finds all available content using Exa + WebSearch
2. **Collect** - Downloads content using WebFetch + video-transcriber
3. **Analyze** - Extracts frameworks, signature phrases, key concepts
4. **Inventory** - Generates `sources_master.yaml`

### Individual Commands

```bash
# Discover sources only
@mind-content-updater *discover sam_altman

# Collect from discovered URLs
@mind-content-updater *collect sam_altman

# Analyze collected content
@mind-content-updater *analyze sam_altman

# Generate/update inventory
@mind-content-updater *inventory sam_altman

# Check collection status
@mind-content-updater *status sam_altman
```

## Content Types Supported

| Type | Discovery Tool | Collection Tool | Output Path |
|------|---------------|-----------------|-------------|
| Blog posts | Exa + WebSearch | WebFetch | `sources/blogs/{slug}.md` |
| Articles | Exa + WebSearch | WebFetch | `sources/articles/{slug}.md` |
| Interviews | Exa + WebSearch | WebFetch | `sources/interviews/{slug}.md` |
| YouTube videos | WebSearch | video-transcriber | `sources/youtube/{slug}/` |
| Social media | Exa | WebFetch | `sources/social/{slug}.md` |
| Books | WebSearch | Manual (user provides PDF) | `sources/manual/{slug}.pdf` |

## Output Structure

All output goes to the MMOS mind's sources directory:

```
squads/mmos-squad/minds/{mind_slug}/
  sources/
    blogs/
      how-to-be-successful.md
      what-i-wish-someone-told-me.md
    youtube/
      lex-fridman-367-future-of-ai/
        metadata.json
        transcription_clean.md
        chunks/
        source.md
    articles/
      forbes-profile-2024.md
    interviews/
      podcast-interview-transcript.md
    social/
      twitter-thread-on-startups.md
    manual/
      zero-to-one.pdf
    sources_master.yaml
  docs/
    logs/
      {timestamp}-discovery-report.yaml
      {timestamp}-collection-report.yaml
      {timestamp}-analysis-report.yaml
      {timestamp}-frameworks-extracted.yaml
      {timestamp}-signature-phrases.yaml
```

## Tier Classification

| Tier | Label | Description | Examples |
|------|-------|-------------|----------|
| T1 | Authoritative | Primary sources, highest confidence | Books, personal blog, official content |
| T2 | Valuable | High-quality secondary sources | Long interviews, conference talks, guest articles |
| T3 | Supplementary | Supporting sources for triangulation | Social posts, news articles, brief mentions |

## MCP Integration

| Tool | Purpose | Phase |
|------|---------|-------|
| **Exa** (`mcp__exa__web_search_exa`) | Semantic web search for content discovery | Discovery |
| **WebSearch** (built-in) | Targeted URL and platform discovery | Discovery |
| **WebFetch** (built-in) | Extract markdown from web pages | Collection |
| **video-transcriber** (CLI tool) | Download and transcribe YouTube videos | Collection |

## Integration with MMOS

The Mind Content Updater is designed as a companion to the MMOS squad. After updating:

```bash
# Activate MMOS and start cognitive analysis
@mind-mapper *map {mind_slug}
```

The MMOS pipeline reads from `sources_master.yaml` and the organized source files.

## Directory Structure

```
squads/mind-content-updater/
  squad.yaml              # Squad manifest
  README.md               # This file
  agents/
    mind-content-updater.md  # Agent definition
  tasks/
    discover-sources.md   # Source discovery task
    collect-content.md    # Content collection task
    analyze-sources.md    # Source analysis task
    harvest-full-pipeline.md  # Full pipeline orchestration
    generate-inventory.md # Inventory generation task
  templates/
    sources-master-template.yaml    # sources_master.yaml template
    discovery-report-template.yaml  # Discovery report template
    source-frontmatter-template.yaml # Source file frontmatter template
  workflows/
    wf-harvest.yaml       # Full harvest workflow definition
  config/
    content-types.yaml    # Content type definitions and rules
    search-queries.yaml   # Search query templates per category
  data/
    README.md             # Data directory documentation
```

## Tags

`source-discovery` `web-scraping` `content-collection` `mind-cloning` `mmos-integration`

## License

MIT
