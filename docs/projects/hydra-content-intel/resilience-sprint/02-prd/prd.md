# HYDRA Resilience Sprint — Brownfield Enhancement PRD

**Project:** HYDRA Content Intelligence System
**Sprint codename:** Resilience
**Version:** 1.0 (Release Candidate)
**Date:** 2026-05-12
**Author:** Orion (aios-master) §1-§5 draft → @pm (Morgan) v0.7/v0.9/v1.0 fixes for PO concerns C-01/C-02/C-06/C-07 + Aria C-10 audit
**Status:** ✅ READY FOR SHARDING — All concerns resolved (C-01..C-10) + ADR-004 added + RA-6..RA-9 covered

---

## 1. Intro Project Analysis and Context

### 1.1 Analysis Source

IDE-based fresh analysis, supplemented by:
- Project memory: `project_hydra.md` (38 days old — verified against current code)
- Code inspection: `D:/AIOS/tools/hydra/` (v1.0.0)
- Session memories: `session_anipis_squad_08mai.md` + `session_highticket_squad_08mai.md` (OOM events)

> ⚠️ **Recommendation:** Run `document-project` task (architect agent) for canonical analysis output. Current draft uses memory + spot-checks. Validate with user.

### 1.2 Current Project State

HYDRA is an **autonomous Content Intelligence System** that ingests 88+ sources (RSS, GitHub, YouTube, Podcast, Twitter, Web, Newsletter) and routes content to 162 Mind Clones in the Jarvis/Mega Brain knowledge base. It runs on Node.js ≥20 (ESM), uses better-sqlite3 for dedup state, multi-LLM (DeepSeek primary, Anthropic/OpenAI fallback), and is operated via Commander CLI + node-cron scheduler + Telegram bot (`@hydra_aios_bot`).

**v1.0.0 status:** Feature-complete across 7 Epics (Foundation, Multi-Source, Intelligence, Automation, Distribution, Security, Anti-Hallucination). **509 tests passing.** **Scheduler currently DOWN** since 08/Mai due to OOM crash.

### 1.3 Available Documentation Analysis

| Documento | Disponível | Fonte |
|-----------|------------|-------|
| Tech Stack | ✅ | `package.json` + `project_hydra.md` |
| Source Tree | ✅ | inspect `src/` (config/, sources/, distribution/, etc.) |
| Coding Standards | ⚠️ Partial | ESM modules, JSDoc typedefs |
| API Documentation | ⚠️ Partial | CLI commands em `bin/hydra.js` |
| External API Docs | ✅ | adapter interfaces |
| Technical Debt | ✅ | session memory + this PRD |

**Documentação faltante crítica:** `document-project` output (canonical analysis). **Recomendação:** rodar antes da arquitetura.

### 1.4 Enhancement Scope Definition

**Tipo de enhancement:**
- ✅ **Performance/Scalability Improvements** (PRIMARY)
- ✅ **Bug Fix and Stability Improvements** (OOM root cause)
- ⚠️ **Major Feature Modification** (pipeline refactor para streaming)

**Enhancement Description (2-3 sentenças):**

Eliminar o OOM crash do scheduler unificando o pipeline em **modo streaming por item** (não batch), migrando `vector-store.js` e `semantic-dedup.js` de JSON monolítico para **SQLite** (mesma migração que `dedup-store` ganhou em 01/Abr), e consolidando os dois codepaths de distribution atuais (live pipeline vs `ingest-dossier.mjs`) em um único `DistributionService` reutilizável. O resultado: scheduler volta a rodar 2x/dia + ingest de dossier vira primeira-classe + sem patches ad-hoc divergindo.

**Impact Assessment:**
- ✅ **Significant Impact** — pipeline.js (35.7KB) será quebrado em estágios; vector-store + semantic-dedup ganham SQLite backend; routing module consolidado
- ❌ **NOT Major Impact** — sem mudança de arquitetura geral (continua: Sources → Normalize → Dedup → Extract → Score → Distribute)

### 1.5 Goals and Background Context

**Goals (outcomes):**

- Scheduler `hydra schedule start` roda 2x/dia (6h, 18h BRT) sem OOM por **30 dias consecutivos**
- Pipeline processa **5.000+ items** em uma run sem ultrapassar **2GB heap usage** (vs 8GB atual estourando)
- Eliminar `ingest-dossier.mjs` como codepath divergente — pipeline live aceita `--from-jsonl <path>` flag nativa
- Eliminar 100% dos patches ad-hoc em `deptToDomainMap` (vira data-driven via `domains.yaml` validado)
- Cost-tracking por LLM provider exposto em `hydra health` + Telegram digest
- **MTTR (Mean Time To Recovery)** de scheduler crash: < 5 min (vs ~38 dias atual)

**Background Context:**

HYDRA v1.0.0 está feature-complete e provou valor (3.771 items processados na melhor run, 25k+ feed writes em sessões de dossier). Mas a primeira run real em produção contínua expôs OOM no `vector-store.js` + `semantic-dedup.js` durante batch processing de runs grandes. Como workaround, o usuário construiu `bin/ingest-dossier.mjs` que bypassa o pipeline completo — pattern útil mas que criou **drift arquitetural** (`deptToDomainMap` ganhou patches só no dossier path; bug de `loadMindCloneIndex` ficou com workaround só no dossier). Resultado: dois codepaths de distribution divergindo + scheduler DOWN há 38 dias.

Este sprint resolve a causa raiz (batch → streaming + JSON → SQLite) **e** unifica os codepaths, devolvendo HYDRA pra modo autônomo 24/7 sem perder o pattern de dossier ingest que funcionou em Anipis + High-Ticket.

### 1.6 Change Log

| Change | Date | Version | Description | Author |
|--------|------|---------|-------------|--------|
| Initial draft | 2026-05-11 | 0.1 | Section 1 (Intro/Analysis) for user validation | Orion (aios-master) |
| Section 2 draft | 2026-05-11 | 0.2 | Requirements (FR/NFR/CR) grounded in @architect document-project | Orion (aios-master) |
| Section 3 draft | 2026-05-11 | 0.3 | Technical Constraints + pre-flight scripts | Orion (aios-master) |
| Sections 4-5 draft | 2026-05-11 | 0.4 | Epic Structure + 10 stories | Orion (aios-master) |
| Conclave updates | 2026-05-11 | 0.5 | Story 1.1 characterization tests, 1.2 LRU spike, 1.5 per-stage `{success, error}`, new Story 1.11 (pipeline_items + hydra query) | Orion (aios-master) |
| Architecture decisions | 2026-05-11 | 0.6 | Story 1.1 split (1.1a/1.1b/1.1c), sqlite-vss fallback approved (Option A), synthetic characterization fixture, pipeline.js shim kept 1 release, `__dirname` refactor deferred to sprint #2 | Orion (aios-master) |
| PO concerns C-01/C-02 + minor clarifications | 2026-05-12 | 0.7 | Story 1.1 split into 1.1a/1.1b/1.1c (formalized in PRD body), Story 1.5 AC#8 clarified (`pipeline_errors` table ships with 1.5, not 1.11), Story 1.11 AC#2 reworded to extend existing table, C-03/C-04/C-05 wording fixes | @pm (Morgan) |
| 🚨 Critical bug discovery — Story 1.12 added | 2026-05-12 | 0.8 | Empirical validation revealed `self-consultation.js` does NOT read HYDRA feeds. `relevantMemory: []` always empty. Without fix, all generated feeds are write-only silo. Added Story 1.12 (Connect Feeds to Consultation Engine). | Orion (aios-master) |
| C-06 diagram fix + C-07 token policy | 2026-05-12 | 0.9 | §5.1 diagram includes Story 1.12, AC #3 + new AC #11 in Story 1.12 clarify per-expert token budget (30k × N experts for conclave) | @pm (Morgan) |
| Aria C-10 audit applied | 2026-05-12 | 1.0 | Story 1.12 AC #2 rewrites field name (relevantMemory → feedEntries, legacy kept as alias), new AC #12 documents legacy retention, RA-6/RA-7/RA-8/RA-9 added to §3.5 risk table | @pm (Morgan) |

### 1.7 Document-Project Corrections to §1

@architect's canonical analysis (`01-analysis/project-documentation.md`, 828 lines) corrected three stale memory claims that affect this PRD:

| Memory said | Reality (verified in code) | Sprint impact |
|-------------|------------------------|---------------|
| Scheduler DOWN since 08/Mai (38 days) | DOWN since **16/Abr** per `hydra-data/state/heartbeat.json` (25 days) | NFR3 baseline date corrected |
| OOM "needs SQLite migration" | OOM is **read-entire-JSON → mutate → write-entire-JSON per item** in 2 specific files (`semantic-dedup.js:242-263` + `vector-store.js:118-161`) totaling **37.4MB** of redundant I/O per item × thousands of items per run | FR1 + FR2 now have precise targets |
| "Merge two `deptToDomainMap`s" | The two maps are at **different semantic levels** — router map keys by *department* (`mental-health-ops`), dossier map keys by *angle* (`PSICOLOGIA`). They share zero keys and must **coexist**. Fix is a third layer (angle → domain → department). | FR5 redesigned |

**Additional findings from architect:**
- 115 sources configured (not 88 as memory said) — affects sizing in NFR1
- `pipeline.js` is **963 LOC** (not 35.7KB which was file size) — refactor scope clarified
- `pipeline.js` has **ZERO direct tests** — FR6 added (E2E test before refactor)
- `status.js:9` reports stale legacy counts — FR7 added (trivial but blocks self-diagnosis)
- 25+ files use `__dirname` relative resolution — affects programmatic invocation patterns (CR4 caveat)

---

## 2. Requirements

> Requirements grounded in **verified code analysis** from `01-analysis/project-documentation.md`. Each requirement traces to a specific file/line or section number. Brownfield principle: **preserve existing behavior** unless explicitly modifying it.

### 2.1 Functional Requirements

**FR1 — Streaming pipeline execution**
The pipeline MUST process items in streaming fashion (fetch → sanitize → dedup → score → store → distribute → discard from memory) rather than holding the full `allContent[]` array in memory throughout execution. Source: `pipeline.js:236-275` currently fetches ALL items before processing.

**FR2 — Migrate vector-store + semantic-dedup to SQLite**
`src/store/vector-store.js` and `src/dedup/semantic-dedup.js` MUST use the existing SQLite singleton (`dedup-store.js:20`) as their persistence layer. JSON file backing (`vectors/vector-index.json` 16.7MB + `fingerprints/fingerprints.json` 20.7MB) MUST be migrated, with the legacy JSON kept read-only for one full release cycle as fallback.

**FR3 — Pipeline accepts `--from-jsonl <path>` flag**
`hydra run --from-jsonl <path> [--skip-fetch]` MUST process a JSONL dossier through the same pipeline (with selectable phase skipping for dossier-already-curated content). Goal: deprecate `bin/ingest-dossier.mjs` as separate codepath.

**FR4 — Unified DistributionService**
A single `DistributionService` module MUST be the only caller path to `routeToMindClones()` + `writeKnowledgeFeed()`. Both pipeline live mode and dossier ingest mode invoke it identically. Source: eliminates divergence documented at `pipeline.js:732-775` vs `ingest-dossier.mjs:50-74`.

**FR5 — Three-layer domain mapping (data-driven)**
Domain mapping MUST be expressed as **three composable layers**, all in YAML:
- Layer A: `angle_to_domain.yaml` — angle codes (`PSICOLOGIA`, `CLINICO`, …) → HYDRA domains
- Layer B: `domains.yaml` (existing) — domain → keywords for matching
- Layer C: `dept_to_domain.yaml` — mind-clone department → domains (currently hardcoded at `mind-clone-router.js:159-191`)

All three loaded by `DistributionService`. Code-level patches forbidden after this PR.

**FR6 — Pipeline E2E integration test**
A new `tests/pipeline.integration.test.js` MUST exist and run as part of `npm test`. It MUST execute the full pipeline against fixture sources (1 RSS feed + 1 mock LLM) and assert side effects on `hydra.db`, knowledge feed files, and `digest` outputs. Required because `pipeline.js:0-963` currently has zero direct tests.

**FR7 — `hydra status` reports live SQLite counts**
`src/status.js:9` MUST replace `getIndexStats()` (legacy JSON) with `DedupStore.getStats()`. The legacy `dedup-index.js` import is forbidden from `status.js`. Affects only the `hydra status` CLI output.

**FR8 — Cost tracking per LLM provider**
A new `src/monitoring/cost-tracker.js` module MUST log per-LLM-call token usage + cost estimate to SQLite (`pipeline_runs` table gains `cost_cents` and `tokens_in`/`tokens_out` columns OR a new `llm_calls` table). Exposed via `hydra health --json` and Telegram digest.

**FR9 — Telegram digest includes cost summary**
Post-pipeline Telegram report (`telegram-bot.js:postRunSummary`) MUST include: items processed, tier breakdown (S/A/B), distribution counts, **cost in BRL (sum of provider costs converted at run-time rate)**, run duration.

**FR10 — Graceful shutdown closes SQLite**
`pipeline.js:212-224` (SIGTERM handler) MUST call `dedupStore.close()` + `auditLogger.close()` before exit. Currently the singleton stays open and tests have to use `resetDedupStore()` as a workaround.

### 2.2 Non-Functional Requirements

**NFR1 — Heap budget**
Pipeline MUST process a 5,000-item run with **peak heap usage ≤ 2GB** (Node default heap). Current 8GB-with-OOM is unacceptable. Measured via `--inspect` + `process.memoryUsage().heapUsed` sampled every 60s during the run.

**NFR2 — Semantic-dedup lookup latency**
`semantic-dedup.checkSemantic()` MUST return p99 ≤ 50ms for a fingerprint table of 10k entries. Current JSON path is O(n) cosine over all fingerprints (acceptable today only because n is small). Future SQLite path MUST NOT regress this — likely requires in-memory LRU cache + batch lookups.

**NFR3 — Scheduler uptime**
After deployment, scheduler MUST run uninterrupted for **30 consecutive days** at the configured cron schedule (6h + 18h BRT full pipeline, every-4h RSS) without manual intervention. Baseline: scheduler has been DOWN since **2026-04-16** (verified via heartbeat).

**NFR4 — MTTR for scheduler crash**
If the scheduler crashes despite the fix, operator MUST be able to restart via `hydra schedule start` in **< 5 minutes** from Telegram alert. Requires: Telegram alert on crash + clear restart documentation in `docs/projects/hydra-content-intel/resilience-sprint/05-runbook/`.

**NFR5 — Vector search performance preserved**
`vector-store.search()` (used by `hydra search` CLI at `bin/hydra.js:425-449`) MUST return p99 ≤ 200ms for a corpus of 10k vectors. Current JSON path requires loading full file; SQLite path MUST use indexed similarity (sqlite-vss or a custom index).

**NFR6 — No CLI behavior regression**
All 22 commands in `bin/hydra.js` MUST behave identically pre/post sprint for unchanged flags. New flags (e.g., `--from-jsonl`) are additive only.

**NFR7 — Test coverage minimum**
Sprint MUST add tests bringing `pipeline.js` from 0 direct tests to at least:
- 1 happy-path E2E integration test (FR6)
- 1 OOM-prevention test (asserts heap stays below threshold for 1000-item run with mock sources)
- 1 backwards-compat test (asserts dossier ingest via `--from-jsonl` writes same feed content as legacy `ingest-dossier.mjs` for a reference jsonl)

**NFR8 — Migration safety**
JSON → SQLite migration for vector-store + semantic-dedup MUST be:
- Idempotent (re-running migration is safe — `INSERT OR IGNORE` pattern from `migrate-to-sqlite.js`)
- Reversible for **one release cycle** (legacy JSON kept read-only, env flag `HYDRA_USE_LEGACY_VECTOR_STORE=1` falls back)
- Validated against `validate-heap.mjs` (the existing diagnostic) post-migration

**NFR9 — Audit logging unchanged**
SQLite audit_log table (Epic 6) schema MUST NOT change. `AuditLogger` interface preserved. Source: `pipeline.js:196-206` audit path is on the critical write path of every pipeline run.

### 2.3 Compatibility Requirements

**CR1 — CLI public API stability**
All 22 `bin/hydra.js` commands MUST continue to work with their current flags. Examples:
- `hydra run` (no flags) → same behavior
- `hydra schedule start` → same behavior
- `hydra search "<query>" [--domain] [--limit]` → same behavior
- Breaking changes to CLI argv contract are forbidden in this sprint.

**CR2 — Database schema additive only**
SQLite migrations MUST be **additive** (new tables, new columns with defaults). Existing tables (`urls`, `content_hashes`, `pipeline_runs`, `audit_log`, `entity_graph`) and their columns MUST NOT be dropped or have their types changed. Existing queries continue to work.

**CR3 — Mind-clone feed format unchanged**
The append-only markdown format at `D:/jarvis/mega brain/knowledge-feed/{clone-id}/YYYY-MM-DD-hydra-feed.md` MUST be byte-compatible with current output. Any consumer (manual reading by user, future LLM ingestion) sees zero format change. Header structure, item separators, frontmatter (if any) preserved.

**CR4 — Integration points preserved**
- Telegram Bot API contract (`telegram-bot.js` command surface) unchanged
- `mind-clone-index.json` schema unchanged (HYDRA reads it, doesn't write)
- `domains.yaml`, `routing.yaml`, `thresholds.yaml`, `scheduler.yaml`, `sources.yaml` — existing keys preserved; new keys allowed
- Jarvis KB filesystem path (`D:/jarvis/mega brain/knowledge/{domain}/{slug}.md`) unchanged
- LLM provider env var auto-detection order unchanged (DeepSeek > Anthropic > OpenAI)

**CR5 — Test runner unchanged**
`npm test` continues to use `bin/jest.js` ESM wrapper. No migration to vitest/node:test in this sprint.

**CR6 — Node version unchanged**
`engines.node >= 20.0.0` stays. No upgrade to Node 22 or 24 in this sprint (out of scope; reduces blast radius).

---

## ⏸️ AGUARDANDO VALIDAÇÃO DO USUÁRIO — §2

> Per template `workflow.mode: interactive` + `elicit: true`. Próximas seções (§3 Technical Constraints, §4 Epic Structure, §5 Stories) só após validação desta.

**Decisões aprovadas pelo usuário (11/Mai):**
- ✅ §2 aprovada integralmente
- ✅ NFR1 = 2GB heap budget
- ✅ FR5 = 3 YAMLs separados (angle/domain/dept)

---

## 3. Technical Constraints and Integration Requirements

### 3.1 Existing Technology Stack

Source: `D:/AIOS/tools/hydra/package.json` (verified).

**Languages:** JavaScript (ES2022+ via Node 20)
**Module system:** ESM (`"type": "module"` in package.json)
**Runtime:** Node.js ≥20.0.0
**Frameworks:** None (vanilla Node + Commander CLI)
**Database:** better-sqlite3 ^12.8.0 (synchronous CJS, loaded via `createRequire` workaround in `dedup-store.js:17`)
**LLM providers:** OpenAI ^6.33.0 (used for both DeepSeek-compatible API + OpenAI direct) + Anthropic SDK ^0.39.0
**Scheduler:** node-cron ^3.0.3
**Config:** js-yaml ^4.1.0 (all `*.yaml` files in `src/config/`)
**RSS:** rss-parser ^3.13.0
**Logging:** pino ^9.14.0 (JSON structured, API key redaction)
**Testing:** Jest ^29.7.0 wrapped via `bin/jest.js` ESM shim

**External binaries assumed installed (NOT in package.json):**
- `yt-dlp` — YouTube transcript download
- `whisper` / `faster-whisper` (CTranslate2, int8, CPU) — audio transcription
- (System) `git` — present but not used at runtime

**Notable absent dependencies:**
- ❌ No HTTP client lib — uses native `fetch` + `node:fs` for downloads
- ❌ No dotenv — DIY env loader at `bin/hydra.js:18-30`
- ❌ No linter configured (`"lint": "echo 'No linter configured yet'"`)
- ❌ No Telegram SDK — hand-rolled fetch calls in `telegram-bot.js` + `telegram-alerter.js`

### 3.2 Integration Approach

**Database Integration Strategy:**

- **Reuse existing SQLite singleton** at `src/dedup/dedup-store.js:20` (`_instance` pattern). DO NOT create a second database connection.
- New tables added in this sprint live in the same `hydra-data/hydra.db`:
  - `vector_embeddings` (replaces `vectors/vector-index.json`)
  - `semantic_fingerprints` (replaces `fingerprints/fingerprints.json`)
  - `llm_calls` (cost-tracker per FR8 — OR new columns on `pipeline_runs`, decided in architecture phase)
- Migrations follow the pattern in `src/dedup/migrate-to-sqlite.js`:
  - Idempotent via `INSERT OR IGNORE` + `CREATE TABLE IF NOT EXISTS`
  - One-shot script invoked via `npm run migrate:vector-store` and `npm run migrate:semantic-dedup`
  - JSON files renamed to `*.legacy.json` (not deleted) for one release cycle
- `AuditLogger` and `EntityGraph` reach into `store.db` directly to share connection — **DO NOT break this**. Closing the singleton breaks all three.

**API Integration Strategy:**

- HYDRA exposes **no HTTP API**. Public surface is the CLI (`bin/hydra.js`, 22 commands) + Telegram bot.
- Sprint adds new CLI flag `--from-jsonl <path>` to `hydra run`. Additive only — no flag removal.
- New CLI commands:
  - `hydra migrate vector-store` (one-shot)
  - `hydra migrate semantic-dedup` (one-shot)
  - `hydra cost` (read-only — reports cost from cost-tracker)
- Telegram bot gains 1 new command: `/cost [--days N]`

**Frontend Integration Strategy:** N/A — HYDRA has no frontend.

**Testing Integration Strategy:**

- Continue Jest via `bin/jest.js` ESM wrapper (CR5).
- New `tests/pipeline.integration.test.js` (FR6) uses mock LLM (responds with canned JSON) + 1 fixture RSS source (XML in `tests/fixtures/`).
- New `tests/heap-budget.test.js` (NFR1) instruments `process.memoryUsage()` during a 1000-item synthetic pipeline run.
- Existing 37 test files unchanged unless modified production code requires it.
- `migrate-to-sqlite.js` pattern gets a test (was previously untested per architect §9).

### 3.3 Code Organization and Standards

**File Structure Approach:**

New modules follow existing `src/{layer}/{module}.js` convention:
```
src/
├── distribution/
│   └── distribution-service.js  ← NEW (FR4 — unified service)
├── monitoring/
│   └── cost-tracker.js          ← NEW (FR8)
├── store/
│   └── vector-store.js          ← REWRITTEN (FR2 — SQLite backend)
├── dedup/
│   └── semantic-dedup.js        ← REWRITTEN (FR2 — SQLite backend)
├── pipeline/                     ← NEW DIRECTORY (FR1 — pipeline broken up)
│   ├── stages/                   ← Stage modules (fetch, sanitize, dedup, …)
│   └── orchestrator.js           ← Replaces monolithic pipeline.js
└── config/
    ├── angle_to_domain.yaml      ← NEW (FR5 Layer A)
    └── dept_to_domain.yaml       ← NEW (FR5 Layer C, extracted from router)
```

`src/pipeline.js` retained as **thin re-export shim** during transition for backwards-compat. Removed in sprint #2 after one release cycle.

**Naming Conventions:**

- Files: kebab-case (e.g., `cost-tracker.js`, `distribution-service.js`)
- Functions/methods: camelCase
- Constants: SCREAMING_SNAKE_CASE
- SQLite tables: snake_case (`vector_embeddings`, `llm_calls`)
- YAML keys: snake_case (matching existing `routing.yaml`, `scheduler.yaml`)
- Test files: `{module}.test.js` (unit), `{feature}.integration.test.js` (integration)

**Coding Standards:**

- JSDoc typedefs for all public functions (existing pattern at `pipeline.js:58-83`, `mind-clone-router.js:19-34`)
- ESM imports only — DO NOT introduce `require()` except for the documented `createRequire` workaround for `better-sqlite3`
- No `eval()`, no dynamic `Function()` constructors (per existing Epic 6 security)
- All async functions must handle errors — pipeline-level errors go through the existing try/catch + audit log pattern (`pipeline.js:196-206`)
- Logger: use existing `pino` logger; never `console.log` in production code paths (allowed in CLI handlers in `bin/hydra.js`)
- No new top-level dependencies without explicit ADR (out of scope: TypeScript, ORMs, http frameworks)

**Documentation Standards:**

- Each new module starts with `@module` JSDoc block (existing pattern at `mind-clone-router.js:1-10`)
- ADRs for architectural decisions live in `docs/projects/hydra-content-intel/resilience-sprint/03-architecture/adrs/`
- Migration runbooks live in `docs/projects/hydra-content-intel/resilience-sprint/05-runbook/`
- CHANGELOG entries follow Conventional Commits (per `D:/AIOS/.claude/CLAUDE.md`)

### 3.4 Deployment and Operations

**Build Process Integration:**

- HYDRA has no build step (Node ESM directly). No changes.
- `npm install` continues to be the install path.
- One-time setup commands documented in runbook:
  ```bash
  cd D:/AIOS/tools/hydra
  npm install
  cp .env.example .env  # fill DEEPSEEK_API_KEY, TELEGRAM_*, etc.
  hydra migrate vector-store     # NEW
  hydra migrate semantic-dedup   # NEW
  hydra schedule start            # restored from DOWN state
  ```

**Deployment Strategy:**

- HYDRA runs on the user's local Windows machine (`D:/AIOS/tools/hydra/`). No remote deployment.
- Migrations execute in this order:
  1. **Pre-flight check:** `validate-heap.mjs` confirms current JSON file sizes
  2. **Backup:** copy `hydra-data/vectors/vector-index.json` and `hydra-data/fingerprints/fingerprints.json` to `*.backup.json`
  3. **Migrate vector-store:** `hydra migrate vector-store` (SQLite-backed, then validates row count vs JSON entries)
  4. **Migrate semantic-dedup:** `hydra migrate semantic-dedup` (same pattern)
  5. **Smoke test:** `hydra run --dry-run --sources rss` confirms pipeline assembles
  6. **Rollback gate:** if heap >2GB observed during smoke test, set `HYDRA_USE_LEGACY_VECTOR_STORE=1` and re-run
  7. **Production restart:** `hydra schedule start`
  8. **Monitor:** Telegram `/health` 1h, 6h, 24h post-restart

- **Rollback procedure:** documented in runbook. Either env flag (NFR8) or restore `*.backup.json` files + restart pre-sprint code via `git checkout {pre-sprint-commit}`.

**Monitoring and Logging:**

- Existing `pino` JSON logging unchanged
- Existing Telegram alerts unchanged (level: HIGH+ goes to bot)
- **New:** cost-tracker metrics exposed via `hydra health --json` (FR8)
- **New:** per-run heap peak logged to `pipeline_runs` table (column `peak_heap_mb`)
- **New:** OOM detection — if `process.memoryUsage().heapUsed > 1.8GB` mid-run, log warning + Telegram alert before crash

**Configuration Management:**

- All new behavior controlled via YAML in `src/config/` (existing pattern)
- New env vars:
  - `HYDRA_USE_LEGACY_VECTOR_STORE=1` (rollback flag, NFR8)
  - `HYDRA_HEAP_WARN_MB=1800` (configurable warning threshold)
  - `HYDRA_COST_BRL_RATE=5.20` (USD→BRL conversion rate for cost reports)
- No new secrets. Existing secrets (`DEEPSEEK_API_KEY`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`) continue to live in `.env`.

**Pre-flight Test Scripts (NEW — required before any migration runs):**

A formalized pre-flight suite MUST exist and pass before migration. Lives at `scripts/preflight/`:

| Script | Purpose | Exit code 0 means |
|--------|---------|-------------------|
| `preflight/00-disk-space.mjs` | Check ≥500MB free in `hydra-data/` | Disk OK |
| `preflight/01-validate-heap.mjs` | Wraps existing `validate-heap.mjs` — confirms current JSON sizes match expected (~37MB total) | Files exist + parseable |
| `preflight/02-backup-verify.mjs` | Verifies `*.backup.json` exists for both vector-index and fingerprints, byte-equals source | Backups present + valid |
| `preflight/03-sqlite-health.mjs` | Runs `PRAGMA integrity_check` on `hydra.db` | DB consistent |
| `preflight/04-no-active-lock.mjs` | Confirms no scheduler/pipeline holding `hydra-data/state/scheduler.lock` | Safe to migrate |
| `preflight/05-env-validate.mjs` | All required env vars present (`DEEPSEEK_API_KEY`, `TELEGRAM_*`) | Env complete |
| `preflight/all.mjs` | Runs all above sequentially, halts on first failure | Ready to migrate |

**Wired into commands:**
- `hydra migrate vector-store` MUST invoke `preflight/all.mjs` first. Refuses to run on any exit ≠ 0.
- `hydra migrate semantic-dedup` same gate.
- Post-migration: `scripts/postflight/01-row-count-match.mjs` confirms SQLite row count == JSON entry count before declaring success.

**Each pre-flight script is < 50 LOC, no external deps, fails loud with actionable error message.** This is non-negotiable — added per user directive 2026-05-11 to prevent the "user forgets backup" risk class (R11).

### 3.5 Risk Assessment and Mitigation

**Technical Risks:**

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **R1: SQLite migration corrupts data** | Low | High | Backup JSON files to `*.backup.json` before migration. Validate row counts post-migration. Reversible via env flag for 1 release. |
| **R2: Semantic-dedup latency regresses past 50ms** | Medium | Medium | Pre-test SQLite-backed lookup with synthetic 10k fingerprints before merging. In-memory LRU cache layer if needed (decided in architecture phase). |
| **R3: Pipeline refactor breaks transitively-tested behavior** | High | High | FR6 (E2E integration test) is non-negotiable. Run full test suite + smoke pipeline against 1 RSS source per PR. |
| **R4: 3-layer domain mapping introduces routing regressions** | Medium | Medium | Snapshot routing decisions BEFORE (current state) and AFTER (new 3-layer) for 100 sample items. Diff must be empty for unchanged content. |
| **R5: Cost-tracker overhead slows LLM calls** | Low | Low | Token counting is local (no network). DB insert happens async after LLM response returns. Profile in NFR8 validation. |
| **R6: `vector-store.search()` p99 > 200ms post-migration** | Medium | Medium | Benchmark before merge. Either SQLite + index, or sqlite-vss extension, or in-memory cosine on warm cache. ADR in architecture phase. |
| **R7: Singleton DB close cascades break audit + entity-graph** | High | High | Graceful shutdown sequence MUST close `AuditLogger` and `EntityGraph` BEFORE closing the underlying DB. Test explicitly. |
| **RA-6: Conclave token blowup** | Medium | Medium | 30k per-expert cap (Story 1.12 AC #3). Telegram alert if conclave cost > R$3.00 (2× normal). |
| **RA-7: Feedback loop with pre-fix hallucinated feeds** | Medium | High | Quarantine all entries with `generated_at < 2026-05-12` per ADR-004 §5. `loadCloneFeeds()` flags quarantined entries; prompt warns LLM. Backfill anti-hallucination check optional Sprint #2. |
| **RA-8: `relevantMemory` shape break** | Low | High | RENAME field to `feedEntries` per C-10 audit recommendation. Legacy `relevantMemory: string[]` kept as `[]` alias for 1 release. Audit (4 callers) confirms only renderer would break; renderer updated in Story 1.12. |
| **RA-9: Filename date parsing fragility** | Low | Low | `loadCloneFeeds()` uses regex `^(\d{4})-(\d{2})-(\d{2})-hydra-feed\.md$`. Files not matching regex are skipped with pino warn. Unit test in `tests/distribution/feed-reader.test.js`. |

**Integration Risks:**

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **R8: `ingest-dossier.mjs` users depend on its absolute-path workaround** | Medium | Low | Keep `ingest-dossier.mjs` as wrapper script during transition. Internally it now calls `hydra run --from-jsonl`. Print deprecation warning. |
| **R9: `__dirname` path workarounds (25+ files) bite during refactor** | Medium | Medium | Each refactored file gets a unit test that asserts `__dirname` resolution. Don't move files across directories without testing. |
| **R10: `pipeline_runs` schema additions break existing queries** | Low | Medium | All new columns with `DEFAULT` clauses. Existing queries select specific columns; new columns don't appear unless requested. |

**Deployment Risks:**

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **R11: User runs migration without backup** | Medium | High | Migration script FAILS if `*.backup.json` doesn't exist. Force backup as pre-flight. |
| **R12: Scheduler restart at wrong time blocks running job** | Low | Medium | Use existing lock file (`hydra-data/state/scheduler.lock`, TTL 1h). Refuse start if locked. |
| **R13: Cron fires during migration** | Low | High | Migration script acquires the same lock. Cron job aborts cleanly if locked. |
| **R14: Out-of-disk during SQLite WAL growth** | Low | Medium | Pre-flight check ensures ≥500MB free in `hydra-data/`. Document `PRAGMA wal_checkpoint(TRUNCATE)` in runbook. |

**Mitigation Strategies (cross-cutting):**

- **All risks above tracked in retrospective.** Sprint completion review marks each risk as actualized/avoided.
- **Telegram alerting expanded:** new alert types for migration failures, OOM warnings, audit_log insert failures.
- **Conclave consultation deferred to architecture phase** — martin-fowler (streaming patterns), werner-vogels (idempotency, blast radius), charity-majors (observability/instrumentation) advise on R3, R6, R7.
- **`validate-heap.mjs` is the canonical pre/post benchmark.** Sprint must not merge if validate-heap shows post-fix run consuming >2GB.

---

**Decisões aprovadas pelo usuário (11/Mai):**
- ✅ §3 aprovada
- ✅ Adicionar pre-flight test scripts (já incluídos acima)
- ✅ Quebrar pipeline.js em `src/pipeline/{orchestrator + stages/}`

---

## 4. Epic and Story Structure

### 4.1 Epic Approach

**Epic Structure Decision: Single comprehensive epic.**

**Rationale:** Per brownfield-prd-tmpl guidance ("favor a single comprehensive epic unless the user is clearly requesting multiple unrelated enhancements") and grounded in the @architect analysis:

- All sprint requirements share **one root cause** — the OOM in 2 specific files (`semantic-dedup.js:242-263` + `vector-store.js:118-161`) and the **codepath drift** it forced (`ingest-dossier.mjs` bypass)
- Stories are tightly coupled: pipeline streaming (FR1) requires SQLite-backed stores (FR2); unified DistributionService (FR4) requires both the new pipeline shape AND the 3-layer domain mapping (FR5)
- Splitting into multiple epics would create artificial boundaries and dependency tangles between sprints

**Trade-off acknowledged:** A single epic means a single all-or-nothing release. Mitigated by:
- Stories sequenced to be **independently shippable** where possible (FR7 status.js fix ships first, FR8 cost-tracker can ship before or after main refactor)
- Feature flags (`HYDRA_USE_LEGACY_VECTOR_STORE`) allow incremental rollout post-merge

---

## 5. Epic 1: HYDRA Resilience — OOM Elimination + Distribution Unification

**Epic Goal:**
Restore HYDRA's autonomous 24/7 operation by eliminating the OOM root cause (JSON-monolith persistence in vector-store + semantic-dedup), unifying the divergent distribution codepaths (pipeline live vs. `ingest-dossier.mjs`), and adding operational observability (cost tracking + heap monitoring) — all while preserving 100% of the existing CLI public API surface and feed output format.

**Integration Requirements:**
- All 22 CLI commands preserved (CR1)
- SQLite schema additive only (CR2)
- Mind-clone feed format byte-compatible (CR3)
- Telegram + index.json + YAML configs preserved (CR4)
- Tests run via existing `bin/jest.js` ESM wrapper (CR5)
- Node ≥20 unchanged (CR6)

---

### Story 1.1a: Pre-flight validation scripts

**Status:** ✅ SHIPPED 2026-05-11 — see commit baseline (implemented by @dev in parallel with PRD validation per user directive).

**As a** HYDRA operator,
**I want** a formalized pre-flight validation suite that runs before any migration,
**so that** I never run a destructive operation with missing backups, an unhealthy DB, or an active lock.

**Acceptance Criteria:**
1. `scripts/preflight/` directory contains 7 files: 6 numbered individual checks (`00-disk-space.mjs`, `01-validate-heap.mjs`, `02-backup-verify.mjs`, `03-sqlite-health.mjs`, `04-no-active-lock.mjs`, `05-env-validate.mjs`) plus orchestrator `all.mjs` — 6 checks + 1 orchestrator = 7 files total
2. Each script < 50 LOC, no new dependencies, exits 0 on success / ≠ 0 with actionable error message
3. `preflight/all.mjs` runs all 6 checks sequentially, halts on first failure with the failing check's exit code
4. Unit tests added for each pre-flight script under `tests/preflight/`
5. `hydra migrate vector-store` and `hydra migrate semantic-dedup` MUST invoke `preflight/all.mjs` first and refuse to run on any non-zero exit (wiring deferred to Stories 1.2/1.3 — Story 1.1a only delivers the scripts + tests)

**Integration Verification:**
- **IV1:** Pre-flight scripts do not modify any state — pure read-only verification (no writes to `hydra-data/`, no file creation outside `tests/preflight/` test output)
- **IV2:** Running `node scripts/preflight/all.mjs` on a healthy install exits 0 in < 5s
- **IV3:** Each failure mode (no disk space, no backup, lock held, missing env var, corrupted DB) is reproducible via test fixture and produces the documented exit code

---

### Story 1.1b: status.js SQLite read fix

**As a** HYDRA operator,
**I want** `hydra status` to read live counts from SQLite instead of a frozen legacy JSON file,
**so that** my self-diagnosis surface reflects reality (thousands of URLs, not the frozen 209 from the obsolete JSON path).

**Acceptance Criteria:**
1. `src/status.js:9` replaces `getIndexStats()` (legacy `dedup-index.js` JSON path) with `DedupStore.getStats()` (SQLite) — trivial 2-line fix per FR7
2. The legacy `dedup-index.js` import is forbidden from `status.js` (covered by a unit test that grep-asserts the import is absent)
3. `hydra status` output shows live SQLite counts: total URLs, total content hashes, last run timestamp — all sourced from `hydra.db`
4. Unit test added for `status.js` asserting it calls `DedupStore.getStats()` once and renders the returned object

**Integration Verification:**
- **IV1:** Existing `hydra status` consumers (Telegram bot `/status` command at `telegram-bot.js`) display correct numbers (verified manually post-deploy)
- **IV2:** No regression in startup time of `hydra status` (currently < 500ms — `DedupStore.getStats()` is a prepared aggregate, faster than the JSON parse path)
- **IV3:** `hydra status` exit code remains 0 on a healthy install and ≠ 0 if the DB is missing/locked (same contract as today)

---

### Story 1.1c: Characterization test fixture

**As a** HYDRA developer,
**I want** a deterministic snapshot of the current pipeline's behavior captured BEFORE any refactor,
**so that** Stories 1.4 + 1.5 (pipeline split + streaming) cannot merge if they alter observable output.

**Acceptance Criteria:**
1. **CHARACTERIZATION TEST FIXTURE (per conclave ADR-001):** Capture current pipeline behavior on 50 synthetic fixture items (mix of S/A/B tiers + dedup hits + filter rejects). Stored at `tests/fixtures/pipeline-characterization-2026-05-11/`.
   - 50 fixture input items (JSONL) — deliberately curated, deterministic content (not scraped from live sources)
   - Snapshot of pipeline output: which items were filtered, scored, distributed, to which clones
   - Snapshot of side effects: SQLite row deltas, feed file additions, audit log entries
2. **Deterministic mocked LLM responses (no real API calls during characterization test):** Fixture includes canned JSON responses per item, served via `MockLLMClient` (per architecture §8.4). The characterization test MUST NOT invoke DeepSeek/Anthropic/OpenAI live APIs — failure to mock is a defect. This is mandatory per user-approved decision 2026-05-11 (synthetic curated fixture, mocked LLM).
3. Snapshot test `tests/pipeline.characterization.test.js` re-runs the pipeline on the fixture and asserts byte-identical output (filter decisions, tier assignments, clone routing, feed write paths) post-refactor
4. **Fixture is the regression net for Stories 1.4 + 1.5.** Refactor stories CANNOT merge if characterization test fails (enforced as a required check, not advisory)
5. Documentation: `tests/fixtures/pipeline-characterization-2026-05-11/README.md` explains fixture composition, how to regenerate snapshots when intentional behavior changes ship, and the "no live LLM" rule

**Integration Verification:**
- **IV1:** Characterization fixture captures CURRENT behavior — re-running the snapshot test on unchanged code produces zero diff
- **IV2:** Running the characterization test with network disabled still passes (proves no live API leakage)
- **IV3:** Deliberately mutating one stage (e.g., flipping a filter threshold) produces a non-empty diff and fails the snapshot test (proves the test actually catches regressions)

---

### Story 1.2: SQLite migration — vector-store

**As a** HYDRA operator,
**I want** vector embeddings persisted in SQLite instead of a 16.7MB JSON file rewritten per item,
**so that** the pipeline no longer triggers OOM on full runs.

**Acceptance Criteria:**
1. New table `vector_embeddings` created in `hydra.db` with columns: `id`, `content_id`, `embedding_blob`, `dimension`, `created_at`
2. `src/store/vector-store.js` rewritten: `upsert()` uses prepared INSERT OR REPLACE; `search()` uses **in-memory LRU cosine cache** per ADR-002 (with 1-day spike branch validating against sqlite-vss baseline before merge — see AC #7 below)
3. Migration command `hydra migrate vector-store` exists and:
   - Invokes `preflight/all.mjs` first (refuses if fails)
   - Reads existing `vectors/vector-index.json`
   - Bulk-inserts all entries via transaction
   - Renames JSON to `vector-index.legacy.json`
   - Post-flight check: SQLite row count == JSON entry count
4. Env flag `HYDRA_USE_LEGACY_VECTOR_STORE=1` falls back to JSON reader (for rollback)
5. `vector-store.search()` p99 ≤ 200ms for 10k vectors (NFR5)
6. Migration is idempotent (re-running causes no duplicates, no errors)
7. **🆕 BENCHMARK SPIKE (ADR-002 exit criterion):** 1-day spike branch benchmarks LRU cache vs sqlite-vss against 10k-vector + 100-query fixture. Selected approach must p99 ≤ 200ms. **Default: LRU cache.** If LRU fails p99 target, fall back to sqlite-vss (note: introduces native dep risk per ADR-002).
8. **🆕 LRU cache invalidation:** write-through on `upsert()` — cache entry replaced on write. Cold start: cache lazy-loaded on first `search()`.

**Integration Verification:**
- **IV1:** `hydra search "test query"` returns same top-K results before/after migration for a snapshot of 100 queries
- **IV2:** `AuditLogger` continues writing to the same DB connection (singleton preserved)
- **IV3:** Heap usage during a 1000-item run drops measurably (validated via `validate-heap.mjs`)
- **IV4:** LRU cache memory footprint < 100MB resident for 10k vectors

---

### Story 1.3: SQLite migration — semantic-dedup

**As a** HYDRA operator,
**I want** semantic fingerprints persisted in SQLite instead of a 20.7MB JSON file rewritten per item,
**so that** the second OOM source is eliminated.

**Acceptance Criteria:**
1. New table `semantic_fingerprints` created with columns: `id`, `content_id`, `fingerprint_hash`, `title_normalized`, `created_at`, indexed on `fingerprint_hash` and `title_normalized`
2. `src/dedup/semantic-dedup.js` rewritten: `checkSemantic()` uses indexed lookup + in-memory LRU cache (size configurable); `registerFingerprint()` uses prepared INSERT
3. Migration command `hydra migrate semantic-dedup` mirrors Story 1.2 pattern
4. `checkSemantic()` p99 ≤ 50ms for 10k fingerprints (NFR2)
5. Env flag fallback for rollback
6. Idempotent migration

**Integration Verification:**
- **IV1:** Pipeline run on 100 known-duplicate items produces identical dedup decisions before/after migration
- **IV2:** `hydra run --dry-run` smoke test passes
- **IV3:** Heap usage during 1000-item run drops to < 2GB (NFR1 target, validated via heap test)

---

### Story 1.4: Pipeline split — orchestrator + stages

**As a** HYDRA developer,
**I want** `pipeline.js` (963 LOC monolith) split into `src/pipeline/orchestrator.js` + `src/pipeline/stages/`,
**so that** each phase is independently testable and the streaming refactor (Story 1.5) becomes tractable.

**Acceptance Criteria:**
1. New directory `src/pipeline/` with files:
   - `orchestrator.js` — top-level `runPipeline()` (the only public entry)
   - `stages/fetch.js` — Phase 1 (source adapters)
   - `stages/sanitize.js` — Phase 1.5 (security)
   - `stages/dedup.js` — Phase 2-3 (URL + hash + semantic)
   - `stages/normalize.js` — Phase 3 (normalizer)
   - `stages/filter.js` — Phase 4 (heuristic)
   - `stages/score.js` — Phase 5 (LLM judge + scoring-cache)
   - `stages/extract.js` — Phase 5b (wisdom + hallucination)
   - `stages/store.js` — Phase 6 (jarvis-writer + vector-store)
   - `stages/distribute.js` — Phase 7 (DistributionService — see Story 1.6)
2. Original `src/pipeline.js` retained as thin re-export shim (for back-compat with internal imports): `export { runPipeline } from './pipeline/orchestrator.js';`. **Note:** the shim uses a relative import deliberately (HYDRA has no bundler / no `tsconfig paths` / no `@/` alias infrastructure — Constitution Article VI absolute-imports SHOULD does not apply to this codebase). The shim is kept for 1 release cycle then removed in sprint #2.
3. Each stage is a pure function: `(items, context) => transformedItems` — no global state
4. Each stage has its own test file in `tests/pipeline/stages/`
5. New integration test `tests/pipeline.integration.test.js` (FR6) covers full orchestrator flow with mock LLM + 1 fixture RSS source
6. No regression in `hydra run` behavior

**Integration Verification:**
- **IV1:** All 22 CLI commands continue to work
- **IV2:** Telegram bot `/run` triggers the same execution path
- **IV3:** Scheduler `JobRunner` continues to invoke `runPipeline()` unchanged
- **IV4:** Full test suite (37+ test files) passes

---

### Story 1.5: Streaming pipeline execution

**As a** HYDRA operator,
**I want** items processed one-at-a-time through the pipeline (fetch → transform → write → discard) instead of holding all in memory,
**so that** heap usage stays bounded regardless of run size.

**Acceptance Criteria:**
1. `orchestrator.js` rewritten to process items via async iteration: `for await (const item of fetchStream())` then run through stages sequentially
2. Items are NOT accumulated into `allContent[]` array — each is fully processed (or discarded) before the next is fetched
3. Backpressure: if a stage is slow (LLM call), fetch pauses (no unbounded queue)
4. Memory profiler test asserts peak heap < 2GB for 5000-item synthetic run (NFR1)
5. Graceful shutdown drains in-flight items before exit (NFR10 + R7 mitigation)
6. Existing pipeline-run metrics (`pipeline_runs` table) unchanged — still records totals
7. New column `peak_heap_mb` added to `pipeline_runs` (CR2 — additive)
8. **🆕 PER-STAGE FAILURE HANDLING (per conclave ADR-001):** Every stage function MUST return `{ success: true, item }` OR `{ success: false, error, item }`. No throws across stage boundaries. Failed items written to new `pipeline_errors` table. **The `pipeline_errors` table DDL and write logic SHIP with this story** (Story 1.5) — see architecture §5.1 Phase 5 + ADR-001 for canonical DDL. Story 1.11 later extends this table with the `pipeline_items` companion table, the `hydra query` CLI, and observability tooling that READS from `pipeline_errors`; it does NOT create the table. Run continues despite per-item failures.
9. **🆕 Error rate threshold:** If a stage's error count exceeds 10% of items, pipeline triggers Telegram HIGH severity alert (but does NOT abort — keeps processing).
10. **🆕 Stage contract documented:** Each stage in `src/pipeline/stages/` has JSDoc declaring its `{success, error}` contract + which failure modes are recoverable.
11. **🆕 Characterization test (Story 1.1 fixture) MUST PASS** before this story merges. If output diff is non-empty, refactor is rejected.

**Integration Verification:**
- **IV1:** Run on 50-item characterization fixture (Story 1.1) produces identical output (zero diff)
- **IV2:** Cron-scheduled run completes without OOM for 1000+ items
- **IV3:** `hydra run --dry-run --sources rss` smoke test still works
- **IV4:** Injected stage failure (mock error in score stage) on 10% of items: pipeline completes, errors logged to `pipeline_errors`, Telegram alert fires, exit code is 0 not 1

---

### Story 1.6: Unified DistributionService

**As a** HYDRA developer,
**I want** a single `DistributionService` used by both live pipeline and dossier ingest,
**so that** the divergent codepaths consolidate and `deptToDomainMap` lives in one place.

**Acceptance Criteria:**
1. New module `src/distribution/distribution-service.js` exposes:
   - `distributeItem(item, options)` — accepts a normalized item with `{tier, domain, angle, ...}`
   - Internally calls `routeToMindClones()` + `writeKnowledgeFeed()`
2. `pipeline/stages/distribute.js` (Story 1.4) calls `DistributionService.distributeItem()`
3. `bin/ingest-dossier.mjs` reduced to a thin shim that calls `DistributionService.distributeItem()` (no separate `deptToDomainMap`)
4. Three new YAML files (FR5):
   - `src/config/angle_to_domain.yaml` — Layer A (extracted from `ingest-dossier.mjs:50-64`)
   - `src/config/dept_to_domain.yaml` — Layer C (extracted from `mind-clone-router.js:159-191`)
   - `src/config/domains.yaml` — Layer B (existing, unchanged)
5. `DistributionService` loads all 3 YAMLs at startup, composes routing decision
6. Validation script `scripts/validate-domain-mapping.mjs` ensures no orphan keys (every department maps to a valid domain; every angle maps to a valid domain; every clone referenced in `dept_to_domain.yaml` exists in `mind-clone-index.json`)
7. Snapshot test: routing decisions for 100 sample items identical pre/post refactor (R4 mitigation)

**Integration Verification:**
- **IV1:** `ingest-dossier.mjs --jsonl X` produces identical feed output before/after refactor
- **IV2:** Live pipeline distribution to clones unchanged (same clones receive same items)
- **IV3:** Adding a new department in `dept_to_domain.yaml` propagates without code changes

---

### Story 1.7: `hydra run --from-jsonl` flag

**As a** HYDRA operator,
**I want** the live pipeline to accept a JSONL dossier as input,
**so that** dossier ingestion goes through the same code path as automated runs.

**Acceptance Criteria:**
1. `bin/hydra.js run` accepts new flag `--from-jsonl <path>`
2. Optional companion flag `--skip-phases <phase1,phase2>` (e.g., `--skip-phases fetch,sanitize` for already-curated dossiers)
3. When `--from-jsonl` is used:
   - `stages/fetch.js` reads from the JSONL file instead of source adapters
   - Items continue through downstream stages (configurable via `--skip-phases`)
   - DistributionService writes to mind-clone feeds as usual
4. `bin/ingest-dossier.mjs` becomes 1-line wrapper: `process.argv.splice(2, 0, 'run', '--from-jsonl', '--skip-phases', 'fetch,sanitize,score,extract,hallucination'); ...`
5. Deprecation warning printed when invoking `ingest-dossier.mjs` (suggest `hydra run --from-jsonl`)

**Integration Verification:**
- **IV1:** Running both Anipis (08/Mai) and High-Ticket (08/Mai) reference JSONLs through new command produces identical feed writes to the historical run
- **IV2:** `ingest-dossier.mjs` continues to work (back-compat)
- **IV3:** New flag passes all 22 CLI command tests

---

### Story 1.8: Cost tracker + Telegram cost report

**As a** HYDRA operator,
**I want** per-LLM-call cost tracking and a `/cost` Telegram command,
**so that** I can monitor spend per provider and run.

**Acceptance Criteria:**
1. New module `src/monitoring/cost-tracker.js`:
   - `track(provider, model, tokens_in, tokens_out, run_id)` — logs to SQLite
   - `summarize({ days, runId, provider })` — returns aggregated cost in BRL
2. New SQLite table `llm_calls` with: `id`, `run_id`, `provider`, `model`, `tokens_in`, `tokens_out`, `cost_usd`, `cost_brl`, `created_at`
3. `stages/score.js` and `stages/extract.js` call `costTracker.track()` after every LLM response
4. New CLI command `hydra cost [--days N] [--run-id X] [--provider P]` prints cost summary
5. Telegram bot gains `/cost [--days N]` command (default: today)
6. Post-run Telegram digest (`telegram-bot.js:postRunSummary`) includes total cost line: `Cost: R$ 12,40 (DeepSeek R$11,20 + Anthropic R$1,20)`
7. `HYDRA_COST_BRL_RATE` env var configurable (default 5.20)

**Integration Verification:**
- **IV1:** Cost tracking adds < 5ms overhead per LLM call (R5)
- **IV2:** Existing Telegram messages unchanged in format except for the new cost line
- **IV3:** Cost-tracker disabled gracefully if SQLite write fails (logs warning, doesn't crash pipeline)

---

### Story 1.9: Graceful shutdown + OOM warning

**As a** HYDRA operator,
**I want** the pipeline to close SQLite connections on shutdown and warn before OOM,
**so that** data isn't corrupted and operators can intervene proactively.

**Acceptance Criteria:**
1. SIGTERM handler at `orchestrator.js` (rewritten from `pipeline.js:212-224`) sequences shutdown:
   - Drain in-flight items (timeout 30s)
   - Close `auditLogger` (writes pending audit entries)
   - Close `entityGraph` (writes pending edges)
   - Close `dedupStore` (closes underlying SQLite singleton)
2. Heap monitor watcher runs in background during pipeline execution:
   - Samples `process.memoryUsage().heapUsed` every 5s
   - Logs `pipeline_runs.peak_heap_mb` (NFR1 instrumentation)
   - If `heapUsed > HYDRA_HEAP_WARN_MB` (default 1800): pino warning + Telegram alert with run progress
3. Pipeline run records final `peak_heap_mb` to `pipeline_runs` table
4. `hydra health --json` exposes recent runs' peak heap

**Integration Verification:**
- **IV1:** Forced SIGTERM during a running pipeline closes cleanly (no orphan SQLite locks)
- **IV2:** Heap warning fires on synthetic OOM-inducing run (test fixture)
- **IV3:** No regression in successful run behavior (heap warning only triggers above threshold)

---

### Story 1.10: Documentation + runbook

**As a** HYDRA operator,
**I want** a migration runbook and updated docs,
**so that** I (or a future operator) can execute the resilience sprint deployment safely.

**Acceptance Criteria:**
1. New file `docs/projects/hydra-content-intel/resilience-sprint/05-runbook/migration-runbook.md` covers:
   - Pre-migration backup procedure
   - 8-step migration sequence (per §3.4)
   - Rollback procedure (env flag + JSON restore)
   - Smoke test procedure
   - Post-migration validation checklist
2. New file `docs/projects/hydra-content-intel/resilience-sprint/05-runbook/scheduler-recovery.md` for crash recovery (NFR4: MTTR < 5min)
3. Update `tools/hydra/.env.example` with new env vars
4. Update `tools/hydra/auto-run.bat` (if needed for new flags)
5. Update memory file `project_hydra.md` with new architecture + DOWN→UP timeline
6. ADRs (from architecture phase) referenced in runbook

**Integration Verification:**
- **IV1:** Runbook step-by-step executable by Orion/agent without code knowledge
- **IV2:** Rollback procedure tested end-to-end on a copy of `hydra-data/`
- **IV3:** Updated docs reviewed against actual implementation

---

### Story 1.11: Per-item observability tables + `hydra query` CLI

**As a** HYDRA operator,
**I want** every pipeline item recorded as a structured row in SQLite AND a `hydra query` CLI to run ad-hoc SQL,
**so that** I can answer NEW questions about my system in 6 months without shipping new code.

(🆕 Added 2026-05-11 from conclave ADR-003 — Charity Majors' blind spot catch.)

**Acceptance Criteria:**
1. New SQLite table `pipeline_items` with columns:
   - `id` (UUID), `run_id` (FK to `pipeline_runs`), `item_id` (sha256 of url), `source_name`, `final_stage` (e.g., `distributed`, `deduped`, `filtered`, `failed`), `tier` (S/A/B/null), `cost_cents`, `duration_ms`, `clones_routed_count`, `created_at`
   - Indexed on `run_id`, `source_name`, `final_stage`, `tier`
2. Extends existing `pipeline_errors` table (created in Story 1.5 per architecture §5.1 Phase 5) — adds index on `stage` if not already present, and confirms columns `id`, `run_id`, `item_id`, `stage`, `error_message`, `stack_trace`, `created_at`. **This story does NOT create the table** (created in Story 1.5); it only ensures observability indexes exist and the `hydra query` CLI can read it efficiently.
3. `orchestrator.js` writes to `pipeline_items` per item completion (success OR failure)
4. Failed stages (Story 1.5 AC #8) write to `pipeline_errors` in addition to `pipeline_items.final_stage='failed'`
5. New CLI command `hydra query "<sql>"`:
   - Parameterized (refuses raw user SQL injection)
   - Read-only (refuses INSERT/UPDATE/DELETE/DROP)
   - Returns JSON array
   - Lives at `bin/hydra.js` as new sub-command (additive, CR1 preserved)
6. New Telegram bot command `/query <saved-name>` for 5 saved queries
7. 5 starter queries documented in `05-runbook/queries.md`:
   - `last-run-cost` — cost of most recent pipeline run
   - `top-errors-7d` — top error stages by count, last 7 days
   - `dedup-rate-by-source` — % items deduped per source
   - `clones-by-volume` — clones receiving most items last 30d
   - `heap-trend` — peak_heap_mb across last 20 runs
8. Retention rules added to migrations:
   - `pipeline_runs` last 90 days
   - `pipeline_items` last 30 days
   - `pipeline_errors` last 30 days
   - Cleanup job runs daily at 03h BRT via scheduler

**Integration Verification:**
- **IV1:** Pipeline run on 100 items inserts exactly 100 rows in `pipeline_items` + N rows in `pipeline_errors` matching actual failures
- **IV2:** `hydra query "SELECT COUNT(*) FROM pipeline_runs WHERE created_at > date('now', '-7 days')"` returns valid count
- **IV3:** `hydra query "DROP TABLE pipeline_runs"` refused with "read-only query required" error
- **IV4:** Retention cleanup runs without locking concurrent pipeline operations (uses `BEGIN IMMEDIATE` correctly)

---

### Story 1.12: Connect Feeds to Consultation Engine ⚠️ **CRITICAL — discovered post-validation**

**As a** user consulting any mind clone,
**I want** the consultation engine to load that clone's HYDRA knowledge feeds before generating a response,
**so that** the clone answers with up-to-date research instead of hallucinating about content it cannot see.

(🚨 **Added 2026-05-12 after empirical validation revealed that HYDRA feeds are NEVER loaded by `self-consultation.js`.** Without this story, the entire Resilience Sprint produces feeds that go nowhere — write-only knowledge silo.)

**Evidence of bug:**
- `grep -r "knowledge-feed\|hydra-feed" D:/AIOS/.aios-core/` → No matches found
- Empirical consult test on alison-darcy: `mindCloneEnrichment.relevantMemory: []` (empty)
- Feed file exists: `D:/jarvis/mega brain/knowledge-feed/alison-darcy/2026-05-08-hydra-feed.md` (164KB, never read)

**Acceptance Criteria:**
1. New module `src/distribution/feed-reader.js` exposing:
   - `loadCloneFeeds(cloneId, { days=30, maxTokens=30000, minTier='A' })` — returns array of feed entries
   - Reads from `${MEGA_BRAIN_ROOT}/knowledge-feed/${cloneId}/YYYY-MM-DD-hydra-feed.md` files
   - Filters by date range (last N days), tier (S/A only by default — B excluded if older than 7 days), token budget
   - Returns structured entries: `{ date, title, url, tier, content, source_name }`
2. `D:/AIOS/.aios-core/core/jarvis/self-consultation.js` `consult()` function updated:
   - After `resolveExpert(expertId)`, calls `loadCloneFeeds(expertId)` (NEW)
   - **Populates NEW field `mindCloneEnrichment.feedEntries: FeedEntry[]`** (rename from `relevantMemory` per ADR-004 + C-10 audit recommendation)
   - **Keeps existing `mindCloneEnrichment.relevantMemory: string[]` as legacy alias** (kept empty `[]` for 1 release cycle — Sprint #2 deletes after re-audit confirms zero consumers post-2026-06-12)
   - Injects feed section into `consultationPrompt` between Principles and Question (using `feedEntries`):
     ```
     ## Recent Knowledge (from HYDRA feed, last 30 days)
     [Date] [Tier] [Title]
     URL: [url]
     [content excerpt]
     ---
     ```
3. Token budget enforcement: max **30k tokens per expert per consultation**. In conclave mode (N experts), total budget is N × 30k. This is the deliberate trade-off: richer context per expert vs higher API cost (~R$1.50 per 5-expert conclave at DeepSeek pricing). Truncate oldest first within each expert's budget.
4. Source attribution mandatory: every feed entry includes URL → consultation prompt instructs LLM to cite URL when using feed content.
5. Staleness signal: if no feed entries in last 30 days, prompt explicitly says: "⚠️ No recent feed entries found. Answer from frozen knowledge only — do NOT fabricate recent sources."
6. CLI flag `node self-consultation.js consult --no-feed` for testing without feed injection (regression test).
7. New `hydra` CLI commands:
   - `hydra feed read <clone-id> [--days 7] [--tier S,A]` — preview what would be injected
   - `hydra feed coverage` — shows which clones have stale/empty feeds (>30 days old or empty)
8. Unit tests: `tests/distribution/feed-reader.test.js` covering token budget, tier filter, date filter, empty feed handling.
9. Integration test: `tests/consultation/feed-injection.test.js` — runs consult on test clone, asserts prompt contains feed content.
10. **Regression test:** Re-run the empirical bug validation — consult alison-darcy with same question. Resulting prompt MUST contain feed entries.
11. **Conclave mode cost tracking** — when invoked via batch/conclave, each expert's feed injection logged separately to `pipeline_runs.cost_brl` per the cost-tracker module (Story 1.8). Total cost per conclave printed to operator post-execution.
12. **Legacy field retention** — `mindCloneEnrichment.relevantMemory: string[]` remains in API response, hardcoded to `[]`, with JSDoc deprecation note: `@deprecated since v1.0, use feedEntries. Will be removed in Sprint #2 (post 2026-06-12 re-audit).`

**Integration Verification:**
- **IV1:** Consultation without feeds (clone with empty `knowledge-feed/` dir) returns gracefully with staleness warning, doesn't crash
- **IV2:** Consultation with 30+ days of feeds respects token budget (no prompt explosion)
- **IV3:** Existing `consultation-engine.js` (used by other AIOS workflows) backwards-compatible — feed injection is opt-in or default-on with disable flag
- **IV4:** No regression in conclave (`batch` and `conclave` subcommands) — they call same `consult()` path so feed injection inherits naturally

**Why this is in scope despite being "consumption side":**
- Without this, the entire Sprint #1 ships HYDRA fixed but useless (write-only silo)
- The fix is small (~150 LOC + tests)
- It's the actual user value — the OOM fix is means to an end, this is the end
- User explicitly approved 2026-05-12 after empirical bug discovery

---

### 5.1 Story Sequencing & Dependencies

```
Story 1.1a (preflight scripts)         ✅ SHIPPED 2026-05-11 — gates migrations in 1.2/1.3
Story 1.1b (status.js SQLite read fix) [independent, parallel-safe]
Story 1.1c (characterization fixture)  ★ unblocks refactor work (1.4 + 1.5)
    │
    ├──> Story 1.2 (vector-store SQLite + LRU benchmark spike)      [needs 1.1a preflight wired]
    ├──> Story 1.3 (semantic-dedup SQLite)                          [needs 1.1a preflight wired]
    └──> Story 1.4 (pipeline split)                                 [needs 1.1c fixture]
              ├──> Story 1.5 (streaming + per-stage failure handling + pipeline_errors DDL)
              │         └──> Story 1.11 (pipeline_items + hydra query) ★ READS from pipeline_errors created in 1.5
              ├──> Story 1.6 (DistributionService)
              │         └──> Story 1.7 (--from-jsonl flag)
              └──> Story 1.8 (cost tracker) [parallel-safe]
                        └──> Story 1.9 (graceful shutdown)
                                  └──> Story 1.10 (docs/runbook)

Story 1.12 (Connect Feeds to Consultation) ⚠️ CRITICAL — no upstream deps, fully parallel-safe
                                            ★ HOTFIX-class: can ship concurrently with all refactor work
                                            ★ RECOMMENDED EARLY: unlocks user value of every other story
```

**Critical path:** 1.1c → 1.4 → 1.5 → 1.11 → 1.10 (Story 1.1a already shipped; 1.1b parallel-safe with everything). **Story 1.12 is NOT on the critical path — it's a deliverable in itself, independent of the refactor chain.**
**Parallel-safe:** 1.1b, 1.2, 1.3, 1.8, **1.12** can run in parallel after their respective deps clear. (1.12 has no deps at all.)
**Dependency note on 1.5 ↔ 1.11:** Story 1.5 OWNS the `pipeline_errors` table DDL (per architecture §5.1 Phase 5). Story 1.11 ADDS the `pipeline_items` table + `hydra query` CLI + observability tooling on top of the existing `pipeline_errors` table. Sequencing is 1.5 → 1.11 (no circular dependency).
**Dependency note on 1.12 (NEW v0.9):** Story 1.12 has **no prerequisites within this sprint** — it can ship as a hotfix concurrently with refactor work. **Recommended: implement 1.12 EARLY because it unlocks the value of all other stories.** The OOM fix (1.4/1.5) and SQLite migration (1.2/1.3) produce feeds that are never read until 1.12 lands. The only soft coupling: AC #11 cost tracking integrates with Story 1.8's cost-tracker module — if 1.12 ships before 1.8, AC #11 can be stubbed and wired retroactively when 1.8 lands.

**Estimated sprint duration:** 2-3 weeks for a single dev (assuming Architecture phase clears in 1 day post-conclave, which already happened 11/Mai).

---

## ⏸️ AGUARDANDO VALIDAÇÃO FINAL DO PRD

**Status do PRD:**
- ✅ §1 Intro/Analysis (validado 11/Mai)
- ✅ §2 Requirements FR/NFR/CR (validado 11/Mai)
- ✅ §3 Technical Constraints (validado 11/Mai + pre-flight scripts adicionados)
- ✅ §4 Epic Structure (single epic decided)
- ✅ §5 10 Stories com AC + IV
- ⏸️ Aguardando aprovação geral para entregar pra @po validation

