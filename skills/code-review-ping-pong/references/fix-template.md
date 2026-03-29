# Fix Report Template — Fixed Round File Format

Use this exact structure when writing `.code-review-ping-pong/round-{N}-fixed.md`.
The YAML frontmatter is MANDATORY and is the machine-readable contract.

---

````markdown
---
protocol: code-review-ping-pong
type: fix
round: {N}
date: "{YYYY-MM-DD}"
fixer: "{Claude Code | Codex | other}"
review_file: "round-{N}.md"
commit_sha_before: "{sha from review file's commit_sha}"
branch: "{branch name}"
git_diff_stat: "{single-line summary, e.g. '3 files changed, 25 insertions(+), 8 deletions(-)' — from last line of git diff --stat HEAD}"
files_changed:
  - "{path/to/changed-file1}"
  - "{path/to/changed-file2}"
original_score: {X}
issues_fixed: {count of FIXED}
issues_skipped: {count of SKIPPED}
issues_total: {total from review}
quality_checks:
  lint: "{PASS | FAIL | N/A}"
  typecheck: "{PASS | FAIL | N/A}"
  test: "{PASS | FAIL | N/A}"
fixes:
  - id: "{N}.1"
    status: "{FIXED | SKIPPED | PARTIAL}"
    deviation: "{none | brief explanation if fix differs from suggestion}"
  - id: "{N}.2"
    status: "{FIXED | SKIPPED | PARTIAL}"
    deviation: "{none | brief explanation}"
---

# Code Ping-Pong — Round {N} Fix Report

**Review:** `round-{N}.md` (score: {X}/10)
**Git base:** `{commit_sha_before}` on `{branch}`
**Changes:**
```
{paste git diff --stat output here}
```

---

## 🔧 Fixes Applied

### ✅ Fix for Issue {N}.1 — {short title}
- **Status:** ✅ FIXED
- **File:** `{path/to/file}`
- **What changed:** {brief description of the change}
- **Deviation from suggestion:** {explanation if different, otherwise "None"}

### Fix for Issue {N}.2 — {short title}
...same format...

---

## ⚠️ Skipped Issues

> List any issues that were intentionally NOT fixed, with justification.

- ⚠️ **Issue {N}.X — {title}:** {reason — e.g., "false positive", "out of scope", "would break existing behavior"}

---

## Additional Improvements

> Optional: improvements made beyond what was requested. Keep minimal.

- {description of bonus improvement, if any}

---

## 🧪 Quality Checks

| Check | Result | Notes |
|-------|--------|-------|
| `npm run lint` | ✅ PASS / ❌ FAIL | {details if FAIL} |
| `npm run typecheck` | ✅ PASS / ❌ FAIL / N/A | {details if FAIL} |
| `npm test` | ✅ PASS / ❌ FAIL / N/A | {details if FAIL} |

---

## 📊 Summary

- **Issues fixed:** ✅ {X} of {total}
- **Issues skipped:** ⚠️ {X} (see justification above)
- **Quality checks:** {all passing / details}
- **Next action:** Request reviewer to run REVIEW for round {N+1}
````

---

## Rules for filling the template

1. The YAML `fixes` array MUST cover every issue from the review — either FIXED, SKIPPED, or PARTIAL.
2. Never skip CRITICAL issues without explicit justification.
3. Quality checks section is mandatory. Run all available checks.
4. **Git state:** `commit_sha_before` comes from the review. `git_diff_stat` is the **last line only** of `git diff --stat HEAD` (the summary line, e.g. "3 files changed, 25 insertions(+), 8 deletions(-)"). Must be a single line — the YAML parser does not support multiline strings. `files_changed` lists the actual files modified. This is more reliable than `commit_sha_after` which may be identical if no commit was made.
5. `deviation` field helps the reviewer understand non-obvious decisions.
6. Keep "Additional Improvements" minimal — avoid scope creep.
