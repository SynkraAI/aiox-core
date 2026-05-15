# Story 124.13: Fix Issue #734 — Expose `bin/*` in Package Exports

## Status

Ready for Review

## Story

As an AIOX user installing `aiox-core@5.2.x` or `@aiox-squads/core@5.2.x` on Node.js 22+,
I want the CLI to execute without `ERR_PACKAGE_PATH_NOT_EXPORTED`,
so that every published patch release after the `@aiox-squads` scope migration remains usable on supported Node versions.

## Acceptance Criteria

- [x] Root `package.json` `exports` field exposes `./bin/*` so external `require('@aiox-squads/core/bin/aiox.js')` resolves under Node ≥22.
- [x] Compat wrapper (`compat/aiox-core/package.json`) bumped to 5.2.5 with matching `@aiox-squads/core` dependency.
- [x] Local smoke validates `aiox --version`, `aiox-core --version`, and `require()` direct on Node 22.16 against the locally packed tarballs.
- [x] CI workflow has a `smoke_test_exports` job (matrix Node 20/22/24) that runs after publish and forces the `require()` resolution path, catching future regressions of this exact bug.
- [ ] After publish, `npm i -g aiox-core@5.2.5 && aiox --version` works on Node 22, 24, and 25.

## Tasks

- [x] Add `"./bin/*": "./bin/*"` to `exports` in `package.json`.
- [x] Bump `@aiox-squads/core` 5.2.4 → 5.2.5.
- [x] Bump `compat/aiox-core` 5.2.4 → 5.2.5 (version + dependency).
- [x] Add `smoke_test_exports` job to `.github/workflows/npm-publish.yml` with Node 20/22/24 matrix, using external `require()` to force the package-exports gate.
- [x] Update `notify` job to fail if `smoke_test_exports` fails.
- [x] Local smoke validated (Node 22.16): `require('@aiox-squads/core/bin/aiox.js')` loads CLI banner instead of throwing `ERR_PACKAGE_PATH_NOT_EXPORTED`.
- [ ] Push branch via @devops + open PR linking #734 and Epic 124.
- [ ] CodeRabbit review pass.
- [ ] @qa final review.
- [ ] Merge + tag `v5.2.5`.
- [ ] @devops deprecates 5.2.2, 5.2.3, 5.2.4 on npm (both `aiox-core` and `@aiox-squads/core`) with message pointing to 5.2.5.
- [ ] @qa runs post-publish global install smoke on Node 22/24/25 and closes Issue #734.

## File List

- `package.json`
- `compat/aiox-core/package.json`
- `.github/workflows/npm-publish.yml`
- `docs/stories/epic-124-aiox-squads-scope-migration/STORY-124.13-fix-issue-734-exports-bin.md`

## Dev Notes

### Root Cause

Story 124.8 introduced the `compat/aiox-core` wrapper that delegates to `@aiox-squads/core` via:

```js
require(`@aiox-squads/core/bin/${targetBin}`);
```

The root `package.json` `exports` field (introduced earlier in Epic 124) restricts subpath access to `./resilience/*`, `./installer/*`, and `./package.json` only. Node.js 22+ enforces the package-exports spec strictly: any subpath not declared in `exports` is rejected with `ERR_PACKAGE_PATH_NOT_EXPORTED`, even if the file physically exists.

This bug affected three consecutive published versions (5.2.2, 5.2.3, 5.2.4) because the existing CI smoke (`npx --yes aiox-core --version`) uses npm bin shims which resolve internally without triggering the exports gate. Only external `require()` (or `npm i -g` followed by direct shell invocation that re-imports the package from outside the package boundary) reveals the bug.

### Fix Strategy

Single-pattern entry `"./bin/*": "./bin/*"` (pass-through, no extension transformation) added before the `./installer/*` entries. The pattern is pass-through because the existing wrapper passes `.js` extensions already (e.g. `bin/aiox.js`); transforming with `.js` suffix would yield invalid `bin/aiox.js.js`.

### CI Hardening (Regression Guard)

New job `smoke_test_exports` runs after publish and:
1. Sets up Node from a matrix of `['20', '22', '24']`.
2. Waits for npm propagation of `@aiox-squads/core@${version}`.
3. Installs the published package in a fresh tempdir.
4. Executes `node -e "require('@aiox-squads/core/bin/aiox.js')"` — this forces external resolution that triggers the package-exports gate, catching this exact bug class.

The existing `Smoke test legacy npx` step is preserved (it validates the bin shim path); the new job complements it by covering the external-require path that escaped detection three times.

### Related Stories / Issues

- Issue #734 — bug report (2026-05-14).
- Story 124.8 — introduced the wrapper that triggered the issue via internal `require()`.
- Story 124.3 — published `@aiox-squads/core` with the restrictive `exports` field.

### Risks

- Pattern `./bin/*` exposes any future file added under `bin/`. Current contents: 5 declared binaries + `aiox-init.js`, `aiox-ids.js` + `modules/`, `utils/` (already part of CLI runtime). No sensitive files in `bin/`.
- Deprecation of 5.2.2/.3/.4 happens post-merge via `npm deprecate` and requires @devops. Pinned consumers must read the deprecation message.
