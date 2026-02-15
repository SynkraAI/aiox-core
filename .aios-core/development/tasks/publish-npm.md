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

# npm Publishing Pipeline: Preview to Latest

## Purpose

Safe, validated npm publishing using a two-phase release strategy:
1. **Preview**: Publish to `preview` dist-tag for testing
2. **Promote**: After validation, promote `preview` to `latest`

This prevents broken releases reaching users (like v4.0.0-v4.0.4 incident).

## Commands

### `*publish-preview` - Publish as Preview

Publishes a new version to npm under the `preview` dist-tag.

#### Workflow

```
1. PRE-FLIGHT CHECKS
   - Verify: branch = main, working tree clean
   - Verify: git is up-to-date with remote (git fetch + compare)

2. QUALITY GATES
   - npm run lint
   - npm run typecheck
   - npm test

3. PACKAGE VALIDATION
   - npm run validate:package
   (runs scripts/validate-package-completeness.js)
   - Confirms: hooks, rules, bin, core config present
   - Confirms: pro/ NOT in tarball

4. VERSION BUMP
   - Ask user: patch | minor | major
   - npm version {type} --no-git-tag-version
   - git add package.json package-lock.json
   - git commit -m "chore(release): bump version to {new_version}"

5. PUBLISH
   - npm publish --tag preview
   - Verify: npm view aios-core@preview version === {new_version}

6. SMOKE TEST
   - Create temp directory
   - npm init -y
   - npm install aios-core@preview
   - Verify critical files exist in node_modules/aios-core/:
     - .claude/hooks/synapse-engine.js
     - .aios-core/core-config.yaml
     - bin/aios.js
   - Clean up temp directory

7. PUSH VERSION COMMIT
   - git push origin main

8. REPORT
   - "v{X.Y.Z} published as preview"
   - "Test with: npm install aios-core@preview"
   - "When ready: *promote-latest"
```

#### Pre-conditions

- [ ] On `main` branch
- [ ] Working tree clean (no uncommitted changes)
- [ ] All quality gates pass (lint, typecheck, test)
- [ ] Package validation passes (validate-package-completeness.js)
- [ ] npm auth configured (`npm whoami` succeeds)

#### Post-conditions

- [ ] New version published to npm with `preview` tag
- [ ] `npm view aios-core@preview` returns new version
- [ ] Smoke test passes (critical files present in installed package)
- [ ] Version bump committed and pushed to main

---

### `*promote-latest` - Promote Preview to Latest

Promotes a tested `preview` version to the `latest` dist-tag.

#### Workflow

```
1. VERIFY PREVIEW EXISTS
   - npm view aios-core@preview version
   - If no preview: HALT with "No preview version found"

2. CONFIRM WITH USER
   - Display: "Promote v{X.Y.Z} from preview to latest?"
   - Show current latest: npm view aios-core@latest version
   - Require explicit confirmation

3. PROMOTE
   - npm dist-tag add aios-core@{version} latest

4. VERIFY
   - npm view aios-core@latest version === {version}
   - If mismatch: HALT with error

5. TAG & RELEASE
   - git tag v{version}
   - git push origin v{version}
   - gh release create v{version} --generate-notes --latest

6. REPORT
   - "v{X.Y.Z} promoted to latest"
   - Release URL
   - "Install with: npm install aios-core"
```

#### Pre-conditions

- [ ] Preview version exists (`npm view aios-core@preview`)
- [ ] User has tested the preview version
- [ ] npm auth configured
- [ ] GitHub CLI authenticated (`gh auth status`)

#### Post-conditions

- [ ] `npm view aios-core@latest` returns promoted version
- [ ] Git tag `v{version}` created and pushed
- [ ] GitHub Release created with auto-generated notes

---

### `*test-install` - Test Installation in Clean Environment

Tests package installation from a specific dist-tag in a clean temporary directory.

#### Workflow

```
1. SETUP
   - Create temporary directory
   - npm init -y

2. INSTALL
   - npm install aios-core@{tag} (default: latest)
   - Record: install time, exit code, warnings

3. VERIFY FILES
   - Check node_modules/aios-core/ contains:
     - .aios-core/core-config.yaml
     - .aios-core/constitution.md
     - .aios-core/development/agents/ (non-empty)
     - .aios-core/development/tasks/ (non-empty)
     - .claude/hooks/synapse-engine.js
     - .claude/hooks/precompact-session-digest.js
     - .claude/rules/ (non-empty)
     - bin/aios.js
     - bin/aios-minimal.js
   - Check node_modules/aios-core/ does NOT contain:
     - pro/
     - .env
     - .git/
     - tests/

4. TEST INSTALLER (optional, if --full flag)
   - npx aios-core install --preset minimal
   - Verify: .aios-core/ created
   - Verify: .claude/hooks/ created
   - Verify: .claude/rules/ created

5. CLEANUP
   - Remove temporary directory

6. REPORT
   - Package version installed
   - All critical files: present/missing
   - Excluded content: clean/leaked
   - Overall: PASS/FAIL
```

#### Parameters

- `tag`: dist-tag to test (default: `latest`)
- `--full`: Also test `npx aios-core install`

---

## Rollback Procedure

If a broken version reaches `latest`:

```bash
# 1. Identify previous good version
npm view aios-core versions --json

# 2. Point latest back to previous version
npm dist-tag add aios-core@{previous-good-version} latest

# 3. Deprecate broken version with message
npm deprecate aios-core@{broken-version} "Known issues, use v{previous-good-version}"

# 4. Verify
npm view aios-core@latest version
```

**Important:** `npm deprecate` shows a warning on install but does NOT prevent installation.
To fully block a version, use `npm unpublish aios-core@{version}` (within 72h of publish only).

---

## Configuration Reference

See `core-config.yaml` section `npm_registry` for:
- Required files list
- Excluded paths list
- Smoke test configuration
- Auth strategy

---

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| `npm ERR! 403` | Auth issue | Run `npm login`, check token permissions |
| `npm ERR! 402` | Paid feature | Ensure package is public (`--access public`) |
| Smoke test fails | Files missing from tarball | Fix `files` array in package.json, re-validate |
| promote fails | Version not on preview | Run `*publish-preview` first |
| Tag already exists | Re-publishing same version | Bump version or use `--force` (with caution) |

---

## Metadata

```yaml
story: INS-2 (Release Pipeline: Preview to Latest)
version: 1.0.0
dependencies:
  - release-management.md
  - github-devops-pre-push-quality-gate.md
tags:
  - npm
  - release
  - publishing
  - preview
created: 2026-02-13
```
