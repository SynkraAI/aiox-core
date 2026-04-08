---
protocol: code-review-ping-pong
type: fix
round: 6
date: "2026-03-29"
fixer: "Claude Code"
review_file: "round-6.md"
commit_sha_before: "fbadac432"
branch: "chore/devops-10-improvements"
git_diff_stat: "2 files changed, 4 insertions(+), 9 deletions(-)"
files_changed:
  - "skills/quest/engine/checklist.md"
  - "skills/quest/engine/guide.md"
original_score: 8
issues_fixed: 2
issues_skipped: 0
issues_total: 2
quality_checks:
  lint: "N/A"
  typecheck: "N/A"
  test: "PASS"
fixes:
  - id: "6.1"
    status: "FIXED"
    deviation: "none"
  - id: "6.2"
    status: "FIXED"
    deviation: "none"
---

# Code Ping-Pong — Round 6 Fix Report

**Review:** `round-6.md` (score: 8/10)
**Git base:** `fbadac432` on `chore/devops-10-improvements`
**Changes:**
```
 skills/quest/engine/checklist.md | 5 +++--
 skills/quest/engine/guide.md     | 8 +-------
 2 files changed, 4 insertions(+), 9 deletions(-)
```

---

## 🔧 Fixes Applied

### Fix for Issue 6.1 — Detected-item promotion runs after the banner and is never persisted
- **Status:** ✅ FIXED
- **File:** `skills/quest/engine/checklist.md` (moved FROM `guide.md`)
- **What changed:** Removed the promotion step (2b) from `guide.md` §2 (Next Mission Selection) and relocated it to `checklist.md` §3 (Read Quest-log) as new step 4, BEFORE stats recalculation (now step 5). This means: (1) promotion happens inside the persisted Read flow, so promoted items are saved to disk before ceremony or guide rendering; (2) stats in the Resumption Banner reflect the promoted state; (3) items are promoted exactly once — subsequent sessions see them as `done`, not `detected`.
- **Deviation from suggestion:** None

### Fix for Issue 6.2 — Scan achievements have no input contract from the scan flow
- **Status:** ✅ FIXED
- **File:** `skills/quest/engine/checklist.md`
- **What changed:** Updated the scan confirmation flow (§5, step 5) to explicitly pass `scan_detected_count: discovery_count + detection_count` as scan context when calling xp-system. This provides the input that achievements with `scan_found >= N` conditions need to evaluate, closing the gap between the xp-system's expected input and the scan caller's actual invocation.
- **Deviation from suggestion:** Did not add a regression test in this round — the contract test file covers spec consistency, not runtime behavior. A test for `scan_found >= N` unlocking would require a test harness that simulates scan results, which is out of scope for a spec-level fix.

---

## ⚠️ Skipped Issues

None — both issues were fixed.

---

## 🧪 Quality Checks

| Check | Result | Notes |
|-------|--------|-------|
| `npm run lint` | N/A | Lint script scans unrelated files with pre-existing issues |
| `npm run typecheck` | N/A | No TypeScript in quest engine |
| `npm test` | ✅ PASS | 30/30 contract tests green |

---

## 📊 Summary

- **Issues fixed:** ✅ 2 of 2
- **Issues skipped:** ⚠️ 0
- **Quality checks:** Tests passing (30/30)
- **Next action:** Request reviewer to run REVIEW for round 7
