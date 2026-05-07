# Audit — `C:/dev` Workspace Organization

**Date:** 2026-05-07
**Auditor:** @aiox-master (Orion)
**Triggered by:** Eliel sinalizou desorganização durante sessão de correção Wave 1.A
**Scope:** all of `C:/dev/` — projects, worktrees, loose files, asset directories
**Status:** Audit complete — proposal awaiting Eliel approval before any move/delete

---

## Inventory snapshot (2026-05-07T18:35Z)

`C:/dev/` has **84 entries**. Counts by type:

| Category | Count |
|---|---|
| Project repositories | 6 |
| Active git worktrees | 5 (under `business-ai-first`) |
| Audit/data assets | 1 (`db-inventory`) |
| Loose `.md` documents | 5 |
| Loose `.png` images | 51 |
| Loose `.csv` files | 2 |
| Mystery directories | 5 (`.agents`, `agents`, `architecture`, `docker`, `kommo-sync`) |
| Other | misc |

### Disk usage by project

| Path | Size | Status |
|---|---:|---|
| `business-ai-first/` | 1.5 GB | ✅ Active project |
| `aiox-dashboard/` | 1.1 GB | ⚠️ Status unknown — needs review |
| `aiox-core/` | 303 MB | ✅ Framework (this repo) |
| `cadastro-rapido/` | 300 MB | ⚠️ Active or legacy? Confirm with Eliel |
| `kommo-sync/` | 160 MB | ⚠️ Likely legacy ETL |
| `db-inventory/` | 2.2 MB | ✅ Cross-project audit asset |
| `cdm-portal/` | 7 KB | ⚠️ Empty stub — worktree leftover or new project |

---

## Classification

### A. Active projects (KEEP, current location)

| Path | Role | Owner |
|---|---|---|
| `aiox-core/` | Framework canonical source | @aiox-master maintainers |
| `business-ai-first/` | Project consumer of AIOX (CDM operations) | Eliel |

### B. Cross-project assets (KEEP, possibly elevate)

| Path | Role | Recommendation |
|---|---|---|
| `db-inventory/` | DB schema dictionary, snapshots, audit reports across projects | Keep at root. Add `OWNERSHIP.md` declaring it's framework-aligned shared asset, owned by `@data-engineer`. Consumed by all DB-touching projects. |

### C. Worktrees (REVIEW + cleanup recommended)

5 worktrees registered to `business-ai-first`:

| Worktree | Branch | State | Recommendation |
|---|---|---|---|
| `bai-dbops-v1-exam-purposes` | `feat/dbops-v1-exam-purposes` | V1 reverted (PR #68 merged then logically reverted in #72). Worktree obsolete. | **REMOVE** — `git worktree remove` + `git push origin --delete feat/dbops-v1-exam-purposes` |
| `bai-dbops-v5-audit-triggers` | `feat/dbops-v5-audit-triggers` | V5 merged + applied to prod | **REMOVE** |
| `bai-dbops-v7-financial-view` | `feat/dbops-v7-financial-view` | V7 merged + applied to prod (uncommitted `supabase/.temp/cli-latest`) | **REMOVE** after stashing the temp file |
| `bai-strategy-drafting` | `docs/cdm-strategy-stories-conrado` | EPIC-014 Conrado strategy (paused) | **PRESERVE** until EPIC-014 unpauses; document in EPIC-014 RUN-LOG |
| `bai-w0-foundation` | `feat/cdm-ui-010-foundation` | EPIC-014 W0 foundation (paused) | **PRESERVE** until EPIC-014 unpauses |

Cleanup blocker: each worktree may have an active Claude Code session — Eliel must close those terminals before `git worktree remove` succeeds.

### D. Possibly active or legacy (CONFIRM)

| Path | Hint | Action |
|---|---|---|
| `aiox-dashboard/` | Listed in `C:/dev/CLAUDE.md` as "AIOS Platform UI — Vite + React" | Likely active. Keep. Check if part of current epic. |
| `cadastro-rapido/` | Vercel-deployed Next.js portal `cadastro-rapido-gamma.vercel.app` referenced in EPIC-MVP-CDM-CADASTRO | **Likely active**. EPIC-MVP-CDM-CADASTRO Wave 4 expects this repo to receive form changes. Confirm with Eliel. |
| `kommo-sync/` | Legacy ETL scripts (Kommo CRM → Supabase). 160 MB. | If ETL pipeline migrated to n8n: **archive** to `aiox-core/archive/legacy-etl/` or external backup. If still in use: keep + add `OWNERSHIP.md`. |
| `cdm-portal/` | 7 KB — empty stub. Has `CLAUDE.md` and `README.md` and empty `core/`. | Either: (a) WIP project to be developed → keep, document; (b) abandoned scaffold → **delete**. **Confirm with Eliel.** |

### E. Mystery directories (INVESTIGATE)

| Path | Contents | Initial assessment |
|---|---|---|
| `.agents/` | Hidden dotdir — likely tool config or backup | Inspect content. Likely safe to relocate inside `aiox-core/` if framework-bound. |
| `agents/` | Contains `skills/` subdirectory | Probably stale duplicate of `aiox-core/skills` or independent agent definitions. **Investigate before action.** |
| `architecture/` | 2 markdown files: `cadastro-rapido-schema-alignment.md`, `data-pipeline-architecture.md` | Cross-project architecture docs. **Move to `aiox-core/docs/architecture/cross-project/` or to the relevant project repo.** |
| `docker/` | Contains `docker/` subdirectory (nested) | Likely Docker compose/setup for development. **Move to `aiox-core/infrastructure/docker/`** if framework-shared, or document as required local toolchain. |
| `kommo-sync/` | (already classified above as D) | Same |

### F. Loose files (RELOCATE)

#### Loose `.md` (5 files — at root level)

| File | Likely destination |
|---|---|
| `AIOX-NOTEBOOK-FINDINGS.md` (17 KB) | `aiox-core/docs/research/notebooklm/` — these are research artifacts |
| `AIOX-NOTEBOOK-QUESTIONS.md` (20 KB) | `aiox-core/docs/research/notebooklm/` |
| `AIOX-PHASES-COMPLETED.md` (10 KB) | `aiox-core/docs/history/` or `aiox-core/CHANGELOG.md` excerpt |
| `CLAUDE.md` (1.5 KB) | **KEEP** at root — it's the workspace root CLAUDE.md, used by Claude Code |
| `GUIA-AUTONOMIA-ECONOMIA-TOKENS.md` (68 KB) | `aiox-core/docs/guides/token-economy/` |

#### Loose `.png` (51 files — at root level)

51 images of forms screenshots, message templates, agent OS diagrams, profile picture. Suggested:

| Pattern | Count | Destination |
|---|---:|---|
| `Forms_Cadastro_*.png` | 3 | `business-ai-first/docs/research/kommo-forms-pre-deactivation/` |
| `msg-template-*.png` | 43 | `business-ai-first/db-inventory/wa-templates-screenshots/` (already part of EPIC-013.10 wave9 seed source) |
| `all-msg-template-kommo-crm-meta-whatsapp.png` | 1 | Same as above |
| `agents_os-1.png`, `agents_os-2.png` | 2 | `aiox-core/docs/diagrams/` |
| `[CM] Perfil 512x512 px.png` | 1 | Personal asset — **move to `C:/Users/eliel/`** or business-ai-first/assets/brand/ |
| `whatsapp_business_screenshots*.png` | varies | `business-ai-first/db-inventory/wa-business/` |

#### Loose `.csv` (2 files)

| File | Destination |
|---|---|
| `[CM] Dados CRM.csv` | `business-ai-first/db-inventory/exports/2026-05-07/` |
| `[CM] Dados CRM_v2.csv` | Same |

---

## Proposed target structure

```text
C:/dev/
├── CLAUDE.md                    # workspace root config (keep)
├── .gitignore                   # workspace gitignore (keep)
├── aiox-core/                   # framework canonical
│   ├── audits/                  # cross-project audit reports (NEW — this file lives here)
│   ├── governance/              # evolution pipeline + handoff types (NEW)
│   ├── docs/
│   │   ├── architecture/cross-project/  # moved from C:/dev/architecture
│   │   ├── research/notebooklm/         # moved from C:/dev/AIOX-*.md
│   │   └── guides/token-economy/        # moved from C:/dev/GUIA-*.md
│   ├── infrastructure/docker/   # moved from C:/dev/docker (if framework-shared)
│   └── archive/                 # for legacy assets that we don't want to delete
│       └── legacy-etl/          # if kommo-sync becomes legacy
├── business-ai-first/           # project (active epic CDM)
│   ├── docs/research/kommo-forms-pre-deactivation/  # moved from loose Forms_*.png
│   └── db-inventory/exports/    # moved from loose [CM] *.csv
├── aiox-dashboard/              # AIOS Platform UI (confirm active)
├── cadastro-rapido/             # Next.js portal (confirm active)
├── cdm-portal/                  # confirm if active or delete
├── db-inventory/                # cross-project DB asset (keep at root, add OWNERSHIP.md)
└── archive/                     # workspace-level archive for things we want to keep but not active
    └── kommo-sync/              # if legacy
```

**Worktrees** (`bai-*`) live next to the parent project after cleanup of the 3 done ones.

**Loose images and CSVs** all relocate to relevant project subdirectories or framework docs.

---

## Decision matrix for Eliel

| Action | Risk | Reversibility | Recommendation |
|---|---|---|---|
| Remove 3 done worktrees (V1/V5/V7) | Low | High (just delete) | **APPROVE** |
| Preserve 2 EPIC-014 worktrees | None | N/A | **APPROVE** |
| Move 5 loose `.md` to framework docs | Low | High (git mv) | **APPROVE pending project assignments** |
| Move 51 `.png` to project subdirs | Low | High | **APPROVE pending classification** |
| Investigate `.agents/`, `agents/`, `docker/` | Low (read-only) | N/A | **APPROVE** — I do this in next session |
| Confirm `cadastro-rapido` active | None (informational) | N/A | **Eliel must answer** |
| Confirm `cdm-portal` active or stub | None | N/A | **Eliel must answer** |
| Confirm `kommo-sync` legacy or active | None | N/A | **Eliel must answer** |
| Confirm `aiox-dashboard` active | None | N/A | **Eliel must answer** |
| Create `aiox-core/governance/` and `audits/` | Low | High | **APPROVE** — already creating in this session |
| Add `OWNERSHIP.md` to `db-inventory/` | Low | High | **APPROVE** |

---

## Open questions for Eliel (before any move)

1. **`cadastro-rapido/`** — repo onde EPIC-MVP-CDM-CADASTRO Wave 4 vai entregar os 3 forms. Manter ativo? Promover a primary project?
2. **`aiox-dashboard/`** — qual é o status real desse projeto? Ativo, paused, archived?
3. **`cdm-portal/` (7 KB stub)** — projeto futuro, abandonado, ou worktree órfã?
4. **`kommo-sync/`** — ETL ainda em uso ou pode arquivar (está marcado como pausado em B4 do handoff Wave 0)?
5. **Loose images** — pode usar regex de padrão para mover em batch ou prefere classificar manualmente para evitar perda?

Sem respostas, audit fica com recomendação. Não vou mover nada sem aprovação explícita.

---

## Linked artifacts

- `aiox-core/governance/evolution-pipeline.md` (Entrega 3, sister artifact) — defines how this audit gets promoted into framework convention
- `aiox-core/governance/squad-activation-strategy.md` (Entrega 4) — how `@aiox-master` should consult this kind of cross-cutting audit before delegating

---

## Author signature

— Orion (`@aiox-master`), conduzindo audit estrutural por solicitação de Eliel após sessão de correção Wave 1.A.
Padrão de output: this file (audit narrative) + machine-readable accompanying YAML if Eliel approves promotion to actionable runbook.
