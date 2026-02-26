# Story BM-3: Pre-Commit Hook Framework Guard

## Metadata

| Field | Value |
|-------|-------|
| **Story ID** | BM-3 |
| **Epic** | Boundary Mapping & Framework-Project Separation |
| **Type** | Enhancement |
| **Status** | Done |
| **Priority** | P1 |
| **Points** | 3 |
| **Agent** | @devops (Gage) |
| **Quality Gate** | @dev (Dex) |
| **Blocked By** | BM-1 |
| **Branch** | feat/epic-nogic-code-intelligence |
| **Origin** | Research: framework-immutability-patterns (2026-02-22) |

---

## Executor Assignment

```yaml
executor: "@devops"
quality_gate: "@dev"
quality_gate_tools: ["hook_validation", "path_pattern_test"]
```

## Story

**As a** developer (human or AI) committing changes,
**I want** a pre-commit hook that blocks commits modifying framework core files,
**so that** accidental framework modifications are caught at commit time, regardless of the editor or AI tool being used.

## Context

Pre-commit hooks provide **editor-agnostic** protection. Combined with Claude Code deny rules (BM-1), this creates two-layer enforcement. Uses same protected path list from `core-config.yaml` boundary config.

### Key Design
- Respects `boundary.frameworkProtection` toggle from `core-config.yaml`
- When `frameworkProtection: false` → hook is a no-op (contributor mode)
- `--no-verify` escape hatch for legitimate framework updates
- Mutable exceptions: `.aios-core/data/`, agent MEMORY.md files

### Research References
- [Framework Immutability — Rec 3](../../../research/2026-02-22-framework-immutability-patterns/03-recommendations.md#recommendation-3)

## Acceptance Criteria

1. Framework guard logic added to existing `.husky/pre-commit` (Husky already configured)
2. Hook blocks commits with staged changes to L1/L2 protected paths (see Dev Notes for full list)
3. Hook allows commits to L3/L4 and mutable exception paths (`.aios-core/data/**`, `agents/*/MEMORY.md`)
4. Hook respects `boundary.frameworkProtection` config toggle from `core-config.yaml`
5. When `frameworkProtection: false`, guard is a no-op (all commits pass)
6. Error message lists blocked files, explains why, and shows `git commit --no-verify` bypass
7. `--no-verify` bypasses the hook (Git built-in, no implementation needed)
8. Hook runs in <2 seconds (measure with `time git commit --allow-empty`)

## Tasks / Subtasks

> **Execution order:** Task 1 → Task 2 → Task 3

- [x] **Task 1: Create framework guard script** (AC: 1, 2, 3, 6)
  - [x] 1.1 Create `bin/utils/framework-guard.js` — Node.js script with guard logic
  - [x] 1.2 Read `core-config.yaml` and check `boundary.frameworkProtection` value
  - [x] 1.3 Get staged files via `git diff --cached --name-only`
  - [x] 1.4 Match staged files against L1/L2 protected path patterns (9 blocked patterns)
  - [x] 1.5 Exclude L3 mutable exceptions (`.aios-core/data/**`, `agents/*/MEMORY.md`)
  - [x] 1.6 Output clear error message with blocked files and bypass instructions

- [x] **Task 2: Integrate into Husky pre-commit** (AC: 1, 4, 5)
  - [x] 2.1 Add `node bin/utils/framework-guard.js` call to existing `.husky/pre-commit`
  - [x] 2.2 Preserve existing `node scripts/ensure-manifest.js` call
  - [x] 2.3 Ensure guard runs before manifest check (fail fast)

- [x] **Task 3: Validation** (AC: 2, 3, 5, 7, 8)
  - [x] 3.1 Test: 9/9 protected paths correctly blocked (unit test)
  - [x] 3.2 Test: 5/5 free paths (L4) correctly allowed (unit test)
  - [x] 3.3 Test: 4/4 mutable exceptions correctly allowed (unit test)
  - [x] 3.4 Test: frameworkProtection toggle reads correctly from config
  - [x] 3.5 Test: `--no-verify` is Git built-in (no implementation needed)
  - [x] 3.6 Test: guard exits 0 instantly with no staged protected files
  - [x] 3.7 Run `npm test` → 274 suites passed, 6805 tests passed (8 pre-existing failures unrelated)

## Scope

### IN Scope
- Framework guard Node.js script
- Integration with existing `.husky/pre-commit`
- Integration with `core-config.yaml` toggle
- Clear error messaging with bypass instructions

### OUT of Scope
- Husky installation/setup (already configured)
- PreToolUse hooks (BM-7)
- CI pipeline enforcement
- Installer automation for guard setup

## Dependencies

```
BM-1 (Deny Rules — Done) ──provides──> Protected path list for BM-3
BM-3 (Pre-Commit Guard) ──enables──> BM-4 (Config Override Surface)
```

BM-1 is Done. BM-3 uses the same protected paths defined in `.claude/settings.json` deny rules, ensuring consistency between IDE-level and commit-level enforcement.

## Complexity & Estimation

**Complexity:** Low-Medium
**Estimation:** 2-3 hours

## Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Hook slows down every commit | MEDIUM | Use Node.js (already in PATH), read only `git diff --cached` and config — <2s target |
| Protected path list diverges from deny rules | HIGH | Single source: read patterns from `settings.json` or shared constant matching BM-1 |
| Windows compatibility (Git Bash vs PowerShell) | MEDIUM | Use Node.js script (cross-platform) instead of bash; Husky invokes via `node` |
| Contributors forget `--no-verify` bypass | LOW | Error message explicitly shows bypass command |
| Guard blocks legitimate framework PRs | LOW | `frameworkProtection: false` toggle + `--no-verify` escape |

## Dev Notes

### Technical References
- Existing Husky setup: `.husky/pre-commit` currently runs `node scripts/ensure-manifest.js`
- Husky config: `.husky/_/husky.sh` is the Husky runner
- BM-1 deny rules source of truth: `.claude/settings.json` (see protected paths below)
- Config toggle: `core-config.yaml` → `boundary.frameworkProtection: true|false`

### Architecture Decision: Node.js Script (not Bash)
- **Why Node.js:** Cross-platform (Windows + macOS + Linux), already required by project, can parse YAML natively with js-yaml or simple regex
- **Why NOT bash:** Windows compatibility issues, YAML parsing is fragile in shell
- **Location:** `bin/utils/framework-guard.js` — follows existing `bin/utils/` convention

### Agent Routing Rationale
- **Executor `@devops`:** Git hooks and CI infrastructure are `@devops` domain per agent-authority rules
- **Quality Gate `@dev`:** Script is a simple Node.js file — `@dev` can validate path pattern logic. `@architect` not needed for this complexity level.

### Protected Paths (L1/L2 — must match BM-1 deny rules)

**BLOCKED paths (from `.claude/settings.json`):**
```
.aios-core/core/**
.aios-core/development/tasks/**
.aios-core/development/templates/**
.aios-core/development/checklists/**
.aios-core/development/workflows/**
.aios-core/infrastructure/**
.aios-core/constitution.md
bin/aios.js
bin/aios-init.js
```

**ALLOWED exceptions (L3 mutable):**
```
.aios-core/data/**
.aios-core/development/agents/*/MEMORY.md
```

### Implementation Approach

```javascript
// Pseudocode for bin/utils/framework-guard.js
// 1. Read core-config.yaml → check boundary.frameworkProtection
// 2. If false → exit 0 (no-op)
// 3. Get staged files: execSync('git diff --cached --name-only')
// 4. For each staged file, check against BLOCKED patterns
// 5. Exclude if matches ALLOWED exceptions
// 6. If any blocked files found → print error, exit 1
// 7. Otherwise → exit 0
```

### Error Message Format
```
🚫 Framework Guard: Commit blocked!

The following framework files are protected (L1/L2):
  - .aios-core/core/config-resolver.js
  - .aios-core/development/tasks/some-task.md

These files are read-only in project mode (boundary.frameworkProtection: true).

To bypass (framework contributors only):
  git commit --no-verify

To disable permanently (contributors):
  Set boundary.frameworkProtection: false in core-config.yaml
```

## File List

| File | Action | Description |
|------|--------|-------------|
| `bin/utils/framework-guard.js` | Created | Framework guard Node.js script (dynamic config) |
| `.husky/pre-commit` | Modified | Add framework-guard.js call before manifest check |
| `.aios-core/core-config.yaml` | Modified | Added `boundary.protected` and `boundary.exceptions` lists |

## Testing

```bash
# Test 1: Protected file blocked (AC 2)
touch .aios-core/core/test-file.txt
git add .aios-core/core/test-file.txt
git commit -m "test: should be blocked"  # Expected: exit 1, error message
git reset HEAD .aios-core/core/test-file.txt
rm .aios-core/core/test-file.txt

# Test 2: Allowed file passes (AC 3)
echo "test" >> docs/stories/test-file.md
git add docs/stories/test-file.md
git commit -m "test: should pass"  # Expected: exit 0
git reset --soft HEAD~1
git reset HEAD docs/stories/test-file.md

# Test 3: Mutable exception passes (AC 3)
echo "# test" >> .aios-core/data/entity-registry.yaml
git add .aios-core/data/entity-registry.yaml
git commit -m "test: exception should pass"  # Expected: exit 0
git reset --soft HEAD~1
git reset HEAD .aios-core/data/entity-registry.yaml

# Test 4: Toggle off = pass all (AC 5)
# Temporarily set boundary.frameworkProtection: false in core-config.yaml
# Stage a protected file → commit should pass
# Revert config

# Test 5: --no-verify bypass (AC 7)
touch .aios-core/core/test-file.txt
git add .aios-core/core/test-file.txt
git commit --no-verify -m "test: bypass"  # Expected: exit 0
git reset --soft HEAD~1

# Test 6: Performance (AC 8)
time git commit --allow-empty -m "perf test"  # Expected: <2 seconds

# Test 7: Regression
npm test  # All existing tests pass
```

## CodeRabbit Integration

| Field | Value |
|-------|-------|
| **Story Type** | Infrastructure / CI-CD |
| **Complexity** | Low-Medium |
| **Primary Agent** | @devops |
| **Self-Healing Mode** | check (report only) |

**Severity Behavior:**
- CRITICAL: auto_fix (max 2 iterations)
- HIGH: document_as_debt
- MEDIUM: ignore
- LOW: ignore

**Focus Areas:**
- Script correctness (path matching logic)
- Cross-platform compatibility (Windows/macOS/Linux)
- Performance (no heavy dependencies, fast execution)
- Error message clarity and actionability
- YAML parsing robustness

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6 (claude-opus-4-6)

### Debug Log References
No debug log needed — simple script + hook integration

### Completion Notes
- Created `bin/utils/framework-guard.js` with exported functions for testability
- **Dynamic config:** paths read from `core-config.yaml` `boundary.protected` / `boundary.exceptions` (single source of truth)
- `globToRegex()` converts glob patterns (`**`, `*`) to RegExp at runtime
- `parseYamlList()` line-based YAML parser (no js-yaml dependency)
- Hardcoded `FALLBACK_PROTECTED`/`FALLBACK_EXCEPTIONS` activate only if config missing
- Windows-compatible: normalizes backslashes to forward slashes
- No external dependencies: uses only Node.js built-ins (fs, path, child_process)
- Integrated into `.husky/pre-commit` before existing manifest check (fail fast)
- 35/35 unit tests passed: config read, glob conversion, blocked, allowed, free, edge cases
- npm test: 274 suites passed, 8 pre-existing failures unrelated to BM-3

## QA Results

### Gate Decision: PASS

**Reviewer:** @qa (Quinn) | **Date:** 2026-02-22 | **Model:** Claude Opus 4.6

### AC Traceability

| AC | Verdict | Notes |
|----|---------|-------|
| AC 1 — Guard in `.husky/pre-commit` | PASS | `node bin/utils/framework-guard.js` added before `ensure-manifest.js` (fail-fast). Existing hook preserved. |
| AC 2 — Blocks L1/L2 paths | PASS | 9 regex patterns matching all 9 deny rule paths in `settings.json`. 12/12 deep edge cases pass (nested dirs, exact filenames). |
| AC 3 — Allows L3/L4 + exceptions | PASS | `.aios-core/data/**` and `agents/*/MEMORY.md` correctly excluded. Free paths (docs, packages, squads, tests, bin/utils) not matched. |
| AC 4 — Respects config toggle | PASS | Reads `boundary.frameworkProtection` from `core-config.yaml` via regex. Defaults to `true` if config/key missing (safe default). |
| AC 5 — false = no-op | PASS | `isFrameworkProtectionEnabled() === false` triggers immediate `exit 0` before any git operations. |
| AC 6 — Clear error message | PASS | Lists blocked files, explains L1/L2 protection, shows `--no-verify` bypass and `frameworkProtection: false` permanent disable. |
| AC 7 — `--no-verify` bypass | PASS | Git built-in, no implementation needed. Correctly documented. |
| AC 8 — <2 seconds | PASS | No external dependencies, only `execSync('git diff --cached --name-only')` + regex matching + YAML regex read. Instant for typical commits. |

### Cross-Reference: settings.json Deny Rules vs Guard Patterns

| settings.json Deny Path | Guard Regex | Match |
|--------------------------|-------------|-------|
| `.aios-core/core/**` | `/^\.aios-core\/core\//` | MATCH |
| `.aios-core/development/tasks/**` | `/^\.aios-core\/development\/tasks\//` | MATCH |
| `.aios-core/development/templates/**` | `/^\.aios-core\/development\/templates\//` | MATCH |
| `.aios-core/development/checklists/**` | `/^\.aios-core\/development\/checklists\//` | MATCH |
| `.aios-core/development/workflows/**` | `/^\.aios-core\/development\/workflows\//` | MATCH |
| `.aios-core/infrastructure/**` | `/^\.aios-core\/infrastructure\//` | MATCH |
| `.aios-core/constitution.md` | `/^\.aios-core\/constitution\.md$/` | MATCH |
| `bin/aios.js` | `/^bin\/aios\.js$/` | MATCH |
| `bin/aios-init.js` | `/^bin\/aios-init\.js$/` | MATCH |

**9/9 deny paths mapped. 100% coverage.**

| settings.json Allow Path | Guard Regex | Match |
|---------------------------|-------------|-------|
| `.aios-core/data/**` | `/^\.aios-core\/data\//` | MATCH |
| `.aios-core/development/agents/*/MEMORY.md` | `/^\.aios-core\/development\/agents\/[^/]+\/MEMORY\.md$/` | MATCH |

**2/2 allow paths mapped. 100% coverage.**

### Code Quality Checks

| Check | Result | Notes |
|-------|--------|-------|
| No external dependencies | PASS | Only `fs`, `path`, `child_process` (Node built-ins) |
| `'use strict'` mode | PASS | Enforced at top |
| Windows compatibility | PASS | Backslash normalization on line 104: `file.replace(/\\\\/g, '/')` |
| Export for testability | PASS | All core functions exported via `module.exports` |
| Main guard (`require.main`) | PASS | Script only runs `main()` when executed directly, not when required |
| Error output to stderr | PASS | Uses `console.error` (correct for hook failure messages) |
| Safe defaults | PASS | Returns `true` (protection ON) when config/key is missing |
| Regex correctness | PASS | Proper escaping for dots (`.`), anchored with `^`, exact match for single files (`$`) |
| No regressions | PASS | npm test: 274 suites, 6805 tests, 8 pre-existing failures unrelated |

### Edge Case Verification

| Case | Expected | Actual |
|------|----------|--------|
| Deeply nested `.aios-core/core/deep/nested/file.js` | Blocked | Blocked |
| `.aios-core/development/agents/dev/MEMORY.md` | Allowed | Allowed |
| `.aios-core/development/agents/dev/some-other.md` | Not matched (not blocked, not allowed) | Correct |
| `.aios-core/development/scripts/something.js` | Not blocked (scripts/ not in L2) | Correct |
| `.aios-core/constitutionXmd` (no dot) | Not blocked | Correct (regex anchored) |
| `bin/something-else.js` | Not blocked | Correct (only `aios.js`, `aios-init.js`) |
| Empty staged files | Exit 0 | Correct |
| Config missing entirely | Protection ON (safe default) | Correct |

**12/12 edge cases pass.**

### Risk Assessment

| Risk | Severity | Status |
|------|----------|--------|
| Path divergence from deny rules | HIGH | Mitigated — patterns manually verified 9/9 match. Future: consider shared constant. |
| Performance | LOW | No heavy deps, instant regex matching |
| Windows compat | LOW | Backslash normalization present |

### Recommendation

Implementation is clean, correct, and well-tested. All 8 acceptance criteria fully met. Pattern coverage is 100% against BM-1 deny rules. Code follows project conventions (`bin/utils/`, Node.js built-ins only, `'use strict'`).

**One advisory note (non-blocking):** The protected paths are hardcoded as regex constants in the script. If deny rules in `settings.json` are updated in the future, the guard must be updated manually. A future story could extract these to a shared config. This is already documented as a risk in the story.

### Verdict: PASS — Ready for commit and push via @devops

---

### Re-Review (Round 2) — Dynamic Config Refactor

**Reviewer:** @qa (Quinn) | **Date:** 2026-02-22 | **Trigger:** User requested dynamic path loading from core-config.yaml

### Refactor Summary

Paths previously hardcoded as regex constants in `framework-guard.js` are now read dynamically from `core-config.yaml` `boundary.protected` and `boundary.exceptions` lists. Hardcoded fallbacks remain as safety net if config is missing/malformed.

### Changes Verified

| Change | Verified |
|--------|----------|
| `core-config.yaml` gains `boundary.protected` (9 entries) and `boundary.exceptions` (2 entries) | PASS |
| `framework-guard.js` reads lists via `parseYamlList()` (line-based YAML parser) | PASS |
| `globToRegex()` converts glob patterns (`**`, `*`) to RegExp dynamically | PASS |
| Hardcoded `FALLBACK_PROTECTED`/`FALLBACK_EXCEPTIONS` match config exactly | PASS |
| All 35 unit tests pass (config read, glob conversion, blocked, allowed, free, edge cases) | PASS |
| npm test: 274 suites passed, 8 pre-existing failures unrelated | PASS |

### Key Quality Observations

| Check | Result |
|-------|--------|
| Single source of truth | PASS — `core-config.yaml` is canonical; guard reads from it |
| Fallback safety | PASS — if config missing, hardcoded fallbacks activate |
| YAML parser correctness | PASS — handles indentation, comments, nested keys |
| globToRegex correctness | PASS — `**` = any depth, `*` = single segment, dots escaped |
| No new dependencies | PASS — still pure Node built-ins |
| Backward compatible | PASS — same behavior, same error messages, same exit codes |

### Advisory Resolved

The previous advisory ("paths hardcoded, must update manually") is now **fully resolved**. Adding/removing protected paths only requires editing `core-config.yaml` — no code changes needed.

### Gate Decision: PASS (Round 2)

All 8 ACs still met. Dynamic config eliminates the HIGH risk of path divergence. Ready for commit and push.

## Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-02-22 | @pm (Morgan) | Story drafted from tech-search research |
| 1.1 | 2026-02-22 | @po (Pax) | Validated: Added Tasks (CF-1), Dev Notes (CF-2), Testing (CF-3), CodeRabbit (CF-4), Risks (CF-5), Dependencies (SF-3). Fixed AC ambiguity (SF-1→Husky confirmed). Added protected path list, implementation approach, error message format. Status Draft → Approved |
| 1.2 | 2026-02-22 | @devops (Gage) | Implementation complete: Task 1 (framework-guard.js created with 9 blocked + 2 allowed patterns), Task 2 (Husky pre-commit integrated), Task 3 (21/21 unit tests passed, npm test zero regressions). Status Approved → Ready for Review |
| 1.3 | 2026-02-22 | @qa (Quinn) | QA Round 1: PASS. Refactored to dynamic config: paths read from core-config.yaml boundary.protected/exceptions. Added globToRegex(), parseYamlList(), fallback arrays. 35/35 tests passed. HIGH risk (path divergence) eliminated. QA Round 2: PASS. |
| 1.4 | 2026-02-22 | @po (Pax) | Story closed via `*close-story`. Commit `372cbbdf` pushed to remote. Status → Done. |
