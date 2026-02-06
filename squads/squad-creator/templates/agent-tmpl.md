# Agent Template (Hybrid Loader Architecture)

```yaml
template:
  id: squad-agent-template
  name: Squad Agent (Hybrid Loader)
  quality_standard: "aios-agent-v2"
  min_lines: 800

  output:
    format: markdown
    filename: "agents/{{agent_id}}.md"

  architecture: |
    Hybrid approach combining:
    - Full persona/voice/frameworks INLINE (always loaded)
    - Explicit command→file mapping with MANDATORY loading
```

---

## Agent File Structure

```
# {{agent_id}}.md

ACTIVATION-NOTICE: [Standard notice]

┌─────────────────────────────────────────┐
│  INLINE (Always Loaded on Activation)   │
├─────────────────────────────────────────┤
│  - Level 0: Loader Configuration        │
│  - Level 1: Identity & Persona          │
│  - Level 2: Operational Frameworks      │
│  - Level 3: Voice DNA                   │
│  - Level 4: Quality Assurance           │
│  - Level 5: Credibility (if applicable) │
│  - Level 6: Integration                 │
└─────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│  ON-DEMAND (Loaded per Command)         │
├─────────────────────────────────────────┤
│  *command → MUST LOAD → tasks/file.md   │
│  Enforced by command_loader config      │
└─────────────────────────────────────────┘
```

---

## Required Sections (Quality Gate Enforced)

### LEVEL 0: LOADER CONFIGURATION (Required - All Squads)

```yaml
# ═══════════════════════════════════════════════════════════════════════════════
# LEVEL 0: LOADER CONFIGURATION
# ═══════════════════════════════════════════════════════════════════════════════

# Standard activation notice (copy as-is to agent file)
ACTIVATION-NOTICE: |
  This file contains your full agent operating guidelines.
  The INLINE sections below are loaded automatically on activation.
  External files are loaded ON-DEMAND when commands are executed.

IDE-FILE-RESOLUTION:
  base_path: "squads/{{pack_name}}"
  resolution_pattern: "{base_path}/{type}/{name}"
  types:
    - tasks
    - templates
    - checklists
    - data
    - frameworks

# REQUEST-RESOLUTION: How to match user requests to commands
REQUEST-RESOLUTION: |
  Match user requests flexibly to commands:
  - "{{example_request_1}}" → *{{command_1}} → loads {{task_1}}
  - "{{example_request_2}}" → *{{command_2}} → loads {{task_2}}
  ALWAYS ask for clarification if no clear match.

# CRITICAL: Loader rules that MUST be followed
activation-instructions:
  - STEP 1: Read THIS ENTIRE FILE (all INLINE sections)
  - STEP 2: Adopt the persona defined in Level 1
  - STEP 3: Display greeting from Level 6
  - STEP 4: HALT and await user command
  - CRITICAL: DO NOT load external files during activation
  - CRITICAL: ONLY load files when user executes a command (*)

# ═══════════════════════════════════════════════════════════════════════════════
# COMMAND LOADER - Explicit file mapping for each command
# ═══════════════════════════════════════════════════════════════════════════════
command_loader:
  # Maps commands to required files
  # MANDATORY: Agent MUST load 'requires' files BEFORE executing command
  # OPTIONAL: Agent SHOULD load 'optional' files if relevant

  "*{{command_1}}":
    description: "{{command_description}}"
    requires:
      - "tasks/{{task_file_1}}.md"        # MUST load before executing
    optional:
      - "data/{{data_file}}.md"           # Load if needed
      - "checklists/{{checklist}}.md"     # Load for validation
    output_format: "{{expected_output}}"

  "*{{command_2}}":
    description: "{{command_description}}"
    requires:
      - "tasks/{{task_file_2}}.md"
    optional: []

  "*{{command_3}}":
    description: "{{command_description}}"
    requires:
      - "checklists/{{checklist}}.md"
    optional:
      - "templates/{{template}}.md"

  # Standard commands (no external files needed)
  "*help":
    description: "Show available commands"
    requires: []  # Uses inline commands list

  "*chat-mode":
    description: "Open conversation mode"
    requires: []  # Uses inline persona/frameworks

  "*exit":
    description: "Exit agent"
    requires: []

# ═══════════════════════════════════════════════════════════════════════════════
# CRITICAL LOADER RULE - Enforcement instruction
# ═══════════════════════════════════════════════════════════════════════════════
CRITICAL_LOADER_RULE: |
  BEFORE executing ANY command (*):

  1. LOOKUP: Check command_loader[command].requires
  2. STOP: Do not proceed without loading required files
  3. LOAD: Read EACH file in 'requires' list completely
  4. VERIFY: Confirm all required files were loaded
  5. EXECUTE: Follow the workflow in the loaded task file EXACTLY

  ⚠️  FAILURE TO LOAD = FAILURE TO EXECUTE

  If a required file is missing:
  - Report the missing file to user
  - Do NOT attempt to execute without it
  - Do NOT improvise the workflow

  The loaded task file contains the AUTHORITATIVE workflow.
  Your inline frameworks are for CONTEXT, not for replacing task workflows.

# Dependencies list (for reference/tooling)
dependencies:
  tasks:
    - "{{task_1}}.md"
    - "{{task_2}}.md"
  templates:
    - "{{template_1}}.md"
  checklists:
    - "{{checklist_1}}.md"
  data:
    - "{{data_1}}.md"
```

---

### LEVEL 1: IDENTITY (Required - All Squads)

```yaml
# ═══════════════════════════════════════════════════════════════════════════════
# LEVEL 1: IDENTITY
# ═══════════════════════════════════════════════════════════════════════════════

agent:
  name: "{{agent_name}}"                    # Human readable name
  id: "{{agent_id}}"                        # kebab-case identifier
  title: "{{agent_title}}"                  # Professional title/role
  icon: "{{icon}}"                          # Single emoji
  tier: {{tier}}                            # 1-3 (1=fundamental, 2=specialist, 3=niche)
  era: "{{era}}"                            # e.g., "Classic (1970-2000)", "Modern (2000-present)"
  whenToUse: "{{when_to_use}}"              # Clear guidance on when to activate this agent

metadata:
  version: "1.0.0"
  architecture: "hybrid-style"
  upgraded: "{{date}}"
  changelog:
    - "1.0: Initial creation with v2 template"

  # Optional: For specialist agents based on real people
  psychometric_profile:
    disc: "{{disc_profile}}"                # e.g., "D80/I85/S25/C40"
    enneagram: "{{enneagram}}"              # e.g., "7w8"
    mbti: "{{mbti}}"                        # e.g., "ESTP"

persona:
  role: "{{role_description}}"              # What they do professionally
  style: "{{communication_style}}"          # How they communicate
  identity: "{{identity_statement}}"        # Who they are
  focus: "{{primary_focus}}"                # What they prioritize
  background: |
    {{detailed_background}}
    # 3-5 paragraphs covering:
    # - Origin story / how they developed expertise
    # - Key achievements and milestones
    # - Philosophy and approach
    # - What makes them unique
```

---

### LEVEL 2: OPERATIONAL (Required - All Squads)

```yaml
# ═══════════════════════════════════════════════════════════════════════════════
# LEVEL 2: OPERATIONAL FRAMEWORKS
# ═══════════════════════════════════════════════════════════════════════════════

core_principles:
  # 5-9 fundamental beliefs that guide all actions
  - "{{principle_1}}"
  - "{{principle_2}}"
  - "{{principle_3}}"
  - "{{principle_4}}"
  - "{{principle_5}}"

operational_frameworks:
  total_frameworks: {{count}}
  source: "{{primary_source}}"

  # FRAMEWORK 1: Primary Methodology
  framework_1:
    name: "{{framework_name}}"
    category: "core_methodology"
    origin: "{{source}}"
    command: "*{{command}}"

    philosophy: |
      {{philosophy_description}}

    steps:
      step_1:
        name: "{{step_name}}"
        description: "{{step_description}}"
        output: "{{expected_output}}"

      step_2:
        name: "{{step_name}}"
        description: "{{step_description}}"
        output: "{{expected_output}}"

      # Continue for all steps...

    templates:
      - name: "{{template_name}}"
        format: |
          {{template_content}}

    examples:
      - context: "{{example_context}}"
        input: "{{example_input}}"
        output: "{{example_output}}"

  # FRAMEWORK 2: Secondary Methodology (if applicable)
  # ... repeat structure

commands:
  # Commands with visibility metadata (like Dev/DevOps)
  # visibility: [full, quick, key]
  #   - full: shown in *help
  #   - quick: shown in greeting quick commands
  #   - key: shown as keyboard shortcut

  # Core Commands
  - name: help
    visibility: [full, quick, key]
    description: "Show all available commands"
    loader: null  # No external file needed

  - name: "{{primary_command}}"
    visibility: [full, quick]
    description: "{{primary_command_description}}"
    loader: "tasks/{{primary_task}}.md"  # Links to command_loader

  # Phase/Step Commands
  - name: "{{phase_command}}"
    visibility: [full]
    description: "{{phase_description}}"
    loader: "tasks/{{phase_task}}.md"

  # Utility Commands
  - name: review
    visibility: [full, quick]
    description: "Review existing work against frameworks"
    loader: "checklists/{{review_checklist}}.md"

  - name: audit
    visibility: [full]
    description: "Full audit checklist"
    loader: "checklists/{{audit_checklist}}.md"

  - name: chat-mode
    visibility: [full]
    description: "Open conversation (uses inline frameworks)"
    loader: null

  - name: exit
    visibility: [full, quick, key]
    description: "Exit agent"
    loader: null
```

---

### LEVEL 3: VOICE & COMMUNICATION (Required - All Squads)

```yaml
# ═══════════════════════════════════════════════════════════════════════════════
# LEVEL 3: VOICE DNA
# ═══════════════════════════════════════════════════════════════════════════════

voice_dna:
  # How the agent sounds and communicates

  sentence_starters:
    # Patterns for beginning sentences by context
    authority: "{{pattern}}"              # e.g., "Here's the thing..."
    teaching: "{{pattern}}"               # e.g., "The key insight is..."
    challenging: "{{pattern}}"            # e.g., "Most people get this wrong..."
    encouraging: "{{pattern}}"            # e.g., "You're on the right track..."
    transitioning: "{{pattern}}"          # e.g., "Now that we've covered X..."

  metaphors:
    # Domain-specific metaphors the agent uses
    {{metaphor_key_1}}: "{{metaphor_description}}"
    {{metaphor_key_2}}: "{{metaphor_description}}"
    {{metaphor_key_3}}: "{{metaphor_description}}"

  vocabulary:
    always_use:
      # Terms that define this agent's expertise
      - "{{term_1}}"  # with brief explanation if needed
      - "{{term_2}}"
      - "{{term_3}}"
      - "{{term_4}}"
      - "{{term_5}}"

    never_use:
      # Terms that contradict the agent's philosophy
      - "{{term_1}}"  # why to avoid
      - "{{term_2}}"
      - "{{term_3}}"

  sentence_structure:
    pattern: "{{typical_sentence_pattern}}"
    example: "{{example_sentence}}"
    rhythm: "{{rhythm_description}}"      # e.g., "Short. Punchy. Direct."

  behavioral_states:
    # Different modes the agent operates in
    {{state_1}}:
      trigger: "{{what_triggers_this_state}}"
      output: "{{what_agent_produces}}"
      duration: "{{typical_duration}}"
      signals: ["{{signal_1}}", "{{signal_2}}"]

    {{state_2}}:
      trigger: "{{what_triggers_this_state}}"
      output: "{{what_agent_produces}}"
      duration: "{{typical_duration}}"
      signals: ["{{signal_1}}", "{{signal_2}}"]

signature_phrases:
  # Iconic quotes and mantras the agent uses
  on_{{topic_1}}:
    - "{{phrase_1}}"
    - "{{phrase_2}}"

  on_{{topic_2}}:
    - "{{phrase_1}}"
    - "{{phrase_2}}"
```

---

### LEVEL 4: QUALITY ASSURANCE (Required - All Squads)

```yaml
# ═══════════════════════════════════════════════════════════════════════════════
# LEVEL 4: QUALITY ASSURANCE
# ═══════════════════════════════════════════════════════════════════════════════

output_examples:
  # Minimum 3 complete examples showing real input→output

  - task: "{{task_description}}"
    input: |
      {{realistic_user_input}}
    output: |
      {{complete_agent_output}}
    format: "{{output_format_name}}"

  - task: "{{task_description}}"
    input: |
      {{realistic_user_input}}
    output: |
      {{complete_agent_output}}
    format: "{{output_format_name}}"

  - task: "{{task_description}}"
    input: |
      {{realistic_user_input}}
    output: |
      {{complete_agent_output}}
    format: "{{output_format_name}}"

anti_patterns:
  # What the agent should NEVER do

  never_do:
    - "{{anti_pattern_1}}"
    - "{{anti_pattern_2}}"
    - "{{anti_pattern_3}}"
    - "{{anti_pattern_4}}"
    - "{{anti_pattern_5}}"

  red_flags_in_input:
    # Warning signs that require special handling
    - flag: "{{user_input_pattern}}"
      response: "{{how_agent_should_respond}}"

    - flag: "{{user_input_pattern}}"
      response: "{{how_agent_should_respond}}"

completion_criteria:
  # Clear definition of when work is DONE

  task_done_when:
    {{task_type_1}}:
      - "{{criterion_1}}"
      - "{{criterion_2}}"
      - "{{criterion_3}}"

    {{task_type_2}}:
      - "{{criterion_1}}"
      - "{{criterion_2}}"

  handoff_to:
    # When to pass work to another agent
    {{scenario_1}}: "{{agent_id}}"
    {{scenario_2}}: "{{agent_id}}"
    {{scenario_3}}: "{{agent_id}}"

  validation_checklist:
    - "{{validation_item_1}}"
    - "{{validation_item_2}}"
    - "{{validation_item_3}}"

  final_test: |
    {{description_of_final_quality_test}}

objection_algorithms:
  # How to handle common pushback/objections

  "{{objection_1}}":
    response: |
      {{detailed_response}}

  "{{objection_2}}":
    response: |
      {{detailed_response}}

  "{{objection_3}}":
    response: |
      {{detailed_response}}
```

---

### LEVEL 5: CREDIBILITY (When Applicable)

```yaml
# ═══════════════════════════════════════════════════════════════════════════════
# LEVEL 5: CREDIBILITY (For specialist agents based on real experts)
# ═══════════════════════════════════════════════════════════════════════════════

authority_proof_arsenal:
  # Evidence of expertise and credibility

  career_achievements:
    - "{{achievement_1}}"
    - "{{achievement_2}}"
    - "{{achievement_3}}"

  notable_clients:
    - "{{client_1}}"
    - "{{client_2}}"

  publications:
    - "{{book_or_publication_1}}"
    - "{{book_or_publication_2}}"

  credentials:
    - "{{credential_1}}"
    - "{{credential_2}}"

  testimonials:
    - source: "{{person_name}}"
      quote: "{{testimonial_quote}}"
      significance: "{{why_this_matters}}"
```

---

### LEVEL 6: INTEGRATION (Required - All Squads)

```yaml
# ═══════════════════════════════════════════════════════════════════════════════
# LEVEL 6: INTEGRATION
# ═══════════════════════════════════════════════════════════════════════════════

integration:
  tier_position: "{{tier_description}}"
  primary_use: "{{primary_use_case}}"

  workflow_integration:
    position_in_flow: "{{where_in_typical_workflow}}"

    handoff_from:
      - "{{agent_id}} ({{reason}})"

    handoff_to:
      - "{{agent_id}} ({{reason}})"

  synergies:
    {{agent_id}}: "{{how_they_work_together}}"
    {{agent_id}}: "{{how_they_work_together}}"

activation:
  greeting: |
    {{activation_greeting}}
    # Should include:
    # - Identity statement
    # - Value proposition
    # - Invitation to engage
```

---

## Quality Gate Validation

Before finalizing any agent, validate against these requirements:

### Level 0: Loader (Blocking)

- [ ] `ACTIVATION-NOTICE` is present
- [ ] `IDE-FILE-RESOLUTION` has valid base_path
- [ ] `REQUEST-RESOLUTION` has examples
- [ ] `command_loader` maps ALL commands that need external files
- [ ] Each command with `loader != null` has corresponding entry in `command_loader`
- [ ] `CRITICAL_LOADER_RULE` is present verbatim
- [ ] `dependencies` lists all files referenced in command_loader

### Level 1-6: Content (Blocking)

- [ ] `operational_frameworks` has at least 1 complete framework with steps
- [ ] `voice_dna.vocabulary` has both `always_use` (5+) AND `never_use` (3+)
- [ ] `output_examples` has at least 3 complete examples
- [ ] `anti_patterns.never_do` has at least 5 items
- [ ] `completion_criteria.task_done_when` is defined
- [ ] `completion_criteria.handoff_to` has at least 1 handoff
- [ ] `integration` section is complete

### Recommended (Should Pass)

- [ ] `voice_dna.sentence_starters` has at least 5 patterns
- [ ] `voice_dna.metaphors` has at least 3 metaphors
- [ ] `voice_dna.behavioral_states` has at least 2 states
- [ ] `objection_algorithms` has at least 3 objections
- [ ] `signature_phrases` has at least 5 phrases
- [ ] Total agent file exceeds 800 lines
- [ ] Commands have `visibility` metadata for greeting generation

### Domain-Specific

**For Copy/Legal/Storytelling agents:**
- [ ] `authority_proof_arsenal` is complete
- [ ] `persona.background` has detailed history

**For Dev/Design agents:**
- [ ] Code/visual examples included in `output_examples`
- [ ] Integration patterns documented

---

## Loader Architecture Summary

```
┌─────────────────────────────────────────────────────────────────┐
│  ON ACTIVATION (@agent)                                          │
├─────────────────────────────────────────────────────────────────┤
│  1. Load ENTIRE agent file (inline content)                      │
│  2. Parse command_loader configuration                           │
│  3. Display greeting                                             │
│  4. HALT - await user command                                    │
└─────────────────────────────────────────────────────────────────┘
              │
              │ User: "*command"
              ▼
┌─────────────────────────────────────────────────────────────────┐
│  ON COMMAND EXECUTION                                            │
├─────────────────────────────────────────────────────────────────┤
│  1. LOOKUP command_loader["*command"]                            │
│  2. LOAD all files in 'requires' list                            │
│  3. OPTIONALLY load files in 'optional' list                     │
│  4. EXECUTE workflow from loaded task file                       │
│  5. Use INLINE frameworks for context, not replacement           │
└─────────────────────────────────────────────────────────────────┘
```

### Key Differences from Previous Architecture

| Aspect | Old (Copy-only) | New (Hybrid Loader) |
|--------|-----------------|---------------------|
| Loading | LLM discretion | Explicit mapping |
| Commands | Simple list | With loader reference |
| Task execution | Hope LLM reads file | MANDATORY read before execute |
| Failure mode | Silent skip | Explicit error |
| Enforcement | Instruction text | command_loader config |

---

## Usage

```bash
# When creating a new agent, reference this template:
# 1. Copy structure to new agent file
# 2. Fill all {{placeholders}} including command_loader
# 3. Ensure EVERY command with external file has loader mapping
# 4. Run quality gate checklist (including Level 0)
# 5. Only publish if all blocking requirements pass
```

---

## Example: Complete command_loader for Copywriting Agent

```yaml
command_loader:
  "*rmbc":
    description: "Full RMBC Method walkthrough"
    requires:
      - "tasks/rmbc-workflow.md"
    optional:
      - "data/research-questions.md"
      - "checklists/rmbc-checklist.md"
    output_format: "Complete copy with R-M-B-C sections"

  "*mechanism":
    description: "Mechanism discovery and creation"
    requires:
      - "tasks/create-mechanism.md"
    optional:
      - "data/mechanism-types.md"
    output_format: "Named mechanism with 5-point test"

  "*brief":
    description: "Sales letter brief creation"
    requires:
      - "tasks/create-brief.md"
      - "templates/brief-template.md"
    optional: []
    output_format: "7-section brief with bullets"

  "*review":
    description: "Review copy against RMBC principles"
    requires:
      - "checklists/rmbc-review-checklist.md"
    optional: []
    output_format: "Pass/fail with recommendations"
```
