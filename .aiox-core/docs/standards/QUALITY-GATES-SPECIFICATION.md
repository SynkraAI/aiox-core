# Quality Gates Specification v4.2

**Version:** 2.1.0
**Last Updated:** 2025-12-09
**Status:** Official Standard
**Related:** Sprint 3 Implementation

---

## 📋 Table of Contents

- [Overview](#overview)
- [3-Layer Architecture](#3-layer-architecture)
- [Layer 1: Pre-commit](#layer-1-pre-commit)
- [Layer 2: PR Automation](#layer-2-pr-automation)
- [Layer 3: Human Review](#layer-3-human-review)
- [Configuration Guide](#configuration-guide)
- [CodeRabbit Self-Healing](#coderabbit-self-healing)
- [Metrics & Impact](#metrics--impact)

---

## Overview

### Purpose

The Quality Gates 3-Layer system ensures code quality through progressive automated validation, catching 80% of issues automatically and focusing human review on strategic decisions.

### Design Principles

1. **Shift Left** - Catch issues as early as possible
2. **Progressive Depth** - Each layer adds more comprehensive checks
3. **Automation First** - Humans focus on what humans do best
4. **Fast Feedback** - Immediate response at each layer
5. **Non-Blocking Default** - Warnings vs. errors where appropriate

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     QUALITY GATES WORKFLOW                              │
│                                                                         │
│   Developer                                                             │
│      │                                                                  │
│      ▼                                                                  │
│   ┌──────────────────────────────────────────────────────────────────┐ │
│   │                     LAYER 1: PRE-COMMIT                           │ │
│   │                     ════════════════════                          │ │
│   │   Trigger: File save, git commit                                  │ │
│   │   Time: < 5 seconds                                               │ │
│   │   Catches: 30% of issues                                          │ │
│   │                                                                   │ │
│   │   ✓ ESLint (syntax, patterns)                                    │ │
│   │   ✓ Prettier (formatting)                                        │ │
│   │   ✓ TypeScript (type checking)                                   │ │
│   │   ✓ Unit tests (changed files only)                              │ │
│   │                                                                   │ │
│   │   Blocking: Yes (can't commit if fails)                          │ │
│   └──────────────────────────────────────────────────────────────────┘ │
│                                │                                        │
│                          PASS? │                                        │
│                                ▼                                        │
│                         git commit                                      │
│                         git push                                        │
│                                │                                        │
│                                ▼                                        │
│   ┌──────────────────────────────────────────────────────────────────┐ │
│   │                     LAYER 2: PR AUTOMATION                        │ │
│   │                     ══════════════════════                        │ │
│   │   Trigger: PR creation, PR update                                 │ │
│   │   Time: < 3 minutes                                               │ │
│   │   Catches: Additional 50% (80% cumulative)                        │ │
│   │                                                                   │ │
│   │   ✓ CodeRabbit AI review                                         │ │
│   │   ✓ Integration tests                                            │ │
│   │   ✓ Coverage analysis (threshold: 80%)                           │ │
│   │   ✓ Security scan (npm audit, Snyk)                              │ │
│   │   ✓ Performance benchmarks                                       │ │
│   │   ✓ Documentation validation                                     │ │
│   │                                                                   │ │
│   │   Blocking: Yes (required checks for merge)                      │ │
│   └──────────────────────────────────────────────────────────────────┘ │
│                                │                                        │
│                          PASS? │                                        │
│                                ▼                                        │
│   ┌──────────────────────────────────────────────────────────────────┐ │
│   │                     LAYER 3: HUMAN REVIEW                         │ │
│   │                     ═════════════════════                         │ │
│   │   Trigger: Layer 2 passes                                         │ │
│   │   Time: 30 min - 2 hours                                          │ │
│   │   Catches: Final 20% (100% cumulative)                            │ │
│   │                                                                   │ │
│   │   □ Architecture alignment                                        │ │
│   │   □ Business logic correctness                                    │ │
│   │   □ Edge cases coverage                                           │ │
│   │   □ Documentation quality                                         │ │
│   │   □ Security best practices                                       │ │
│   │   □ Strategic decisions                                           │ │
│   │                                                                   │ │
│   │   Blocking: Yes (final approval required)                        │ │
│   └──────────────────────────────────────────────────────────────────┘ │
│                                │                                        │
│                          APPROVE                                        │
│                                │                                        │
│                                ▼                                        │
│                            MERGE                                        │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Layer 1: Pre-commit

### Purpose

Catch syntax errors, formatting issues, and simple bugs immediately during development, before code leaves the developer's machine.

### Checks

| Check | Tool | Config File | Blocking |
|-------|------|-------------|----------|
| Linting | ESLint | `.eslintrc.json` | Yes |
| Formatting | Prettier | `.prettierrc` | Yes |
| Type Checking | TypeScript | `tsconfig.json` | Yes |
| Unit Tests | Jest | `jest.config.js` | Yes |
| Commit Message | commitlint | `commitlint.config.js` | Yes |

### Configuration

#### .husky/pre-commit

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Run lint-staged for incremental checks
npx lint-staged

# Type check (full project)
npm run typecheck

# Run tests for changed files only
npm test -- --onlyChanged --passWithNoTests
```

#### .lintstagedrc.json

```json
{
  "*.{js,jsx,ts,tsx}": [
    "eslint --fix",
    "prettier --write"
  ],
  "*.{json,md,yaml,yml}": [
    "prettier --write"
  ],
  "*.md": [
    "markdownlint --fix"
  ]
}
```

#### package.json scripts

```json
{
  "scripts": {
    "lint": "eslint . --ext .js,.jsx,.ts,.tsx",
    "lint:fix": "eslint . --ext .js,.jsx,.ts,.tsx --fix",
    "format": "prettier --write .",
    "typecheck": "tsc --noEmit",
    "test": "jest",
    "test:changed": "jest --onlyChanged",
    "prepare": "husky install"
  }
}
```

### Expected Results

- **Time:** < 5 seconds per commit
- **Issues Caught:** ~30% of all potential issues
- **Developer Experience:** Immediate feedback, no context switching

---

## Layer 2: PR Automation

### Purpose

Run comprehensive automated checks on every PR, including AI-powered code review, integration tests, and security scanning.

### Checks

| Check | Tool | Threshold | Blocking |
|-------|------|-----------|----------|
| AI Code Review | CodeRabbit | N/A (suggestions) | No* |
| Integration Tests | Jest | 100% pass | Yes |
| Coverage | Jest | 80% minimum | Yes |
| Security Audit | npm audit | No high/critical | Yes |
| Lint | ESLint | 0 errors | Yes |
| Type Check | TypeScript | 0 errors | Yes |
| Build | npm/webpack | Success | Yes |

*CodeRabbit suggestions are non-blocking but tracked.

### Configuration

#### .github/workflows/quality-gates-pr.yml

```yaml
name: Quality Gates PR

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main, develop]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  quality-gates:
    runs-on: ubuntu-latest
    timeout-minutes: 15

    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Type check
        run: npm run typecheck

      - name: Test with coverage
        run: npm test -- --coverage --coverageThreshold='{"global":{"branches":80,"functions":80,"lines":80,"statements":80}}'

      - name: Security audit
        run: npm audit --audit-level=high

      - name: Build
        run: npm run build

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
          fail_ci_if_error: false
```

#### .github/coderabbit.yaml

```yaml
# CodeRabbit Configuration
language: "en"
tone_instructions: "Be constructive and helpful. Focus on bugs, security, and best practices."
early_access: false

reviews:
  profile: "chill"
  request_changes_workflow: false
  high_level_summary: true
  poem: false
  review_status: true
  collapse_walkthrough: false
  auto_review:
    enabled: true
    drafts: false
    base_branches:
      - main
      - develop
  path_filters:
    - path: "**/*.test.ts"
      instructions: "Focus on test coverage and edge cases"
    - path: "**/*.md"
      instructions: "Check for broken links, typos, and clarity"
    - path: ".aiox-core/**"
      instructions: "Ensure consistency with framework standards"

chat:
  auto_reply: true
```

### Expected Results

- **Time:** < 3 minutes per PR update
- **Issues Caught:** Additional 50% (80% cumulative)
- **Developer Experience:** Detailed feedback before human review

---

## Layer 3: Human Review

### Purpose

Strategic review by humans focusing on architecture, business logic, and edge cases that automated tools cannot evaluate.

### Review Focus

| Area | Reviewer | What to Check |
|------|----------|---------------|
| Architecture | @architect, Tech Lead | Alignment with patterns, scalability |
| Business Logic | PO, Domain Expert | Correctness, edge cases |
| Security | Security Champion | Best practices, vulnerabilities |
| Documentation | Tech Writer | Clarity, completeness |
| UX Impact | UX Expert | User-facing changes |

### CODEOWNERS Configuration

```
# CODEOWNERS - Layer 3 Human Review Assignments

# Default reviewers
* @team-leads

# Architecture-sensitive areas
/.aiox-core/core/ @architect @senior-devs
/docs/architecture/ @architect
/src/core/ @senior-devs

# Security-sensitive areas
/src/auth/ @security-team
/.github/workflows/ @devops-team
**/security*.* @security-team

# Documentation
*.md @tech-writers
/docs/ @tech-writers

# Configuration files
package.json @senior-devs
tsconfig.json @senior-devs
.eslintrc.* @senior-devs

# Squads (modular areas)
/squads/etl/ @data-team
/squads/creator/ @content-team
```

### Review Checklist

```markdown
## Human Review Checklist

### Architecture
- [ ] Changes align with module boundaries
- [ ] Dependencies flow correctly (no circular)
- [ ] No breaking changes without migration path

### Business Logic
- [ ] Requirements correctly implemented
- [ ] Edge cases handled
- [ ] Error scenarios covered

### Security
- [ ] No hardcoded secrets
- [ ] Input validation present
- [ ] Authentication/authorization correct

### Performance
- [ ] No N+1 queries
- [ ] Caching considered
- [ ] Large operations async

### Documentation
- [ ] README updated if needed
- [ ] API documentation current
- [ ] Breaking changes documented

### Tests
- [ ] Critical paths covered
- [ ] Edge cases tested
- [ ] Mocks appropriate
```

### Expected Results

- **Time:** 30 min - 2 hours per PR
- **Issues Caught:** Final 20% (100% cumulative)
- **Focus:** Strategic decisions, not syntax

---

## Configuration Guide

### Initial Setup

```bash
# 1. Install dependencies
npm install -D husky lint-staged eslint prettier typescript jest @commitlint/cli @commitlint/config-conventional

# 2. Initialize Husky
npx husky install

# 3. Add pre-commit hook
npx husky add .husky/pre-commit "npx lint-staged && npm run typecheck && npm test -- --onlyChanged"

# 4. Add commit-msg hook (optional)
npx husky add .husky/commit-msg "npx --no -- commitlint --edit $1"

# 5. Update package.json
npm pkg set scripts.prepare="husky install"
```

### Customization

#### Adjusting Thresholds

```json
// jest.config.js
module.exports = {
  coverageThreshold: {
    global: {
      branches: 80,    // Adjust as needed
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

#### Skipping Checks (Emergency Only)

```bash
# Skip Layer 1 (use sparingly!)
git commit --no-verify -m "emergency: fix production issue"

# Layer 2: Use [skip ci] in commit message
git commit -m "docs: update readme [skip ci]"
```

---

## CodeRabbit Self-Healing

### Story Type Analysis

CodeRabbit automatically adjusts review focus based on story type:

| Story Type | Review Focus | Priority Checks |
|------------|--------------|-----------------|
| 🔧 Infrastructure | Configuration, CI/CD | Security, backwards compatibility |
| 💻 Feature | Business logic, UX | Tests, documentation |
| 📖 Documentation | Clarity, accuracy | Links, terminology |
| ✅ Validation | Test coverage | Edge cases |
| 🐛 Bug Fix | Root cause, regression | Tests, side effects |

### Path-Based Instructions

```yaml
# .github/coderabbit.yaml
reviews:
  path_instructions:
    - path: "**/*.test.ts"
      instructions: |
        Focus on:
        - Test coverage completeness
        - Edge case handling
        - Mock appropriateness
        - Assertion quality

    - path: ".aiox-core/docs/standards/**"
      instructions: |
        Verify:
        - Terminology uses 'Squad' not 'Squad'
        - All internal links work
        - Version numbers are v4.2

    - path: "squads/**"
      instructions: |
        Check:
        - squad.yaml manifest is valid
        - peerDependency on @aiox/core declared
        - Follows Squad structure conventions

    - path: ".github/workflows/**"
      instructions: |
        Review:
        - No hardcoded secrets
        - Proper timeout settings
        - Concurrency configuration
        - Security best practices
```

---

## Metrics & Impact

### Before Quality Gates (v2.0)

| Metric | Value |
|--------|-------|
| Issues caught automatically | 0% |
| Average review time | 2-4 hours per PR |
| Issues escaping to production | ~15% |
| Developer context switches | High |

### After Quality Gates (v4.2)

| Metric | Value | Improvement |
|--------|-------|-------------|
| Issues caught automatically | 80% | **∞** |
| Average review time | 30 min per PR | **75% reduction** |
| Issues escaping to production | <5% | **67% reduction** |
| Developer context switches | Low | **Significant** |

### Layer Breakdown

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     ISSUE DETECTION BY LAYER                            │
│                                                                         │
│   Layer 1 (Pre-commit)                                                  │
│   ████████████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  30%    │
│                                                                         │
│   Layer 2 (PR Automation)                                               │
│   ████████████████████████████████████████████████████████░░░░  80%    │
│   (includes Layer 1 + additional 50%)                                   │
│                                                                         │
│   Layer 3 (Human Review)                                                │
│   ████████████████████████████████████████████████████████████  100%   │
│   (includes Layer 1 + Layer 2 + final 20%)                             │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Related Documents

- [AIOX-LIVRO-DE-OURO-V2.1-COMPLETE.md](./AIOX-LIVRO-DE-OURO-V2.1-COMPLETE.md)
- [CodeRabbit Integration Decisions](../../docs/architecture/coderabbit-integration-decisions.md)
- [STORY-TEMPLATE-V2-SPECIFICATION.md](./STORY-TEMPLATE-V2-SPECIFICATION.md)

---

**Last Updated:** 2025-12-09
**Version:** 2.1.0
**Maintainer:** @qa (Quinn)
