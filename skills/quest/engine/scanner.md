# Scanner Module

> Instructions for the Quest Engine LLM. This module detects the project context, selects the correct pack, and validates its schema.

---

## 1. Input: Arguments & Context

Before scanning, collect these inputs:

| Input | Source | Example |
|-------|--------|---------|
| `args.pack` | `--pack <id>` flag from user | `--pack squad-upgrade` |
| `args.text` | Free text from user | `"criar squad"` |
| `cwd` | Current working directory | `/Users/x/CODE/Projects/my-app` |

**If `args.pack` is present, skip to [Section 5 — Pack Override](#5-pack-override).**

---

## 2. Context Detection

Scan the current working directory using **parallel tool calls** to gather context signals. Run ALL of these in a single batch:

```
# Batch 1 — run in parallel
Glob("*")                          → top-level files and dirs
Glob(".aios/quest-log.yaml")       → existing quest log?
Bash("git remote -v")              → git remotes
Bash("pwd")                        → absolute cwd path
```

Store results as context object:

```yaml
context:
  cwd: "/absolute/path"
  top_level_entries: [list of files and dirs]
  has_quest_log: true|false
  git_remotes: [list of remote names]
```

---

## 3. Pack Loading

### 3.1 Discover available packs

Read all YAML files from the `packs/` directory relative to the skill root:

```
Glob("packs/*.yaml", path="<skill_root>/skills/quest/")
```

For each pack file found, use `Read` to load it.

### 3.2 Validate schema before evaluation

For each loaded pack, check **required top-level fields** before evaluating detection rules. Required fields:

```yaml
pack:
  id: string         # REQUIRED
  version: string    # REQUIRED
  name: string       # REQUIRED
  keywords: [string] # OPTIONAL — array of strings for text-match selection (§6, args.text flow)
  type: string       # OPTIONAL — "expansion" for expansion packs (see §6.5.2)
  parent_pack: string  # OPTIONAL — required if type is "expansion"
  parent_item: string  # OPTIONAL — required if type is "expansion"
detection:
  rules: []          # REQUIRED (array, can be empty)
  prerequisites: []  # OPTIONAL — conditions that must be true for the pack to work (see §6.5.1)
  fallback_question: string  # OPTIONAL — shown when no pack auto-detects
levels: {}           # REQUIRED (map keyed by level number)
achievements: []     # OPTIONAL (array of achievement objects)
phases: {}           # REQUIRED (map keyed by phase index: 0, 1, 2, ...)
sub_quests: []       # OPTIONAL — P1, not yet consumed by engine. Array of { pack, trigger, optional }
  # Each phase (keyed by index) supports:
  #   name: string (REQUIRED)
  #   description: string
  #   unlock_message: string
  #   complete_message: string
  #   milestone: string (OPTIONAL — e.g. "mvp", "alpha", "beta")
  #     When present, triggers special ceremonies on phase completion.
  #     "mvp" triggers the MVP Launch Guide (guide.md section 4.6).
  #   integration_checks: [] (OPTIONAL — list of checks run before unlocking next phase)
  #     Each check: { name, type, command|glob }
  #     Types: "command" (runs shell, expects exit 0), "file_exists" (glob match)
  #     See guide.md section 2.5 for full spec.
  #   items: [] (REQUIRED — array of item objects within the phase)
  #     Each item MUST have:
  #       id: string        (REQUIRED — unique across all phases, e.g. "0.1", "3.2")
  #       label: string     (REQUIRED — human-readable mission name)
  #       command: string   (REQUIRED — instruction for the player)
  #       who: string       (REQUIRED — "user", "@agent-name", "skill", "squad", or "agente")
  #       required: boolean (REQUIRED — true if mandatory for phase progression)
  #       xp: number        (REQUIRED — XP awarded on completion)
  #     Optional item fields:
  #       tip: string       (contextual hint shown in mission card)
  #       condition: string (human-readable condition for applicability)
  #       scan_rule: string (scanner function expression for auto-detection)
  #       note: string      (internal note, not shown to player)
  #       per_agent: boolean (P1 — repeat per agent, not yet implemented)
```

**Validation procedure:**

1. Check `pack` exists and is a map
2. Check `pack.id`, `pack.version`, `pack.name` exist and are non-empty strings
3. Check `detection` exists and has `rules` (array)
4. Check `levels` exists and is a map
5. Check `phases` exists and is a map (keyed by phase index: 0, 1, 2, ...)
6. For each phase, check `items` is an array with at least one item
7. For each item, check required fields exist: `id` (string), `label` (string), `command` (string), `who` (string), `required` (boolean), `xp` (number)

If validation fails, **do NOT evaluate** that pack. Record the error:

```
SKIP pack file "{filename}": missing required fields: {comma-separated list}
```

Show this message to the user if no valid packs remain.

---

## 4. Detection Rule Evaluation

### 4.1 Scanner Functions

Each pack's `detection.rules` is an array of `{ condition, confidence }`. The `condition` string uses scanner functions. Implement each function using Claude Code tools:

#### `has_file('path')`

Check if a file exists at the given path relative to cwd.

```
Glob("{path}")  →  result.length > 0
```

#### `has_dir('path')`

Check if a directory exists at the given path relative to cwd.

```
Glob("{path}/")  →  result.length > 0
```

If Glob does not distinguish dirs, use:

```
Bash("test -d '{path}' && echo EXISTS || echo NO")
```

#### `has_file_matching('glob')`

Check if any file matches the glob pattern relative to cwd.

```
Glob("{glob}")  →  result.length > 0
```

#### `has_remote('name')`

Check if a git remote with the given name exists.

```
Bash("git remote -v")  →  parse output for "{name}"
```

Use the result already fetched in context detection (Section 2) when possible.

#### `has_content('file_or_glob', 'regex')`

Check if a file (or files matching a glob) contains content matching the regex.

If the path contains wildcards (`*`, `**`), use Grep with glob parameter.
If the path is a literal file, use Grep with path parameter.

```
// Literal file path:
Grep(pattern="{regex}", path="{file}")  →  result.length > 0

// Glob pattern (contains * or **):
Grep(pattern="{regex}", glob="{glob}")  →  result.length > 0
```

If the file does not exist (or glob matches nothing), return `false` (do not error).

#### `has_content_matching('glob', 'regex')`

Check if any file matching the glob contains content matching the regex. Alias for `has_content` with a glob pattern — exists for clarity in pack scan_rules.

```
Grep(pattern="{regex}", glob="{glob}")  →  result.length > 0
```

#### `command_exists('name')`

Check if a command is available in PATH.

```
Bash("command -v {name} && echo EXISTS || echo NO")  →  output contains "EXISTS"
```

#### `file_count('glob') > N`

Count files matching a glob and compare against threshold.

```
Glob("{glob}")  →  result.length > N
```

#### `inside_path('substring')`

Check if the cwd contains the given substring.

```
// Expand ~ to the user's home directory before comparing
resolved = substring.replace(/^~/, process.env.HOME || os.homedir())
cwd.includes(resolved)
```

Pure string check, no tool call needed. **IMPORTANT:** Always expand `~` to the absolute home path before comparison, otherwise rules like `inside_path('~/CODE/Projects')` will never match.

#### Compound conditions: `AND` / `OR` / `NOT`

Conditions can use `AND`, `OR`, and unary `NOT` to combine functions:

```
"has_file('package.json') AND has_dir('src')"
"has_file('config.yaml') OR has_file('squad.yaml')"
"has_file('package.json') AND NOT has_file('.aios/quest-log.yaml')"
```

**Evaluation:** split by `AND`/`OR`, evaluate each sub-expression, apply boolean logic. Precedence (highest to lowest): `NOT` > `AND` > `OR`. `NOT` applies to the immediately following sub-expression only.

### 4.2 Parallel evaluation strategy

**Performance target: < 2 seconds total scan time.**

1. Collect ALL unique scanner function calls across ALL packs' detection rules
2. Deduplicate (e.g., `has_file('package.json')` appearing in 2 packs = 1 call)
3. Group by tool type and execute in parallel batches:

```
# Batch A — all Glob calls (parallel)
Glob("package.json")
Glob("config.yaml")
Glob("src/")
Glob("docs/stories/*.md")

# Batch B — all Bash calls (parallel)
Bash("git remote -v")  # if not already fetched

# Batch C — all Grep calls (parallel)
Grep(pattern="## Arquitetura", path="README.md")
```

4. Cache results, then evaluate each pack's rules using cached values

### 4.3 Confidence scoring

For each valid pack, evaluate its `detection.rules` array in order. Each rule has a `confidence` level: `high`, `medium`, or `low`.

```
for each pack:
  best_confidence = null
  for each rule in pack.detection.rules:
    if evaluate(rule.condition) == true:
      if rule.confidence > best_confidence:
        best_confidence = rule.confidence
  pack.match_confidence = best_confidence  # null if no rule matched
```

Confidence ranking: `high > medium > low > null`.

### 4.4 Build match results

After evaluating all packs, build a sorted results list:

```yaml
matches:
  - pack_id: "app-development"
    confidence: high
    matched_rule: "has_file('package.json') AND NOT has_file('.aios/quest-log.yaml')"
  - pack_id: "squad-upgrade"
    confidence: medium
    matched_rule: "has_file('config.yaml') AND has_dir('agents')"
```

Sort by confidence: high first, then medium, then low.

---

## 5. Pack Override

If `args.pack` is provided (`--pack <id>`):

1. Search for `packs/{id}.yaml` in the skill root
2. If found → Read and validate schema (Section 3.2)
3. If valid → **proceed to §6.5 Post-selection Gates** (skip detection, but NOT the gates)
4. If not found → error: `Pack "{id}" not found. Available packs: {list}`
5. If invalid schema → error with missing fields (Section 3.2)

> **Important:** The override skips auto-detection (Section 4) and decision logic (Section 6), but the pack MUST still pass the post-selection gates (§6.5) before being returned. This ensures prerequisites and expansion-pack constraints are always enforced.

---

## 6. Decision Logic

Based on the match results from Section 4.4:

### Single high-confidence match

```
→ Auto-select the pack
→ Output: "Detected: {pack.name} {pack.icon} (confidence: high)"
→ Proceed to pack loading
```

### Multiple high-confidence matches

```
→ Ask the user to choose between the high-confidence packs
→ Output: "Multiple packs match this project:"
→ List each with its matched rule
→ Wait for user selection
```

### Best match is medium or low confidence

```
→ Suggest the best match but ask for confirmation
→ Output: "This looks like a {pack.name} project. Use this pack? (y/n)"
→ If user says no → show full pack list
```

### No matches at all

```
→ Show all available packs for manual selection
→ If no pack matches, show each pack's fallback_question (from pack.detection.fallback_question)
  when available, or a generic "Que tipo de quest você quer rodar?"
→ List each pack: "{pack.icon} {pack.name} — {pack.tagline}"
→ Wait for user selection
```

**Fallback question priority:**
1. If the pack defines `detection.fallback_question`, show that question to help the user decide
2. If no pack defines a fallback question, use the generic prompt: `"Que tipo de quest você quer rodar?"`

### User provided free text (`args.text`)

Before running detection rules, check if the user's text matches a pack by keyword. Build the keyword table **dynamically** from loaded packs:

1. Load all valid packs from `packs/*.yaml` (already loaded in §3.1)
2. For each pack, extract `pack.id` and `pack.keywords` (array of strings, optional field)
3. Match the user's text (case-insensitive) against each pack's keywords
4. If a match is found → treat as `high` confidence for that pack

If a pack does not define `keywords`, it is not matchable by free text — fall through to detection rules.

> **Example** (non-normative — actual values come from loaded packs):
>
> | Text pattern | Pack |
> |---|---|
> | "app", "build", "deploy" | `app-development` (if it exists and defines these keywords) |
> | "squad", "upgrade" | `squad-upgrade` (if it exists and defines these keywords) |
>
> These are illustrative only. Do NOT hardcode pack IDs — always resolve from `packs/*.yaml`.

If text matches → treat as `high` confidence for that pack (same as `--pack` override but with confirmation). If no pack keywords match the user's text, fall through to detection rules or manual selection.

---

## 6.5 Post-selection Gates

After a pack is selected (via auto-detection, user choice, or override), run these gates **before** returning the result. If any gate fails, the pack is blocked — do NOT proceed to ceremony or quest-log creation.

### 6.5.1 Prerequisites Gate

Some packs define `detection.prerequisites` — conditions that MUST be true for the pack to work.

```yaml
# Example from pack YAML:
detection:
  prerequisites:
    - condition: "has_dir('.aios-core') OR has_dir('.aios')"
      message: "AIOS obrigatório. Rode: npx ~/aios-core init ."
```

**Evaluation:**

```
for each prerequisite in pack.detection.prerequisites:
  result = evaluate(prerequisite.condition)  // same scanner functions as detection rules
  if NOT result:
    show:
      "⛔ Pack '{pack.name}' requer prerequisito não atendido:
       {prerequisite.message}

       Instale o prerequisito e rode /quest novamente."
    BLOCK — do not return this pack. Abort.
```

If `prerequisites` is absent or empty, skip this gate (pass by default).

### 6.5.2 Expansion Pack Gate

Packs with `pack.type: "expansion"` are side quests that branch from a parent pack. They require the parent quest to have reached a specific point before activating.

```yaml
# Example from pack YAML:
pack:
  type: expansion
  parent_pack: app-development    # id of the parent pack
  parent_item: "2.5"              # item in parent pack that must be done
```

**Model: single quest-log with pack transition.** The project has ONE `.aios/quest-log.yaml` at a time. Activating an expansion replaces the active pack (like switching game chapters), preserving the parent's completed items for gate validation.

**Evaluation:**

```
if pack.type == "expansion":
  // 1. Check if a quest-log exists
  quest_log_path = ".aios/quest-log.yaml"
  quest_log = read(quest_log_path)

  if quest_log does not exist:
    show:
      "⛔ '{pack.name}' é uma expansão de '{pack.parent_pack}'.
       Você precisa iniciar a quest principal primeiro.

       Rode: /quest --pack {pack.parent_pack}"
    BLOCK — abort.

  // 2. Validate parent pack identity
  //    The current quest-log must belong to the parent pack.
  //    This prevents false positives from unrelated packs that happen
  //    to share the same item ID.
  quest_log_pack = quest_log.meta.pack

  if quest_log_pack != pack.parent_pack:
    show:
      "⛔ '{pack.name}' é uma expansão de '{pack.parent_pack}',
       mas este projeto usa o pack '{quest_log_pack}'.

       Rode: /quest --pack {pack.parent_pack} primeiro."
    BLOCK — abort.

  // 3. Check if the required parent item was completed
  parent_item_status = quest_log.items[pack.parent_item]

  if parent_item_status is undefined OR parent_item_status.status != "done":
    show:
      "⛔ '{pack.name}' desbloqueia após a missão {pack.parent_item}.

       Complete essa missão primeiro e rode /quest --pack {pack.id}"
    BLOCK — abort.

  // 4. Gate passed — expansion can proceed.
  //    Activation happens via checklist.md "Read Quest-log" §3 step 2:
  //    the pack mismatch flow asks the user to switch packs.
  //    New expansion items are added as pending, parent items are kept.
```

If `pack.type` is absent or not `"expansion"`, skip this gate.

**How it works end-to-end:**
1. User completes parent_item in the parent pack quest
2. User runs `/quest --pack {expansion_id}`
3. Scanner gates pass (item is done)
4. Checklist Read §3 detects pack mismatch (`meta.pack` = parent, scanner = expansion)
5. User confirms switch → `meta.pack` updates, new expansion items added as `pending`, parent items kept with their status
6. Resumption continues with the expansion pack
7. `/quest --pack {parent_id}` can switch back (same mechanism)

---

## 7. Error Handling

### Pack file not found

```
"No pack files found in packs/ directory.
Expected location: {skill_root}/skills/quest/packs/*.yaml"
```

### Invalid YAML syntax

```
"Pack file '{filename}' has invalid YAML syntax. Fix the file and try again."
```

### Missing required fields

```
"Pack '{filename}' has invalid schema.
Missing required fields: {field1}, {field2}, {field3}
Required: pack.id, pack.version, pack.name, detection.rules, levels, phases"
```

### Git not available

If `git remote -v` fails, skip all `has_remote()` checks (return `false`). Do not error — git is optional.

---

## 8. Output Contract

The scanner module returns a single result object to the orchestrator (SKILL.md):

```yaml
scanner_result:
  selected_pack:
    id: string            # pack.id
    file: string          # path to the YAML file
    confidence: string    # "high", "medium", "low", or "override"
    method: string        # "auto-detected", "user-selected", "pack-override", "text-match"
  available_packs:        # always populated for reference
    - id: string
      name: string
      icon: string
      tagline: string
  context:
    cwd: string
    has_quest_log: boolean
    git_remotes: [string]
```

This object is passed to the next engine module (ceremony.md or checklist.md depending on whether a quest-log already exists).
