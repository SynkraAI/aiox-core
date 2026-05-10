# PRO-14.5 Legacy Slash-Command Shim Retirement Gate

Story: `STORY-PRO-14.5`
Date: 2026-05-09
Repo: `aiox-core`
Status: implementation gate

## Purpose

This document defines the retirement gate for legacy AIOS-era slash-command shims and `aios-*` skill aliases. It does not authorize deletion. It makes deletion possible later only after generated surfaces prove canonical AIOX skills are unique, validation blocks duplicate payloads, supported IDE projections pass, and the compatibility window is approved.

## Inventory

| Surface | Current classification | Evidence | Retirement posture |
|---|---|---|---|
| `.aiox-core/infrastructure/scripts/codex-skills-sync/index.js` | canonical payload generator + legacy id normalizer | Generates `aiox-*` skill ids and now normalizes `aios-*` inputs to `aiox-*`. | Keep. This is the source of canonical Codex skill ids. |
| `.aiox-core/infrastructure/scripts/codex-skills-sync/validate.js` | strict validator + legacy alias detector | Strict mode reports legacy aliases, rejects full duplicate payloads and rejects duplicate orphaned canonical payloads. | Keep as blocking gate before any alias removal. |
| `.codex/skills/` | generated projection | Observed 13 `aiox-*` skill dirs and 0 `aios-*` dirs in this worktree. | Canonical projection. Regenerate with `npm run sync:skills:codex`. |
| `.claude/commands/AIOX/agents/*.md` | legacy slash-command shims | 12 command files contain `ACORE-CLAUDE-AGENT-COMMAND: legacy-shim` and redirect to `.claude/skills/AIOX/agents/*/SKILL.md`. | Keep until usage cutoff or telemetry evidence approves removal. |
| `.claude/skills/AIOX/agents/*/SKILL.md` | canonical Claude skill payloads | 12 skill dirs observed. | Canonical Claude activation payloads. |
| `.claude/skills/AIOX/agents/aiox-master/SKILL.md` | canonical payload with current double-prefix frontmatter | Current generated frontmatter contains `name: aiox-aiox-master`. | Classify as existing contract; do not change without a separate focused compatibility story. |
| `.aiox-core/infrastructure/scripts/ide-sync/transformers/kimi.js` | canonical Kimi generator + legacy id normalizer | `aios-*` preferred aliases normalize to `aiox-*`; tests cover this. | Keep. |
| `.kimi/skills/` | generated projection | Observed 12 `aiox-*` skill dirs and 0 `aios-*` dirs. | Canonical projection. |
| `.aiox-core/infrastructure/scripts/ide-sync/gemini-commands.js` | canonical Gemini command generator | Generates `aiox-{slug}.toml` and `aiox-menu.toml`. | Keep. |
| `.gemini/commands/` | generated projection | Observed 13 `aiox-*` command files, including `aiox-menu.toml`, and 0 `aios-*` files. | Canonical projection. |
| `sinkra-hub/apps/gateway-ai/hooks/aios-command` | external legacy consumer | Existing package/hook name and logs still use `aios-command`. | Do not change in this story; open an owning-repo story before migration. |

## Blocking Rules

Strict Codex skill validation must fail when any of these conditions appears:

- a legacy `aios-*` directory contains a full activation payload instead of a classified redirect;
- an orphaned canonical `aiox-*` directory duplicates the full payload of a known source agent;
- an unexpected `aiox-*` generated skill directory is orphaned from source agents, unless it is an explicitly detected generated squad skill.

Strict validation may pass with an intentional legacy alias only when the alias is a thin redirect with the exact `AIOX-CODEX-LEGACY-ALIAS: redirect` marker and an explicit canonical redirect sentence. Any extra non-redirect content is fatal. Passing aliases are still reported as warnings so the migration remains visible.

## Removal Criteria

Legacy slash-command shims or `aios-*` alias dirs may only be removed after all criteria below are true:

1. `npm run sync:skills:codex` produces no unexpected generated diff.
2. `npm run validate:codex-skills:self-test` passes.
3. `npm run validate:codex-sync` and `npm run validate:codex-integration` pass.
4. `npm run sync:ide:check` passes for enabled IDE targets.
5. `npm run validate:gemini-sync` and `npm run validate:gemini-integration` pass.
6. The generated-surface inventory shows one canonical payload per supported agent per IDE surface.
7. Legacy shim usage is either measured as zero for one full minor release or covered by a documented support cutoff.
8. `@architect`, `@qa` and `@po` approve the removal story before deletion.

## Compatibility Window

Default window: keep legacy command shims and legacy alias recognition for at least one full minor release after this validation gate lands. If no telemetry exists for a specific shim surface, the removal story must provide a dated support cutoff and rollback plan before deletion.

## Validation Evidence

Validated on 2026-05-09 from branch `feat/pro-14-5-legacy-shim-retirement`:

| Command | Result | Notes |
|---|---|---|
| `npm ci` | Pass | Installed dependencies cleanly; transient executable mode drift from install was reverted before commit. |
| `npm run sync:skills:codex` | Pass | Generated 12 Codex skills. |
| `npm run validate:codex-skills:self-test` | Pass | 12 skills checked; 12 self-tests passed. |
| `npm run validate:codex-sync` | Pass | expected 12, synced 12, missing 0, drift 0, orphaned 0. |
| `npm run validate:codex-integration` | Pass with warning | Warns that generated squad skill `aiox-claude-mastery-chief` makes Codex skill count 13/12; existing known generated extra, not a duplicate legacy payload. |
| `npm run sync:ide:check` | Pass | expected 109, synced 109, missing 0, drift 0, orphaned 0. |
| `npm run validate:gemini-sync` | Pass | expected 25, synced 25, missing 0, drift 0, orphaned 0. |
| `npm run validate:gemini-integration` | Pass with warning | Warns `.gemini/rules.md` is not present; existing integration warning. |
| `npm run lint` | Pass | Re-run after full tests released temporary fixture state. |
| `npm run typecheck` | Pass | No TypeScript errors. |
| `npm test -- --runInBand --forceExit` | Pass | 341 suites passed, 12 skipped; 8433 tests passed, 172 skipped. `--forceExit` used because the exact command kept open handles after completion. |
| `npm run build` | Unavailable | Package has no `build` script; `npm run validate:publish` was run as the package publication gate instead. |
| `npm run validate:publish` | Pass | Package contents, dependency completeness and publish safety gate passed. |
| `git diff --check` | Pass | No whitespace errors. |
| `rg -n 'aios-\|aiox-\|slash-command\|aios-command\|legacy-shim' .aiox-core .claude .codex .gemini .kimi packages tests docs -S` | Pass | Inventory command completed; expected references are documented above. |

## Rollback

If removal later breaks activation, rollback is:

1. Restore `.claude/commands/AIOX/agents/*.md` from the previous generator output or git history.
2. Restore any removed legacy `aios-*` alias dirs as thin redirects, not full duplicated payloads.
3. Run `npm run sync:skills:codex`.
4. Run `npm run sync:ide`.
5. Run all validation commands listed in the removal story.
6. Publish a patch release only after validation passes.
