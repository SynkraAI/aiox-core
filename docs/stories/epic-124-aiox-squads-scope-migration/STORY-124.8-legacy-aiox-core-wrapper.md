# Story 124.8: Legacy `aiox-core` Wrapper

## Status

Ready for Review

## Story

As an AIOX Pro student using older installation instructions,
I want `npx aiox-core@latest install` to execute the current canonical installer,
so that legacy documentation and cached support messages do not route me to stale Pro activation code.

## Acceptance Criteria

- [x] Publishable compatibility package `aiox-core` delegates to `@aiox-squads/core`.
- [x] Legacy bins `aiox`, `aiox-core`, `aiox-minimal`, `aiox-graph`, and `aiox-delegate` are preserved.
- [x] The NPM publish workflow can publish the legacy package using the existing unscoped package token.
- [x] Local pack and smoke validation prove `npx aiox-core@latest install` will resolve to the canonical core after publish.

## Tasks

- [x] Add a minimal legacy package outside the root workspace.
- [x] Wire the NPM workflow selection for `aiox-core`.
- [x] Validate the wrapper locally before publish.

## File List

- `compat/aiox-core/package.json`
- `compat/aiox-core/bin/aiox-core.js`
- `compat/aiox-core/README.md`
- `.github/workflows/npm-publish.yml`
- `docs/stories/epic-124-aiox-squads-scope-migration/STORY-124.8-legacy-aiox-core-wrapper.md`

## Dev Notes

The package intentionally lives outside `packages/*` so root workspace lockfiles do not need to change. It depends on the exact canonical core version that should serve legacy users.
