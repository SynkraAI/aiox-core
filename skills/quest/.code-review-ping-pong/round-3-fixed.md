---
protocol: code-review-ping-pong
type: fix
round: 3
date: "2026-04-01"
fixer: "Claude Code (Opus)"
review_file: round-3.md
commit_sha_before: "03ea8d84929e219a1e4ba639e24470876cf0f484"
commit_sha_after: "2851833dff2c1b3ebbefdaec2da429a41aed22ef"
branch: chore/devops-10-improvements
issues_fixed: 4
issues_skipped: 0
issues_total: 4
git_diff_stat: "4 files changed, 12 insertions(+), 6 deletions(-)"
quality_checks:
  lint: skipped
  typecheck: skipped
  tests: skipped
fixes:
  - id: "3.1"
    status: FIXED
    file: "engine/ceremony.md"
    description: "Changed floor() to round() in loading sequence §2 for consistency with §7 and guide.md §5; added contract note linking all three progress bar implementations"
    deviation: "none"
  - id: "3.2"
    status: FIXED
    file: "engine/guide.md"
    description: "Strengthened hero_name fallback in Voice Rule 1 to cover empty/whitespace; added defensive note against literal {hero_name}/{hero_title} leaking to user output"
    deviation: "none"
  - id: "3.3"
    status: FIXED
    file: "engine/xp-system.md"
    description: "Added prominent boxed deprecation warning at top of §7 for total_xp >= N alias with explicit migration guidance for pack authors"
    deviation: "none"
  - id: "3.4"
    status: FIXED
    file: "engine/checklist.md"
    description: "Added explicit cross-references to guide.md §2, xp-system.md §4/§5/§7 in unused item exclusion rules; each bullet now links to the enforcing module and section"
    deviation: "none"
preserved:
  - "engine/scanner.md — no issues in this file"
  - "SKILL.md — no issues in this file"
  - "engine/forge-bridge.md — no issues in this file"
---

# Code Ping-Pong — Round 3 Fix Report

## Summary

All 4 issues from round-3.md were addressed in commit 2851833df. Fixes strengthen cross-module contracts for progress bar rendering, hero name resolution, XP deprecation visibility, and unused item exclusion consistency.

## Fixed Issues

### Fix for Issue 3.1

**Problem:** The loading sequence in ceremony.md §2 used `floor()` for progress bar fill calculation, while the Resumption Banner (§7) and guide.md §5 `progress_bar()` use `round()`. This inconsistency could cause visual drift between the three progress bar implementations.

**Fix applied:** Changed `floor(20 * (i + 1) / (N + 1))` to `round(20 * (i + 1) / (N + 1))` in ceremony.md §2 (Generation Rules, step 4). Added a **Contract — progress bar visual consistency** note directly below step 5 linking ceremony.md §2, ceremony.md §7, and guide.md §5, mandating same character set, width, and rounding.

**Anti-whack-a-mole analysis:** Searched all engine files for `floor` and `round` in progress bar contexts:
- `ceremony.md §2` — was `floor()`, now `round()` (FIXED)
- `ceremony.md §7` — already `round()`, already has contract note
- `guide.md §5` — canonical `progress_bar()` uses `round()`, no change needed
- `guide.md §6` — references §5 function, no change needed
- No other files render progress bars

**Semantic propagation:** The contract is "all progress bar implementations across all modules MUST use identical rounding (`round()`), character set (`█`/`░`), and width (20 chars)." Three implementations participate: ceremony.md §2 (loading sequence), ceremony.md §7 (resumption banner), guide.md §5 (status/summary). All three now have contract notes pointing to each other.

### Fix for Issue 3.2

**Problem:** Voice Rule 1 in guide.md described fallback to "Aventureiro" when quest-log is missing or field is empty, but did not explicitly cover the case where `meta.hero_name` exists but contains only whitespace. Also lacked a defensive note against the literal `{hero_name}` string leaking into user output if substitution fails.

**Fix applied:** Updated Voice Rule 1 (guide.md §1, rule 1) to explicitly list all fallback triggers: "no quest-log yet, field is missing, empty, or contains only whitespace". Added the same defense for `hero_title`. Added a defensive clause: "if substitution fails for any reason, use the fallback ('Aventureiro') instead of rendering the raw placeholder."

**Anti-whack-a-mole analysis:** Searched all engine files for `hero_name` fallback handling:
- `guide.md §1` — Voice Rule 1 (FIXED: now covers whitespace + literal defense)
- `ceremony.md §7` — Resumption Banner field sources already say `(fallback: "Aventureiro")`, consistent
- `ceremony.md §1.5` — Hero Identity input validation already handles empty/whitespace with retries and defaults to "Aventureiro" after 3 retries. Consistent with the strengthened rule.
- `checklist.md §1` — quest-log template defines `hero_name: string` as required field (ceremony ensures it's populated)

**Semantic propagation:** The contract is "hero_name must NEVER be empty, whitespace, or a raw placeholder in user-facing output." Participating modules: ceremony.md §1.5 (collects with validation), checklist.md §1 (stores as required), guide.md §1 (renders with fallback), ceremony.md §7 (renders with fallback). All handle the empty case. The new fix makes whitespace handling explicit in guide.md, which is the primary rendering module.

### Fix for Issue 3.3

**Problem:** The deprecation of `total_xp >= N` in favor of `item_xp >= N` was documented inline in the condition description but lacked a prominent warning that pack authors would notice when scanning §7.

**Fix applied:** Added a boxed `> ⚠️ DEPRECATION NOTICE` blockquote at the top of §7 (Achievement Evaluation), before the pack example. The notice explicitly states: use `item_xp >= N` for all new packs, `total_xp >= N` is deprecated and will be removed, and explains why the old name is misleading. The existing inline deprecation note was preserved for completeness.

**Anti-whack-a-mole analysis:** Searched all engine files for `total_xp >= N` and `item_xp >= N`:
- `xp-system.md §7` — condition definitions (FIXED: added top-of-section warning)
- No other files reference this condition syntax — pack YAMLs are the consumers

**Semantic propagation:** The contract is "pack achievement conditions should use `item_xp >= N`, not `total_xp >= N`." Only xp-system.md §7 defines these conditions — packs consume them. The fix ensures the deprecation is visible at the entry point of §7, not buried in individual condition docs.

### Fix for Issue 3.4

**Problem:** The unused item exclusion rules in checklist.md §1 listed what unused items do NOT count toward, but lacked explicit cross-references to the specific module sections that enforce these exclusions, risking future contract drift.

**Fix applied:** Updated each bullet in the "Unused items" list (checklist.md §1, `**Note on `unused`:**` section) to include explicit cross-references:
- `items_total` exclusion → **xp-system.md §5**
- `percent` exclusion → **xp-system.md §5**
- Phase unlock → **guide.md §2** `is_phase_unlocked`
- Streak exclusion → **xp-system.md §4** (new bullet — was implicit)
- Achievement exclusion → **xp-system.md §7** (new bullet — was only in lifecycle section)
- Visual indicator → **guide.md §5** (`[·]` icon)

**Anti-whack-a-mole analysis:** Searched all engine files for `unused` handling:
- `checklist.md §1` — lifecycle documentation (FIXED: added cross-references)
- `xp-system.md §4` — streak calc filters out unused. Already has comment explaining exclusion.
- `xp-system.md §5` — counters exclude unused from items_total. Already documented.
- `xp-system.md §7` — all achievement conditions use `if status == "unused": continue`. Already documented.
- `guide.md §2` — phase unlock treats unused as non-blocking. Already documented.
- `guide.md §5` — shows `[·]` icon. Already documented.
- `ceremony.md §7` — uses xp-system stats which exclude unused. Already documented.

All enforcement points were already correct. The fix adds navigation links from the central definition (checklist.md) to each enforcement point, making the contract discoverable without reading every module.

**Semantic propagation:** The contract is "unused items are invisible to progress, XP, streaks, achievements, and phase unlocks." Seven enforcement points across three modules. The checklist.md lifecycle section already listed most of them in the "Impact across modules" sub-section — the fix elevates these references to the primary exclusion rules list (which is what developers read first) and adds the two that were missing (streaks, achievements).

## Skipped Issues

(none)
