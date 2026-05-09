# Story PRO-13.5: Private Pro Distribution Hardening

| Field | Value |
| --- | --- |
| Story ID | PRO-13.5 |
| Epic | PRO-13 — Stable Machine ID and Pro Distribution Hardening |
| Status | Published |
| Executor | @architect for acquisition decision, then @dev + @devops |
| Quality Gate | @architect + @qa + @po |
| DevOps Authority | @devops for publish/access changes |
| Priority | P0 |
| Story Order | Follow-up after PRO-13.2 and distinct from existing PRO-13.4 AIOS cleanup; can run before PRO-13.3 if distribution security is prioritized |

## Status

Published

## Story

**As a** AIOX Pro operator,
**I want** Pro content to be distributed only through an authenticated channel after license validation,
**so that** the public `aiox-core` package no longer exposes premium Pro assets while existing install and update flows continue to work without breaking current customers.

## Context

PRO-13.2 aligned the release gates around the canonical Pro package name `@aiox-squads/pro` and published:

- `aiox-core@5.0.8`
- `@aiox-squads/pro@0.4.0`

Current `aiox-core` / `@aiox-squads/core` package metadata still includes Pro assets in the public npm tarball via root `package.json` entries such as:

- `pro/license/`
- `pro/squads/`
- `pro/pro-config.yaml`
- `pro/feature-registry.yaml`
- `pro/package.json`
- `pro/README.md`

Changing `@aiox-squads/pro` to private/restricted immediately would not fully protect Pro content, because content remains bundled in the already-public core package. It could also break the current install/update flow because `npm install @aiox-squads/pro` requires npm read access when the package is private, while AIOX license validation does not currently grant npm registry access.

## Goal

Remove Pro content from future public `aiox-core` packages, introduce a safe authenticated Pro acquisition path, and only then make `@aiox-squads/pro` private/restricted.

## Architecture Decision

### Decision

Use the **license-server as the customer-facing Pro artifact broker**. After the existing AIOX Pro license/auth flow succeeds, the installer requests a short-lived signed artifact URL from `aios-license-server`. The Pro package may remain in npm as a maintainer/release-pipeline artifact, but customer installs must not depend on npm org membership or a customer-managed `NPM_TOKEN`.

Recommended storage backend: a private Supabase Storage bucket in the same Supabase project already used by `aios-license-server`. The artifact is the packed Pro tarball (`@aiox-squads/pro` `.tgz`) produced by the release pipeline and uploaded by @devops. The license-server signs a short-lived URL only for authenticated, verified, entitled Pro users.

### Why This Option

- It maps distribution access to the existing AIOX license entitlement instead of npm account access.
- It avoids putting npm tokens on customer machines.
- It allows `@aiox-squads/pro` to become private/restricted without breaking normal students.
- It fits the current backend stack: Next API routes, Supabase Auth, Supabase service role, buyer validation, audit log, and existing bearer-token auth middleware.
- It keeps public `aiox-core` clean: core owns license gate, graceful degradation, and install orchestration; Pro artifacts stay behind the license-server broker.

### Options Rejected

| Option | Decision | Reason |
| --- | --- | --- |
| Private npm as customer channel | Rejected for customer-facing installs | Requires npm read access/token for each customer and breaks normal install UX. |
| GitHub Packages as customer channel | Rejected | Same token/member problem, worse UX for non-developer students. |
| Keep Pro bundled in public `aiox-core` | Rejected | Fails the Pro distribution boundary and keeps premium content public. |
| License-server streaming tarball directly as first choice | Deferred | Works, but signed object URL is simpler and cheaper; streaming can be fallback if signed URL support is blocked. |
| Vercel Blob/S3 as new vendor | Deferred | Adds new infra when Supabase Storage already matches the current backend stack. |

### High-Level Contract

New backend endpoint:

```text
POST /api/v1/pro/artifact-url
Authorization: Bearer <supabase_access_token>
Content-Type: application/json
```

Request:

```json
{
  "package": "@aiox-squads/pro",
  "version": "0.4.0",
  "format": "tgz",
  "machineId": "<stable-machine-id>",
  "aioxCoreVersion": "<installed-core-version>"
}
```

Success response:

```json
{
  "package": "@aiox-squads/pro",
  "version": "0.4.0",
  "artifactUrl": "https://...",
  "expiresAt": "2026-05-07T12:15:00.000Z",
  "sha256": "<artifact-sha256>",
  "sizeBytes": 1234567
}
```

Rules:

- Auth uses existing Supabase bearer token validation.
- Email must be verified.
- User must have an active, non-revoked Pro license or pass existing buyer validation + activation flow.
- Signed URL TTL: 10 minutes by default.
- Server logs `audit_log.action = 'pro_artifact_url'` with masked/safe metadata only.
- Server never returns npm tokens, Supabase service role keys, or long-lived object credentials.
- Client verifies `sha256` before extraction/scaffolding.
- Client downloads into a temp directory and uses `stepInstallScaffold(targetDir, { proSourceDir })` so existing scaffolding behavior remains the boundary.

### Release Contract

1. @devops publishes/builds the Pro artifact from the `aiox-pro` source of truth.
2. @devops uploads the artifact to a private bucket path such as:

```text
pro-artifacts/@aiox-squads/pro/0.4.0/aiox-squads-pro-0.4.0.tgz
```

3. @devops stores/updates artifact metadata (`version`, `sha256`, `sizeBytes`, object path) in environment/config or a small DB-backed manifest.
4. `aios-license-server` signs URLs only for manifest versions that are explicitly allowed.
5. `aiox-core` installer requests the artifact only after license activation/validation.

### Repo Changes

`aiox-core` / `@aiox-squads/core`:

- remove `pro/*` from public package files;
- invert `validate:publish` so `pro/*` in the public tarball is a failure;
- add installer artifact acquisition after `stepLicenseGate`;
- download/extract Pro tarball to a temp source dir and pass it to existing `stepInstallScaffold`;
- keep framework-dev local `pro/` support for maintainers;
- add hash verification and actionable errors.

`aios-license-server`:

- add `POST /api/v1/pro/artifact-url`;
- use `authenticateRequest` + `requireEmailVerified`;
- check active license/entitlement before signing;
- create signed URL via private Supabase Storage bucket;
- audit `pro_artifact_url` requests;
- add rate limit and tests for valid, invalid, expired, and unverified users.

`aiox-pro` / `@aiox-squads/pro`:

- keep npm package as source artifact for maintainers/release pipeline;
- add/verify package artifact metadata and publish-surface validation;
- allow npm package visibility to become private/restricted after customer artifact channel passes smoke tests.

## Non-Goals

- Do not invalidate existing license keys.
- Do not remove legacy package fallback detection in this story unless a separate deprecation plan is approved.
- Do not require normal Pro customers/students to manually manage npm org membership.
- Do not publish or rotate secrets in the repository.
- Do not implement PRO-13.3 churn detection/cron work here.
- Do not make private npm the customer-facing distribution path.

## Acceptance Criteria

1. **Core public tarball excludes Pro content**
   - `npm pack --dry-run --json` for the active core package (`aiox-core` legacy line or `@aiox-squads/core` current line) shows no files under `pro/`.
   - `package.json.files` no longer includes Pro asset paths.
   - `validate:publish` fails if any future `aiox-core` tarball includes `pro/` content.

2. **Core-only install remains functional**
   - A clean install of the next core release works without `pro/` present.
   - Core commands that do not require Pro continue to run without Pro content and without npm auth.
   - Existing graceful-degradation behavior for absent Pro remains intact.

3. **Pro acquisition is authenticated after license validation**
   - The Pro installer validates the AIOX Pro license before attempting to fetch premium content.
   - The customer-facing acquisition path is `aios-license-server` signed artifact URL, backed by a private artifact store.
   - Normal customers are not manually added to the npm org and do not need a customer-managed `NPM_TOKEN`.
   - Private npm remains maintainer/release-pipeline infrastructure only, not the customer install contract.

4. **Existing Pro users can update without duplicate surfaces**
   - Update/install preserves the canonical package name `@aiox-squads/pro`.
   - The story respects the active package migration policy from Epic 124: if the target branch is already single-scope, do not reintroduce legacy Pro package fallbacks; if the target branch still contains fallback compatibility, do not remove it without an explicit migration decision.
   - Installed agent-to-skill migration behavior remains non-duplicative: no duplicated slash commands and no simultaneous legacy agent + generated skill surfaces for the same Pro capability.

5. **Package privacy is changed only after smoke validation**
   - `@aiox-squads/pro` is changed to private/restricted only after the new acquisition path passes smoke tests.
   - Smoke tests include:
     - user without npm token can install public `aiox-core` and does not receive Pro content;
     - user with valid AIOX Pro license can acquire/install Pro content via the intended authenticated path;
     - user without valid license cannot acquire Pro content;
     - existing Pro installation can update without losing license cache or duplicating commands/skills.

6. **Rollback is documented and tested**
   - Rollback procedure is documented before publish.
   - Rollback includes reverting `@aiox-squads/pro` visibility to public if private distribution blocks valid customers.
   - Rollback includes republishing or dist-tag correction strategy for `aiox-core` if the public tarball accidentally omits required core files.

7. **Release evidence is captured**
   - Publish evidence includes `npm pack --dry-run --json` file list proof.
   - Publish evidence includes `npm view aiox-core version dist-tags --json`.
   - Publish evidence includes `npm view @aiox-squads/pro version dist-tags --json` and package access status.
   - Evidence is saved under `outputs/qa/` or the story Dev Agent Record.

## Tasks

- [x] T1. Audit current Pro surfaces in `aiox-core`
  - [x] Identify every path that includes or references bundled `pro/` content.
  - [x] Classify each reference as publish-surface, dev-submodule support, installer runtime, docs, or tests.
  - [x] Confirm which references must remain for local framework-dev mode.

- [x] T2. Remove Pro from public `aiox-core` publish surface
  - [x] Remove Pro paths from root `package.json.files`.
  - [x] Update `bin/utils/validate-publish.js` so public core publish no longer requires populated `pro/`.
  - [x] Add a negative guard that fails if `npm pack --dry-run --json` contains `pro/`.

- [x] T3. Preserve local dev and existing installed behavior
  - [x] Keep local checkout/submodule support for maintainers with `pro/` available.
  - [x] Preserve the active Pro package compatibility policy from the target branch without reintroducing or removing legacy fallbacks implicitly.
  - [x] Ensure absent Pro fails gracefully in core-only usage.

- [x] T4. Define authenticated Pro acquisition path
  - [x] Choose the customer-facing acquisition model: license-server signed artifact URL.
  - [x] Document why the chosen model does not break normal Pro customers.
  - [x] Create/attach the corresponding `aios-license-server` story for `POST /api/v1/pro/artifact-url`: `STORY-PRO-13.6-PRO-ARTIFACT-SIGNED-URL.md`.

- [x] T5. Implement installer/update changes
  - [x] Ensure license validation happens before Pro acquisition.
  - [x] Download the signed artifact to a temp directory.
  - [x] Verify artifact `sha256` before extraction.
  - [x] Extract artifact and pass the extracted package path as `proSourceDir` to the existing scaffolder.
  - [x] Ensure acquisition errors are actionable and do not corrupt existing installations.
  - [x] Ensure update does not duplicate slash commands, agent activators, or generated skills.

- [x] T6. Validate smoke matrix
  - [x] Core-only clean install without npm token.
  - [x] Pro install with valid license.
  - [x] Pro install with invalid license.
  - [x] Existing Pro update path.
  - [x] Agent-to-skill sync/idempotency check.

- [x] T7. Publish and privacy transition
  - [x] Publish `aiox-core` patch release after tests pass.
  - [x] Verify public tarball excludes Pro.
  - [x] Change `@aiox-squads/pro` visibility only after smoke validation.
  - [x] Save npm access/status evidence.

- [x] T8. Update docs
  - [x] Update `docs/PUBLISHING.md`.
  - [x] Update Pro install/update docs.
  - [x] Update troubleshooting for npm/private artifact failures.
  - [x] Add rollback section with exact commands.

## Open Decisions

1. What is the target customer-facing Pro artifact channel?
   - **Resolved by @architect on 2026-05-07:** license-server signed artifact URL backed by a private Supabase Storage artifact bucket.

2. Should `@aiox-squads/pro` become npm private/restricted at all, or should npm remain a maintainer-only staging channel while customers download signed artifacts?
   - **Architect recommendation:** make npm private/restricted only after signed artifact install smoke passes. Treat npm as maintainer/release-pipeline infrastructure, not customer distribution.

3. What is the patch version target for the public-core fix?
   - Resolved for this implementation: `@aiox-squads/core@5.1.17`, the next patch after the published `5.1.16`, because `@aiox-squads/pro@0.4.2` corrected npm package metadata after the `0.4.1` drift was discovered. Do not hardcode `aiox-core@5.0.9` unless Product explicitly opens an unscoped legacy hotfix.

4. What TTL should signed Pro artifact URLs use if the license-server path is selected?
   - Resolved default: 10 minutes. Acceptable range for implementation tests: 5 to 15 minutes.

5. Should this story block PRO-13.3?
   - Recommended: no hard block. It can run before 13.3 if distribution security is higher priority, but it does not replace churn detection.

6. What still blocks implementation readiness?
   - Resolved architecture no longer blocks. Story decomposition is complete via `aios-license-server/docs/stories/STORY-PRO-13.6-PRO-ARTIFACT-SIGNED-URL.md`, validated Ready on 2026-05-08.
   - PRO-13.6 is merged, deployed to production, configured with private Supabase Storage artifact manifest, and smoke-tested with signed URL download/hash validation.
   - Resolved: core smoke passed, `@aiox-squads/core@5.1.17` is the corrected publish target, and `@aiox-squads/pro` privacy transition passed after customer artifact smoke.

## Risks and Mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Private npm breaks valid customers | High | Do not privatize until installer uses a customer-safe authenticated channel |
| Public core tarball still leaks Pro files | High | Add `npm pack` negative guard in `validate:publish` |
| Existing Pro update duplicates commands/skills | High | Add idempotency smoke for sync/install surfaces |
| Local framework-dev loses submodule workflow | Medium | Keep local `pro/` detection for maintainers, but exclude from npm pack |
| Rollback is slow during customer issue | High | Pre-document npm access rollback and dist-tag correction |
| Backend artifact signing expands scope | Medium | Split backend endpoint into a separate license-server story if needed |
| Signed URL leaks through logs or support screenshots | Medium | Short TTL, audit only safe metadata, never log full URL in client output |
| Tampered or partial artifact download | High | Verify `sha256` and expected size before extraction |

## Dev Notes

Relevant current files and surfaces:

- `package.json` currently includes Pro paths in the public package `files` list.
- `bin/utils/validate-publish.js` currently validates that `pro/` exists before publish; this must be inverted for public core publish.
- `packages/installer/src/wizard/pro-setup.js` resolves Pro from bundled `pro/`, installed npm packages, and local checkout paths.
- `packages/installer/src/pro/pro-scaffolder.js` copies Pro content into target projects after license activation.
- `packages/aiox-pro-cli/bin/aiox-pro.js` installs Pro by trying package names via `npm install`.
- `bin/utils/pro-detector.js` on `origin/main` currently resolves canonical `@aiox-squads/pro` only. Earlier PRO-13.2 notes mention legacy fallbacks, so implementation must reconcile with Epic 124 single-scope migration state before adding or removing compatibility logic.
- `docs/guides/workflows/pro-developer-workflow.md` already documents the intended open-core behavior: core-only npm should exclude Pro.
- `aios-license-server/src/lib/auth-middleware.ts` already validates Supabase bearer tokens and can be reused for `POST /api/v1/pro/artifact-url`.
- `aios-license-server/src/app/api/v1/auth/activate-pro/route.ts` already validates/creates Pro entitlement and should remain the entitlement source before artifact signing.
- `packages/installer/src/wizard/pro-setup.js` already accepts `options.proSourceDir` in `stepInstallScaffold`, so the installer can acquire/extract Pro artifact without rewriting the scaffolder.

Implementation should preserve the open-core boundary:

- public `aiox-core`: extension points, installer, license gate, graceful degradation;
- private/authenticated Pro: premium squads, license implementation, Pro config, Pro memory/features.

## CodeRabbit / QA Plan

- CodeRabbit focus:
  - publish-surface regression;
  - accidental secret/token handling;
  - installer error paths;
  - duplicated command/skill surfaces.

- Required local checks:
  - `npm run validate:publish`
  - `npm pack --dry-run --json`
  - focused tests for `pro-detector`, `pro-updater`, `pro-scaffolder`, and Pro wizard setup
  - smoke install in a temporary project without npm token
  - smoke Pro acquisition with valid license using the selected authenticated channel
  - backend tests for `POST /api/v1/pro/artifact-url`
  - artifact hash mismatch test

## Out of Scope

- Rotating npm tokens.
- Deprecating legacy npm packages.
- Implementing PRO-13.3 cron churn detection.
- Changing license limits, seat policy, or activation rules.
- Rewriting the full installer architecture outside the Pro acquisition boundary.

## References

- PRO-13.2 release gate alignment and publish outcome: `aiox-core@5.0.8`, `@aiox-squads/pro@0.4.0`
- Existing external `STORY-PRO-13.4-AIOS-LEGACY-CLEANUP.md` in `aios-license-server/docs/stories/`
- `aios-license-server/src/lib/auth-middleware.ts`
- `aios-license-server/src/app/api/v1/auth/activate-pro/route.ts`
- `docs/PUBLISHING.md`
- `docs/guides/workflows/pro-developer-workflow.md`
- `package.json`
- `pro/package.json`
- `bin/utils/validate-publish.js`
- `packages/installer/src/wizard/pro-setup.js`
- `packages/installer/src/pro/pro-scaffolder.js`
- `packages/aiox-pro-cli/bin/aiox-pro.js`
- `bin/utils/pro-detector.js`

## File List

- [docs/stories/epic-pro-13/STORY-PRO-13.5-PRIVATE-PRO-DISTRIBUTION-HARDENING.md](./STORY-PRO-13.5-PRIVATE-PRO-DISTRIBUTION-HARDENING.md)

Expected implementation touchpoints:

- `package.json`
- `bin/utils/validate-publish.js`
- `packages/installer/src/wizard/pro-setup.js`
- `packages/installer/src/pro/pro-scaffolder.js`
- `packages/aiox-pro-cli/bin/aiox-pro.js`
- `packages/installer/src/wizard/i18n.js`
- `docs/PUBLISHING.md`
- `docs/guides/workflows/pro-developer-workflow.md`
- `tests/pro-wizard.test.js`
- `tests/installer/pro-setup-auth.test.js`
- `tests/cli/validate-publish.test.js`
- `tests/license/license-api.test.js`
- `pro/package-lock.json`
- `pro/license/license-api.js`
- `outputs/qa/2026-05-pro-13-5-core-pack-dry-run.json`
- `outputs/qa/2026-05-pro-13-5-smoke.json`
- `outputs/qa/2026-05-pro-13-5-pro-artifact-0.4.1.json`
- `outputs/qa/2026-05-pro-13-5-vercel-manifest-0.4.1.json`
- `outputs/qa/2026-05-pro-13-5-pro-artifact-0.4.2.json`
- `outputs/qa/2026-05-pro-13-5-publish-0.4.2-5.1.17.json`
- `outputs/qa/2026-05-pro-13-5-npm-view-core.json`
- `outputs/qa/2026-05-pro-13-5-npm-view-pro.json`
- `outputs/qa/2026-05-pro-13-5-npm-access-pro-status.json`
- `outputs/qa/2026-05-pro-13-5-npm-access-core-status.json`
- `bin/utils/pro-detector.js`
- `aios-license-server/src/app/api/v1/pro/artifact-url/route.ts`
- `aios-license-server` artifact manifest/config docs

## Dependencies

- **Depends on:** PRO-13.2 release gate alignment and `@aiox-squads/pro@0.4.0` publish.
- **Must not collide with:** existing `STORY-PRO-13.4-AIOS-LEGACY-CLEANUP.md` in `aios-license-server`; this story is intentionally PRO-13.5.
- **Must reconcile with:** Epic 124 package-scope migration, especially current single-scope `@aiox-squads/pro` behavior.
- **Backend dependency:** completed via `aios-license-server` PRO-13.6 signed artifact URL endpoint and production artifact manifest.
- **Does not block:** PRO-13.3 churn detection unless Product decides distribution security is the higher operational priority.

## Definition of Done

- [x] `aiox-core` patch release published with no `pro/` files in the public tarball.
- [x] Pro acquisition path is authenticated through `aios-license-server` signed artifact URL after license validation.
- [x] `@aiox-squads/pro` privacy/access transition is completed only after smoke validation.
- [x] Existing install/update does not duplicate slash commands, agent activators, or generated skills.
- [x] Rollback procedure and evidence are captured in the story or `outputs/qa/`.

## PO Validation

- 2026-05-07: `@po` / `*validate-story-draft` executed against PRO-13 and Epic 124 context.
- Phase 0: external EPIC-PRO-13 loaded from `aios-license-server/docs/epics/EPIC-PRO-13-STABLE-MACHINE-ID.md`; local `aiox-core` has no PRO-13 epic file.
- Stories analyzed: PRO-13.1 Done, PRO-13.2 Ready for Review / published path completed, PRO-13.3 Draft, existing PRO-13.4 AIOS legacy cleanup Validated, and Epic 124 package-scope stories.
- Must-Fix auto-applied: story renumbered from PRO-13.4 to PRO-13.5 to avoid collision with existing `STORY-PRO-13.4-AIOS-LEGACY-CLEANUP.md`.
- Should-Fix auto-applied: version target changed from hardcoded `aiox-core@5.0.9` to "next patch on active package line", because current code reality is `@aiox-squads/core` 5.1.x.
- Should-Fix auto-applied: legacy fallback AC changed to reconcile with Epic 124 single-scope state instead of reintroducing `@aiox-fullstack/pro` / `@aios-fullstack/pro` by default.
- Original verdict: NO-GO for implementation until Open Decision 1 is resolved by @architect/Product. Story quality after auto-fix: 8.5/10. Superseded by the Architect Decision below for Open Decision 1; backend story creation remains the active blocker.

## Architect Decision

- 2026-05-07: `@architect` / Aria reviewed Open Decision 1.
- Decision: use `aios-license-server` as broker for signed Pro artifact URLs backed by private Supabase Storage.
- Private npm is rejected as the customer-facing channel; it may remain maintainer/release-pipeline infrastructure.
- Implementation must add a license-server backend slice before the `aiox-core` installer can be considered Ready.
- Story status moved from `Draft — Needs Architecture Decision` to `Draft — Backend Story Required`.
- Prior PO NO-GO condition on Open Decision 1 is resolved by this architecture decision. The story remains not Ready because the backend story does not exist yet.
- Next gate: @sm should create/attach the backend story for `POST /api/v1/pro/artifact-url`, then @po re-validates PRO-13.5.

## Backend Story Revalidation

- 2026-05-08: backend dependency created as `aios-license-server/docs/stories/STORY-PRO-13.6-PRO-ARTIFACT-SIGNED-URL.md`.
- `STORY-PRO-13.6` passed `*validate-story-draft` with Verdict: GO with Auto-Fix, Score: 10/10, Status: Ready.
- T4 is complete for story-decomposition purposes.
- PRO-13.6 implementation passed local tests, lint, and build; status is now `Ready for DevOps Deploy`.
- Story status moved from `Draft — Backend Story Required` to `Blocked — PRO-13.6 Ready for DevOps Deploy`.
- Implementation must not remove public Pro files or change npm visibility until PRO-13.6 is deployed and smoke-tested with a real artifact manifest.

## Dev Agent Record

- 2026-05-08: PRO-13.6 merged via PR #6 and deployed to Vercel production (`ec0b58102eed959a025367117c8d0727c0abdda0`).
- 2026-05-08: Private Supabase Storage bucket `pro-artifacts` created; `@aiox-squads/pro@0.4.0` artifact uploaded at `@aiox-squads/pro/0.4.0/aiox-squads-pro-0.4.0.tgz`.
- 2026-05-08: `@aiox-squads/pro@0.4.1` artifact packed from the corrected Pro source, uploaded at `@aiox-squads/pro/0.4.1/aiox-squads-pro-0.4.1.tgz`, and recorded in `outputs/qa/2026-05-pro-13-5-pro-artifact-0.4.1.json`.
- 2026-05-08: Production env configured for `PRO_ARTIFACT_BUCKET`, `PRO_ARTIFACT_MANIFEST_JSON`, and `PRO_ARTIFACT_SIGNED_URL_TTL_SECONDS`; production redeploy completed.
- 2026-05-08: Production manifest updated to include both `@aiox-squads/pro@0.4.0` and `@aiox-squads/pro@0.4.1`; license-server redeployed to production as `dpl_83E1Nk88UWVwM5aFhgp7xerkan2i`.
- 2026-05-08: License-server smoke passed: missing bearer returns 401; non-Pro verified user returns 403; Pro smoke user gets signed URL; downloaded artifact matches SHA-256 and byte size; audit metadata contains no signed URL/token fields.
- 2026-05-08: Core public package surface changed: `package.json.files` no longer includes `pro/*`; `validate:publish` now fails if `npm pack --dry-run --json` includes `pro/`.
- 2026-05-08: Pro installer acquisition path added after auth/license activation: signed URL request, temp download, SHA/size verification, temp extraction through npm, and existing `stepInstallScaffold(..., { proSourceDir })`.
- 2026-05-08: `aiox-pro install` now runs the authenticated setup wizard instead of `npm install @aiox-squads/pro`.
- 2026-05-08: `aiox pro setup` now delegates to the authenticated wizard; `aiox pro update` now uses the same license-server artifact channel for real updates and no longer depends on public npm for customer-facing updates.
- 2026-05-08: Signed artifact acquisition now installs the verified `.tgz` into target `node_modules/@aiox-squads/pro` with `--no-save --package-lock=false` after hash verification, preserving existing `status`/`update` module discovery without writing npm tokens.
- 2026-05-08: `packages/installer/src/pro/pro-scaffolder.js` import corrected to the local installer module so clean packed core installs do not require a separate `@aiox-squads/installer` package.
- 2026-05-08: `pro/license/license-api.js` endpoint paths corrected from legacy `/v1/license/*` to deployed `/api/v1/license/*`; activation sends both `aioxCoreVersion` and legacy `aiosCoreVersion` for compatibility.
- 2026-05-08: Release versions aligned for publish: root `@aiox-squads/core` bumped to `5.1.16`; `pro/package.json` and `pro/package-lock.json` bumped to `@aiox-squads/pro@0.4.1`; installer default Pro artifact version changed to `0.4.1`.
- 2026-05-08: `pro/package-lock.json` drift corrected; `npm --prefix pro ci --ignore-scripts --no-audit --no-fund` passes.
- 2026-05-08: Publish/private distribution docs updated with signed artifact preconditions, privacy command, and rollback command.
- 2026-05-08: Full local smoke passed and saved to `outputs/qa/2026-05-pro-13-5-smoke.json`: core-only install has no bundled `pro/`; valid Pro user installs `@aiox-squads/pro@0.4.1` via signed artifact; invalid Pro user is blocked before content; `aiox pro update` completes through artifact channel; `.claude/commands` and `.codex/agents` file sets remain stable with zero duplicate paths.
- 2026-05-09: Post-publish drift found in npm `@aiox-squads/pro@0.4.1`: package metadata still declared legacy `aiox-core >=5.0.8` peer while the signed artifact channel used the scoped-core corrected artifact.
- 2026-05-09: Published private `@aiox-squads/pro@0.4.2` with canonical `@aiox-squads/core >=5.1.0` peer dependency and `publishConfig.access=restricted`.
- 2026-05-09: Uploaded `@aiox-squads/pro@0.4.2` to private Supabase Storage at `@aiox-squads/pro/0.4.2/aiox-squads-pro-0.4.2.tgz`; production `aios-license-server` redeployed as `dpl_EBiFzRXEhqhLBU3ZpfuF5NZ2DhXg`.
- 2026-05-09: Live production smoke for `0.4.2` passed: missing bearer returns 401, verified non-Pro user returns 403, verified Pro smoke user receives a signed URL, and downloaded artifact matches SHA-256 and byte size.
- 2026-05-09: Core patch target moved to `@aiox-squads/core@5.1.17`; installer default Pro artifact version changed to `0.4.2`.
- 2026-05-09: Published `@aiox-squads/core@5.1.17`; npm `latest` resolves to `5.1.17`; clean install smoke confirms `aiox --version` returns `5.1.17`, the installed public package has zero `pro/` paths, and the installer default points to Pro artifact `0.4.2`.
- 2026-05-08: GitHub CI follow-up fixed: `tests/pro-wizard.test.js` interactive license-key retry test now stubs the license client instead of reaching the real inline HTTP fallback, removing the Node 18 timeout while preserving prompt/retry assertions.
- 2026-05-08: Merged `origin/main` and addressed CodeRabbit actionable comments: legacy `npm notice` size-prefixed pack output is normalized before `pro/` checks, `aiox-pro install/setup/wizard -k` is accepted, artifact download has an abort timeout, and artifact-installed Pro package cleanup runs on scaffold failures.
- Validation evidence:
  - `node -c packages/installer/src/wizard/pro-setup.js && node -c packages/aiox-pro-cli/bin/aiox-pro.js && node -c bin/utils/validate-publish.js`
  - `node -c packages/installer/src/pro/pro-scaffolder.js && node -c pro/license/license-api.js && node -c .aiox-core/cli/commands/pro/index.js`
  - `npm --prefix pro ci --ignore-scripts --no-audit --no-fund && npm --prefix pro run validate:publish-surface`
  - `npm run validate:publish`
  - `npm run typecheck`
  - `npm test -- --runInBand tests/pro-wizard.test.js tests/installer/pro-setup-auth.test.js tests/installer/pro-scaffolder.test.js tests/cli/validate-publish.test.js tests/pro/pro-updater.test.js tests/pro-recover.test.js`
  - `npx jest --runInBand tests/license/license-api.test.js --testPathIgnorePatterns='node_modules'`
  - full smoke matrix saved in `outputs/qa/2026-05-pro-13-5-smoke.json`
  - Pro artifact upload evidence saved in `outputs/qa/2026-05-pro-13-5-pro-artifact-0.4.1.json`
  - Vercel production manifest update evidence saved in `outputs/qa/2026-05-pro-13-5-vercel-manifest-0.4.1.json`
  - Pro `0.4.2` artifact and privacy evidence saved in `outputs/qa/2026-05-pro-13-5-pro-artifact-0.4.2.json`
  - Post-publish evidence saved in `outputs/qa/2026-05-pro-13-5-publish-0.4.2-5.1.17.json`
  - `npm pack --dry-run --json` for `@aiox-squads/core@5.1.17` captured in `outputs/qa/2026-05-pro-13-5-core-pack-dry-run-5.1.17.json` with `proFileCount: 0`.
  - `npm pack --dry-run --json` captured in `outputs/qa/2026-05-pro-13-5-core-pack-dry-run.json` with `proFileCount: 0`.
  - `npm access get status @aiox-squads/pro --json` captured as `private` after signed artifact smoke passed.

## Change Log

| Date | Version | Description | Author |
| --- | --- | --- | --- |
| 2026-05-07 | 0.1 | Initial follow-up story drafted from PRO-13.2 publication/security discussion | River (SM) |
| 2026-05-07 | 0.2 | PO validation auto-fixes: renumbered to PRO-13.5, corrected active package version assumptions, reconciled fallback policy with Epic 124 | Pax (PO) |
| 2026-05-07 | 0.3 | Architect decision proposed: license-server signed Pro artifact URL backed by private Supabase Storage; private npm rejected as customer-facing channel | Aria (Architect) |
| 2026-05-07 | 0.4 | Architect result incorporated: Open Decision 1 resolved; remaining blocker narrowed to backend story creation and PO re-validation | Codex |
| 2026-05-08 | 0.5 | Backend story PRO-13.6 created/validated Ready; T4 marked complete; story now blocked on PRO-13.6 deploy/smoke | Codex |
| 2026-05-08 | 0.6 | PRO-13.6 deployed/smoked; core publish boundary and signed artifact acquisition implemented; focused validation evidence captured | Codex |
| 2026-05-08 | 0.7 | Full core/pro smoke matrix passed; customer update moved to signed artifact channel; story ready for DevOps publish/privacy transition | Codex |
| 2026-05-08 | 0.8 | Versions bumped to core 5.1.16 and Pro 0.4.1; Pro 0.4.1 artifact uploaded and production manifest redeployed; final smoke passed on 0.4.1 | Codex |
| 2026-05-09 | 0.9 | Post-publish npm drift corrected with private Pro 0.4.2, production artifact smoke passed, and core patch target advanced to 5.1.17 | Codex |
| 2026-05-09 | 1.0 | `@aiox-squads/core@5.1.17` published and smoke-validated against Pro artifact `0.4.2` | Codex |
