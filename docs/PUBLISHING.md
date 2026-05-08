# AIOX Squads Publishing Protocol

This document is the operational protocol for Epic 124: migrating npm packages to the canonical `@aiox-squads/*` scope.

## Current Verified State

Verified on 2026-05-06:

| Check                                             | Result                                                                          |
| ------------------------------------------------- | ------------------------------------------------------------------------------- |
| `npm whoami`                                      | `rafaelscosta`                                                                  |
| `npm org ls aiox-squads --json`                   | `rafaelscosta` is `owner`                                                       |
| `npm access list packages @aiox-squads --json`    | `{}`; org exists and has no published packages yet                              |
| `npm access list packages @aios-fullstack --json` | 7 legacy packages visible with `read-write` access                              |
| `npm owner ls aiox-core --json`                   | `rafaelscosta` and `pedrovaleriolopez` are listed owners                        |
| `gh repo view SynkraAI/aiox-core`                 | authenticated user has `ADMIN` permission                                       |
| `gh repo view SynkraAI/aiox-pro`                  | authenticated user has `ADMIN` permission                                       |
| `npm token list --json`                           | publish token for `@aiox-squads` visible, `bypass_2fa` true, expires 2026-08-04 |
| token smoke test via temporary `.npmrc`           | `npm whoami` returned `rafaelscosta`                                            |
| `gh secret list --repo SynkraAI/aiox-core`        | `NPM_TOKEN_AIOX_SQUADS` present                                                 |
| `gh secret list --repo SynkraAI/aiox-pro`         | `NPM_TOKEN_AIOX_SQUADS` present                                                 |

Maintainer invite status:

```text
Pedrovaleriolopez -> pending; CLI invite blocked by npm EOTP/browser auth
oalanicolas       -> pending; CLI invite blocked by npm EOTP/browser auth
```

Resolve pending invites through npm org Settings -> Members, or repeat `npm org set` from an authenticated terminal after completing the browser confirmation flow.

## Canonical Package Map

Approved target names from Story 124.1:

```text
aiox-core             -> @aiox-squads/core
@synkra/aiox-install -> @aiox-squads/aiox-install
aiox-pro             -> @aiox-squads/aiox-pro-cli
@aiox/installer      -> @aiox-squads/installer
```

Reserved external Pro package:

```text
@aiox-fullstack/pro or @aios-fullstack/pro -> @aiox-squads/pro
```

Preserve user-facing bins:

```text
aiox
aiox-core
aiox-minimal
aiox-graph
aiox-install
edmcp
aiox-pro
aiox-installer
```

## Prerequisites

Before any publish story runs:

1. `rafaelscosta` must remain owner of the npm org `@aiox-squads`.
2. Maintainers must be invited to `@aiox-squads`:
   - `Pedrovaleriolopez`
   - `oalanicolas`
3. An npm publish token with read/publish permission for `@aiox-squads` must be available.
4. The token must be stored in both GitHub repos:
   - `SynkraAI/aiox-core` as `NPM_TOKEN_AIOX_SQUADS`
   - `SynkraAI/aiox-pro` as `NPM_TOKEN_AIOX_SQUADS`
5. Existing legacy package access must remain available for deprecation stories:
   - `@aios-fullstack/*` packages require read/write access for `npm deprecate`.
   - `aiox-core` requires owner or publisher access for `npm deprecate`.

## DevOps Commands

Run these only from a trusted DevOps terminal. Do not paste tokens into chat or committed files.

### Verify npm Auth

```bash
npm whoami --registry=https://registry.npmjs.org/
npm org ls aiox-squads --json
npm access list packages @aiox-squads --json
npm access list packages @aios-fullstack --json
npm owner ls aiox-core --json
```

### Invite npm Maintainers

Use the npm website if the CLI requires browser confirmation or two-factor flow:

```text
https://www.npmjs.com/org/aiox-squads/teams
```

CLI option, if available in the authenticated npm session:

```bash
npm org set aiox-squads Pedrovaleriolopez developer
npm org set aiox-squads oalanicolas developer
npm org ls aiox-squads --json
```

If npm normalizes usernames to lowercase, preserve the returned canonical casing in the story evidence.

### Generate Automation Token

Generate the token through npm account settings:

```text
Profile -> Access Tokens -> Generate New Token -> Automation
```

Scope/purpose:

```text
name: NPM_TOKEN_AIOX_SQUADS
permission: Read and Publish
scope: @aiox-squads
```

Smoke test in a temporary shell:

```bash
export NPM_TOKEN_AIOX_SQUADS='paste-token-here'
npm whoami --registry=https://registry.npmjs.org/
```

### Store GitHub Secrets

```bash
printf '%s' "$NPM_TOKEN_AIOX_SQUADS" | gh secret set NPM_TOKEN_AIOX_SQUADS --repo SynkraAI/aiox-core
printf '%s' "$NPM_TOKEN_AIOX_SQUADS" | gh secret set NPM_TOKEN_AIOX_SQUADS --repo SynkraAI/aiox-pro

gh secret list --repo SynkraAI/aiox-core
gh secret list --repo SynkraAI/aiox-pro
```

Expected result: both repos list `NPM_TOKEN_AIOX_SQUADS`.

## Publish Flow

### Story 124.3 - `@aiox-squads/core`

Pre-publish checks:

```bash
npm view aiox-core version --json
npm view @aiox-squads/core version --json
npm pack --dry-run --json
```

Expected before first publish:

```text
aiox-core -> published, currently 5.0.7 in registry
@aiox-squads/core -> 404
```

Important: `@aiox-squads/core@5.1.0` is the continuity publish after the last legacy registry version, `aiox-core@5.0.7`. Confirm the local root `package.json` remains `@aiox-squads/core` at `5.1.0` before publishing.

### Story 124.4 - `@aiox-squads/pro`

This package is cross-repo and belongs to `SynkraAI/aiox-pro`.

Required changes:

```text
package name -> @aiox-squads/pro
peer dependency -> @aiox-squads/core >=5.1.0
publish token -> NPM_TOKEN_AIOX_SQUADS in SynkraAI/aiox-pro
```

### PRO-13.5 - Private Pro Distribution

Customer-facing Pro distribution must use the license-server signed artifact channel, not npm org membership.

Pre-publish checks for the public core package:

```bash
npm run validate:publish
npm pack --dry-run --json > outputs/qa/<date>-pro-13-5-core-pack-dry-run.json
node -e "const p=require('./outputs/qa/<date>-pro-13-5-core-pack-dry-run.json')[0]; const files=p.files.map(f=>f.path); if (files.some(f=>f==='pro'||f.startsWith('pro/'))) process.exit(1)"
```

Expected result:

```text
@aiox-squads/core public tarball includes 0 files under pro/
@aiox-squads/pro remains public until authenticated install/update smoke passes
```

DevOps artifact channel checks:

```bash
npm view @aiox-squads/core version dist-tags --json
npm view @aiox-squads/pro version dist-tags --json
npm access get status @aiox-squads/pro --json
```

`@aiox-squads/pro` may be changed to private only after all of these pass:

1. Production `aios-license-server` has `PRO_ARTIFACT_BUCKET`, `PRO_ARTIFACT_MANIFEST_JSON`, and `PRO_ARTIFACT_SIGNED_URL_TTL_SECONDS`.
2. A verified Pro user can request `POST /api/v1/pro/artifact-url`, download the `.tgz`, and match manifest `sha256` and `sizeBytes`.
3. A verified non-Pro user receives 403.
4. A core-only install without npm token does not receive `pro/` content.
5. Existing Pro update/install does not duplicate slash commands, agent activators, or generated skills.

Privacy transition command, after smoke:

```bash
npm access set status=private @aiox-squads/pro
npm access get status @aiox-squads/pro --json
```

Rollback if valid customers are blocked:

```bash
npm access set status=public @aiox-squads/pro
npm access get status @aiox-squads/pro --json
```

If a public core publish accidentally omits required core files, correct the package metadata, publish the next patch, and move the `latest` dist-tag to the corrected version:

```bash
npm dist-tag add @aiox-squads/core@<corrected-version> latest
npm view @aiox-squads/core version dist-tags --json
```

### Story 124.5 - Monorepo Packages

Target names:

```text
packages/aiox-install   -> @aiox-squads/aiox-install
packages/aiox-pro-cli   -> @aiox-squads/aiox-pro-cli
packages/installer      -> @aiox-squads/installer
```

Publish-readiness risks from Story 124.1:

1. `packages/installer/package.json` points `main` and bin `aiox-installer` to `src/index.js`, but that file is absent. Fix the entrypoint before publish.
2. `packages/aiox-pro-cli/bin/aiox-pro.js` requires `../../installer/src/wizard/pro-setup`, but `npm pack --dry-run` for the CLI package does not include the installer package source. Replace the relative workspace import before publish.

## Deprecation Flow

Run only after replacement packages are published and validated.

### Legacy AIOS Packages

Verified current access:

```text
@aios-fullstack/core         read-write
@aios-fullstack/memory       read-write
@aios-fullstack/security     read-write
@aios-fullstack/performance  read-write
@aios-fullstack/telemetry    read-write
@aios-fullstack/workspace    read-write
@aios-fullstack/pro          read-write
```

Example command pattern:

```bash
npm deprecate '@aios-fullstack/core@4.31.0' 'AIOS v4.x was consolidated into AIOX. Migrate to @aiox-squads/core. See docs/MIGRATION-AIOX-SQUADS.md'
```

### Unscoped `aiox-core`

Verified owners:

```text
rafaelscosta
pedrovaleriolopez
```

Example command pattern:

```bash
npm deprecate 'aiox-core' 'Renamed to @aiox-squads/core. Run: npm install @aiox-squads/core. See docs/MIGRATION-AIOX-SQUADS.md'
```

## Rollback

If publish fails before any package is visible:

1. Stop the publish story.
2. Do not deprecate legacy packages.
3. Re-run `npm view <target> version --json` to confirm no partial publish exists.
4. Fix package metadata locally.
5. Re-run `npm pack --dry-run --json`.

If publish succeeds but consumer code is not ready:

1. Keep the new package published.
2. Do not deprecate legacy packages yet.
3. Keep existing consumer fallbacks until Story 124.6 lands.
4. Document the gap in the story before handoff.

If a deprecation message is wrong:

```bash
npm deprecate '<package>@<range>' ''
npm deprecate '<package>@<range>' '<corrected message>'
```

## Troubleshooting

| Symptom                                               | Likely cause                                           | Recovery                                                                              |
| ----------------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| `npm whoami` fails                                    | npm auth expired                                       | Run `npm login`, then repeat `npm whoami`.                                            |
| `npm org ls aiox-squads` fails                        | wrong npm account or org access missing                | Confirm account is `rafaelscosta`; verify owner status in npm org settings.           |
| `gh secret set` fails                                 | missing repo admin permission or GitHub auth expired   | Run `gh auth status`; confirm `viewerPermission` is `ADMIN`.                          |
| `npm publish --access public` fails                   | token lacks publish rights or package metadata invalid | Verify automation token scope and run `npm pack --dry-run --json`.                    |
| `npm publish` prompts for OTP in CI                   | wrong token type                                       | Generate an Automation token, not a classic interactive token.                        |
| `npx @aiox-squads/installer` fails                    | package bin or entrypoint mismatch                     | Fix `packages/installer` entrypoint before publish.                                   |
| `npx @aiox-squads/aiox-pro-cli` fails on wizard/setup | relative workspace import leaked into package          | Replace the relative installer import with a package dependency or delegated command. |

## Secret Hygiene

- Never commit npm tokens, GitHub tokens, `.npmrc` auth lines, or `.env` values.
- Use `gh secret set` from stdin.
- Keep token names stable across workflows: `NPM_TOKEN_AIOX_SQUADS`.
- Document only verification results, never token values.
