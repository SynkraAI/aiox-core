## Tool Strategy for Deep Research

This document defines the tool selection hierarchy and fallback strategy for the deep-research skill.

---

## Tool Hierarchy (Priority Order)

### 1. MCP Tools (Preferred - when available)

| Tool | Use Case | Credibility | Cost |
|------|----------|-------------|------|
| **Exa web_search_exa** | General web search (semantic) | HIGH (1.2x) | API quota |
| **Exa research_paper_search** | Academic papers, studies | HIGH (1.3x) | API quota |
| **Exa crawling** | URL content extraction | MEDIUM (1.0x) | API quota |

### 2. ETL Service (Cost-Effective - use for heavy content)

| Tool | Use Case | Credibility | Cost |
|------|----------|-------------|------|
| **ETL extractYouTube** | YouTube transcripts (talks, interviews, podcasts) | HIGH (1.2x) | Free |
| **ETL fetch-page CLI** | Blog/article content extraction | MEDIUM-HIGH (1.1x) | Free |
| **ETL chunkContent** | Semantic chunking for long content | N/A | Free |

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
on_error:
  quota_exceeded: fallback to WebSearch
  mcp_unavailable: fallback to WebSearch
  timeout: retry 1x, then fallback to WebSearch
fallback_1: WebSearch
fallback_2: null  # Give up if both fail

# Content Extraction Fallback (Blog/Article URLs)
primary: ETL fetch-page CLI (FREE, platform detection)
  # node infrastructure/services/etl/bin/fetch-page.js {url}
on_exit_code:
  0: success — content on stdout
  1: blocked domain — SKIP entirely (do NOT retry or fallback)
  2: timeout — fallback to Exa crawling, then WebFetch
  3: http_error — fallback to Exa crawling, then WebFetch
  4: empty/minimal — fallback to Exa crawling, then WebFetch
  5+: unknown error — log error, fallback to WebFetch
fallback_1: mcp__exa__crawling  # for exit codes 2-5+
fallback_2: WebFetch             # for exit codes 2-5+
fallback_3: null  # Page not accessible — mark sub-query as SKIPPED

# YouTube Content (talks, interviews, podcasts)
primary: ETL.extractYouTube  # ALWAYS use ETL for YouTube
on_error:
  no_captions: mark source as "no transcript available", use video description + title only
  video_unavailable: SKIP source entirely
fallback: null  # No alternative for full transcripts

# Academic Papers/Reports
primary: mcp__exa__research_paper_search
fallback_1: WebSearch with "site:arxiv.org OR site:scholar.google.com OR site:researchgate.net"
fallback_2: null

# GRACEFUL DEGRADATION — When All Tools Fail for a Sub-Query
all_tools_failed:
  action: "Mark sub-query as SKIPPED, continue with remaining sub-queries"
  do_not: "Fail entire pipeline because one sub-query couldn't find sources"
  report: "Include SKIPPED queries in coverage evaluation as 0-score dimensions"
```

---

## Content Source Priority by Research Type — OPERATIONAL MATRICES

Each matrix defines source types, credibility multipliers, query templates, and regional variants.
Subagents MUST use these multipliers when scoring sources.

### Market Research — Source Credibility Matrix

| Source Type | Multiplier | Query Template | Regional Variants |
|-------------|-----------|----------------|-------------------|
| Industry reports (Statista, Grand View) | 1.5x | "{market} market size {region} {year} site:statista.com" | Global default |
| Government data | 1.4x | "{market} statistics official data {year}" | IBGE/ABED (BR), Census (US), Eurostat (EU) |
| Tier-1 news (Bloomberg, Forbes) | 1.2x | "{market} growth {region} {year} site:bloomberg.com OR site:forbes.com" | Valor/Exame (BR), FT (UK) |
| Consultancy reports (McKinsey, BCG) | 1.3x | "{market} report forecast McKinsey Gartner" | Public summaries only |
| Expert YouTube talks | 0.9x | "{market} expert talk conference {year}" | Verify speaker credentials |
| Company blogs/PR | 0.7x | "{company} {market} case study ROI" | Self-reported data — use for quotes not facts |

**Priority rules:** Government + industry reports first -> Tier-1 news -> Expert talks -> Company blogs last.

### People/Biography — Source Credibility Matrix

| Source Type | Multiplier | Query Template | Notes |
|-------------|-----------|----------------|-------|
| Official website / personal blog | 1.5x | "{person} site:{official_domain}" | Primary source for methodology |
| Published books (Amazon, verified) | 1.4x | "{person} book review site:amazon.com OR site:goodreads.com" | Framework extraction |
| Verified YouTube channel | 1.3x | "{person} site:youtube.com" | ETL transcript for analysis |
| Long-form interviews/podcasts | 1.2x | "{person} interview podcast full" | ETL transcript priority |
| Tier-1 profiles (Forbes, Inc) | 1.1x | "{person} profile site:forbes.com OR site:inc.com" | Background verification |
| Third-party analysis/opinions | 0.8x | "{person} analysis review criticism" | Context, not primary |
| Social media (Twitter, Reddit) | 0.6x | "{person} reddit review discussion" | Sentiment only |

**Priority rules:** Official content -> Books/courses -> Interviews -> Profiles -> Third-party last.

### Books/Content — Source Credibility Matrix

| Source Type | Multiplier | Query Template | Notes |
|-------------|-----------|----------------|-------|
| Goodreads (aggregate rating) | 1.4x | "{book_title} site:goodreads.com" | Aggregate + expert lists |
| Amazon (verified purchase reviews) | 1.3x | "{book_title} review site:amazon.com" | Filter verified purchases |
| Author official website | 1.3x | "{author} methodology framework" | Author's own explanation |
| YouTube book reviews (known reviewers) | 1.1x | "{book_title} book review site:youtube.com" | Summary + opinion |
| Expert reading lists | 1.2x | "best books {topic} recommended by {expert}" | Curated recommendations |
| Blog reviews (generic) | 0.8x | "{book_title} review summary" | Often superficial |
| Listicle "Top 10 books" | 0.6x | "top books {topic}" | Low signal, high noise |

**Priority rules:** Goodreads/Amazon aggregate -> Author content -> Expert lists -> YouTube reviews -> Blog reviews last.

### Strategy/Business — Source Credibility Matrix

| Source Type | Multiplier | Query Template | Notes |
|-------------|-----------|----------------|-------|
| HBR / MIT Sloan | 1.5x | "{topic} site:hbr.org OR site:sloanreview.mit.edu" | Academic-practical bridge |
| Expert books (verified methodology) | 1.4x | "{topic} framework methodology book" | Documented frameworks |
| Case studies with data | 1.3x | "{topic} case study results revenue ROI" | Must have numbers |
| Founder interviews (verified) | 1.1x | "{founder} {topic} interview how built" | First-person experience |
| YouTube strategy talks | 1.0x | "{topic} strategy talk conference {year}" | Good for context |
| Generic business blogs | 0.7x | "{topic} strategy guide" | Often shallow |
| Social media advice | 0.5x | "{topic} tips linkedin twitter" | Lowest signal |

**Priority rules:** HBR/academic -> Books with frameworks -> Cases with data -> Interviews -> Generic last.

### Competitive Analysis — Source Credibility Matrix

| Source Type | Multiplier | Query Template | Notes |
|-------------|-----------|----------------|-------|
| G2 / Capterra reviews | 1.4x | "{company} review site:g2.com OR site:capterra.com" | Verified user reviews |
| Crunchbase / CB Insights | 1.3x | "{company} funding revenue site:crunchbase.com" | Financial data |
| Company pricing pages | 1.2x | "{company} pricing plans features" | Direct comparison data |
| Product Hunt | 1.1x | "{company} site:producthunt.com" | Launch reception |
| TechCrunch / industry news | 1.0x | "{company} site:techcrunch.com" | Strategic moves |
| Social media sentiment | 0.7x | "{company} review reddit twitter" | Qualitative only |

### Industry/Ecosystem — Source Credibility Matrix

| Source Type | Multiplier | Query Template | Regional Variants |
|-------------|-----------|----------------|-------------------|
| Industry associations | 1.5x | "{industry} association report {region} {year}" | ABED (BR edu), ABRADI (BR digital) |
| Government regulatory data | 1.4x | "{industry} regulation {region} official" | .gov, .gov.br |
| Academic papers | 1.3x | "{industry} study research site:scholar.google.com" | Peer-reviewed |
| McKinsey/BCG/Deloitte reports | 1.3x | "{industry} report {consultancy} {year}" | Public summaries |
| Trade publications | 1.1x | "{industry} {trade_pub} news analysis" | Sector-specific |
| Expert commentary | 0.9x | "{industry} expert analysis opinion" | Supplement to data |

### Academic — Source Credibility Matrix

| Source Type | Multiplier | Query Template | Notes |
|-------------|-----------|----------------|-------|
| Peer-reviewed journals | 1.5x | "{topic} site:scholar.google.com OR DOI" | Gold standard |
| arXiv preprints | 1.3x | "{topic} site:arxiv.org" | Not peer-reviewed but cutting edge |
| University repositories | 1.2x | "{topic} thesis dissertation .edu" | Detailed methodology |
| Systematic reviews | 1.5x | "{topic} systematic review meta-analysis" | Highest evidence level |
| Conference proceedings | 1.1x | "{topic} conference proceedings paper" | Timely findings |

### Regulatory — Source Credibility Matrix

| Source Type | Multiplier | Query Template | Regional Variants |
|-------------|-----------|----------------|-------------------|
| Official legislation text | 1.5x | "{lei} texto integral site:planalto.gov.br" | Congress (US), EUR-Lex (EU) |
| Regulatory body guidelines | 1.4x | "{topic} regulamentacao {orgao}" | ANPD, ANVISA, CVM (BR) |
| Law firm analysis | 1.2x | "{topic} analise juridica compliance" | Verified law firms only |
| Legal databases | 1.3x | "{topic} jurisprudencia site:jusbrasil.com.br" | LexisNexis (US) |
| Academic legal papers | 1.1x | "{topic} artigo juridico direito" | Legal journals |

---

## When to Use Each Tool

### Use Exa When:
- Need semantic search (better for nuanced queries)
- Searching for recent content
- Company research or competitive analysis
- Academic papers (100M+ papers indexed)
- Need content crawling from specific URLs

### Use ETL Service When:
- **YouTube URLs detected** -> ALWAYS use ETL (free, high quality)
- **Blog/article URLs to deep-read** -> Use fetch-page CLI as PRIMARY
- **Podcast transcripts** -> Use ETL.filterSpeaker
- **Need chunking** -> Use ETL.chunkContent for long documents

### Use Native WebSearch When:
- Exa MCP not available
- Simple general queries
- Fallback from MCP failures
- Quick searches for specific facts

### Use Native WebFetch When:
- Need to read specific URL content
- ETL not needed (small pages)
- Quick content extraction

---

## Subagent Tool Access

Each research subagent (dispatched via Task tool) has access to:
- WebSearch (native, always available)
- WebFetch (native, always available)
- ETL YouTube CLI via Bash (`node infrastructure/services/etl/bin/youtube-transcript.js`)
- ETL fetch-page CLI via Bash (`node infrastructure/services/etl/bin/fetch-page.js {url}`)
- Note: MCP tools (Exa) availability should be checked by the orchestrator
  and passed to subagents as context flags

---

## Credibility Tags by Tool

| Tool | Tag | Multiplier |
|------|-----|------------|
| Exa.research_paper_search | `source: academic` | 1.3x |
| Exa.web_search_exa | `source: exa_search` | 1.2x |
| ETL.extractYouTube | `source: youtube_transcript` | 1.2x |
| ETL fetch-page CLI | `source: blog_etl` | 1.1x |
| WebSearch | `source: web_search` | 1.0x |
| WebFetch | `source: web_fetch` | 0.9x |

---

## Cost Optimization Rules

1. **YouTube -> ALWAYS use ETL** (free, 100% success rate)
2. **Batch searches -> Exa parallel** (uses quota efficiently)
3. **Deep reads -> ETL fetch-page CLI** (free) over Exa.crawling (API cost)
4. **Quick checks -> WebSearch** (free, no quota impact)
5. **Long articles -> ETL + chunk** (free) vs reading full content (expensive tokens)

---

*Tool Strategy v1.0 - Deep Research Skill*
