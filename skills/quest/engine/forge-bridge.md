# Forge Bridge Module

Module for the Quest Engine. Bridges missions to the Forge Pipeline Runner for automated execution. This is the "engine room" — it translates what the Quest Master wants done into Forge commands that orchestrate AIOS agents.

**Golden Rule:** Quest decides WHAT to do. Forge decides HOW to do it. This module is the translator between them.

---

## 1. When to Use Forge

Not every mission needs Forge. Some are manual (user installs something), some are skill invocations, some are squad delegations. Forge handles the heavy lifting — anything that requires AIOS agent orchestration.

### Decision Function: `should_use_forge(item)`

```
function should_use_forge(item):
  // 1. Slash commands → invoke skill directly, no Forge
  if item.command starts with "/":
    return false

  // 2. AIOS agents → Forge orchestrates them
  FORGE_AGENTS = ["@dev", "@qa", "@devops", "@pm", "@sm", "@po",
                  "@architect", "@data-engineer", "@analyst",
                  "@ux-design-expert"]
  if item.who in FORGE_AGENTS:
    return true

  // 3. "agente" (generic) → Forge
  if item.who == "agente":
    return true

  // 4. User actions → manual (no Forge)
  if item.who == "user":
    return false

  // 5. Skills (slash commands) → invoke directly, no Forge
  if item.who == "skill":
    return false

  // 6. Squads → Forge orchestrates squad execution
  if item.who == "squad":
    return true

  // 7. Unknown → default to Forge (safer than manual)
  return true
```

### Decision Table (quick reference)

| `who` value | Action | Forge? |
|---|---|---|
| `@dev` | Forge dispatches to @dev | YES |
| `@qa` | Forge dispatches to @qa | YES |
| `@devops` | Forge dispatches to @devops | YES |
| `@pm` | Forge dispatches to @pm | YES |
| `@sm` | Forge dispatches to @sm | YES |
| `@po` | Forge dispatches to @po | YES |
| `@architect` | Forge dispatches to @architect | YES |
| `@data-engineer` | Forge dispatches to @data-engineer | YES |
| `@analyst` | Forge dispatches to @analyst | YES |
| `@ux-design-expert` | Forge dispatches to @ux-design-expert | YES |
| `agente` | Forge dispatches (infers agent from context) | YES |
| `user` | Show manual instruction | NO |
| `skill` | Invoke skill via `Skill` tool | NO |
| `squad` | Forge orchestrates squad execution | YES |
| command starts with `/` | Invoke slash command directly | NO |

---

## 2. Building the Forge Command

### Function: `build_forge_command(item, pack, quest_log)`

Translates a Quest mission into a Forge invocation.

```
function build_forge_command(item, pack, quest_log):
  // 1. Check for explicit override on the item
  if item.forge_mode exists:
    mode = item.forge_mode
  // 2. Check for pack-level workflow
  elif pack.forge_workflow exists:
    mode = pack.forge_workflow
  // 3. Infer from context
  else:
    mode = infer_forge_mode(item, pack)

  // 4. Build description from item context
  description = build_description(item, quest_log)

  // 5. Return the Forge invocation
  return {
    skill: "forge",
    args: "{mode} \"{description}\"",
    mode: mode,
    description: description,
    source_item: item.id
  }
```

### Mode Inference: `infer_forge_mode(item, pack)`

```
function infer_forge_mode(item, pack):
  // Pack-level workflow takes priority
  if pack.forge_workflow exists:
    return pack.forge_workflow

  // Item-level forge_mode override
  if item.forge_mode exists:
    return item.forge_mode

  // Infer from item semantics
  label_lower = item.label.toLowerCase()
  command_lower = item.command.toLowerCase()

  // Bug/fix patterns
  if contains_any(label_lower + command_lower, ["fix", "bug", "corrigir", "erro"]):
    return "fix"

  // Scan/analysis patterns
  if contains_any(label_lower + command_lower, ["analisar", "diagnosticar", "scan", "auditar"]):
    return "scan"

  // Default: feature (most common)
  return "feature"
```

### Description Builder: `build_description(item, quest_log)`

```
function build_description(item, quest_log):
  // Combine label + command for maximum context
  desc = item.label

  // Add command detail if it provides more info
  if item.command AND NOT item.command.starts_with("@"):
    desc = desc + " — " + item.command

  // Add project context
  if quest_log.meta.project:
    desc = "[" + quest_log.meta.project + "] " + desc

  return desc
```

---

## 3. Forge Execution Protocol

### How to invoke Forge from Quest

When guide.md determines a mission should use Forge, follow this protocol:

```
STEP 1: Build command
  command = build_forge_command(item, pack, quest_log)

STEP 2: Invoke Forge
  Use the Skill tool:
    Skill(skill: "forge", args: command.args)

  The Forge skill will:
  - Read its personality
  - Classify intent (feature/fix/scan/design-system/squad-upgrade)
  - Run discovery (may ask user questions)
  - Execute via agents
  - Return result

STEP 3: Handle result
  result = handle_forge_result(item, forge_output)
```

### Important: Forge runs INLINE

Forge is invoked via the `Skill` tool, which means it runs in the current conversation context. This is intentional:
- The user sees Forge's progress, checkpoints, and questions
- Forge can ask the user for clarification
- The result is immediately available for Quest to process

Do NOT use the Agent tool to run Forge in background — the user needs to see and interact with the pipeline.

---

## 4. Handling Forge Results

### Function: `handle_forge_result(item, forge_output)`

```
function handle_forge_result(item, forge_output):
  // Forge completed successfully
  if forge_output indicates success:
    return {
      auto_check: true,
      checked_by: "forge",
      message: "Forge completou a missão com sucesso."
    }

  // Forge failed
  if forge_output indicates failure:
    return {
      auto_check: false,
      checked_by: null,
      error: forge_output.error,
      message: "Forge encontrou um problema."
    }

  // Forge paused (checkpoint, needs user input)
  if forge_output indicates pause/checkpoint:
    return {
      paused: true,
      checked_by: null,
      message: "Forge pausou para sua aprovação."
    }
```

### Auto-check Flow

When Forge completes successfully:

1. Call `checklist.md` → `check {item.id}` with `source=forge`
2. The checklist module marks the item as `done` with `checked_by: "forge"`
3. XP is awarded, celebrations trigger normally
4. Guide shows next mission

### Failure Flow

When Forge fails:

1. Show error to the user
2. Ask: `"{hero_name}, o Forge travou nessa missão. Quer tentar de novo? (s/n/manual)"`
   - `s` → re-invoke Forge with same command
   - `n` → keep mission pending, show next available mission
   - `manual` → fall through to manual flow (user does it themselves)
3. Do NOT auto-check — the mission stays pending

### Pause Flow

When Forge hits a checkpoint:

1. Let Forge handle the interaction (it asks questions directly)
2. After Forge resumes and completes → proceed to auto-check
3. If user cancels during checkpoint → treat as failure

---

## 5. Non-Forge Execution (Skills, Squads, Manual)

For missions where `should_use_forge` returns `false`:

### Slash Commands (command starts with `/`)

```
if item.command starts with "/":
  // Extract skill name and args
  // e.g., "/audit-project-config" → skill: "audit-project-config"
  // e.g., "/ecosystem-audit" → skill: "ecosystem-audit"
  skill_name = extract_skill_from_command(item.command)
  Skill(skill: skill_name)
  // After skill completes → auto-check the item
```

### Squad References (who == "squad")

```
if item.who == "squad":
  // Item command references a squad, e.g., "/design squad (Brad Frost)"
  // Extract squad/agent from command text
  // Invoke via Skill tool
  // After completion → auto-check
```

### Manual Actions (who == "user")

```
if item.who == "user":
  // Show the command as instruction
  // Wait for user to confirm completion
  // Standard Quest flow: "Completou a missão? (s/n)"
```

---

## 6. Pack-Level Forge Configuration

Packs can declare a `forge_workflow` in their metadata to route ALL agent-based missions to a specific Forge workflow.

### Schema

```yaml
pack:
  id: design-system-forge
  forge_workflow: "design-system"  # maps to skills/forge/workflows/design-system.md
```

### How it works

When `forge_workflow` is set on the pack:
1. `build_forge_command` uses this as the mode
2. Forge loads `workflows/{forge_workflow}.md` instead of auto-detecting
3. This ensures domain-specific orchestration (e.g., design-system workflow knows about extraction, tokens, components)

### When NOT set

If the pack has no `forge_workflow` (like `app-development`), the bridge infers the mode per-item using `infer_forge_mode`. This is fine for generic packs where items map naturally to `feature`/`fix`/`scan`.

---

## 7. Forge Home Resolution

Forge lives inside `aios-core`. When Quest runs from external projects, paths must resolve correctly.

```
FORGE_HOME = ~/aios-core/skills/forge
FORGE_SKILL = "forge"  # skill name for Skill tool invocation
```

The `Skill` tool handles path resolution internally — Quest only needs to pass the skill name and args.

---

## 8. Integration with Checklist Module

### Extended `check` signature

The checklist module's `check` command accepts an optional `source` parameter:

```
check {id} [source=user|forge|scan]
```

When the forge-bridge triggers a check:
- Pass `source=forge`
- Checklist sets `checked_by: "forge"` on the item
- All other check behavior (XP, celebrations, phase unlock) is identical

### Quest-log item with `checked_by`

```yaml
items:
  "4.2":
    status: done
    completed_at: "2026-03-31T14:30:00Z"
    checked_by: "forge"  # new optional field
```

Valid values: `"user"` (default/absent), `"forge"`, `"scan"`

---

## 9. Forge-Initiated Quest Bootstrap

When the user enables Quest from within `/forge` (Phase 0, Step 5.5), the Forge sets `quest_enabled: true` and `quest_bootstrap` in its `state.json`. The Quest Engine is responsible for detecting this and creating `quest-log.yaml`.

### Detection: `detect_forge_quest_bootstrap()`

```
function detect_forge_quest_bootstrap():
  // Check for active Forge runs with quest_enabled
  runs = glob(".aios/forge-runs/*/state.json")
  for run in runs:
    state = read_json(run)
    if state.quest_enabled == true AND state.status == "running":
      if NOT exists(".aios/quest-log.yaml"):
        return state.quest_bootstrap  // bootstrap data
  return null
```

### Bootstrap Protocol

When `detect_forge_quest_bootstrap()` returns data, the Quest Engine creates `quest-log.yaml` using the **canonical schema from checklist.md §1** — never a custom format.

```
1. Read bootstrap data from state.json:
   - hero_name: quest_bootstrap.hero_name
   - project_name: quest_bootstrap.project_name
   - workflow: quest_bootstrap.workflow

2. Map workflow → pack:
   - FULL_APP → "app-development"
   - SINGLE_FEATURE → "app-development"
   - DESIGN_SYSTEM → "design-system-forge"
   - Other → "app-development" (default)

3. Delegate to checklist.md §2 (Create) with these inputs:
   - hero_name from quest_bootstrap
   - hero_title: "" (can be set later)
   - pack: selected pack from step 2
   - project: project_name
   - project_path: cwd

   This creates .aios/quest-log.yaml with the CANONICAL schema:
   meta (project, project_path, pack, pack_version, hero_name, hero_title, created, last_updated),
   stats, achievements, integration_results, items.

   NEVER create quest-log.yaml with a custom/simplified schema.

4. Log: "Quest inicializado via Forge bootstrap"
```

### When This Fires

The forge-bridge bootstrap is triggered by the quest-sync plugin's `after:phase:*` hook. When quest-sync detects `quest_enabled` and no `quest-log.yaml` exists, it writes a note in `state.json → plugins.quest_sync.needs_bootstrap = true`. The Quest Engine checks this on its next read cycle.

**Alternatively**, if the Forge run is the first interaction and Quest hasn't been invoked yet, the bootstrap happens lazily — the first time any Quest module reads the project state and finds `quest_enabled` without a `quest-log.yaml`.

### Ownership Boundary (NON-NEGOTIABLE)

- **Forge writes:** `state.json` → `quest_enabled`, `quest_bootstrap`, `plugins.quest_sync.*`
- **Quest writes:** `quest-log.yaml` → hero, pack, items, XP, everything else
- **Forge NEVER creates or modifies** `quest-log.yaml`
- **Quest NEVER creates or modifies** `state.json` (it only reads)

---

## 10. Rules

1. **Forge is the default executor** for any mission with an AIOS agent or squad in `who`
2. **Never bypass Forge** for agent/squad-based missions — even if the user says "just do it", route through Forge (it handles agent dispatch correctly)
3. **Forge execution is AUTOMATIC** — do NOT ask "Executar via Forge? (s/n)". When `should_use_forge` returns true, execute immediately. The user confirmed by advancing to this mission. Forge will present its own execution plan before starting work.
4. **Slash commands are NOT Forge** — `/audit-project-config`, `/ecosystem-audit`, etc. are invoked directly via Skill tool
5. **Manual items stay manual** — if `who: "user"`, Quest shows the instruction and waits. No Forge.
6. **Auto-check on success** — when Forge completes, immediately check the item. Don't ask "Completou?" — Forge already confirmed completion.
7. **Failure is recoverable** — always offer retry or skip
8. **Pack workflow overrides item inference** — if `pack.forge_workflow` is set, use it for ALL forge-routed items in that pack
9. **Forge-initiated Quest respects ownership** — when `quest_enabled` is detected, Quest creates `quest-log.yaml` (not Forge). Forge only signals intent via `state.json`.

---

## 11. Phase-to-Items Mapping (Reconciliation Table)

This is the CANONICAL mapping used by auto-reconciliation (SKILL.md Step 2). When a Forge phase is marked "completed" in state.json, these Quest items are eligible for automatic promotion to "done".

### Pack: app-development

**IMPORTANT:** The canonical source of truth for this mapping is `pack.forge_phase_map` in the pack YAML file (`packs/app-development.yaml`). This table is a REFERENCE COPY for documentation purposes only. If they diverge, the pack YAML wins.

Only `required: true` items (no `condition` field) are listed. Conditional/optional items are NEVER auto-promoted — they require user evaluation via `/quest check`.

| Forge Phase | Forge Name | Quest Items (auto-reconcile) | Evidence Required |
|---|---|---|---|
| 0 | Discovery | 1.1 | `state.phases.0.status == "completed"` |
| 1 | Spec | 2.2, 2.7, 2.8 | `state.phases.1.status == "completed"` |
| 2 | Stories | 3.1, 3.2, 3.3 | `state.phases.2.status == "completed"` |
| 3 | Build | 4.2, 4.3, 4.6 | `state.phases.3.status == "completed"` |
| 4 | Integration | 5.1, 5.8 | `state.phases.4.status == "completed"` |
| 5 | Deploy | 6.5, 7.1, 7.2, 7.3, 7.4 | `state.phases.5.status == "completed"` |

### Partial Phase Reconciliation (Phase 3 only)

Phase 3 (Build) tracks individual stories. When `state.phases.3.stories_completed > 0` but the phase is NOT completed:

| Stories Completed | Quest Items to Reconcile |
|---|---|
| >= 1 | 4.1 (story prioritizada), 4.2 (implementação) |
| >= 1 AND tests exist | 4.3 (lint + typecheck + tests) |

This handles the common case where the Build phase is still "running" or "pending" but real work has been done.

### Items NOT auto-reconciled

These items require explicit evidence beyond Forge phase completion:

| Quest Item | Why Not Auto | How to Complete |
|---|---|---|
| 0.3 (GitHub) | Needs git remote | scan_rule or manual check |
| 0.5 (README) | Needs files to exist | scan_rule |
| 1.3-1.5 (optional research) | Conditional items | user evaluation |
| 2.4-2.5 (wireframes, DS) | Conditional items | user evaluation |
| 4.4-4.5 (bulletproof tests, TDD) | Conditional, quality extras | user evaluation |
| 5.3-5.7 (security, refactoring, perf) | Conditional quality items | explicit check |
| 6.1-6.4 (seals) | Conditional quality items | explicit check |
| 8.1-8.6 (monitoring) | Post-deploy, manual | user evaluation |

### Adding mappings for new packs

When creating a new pack with Forge integration, add a section here following this pattern:

```yaml
# In the pack YAML, add a forge_phase_map (optional but recommended):
pack:
  forge_phase_map:
    0: ["1.1", "1.2"]    # Discovery → Research items
    1: ["2.1", "2.2"]    # Spec → Architecture items
    # ...
```

If `forge_phase_map` exists in the pack, the reconciliator uses it directly. If the pack has NO `forge_phase_map`, reconciliation is SKIPPED entirely for that pack — there is no hardcoded fallback. This ensures the pack YAML remains the single source of truth.
