# Architecture §6 — Configuration Changes

**Source:** `../architecture.md` lines 686-756
**Sharded by:** @po, 2026-05-12

---

## 6.1 New YAML Files

### `src/config/angle_to_domain.yaml` (FR5 Layer A — Story 1.6)

**Purpose:** Map dossier *angle codes* (UPPER_SNAKE) to HYDRA domains. Extracted from `bin/ingest-dossier.mjs:50-64`.

**Example content:**
```yaml
# Angle codes are uppercase, project-specific identifiers used in dossier JSONLs.
# These map to one or more HYDRA domains (defined in domains.yaml).
# Multiple angles can map to the same domain.

highticket:
  PSICOLOGIA:    [psychology, behavioral-econ]
  METODO:        [methodology, frameworks]
  MERCADO_BR:    [market-brasil]
  TRAFEGO:       [paid-traffic, attribution]
  TRANSVERSAL:   [psychology, marketing-strategy]

anipis:
  CLINICO:       [mental-health, clinical-practice]
  TECH:          [health-tech, ai-clinical]
  MERCADO:       [healthcare-business, samd-regulation]
```

### `src/config/dept_to_domain.yaml` (FR5 Layer C — Story 1.6)

**Purpose:** Map *mind-clone department codes* (lower-kebab) to HYDRA domains. Extracted from `mind-clone-router.js:159-191`.

**Example content (illustrative; the actual content comes from extracting the existing JS object):**
```yaml
# Departments are the canonical organizational unit in the mind-clone catalog.
# Each department maps to 1+ HYDRA domains; routing fans items to clones in the
# matched departments.

departments:
  mental-health-ops:        [mental-health, healthcare-business]
  clinical-ops:             [clinical-practice, mental-health]
  therapy:                  [mental-health, clinical-practice]
  design-terapeutico:       [ux, mental-health]
  health-tech:              [health-tech, ai-clinical]
  health-data:              [data-eng, health-tech]
  # ... (24 more — full set comes from mind-clone-router.js:159-191)
```

**Validation:** `scripts/validate-domain-mapping.mjs` runs on every CI run (or pre-commit hook in a future sprint) and enforces:
- Every angle in `angle_to_domain.yaml` maps to a domain that exists in `domains.yaml`
- Every department in `dept_to_domain.yaml` maps to a domain that exists in `domains.yaml`
- Every clone referenced via department mapping exists in `.aios-core/data/jarvis-mind-clone-index.json`

## 6.2 New Environment Variables

Added to `tools/hydra/.env.example` (Story 1.10 deliverable):

| Var | Default | Purpose |
|---|---|---|
| `HYDRA_USE_LEGACY_VECTOR_STORE` | (unset) | Set to `1` to fall back to JSON reader for vector-store + semantic-dedup. **Rollback flag — NFR8.** Lives for one release cycle. |
| `HYDRA_HEAP_WARN_MB` | `1800` | Threshold at which `heap-monitor.js` fires a Telegram HIGH alert. Below 2GB ceiling so operator has time to react before OOM. |
| `HYDRA_COST_BRL_RATE` | `5.20` | USD→BRL conversion rate used by `cost-tracker.js` for BRL cost columns. Operator updates manually (no live FX feed in scope). |

**Rationale for not adding more env vars:** All other tunables continue to live in YAML (per existing pattern in `routing.yaml`, `scheduler.yaml`, `thresholds.yaml`). These three vars are exceptional because they need to be set BEFORE the YAML loader runs (rollback flag) or are operator-personal (FX rate, alert threshold).

## 6.3 YAML Schema Validation

No formal JSON Schema validator added (out of scope, sprint constraint: no new dependencies). The 3 new YAMLs are validated procedurally by `scripts/validate-domain-mapping.mjs` (Story 1.6 AC #6).
