# Architecture §9 — Rollback Plan

**Source:** `../architecture.md` lines 870-972
**Sharded by:** @po, 2026-05-12

---

## 9.1 Three-Layer Rollback Strategy

### Layer 1 — Env flag (fastest, ~10 seconds)

If the new SQLite-backed vector-store or semantic-dedup is misbehaving in production:

```bash
# Stop scheduler
hydra schedule stop

# Set env flag in .env or shell
export HYDRA_USE_LEGACY_VECTOR_STORE=1

# Restart scheduler — now reads from *.legacy.json files
hydra schedule start
```

**What it does:** The vector-store and semantic-dedup modules check this env var at load time. If set, they ignore the SQLite tables and re-activate the legacy JSON readers (kept read-only for one release cycle per NFR8).

**Caveat:** The legacy JSON files are *frozen* at sprint-start (renamed to `*.legacy.json` after successful migration). New embeddings/fingerprints added since the migration would be lost from search results — but the data is still in SQLite, accessible if you reverse the flag.

### Layer 2 — JSON restore (5 minutes)

If Layer 1 isn't enough (e.g., the migration itself was buggy and we need to rebuild):

```bash
# Stop scheduler
hydra schedule stop

# Restore from preflight-mandated backups
cd D:/AIOS/tools/hydra/hydra-data/
cp vectors/vector-index.backup.json    vectors/vector-index.json
cp fingerprints/fingerprints.backup.json  fingerprints/fingerprints.json

# Set rollback flag
export HYDRA_USE_LEGACY_VECTOR_STORE=1

# Restart
hydra schedule start
```

**Backups are mandatory** (Story 1.1a AC #1 — `preflight/02-backup-verify.mjs`). Migration refuses to start without verified backups.

### Layer 3 — Git checkpoint revert (15 minutes)

If we need to revert the **code** (e.g., new pipeline orchestrator has an unrecoverable bug):

```bash
# Find the pre-sprint commit
git log --oneline | grep "pre-resilience-sprint"   # tag will be created at sprint start

# Checkout pre-sprint state
git checkout <pre-resilience-sprint-tag>

# Restore JSON state (Layer 2 above)
# ... (same steps as Layer 2)

# Restart
hydra schedule start
```

**Story 1.10 deliverable:** `docs/projects/hydra-content-intel/resilience-sprint/05-runbook/rollback-runbook.md` documents this exact sequence with copy-paste-ready commands.

## 9.2 Rollback Test Plan (Story 1.10 IV2)

Before sprint completion, rollback must be tested end-to-end:

1. Snapshot `hydra-data/` (full directory) to `hydra-data-snapshot-pre-rollback-test/`
2. Run a full pipeline to populate new SQLite tables with fresh data
3. Execute Layer 1 (env flag) → confirm `hydra search` returns legacy results
4. Execute Layer 2 (JSON restore) → confirm pipeline runs with restored JSON
5. Execute Layer 3 (git revert) → confirm pre-sprint code + restored data → pipeline still runs
6. Restore snapshot to `hydra-data/` → return to current state

**Rollback test runs in dry-run mode** (no Jarvis KB writes) to avoid corrupting clone feeds.

## 9.3 Rollback Decision Tree

```
Symptom: heap > 2GB or OOM
  → Layer 1 (env flag) — restore JSON readers, observe whether issue resolves
     → If still OOM: bug is in streaming refactor (pipeline.js), not storage
        → Layer 3 (git revert) to pre-sprint orchestrator

Symptom: routing decisions wrong (clones receiving wrong items)
  → Inspect distribution-service.js + 3 YAMLs
     → If config-level fix possible: edit YAML, no rollback needed
     → If logic-level: Layer 3 (git revert)

Symptom: hydra search returns wrong results
  → Layer 1 (env flag) — falls back to JSON store
     → If correct: bug is in SQLite read path, fix forward
     → If still wrong: data integrity issue — Layer 2 (restore backup)

Symptom: SQLite database locked / corrupted
  → Layer 2 (restore backup) — last-known-good JSON state
  → File issue, plan dedicated fix sprint
```
