---
protocol: code-review-ping-pong
type: fix
round: 15
date: "2026-03-31"
fixer: "Claude Opus 4.6"
review_file: round-15.md
commit_sha_before: "b7516beca18b500c334d8282a92aaea527bb07ff"
commit_sha_after: "ef42d17af840bd50f07aa95c73a3792bcfebeead"
branch: chore/devops-10-improvements
issues_fixed: 3
issues_skipped: 0
issues_total: 3
git_diff_stat: "2 files changed, 85 insertions(+), 16 deletions(-)"
quality_checks:
  lint: skipped
  typecheck: skipped
  tests: skipped
fixes:
  - id: "15.1"
    status: FIXED
    file: "engine/guide.md"
    description: "Recovery path in §2.5 Rules no longer claims /quest scan re-triggers the Integration Gate. Updated to direct users to advance to next mission (which runs is_phase_unlocked → verify_phase_integration). Anti-whack-a-mole: grep for 'scan.*re-trigger' and 'quest scan.*fix' across all engine/*.md confirmed this was the ONLY occurrence. Propagation: checklist.md §5 already correctly states scan uses is_phase_unlocked_persisted (pure predicate, no gate execution)."
    deviation: "none"
  - id: "15.2"
    status: FIXED
    file: "engine/xp-system.md"
    description: "Added items_unused to §6 Assemble Stats Object so recalculated stats match the canonical schema in checklist.md §1. Anti-whack-a-mole: grep for 'items_unused' confirmed it is calculated in §5 but was missing from §6 assembly. Propagation: checklist.md §1 schema already includes items_unused: 0 as initial value — no changes needed there. The §5 calculation (items_unused = count of unused) and §10 edge case (unused excluded from items_total) are both consistent."
    deviation: "none"
  - id: "15.3"
    status: FIXED
    file: "engine/xp-system.md"
    description: "Removed dual-return and celebrations leak from §9 Execution Order. Steps 8-10 collapsed to steps 8-9: persist first, then single return with { stats, newly_unlocked, level_changed, old_level, new_level }. Explicit note that celebrations are guide.md's responsibility. Anti-whack-a-mole: grep for 'celebrations' in engine/*.md confirmed guide.md §4 is the canonical owner and xp-system §8 already defers to it — no other files reference xp-system returning celebrations. Propagation: guide.md §4 header already states 'xp-system provides calculation logic only — guide.md owns the visual output' — fully consistent now."
    deviation: "none"
preserved:
  - "engine/ceremony.md — not affected by any issue"
  - "engine/checklist.md — schema already correct (items_unused present in §1)"
  - "engine/scanner.md — not affected by any issue"
  - "SKILL.md — not affected by any issue"
---

# Code Ping-Pong — Round 15 Fix Report

## Summary

3 issues found in round-15 review, all FIXED. No skips.

- **15.1 (HIGH):** Recovery path regression from round-14's scan hardening
- **15.2 (HIGH):** Stats schema drift — items_unused missing from assembly
- **15.3 (MEDIUM):** Dual-return with celebrations ownership confusion

---

## Fixed Issues

### Fix for Issue 15.1

**HIGH — Recovery path do Integration Gate aponta para `/quest scan`, mas scan não reexecuta o gate**

**Root cause:** Round-14 correctly made `/quest scan` observational (using `is_phase_unlocked_persisted` instead of `is_phase_unlocked`), but guide.md §2.5 Rules still claimed scan "re-triggers" the gate.

**Fix:** Updated the recovery instruction in guide.md line 261 to direct users to advance to the next mission (which naturally calls `is_phase_unlocked()` → `verify_phase_integration()`), and explicitly notes that `/quest scan` is observational and does NOT re-execute the gate.

**Anti-whack-a-mole:** Grep for `scan.*re-trigger`, `re-trigger`, and `quest scan.*fix` across all `engine/*.md` and `SKILL.md` — this was the only occurrence. `checklist.md:282` already correctly documents that scan must NOT use `is_phase_unlocked` from guide.md §2.

**Propagation semântica:** The contract being enforced is "scan = read-only, progression flow = write". Modules participating: checklist.md §5 (scan steps), guide.md §2.5 (Integration Gate rules), guide.md §2 (`is_phase_unlocked` interactive function). All three are now consistent: only the progression flow (advancing missions) triggers the Integration Gate.

### Fix for Issue 15.2

**HIGH — Contrato de stats perde o campo obrigatório `items_unused` em toda recalculação**

**Root cause:** xp-system.md §5 calculates `items_unused` but §6 (Assemble Stats Object) omitted it from the YAML template. Since checklist.md §3 step 5 mandates "always recalculate stats via xp-system" and writes the returned stats to `quest_log.stats`, every recalculation would drop `items_unused` from the persisted data.

**Fix:** Added `items_unused: <calculated>` to the stats assembly template in xp-system.md §6, between `items_skipped` and `percent`.

**Anti-whack-a-mole:** Grep for `items_unused` across all files confirmed:
- `checklist.md:30` — canonical schema has `items_unused: 0` ✓
- `xp-system.md:145` — calculation exists ✓
- `xp-system.md:146` — used to derive `items_total` ✓
- `xp-system.md:§6` — was MISSING, now FIXED

**Propagação semântica:** The contract is "stats schema in checklist.md §1 = stats assembled in xp-system.md §6". All 9 fields now match: total_xp, level, level_name, streak, items_done, items_total, items_skipped, items_unused, percent.

### Fix for Issue 15.3

**MEDIUM — Execution Order do XP system tem retorno duplo e reintroduz ownership confuso de celebrations**

**Root cause:** Steps 8-10 in §9 had two return statements: step 8 returned `{ stats, newly_unlocked, level_changed, old_level, new_level }`, step 9 persisted, and step 10 returned `{ stats, newly_unlocked, celebrations }`. This created ambiguity about which return is canonical and leaked celebrations ownership into xp-system (contradicting §8 and guide.md §4).

**Fix:** Collapsed to two steps:
- Step 8: Write updated stats and achievements to quest-log (persist first)
- Step 9: Single return `{ stats, newly_unlocked, level_changed, old_level, new_level }` with explicit note that celebrations are guide.md's responsibility

**Anti-whack-a-mole:** Grep for `celebrations` in `engine/*.md` confirmed:
- `guide.md:337-339` — canonical owner ("xp-system provides calculation logic only — guide.md owns the visual output") ✓
- `guide.md:554,698,730` — rendering references ✓
- `ceremony.md:115` — hero_title usage in celebrations ✓
- `xp-system.md:359,361` — were the problematic dual-return, now FIXED

**Propagação semântica:** The contract is "xp-system = pure calculation + persistence, guide.md = rendering + celebrations". Modules involved: xp-system.md §8 (ownership declaration), xp-system.md §9 (execution order), guide.md §4 (celebrations rendering). All three now agree: xp-system returns data, guide.md renders celebrations.

---

## Skipped Issues

(none)
