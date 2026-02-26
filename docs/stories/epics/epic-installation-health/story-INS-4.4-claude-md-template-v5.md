# Story INS-4.4: Installer: CLAUDE.md Template v5 (4 Novas Secoes)

**Epic:** Installation Health & Environment Sync (INS-4)
**Wave:** 2 — Installer Integration (P1)
**Points:** 3
**Agents:** @dev
**Status:** Ready for Review
**Blocked By:** —
**Created:** 2026-02-23

**Executor Assignment:**
- **executor:** @dev
- **quality_gate:** @architect
- **quality_gate_tools:** [manual template review, AIOS-MANAGED marker audit, markdown-merger integration test, npm test]

---

## Story

**As a** new AIOS user or upgraded project,
**I want** my `.claude/CLAUDE.md` to include sections for Boundary (L1-L4), Rules System, Code Intelligence, and Graph Dashboard,
**so that** Claude Code agents have complete context about framework protection, available rules, code-intel status, and graph commands from the moment of installation.

### Context

The current CLAUDE.md template at `.aios-core/product/templates/ide-rules/claude-rules.md` lacks 4 sections that were added in Epics BM, NOG, and GD. The production `.claude/CLAUDE.md` was updated manually — the template never received these sections.

**Sections currently in the template:** Constitution, CLI First, Estrutura do Projeto, Sistema de Agentes, Story-Driven Development, Padroes de Codigo, Testes & Quality Gates, Convencoes Git, Otimizacao Claude Code, MCP Usage, Debug.

**Sections missing from the template (must be added):**
1. `Framework vs Project Boundary` — L1-L4 table, deny rules toggle, `<!-- FRAMEWORK-OWNED -->` marker
2. `Rules System` — reference to `.claude/rules/*.md` files (7 rules)
3. `Code Intelligence` — provider status, graceful fallback explanation
4. `Graph Dashboard` — `aios graph` usage and commands

The production CLAUDE.md already has these sections. This story updates the **template** so that fresh installs get them automatically, and updates the `markdown-merger` integration so upgrades add them to existing projects.

---

## Acceptance Criteria

### AC1: Template Updated with 4 New Sections
- [ ] `.aios-core/product/templates/ide-rules/claude-rules.md` includes all 4 new sections
- [ ] Each new section is wrapped in `<!-- AIOS-MANAGED-START: {section-id} -->` / `<!-- AIOS-MANAGED-END: {section-id} -->` markers (the merger uses these for merge decisions — NOT `FRAMEWORK-OWNED`)
- [ ] Sections are inserted in logical order within the template (after Estrutura do Projeto, before Padroes de Codigo)
- [ ] Existing sections unchanged (no regressions)

### AC2: Section Content Quality
- [ ] `Framework vs Project Boundary` section: L1-L4 table with correct paths, frameworkProtection toggle instructions, references to `.claude/settings.json`
- [ ] `Rules System` section: lists all 7 `.claude/rules/*.md` files with description of each, references `.claude/rules/` directory
- [ ] `Code Intelligence` section: explains provider status (configured/fallback/error), graceful fallback behavior, references NOG epic context
- [ ] `Graph Dashboard` section: documents `aios graph`, `aios graph --format dot`, relevant CLI commands

### AC3: Installer Applies Template on Fresh Install
- [ ] Fresh `npx aios-core install` produces `.claude/CLAUDE.md` with all 4 new sections
- [ ] Template sections use `<!-- AIOS-MANAGED-START: {id} -->` / `<!-- AIOS-MANAGED-END: {id} -->` markers so the markdown-merger can process them correctly
- [ ] The installer uses `markdown-merger` to generate CLAUDE.md from template (do not write it raw)

### AC4: Upgrade Safety
- [ ] Brownfield upgrade: if existing CLAUDE.md lacks the new sections, installer adds them (AIOS-MANAGED sections only)
- [ ] Brownfield upgrade: sections NOT wrapped in AIOS-MANAGED markers (user customizations) are preserved unchanged
- [ ] Verify with `packages/installer/src/merger/strategies/markdown-merger.js` — confirm it uses `AIOS-MANAGED-START/END` markers for merge decisions

### AC5: Regression Test Coverage
- [ ] Test: fresh install output contains all 4 new section headings
- [ ] Test: upgrade of CLAUDE.md without new sections → new sections added
- [ ] Test: upgrade of CLAUDE.md with custom content in PROJECT-CUSTOMIZED sections → custom content preserved
- [ ] `npm test` passes with zero new failures

---

## Tasks / Subtasks

### Task 1: Audit Current Template and Production CLAUDE.md (AC1)
- [x] 1.1 Read `.aios-core/product/templates/ide-rules/claude-rules.md` — list all sections and markers
- [x] 1.2 Read production `.claude/CLAUDE.md` — identify the 4 missing sections and their exact content
- [x] 1.3 Note: production CLAUDE.md sections for Boundary, Rules, Code-Intel already exist — use them as content source for template (copy-adapt)

### Task 2: Write Template Sections (AC1, AC2)
- [x] 2.1 Author `## Framework vs Project Boundary` section — L1-L4 table, paths, frameworkProtection toggle, reference to `.claude/settings.json`
- [x] 2.2 Author `## Rules System` section — list 7 rules files with 1-line description each, note that they live in `.claude/rules/`
- [x] 2.3 Author `## Code Intelligence` section — provider status table (configured/fallback/error), graceful fallback note, context7 reference
- [x] 2.4 Author `## Graph Dashboard` section — `aios graph` commands, usage examples, output formats (ascii, dot, json)
- [x] 2.5 Wrap each section with `<!-- AIOS-MANAGED-START: {section-id} -->` at the top and `<!-- AIOS-MANAGED-END: {section-id} -->` at the bottom (merger uses these markers — NOT `FRAMEWORK-OWNED`)

### Task 3: Update Template File (AC1)
- [x] 3.1 Insert 4 new sections into `.aios-core/product/templates/ide-rules/claude-rules.md` at correct position
- [x] 3.2 Verify all existing sections still present and unchanged
- [x] 3.3 Verify AIOS-MANAGED-START/END markers are applied to all framework-controlled sections; verify human-readable `<!-- FRAMEWORK-OWNED: ... -->` and `<!-- PROJECT-CUSTOMIZED: ... -->` annotations are consistent (these are for human readability only, not for merger logic)

### Task 4: Verify Installer Integration (AC3)
- [x] 4.1 Read installer flow to confirm CLAUDE.md is generated from template via markdown-merger
- [x] 4.2 If installer writes CLAUDE.md raw (without merger), update to use markdown-merger
- [x] 4.3 Verify: fresh install produces CLAUDE.md with all 4 new sections

### Task 5: Verify Upgrade Safety (AC4)
- [x] 5.1 Read `packages/installer/src/merger/strategies/markdown-merger.js` and `markdown-section-parser.js` — confirm they use `AIOS-MANAGED-START/END` markers for merge decisions (NOT `FRAMEWORK-OWNED`)
- [x] 5.2 Test upgrade scenario: simulate CLAUDE.md without new sections → run upgrade → verify 4 sections added
- [x] 5.3 Test upgrade scenario: CLAUDE.md with custom PROJECT-CUSTOMIZED section → run upgrade → verify custom content preserved

### Task 6: Tests (AC5)
- [x] 6.1 Add unit test: template has 4 new sections with AIOS-MANAGED-START/END markers
- [x] 6.2 Add integration test: fresh install CLAUDE.md contains all expected section headings
- [x] 6.3 Add test: upgrade merges new sections without destroying existing custom content
- [x] 6.4 `npm test` regression check

---

## Dev Notes

### Key Files (Read These First)

| File | Purpose |
|------|---------|
| `.aios-core/product/templates/ide-rules/claude-rules.md` | The template to update — read current content first |
| `.claude/CLAUDE.md` | Production CLAUDE.md — source ONLY for "Framework vs Project Boundary" section (other 3 sections do NOT exist here) |
| `packages/installer/src/merger/strategies/markdown-merger.js` | Merger for CLAUDE.md — understand AIOS-MANAGED-START/END marker handling |
| `packages/installer/src/installer/aios-core-installer.js` | How installer writes CLAUDE.md — verify it uses template + merger |
| `.aios-core/core/code-intel/index.js` | Reference for Code Intelligence section content (provider API, availability check) |
| `.aios-core/core/graph-dashboard/cli.js` | Reference for Graph Dashboard section content (CLI commands, formats, help text) |
| `.claude/rules/*.md` | Reference for Rules System section content (7 rule files to list) |

### Section Content Reference

**IMPORTANT:** Only 1 of the 4 sections exists in the production `.claude/CLAUDE.md`. The other 3 must be **authored from reference docs**, not copied from production.

1. **Framework vs Project Boundary** — **EXISTS in production CLAUDE.md.** Extract the L1-L4 table, frameworkProtection toggle, and `.claude/settings.json` reference directly from the existing section after "Estrutura do Projeto".

2. **Rules System** — **DOES NOT exist in production.** Author from scratch. Content: list all 7 `.claude/rules/*.md` files with 1-line description:
   - `agent-authority.md` — Agent delegation matrix and exclusive operations
   - `agent-memory-imports.md` — Agent memory lifecycle and CLAUDE.md ownership
   - `coderabbit-integration.md` — Automated code review integration rules
   - `ids-principles.md` — Incremental Development System principles
   - `mcp-usage.md` — MCP server usage rules and tool selection priority
   - `story-lifecycle.md` — Story status transitions and quality gates
   - `workflow-execution.md` — 4 primary workflows (SDC, QA Loop, Spec Pipeline, Brownfield)

3. **Code Intelligence** — **DOES NOT exist in production.** Author from reference: `.aios-core/core/code-intel/index.js` (provider interface), `.aios-core/core/doctor/checks/code-intel.js` (health check). Content: provider status table (configured/fallback/disabled), graceful fallback behavior (code-intel enrichment is optional — system works without it), `isCodeIntelAvailable()` API.

4. **Graph Dashboard** — **DOES NOT exist in production.** Author from reference: `.aios-core/core/graph-dashboard/cli.js` (handleHelp function). Content: CLI commands and examples:
   - `aios graph --deps` — Show dependency tree
   - `aios graph --deps --format=json|html|mermaid` — Output formats
   - `aios graph --deps --watch` — Live mode with auto-refresh
   - `aios graph --stats` — Entity stats and cache metrics

### AIOS-MANAGED Marker Protocol

Every template section that the framework controls must be wrapped with:
```html
<!-- AIOS-MANAGED-START: {section-id} -->
... section content ...
<!-- AIOS-MANAGED-END: {section-id} -->
```

The `markdown-merger.js` and `markdown-section-parser.js` use `AIOS-MANAGED-START/END` markers (NOT `FRAMEWORK-OWNED`) to decide whether to replace a section during upgrades. The parser explicitly matches `/^<!--\s*AIOS-MANAGED-START:\s*([a-zA-Z0-9_-]+)\s*-->/`.

**NOTE on production CLAUDE.md:** The existing `.claude/CLAUDE.md` uses `<!-- FRAMEWORK-OWNED: ... -->` comments as human-readable annotations. These are descriptive only — the merger does NOT use them for merge decisions. Templates must use `AIOS-MANAGED-START/END` for the merger to function correctly.

### Template Upgrade Policy

When the installer runs on an existing project:
- Sections wrapped in `AIOS-MANAGED-START/END` in `claude-rules.md` → overwrite matching section IDs in existing CLAUDE.md
- Sections NOT wrapped in AIOS-MANAGED markers → skip if section exists in target CLAUDE.md (user customizations preserved)
- New AIOS-MANAGED sections in template not present in target → added

### Testing

**Test Location:** `packages/installer/tests/`

**Key Scenarios:**
1. Template has exactly 4 new headings with AIOS-MANAGED-START/END markers
2. Fresh install: CLAUDE.md output contains `## Framework vs Project Boundary`, `## Rules System`, `## Code Intelligence`, `## Graph Dashboard`
3. Upgrade: missing sections added; existing PROJECT-CUSTOMIZED content preserved

---

## CodeRabbit Integration

**Story Type:** Architecture (template update) + Integration (installer)
**Complexity:** Medium (template authoring + installer integration + upgrade safety)

**Quality Gates:**
- [ ] Pre-Commit (@dev): Run before marking story complete
- [ ] Pre-PR (@architect): Template completeness and AIOS-MANAGED marker consistency review

**Self-Healing Configuration:**
- **Mode:** light
- **Max Iterations:** 2
- **Timeout:** 15 minutes
- **Severity Filter:** CRITICAL only

**Predicted Behavior:**
- CRITICAL issues: auto_fix (up to 2 iterations)
- HIGH issues: document_only

**Focus Areas (Primary):**
- AIOS-MANAGED-START/END markers: correctly applied to all 4 new sections in template (NOT FRAMEWORK-OWNED)
- Upgrade safety: sections without AIOS-MANAGED markers (user customizations) never overwritten

**Focus Areas (Secondary):**
- Section content accuracy: paths, commands, file names match actual project structure
- Template version: increment template version comment if present

---

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Debug Log References
- No debug issues encountered during implementation

### Completion Notes
- Template updated: 4 new AIOS-MANAGED sections added (framework-boundary, rules-system, code-intelligence, graph-dashboard)
- Template now has 9 AIOS-MANAGED sections total (5 original + 4 new)
- Sections inserted after `framework-structure`, before `## Workflow Execution`
- Content authored from: production CLAUDE.md (boundary), .claude/rules/*.md (rules-system), .aios-core/core/code-intel/index.js (code-intelligence), .aios-core/core/graph-dashboard/cli.js (graph-dashboard)
- Installer integration verified: ide-configs.js maps template, strategies/index.js registers MarkdownMerger — no code changes needed
- Upgrade safety verified: markdown-section-parser.js uses AIOS-MANAGED-START/END regex, merger adds new sections and preserves user content
- 15 tests created covering all 5 ACs — all pass
- Regression: 279 suites pass, 14 fail (all pre-existing), zero new failures

### File List

| File | Action | Notes |
|------|--------|-------|
| `.aios-core/product/templates/ide-rules/claude-rules.md` | Modified | 4 new AIOS-MANAGED sections added (framework-boundary, rules-system, code-intelligence, graph-dashboard) |
| `packages/installer/tests/unit/claude-md-template-v5/claude-md-template-v5.test.js` | Created | 15 tests for template v5 (sections, content quality, upgrade safety, section order) |
| `docs/stories/epics/epic-installation-health/story-INS-4.4-claude-md-template-v5.md` | Modified | Task checkboxes, Dev Agent Record |

---

## QA Results

**Reviewer:** @qa (Quinn) | **Date:** 2026-02-23 | **Model:** Claude Opus 4.6

### Gate Decision: PASS (with 1 CONCERN)

### AC Verification

| AC | Status | Evidence |
|----|--------|----------|
| AC1: Template Updated | PASS | 4 new AIOS-MANAGED sections present (framework-boundary, rules-system, code-intelligence, graph-dashboard). 9 START/END marker pairs verified. Sections inserted after framework-structure (line 66), before Workflow Execution (line 144). Original 5 sections unchanged. |
| AC2: Section Content Quality | PASS | framework-boundary: L1-L4 table with correct paths, frameworkProtection toggle, settings.json ref. rules-system: all 7 specified rule files listed with descriptions. code-intelligence: 3-state provider table (Configured/Fallback/Disabled), isCodeIntelAvailable() API, aios doctor ref. graph-dashboard: 8 CLI command examples, 5 output formats, --watch mode. |
| AC3: Installer Integration | PASS | Verified ide-configs.js maps `ide-rules/claude-rules.md` to `.claude/CLAUDE.md`. strategies/index.js registers MarkdownMerger for .md files. No code changes needed — installer already uses markdown-merger pipeline. |
| AC4: Upgrade Safety | PASS | markdown-section-parser.js regex `/^<!--\s*AIOS-MANAGED-START:\s*([a-zA-Z0-9_-]+)\s*-->$/` confirmed. Merger adds new AIOS-MANAGED sections, overwrites existing ones, preserves non-managed user content. Tested via 2 upgrade scenario tests. |
| AC5: Regression Tests | PASS | 15 tests created: 6 marker presence, 4 content quality, 2 existing sections preservation, 2 upgrade scenarios, 1 section order. All 15 pass. Regression: zero new failures. |

### Test Execution

```
PASS packages/installer/tests/unit/claude-md-template-v5/claude-md-template-v5.test.js
  15 tests, 15 passed, 0 failed
```

### Marker Integrity Audit

| Section ID | START Line | END Line | Paired |
|------------|-----------|----------|--------|
| core-framework | 5 | 9 | YES |
| agent-system | 11 | 24 | YES |
| framework-structure | 48 | 66 | YES |
| framework-boundary | 68 | 83 | YES |
| rules-system | 85 | 101 | YES |
| code-intelligence | 103 | 119 | YES |
| graph-dashboard | 121 | 142 | YES |
| aios-patterns | 197 | 221 | YES |
| common-commands | 236 | 250 | YES |

All 9 pairs matched. No orphan markers.

### Concern (LOW — does not block)

**CONCERN-1: `agent-handoff.md` not listed in Rules System section**
- `.claude/rules/` contains 8 files on disk, but template lists 7
- The 8th file `agent-handoff.md` (Agent Handoff Protocol) is not in the template's rules-system table
- **Mitigation:** Story spec (Dev Notes line 129-136) explicitly lists 7 rules. `agent-handoff.md` was added later (possibly by another story). This is not a defect in INS-4.4 — it's a follow-up item for the next template revision
- **Recommendation:** Create follow-up tech debt to update rules-system section when next template revision occurs

### Risk Assessment
- **Upgrade risk:** LOW — merger behavior is well-tested, markers are correctly paired
- **Regression risk:** NONE — no existing code modified, only template content added
- **Content accuracy risk:** LOW — content sourced from actual reference files (code-intel/index.js, graph-dashboard/cli.js, .claude/rules/*.md)

---

## Change Log

| Date | Author | Change |
|------|--------|--------|
| 2026-02-23 | @sm (River) | Story drafted from Epic INS-4 handoff secao 3.4 + Codex recommendation (reusar markdown-merger, FRAMEWORK-OWNED markers) |
| 2026-02-23 | @sm (River) | [Codex Story Review] Markers corrigidos: merger usa `AIOS-MANAGED-START/END` (NAO `FRAMEWORK-OWNED`). AC1, AC3, AC4, Task 2.5, Task 5.1, Dev Notes "FRAMEWORK-OWNED Marker Protocol" e "Template Upgrade Policy" atualizados para AIOS-MANAGED protocol. Dev Note adicionada explicando que producao CLAUDE.md usa FRAMEWORK-OWNED como comentarios descritivos, mas o merger so entende AIOS-MANAGED-START/END. |
| 2026-02-23 | @po (Pax) | [Re-validation] All 3 fixes verified (CRITICAL-1, CRITICAL-2, SHOULD-FIX-3). Section Content Reference now accurate, Key Files expanded with 3 documentary refs, Testing markers corrected. Score: 9/10, Confidence: High. Status: Draft → Approved. |
| 2026-02-23 | @sm (River) | [PO Validation Fix] 3 issues corrigidos: (1) CRITICAL-1: Section Content Reference reescrita — producao CLAUDE.md so tem "Framework vs Project Boundary", outras 3 secoes NAO existem e devem ser authored de refs documentais (code-intel/index.js, graph-dashboard/cli.js, .claude/rules/*.md); (2) CRITICAL-2: Key Files table atualizada — producao e source de apenas 1 secao, 3 refs documentais adicionadas; (3) SHOULD-FIX-3: Testing scenario 1 corrigido "FRAMEWORK-OWNED markers" → "AIOS-MANAGED-START/END markers". |
| 2026-02-23 | @dev (Dex) | Implementation complete: 4 AIOS-MANAGED sections added to template (9 total), 15 tests created and passing, installer integration verified (no code changes needed), upgrade safety confirmed. Status: Approved → Ready for Review. |
