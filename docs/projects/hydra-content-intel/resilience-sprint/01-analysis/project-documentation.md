# HYDRA — Brownfield Architecture Document

**Project:** HYDRA Content Intelligence System (v1.0.0)
**Document type:** Project Documentation — Brownfield Reality Check
**Scope:** Resilience Sprint (OOM crash + distribution unification + path resolution drift)
**Author:** Aria (Architect) — `document-project` task
**Date:** 2026-05-11
**Source of truth:** `D:/AIOS/tools/hydra/` working tree at HEAD `9c6d97b8` (branch `feat/redesign-foundation-tokens`)

---

## Introduction

This document captures the **CURRENT STATE** of HYDRA as of 2026-05-11. It is NOT aspirational. It documents what exists in code, where the technical debt is, and which patterns differ from the project's mental model captured in 38-day-old memory (`C:/Users/kingp/.claude/projects/D--AIOS/memory/project_hydra.md`, dated 2026-04-02).

**Several memory claims have decayed.** Where memory diverges from current code, this document reports CODE and flags the divergence under "Memory vs. Reality" (Section 6.4).

### Document Scope

Focused on areas relevant to the **Resilience Sprint** (PRD draft at `D:/AIOS/docs/projects/hydra-content-intel/resilience-sprint/02-prd/prd.md`):

- Pipeline architecture (`src/pipeline.js` monolith)
- Distribution module (`src/distribution/`) + the divergent `bin/ingest-dossier.mjs` codepath
- Dedup/storage layer (`src/dedup/` + `src/store/`) — SQLite vs JSON split
- Source adapters (`src/sources/`)
- Scheduler/automation (`src/scheduler/` + `src/monitoring/`)
- Config-driven behavior (`src/config/*.yaml`)
- Test coverage map (37 test files)

### Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-05-11 | 1.0 | Initial brownfield analysis for Resilience Sprint | Aria (architect) |

---

## 1. Technical Summary

**What HYDRA does (paragraph 1 — capability):**
HYDRA is an autonomous Content Intelligence System that ingests content from 115 configured sources across 7 source types (RSS, GitHub, YouTube, Podcast, Twitter, Web, Newsletter), runs each item through a 7-phase pipeline (sanitize → dedup → normalize → heuristic filter → LLM score → wisdom extraction → store), then **routes** the highest-tier items to 162 Mind Clones in the Jarvis/Mega Brain knowledge base via append-only feed writes. Scoring uses a 3-LLM provider abstraction (DeepSeek primary, Anthropic + OpenAI fallback) with a Dice-coefficient title-similarity cache to skip redundant LLM calls. The system is operated entirely via Commander CLI (`bin/hydra.js`, 22 commands) with optional cron scheduling and a Telegram bot (`@hydra_aios_bot`) for status + manual triggers.

**Why HYDRA exists (paragraph 2 — purpose):**
Mind clones answer with stagnant knowledge; HYDRA closes the latency gap to < 24h by continuously feeding curated, deduped, hallucination-checked insights into per-clone markdown feeds (`D:/jarvis/mega brain/knowledge-feed/{clone-id}/YYYY-MM-DD-hydra-feed.md`). The system was designed to be **autonomous** (cron + Telegram, no human-in-the-loop) and **safe** (Epic 6 security gates: input sanitization, prompt injection detection, PII redaction, audit log) so it can run unattended at 6h + 18h BRT daily. **However, the scheduler has been DOWN since 2026-04-16 due to an OOM crash** (see Section 6 — Critical Debt). It has been replaced operationally by an ad-hoc `bin/ingest-dossier.mjs` script that bypasses the pipeline entirely — useful for one-off squad dossiers (Anipis 08/Mai, High-Ticket 08/Mai) but causing architectural drift documented in Section 6.

---

## 2. High Level Architecture

### 2.1 Component Diagram (current reality)

```
                                ┌────────────────────────┐
                                │     CLI Entry          │
                                │  bin/hydra.js (658 LOC)│
                                │  Commander, 22 cmds    │
                                └──────────┬─────────────┘
                                           │
              ┌────────────────────────────┼────────────────────────────┐
              │                            │                            │
              ▼                            ▼                            ▼
   ┌─────────────────────┐    ┌─────────────────────┐      ┌────────────────────────┐
   │ runPipeline()       │    │ HydraScheduler      │      │ TelegramBot (polling)  │
   │ src/pipeline.js     │    │ node-cron (DOWN)    │      │ /run /health /digest   │
   │ 963 LOC monolith    │    │ + heartbeat.json    │      │ src/monitoring/        │
   └──────────┬──────────┘    └──────────┬──────────┘      └────────────────────────┘
              │                          │
              │  (also bypassed by)      └──> JobRunner ──> runPipeline()
              │                                            (same monolith)
              ▼
   ┌────────────────────────────────────────────────────────────────┐
   │                  PIPELINE STAGES (sequential, in-process)       │
   │                                                                 │
   │  Phase 1   Fetch          adapters[7] (RSS/GH/YT/Pod/TW/Web/NL)│
   │            (rate-limited per source type)                       │
   │                                                                 │
   │  Phase 1.5 Sanitize       security/input-sanitizer.js (Epic 6) │
   │            Validate       security/content-validator.js        │
   │                                                                 │
   │  Phase 2   URL dedup      dedup/url-matcher.js (SQLite)        │
   │  Phase 3   Normalize      processor/normalizer.js              │
   │  Phase 3b  Hash dedup     dedup/content-hash.js (SQLite)       │
   │  Phase 3c  Semantic dedup dedup/semantic-dedup.js (JSON 20MB!) │
   │                                                                 │
   │  Phase 4   Heuristic      curator/heuristic-filter.js          │
   │            filter         (AI slop, word count, age)           │
   │                                                                 │
   │  Phase 5   LLM Scoring    curator/scoring-cache.js (TF cache)  │
   │            (or cache hit) curator/llm-judge.js                 │
   │                                                                 │
   │  Phase 5b  Wisdom         processor/extractor.js (S/A only)    │
   │  Phase 5c  Hallucinat'n   hallucination/hallucination-check.js │
   │            quote verify   hallucination/quote-verifier.js     │
   │                                                                 │
   │  Phase 6   Store          store/jarvis-writer.js (FS write)    │
   │                           store/vector-store.js (JSON 16MB!)   │
   │                                                                 │
   │  Phase 7   Distribute     distribution/mind-clone-router.js    │
   │                           distribution/feed-writer.js          │
   │                           distribution/entity-graph.js (SQLite)│
   └────────────────────────────────────────────────────────────────┘
              │
              ├──> Pipeline run recorded → SQLite pipeline_runs table
              ├──> Daily digest         → hydra-data/digests/YYYY-MM-DD.md
              ├──> Telegram report      → @hydra_aios_bot
              └──> Audit log            → SQLite audit_log table (Epic 6)

   ┌──────────────────────────── ALTERNATE CODEPATH ────────────────────────────┐
   │                                                                            │
   │  bin/ingest-dossier.mjs (196 LOC) — adds NEW divergent path                │
   │                                                                            │
   │   JSONL dossier ──> itemToHydraContent() ──> routeToMindClones()           │
   │                     (LOCAL angle→domain map)   (mind-clone-router.js)     │
   │                          │                            │                    │
   │                          └─── DOES NOT TOUCH ─────────┴── writeKnowledgeFeed
   │                          dedup, security gates,           (feed-writer.js)│
   │                          scoring, extraction,                              │
   │                          hallucination check                               │
   │                                                                            │
   │  Purpose: bypass pipeline.js OOM. Used 08/Mai for Anipis + High-Ticket.   │
   │  Cost: deptToDomainMap drift (Section 6.2)                                 │
   └────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Data Flow Reality

**Inbound:**
1. Sources defined in `src/config/sources.yaml` (115 sources)
2. Cron fires (or manual `hydra run`) → adapters fetch → `allContent[]` array held entirely in memory
3. Loop processes items **one at a time** through phases 1.5 → 7

**Outbound (3 destinations, written per-item):**
1. **Jarvis KB filesystem** — `D:/jarvis/mega brain/knowledge/{domain}/{slug}.md` (S/A/B-tier full markdown)
2. **Per-clone feeds** — `D:/jarvis/mega brain/knowledge-feed/{clone-id}/YYYY-MM-DD-hydra-feed.md` (append-only)
3. **Local state** — `hydra-data/{hydra.db, vectors/vector-index.json, fingerprints/fingerprints.json, digests/*.md}`

**Repository structure reality:**
- Type: **Polyrepo** (HYDRA lives inside AIOS monorepo as `tools/hydra/`)
- Package manager: **npm** (lockfile `package-lock.json` present, no pnpm/yarn artifacts)
- Module system: **ESM** (`"type": "module"`) — uses `createRequire` workaround in `dedup-store.js` because `better-sqlite3` is CJS

---

## 3. Actual Tech Stack

From `D:/AIOS/tools/hydra/package.json`:

| Category | Technology | Version | Notes |
|----------|------------|---------|-------|
| Runtime | Node.js | `>=20.0.0` (engines) | ESM `"type": "module"` |
| CLI | commander | `^13.1.0` | 22 commands in `bin/hydra.js` |
| Storage (relational) | better-sqlite3 | `^12.8.0` | Synchronous CJS — loaded via `createRequire` workaround |
| LLM (primary) | openai | `^6.33.0` | Used for DeepSeek (compatible API) + OpenAI |
| LLM (secondary) | @anthropic-ai/sdk | `^0.39.0` | Claude fallback |
| Config | js-yaml | `^4.1.0` | All `.yaml` files in `src/config/` |
| Scheduler | node-cron | `^3.0.3` | `HydraScheduler` wrapper |
| RSS parsing | rss-parser | `^3.13.0` | Used by `src/sources/rss-adapter.js` |
| Logging | pino | `^9.14.0` | JSON structured, API key redaction |
| Logging (dev) | pino-pretty | `^11.3.0` | devDep |
| Test runner | jest | `^29.7.0` | Wrapped via `bin/jest.js` for ESM compat |
| Test helpers | @jest/globals | `^29.7.0` | devDep |

**Notable absent dependencies:**
- ❌ No HTTP client lib (uses `fetch` + custom `node:fs` for downloads)
- ❌ No dotenv (DIY env loader in `bin/hydra.js:18-30`)
- ❌ No linter dependency listed (`"lint": "echo 'No linter configured yet'"`)
- ❌ No telegram lib — `telegram-bot.js` + `telegram-alerter.js` hand-roll Telegram Bot API via `fetch`

**External binaries assumed installed:**
- `yt-dlp` (YouTube transcript download — used by `src/sources/youtube-adapter.js`)
- `whisper` / `faster-whisper` (audio transcription — referenced in `scripts/transcribe.py`)
- `git` (not used at runtime, but `.gitignore` exists)

---

## 4. Source Tree Map

### 4.1 Top-level (`D:/AIOS/tools/hydra/`)

```
tools/hydra/
├── .claude/agent-memory/           # Per-agent memory (out of scope for sprint)
├── .env / .env.example             # Secrets (DEEPSEEK_API_KEY, TELEGRAM_*, etc.)
├── .gitignore                      # 31B — minimal
├── .hydra-status-probe.mjs         # Standalone probe (no docs found)
├── auto-run.bat                    # Windows scheduled task entry
├── run-pipeline.bat                # One-shot manual run
├── validate-heap.mjs               # ★ Diagnostic — loads vector-store + fingerprints
│                                   #   under raised heap to confirm OOM hypothesis
├── jest.config.cjs                 # 143B — minimal Jest config
├── package.json                    # 9 deps, 2 devDeps
├── package-lock.json               # 171.9KB
├── bin/
│   ├── hydra.js                    # 658 LOC — main CLI (22 commands)
│   ├── ingest-dossier.mjs          # 196 LOC — ALTERNATE CODEPATH (see §6.2)
│   └── jest.js                     # 28 LOC — Jest ESM wrapper
├── patterns/                       # Fabric AI prompt templates
│   ├── analyze_claims/
│   ├── extract_wisdom/
│   ├── label_and_rate/
│   └── summarize/
├── src/                            # All production code (see §4.2)
├── tests/                          # 37 .test.js files (see §9)
├── scripts/
│   └── transcribe.py               # 3.4KB — Whisper transcription helper
├── hydra-data/                     # ★ Mutable runtime state — gitignored
│   ├── hydra.db                    # 6.4MB SQLite (urls, hashes, runs, audit_log, entities)
│   ├── hydra.db-shm / -wal         # SQLite WAL files
│   ├── vectors/vector-index.json   # ★ 16.7MB JSON — OOM suspect #1
│   ├── fingerprints/fingerprints.json # ★ 20.7MB JSON — OOM suspect #2
│   ├── index/dedup-index.json      # 97KB — legacy JSON dedup (fallback only)
│   ├── state/heartbeat.json        # ★ Last write: 2026-04-16T23:35:47Z (NOT 08/Mai)
│   ├── state/scheduler.lock        # (none currently)
│   ├── state/circuit-breakers.json # (none currently)
│   ├── digests/                    # Daily markdown digests (last: 2026-04-06)
│   ├── alerts/, cache/, logs/      # (mostly empty; logs is empty dir)
│   ├── metrics/, originals/        # 
│   ├── quarantine/                 # PII-redacted/copyright-flagged items
│   ├── full-run-final.log          # 287KB — last successful big run log
│   ├── full-run-final.err          # 2.9KB — JS OOM stack trace (smoking gun)
│   ├── run-08mai-8gb.log           # 1.2KB — 08/Mai retry attempt with --max-old-space=8192
│   └── reprocess-log.jsonl         # 189.8KB — per-item history
└── node_modules/
```

### 4.2 `src/` — 13 modules

```
src/
├── index.js                        # 98 LOC — barrel export (98 exports across 7 epics)
├── pipeline.js                     # ★ 963 LOC — MONOLITH (Phases 1-7 in one function)
├── status.js                       # 136 LOC — `hydra status` CLI handler
│                                   #   ★ Still uses LEGACY getIndexStats() (JSON, not SQLite)
│
├── sources/                        # 7 adapters, total 1,820 LOC
│   ├── adapter-interface.js (80)
│   ├── exec-helper.js (272)        # Shared subprocess helper (used by YT/podcast)
│   ├── rss-adapter.js (95)         # Smallest; uses rss-parser
│   ├── github-adapter.js (272)
│   ├── youtube-adapter.js (310)    # ★ Largest; yt-dlp + Whisper transcripts
│   ├── podcast-adapter.js (265)    # ★ Whisper transcription path
│   ├── twitter-adapter.js (269)
│   ├── web-adapter.js (274)
│   └── newsletter-adapter.js (253)
│
├── processor/                      # 1,015 LOC total
│   ├── normalizer.js (138)         # HTML strip, language detect
│   ├── extractor.js (324)          # LLM wisdom extraction (provider abstraction)
│   └── chunker.js (553)            # ★ Token chunking + map-reduce aggregation
│
├── curator/                        # 896 LOC
│   ├── heuristic-filter.js (239)   # Word count, age, AI slop, language
│   ├── scoring-rubric.js (87)      # Tier S/A/B/C/D classification thresholds
│   ├── scoring-cache.js (287)      # ★ Dice-coefficient title similarity cache
│   ├── llm-judge.js (123)          # LLM scoring call
│   └── diversity-tracker.js (160)  # Anti-echo-chamber + contrarian bonus
│
├── dedup/                          # 1,026 LOC
│   ├── content-hash.js (99)        # SHA256 of normalized text
│   ├── url-matcher.js (132)        # URL normalization + SQLite/JSON dispatch
│   ├── dedup-index.js (114)        # ★ LEGACY JSON store (fallback-only path)
│   ├── dedup-store.js (438)        # ★ SQLite-backed (active path, since 01/Abr)
│   ├── migrate-to-sqlite.js (80)   # One-shot migration script
│   └── semantic-dedup.js (263)     # ★ JSON-backed (20.7MB file!) — Sprint target
│
├── store/                          # 545 LOC
│   ├── jarvis-writer.js (219)      # FS writer for Jarvis KB markdown
│   └── vector-store.js (326)       # ★ JSON-backed (16.7MB file!) — Sprint target
│
├── hallucination/                  # 253 LOC
│   ├── hallucination-check.js (125) # LLM-based claim verification
│   └── quote-verifier.js (128)     # Dice coefficient quote-in-source check
│
├── distribution/                   # 1,950 LOC
│   ├── mind-clone-router.js (433)  # ★ Routing algo + DEPT_TO_DOMAIN_MAP hardcoded
│   ├── feed-writer.js (338)        # Per-clone feed append (idempotent by date+url)
│   ├── entity-graph.js (344)       # SQLite co-occurrence tracking
│   ├── feedback-manager.js (265)   # `hydra feedback` CLI handler
│   ├── digest-reporter.js (204)    # Distribution digest writer
│   └── search-api.js (166)         # `hydra search`/`hydra entity` handlers
│
├── scheduler/                      # 1,193 LOC
│   ├── scheduler.js (253)          # ★ HydraScheduler — node-cron wrapper
│   ├── job-runner.js (126)         # Wraps pipeline with retry+CB+lock
│   ├── job-queue.js (154)
│   ├── retry-policy.js (92)        # Exponential backoff + jitter
│   ├── circuit-breaker.js (190)    # Per-source CB w/ state file
│   ├── rate-limiter.js (123)       # Per-source-type RPS limits
│   ├── lock-manager.js (127)       # File-based lock w/ TTL
│   ├── checkpoint.js (136)         # Per-stage checkpoint
│   └── source-manager.js (192)     # `hydra sources add/remove/list`
│
├── monitoring/                     # 1,234 LOC
│   ├── health-reporter.js (273)    # `hydra health` JSON/CLI output
│   ├── metrics-collector.js (165)  # Counter aggregation
│   ├── telegram-alerter.js (294)   # Severity-based alert dispatch
│   └── telegram-bot.js (502)       # ★ Full bot — polling + commands + handler
│
├── security/                       # 1,119 LOC (Epic 6)
│   ├── input-sanitizer.js (288)    # HTML clean + 16 injection patterns
│   ├── content-validator.js (199)  # Size + encoding + URL blocklist
│   ├── output-filter.js (203)      # PII redact (CPF, CNPJ, email, phone, CC) + copyright
│   ├── audit-logger.js (283)       # SQLite audit_log table
│   └── env-validator.js (146)      # API key format check on startup
│
├── corporation/monitors/           # 1,037 LOC — Drift detection (CodeRabbit-style)
│   ├── drift-baseline.js (333)
│   ├── drift-detector.js (432)
│   ├── drift-reporter.js (252)
│   └── index.js (20)
│
├── logging/
│   └── logger.js (74)              # Pino wrapper, key redaction
│
└── utils/
    ├── language.js (26)            # Language detection (en/pt)
    └── retry.js (95)               # Generic retryWithBackoff
```

**Source size summary:** ~13,200 LOC across 56 production files.

---

## 5. Module Dependencies (Import Graph)

### 5.1 Critical edges around the OOM suspects

```
pipeline.js  ───imports───> vector-store.js  ───imports───> semantic-dedup.js
                                  │                                  │
                                  │ uses                             │ uses
                                  ▼                                  ▼
                            computeFingerprint()             loadFingerprints()
                            cosineSimilarity()               saveFingerprints()
                                                                     │
                                                                     ▼
                                                          fs.readFileSync(20.7MB JSON)
                                                          JSON.parse → in-memory array
                                                          fs.writeFileSync(serialize back)
                                                          ↑↑↑ EVERY .upsert() / .register() ↑↑↑
```

**Key observation:** `semantic-dedup.js:loadFingerprints()` (line 145) and `vector-store.js:_ensureLoaded()` (line 74) both perform a full disk read + `JSON.parse` of multi-megabyte files. `semantic-dedup.js:registerFingerprint()` (line 242-263) calls `loadFingerprints()` → mutates array → calls `saveFingerprints()` (full re-serialization) on **every single ingested item**. Same anti-pattern in `vector-store.js:upsert()` (line 118-161): reads, mutates, sorts, calls `_saveLocal()` which writes the entire 16.7MB JSON back to disk per item.

For a run of 3,771 items (the best historical run cited in memory), this means **~3,771 full reads + 3,771 full writes** of 20.7MB JSON + same for 16.7MB JSON. That's ~141GB of redundant disk I/O *and* heap churn per run.

### 5.2 Distribution path — two divergent codepaths

**Path A — Live pipeline** (`pipeline.js:732-775` "Phase 7"):
```
pipeline.js → routeToMindClones(content, { configDir })
            → writeKnowledgeFeed(routing, content)
            → entityGraph.registerEntities(...)
```
Routing options are minimal: `{ configDir }` only. Internal `mind-clone-router.js` resolves paths via `__dirname` relative resolution (line 56, 87, 298).

**Path B — Dossier ingest** (`bin/ingest-dossier.mjs`, used 08/Mai for Anipis + High-Ticket):
```
ingest-dossier.mjs → routeToMindClones(content, ROUTING_OPTIONS)
                   → writeKnowledgeFeed(routing, content)
```
Where `ROUTING_OPTIONS` (lines 69-74) **explicitly passes paths** with absolute resolution because of an acknowledged HYDRA bug (verbatim from line 66-67 in code):

> `// HYDRA path bug workaround — pass paths explicitly because internal __dirname resolution`
> `// breaks when HYDRA is at D:/AIOS/tools/hydra/ (expects different layout).`

Additionally, `ingest-dossier.mjs` carries its **own** angle→domain map (lines 50-64: `ANGLE_DOMAIN_MAP_HIGHTICKET` + `ANGLE_DOMAIN_MAP_ANIPIS`) which is **completely independent** of the `deptToDomainMap` inside `mind-clone-router.js:159-191`. There is no shared source of truth.

### 5.3 SQLite vs JSON storage split

| Concern | Storage | Module | Status |
|---------|---------|--------|--------|
| URL dedup | SQLite (`urls` table) | `dedup/dedup-store.js` | ✅ Migrated 01/Abr |
| Content-hash dedup | SQLite (`content_hashes` table) | `dedup/dedup-store.js` | ✅ Migrated 01/Abr |
| Pipeline run history | SQLite (`pipeline_runs` table) | `dedup/dedup-store.js` | ✅ Migrated 01/Abr |
| Audit log | SQLite (`audit_log` table — schema inferred) | `security/audit-logger.js` | ✅ Epic 6 |
| Entity co-occurrence | SQLite | `distribution/entity-graph.js` | ✅ Epic 5 |
| **Semantic fingerprints** | **JSON** (20.7MB) | `dedup/semantic-dedup.js` | ❌ NOT migrated |
| **Vector index (kNN)** | **JSON** (16.7MB) | `store/vector-store.js` | ❌ NOT migrated |
| Scoring cache | JSON | `curator/scoring-cache.js` | ❌ NOT migrated |
| Distribution digests | Markdown | `distribution/digest-reporter.js` | (intended as MD output) |
| Feedback adjustments | YAML | `distribution/feedback-manager.js` | (intended as YAML config) |
| Daily digests | Markdown | `pipeline.js:919` | (intended as MD output) |
| Scheduler state | JSON | `scheduler/lock-manager.js` + `heartbeat.json` | (small files, OK) |
| Circuit breaker state | JSON | `scheduler/circuit-breaker.js` | (small file, OK) |

The split is **inconsistent**: the two largest write-amplifying stores (fingerprints + vector index) are still JSON, while the smaller hot-paths (URLs + hashes) were migrated.

### 5.4 `status.js` drift

`src/status.js:9` still imports `getIndexStats` from the legacy `dedup-index.js` (JSON store). After SQLite migration, the SQLite store contains the canonical counts but `hydra status` reports the legacy JSON-file counts (which are stale — `dedup-index.json` is 97KB while `hydra.db` is 6.4MB). This is silently wrong but not user-facing critical.

---

## 6. Technical Debt & Known Issues

### 6.1 OOM Crash — Root Cause Hypothesis (HIGH CONFIDENCE)

**Evidence:**
1. `hydra-data/full-run-final.err` contains a v8 JS heap exhaustion stack trace: `FATAL ERROR: Committing semi space failed. Allocation failed - JavaScript heap out of memory` (line 4). The native frames show `RegExp::GetFlags` + `String::Utf8Value::~Utf8Value` on the stack, suggesting heap churn during string serialization (consistent with `JSON.stringify` of large objects).
2. `validate-heap.mjs` is a diagnostic file at repo root specifically designed to load `VectorStore` + `loadFingerprints()` under raised heap — confirming the developer's prior hypothesis matches mine.
3. `hydra-data/run-08mai-8gb.log` shows a retry attempt with `--max-old-space-size=8192` (line 1 is the ASCII banner; the run was started but the file is truncated to 1.2KB, suggesting another crash early).
4. `hydra-data/state/heartbeat.json` last write was `2026-04-16T23:35:47.240Z` with `heapUsed: 254MB`, `rss: 451MB` — meaning the **scheduler has been DOWN since 2026-04-16, not 2026-05-08 as memory implied**. That's **~25 days down**, not 38. The 08/Mai runs were manual `hydra run` attempts, not scheduler restarts.

**Hypothesized root cause (to be confirmed by sprint diagnostics):**

The pipeline holds `allContent[]` (all fetched items from 115 sources) in memory simultaneously after Phase 1 (`pipeline.js:244`, `result.totalFetched = allContent.length;`). For a 3,771-item run, this array alone is significant.

Then **per item**, the pipeline calls:
- `checkSemantic()` → loads entire 20.7MB fingerprints JSON into memory
- `registerFingerprint()` → loads it again, mutates, writes back
- `vectorStore.upsert()` → loads entire 16.7MB vector-index JSON, mutates, sorts (`pipeline.js:638` calls upsert for every S/A/B tier item)

Even with V8 garbage collection, the **temporary allocations** (parsing the 20MB string into JS objects, then re-stringifying) cause heap fragmentation. Each `JSON.parse` of a multi-MB string creates a transient peak of ~3-5× the string size as V8 builds the object graph. Combined with the in-flight `allContent[]`, hallucination check LLM responses, and extracted wisdom, the cumulative heap pressure exceeds default Node heap (~1.7GB) and likely also the 8GB attempted retry.

**Confidence:** HIGH. The pattern is textbook write-amplification anti-pattern; the file sizes match the symptom; `validate-heap.mjs` confirms the dev team's prior independent hypothesis.

### 6.2 `deptToDomainMap` Drift (HIGH SEVERITY)

Two **incompatible** angle/department → domain mappings now exist:

**Map 1** (in `src/distribution/mind-clone-router.js:159-191`, used by live pipeline):
- 30 department keys
- Maps department → domain array
- Hardcoded, no config file
- Includes Anipis-specific keys: `therapy`, `design-terapeutico`, `health-tech`, `health-data`, `mental-health-ops`, `clinical-ops` (comments cite "Anipis" + clone counts)

**Map 2** (in `bin/ingest-dossier.mjs:50-64`, used by dossier path):
- `ANGLE_DOMAIN_MAP_HIGHTICKET`: 5 keys (`PSICOLOGIA`, `METODO`, `MERCADO_BR`, `TRAFEGO`, `TRANSVERSAL`)
- `ANGLE_DOMAIN_MAP_ANIPIS`: 3 keys (`CLINICO`, `TECH`, `MERCADO`)
- Selection: `args.domain === 'saude-mental' ? ANIPIS : HIGHTICKET` (line 64) — a binary switch
- These keys are *angle* codes (uppercase, dossier-specific) not *department* codes — different semantic level

The two maps **do not share any keys** and cannot be naively merged. Updates to either drift independently. As of HEAD:
- `mind-clone-router.js` map last touched in commit `4e6dcd55` (`feat(hydra): add security wiring...`)
- `ingest-dossier.mjs` is part of the same untracked working-tree change (file exists but git status shows it as untracked or unmodified — see git status output)

**Impact:** If the team adds a new mind-clone department, it must be added to Map 1 *and* mentally mapped to dossier angle codes in Map 2. There is no validation, no test that asserts the two are reconciled.

### 6.3 Path Resolution Workarounds (MEDIUM SEVERITY)

`mind-clone-router.js` uses `__dirname` relative resolution to locate three external files:
- `../config/routing.yaml` (line 42)
- `../../../.aios-core/data/jarvis-mind-clone-index.json` (line 56)
- `../../../.aios-core/data/jarvis-mind-clone-map.yaml` (line 87)
- `../../hydra-data/feedback/routing-adjustments.yaml` (line 298)

The first two depend on **HYDRA's location relative to AIOS root**. The `../../../.aios-core` path resolves correctly when HYDRA is at `D:/AIOS/tools/hydra/` (current location) — but `ingest-dossier.mjs:66-67` explicitly comments that "internal `__dirname` resolution breaks when HYDRA is at D:/AIOS/tools/hydra/ (expects different layout)" and passes paths explicitly via `ROUTING_OPTIONS`.

I could not reproduce a failure in current code — the relative path math `path.resolve(__dirname, '../../../.aios-core/data/jarvis-mind-clone-index.json')` from `D:/AIOS/tools/hydra/src/distribution/` correctly yields `D:/AIOS/.aios-core/data/jarvis-mind-clone-index.json` which exists. So the workaround comment may reflect a **fixed-but-mistrusted** bug — or a real bug under a code path I didn't exercise (e.g., when called via Jest from a different CWD, or when HYDRA is symlinked). Either way, the **distrust is itself debt**: future developers will see `ingest-dossier.mjs` passing options explicitly and either (a) cargo-cult it or (b) try to remove it and reintroduce the bug.

Beyond router: 25+ files use `__dirname` relative resolution (per Grep at §5.1). Migrating HYDRA out of `tools/hydra/` would require touching most of them.

### 6.4 Memory vs. Reality (Stale Memory Claims)

| Memory claim (02/Abr/2026) | Reality (11/Mai/2026) | Verdict |
|----------------------------|------------------------|---------|
| "88 fontes totais (15+18 RSS, 41 GitHub, 6 YouTube, 2 Podcasts, 4 Twitter, 2 Web)" | **115 sources** in `src/config/sources.yaml` (per `grep -c '^    - name:'`) | Memory undercounts by 27 sources |
| "509 testes passando (34 suites)" | **37 test files** (not 34); test pass-count not verified live (would need npm test) | Test count grew by 3 suites |
| "DOWN since 08/Mai — 38 days" (per sprint brief) | **Heartbeat last write: 2026-04-16T23:35:47Z** — scheduler is DOWN since 16/Abr (~25 days). 08/Mai runs were manual retries. | Sprint brief uses wrong start date |
| "DB: hydra-data/hydra.db (tabelas: urls, content_hashes, pipeline_runs)" | Plus **audit_log** (Epic 6) and **entity_graph tables** (Epic 5) — schema added but memory doesn't mention | Memory missed Epic 5+6 schema additions |
| "Bot @hydra_aios_bot (Telegram)" | ✅ Confirmed (`src/monitoring/telegram-bot.js:502 LOC`) | Match |
| "ArXiv domina content (38-52%) — precisa rate limiting" | ✅ Confirmed: `thresholds.yaml` and `rss-adapter.js:62-65` honor `max_items` per source | Mitigated, not eliminated |
| "Cybersecurity: 18 fontes RSS" | ✅ Confirmed (cybersecurity domain in `domains.yaml:30`) | Match |
| "Scheduler ATIVO" | ❌ DOWN | Critical drift |

### 6.5 Other Notable Debt

- **No linter configured** (`package.json:13`: `"lint": "echo 'No linter configured yet'"`).
- **No TypeScript** — JSDoc typedefs only. Type contracts between modules are unenforced.
- **No CI config** found in `tools/hydra/` (`.github/workflows/` not scoped to this subdirectory).
- **Telegram bot polling never returns** (`bin/hydra.js:225`: `await new Promise(() => {});`). If `bot.start()` doesn't internally manage failure, the process can deadlock with the bot dead.
- **`bin/hydra.js:81`** flips `--no-distribute` semantics: option name is `--no-distribute` (default true) but the pipeline takes `noDistribute` (default false) — the CLI passes `noDistribute: !options.distribute`. This is correct Commander behavior (`--no-foo` flag → `options.foo = false`) but the negation is easy to misread.
- **Migration script (`dedup/migrate-to-sqlite.js`) is a one-shot helper** with no idempotency guard at the CLI level — re-running it is safe (INSERT OR IGNORE) but it's not wired into a versioned migration system.
- **No structured pipeline tests.** The largest, most-critical file (`pipeline.js`, 963 LOC) has **zero test file** matching its name. There is `tests/dedup/dedup.test.js`, `tests/distribution/mind-clone-router.test.js`, etc. — but no `tests/pipeline.test.js`. All pipeline behavior is tested transitively through unit tests of the imported modules. Integration coverage of the orchestration logic is effectively zero.
- **Pipeline error handling philosophy is inconsistent** (`bin/hydra.js:84-87`): exit code 1 if `errorRate > 0.1` OR `totalProcessed === 0`. A run that fetches 0 items (e.g., all sources down) exits with the same code as a run with widespread errors — but for a different reason. Operators cannot tell from exit code which failure mode occurred.

---

## 7. Workarounds and Gotchas (for any Dev touching pipeline.js)

### 7.1 ESM + CJS interop

`better-sqlite3` is CommonJS-only. The codebase is ESM (`"type": "module"`). The workaround in `src/dedup/dedup-store.js:17`:

```js
const _require = createRequire(import.meta.url);
// later:
const Database = _require('better-sqlite3');
```

**Gotcha:** Do not change this to `import Database from 'better-sqlite3'`. It will appear to work in dev (with bundlers) and break in production Node ESM.

### 7.2 SQLite singleton

`dedup-store.js:20` keeps a module-level `_instance` and `getDedupStore()` lazily initializes it. The `AuditLogger` and `EntityGraph` both reach into `store.db` directly to share the connection. **Closing the singleton breaks all three.** There is `resetDedupStore()` for tests but no production "shutdown" sequence — the pipeline's SIGTERM handler (`pipeline.js:212-224`) does NOT close the DB.

### 7.3 LLM provider auto-detection

`processor/extractor.js` (referenced via `pipeline.js:179`) calls `hasLLMKey()` and `getProviderName()`. The provider is selected via env var inspection order. **There is no override flag** — if you want to test with OpenAI but `DEEPSEEK_API_KEY` is set, you must unset the env var. The pipeline silently picks DeepSeek.

### 7.4 Telegram bot crashes silently

`bin/hydra.js:213-221` wraps `bot.start()` in try/catch but the bot polls via `setInterval` internally. If the polling loop throws inside the interval callback, the try/catch in `bin/hydra.js` does **not** catch it. The scheduler keeps running but the bot is dead. There is no liveness check.

### 7.5 Per-source rate limiting is correct but blocking

`pipeline.js:151-159` constructs a `RateLimiter` and calls `await rateLimiter.waitAndAcquire('rss')` (line 254) etc. in a **sequential loop**. This means fetching 18 RSS feeds at 60 req/min is fine, but fetching 41 GitHub repos at 30 req/min sequentially takes ≥80 seconds *just on the rate limiter*, regardless of network speed. No source parallelism inside a type.

### 7.6 `--source` flag is substring match (case-insensitive)

`pipeline.js:249`: `if (sourceFilter && !feed.name.toLowerCase().includes(sourceFilter.toLowerCase()))`. So `--source rss` matches any RSS feed whose **name** contains "rss". This is *not* what users expect — they expect `--source` to filter to the source type "rss" (use `--sources rss,github` for that). Two flags with similar names doing very different things.

### 7.7 Audit logger absorbs SQLite init failures silently

`pipeline.js:196-206`: `auditLogger` init is wrapped in try/catch, logs warning, then proceeds with `auditLogger = null`. Every downstream call checks `if (auditLogger)`. **Result:** if SQLite has an issue at startup (locked DB, permission error), the pipeline runs to completion with zero audit trail and only a single console warning. There is no Telegram alert for this.

### 7.8 The `noDistribute` flag is *backwards-named* at the API level

`pipeline.js:146`: `const { ... noDistribute = false } = options;`. So distribution runs by default. But `bin/hydra.js:81` passes `noDistribute: !options.distribute` where `options.distribute` defaults to `true` (because `--no-distribute` is a Commander negation). It works, but reading the pipeline signature in isolation is confusing — the default suggests opt-in distribution but it's opt-out at the CLI.

### 7.9 Path workaround needed when calling from outside HYDRA root

If you spawn the pipeline programmatically (e.g., from `aios-core` test runner), `__dirname`-relative path lookups inside `mind-clone-router.js`, `pipeline.js` (config), and 25 other files will resolve **relative to the importing module**, NOT to HYDRA's location. The standalone scripts (`ingest-dossier.mjs`) work around this by passing absolute paths via options. The library API does not consistently accept these overrides.

---

## 8. Critical Technical Debt (Blocking Issues for the Sprint)

Ordered by sprint impact:

### 8.1 [BLOCKER] OOM in `semantic-dedup.js` + `vector-store.js`

**Files:** `D:/AIOS/tools/hydra/src/dedup/semantic-dedup.js:242-263` (`registerFingerprint`), `D:/AIOS/tools/hydra/src/store/vector-store.js:118-161` (`upsert`).

**Issue:** Both modules read entire JSON file (20.7MB + 16.7MB), mutate in-memory, write entire file back — **per item processed**.

**Why it blocks the sprint:** This is the OOM root cause. Any sprint goal that involves "scheduler runs 30 days without OOM" must address these two modules. Cannot ship a fix without rewriting their persistence layer.

**Constraints to respect when fixing:**
- `dedup-store.js` already provides the SQLite singleton + WAL config — reuse, don't fork.
- `semantic-dedup.js:checkSemantic` (line 194) is called per-item from `pipeline.js:470` — the fix must preserve `< 50ms` lookup time (current JSON path is O(n) cosine over all 10k fingerprints). SQLite alone doesn't solve this — needs an in-memory cache or vector-index-friendly schema.
- `vector-store.js:search` (line 173) is used by `hydra search` CLI — public API contract must remain.

### 8.2 [BLOCKER] Distribution codepath drift (`pipeline.js` ↔ `ingest-dossier.mjs`)

**Files:** `D:/AIOS/tools/hydra/src/pipeline.js:732-775`, `D:/AIOS/tools/hydra/bin/ingest-dossier.mjs:50-74`.

**Issue:** Two different angle/department→domain maps + two different `routeToMindClones` invocation styles (with vs. without explicit path options).

**Why it blocks the sprint:** Sprint goal #3 in PRD says "Eliminar `ingest-dossier.mjs` como codepath divergente — pipeline live aceita `--from-jsonl <path>` flag nativa". This is impossible without first consolidating the maps and the call signature.

**Constraints:**
- Map 1 (`deptToDomainMap` in router) is currently keyed by **department** (lower-case, hyphenated: `mental-health-ops`).
- Map 2 (in dossier) is keyed by **angle code** (UPPER_SNAKE: `PSICOLOGIA`). These represent different abstractions and may need to *coexist* — the sprint can't simply pick one.
- The router map references clones that may not exist in the index — there is no validation.

### 8.3 [HIGH] No pipeline integration test

**File:** `D:/AIOS/tools/hydra/tests/` — no `pipeline.test.js`.

**Issue:** The 963-LOC orchestration function has no direct test. Sprint changes will refactor pipeline.js. There is no regression net.

**Why it matters:** Even if every unit test passes after refactor, behavior at the orchestration level (e.g., did Phase 7 distribution still run after Phase 6 store?) is uncovered.

**Constraint:** Cannot ship a refactor of `pipeline.js` without adding at least one end-to-end test that runs the pipeline with fixture sources and asserts ingestion + distribution side effects.

### 8.4 [HIGH] `status.js` reports stale legacy counts

**File:** `D:/AIOS/tools/hydra/src/status.js:9`.

**Issue:** Uses `getIndexStats()` from `dedup-index.js` (legacy JSON) instead of querying `DedupStore.getStats()`.

**Why it matters:** Anyone diagnosing the sprint outcome via `hydra status` will see incorrect numbers (the JSON file has been frozen since the SQLite migration on 01/Abr; it's at 209 URLs while SQLite has thousands).

**Constraint:** Trivial fix (2-line change), but it's a quality-of-debugging issue for the sprint itself. Should be done before any user-facing testing.

### 8.5 [MEDIUM] Heartbeat indicates 25-day downtime, sprint brief says 38 days

**File:** `D:/AIOS/tools/hydra/hydra-data/state/heartbeat.json`.

**Issue:** Last heartbeat 2026-04-16. Sprint brief says "DOWN since 08/Mai — 38 days" (which would be 03/Abr, not 08/Mai — the math in the brief is also internally inconsistent: today is 11/Mai, 38 days back is ~03/Abr, not 08/Mai).

**Why it matters:** Sprint success metrics ("30 days consecutive uptime") need a correct baseline. The true downtime is ~25 days as of today.

### 8.6 [LOW] No linter, no TypeScript, no CI scoped to HYDRA

**Files:** `package.json`, `tsconfig.json` (absent), `.github/workflows/` (absent under HYDRA).

**Issue:** Quality gates the rest of AIOS uses (per `D:/AIOS/CLAUDE.md`: "Quality Gates: lint + typecheck + jest") do not exist for HYDRA. The sprint will add code under no enforcement.

**Constraint:** Out of scope for this sprint per PRD, but worth flagging for follow-up.

---

## 9. Test Coverage Map

37 test files across 12 test directories. Mapping by module:

| Production module | Test file(s) | Coverage assessment |
|-------------------|--------------|---------------------|
| `pipeline.js` (963 LOC) | **NONE** | ❌ **ZERO direct coverage** |
| `index.js` (barrel) | None (barrel exports don't need tests) | N/A |
| `status.js` | None | ❌ Untested |
| `bin/hydra.js` | None | ❌ CLI handlers untested |
| `bin/ingest-dossier.mjs` | None | ❌ Alternate codepath untested |
| **sources/** | | |
| `adapter-interface.js` | `sources/adapter-interface.test.js` | ✅ |
| `rss-adapter.js` (95 LOC) | None directly | ⚠️ Interface-only |
| `github-adapter.js` | None directly | ❌ |
| `youtube-adapter.js` | None directly | ❌ Critical (transcripts) |
| `podcast-adapter.js` | None directly | ❌ Critical (Whisper) |
| `twitter-adapter.js` | None directly | ❌ |
| `web-adapter.js` | None directly | ❌ |
| `newsletter-adapter.js` | None directly | ❌ |
| `exec-helper.js` | None | ❌ (shared by YT/podcast) |
| **processor/** | | |
| `normalizer.js` | `processor/normalizer.test.js` | ✅ |
| `extractor.js` | None | ❌ LLM extraction untested |
| `chunker.js` (553 LOC) | `processor/chunker.test.js` | ✅ |
| **curator/** | | |
| `heuristic-filter.js` | `curator/heuristic-filter.test.js` | ✅ |
| `scoring-cache.js` | `curator/scoring-cache.test.js` | ✅ |
| `scoring-rubric.js` | `curator/scoring-rubric.test.js` | ✅ |
| `llm-judge.js` | None | ❌ |
| `diversity-tracker.js` | None | ❌ |
| **dedup/** | | |
| `dedup-store.js` (SQLite, 438 LOC) | `dedup/dedup-store.test.js` | ✅ |
| `dedup-index.js` (legacy JSON) | `dedup/dedup.test.js` | ✅ |
| `semantic-dedup.js` ★ | `dedup/semantic-dedup.test.js` | ✅ (but JSON path) |
| `url-matcher.js` | (covered by dedup.test.js) | ⚠️ |
| `content-hash.js` | (covered by dedup.test.js) | ⚠️ |
| `migrate-to-sqlite.js` | None | ⚠️ One-shot script |
| **store/** | | |
| `vector-store.js` ★ | `store/vector-store.test.js` | ✅ |
| `jarvis-writer.js` | None | ❌ FS-side untested |
| **hallucination/** | | |
| `hallucination-check.js` | None | ❌ LLM verification untested |
| `quote-verifier.js` | `hallucination/quote-verifier.test.js` | ✅ |
| **distribution/** | | |
| `mind-clone-router.js` ★ | `distribution/mind-clone-router.test.js` | ✅ (router unit) |
| `feed-writer.js` | `distribution/feed-writer.test.js` | ✅ |
| `entity-graph.js` | `distribution/entity-graph.test.js` | ✅ |
| `feedback-manager.js` | `distribution/feedback-manager.test.js` | ✅ |
| `digest-reporter.js` | `distribution/digest-reporter.test.js` | ✅ |
| `search-api.js` | `distribution/search-api.test.js` | ✅ |
| **scheduler/** | | |
| `scheduler.js` (HydraScheduler) | None | ❌ Orchestrator untested |
| `job-runner.js` | None | ❌ |
| `job-queue.js` | `scheduler/job-queue.test.js` | ✅ |
| `retry-policy.js` | `scheduler/retry-policy.test.js` | ✅ |
| `circuit-breaker.js` | `scheduler/circuit-breaker.test.js` | ✅ |
| `rate-limiter.js` | `scheduler/rate-limiter.test.js` | ✅ |
| `lock-manager.js` | `scheduler/lock-manager.test.js` | ✅ |
| `checkpoint.js` | `scheduler/checkpoint.test.js` | ✅ |
| `source-manager.js` | `scheduler/source-manager.test.js` | ✅ |
| **monitoring/** | | |
| `health-reporter.js` | `monitoring/health-reporter.test.js` | ✅ |
| `metrics-collector.js` | `monitoring/metrics-collector.test.js` | ✅ |
| `telegram-alerter.js` | `monitoring/telegram-alerter.test.js` | ✅ |
| `telegram-bot.js` (502 LOC) | None | ❌ Bot polling/commands untested |
| **security/** (Epic 6) | | |
| `input-sanitizer.js` | `security/input-sanitizer.test.js` | ✅ |
| `content-validator.js` | `security/content-validator.test.js` | ✅ |
| `output-filter.js` | `security/output-filter.test.js` | ✅ |
| `audit-logger.js` | `security/audit-logger.test.js` | ✅ |
| `env-validator.js` | `security/env-validator.test.js` | ✅ |
| (security retry helper) | `security/retry.test.js` | ✅ |
| **corporation/monitors/** | | |
| `drift-baseline.js` | `corporation/monitors/drift-baseline.test.js` | ✅ |
| `drift-detector.js` | `corporation/monitors/drift-detector.test.js` | ✅ |
| `drift-reporter.js` | `corporation/monitors/drift-reporter.test.js` | ✅ |
| **utils/** | | |
| `language.js` | `utils/language.test.js` | ✅ |
| `retry.js` | (covered by security/retry.test.js) | ⚠️ |
| **logging/** | | |
| `logger.js` | None | ❌ |

### 9.1 Test coverage summary

| Layer | Modules with tests | Modules without tests | Coverage |
|-------|---------------------|------------------------|----------|
| Pipeline orchestration | 0 | 1 (pipeline.js) | **0%** |
| Sources adapters | 1 (interface) | 7 (concrete adapters) | **12.5%** |
| Processor | 2 (normalizer, chunker) | 1 (extractor) | **66.7%** |
| Curator | 3 | 2 | **60%** |
| Dedup | 3 (incl. JSON-path semantic) | 0 critical | **100%** of files (but ★ semantic-dedup tests cover JSON path which will be replaced) |
| Store | 1 (vector-store, JSON-path) | 1 (jarvis-writer) | **50%** |
| Distribution | 6 | 0 | **100%** |
| Scheduler | 7 | 2 (scheduler, job-runner) | **78%** |
| Monitoring | 3 | 1 (telegram-bot) | **75%** |
| Security | 6 | 0 | **100%** |
| Hallucination | 1 | 1 | **50%** |
| Drift monitors | 3 | 0 | **100%** |
| CLI handlers | 0 | 22 commands | **0%** |

### 9.2 Test debt impacting the sprint

1. **`pipeline.js` has zero direct tests** — the sprint will refactor this file aggressively. Any change is unobservable through the existing test suite.
2. **`vector-store.test.js` and `semantic-dedup.test.js` test the JSON-backed code paths** — when migrated to SQLite, these tests must be rewritten, not extended. They're not portable.
3. **`scheduler.js` (HydraScheduler) has no tests** — its sub-components (retry/CB/lock) do, but the cron orchestration that has been DOWN for 25 days is itself untested.
4. **`bin/hydra.js` CLI handlers** — the sprint might add `--from-jsonl` flag to `hydra run`. No CLI-level tests exist to validate flag parsing.
5. **`bin/ingest-dossier.mjs`** — the script the sprint plans to deprecate has no test, so we can't even pin its current behavior before consolidating.

### 9.3 Recommended test additions BEFORE refactor (advisory, not blocking analysis)

Per the architect's role boundary (analyze, not implement), I flag these as gates the sprint should clear during planning:

- E2E pipeline test fixture using local in-memory adapters (mock the 7 source types) → asserts Phase 1-7 completion + side-effects.
- Property test for `routeToMindClones`: feed it the union of all clones from both code-paths' maps + verify no clone is dropped relative to current behavior.
- Heap budget regression test: load a fixture of 1000 fingerprints + run 100 inserts → assert heapUsed < threshold.

---

## 10. Integration Points

### 10.1 External services

| Service | Purpose | Integration | Key files | Notes |
|---------|---------|-------------|-----------|-------|
| DeepSeek API | LLM scoring + extraction | OpenAI SDK (compatible API) | `processor/extractor.js`, `curator/llm-judge.js` | Default provider; `DEEPSEEK_API_KEY` |
| Anthropic API | LLM fallback | `@anthropic-ai/sdk` | same | `ANTHROPIC_API_KEY` |
| OpenAI API | LLM fallback | `openai` SDK | same | `OPENAI_API_KEY` |
| GitHub API | README + releases fetch | `fetch` direct, no SDK | `src/sources/github-adapter.js` | Optional `GITHUB_TOKEN` (60 req/h unauthenticated → 5000 authenticated) |
| Telegram Bot API | Alerts + bot polling | `fetch` direct | `src/monitoring/telegram-bot.js`, `telegram-alerter.js` | `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` |
| yt-dlp (binary) | YouTube transcript download | `child_process.spawn` via `exec-helper.js` | `src/sources/youtube-adapter.js` | External binary, must be on PATH |
| faster-whisper | Audio transcription | `scripts/transcribe.py` (Python subprocess) | `src/sources/podcast-adapter.js` | Python + CTranslate2; CPU int8 |

### 10.2 Internal integration points

- **Jarvis/Mega Brain KB filesystem** — `D:/jarvis/mega brain/knowledge/{domain}/` and `D:/jarvis/mega brain/knowledge-feed/{clone-id}/` are written by `jarvis-writer.js` and `feed-writer.js`. There is no schema validation — HYDRA is the *only* writer. Other readers (mind clones consulted via `aios-brain-bridge` MCP) consume markdown directly.
- **AIOS core data** — `mind-clone-router.js` reads `D:/AIOS/.aios-core/data/jarvis-mind-clone-index.json` and `jarvis-mind-clone-map.yaml`. These are owned by AIOS, not HYDRA. **Update cadence is uncoupled** — when AIOS updates its mind-clone catalog, HYDRA picks up the change at next pipeline run; there is no notification or invalidation.
- **`bin/ingest-dossier.mjs`** is called from outside HYDRA (Anipis squad 08/Mai, High-Ticket squad 08/Mai) with JSONL dossiers as input. These callers are upstream squads inside AIOS but external to HYDRA's domain.

---

## 11. Configuration Surface

5 YAML files in `src/config/`:

| File | Size | Purpose | Hot-reloaded? |
|------|------|---------|----------------|
| `sources.yaml` | 22.2 KB | 115 sources × 7 types | No — loaded once per pipeline run |
| `thresholds.yaml` | 4.7 KB | Scoring tiers, dedup thresholds, AI slop filter, security limits | No |
| `domains.yaml` | 2.1 KB | 10 domains, each with keywords + projects | No |
| `routing.yaml` | 1.5 KB | Routing weights (k:0.6 / d:0.3 / t:0.1), max clones, forced routes, digest config | No |
| `scheduler.yaml` | 1.6 KB | Cron expressions, retry policy, CB, rate limits, alert config | No |

**Configuration debt:**
- `deptToDomainMap` (mind-clone-router.js:159-191) is **hardcoded JS** — not in `domains.yaml`. It is the single most-edited piece of routing logic but is the **least-discoverable**. Operators editing `domains.yaml` will not see it.
- `forced_routes` in `routing.yaml:14-37` includes hardcoded clone IDs (e.g., `andrej-karpathy`, `chip-huyen`). If a clone is renamed in the AIOS catalog, the forced route silently breaks (no validation on load).
- No env-var override mechanism for any threshold. Everything is YAML-only.

---

## 12. Build and Deployment

**Build:** None. The codebase ships as source. `package.json` has no `build` script; ESM source is run directly via Node.

**Test:**
```bash
cd D:/AIOS/tools/hydra
npm test                # Runs `node bin/jest.js --passWithNoTests`
```

**Operational entry points:**
```bash
# Manual one-shot
node bin/hydra.js run                              # Full pipeline, all sources
node bin/hydra.js run --sources rss,github         # Filter by source type
node bin/hydra.js run --dry-run --verbose          # Test mode

# Scheduler (DOWN since 16/Abr)
node bin/hydra.js schedule start                   # Cron + Telegram bot
node bin/hydra.js schedule status                  # PID, uptime, heap from heartbeat
node bin/hydra.js schedule stop                    # SIGTERM via PID

# Diagnostics
node bin/hydra.js health [--json]
node bin/hydra.js status
node bin/hydra.js audit [--severity warning] [--since 7d]

# Distribution alt-path (used 08/Mai)
node bin/ingest-dossier.mjs --jsonl <path> --domain saude-mental --project anipis
```

**Windows automation:**
- `run-pipeline.bat` — wraps `node bin/hydra.js run`
- `auto-run.bat` — likely the Scheduled Task entry; calls `schedule start` (not verified — file is 1.0KB, not read in this analysis)

**No deployment** — HYDRA runs locally on the operator's machine. There is no Docker, no systemd unit, no Railway config.

---

## 13. References — Absolute Paths for Cross-Referencing

**Source files:**
- Pipeline monolith: `D:/AIOS/tools/hydra/src/pipeline.js`
- Distribution router: `D:/AIOS/tools/hydra/src/distribution/mind-clone-router.js`
- Vector store (OOM suspect): `D:/AIOS/tools/hydra/src/store/vector-store.js`
- Semantic dedup (OOM suspect): `D:/AIOS/tools/hydra/src/dedup/semantic-dedup.js`
- SQLite dedup store: `D:/AIOS/tools/hydra/src/dedup/dedup-store.js`
- Alternate codepath: `D:/AIOS/tools/hydra/bin/ingest-dossier.mjs`
- CLI: `D:/AIOS/tools/hydra/bin/hydra.js`
- Scheduler: `D:/AIOS/tools/hydra/src/scheduler/scheduler.js`
- Heap diagnostic: `D:/AIOS/tools/hydra/validate-heap.mjs`

**Runtime state:**
- SQLite database: `D:/AIOS/tools/hydra/hydra-data/hydra.db` (6.4 MB)
- Vector index JSON (OOM): `D:/AIOS/tools/hydra/hydra-data/vectors/vector-index.json` (16.7 MB)
- Fingerprints JSON (OOM): `D:/AIOS/tools/hydra/hydra-data/fingerprints/fingerprints.json` (20.7 MB)
- Heartbeat: `D:/AIOS/tools/hydra/hydra-data/state/heartbeat.json` (last write 2026-04-16T23:35:47Z)
- OOM stack trace: `D:/AIOS/tools/hydra/hydra-data/full-run-final.err`

**Config:**
- All 5 YAML files: `D:/AIOS/tools/hydra/src/config/`

**AIOS-owned dependencies referenced from HYDRA:**
- Mind clone index: `D:/AIOS/.aios-core/data/jarvis-mind-clone-index.json`
- Mind clone map: `D:/AIOS/.aios-core/data/jarvis-mind-clone-map.yaml`

**Sprint artifacts:**
- This document: `D:/AIOS/docs/projects/hydra-content-intel/resilience-sprint/01-analysis/project-documentation.md`
- PRD (in progress): `D:/AIOS/docs/projects/hydra-content-intel/resilience-sprint/02-prd/prd.md`

---

*End of brownfield analysis. Output ready for @pm consumption in PRD §2/§3 and for @architect's subsequent architecture.md.*
