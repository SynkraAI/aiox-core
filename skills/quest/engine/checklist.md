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
| `done` | `{ status: done, completed_at: <ISO 8601 UTC> }` |
| `skipped` | `{ status: skipped, note: <string> }` |
| `detected` | `{ status: detected, detected_at: <ISO 8601 UTC> }` |

**Note on `detected`:** Used by scan for items in LOCKED phases. When an item is auto-detected in a phase that hasn't been unlocked yet (via Integration Gate), it's marked `detected` instead of `done`. When the phase is finally unlocked (Integration Gate passes), all `detected` items in that phase are automatically promoted to `done`. This prevents scan from bypassing the Integration Gate.

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
   - `created`: current datetime (ISO 8601 UTC)
   - `last_updated`: same as `created`
3. Build the `items` map: iterate ALL phases in the pack, for each item add an entry keyed by `item.id` with `{ status: pending }`.
4. Initialize `achievements` as an empty list `[]`.
5. Initialize `integration_results` as an empty map `{}`.
6. Calculate `stats` by calling the xp-system (see `engine/xp-system.md`). Pass the pack and the quest-log items. On a fresh quest-log all items are pending, so: `total_xp: 0`, `level: 1`, `level_name: <level 1 name from pack>`, `streak: 0`, `items_done: 0`, `items_total: <count of all items>`, `items_skipped: 0`, `percent: 0`.
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
     - If user chooses `scanner`: update `meta.pack` and `meta.pack_version` to the scanner's pack, then rebuild items (add new items as pending, keep existing items with their status).
3. **Pack version check:** If `meta.pack_version != pack.version`, run Pack Version Migration (§3.5) before proceeding. This is part of the Read flow — not a separate step the orchestrator must remember to call.
4. **Always recalculate stats** via xp-system. Never trust saved `stats` values. Pass the current pack and the quest-log items to xp-system, write the returned stats to `quest_log.stats`.
5. Update `meta.last_updated` to current datetime.

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

### check {id}

**Trigger:** User runs `/quest check {id}` or confirms completion interactively.

**Steps:**

1. Validate that `{id}` exists in the pack's items. If not found, show: `"Item '{id}' não existe neste pack."` and abort.
2. **Phase lock guard:** Determine which phase the item belongs to. Use `is_phase_unlocked(phase_index, pack, quest_log)` from `guide.md` §2 to check if the phase is accessible. This function checks BOTH required items in the previous phase AND the Integration Gate (`verify_phase_integration`). If the phase is LOCKED (function returns `false`), BLOCK the check and show:
   ```
   ⛔ World {N} ({phase.name}) está trancado.
   Complete as missões obrigatórias do World {current_world} primeiro.
   Próxima missão: /quest check {next_pending.id}
   ```
   Do NOT modify the quest-log. Abort here.
   **Exception:** Items marked by `/quest scan` bypass this guard (scan uses its own flow in section 5).
3. Set `items[{id}].status` to `done`.
4. Set `items[{id}].completed_at` to current datetime (ISO 8601 UTC).
5. Update `meta.last_updated`.
6. Recalculate stats via xp-system (see `engine/xp-system.md`, section 9 — Execution Order).
7. Detect newly unlocked achievements (returned by xp-system).
8. Show celebration messages (from xp-system celebration templates).
9. Save quest-log.

### skip {id}

**Trigger:** User runs `/quest skip {id}` or says item does not apply.

**Steps:**

1. Validate that `{id}` exists in the pack's items. If not found, show: `"Item '{id}' não existe neste pack."` and abort.
2. **Phase lock guard:** Same rule as `check` — use `is_phase_unlocked(phase_index, pack, quest_log)` from `guide.md` §2 (checks both required items AND Integration Gate). If LOCKED, BLOCK and show the same message. Abort.
3. Ask for a reason: `"Motivo do skip (opcional):"`. If user provides text, use it. If empty, use `"Skipped by user"`.
4. Set `items[{id}].status` to `skipped`.
5. Set `items[{id}].note` to the reason.
6. Update `meta.last_updated`.
7. Recalculate stats via xp-system.
8. Detect newly unlocked achievements.
9. Save quest-log.

---

## 5. Scan (Auto-detect)

**Trigger:** User runs `/quest scan` or during first-time quest-log creation.

**Inputs:** Pack YAML (with items that have `scan_rule`), quest-log items.

**Steps:**

1. Collect ALL pack items that have a `scan_rule` field — from ALL phases, including LOCKED ones. Scan detects pre-existing work regardless of phase progression. The phase lock guard (section 4) applies only to manual `check` and `skip` commands.
2. Determine which phases are currently UNLOCKED (using `is_phase_unlocked` from guide.md §2).
3. For each item with `scan_rule`:
   - If `quest_log.items[item.id].status` is NOT `pending`, skip (already resolved).
   - Evaluate the `scan_rule` using scanner functions (see table below).
   - If the rule evaluates to `true`:
     - If item's phase is UNLOCKED → mark as `done` (add to discoveries list)
     - If item's phase is LOCKED → mark as `detected` (add to detections list)
   - **Why `detected` instead of `done` for locked phases:** The Integration Gate (guide.md §2.5) must verify that prior phases work together before unlocking the next. Marking items as `done` in locked phases would bypass this critical check. `detected` items are automatically promoted to `done` when the phase is unlocked.
3. If discoveries list AND detections list are both empty, show: `"Scan completo. Nenhuma nova descoberta."` and stop.
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

5. Wait for user confirmation.
   - If `s` (yes):
     - For each **discovered** item (unlocked phases): set `status: done` and `completed_at: <now>`.
     - For each **detected** item (locked phases): set `status: detected` and `detected_at: <now>`.
     - Recalculate stats via xp-system. Detect achievements. Save quest-log.
   - If `n` (no): abort without changes.

### Scanner Functions

These functions evaluate `scan_rule` expressions. They run against the project's cwd.

| Function | Evaluation |
|----------|------------|
| `has_file('path')` | Check if file exists at the given path relative to cwd |
| `has_dir('path')` | Check if directory exists at the given path relative to cwd |
| `has_file_matching('glob')` | Check if any file matches the glob pattern relative to cwd |
| `has_remote('name')` | Run `git remote` and check if the named remote exists |
| `has_content('file', 'regex')` | Read the file and check if content matches the regex |
| `file_count('glob') > N` | Count files matching glob, compare with N |

Compound expressions use `AND` / `OR`:
- `has_file('README.md') AND has_file('package.json')` — both must be true
- `has_file('.eslintrc') OR has_file('.eslintrc.js')` — at least one must be true

Parse the expression, evaluate each function call, apply boolean logic.

---

## 6. Conditions

Items with a `condition` field require special handling.

**Steps:**

1. If the item also has a `scan_rule`, evaluate the scan_rule first.
   - If `scan_rule` is `true` → treat as auto-detected (mark as `done` in scan flow).
   - If `scan_rule` is `false` → proceed to step 2.
2. Ask the user: `"Este item se aplica? {condition} (s/n/pular)"`
   - `s` (yes): item stays `pending` — it applies but is not yet done. The user must complete it normally.
   - `n` (no): mark as `skipped` with `note: "Não se aplica: {condition}"`.
   - `pular` (skip for now): leave as `pending`, do not ask again in this session.
3. Conditions are evaluated during scan and during first-time quest-log creation.

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
| — | `meta.pack` = `"app-development"` |
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
6. Write `.aios/quest-log.yaml`.
7. Rename `.aios/pipeline-checklist.yaml` to `.aios/pipeline-checklist.yaml.bak`.
8. Show message: `"Quest log migrado com sucesso! Formato antigo salvo em pipeline-checklist.yaml.bak"`

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
- **Phase unlock with `detected` items:** When a phase passes the Integration Gate and is unlocked, promote all `detected` items in that phase to `done` (set `completed_at` to current datetime). Recalculate stats after promotion.
- **Re-check already done item:** no-op. Show: `"Item '{id}' já está completo."`.
- **Re-skip already skipped item:** no-op. Show: `"Item '{id}' já foi pulado."`.
