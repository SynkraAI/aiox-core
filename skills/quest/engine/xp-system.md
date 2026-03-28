# XP System Module

Module for the Quest Engine. Calculates XP, levels, streaks, achievements, and stats from pack + quest-log data.

---

## 1. Inputs

You receive two data sources:

- **Pack YAML** — contains `levels`, `phases[].items[]` (with `xp`, `required`), and `achievements[]`
- **Quest-log YAML** — contains `items` map with `{ status, completed_at? }`

---

## 2. Calculate `base_item_xp`

First calculate the XP earned from completed items only. This value is used by achievement conditions that explicitly say "before achievement bonuses".

```
base_item_xp = 0

for each item in pack.phases[*].items:
  if quest_log.items[item.id].status == "done":
    base_item_xp += item.xp
```

Items with status `pending` or `skipped` contribute 0 XP.

### 2.1 Calculate final `total_xp`

After achievement evaluation is complete, calculate the final `total_xp` by adding the bonuses from ALL unlocked achievements to `base_item_xp`.

```
total_xp = base_item_xp

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

Streak counts consecutive items completed without a skip, reading items in order from the most recent backward.

Rules:
1. Flatten all items from all phases in pack order (phase 0 items first, then phase 1, etc.)
2. Filter to items that have status `done` or `skipped` (ignore `pending`)
3. Walk backward from the last completed/skipped item
4. Count consecutive `done` items until you hit a `skipped` item or run out of items
5. That count is the streak

```
resolved_items = [items with status done or skipped, in pack order]
streak = 0
for item in reversed(resolved_items):
  if item.status == "done":
    streak += 1
  else:  # skipped
    break
```

If the last resolved item is `skipped`, streak = 0.

---

## 5. Calculate Counters

```
items_total   = count of ALL items across all phases in the pack
items_done    = count of items with status "done" in quest-log
items_skipped = count of items with status "skipped" in quest-log
percent       = round((items_done + items_skipped) / items_total * 100)
```

Note: `percent` reflects overall progress (done + skipped), not just done.

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
  percent: <calculated>
```

---

## 7. Achievement Evaluation

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

All items marked `required: true` in phase N of the pack have status `done` in the quest-log.

```
for item in pack.phases[N].items where item.required == true:
  quest_log.items[item.id].status must be "done"
```

#### `all_items_done_in_phase:<N>`

ALL items in phase N (required and optional) have status `done` or `skipped`. No item is `pending`.

```
for item in pack.phases[N].items:
  quest_log.items[item.id].status must be "done" or "skipped"
```

#### `phase_done_same_day:<N>`

All required items in phase N have status `done` AND all their `completed_at` dates fall on the same calendar day (YYYY-MM-DD).

```
dates = []
for item in pack.phases[N].items where item.required == true:
  if quest_log.items[item.id].status != "done": FAIL
  dates.append(quest_log.items[item.id].completed_at.date())
all dates must be the same day
```

#### `consecutive_completions >= N`

The current streak (consecutive `done` items without a skip, calculated in section 4) meets or exceeds N.

```
streak >= N
```

Parse N from the condition string (e.g., `"consecutive_completions >= 5"` → N = 5).

#### `total_xp >= N`

The player's XP from completed items, before achievement bonuses (`base_item_xp` from section 2), meets or exceeds N.

**Note:** Despite the condition name `total_xp`, this evaluates `base_item_xp` (items only, no achievement bonuses). This prevents circular dependencies where an achievement's own XP bonus could trigger another achievement. Pack authors should be aware that the threshold refers to item XP earned, not the final displayed total.

```
base_item_xp >= N
```

Parse N from the condition string (e.g., `"total_xp >= 500"` → N = 500).

#### `all_items_done`

ALL items across ALL phases have status `done` or `skipped`. No item is `pending` in any phase.

```
for each phase in pack.phases:
  for each item in phase.items:
    quest_log.items[item.id].status must be "done" or "skipped"
```

#### `all_required_done`

ALL items marked `required: true` across ALL phases have status `done`.

```
for each phase in pack.phases:
  for each item in phase.items where item.required == true:
    quest_log.items[item.id].status must be "done"
```

#### `zero_required_skipped`

No required item was skipped. All items marked `required: true` across all phases have a status that is NOT `skipped`.

```
for each phase in pack.phases:
  for each item in phase.items where item.required == true:
    quest_log.items[item.id].status must NOT be "skipped"
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

When stats change, the engine checks if a celebration is warranted. Generate the celebration message using these templates.

### Mission Complete

Triggered when an item is marked `done`. Size depends on the item's XP value.

**Small (xp < 20):**
```
✅ +{xp} XP — {item.label}
```

**Medium (20 <= xp < 30):**
```
⭐ +{xp} XP — {item.label}
   Streak: {streak} 🔥
```

**Big (xp >= 30):**
```
🏆 +{xp} XP — {item.label}
   Streak: {streak} 🔥
   Total: {total_xp} XP | {level_name} (Lv.{level})
```

### World Complete

Triggered when `all_items_done_in_phase:<N>` becomes true for any phase.

```
═══════════════════════════════════════
  🌍 WORLD {N} COMPLETE — "{phase.name}"
  {items_done_in_phase}/{items_total_in_phase} missions
═══════════════════════════════════════
```

### Level Up

Triggered when the calculated `level` is higher than the previously stored `level`.

```
═══════════════════════════════════════
  ⬆️  LEVEL UP!  Lv.{old_level} → Lv.{new_level}
  「{new_level_name}」
  {levels[new_level].message}
═══════════════════════════════════════
```

### Achievement Unlock

Triggered for each newly unlocked achievement.

```
═══════════════════════════════════════
  🏅 ACHIEVEMENT UNLOCKED
  {achievement.icon} {achievement.name}
  {achievement.message}
  +{xp_bonus} XP bonus
═══════════════════════════════════════
```

If `xp_bonus` is 0 or absent, omit the bonus line.

---

## 9. Execution Order

When the engine calls the XP system (after any status change), execute in this exact order:

1. Calculate `base_item_xp` from completed items only (section 2)
2. Calculate `streak` (section 4)
3. Calculate counters: `items_done`, `items_total`, `items_skipped`, `percent` (section 5)
4. Evaluate achievements using item status + `streak` + `base_item_xp` + scan context, then add newly unlocked to `quest_log.achievements[]` (section 7)
5. Calculate final `total_xp` including all unlocked achievement bonuses (section 2.1)
6. Determine `level` and `level_name` from final `total_xp` (section 3)
7. Assemble stats object (section 6)
8. Compare with previous stats to determine celebrations (section 8)
9. Write updated stats and achievements to quest-log
10. Return `{ stats, newly_unlocked, celebrations }`

---

## 10. Edge Cases

- **Empty quest-log (no items resolved):** total_xp = 0, level = 1, streak = 0, percent = 0
- **All items skipped:** total_xp = 0 (skips give no XP), percent = 100
- **Achievement already unlocked:** do NOT re-add or re-celebrate
- **Pack has no achievements:** skip achievement evaluation, return empty list
- **Pack has no levels:** default to level 1, level_name = pack.name
- **Item exists in pack but not in quest-log:** treat as `pending`
