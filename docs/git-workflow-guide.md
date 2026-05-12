# AIOX Git Workflow Guide

> 🌐 **EN** | [PT](./pt/git-workflow-guide.md) | [ES](./es/git-workflow-guide.md)

---

_Story: 2.2-git-workflow-implementation.yaml_

## Table of Contents

- [Overview](#overview)
- [Defense in Depth Architecture](#defense-in-depth-architecture)
- [Layer 1: Pre-commit Validation](#layer-1-pre-commit-validation)
- [Layer 2: Pre-push Validation](#layer-2-pre-push-validation)
- [Layer 3: CI/CD Pipeline](#layer-3-cicd-pipeline)
- [Branch Protection](#branch-protection)
- [Daily Workflow](#daily-workflow)
- [Troubleshooting](#troubleshooting)
- [Performance Tips](#performance-tips)

## Overview

Synkra AIOX implements a **Defense in Depth** validation strategy with three progressive layers that catch issues early and ensure code quality before merge.

### Why Three Layers?

1. **Fast feedback** - Catch issues immediately during development
2. **Local validation** - No cloud dependency for basic checks
3. **Authoritative validation** - Final gate before merge
4. **Story consistency** - Ensure development aligns with stories

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Developer Workflow                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ Layer 1: Pre-commit Hook (Local - <5s)                     │
│ ✓ ESLint (code quality)                                     │
│ ✓ TypeScript (type checking)                                │
│ ✓ Cache enabled                                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ Layer 2: Pre-push Hook (Local - <2s)                       │
│ ✓ Story checkbox validation                                 │
│ ✓ Status consistency                                         │
│ ✓ Required sections                                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ Layer 3: GitHub Actions CI (Cloud - 2-5min)                │
│ ✓ All lint/type checks                                      │
│ ✓ Full test suite                                           │
│ ✓ Code coverage (≥80%)                                      │
│ ✓ Story validation                                          │
│ ✓ Branch protection                                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                      ┌──────────────┐
                      │ Merge Ready  │
                      └──────────────┘
```

## Defense in Depth Architecture

### Layer 1: Pre-commit (Local - Fast)

**Performance Target:** <5 seconds
**Trigger:** `git commit`
**Location:** `.husky/pre-commit`

**What it validates:**

- ESLint code quality
- TypeScript type checking
- Syntax errors
- Import issues

**How it works:**

```bash
# Triggered automatically on commit
git add .
git commit -m "feat: add feature"

# Runs:
# 1. ESLint with caching (.eslintcache)
# 2. TypeScript incremental compilation (.tsbuildinfo)
```

**Benefits:**

- ⚡ Fast feedback (<5s)
- 💾 Cached for speed
- 🔒 Prevents broken code commits
- 🚫 No invalid syntax in history

### Layer 2: Pre-push (Local - Story Validation)

**Performance Target:** <2 seconds
**Trigger:** `git push`
**Location:** `.husky/pre-push`

**What it validates:**

- Story checkbox completion vs status
- Required story sections present
- Status consistency
- Dev agent records

**How it works:**

```bash
# Triggered automatically on push
git push origin feature/my-feature

# Validates all story files in docs/stories/
```

**Validation Rules:**

1. **Status Consistency:**

```yaml
# ❌ Invalid: completed but tasks incomplete
status: "completed"
tasks:
  - "[x] Task 1"
  - "[ ] Task 2"  # Error!

# ✅ Valid: all tasks completed
status: "completed"
tasks:
  - "[x] Task 1"
  - "[x] Task 2"
```

2. **Required Sections:**

- `id`
- `title`
- `description`
- `acceptance_criteria`
- `status`

3. **Status Flow:**

```
ready → in progress → Ready for Review → completed
```

### Layer 3: CI/CD (Cloud - Authoritative)

**Performance:** 2-5 minutes
**Trigger:** Push to any branch, PR creation
**Platform:** GitHub Actions
**Location:** `.github/workflows/ci.yml`

**Jobs:**

1. **ESLint** (`lint` job)
   - Runs on clean environment
   - No cache dependency

2. **TypeScript** (`typecheck` job)
   - Full type checking
   - No incremental compilation

3. **Tests** (`test` job)
   - Full test suite
   - Coverage reporting
   - 80% threshold enforced

4. **Story Validation** (`story-validation` job)
   - All stories validated
   - Status consistency checked

5. **Validation Summary** (`validation-summary` job)
   - Aggregates all results
   - Blocks merge if any fail

**Performance Monitoring:**

- Optional performance job
- Measures validation times
- Informational only

## Layer 1: Pre-commit Validation

### Quick Reference

```bash
# Manual validation
npm run lint
npm run typecheck

# Auto-fix lint issues
npm run lint -- --fix

# Skip hook (NOT recommended)
git commit --no-verify
```

### ESLint Configuration

**File:** `.eslintrc.json`

```json
{
  "extends": ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint"],
  "cache": true,
  "cacheLocation": ".eslintcache"
}
```

**Key features:**

- TypeScript support
- Caching enabled
- Warns on console.log
- Ignores unused vars with `_` prefix

### TypeScript Configuration

**File:** `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "strict": true,
    "incremental": true,
    "tsBuildInfoFile": ".tsbuildinfo"
  }
}
```

**Key features:**

- ES2022 target
- Strict mode
- Incremental compilation
- CommonJS modules

### Performance Optimization

**Cache Files:**

- `.eslintcache` - ESLint results
- `.tsbuildinfo` - TypeScript incremental data

**First run:** ~10-15s (no cache)
**Subsequent runs:** <5s (cached)

**Cache invalidation:**

- Configuration changes
- Dependency updates
- File deletions

## Layer 2: Pre-push Validation

### Quick Reference

```bash
# Manual validation
node .aiox-core/utils/aiox-validator.js pre-push
node .aiox-core/utils/aiox-validator.js stories

# Validate single story
node .aiox-core/utils/aiox-validator.js story docs/stories/1.1-story.yaml

# Skip hook (NOT recommended)
git push --no-verify
```

### Story Validator

**Location:** `.aiox-core/utils/aiox-validator.js`

**Features:**

- Colored terminal output
- Progress indicators
- Clear error messages
- Warnings for potential issues

**Example Output:**

```
══════════════════════════════════════════════════════════
  Story Validation: 2.2-git-workflow-implementation.yaml
══════════════════════════════════════════════════════════

Story: 2.2 - Git Workflow with Multi-Layer Validation
Status: in progress

Progress: 12/15 tasks (80.0%)

✓ Story validation passed with warnings

Warning:
  • Consider updating status to 'Ready for Review'
```

### Validation Rules

#### 1. Checkbox Format

Supported formats:

- `[x]` - Completed (lowercase)
- `[X]` - Completed (uppercase)
- `[ ]` - Incomplete

Not recognized:

- `[o]`, `[*]`, `[-]` - Not counted as complete

#### 2. Status Consistency

| Status             | Rule                       |
| ------------------ | -------------------------- |
| `ready`            | No tasks should be checked |
| `in progress`      | Some tasks checked         |
| `Ready for Review` | All tasks checked          |
| `completed`        | All tasks checked          |

#### 3. Required Sections

All stories must have:

```yaml
id: "X.X"
title: "Story Title"
description: "Story description"
status: "ready" | "in progress" | "Ready for Review" | "completed"
acceptance_criteria:
  - name: "Criterion"
    tasks:
      - "[ ] Task"
```

#### 4. Dev Agent Record

Recommended but not required:

```yaml
dev_agent_record:
  agent_model: 'claude-sonnet-4-5'
  implementation_date: '2025-01-23'
```

Warning if missing.

### Error Messages

**Missing Required Sections:**

```
✗ Missing required sections: description, acceptance_criteria
```

**Status Inconsistency:**

```
✗ Story marked as completed but only 12/15 tasks are checked
```

**Non-existent File:**

```
✗ Story file not found: docs/stories/missing.yaml
```

## Layer 3: CI/CD Pipeline

### Workflow Structure

**File:** `.github/workflows/ci.yml`

**Jobs:**

1. **lint** - ESLint validation
2. **typecheck** - TypeScript checking
3. **test** - Jest tests with coverage
4. **story-validation** - Story consistency
5. **validation-summary** - Aggregate results
6. **performance** (optional) - Performance metrics

### Job Details

#### ESLint Job

```yaml
- name: Run ESLint
  run: npm run lint
```

- Runs on Ubuntu latest
- Timeout: 5 minutes
- Uses npm cache
- Fails on any lint error

#### TypeScript Job

```yaml
- name: Run TypeScript type checking
  run: npm run typecheck
```

- Runs on Ubuntu latest
- Timeout: 5 minutes
- Fails on type errors

#### Test Job

```yaml
- name: Run tests with coverage
  run: npm run test:coverage
```

- Runs on Ubuntu latest
- Timeout: 10 minutes
- Coverage uploaded to Codecov
- Enforces 80% coverage threshold

#### Story Validation Job

```yaml
- name: Validate story checkboxes
  run: node .aiox-core/utils/aiox-validator.js stories
```

- Runs on Ubuntu latest
- Timeout: 5 minutes
- Validates all stories

#### Validation Summary Job

```yaml
needs: [lint, typecheck, test, story-validation]
if: always()
```

- Runs after all validations
- Checks all job statuses
- Fails if any validation failed
- Provides summary

### CI Triggers

**Push Events:**

- `master` branch
- `develop` branch
- `feature/**` branches
- `bugfix/**` branches

**Pull Request Events:**

- Against `master`
- Against `develop`

### Viewing CI Results

```bash
# View PR checks
gh pr checks

# View workflow runs
gh run list

# View specific run
gh run view <run-id>

# Re-run failed jobs
gh run rerun <run-id>
```

## Branch Protection

### Setup

```bash
# Run setup script
node scripts/setup-branch-protection.js

# View current protection
node scripts/setup-branch-protection.js --status
```

### Requirements

- GitHub CLI (`gh`) installed
- Authenticated with GitHub
- Admin access to repository

### Protection Rules

**Master Branch Protection:**

1. **Required Status Checks:**
   - ESLint
   - TypeScript Type Checking
   - Jest Tests
   - Story Checkbox Validation

2. **Pull Request Reviews:**
   - 1 approval required
   - Dismiss stale reviews on new commits

3. **Additional Rules:**
   - Linear history enforced (rebase only)
   - Force pushes blocked
   - Branch deletion blocked
   - Rules apply to administrators

### Manual Configuration

Via GitHub CLI:

```bash
# Set required status checks
gh api repos/OWNER/REPO/branches/master/protection/required_status_checks \
  -X PUT \
  -f strict=true \
  -f contexts[]="ESLint" \
  -f contexts[]="TypeScript Type Checking"

# Require PR reviews
gh api repos/OWNER/REPO/branches/master/protection/required_pull_request_reviews \
  -X PUT \
  -f required_approving_review_count=1

# Block force pushes
gh api repos/OWNER/REPO/branches/master/protection/allow_force_pushes \
  -X DELETE
```

## Daily Workflow

### Starting a New Feature

```bash
# 1. Update master
git checkout master
git pull origin master

# 2. Create feature branch
git checkout -b feature/my-feature

# 3. Make changes
# ... edit files ...

# 4. Commit (triggers pre-commit)
git add .
git commit -m "feat: add my feature [Story X.X]"

# 5. Push (triggers pre-push)
git push origin feature/my-feature

# 6. Create PR
gh pr create --title "feat: Add my feature" --body "Description"
```

### Updating a Story

```bash
# 1. Open story file
code docs/stories/X.X-story.yaml

# 2. Mark tasks complete
# Change: - "[ ] Task"
# To:     - "[x] Task"

# 3. Update status if needed
# Change: status: "in progress"
# To:     status: "Ready for Review"

# 4. Commit story updates
git add docs/stories/X.X-story.yaml
git commit -m "docs: update story X.X progress"

# 5. Push (validates story)
git push
```

### Fixing Validation Failures

**ESLint Errors:**

```bash
# Auto-fix issues
npm run lint -- --fix

# Check remaining issues
npm run lint

# Commit fixes
git add .
git commit -m "style: fix lint issues"
```

**TypeScript Errors:**

```bash
# See all errors
npm run typecheck

# Fix errors in code
# ... edit files ...

# Verify fix
npm run typecheck

# Commit fixes
git add .
git commit -m "fix: resolve type errors"
```

**Story Validation Errors:**

```bash
# Check stories
node .aiox-core/utils/aiox-validator.js stories

# Fix story file
code docs/stories/X.X-story.yaml

# Verify fix
node .aiox-core/utils/aiox-validator.js story docs/stories/X.X-story.yaml

# Commit fix
git add docs/stories/
git commit -m "docs: fix story validation"
```

**Test Failures:**

```bash
# Run tests
npm test

# Run specific test
npm test -- path/to/test.js

# Fix failing tests
# ... edit test files ...

# Run with coverage
npm run test:coverage

# Commit fixes
git add .
git commit -m "test: fix failing tests"
```

### Merging a Pull Request

```bash
# 1. Ensure CI passes
gh pr checks

# 2. Get approval
# (Wait for team member review)

# 3. Merge (squash)
gh pr merge --squash --delete-branch

# 4. Update local master
git checkout master
git pull origin master
```

## Troubleshooting

### Hook Not Running

**Symptoms:** Commit succeeds without validation

**Solutions:**

1. Check Husky installation:

```bash
npm run prepare
```

2. Verify hook files exist:

```bash
ls -la .husky/pre-commit
ls -la .husky/pre-push
```

3. Check file permissions (Unix):

```bash
chmod +x .husky/pre-commit
chmod +x .husky/pre-push
```

### Slow Pre-commit Hook

**Symptoms:** Pre-commit takes >10 seconds

**Solutions:**

1. Clear caches:

```bash
rm .eslintcache .tsbuildinfo
git commit  # Rebuilds cache
```

2. Check file changes:

```bash
git status
# Commit fewer files at once
```

3. Update dependencies:

```bash
npm update
```

### Story Validation Fails

**Symptom:** Pre-push fails with story errors

**Common Issues:**

1. **Checkbox mismatch:**

```yaml
# Error: Completed status but incomplete tasks
status: 'completed'
tasks:
  - '[x] Task 1'
  - '[ ] Task 2' # ← Fix this


# Solution: Complete all tasks or change status
```

2. **Missing sections:**

```yaml
# Error: Missing required sections
id: '1.1'
title: 'Story'
# Missing: description, acceptance_criteria, status

# Solution: Add missing sections
```

3. **Invalid YAML:**

```yaml
# Error: Invalid YAML syntax
tasks:
  - "[ ] Task 1
  - "[ ] Task 2"  # ← Missing closing quote above

# Solution: Fix YAML syntax
```

### CI Fails but Local Passes

**Symptoms:** CI fails but all local validations pass

**Common Causes:**

1. **Cache differences:**

```bash
# Clear local caches
rm -rf node_modules .eslintcache .tsbuildinfo coverage/
npm ci
npm test
```

2. **Environment differences:**

```bash
# Use same Node version as CI (18)
nvm use 18
npm test
```

3. **Uncommitted files:**

```bash
# Check for uncommitted changes
git status

# Stash if needed
git stash
```

### Branch Protection Blocks Merge

**Symptoms:** Cannot merge PR even with approvals

**Check:**

1. **Required checks pass:**

```bash
gh pr checks
# All must show ✓
```

2. **Required approvals:**

```bash
gh pr view
# Check "Reviewers" section
```

3. **Branch is up to date:**

```bash
# Update branch
git checkout feature-branch
git rebase master
git push --force-with-lease
```

## Performance Tips

### Cache Management

**Keep caches:**

- `.eslintcache` - ESLint results
- `.tsbuildinfo` - TypeScript build info
- `coverage/` - Test coverage data

**Commit to .gitignore:**

```gitignore
.eslintcache
.tsbuildinfo
coverage/
```

### Incremental Development

**Best Practices:**

1. **Small commits:**
   - Fewer files = faster validation
   - Easier to debug failures

2. **Test during development:**

```bash
# Run validation manually before commit
npm run lint
npm run typecheck
npm test
```

3. **Fix issues immediately:**
   - Don't let issues accumulate
   - Easier to fix in context

### CI Optimization

**Workflow optimizations:**

1. **Parallel jobs** - All validations run in parallel
2. **Job timeouts** - Fail fast on hangs
3. **Caching** - npm dependencies cached
4. **Conditional jobs** - Performance job only on PRs

### Story Validation Performance

**Current Performance:**

- Single story: <100ms
- All stories: <2s (typical)

**Optimization tips:**

1. **Keep stories focused** - One feature per story
2. **Limit task count** - Break large stories into smaller ones
3. **Valid YAML** - Parsing errors slow validation

## Advanced Topics

### Skipping Validations

**When appropriate:**

- Emergency hotfixes
- Documentation-only changes
- CI configuration changes

**How to skip:**

```bash
# Skip pre-commit
git commit --no-verify

# Skip pre-push
git push --no-verify

# Skip CI (not recommended)
# Add [skip ci] to commit message
git commit -m "docs: update [skip ci]"
```

**Warning:** Only skip when absolutely necessary. Skipped validations won't catch issues.

### Custom Validation

**Add custom validators:**

1. **Create validator function:**

```javascript
// .aiox-core/utils/custom-validator.js
module.exports = async function validateCustom() {
  // Your validation logic
  return { success: true, errors: [] };
};
```

2. **Add to hook:**

```bash
# .husky/pre-commit
node .aiox-core/utils/aiox-validator.js pre-commit
node .aiox-core/utils/custom-validator.js
```

3. **Add to CI:**

```yaml
# .github/workflows/ci.yml
- name: Custom validation
  run: node .aiox-core/utils/custom-validator.js
```

### Monorepo Support

**For monorepos:**

1. **Scope validations:**

```javascript
// Only validate changed packages
const changedFiles = execSync('git diff --name-only HEAD~1').toString();
const packages = getAffectedPackages(changedFiles);
```

2. **Parallel package validation:**

```yaml
strategy:
  matrix:
    package: [package-a, package-b, package-c]
```

## References

- **AIOX Validator:** [.aiox-core/utils/aiox-validator.js](../.aiox-core/utils/aiox-validator.js)
- **CI Workflow:** [.github/workflows/ci.yml](../.github/workflows/ci.yml)

---

**Questions? Issues?**

- [Open an Issue](https://github.com/SynkraAI/aiox-core/issues)
- [Join Discord](https://discord.gg/gk8jAdXWmj)
