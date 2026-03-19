# Audit Tailwind v4 Configuration & Utility Health

> Task ID: brad-audit-tailwind-config  
> Agent: Brad (Design System Architect)  
> Version: 1.1.0
> v4.0-compatible: true
> **Execution Type:** `Agent`
> **Dependencies:** depends_on: `[]` · enables: `[]` · workflow: `modernization`

## Description

Review Tailwind CSS v4 setup to guarantee @theme layering, content scanning, utility hygiene, and performance baselines are correct. Produces remediation plan and metrics.

## Prerequisites

- Tailwind v4 installed (or upgrade plan underway)
- Access to codebase for static analysis
- Ability to run Tailwind build locally

## Workflow

1. **Collect Context**
   - Locate primary CSS entry (`app.css`, `src/styles.css`, etc.)
   - Identify additional `@imports`, custom utilities, plugins
   - Read `.state.yaml` for current Tailwind metadata (if available)

2. **Validate @theme Layers**
   - Ensure tokens defined within `@theme` grouped as core → semantic → component
   - Confirm dark mode overrides (`[data-theme="dark"]`) map to semantic tokens
   - Check no residual `theme.extend` references exist

3. **Inspect @layer Usage**
   - `@layer base`: Resets, typography, `focus-visible`
   - `@layer components`: Reusable abstractions (e.g., `.form-label`)
   - `@layer utilities`: Custom utility definitions with `@utility`
   - Verify ordering (base → components → utilities) and duplication avoidance

4. **Content & Purge Coverage**
   - Review Tailwind CLI entry for `content` globs (JIT purge)
   - Ensure glob coverage includes `.tsx`, `.jsx`, `.mdx`, Storybook stories, templates
   - Flag false negatives (classes generated dynamically) and propose safelist

5. **Utility Health Scan**
   - Run class collision detection (tailwind-merge or eslint-plugin-tailwindcss)
   - Identify redundant custom utilities replaced by tokens/variants
   - Detect legacy classes (e.g., `outline-none` instead of `outline-hidden`)

6. **Performance Snapshot**
   - Record build metrics (cold + incremental)
   - Capture CSS bundle size, number of utilities generated
   - Compare with target benchmarks (Oxide reference)

7. **Report & Remediation**
   - Summarize findings (pass/warn/fail) in `docs/reports/tailwind-audit.md`
   - Provide prioritized action list (tokens to add, utilities to remove, config fixes)
   - Update `.state.yaml` with audit timestamp, benchmark data, outstanding actions

## Output

- Audit report (`docs/reports/tailwind-audit.md`)
- Updated `.state.yaml` under `tooling.tailwind` (validation + metrics)
- Optional lint/config patches (ESLint Tailwind rules, Prettier plugin settings)

## Failure Handling

- **@theme layer structure invalid or missing:** Abort audit, provide migration guide from theme.extend to @theme syntax, generate conversion script for existing token files, require manual review before re-running
- **Content glob paths exclude significant template files:** Analyze build output for unpurged classes, cross-reference with file structure to identify missing patterns, update content config with discovered paths, validate with test build
- **Tailwind-merge reports >50 class conflicts:** Generate conflict resolution report grouping by conflict type (responsive collisions, arbitrary value conflicts), provide automated cva refactoring suggestions, prioritize by usage frequency
- **Build performance degrades >30% vs baseline:** Profile build with --debug flag, identify slow plugins or @layer definitions, recommend selective imports or JIT optimizations, consider splitting config for multi-app monorepos

## Success Criteria

- [ ] `@theme` defines full token stack with no missing categories
- [ ] `@layer` usage consistent and free of duplicate definitions
- [ ] Content paths cover 100% of templates (no orphaned utilities)
- [ ] tailwind-merge/eslint scans zero conflicts or all logged issues resolved
- [ ] Build metrics captured (cold/incremental) and comparable to prior baseline
- [ ] Recommendations documented with owners + due dates
- [ ] `.state.yaml` updated (`tailwind_theme_validated: true/false`) and audit timestamp logged

## Tools & Commands

- Tailwind CLI build: `npx tailwindcss -i ./app.css -o ./dist.css --watch`
- Utility audit: `npx @tailwindcss/oxide --analyze`
- ESLint Tailwind plugin: `eslint --ext .tsx src`
- tailwind-merge checker: integrate via ESLint rule `tailwindcss/no-contradicting-classname`

## Notes

- Encourage automated linting (ESLint + prettier-plugin-tailwindcss) post-audit
- Document class naming conventions (order: layout → size → spacing → typography → color → effect)
- Track manual overrides (safelist patterns, arbitrary values) for future cleanup


## Related Checklists

- `squads/design/checklists/ds-component-quality-checklist.md`
- `squads/design/checklists/ds-pattern-audit-checklist.md`

## Process Guards
- **On Fail:** Stop execution, capture evidence, and return remediation steps before proceeding.
