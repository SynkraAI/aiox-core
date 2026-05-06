# Naming Decision Matrix - Epic 124

| Field | Value |
|-------|-------|
| Story | 124.1 - Package naming decision matrix |
| Epic | 124 - aiox-squads scope migration |
| Owner | @pm |
| Date | 2026-05-06 |
| Status | Sponsor approved |

## Decision Summary

Recommendation: publish the four target packages under short, role-specific names in the canonical `@aiox-squads/*` scope.

| Current package | Current version source | Candidate 1 | Candidate 2 | Candidate 3 | Recommendation | Rationale |
|-----------------|------------------------|-------------|-------------|-------------|----------------|-----------|
| `aiox-core` | npm published `5.0.7`; local `package.json` `5.0.3` | `@aiox-squads/core` | `@aiox-squads/aiox-core` | `@aiox-squads/framework` | `@aiox-squads/core` | Best balance of brevity and clarity. The scope already carries the AIOX/Squads brand, so repeating `aiox` in the package slug adds noise without reducing ambiguity. |
| `@synkra/aiox-install` | local `package.json` `1.0.0`; npm registry returned 404 | `@aiox-squads/aiox-install` | `@aiox-squads/install` | `@aiox-squads/installer-cli` | `@aiox-squads/aiox-install` | Keeps the existing NPX mental model and avoids collision with the separate framework installer package. Slightly longer than `install`, but clearer for migration docs and deprecation messages. |
| `aiox-pro` | local `package.json` `0.1.0`; npm registry returned 404 | `@aiox-squads/aiox-pro-cli` | `@aiox-squads/pro-cli` | `@aiox-squads/aiox-pro` | `@aiox-squads/aiox-pro-cli` | Explicitly identifies this as the CLI wrapper, not the Pro runtime package. This prevents confusion with the reserved cross-repo target `@aiox-squads/pro`. |
| `@aiox/installer` | local `package.json` `3.2.1`; npm registry returned 404 | `@aiox-squads/installer` | `@aiox-squads/aiox-installer` | `@aiox-squads/core-installer` | `@aiox-squads/installer` | Clear within the new scope and aligned with the current package directory. The shorter slug is acceptable because `@aiox-squads/aiox-install` remains the NPX install package. |

## Package Role Boundaries

| Target package | Role after rename | Notes |
|----------------|-------------------|-------|
| `@aiox-squads/core` | Canonical framework/core package | Successor for `aiox-core`; Story 124.3 should reconcile local `package.json` version with the npm-published `5.0.7` before publishing `5.1.0`. |
| `@aiox-squads/aiox-install` | Lightweight NPX installer and `edmcp` entrypoint | Successor for `@synkra/aiox-install`; keeps the current onboarding command family visible. |
| `@aiox-squads/aiox-pro-cli` | Public CLI wrapper for Pro install/update/status flows | Successor for the local `aiox-pro` package; keeps the user-facing `aiox-pro` command stable. |
| `@aiox-squads/installer` | Framework installer/updater/wizard package | Successor for `@aiox/installer`; should own internal install/update mechanics, not the public Pro runtime package name. |

Reserved adjacent package: `@aiox-squads/pro` belongs to the separate `aiox-pro` repo and is not one of the four 124.1 target rows. Keep that slug reserved for Story 124.4.

## Peer Dependency Map

The current `package.json` files declare no `peerDependencies` between the four target packages. Runtime coupling exists through CLI calls, filesystem paths, and install/update flows, so the post-rename dependency map should be treated as follows:

| Consumer | Current coupling | Post-rename target | Required follow-up story |
|----------|------------------|--------------------|--------------------------|
| `@aiox-squads/aiox-install` | Installs and invokes `aiox-core` using package/bin references such as `npm install aiox-core`, `npx aiox-core`, and `node_modules/aiox-core` paths. | Use `@aiox-squads/core` as the package dependency/install target while preserving the `aiox-core` bin. Scoped `node_modules` paths must become `node_modules/@aiox-squads/core`. | 124.5 and 124.6 |
| `@aiox-squads/aiox-pro-cli` | Invokes `aiox-core` and resolves Pro package names through canonical/fallback constants. | Use `@aiox-squads/core` for core CLI expectations and `@aiox-squads/pro` for Pro runtime resolution. | 124.4 and 124.6 |
| `@aiox-squads/installer` | Installer/updater code checks `aiox-core` package paths and Pro setup paths. | Update package path checks to `@aiox-squads/core`; update Pro setup to `@aiox-squads/pro`. | 124.5 and 124.6 |
| `@aiox-squads/core` | Root package does not depend on the three monorepo packages through `dependencies` or `peerDependencies` today. | No new peer dependency required by naming alone. Any runtime dependency should be introduced explicitly in the implementation story that needs it. | 124.3, 124.5, 124.6 |
| `@aiox-squads/pro` | External Pro package currently declares peer dependency `aiox-core >=5.0.0` as `@aiox-fullstack/pro`. | Rename the formal peer dependency to `@aiox-squads/core >=5.1.0` when Story 124.4 publishes the Pro package. | 124.4 |

Decision: do not add peer dependencies as part of 124.1. The rename should preserve the current dependency shape until implementation stories prove a package-level contract is required.

## Bin Command Decisions

Package names change; user-facing commands stay stable unless a later implementation story proves a hard conflict.

| Target package | Current bins | Decision |
|----------------|--------------|----------|
| `@aiox-squads/core` | `aiox`, `aiox-core`, `aiox-minimal`, `aiox-graph` | Preserve all current bins. This explicitly preserves `aiox-core`. |
| `@aiox-squads/aiox-install` | `aiox-install`, `edmcp` | Preserve both bins. `edmcp` remains out of scope for the npm scope rename. |
| `@aiox-squads/aiox-pro-cli` | `aiox-pro` | Preserve `aiox-pro`. This is sponsor Decision 3 in the epic and protects existing Pro UX. |
| `@aiox-squads/installer` | `aiox-installer` | Preserve `aiox-installer`. |

Implementation note: because `@aiox-squads/core` exposes multiple bins, Story 124.3/124.11 should smoke test the exact NPX invocation syntax. The package rename must not silently remove the stable `aiox-core` command.

## Registry Checks

Checks run on 2026-05-06:

| Package | Registry result |
|---------|-----------------|
| `aiox-core` | Published version `5.0.7` |
| `@synkra/aiox-install` | 404 / not visible in npm registry |
| `aiox-pro` | 404 / not visible in npm registry |
| `@aiox/installer` | 404 / not visible in npm registry |
| `@aiox-squads/core` | 404 / not visible in npm registry |
| `@aiox-squads/aiox-install` | 404 / not visible in npm registry |
| `@aiox-squads/aiox-pro-cli` | 404 / not visible in npm registry |
| `@aiox-squads/installer` | 404 / not visible in npm registry |

Interpretation: no visible registry conflict blocks the recommended target names. Story 124.2 still owns org provisioning, permission checks, and publish token validation.

## Publish Readiness Risks

These risks do not change the naming recommendation, but they must be handled before the publish stories move packages into `@aiox-squads/*`.

| Risk | Evidence | Required follow-up |
|------|----------|--------------------|
| `@aiox-squads/installer` entrypoint may be broken as a standalone package. | `packages/installer/package.json` points `main` and bin `aiox-installer` to `src/index.js`, but `packages/installer/src/index.js` is absent and `npm pack --dry-run` for the package does not include that file. | Story 124.5 must either add the missing entrypoint, repoint `main`/bin to the real wizard entrypoint, or remove the bin before publish. |
| `@aiox-squads/aiox-pro-cli` has a publish-time coupling to installer source that is not packed with the CLI package. | `packages/aiox-pro-cli/bin/aiox-pro.js` requires `../../installer/src/wizard/pro-setup`; `npm pack --dry-run` for `aiox-pro` includes only `bin/aiox-pro.js`, `src/recover.js`, and `package.json`. | Story 124.5/124.6 must replace the relative workspace import with a package dependency/import, vendor the required wizard surface, or delegate setup to the core/installer CLI. |

## Sponsor Sign-Off

- [x] Rafael Costa approves the recommended package names.
- [x] Approval is recorded in PR comment, inline comment, or this document before 124.2 starts.

Approval record: Rafael Costa approved proceeding from the chat instruction "Avance" on 2026-05-06. This approval locks the target package names below for Epic 124 execution unless a later sponsor decision explicitly supersedes it.

Approved target map:

```text
Sponsor sign-off: approved target names for Epic 124:
@aiox-squads/core, @aiox-squads/aiox-install, @aiox-squads/aiox-pro-cli, @aiox-squads/installer.
Preserve user-facing bins: aiox-core, aiox-pro, aiox-install, edmcp, aiox-installer.
```

## Final Recommendation

Adopt the recommended names as the canonical target map for Epic 124:

```text
aiox-core             -> @aiox-squads/core
@synkra/aiox-install -> @aiox-squads/aiox-install
aiox-pro             -> @aiox-squads/aiox-pro-cli
@aiox/installer      -> @aiox-squads/installer
```

This keeps the package namespace short, avoids repeating `aiox` where the scope already provides it, and uses longer slugs only where they prevent real ambiguity between installer surfaces and Pro runtime/package boundaries.
