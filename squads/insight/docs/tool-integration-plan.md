# Tool Integration Plan — Insight Squad

**Date:** 2026-02-11
**Source:** tool-discovery-report.md
**Executed by:** @squad-chief

---

## Timeline Overview

```
IMMEDIATE (Today)     → 8 Quick Wins — npm/npx, zero config
SHORT-TERM (This Week)→ 8 Strategic — API keys, MCP setup
MEDIUM-TERM (Month)   → 8 Fill-ins — Libraries, GitHub projects
BACKLOG (Future)      → 6 tools — Complex auth, CRM, knowledge graph
```

---

## Phase 1: IMMEDIATE — Install Today ($0)

**Estimated time:** 30 minutes
**Prerequisites:** npm, pip available

| # | Action | Command | Fills Gap | Time |
|---|--------|---------|-----------|------|
| 1 | Install Lighthouse CLI | `npm i -g lighthouse` | #8 Site performance | 2 min |
| 2 | Install md-to-pdf | `npm i -g md-to-pdf` | #10 PDF reports | 2 min |
| 3 | Test seoq (zero install) | `npx seoq analyze https://example.com` | SEO audit | 1 min |
| 4 | Install shot-scraper | `pip install shot-scraper && shot-scraper install` | #5 Screenshots | 5 min |
| 5 | Add Playwright MCP | `claude mcp add playwright -- npx -y @playwright/mcp@latest` | #3,4,5,9 | 3 min |
| 6 | Verify Exa MCP | Already installed — `*show-tools` | Research | 1 min |
| 7 | Verify Desktop Commander | Already installed | File ops | 1 min |
| 8 | Get Google API key | console.cloud.google.com → Enable PageSpeed + Places | #1,8 | 10 min |

**Validation:** After install, run:
```bash
lighthouse --version
md-to-pdf --version
shot-scraper --version
npx seoq analyze https://google.com.br --json
```

---

## Phase 2: SHORT-TERM — This Week ($0-$50)

**Estimated time:** 2-4 hours
**Prerequisites:** Phase 1 complete, API keys obtained

| # | Action | Details | Fills Gap | Time |
|---|--------|---------|-----------|------|
| 1 | Configure Brave Search API | Get key at search.brave.com/api | #7 SERP | 15 min |
| 2 | Setup Google Places API | Enable in Google Cloud Console | #1 Maps | 30 min |
| 3 | Install Apify MCP | `claude mcp add apify -- npx -y apify-mcp-server` | #2,4,7,9 | 15 min |
| 4 | Install mcp-google-map | `claude mcp add google-map -- npx -y @cablate/mcp-google-map` | #1 | 10 min |
| 5 | Install instaloader | `pip install instaloader` | #2 Instagram | 5 min |
| 6 | Setup Outscraper account | outscraper.com (500 free/month) | #1 Reviews | 15 min |
| 7 | Install plotly + kaleido | `pip install plotly kaleido` | Viz for reports | 5 min |
| 8 | (Optional) DataForSEO | $50 deposit, get API key | #6 Keywords PT-BR | 30 min |

**Validation:** Run `wf-new-lead` with a test lead using new tools.

---

## Phase 3: MEDIUM-TERM — This Month ($0)

**Estimated time:** 1-2 days
**Prerequisites:** Phase 2 complete, squad operational

| # | Action | Details | Fills Gap | Time |
|---|--------|---------|-----------|------|
| 1 | Install facebook-scraper | `pip install facebook-scraper` | #2 Facebook | 30 min |
| 2 | Setup company-researcher | Clone exa-labs/company-researcher | #5 Competitive | 1 hr |
| 3 | Install advertools | `pip install advertools` | #6 Keywords | 30 min |
| 4 | Build Reclame Aqui scraper | Playwright MCP + custom script | #3 Reputation | 2 hrs |
| 5 | Build Digital Presence Score | Compose: Lighthouse + social + reviews + SEO | #9 Scoring | 4 hrs |
| 6 | Create report templates PT-BR | data-storyteller Markdown templates | #10 Reports | 3 hrs |
| 7 | Install pywa | `pip install pywa` + Meta setup | #11 WhatsApp | 2 hrs |
| 8 | Test full pipeline | End-to-end `wf-new-lead` with all tools | Validation | 2 hrs |

---

## Phase 4: BACKLOG — Future

| # | Action | When | Notes |
|---|--------|------|-------|
| 1 | Instagram Graph API | When Meta App Review needed | Complex OAuth |
| 2 | HubSpot MCP | When >50 leads/month | CRM pipeline |
| 3 | cognee-mcp | When cross-session memory needed | Knowledge graph |
| 4 | Firecrawl MCP | When Playwright isn't enough | Anti-bot handling |
| 5 | WhatsApp Cloud full | When Level 3 autonomy | Auto-delivery |
| 6 | Unlighthouse | When batch site audits needed | Multi-page SEO |

---

## Update to tool-strategies.yaml

After Phase 1+2, update `squads/insight/data/tool-strategies.yaml` with:

```yaml
# NEW entries to add
pagespeed:
  primary: lighthouse_cli  # npm i -g lighthouse
  fallback: google_pagespeed_api  # REST API

google_maps:
  primary: google_places_api  # 10K/month free
  fallback: mcp_google_map  # MCP server
  scraping: apify_google_maps_actor  # Apify Actor

social_instagram:
  primary: instaloader  # Public data, no API key
  fallback: apify_instagram_actor  # Apify Actor

social_facebook:
  primary: facebook_scraper  # No API key needed
  fallback: meta_graph_api  # OAuth (backlog)

reputation:
  primary: playwright_mcp  # Reclame Aqui scraping
  fallback: outscraper  # Google Reviews volume

screenshots:
  primary: shot_scraper  # pip, Playwright-based
  fallback: playwright_mcp  # Browser automation

serp:
  primary: brave_search_api  # 2K/month free
  fallback: exa_mcp  # Already installed
  premium: dataforseo  # $50 deposit, PT-BR keywords

reports:
  primary: md_to_pdf  # Markdown → styled PDF
  fallback: pandoc  # Multi-format (DOCX, HTML)

visualization:
  primary: plotly_kaleido  # Charts as images
```

---

## MCP Installation Commands (Copy-Paste Ready)

```bash
# Phase 1: Playwright MCP
claude mcp add playwright -- npx -y @playwright/mcp@latest

# Phase 2: Apify MCP (needs APIFY_TOKEN)
claude mcp add apify -- npx -y apify-mcp-server

# Phase 2: Google Maps MCP (needs GOOGLE_MAPS_API_KEY)
claude mcp add google-map -- npx -y @cablate/mcp-google-map

# Phase 2 (optional): Lighthouse MCP
claude mcp add lighthouse -- npx @danielsogl/lighthouse-mcp@latest
```

---

*Generated by @squad-chief — wf-discover-tools v2.0*
