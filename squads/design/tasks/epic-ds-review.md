# Epic DS Review — Design System Alignment Gate

> Task ID: epic-ds-review
> Agent: Design Chief
> Version: 1.3.0

## Purpose

Review an epic that includes UI/frontend work to validate it correctly references, reuses, and aligns with the existing Design System BEFORE stories are drafted. This task catches a class of problems commonly found in UI epics: component duplication, token gaps, missing blueprint references, routing errors, and DS workflow disconnect.

## When to Use

**Use this task when:**

- An epic includes stories with UI/frontend components
- The epic references or builds on an existing design system
- The epic ports/migrates UI from another codebase
- The @pm has completed epic creation and it needs DS validation

**Skip this task when:**

- Epic is purely backend/infrastructure (no UI)
- Epic is purely documentation/research
- Epic has no component, token, or visual output

## DS Configuration Discovery

The task resolves DS configuration through the squad-local BU/app resolver:

- `workspace/workspace.yaml` — declares whether the BU DS is `configured`, `not_configured`, or `not_applicable`
- `workspace/businesses/{bu}/design-system/config.yaml` — canonical DS config for configured BUs
- `node squads/design/scripts/design-system/resolve_business_design_system.cjs` — deterministic resolver used by the design squad
- `node squads/design/scripts/load-context.cjs --task=epic-ds-review ...` — task-level loader that wraps the resolver and expands app/theme paths

**Resolution order:**

1. **Resolve from `business_slug`** — If `business_slug` is provided, call `resolve_business_design_system.cjs --bu={slug}`
2. **Resolve from `app_id`** — If `app_id` is provided, call `resolve_business_design_system.cjs --app={id}`
3. **Legacy fallback from `codebase_path`** — If no BU/app is available, scan heuristically from the target codebase path

**What the resolver provides for configured BUs:**

| Field | What it resolves | Used in |
|-------|-----------------|---------|
| `design_system.source.repo_root` + `design_system.source.ds_root` | Where the DS implementation actually lives | Phase 0 |
| `design_system.themes` + `design_system.default_theme` | Which themes exist and which one is default | Checklist 2.10 |
| `design_system.apps[].root` | Which app roots belong to the DS | Phase 0 |
| `design_system.apps[].theme` | Which theme each app consumes by default | Checklist 2.9-2.10 |

**Then load the BU config directly for detailed paths:**

| Field | What it resolves | Used in |
|-------|-----------------|---------|
| `apps[].components_root` + `apps[].component_dirs` | Where to scan for existing components | Phase 1 |
| `themes.{theme}.tokens` + `apps[].token_files` | Where to read token/animation/pattern definitions | Phase 2 |
| `themes.{theme}.tokens.prefix` | What token naming convention to validate against | Checklist 2.2 |
| `apps[].hooks_dir` | Which hooks exist for reuse | Checklist 1.5 |
| `apps[].blueprint_files` | Which catalog/showcase pages to check | Checklist 1.10-1.11 |
| `apps[].app_dir` | How to validate routing structure | Checklist 4.1 |
| `apps[].data_dir` | Where data layer should live | Checklist 4.3 |
| `apps[].framework` | Framework-specific routing validation | Checklist 4.1 |
| `apps[].ui_primitives` | Which accessible primitives to recommend | Checklist 6.3 |

**If resolver returns `not_applicable`:** skip DS review and do not ask for DS creation.

**If resolver returns `not_configured`:** stop the epic review and return a remediation note to configure `workspace/businesses/{bu}/design-system/config.yaml`.

## Inputs

- `epic_path`: Path to the EPIC.md file (required)
- `business_slug`: Business unit slug matching `workspace/workspace.yaml` → `businesses.{slug}` (optional — preferred)
- `app_id`: App identifier declared inside `workspace/businesses/{bu}/design-system/config.yaml` (optional — auto-resolves all paths)
- `codebase_path`: Path to the target app's component directory (optional legacy fallback if `business_slug`/`app_id` are unavailable)
- `reference_path`: Path to reference implementation being ported (optional)
- `mode`: Execution mode — `yolo` | `interactive` | `preflight` (default: `interactive`)

## Workflow

### Phase 0: Resolve DS Configuration (automated)

1. **Call the squad loader** — `node squads/design/scripts/load-context.cjs --task=epic-ds-review --business={business_slug}` or `--app={app_id}`
2. **Interpret status** — `configured`, `not_configured`, `not_applicable`, or `heuristic`
3. **If `configured`** — Use the returned app/theme-specific paths from the loader
4. **If `not_configured`** — Stop and return remediation to the owner to create the BU DS config
5. **If `not_applicable`** — Skip DS review entirely; the epic should not be blocked on DS alignment
6. **If `heuristic`** — Continue with caution and record that no BU/app DS contract was available
7. **Log resolution** — Print which config source was used (resolver vs heuristic)

**Output:** Resolved DS config (status, source, paths, conventions, constraints)

### Phase 1: Inventory Scan (automated)

1. **Read the EPIC.md** — Parse all stories, proposed components, acceptance criteria
2. **Scan existing components** — Glob all directories from resolved `components.dirs` for existing components
3. **Cross-reference** — For each proposed "new component" in the epic, check if a similar component already exists (name match, function match)
4. **Scan tokens** — Read resolved token files for available tokens, animations, patterns
5. **Scan blueprint** — Check resolved `blueprint.catalog_pages` for component catalogs

**Output:** Component inventory diff (proposed vs existing)

### Phase 2: Token & Animation Analysis (automated)

1. **Check for hardcoded values** — Scan any referenced code/examples in epic for hex colors, hardcoded px values
2. **Map CSS animations** — List all available `@keyframes` and transition utility classes
3. **Map decorative patterns** — List all decorative pattern classes (backgrounds, textures, frames) if applicable
4. **Map motion tokens** — List all easing and duration CSS variables
5. **Check color scheme strategy** — If multi-section pages, verify variant alternation is defined

**Output:** Token coverage report

### Phase 3: Reference Code Audit (conditional — only if `reference_path` provided)

1. **Scan reference code** — Read all files in reference path
2. **Extract DO patterns** — Good patterns worth replicating
3. **Extract DON'T patterns** — Anti-patterns to avoid
4. **Document edge cases** — Known edge cases from reference implementation
5. **Flag a11y gaps** — Accessibility issues in reference code
6. **Flag performance issues** — Missing cleanup, missing lazy loading, etc.

**Output:** DO/DON'T table, edge cases list

### Phase 4: Checklist Execution

1. **Load checklist** — `squads/design/checklists/epic-ds-alignment-checklist.md`
2. **Score each item** — Mark PASS/FAIL with evidence
3. **Calculate totals** — Per-section and overall score
4. **Check section minimums** — Verify no section falls below minimum threshold
5. **Determine verdict** — ALIGNED / GAPS / MISALIGNED / FAIL

### Phase 5: Remediation Report (if verdict != ALIGNED)

1. **List all failing items** — With severity (blocking / important / nice-to-have)
2. **Generate remediation suggestions** — Specific actions to fix each gap
3. **Estimate effort** — How much rework is needed
4. **Generate updated sections** — For GAPS verdict, propose corrected text for the EPIC.md

### Phase 6: Output

1. **Write review report** — To `docs/stories/epics/{epic-id}/ds-review.md`
2. **Update EPIC.md revision log** — Add DS review entry with verdict
3. **If ALIGNED** — Handoff to @sm for story drafting
4. **If GAPS/MISALIGNED** — Return to @pm with remediation report
5. **If FAIL** — Escalate to @design-chief + @pm for joint review

## Decision States

- `ALIGNED` — Epic is DS-ready. Proceed to story creation.
- `GAPS` — Minor gaps found. Fix and re-run (max 2 iterations).
- `MISALIGNED` — Significant gaps. Return to @pm with remediation list.
- `FAIL` — Epic fundamentally disconnected from DS. Major rework required.

## Output Contract

```yaml
ds_review_result:
  epic_path: "{epic_path}"
  reviewer: "@design-chief"
  date: "YYYY-MM-DD"
  verdict: "ALIGNED|GAPS|MISALIGNED|FAIL"
  score:
    total: N/52
    percentage: N%
    sections:
      component_inventory: N/12
      token_coverage: N/10
      reference_analysis: N/8
      architecture: N/6
      ds_workflow: N/6
      accessibility: N/6
      dependencies: N/4
  section_minimums_met: true|false
  component_diff:
    proposed_new: N
    already_exist: N
    reusable: N
    needs_adaptation: N
    truly_new: N
  gaps:
    - section: N
      item: "N.N"
      severity: "blocking|important|nice-to-have"
      evidence: "What was found/missing"
      remediation: "Specific fix"
  do_patterns: ["..."]
  dont_patterns: ["..."]
  artifacts:
    review_report: "docs/stories/epics/{epic-id}/ds-review.md"
    inventory_diff: "docs/stories/epics/{epic-id}/component-inventory.md"
  next_action: "proceed-to-sm|fix-and-recheck|return-to-pm|escalate"
```

## Auto-Fix Loop

For GAPS verdict, the task can attempt auto-fix:

1. **Iteration 1:** Generate corrected sections for the EPIC.md (component inventory, token mapping, DS workflow commands)
2. **Iteration 2:** Re-run checklist on corrected EPIC.md
3. **Max iterations:** 2. If still GAPS after 2 iterations, escalate to MISALIGNED.

Auto-fixable items:
- Missing component inventory → generate from codebase scan
- Missing token mapping → generate from token file analysis
- Missing DS commands per story → map based on story type
- Missing color scheme alternation → propose based on section count

Non-auto-fixable items (require @pm decision):
- Architecture/routing decisions
- Scope decisions (what to include/exclude)
- Story dependencies and wave structure
- Reference code DO/DON'T analysis

## Integration Points

### In Epic Lifecycle

```
@pm *create-epic → @design-chief *review-epic-ds → @po *validate-epic → @sm *draft
                    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                    THIS TASK (new gate)
```

### Triggers

- **Manual:** `@design-chief *review-epic-ds {epic_path}`
- **Workflow:** Step in `epic-ds-alignment` workflow
- **Automatic:** When `@pm` completes epic with UI stories, suggest DS review

### Dependencies

| Depends On | Purpose |
|-----------|---------|
| `design-triage.md` | Classify epic as in-scope for DS review |
| `epic-ds-alignment-checklist.md` | Scoring checklist |

| Enables | Purpose |
|---------|---------|
| `@sm *draft` | Story creation (blocked until ALIGNED) |
| `@po *validate-story-draft` | Story validation |

## Related Checklists

- `squads/design/checklists/epic-ds-alignment-checklist.md` (primary — 52 points, 7 sections)
- `squads/design/checklists/component-adaptation-checklist.md` (referenced for component reuse validation)
- `squads/design/checklists/token-mapping-checklist.md` (referenced for token migration)
- `squads/design/checklists/design-fidelity-checklist.md` (referenced for style compliance)

## Process Guards

- **Execution Type:** `Hybrid` (automated scan + human judgment)
- **Dependencies:** depends_on: `[design-triage]` · enables: `[create-next-story]` · workflow: `epic-ds-alignment`
- **On Fail:** Stop epic progression, capture evidence, return remediation report to @pm.

## Success Criteria

- [ ] EPIC.md reviewed against all 52 checklist items
- [ ] Component inventory diff generated (proposed vs existing)
- [ ] Token/animation/pattern coverage validated
- [ ] Reference code DO/DON'T documented (if applicable)
- [ ] Verdict determined with evidence
- [ ] Review report written to epic directory
- [ ] Next action communicated to appropriate agent (@pm or @sm)

---

## Execution Modes

### YOLO Mode (0-1 prompts)
- Run all phases automatically
- Apply auto-fixes without confirmation
- Best for: Well-structured epics with clear DS references

### Interactive Mode (3-5 prompts) **[DEFAULT]**
- Confirm component inventory diff
- Review DO/DON'T patterns before including
- Confirm verdict before writing report
- Best for: First-time use, complex epics

### Pre-Flight Mode (5-10 prompts)
- Review each checklist section before scoring
- Discuss architecture and routing decisions
- Confirm all remediation suggestions
- Best for: Large epics with unclear DS alignment

---

## Metadata

```yaml
version: 1.3.0
created: 2026-03-08
tags:
  - epic
  - design-system
  - review
  - quality-gate
  - alignment
dependencies:
  - epic-ds-alignment-checklist.md
  - design-triage.md
```
