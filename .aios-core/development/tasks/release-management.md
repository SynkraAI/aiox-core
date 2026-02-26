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

## Purpose

To automate the complete software release process, including:

- Semantic versioning (major.minor.patch)
- Changelog generation from commits
- Git tagging
- GitHub/GitLab Release creation
- Package publishing (npm, PyPI, Docker, etc.)
- Release notes generation

## Input

### Required Parameters

- **repository_path**: `string`
  - **Description**: Local path or URL of repository
  - **Example**: `/path/to/project` or `https://github.com/user/repo`
  - **Validation**: Must be valid Git repository

- **release_type**: `string`
  - **Description**: Type of release to create
  - **Options**: `"auto"` (detect from commits), `"major"`, `"minor"`, `"patch"`, `"prerelease"`
  - **Default**: `"auto"`

### Optional Parameters

- **release_branch**: `string`
  - **Description**: Branch to release from
  - **Default**: `"main"`
  - **Note**: Must be default branch for production releases

- **changelog_format**: `string`
  - **Description**: Changelog style
  - **Options**: `"keep-a-changelog"`, `"angular"`, `"conventional-commits"`
  - **Default**: `"conventional-commits"`

- **package_registry**: `array<string>`
  - **Description**: Where to publish package
  - **Options**: `["npm"]`, `["pypi"]`, `["docker-hub"]`, `["github-packages"]`
  - **Default**: Auto-detect from project type

- **dry_run**: `boolean`
  - **Description**: Test release without publishing
  - **Default**: `false`

- **prerelease_tag**: `string`
  - **Description**: Tag for prerelease (if release_type="prerelease")
  - **Examples**: `"alpha"`, `"beta"`, `"rc"`
  - **Default**: `"beta"`

- **skip_ci**: `boolean`
  - **Description**: Skip CI checks (emergency releases only)
  - **Default**: `false`
  - **Warning**: Only use for critical hotfixes

## Output

- **new_version**: `string`
  - **Description**: Version number created
  - **Example**: `"2.1.3"`

- **git_tag**: `string`
  - **Description**: Git tag created
  - **Example**: `"v4.0.4.3"`

- **changelog**: `string`
  - **Description**: Generated CHANGELOG.md content for this release

- **release_url**: `string`
  - **Description**: URL to GitHub/GitLab Release
  - **Example**: `"https://github.com/user/repo/releases/tag/v4.0.4.3"`

- **published_packages**: `array<object>`
  - **Description**: Published packages with URLs
  - **Structure**: `{ registry, package_name, version, url }`
  - **Example**: `[{ registry: "npm", package_name: "aios-core", version: "2.1.3", url: "https://npmjs.com/package/aios-core" }]`

- **release_notes**: `string`
  - **Description**: Formatted release notes (for announcements)

- **breaking_changes**: `array<string>`
  - **Description**: List of breaking changes (if any)
  - **Note**: Empty array if backward compatible

## Process

### Phase 1: Pre-Release Validation (2 min)

1. **Validate Repository State**
   - Check if on release branch
   - Verify no uncommitted changes
   - Ensure branch is up-to-date with remote
   - Check CI status (must be passing unless skip_ci=true)

2. **🔴 CRITICAL: Validate Tag Reachability**
   - Check which version tags are reachable from HEAD
   - Run: `git merge-base --is-ancestor <tag> HEAD` for each tag
   - **If NO tags are reachable** → semantic-release will create v1.0.0!
   - This can happen after `git filter-repo` rewrites history
   - **Resolution**: Create a baseline tag at current package.json version:
     ```bash
     git tag v$(node -p "require('./package.json').version")
     git push origin v$(node -p "require('./package.json').version")
     ```

3. **Analyze Commits Since Last Release**
   - Get last version tag (e.g., `v4.0.4.2`)
   - Get commits since last tag: `git log v4.0.4.2..HEAD`
   - Parse commit messages (Conventional Commits)

4. **Determine Version Bump**
   - If `release_type="auto"`:
     - **BREAKING CHANGE** in commits → **major** bump (2.1.2 → 3.0.0)
     - **feat:** commits → **minor** bump (2.1.2 → 2.2.0)
     - **fix:** commits → **patch** bump (2.1.2 → 2.1.3)
     - No eligible commits → **HALT** (nothing to release)
   - Else: Use specified `release_type`
   - Calculate new version: `{major}.{minor}.{patch}`

5. **Check Breaking Changes**
   - Scan for `BREAKING CHANGE:` or `!` in commit messages
   - Extract breaking change descriptions
   - If found and major bump not planned → **WARN** user

### Phase 2: Changelog Generation (2 min)

5. **Generate CHANGELOG.md Updates**
   - Group commits by type:
     - **Breaking Changes** (⚠️)
     - **Features** (✨ feat:)
     - **Bug Fixes** (🐛 fix:)
     - **Performance** (⚡ perf:)
     - **Documentation** (📝 docs:)
     - **Refactoring** (♻️ refactor:)
     - **Tests** (✅ test:)
     - **Chores** (🔧 chore:)
   - Format according to `changelog_format`
   - Prepend to CHANGELOG.md

   **Example Output (Conventional Commits format):**

   ```markdown
   ## [2.1.3] - 2025-11-13

   ### ⚠️ Breaking Changes

   - API endpoint `/v1/users` renamed to `/v2/users` (#42)

   ### ✨ Features

   - Add user authentication with OAuth2 (#38)
   - Implement rate limiting for API (#40)

   ### 🐛 Bug Fixes

   - Fix memory leak in database connection pool (#39)
   - Correct timezone handling in date filters (#41)

   ### 📝 Documentation

   - Update API documentation with new endpoints (#43)
   ```

6. **Generate Release Notes**
   - Extract highlights (most impactful changes)
   - Format for social media / announcements
   - Include contributor credits
   - Add migration guide if breaking changes

### Phase 3: Version Bumping (1 min)

7. **Update Version Files**
   - **Node.js**: Update `package.json` version
   - **Python**: Update `setup.py` or `pyproject.toml` version
   - **Rust**: Update `Cargo.toml` version
   - **Go**: Update VERSION file or version constant
   - **Docker**: Update Dockerfile labels

8. **Commit Version Changes**
   - Create commit: `chore(release): bump version to {new_version}`
   - Include updated CHANGELOG.md
   - **DO NOT PUSH YET** (will push after tagging)

### Phase 4: Git Tagging & Release (3 min)

9. **Create Git Tag**
   - Create annotated tag: `git tag -a v{new_version} -m "Release v{new_version}"`
   - Include release notes in tag message

10. **Push to Remote**
    - Push commits: `git push origin {release_branch}`
    - Push tags: `git push origin v{new_version}`
    - Wait for remote to accept

11. **Create GitHub/GitLab Release**
    - Use GitHub CLI:
      ```bash
      gh release create v{new_version} \
        --title "Release v{new_version}" \
        --notes-file release-notes.md \
        --latest
      ```
    - Attach build artifacts (if applicable):
      - Binary executables
      - Docker images
      - Tarball archives

### Phase 5: Package Publishing (5 min)

12. **Publish to Package Registries** (if configured)

    **npm:**

    ```bash
    npm publish --access public
    # Or for scoped packages:
    npm publish @scope/package --access public
    ```

    **PyPI:**

    ```bash
    python -m build
    twine upload dist/*
    ```

    **Docker Hub:**

    ```bash
    docker build -t user/image:{new_version} .
    docker push user/image:{new_version}
    docker tag user/image:{new_version} user/image:latest
    docker push user/image:latest
    ```

    **GitHub Packages:**

    ```bash
    docker tag image:latest ghcr.io/user/repo:{new_version}
    docker push ghcr.io/user/repo:{new_version}
    ```

13. **Verify Publication**
    - Check package registry for new version
    - Test installation: `npm install package@{new_version}`
    - Confirm download count increments

### Phase 6: Post-Release Tasks (2 min)

14. **Update Documentation**
    - If docs versioned, create new version folder
    - Update README badges (version, downloads)
    - Update CHANGELOG.md link in README

15. **Create Release Announcement**
    - Generate social media posts
    - Update project website (if applicable)
    - Send notification to mailing list / Discord / Slack

16. **Create Post-Release Report**
    - Summary of changes
    - Links to release, packages, documentation
    - Next steps or planned features

## Checklist

### Pre-conditions

- [ ] On correct release branch
  - **Validation**: `git branch --show-current === release_branch`
  - **Error**: "Not on release branch. Switch to {release_branch} first."

- [ ] No uncommitted changes
  - **Validation**: `git status --porcelain` returns empty
  - **Error**: "Uncommitted changes detected. Commit or stash before releasing."

- [ ] CI passing (unless skip_ci=true)
  - **Validation**: GitHub API check status
  - **Error**: "CI checks failing. Fix before releasing or use --skip-ci for emergency."

- [ ] New commits since last release
  - **Validation**: `git log {last_tag}..HEAD` not empty
  - **Error**: "No new commits since last release. Nothing to release."

### Post-conditions

- [ ] Git tag created and pushed
  - **Validation**: `git tag -l v{new_version}` exists remotely
  - **Test**: `git ls-remote --tags origin | grep v{new_version}`

- [ ] CHANGELOG.md updated
  - **Validation**: File contains new version section
  - **Test**: `grep "## \[{new_version}\]" CHANGELOG.md`

- [ ] GitHub Release created
  - **Validation**: `gh release view v{new_version}` succeeds
  - **Test**: Visit `{release_url}` and verify

- [ ] Package published (if configured)
  - **Validation**: Package registry returns new version
  - **Test**: `npm view package version` === `{new_version}`

### Acceptance Criteria

- [ ] Release follows semantic versioning
  - **Type**: acceptance
  - **Test**: Version format is `{major}.{minor}.{patch}` or `{major}.{minor}.{patch}-{prerelease}`

- [ ] Changelog is accurate and complete
  - **Type**: acceptance
  - **Manual Check**: true
  - **Criteria**: All significant changes documented

- [ ] Package is installable
  - **Type**: acceptance
  - **Test**: Fresh install succeeds: `npm install -g package@{new_version}`

## Templates

### Release Notes Template

````markdown
# Release v{new_version}

**Date**: {release_date}
**Type**: {release_type} ({major|minor|patch})

## Highlights

{top_3_most_impactful_changes}

## What's Changed

{changelog_content}

## Breaking Changes

{breaking_changes_section if any}

### Migration Guide

{migration_steps if breaking changes}

## Contributors

Thank you to all contributors who made this release possible:

{contributor_list with GitHub handles}

## Install

\`\`\`bash
npm install {package_name}@{new_version}

# or

pip install {package_name}=={new_version}
\`\`\`

## Links

- [Full Changelog]({compare_url})
- [Documentation]({docs_url})
- [Issues]({issues_url})

---

## Execution Modes

**Choose your execution mode:**

### 1. YOLO Mode - Fast, Autonomous (0-1 prompts)

- Autonomous decision making with logging
- Minimal user interaction
- **Best for:** Simple, deterministic tasks

### 2. Interactive Mode - Balanced, Educational (5-10 prompts) **[DEFAULT]**

- Explicit decision checkpoints
- Educational explanations
- **Best for:** Learning, complex decisions

### 3. Pre-Flight Planning - Comprehensive Upfront Planning

- Task analysis phase (identify all ambiguities)
- Zero ambiguity execution
- **Best for:** Ambiguous requirements, critical work

**Parameter:** `mode` (optional, default: `interactive`)

---

## Task Definition (AIOS Task Format V1.0)

```yaml
task: releaseManagement()
responsável: Gage (Automator)
responsavel_type: Agente
atomic_layer: Organism

**Entrada:**
- campo: task
  tipo: string
  origem: User Input
  obrigatório: true
  validação: Must be registered task

- campo: parameters
  tipo: object
  origem: User Input
  obrigatório: false
  validação: Valid task parameters

- campo: mode
  tipo: string
  origem: User Input
  obrigatório: false
  validação: yolo|interactive|pre-flight

**Saída:**
- campo: execution_result
  tipo: object
  destino: Memory
  persistido: false

- campo: logs
  tipo: array
  destino: File (.ai/logs/*)
  persistido: true

- campo: state
  tipo: object
  destino: State management
  persistido: true
```
````

---

## Pre-Conditions

**Purpose:** Validate prerequisites BEFORE task execution (blocking)

**Checklist:**

```yaml
pre-conditions:
  - [ ] Task is registered; required parameters provided; dependencies met
    tipo: pre-condition
    blocker: true
    validação: |
      Check task is registered; required parameters provided; dependencies met
    error_message: "Pre-condition failed: Task is registered; required parameters provided; dependencies met"
```

---

## Post-Conditions

**Purpose:** Validate execution success AFTER task completes

**Checklist:**

```yaml
post-conditions:
  - [ ] Task completed; exit code 0; expected outputs created
    tipo: post-condition
    blocker: true
    validação: |
      Verify task completed; exit code 0; expected outputs created
    error_message: "Post-condition failed: Task completed; exit code 0; expected outputs created"
```

---

## Acceptance Criteria

**Purpose:** Definitive pass/fail criteria for task completion

**Checklist:**

```yaml
acceptance-criteria:
  - [ ] Task completed as expected; side effects documented
    tipo: acceptance-criterion
    blocker: true
    validação: |
      Assert task completed as expected; side effects documented
    error_message: "Acceptance criterion not met: Task completed as expected; side effects documented"
```

---

## Scripts

**Agent-specific code for this task:**

- **Script:** execute-task.js
  - **Purpose:** Generic task execution wrapper
  - **Language:** JavaScript
  - **Location:** .aios-core/scripts/execute-task.js

---

## Error Handling

**Strategy:** retry

**Common Errors:**

1. **Error:** Task Not Found
   - **Cause:** Specified task not registered in system
   - **Resolution:** Verify task name and registration
   - **Recovery:** List available tasks, suggest similar

2. **Error:** Invalid Parameters
   - **Cause:** Task parameters do not match expected schema
   - **Resolution:** Validate parameters against task definition
   - **Recovery:** Provide parameter template, reject execution

3. **Error:** Execution Timeout
   - **Cause:** Task exceeds maximum execution time
   - **Resolution:** Optimize task or increase timeout
   - **Recovery:** Kill task, cleanup resources, log state

---

## Performance

**Expected Metrics:**

```yaml
duration_expected: 5-15 min (estimated)
cost_estimated: $0.003-0.010
token_usage: ~3,000-10,000 tokens
```

**Optimization Notes:**

- Break into smaller workflows; implement checkpointing; use async processing where possible

---

## Metadata

```yaml
story: N/A
version: 1.0.0
dependencies:
  - N/A
tags:
  - automation
  - workflow
updated_at: 2025-11-17
```

---

**Full Changelog**: {compare_url}

```

### Social Media Announcement Template

```

🚀 {package_name} v{new_version} is out!

{highlight_1}
{highlight_2}
{highlight_3}

Install: npm install {package_name}@{new_version}

Release notes: {release_url}

#opensource #release #{package_name}

````

## Tools

- **github-cli**:
  - **Version**: 2.0.0
  - **Used For**: Create releases, tags, manage repository
  - **Required**: true

- **semantic-release**:
  - **Version**: 20.0.0
  - **Used For**: Automate versioning based on commits
  - **Optional**: true (can use manual versioning)

- **conventional-changelog**:
  - **Version**: 4.0.0
  - **Used For**: Generate CHANGELOG from Conventional Commits
  - **Optional**: true

## Performance

- **Duration Expected**: 15 minutes (including publishing)
- **Cost Estimated**: $0 (uses free GitHub Actions, public registries)
- **Cacheable**: false (each release is unique)
- **Parallelizable**: false (sequential process required)

## Error Handling

- **Strategy**: abort
- **Fallback**: N/A (releases cannot be partially done)
- **Retry**:
  - **Max Attempts**: 2 (for network failures)
  - **Backoff**: linear
  - **Backoff MS**: 5000
- **Abort Workflow**: true (release must succeed completely or rollback)
- **Notification**: log + email + Slack (if configured)
- **Rollback**: If publish fails, delete Git tag and revert version bump commit

## Metadata

- **Story**: Epic 10 (Critical Dependency Resolution)
- **Version**: 1.0.0
- **Dependencies**: `github-cli`, optional: `semantic-release`
- **Author**: Brad Frost Clone
- **Created**: 2025-11-13
- **Updated**: 2025-11-13
- **Breaking Changes**: None (new task)

---

## Usage Examples

### Example 1: Automatic Semantic Release

```bash
aios activate Otto  # github-devops agent
aios release create --repo="." --type="auto"
````

**Output**: Analyzes commits, determines version bump, creates release

### Example 2: Major Release (Breaking Changes)

```bash
aios release create \
  --repo="." \
  --type="major" \
  --publish="npm,docker-hub"
```

**Output**: Major version bump (e.g., 2.1.3 → 3.0.0), publishes to npm + Docker

### Example 3: Prerelease (Beta)

```bash
aios release create \
  --repo="." \
  --type="prerelease" \
  --prerelease-tag="beta" \
  --branch="develop"
```

**Output**: Beta release (e.g., 2.2.0-beta.1)

### Example 4: Dry Run (Test Release Process)

```bash
aios release create \
  --repo="." \
  --type="minor" \
  --dry-run=true
```

**Output**: Simulates release, shows what would be created, NO actual changes

---

## Conventional Commits Reminder

For automatic versioning, follow **Conventional Commits** format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**

- `feat:` - New feature (MINOR bump)
- `fix:` - Bug fix (PATCH bump)
- `docs:` - Documentation only
- `style:` - Code style changes (formatting)
- `refactor:` - Code refactoring
- `perf:` - Performance improvements
- `test:` - Adding tests
- `chore:` - Maintenance tasks

**Breaking Changes:**

- Add `!` after type: `feat!: ...` (MAJOR bump)
- Or add `BREAKING CHANGE:` in footer (MAJOR bump)

**Examples:**

```
feat(auth): add OAuth2 login support

Implements OAuth2 authentication flow for GitHub, Google, and Microsoft.

Closes #42
```

```
fix(api): correct timezone handling in date filters

Previously, date filters were not respecting user timezone settings.

Fixes #41
```

```
feat!: rename /v1/users to /v2/users

BREAKING CHANGE: API endpoint changed. Update all client calls.

Migration: Replace /v1/users with /v2/users in API calls.
```

---

**Related Tasks:**

- `ci-cd-configuration` - Set up CI to run before releases
- `pr-automation` - Help users create PRs with proper commit formats

## Handoff
next_agent: @po
next_command: *close-story {story-id}
condition: Release published successfully
alternatives:
  - agent: @devops, command: *cleanup, condition: Post-release branch cleanup needed
