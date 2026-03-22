## Tool Strategy for Tech Research

This document defines the tool selection hierarchy and fallback strategy for the tech-research skill.

---

## Tool Hierarchy (Priority Order)

### 1. MCP Tools (Preferred - when available)

| Tool | Use Case | Credibility | Cost |
|------|----------|-------------|------|
| **Context7** | Library/framework docs | HIGH (1.3x) | Free |
| **Exa web_search_exa** | Technical search | HIGH (1.2x) | API quota |
| **Exa research_paper_search** | Academic papers | HIGH (1.3x) | API quota |
| **Exa github_search** | GitHub repos/code | HIGH (1.2x) | API quota |
| **Exa crawling** | URL content extraction | MEDIUM (1.0x) | API quota |

### 2. ETL Service (Cost-Effective - use for heavy content)

| Tool | Use Case | Credibility | Cost |
|------|----------|-------------|------|
| **ETL extractYouTube** | YouTube transcripts | HIGH (1.2x) | Free |
| **ETL fetch-page CLI** | Blog/article content | MEDIUM-HIGH (1.1x) | Free |
| **ETL chunkContent** | Semantic chunking | N/A | Free |

### 3. Native Claude Tools (Fallback - always available)

| Tool | Use Case | Credibility | Cost |
|------|----------|-------------|------|
| **WebSearch** | General web search | MEDIUM (1.0x) | Free |
| **WebFetch** | URL content extraction | MEDIUM (1.0x) | Free |

---

## Fallback Chain

```yaml
# Search Fallback
primary: mcp__exa__web_search_exa
fallback_1: WebSearch
fallback_2: null  # Give up if both fail

# Library Docs Fallback
primary: mcp__context7__query-docs
fallback_1: WebSearch with "site:{library}.dev OR site:docs.{library}"
fallback_2: WebFetch on known doc URLs

# Content Extraction Fallback (Blog/Article URLs)
#   Covers: dev.to, medium.com, marktechpost.com, hashnode.dev, hackernoon.com,
#   freecodecamp.org/news, blog.*, *.blog.*, WordPress sites, any article URL
primary: ETL fetch-page CLI (FREE, platform detection, blocklist filtering)
  # node infrastructure/services/etl/bin/fetch-page.js {url}
  # Exit 0=success, 1=blocked(skip), 2=timeout, 3=http_error, 4=empty
fallback_1: mcp__exa__crawling  # only for exit codes 2-4
fallback_2: WebFetch             # only for exit codes 2-4
fallback_3: null  # Page not accessible

# Content Extraction Fallback (Non-Blog URLs)
primary: mcp__exa__crawling
fallback_1: WebFetch
fallback_2: null  # Page not accessible

# YouTube Content
primary: ETL.extractYouTube  # ALWAYS use ETL for YouTube
fallback: null  # No alternative for transcripts

# Academic Papers
primary: mcp__exa__research_paper_search
fallback_1: WebSearch with "site:arxiv.org OR site:scholar.google.com"
fallback_2: null  # Academic search failed

# GitHub Search
primary: mcp__exa__github_search
fallback_1: WebSearch with "site:github.com {query}"
fallback_2: Bash with "gh search repos {query}" (if gh CLI available)
```

---

## When to Use Each Tool

### Use Exa When:
- Need neural/semantic search (better results for technical queries)
- Searching for recent content (Exa indexes faster)
- Company research or competitive analysis
- GitHub code/repo search
- Academic papers (100M+ papers indexed)

### Use Context7 When:
- Query involves known library/framework
- Need official documentation
- Looking for API references
- Library detected in inferred_context.domain

### Use ETL Service When:
- **YouTube URLs detected** → ALWAYS use ETL (free, high quality)
- **Blog/article URLs to deep-read** → Use fetch-page CLI as PRIMARY (free, platform detection, clean markdown)
- **Need chunking** → Use ETL.chunkContent for RAG prep
- **Interview/podcast transcripts** → Use ETL.filterSpeaker

### Subagent Tool Access (v3.0)
Each research subagent (dispatched via Task tool) has access to:
- WebSearch (native, always available)
- WebFetch (native, always available)
- ETL YouTube CLI via Bash (`node infrastructure/services/etl/bin/youtube-transcript.js`)
- ETL fetch-page CLI via Bash (`node infrastructure/services/etl/bin/fetch-page.js {url}`)
- Note: MCP tools (Exa, Context7) availability should be checked by the orchestrator
  and passed to subagents as context flags

### Use Native WebSearch When:
- Exa MCP not available or quota exhausted
- Simple general queries
- Fallback from MCP failures

### Use Native WebFetch When:
- Need to read specific URL content
- ETL not needed (small pages)
- Quick content extraction

---

## Detection Logic

```python
def select_tool(query, url=None):
    # YouTube detection
    if url and ("youtube.com" in url or "youtu.be" in url):
        return "ETL.extractYouTube"

    # Library detection (from inferred_context.domain)
    if detected_libraries:
        if context7_available():
            return "Context7"
        else:
            return f"WebSearch site:{library}.dev"

    # Academic detection
    if any(kw in query for kw in ["paper", "research", "study", "arxiv"]):
        if exa_available():
            return "Exa.research_paper_search"
        else:
            return "WebSearch site:arxiv.org"

    # GitHub detection
    if any(kw in query for kw in ["github", "repo", "repository", "code"]):
        if exa_available():
            return "Exa.github_search"
        else:
            return "WebSearch site:github.com"

    # Default: try Exa, fallback to WebSearch
    if exa_available():
        return "Exa.web_search_exa"
    else:
        return "WebSearch"
```

---

## MCP Availability Check

```yaml
check_mcp_availability:
  context7:
    test: "Try mcp__context7__resolve-library-id with known library (react)"
    on_fail: "Mark context7_available = false for session"

  exa:
    test: "Try mcp__exa__web_search_exa with simple query"
    on_fail: "Mark exa_available = false for session"
    error_codes:
      401: "API key invalid or missing"
      429: "Rate limit exceeded"
      503: "Service unavailable"

  fallback_mode:
    trigger: "Both MCPs unavailable"
    strategy: "Use WebSearch + ETL only"
    warning: "Research quality may be reduced without MCP tools"
```

---

## Cost Optimization Rules

1. **YouTube → ALWAYS use ETL** (free, 100% success rate)
2. **Known library docs → Context7 first** (free, official)
3. **Batch searches → Exa parallel** (uses quota efficiently)
4. **Deep reads → ETL fetch-page CLI** (free, platform detection) over Exa.crawling (API cost)
5. **Quick checks → WebSearch** (free, no quota impact)

---

## Integration with SKILL.md

Add to Phase 3 (Search) execution:

```yaml
tool_selection:
  pre_check:
    - "Check MCP availability (context7, exa)"
    - "Detect URLs in query (youtube, github)"
    - "Detect libraries in inferred_context.domain"

  for_each_sub_query:
    1_detect_type: "youtube|library|academic|github|general"
    2_select_tool: "Use hierarchy above"
    3_execute: "Run selected tool"
    4_on_fail: "Try fallback chain"
    5_tag_result: "Include tool_used and credibility"
```

---

## ETL Service Integration

### Setup
```bash
# ETL service location
cd infrastructure/services/etl
npm install
```

### CLI Tools (PRIMARY - use from Bash in skills)
```bash
# YouTube transcript (stdout=JSON, stderr=status)
node infrastructure/services/etl/bin/youtube-transcript.js {videoId} --format json

# Blog/article extraction (stdout=markdown, stderr=status)
node infrastructure/services/etl/bin/fetch-page.js {url}

# Blog with JSON output (includes metadata: title, author, date, platform)
node infrastructure/services/etl/bin/fetch-page.js {url} --format json

# Custom timeout (default 30s)
node infrastructure/services/etl/bin/fetch-page.js {url} --timeout 60
```

### fetch-page Exit Codes
| Code | Meaning | Action |
|------|---------|--------|
| 0 | Success | Content on stdout |
| 1 | Domain blocked (blocklist) | Skip entirely, do NOT retry |
| 2 | Timeout | Try WebFetch fallback |
| 3 | HTTP error | Try WebFetch fallback |
| 4 | Empty/minimal content | Try WebFetch fallback |
| 5 | Other error | Try WebFetch fallback |

### Platform Detection
fetch-page auto-detects platform and uses specialized extractors:
- **WordPress**: Gutenberg cleanup, shortcode removal, content selectors
- **Medium**: Paywall detection, member-only handling, article body extraction
- **Generic**: Mozilla Readability fallback for all other sites

### Node API (for programmatic use)
```javascript
const { ETLService } = require('@aios/etl-service');
const etl = new ETLService({ traceId: 'tech-research' });

const transcript = await etl.extractYouTube(videoId);
const blog = await etl.collectBlog(url);  // returns { url, content, metadata }
const chunks = await etl.chunkContent(content, { strategy: 'paragraph' });
```

---

## Credibility Tags by Tool

| Tool | Tag | Multiplier |
|------|-----|------------|
| Context7 | `source: official_docs` | 1.3x |
| Exa.research_paper_search | `source: academic` | 1.3x |
| Exa.web_search_exa | `source: exa_search` | 1.2x |
| Exa.github_search | `source: github` | 1.2x |
| ETL.extractYouTube | `source: youtube_transcript` | 1.2x |
| ETL fetch-page CLI | `source: blog_etl` | 1.1x |
| WebSearch | `source: web_search` | 1.0x |
| WebFetch | `source: web_fetch` | 0.9x |

---

*Tool Strategy v1.0 - 2026-02-08*
