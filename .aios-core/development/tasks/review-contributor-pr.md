# Task: Review External Contributor PR

## Metadata

```yaml
id: review-contributor-pr
agent: devops
elicit: true
category: security
priority: high
story: NOG-17
```

## Description

Formal security review process for external contributor PRs before merging. This task ensures PRs from fork contributors are reviewed for security risks not present in internal team PRs.

## Pre-Conditions

- PR is from an external contributor (fork-based)
- PR has passed automated CI checks (or CI was skipped due to fork restrictions)
- CodeRabbit review completed (check for hidden content in PR description)

## Inputs

- `{pr_number}` - GitHub PR number to review

## Execution

### Step 1: Identify PR Scope

```bash
# Get PR details
gh pr view {pr_number} --json files,additions,deletions,author,body

# Classify PR type
# CI/Workflow = .github/
# Test = tests/
# Code = packages/, .aios-core/, bin/
# Config = .gitmodules, *.config.*
# Docs = docs/, *.md
```

**Elicit:** "PR #{pr_number} classified as: {type}. Proceeding with {type} security checklist."

### Step 2: Security Checklist (by PR type)

#### For CI/Workflow PRs (.github/)

- [ ] No `pull_request_target` with explicit checkout added
- [ ] No new secrets references (`${{ secrets.* }}`)
- [ ] No permission escalation (`permissions: write-all`, `contents: write` where unnecessary)
- [ ] Action versions use known, trusted publishers
- [ ] Action versions are SHA-pinned (not tag-based)
- [ ] No `workflow_dispatch` with dangerous inputs
- [ ] No new `env:` blocks exposing sensitive data

#### For Test PRs (tests/)

- [ ] No `require('https')`, `require('http')`, `require('net')`, `require('dns')` imports
- [ ] No `fetch()`, `XMLHttpRequest`, or network calls
- [ ] No `fs.readFileSync` outside test fixtures
- [ ] No `process.env` access to sensitive variables
- [ ] No `child_process` usage (`execSync`, `spawn`, etc.)
- [ ] `require()` paths point to legitimate project modules only
- [ ] No exfiltration patterns (base64 encoding + network call)

#### For Code PRs (packages/, .aios-core/, bin/)

- [ ] No new dependencies added without justification
- [ ] No changes to `package.json` scripts (`preinstall`, `postinstall`)
- [ ] No `.env` file reads or credential handling changes
- [ ] No `shell: true` in any exec/spawn calls
- [ ] No string-based command construction (use array args)
- [ ] CodeRabbit review completed (check for hidden content in PR description)

#### For Config PRs (.gitmodules, *.config.*)

- [ ] No URL changes to external/unknown repositories
- [ ] No new submodule additions
- [ ] Config values are expected and documented
- [ ] No hooks modifications that could alter behavior

### Step 3: Automated Scan

Run the appropriate grep command based on PR type:

```bash
# For test PRs - check for suspicious patterns
gh pr diff {pr_number} -- 'tests/' | grep -E "(require\('https|require\('http|require\('net|require\('dns|fetch\(|\.readFileSync|process\.env|child_process|execSync|spawn)"

# For code PRs - check for shell execution patterns
gh pr diff {pr_number} -- 'packages/' '.aios-core/' 'bin/' | grep -E "(shell:\s*true|execSync\(|\.exec\(|eval\(|Function\()"

# For CI PRs - check for permission/secret changes
gh pr diff {pr_number} -- '.github/' | grep -E "(permissions:|secrets\.|pull_request_target|workflow_dispatch)"

# For any PR - check for hidden content in PR body
gh pr view {pr_number} --json body --jq '.body' | grep -iE "(<picture|<source|<img.*onerror|<!--.*ignore.*instruct)"
```

**Elicit:** "Scan results: {summary}. {findings_count} suspicious patterns found."

### Step 4: Decision Matrix

| PR Changes | Risk Level | Required Actions |
|-----------|-----------|-----------------|
| Documentation only | LOW | Standard review |
| Test files only | MEDIUM | Security scan + grep |
| Source code | MEDIUM-HIGH | Security scan + careful review |
| CI/Workflows | HIGH | Security scan + SHA audit + 2 approvals |
| package.json | HIGH | Block until verified |
| .gitmodules | MEDIUM | URL verification required |
| Config files | MEDIUM | Value verification required |

### Step 5: Merge Decision

**Elicit:** Present checklist results and ask for confirmation:

```
## Contributor PR Security Review Summary

**PR:** #{pr_number}
**Author:** {author} (external contributor)
**Type:** {pr_type}
**Files Changed:** {file_count}

### Checklist Results
- Security scan: {PASS|WARN|FAIL}
- Automated grep: {PASS|WARN|FAIL}
- CodeRabbit: {APPROVED|CHANGES_REQUESTED|PENDING}
- Hidden content check: {CLEAN|SUSPICIOUS}

### Recommendation
{APPROVE|APPROVE_WITH_NOTES|REQUEST_CHANGES|BLOCK}

Proceed with merge? (y/n)
```

## Post-Conditions

- PR reviewed with security checklist appropriate to its type
- Automated scan completed with no unresolved findings
- Decision logged (approve, request changes, or block)
- If merged: enforce_admins temporarily disabled if needed, then re-enabled

## Notes

- For PRs that modify `.github/workflows/`, require 2 maintainer approvals
- For PRs from **trusted contributors** (e.g., @riaworks with prior merged security PRs), standard review may suffice for docs/test PRs
- Always re-enable enforce_admins immediately after merge
- Reference research: `docs/research/2026-02-21-ci-security-external-prs/`
