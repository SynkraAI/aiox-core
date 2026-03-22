# Agent Creation Guide — Schema & Checklist

## Naming

| Context | Pattern | Example |
|---------|---------|---------|
| Core agent ID | `{role}` (kebab-case) | `dev`, `qa`, `data-engineer` |
| Squad agent ID | `{prefix}-{role}` | `bc-renderer`, `ab-hormozi` |
| File name | `{agent-id}.md` | `dev.md`, `bc-renderer.md` |
| Persona name | "Name (Archetype)" | `Dex (Builder)`, `Quinn (Guardian)` |

## Where to Save

| Type | Agent Definition | Command File |
|------|-----------------|--------------|
| **Core** | `.aiox-core/development/agents/{id}/` (pasta) | `.claude/commands/AIOS/agents/{id}.md` |
| **Squad** | `squads/{squad}/agents/{id}.md` | `.claude/commands/{squad}/{id}.md` |

**IMPORTANTE:** Core agents vivem em **pastas** (ex: `agents/dev/`), não em arquivos soltos.

## Complete YAML Schema

```yaml
# ─── LOADER CONFIGURATION ───

ACTIVATION-NOTICE: >
  This file contains your full agent operating guidelines.
  Read the ENTIRE file and follow activation-instructions.

IDE-FILE-RESOLUTION:
  - Dependencies map to .aiox-core/development/{type}/{name}
  - type = tasks|templates|checklists|data|utils
  - IMPORTANT: Only load when user requests specific command execution

REQUEST-RESOLUTION: >
  Match user requests to commands flexibly.
  Example: "write tests" → *run-tests, "check quality" → *review

activation-instructions:
  - "STEP 1: Read THIS ENTIRE FILE"
  - "STEP 2: Adopt persona from 'agent' and 'persona' sections"
  - "STEP 3: Assemble greeting:"
  - "  1. Show: '{icon} {greeting_levels.archetypal}'"
  - "  2. Show: '**Role:** {persona.role}'"
  - "  3. Show: 'Available Commands:'"
  - "  4. Check `.aios/handoffs/` for unconsumed handoff artifact"
  - "  5. Show: '{signature_closing}'"
  - "STEP 4: Display greeting"
  - "STEP 5: HALT and await user input"

# ─── AGENT IDENTITY ───

agent:
  name: "{Name}"              # REQUIRED — "Name (Archetype)" format
  id: "{agent-id}"            # REQUIRED — kebab-case
  title: "{Job Title}"        # REQUIRED — Human-readable
  icon: "{emoji}"             # REQUIRED — Single emoji
  whenToUse: "{description}"  # REQUIRED — When to activate
  customization: null         # OPTIONAL

# ─── PERSONA PROFILE ───

persona_profile:
  archetype: "{Archetype}"    # Builder, Guardian, Strategist, etc.
  zodiac: "{zodiac}"          # OPTIONAL — Flavor only

  communication:
    tone: "{tone}"            # pragmatic, analytical, strategic
    emoji_frequency: "{low|medium|high}"
    vocabulary:
      - "{termo_pt_1}"
      - "{termo_pt_2}"

    greeting_levels:
      minimal: "{icon} {id} Agent ready"
      named: "{icon} {Name} ({Archetype}) ready."
      archetypal: "{icon} {Name} ({Archetype}) — {title}. {tagline}"

    signature_closing: "{closing_message}"

# ─── PERSONA (BEHAVIORAL) ───

persona:
  role: "{expert role description}"
  style: "{communication style}"
  identity: "{self-identity}"
  focus: "{focus areas}"
  core_principles:
    - "CRITICAL: {principle_1}"     # Min 1 CRITICAL required
    - "CRITICAL: {principle_2}"
    - "{principle_3}"

# ─── STORY FILE PERMISSIONS ─── (OPTIONAL)

story-file-permissions:
  - "CRITICAL: Only update {specific sections}"

# ─── COMMANDS ───

commands:
  - name: "{command-name}"
    visibility: [full, quick, key]   # full=*guide, quick=*help, key=highlighted
    args: "{args_spec}"              # OPTIONAL
    description: "{description}"
    task: "{task-file.md}"           # OPTIONAL — maps to dependency

  # Universal commands (INCLUDE IN ALL):
  - name: help
    visibility: [full, quick]
    description: "List all commands"
  - name: guide
    visibility: [full]
    description: "Comprehensive usage guide"
  - name: exit
    visibility: [full, quick]
    description: "Exit agent mode"

# ─── DEPENDENCIES ───

dependencies:
  checklists:
    - "{checklist-file.md}"
  tasks:
    - "{task-file.md}"
  scripts:
    - "{script-file.js}"
  templates:
    - "{template-file.yaml}"
  tools:
    - "{tool_name}"

  # GIT RESTRICTIONS (core agents ONLY — critical for Art. II)
  git_restrictions:
    allowed_operations:
      - git add
      - git commit
      - git status
      - git diff
      - git log
      - git branch
      - git checkout
    blocked_operations:
      - git push            # → delegate to @devops
      - gh pr create        # → delegate to @devops

# ─── AUTONOMOUS EXECUTION ───

autoClaude:
  version: '3.0'
  execution:
    canCreatePlan: true
    canExecute: true
    canVerify: true
  recovery:
    canTrack: true
    canRollback: true
```

## Minimal Template (Copy & Fill)

```yaml
agent:
  name: "{Name}"
  id: "{agent-id}"
  title: "{Title}"
  icon: "{emoji}"
  whenToUse: "{when to activate}"

persona_profile:
  archetype: "{Archetype}"
  communication:
    tone: "{tone}"
    emoji_frequency: low
    greeting_levels:
      minimal: "{icon} {id} Agent ready"
      named: "{icon} {Name} ({Archetype}) ready."
      archetypal: "{icon} {Name} ({Archetype}) — {title}."
    signature_closing: "{closing}"

persona:
  role: "{role}"
  style: "{style}"
  identity: "{identity}"
  focus: "{focus}"
  core_principles:
    - "CRITICAL: {principle_1}"
    - "{principle_2}"

commands:
  - name: help
    visibility: [full, quick]
    description: "List all commands"
  - name: "{main-command}"
    visibility: [full, quick, key]
    description: "{description}"
    task: "{task-file.md}"
  - name: exit
    visibility: [full, quick]
    description: "Exit agent mode"

dependencies:
  tasks:
    - "{task-file.md}"
  checklists: []
  scripts: []
  templates: []
  tools: []
```

## Registration Steps

### Core Agent
1. Create folder `.aiox-core/development/agents/{id}/`
2. Save agent definition as `{id}.md` inside that folder
3. Create slash command in `.claude/commands/AIOS/agents/{id}.md`
4. Add entry to `.aiox-core/data/entity-registry.yaml`

### Squad Agent
1. Save agent definition to `squads/{squad}/agents/{id}.md`
2. Create slash command in `.claude/commands/{squad}/{id}.md`
3. Update squad `config.yaml` components

## Validation Checklist (18 Points)

| # | Check | Blocking |
|---|-------|----------|
| 1 | File is valid Markdown with YAML block | YES |
| 2 | `agent.name` present ("Name (Archetype)" format) | YES |
| 3 | `agent.id` present (kebab-case) | YES |
| 4 | `agent.title` present | YES |
| 5 | `agent.icon` present (single emoji) | YES |
| 6 | `agent.whenToUse` present | YES |
| 7 | `persona_profile.archetype` present | YES |
| 8 | `persona_profile.communication.tone` present | YES |
| 9 | All 3 `greeting_levels` present | YES |
| 10 | `persona.role` present | YES |
| 11 | `persona.core_principles` has min 1 CRITICAL | YES |
| 12 | `commands` array has min 1 command + `help` + `exit` | YES |
| 13 | `dependencies` section present | YES |
| 14 | `git_restrictions` present (core agents only) | YES (core) |
| 15 | No placeholder text remaining (`{...}`) | YES |
| 16 | UTF-8 encoding | YES |
| 17 | File saved to correct path (folder for core) | YES |
| 18 | Slash command created in `.claude/commands/` | Advisory |
