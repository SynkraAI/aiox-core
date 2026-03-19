# Tool Discovery Report: Affiliates Squad

**Gerado:** 2026-02-18
**Domínio:** Affiliate Marketing Multi-Platform
**Gaps Analisados:** 12
**Ferramentas Descobertas:** 80+
**Pesquisa:** 3 sub-agentes paralelos (MCPs, APIs, CLIs/Libraries/GitHub)

---

## Executive Summary

O squad Affiliates tem 17 agents cobrindo SEO, email, funnels, social media, marketplaces BR e prop trading. Atualmente depende apenas de **exa** (research) e ferramentas nativas Claude Code. A pesquisa identificou **30+ MCP servers**, **25+ APIs** e **20+ CLIs/Libraries** que podem potencializar drasticamente a automação e output do squad.

---

## Capability Gap Analysis

| Capability | Status Atual | Gap Priority | Ferramentas Encontradas |
|------------|-------------|-------------|------------------------|
| SEO Audit & Keywords | Manual (exa research) | 9.5 | Ahrefs MCP, SEO MCP (free), DataForSEO, SE Ranking |
| Email Automation | Nenhuma | 9.2 | Brevo MCP, MailerLite MCP, SendGrid API |
| Social Media Posting | Manual | 9.0 | Twitter/X MCP, Social Media MCP, Ayrshare API |
| Affiliate Link Tracking | Manual | 8.8 | PostAffiliatePro MCP, Tapfiliate MCP, Refersion MCP |
| Web Scraping (competitor) | web_fetch (basico) | 8.5 | Firecrawl MCP (ja no registry), Bright Data MCP |
| Analytics/Conversion | Nenhuma | 8.3 | Google Analytics MCP (oficial), Microsoft Clarity |
| Content Scheduling | Manual | 7.8 | postiz-app, mixpost (self-hosted) |
| Landing Page Building | Templates (manual) | 7.5 | Unbounce API, ConvertFast UI |
| Marketplace Integration | Manual | 7.2 | Amazon Ads MCP (beta), Shopee API, Hotmart API |
| YouTube Transcripts | Nenhuma | 7.0 | YouTube Transcript MCP (ja no registry) |
| E-commerce Store | N/A | 6.0 | Shopify MCP, WooCommerce MCP |
| Payment Processing | N/A | 5.5 | Stripe MCP |

---

## Quick Wins (Alto Impacto, Baixo Esforco)

| # | Tool | Tipo | Preenche Gap | Install | Free? |
|---|------|------|-------------|---------|-------|
| 1 | Google Analytics MCP | MCP | Analytics/Conversion | `npx google-analytics-mcp` | Sim |
| 2 | SEO MCP (cnych) | MCP | SEO Audit & Keywords | `git clone github.com/cnych/seo-mcp` | Sim |
| 3 | Google Search Console MCP | MCP | SEO/SERP Monitoring | `git clone github.com/AminForou/mcp-gsc` | Sim |
| 4 | Twitter/X MCP | MCP | Social Posting | `git clone github.com/taazkareem/twitter-mcp-server` | Sim |
| 5 | MailerLite MCP | MCP | Email Automation | Remote: `https://mcp.mailerlite.com/mcp` | Sim (Beta) |
| 6 | SendGrid API | API | Email Transactional | `pip install sendgrid` | Sim (100/day) |
| 7 | site-audit-seo | CLI | SEO Audit | `npm install -g site-audit-seo` | Sim |
| 8 | advertools | Python | SEO/Keyword Research | `pip install advertools` | Sim |

## Strategic (Alto Impacto, Medio-Alto Esforco)

| # | Tool | Tipo | Preenche Gap | Custo |
|---|------|------|-------------|-------|
| 1 | Ahrefs MCP | MCP | SEO Completo | Pago (subscription) |
| 2 | Brevo MCP | MCP | Email Marketing (100+ tools) | Free tier |
| 3 | Bright Data MCP | MCP | Web Scraping avancado | 5k/mes free |
| 4 | Amazon Ads MCP | MCP | Amazon Marketplace | Pago |
| 5 | Ayrshare API | API | Social Multi-plataforma | $25/mes |
| 6 | Hotmart API | API | BR Digital Products | Free |
| 7 | postiz-app | GitHub | Social Scheduling | Open source |
| 8 | Mangosqueezy | GitHub | Affiliate Management | Open source |

---

## Detailed Findings

### MCP Servers (30+)

#### SEO & Keywords

| MCP | GitHub | Stars | Free? | Install |
|-----|--------|-------|-------|---------|
| Ahrefs MCP (oficial) | github.com/ahrefs/ahrefs-mcp-server | ~92 | Nao | `npm install -g @ahrefs/mcp` |
| SEO MCP (free) | github.com/cnych/seo-mcp | — | Sim | git clone |
| DataForSEO MCP | github.com/dataforseo/mcp-server-typescript | — | Nao | Docker |
| SE Ranking MCP | github.com/seranking/seo-data-api-mcp-server | — | Nao | Docker |
| Google Search Console MCP | github.com/AminForou/mcp-gsc | — | Sim | git clone |

#### Email Marketing

| MCP | Setup | Free? | Capabilities |
|-----|-------|-------|-------------|
| MailerLite MCP (Beta) | Remote URL | Sim | Campaigns, subscribers, automation |
| Brevo MCP (Sendinblue) | git clone | Free tier | 100+ tools, email+SMS, automation |
| Elastic Email MCP | git clone (.NET) | Nao | Bulk+transactional, contacts |
| MailerSend MCP (Beta) | Remote URL | Nao | Email sending, templates |

#### Social Media

| MCP | Platforms | Free? |
|-----|----------|-------|
| Twitter/X MCP | Twitter/X | Sim (API limits) |
| Social Media MCP | Twitter+Mastodon+LinkedIn | Sim |
| Reddit MCP | Reddit | Sim |

#### Affiliate Tracking

| MCP | Platform | Setup |
|-----|----------|-------|
| PostAffiliatePro MCP | FlowHunt hosted | Zero setup |
| Tapfiliate MCP | Pipedream hosted | Free tier |
| Refersion MCP | Pipedream hosted | Free tier |
| SnapLinker MCP | AvantLink | Affiliate links |

#### E-commerce & Marketplace

| MCP | Install | Free? |
|-----|---------|-------|
| Shopify MCP | `npx shopify-mcp` | Sim |
| WooCommerce MCP | git clone | Sim |
| Amazon Ads MCP (beta fev 2026) | Official API | Pago |
| Amazon Selling Partner MCP | Community | Sim |
| Stripe MCP | `npx @stripe/mcp` | Sim |

#### Analytics

| MCP | Install | Free? |
|-----|---------|-------|
| Google Analytics MCP (oficial) | `npx google-analytics-mcp` | Sim |
| Microsoft Clarity MCP | Official | Sim |

#### Web Scraping

| MCP | Stars | Free? |
|-----|-------|-------|
| Firecrawl MCP | ~5.2k | Nao (API key) |
| Bright Data MCP | — | 5k req/mes free |
| Apify MCP | — | Free tier |

### APIs (25+)

#### Affiliate Networks & Tracking

| API | Free Tier | Auth | Key Capabilities |
|-----|-----------|------|-----------------|
| Amazon PA-API v5.0 | Sim | AWS Sig v4 | Product search, affiliate links. **DEPRECA 30/04/2026** |
| ClickBank API | Sim | API Key | Analytics, orders, QuickStats |
| Hotmart API | Sim (comissao) | OAuth 2.0 | Webhooks, integracoes nativas, FB Conv API |
| Kiwify | Nativa (sem API) | Dashboard | Links unicos, comissao automatica |
| Shopee Open API | Sim | API Key | Produtos, pedidos, inventario |
| Mercado Livre API | Sim | OAuth 2.0 | Catalogo. **SEM programa de afiliados via API** |
| WeCanTrack | Trial | API Key | Dashboard unificado multi-network |
| Tapfiliate API | Trial | API Key | Conversions, commission |
| Strackr | Trial | API Key | Agregacao multi-network |

#### SEO & Keyword Research

| API | Free Tier | Pricing |
|-----|-----------|---------|
| KWFinder (Mangools) | 5 lookups/24h | Freemium |
| SE Ranking API | 14-day trial | Freemium |
| Moz APIs | 50 rows/mes | $5-$250/mes |
| DataForSEO API | Trial | Pay-per-request |
| Ahrefs API | Nao | $1,249+/mes |
| Search Atlas API | 10 searches/day | Freemium |

#### Email Marketing

| API | Free Tier | Auth |
|-----|-----------|------|
| SendGrid | 100 emails/day | API Key |
| Mailchimp | 2k contacts | API Key |
| ConvertKit | Limitado | API Key |

#### Social Media (Unified)

| API | Platforms | Free? |
|-----|----------|-------|
| Post for Me | 9+ platforms | Trial |
| Ayrshare | 13+ platforms | $25/mes |
| Upload-Post | 10+ platforms | Trial |
| Late | Multi-platform | Trial |
| Meta Graph API | FB/IG | Sim |
| TikTok API | TikTok | Sim (limits) |
| YouTube Data API v3 | YouTube | Sim (quota) |

#### Analytics

| API | Free? |
|-----|-------|
| Google Analytics 4 API | Sim |
| Google Tag Manager | Sim |

#### Landing Pages

| API | Free Tier | Pricing |
|-----|-----------|---------|
| Unbounce | Trial | $79/mes |
| Leadpages | 14-day trial | $37/mes |

### CLIs, Libraries & GitHub Projects (20+)

#### SEO Tools

| Tool | Tipo | Install | Language |
|------|------|---------|----------|
| site-audit-seo | CLI | `npm install -g site-audit-seo` | JS |
| seo-analyzer | npm | `npm install seo-analyzer` | JS |
| @nickreese/seo-lint | CLI | `npm install @nickreese/seo-lint` | JS |
| advertools | Python | `pip install advertools` | Python |
| pyseoanalyzer | Python | `pip install pyseoanalyzer` | Python |
| seo-keyword-research-tool | Python | git clone | Python |
| contentswift | Python | git clone | Python |

#### Email

| Tool | Install | Language |
|------|---------|----------|
| sendgrid-python | `pip install sendgrid` | Python |
| mailchimp-marketing-python | `pip install mailchimp-marketing` | Python |

#### Social Media Scheduling (Self-Hosted)

| Project | Stars | Language | Platforms |
|---------|-------|----------|-----------|
| postiz-app | 1000+ | TypeScript | X, Bluesky, Mastodon, Discord |
| mixpost | 500+ | PHP/Laravel | Multi-platform, Buffer alternative |

#### A/B Testing

| Library | Install | Language |
|---------|---------|----------|
| ab-testing | `npm install ab-testing` | JS |
| @appannie/ab-testing | `npm install @appannie/ab-testing` | JS |
| react-ab-test | `npm install react-ab-test` | React |

#### Affiliate Link Management

| Project | Stars | Purpose |
|---------|-------|---------|
| Weferral | 200+ | Complete affiliate platform |
| Mangosqueezy | 100+ | AI agent for affiliate discovery, Supabase |
| AffEasy | 50+ | Multi-network link management |
| Amazon-Affiliate-Link-Generator | 50+ | Auto-generate Amazon links |
| workers-bulk-redirect | 100+ | Cloudflare Workers link cloaking |

#### Landing Page Generators

| Project | Stars | Purpose |
|---------|-------|---------|
| ConvertFast UI | — | Hero, feature, pricing blocks (MIT) |
| Webstudio | 2000+ | Visual builder, headless CMS |
| aipage.dev | — | AI-powered landing pages |

#### Curated Lists (Reference)

| Project | Purpose |
|---------|---------|
| awesome-seo-tools (serpapi) | 500+ stars, curated SEO tools |
| awesome-affiliates | Curated affiliate programs & APIs |
| awesome-marketing | Marketing tools, books, blogs, podcasts |

---

## Critical Alerts

1. **Amazon PA-API v5.0 depreca em 30 abril 2026** — Migrar para Creators API imediatamente
2. **Mercado Livre** — Sem programa de afiliados via API (manual link generation only)
3. **Hotmart/Kiwify** — Sistemas nativos de afiliados, sem API separada para uso basico
4. **ITP Compliance** — Usar tracking server-to-server (S2S) com Click IDs

---

## Integration Plan

### Imediato (Hoje)

- [ ] Instalar Google Analytics MCP — analytics gratis
- [ ] Configurar MailerLite MCP — apenas URL remota, zero setup
- [ ] Instalar site-audit-seo CLI — `npm install -g site-audit-seo`

### Curto Prazo (Esta Semana)

- [ ] Instalar SEO MCP (free) — research de keywords sem custo
- [ ] Configurar Google Search Console MCP — SERP monitoring
- [ ] Instalar Twitter/X MCP — social posting automatizado
- [ ] Avaliar Brevo MCP — email marketing completo (free tier)

### Medio Prazo (Este Mes)

- [ ] Avaliar Ahrefs MCP (pago) vs SEO MCP (free) — decidir stack SEO
- [ ] Configurar Hotmart API webhooks — tracking de conversoes BR
- [ ] Deploy postiz-app — social scheduling self-hosted
- [ ] Avaliar Bright Data MCP — scraping de concorrentes (5k free/mes)
- [ ] Preparar migracao Amazon PA-API para Creators API (deadline: abril 2026)

### Avaliar Depois

- [ ] Ayrshare API — se volume social justificar $25/mes
- [ ] Amazon Ads MCP — quando iniciar campanhas pagas
- [ ] Mangosqueezy — se precisar de affiliate management proprio

---

## Next Steps

1. @devops deve instalar os Quick Wins (MCPs gratis)
2. Atualizar tool-registry.yaml com novas descobertas (DONE)
3. Criar tasks no squad affiliates que usem as ferramentas descobertas
4. Priorizar migracao Amazon PA-API (deadline abril 2026)

---

_Report Version: 1.0_
_Generated: 2026-02-18_
_Squad: affiliates (17 agents)_
_Research Method: 3 parallel sub-agents (MCP + API + CLI/Library/GitHub)_
