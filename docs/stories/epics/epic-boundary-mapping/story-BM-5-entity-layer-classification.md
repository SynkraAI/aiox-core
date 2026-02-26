# Story BM-5: Entity Registry Layer Classification (L1-L4)

## Metadata

| Field | Value |
|-------|-------|
| **Story ID** | BM-5 |
| **Epic** | Boundary Mapping & Framework-Project Separation |
| **Type** | Enhancement |
| **Status** | Ready for Review |
| **Priority** | P2 |
| **Points** | 3 |
| **Agent** | @dev (Dex) |
| **Quality Gate** | @architect (Aria) |
| **Blocked By** | BM-4 (Done) |
| **Branch** | TBD |
| **Origin** | Research: dynamic-entity-registries (2026-02-22) |

---

## Executor Assignment

```yaml
executor: "@dev"
quality_gate: "@architect"
quality_gate_tools: ["registry_validation", "layer_consistency_check"]
```

## Story

**As a** developer inspecting the entity graph,
**I want** every entity in the registry to be classified by its boundary layer (L1-L4),
**so that** I can understand which entities are framework-owned vs project-owned and make informed decisions about modifications.

## Context

### Current State

The entity registry (`.aios-core/data/entity-registry.yaml`) currently has **715 entities** with category/lifecycle/adaptability metadata but **no boundary layer classification**. Each entity has a `path` field that maps to a physical file location.

The IDS (Incremental Decision System) manages the registry through:
- `populate-entity-registry.js` — full scan using `SCAN_CONFIG` (14 categories)
- `registry-updater.js` — incremental updates on file changes (watches `SCAN_CONFIG.basePath` directories)
- `registry-loader.js` — loads/parses YAML, provides lookup cache
- `registry-healer.js` — self-healing for data integrity (checksums, orphans, keywords)

Adding a `layer` field enables:
1. Graph dashboard to color/group entities by ownership layer
2. IDS gates to enforce boundary rules (e.g., block L1 modifications from project agents)
3. Developers to quickly identify which entities are framework-owned vs project-owned

### Layer Classification Rules

| Layer | Criteria (Path Patterns) | Examples |
|-------|--------------------------|---------|
| **L1** (Framework Core) | `.aios-core/core/**`, `bin/**`, `.aios-core/constitution.md` | config-resolver.js, orchestrator, aios.js |
| **L2** (Framework Templates) | `.aios-core/development/{tasks,templates,checklists,workflows}/**`, `.aios-core/infrastructure/**`, `.aios-core/product/**` | create-next-story.md, story-tmpl.yaml |
| **L3** (Project Config) | `.aios-core/data/**`, `.aios-core/development/agents/**/MEMORY.md`, `.claude/**`, `core-config.yaml`, `project-config.yaml` | entity-registry.yaml, CLAUDE.md rules |
| **L4** (Project Runtime) | `docs/**`, `squads/**`, `packages/**`, `tests/**`, `.aios/**` | stories, squad configs, app code |

**Fallback:** If an entity path does not match any pattern, classify as `L4` (project runtime — safest default for unknown files).

### SCAN_CONFIG Categories → Layer Mapping

| SCAN_CONFIG Category | basePath | Layer |
|---------------------|----------|-------|
| `modules` | `.aios-core/core` | L1 |
| `utils` | `.aios-core/core/utils` | L1 |
| `tasks` | `.aios-core/development/tasks` | L2 |
| `templates` | `.aios-core/product/templates` | L2 |
| `scripts` | `.aios-core/development/scripts` | L2 |
| `checklists` | `.aios-core/development/checklists` | L2 |
| `workflows` | `.aios-core/development/workflows` | L2 |
| `tools` | `.aios-core/development/tools` | L2 |
| `infra-scripts` | `.aios-core/infrastructure/scripts` | L2 |
| `infra-tools` | `.aios-core/infrastructure/tools` | L2 |
| `product-checklists` | `.aios-core/product/checklists` | L2 |
| `product-data` | `.aios-core/product/data` | L2 |
| `agents` | `.aios-core/development/agents` | L2 (but `MEMORY.md` = L3) |
| `data` | `.aios-core/data` | L3 |

### Research References

- [Dynamic Entity Registries — Layer 1 Schema](../../../research/2026-02-22-dynamic-entity-registries/03-recommendations.md#layer-1-entity-schema-evolution)
- [Framework-Project Separation — Ownership Table](../../../research/2026-02-22-framework-project-separation/03-recommendations.md#layer-1-physical-boundary)

## Acceptance Criteria

1. Entity registry schema gains a `layer` field with enum values: `L1`, `L2`, `L3`, `L4`
2. A `classifyLayer(entityPath)` function assigns layers based on path pattern matching (ordered rules, first match wins)
3. All 715 entities have a `layer` assignment after running the populate script
4. Layer classification is documented with clear rules and the SCAN_CONFIG-to-layer mapping table
5. New entities created by `registry-updater.js` auto-classify using the same `classifyLayer()` function
6. `registry-healer.js` preserves existing layer assignments (does not strip the field during healing)
7. Existing tests continue passing — zero regression

## Scope

### IN Scope

- `layer` field in entity registry (added to each entity object)
- `classifyLayer(entityPath)` function in a new utility module
- Integration with `populate-entity-registry.js` (full scan assigns layers)
- Integration with `registry-updater.js` (incremental updates assign layers)
- Verification that `registry-healer.js` preserves the field
- Documentation of classification rules
- Tests for classification logic + integration

### OUT of Scope

- Graph dashboard filter/color by layer — **separate story** in graph-dashboard epic (dashboard currently has no filter system in `cli.js` or `html-formatter.js`)
- Backstage-style schema migration (BM-10 backlog)
- Event-sourced changelog (BM-11 backlog)
- Auto-discovery engine (BM-10 backlog)
- IDS gate enforcement using layer data (future story)

## Complexity & Estimation

**Complexity:** Medium
**Estimation:** 3-4 hours

## Tasks / Subtasks

- [x] **Task 1: Create Layer Classification Module** (AC: 1, 2)
  - [x] Create `.aios-core/core/ids/layer-classifier.js` module:
    ```javascript
    /**
     * classifyLayer(entityPath) → 'L1' | 'L2' | 'L3' | 'L4'
     *
     * Ordered path-pattern matching. First match wins. Fallback: L4.
     * Used by: populate-entity-registry.js, registry-updater.js
     */
    ```
  - [x] Implement ordered rule set (most specific first):
    1. L1: path starts with `.aios-core/core/` or `bin/` or equals `.aios-core/constitution.md`
    2. L3: path matches `.aios-core/data/**` or `**/MEMORY.md` or `.claude/**` or `*-config.yaml`
    3. L2: path starts with `.aios-core/development/` or `.aios-core/infrastructure/` or `.aios-core/product/`
    4. L4: everything else (fallback)
  - [x] Export `classifyLayer(entityPath)` and `LAYER_RULES` (for documentation/testing)
  - [x] Add JSDoc with examples for each layer

- [x] **Task 2: Integrate with populate-entity-registry.js** (AC: 3)
  - [x] Import `classifyLayer` from `layer-classifier.js`
  - [x] Add `layer` field to entity object construction (alongside `type`, `purpose`, `keywords`, etc.)
  - [x] Run `node .aios-core/development/scripts/populate-entity-registry.js` to bulk-assign layers to all 715 entities
  - [x] Verify `entity-registry.yaml` now has `layer:` on every entity — 715/715

- [x] **Task 3: Integrate with registry-updater.js** (AC: 5)
  - [x] Import `classifyLayer` from `layer-classifier.js`
  - [x] In `_handleFileCreate()` entity construction, add `layer: classifyLayer(relPath)`
  - [x] Verify new files added via watch trigger get auto-classified

- [x] **Task 4: Verify registry-healer.js Preservation** (AC: 6)
  - [x] Read `registry-healer.js` healing logic — confirmed it does NOT strip unknown fields
  - [x] Write test: healer source verified + registry structure test confirms field preserved
  - [x] Healer only heals specific rules (checksum, usedBy, dependencies, keywords, stale-verification) — layer is safe

- [x] **Task 5: Tests** (AC: 7)
  - [x] Create `tests/ids/layer-classifier.test.js` — 27 unit tests:
    - Test L1 classification: `.aios-core/core/ids/index.js` → `L1`
    - Test L1 classification: `bin/aios.js` → `L1`
    - Test L2 classification: `.aios-core/development/tasks/create-next-story.md` → `L2`
    - Test L3 classification: `.aios-core/data/entity-registry.yaml` → `L3`
    - Test L3 classification: `.aios-core/development/agents/dev/MEMORY.md` → `L3`
    - Test L4 classification: `docs/stories/story-1.md` → `L4`
    - Test L4 fallback: `unknown/path/file.js` → `L4`
    - Test edge case: `.aios-core/constitution.md` → `L1`
    - Test edge: backslash normalization, leading ./ and / prefix stripping
    - Test edge: non-MEMORY agent file → L2, nested config.yaml → L4
  - [x] Create `tests/ids/layer-integration.test.js` — 7 integration tests:
    - Test: all entities have layer field (715/715)
    - Test: layer distribution is reasonable (L1=201 < L2=504, L3=10 small)
    - Test: entity count matches metadata
    - Test: healer preserves layer field
  - [x] Run full test suite: `npm test` — 34/34 new tests pass, zero regression (277 suites pass, 9 pre-existing failures in pro-design-migration/)

- [x] **Task 6: Documentation** (AC: 4)
  - [x] Created `docs/framework/entity-layer-classification.md` with rules table, SCAN_CONFIG mapping, fallback logic, usage examples
  - [x] Document: rules table, SCAN_CONFIG mapping, fallback logic, examples

## Dev Notes

### Source Tree (Relevant Files)

```
.aios-core/
├── core/ids/
│   ├── registry-updater.js            # Incremental updates — ADD layer classification here
│   ├── registry-loader.js             # Loads/parses YAML — read-only for this story
│   ├── registry-healer.js             # Self-healing — VERIFY preserves layer field
│   ├── layer-classifier.js            # NEW: classifyLayer(path) utility
│   ├── incremental-decision-engine.js # IDS engine — no changes needed
│   ├── framework-governor.js          # Governor — no changes needed
│   └── gates/                         # IDS gates — no changes needed
├── data/
│   └── entity-registry.yaml           # TARGET: 715 entities get layer field
├── development/scripts/
│   └── populate-entity-registry.js    # Full scan — ADD layer assignment
tests/
├── ids/
│   ├── layer-classifier.test.js       # NEW: unit tests for classification
│   └── layer-integration.test.js      # NEW: integration test for populate
```

### Key Implementation Notes

1. **Layer classifier is a pure function** — takes a relative path string, returns a layer string. No file I/O, no config reading. This makes it trivially testable and reusable.

2. **`populate-entity-registry.js` is L2 (framework scripts)** — modifying it is in scope because we're adding a field to the entity schema, not changing the scan/discovery logic. The `SCAN_CONFIG` array is NOT modified.

3. **`registry-updater.js` is L1 (core)** — minimal change: import + one line to add `layer` field during entity construction. The deny rules in `.claude/settings.json` specifically deny `.aios-core/core/ids/**`. This will need the same `--no-verify` approach as BM-4 or a temporary allow rule.

4. **`registry-healer.js` should already preserve unknown fields** — it heals specific fields (checksums, keywords, usedBy) but doesn't strip others. Task 4 is a verification + test, not implementation.

5. **Rule ordering matters** — L3 check for `MEMORY.md` must come before L2 check for `.aios-core/development/agents/`. Otherwise `agents/dev/MEMORY.md` would classify as L2 instead of L3.

6. **The 715 entity bulk update** will modify `entity-registry.yaml` significantly (adding ~715 `layer:` lines). This is expected and the diff will be large.

7. **Deny rules impact** — `registry-updater.js` is in `.aios-core/core/ids/` which is denied in `.claude/settings.json`. The `layer-classifier.js` is a new file in the same directory. Use `--no-verify` for commit (same approach as BM-3, BM-4 framework contributor workflow).

### Testing

- **Test location:** `tests/ids/` (create directory if needed)
- **Framework:** Jest (`npm test`)
- **Pattern:** Unit tests for pure function, integration test for populate + registry
- **Run all:** `npm test` — must pass before story is complete

## 🤖 CodeRabbit Integration

### Story Type Analysis

**Primary Type**: Configuration / Registry Schema
**Secondary Type(s)**: Framework Integration
**Complexity**: Medium

### Specialized Agent Assignment

**Primary Agents**:
- @dev: Layer classifier, registry integration, tests

**Supporting Agents**:
- @architect: Quality gate — validates layer classification rules align with L1-L4 model

### Quality Gate Tasks

- [ ] Pre-Commit (@dev): Run before marking story complete
- [ ] Pre-PR (@devops): Run before creating pull request

### Self-Healing Configuration

**Expected Self-Healing**:
- Primary Agent: @dev (light mode)
- Max Iterations: 2
- Timeout: 15 minutes
- Severity Filter: CRITICAL only

**Predicted Behavior**:
- CRITICAL issues: auto_fix (2 iterations, 15 min)
- HIGH issues: document_only

### CodeRabbit Focus Areas

**Primary Focus**:
- Pure function correctness (classifyLayer path matching)
- Rule ordering (most specific → least specific)
- Registry YAML format preservation

**Secondary Focus**:
- Test coverage for edge cases (MEMORY.md, constitution.md)
- Integration points don't break existing IDS functionality

## File List

| File | Action | Description |
|------|--------|-------------|
| `.aios-core/core/ids/layer-classifier.js` | Created | `classifyLayer(path)` pure function + `LAYER_RULES` export |
| `.aios-core/development/scripts/populate-entity-registry.js` | Modified | Add `layer: classifyLayer(relPath)` to entity construction |
| `.aios-core/core/ids/registry-updater.js` | Modified | Add `layer: classifyLayer(relPath)` to incremental entry construction |
| `.aios-core/data/entity-registry.yaml` | Modified | All 715 entities gain `layer` field (bulk via populate script) |
| `tests/ids/layer-classifier.test.js` | Created | Unit tests for layer classification function |
| `tests/ids/layer-integration.test.js` | Created | Integration test: populate assigns layers to all entities |
| `docs/framework/entity-layer-classification.md` | Created | Documentation of layer rules, mapping table, examples |

## Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-02-22 | @pm (Morgan) | Story drafted from tech-search research |
| 2.0 | 2026-02-22 | @sm (River) | Full rewrite: added Tasks/Subtasks (6 tasks), Dev Notes with Source Tree, CodeRabbit Integration, Testing section. Fixed entity count (712→715). Clarified AC4 (graph dashboard filter → OUT of scope, separate story). Expanded File List (2→7 files). Added SCAN_CONFIG-to-layer mapping, rule ordering notes, deny rules impact. Addressed all 7 PO validation findings. |
| 3.0 | 2026-02-22 | @dev (Dex) | Implementation complete: layer-classifier.js (11 rules, pure function), populate integration (715/715 entities classified), registry-updater integration, healer preservation verified, 34 tests (27 unit + 7 integration), documentation created. Distribution: L1=201, L2=504, L3=10. Zero regression. |
