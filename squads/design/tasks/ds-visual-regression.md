# Setup Visual Regression Testing Pipeline

> Task ID: brad-visual-regression
> Agent: Brad (Design System Architect)
> Version: 1.1.0
> v4.0-compatible: true
> **Execution Type:** `Agent`
> **Dependencies:** depends_on: `[]` · enables: `[]` · workflow: `testing`

## Description

Setup visual regression testing for your design system component library. Compares tooling options (Chromatic, Percy, Playwright, BackstopJS), configures the selected tool, creates baseline screenshots, and integrates with CI. **v4.1: Enriched with Steve Kinney's sustainability-first testing philosophy. Chromatic recommended as primary tool (built by Storybook maintainers). Storybook stories treated as test specs.**

## Prerequisites

- Component library with Storybook (recommended) or standalone demo pages
- CI/CD pipeline (GitHub Actions, GitLab CI, etc.)
- Steve Kinney DNA: "DS components ARE the visual contract — visual regression is non-negotiable"

## Workflow

### Interactive Elicitation

1. **Collect CI Platform, Budget, and Component Count**
   - Current CI/CD platform
   - Budget preference (free/open-source vs. SaaS)
   - Component count (affects baseline creation time)
   - Storybook available? (recommended)

2. **Tool Selection**
   Compare tools using structured trade-off matrix (cost, integration, cross-browser):
   - **Chromatic** — SaaS, Storybook-native, snapshot diffing (paid, free tier available)
   - **Percy** — SaaS, framework-agnostic, cross-browser (paid)
   - **Playwright Screenshots** — Free, code-based, self-hosted
   - **BackstopJS** — Free, config-based, Docker support
   - Recommend based on budget and infrastructure

### Steps

1. **Configure Selected Tool**
   - Install dependencies
   - Create configuration file
   - Connect to Storybook (if applicable)
   - Set viewport sizes (mobile: 375px, tablet: 768px, desktop: 1280px)
   - Check: tool executes test run with exit code 0 — abort with "Tool configuration failed: {error}"

2. **Create Baseline Screenshots**
   - Capture all component variants at all viewports
   - Capture light mode and dark mode (if supported)
   - Capture interactive states (hover, focus, active, disabled)
   - Check: screenshot count >= component count AND all files size > 0 — abort with "Missing baselines: {list of components without screenshots}"

3. **Set Threshold Tolerances**
   - Anti-aliasing tolerance: 0.1% pixel difference
   - Layout tolerance: 0px (strict)
   - Color tolerance: 0.5% (account for rendering differences)
   - Configure per-component overrides if needed
   - Check: threshold config values set (anti-aliasing <= 0.1%, layout = 0px, color <= 0.5%) — log "Thresholds configured: aa={aa}%, layout={layout}px, color={color}%"

4. **Integrate with CI Pipeline**
   - Add visual test step to PR pipeline
   - Configure to run on component file changes only
   - Set up approval workflow (visual diff review before merge)
   - Configure artifact storage for screenshots
   - Check: CI config file contains visual test step AND blocking rule exists — abort with "CI integration incomplete: {missing step or rule}"

5. **Document Workflow**
   - How to update baselines after intentional changes
   - How to review visual diffs
   - How to handle false positives
   - Update .state.yaml

## Output

- Visual regression tool configured and running
- Baseline screenshots for all components
- CI integration with PR blocking on regression
- `visual-regression-guide.md` — Team workflow documentation
- `.state.yaml` updated

## Steve Kinney Testing Philosophy (v4.1)

### Sustainability Filter
For every visual test, ask: "Would a busy developer maintain this test?"
- If test breaks on every refactor → scope too broad
- If nobody reviews diffs → test is noise, not signal

### Storybook-as-Testing-Platform
Each Storybook story serves 5 purposes simultaneously:
1. **Documentation** — Shows component state
2. **Development** — Isolated dev environment
3. **Visual Testing** — Chromatic screenshot baseline
4. **Interaction Testing** — Play functions simulate user actions
5. **Accessibility Testing** — a11y addon runs axe-core

### Tool Recommendation Priority (Steve Kinney)
1. **Chromatic** (recommended) — Built by Storybook maintainers, best integration, human review UI
2. **Playwright Screenshots** — Free, good for non-Storybook or cross-page testing
3. **Percy/BackstopJS** — Alternatives with different trade-offs

### Visual Diff Review Process
- **NEVER auto-approve visual changes** — humans must review
- Intentional change → approve new baseline
- Unintentional change → fix the regression
- Batch-approving without reviewing defeats the purpose

## Failure Handling

- **Selected tool installation fails:** Try alternate package manager (npm/yarn/pnpm). If all fail, recommend manual installation with error log
- **Baseline screenshot capture fails:** Check Storybook is running and accessible. Retry with increased timeout. If persistent, capture subset and document failures
- **CI pipeline configuration file not found:** Detect CI platform from repo files (.github/, .gitlab-ci.yml). If none found, generate standalone config for GitHub Actions as default
- **Visual diff threshold too sensitive (>20% false positives):** Increase anti-aliasing tolerance to 0.2%, add per-component overrides for animated components

## Success Criteria

- All component variants have baseline screenshots
- CI blocks PRs with unreviewed visual changes
- False positive rate < 5%
- Baseline update process documented
- Storybook stories cover all visual states (each story = test spec)
- Play functions added for interactive components
- Sustainability filter applied: no tests a busy developer wouldn't maintain


## Related Checklists

- `squads/design/checklists/design-fidelity-checklist.md`

## Process Guards
- **On Fail:** Stop execution, capture evidence, and return remediation steps before proceeding.
