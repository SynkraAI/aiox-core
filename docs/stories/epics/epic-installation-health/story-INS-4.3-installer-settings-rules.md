# Story INS-4.3: Installer: Full Artifact Copy Pipeline (Settings + Skills + Commands + Hooks)

**Epic:** Installation Health & Environment Sync (INS-4)
**Wave:** 2 — Installer Integration (P1)
**Points:** 5
**Agents:** @dev
**Status:** Approved
**Blocked By:** — (INS-4.2 Done — commit 4a8d9f9e)
**Created:** 2026-02-23

**Executor Assignment:**
- **executor:** @dev
- **quality_gate:** @devops
- **quality_gate_tools:** [aios doctor --json after fresh install, skills count validation, commands count validation, hooks registration check, npm test]

---

## Story

**As a** new user running `npx aios-core install`,
**I want** the installer to automatically generate `.claude/settings.json` boundary rules, copy all 7 skills, ~11 extra commands, and 2 JS hooks, and register hooks in `settings.local.json`,
**so that** every fresh install has complete Claude Code integration — boundary protection, skills, commands, hooks — without any manual post-install steps.

### Context

**What is already done (Codex Finding A2):**
- `packages/installer/src/wizard/ide-config-generator.js` lines 286 and 530 already copy `.claude/rules/*.md` files
- Lines 539-548 already copy **both JS hooks** (`synapse-engine.cjs` + `precompact-session-digest.cjs`) to `.claude/hooks/` via `HOOKS_TO_COPY` whitelist (line 678) — NOT git hooks to `.husky/`
- Line 550 and 711 create `.claude/settings.local.json` (but only register `synapse-engine` hook — `precompact-session-digest` is NOT registered)
- `copyAgentFiles()` copies 12 agents to `.claude/commands/AIOS/agents/`

**What is NOT done (Gaps #1, #11, #12, #13 from handoff v2):**
- **Gap #1:** Installer does NOT call `generate-settings-json.js` for `permissions.deny/allow`
- **Gap #11 (CRITICO):** 7 skills exist at `.claude/skills/` but ZERO are copied. `ide-config-generator.js` has zero references to "skill"
- **Gap #12 (ALTO):** ~11 extra commands (synapse/, greet.md, stories/) exist but only agent commands are copied
- **Gap #13 (ALTO):** Both JS hooks ARE copied (line 678 whitelist), but `settings.local.json` only registers `synapse-engine` (line 712). `precompact-session-digest` is copied but NOT registered.

**This story covers the complete artifact copy pipeline:**
1. Wire the INS-4.2 generator into the wizard flow (settings.json)
2. Add skills copy pipeline (7 skills → `.claude/skills/`)
3. Add extra commands copy pipeline (~11 files → `.claude/commands/`)
4. Fix hooks registration: `settings.local.json` must register ALL copied JS hooks (not just synapse-engine)
5. Hooks copy already works (both .cjs files in whitelist) — no copy fix needed, only registration fix
6. Add post-install validation for all new artifacts
7. Update install summary to report all artifact counts

**PM Decision (v4):** INS-4.9 (Skills+Commands Copy) absorvida nesta story. Mesmo fluxo, mesmo arquivo (`ide-config-generator.js`). Sizing: 2→5 pts.

---

## Acceptance Criteria

### AC1: Settings.json Generator Wired into Installer
- [ ] `packages/installer/src/wizard/index.js` calls `generate-settings-json.js` after `.aios-core/` is copied
- [ ] Call happens before post-install validation so validator can check the result
- [ ] Generator is called with correct `projectRoot` (the target installation directory, not the source)
- [ ] If generator throws, installer logs warning but does NOT abort installation (graceful degradation)

### AC2: Skills Copy Pipeline (Gap #11)
- [ ] Installer copies all directories from source `.claude/skills/` to target `.claude/skills/` recursively
- [ ] Each skill directory contains at minimum a `SKILL.md` file
- [ ] After install, 7 skills present: `architect-first`, `checklist-runner`, `coderabbit-review`, `mcp-builder`, `skill-creator`, `synapse`, `tech-search`
- [ ] Copy is idempotent (re-install does not duplicate or corrupt existing skills)
- [ ] If skills source directory does not exist, log INFO and continue (not all AIOS versions have skills)

### AC3: Extra Commands Copy Pipeline (Gap #12)
- [ ] Installer copies all `.md` files from source `.claude/commands/` to target `.claude/commands/` recursively
- [ ] EXCLUDES `AIOS/agents/` subdirectory (already copied by existing `copyAgentFiles()`)
- [ ] After install, extra commands present: `greet.md`, `synapse/manager.md`, `synapse/tasks/*.md` (7 files), `synapse/utils/*.md` (1 file), `AIOS/stories/*.md`
- [ ] Copy preserves directory structure (e.g., `synapse/tasks/add-rule.md`)
- [ ] Copy is idempotent

### AC4: Hooks Registration Fix (Gap #13)
- [ ] After install, at minimum 2 JS hooks present: `synapse-engine.cjs`, `precompact-session-digest.cjs` (copy already works via `HOOKS_TO_COPY` whitelist at line 678)
- [ ] `settings.local.json` registers ALL copied JS hooks (not just synapse-engine — currently `createClaudeSettingsLocal` at line 710 only registers synapse-engine)
- [ ] Hook registration uses correct Claude Code format in `settings.local.json` (nested `{ hooks: [{ type, command }] }` per event)
- [ ] Registration iterates over all `.cjs` files in `.claude/hooks/` instead of hardcoding one hook

### AC5: Post-Install Validator Updated
- [ ] `post-install-validator.js` validates `.claude/settings.json` has `permissions.deny` array with at least 1 entry when `frameworkProtection: true`
- [ ] Validator checks skills count (>=7 directories in `.claude/skills/`)
- [ ] Validator checks commands count (>=20 `.md` files in `.claude/commands/` total)
- [ ] Validator checks hooks JS count (>=2 `.cjs` files in `.claude/hooks/`)
- [ ] All validation failures reported as WARN (not ERROR)

### AC6: Install Summary Reports All Artifact Counts
- [ ] Install summary includes: `settings.json: generated (N deny rules)`
- [ ] Install summary includes: `skills: N copied`
- [ ] Install summary includes: `commands: N copied (M agents + K extras)`
- [ ] Install summary includes: `hooks: N JS hooks registered`
- [ ] On failure, each line shows failure message with `aios doctor --fix` suggestion

### AC7: Regression Test Coverage
- [ ] Existing wizard tests in `packages/installer/tests/` still pass
- [ ] Test: skills copy — mock source with 3 skills, verify all copied to target
- [ ] Test: commands copy — verify AIOS/agents/ excluded, extras included
- [ ] Test: hooks copy — verify all .cjs files copied + registered in settings.local.json
- [ ] Test: generator failure → install continues
- [ ] `npm test` passes with zero new failures

---

## Tasks / Subtasks

### Task 1: Read Existing Wizard Flow (AC1)
- [ ] 1.1 Read `packages/installer/src/wizard/index.js` — identify the step after `.aios-core/` copy where generator call should be inserted
- [ ] 1.2 Read `packages/installer/src/installer/aios-core-installer.js` — understand how `.aios-core/` copy is orchestrated
- [ ] 1.3 Read `packages/installer/src/wizard/ide-config-generator.js` — understand existing copy functions: `copyAgentFiles()` (line ~286), hooks copy (line ~539), settings.local.json (line ~550)
- [ ] 1.4 Identify insertion points for: (a) generator call, (b) skills copy, (c) commands copy, (d) hooks fix

### Task 2: Wire Settings.json Generator (AC1)
- [ ] 2.1 Add `require` for `generate-settings-json.js` at top of wizard `index.js`
- [ ] 2.2 Insert generator call at identified hook point: `await generator.generate(targetProjectRoot, config)`
- [ ] 2.3 Wrap call in try/catch: log warning on error, continue install
- [ ] 2.4 Pass correct `targetProjectRoot` (the directory being installed into)

### Task 3: Implement Skills Copy Pipeline (AC2)
- [ ] 3.1 In `ide-config-generator.js`, add `copySkillFiles(sourceRoot, targetRoot)` function
- [ ] 3.2 Copy recursively: source `.claude/skills/*/` → target `.claude/skills/*/`
- [ ] 3.3 Verify each skill directory has `SKILL.md`
- [ ] 3.4 Log count: `Skills: 7 copied` or `Skills: source not found (skipped)`
- [ ] 3.5 Handle idempotency: overwrite existing files, preserve user additions

### Task 4: Implement Extra Commands Copy Pipeline (AC3)
- [ ] 4.1 In `ide-config-generator.js`, add `copyExtraCommandFiles(sourceRoot, targetRoot)` function
- [ ] 4.2 Copy recursively: source `.claude/commands/` → target `.claude/commands/`
- [ ] 4.3 EXCLUDE `AIOS/agents/` subdirectory (already handled by `copyAgentFiles()`)
- [ ] 4.4 Preserve directory structure: `synapse/tasks/`, `synapse/utils/`, `AIOS/stories/`
- [ ] 4.5 Log count: `Commands: 11 extras copied`

### Task 5: Fix Hooks Registration (AC4)
- [ ] 5.1 Verify hooks copy works (both .cjs already in `HOOKS_TO_COPY` whitelist at line 678 — no copy change needed)
- [ ] 5.2 Update `createClaudeSettingsLocal()` (line 710) to iterate ALL `.cjs` files in `.claude/hooks/` instead of hardcoding `synapse-engine.cjs` only (line 712)
- [ ] 5.3 Register each hook with correct Claude Code nested format (`{ hooks: [{ type, command }] }`) and Windows path workaround
- [ ] 5.4 Verify `settings.local.json` after install contains entries for BOTH `synapse-engine.cjs` AND `precompact-session-digest.cjs`

### Task 6: Update Post-Install Validator (AC5)
- [ ] 6.1 Read `packages/installer/src/installer/post-install-validator.js`
- [ ] 6.2 Add check: `settings.json` has `permissions.deny` array non-empty (when frameworkProtection: true)
- [ ] 6.3 Add check: skills count >= 7 (count directories in `.claude/skills/`)
- [ ] 6.4 Add check: commands count >= 20 (count .md files in `.claude/commands/`)
- [ ] 6.5 Add check: hooks JS count >= 2 (count .cjs files in `.claude/hooks/`)
- [ ] 6.6 All checks report WARN (not ERROR)

### Task 7: Update Install Summary (AC6)
- [ ] 7.1 Add settings.json status line to install summary
- [ ] 7.2 Add skills count line
- [ ] 7.3 Add commands count line (agents + extras breakdown)
- [ ] 7.4 Add hooks registration count line

### Task 8: Tests (AC7)
- [ ] 8.1 Unit test: skills copy — mock source with skills, verify all copied
- [ ] 8.2 Unit test: commands copy — verify AIOS/agents/ excluded, extras included
- [ ] 8.3 Unit test: hooks copy — verify all .cjs copied + registered
- [ ] 8.4 Unit test: generator failure → install continues
- [ ] 8.5 Unit test: post-install validator checks new artifact counts
- [ ] 8.6 Run existing `packages/installer/tests/` — verify all pass
- [ ] 8.7 `npm test` regression check

---

## Dev Notes

### What Is Already Implemented (Do Not Re-implement)

Codex analysis confirmed `ide-config-generator.js` already handles:
- **Rules files copy** (lines 286, 530): `.claude/rules/*.md` from source to target
- **Agent commands copy** (`copyAgentFiles()`): 12 agents to `.claude/commands/AIOS/agents/`
- **One Claude Code hook copy** (lines 539-548): copies `synapse-engine.cjs` to `.claude/hooks/`
- **settings.local.json** (lines 550, 711): registers synapse-engine hook only

### What This Story Adds

| Artifact | Count | Source | Target |
|----------|-------|--------|--------|
| settings.json (boundary) | 1 | generated | `.claude/settings.json` |
| Skills | 7 | `.claude/skills/*/` | `.claude/skills/*/` |
| Extra commands | ~11 | `.claude/commands/` (excl agents) | `.claude/commands/` |
| Hooks registration fix | 0 new copies | Both hooks already copied (line 678) | `.claude/settings.local.json` registration for ALL hooks |
| settings.local.json update | 1 | generated (register all .cjs hooks) | `.claude/settings.local.json` |

### Key Files (Read These First)

| File | Lines | Purpose |
|------|-------|---------|
| `packages/installer/src/wizard/index.js` | full (861) | Add generator call here — find post-copy hook point |
| `packages/installer/src/installer/aios-core-installer.js` | full (426) | How `.aios-core/` is copied — find injection point |
| `packages/installer/src/installer/post-install-validator.js` | full (1522) | Add artifact count checks here |
| `packages/installer/src/wizard/ide-config-generator.js` | full | **PRIMARY** — add `copySkillFiles()`, `copyExtraCommandFiles()`, fix hooks copy |
| `packages/installer/src/config/ide-configs.js` | metadata | Add `skillsFolder`, `commandsFolder` metadata if needed |

### Skills Inventory (7 skills — Gap #11)

| Skill | Path | SKILL.md |
|-------|------|----------|
| architect-first | `.claude/skills/architect-first/SKILL.md` | Workflow architect-first |
| checklist-runner | `.claude/skills/checklist-runner/SKILL.md` | Engine de checklists |
| coderabbit-review | `.claude/skills/coderabbit-review/SKILL.md` | Code review WSL |
| mcp-builder | `.claude/skills/mcp-builder/SKILL.md` | Criacao de MCP servers |
| skill-creator | `.claude/skills/skill-creator/SKILL.md` | Meta-skill: cria skills |
| synapse | `.claude/skills/synapse/SKILL.md` | SYNAPSE context engine |
| tech-search | `.claude/skills/tech-search/SKILL.md` | Deep research pipeline |

### Extra Commands Inventory (~11 files — Gap #12)

| Command | Path |
|---------|------|
| greet.md | `.claude/commands/greet.md` |
| synapse/manager.md | `.claude/commands/synapse/manager.md` |
| synapse/tasks/add-rule.md | `.claude/commands/synapse/tasks/` |
| synapse/tasks/create-command.md | `.claude/commands/synapse/tasks/` |
| synapse/tasks/create-domain.md | `.claude/commands/synapse/tasks/` |
| synapse/tasks/diagnose-synapse.md | `.claude/commands/synapse/tasks/` |
| synapse/tasks/edit-rule.md | `.claude/commands/synapse/tasks/` |
| synapse/tasks/suggest-domain.md | `.claude/commands/synapse/tasks/` |
| synapse/tasks/toggle-domain.md | `.claude/commands/synapse/tasks/` |
| synapse/utils/manifest-parser-reference.md | `.claude/commands/synapse/utils/` |
| AIOS/stories/*.md | `.claude/commands/AIOS/stories/` |

**IMPORTANT:** Exclude `.claude/commands/AIOS/agents/` — already copied by `copyAgentFiles()`.

### Generator Integration Pattern

```javascript
// In wizard/index.js (after .aios-core/ copy step)
const settingsGenerator = require('../../../.aios-core/infrastructure/scripts/generate-settings-json');
try {
  await settingsGenerator.generate(targetProjectRoot);
  log.success('settings.json boundary rules generated');
} catch (err) {
  log.warn(`settings.json generation failed: ${err.message} — run 'aios doctor --fix' post-install`);
}
```

### Skills Copy Pattern

```javascript
// In ide-config-generator.js — new function
function copySkillFiles(sourceRoot, targetRoot) {
  const sourceSkills = path.join(sourceRoot, '.claude', 'skills');
  const targetSkills = path.join(targetRoot, '.claude', 'skills');
  if (!fs.existsSync(sourceSkills)) return { count: 0, skipped: true };

  const skillDirs = fs.readdirSync(sourceSkills, { withFileTypes: true })
    .filter(d => d.isDirectory());

  for (const dir of skillDirs) {
    copyRecursive(path.join(sourceSkills, dir.name), path.join(targetSkills, dir.name));
  }
  return { count: skillDirs.length, skipped: false };
}
```

### Hooks Registration Pattern

Current code at `createClaudeSettingsLocal()` (line 710) hardcodes `synapse-engine.cjs` only. Fix:

```javascript
// In createClaudeSettingsLocal() — replace single-hook with dynamic registration
const hooksDir = path.join(projectRoot, '.claude', 'hooks');
const hookFiles = (await fs.readdir(hooksDir)).filter(f => f.endsWith('.cjs'));

for (const hookFile of hookFiles) {
  const hookPath = path.join(hooksDir, hookFile);
  const isWindows = process.platform === 'win32';
  const hookCommand = isWindows
    ? `node "${hookPath.replace(/\\/g, '\\\\')}"`
    : `node "$CLAUDE_PROJECT_DIR/.claude/hooks/${hookFile}"`;
  // Add { type: 'command', command: hookCommand, timeout: 10 } to settings.local.json
}
```

**Key insight:** `copyClaudeHooksFolder()` (line 661) already copies both hooks via whitelist. The bug is ONLY in `createClaudeSettingsLocal()` which hardcodes `synapse-engine.cjs` at line 712.

### PM Decision: Hooks Python/Shell

Per PM v4 decision: **only JS (.cjs) hooks are copied**. Python/Shell hooks are NOT installed.
Future: `write-path-validation.py` and `read-protection.py` will be converted to CJS in a separate effort.

### Testing

**Test Location:** `packages/installer/tests/unit/` and `packages/installer/tests/integration/`

**Key Scenarios:**
1. Fresh install: all artifacts copied → post-install validator PASS on all counts
2. Generator fails: install continues → WARN
3. Skills source missing: INFO logged, install continues
4. Commands copy excludes AIOS/agents/
5. All .cjs hooks copied + registered in settings.local.json
6. Existing tests still pass

---

## CodeRabbit Integration

**Story Type:** Integration (full artifact copy pipeline into installer)
**Complexity:** Medium (5 pts — settings generator wiring + skills copy + commands copy + hooks fix + validation)

**Quality Gates:**
- [ ] Pre-Commit (@dev): Run before marking story complete
- [ ] Pre-PR (@devops): Install flow safety check

**Self-Healing Configuration:**
- **Mode:** light
- **Max Iterations:** 2
- **Timeout:** 15 minutes
- **Severity Filter:** CRITICAL only

**Predicted Behavior:**
- CRITICAL issues: auto_fix (up to 2 iterations)
- HIGH issues: document_only

**Focus Areas (Primary):**
- Install flow safety: any copy failure must NOT abort installation
- Correct `targetProjectRoot` passed (not source directory)
- Skills copy: recursive directory copy preserves SKILL.md structure
- Commands copy: AIOS/agents/ exclusion to prevent duplication

**Focus Areas (Secondary):**
- Hooks registration: settings.local.json has ALL .cjs hooks
- Post-install validator: WARN (not ERROR) for artifact count issues
- Idempotency: re-install does not corrupt existing artifacts

---

## Dev Agent Record

### Agent Model Used
_To be filled by @dev_

### Debug Log References
_To be filled by @dev_

### Completion Notes
_To be filled by @dev_

### File List
_To be filled by @dev_

---

## QA Results
_To be filled by @qa_

---

## Change Log

| Date | Author | Change |
|------|--------|--------|
| 2026-02-23 | @sm (River) | Story drafted from Epic INS-4 handoff secao 3.3 + Codex Finding A2 (rules JA copiadas, reescopar para wiring only, sizing 3→2 pts) |
| 2026-02-23 | @sm (River) | [Codex Story Review] Narrativa de hooks corrigida: linhas 539-548 copiam Claude Code hooks para `.claude/hooks/` (SYNAPSE engine), NAO git hooks para `.husky/`. Context e Dev Notes atualizados. |
| 2026-02-23 | @sm (River) | [PM v4 — DevOps Handoff v2] Escopo expandido massivamente. INS-4.9 absorvida. Gaps #11 (skills), #12 (commands), #13 (hooks) incorporados. Titulo: "Wire Generator" → "Full Artifact Copy Pipeline". 7 ACs (era 4). 8 Tasks (era 5). Skills inventory (7), commands inventory (~11), hooks fix. Sizing: 2→5 pts. PM decision: only JS hooks, no Py/Sh. |
| 2026-02-23 | @po (Pax) | [Validation Fix] Gap #13 corrigido: hooks copy JA funciona (whitelist linha 678 tem ambos .cjs). Bug real e na registration — `createClaudeSettingsLocal()` hardcoda `synapse-engine.cjs` apenas (linha 712). AC4 e Task 5 reescritos para focar em registration fix, nao copy fix. Line refs verificados e corretos. Status: Draft -> Approved. |
