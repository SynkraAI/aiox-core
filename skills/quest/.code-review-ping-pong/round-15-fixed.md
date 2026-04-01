---
protocol: code-review-ping-pong
type: fix
round: 15
date: "2026-04-01"
fixer: "Claude Opus 4.6"
review_file: round-15.md
commit_sha_before: "331b9a740da2b0cd3a0590a000ac60943949952b"
commit_sha_after: "48ebd89016ec1af6bb023f941753e3bfd6547099"
branch: chore/devops-10-improvements
issues_fixed: 4
issues_skipped: 0
issues_total: 4
git_diff_stat: "3 files changed, 8 insertions(+), 2 deletions(-)"
quality_checks:
  lint: skipped
  typecheck: skipped
  tests: skipped
fixes:
  - id: "15.1"
    status: FIXED
    file: "engine/xp-system.md"
    description: "Added prominent deprecation callout box at the very top of §7 Supported Conditions list, before any condition definition. The warning directs pack authors to use item_xp >= N only, with explicit cross-references to checklist.md §1 and SKILL.md Critical Rule 5."
    deviation: "none"
  - id: "15.2"
    status: FIXED
    file: "engine/guide.md"
    description: "Added explicit inline cross-reference in §6 Summary View template, listing all four co-owner locations (ceremony.md §2, ceremony.md §7, guide.md §5, guide.md §6) that share the unified progress bar contract. Points to §5 for canonical implementation."
    deviation: "none"
  - id: "15.3"
    status: FIXED
    file: "engine/xp-system.md"
    description: "Added unused items contract cross-reference in §7 Achievement Evaluation (after intro paragraph) and §10 Edge Cases (unused bullet). Both reference checklist.md §1 (status lifecycle), guide.md §2 (next mission selection), and xp-system.md §4/§5/§7 (streak, counters, achievements)."
    deviation: "none"
  - id: "15.4"
    status: FIXED
    file: "engine/scanner.md"
    description: "Clarified drift warning in §6 free-text table: IDs are explicitly labeled as 'illustrative only' and must always be derived from validated pack schemas at runtime. Cross-references checklist.md §1 and xp-system.md §2.0."
    deviation: "none"
preserved:
  - "SKILL.md — already has Critical Rule 5 with deprecation cross-references"
  - "engine/checklist.md — already has deprecation warning and unused items contract in §1"
  - "engine/ceremony.md — not affected by these issues, progress bar contracts already complete"
---

# Code Ping-Pong — Round 15 Fix Report

## Summary

4 issues found in round 15, all fixed. Fixes strengthen cross-references and contract visibility across xp-system.md, guide.md, and scanner.md. No functional logic was changed — all fixes are documentation/contract hardening.

## Anti-Whack-a-Mole Analysis

- **15.1 (deprecation visibility):** Grep for `total_xp >= N` across all quest engine files. Found in 3 locations: xp-system.md §7 (conditions list + legacy alias), checklist.md §1 (achievements deprecation callout), SKILL.md (Critical Rule 5). All three already had the deprecation notice. Fix adds a prominent callout box at the TOP of the Supported Conditions list in xp-system.md §7 for maximum visibility to pack authors scanning the conditions reference.
- **15.2 (progress bar contract in §6):** Checked all 4 progress bar locations: ceremony.md §2 (loading sequence) ✓, ceremony.md §7 (Resumption Banner) ✓, guide.md §5 (canonical function) ✓, guide.md §6 (Summary View) — already had contract block at line 696 but template comments only listed 2 locations. Fix adds all 4 co-owner locations inline in the template.
- **15.3 (unused items in achievements):** Identified ALL modules that iterate items or calculate stats: xp-system.md §2 (XP calc), §4 (streak), §5 (counters), §7 (achievements), §10 (edge cases); guide.md §2 (next mission); checklist.md §1 (status lifecycle). §4 already had comprehensive cross-reference (lines 137-143). §7 and §10 were missing explicit cross-references. Both fixed.
- **15.4 (hardcoded IDs in scanner):** Grep for hardcoded pack IDs (`app-development`, `squad-upgrade`) across all engine files. Only found in scanner.md §6 examples (illustrative) and §4.4 example output (illustrative). Both already have drift warnings. Fix strengthens §6 warning with "illustrative only" language.

## Semantic Propagation Analysis

- **Contract: deprecation total_xp >= N** — 3 participants: xp-system.md §7, checklist.md §1, SKILL.md rule 5. All verified consistent. xp-system.md §7 now has the deprecation at TWO locations: top of Supported Conditions (new) and inline at the legacy alias definition (existing).
- **Contract: progress bar visual consistency** — 4 participants: ceremony.md §2, ceremony.md §7, guide.md §5, guide.md §6. All verified consistent. §6 template now explicitly lists all 4 co-owners.
- **Contract: unused items exclusion** — 6 participants: checklist.md §1 (lifecycle definition), guide.md §2 (mission selection), xp-system.md §4 (streak), §5 (counters), §7 (achievements), §10 (edge cases). All verified consistent after fix. §7 and §10 now have explicit cross-references.
- **Contract: runtime ID derivation** — scanner.md §6 (free-text table) and §4.4 (match results). Both already had drift warnings. §6 now has stronger "illustrative only" language.

## Fixes Applied

### Fix for Issue 15.1

**File:** `engine/xp-system.md` (§7 Supported Conditions)

**Problem:** The deprecation warning for `total_xp >= N` was present in the introductory blockquote and at the legacy alias definition, but not at the very top of the Supported Conditions list. Pack authors scanning the conditions reference could miss it.

**Fix:** Added a prominent `> ⚠️ DEPRECATION` callout box immediately after the "Supported Conditions" heading and before the first condition definition (`first_item_done`). The callout directs pack authors to use `item_xp >= N` only and cross-references checklist.md §1 and SKILL.md Critical Rule 5.

**Propagation:** Verified all 3 deprecation locations — xp-system.md §7 (now has callout + inline), checklist.md §1 (line ~35, already has deprecation callout), SKILL.md Critical Rule 5 (already has deprecation). All consistent.

### Fix for Issue 15.2

**File:** `engine/guide.md` (§6 Summary View template)

**Problem:** The Summary View template had inline comments referencing the progress bar contract but only listed 2 of the 4 co-owner locations (ceremony.md §2, §7). The contract block at line 696 was complete, but the template itself could mislead implementors.

**Fix:** Added two more comment lines in the template listing all 4 co-owner locations explicitly and pointing to §5 for the canonical implementation.

**Propagation:** Verified all 4 progress bar locations. All use identical characters (`█`/`░`), width (20), and rounding (`round()`). No divergence found.

### Fix for Issue 15.3

**File:** `engine/xp-system.md` (§7 Achievement Evaluation + §10 Edge Cases)

**Problem:** The achievement evaluation section individually noted that unused items are excluded in each condition, but lacked a centralized cross-reference to the unused items contract. §10 similarly described the behavior but didn't reference where the contract is defined.

**Fix:** Added a blockquote after the §7 intro paragraph establishing the unused items contract for ALL achievement conditions, with cross-references to checklist.md §1 (lifecycle), guide.md §2 (mission selection), and xp-system.md §4/§5/§10. Also added a comprehensive cross-reference in the §10 unused bullet, listing all 6 modules that participate in the unused items exclusion contract.

**Propagation:** Semantic analysis of "where should unused be handled but isn't explicitly documented":
1. checklist.md §1 — defines lifecycle ✓
2. guide.md §2 — skips in mission selection ✓ (line ~53)
3. xp-system.md §4 — excludes from streak ✓ (lines 132-143, comprehensive)
4. xp-system.md §5 — excludes from counters ✓ (line 170)
5. xp-system.md §7 — each condition excludes ✓, now has centralized contract ✓
6. xp-system.md §10 — edge case documented ✓, now has cross-references ✓

### Fix for Issue 15.4

**File:** `engine/scanner.md` (§6 free-text table drift warning)

**Problem:** The drift warning existed but didn't explicitly state that the IDs in the example table are "illustrative only". An implementor could read the examples as normative values.

**Fix:** Strengthened the drift warning to lead with "IDs are illustrative only" and clarified that actual pack IDs must always be derived from validated pack schemas at runtime (§3.1 + §3.2). Cross-references to checklist.md §1 and xp-system.md §2.0 retained.

**Propagation:** Checked scanner.md §4.4 (match results example) — also has illustrative IDs but is clearly in a "match results" example block. The §6 drift warning now covers both tables. No other engine files reference hardcoded pack IDs.
