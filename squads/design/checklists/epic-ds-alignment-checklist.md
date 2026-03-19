---
title: "Epic DS Alignment Checklist"
purpose: "Validate that epics with UI/frontend work correctly reference, reuse, and align with the existing Design System before stories are created"
version: "1.2.0"
source: "Derived from 3 revision rounds of a real epic where DS gaps caused major rework (P1-P7 + R2 + R3)"
created: "2026-03-08"
agent: "design-chief"
command: "*review-epic-ds"
---

# Epic DS Alignment Checklist

> Run AFTER epic creation, BEFORE story drafting (`@sm *draft`).
> Blocks story creation if score < 60% (FAIL).
> Triggered by `*review-epic-ds` or as step in `epic-ds-alignment` workflow.

## DS Configuration Source

This checklist reads DS configuration from the BU-first workspace contract:

- `workspace/workspace.yaml` → whether the BU DS is `configured`, `not_configured`, or `not_applicable`
- `workspace/businesses/{bu}/design-system/config.yaml` → canonical DS config for configured BUs
- `squads/design/scripts/design-system/resolve_business_design_system.cjs` → deterministic resolver used by the squad
- `squads/design/scripts/load-context.cjs` → task-level loader used by `epic-ds-review`

**Auto-resolution:** The `epic-ds-review` task resolves DS context automatically:
1. Match `business_slug` → `workspace/workspace.yaml` → `businesses.{slug}`
2. Or match `app_id` → `workspace/businesses/{bu}/design-system/config.yaml`
3. Extracts: `source`, `themes`, `components_root`, `component_dirs`, `token_files`, `hooks_dir`, `blueprint_files`, `app_dir`, `data_dir`, `framework`, `ui_primitives`

**To register a BU DS:** Create `workspace/businesses/{bu}/design-system/config.yaml` and set `design_system.status: configured` in `workspace/workspace.yaml`.

**If status is `not_applicable`:** Skip DS review entirely and do not suggest DS creation.

**If no config exists for a `configured` BU:** The task must fail closed and request DS configuration instead of guessing.

## Scoring

| Score | Verdict | Action |
|-------|---------|--------|
| >= 85% | ALIGNED | Proceed to story drafting |
| 70-84% | GAPS | Fix identified gaps, re-check |
| 60-69% | MISALIGNED | Significant rework — add missing sections |
| < 60% | FAIL | Epic not DS-ready — return to @pm with remediation report |

---

## Section 1: Component Inventory Audit (12 points)

> Catches: proposing new components that already exist, ignoring existing component libraries

- [ ] **1.1 Existing components scanned** — Epic lists components from the project's component directories that are relevant to the epic scope
- [ ] **1.2 Reuse-first principle** — Each proposed "new component" has been validated against existing inventory (no duplicates)
- [ ] **1.3 Adaptation vs creation explicit** — For each component, epic states: REUSE (direct), ADAPT (modify props/data), or CREATE (new)
- [ ] **1.4 Component count justified** — Number of new components is minimized; brownfield ratio documented (new vs reused)
- [ ] **1.5 Utilities/hooks referenced** — Existing hooks (scroll, animation, state, etc.) and utility components referenced where relevant
- [ ] **1.6 Motion/animation patterns referenced** — Existing motion patterns or animation components referenced for animation needs
- [ ] **1.7 Per-story component mapping** — Each story lists: `Reusa: [...]`, `Adapta: [...]`, `Cria: [...]`
- [ ] **1.8 No orphan component proposals** — Every proposed new component has a story that creates it
- [ ] **1.9 Existing naming convention followed** — New components follow existing directory structure and naming patterns
- [ ] **1.10 Blueprint/catalog reference** — Component catalog, Storybook, or showcase pages checked for existing patterns
- [ ] **1.11 Blueprint gaps identified** — Components documented in blueprints/specs but NOT implemented as standalone are flagged
- [ ] **1.12 Wrapper/shell components identified** — Core wrapper components (section shells, page shells, layout wrappers) exist or are planned as foundation story

---

## Section 2: Token & Style Coverage (10 points)

> Catches: hardcoded colors/values, unused CSS animations, unmapped pattern tokens, missing motion strategy

- [ ] **2.1 Token mapping documented** — If migrating from another design system, a mapping table exists (old token → new token)
- [ ] **2.2 Zero-hardcode rule stated** — Epic explicitly states: no hardcoded hex/rgb in component code — only token references (CSS variables, Tailwind utilities, or design token classes)
- [ ] **2.3 CSS animations inventoried** — Existing CSS keyframe animations checked before proposing JS-based animations (e.g., Framer Motion, GSAP)
- [ ] **2.4 CSS transition classes referenced** — Existing utility transition classes listed for common animations (fade, slide, scale)
- [ ] **2.5 Animation strategy defined** — CSS-first vs JS animation library decision documented: CSS for simple transitions, JS library for orchestration/gestures
- [ ] **2.6 Motion tokens referenced** — Easing and duration tokens (if defined in DS) mapped for consistent animation timing
- [ ] **2.7 Decorative patterns mapped** — If DS has decorative patterns (backgrounds, textures, frames), they are assigned to specific sections/stories
- [ ] **2.8 Z-index/layer tokens used** — Layer tokens referenced for stacking contexts (sticky nav, modals, toasts) instead of hardcoded z-index
- [ ] **2.9 Color scheme alternation defined** — If multi-section page, section variant order (dark/light, primary/secondary) is explicitly mapped
- [ ] **2.10 Theme variants considered** — If DS supports multiple themes or color modes, applicable variants are evaluated

---

## Section 3: Reference Code Analysis (8 points)

> Catches: anti-patterns inherited from reference code, undocumented edge cases, accessibility gaps carried forward

- [ ] **3.1 Reference code identified** — If porting/migrating from existing implementation, source files are listed with paths and LOC
- [ ] **3.2 DO patterns extracted** — Good patterns from reference code documented for replication (data separation, icon mapping, memoization, etc.)
- [ ] **3.3 DON'T patterns extracted** — Anti-patterns from reference code documented for avoidance (hardcoded data, missing cleanup, accessibility gaps, etc.)
- [ ] **3.4 Edge cases documented** — Known edge cases from reference implementation listed with expected behavior
- [ ] **3.5 Formulas/logic validated** — If porting calculation logic, formulas are documented and marked as validated or needs-review
- [ ] **3.6 Scope decisions documented** — If reference code is over-engineered, explicit decisions about what to simplify (with rationale)
- [ ] **3.7 a11y gaps from reference identified** — Accessibility issues in reference code are flagged for fix in new implementation
- [ ] **3.8 Performance lessons extracted** — Performance patterns (lazy loading, memoization, cleanup) and anti-patterns (no animation cleanup, no reduced-motion) documented

---

## Section 4: Architecture & Routing (6 points)

> Catches: invalid routing structure, directory convention violations, missing data layer

- [ ] **4.1 Routing structure valid** — Routing follows framework conventions (route groups, dynamic segments, parallel routes used correctly)
- [ ] **4.2 Layout hierarchy correct** — Shared layouts (nav, footer) at the right level, not duplicated per page
- [ ] **4.3 Data layer planned** — Content data extracted to typed files (e.g., `data/{scope}/*.ts`), not inline in components
- [ ] **4.4 Data-driven components rule** — Epic states that presentation components receive data via props/imports, not hardcoded content
- [ ] **4.5 Directory structure follows convention** — New files placed in existing directories following established project patterns
- [ ] **4.6 Shared component strategy** — Components shared across stories are identified and assigned to a foundation story

---

## Section 5: DS Workflow Integration (6 points)

> Catches: design system workflow not referenced, missing DS quality gates in stories

- [ ] **5.1 DS workflow identified** — Epic references which DS workflow applies (page-composition, brownfield, greenfield, critical-eye, or custom)
- [ ] **5.2 Per-story DS commands listed** — Each story maps to specific DS agent commands (e.g., `*compose-page`, `*audit`, `*preflight`)
- [ ] **5.3 Composition phases mapped** — If using a multi-phase DS workflow, which phases apply to which stories
- [ ] **5.4 Quality gates integrated** — DS quality gates are in acceptance criteria of appropriate stories
- [ ] **5.5 Design squad agents assigned** — Stories that need DS expertise reference the correct DS agent
- [ ] **5.6 Cross-squad handoff documented** — If epic involves brand/content-visual/other squad work, handoff points are explicit

---

## Section 6: Accessibility & Quality (6 points)

> Catches: missing skip-to-content, missing aria-labels, no prefers-reduced-motion, color-only signaling

- [ ] **6.1 Accessibility requirements listed** — Skip-to-content, keyboard nav, screen reader, `prefers-reduced-motion` are in scope or specific stories
- [ ] **6.2 ARIA attributes planned** — Interactive custom components have `role`, `aria-expanded`, `aria-label` requirements in acceptance criteria
- [ ] **6.3 Accessible primitives preferred** — Where applicable, accessible UI primitives (Radix, Headless UI, Ark, etc.) used for built-in ARIA support instead of custom implementations
- [ ] **6.4 Color-only signaling flagged** — Any use of color to convey meaning has alternative (icon, text, pattern)
- [ ] **6.5 Contrast requirements stated** — WCAG AA contrast (4.5:1 text, 3:1 UI) referenced or delegated to QA story
- [ ] **6.6 Anti-AI validation planned** — For marketing/landing pages, anti-AI-look validation is in acceptance criteria of polish story

---

## Section 7: Story Dependencies & Parallelization (4 points)

> Catches: incorrect wave dependencies, stories blocked unnecessarily that could run in parallel

- [ ] **7.1 Foundation stories first** — Audit/inventory stories come before implementation stories
- [ ] **7.2 True dependencies identified** — Each story's dependencies reference actual data/component dependencies, not just wave ordering
- [ ] **7.3 Parallelization maximized** — Stories that only depend on foundation (not each other) are in the same wave
- [ ] **7.4 Wave execution plan present** — Summary table with waves, stories, parallelizable flag, and dependencies exists

---

## Totals

| Section | Items | Weight |
|---------|-------|--------|
| 1. Component Inventory Audit | 12 | 12pts |
| 2. Token & Style Coverage | 10 | 10pts |
| 3. Reference Code Analysis | 8 | 8pts |
| 4. Architecture & Routing | 6 | 6pts |
| 5. DS Workflow Integration | 6 | 6pts |
| 6. Accessibility & Quality | 6 | 6pts |
| 7. Story Dependencies | 4 | 4pts |
| **Total** | **52** | **52pts** |

### Pass/Fail Thresholds

| Grade | Score | Percentage | Action |
|-------|-------|------------|--------|
| ALIGNED | 45-52 | >= 85% | Proceed to `@sm *draft` |
| GAPS | 37-44 | 70-84% | Fix gaps in epic, re-run checklist |
| MISALIGNED | 32-36 | 60-69% | Return to @pm with remediation list |
| FAIL | < 32 | < 60% | Epic not DS-ready — major rework |

### Section Minimums (blocking regardless of total)

| Section | Minimum Required | Rationale |
|---------|-----------------|-----------|
| 1. Component Inventory | >= 8/12 | Core brownfield principle |
| 2. Token Coverage | >= 6/10 | Visual consistency |
| 4. Architecture | >= 4/6 | Structural correctness |

If ANY section minimum is not met, verdict is capped at GAPS even if total score is ALIGNED.

---

## Auto-Correction Commands

If items fail, run these design squad commands:

| Failed Section | Command | What it does |
|---------------|---------|--------------|
| 1. Component Inventory | `@brad-frost *audit {codebase_path}` | Scans codebase for existing components |
| 2. Token Coverage | `@brad-frost *tokenize` | Extracts and maps design tokens |
| 3. Reference Analysis | Manual | Read reference code, document DO/DON'T |
| 4. Architecture | `@architect` review | Validate routing and structure |
| 5. DS Workflow | `@design-chief *triage` | Identify correct DS workflow |
| 6. Accessibility | `@brad-frost *a11y-audit` | Scan for accessibility gaps |
| 7. Dependencies | `@pm` review | Validate wave dependencies |

---

## When to Skip Sections

| Section | Skip if... |
|---------|-----------|
| 3. Reference Code Analysis | No reference implementation exists (greenfield) |
| 2.1 Token mapping | Not migrating from another design system |
| 2.9 Color scheme alternation | Single-section pages or non-marketing pages |
| 2.7 Decorative patterns | DS has no decorative patterns defined |
| 6.6 Anti-AI validation | Non-marketing pages (admin panels, dashboards) |

Skipped items score as PASS (don't penalize inapplicable checks).

---

## Output Contract

```yaml
epic_ds_review:
  epic_path: "docs/stories/epics/{epic-id}/EPIC.md"
  checklist_version: "1.2.0"
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
  gaps:
    - section: N
      item: "N.N"
      severity: "blocking|important|nice-to-have"
      remediation: "What to add/fix"
  next_action: "proceed|fix-and-recheck|return-to-pm|major-rework"
```
