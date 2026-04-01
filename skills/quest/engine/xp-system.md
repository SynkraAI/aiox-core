# XP System Module

Module for the Quest Engine. Calculates XP, levels, streaks, achievements, and stats from pack + quest-log data.

---

## 1. Inputs

You receive two data sources:

- **Pack YAML** — contains `levels`, `phases[].items[]` (with `xp`, `required`), and `achievements[]`
- **Quest-log YAML** — contains `items` map with `{ status, completed_at? }`

---

## 2. Calculate `total_base_xp`

First calculate the XP earned from completed items only. This value is used by achievement conditions that explicitly say "before achievement bonuses".

### 2.0 Resolve item list (pack items + sub-items)

Sub-items live only in the quest-log (see checklist.md §7.5). Before any XP, counter, or streak calculation, build a **resolved item list** that merges pack items with quest-log sub-items:

```
resolved_items = []

// 1. Collect pack items AND their sub-items in deterministic pack order.
//    For each pack item, immediately append its sub-items after it.
//    This guarantees sub-items are adjacent to their parent, which is
//    required for correct streak calculation (§4) and phase conditions (§7).
for each phase in pack.phases:
  for each item in phase.items:
    resolved_items.append({
      id:       item.id,
      xp:       item.xp,
      required: item.required,
      phase:    phase_index,
      source:   "pack"
    })
    // 2. Insert sub-items for this parent immediately after it
    sub_items = []
    for each id, entry in quest_log.items:
      parent_id = entry.sub_of
      if parent_id is undefined AND id has 3+ dot-separated parts:
        parent_id = first_two_parts(id)   // e.g. "4.2.M8" → "4.2"
      if parent_id == item.id:
        sub_items.append({ id, entry })
    // Sort sub-items by id lexicographically for determinism
    sort sub_items by id ascending
    for each sub in sub_items:
      resolved_items.append({
        id:       sub.id,
        xp:       round(item.xp * 0.5),     // checklist.md §7.5 rule
        required: false,                      // sub-items never block phase unlock
        phase:    phase_index,
        source:   "sub-item"
      })
```

**IMPORTANT — ordering guarantee:** The resulting `resolved_items` list is in strict pack order: phase 0 items first, then phase 1, etc. Within each phase, items appear in the order defined by the pack YAML. Each parent's sub-items appear immediately after it, sorted lexicographically by ID. This ordering is **not coincidental** — streak calculation (§4) and `consecutive_completions >= N` achievements depend on it. Do NOT sort or reorder `resolved_items` after construction.

**All sections below (§2, §4, §5) MUST iterate `resolved_items` instead of `pack.phases[*].items`.** Phase-scoped conditions (§7): `all_required_done_in_phase` and `phase_done_same_day` use pack items only for the `required` gate (sub-items are never `required`). `all_items_done_in_phase` uses `resolved_items` filtered by phase, since it checks ALL work — including sub-items — is resolved before declaring a phase fully complete.

### 2.0.1 XP calculation

```
total_base_xp = 0

for each item in resolved_items:
  if quest_log.items[item.id].status == "done":
    total_base_xp += item.xp
```

Items with status `pending` or `skipped` contribute 0 XP.

### 2.1 Calculate final `total_xp`

After achievement evaluation is complete, calculate the final `total_xp` by adding the bonuses from ALL unlocked achievements to `total_base_xp`.

```
total_xp = total_base_xp

for each achievement in quest_log.achievements:
  pack_achievement = find achievement in pack.achievements where id == achievement.id
  if pack_achievement and pack_achievement.xp_bonus:
    total_xp += pack_achievement.xp_bonus
```

**IMPORTANT:** Stats are recalculated from scratch on every read (checklist.md §3). The final `total_xp` must include bonuses from ALL previously unlocked achievements, otherwise earned XP would vanish on the next session.

---

## 3. Determine `level` and `level_name`

The pack defines a `levels` map:

```yaml
levels:
  1: { name: "Aprendiz", xp: 0, message: "..." }
  2: { name: "Construtor", xp: 100, message: "..." }
  3: { name: "Arquiteto", xp: 300, message: "..." }
```

Rules:
1. Sort levels by `xp` threshold ascending
2. The player's level is the **highest level whose `xp` threshold is <= `total_xp`**
3. Set `level` to that level number and `level_name` to its `name`

```
current_level = 1
current_name = levels[1].name
for each level_num in levels (sorted by xp ascending):
  if total_xp >= levels[level_num].xp:
    current_level = level_num
    current_name = levels[level_num].name
```

---

## 4. Calculate `streak`

Streak counts consecutive items completed without a skip, reading items in order from the most recent backward. Uses the `resolved_items` list from §2.0 (pack items + sub-items).

Rules:
1. Use `resolved_items` (§2.0) sorted in pack order (phase 0 items first, then phase 1; sub-items appear after their parent within the same phase)
2. Filter to items that have status `done` or `skipped` (ignore `pending`)
3. Walk backward from the last completed/skipped item
4. Count consecutive `done` items until you hit a `skipped` item or run out of items
5. That count is the streak

```
// NOTE: Only "done" and "skipped" are included. Items with status "unused"
// or "pending" are excluded — unused items don't exist in this project's
// context, so they cannot break or contribute to a streak.
active_items = [item for item in resolved_items
                where quest_log.items[item.id].status in ("done", "skipped")]
streak = 0
for item in reversed(active_items):
  if quest_log.items[item.id].status == "done":
    streak += 1
  else:  # skipped — breaks the streak
    break
```

If the last resolved item is `skipped`, streak = 0.

---

## 5. Calculate Counters

Counters use the `resolved_items` list from §2.0 (pack items + sub-items):

```
items_unused  = count of items in resolved_items with status "unused" in quest-log
items_total   = len(resolved_items) MINUS items_unused
items_done    = count of items in resolved_items with status "done" in quest-log
items_skipped = count of items in resolved_items with status "skipped" in quest-log
percent       = items_total > 0 ? round((items_done + items_skipped) / items_total * 100) : 0
```

Note: `percent` reflects overall progress (done + skipped), not just done. Items with status `unused` are **excluded** from `items_total` — they don't exist in this project's context, so they don't count toward progress. Sub-items are included in all counters (they represent real work — see checklist.md §7.5).

---

## 6. Assemble Stats Object

Write this to `quest_log.stats`:

```yaml
stats:
  total_xp: <calculated>
  level: <calculated>
  level_name: <calculated>
  streak: <calculated>
  items_done: <calculated>
  items_total: <calculated>
  items_skipped: <calculated>
  items_unused: <calculated>
  percent: <calculated>
```

---

## 7. Achievement Evaluation

> **⚠️ DEPRECATION NOTICE for pack authors:** The condition `total_xp >= N` is **deprecated**. Use `item_xp >= N` for ALL new packs. Both evaluate `total_base_xp` (item-only XP, before bonuses), but `total_xp >= N` is misleading because it does NOT check the user-facing `total_xp`. The alias will be removed in a future version. Existing packs should migrate to `item_xp >= N` when next updated.

The pack defines achievements:

```yaml
achievements:
  - id: "first_blood"
    name: "First Blood"
    icon: "🩸"
    condition: "first_item_done"
    xp_bonus: 10
    message: "Primeira missão completa!"

  - id: "phase_0_complete"
    condition: "all_required_done_in_phase:0"
    ...
```

For each achievement in the pack, evaluate its `condition`. If the condition is met AND the achievement is NOT already in `quest_log.achievements[]`, it is **newly unlocked**.

When unlocking:
1. Add `{ id, unlocked_at: <now> }` to `quest_log.achievements[]`
2. Do NOT add `xp_bonus` directly here. Newly unlocked achievements are added to `quest_log.achievements[]`, and their bonus is included when final `total_xp` is recalculated in section 2.1.
3. Return the achievement in the `newly_unlocked` list for celebration

### Supported Conditions

Achievements are an **array of objects** with fields: `id`, `name`, `icon`, `condition`, `xp_bonus`, `message`.

#### `first_item_done`

Any item in the quest-log has status `done`.

```
any(item.status == "done" for item in quest_log.items)
```

#### `item_done:ID`

A specific item has status `done` in the quest-log.

```
quest_log.items[ID].status == "done"
```

Parse ID from the condition string (e.g., `"item_done:1.3"` → check item `1.3`).

#### `item_done:ID AND item_done:ID` (compound)

Multiple specific items must all have status `done`. Uses the standard `AND` combinator — each sub-expression is an `item_done:ID` check.

```
"item_done:1.3 AND item_done:2.1"
→ quest_log.items["1.3"].status == "done" AND quest_log.items["2.1"].status == "done"
```

#### `all_required_done_in_phase:<N>`

All items marked `required: true` in phase N of the pack have status `done` in the quest-log. Items with status `unused` are excluded — they don't exist in this project.

```
for item in pack.phases[N].items where item.required == true:
  status = quest_log.items[item.id].status
  if status == "unused": continue
  status must be "done"
```

#### `all_items_done_in_phase:<N>`

ALL items in phase N — including sub-items — have status `done`, `skipped`, or `unused`. No item is `pending`. Items with status `unused` are excluded — they don't block this condition. Uses `resolved_items` (§2.0) to include sub-items, consistent with the contract that sub-items participate in progress within their phase.

```
phase_items = [item for item in resolved_items where item.phase == N]
for item in phase_items:
  status = quest_log.items[item.id].status
  if status == "unused": continue
  status must be "done" or "skipped"
```

#### `phase_done_same_day:<N>`

All required items in phase N have status `done` AND all their `completed_at` dates fall on the same calendar day (YYYY-MM-DD). Items with status `unused` are excluded.

```
dates = []
for item in pack.phases[N].items where item.required == true:
  status = quest_log.items[item.id].status
  if status == "unused": continue
  if status != "done": FAIL
  dates.append(quest_log.items[item.id].completed_at.date())
all dates must be the same day
```

#### `consecutive_completions >= N`

The current streak (consecutive `done` items without a skip, calculated in section 4) meets or exceeds N.

```
streak >= N
```

Parse N from the condition string (e.g., `"consecutive_completions >= 5"` → N = 5).

#### `item_xp >= N`

The player's XP from completed items only, before achievement bonuses (`total_base_xp` from section 2), meets or exceeds N. This prevents circular dependencies where an achievement's own XP bonus could trigger another achievement.

```
total_base_xp >= N
```

Parse N from the condition string (e.g., `"item_xp >= 500"` → N = 500).

**Legacy alias (DEPRECATED — use `item_xp >= N` instead):** `total_xp >= N` is accepted as an alias for `item_xp >= N` for backward compatibility with existing packs. Both evaluate `total_base_xp` (item-only XP, before achievement bonuses — see §2), NOT the final `total_xp` displayed to the user. The name `total_base_xp` means "total XP from base items only" — it excludes achievement bonus XP to prevent circular triggers.

> **⚠️ Pack authors:** Always use `item_xp >= N` in new packs. The `total_xp >= N` form is misleading because it does NOT check the user-facing `total_xp` value (which includes achievement bonuses). The `total_xp >= N` alias is **deprecated** and **will be removed in a future version**. Existing packs using `total_xp >= N` will continue to work until removal, but should be migrated to `item_xp >= N` when updated.

#### `all_items_done`

ALL items across ALL phases — **including sub-items** — have status `done`, `skipped`, or `unused`. No item is `pending`. Uses `resolved_items` from §2.0 so sub-items are covered. Items with status `unused` are excluded — they don't block this condition.

```
for each item in resolved_items:
  status = quest_log.items[item.id].status
  if status == "unused": continue
  status must be "done" or "skipped"
```

#### `all_required_done`

ALL items marked `required: true` across ALL phases have status `done`. Items with status `unused` are excluded — they don't exist in this project.

```
for each phase in pack.phases:
  for each item in phase.items where item.required == true:
    status = quest_log.items[item.id].status
    if status == "unused": continue
    status must be "done"
```

#### `zero_required_skipped`

No required item was skipped. All items marked `required: true` across all phases have a status that is NOT `skipped`. Items with status `unused` are excluded — they don't violate this condition.

```
for each phase in pack.phases:
  for each item in phase.items where item.required == true:
    status = quest_log.items[item.id].status
    if status == "unused": continue
    status must NOT be "skipped"
```

Note: items still `pending` do NOT violate this condition — only `skipped` does.

#### `auto_detected >= N` / `scan_found >= N`

During scan, count how many items were auto-detected as done (via `scan_rule`). If count >= N, condition is met. `scan_found >= N` is an alias for `auto_detected >= N` — both behave identically.

The engine must track scan detections during the scan step and pass that count to the XP system. This is an integer comparison:

```
scan_detected_count >= N
```

Parse N from the condition string (e.g., `"auto_detected >= 5"` or `"scan_found >= 5"` → N = 5).

---

## 8. Celebration Templates

> **Note:** Celebration templates are defined in `guide.md` section 4. This module provides calculation data only — rendering is guide.md's responsibility. If there is any conflict, guide.md takes precedence.

When stats change, return the calculated data (stats, newly_unlocked, level changes) to the guide module for rendering. The guide module owns the visual output — see `guide.md` section 4 for all celebration templates (Mission Complete, World Complete, Level Up, Achievement Unlock, Final Victory, MVP Launch Guide).

---

## 9. Execution Order

When the engine calls the XP system (after any status change), execute in this exact order:

1. Calculate `total_base_xp` from completed items only (section 2)
2. Calculate `streak` (section 4)
3. Calculate counters: `items_done`, `items_total`, `items_skipped`, `percent` (section 5)
4. Evaluate achievements using item status + `streak` + `total_base_xp` + scan context, then add newly unlocked to `quest_log.achievements[]` (section 7)
5. Calculate final `total_xp` including all unlocked achievement bonuses (section 2.1)
6. Determine `level` and `level_name` from final `total_xp` (section 3)
7. Assemble stats object (section 6)
8. Write updated stats and achievements to quest-log
9. Return `{ stats, newly_unlocked, level_changed, old_level, new_level }` to the calling module. The caller passes this data to guide.md §4, which determines and renders appropriate celebrations (including World Complete and Final Victory, which require per-phase resolved_items checks that xp-system does not perform). This is the ONLY return point — xp-system never returns `celebrations` (that is guide.md's responsibility)

---

## 10. Edge Cases

- **Empty quest-log (no items resolved):** total_xp = 0, level = 1, streak = 0, percent = 0
- **All items skipped:** total_xp = 0 (skips give no XP), percent = 100
- **Achievement already unlocked:** do NOT re-add or re-celebrate
- **Pack has no achievements:** skip achievement evaluation, return empty list
- **Pack has no levels:** default to level 1, level_name = pack.name
- **Item exists in pack but not in quest-log:** treat as `pending`
- **Item with status `unused`:** excluded from `items_total`, `percent`, XP calculations. Treated as if it doesn't exist. Does NOT break streaks (ignored in streak calculation).
