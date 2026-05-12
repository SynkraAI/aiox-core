# Sprint #3 Feasibility — HYDRA Portable

**Type:** Feasibility (NOT a PRD)
**Author:** Aria (Architect)
**Date:** 2026-05-12
**Source of truth:** brownfield analysis at `D:/AIOS/docs/projects/hydra-content-intel/resilience-sprint/01-analysis/project-documentation.md`
**Status:** Strategic exploration. Sprint #1 (Resilience) MUST complete first. **Do not pursue immediately.**

---

## 1. What "Portable HYDRA" means (MVP scope)

A user clones the repo or runs `npx aios-hydra init`, supplies a knowledge directory + an LLM key, and gets a working pipeline that ingests RSS/GitHub/YouTube/etc., scores items, and writes to **their** filesystem (or container volume, or cloud bucket) — without hand-editing JS paths, without Mega Brain at `D:/jarvis/`, without `D:/AIOS/.aios-core/data/`.

| Dimension | Today | Portable MVP |
|-----------|-------|--------------|
| Install | `git clone` + manual env setup | `npx aios-hydra init` writes config + `npm install -g @aios/hydra` |
| Knowledge dir | Hardcoded `D:/jarvis/mega brain/` | `HYDRA_KNOWLEDGE_DIR` env or `~/.hydra/config.yaml` |
| Mind clone catalog | Hardcoded `D:/AIOS/.aios-core/data/jarvis-mind-clone-{index.json,map.yaml}` | User-supplied path; bundled "starter pack" of 10-20 generic personas as fallback |
| LLM | `DEEPSEEK_API_KEY` env (DIY loader) | `dotenv` + `hydra init` writes `.env.example` walkthrough |
| Native deps | `better-sqlite3` (no prebuilds verified) | `--build-from-source` fallback; OR ship `sql.js`/`libsql` alternative |
| Binaries (yt-dlp, whisper) | Assumed on PATH | `hydra doctor` checks + clear error per platform |
| `npm publish` | Blocked — `"private": true` in `package.json:26` | Flip + package name decision (`@aios/hydra` already declared) |

---

## 2. Concrete refactors needed (paths from §13 of brownfield doc)

| # | Concern | Files | Magnitude |
|---|---------|-------|-----------|
| R1 | Eliminate `D:/jarvis/` hardcodes | `src/store/jarvis-writer.js`, `src/distribution/feed-writer.js`, `src/distribution/mind-clone-router.js:56,87` | Medium — route via injected `knowledgeDir` |
| R2 | Eliminate `D:/AIOS/.aios-core/` hardcodes | `mind-clone-router.js:56` (clone index), `:87` (clone map) | Medium — config-driven path resolution |
| R3 | `__dirname`-relative resolution in **25+ files** (§6.3) | `mind-clone-router.js`, `pipeline.js`, configs, etc. | **High** — touches almost every module; needs a `PathResolver` utility + audit |
| R4 | `package.json:26` `"private": true` flip + license decision (currently `UNLICENSED`) | `package.json` | Trivial — but a *business* decision, not technical |
| R5 | DIY env loader (`bin/hydra.js:18-30`) → `dotenv` + `hydra init` walkthrough | `bin/hydra.js`, new `bin/hydra-init.js` | Low |
| R6 | External binary detection (yt-dlp, whisper) | `src/sources/youtube-adapter.js`, `src/sources/podcast-adapter.js`, `scripts/transcribe.py` (Python dep!) | Medium — Python sidecar is its own portability problem |
| R7 | `better-sqlite3` cross-platform prebuilds | `package.json`, `src/dedup/dedup-store.js` | Medium — node-gyp on Windows/Mac/Linux ARM/x64 is historically painful |
| R8 | Hardcoded `deptToDomainMap` JS | `mind-clone-router.js:159-191` | **Already addressed by Sprint #1 Story 1.6** (FR5 3-layer YAML — see `02-prd/sharded/story-1.6.md`). Portable just inherits the win. |
| R9 | Telegram bot opt-out (currently required env wiring) | `bin/hydra.js:213-225`, `src/monitoring/telegram-bot.js` | Low — guard with `if (process.env.TELEGRAM_BOT_TOKEN)` |
| R10 | No CI scoped to HYDRA (§6.5) — needed for cross-platform install matrix | Add `.github/workflows/hydra-ci.yml` (Windows + macOS + Linux × Node 20/22) | Medium |

**Estimated total touched files:** ~35-45 production files. **LOC churn:** ~1,500-2,500 (mostly path/config injection, not new logic).

---

## 3. What CANNOT change without redesign — the Mind Clone assumption

HYDRA's value prop is **routing curated content to 162 specific advisor personas** at specific paths with specific naming (`knowledge-feed/{clone-id}/YYYY-MM-DD-hydra-feed.md`). The router (`src/distribution/mind-clone-router.js:433 LOC`) hard-depends on `jarvis-mind-clone-index.json` having a particular schema (`{clone-id, department, primary-domain, ...}`).

**Without mind clones, HYDRA is:** an RSS/GitHub/YouTube aggregator with LLM scoring + dedup + wisdom extraction + per-item markdown output. That's roughly **feature parity with Feedly Pro + Readwise + a custom LLM scorer**. The unique value (per-persona routing, angle→domain→department 3-layer match, contrarian bonus, diversity tracker) **only exists because mind clones exist on the consumer side**.

**Implication for portability:** A user without mind clones gets:
- ~70% of code (pipeline + sources + dedup + scoring + extraction + wisdom + hallucination check)
- ~0% of differentiation (no router target → fall back to single-bucket `knowledge/{domain}/` writes)

For "portable" to be a viable product, the project MUST ship a **starter mind clone pack** (10-20 generic personas with the same schema) and a `hydra clone create` command. Otherwise we are shipping a Ferrari with no engine.

---

## 4. Three deployment modes

### A — Standalone CLI (`npm install -g @aios/hydra`)

| Aspect | Detail |
|--------|--------|
| User flow | `npm i -g @aios/hydra` → `hydra init` (writes `~/.hydra/config.yaml` + `.env`) → `hydra run` |
| Knowledge dir | User-chosen local dir, defaults to `~/.hydra/knowledge` |
| Mind clones | User supplies (BYO) OR starter pack (10 personas in `templates/mind-clones/`) |
| LLM | User supplies key in `.env`; multi-provider already supported (`extractor.js`) |
| State | SQLite (`~/.hydra/hydra.db`) + JSON state files |
| Cross-platform | Windows, macOS, Linux × Node 20+ — needs CI matrix |
| Pain points | better-sqlite3 prebuilds, yt-dlp + Python whisper, Telegram bot optional |
| **Sizing** | **~2,000 LOC churn + 500 LOC new (init wizard, doctor, starter pack tooling) — 4-6 weeks @ 1 dev** |

### B — Docker image (`docker run aios/hydra`)

| Aspect | Detail |
|--------|--------|
| User flow | `docker run -v ./knowledge:/data -e DEEPSEEK_API_KEY=... aios/hydra run` |
| Knowledge dir | Mounted volume — guaranteed path inside container (`/data/knowledge`) |
| Mind clones | Baked-in starter pack OR mounted volume |
| LLM | Env vars at `docker run` |
| State | Inside container OR mounted volume |
| Cross-platform | "Solved" — same Linux image everywhere; yt-dlp + Python + whisper baked in |
| Pain points | Image size (Whisper models = 1-3 GB), GPU passthrough for Whisper if user wants it, scheduler/cron inside container vs host crontab |
| **Sizing** | **~800 LOC churn + 300 LOC new (Dockerfile, docker-compose example, entrypoint) — 2-3 weeks. Skips the cross-platform native deps problem entirely.** |

### C — Hosted SaaS (`hydra.aios.dev` subscription)

| Aspect | Detail |
|--------|--------|
| User flow | Sign up → OAuth GitHub/Google → pick sources → HYDRA runs in cloud → user reads feed via web UI or API |
| Knowledge dir | Multi-tenant cloud storage (S3 / R2 / Postgres) |
| Mind clones | User-configurable; pre-built persona library |
| LLM | **HYDRA pays the LLM bill** (passed in subscription) OR user BYO key |
| State | Multi-tenant Postgres + S3 |
| Cross-platform | N/A — everything server-side |
| Pain points | Auth, billing, multi-tenancy isolation, abuse prevention, content licensing risk (HYDRA stores third-party content), GDPR/LGPD, infra cost |
| **Sizing** | **~6,000-10,000 LOC new (auth, billing, multi-tenant data layer, web UI, admin) + full Mode A refactor as base — 4-6 months @ 2-3 devs. Effectively a new product.** |

---

## 5. Comparative sizing

| Mode | LOC churn | LOC new | Weeks (1 dev) | Risk | Reach |
|------|-----------|---------|---------------|------|-------|
| A — Standalone CLI | ~2,000 | ~500 | 4-6 | Medium (cross-platform native deps) | Devs willing to self-host |
| B — Docker image | ~800 | ~300 | 2-3 | Low (Linux only) | Devs comfortable with Docker |
| C — Hosted SaaS | ~2,500 (A as base) | ~6,000-10,000 | 16-24 (2-3 devs) | High (business model, ops, legal) | Non-technical users |

---

## 6. Recommendation

**Pursue Mode B (Docker) first, defer A, do not pursue C.**

Rationale:
- **B sidesteps the worst portability landmines** (better-sqlite3 prebuilds, Python whisper sidecar, yt-dlp install, Node version matrix). One Linux image, one set of binaries, predictable behavior.
- **B is the smallest delta** that delivers "anyone can run HYDRA" — ~3 weeks vs 6 weeks for A.
- **B does not preclude A** — the Dockerfile work makes the codebase more portable, paving the way for a future Mode A if demand materializes.
- **C requires a business model decision** before any code. Billing, multi-tenancy, content licensing (HYDRA caches third-party RSS content — fair use is murky at scale), abuse prevention. This is a new product, not a port.
- **Critical prerequisite:** all three modes depend on the **mind clone starter pack** being shipped. Without it, even a perfect Docker image gives the user a confusing experience ("why do I need to know what `andrej-karpathy` is?"). Building the starter pack is ~1 week of curation work and must happen before *any* deployment mode is announced.

**Order of operations IF this is pursued (post Sprint #1 + Sprint #2):**
1. Sprint #3a (1 week): Mind clone starter pack — 15 generic personas with same schema as Jarvis.
2. Sprint #3b (1-2 weeks): Path-resolution refactor (R1+R2+R3) — config-driven, applies regardless of deployment mode.
3. Sprint #3c (2 weeks): Dockerfile + entrypoint + `hydra init` wizard + CI image build.
4. Re-evaluate Mode A appetite based on user response to B.

---

## 7. The critical question

**Does HYDRA make sense WITHOUT the mind clone consumption side?**

**No, not as a differentiated product.** Without mind clones, HYDRA's feature set overlaps almost entirely with established paid tools:

| HYDRA feature | Existing tool equivalent |
|---------------|--------------------------|
| RSS/GitHub/YouTube/Twitter ingestion | Feedly Pro ($8/mo), Inoreader ($75/yr) |
| LLM scoring & filtering | Readwise Reader ($10/mo) with custom GPTs |
| Daily digest markdown | Pocket ($5/mo) + read-later workflows |
| Wisdom extraction | Fabric AI (Daniel Miessler, open source) |
| Hallucination check + quote verification | Niche; unique-ish but not load-bearing |
| Deduplication + AI-slop filter | Inoreader has dedup; AI slop filter is unique-ish |
| **Per-persona routing (162 mind clones)** | **NONE — this is the moat** |

The 7-phase pipeline (sanitize → dedup → normalize → heuristic → LLM score → wisdom → store) is **table stakes**. The differentiation IS Phase 7 (Distribute → per-clone feeds). Strip Phase 7 out and you are competing with Readwise + Feedly on price and polish — and HYDRA loses that comparison (no web UI, no mobile apps, no sync, no community, single-developer maintenance).

**Therefore portability is only worth pursuing if it brings users who:**
- Already have or will adopt a mind-clone-style consumer setup (e.g., Obsidian users with persona vaults, OS developers using LLM agents, AIOS-adjacent communities)
- OR are willing to use HYDRA's bundled starter pack as a feature on its own

The audience is narrow. **My honest assessment:** portability is a "fun engineering exercise" but the product-market fit case is unproven. Sprint #1 (resilience) and Sprint #2 (cleanup) deliver more value to the current user than Sprint #3 (portability) would to a hypothetical user. Recommend treating this as **Q4 2026 exploration**, not a near-term commitment.

---

*End feasibility. Total LOC of this doc: see report. Single architect, ~40 minutes.*
