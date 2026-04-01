---
protocol: code-review-ping-pong
type: fix
round: 11
date: "2026-04-01"
fixer: "Claude Opus 4.6"
review_file: round-11.md
commit_sha_before: "7cf8d480fcc687eeb91b0a08fbed2efc3ff2aad8"
commit_sha_after: "ea06fd4950f72e633b589c7631dfcabbdfa6673e"
branch: chore/devops-10-improvements
issues_fixed: 4
issues_skipped: 0
issues_total: 4
git_diff_stat: "3 files changed, 13 insertions(+), 1 deletion(-)"
quality_checks:
  lint: skipped
  typecheck: skipped
  tests: skipped
fixes:
  - id: "11.1"
    status: FIXED
    file: "engine/guide.md"
    description: "Added inline progress bar contract references inside the code block templates of both §5 (progress_bar() function) and §6 (Summary View template). §5 now has a 3-line inline comment listing all four contract locations (ceremony.md §2, §7, guide.md §5, §6). §6 template now has two inline reference lines pointing to the canonical function in §5 and the shared contract with ceremony.md. Anti-whack-a-mole: verified ceremony.md §2 and §7 already have inline refs — only guide.md §5 and §6 were missing them."
    deviation: "none"
  - id: "11.2"
    status: FIXED
    file: "engine/guide.md"
    description: "Added deprecation cross-reference contract block after §4.4 (Achievement Unlock) template, documenting that total_xp >= N is deprecated in favor of item_xp >= N with pointers to xp-system.md §7 and checklist.md §1. Also added a shorter deprecation note in §6 Next Achievement section. Propagation semantica: the contract broken is 'all modules that reference achievement conditions must warn about the deprecation'. Modules checked: xp-system.md §7 (has deprecation notice), checklist.md §1 (has deprecation warning), guide.md §4.4 (was missing — fixed), guide.md §6 Next Achievement (was missing — fixed). ceremony.md does not reference achievement conditions directly, so no change needed."
    deviation: "none"
  - id: "11.3"
    status: FIXED
    file: "engine/ceremony.md"
    description: "Added hero_title to the Field Sources table in ceremony.md §7 (Resumption Banner) with explicit rendering rule: if non-empty/non-whitespace, append as 'Bem-vindo de volta, {hero_name}, {hero_title}!'; if missing/empty/whitespace, omit entirely. Added a full Contract block for hero_title fallback mirroring the hero_name contract pattern, cross-referencing all four locations (ceremony.md §1.5, SKILL.md, guide.md §1, ceremony.md §7). Propagation semantica: the contract is 'all modules that render hero_title must agree on fallback behavior (empty = omit)'. Verified: ceremony.md §1.5 (has contract), guide.md §1 (has contract), SKILL.md (implicit in meta schema), ceremony.md §7 (was missing — fixed)."
    deviation: "none"
  - id: "11.4"
    status: FIXED
    file: "engine/checklist.md"
    description: "Updated the Contract block in checklist.md §1 to explicitly include guide.md §5 [·] icon as part of the unified unused-item contract. Added 'Guide.md §5 (Quest Log View) displays unused items with the [·] icon as their visual indicator' to the contract text, and added 'guide.md §5 ([·] visual indicator)' to the enforced-at list. Anti-whack-a-mole: verified that guide.md §5 (line 644) already has its own contract note for the [·] icon referencing checklist.md §1 — the cross-reference was one-directional (guide→checklist but not checklist→guide). Now bidirectional."
    deviation: "none"
preserved:
  - "engine/xp-system.md — already has deprecation notices for total_xp >= N in §7, no changes needed"
  - "engine/scanner.md — no issues found in this round"
  - "SKILL.md — hero_title fallback already implicit in quest-log meta contract, no changes needed"
---

# Code Ping-Pong — Round 11 Fix Report

## Summary

All 4 issues from round-11 review addressed. Changes span 3 files (guide.md, ceremony.md, checklist.md) with 13 insertions and 1 deletion. All fixes strengthen cross-reference contracts between modules — no logic or behavior changes.

---

## Fixes Applied

### Fix for Issue 11.1

**Progress bar contract reference missing in guide.md §5 and §6 templates**

**Problem:** The `progress_bar()` function code block in §5 and the Summary View template in §6 lacked inline references to the unified progress bar contract, risking silent drift if the bar style changes in ceremony.md.

**Fix:** Added inline comments inside both code blocks:
- **§5 `progress_bar()` function:** 3-line comment at top of function listing all four contract locations (ceremony.md §2, ceremony.md §7, guide.md §5, guide.md §6) — matches the pattern already used in ceremony.md §7 template (line 459).
- **§6 Summary View template:** 2-line inline reference after the progress bar rows, pointing to the canonical function in §5 and the ceremony.md locations.

**Anti-whack-a-mole:** Checked all four progress bar locations:
- ceremony.md §2 (loading sequence): already has contract note
- ceremony.md §7 (Resumption Banner): already has inline `↑ Uses unified progress bar contract` at line 459
- guide.md §5: was missing inline ref in code block — **fixed**
- guide.md §6: was missing inline ref in template — **fixed**

---

### Fix for Issue 11.2

**Deprecation warning for 'total_xp >= N' not present in guide.md achievement references**

**Problem:** Achievement conditions in guide.md (§4.4 Achievement Unlock, §6 Next Achievement) did not reference the deprecation of `total_xp >= N` in favor of `item_xp >= N`, risking confusion for pack authors.

**Fix:** Added deprecation cross-references in two locations:
1. **§4.4 (after Achievement Unlock template):** Full contract block explaining the deprecation, pointing to xp-system.md §7 and checklist.md §1.
2. **§6 Next Achievement section:** Shorter note referencing the §4.4 cross-reference and xp-system.md §7.

**Propagation semantica:** The broken contract is "all modules that reference achievement conditions must warn about the deprecation." Analysis:
- xp-system.md §7: has full deprecation notice (lines 195, 308-310) — OK
- checklist.md §1: has deprecation warning (lines 36, 41) — OK
- guide.md §4.4: was missing — **fixed**
- guide.md §6 Next Achievement: was missing — **fixed**
- ceremony.md: does not reference achievement conditions directly — N/A

---

### Fix for Issue 11.3

**Edge case for fallback behavior on missing hero_title not referenced in ceremony.md §7**

**Problem:** The Resumption Banner in ceremony.md §7 documented hero_name fallback but not hero_title fallback. The Field Sources table omitted hero_title entirely, and there was no contract block for hero_title behavior.

**Fix:** Two additions to ceremony.md §7:
1. **Field Sources table:** Added `hero_title` row with source (`quest_log.meta.hero_title`), fallback (empty string), and explicit rendering rule: if non-empty/non-whitespace → `Bem-vindo de volta, {hero_name}, {hero_title}!`; if missing/empty/whitespace → omit entirely.
2. **Contract block:** Added `Contract — hero_title fallback (Resumption Banner)` mirroring the hero_name contract pattern, cross-referencing all four locations (ceremony.md §1.5, SKILL.md, guide.md §1, ceremony.md §7).

**Propagation semantica:** The broken contract is "all modules that consume hero_title must agree on fallback behavior (empty = omit)." Analysis:
- ceremony.md §1.5: has contract block (line 118) — OK
- guide.md §1: has contract block (line 16) — OK
- SKILL.md: implicit in quest-log meta schema — OK
- ceremony.md §7: was missing — **fixed**

---

### Fix for Issue 11.4

**Checklist.md §1 unused items contract does not reference guide.md §5 log view icon**

**Problem:** The formal `Contract — unused items exclusion` block in checklist.md §1 listed many enforcement locations but did not mention the `[·]` visual indicator from guide.md §5. The cross-reference was one-directional (guide.md §5 referenced checklist.md, but not vice versa).

**Fix:** Updated the contract block to:
1. Add explicit sentence: "Guide.md §5 (Quest Log View) displays unused items with the **`[·]` icon** as their visual indicator — this icon is part of the unified unused-item contract and MUST be used consistently."
2. Add `guide.md §5 ([·] visual indicator)` to the enforced-at list.

**Anti-whack-a-mole:** Verified all locations that display or reference unused item visuals:
- guide.md §5 (line 644): has contract note referencing checklist.md §1 — OK (already bidirectional after this fix)
- ceremony.md §3 (inventory): not applicable (ceremony doesn't render per-item icons)
- checklist.md §1 (contract block): was missing `[·]` icon reference — **fixed**

---

## Skipped Issues

(none)

---

## Quality Checks

- **lint:** skipped (markdown-only changes, no JS/TS modified)
- **typecheck:** skipped (markdown-only changes, no JS/TS modified)
- **tests:** skipped (markdown-only changes, no JS/TS modified)
