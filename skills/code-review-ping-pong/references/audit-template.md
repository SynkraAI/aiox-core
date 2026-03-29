# Audit Template — Audit Round File Format

Use this exact structure when writing `.code-review-ping-pong/round-{N}-audit.md`.
The YAML frontmatter is MANDATORY and is the machine-readable contract.

---

````markdown
---
protocol: code-review-ping-pong
type: audit
round: {N}
date: "{YYYY-MM-DD}"
auditor: "{Gemini | other}"
commit_sha: "{from git rev-parse --short HEAD}"
branch: "{from git branch --show-current}"
rounds_reviewed:
  - "{1}"
  - "{2}"
  - "{N}"
files_in_scope:
  - "{path/to/file1}"
  - "{path/to/file2}"
process_health: {1-10}
new_issues:
  - id: "A{N}.1"
    severity: "{CRITICAL | HIGH | MEDIUM | LOW}"
    title: "{short title}"
    file: "{path/to/file}"
    line: {line number}
    suggestion: "{one-line fix}"
    missed_by: "{review | fix | both}"
findings:
  - type: "{recurring_issue | fix_quality | regression_missed | architecture_gap | blind_spot | review_drift}"
    title: "{short title}"
    detail: "{one-line summary}"
    rounds_affected: "{comma-separated round numbers, e.g. 1,2,3}"
---

# Code Review Ping-Pong — Round {N} Audit

**Auditor:** {name}
**Rounds reviewed:** {1 through N}
**Process health:** {X}/10

---

## 🔍 New Issues Found

> Issues present in the code that NO review round caught. These use "A" prefix (Audit).

### {🔴|🟠|🟡|🟢} {SEVERITY}

#### Issue A{N}.1 — {short title}
- **File:** `{path/to/file}`
- **Line:** {number}
- **Missed by:** {review round X / fix round Y / both}
- **Code:**
  ```{lang}
  {code snippet}
  ```
- **Problem:** {description}
- **Suggestion:**
  ```{lang}
  {fix}
  ```

---

## 🔬 Process Findings

> Cross-cutting patterns observed across rounds.

### 🔄 Recurring Issues
> Same type of bug appearing in multiple rounds — signals a deeper structural problem.

- {description with round references}

### 🩺 Fix Quality
> Are fixes solving root causes or just patching symptoms?

- {observation with specific round/fix references}

### 💥 Missed Regressions
> Problems introduced by fixes that the next review did not catch.

- {description with round references}

### 🏗️ Architecture Gaps
> Structural issues only visible when looking at the full picture.

- {observation}

### 👁️ Blind Spots
> Files or areas in scope that were never reviewed or always skipped.

- {file or area with evidence}

### 📉 Review Drift
> Is the reviewer becoming more lenient or strict over time?

- {observation with score trajectory}

---

## 💡 Recommendations

> Actionable advice for the next review/fix round.

1. {recommendation}
2. {recommendation}

---

## 📊 Summary

- **New issues found:** {count}
- **Process findings:** {count}
- **Process health:** {X}/10
- **Recommendation:** {Continue cycle with audit findings | Process is healthy, audit not needed next round}
````

---

## Rules for filling the template

1. The YAML `new_issues` array uses "A" prefix IDs (A1.1, A2.1, etc.) to distinguish from review issues.
2. Every new issue MUST include `missed_by` field — which side (review, fix, or both) should have caught it.
3. `findings` array categorizes process-level observations. Each finding must reference specific rounds.
4. Omit empty finding sections in Markdown.
5. `process_health` measures the quality of the review/fix PROCESS, not the code itself.
6. `rounds_reviewed` must list every round number that was read during the audit.
7. If no new issues are found, `new_issues` must be an empty array `[]` and the section should say so.
