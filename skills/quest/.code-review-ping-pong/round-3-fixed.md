---
protocol: code-review-ping-pong
type: fix
round: 3
date: "2026-03-31"
fixer: "Claude Opus 4.6"
review_file: round-3.md
commit_sha_before: "854a8bcdf37e317af88e3d785e30841929ecb00b"
commit_sha_after: "5f13fa7223b1b470077faf633dac1a534719a14b"
branch: chore/devops-10-improvements
issues_fixed: 3
issues_skipped: 0
issues_total: 3
git_diff_stat: "2 files changed, 60 insertions(+), 19 deletions(-)"
quality_checks:
  lint: skipped
  typecheck: skipped
  tests: skipped
fixes:
  - id: "3.1"
    status: FIXED
    file: "engine/xp-system.md"
    description: "Added resolved_items merge (pack items + quest-log sub-items) in new section 2.0. Updated base_item_xp (2.0.1), streak (4), counters (5), and all_items_done achievement condition (7) to iterate resolved_items instead of pack.phases[*].items only. Sub-items now contribute to XP, streak, counters, and completion checks."
    deviation: "none"
  - id: "3.2"
    status: FIXED
    file: "engine/guide.md"
    description: "Renamed section 6 from '/quest summary' to 'variant of /quest status'. Added clarification that summary is not a separate command but a compact rendering mode chosen by the guide when showing /quest status. No change to SKILL.md routing needed — status already routes to guide.md."
    deviation: "none"
  - id: "3.3"
    status: FIXED
    file: "engine/guide.md"
    description: "Added guard for total <= 0 in progress_bar() function (section 5) returning empty bar. Added edge case documentation in section 8 for phases with all items unused (0/0, 0%, empty bar). Anti-whack-a-mole: xp-system.md percent formula already had the guard."
    deviation: "none"
preserved:
  - "engine/ceremony.md — no issues in this round"
  - "engine/scanner.md — no issues in this round"
  - "engine/checklist.md — no issues in this round; sub-item contract (7.5) was already correct"
  - "SKILL.md — no routing change needed; summary is variant of status"
---

# Code Ping-Pong — Round 3 Fix Report

## Summary

All 3 issues from round 3 were fixed in a single commit. The main fix (3.1) was structural: the XP system now merges sub-items from the quest-log into a unified `resolved_items` list before any calculation, closing the contract gap between checklist.md and xp-system.md.

## Fixes

### Fix for Issue 3.1

**Sub-items contract alignment between checklist and XP system (xp-system.md)**

The core problem: checklist.md §7.5 defines sub-items as real work that counts toward `items_total`, `items_done`, `percent`, XP, streak, and achievements. But xp-system.md only iterated `pack.phases[*].items`, making sub-items invisible to all calculations.

Changes:
1. **New §2.0 — Resolve item list:** Builds a `resolved_items` list merging pack items with quest-log sub-items (detected via `sub_of` field). Sub-items inherit `round(parent.xp * 0.5)` and `required: false` per checklist.md §7.5
2. **§2.0.1 — XP calculation:** `base_item_xp` now iterates `resolved_items`
3. **§4 — Streak:** Uses `resolved_items` for streak counting (sub-items participate)
4. **§5 — Counters:** `items_total`, `items_done`, `items_skipped`, `items_unused` all use `resolved_items`
5. **§7 — `all_items_done`:** Uses `resolved_items` so sub-items must also be done/skipped/unused

Anti-whack-a-mole sweep: checked all `pack.phases[*].items` iterations across all engine files. The occurrences in phase-scoped conditions (§7: `all_required_done_in_phase`, `all_items_done_in_phase`, `phase_done_same_day`) correctly use pack items only for the `required` gate since sub-items never block phase unlock. `checklist.md:155` is in the migration diff logic (not XP calculation) and is also correct.

### Fix for Issue 3.2

**Summary view phantom command (guide.md)**

`/quest summary` was documented as a standalone command but had no routing in SKILL.md. Instead of adding a new route (which would expand the API surface unnecessarily), the section was reframed as a rendering variant of `/quest status`:

1. **Renamed heading:** `## 6. Summary View (/quest summary)` → `## 6. Summary View (variant of /quest status)`
2. **Added clarification paragraph:** Explicitly states this is not a separate command. The guide decides whether to render the expanded view (§5) or summary view (§6) when handling `/quest status`

No change to SKILL.md was needed — `status` already routes to guide.md, which now owns the decision of which view to render.

### Fix for Issue 3.3

**Progress bar division by zero for empty worlds (guide.md)**

After the introduction of `unused` status, a world can end up with `total = 0` (all items marked unused). The `progress_bar()` function divided by `total` unconditionally.

Changes:
1. **§5 progress_bar():** Added `if total <= 0: return "░" * 16` guard before the division
2. **§8 Edge Cases:** Added explicit documentation for "Phase with all items `unused`" — render empty bar, show 0/0 and 0%

Anti-whack-a-mole sweep: checked all division-by-total patterns in engine files. `xp-system.md` §5 already had a ternary guard (`items_total > 0 ? ... : 0`). `ceremony.md` does not use progress bars. The only unguarded division was in guide.md §5.

## Anti-Whack-a-Mole Report

| Pattern | Files checked | Extra fixes needed |
|---------|--------------|-------------------|
| `pack.phases[*].items` without sub-items | xp-system.md, checklist.md | Only xp-system.md §2, §4, §5, §7 needed fixes |
| Division by total without guard | guide.md, xp-system.md, ceremony.md | Only guide.md §5 was unguarded |
| Undocumented commands | SKILL.md, guide.md | Only guide.md §6 had the phantom `/quest summary` |
