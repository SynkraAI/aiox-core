# Tailwind CSS v4 Upgrade Playbook

> Task ID: brad-tailwind-upgrade  
> Agent: Brad (Design System Architect)  
> Version: 1.1.0
> v4.0-compatible: true
> **Execution Type:** `Agent`
> **Dependencies:** depends_on: `[]` · enables: `[audit-tailwind-config]` · workflow: `modernization`

## Description

Plan and execute migration from Tailwind CSS v3 (or earlier) to v4 (Oxide engine). Covers risk assessment, @theme conversion, Oxide benchmarks, dependency alignment, and human-in-the-loop verification.

## Output Schema
- **produces:** `outputs/design-system/{project}/modernization/tailwind-upgrade-report.md`
- **format:** Markdown report
- **consumed_by:** audit-tailwind-config

## Prerequisites

- Existing Tailwind configuration and usage inventoried (*audit command recommended)
- Node.js ≥ 18.17 (prefer 20+)
- Access to CI pipelines and performance metrics
- Visual regression tooling (Chromatic, Lost Pixel, or equivalent)

## Workflow

### 1. Discovery & Planning
- Capture current Tailwind version, build times, CSS bundle size
- Identify PostCSS/Sass/Less/Stylus usage (must be removed/replaced)
- List third-party libraries dependent on `tailwind.config.js` (e.g. daisyUI)

### 2. Dry Run Upgrade
- Create feature branch `chore/tailwind-v4-upgrade`
- Run official upgrade CLI
  ```bash
  npx @tailwindcss/upgrade
  ```
- Convert config to CSS-first structure (`app.css` with `@import "tailwindcss";`)
- Replace `tailwind.config.js` customizations with `@theme`, `@layer`, `@plugin` CSS equivalents

### 3. Token & Utility Validation
- Ensure design tokens re-exported via `@theme` (core, semantic, component layers)
- Regenerate CSS utilities relying on previous `theme.extend`
- Validate arbitrary values still required; prefer tokenized utilities
- Confirm `@container`, `@starting-style`, 3D transforms working

### 4. Benchmark Oxide Engine
- Measure cold build, incremental build (with and without new CSS)
- Target benchmarks (Catalyst reference):
  - Cold build ≤ 120ms (target <100ms)
  - Incremental (new CSS) ≤ 8ms
  - Incremental (no CSS) ≤ 300µs
- Record metrics in README/Changelog

### 5. Regression Testing
- Run full unit + integration suite
- Execute visual regression (Chromatic/Lost Pixel) to detect class/utility drift
- Verify dark mode, theming, and Tailwind plugins still functional

### 6. Documentation & Rollout
- Update contributing docs with new `@theme` usage
- Refresh `.cursorrules` / coding guidelines (Tailwind v4 best practices)
- Communicate rollout checklist to team, include fallback steps

### 7. Update State
- Log upgrade metadata in `.state.yaml` (tailwind_version, benchmarks, validation status)
- Flag `tailwind_theme_validated: true` when `@theme` layers verified

## Deliverables

- Updated `app.css` (or dedicated entry) with `@theme` definitions
- Removed/archived legacy `tailwind.config.js` (if not required)
- Benchmarks documented (`docs/logs/tailwind-upgrade.md` or similar)
- Regression test results (links/screenshots)
- `.state.yaml` updated with upgrade details

## Related Checklists

- `squads/design/checklists/ds-migration-readiness-checklist.md`
- `squads/design/checklists/ds-component-quality-checklist.md`
- `squads/design/checklists/ds-a11y-release-gate-checklist.md`

## Failure Handling

- **@theme conversion produces invalid CSS or missing utilities:** Maintain parallel v3 config as fallback, incrementally migrate theme sections one category at a time, validate each migration with visual regression before proceeding
- **Third-party plugin (daisyUI, Flowbite) incompatible with v4:** Check for v4-compatible fork or alternative, vendor plugin code locally with manual adaptation, document plugin as blocking dependency requiring upstream fix
- **Oxide build times exceed v3 benchmarks or targets:** Profile build with --debug flag, identify slow transformers or large input files, split CSS entry points, consider partial adoption (keep v3 for specific modules)
- **Visual regression tests fail with >5% diff across multiple components:** Isolate breaking changes to specific utility classes, create compatibility layer with v3-style class aliases, phase rollout component-by-component rather than all-at-once

## Success Criteria

- [ ] Tailwind upgraded to v4, builds pass locally and in CI
- [ ] `@theme` defines all design tokens (colors, spacing, typography, etc.)
- [ ] Oxide benchmarks recorded and meet targets (<30s cold build, <1ms incremental)
- [ ] CSS bundle size ≤ previous production size (ideally <50KB gzipped)
- [ ] No visual regressions (diff <1% or consciously accepted)
- [ ] Documentation (.cursorrules, README) reflects v4 workflow
- [ ] `.state.yaml` updated (`tailwind_theme_validated`, benchmarks, timestamp)

## Rollback Plan

1. `git revert` upgrade commits (config + package lock)
2. Restore previous `tailwind.config.js`
3. Reinstall previous Tailwind version
4. Re-run build/tests to ensure stability

## Notes

- Remove or replace Sass/Less/Stylus pipelines (v4 does not support preprocessors)
- Tailwind plugins may require v4-compatible versions (@tailwindcss/forms/typography/container-queries)
- Validate IDE tooling (Tailwind IntelliSense, Prettier plugin) upgraded to v4-aware releases
- Encourage incremental adoption: keep feature flags until confidence is high


## Process Guards
- **On Fail:** Stop execution, capture evidence, and return remediation steps before proceeding.
