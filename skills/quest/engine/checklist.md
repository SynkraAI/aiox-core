# Checklist Module

Module for the Quest Engine. Manages the quest-log.yaml lifecycle: create, read, check, skip, scan, conditions, and migration.

---

## 1. Quest-log.yaml Template

This is the exact structure to generate. All fields are mandatory unless marked optional.

```yaml
meta:
  project: string            # project directory name
  project_path: string       # absolute path to project root
  pack: string               # pack id (e.g. "app-development")
  pack_version: string       # semver from pack.version
  hero_name: string          # how the user wants to be called (e.g. "Luiz")
  hero_title: string         # optional epic title (e.g. "O Forjador")
  created: datetime          # ISO 8601 UTC — when quest-log was first created
  last_updated: datetime     # ISO 8601 UTC — updated on every write

stats:
  total_xp: number
  level: number
  level_name: string
  streak: number
  items_done: number
  items_total: number
  items_skipped: number
  items_unused: 0
  percent: number

achievements: []             # list of { id: string, unlocked_at: datetime }

integration_results: {}      # optional — keyed by phase index
  # "1":
  #   passed: true|false
  #   checked_at: datetime (ISO 8601 UTC)
  #   checks:
  #     - name: string
  #       passed: true|false
  #       output: string (optional — error output if failed)

items:
  "0.1": { status: pending }
  "0.2": { status: pending }
  # ... one entry per pack item, keyed by item id
```

### Item status values

| Status | Fields |
|--------|--------|
| `pending` | `{ status: pending }` |
| `done` | `{ status: done, completed_at: <ISO 8601 UTC>, checked_by: <"user"\|"forge"\|"scan"> }` |
| `skipped` | `{ status: skipped, note: <string> }` |
| `detected` | `{ status: detected, detected_at: <ISO 8601 UTC> }` |
| `unused` | `{ status: unused }` |

**Note on `detected`:** Used by scan for items in LOCKED phases. When an item is auto-detected in a phase that hasn't been unlocked yet (via Integration Gate), it's marked `detected` instead of `done`. When the phase is finally unlocked (Integration Gate passes), all `detected` items in that phase are automatically promoted to `done`. This prevents scan from bypassing the Integration Gate.

**Note on `unused`:** For items that do not apply to this project at all. Different from `skipped` (which is a conscious decision to bypass an applicable item). `unused` means the item has no meaning in this project's context — like a "database review" item in a project with no database. Unused items:
- Do NOT count toward `items_total` (excluded from progress calculation)
- Do NOT count toward `percent`
- Do NOT block phase unlock (treated as if they don't exist)
- Do NOT award XP
- Are shown with a distinct visual indicator on the dashboard (not ✓ or -)
- Can be set during first scan (when condition evaluates to "not applicable") or manually via `/quest unused {id}`

---

## 2. Create Quest-log

**Trigger:** No `.aios/quest-log.yaml` exists in the project root.

**Inputs:** Pack YAML (loaded by SKILL.md), project context (cwd).

**Steps:**

1. Create `.aios/` directory if it does not exist.
2. Build the `meta` block:
   - `project`: basename of cwd
   - `project_path`: absolute path of cwd
   - `pack`: value of `pack.id` from the pack YAML
   - `pack_version`: value of `pack.version` from the pack YAML
   - `hero_name`: value collected by ceremony (REQUIRED — do not create quest-log without it)
   - `hero_title`: value collected by ceremony (empty string `""` if user opted out)
   - `created`: current datetime (ISO 8601 UTC)
   - `last_updated`: same as `created`
3. Build the `items` map: iterate ALL phases in the pack, for each item add an entry keyed by `item.id` with `{ status: pending }`. Then evaluate conditions: for each item with a `condition` field, invoke the condition evaluation rules from §6. Condition decisions (`unused`) are staged — apply them to the items map before calculating stats. This ensures that items which don't apply to this project are excluded from `items_total` from the start.
4. Initialize `achievements` as an empty list `[]`.
5. Initialize `integration_results` as an empty map `{}`.
6. Calculate `stats` by calling the xp-system (see `engine/xp-system.md`). Pass the pack and the quest-log items (with any `unused` conditions already applied from step 3). On a fresh quest-log with no conditions: `total_xp: 0`, `level: 1`, `level_name: <level 1 name from pack>`, `streak: 0`, `items_done: 0`, `items_total: <count of all items minus unused>`, `items_skipped: 0`, `percent: 0`.
7. Write the YAML file to `.aios/quest-log.yaml`.

---

## 3. Read Quest-log

**Trigger:** `.aios/quest-log.yaml` exists.

**Steps:**

0. **YAML Parse Guard:** Attempt to read and parse `.aios/quest-log.yaml`. If YAML parsing fails (syntax error, corrupt file):
   - Show error: "Quest log corrompido — o arquivo YAML não pôde ser lido."
   - Check if `.aios/quest-log.yaml.bak` exists:
     - **If backup exists:** ask "Encontrei um backup. Restaurar? (s/n)"
       - If "s": copy `.bak` over `.yaml`, retry parse
       - If "n": proceed to recreate
     - **If no backup:** ask "Quer criar um novo quest log? O progresso anterior será perdido. (s/n)"
       - If "s": delete corrupt file, trigger Create Quest-log (section 2)
       - If "n": stop with message "Corrija o arquivo manualmente ou delete `.aios/quest-log.yaml` para recomeçar."
1. Read and parse `.aios/quest-log.yaml`.
2. Validate `meta.pack` matches the pack selected by the scanner.
   - **Match:** proceed normally.
   - **Mismatch:** ask the user: `"Quest log usa pack '{meta.pack}', mas scanner detectou '{scanner_pack}'. Qual usar? (log/scanner)"`.
     - If user chooses `log`: use the pack from `meta.pack`.
     - If user chooses `scanner`: update `meta.pack` and `meta.pack_version` to the scanner's pack, **clear `integration_results` to `{}`** (prior pack's gate results are invalid for the new pack's phase structure), then rebuild items (add new items as pending, keep existing items with their status).
3. **Pack version check:** If `meta.pack_version != pack.version`, run Pack Version Migration (§3.5) before proceeding. This is part of the Read flow — not a separate step the orchestrator must remember to call.
4. **Promote detected items (BEFORE stats):** For each phase that is currently UNLOCKED, find all items with `status: detected` in the quest-log. Promote each to `done` (set `status: done`, `completed_at: <now>`, `checked_by: "scan"`, remove `detected_at`). This ensures scan pre-detections are persisted as completed once the phase is legitimately unlocked via the Integration Gate. Promotions happen here — inside the Read flow — so they are saved to disk before any ceremony or guide rendering.
   **IMPORTANT — Read-safe unlock check:** Do NOT call `is_phase_unlocked` from guide.md §2 here. That function includes the interactive Integration Gate (`verify_phase_integration`), which can prompt the user or run shell commands — unacceptable during a read/rehydration flow. Instead, use the pure predicate `is_phase_unlocked_persisted`:
   ```
   function is_phase_unlocked_persisted(phase_index, pack, quest_log):
     if phase_index == 0: return true
     previous_phase = pack.phases[phase_index - 1]
     for item in previous_phase.items:
       if item.required == true:
         item_status = quest_log.items[item.id].status
         if item_status != "done" AND item_status != "unused":
           return false
     // Check persisted integration result instead of running the gate
     prev_result = quest_log.integration_results[str(phase_index)]
     if prev_result is undefined OR prev_result.passed != true:
       return false
     return true
   ```
   This predicate checks required-item status AND the persisted `integration_results` entry — no side effects, no user interaction. The full interactive `is_phase_unlocked` (with `verify_phase_integration`) is used only in the progression flow (§4 check/skip/unused). Scan (§5) uses this pure predicate to classify phases without side effects.
5. **Always recalculate stats** via xp-system. Never trust saved `stats` values. Pass the current pack and the quest-log items to xp-system, write the returned stats to `quest_log.stats`. This runs AFTER promotion (step 4) so promoted items are counted.
6. **Save if changed:** If ANY of the above steps modified the quest-log (promotion in step 4, migration in step 3, pack switch in step 2, or stats differ from saved values), save the quest-log to disk via Save Rules (§8) BEFORE returning. This guarantees that ceremony.md and guide.md always render from persisted state, not volatile in-memory mutations. Note: `meta.last_updated` is set by Save Rules (§8) during the write — do NOT update it here in the read flow, as that would turn every read into a write.

---

## 3.5 Pack Version Migration

**Trigger:** `meta.pack_version` in quest-log does NOT match `pack.version` in the pack YAML. This means the pack was updated since the quest was started.

**Steps:**

1. Compare `meta.pack_version` with `pack.version`.
   - If they match → skip this section entirely.
   - If they differ → proceed.

2. Diff items between pack and quest-log:
   ```
   new_items = []      // in pack but not in quest-log
   orphaned_items = [] // in quest-log but not in pack

   for each item in pack.phases[*].items:
     if item.id NOT in quest_log.items:
       new_items.append(item)

   for each id in quest_log.items:
     // Skip valid sub-items — they live only in quest-log by design (§7.5)
     if quest_log.items[id].sub_of is defined:
       continue
     if id has 3+ dot-separated parts AND parent_id(id) exists in pack:
       continue
     if id NOT found in any pack phase:
       orphaned_items.append({ id, status: quest_log.items[id].status })
   ```

3. Show the migration summary:
   ```
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     ⚙️  PACK ATUALIZADO — {pack.name}
     {meta.pack_version} → {pack.version}
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

     Novas missões (+{new_count}):
     {for each new_item: "  + {id} — {label}  (+{xp} XP)"}

     Missões removidas ({orphan_count}):
     {for each orphan: "  - {id} ({status})"}

     Atualizar quest log? (s/n)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ```

   - If `new_items` is empty, omit the "Novas missões" block.
   - If `orphaned_items` is empty, omit the "Missões removidas" block.

4. Wait for user confirmation:
   - If `s` (yes):
     - Add each `new_item` to `quest_log.items` as `{ status: pending }`
     - Do NOT delete orphaned items — keep them with their current status (they may have historical value: completed items from an older pack version)
     - Update `meta.pack_version` to `pack.version`
     - Recalculate stats via xp-system
     - Save quest-log
   - If `n` (no):
     - Proceed with current quest-log as-is (no changes)
     - Show: "Quest log mantido na versão {meta.pack_version}. Novas missões não aparecerão até atualizar."

**Edge cases:**
- If the only change is removed items (no new items), still show the summary — the user should know items were removed from the pack.
- If pack version is a non-semver string, compare as plain strings (any difference triggers migration).
- Orphaned items are **ignored during stats calculation** (consistent with Edge Cases §9: "item in quest-log but not in pack: ignore it during stats calculation"). They are kept in the quest-log for historical record but contribute zero to XP, counters, or progress percentage.

---

## 4. Check / Skip

### check {id} [source=user|forge|scan]

**Trigger:** User runs `/quest check {id}`, confirms completion interactively, or Forge/scan auto-checks after successful execution.

**Source parameter (optional):**
- `source=user` — manual check by user (default when omitted)
- `source=forge` — auto-checked by Forge after successful pipeline execution
- `source=scan` — detected by scan

**Steps:**

1. Resolve `{id}` in this order:
   - If it exists in the pack's items, use it directly.
   - Else if it exists in `quest_log.items` and is a valid sub-item (has `sub_of` field or 3+ dot-separated parts), resolve its parent via `sub_of` or the first two ID segments. Use the parent's phase/lock context for subsequent checks.
   - Else show: `"Item '{id}' não existe neste pack ou quest-log."` and abort.
2. **Phase lock guard:** Determine which phase the item (or its resolved parent) belongs to. Use `is_phase_unlocked(phase_index, pack, quest_log)` from `guide.md` §2 to check if the phase is accessible. This function checks BOTH required items in the previous phase AND the Integration Gate (`verify_phase_integration`). If the phase is LOCKED (function returns `false`), BLOCK the check and show:
   ```
   ⛔ World {N} ({phase.name}) está trancado.
   Complete as missões obrigatórias do World {current_world} primeiro.
   Próxima missão: /quest check {next_pending.id}
   ```
   Do NOT modify the quest-log. Abort here.
   **Exception:** Items marked by `/quest scan` bypass this guard (scan uses its own flow in section 5).
3. Set `items[{id}].status` to `done`.
4. Set `items[{id}].completed_at` to current datetime (ISO 8601 UTC).
5. Set `items[{id}].checked_by` to the `source` value (`"user"`, `"forge"`, or `"scan"`). If source is omitted, default to `"user"`. This field is optional and backward-compatible — absence means `"user"`.
6. Update `meta.last_updated`.
7. Recalculate stats via xp-system (see `engine/xp-system.md`, section 9 — Execution Order).
8. Detect newly unlocked achievements (returned by xp-system).
9. Return celebration data (achievements, level changes, stats) to guide.md §4 for rendering.
10. Save quest-log.

### skip {id}

**Trigger:** User runs `/quest skip {id}` to consciously bypass an applicable item. For items that don't apply to the project, use `unused {id}` instead.

**Steps:**

1. Resolve `{id}` using the same resolution order as `check` (step 1): pack items first, then quest-log sub-items, else abort with `"Item '{id}' não existe neste pack ou quest-log."`.
2. **Phase lock guard:** Same rule as `check` — use `is_phase_unlocked(phase_index, pack, quest_log)` from `guide.md` §2 (checks both required items AND Integration Gate) against the resolved item's phase (or parent's phase for sub-items). If LOCKED, BLOCK and show the same message. Abort.
3. Ask for a reason: `"Motivo do skip (opcional):"`. If user provides text, use it. If empty, use `"Skipped by user"`.
4. Set `items[{id}].status` to `skipped`.
5. Set `items[{id}].note` to the reason.
6. Update `meta.last_updated`.
7. Recalculate stats via xp-system.
8. Detect newly unlocked achievements.
9. Save quest-log.

### unused {id}

**Trigger:** User runs `/quest unused {id}` or engine determines item does not exist in this project.

**Steps:**

1. Resolve `{id}` using the same resolution order as `check` (step 1): pack items first, then quest-log sub-items, else abort with `"Item '{id}' não existe neste pack ou quest-log."`.
2. **Phase lock guard:** Same rule as `check` and `skip` — use `is_phase_unlocked(phase_index, pack, quest_log)` from `guide.md` §2 (checks both required items AND Integration Gate) against the resolved item's phase (or parent's phase for sub-items). If LOCKED, BLOCK and show the same message. Abort. **Why:** Marking a future-phase item as `unused` would bypass progression since `unused` items are excluded from unlock calculations.
3. If `items[{id}].status` is `done`, show: `"Item '{id}' já está completo — não pode ser marcado como unused."` and abort.
4. Set `items[{id}].status` to `unused`.
5. Update `meta.last_updated`.
6. Recalculate stats via xp-system.
7. Save quest-log.

**Note:** Unlike `skip`, `unused` does not ask for a reason — the item simply does not exist in this project's context. Unlike `skipped` items, `unused` items are excluded from `items_total` and `percent` calculations entirely.

---

## 5. Scan (Auto-detect)

**Trigger:** User runs `/quest scan` or during first-time quest-log creation.

**Inputs:** Pack YAML (with items that have `scan_rule`), quest-log items.

**Steps:**

1. Collect ALL pack items that have a `scan_rule` field OR a `condition` field — from ALL phases, including LOCKED ones. Scan detects pre-existing work regardless of phase progression. The phase lock guard (section 4) applies only to manual `check`, `skip`, and `unused` commands. Items with BOTH `scan_rule` and `condition` are included once (scan_rule takes priority per §6 step 1).
2. Determine which phases are currently UNLOCKED (using `is_phase_unlocked_persisted` from §3 — the pure predicate with no side effects). Do NOT use `is_phase_unlocked` from guide.md §2 here: that function calls `verify_phase_integration()`, which persists integration results and may prompt the user. Scan is observational until the user confirms at step 5.
3. For each collected item (scan_rule and/or condition):
   - If `quest_log.items[item.id].status` is NOT `pending`, skip (already resolved).
   - **If item has `scan_rule`:** evaluate the scan_rule using scanner functions (see table below).
     - If the rule evaluates to `true`:
       - If item's phase is UNLOCKED → add to discoveries list (staged as `done`)
       - If item's phase is LOCKED → add to detections list (staged as `detected`)
     - If the rule evaluates to `false` AND item also has `condition` → fall through to condition evaluation below.
     - If the rule evaluates to `false` and no `condition` → skip item.
   - **If item has `condition` (and no scan_rule, or scan_rule was false):** evaluate per §6:
     - Ask the user: `"Este item se aplica? {condition} (s/n/pular)"`
     - `s` → leave as pending (applicable, not yet done). Do NOT add to any staged list.
     - `n` → add to unused_decisions list (staged as `unused`). Do NOT mutate quest-log yet.
     - `pular` → skip for this session.
   - **Why `detected` instead of `done` for locked phases:** The Integration Gate (guide.md §2.5) must verify that prior phases work together before unlocking the next. Marking items as `done` in locked phases would bypass this critical check. `detected` items are automatically promoted to `done` when the phase is unlocked.
3. If discoveries list AND detections list AND unused_decisions list are ALL empty, show: `"Scan completo. Nenhuma nova descoberta."` and stop.
4. Show discoveries (unlocked phases) and detections (locked phases) separately:

```
Scan detectou {discovery_count} itens prontos:

  +{xp} XP  {id} — {label}
  ...

  Total: +{sum_xp} XP

Confirmar? (s/n)
```

If detections list is non-empty, also show (after discoveries):

```
Pré-detectados em fases trancadas ({detection_count} itens):

  🔒 {id} — {label}  (World {N}: {phase.name})
  ...

  Estes itens serão promovidos automaticamente quando o world for desbloqueado.
```

If unused_decisions list is non-empty, also show:

```
Não se aplicam a este projeto ({unused_count} itens):

  [·] {id} — {label}  (condição: {condition})
  ...

  Serão excluídos do progresso.
```

5. Wait for user confirmation.
   - If `s` (yes):
     - For each **discovered** item (unlocked phases): set `status: done`, `completed_at: <now>`, and `checked_by: "scan"`.
     - For each **detected** item (locked phases): set `status: detected` and `detected_at: <now>`.
     - For each **unused_decision** item: set `status: unused`. These are condition items the user said "n" to — they do not apply to this project.
     - Recalculate stats via xp-system, passing `scan_detected_count: discovery_count` as scan context (only unlocked-phase items marked `done` — NOT locked-phase `detected` items, which haven't become completed work yet). This enables achievements with conditions like `scan_found >= N` (see xp-system.md §7, `auto_detected >= N` / `scan_found >= N` conditions). Detect achievements. Save quest-log.
   - If `n` (no): abort without changes (discoveries, detections, AND unused decisions are all discarded).

### Scanner Functions

Scan rules are evaluated using the scanner function catalog defined in `scanner.md` §4.1. That module is the **authoritative source** for the full function list, signatures, and behavior. Do NOT maintain a separate function table here — refer to scanner.md to avoid drift between the spec and shipped packs.

Compound expressions use `AND` / `OR`:
- `has_file('README.md') AND has_file('package.json')` — both must be true
- `has_file('.eslintrc') OR has_file('.eslintrc.js')` — at least one must be true

Parse the expression, evaluate each function call, apply boolean logic.

---

## 6. Conditions

Items with a `condition` field require special handling. Condition evaluation is **always invoked through** the scan flow (§5) or the Create Quest-log flow (§2) — never as a standalone path.

**Evaluation rules (invoked by §5 step 3 and §2 step 3):**

1. If the item also has a `scan_rule`, evaluate the scan_rule first.
   - If `scan_rule` is `true` → treat as auto-detected (mark as `done`/`detected` in scan flow).
   - If `scan_rule` is `false` → proceed to step 2.
2. Ask the user: `"Este item se aplica? {condition} (s/n/pular)"`
   - `s` (yes): item stays `pending` — it applies but is not yet done. The user must complete it normally.
   - `n` (no): add to the scan's `unused_decisions` staging list. The actual mutation to `unused` happens ONLY when the user confirms the scan summary (§5 step 5, "s"). Do NOT mutate quest-log state here — this keeps condition decisions in the same transactional save path as scan discoveries and detections. The item does not apply to this project, so it will be excluded from `items_total` and `percent` once persisted. Do NOT use `skipped` here — `skipped` is for applicable items the user chose to bypass.
   - `pular` (skip for now): leave as `pending`, do not ask again in this session.
3. Conditions are evaluated during scan and during first-time quest-log creation. Both contexts observe items from ALL phases (including locked ones), so the phase lock guard from §4 is intentionally bypassed — it applies only to explicit manual commands (`/quest check`, `/quest skip`, `/quest unused`).

---

## 7. Migration: pipeline-checklist.yaml to quest-log.yaml

**Trigger:** `.aios/pipeline-checklist.yaml` exists AND `.aios/quest-log.yaml` does NOT exist.

**Steps:**

1. Read and parse `.aios/pipeline-checklist.yaml`.
2. Map fields to the new format:

| Source (pipeline-checklist) | Target (quest-log) |
|----------------------------|-------------------|
| `project` | `meta.project` |
| — | `meta.project_path` = cwd absolute path |
| — | `meta.pack` = pack.id from the currently loaded pack |
| — | `meta.pack_version` = pack's current version |
| `created` | `meta.created` |
| `last_updated` | `meta.last_updated` |
| `achievements_unlocked[]` | `achievements[].id` (set `unlocked_at` to `meta.last_updated` since original has no timestamp) |
| `phases.{N}.items.{id}.status` | `items.{id}.status` |
| `phases.{N}.items.{id}.completed_at` | `items.{id}.completed_at` |
| `phases.{N}.items.{id}.note` | `items.{id}.note` |

3. Fields that do NOT migrate (they live in the pack now): `label`, `command`, `xp`, `who`, `required`, phase `name`.
4. For any items in the pack that do NOT exist in the old checklist, add them as `{ status: pending }`.
5. Recalculate stats via xp-system (never trust migrated `total_xp`, `level`, `streak` values).
6. **Do NOT write `.aios/quest-log.yaml` yet.** The migrated data is missing `meta.hero_name` and `meta.hero_title`, which are only collected during the ceremony (ceremony.md §A-B). Return the migration payload to SKILL.md so it can merge hero identity from the ceremony before persisting. SKILL.md Step 7 is responsible for the final write (see SKILL.md §Step 7).
7. **Do NOT rename `.aios/pipeline-checklist.yaml` yet.** Keep the source file in place so the migration can be re-run if the user interrupts before SKILL.md Step 7 writes the quest-log. SKILL.md Step 7 is responsible for renaming to `.bak` AFTER the quest-log is successfully persisted (see SKILL.md §Step 7).
8. Show message: `"Dados migrados com sucesso! Aguardando cerimônia para finalizar quest-log."`

---

## 7.5 Sub-items (Dynamic Expansion)

Sub-items allow a single pack item to expand into multiple trackable tasks when a project needs more granularity. Think of them as "child missions" under a parent point on the map.

### Format

Sub-items use a three-part ID: `{parent_id}.{sub_id}`, where `parent_id` is the pack item ID and `sub_id` is a sequential identifier (1, 2, 3...) or a label (M8, M9...).

```yaml
# Quest-log example with sub-items:
items:
  "4.2": { status: done, completed_at: "2026-03-20T..." }
  "4.2.M8": { status: done, completed_at: "2026-03-28T...", sub_of: "4.2", label: "Implementar stories M8" }
  "4.2.M9": { status: pending, sub_of: "4.2", label: "Implementar stories M9" }
  "4.3.M8": { status: done, completed_at: "2026-03-28T...", sub_of: "4.3", label: "Lint + typecheck M8" }
```

### Creating sub-items

**Command:** `/quest sub {parent_id} {label}`

**Steps:**

1. Validate that `{parent_id}` exists in the pack's items.
2. Generate the next sub-item ID:
   - Find all existing items matching `{parent_id}.*` in quest-log
   - Next ID = `{parent_id}.{count + 1}` (e.g., `4.2.1`, `4.2.2`)
   - If user provides a suffix (e.g., `/quest sub 4.2 M8`), use `{parent_id}.{suffix}` instead
3. Add to quest-log: `{ status: pending, sub_of: "{parent_id}", label: "{label}" }`
4. Sub-items inherit `xp`, `who`, `required` from the parent item in the pack (but `required` defaults to `false` for sub-items)
5. XP for sub-items = `round(parent.xp * 0.5)` (half the parent's XP, to avoid inflation)
6. Save quest-log

**Batch creation:** `/quest sub {parent_id} M8 M9 M10` creates multiple sub-items at once.

### How sub-items affect calculations

| Aspect | Behavior |
|--------|----------|
| `items_total` | Sub-items ARE counted (they are real work) |
| `items_done` | Sub-items with `done` status ARE counted |
| `percent` | Sub-items contribute to progress |
| XP | Sub-items award `round(parent.xp * 0.5)` each |
| Phase unlock | Sub-items do NOT block phase unlock (only pack items do) |
| Streak | Sub-items ARE counted in streak |
| Achievements | Sub-items contribute to conditions like `all_items_done` |

### How sub-items appear on dashboard

Sub-items are grouped under their parent point on the map. The parent point shows:
- Its own status (done/pending/skipped)
- A small badge with sub-item count: `3/5` (done/total)
- Expanding the parent reveals the sub-items list

In the CLI status view, sub-items are indented under the parent:
```
[x] 4.2  Implementar story .......................... +50 XP
    [x] 4.2.M8  Implementar stories M8 .............. +25 XP
    [ ] 4.2.M9  Implementar stories M9 .............. +25 XP
```

### Detecting sub-items

An item ID is a sub-item if:
- It has 3+ parts when split by `.` (e.g., `4.2.M8` → `["4", "2", "M8"]`)
- OR it has a `sub_of` field in the quest-log

The parent ID is reconstructed by taking the first two parts: `4.2.M8` → parent `4.2`.

---

## 8. Save Rules

Every time the quest-log is written to disk:

1. **Backup first:** Copy current `.aios/quest-log.yaml` to `.aios/quest-log.yaml.bak` BEFORE writing. This ensures recovery if the write is interrupted or corrupts the file.
2. Update `meta.last_updated` to current datetime.
3. Stats MUST be recalculated via xp-system before saving. Never write stale stats.
4. Write the full YAML structure (meta, stats, achievements, integration_results, items) to `.aios/quest-log.yaml`.
5. Preserve YAML formatting: use 2-space indentation, quote item ids that look like numbers (e.g. `"0.1"`).

---

## 9. Edge Cases

- **Item in quest-log but not in pack:** ignore it during stats calculation. Do not delete it (may be from an older pack version).
- **Item in pack but not in quest-log:** treat as `pending`. Add it to the quest-log on next save.
- **Empty pack (no phases/items):** create quest-log with empty `items: {}` and zero stats.
- **Scan rule references missing file:** rule evaluates to `false` (not an error).
- **Multiple scans:** only affect items that are still `pending`. Already `done`, `skipped`, or `detected` items are never changed by scan.
- **Phase unlock with `detected` items:** When a phase passes the Integration Gate and is unlocked, promote all `detected` items in that phase to `done` (set `completed_at` to current datetime, `checked_by: "scan"`). Recalculate stats after promotion.
- **Re-check already done item:** no-op. Show: `"Item '{id}' já está completo."`.
- **Re-skip already skipped item:** no-op. Show: `"Item '{id}' já foi pulado."`.
