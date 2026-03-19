# site-performance-audit — External Web Performance Audit Squad

Squad de auditoria externa de performance web. Diagnostica sites publicos
sem acesso interno, usando APIs gratuitas (PageSpeed Insights, CrUX, WebPageTest).
Entrega relatorios com hipoteses de causa-raiz e acoes priorizadas por impacto no negocio.

## Quick Start

```bash
# 1. Setup (uma vez)
@site-performance-audit:site-performance-audit-chief
*setup

# 2. Quick audit
*quick-audit https://example.com

# 3. Full audit
*audit https://example.com --strategy both

# 4. With competitors
*audit https://example.com --competitors https://comp1.com,https://comp2.com --industry e-commerce
```

## Architecture

### Agents (8)

| Tier | Agent | Role |
|------|-------|------|
| Orchestrator | `site-performance-audit-chief` | Pipeline coordination & report |
| Tier 0 | `steve-souders` | 14 Rules compliance, Golden Rule |
| Tier 1 | `addy-osmani` | Core Web Vitals diagnosis |
| Tier 1 | `patrick-meenan` | Waterfall & WebPageTest analysis |
| Tier 1 | `harry-roberts` | Resource loading & cache audit |
| Tier 2 | `tammy-everts` | Business impact & prioritization |
| Tier 2 | `tim-kadlec` | JavaScript & third-party analysis |
| Tier 2 | `barry-pollard` | CrUX benchmarking & industry data |

### Tool Infrastructure

| Tool | API | Cost | Limit |
|------|-----|:----:|-------|
| PageSpeed Insights | Google API v5 | Free | 25K req/day |
| CrUX | Google API | Free | 150 req/min |
| WebPageTest | REST API | Free | 300 tests/month |
| GTmetrix | REST API | Paid | Optional |

### Audit Pipeline (5 Phases)

```
Phase 1: Data Collection (Worker — API calls)
    |
Phase 2: Score Interpretation (addy-osmani + steve-souders)
    |
Phase 3: Deep Diagnostics (patrick-meenan + harry-roberts + tim-kadlec)
    |
Phase 4: Hypothesis & Prioritization (tammy-everts + barry-pollard)
    |
Phase 5: Report Generation (site-performance-audit-chief)
```

## Commands

### Core
- `*audit {url}` — Full 5-phase audit with report
- `*quick-audit {url}` — Quick PSI-only check (2-5 min)
- `*benchmark {url} --competitors url1,url2` — Competitive comparison

### Specialist
- `*diagnose-cwv {url}` — Core Web Vitals deep dive
- `*14-rules {url}` — Souders 14 Rules compliance
- `*resources {url}` — JS, images, fonts, 3rd-party analysis
- `*hypotheses` — Generate prioritized fix hypotheses

### Utility
- `*setup` — API key configuration guide
- `*help` — All commands

## File Structure

```
squads/site-performance-audit/
├── agents/
│   ├── site-performance-audit-chief.md    # Orchestrator
│   ├── steve-souders.md       # Tier 0 — 14 Rules
│   ├── addy-osmani.md         # Tier 1 — Core Web Vitals
│   ├── patrick-meenan.md      # Tier 1 — Waterfall
│   ├── harry-roberts.md       # Tier 1 — Resource Audit
│   ├── tammy-everts.md        # Tier 2 — Business Impact
│   ├── tim-kadlec.md          # Tier 2 — JS Analysis
│   └── barry-pollard.md       # Tier 2 — Benchmarking
├── tasks/
│   ├── collect-psi.md         # PSI API collection
│   ├── collect-crux.md        # CrUX API collection
│   ├── collect-wpt.md         # WebPageTest collection
│   ├── diagnose-cwv.md        # CWV diagnosis
│   ├── analyze-resources.md   # Resource analysis
│   ├── benchmark-competitors.md  # Competitive benchmarking
│   ├── generate-hypotheses.md # Hypothesis generation
│   └── full-audit.md          # Full audit orchestration
├── workflows/
│   ├── wf-external-audit.yaml # Main 5-phase workflow
│   └── wf-quick-audit.yaml    # Quick PSI-only workflow
├── templates/
│   └── audit-report-tmpl.md   # Report template
├── checklists/
│   ├── audit-quality-gate.md  # Quality gate checklist
│   └── smoke-test-agents.md   # Agent smoke tests
├── data/
│   ├── api-setup-guide.md     # API configuration guide
│   └── cwv-thresholds.yaml    # CWV thresholds & benchmarks
├── config.yaml                # Squad configuration
└── README.md                  # This file
```

## Requirements

- Google Cloud API Key (free, no credit card)
- WebPageTest API Key (free, optional)
- Node.js 18+ (for curl/API calls)

## Methodology

Based on 7 elite web performance minds:

| Expert | Framework | Source |
|--------|-----------|--------|
| Steve Souders | 14 Rules for High Performance | "High Performance Web Sites" (O'Reilly) |
| Addy Osmani | Core Web Vitals Optimization | Chrome team, web.dev |
| Patrick Meenan | Waterfall Analysis | WebPageTest methodology |
| Harry Roberts | Performance Audit Consulting | CSS Wizardry |
| Tammy Everts | Performance-Business Correlation | "Time Is Money" (O'Reilly) |
| Tim Kadlec | JavaScript Cost Analysis | timkadlec.com |
| Barry Pollard | CrUX Benchmarking | Web Almanac, HTTP Archive |

## Output

Reports são salvos em `docs/outputs/squads/site-performance-audit/` com nomenclatura padronizada por data/hora.

Após qualquer auditoria, use `*save` para persistir o último relatório gerado.

## Troubleshooting

| Problema | Causa | Solução |
|----------|-------|---------|
| HTTP 429 | Rate limit da API | Aguardar 100s e tentar novamente (max 3 retries) |
| HTTP 403 | API key inválida ou expirada | Verificar `GOOGLE_PSI_API_KEY` no `.env`; regenerar key no Google Cloud Console |
| CrUX indisponível | Site com pouco tráfego Chrome | Normal para sites pequenos — auditoria usa apenas dados de lab (Lighthouse) |
| URL inacessível | URL não é pública ou está offline | Verificar se a URL é acessível via browser; confirmar HTTPS válido |

## Limitations

- External audit only — no server access, code access, or internal tools
- Findings are **hypotheses**, not definitive conclusions
- CrUX field data requires sufficient Chrome user traffic
- WebPageTest free tier limited to 300 tests/month
- INP only available via field data (CrUX), not lab tests

## Changelog

| Version | Date | Description |
|---------|------|-------------|
| 1.0.0 | 2026-03 | Initial squad release — 8 agents, 2 workflows, full audit pipeline |
| 1.0.1 | 2026-03-08 | Gate IDs formais, verdict thresholds, cwv-thresholds ref, README sections |

---

*site-performance-audit squad v1.0.1 — Clone minds > create bots.*
