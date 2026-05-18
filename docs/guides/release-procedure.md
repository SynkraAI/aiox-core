# Release Procedure SOP — @aiox-squads/core

Authoritative procedure for publishing a new version of `@aiox-squads/core` (and
its companion workspace packages) to npmjs.org. Replaces ad-hoc release lore.

> **Authority:** `@devops` only (per Constitution Art. II — Agent Authority).
> Other agents propose changes; `@devops` runs this procedure.

## Why this document exists

Between 2026-04 and 2026-05 the installer received 11 patches in 30 days,
several of them issued mid-incident under pressure. Each release exposed a new
edge case because no SOP enumerated the gates that had to pass before tagging.
This document is the result of the 2026-05-17 retrospective on the npm-hijack
hotfix (PR #742) and the subsequent 5.2.6 release (PR #743).

Use it. Update it when reality diverges.

## Pre-flight (T-10 minutes)

Block the release if any of these are red.

| Check | Command | Pass criteria |
|---|---|---|
| Working tree clean | `git status --short` | Only intentional release changes shown |
| Local main synced with origin | `git fetch && git log origin/main..main --oneline` | Empty (you are not ahead of origin) |
| Lint | `npm run lint` | Exit 0 |
| Full test suite | `npm run test:ci` | 0 failures, 0 cancelled |
| Installer suite (regression surface) | `npx jest tests/installer/ --no-coverage` | 100% pass |
| Most recent CI run on main | `gh run list --branch main --limit 1` | Green |
| npm publish token | `gh secret list -R SynkraAI/aiox-core` | `NPM_TOKEN_AIOX_SQUADS` exists and was rotated within 90 days |
| Legacy npm token (`aiox-core`) | Same | `NPM_TOKEN` exists; if older than 90 days, flag for refresh — this token publishes the legacy compat wrapper only |

## Version bump (T-5 minutes)

Review **all five** version sites during release prep. The root surface, the
internal manifest, and the compat wrapper MUST stay in lockstep at the same
version. `packages/installer/package.json` is bumped **only** when installer
source changed — not on every release. Mismatches cause silent publish failures
that show up in the smoke tests OR are caught by
`validate-aiox-core-namespace.js` (wired into `validate:publish`).

| File | What to bump |
|---|---|
| `package.json` | `version` (scoped `@aiox-squads/core`) — single source of truth |
| `compat/aiox-core/package.json` | `version` AND `dependencies["@aiox-squads/core"]` (must equal `version`) |
| `packages/installer/package.json` | `version` (patch bump if installer changed; otherwise leave) |
| `.aiox-core/package.json` | `version` MUST match root `package.json` version (lockstep per `scripts/validate-aiox-core-namespace.js` rule 4 — added in 5.2.7 after the namespace drift incident, Story #739 Bug 2). The internal manifest is not separately published but ships inside the parent surface |
| `package-lock.json` | Refresh via `npm install --package-lock-only --ignore-scripts` |
| `CHANGELOG.md` | New entry at top under `## [X.Y.Z] - YYYY-MM-DD` using Keep-a-Changelog sections (`### Fixed`, `### Added`, `### Changed`, `### Notes`) |

If `entity-registry.yaml` or `install-manifest.yaml` change during the commit
hook run, include them — they are SOT files and the pre-commit hook
intentionally regenerates them.

## Branch + PR

```bash
git checkout -b chore/release-X.Y.Z
git add <bumped files>
AIOX_ACTIVE_AGENT=devops git commit -m "chore(release): bump to X.Y.Z — <summary>"
AIOX_ACTIVE_AGENT=devops git push -u origin chore/release-X.Y.Z
gh pr create --base main --head chore/release-X.Y.Z --title "..." --body "..."
```

Wait for CI essentials to be green (CI, Pro Integration, Jest Tests across
Node versions, ESLint, TypeScript, CodeQL). Smoke matrix is advisory — it
exercises the install surface but the release does not depend on it.

If CodeRabbit posts CHANGES_REQUESTED, address or explicitly justify-and-dismiss.
A bypass merge with unanswered actionable comments is a bad signal.

## Branch protection bypass (CODEOWNERS dance)

The repo has **TWO** independent branch protection systems on `main`:

1. **Ruleset** `main-branch-protection` (id 13330052) — modern rulesets API
2. **Legacy branch protection** — `repos/SynkraAI/aiox-core/branches/main/protection`

Both enforce `require_code_owner_reviews: true`. `gh pr merge --admin` does
**not** bypass either alone. You must relax both, merge, and restore both —
the restore is non-negotiable.

### Snapshot + sanitize payloads

Raw API responses contain read-only fields (`id`, `node_id`, `created_at`,
`updated_at`, `_links`, `url`) that GitHub **rejects on PUT/PATCH** with a 422.
You must sanitize them before reusing as input bodies. The raw snapshot stays
on disk only for diff verification at the end.

```bash
# Raw snapshots — diff baseline, never sent back to the API as-is.
gh api repos/SynkraAI/aiox-core/rulesets/13330052 \
  > /tmp/aiox-core-ruleset-original.json
gh api repos/SynkraAI/aiox-core/branches/main/protection \
  > /tmp/aiox-core-branch-protection-original.json

# Sanitized restore payload for the ruleset (only writable fields):
jq '{name, target, enforcement, conditions, bypass_actors, rules}' \
  /tmp/aiox-core-ruleset-original.json \
  > /tmp/aiox-core-ruleset-restore.json

# Bypass payload (same writable surface, with the pull_request rule relaxed):
jq '{name, target, enforcement, conditions, bypass_actors,
     rules: (.rules | map(if .type=="pull_request"
       then .parameters.require_code_owner_review=false
            | .parameters.required_approving_review_count=0
       else . end))}' /tmp/aiox-core-ruleset-original.json \
  > /tmp/aiox-core-ruleset-bypass.json

# Required-PR-reviews restore payload (only the four writable fields):
jq '.required_pull_request_reviews | {dismiss_stale_reviews, require_code_owner_reviews,
     require_last_push_approval, required_approving_review_count}' \
   /tmp/aiox-core-branch-protection-original.json \
   > /tmp/aiox-core-prr-restore.json
```

### Atomic bypass → merge → guaranteed restore

Use `set -e` for early-exit and a `trap '... restore ...' EXIT` so that ANY
failure (network, merge conflict, hook crash, Ctrl-C, even a syntax error)
runs the restore before the shell exits. This is the load-bearing piece —
without the trap, a mid-script crash can leave production unprotected.

```bash
set -e

# 1. Capture state (run only if not already captured this session).
test -s /tmp/aiox-core-ruleset-restore.json || { echo "Sanitize payloads first."; exit 1; }
test -s /tmp/aiox-core-prr-restore.json     || { echo "Sanitize payloads first."; exit 1; }

# 2. Define the restore. Idempotent: re-applying the original state is safe.
restore_protections() {
  local exit_code=$?
  echo "→ Restoring branch protections (exit_code=$exit_code)..."
  gh api -X PUT repos/SynkraAI/aiox-core/rulesets/13330052 \
    --input /tmp/aiox-core-ruleset-restore.json > /dev/null \
    || echo "::error::Ruleset restore FAILED — manual recovery required."
  gh api -X PATCH repos/SynkraAI/aiox-core/branches/main/protection/required_pull_request_reviews \
    --input /tmp/aiox-core-prr-restore.json > /dev/null \
    || echo "::error::Legacy PRR restore FAILED — manual recovery required."
  echo "→ Restore attempted. Verify with the diff block below."
  return $exit_code
}
trap restore_protections EXIT

# 3. Bypass both systems.
gh api -X PUT repos/SynkraAI/aiox-core/rulesets/13330052 \
  --input /tmp/aiox-core-ruleset-bypass.json > /dev/null
gh api -X DELETE repos/SynkraAI/aiox-core/branches/main/protection/required_pull_request_reviews

# 4. Merge. If this fails, the EXIT trap restores anyway.
AIOX_ACTIVE_AGENT=devops gh pr merge "$PR_NUMBER" --squash --admin --delete-branch

# 5. Falling off the script triggers the EXIT trap → restore runs.
```

### Verify restore matches snapshot (diff exit MUST be 0)

```bash
diff <(jq -S '.rules[0].parameters' /tmp/aiox-core-ruleset-original.json) \
     <(gh api repos/SynkraAI/aiox-core/rulesets/13330052 | jq -S '.rules[0].parameters')

diff <(jq -S '.required_pull_request_reviews | {dismiss_stale_reviews, require_code_owner_reviews, require_last_push_approval, required_approving_review_count}' /tmp/aiox-core-branch-protection-original.json) \
     <(gh api repos/SynkraAI/aiox-core/branches/main/protection | jq -S '.required_pull_request_reviews | {dismiss_stale_reviews, require_code_owner_reviews, require_last_push_approval, required_approving_review_count}')
```

If either diff is non-empty, the restore is incomplete — **stop and recover
manually before walking away**. The repo is currently in a degraded state.

## Tag + push (triggers npm-publish.yml)

```bash
git fetch origin --quiet
AIOX_ACTIVE_AGENT=devops git tag -a -m "<release notes>" vX.Y.Z origin/main
AIOX_ACTIVE_AGENT=devops git push origin vX.Y.Z
```

This triggers `.github/workflows/npm-publish.yml`. The workflow runs:

| Job | Purpose | Required for release? |
|---|---|---|
| `test` | Test suite | Yes |
| `build` | Determine version + package list | Yes |
| `publish` | Publish `@aiox-squads/core` (uses `NPM_TOKEN_AIOX_SQUADS`) | **YES — this is the release** |
| `publish_workspace_packages` | `installer`, `aiox-install`, `aiox-pro-cli` | Advisory |
| `publish_legacy_aiox_core` | `aiox-core` compat (uses `NPM_TOKEN` then falls back) | Advisory |
| `smoke_test_exports` | Validates `bin/*` exports across Node 20/22/24 (regression guard for #734) | Advisory |
| `notify` | Aggregates and reports | Soft-fail only on partial failures |

## Post-publish verification

```bash
# Sanity: registry index reflects the new version
npm view @aiox-squads/core version            # must be X.Y.Z
npm view @aiox-squads/core dist-tags          # latest: X.Y.Z

# Cross-check: each workspace package
for pkg in @aiox-squads/installer @aiox-squads/aiox-install @aiox-squads/aiox-pro-cli aiox-core; do
  echo "$pkg: $(npm view $pkg version)"
done

# Verify the published artifact actually contains your fix
mkdir -p /tmp/aiox-verify && cd /tmp/aiox-verify
npm pack @aiox-squads/core@X.Y.Z
tar -xzf aiox-squads-core-X.Y.Z.tgz package/<path/to/changed/file>
# inspect the extracted file
```

If your release fixes installer behavior, run an E2E:

```bash
# Worst-case install topology: target inside an ancestor with package.json
mkdir -p /tmp/aiox-e2e/scenario && echo '{"name":"parent","workspaces":["scenario"]}' > /tmp/aiox-e2e/package.json
cd /tmp/aiox-e2e/scenario
npx --yes -p @aiox-squads/core@X.Y.Z aiox --version   # must print X.Y.Z
```

## Known-and-tracked CI quirks

These are not blockers — knowing them prevents wasted investigation.

| Quirk | Symptom | Mitigation |
|---|---|---|
| `publish_legacy_aiox_core` smoke timeout | `❌ Smoke test timeout for aiox-core@X.Y.Z` even though the actual publish step shows `✅ Published` | Smoke now waits up to 240s and verifies both `aiox-core` and `@aiox-squads/core` are visible before invoking `npx`. If still failing, propagation took >240s — re-run the workflow |
| `notify` reports failure on partial publish | Notify job red even when `@aiox-squads/core` published | Notify now distinguishes hard fail (publish) from soft warnings (workspace/legacy/smoke). Check the job summary text |
| Installer Smoke Matrix Windows path mangling | `Cannot find module 'D:aaiox-coreaiox-core/...'` | Fixed: workspace path now passed via `WORKSPACE_DIR` env var instead of `${{ github.workspace }}` interpolation in `node -e` |
| `create-release-notes` skipped on tag push | Tag-only push doesn't trigger this job | Expected — this job runs on GitHub Release publish, not tag push |

## Rollback

If a release is broken:

1. **Deprecate, don't unpublish** (unpublish has a 72h window and is destructive):
   ```bash
   npm deprecate @aiox-squads/core@X.Y.Z "Use X.Y.Z-1 — see issue #N"
   ```
2. Re-publish the previous good version under `latest`:
   ```bash
   npm dist-tag add @aiox-squads/core@X.Y.Z-1 latest
   ```
3. Open an incident issue and follow this procedure from the top for the fix.

## Failure modes I have seen

These are real incidents — keep them in mind when something goes sideways.

- **Race condition between `publish` and `publish_legacy_aiox_core`** (fixed
  2026-05-17): compat depends on scoped package but jobs ran in parallel.
  Smoke test legacy npx timed out because the scoped package wasn't yet on
  the CDN. Fix: serialize `publish_legacy_aiox_core` after `publish`.
- **Two-system branch protection** (documented 2026-05-17): there is both a
  ruleset AND a legacy branch protection. The `gh pr merge --admin` bypass
  works for neither in isolation when CODEOWNERS is required by both. You
  must relax both, in the same shell, with the restore as a `finally`.
- **`--silent` swallowing npm error context** (PR #742): the installer used
  `--silent --no-save` and npm 10+ silently walked the directory tree past
  the target into the first ancestor with a `package.json`, then exited 0,
  then the post-install integrity check failed with a generic "did not
  create" message. Fix: `--prefix=<targetDir> --workspaces=false`.
- **Windows backslash escape in `node -e` over Git Bash** (fixed 2026-05-17):
  interpolating `${{ github.workspace }}` directly into a `node -e` script
  inside Git Bash on a Windows runner turns `D:\a\...` into `D:a...` because
  `\a` is interpreted as an escape sequence. Fix: pass via env var and read
  from `process.env`.

---

**Last updated:** 2026-05-17 (after PR #742 hotfix + 5.2.6 release).
**Owner:** `@devops` (Gage).
