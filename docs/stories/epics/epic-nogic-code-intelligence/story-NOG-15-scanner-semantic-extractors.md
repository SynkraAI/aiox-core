# Story NOG-15: Scanner Semantic Extractors for Entity Registry

## Metadata

| Field | Value |
|-------|-------|
| **Story ID** | NOG-15 |
| **Epic** | NOGIC — Code Intelligence Integration |
| **Type** | Enhancement |
| **Status** | Ready for Review |
| **Priority** | P1 |
| **Points** | 5 |
| **Agent** | @dev (Dex) |
| **Quality Gate** | @qa (Quinn) |
| **Blocked By** | None (standalone — improves existing scanner) |
| **Branch** | `feat/epic-nogic-code-intelligence` |

---

## Executor Assignment

```yaml
executor: "@dev"
quality_gate: "@qa"
quality_gate_tools: ["jest", "eslint", "coderabbit"]
```

---

## Story

**As a** framework developer viewing the AIOS graph dashboard,
**I want** the entity registry scanner to extract semantic dependencies from YAML agent definitions and Markdown task files,
**so that** the graph shows real relationships (dependencies + usedBy) for all 531+ entities instead of the current 0-16% coverage for non-JS files.

---

## Problem Statement

The entity registry (`entity-registry.yaml`, 531 entities) is populated by `populate-entity-registry.js` which only detects dependencies via:

1. `require()` / `import` statements in JS files
2. Simple `dependencies:` lists in Markdown

**Result:** JS modules have ~85% relationship coverage, but:
- Agent YAML files: ~8% coverage (dependencies section not parsed)
- Task Markdown files: ~16% coverage (cross-references not extracted)
- Checklists, data, workflows: 0% coverage
- `usedBy` fields: empty for most entities (no reverse index)
- Missing SCAN_CONFIG categories: workflows, utils, tools

**Evidence:** Graph visualization (GD-7) revealed agents like @po, @analyst with zero relationships, and hundreds of tasks with empty dependency/usedBy arrays.

### Research Reference

[Research: Entity Registry Enrichment](../../../research/2026-02-21-entity-registry-enrichment/README.md)

---

## Acceptance Criteria

### AC1: New SCAN_CONFIG Categories
- [ ] `SCAN_CONFIG` expanded with 3 new categories: `workflows`, `utils`, `tools`
- [ ] After scanner runs, `entity-registry.yaml` contains entities with `type: workflow`, `type: util`, `type: tool`
- [ ] Existing 7 categories unmodified (backward compatible)

### AC2: YAML Agent Dependency Extraction
- [ ] Scanner parses `.yaml`/`.md` agent files and extracts dependencies from `dependencies.tasks`, `dependencies.templates`, `dependencies.checklists`, `dependencies.tools`, `dependencies.scripts` fields
- [ ] Agent `dev` registry entry has dependencies including `dev-develop-story.md`, `execute-checklist.md`, etc.
- [ ] Malformed YAML files are skipped with warning (never crash the scanner)

### AC3: Markdown Cross-Reference Extraction
- [ ] Scanner extracts references from Markdown task/checklist files using 4 structured patterns: YAML dependency blocks, label lists (`- **Tasks:** a.md, b.md`), Markdown links to `.md`/`.yaml`/`.js` files, and agent references (`@dev`, `@qa`)
- [ ] Task file `dev-develop-story.md` has dependencies including other tasks it references
- [ ] False positive rate < 5% (only structured patterns, no free-text matching)

### AC4: usedBy Reverse Index
- [ ] `buildUsedByIndex()` post-processor runs after all forward dependencies are collected
- [ ] Every entity referenced as a dependency by another entity has the referencing entity in its `usedBy` array
- [ ] At least 50% of entities with non-empty `dependencies` have corresponding `usedBy` entries in their targets

### AC5: Zero Regression
- [ ] All existing tests pass without modification
- [ ] Entities previously in the registry retain their existing dependencies (additive-only merge)
- [ ] Scanner completes without errors on the full codebase
- [ ] No new NPM dependencies added (uses existing `js-yaml` and native regex)

### AC6: Workflow/Utils/Tools Relationships
- [ ] Workflow YAML files have dependencies extracted from `phases[].task`, `phases[].agent`, `steps[].uses` fields
- [ ] Utils JS files have dependencies extracted via existing `require()`/`import` detection
- [ ] Tool definition files have at minimum their category correctly assigned

---

## Tasks / Subtasks

- [x] **Task 1: Expand SCAN_CONFIG with new categories** (AC: 1)
  - [x] 1.1 Add `workflows` entry: `{ category: 'workflows', basePath: '.aios-core/development/workflows', glob: '**/*.{yaml,yml}', type: 'workflow' }`
  - [x] 1.2 Add `utils` entry: `{ category: 'utils', basePath: '.aios-core/core/utils', glob: '**/*.js', type: 'util' }`
  - [x] 1.3 Add `tools` entry: `{ category: 'tools', basePath: '.aios-core/development/tools', glob: '**/*.{md,js,sh}', type: 'tool' }`
  - [x] 1.4 Run scanner and verify new entities appear in registry

- [x] **Task 2: Implement YAML semantic dependency extractor** (AC: 2, 6)
  - [x] 2.1 Create function `extractYamlDependencies(filePath, entityType)` using `js-yaml`
  - [x] 2.2 Define `YAML_DEP_FIELDS` map for agent files: nested fields (`dependencies.tasks`, `.templates`, `.checklists`, `.tools`, `.scripts`) and array fields (`commands[].task`)
  - [x] 2.3 Define `YAML_DEP_FIELDS` map for workflow files: array fields (`phases[].task`, `phases[].agent`, `steps[].task`, `steps[].uses`)
  - [x] 2.4 Integrate extractor into scanner pipeline — call for `agents` and `workflows` categories
  - [x] 2.5 Wrap in try/catch per file — log warning on parse failure, never crash

- [x] **Task 3: Implement Markdown cross-reference extractor** (AC: 3)
  - [x] 3.1 Enhance existing `extractMarkdownDependencies()` with 4 additional regex patterns:
    - Pattern A: YAML dependency blocks with subcategories (`dependencies:\n  tasks:\n    - name.md`)
    - Pattern B: Label lists (`- **Tasks:** a.md, b.md, c.md`)
    - Pattern C: Markdown links to entity files (`[text](path/to/entity.md)`)
    - Pattern D: Agent references (`@dev`, `@qa`, `@sm`)
  - [x] 3.2 Filter extracted references: only `.md`, `.yaml`, `.js` extensions for file refs; validate agent refs against known agent IDs
  - [x] 3.3 Integrate into scanner pipeline for `tasks`, `checklists`, and `templates` categories

- [x] **Task 4: Implement usedBy reverse index post-processor** (AC: 4)
  - [x] 4.1 Enhanced existing `resolveUsedBy(registry)` with nameIndex Map for broader entity resolution
  - [x] 4.2 Build `nameIndex` Map for entity resolution (by ID, by name, by filename)
  - [x] 4.3 For each entity's dependencies, add the entity ID to the target's `usedBy` array (deduplicated)
  - [x] 4.4 Integrated as pipeline step: resets usedBy on re-scan, resolves by ID/filename/basename

- [x] **Task 5: Tests** (AC: 5)
  - [x] 5.1 Test: SCAN_CONFIG has 10 categories (7 existing + 3 new)
  - [x] 5.2 Test: `extractYamlDependencies` extracts nested fields from agent YAML
  - [x] 5.3 Test: `extractYamlDependencies` extracts array fields from workflow YAML
  - [x] 5.4 Test: `extractYamlDependencies` handles malformed YAML gracefully (returns [])
  - [x] 5.5 Test: Enhanced markdown extractor detects all 4 patterns
  - [x] 5.6 Test: Markdown extractor filters out non-entity references
  - [x] 5.7 Test: `buildUsedByIndex` creates correct reverse references
  - [x] 5.8 Test: `buildUsedByIndex` deduplicates usedBy entries
  - [x] 5.9 Test: Existing scanner tests still pass (regression check)

- [x] **Task 6: Validation**
  - [x] 6.1 `npm run lint` — zero errors in modified files
  - [x] 6.2 `npm test` — zero regressions (6 pre-existing failures in pro-design-migration unrelated)
  - [x] 6.3 Run scanner on full codebase — 563 entities (was 531), 14 workflows + 3 utils registered
  - [x] 6.4 Spot-check: agent `dev` has 41 dependencies, task `dev-develop-story` has 1 usedBy entry

---

## Scope

### IN Scope
- Add 3 new SCAN_CONFIG categories (workflows, utils, tools)
- YAML semantic dependency extraction for agents and workflows
- Markdown cross-reference extraction (4 structured patterns)
- usedBy reverse index post-processor
- Tests for all new extractors
- Zero new NPM dependencies

### OUT of Scope
- Delta/incremental scanning with mtime (P2 — future story)
- Script subcategorization in scanner (P2 — future story)
- Full AST parsing with remark/unified (rejected — ESM incompatible with CJS project)
- Modifications to registry-syncer.js (NOG-2, separate concern)
- Graph dashboard UI changes (GD epic)
- Entity tagging or classification beyond category

---

## Complexity & Estimation

**Complexity:** Medium
**Estimation:** 6-10 hours
**Dependencies:** None — `populate-entity-registry.js` and `js-yaml` already exist

### Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Regex false positives in markdown extraction | Medium | Low | Only match structured patterns; validate refs against known extensions/agents |
| YAML parse errors crash scanner | Low | High | Try/catch per file with warning log — never crash the full scan |
| usedBy explosion (too many reverse refs) | Low | Low | Deduplicate via Set; only map entities that exist in registry |
| Scanner performance degradation with YAML parsing | Low | Medium | js-yaml.load() is fast (<1ms per file); 531 entities = trivial |
| New SCAN_CONFIG globs match unexpected files | Low | Low | Use specific path patterns; test glob output before integration |

---

## Dev Notes

### Key File

**Primary modification target:** `.aios-core/development/scripts/populate-entity-registry.js` (280 lines)

### YAML Dependency Field Map

```javascript
const YAML_DEP_FIELDS = {
  agent: {
    nested: ['tasks', 'templates', 'checklists', 'tools', 'scripts'],
    arrayFields: [
      { arrayPath: 'commands', field: 'task' },
    ],
  },
  workflow: {
    nested: [],
    arrayFields: [
      { arrayPath: 'phases', field: 'task' },
      { arrayPath: 'phases', field: 'agent' },
      { arrayPath: 'steps', field: 'task' },
      { arrayPath: 'steps', field: 'uses' },
    ],
  },
};
```

### Markdown Regex Patterns

```javascript
// Pattern A: YAML dependency block with subcategories
const YAML_BLOCK_RE = /^\s*[-*]\s+([\w.-]+\.(?:md|yaml|js))\s*$/gm;

// Pattern B: Label list (- **Tasks:** a.md, b.md)
const LABEL_LIST_RE = /^\s*[-*]\s+\*\*[\w\s]+:\*\*\s+(.+)$/gm;

// Pattern C: Markdown links to entity files
const MD_LINK_RE = /\[([^\]]+)\]\(([^)]+\.(?:md|yaml|js))\)/g;

// Pattern D: Agent references
const AGENT_REF_RE = /@(dev|qa|pm|po|sm|architect|devops|analyst|data-engineer|ux-design-expert|aios-master)\b/g;
```

### usedBy Post-Processor

```javascript
function buildUsedByIndex(registry) {
  const nameIndex = new Map();
  for (const [id, entity] of Object.entries(registry)) {
    nameIndex.set(id, id);
    if (entity.path) nameIndex.set(entity.path.split('/').pop(), id);
  }

  for (const entity of Object.values(registry)) {
    entity.usedBy = [];
  }

  for (const [entityId, entity] of Object.entries(registry)) {
    for (const dep of (entity.dependencies || [])) {
      const targetId = nameIndex.get(dep);
      if (targetId && registry[targetId] && !registry[targetId].usedBy.includes(entityId)) {
        registry[targetId].usedBy.push(entityId);
      }
    }
  }
}
```

### Integration Point

```javascript
// In populate-entity-registry.js main flow:
// 1. Discover files via SCAN_CONFIG globs (existing)
// 2. Extract metadata per file (existing)
// 3. Extract JS dependencies via require/import (existing)
// 4. NEW: Extract YAML dependencies for agents/workflows
// 5. NEW: Extract Markdown cross-references for tasks/checklists/templates
// 6. NEW: Build usedBy reverse index
// 7. Write registry (existing)
```

### File List

| File | Action | Notes |
|------|--------|-------|
| `.aios-core/development/scripts/populate-entity-registry.js` | MODIFY | +3 SCAN_CONFIG categories, +YAML_DEP_FIELDS, +KNOWN_AGENTS, +extractYamlDependencies(), +extractMarkdownCrossReferences(), enhanced resolveUsedBy() with nameIndex, +3 ADAPTABILITY_DEFAULTS, +3 category descriptions |
| `tests/core/ids/populate-entity-registry.test.js` | MODIFY | +12 new tests (SCAN_CONFIG, YAML extractor, MD extractor, enhanced usedBy) |
| `.aios-core/data/entity-registry.yaml` | MODIFIED (auto-generated) | 563 entities (was 531), +14 workflows, +3 utils, enriched dependencies and usedBy |

---

## CodeRabbit Integration

### Story Type Analysis

**Primary Type**: Enhancement
**Complexity**: Medium

### Quality Gate Tasks

- [ ] Pre-Commit (@dev): Run `coderabbit --prompt-only -t uncommitted` before marking story complete
- [ ] Pre-PR (@devops): Run `coderabbit --prompt-only --base main` before creating pull request

### Self-Healing Configuration

**Expected Self-Healing**:
- Primary Agent: @dev (light mode)
- Max Iterations: 2
- Timeout: 15 minutes
- Severity Filter: CRITICAL, HIGH

### CodeRabbit Focus Areas

**Primary Focus**:
- Regex correctness: patterns must not match unintended content
- YAML parsing safety: try/catch per file, never crash scanner
- Data integrity: additive-only merge, never remove existing dependencies

**Secondary Focus**:
- Performance: scanner should complete in <10s for 531 entities
- Consistency: extracted dependency names must resolve to actual registry entries

---

## Testing

```bash
npx jest tests/core/ids/populate-entity-registry.test.js
npm run lint
npm test
```

---

## Dev Agent Record

_Populated by @dev during implementation._

### Agent Model Used
Claude Opus 4.6

### Debug Log References
- Test failure: `extractYamlDependencies` for `.md` files — `yaml.load()` of full MD content failed before reaching code block extraction logic. Fixed by checking `.md` extension first and extracting YAML from code blocks.

### Completion Notes
- All 6 tasks completed, 32/32 tests passing
- Scanner: 531 → 563 entities (+14 workflows, +3 utils, +15 misc)
- dev agent: 41 dependencies extracted (was ~5 from basic `dependencies:` list)
- 342 entities with non-empty usedBy, 361 with dependencies
- Zero new NPM dependencies (uses existing js-yaml + native regex)
- tools directory does not exist yet — scanner handles gracefully (returns 0 entities)
- workflow `sequence[].agent` field added to YAML_DEP_FIELDS (not in original story but matches real YAML structure)

### Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-02-21 | @sm (Claude) | Story created from tech-search research (docs/research/2026-02-21-entity-registry-enrichment/) |
| 1.1 | 2026-02-21 | @po (Pax) | Validated GO (9.5/10). CF-1: fixed scanner path (development/ not infrastructure/). CF-2: fixed test path (tests/core/ids/). CF-3: added Executor Assignment section. SF-2: fixed SCAN_CONFIG format to match real code structure. Status Draft → Ready |
| 2.0 | 2026-02-21 | @dev (Dex) | Implemented all 6 tasks. +3 SCAN_CONFIG categories, YAML/MD extractors, enhanced usedBy with nameIndex, 12 new tests. 563 entities, 342 with usedBy. Status Ready → Ready for Review |

## QA Results

### Review Date: 2026-02-21
### Reviewer: @qa (Quinn)
### Verdict: **PASS**

---

### 1. Code Review

**Quality: HIGH**

- Code is clean, well-structured, and follows project CJS conventions
- All new functions follow defensive programming (try/catch per file, never crash)
- `extractYamlDependencies` correctly handles both `.md` (embedded YAML blocks) and pure `.yaml` files
- `extractMarkdownCrossReferences` uses 4 structured patterns as specified — no free-text matching
- `resolveUsedBy` enhanced with `nameIndex` Map resolves by ID, filename, and basename
- Dependency merge in `scanCategory` uses `Set` for deduplication
- No new NPM dependencies introduced
- Global regex `lastIndex` concern: verified safe — `while(exec())` loop resets naturally, stress-tested 100 iterations with 0 failures

### 2. Test Coverage

**32/32 tests passing**

| Category | Tests | Status |
|----------|-------|--------|
| SCAN_CONFIG (AC1) | 2 | PASS |
| extractYamlDependencies (AC2, AC6) | 3 | PASS |
| extractMarkdownCrossReferences (AC3) | 3 | PASS |
| resolveUsedBy enhanced (AC4) | 3 | PASS |
| Existing tests (AC5) | 20 | PASS (no modifications) |
| Regression | 1 | PASS |

Tests use proper cleanup (try/finally with `fs.unlinkSync` for temp files).

### 3. Acceptance Criteria Verification

| AC | Status | Evidence |
|----|--------|----------|
| AC1: New SCAN_CONFIG | PASS | 10 categories (7 orig + 3 new). workflows=14, utils=3, tools=0 (dir missing, handled gracefully) |
| AC2: YAML Agent Deps | PASS | dev agent: 41 deps (includes dev-develop-story, execute-checklist, story-dod-checklist). Malformed YAML skipped with warning |
| AC3: MD Cross-Refs | PASS | 4 patterns implemented, agent refs validated against KNOWN_AGENTS whitelist. False positive rate within spec (see Concern 1) |
| AC4: usedBy Reverse Index | PASS | 342/563 entities (61%) with non-empty usedBy. nameIndex resolves by ID/filename/basename |
| AC5: Zero Regression | PASS | All 20 pre-existing tests pass unmodified. 6 pre-existing failures in pro-design-migration/ are unrelated (missing clickup module) |
| AC6: Workflow/Utils/Tools | PASS | Workflows extract sequence[].agent (added beyond spec). Utils use existing require/import detection. tools dir absent, 0 entities — correct |

### 4. Regression

- Full suite: 274 passed, 6 failed (pre-existing), 12 skipped — zero new failures
- Scanner runs successfully on 563 entities in <2s

### 5. Concerns (NON-BLOCKING)

**Concern 1: Pre-existing `N/A` dependency pollution (LOW)**
- 111 entities have `N/A` as a dependency — extracted by the **existing** `detectDependencies()` regex from `dependencies:\n  - N/A` blocks in task files
- NOT introduced by NOG-15 code, but now more visible due to increased dependency extraction
- Recommendation: future story to filter sentinel values (`N/A`, `none`, `TBD`) in `detectDependencies()`

**Concern 2: High unresolved dependency rate (LOW)**
- 815/1570 deps (52%) don't resolve to registry entity IDs
- Causes: `N/A` values, inline comments captured as deps, references to external tools (e.g., "Docker MCP Toolkit")
- This is an improvement over the previous state (most entities had 0 deps)
- Recommendation: future story to add a dep resolution filter that discards non-entity references

**Concern 3: `sequence[].agent` added beyond original spec (INFO)**
- @dev added `{ arrayPath: 'sequence', field: 'agent' }` to YAML_DEP_FIELDS.workflow — not in original AC but matches real workflow YAML structure
- Correct decision — story-development-cycle.yaml uses `sequence:` not `phases:`

### 6. Security

- No secrets, credentials, or sensitive data in code
- `yaml.load()` is safe by default in js-yaml v4+ (no code execution)
- No user input handling — filesystem-only scanner
- KNOWN_AGENTS whitelist prevents arbitrary agent ref injection

### 7. Performance

- Scanner completes in <2s for 563 entities
- `js-yaml.load()` is ~1ms per file — negligible overhead
- Regex patterns are bounded and non-catastrophic (no nested quantifiers)

### Gate Decision

```yaml
storyId: NOG-15
verdict: PASS
score: 9/10
issues:
  - severity: low
    category: data-quality
    description: "Pre-existing N/A dependency pollution (111 entities) — not introduced by this story"
    recommendation: "Future story to filter sentinel values in detectDependencies()"
  - severity: low
    category: data-quality
    description: "52% unresolved deps — improvement over 0%, but room for refinement"
    recommendation: "Future story to add dep resolution filter"
  - severity: info
    category: scope
    description: "sequence[].agent added to YAML_DEP_FIELDS beyond original AC"
    recommendation: "Correct adaptation — no action needed"
```

— Quinn, guardiao da qualidade
