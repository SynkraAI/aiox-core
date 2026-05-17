---
id: publish-npm
name: npm Publishing Pipeline (Preview to Latest)
agent: devops
category: release
complexity: high
tools:
  - github-cli
  - git
checklists:
  - release-checklist.md
---

# npm Publishing Pipeline

> **AUTHORITATIVE SOURCE:** [`docs/guides/release-procedure.md`](../../../docs/guides/release-procedure.md)
>
> This task wraps the canonical release SOP. **Open it first**, follow its checklist top-to-bottom. The SOP captures pre-flight checks, 4-site version bump coordination, branch protection bypass (two systems — modern ruleset + legacy branch protection — both must be relaxed and restored atomically via `trap EXIT`), tag-driven publish trigger, post-publish verification, known CI quirks (legacy publish race, npm propagation timeout, Windows path escape), and rollback steps.
>
> This shorter task remains because some agent workflows still reference the `publish-npm` id, but the content of record lives in the SOP. **Do not duplicate the procedure here** — that creates drift between two sources of truth.

## When this task fires

- `@devops` is asked to publish a new release of `@aiox-squads/core` (or any of the companion `@aiox-squads/*` packages)
- A release follow-up is needed (workspace package out-of-band publish, hotfix, etc.)

## TL;DR (full detail in the SOP)

1. **Pre-flight:** lint, full test suite, `gh secret list` for `NPM_TOKEN_AIOX_SQUADS`, working tree clean, local main synced with origin.
2. **Bump version in 4 places:** `package.json`, `compat/aiox-core/package.json` (both `version` and the `@aiox-squads/core` dep), `packages/installer/package.json`, then refresh `package-lock.json` via `npm install --package-lock-only`. Add a `CHANGELOG.md` entry.
3. **Branch + PR + bypass + merge:** `chore/release-X.Y.Z` → PR to main → atomic bypass→merge→restore (the SOP's `trap EXIT` block is mandatory; do not skip).
4. **Tag + push:** `git tag -a -m "<notes>" vX.Y.Z origin/main` then `git push origin vX.Y.Z`. (Options before tag name, `origin/main` is the ref being tagged.) The tag triggers `.github/workflows/npm-publish.yml`.
5. **Post-publish:** verify `npm view @aiox-squads/core version` returns the new version on `dist-tags.latest`; pull the published tarball with `npm pack @aiox-squads/core@X.Y.Z` and grep for the fix to confirm code presence; run an E2E in the worst-case install topology if the release fixes installer behavior.

## Historical context

The prior version of this file (pre-2026-05-17) contained an inline preview-to-latest two-phase pipeline that worked for early releases but did not document the branch-protection dance, the publish race conditions, or the cross-package version coordination. After three regressions in a single 30-day window, the canonical procedure was consolidated into `docs/guides/release-procedure.md` so every release goes through one validated checklist.
