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
detection:
  rules: []          # REQUIRED (array, can be empty)
levels: {}           # REQUIRED (map keyed by level number)
phases: {}           # REQUIRED (map keyed by phase index: 0, 1, 2, ...)
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
```

**Validation procedure:**

1. Check `pack` exists and is a map
2. Check `pack.id`, `pack.version`, `pack.name` exist and are non-empty strings
3. Check `detection` exists and has `rules` (array)
4. Check `levels` exists and is a map
5. Check `phases` exists and is a map (keyed by phase index: 0, 1, 2, ...)

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

#### `has_content('file', 'regex')`

Check if a file contains content matching the regex.

```
Grep(pattern="{regex}", path="{file}")  →  result.length > 0
```

If the file does not exist, return `false` (do not error).

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

#### Compound conditions: `AND` / `OR`

Conditions can use `AND` and `OR` to combine functions:

```
"has_file('package.json') AND has_dir('src')"
"has_file('config.yaml') OR has_file('squad.yaml')"
```

**Evaluation:** split by `AND`/`OR`, evaluate each sub-expression, apply boolean logic. `AND` binds tighter than `OR`.

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
3. If valid → **return immediately** as selected pack (skip detection)
4. If not found → error: `Pack "{id}" not found. Available packs: {list}`
5. If invalid schema → error with missing fields (Section 3.2)

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

Before running detection rules, check if the user's text matches a pack by keyword:

| Text pattern (case-insensitive) | Pack suggestion |
|--------------------------------|-----------------|
| Contains "app"/"aplicação"/"software"/"build"/"deploy" | `app-development` |
| Contains "squad" + ("upgrade"/"melhorar"/"evoluir"/"refatorar") | `squad-upgrade` |
| Contains "design system"/"design-system"/"DS"/"tokens" | `design-system-forge` |

**IMPORTANT:** This table MUST reference only packs that exist in `packs/*.yaml`. If a text pattern has no matching pack, do NOT suggest it — fall through to detection rules or manual selection instead.

If text matches → treat as `high` confidence for that pack (same as `--pack` override but with confirmation).

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
