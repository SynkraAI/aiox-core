# Story INS-4.8: Unify Health-Check + Doctor v2 (3 Checks Novos: Skills, Commands, Hooks)

**Epic:** Installation Health & Environment Sync (INS-4)
**Wave:** 3 — Runtime Health & Upgrade Safety (P2)
**Points:** 3
**Agents:** @dev
**Status:** Done
**Blocked By:** INS-4.1 (`aios doctor` rewrite must be complete first)
**Created:** 2026-02-23

**Executor Assignment:**
- **executor:** @dev
- **quality_gate:** @qa
- **quality_gate_tools:** [health-check task execution, aios doctor integration, doctor v2 checks validation, constitution respect check, npm test]

---

## Story

**As a** framework agent (`@aios-master`) or developer,
**I want** `*health-check` to invoke `aios doctor` internally (with 3 new checks for skills, commands, and hooks) and provide contextual governance interpretation,
**so that** there is a single unified health diagnostic experience — not three separate mechanisms — that also validates the new artifacts from INS-4.3, and agents can trigger diagnostics with remediation guidance without duplicating check logic.

### Context

Currently three overlapping mechanisms exist:

1. **`aios doctor`** (CLI) — `bin/aios.js` `runDoctor()` — 12 checks after INS-4.1 rewrite (Done)
2. **`core/health-check/index.js`** — a health-check engine in `.aios-core/core/health-check/` (referenced in settings.json deny rules, so it exists)
3. **`health-check.yaml` task** — in `.aios-core/development/tasks/` with alias `*doctor` — agent-facing task

**Codex Finding (MEDIO):** Conflicting semantics. Task already has `*doctor` alias which conflicts with the CLI `aios doctor`. INS-4.8 must clarify the boundary: `aios doctor` = CLI tool (standalone, technical output); `*health-check` = agent task (contextual, governance-aware, can fix).

**DevOps Handoff v2 — PM Decision (v4):** Gaps #11-#13 discovered after INS-4.1 was Done. 3 new doctor checks needed (skills-count, commands-count, hooks-claude-count) but INS-4.1 already closed. PM decided to absorb these checks into INS-4.8 rather than reopen INS-4.1. This is the natural home: INS-4.8 already depends on INS-4.1 and unifies health-check. Sizing: 2→3 pts.

**This story's scope:**
1. **Add 3 new doctor check modules** to `.aios-core/core/doctor/checks/`: `skills-count`, `commands-count`, `hooks-claude-count`
2. **Register new checks** in the doctor check registry
3. Update `health-check.yaml` task to call `aios doctor` (via Bash tool) internally rather than having its own checks
4. Add governance interpretation layer (translate FAIL/WARN into agent-appropriate remediation guidance)
5. Remove the `*doctor` alias from the task (to avoid confusion with CLI `aios doctor`)
6. Do NOT create a third check mechanism — unify by reusing doctor output

---

## Acceptance Criteria

### AC1: 3 New Doctor Check Modules (Gaps #11-#13)
- [ ] New check: `.aios-core/core/doctor/checks/skills-count.js` — counts directories in `.claude/skills/`, WARN if <7, FAIL if 0
- [ ] New check: `.aios-core/core/doctor/checks/commands-count.js` — counts `.md` files in `.claude/commands/` (recursive), WARN if <20, FAIL if <12 (agents only)
- [ ] New check: `.aios-core/core/doctor/checks/hooks-claude-count.js` — counts `.cjs` files in `.claude/hooks/`, WARN if <2, verifies registration in `settings.local.json`
- [ ] All 3 checks follow the same module contract as INS-4.1 checks: `{ name, run(context) → { check, status, message, fixCommand? } }`
- [ ] All 3 checks registered in doctor check registry (`.aios-core/core/doctor/checks/index.js` — add `require()` + entry in `loadChecks()` array)
- [ ] `aios doctor` now runs 15 checks total (12 from INS-4.1 + 3 new)

### AC2: Task Calls aios doctor Internally
- [ ] `.aios-core/development/tasks/health-check.yaml` task instructions tell the agent to run `aios doctor --json` via Bash tool
- [ ] Task parses JSON output from `aios doctor` and interprets it (including the 3 new checks)
- [ ] Task does NOT have its own list of health checks (delegates entirely to `aios doctor`)

### AC3: Governance Interpretation Layer
- [ ] For each FAIL item from `aios doctor` output: task provides remediation command (e.g., `aios doctor --fix` or specific manual step)
- [ ] For each WARN item: task provides explanation in Constitution context (which Article is affected)
- [ ] Remediation guidance respects Constitution (Article I: CLI First, Article IV: No Invention — no invented fixes)

### AC4: *doctor Alias Removed
- [ ] `health-check.yaml` no longer has `alias: *doctor` (to avoid confusion with CLI command)
- [ ] Any documentation referencing `*doctor` (task) is updated to `*health-check`

### AC5: core/health-check Module Clarified
- [ ] Document the relationship between `core/health-check/index.js` and `aios doctor` in Dev Notes
- [ ] If `core/health-check/index.js` is called by `aios doctor` internally, note it
- [ ] If `core/health-check/index.js` is a separate/deprecated mechanism, add a comment in the file pointing to `aios doctor` as the primary interface (do NOT delete the module)

### AC6: Task Executable by Agent
- [ ] `@aios-master *health-check` produces a report with: PASS/WARN/FAIL summary, governance interpretation, remediation steps
- [ ] Task works via Bash tool (Claude Code native) — no shell dependency beyond `node`
- [ ] Task output format is human-readable markdown (not raw JSON)

### AC7: Regression Test Coverage
- [ ] Unit test: `skills-count` check — PASS when >=7, WARN when <7, FAIL when 0
- [ ] Unit test: `commands-count` check — PASS when >=20, WARN when <20, FAIL when <12
- [ ] Unit test: `hooks-claude-count` check — PASS when >=2 + registered, WARN when <2
- [ ] Unit test: health-check task parses `aios doctor --json` output correctly (including 3 new checks)
- [ ] Test: FAIL item → remediation command present in output
- [ ] Test: `*doctor` alias no longer present in task definition
- [ ] `npm test` passes with zero new failures

---

## Tasks / Subtasks

### Task 1: Implement 3 New Doctor Check Modules (AC1)
- [x] 1.1 Read `.aios-core/core/doctor/checks/` — understand existing check module pattern (use INS-4.1 checks as reference: `settings-json.js`, `rules-files.js`)
- [x] 1.2 Create `.aios-core/core/doctor/checks/skills-count.js`:
  - Count directories in `{projectRoot}/.claude/skills/` that contain `SKILL.md`
  - PASS: >=7, WARN: 1-6, FAIL: 0 or directory missing
  - fixCommand: `npx aios-core install --force`
- [x] 1.3 Create `.aios-core/core/doctor/checks/commands-count.js`:
  - Count `.md` files in `{projectRoot}/.claude/commands/` recursively
  - PASS: >=20, WARN: 12-19 (only agents, no extras), FAIL: <12
  - fixCommand: `npx aios-core install --force`
- [x] 1.4 Create `.aios-core/core/doctor/checks/hooks-claude-count.js`:
  - Count `.cjs` files in `{projectRoot}/.claude/hooks/`
  - Cross-reference with `settings.local.json` to verify registration
  - PASS: >=2 + all registered, WARN: files present but not registered, FAIL: 0 or directory missing
  - fixCommand: `npx aios-core install --force`
- [x] 1.5 Register all 3 new checks in `.aios-core/core/doctor/checks/index.js`: add `require('./skills-count')`, `require('./commands-count')`, `require('./hooks-claude-count')` + entries in `loadChecks()` array
- [x] 1.6 Verify `aios doctor` now runs 15 checks total

### Task 2: Audit Existing Mechanisms (AC5)
- [x] 2.1 Read `.aios-core/development/tasks/health-check.yaml` — understand current task definition and `*doctor` alias
- [x] 2.2 Read `.aios-core/core/health-check/index.js` — understand what this module does; is it called by `aios doctor`?
- [x] 2.3 Read `bin/aios.js` `runDoctor()` — does it use `core/health-check/index.js` internally?
- [x] 2.4 Document: what is the current relationship between these 3 mechanisms?

### Task 3: Update health-check.yaml Task (AC2, AC3, AC4)
- [x] 3.1 Replace current task body with instructions to run `aios doctor --json` via Bash tool
- [x] 3.2 Add interpretation layer: for each check result, map to Constitution article and remediation
- [x] 3.3 Remove `alias: *doctor` from task definition
- [x] 3.4 Update task description to clearly state: "invokes `aios doctor` internally, adds governance context"

### Task 4: Build Governance Interpretation Map (AC3)
- [x] 4.1 Map each check name to Constitution article:
  - `settings-json` → Article II (Agent Authority) — boundary protection
  - `rules-files` → Article II — agent authority rules
  - `agent-memory` → Article II — agent identity
  - `entity-registry` → Article III (Story-Driven Development) — code intelligence
  - `git-hooks` → Article V (Quality First) — quality gates
  - `core-config` → Article I (CLI First) — configuration integrity
  - `claude-md` → Article II — agent context
  - `ide-sync` → Article II — agent consistency
  - `node-version` → Article V — runtime requirements
  - `skills-count` → Article II — agent capabilities (skills = extended agent functionality)
  - `commands-count` → Article II — agent authority (commands = agent action vocabulary)
  - `hooks-claude-count` → Article V — quality gates (hooks enforce governance at runtime)
- [x] 4.2 Map each check to remediation command (if fixable: `aios doctor --fix`, if manual: specific instruction)
- [x] 4.3 Write governance interpretation into task instructions

### Task 5: Document core/health-check Relationship (AC5)
- [x] 5.1 Read `core/health-check/index.js` — understand its role
- [x] 5.2 Add comment/note clarifying its role relative to `aios doctor`
- [x] 5.3 If deprecated/redundant, note in Dev Notes (do NOT delete the module — deny rules protect it anyway)

### Task 6: Validate Task Execution (AC6)
- [x] 6.1 Test: activate `@aios-master`, run `*health-check` → verify output format
- [x] 6.2 Verify output: PASS/WARN/FAIL summary (including 3 new checks) + governance notes + remediation steps
- [x] 6.3 Verify: `aios doctor --json` called correctly via Bash tool in task

### Task 7: Tests (AC7)
- [x] 7.1 Unit test: `skills-count` check — PASS (>=7), WARN (<7), FAIL (0)
- [x] 7.2 Unit test: `commands-count` check — PASS (>=20), WARN (<20), FAIL (<12)
- [x] 7.3 Unit test: `hooks-claude-count` check — PASS (>=2 + registered), WARN (<2)
- [x] 7.4 Unit test: task instructions parse JSON output from `aios doctor` correctly
- [x] 7.5 Test: FAIL check → remediation present in task output
- [x] 7.6 Test: `*doctor` alias not in `health-check.yaml`
- [x] 7.7 `npm test` regression check

---

## Dev Notes

### Key Files (Read These First)

| File | Purpose |
|------|---------|
| `.aios-core/core/doctor/checks/*.js` | Existing 12 check modules from INS-4.1 — follow this pattern for new checks |
| `.aios-core/core/doctor/checks/index.js` | Check registry — `loadChecks()` returns array of all check modules. Add 3 new `require()` + entries here |
| `.aios-core/development/tasks/health-check.yaml` | Task to update — read current body and alias |
| `.aios-core/core/health-check/index.js` | Existing health-check module — understand and document relationship |
| `bin/aios.js` lines 350-450 | Understand `runDoctor()` — does it use `core/health-check`? |

### New Check Modules (Doctor v2 — Gaps #11-#13)

Follow the same pattern as INS-4.1 checks. Reference implementation: `settings-json.js` (simple), `rules-files.js` (count-based).

```javascript
// Example: skills-count.js
const name = 'skills-count';
async function run(context) {
  const skillsDir = path.join(context.projectRoot, '.claude', 'skills');
  if (!fs.existsSync(skillsDir)) {
    return { check: name, status: 'FAIL', message: 'Skills directory not found', fixCommand: 'npx aios-core install --force' };
  }
  const skills = fs.readdirSync(skillsDir, { withFileTypes: true })
    .filter(d => d.isDirectory() && fs.existsSync(path.join(skillsDir, d.name, 'SKILL.md')));
  if (skills.length >= 7) return { check: name, status: 'PASS', message: `${skills.length} skills found` };
  return { check: name, status: 'WARN', message: `Only ${skills.length}/7 skills found`, fixCommand: 'npx aios-core install --force' };
}
module.exports = { name, run };
```

### CRITICAL: Two Separate Health-Check Systems (PO Validation Finding)

**There are TWO completely separate health-check systems in the codebase.** Understanding this is essential before implementation.

| System | Location | Checks | Audience | Check Contract |
|--------|----------|--------|----------|---------------|
| **`core/doctor/`** (INS-4.1) | `.aios-core/core/doctor/checks/` | 12 modular checks | CLI users via `aios doctor` | `{ name, async run(context) → { check, status, message, fixCommand? } }` |
| **`core/health-check/`** (HCS-2) | `.aios-core/core/health-check/` | ~30 checks across 5 domains (project, local, repository, deployment, services) | Programmatic via `HealthCheck` class | Different: `BaseCheck` class, `CheckSeverity`, `CheckStatus`, engine pattern |

**Current state of `health-check.yaml` task:**
- The task CURRENTLY calls `core/health-check/` (the HCS-2 HealthCheck class) — see task script L88: `require('../../core/health-check')`
- It does NOT call `aios doctor` at all
- It has `*doctor` alias causing confusion with the CLI `aios doctor`

**What INS-4.8 must do (AC2):**
- **Rewrite** the task to call `aios doctor --json` via Bash tool instead of `core/health-check/`
- This is a **significant change** — the task switches from one system to another
- The `core/health-check/` module is NOT deleted (L1 protected by deny rules) — just add a comment noting `aios doctor` is the primary interface
- The 3 new check modules (skills-count, commands-count, hooks-claude-count) go in `core/doctor/checks/` (NOT `core/health-check/`)

### Three-Mechanism Problem (Codex Finding M3)

| Mechanism | Location | Audience | Current Status |
|-----------|----------|----------|---------------|
| `aios doctor` | `bin/aios.js` → `core/doctor/` | CLI users | 12 checks (INS-4.1 Done), `--fix/--json/--dry-run` |
| `core/health-check/index.js` | `.aios-core/core/health-check/` | Internal/programmatic | Separate system (HCS-2), ~30 checks, 5 domains, own engine |
| `health-check.yaml` task | `.aios-core/development/tasks/` | Agents via `*health-check` | Currently calls `core/health-check/` (NOT doctor). Has `*doctor` alias causing confusion |

**After INS-4.1 + INS-4.8:**
- `aios doctor` = CLI tool, **15 checks** (12 from INS-4.1 + 3 new), `--fix/--json/--dry-run`
- `core/health-check/index.js` = legacy module (HCS-2), NOT called by `aios doctor`, preserved but documented as secondary
- `*health-check` task = agent interface that wraps `aios doctor --json` with governance context (REWRITTEN from `core/health-check/` to `aios doctor`)

### Governance Interpretation Format

The task output to the agent should look like:

```markdown
## AIOS Health Check

Summary: 8 PASS | 1 WARN | 1 FAIL | 1 INFO

### Issues Requiring Attention

**[FAIL] rules-files** — Missing 2 of 7 rules
- Constitution Impact: Article II (Agent Authority) — Agents operate without authority rules context
- Remediation: `aios doctor --fix` or manually copy rules from source

**[WARN] claude-md** — Missing sections: Boundary
- Constitution Impact: Article II — Agents lack boundary context in their system prompt
- Remediation: `aios doctor --fix` to add missing CLAUDE.md sections

### All Checks
| Check | Status | Note |
|-------|--------|------|
| settings-json | PASS | 62 deny rules |
| rules-files | FAIL | 5/7 present |
| ... | | |
```

### L2 Note: health-check.yaml is a Framework File

`.aios-core/development/tasks/health-check.yaml` is L2 (framework template). In this project we are in framework-contributor mode — editable. The update to this file is a framework improvement, not project customization.

### Testing

**Test Location:** `packages/installer/tests/unit/` and manual agent testing

**Key Scenarios:**
1. Task parses `aios doctor --json` output format
2. FAIL/WARN items have governance interpretation and remediation
3. `*doctor` alias removed from task
4. `@aios-master *health-check` produces readable markdown report

---

## CodeRabbit Integration

**Story Type:** Architecture (unification) + Integration (task + CLI) + New Checks
**Complexity:** Medium (3 pts — 3 new doctor check modules + task update + governance map + relationship documentation)

**Quality Gates:**
- [ ] Pre-Commit (@dev): Run before marking story complete
- [ ] Pre-PR (@qa): Task execution validation, governance correctness, constitution respect

**Self-Healing Configuration:**
- **Mode:** light
- **Max Iterations:** 2
- **Timeout:** 15 minutes
- **Severity Filter:** CRITICAL only

**Predicted Behavior:**
- CRITICAL issues: auto_fix (up to 2 iterations)
- HIGH issues: document_only

**Focus Areas (Primary):**
- No third mechanism created: task delegates to `aios doctor --json`, no new checks
- Constitution respect: remediation guidance cites correct Articles

**Focus Areas (Secondary):**
- *doctor alias removed: no naming conflict with CLI `aios doctor`
- Task output format: readable markdown, not raw JSON

---

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Debug Log References
- 46 unit tests passing (packages/installer/tests/unit/doctor/doctor-checks.test.js)
- 15 checks verified via `loadChecks()` registry
- `npm test`: 287 suites passed, 12 pre-existing failures (pro-design-migration unrelated)

### Completion Notes
- 3 new doctor check modules created following INS-4.1 contract pattern
- `health-check.yaml` completely rewritten from v2.0 (HCS-2 HealthCheck class) to v3.0 (aios doctor --json)
- `*doctor` alias removed from task (only `*hc` remains)
- `governance_map` section added to task with all 15 checks mapped to Constitution articles
- `core/health-check/index.js` annotated with INS-4.8 note clarifying it is separate from `aios doctor`
- Audit confirmed: `aios doctor` does NOT use `core/health-check/` — they are completely independent systems

### File List
| File | Action | Purpose |
|------|--------|---------|
| `.aios-core/core/doctor/checks/skills-count.js` | Created | Doctor check: count skills directories with SKILL.md |
| `.aios-core/core/doctor/checks/commands-count.js` | Created | Doctor check: count .md files in commands/ recursively |
| `.aios-core/core/doctor/checks/hooks-claude-count.js` | Created | Doctor check: count .cjs hook files + verify registration |
| `.aios-core/core/doctor/checks/index.js` | Modified | Registry: 12→15 checks, added 3 new requires |
| `.aios-core/development/tasks/health-check.yaml` | Modified | Rewritten v2→v3: delegates to aios doctor --json, governance map, removed *doctor alias |
| `.aios-core/core/health-check/index.js` | Modified | Added INS-4.8 note clarifying relationship to aios doctor |
| `packages/installer/tests/unit/doctor/doctor-checks.test.js` | Modified | Added 15 new tests for 3 checks + registry + task validation |

---

## QA Results

### Review Date: 2026-02-23

### Reviewed By: Quinn (Test Architect)

### Code Quality Assessment

Implementation is clean, consistent, and follows the established INS-4.1 check module contract precisely. All 3 new check modules mirror the patterns of existing checks (JSDoc, defensive error handling, proper module.exports). The health-check.yaml rewrite is a well-structured instruction-based task with comprehensive governance mapping. No third mechanism was created — unification achieved as required.

### Requirements Traceability

| AC | Status | Evidence |
|----|--------|----------|
| AC1: 3 New Doctor Checks | PASS | `skills-count.js`, `commands-count.js`, `hooks-claude-count.js` created with correct contract; registry updated to 15; verified via `loadChecks()` |
| AC2: Task Calls aios doctor | PASS | `health-check.yaml` v3.0 instructions reference `node bin/aios.js doctor --json`; no `HealthCheck` class import |
| AC3: Governance Interpretation | PASS | `governance_map` section with 15 entries mapping checks to Constitution articles + remediation commands |
| AC4: *doctor Alias Removed | PASS | Only `*hc` in aliases; `*doctor` removal confirmed via test |
| AC5: core/health-check Clarified | PASS | Comment block added to `core/health-check/index.js` with `@see core/doctor/` note |
| AC6: Task Executable by Agent | PASS | Instructions produce structured markdown report with summary, issues, governance, remediation |
| AC7: Regression Tests | PASS | 46 tests passing; 15 new tests covering 3 checks + registry + task validation; `npm test` zero new failures |

### Compliance Check

- Coding Standards: PASS — ES2022, CommonJS, 2-space indent, single quotes, JSDoc headers
- Project Structure: PASS — New files in correct locations under `core/doctor/checks/`
- Testing Strategy: PASS — Unit tests with mocked fs, threshold boundary tests (PASS/WARN/FAIL), registry integration test
- All ACs Met: PASS — 7/7 ACs verified

### Improvements Checklist

- [x] Check module contract compliance verified (name, run, async, return shape)
- [x] Defensive error handling (try/catch on readdirSync, existsSync guards)
- [x] Registry registration verified (15 checks loaded)
- [x] *doctor alias confirmed removed
- [x] core/health-check clarification comment added
- [x] Governance map covers all 15 checks with correct Constitution articles

### Security Review

No security concerns. Checks are read-only (fs.existsSync, fs.readdirSync, fs.readFileSync). No user input processing, no network calls, no command injection vectors. The `fixCommand` values are static strings, not interpolated.

### Performance Considerations

No concerns. All 3 new checks are filesystem-based with O(n) directory scans. The `commands-count` recursive walk is bounded by `.claude/commands/` depth (typically 2 levels). No async I/O bottlenecks.

### Files Modified During Review

None. No refactoring required.

### Gate Status

**Gate: PASS**

Quality Score: 100/100 (0 FAILs, 0 CONCERNS)

### Recommended Status

PASS — Ready for Done. All 7 ACs met, 46 tests passing, clean implementation following established patterns. Activate @devops to commit and push.

---

## Change Log

| Date | Author | Change |
|------|--------|--------|
| 2026-02-23 | @sm (River) | Story drafted from Epic INS-4 handoff secao 3.8 + Codex Finding M3 (unificar, nao criar terceiro mecanismo, sizing 3→2 pts) |
| 2026-02-23 | @sm (River) | [PM v4 — DevOps Handoff v2] Escopo expandido: 3 novos doctor check modules absorvidos de gaps #11-#13 (INS-4.1 ja Done). Titulo: "Unify Health-Check" → "Unify Health-Check + Doctor v2". AC1 novo (3 checks). ACs renumerados (6→7). Tasks renumeradas (6→7), Task 1 novo (implement checks). Governance map expandido com 3 checks. Sizing: 2→3 pts. |
| 2026-02-23 | @po (Pax) | [Validation] Score: 8/10, GO. 2 concerns corrigidos: CONCERN-1 (MEDIUM) `check-registry.js` nao existe — corrigido para `checks/index.js` com `loadChecks()` em AC1, Task 1.5, Dev Notes. CONCERN-3 (MEDIUM) Dois sistemas health-check separados nao documentados — adicionada secao "CRITICAL: Two Separate Health-Check Systems" em Dev Notes explicando `core/doctor/` (INS-4.1, 12 checks) vs `core/health-check/` (HCS-2, ~30 checks, 5 dominios) e que a task deve ser REESCRITA de um para outro. 2 concerns nao-bloqueantes (LOW) delegados ao dev: skills structure, --json output format. Status: Draft → Approved. |
| 2026-02-23 | @dev (Dex) | [Implementation] All 7 tasks complete. 3 new doctor checks (skills-count, commands-count, hooks-claude-count) created. Registry updated 12→15. health-check.yaml rewritten v2→v3 (aios doctor --json). Governance map with 15 checks→Constitution articles. *doctor alias removed. core/health-check annotated. 46 unit tests passing. Status: Approved → Ready for Review. |
| 2026-02-23 | @qa (Quinn) | [QA Review] Gate PASS. Quality Score 100/100. All 7 ACs verified. 46 tests passing, zero new regressions. |
| 2026-02-23 | @devops (Gage) | [Push] Commit 40e54d5c pushed to feat/epic-nogic-code-intelligence. |
| 2026-02-23 | @po (Pax) | [Close] Story closed: Done. Commit 40e54d5c. Last story of Epic INS-4. Epic complete (9/9 stories, 33/33 pts). |
