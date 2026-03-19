# Tool Discovery Report — Insight Squad
## Market Intelligence for Brazilian Local Businesses

**Discovery Date:** 2026-02-11
**Domain:** market-intelligence
**Budget:** near-zero-cost
**Executed by:** @squad-chief (wf-discover-tools v2.0)

---

## Executive Summary

Pesquisa profunda com 5 sub-agentes paralelos identificou **74 ferramentas** em 5 categorias que cobrem **todos os 12 capability gaps** do squad insight. O stack recomendado opera com custo **$0/mês** (free tiers) e pode escalar até ~$50/mês para volume alto.

**Top Insight:** Playwright MCP + Apify MCP juntos cobrem 6 dos 12 gaps. São as peças mais críticas para portais brasileiros de nicho (Reclame Aqui, iFood, Doctoralia) que não têm API pública.

---

## Capability Gaps Analyzed (12)

| # | Gap | Agente | Prioridade | Status |
|---|-----|--------|------------|--------|
| 1 | Google Maps/Business data | digital-profiler | HIGH | ✅ Coberto (5+ opções) |
| 2 | Social media data (IG/FB) | digital-profiler | HIGH | ✅ Coberto (4+ opções) |
| 3 | Reputation monitoring (Reclame Aqui) | digital-profiler | HIGH | ⚠️ Parcial (scraping only) |
| 4 | Web scraping / page analysis | digital-profiler | HIGH | ✅ Coberto (6+ opções) |
| 5 | Screenshot capture | digital-profiler | MEDIUM | ✅ Coberto (3+ opções) |
| 6 | Keyword research (PT-BR) | market-scout | HIGH | ✅ Coberto (3+ opções) |
| 7 | SERP analysis | market-scout | HIGH | ✅ Coberto (4+ opções) |
| 8 | Site performance (Lighthouse) | digital-profiler | HIGH | ✅ Coberto (3+ opções) |
| 9 | Niche portals (iFood, Doctoralia...) | digital-profiler | MEDIUM | ⚠️ Parcial (scraping, sem API) |
| 10 | PDF/Document generation | data-storyteller | MEDIUM | ✅ Coberto (4+ opções) |
| 11 | Notifications | insight-chief | LOW | ✅ Coberto (2+ opções) |
| 12 | Lead/Pipeline (CRM) | insight-chief | LOW | ✅ Coberto (2+ opções) |

---

## Decision Matrix (Impact × Effort)

### 🚀 QUICK WINS — Implement Now (High Impact, Low Effort)

| # | Tool | Category | Gaps | Install | Cost |
|---|------|----------|------|---------|------|
| 1 | **Playwright MCP** | MCP | #3, #4, #5, #9 | `npx -y @playwright/mcp@latest` | Free |
| 2 | **Lighthouse CLI** | CLI | #8, SEO | `npm i -g lighthouse` | Free |
| 3 | **Google PageSpeed Insights API** | API | #8 | REST call, API key | Free (25K/dia) |
| 4 | **Google Places API (New)** | API | #1 | REST call, API key | Free (10K/mês) |
| 5 | **md-to-pdf** | CLI | #10 | `npm i -g md-to-pdf` | Free |
| 6 | **seoq** | CLI | SEO | `npx seoq analyze <url>` | Free |
| 7 | **shot-scraper** | CLI | #5 | `pip install shot-scraper` | Free |
| 8 | **Brave Search API** | API | #7 | REST call, API key | Free (2K/mês) |

### 📋 STRATEGIC — Plan for This Week (High Impact, Medium Effort)

| # | Tool | Category | Gaps | Notes | Cost |
|---|------|----------|------|-------|------|
| 9 | **Apify MCP** | MCP | #2, #4, #7, #9 | 2000+ Actors, scraping hub unificado | Free ($5/mês credits) |
| 10 | **mcp-google-map** | MCP | #1 | Google Maps data extraction | Free ($200/mês credits) |
| 11 | **instaloader** | Library/CLI | #2 | Instagram público (posts, stories, metadata) | Free |
| 12 | **googlemaps** (Python) | Library | #1 | Client oficial Google | Free tier |
| 13 | **Outscraper** | API | #1 (reviews) | Google Reviews em volume | Free (500/mês) |
| 14 | **DataForSEO** | API/MCP | #6, #7 | Keywords PT-BR (volume, CPC, competition) | $50 depósito único |
| 15 | **facebook-scraper** | Library | #2 | Facebook pages sem API key | Free |
| 16 | **plotly + kaleido** | Library | Viz | Charts para relatórios | Free |

### 📦 FILL-INS — Nice to Have (Medium Impact, Low Effort)

| # | Tool | Category | Gaps | Notes | Cost |
|---|------|----------|------|-------|------|
| 17 | **social-analyzer** | GitHub | #2 | 21K stars, 1000+ plataformas | Free (AGPL-3.0) |
| 18 | **company-researcher** | GitHub | #5 | Usa Exa API (já temos MCP!) | Free |
| 19 | **advertools** | Library | #6 | Crawler SEO + keyword research | Free |
| 20 | **pyseoanalyzer** | Library | SEO | SEO técnico | Free |
| 21 | **fpdf2** | Library | #10 | PDF puro Python | Free |
| 22 | **Serper API** | API | #7 | SERP Google real | 2.5K buscas grátis |
| 23 | **pywa** | Library | #11 | WhatsApp Cloud API typed | Free (1K msgs/mês) |
| 24 | **Tideflow-md-to-pdf** | GitHub | #10 | Markdown → PDF estilizado | Free |

### ⏸️ BACKLOG — Future (Low Impact or High Effort)

| # | Tool | Category | Gaps | Notes |
|---|------|----------|------|-------|
| 25 | Instagram Graph API | API | #2 | OAuth complexo, App Review Meta |
| 26 | WhatsApp Cloud API | API | #11 | Setup complexo, 1K msgs grátis |
| 27 | HubSpot MCP | MCP | #12 | CRM completo, 1K contacts free |
| 28 | cognee-mcp | MCP | Knowledge | Knowledge graph avançado |
| 29 | mcp-omnisearch | MCP | Research | Multi-engine search |
| 30 | Reclame-Aqui-Scraper | GitHub | #3 | 17 stars, último push Jan/2024 |

---

## Discovery by Category

### MCPs (20 discovered)

| MCP | Stars | Gaps | Priority | Install |
|-----|-------|------|----------|---------|
| Playwright MCP | Official | #3,4,5,9 | 🚀 Quick Win | `npx -y @playwright/mcp@latest` |
| Apify MCP | — | #2,4,7,9 | 📋 Strategic | `npx -y apify-mcp-server` |
| mcp-google-map | — | #1 | 📋 Strategic | `npx -y @cablate/mcp-google-map` |
| Lighthouse MCP | — | #8 | 📋 Strategic | `npx @danielsogl/lighthouse-mcp@latest` |
| Firecrawl MCP | 3,303 | #4 | 📋 Strategic | `env FIRECRAWL_API_KEY=... npx -y firecrawl-mcp` |
| notifyme_mcp | — | #11 | 📦 Fill-in | clone + npm install |
| DataForSEO MCP | — | #6,7 | 📋 Strategic | — |
| HubSpot MCP | — | #12 | ⏸️ Backlog | — |
| Bright Data MCP | — | #4,9 | ⏸️ Backlog | API key required |
| Perplexity MCP | — | Research | 📦 Fill-in | `npx -y mcp-perplexity` |

### APIs (14 discovered)

| API | Free Tier | Gaps | Priority |
|-----|-----------|------|----------|
| Google PageSpeed Insights | 25K/dia | #8 | 🚀 Quick Win |
| Google Places API (New) | 10K/mês | #1 | 🚀 Quick Win |
| Brave Search | 2K/mês | #7 | 🚀 Quick Win |
| Exa (já instalado) | $10 créditos | Research | ✅ Instalado |
| Outscraper | 500/mês | #1 (reviews) | 📋 Strategic |
| Serper API | 2.5K buscas | #7 | 📦 Fill-in |
| DataForSEO | $50 depósito | #6,7 | 📋 Strategic |
| Instagram Graph API | Free (OAuth) | #2 | ⏸️ Backlog |
| Meta Graph API | Free (OAuth) | #2 | ⏸️ Backlog |
| WhatsApp Cloud API | 1K msgs/mês | #11 | ⏸️ Backlog |
| kwrds.ai | Trial limitado | #6 | ⏸️ Backlog |

### CLI Tools (13 discovered)

| CLI | Install | Gaps | Priority |
|-----|---------|------|----------|
| Lighthouse | `npm i -g lighthouse` | #8, SEO | 🚀 Quick Win |
| md-to-pdf | `npm i -g md-to-pdf` | #10 | 🚀 Quick Win |
| seoq | `npx seoq analyze` | SEO | 🚀 Quick Win |
| shot-scraper | `pip install shot-scraper` | #5 | 🚀 Quick Win |
| instaloader | `pip install instaloader` | #2 | 📋 Strategic |
| gosom/google-maps-scraper | Go binary | #1 | 📋 Strategic |
| Pandoc | `scoop install pandoc` | #10 | 📦 Fill-in |
| htmlq | Binary | #4 | 📦 Fill-in |
| Unlighthouse | `npx unlighthouse` | #8 | 📦 Fill-in |
| Flyscrape | Go binary | #4 | ⏸️ Backlog |

### Libraries (12 discovered)

| Library | Language | Stars | Gaps | Priority |
|---------|----------|-------|------|----------|
| playwright | Python | 14K | #4,9 | 📋 Strategic |
| instaloader | Python | 11.2K | #2 | 📋 Strategic |
| googlemaps | Python | Official | #1 | 📋 Strategic |
| plotly + kaleido | Python | 16K+ | Viz | 📋 Strategic |
| facebook-scraper | Python | 3K | #2 | 📋 Strategic |
| pyseoanalyzer | Python | 1.2K | SEO | 📦 Fill-in |
| outscraper | Python | — | #1 | 📋 Strategic |
| fpdf2 | Python | — | #10 | 📦 Fill-in |
| pywa | Python | — | #11 | 📦 Fill-in |
| trendspyg | Python | — | #6 | ⚠️ Beta |
| cheerio | Node | — | #4 | 📦 Fill-in |
| crawlee | Node | Apify | #4 | 📦 Fill-in |

### GitHub Projects (15 discovered)

| Project | Stars | License | Gaps | Priority |
|---------|-------|---------|------|----------|
| social-analyzer | 21K | AGPL-3.0 | #2 | 📦 Fill-in |
| lighthouse | 29.8K | Apache-2.0 | #8, SEO | 🚀 Quick Win |
| google-maps-scraper | 2.4K | MIT | #1 | 📋 Strategic |
| instaloader | 11.5K | MIT | #2 | 📋 Strategic |
| company-researcher | 1.4K | — | #5 | 📦 Fill-in |
| facebook-scraper | 3K | MIT | #2 | 📋 Strategic |
| python-seo-analyzer | 1.4K | — | SEO | 📦 Fill-in |
| advertools | 1.3K | — | #6 | 📦 Fill-in |
| google-reviews-scraper-pro | 105 | — | #1 | 📋 Strategic |
| Reclame-Aqui-Scraper | 17 | — | #3 | ⚠️ Abandonado |
| seo-keyword-research-tool | 139 | — | #6 | 📦 Fill-in |
| seo-audits-toolkit | 768 | — | SEO | 📦 Fill-in |
| Tideflow-md-to-pdf | 289 | — | #10 | 📦 Fill-in |
| awesome-seo | 714 | — | Referência | N/A |

---

## Flags & Attention Items

| Flag | Tool | Issue | Action |
|------|------|-------|--------|
| 🟤 SINGLE_MAINTAINER | Reclame-Aqui-Scraper | 17 stars, last push Jan/2024 | Fork or use Playwright MCP |
| 🔵 VERY_NEW | trendspyg | v0.3.0 beta (substituto pytrends) | Monitor, use DataForSEO as backup |
| ⚫ NO_LICENSE | company-researcher | No OSS license | Check before prod use |
| 🟡 AGPL | social-analyzer | AGPL-3.0 (copyleft) | OK for internal use |

---

## Cost Analysis

### Tier 0 — $0/mês (MVP for 50 leads/mês)

| Tool | Free Tier |
|------|-----------|
| Playwright MCP | Unlimited |
| Lighthouse CLI | Unlimited |
| Google PageSpeed API | 25K tests/dia |
| Google Places API | 10K calls/mês |
| Brave Search API | 2K queries/mês |
| md-to-pdf | Unlimited |
| seoq | Unlimited |
| shot-scraper | Unlimited |
| instaloader | Unlimited |
| Exa MCP (já instalado) | $10 créditos |

### Tier 1 — ~$50 único (50-200 leads/mês)

| Tool | Custo |
|------|-------|
| DataForSEO | $50 depósito único (~$0.0001/keyword) |
| Outscraper | 500 reviews grátis, depois pay-as-you-go |
| Apify | $5/mês renova automaticamente |

### Tier 2 — ~$50/mês (200+ leads/mês)

| Tool | Custo |
|------|-------|
| Serper API | $50/50K queries |
| Outscraper volume | Pay-as-you-go |
| WhatsApp Cloud | 1K msgs grátis, depois Meta pricing |

---

## Stack Recomendado por Agente

### digital-profiler
- **Site:** Lighthouse CLI + Google PageSpeed API + seoq
- **Maps:** Google Places API + mcp-google-map + Outscraper (reviews)
- **Social:** instaloader (IG) + facebook-scraper (FB)
- **Reputação:** Playwright MCP (Reclame Aqui) + Google Reviews
- **Screenshots:** shot-scraper + Playwright MCP
- **Portais nicho:** Playwright MCP + Apify Actors

### market-scout
- **Keywords:** DataForSEO (PT-BR) + seo-keyword-research-tool (autocomplete)
- **SERP:** Brave Search + Exa MCP + Serper API
- **Maps:** Google Places API + google-maps-scraper
- **Trends:** trendspyg (Google Trends beta)
- **Competidores:** company-researcher (Exa) + social-analyzer

### data-storyteller
- **Viz:** plotly + kaleido (charts como imagens)
- **PDF:** md-to-pdf (Markdown → PDF estilizado)
- **Backup:** fpdf2 (Python puro), Pandoc (DOCX)

### insight-chief
- **QA:** Consome outputs dos 3 agentes
- **Notificação:** pywa (WhatsApp) — quando Level 2+ autonomy
- **CRM:** HubSpot MCP — quando pipeline crescer

---

## 3 Gaps que Requerem Desenvolvimento Interno

1. **Digital Presence Score proprietário** — Nenhum framework pronto. Compor: Lighthouse (0-100) + métricas sociais + rating reviews + score SEO. Definido no `scoring-rubric.yaml`.

2. **Reclame Aqui moderno** — Scraper existente tem 17 stars (abandonado). Melhor rota: Playwright MCP + script personalizado ou verificar Apify Actors.

3. **Templates de relatório PT-BR** — Nenhum template localizado. O data-storyteller deve criar templates Markdown próprios usando os frameworks dos 6 elite minds.

---

*Generated by @squad-chief — wf-discover-tools v2.0*
*— Quality is behavior, not line count.*
