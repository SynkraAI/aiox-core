# Story 1.6: Unified DistributionService

**Status:** Draft
**Story ID:** 1.6
**Sprint:** HYDRA Resilience
**Owner:** @dev
**Estimated LOC:** ~500 LOC (service + 2 new YAMLs + validation script + snapshot test)
**Dependencies:** Story 1.4 (pipeline split — `stages/distribute.js` is the call site)
**Date:** 2026-05-12
**Sourced from PRD §5 Story 1.6 (lines 666-689)**

---

## User Story

**As a** HYDRA developer,
**I want** a single `DistributionService` used by both live pipeline and dossier ingest,
**so that** the divergent codepaths consolidate and `deptToDomainMap` lives in one place.

## Acceptance Criteria

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

## Integration Verification

- **IV1:** `ingest-dossier.mjs --jsonl X` produces identical feed output before/after refactor
- **IV2:** Live pipeline distribution to clones unchanged (same clones receive same items)
- **IV3:** Adding a new department in `dept_to_domain.yaml` propagates without code changes

## Architecture References

- Architecture §3.1 Phase 4 (Unify Distribution Codepaths) — `03-architecture/sharded/01-migration-strategy.md`
- Architecture §4.11 `distribution-service.js` spec — `03-architecture/sharded/03-modules.md`
- Architecture §6.1 New YAML files (`angle_to_domain.yaml`, `dept_to_domain.yaml`) — `03-architecture/sharded/05-configuration.md`
- Architecture §6.3 YAML schema validation
- Architecture §7.1 R4 mitigation (snapshot test, validation script)
- Architecture §8.1 Test locations: `distribution-service.test.js`, `routing-snapshot.test.js`
- PRD §1.7: "The two maps are at **different semantic levels** — router map keys by department, dossier map keys by angle. They share zero keys and must coexist."

## Dev Notes

- **PRD §1.7 critical correction:** the original "merge two `deptToDomainMap`s" plan was wrong. Router map keys by *department* (`mental-health-ops`), dossier map keys by *angle* (`PSICOLOGIA`). They share zero keys. The fix is a **third layer (angle → domain → department)** — that's why FR5 specifies 3 YAMLs, not a merged single map.
- **FR5 Three-layer design:**
  - **Layer A:** `angle_to_domain.yaml` — angle codes (UPPER_SNAKE) → HYDRA domains. Extracted from `ingest-dossier.mjs:50-64`.
  - **Layer B:** `domains.yaml` (existing) — domain → keywords for matching. **Unchanged.**
  - **Layer C:** `dept_to_domain.yaml` — mind-clone department (lower-kebab) → domains. Extracted from `mind-clone-router.js:159-191`.
- **`mind-clone-router.js` does NOT move** (R9 mitigation, Architecture §7.1). Only the JS object literal moves to YAML. The routing algorithm stays in JS.
- **YAML content examples** are in Architecture §6.1; extract verbatim from current code (no semantic changes during extraction).
- **Snapshot test (AC #7):** routing decisions for 100 sample items identical pre/post refactor. **Diff must be empty** for unchanged content (R4 mitigation). File: `tests/distribution/routing-snapshot.test.js`.
- **`bin/ingest-dossier.mjs` reduction** is partial here; full reduction to a 1-line wrapper happens in Story 1.7 (when `--from-jsonl` lands).
- **Validation script (AC #6):** `scripts/validate-domain-mapping.mjs` enforces no orphan keys across the 3 YAMLs. Per Architecture §6.3, no formal JSON Schema validator (sprint constraint: no new dependencies). Procedural validation only.
