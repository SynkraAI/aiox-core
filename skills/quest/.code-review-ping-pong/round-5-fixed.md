---
protocol: code-review-ping-pong
type: fix
round: 5
date: "2026-04-01"
fixer: "Claude Opus 4.6"
review_file: round-5.md
commit_sha_before: "0231d2511303cd4b905491f546078f2e6786e93a"
commit_sha_after: "500072743bfdde435e17877df624e63481547411"
branch: chore/devops-10-improvements
issues_fixed: 4
issues_skipped: 0
issues_total: 4
git_diff_stat: "3 files changed, 10 insertions(+)"
quality_checks:
  lint: skipped
  typecheck: skipped
  tests: skipped
fixes:
  - id: "5.1"
    status: FIXED
    file: "SKILL.md"
    description: "Added contract note documenting hero_name fallback 'Aventureiro' shared across SKILL.md, guide.md §1, and ceremony.md §7. Propagation: grepped for 'Aventureiro' and 'hero_name' across all engine files — guide.md §1 already documents fallback with full whitespace handling, ceremony.md §7 already lists fallback in Field Sources table. SKILL.md was the only location missing the explicit contract. All three now cross-reference each other."
    deviation: "none"
  - id: "5.2"
    status: FIXED
    file: "engine/checklist.md"
    description: "Added contract note in §3 step 5 (stats recalculation) cross-referencing all 4 progress bar locations: ceremony.md §2 (loading), ceremony.md §7 (resumption banner), guide.md §5 (per-phase bars), guide.md §6 (summary view). Semantic propagation: the contract is about stats feeding visual rendering — checklist.md calculates the stats, ceremony/guide render them. The missing link was checklist not knowing its output feeds a shared visual contract. Verified ceremony.md §2 and §7 already document the contract, guide.md §5 and §6 already reference it. No other files needed changes."
    deviation: "none"
  - id: "5.3"
    status: FIXED
    file: "engine/ceremony.md"
    description: "Added note in Project Card Field Sources (§3) explaining that sub-items (checklist.md §7.5) are included in all counters and XP calculations via xp-system.md §2 resolved item list. Clarified that sub-items affect stats (level, XP, percent) but do NOT appear in inventory or world map (which use pack items only). Semantic propagation: the contract is 'what counts in stats' — verified xp-system.md §2.0 documents the resolved item list, checklist.md §7.5 documents sub-item XP formula (round(parent.xp * 0.5)), and guide.md renders stats it receives without modification. No other files needed changes."
    deviation: "none"
  - id: "5.4"
    status: FIXED
    file: "SKILL.md"
    description: "Added pack validation halt note in Command Routing section: if scanner.md §3.2 finds no valid packs, orchestrator must show scanner error and HALT — no fallback to ceremony or quest-log creation. Semantic propagation: the contract is 'what happens when all packs fail validation'. Verified scanner.md §3.2 already documents the error message format and the 'show this message to the user if no valid packs remain' instruction. SKILL.md was the only consumer missing the explicit halt behavior. Also added unknown command handling row to the routing table for completeness."
    deviation: "none"
preserved:
  - "engine/guide.md — already documents hero_name fallback in §1 and progress bar contract in §5/§6, no changes needed"
  - "engine/xp-system.md — already documents resolved item list with sub-items in §2.0, no changes needed"
  - "engine/scanner.md — already documents validation error messages in §3.2 and §7, no changes needed"
  - "engine/forge-bridge.md — not in scope for any of the 4 issues"
---

# Code Ping-Pong — Round 5 Fix Report

## Summary

All 4 issues from round-5 review were addressed. Changes are purely documentation/contract improvements — no behavioral logic changed. Each fix includes anti-whack-a-mole grep and semantic propagation analysis to ensure consistency across all engine modules.

---

## Fixes Applied

### Fix for Issue 5.1

**Problem:** SKILL.md did not document the hero_name fallback contract ("Aventureiro"), risking divergence between SKILL.md, guide.md §1, and ceremony.md §7.

**What was done:** Added explicit contract note after the Quest Master personality description in SKILL.md, stating that "Aventureiro" is the canonical fallback for missing/empty/whitespace-only hero_name, shared across 3 locations.

**Anti-whack-a-mole:** Grepped `Aventureiro` and `hero_name.*fallback` across all engine files. Results:
- `guide.md §1`: already documents fallback with whitespace handling — no change needed
- `ceremony.md §7`: already lists "Aventureiro" as fallback in Field Sources table — no change needed
- `checklist.md §2`: references hero_name as REQUIRED but delegates collection to ceremony — no fallback relevant here
- SKILL.md: was the only missing link — now fixed

**Semantic propagation:** The contract is "what name to use when hero_name is absent". All 3 rendering locations (SKILL.md intro, guide.md voice, ceremony.md banner) now cross-reference each other.

---

### Fix for Issue 5.2

**Problem:** checklist.md §3 (Read Quest-log, stats recalculation) did not reference the shared progress bar visual contract, creating a gap where stats changes could drift from visual rendering.

**What was done:** Added contract note in §3 step 5 (stats recalculation) explicitly cross-referencing all 4 progress bar consumers: ceremony.md §2, ceremony.md §7, guide.md §5, guide.md §6.

**Anti-whack-a-mole:** Grepped `progress_bar` and `bar width` across all engine files. Results:
- `ceremony.md §2`: has contract note — no change needed
- `ceremony.md §7`: has contract note with cross-reference to §2 — no change needed
- `guide.md §5`: defines `progress_bar()` function — no change needed
- `guide.md §6`: uses same contract — no change needed
- `checklist.md §3`: was the stats producer without the consumer cross-reference — now fixed

**Semantic propagation:** The contract is "stats feed visual bars". The producer (checklist.md stats) now knows about the consumers (ceremony/guide bars), completing the bidirectional contract chain.

---

### Fix for Issue 5.3

**Problem:** ceremony.md Project Card (§3) described inventory and stats fields but did not mention that sub-items are included in all counters and XP calculations.

**What was done:** Added note in Project Card Field Sources explaining that sub-items (checklist.md §7.5) contribute to stats via xp-system.md §2 resolved item list, but do NOT appear in inventory or world map.

**Anti-whack-a-mole:** Grepped `sub-item` and `sub_of` across all engine files. Results:
- `xp-system.md §2.0`: defines resolved_items merging pack items + sub-items — no change needed
- `checklist.md §7.5`: full sub-item specification — no change needed
- `guide.md`: renders stats it receives, no sub-item specific logic — no change needed
- `ceremony.md §3`: was the visual display missing sub-item awareness — now fixed

**Semantic propagation:** The contract is "what counts in stats displayed to the user". The rendering module (ceremony.md) now explicitly acknowledges that its counters include sub-items, not just pack items.

---

### Fix for Issue 5.4

**Problem:** SKILL.md command routing did not specify behavior when scanner.md §3.2 finds no valid packs after schema validation.

**What was done:** Added "Pack validation halt" note in the Command Routing section stating that if no valid packs remain after schema validation, the orchestrator must show the scanner error and HALT. Also added unknown command routing row to the table for completeness.

**Anti-whack-a-mole:** Grepped `no valid packs` and `schema validation` across all engine files. Results:
- `scanner.md §3.2`: defines validation procedure and error message — no change needed
- `scanner.md §7`: defines error handling messages — no change needed
- `SKILL.md §Step 1`: references scanner.md but did not specify halt behavior — now fixed

**Semantic propagation:** The contract is "what happens when the pack pipeline produces zero valid candidates". The scanner defines the error, and the orchestrator (SKILL.md) now explicitly documents the halt behavior, preventing any implicit fallback to ceremony or quest-log creation with undefined pack state.
