---
task-id: activate-clone
name: Cognitive Clone Activation
agent: emulator
version: 1.0.0
purpose: Load and activate a cognitive clone by reading system-prompt and KB, then embodying the target personality for authentic interaction

workflow-mode: interactive
elicit: true
elicitation-type: custom

prerequisites:
  - Mind exists in squads/mmos-squad/minds/{mind_name}/ directory
  - system-prompt.md file present
  - (Optional) kb/ directory with knowledge base files

inputs:
  - name: mind_name
    type: string
    description: Name of the mind to activate (directory name, e.g., "nassim_taleb")
    required: true

  - name: version
    type: string
    description: Specific system-prompt version to load (optional, defaults to latest)
    required: false
    example: "2.3", "latest"

  - name: kb_override
    type: enum
    description: KB loading behavior override
    required: false
    options: ["auto", "force_load", "skip"]
    default: "auto"
    user_friendly: "Auto (load if <20k) / Force load all / Skip KB"

outputs:
  - path: "temp/emulator/activation-report-{mind_name}-{timestamp}.yaml"
    description: Activation metadata (tokens used, load time, KB status, fidelity)
    format: "yaml"

dependencies:
  templates:
    - clone-activation-report.yaml
  checklists:
    - clone-loading-checklist.md

validation:
  success-criteria:
    - "system-prompt.md loaded successfully"
    - "Tokens counted and validated against budget"
    - "Activation metadata displayed to user"
    - "Agent successfully embodies target personality"

  warning-conditions:
    - "KB exceeds 20k tokens (user must decide)"
    - "system-prompt.md is older than 30 days (may be outdated)"
    - "No metadata.yaml found (fidelity level unknown)"

  failure-conditions:
    - "Mind directory does not exist"
    - "system-prompt.md not found or unreadable"
    - "system-prompt.md parsing fails (invalid format)"

estimated-duration: "30-60 seconds (first load), <10 seconds (cached)"
---

# Activate Clone Task

## Purpose

Load a cognitive clone from the minds repository and activate it for direct interaction. This task handles reading the system-prompt, validating KB token budget, displaying metadata, and embodying the target personality with high fidelity.

**Performance Target:** <100ms cold activation, <50ms cached activation (future DB integration)

## When to Use This Task

**Use this task when:**
- User requests to interact with a specific mind clone
- Testing clone quality after system-prompt updates
- Demonstrating clone capabilities to stakeholders
- User invokes `*activate <mind-name>` command

**Do NOT use this task when:**
- Multi-clone modes are requested (use `dual-interaction.md` or `roundtable-session.md`)
- Fidelity testing is the goal (use `test-fidelity.md` instead)
- Just need clone metadata (use `*info` command)

## Key Activities & Instructions

### Step 1: Validate Mind Exists

**Check directory structure:**

```bash
# Expected structure
squads/mmos-squad/minds/{mind_name}/
├── system-prompt.md (REQUIRED)
├── kb/ (optional)
│   ├── fragment-001.md
│   ├── fragment-002.md
│   └── ...
├── metadata.yaml (optional but recommended)
├── artifacts/ (not used in activation)
├── sources/ (not used in activation)
└── docs/ (not used in activation)
```

**Validation steps:**

1. Check if `squads/mmos-squad/minds/{mind_name}/` directory exists
2. If NOT exists:
   - Display error: "⚠️ Mind '{mind_name}' not found in repository"
   - Suggest: "Available minds: [list directories in squads/mmos-squad/minds/]"
   - STOP activation

3. Check if `system-prompt.md` exists
4. If NOT exists:
   - Display error: "⚠️ system-prompt.md not found for {mind_name}"
   - Suggest: "This mind may not be fully configured. Check squads/mmos-squad/minds/{mind_name}/"
   - STOP activation

### Step 2: Load System Prompt

**Read system-prompt.md:**

```python
# Pseudocode for implementation
mind_path = f"squads/mmos-squad/minds/{mind_name}"
prompt_path = f"{mind_path}/system-prompt.md"

try:
    with open(prompt_path, 'r', encoding='utf-8') as f:
        system_prompt_content = f.read()
except Exception as e:
    display_error(f"Failed to read system-prompt.md: {e}")
    STOP_ACTIVATION

# Count tokens in system prompt
prompt_tokens = count_tokens(system_prompt_content)

# Parse frontmatter if exists (for version info)
if system_prompt_content.startswith('---'):
    frontmatter, content = parse_frontmatter(system_prompt_content)
    version = frontmatter.get('version', 'unknown')
    last_updated = frontmatter.get('updated_at', 'unknown')
else:
    version = 'unknown'
    last_updated = 'unknown'
```

**Token counting:**
- Use approximate token counter: `tokens ≈ len(text) / 4`
- Or use tiktoken library if available
- Store prompt_tokens for budget tracking

### Step 3: Load Metadata (Optional)

**Check for metadata.yaml:**

```python
metadata_path = f"{mind_path}/metadata.yaml"

if os.path.exists(metadata_path):
    with open(metadata_path, 'r') as f:
        metadata = yaml.safe_load(f)

    fidelity_level = metadata.get('fidelity', 'unknown')
    last_validated = metadata.get('last_validated', 'unknown')
    display_name = metadata.get('display_name', mind_name)
else:
    # No metadata, use defaults
    fidelity_level = 'unknown'
    last_validated = 'unknown'
    display_name = mind_name.replace('_', ' ').title()
```

### Step 4: Handle Knowledge Base Loading

**Check KB directory:**

```python
kb_path = f"{mind_path}/kb"
kb_loaded = False
kb_tokens = 0
kb_fragments_count = 0

if os.path.exists(kb_path) and os.path.isdir(kb_path):
    # List all .md and .txt files
    kb_files = []
    for root, dirs, files in os.walk(kb_path):
        for file in files:
            if file.endswith(('.md', '.txt')):
                kb_files.append(os.path.join(root, file))

    if kb_files:
        # Count total tokens in KB
        for kb_file in kb_files:
            with open(kb_file, 'r', encoding='utf-8') as f:
                content = f.read()
                kb_tokens += count_tokens(content)

        kb_fragments_count = len(kb_files)
```

**Apply KB loading rules:**

```python
TOKEN_LIMIT = 20000  # Default limit

if kb_override == "skip":
    kb_loaded = False
    display_message("📚 KB loading skipped (user override)")

elif kb_override == "force_load":
    # Load all KB regardless of size
    kb_loaded = True
    if kb_tokens > TOKEN_LIMIT:
        display_warning(f"⚠️ KB ({kb_tokens} tokens) exceeds limit, loaded anyway")

elif kb_override == "auto":
    if kb_tokens <= TOKEN_LIMIT:
        kb_loaded = True
        display_message(f"📚 KB loaded: {kb_fragments_count} fragments, {kb_tokens} tokens")
    else:
        # Ask user what to do
        display_warning(f"⚠️ KB exceeds 20k token limit")
        display_info(f"📊 Total KB: {kb_fragments_count} fragments - {kb_tokens} tokens ({kb_tokens/TOKEN_LIMIT*100:.0f}% of limit)")

        # Show options
        print("\nOptions:")
        print("1. Skip KB (activate with system-prompt only)")
        print("2. Load all KB (override limit)")
        print("3. Cancel activation")

        user_choice = input("\nChoice [1/2/3]: ")

        if user_choice == "1":
            kb_loaded = False
        elif user_choice == "2":
            kb_loaded = True
        else:
            display_message("Activation cancelled")
            STOP_ACTIVATION
```

**Load KB content if approved:**

```python
if kb_loaded:
    kb_content = []
    for kb_file in kb_files:
        with open(kb_file, 'r', encoding='utf-8') as f:
            content = f.read()
            kb_content.append({
                'file': os.path.basename(kb_file),
                'content': content,
                'tokens': count_tokens(content)
            })
```

### Step 5: Calculate Total Tokens and Load Time

```python
import time

start_time = time.time()

total_tokens = prompt_tokens + (kb_tokens if kb_loaded else 0)
load_time_ms = int((time.time() - start_time) * 1000)

# Validate against budget (if tracking)
TOKEN_BUDGET = 200000  # Example: Claude Sonnet budget
budget_percentage = (total_tokens / TOKEN_BUDGET) * 100
```

### Step 6: Display Activation Report

**Format activation greeting:**

```markdown
🪞 Mirror → {display_name} (v{version}) loaded

📊 System Prompt: v{version} ({last_updated}) - {prompt_tokens:,} tokens
📚 KB: {kb_status}
🎯 Fidelity: {fidelity_level} (validated {last_validated})
⚡ Load Time: {load_time_ms}ms

Total Tokens: {total_tokens:,} ({budget_percentage:.1f}% of budget)

Now embodying {display_name}. Type *help for commands.
```

**KB status formatting:**

```python
if kb_loaded:
    kb_status = f"{kb_fragments_count} fragments loaded - {kb_tokens:,} tokens ({kb_tokens/TOKEN_LIMIT*100:.0f}% of limit)"
elif kb_tokens > 0:
    kb_status = f"Not loaded ({kb_fragments_count} fragments available, {kb_tokens:,} tokens - exceeds limit)"
else:
    kb_status = "No KB available"
```

### Step 7: Embody the Persona

**Activation mode:**

```python
# Set emulator state
emulator_state = {
    'active': True,
    'mind_name': mind_name,
    'display_name': display_name,
    'version': version,
    'system_prompt': system_prompt_content,
    'kb_content': kb_content if kb_loaded else None,
    'total_tokens': total_tokens,
    'activated_at': datetime.now().isoformat()
}

# From this point forward, ALL responses must:
# 1. Adopt communication style from system-prompt
# 2. Reference KB content when relevant
# 3. Stay in character until *exit or *switch
# 4. Use clone's frameworks, vocabulary, thinking patterns

# Parse system prompt for key persona elements:
# - Communication style directives
# - Core principles
# - Frameworks to use
# - Signature phrases
# - Thinking patterns
```

**Persona embodiment guidelines:**

- **Voice & Tone:** Match the clone's distinctive communication style
- **Vocabulary:** Use signature phrases and domain-specific terminology
- **Structure:** Follow the clone's typical response patterns (e.g., lists, stories, frameworks)
- **Frameworks:** Actively apply the clone's mental models
- **Limitations:** Stay within the knowledge boundaries of loaded content
- **Authenticity:** If asked something outside loaded knowledge, admit it within persona

### Step 8: Save Activation Report

**Generate activation report:**

```yaml
# temp/emulator/activation-report-{mind_name}-{timestamp}.yaml
activation:
  mind_name: {{mind_name}}
  display_name: {{display_name}}
  version: {{version}}
  activated_at: {{timestamp}}
  activated_by: {{user_id or 'unknown'}}

loading:
  system_prompt:
    path: squads/mmos-squad/minds/{{mind_name}}/system-prompt.md
    tokens: {{prompt_tokens}}
    last_updated: {{last_updated}}

  knowledge_base:
    loaded: {{true/false}}
    fragments_count: {{kb_fragments_count}}
    total_tokens: {{kb_tokens}}
    status: {{loaded/skipped/exceeded_limit}}
    files: [{{list_of_kb_files}}]

performance:
  load_time_ms: {{load_time_ms}}
  total_tokens: {{total_tokens}}
  budget_percentage: {{budget_percentage}}

metadata:
  fidelity_level: {{fidelity_level}}
  last_validated: {{last_validated}}

status: success
```

**Save to temp directory:**

```python
import os
import yaml
from datetime import datetime

report_dir = "temp/emulator"
os.makedirs(report_dir, exist_ok=True)

timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
report_path = f"{report_dir}/activation-report-{mind_name}-{timestamp}.yaml"

with open(report_path, 'w') as f:
    yaml.dump(activation_report, f, default_flow_style=False)
```

## Example Execution

### Example 1: Successful Activation (with KB)

```bash
@emulator *activate nassim_taleb

🪞 Mirror → Nassim Nicholas Taleb (v2.3) loaded

📊 System Prompt: v2.3 (2025-10-10) - 12,450 tokens
📚 KB: 47 fragments loaded - 18,230 tokens (91% of limit)
🎯 Fidelity: 94% (validated 2025-10-10)
⚡ Load Time: 523ms

Total Tokens: 30,680 (15.3% of budget)

Now embodying Nassim Nicholas Taleb. Type *help for commands.

---

[User]: Tell me about antifragility

[Nassim]: Listen, antifragility is not merely robustness. Robust things
resist shocks and stay the same. Fragile things break under stress. But
antifragile things? They *benefit* from volatility. They gain from disorder.

Think of your muscles - they don't just resist weights, they grow stronger
from the stressor. Evolution doesn't just survive mutations, it thrives on
them. This is the opposite of fragility.

The problem with modernity is we've created systems that are seemingly
"stable" but actually extremely fragile - like banks that appear solid until
one Black Swan event destroys them. We need to build antifragile systems
that have "skin in the game" and benefit from small frequent stressors...
```

### Example 2: Activation with KB Warning

```bash
@emulator *activate ray_dalio

⚠️ KB exceeds 20k token limit

📊 Total KB: 62 fragments - 28,450 tokens (142% of limit)

Options:
1. Skip KB (activate with system-prompt only)
2. Load all KB (override limit)
3. Cancel activation

Choice [1/2/3]: 1

🪞 Mirror → Ray Dalio (v1.8) loaded

📊 System Prompt: v1.8 (2025-09-28) - 14,120 tokens
📚 KB: Not loaded (62 fragments available, 28,450 tokens - exceeds limit)
🎯 Fidelity: 92% (validated 2025-09-30)
⚡ Load Time: 312ms

Total Tokens: 14,120 (7.1% of budget)

⚠️ Note: Activated without KB. Responses may lack specific examples from sources.

Now embodying Ray Dalio. Type *help for commands.
```

### Example 3: Mind Not Found

```bash
@emulator *activate steve_jobs

⚠️ Mind 'steve_jobs' not found in repository

Available minds:
- nassim_taleb (Nassim Nicholas Taleb)
- naval_ravikant (Naval Ravikant)
- ray_dalio (Ray Dalio)
- sam_altman (Sam Altman)
- tim_ferriss (Tim Ferriss)

Tip: Use *list-minds to see all available clones
```

## Validation Checklist

Use `clone-loading-checklist.md` to validate successful activation:

- [ ] Mind directory exists and is accessible
- [ ] system-prompt.md loaded without errors
- [ ] Token count calculated correctly
- [ ] KB decision made (load/skip/override)
- [ ] Metadata extracted (fidelity, version, dates)
- [ ] Activation report displayed with all fields
- [ ] Total tokens within acceptable range
- [ ] Activation report saved to temp/
- [ ] Agent successfully embodies persona
- [ ] *help command works in embodied mode
- [ ] Clone can answer domain-specific questions
- [ ] Clone stays in character

## Error Handling

### Error: Directory Not Found

```
⚠️ Mind '{mind_name}' not found

Searched in: squads/mmos-squad/minds/{mind_name}/

Suggestions:
- Check spelling of mind name
- Use *list-minds to see available minds
- Ensure mind has been fully created via pipeline
```

### Error: system-prompt.md Missing

```
⚠️ system-prompt.md not found for {mind_name}

Path checked: squads/mmos-squad/minds/{mind_name}/system-prompt.md

This mind may be incomplete. Run pipeline to generate system-prompt:
@mind-mapper *map-mind {mind_name}
```

### Error: Invalid Format

```
⚠️ Failed to parse system-prompt.md

Error: {parsing_error_message}

The system-prompt file may be corrupted or have invalid formatting.
Check squads/mmos-squad/minds/{mind_name}/system-prompt.md for issues.
```

### Error: Token Budget Exceeded

```
⚠️ Activation would exceed token budget

System Prompt: {prompt_tokens} tokens
KB: {kb_tokens} tokens
Total: {total_tokens} tokens
Budget: {TOKEN_BUDGET} tokens (exceeded by {excess_tokens})

Cannot activate. Consider:
- Skipping KB (*activate {mind_name} --kb-override skip)
- Reducing KB size
- Increasing token budget
```

## Integration with Emulator Agent

This task is invoked by the emulator agent's `*activate` command:

```yaml
# From emulator.md
commands:
  - '*activate <mind-name>' - Load and activate a single cognitive clone
    → Executes: tasks/activate-clone.md
    → Template: clone-activation-report.yaml
    → Checklist: clone-loading-checklist.md
```

**Command variations:**

```bash
# Standard activation
*activate nassim_taleb

# Specific version
*activate nassim_taleb --version 2.1

# Skip KB
*activate nassim_taleb --kb-override skip

# Force load KB (even if >20k)
*activate nassim_taleb --kb-override force_load
```

## Performance Targets

| Metric | Target | Notes |
|--------|--------|-------|
| Cold activation (file I/O) | <1000ms | First time loading from disk |
| Warm activation (path-based) | <500ms | Already accessed recently |
| Cached activation (memory) | <50ms | Future: memory cache implementation |
| DB activation (Story 4.1) | <100ms | Future: database-first loading |

**Current implementation:**
- Uses file system I/O (path-based)
- No caching (reload every activation)
- Target: <1000ms cold, <500ms warm

**Future enhancements (Story 4.1):**
- Database queries replace file I/O
- Memory caching for frequently used clones
- Parallel KB fragment loading
- Target: <100ms cold (DB), <50ms warm (cached)

## Notes

- **Security:** All paths validated, no user input in file paths directly
- **Token counting:** Approximate (text_length / 4), exact count requires tiktoken
- **KB priority:** Future enhancement - load high-priority fragments first
- **Versioning:** Current implementation loads latest, explicit versioning in Story 4.1
- **Session management:** Clone stays active until `*exit` or `*switch`
- **Multi-clone:** This task handles single clone only, use `dual-interaction.md` for duo/roundtable

---

**Task Version:** 1.0.0
**Created:** 2025-10-14
**Agent:** emulator (Mirror - Mind Clone Activation Specialist)
