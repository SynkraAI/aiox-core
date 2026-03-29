# Review Template — Round File Format

Use this exact structure when writing `.code-review-ping-pong/round-{N}.md`.
The YAML frontmatter is MANDATORY and is the machine-readable contract.

---

````markdown
---
protocol: code-review-ping-pong
type: review
round: {N}
date: "{YYYY-MM-DD}"
reviewer: "{Codex | Claude Code | other}"
commit_sha: "{short sha from git rev-parse --short HEAD}"
branch: "{branch name from git branch --show-current}"
based_on_fix: "{round-{N-1}-fixed.md | null if first round}"
files_in_scope:
  - "{path/to/file1}"
  - "{path/to/file2}"
score: {1-10}
verdict: "{CONTINUE | PERFECT}"
issues:
  - id: "{N}.1"
    severity: "{CRITICAL | HIGH | MEDIUM | LOW}"
    title: "{short title}"
    file: "{path/to/file}"
    line: {line number or range as string "10-15"}
    suggestion: "{brief one-line fix description}"
  - id: "{N}.2"
    severity: "{CRITICAL | HIGH | MEDIUM | LOW}"
    title: "{short title}"
    file: "{path/to/file}"
    line: {line number}
    suggestion: "{brief one-line fix description}"
---

# Code Ping-Pong — Round {N} Review

## 🎯 Score: {X}/10 — {CONTINUE | PERFECT}

---

## Issues

### 🔴 CRITICAL

> Issues that cause crashes, data loss, or security vulnerabilities.

#### Issue {N}.1 — {short title}
- **File:** `{path/to/file}`
- **Line:** {line number or range}
- **Code:**
  ```{lang}
  {offending code snippet}
  ```
- **Problem:** {clear description of what is wrong}
- **Suggestion:**
  ```{lang}
  {suggested fix}
  ```

### 🟠 HIGH

> Issues that cause incorrect behavior or significant quality problems.

#### Issue {N}.2 — {short title}
...same format as CRITICAL...

### 🟡 MEDIUM

> Code style, readability, maintainability, or minor performance issues.

### 🟢 LOW

> Nitpicks, suggestions, and nice-to-haves.

---

## Regressions

> Issues introduced by fixes from the previous round. Leave empty if first round or no regressions.

- {description of regression, if any}

---

## ✅ What Is Good

> Explicitly list things that are well-implemented. The fixer must NOT change these.

- {specific positive observation with file reference}
- {specific positive observation with file reference}

---

## 📊 Summary

- **Total issues:** {count}
- **By severity:** 🔴 {X} CRITICAL, 🟠 {X} HIGH, 🟡 {X} MEDIUM, 🟢 {X} LOW
- **Regressions from previous round:** {count or "none"}
- **Next action:** {Fix issues and request new review | Code is perfect, no action needed}
````

---

## Rules for filling the template

1. The YAML `issues` array MUST match the Markdown issues section exactly (same IDs, same count).
2. Every issue MUST have file path, line number, code snippet, and suggestion — both in YAML (brief) and Markdown (detailed).
3. Omit empty severity sections in Markdown (if no CRITICAL issues, skip that heading).
4. The "What Is Good" section is mandatory — never skip it.
5. Score must be honest. Do not inflate or deflate. Do not omit issues to maintain a "fewer issues" narrative.
6. If verdict is PERFECT, the `issues` array must be empty and the Issues section should contain only praise.
7. `commit_sha` and `branch` are mandatory — run the git commands to get them.
8. `files_in_scope` must list every file that was actually reviewed.
