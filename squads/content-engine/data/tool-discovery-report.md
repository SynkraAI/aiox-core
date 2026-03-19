# Tool Discovery Report — Content Engine Squad

**Data**: 2026-02-11
**Executado por**: discover-tools.md (Phase 0-6)
**Gaps analisados**: 10
**Ferramentas descobertas**: 35+
**Recomendações**: 15 ferramentas priorizadas

---

## Sumário Executivo

O Content Engine opera com 20 agentes em 3 camadas (Estratégia, Produção, Qualidade) mas depende quase exclusivamente de LLMs para análise de texto, sem ferramentas determinísticas de scoring, analytics ou automação de publicação.

**10 gaps identificados**, priorizados por impacto no workflow:

| # | Gap | Prioridade | Solução recomendada | Custo |
|---|-----|-----------|---------------------|-------|
| 1 | Readability scoring | Alta | textstat + text-readability | Grátis |
| 2 | Headline/copy scoring | Alta | textstat + LeIA + heurísticas | Grátis |
| 3 | Trend detection | Alta | trendspyg + Reddit API | Grátis |
| 4 | YouTube transcripts | Alta | mcp-youtube-transcript | Grátis |
| 5 | Social media analytics | Alta | Instagram Graph API + YouTube Data API | Grátis |
| 6 | SEO/keyword research | Média | KeyBERT + YAKE | Grátis |
| 7 | Content scheduling | Média | Late API | $19/mês |
| 8 | Competitor scraping | Média | EXA (já instalado) + firecrawl | Grátis |
| 9 | Hashtag research | Baixa | KeyBERT → hashtags + RiteKit | Grátis |
| 10 | Newsletter delivery | Baixa | Beehiiv API | Grátis (até 2.5k subs) |

---

## Descobertas por Categoria

### MCP Servers (9 encontrados)

| MCP | Stars | Relevância | Status |
|-----|-------|-----------|--------|
| yutu/YouTube MCP | 379 | Transcripts YouTube | Candidato |
| mcp-youtube-transcript | 271 | Transcripts YouTube | **Recomendado** |
| dataforseo-mcp | 141 | SEO + Trends via MCP | Monitorar |
| tiktok-mcp | 125 | TikTok data | Futuro |
| instagram-mcp | 71 | Instagram analytics | Experimental |
| instagram-engagement-mcp | 40 | Engagement metrics | Experimental |
| seo-insights-mcp | 28 | SEO analysis | Baixa maturidade |
| social-media-mcp | 14 | Multi-platform | Baixa maturidade |
| socialapis-mcp | 0 | Multi-platform | Não recomendado |

**Veredicto**: Apenas `mcp-youtube-transcript` tem maturidade suficiente. Os demais MCPs de social media são experimentais — preferir APIs diretas.

### APIs (15+ avaliadas)

**Tier 1 — Grátis e prontas:**
- Instagram Graph API (200 req/h)
- YouTube Data API v3 (10k units/dia)
- Reddit API (100 req/min)
- Beehiiv API (2.5k subs grátis)
- Kit/ConvertKit API v4 (10k subs grátis)

**Tier 2 — Baixo custo:**
- Late API ($19/mês, 13 plataformas)
- Keywords Everywhere ($10 one-time)
- RiteKit (100 credits/mês grátis)
- SerpApi ($50/mês)

**Não recomendadas:**
- X/Twitter API ($200/mês só para leitura)
- Readable.com ($69/mês — textstat faz o mesmo grátis)
- CoSchedule — NÃO tem API pública

### Libraries & CLIs (20+ avaliadas)

**Stack Python (recomendado):**

| Pacote | Stars | Uso | Install |
|--------|-------|-----|---------|
| textstat | 1.3k | Readability | `pip install textstat` |
| leia-br | 4.9k | Sentiment (social media) | `pip install leia-br` |
| KeyBERT | 4.1k | Keyword extraction | `pip install keybert` |
| YAKE | — | Keywords (rápido, sem modelo) | `pip install yake` |
| trendspyg | — | Google Trends (substitui pytrends) | `pip install trendspyg` |
| youtube-transcript-api | — | YouTube transcripts | `pip install youtube-transcript-api` |
| yt-dlp | — | Download vídeos/áudio | `pip install yt-dlp` |

**Stack Node.js (alternativo):**

| Pacote | Stars | Uso | Install |
|--------|-------|-----|---------|
| sharp | 31.9k | Image processing | `npm install sharp` |
| puppeteer | 87k | HTML-to-image | `npm install puppeteer` |
| text-readability | — | Readability (port textstat) | `npm install text-readability` |
| sentiment | — | Sentiment (AFINN-165) | `npm install sentiment` |
| natural | — | NLP completo | `npm install natural` |
| marked | — | Markdown parser | `npm install marked` |

### GitHub Projects

| Projeto | Stars | Uso |
|---------|-------|-----|
| Postiz | 26.5k | Social scheduling (self-hosted) |
| yt-dlp | — | Video/audio download |

---

## Insights Críticos

1. **pytrends foi ARQUIVADO** (abril 2025) — usar `trendspyg` como substituto
2. **CoSchedule NÃO tem API** — headline scoring precisa ser construído com textstat + LeIA + heurísticas
3. **Instagram Stories NÃO podem ser publicados via API** — apenas lidos
4. **X/Twitter API é caro demais** ($200/mês) — usar Reddit + Google Trends para trend detection
5. **Sharp + Puppeteer já são usados no VPS** (marketing-pipeline) — reutilizar para o content-engine

---

## Próximos Passos

Ver `capability-tools.yaml` para o plano de integração completo com 3 fases:
- **Imediato**: pip/npm install de libraries grátis
- **Curto prazo**: Configurar APIs grátis (Instagram, YouTube, Reddit)
- **Médio prazo**: Ferramentas pagas (Late API, Keywords Everywhere)
