---
id: release-management
name: Manage Software Releases
agent: github-devops
category: devops
complexity: high
tools:
  - github-cli # Create releases, tags, manage artifacts
  - semantic-release # Automate versioning and changelog
checklists:
  - github-devops-checklist.md
---

# Manage Software Releases

> **AUTHORITATIVE SOURCE:** [`docs/guides/release-procedure.md`](../../../docs/guides/release-procedure.md)
>
> This task wraps the canonical release SOP. **Open it first**, follow its checklist top-to-bottom. The SOP captures pre-flight checks, 4-site version bump coordination, branch protection bypass dance (modern ruleset + legacy branch protection — both must be relaxed and restored atomically with `trap EXIT` + sanitized payloads), tag-driven npm publish trigger, post-publish verification, known CI quirks, and rollback steps.
>
> This shorter task remains because some agent workflows still reference the `release-management` id, but the content of record lives in the SOP. **Do not duplicate the procedure here** — that creates drift between two sources of truth.

## When this task fires

- `@devops` is asked to cut a new release (any package or coordinated set)
- Hotfix release after an incident
- Periodic minor/major release planning

## Scope split with `publish-npm` task

| Task | When to use |
|---|---|
| `release-management` (this file) | Full release lifecycle: planning a version, coordinating changelog, deciding bump type, creating the release narrative, follow-ups across multiple packages |
| `publish-npm` | Tactical npm-only publish step inside the broader release (also wraps the same SOP) |

Both delegate to the same `docs/guides/release-procedure.md`. The split is preserved so different `@devops` workflows can pick the right entry point semantically.

## TL;DR (full detail in the SOP)

1. **Decide bump type** by inspecting commits since the last tag (`git log v<last>..HEAD --oneline`). Patch for bug fixes only. Minor for additive features. Major for breaking changes (rare for `@aiox-squads/core`).
2. **Pre-flight:** lint, full test suite, registry tokens fresh (`gh secret list -R SynkraAI/aiox-core` — `NPM_TOKEN_AIOX_SQUADS` and `NPM_TOKEN`).
3. **Coordinate version across 4 sites** (root `package.json`, `compat/aiox-core/package.json` and its `@aiox-squads/core` dep, `packages/installer/package.json`, refresh `package-lock.json`) + `CHANGELOG.md` entry under `## [X.Y.Z] - YYYY-MM-DD` (Keep-a-Changelog).
4. **Branch + PR + bypass + merge** following the SOP's atomic block (snapshot ruleset + legacy protection, sanitize payloads via jq, `set -e` + `trap EXIT` to guarantee restore even on failure, merge with `--admin`, validate diff=0 vs original snapshots).
5. **Tag + push** triggers `.github/workflows/npm-publish.yml` — `git tag -a -m "<notes>" vX.Y.Z origin/main` then `git push origin vX.Y.Z`. (Options before the tag name; `origin/main` is the ref being tagged.)
6. **Post-publish verification** — every package visible at the expected version, `dist-tags.latest` updated, artifact integrity confirmed by `npm pack` + grep for the fix.
7. **Rollback ready** — deprecate (don't unpublish) + `npm dist-tag add` previous version as latest, then open incident and follow the SOP from the top for the corrective fix.

## Historical context

The prior version of this file (pre-2026-05-17) contained a 700+ line inline procedure that grew organically across releases and never captured the gotchas that bit later: two-system branch protection (`gh pr merge --admin` bypasses neither alone), the `publish_legacy_aiox_core` race against the scoped publish, npm CDN propagation timing for the legacy compat wrapper smoke test, and the Windows path escape in `node -e` over Git Bash. After three regressions in a single 30-day window — each fix landing as a one-off patch — the canonical procedure was consolidated into `docs/guides/release-procedure.md` so every release goes through one validated checklist instead of recreating institutional memory each time.
