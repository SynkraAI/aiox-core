# Verify Storybook Setup

**Task ID:** `sb-verify`
**Pattern:** HO-TP-001 (Task Anatomy Standard)
**Version:** 1.0.0
**Last Updated:** 2026-02-25

## Task Anatomy

| Field | Value |
|-------|-------|
| **task_name** | Verify Storybook Setup |
| **status** | `pending` |
| **responsible_executor** | @storybook-expert |
| **execution_type** | `Agent` |
| **input** | Project with Storybook configured, all stories written |
| **output** | Verification report (PASS/FAIL per check) |
| **action_items** | 6 steps |
| **acceptance_criteria** | 6 criteria |

## Overview

Final verification gate for the complete Storybook setup pipeline. Runs typecheck, lint, build, and functional checks to ensure everything works end-to-end. This is the terminal task in the `storybook-full-setup` workflow.

## Input

- **project_root** (string)
  - Description: Absolute path to the project root
  - Required: Yes
- **story_files** (list)
  - Description: All story files from sb-generate-all-stories output
  - Required: Yes
  - Source: Previous task handoff

## Output

- **verification_report** (object)
  - Description: PASS/FAIL status for each verification check
  - Format: Table with check name, status, details

## Action Items

### Step 1: TypeScript Verification

```bash
npm run typecheck
```

- [ ] Exit code 0 (zero errors)
- [ ] No errors in `.storybook/` config files
- [ ] No errors in `src/components/ui/*.stories.tsx` files
- [ ] No errors in `src/components/ui/*.tsx` component files

If errors found:
- Fix all errors
- Re-run typecheck
- Document fixes applied

### Step 2: Lint Verification

```bash
npm run lint
```

- [ ] Exit code 0 (zero errors)
- [ ] No warnings in story files (warnings acceptable in other files)

If errors found:
- Fix all lint errors in story and config files
- Re-run lint
- Document fixes applied

### Step 3: Storybook Build Verification

```bash
npm run build-storybook
```

- [ ] Exit code 0 (build succeeds)
- [ ] No compilation errors
- [ ] Output directory `storybook-static/` created
- [ ] Build size is reasonable (log total size)

If build fails:
- Check error output for specific file/component
- Fix the issue (usually import errors or missing dependencies)
- Re-run build
- Delete `storybook-static/` after verification (or leave if user wants to deploy)

### Step 4: Story Count Verification

Count stories visible in Storybook:

- [ ] Scan all `.stories.tsx` files in project
- [ ] Count exported stories (named exports that are StoryObj)
- [ ] Compare with total component count
- [ ] Report coverage ratio

Expected: Every component file in `src/components/ui/` has a corresponding `.stories.tsx` file.

### Step 5: Functional Smoke Test

Start Storybook dev server and verify:

```bash
npm run storybook -- --no-open &
# Wait for server ready
curl -s -o /dev/null -w "%{http_code}" http://localhost:6006
```

- [ ] Server starts on port 6006
- [ ] HTTP 200 response
- [ ] Kill dev server after verification

**If browser testing available (Playwright MCP):**
- [ ] Navigate to localhost:6006
- [ ] Verify sidebar shows all component categories
- [ ] Click on 3-5 random stories to verify they render
- [ ] Toggle dark/light theme to verify theme switch works
- [ ] Check Accessibility panel for critical violations

### Step 6: Generate Verification Report

Produce final report:

```markdown
## Storybook Verification Report

| Check | Status | Details |
|-------|--------|---------|
| TypeScript | {PASS/FAIL} | {error count} errors |
| Lint | {PASS/FAIL} | {error count} errors |
| Build | {PASS/FAIL} | {build size} |
| Story Coverage | {PASS/FAIL} | {stories}/{components} ({ratio}%) |
| Dev Server | {PASS/FAIL} | HTTP {status_code} |
| Theme Toggle | {PASS/FAIL/SKIPPED} | {details} |

### Summary
- **Overall Status:** {PASS/FAIL}
- **Components:** {total_components}
- **Stories:** {total_stories}
- **Coverage:** {ratio}%
- **Fixes Applied:** {fix_count}
```

## Acceptance Criteria

- [ ] **AC-1:** `npm run typecheck` — zero errors
- [ ] **AC-2:** `npm run lint` — zero errors
- [ ] **AC-3:** `npm run build-storybook` — builds successfully
- [ ] **AC-4:** Story coverage >= 100% (every component has stories)
- [ ] **AC-5:** Dev server responds with HTTP 200
- [ ] **AC-6:** Verification report generated

## Error Handling

### TypeCheck Fails After Stories Written
- **Trigger:** Type errors in story files
- **Detection:** Step 1 typecheck exit code != 0
- **Recovery:** Parse error output, fix each story file, re-run
- **Prevention:** sb-generate-all-stories should catch these

### Build Fails
- **Trigger:** Storybook build compilation error
- **Detection:** Step 3 build exit code != 0
- **Recovery:** Parse build error, fix specific file, re-run
- **Prevention:** If typecheck passes, build usually succeeds

### Dev Server Wont Start
- **Trigger:** Port 6006 already in use, or config error
- **Detection:** Step 5 server doesnt respond
- **Recovery:** Kill process on 6006 (`lsof -ti:6006 | xargs kill`), retry
- **Prevention:** Check port availability before starting

## Dependencies

### Depends On (Upstream)

- `sb-generate-all-stories` - Generate All Stories
  - Required output: All story files written
- `sb-configure` - Configure Storybook
  - Required output: Valid .storybook/ configuration

## Related Checklists

- `squads/design/checklists/ds-component-quality-checklist.md`
- `squads/design/checklists/ds-a11y-release-gate-checklist.md`

## Handoff

| Attribute | Value |
|-----------|-------|
| **Next Task** | None (terminal task) |
| **Trigger** | All acceptance criteria met |
| **Executor** | Returns to user |

### Handoff Package

- **verification_report**: Full verification results
- **coverage_ratio**: Story-to-component coverage percentage
- **storybook_url**: `http://localhost:6006` (if dev server left running)

---

_Task Version: 1.0.0_
_Pattern: HO-TP-001 (Task Anatomy Standard)_
_Last Updated: 2026-02-25_
_Compliant: Yes_
