# HYDRA — Autonomous Content Intelligence

**By:** Breno (via AIOS framework)
**Built:** Maio/2026
**PR:** https://github.com/SynkraAI/aiox-core/pull/725
**Stack:** Node.js 20 ESM · better-sqlite3 · DeepSeek/Anthropic/OpenAI · node-cron

---

## O que HYDRA faz

Sistema autônomo que mantém um pool de **162 mind clones especialistas** atualizados com pesquisa fresca, sem intervenção humana.

**O problema que resolve:** mind clones respondem com conhecimento congelado no treino. Sem atualização contínua, consultas viram repetição do passado.

**A solução:** pipeline de content intelligence que roda 2x/dia (6h + 18h BRT), ingere 115 fontes (RSS, GitHub, YouTube, podcasts, web), filtra ruído com LLM scoring, e distribui insights pra cada clone via per-clone markdown feed. Quando você consulta um clone, ele responde com pesquisa de <24h atrás.

```
115 fontes → Pipeline 7-fase → 162 clones com feeds frescos
   ↓             ↓                      ↓
  RSS         Score S/A/B          Consultation
  GitHub      Anti-hallucination   com URLs reais
  YouTube     Tier filtering       quarantine flags
  Podcasts    Token budget         staleness signal
  Web
```

---

## Arquitetura

### Pipeline (7 fases sequenciais)

```
1. Fetch          — 7 adapters (RSS/GitHub/YT/Podcast/Twitter/Web/Newsletter)
   ↓                rate-limited per source type
2. Sanitize       — HTML clean, prompt injection check, PII redact
3. Normalize      — schema único {id, source, url, title, content, ...}
4. Dedup (3-nível) — URL match → content hash → semantic fingerprint
5. Score          — LLM judge classifica em tiers S/A/B
6. Extract        — Wisdom extraction com anti-hallucination
                    (quote verifier contra fonte original)
7. Distribute     — Route to clones via keyword*0.6 + dept*0.3 + tier*0.1
                    Write to per-clone append-only feed
```

### Distribution Algorithm

Roteamento de cada item processado:
- **Score por clone:** `keyword_hits × 0.6 + department_match × 0.3 + tier_bonus × 0.1`
- **Filtro:** score ≥ 0.3
- **Cap:** max 25 clones por item

Exemplo real (sessão 08/Mai com dossiê high-ticket marketing): 1.006 items → **25.150 entries distribuídas** em 25 clones de marketing/sales.

### Consumption (feed-reader)

Quando você consulta um clone via `/expert-consult`:
```js
loadCloneFeeds(cloneId, { days: 30, maxTokens: 30000, minTier: 'A' })
```

Retorna `FeedEntry[]` que vira contexto injetado no prompt:
```markdown
## Recent Knowledge (from HYDRA feed, last 30 days)

### [2026-05-08] [Tier S] Performance MH chatbots in Detecting Suicidal Ideation
**Source:** https://www.nature.com/articles/s41598-025-17242-4
**Key Insights:** Avaliação performance crisis routing.

### [2026-05-08] [Tier S] Digital Therapeutic Alliance (PubMed 2025)
**Source:** https://pubmed.ncbi.nlm.nih.gov/41072011/
**Key Insights:** Diary study + thematic analysis DTA.

[... entries with token budget 30k per expert ...]
```

Tier S/A only por default · B excluído se >7 dias · staleness signal explícito se feed vazio.

---

## Architecture Decisions (4 ADRs)

### ADR-001 — Streaming Pattern
Pure async iteration (`for await`) sobre items. Cada stage é função `(item, context) → {success, item, error}`. Sem throws cross-stage. Failed items vão pra `pipeline_errors` table, run continua.

**Rejected:** Worker threads (problema é memória, não CPU). Queue-based backpressure (await natural já resolve).

### ADR-002 — Vector Search
In-memory LRU cosine cache para 10k embeddings (p99 < 200ms). SQLite é source of truth, cache invalida write-through em `upsert()`.

**Rejected:** sqlite-vss as default (native dep risk cross-platform).

### ADR-003 — Observability
SQLite-based. Tabelas `pipeline_runs` (peak_heap, cost_brl, fatal_error) + `pipeline_items` (per-item structured event) + `pipeline_errors`. CLI `hydra query "<sql>"` (read-only) pra ad-hoc questions sem ship novo código.

**Rejected:** Prometheus/OpenTelemetry (over-engineering single-machine deployment).

### ADR-004 — Consumption Side
`feed-reader.js` co-localizado em `src/distribution/` (writer + reader vizinhos). Token budget 30k per expert (não per conclave). Tier filter S/A default. Quarantine flag para entries pre-anti-hallucination-rollout. Source attribution mandatória.

---

## Como construí — AIOS workflow em ação

Esta sessão (Maio/2026) foi um stress test do framework AIOS rodando em uso real. Workflow: `brownfield-service`.

### Phase 1: Service Analysis & Planning

```
@architect (Aria)  → document-project task → 828 LOC canonical analysis
                     Caught 5 stale memory claims via code verification

@pm (Morgan)       → PRD draft → v0.7 (PO concerns) → v0.9 → v1.0 RC
                     12 stories, 23 risks documented

@architect (Aria)  → architecture.md (1.262 LOC) + 4 ADRs (895 LOC) + audit (199 LOC)

Mind Clone Conclave: martin-fowler + werner-vogels + charity-majors
                     CONSENSUS/DISSENT/BLIND SPOTS synthesis
                     → 3 ADRs derived from peer-debate

@po (Pax)          → 3-pass validation (PASS_WITH_CONCERNS → PASS_WITH_CONCERNS → PASS)
                     Caught C-01..C-10 + RA-6..RA-9 proactively
```

### Phase 2: Document Sharding

```
@po (Pax)          → Shards PRD (16 files) + architecture (12 files)
                     Each story = standalone file with AC + IV + dev notes
                     Ready for @sm to pull individually
```

### Phase 3: Development Cycle

```
@sm + @dev (Dex)   → Story 1.1a: Pre-flight scripts (214 LOC + 132 tests)
                     Story 1.1b: status.js SQLite read (78 LOC)
                     Story 1.12: Feed-reader + consultation patch (957 LOC)

@devops (Gage)     → 6 atomic commits with HEREDOC messages
                     Quality gates pre-commit (npm test 617 passing)
                     Selective git add discipline
```

### Stats da sessão

| Métrica | Valor |
|---------|-------|
| Documentação produzida | ~7.500 LOC |
| Código shipped | 1.052 LOC + 399 tests |
| Tests passing | **617/617** |
| ADRs formalizados | 4 |
| Mind Clones consultados | 3 (conclave) |
| Subagent spawns | ~14 (architect/pm/po/dev/devops × multiple rounds) |
| PO validation rounds | 3 (PRD v0.7 → v0.9 → v1.0 RC) |
| Commits no branch | 6 |
| Stories shipped | 3 |
| Stories pending | 9 |

---

## State atual & roadmap

### Sprint Resilience — 3 stories shipped

✅ **Story 1.1a** — Pre-flight validation scripts (7 scripts, <50 LOC each)
✅ **Story 1.1b** — status.js SQLite read (now reports live counts)
✅ **Story 1.12** — Connect Feeds to Consultation Engine (feed-reader.js + consultation prompt injection)

### Sprint Resilience — 9 stories pending

| # | Story | Estimate |
|---|-------|----------|
| 1.1c | Characterization test fixture | ~200 LOC |
| 1.2 | vector-store SQLite + LRU benchmark | ~400 LOC |
| 1.3 | semantic-dedup SQLite migration | ~350 LOC |
| 1.4 | Pipeline split orchestrator + stages/ | ~1.200 LOC |
| 1.5 | Streaming + pipeline_errors DDL | ~800 LOC |
| 1.6 | Unified DistributionService + 3-layer YAML | ~500 LOC |
| 1.7 | `hydra run --from-jsonl` flag | ~250 LOC |
| 1.8 | Cost tracker + Telegram /cost | ~300 LOC |
| 1.9 | Graceful shutdown + OOM warning | ~250 LOC |
| 1.10 | Documentation + runbook | ~500 LOC |
| 1.11 | pipeline_items + `hydra query` CLI | ~700 LOC |

**Critical path:** 1.1c → 1.4 → 1.5 → 1.11 → 1.10. ~2-3 semanas @dev restante.

### Future: Sprint #3 — HYDRA Portable

Feasibility documentada em `05-feasibility/sprint-3-portable.md`. Recomendação:
- **Mode B (Docker)** — `docker run hydra` com mounted knowledge dir. ~3 semanas.
- **Mode A (Standalone CLI)** — `npm install -g hydra` com BYO setup. ~6 semanas.
- **Mode C (Hosted SaaS)** — Cloud product. 4-6 meses. Treated as different product.

Pre-requisitos: Sprint #1 (Resilience) + Sprint #2 (cleanup `relevantMemory` legacy alias post 2026-06-12) completos.

---

## Onde navegar (no PR)

```
docs/projects/hydra-content-intel/resilience-sprint/
├── 01-analysis/
│   └── project-documentation.md      ← 828 LOC, brownfield analysis
├── 02-prd/
│   ├── prd.md                        ← 931 LOC v1.0 RC, 12 stories
│   └── sharded/                      ← 16 dev-ready story files
├── 03-architecture/
│   ├── architecture.md               ← 1.262 LOC
│   ├── adrs/                         ← 4 ADRs (streaming/vector/observability/consumption)
│   ├── conclave/                     ← mind clone synthesis output
│   └── sharded/                      ← 12 architecture sections
└── 05-feasibility/
    └── sprint-3-portable.md          ← portability analysis
```

Código:
```
tools/hydra/
├── bin/hydra.js                      ← CLI (22 commands)
├── src/
│   ├── pipeline.js                   ← 963 LOC monolith (Story 1.4 splits)
│   ├── distribution/
│   │   ├── mind-clone-router.js      ← scoring + routing
│   │   ├── feed-writer.js            ← append-only per-clone
│   │   └── feed-reader.js            ← Story 1.12 (consumption)
│   ├── sources/                      ← 7 adapters
│   ├── dedup/                        ← SQLite-backed
│   ├── curator/                      ← scoring + filtering
│   └── monitoring/                   ← Telegram bot + alerts
├── scripts/preflight/                ← Story 1.1a validation gates
└── tests/                            ← 45 suites / 617 passing
```

---

HYDRA é a peça que fecha o loop: gera conhecimento fresco → distribui pros clones → clones consultam com pesquisa real, não com conhecimento congelado.

**O resto é Mind Clone DNA fazendo o trabalho dele.**

— Breno
