# /install-commands Task

When this command is used, execute the following task:

# Install Squad Commands

## Purpose

To convert squad agents into Claude Code commands and install them in the `.claude/commands/` directory, making the squad agents accessible via the `@{squad}:{agent}` syntax in all supported IDEs.

## Inputs

- Squad name (from user or discovery)
- Squad path: `squads/{pack_name}/`
- Existing squad structure:
  - `config.yaml` - Pack metadata
  - `agents/` - Agent definitions (markdown)
  - `tasks/` - Task workflows (markdown)
  - `templates/` - Output templates

## Key Activities & Instructions

### 1. Validate Squad Exists

**Ask user for pack name if not provided:**
```
Which squad would you like to install?
Available packs: [list directories in squads/]
```

**Check pack structure:**
- Verify `squads/{pack_name}/config.yaml` exists
- Verify `squads/{pack_name}/agents/` directory exists
- Load `config.yaml` to get:
  - `name` - Pack identifier
  - `slashPrefix` - Command prefix (e.g., "legalAssistant")
  - `version` - Pack version

**Validation output:**
```
✅ Found squad: {name} v{version}
   Slash prefix: @{slashPrefix}:
   Agents found: {count}
```

**If validation fails:**
- Report missing components
- Ask user if they want to create the squad first using `*create-squad`
- STOP execution

### 2. Create Command Directory Structure

**Create directories:**
```
.claude/commands/{slashPrefix}/
├── agents/          # Converted agent commands
└── tasks/           # Symlink or copy of tasks/
```

**Execution:**
- Use mkdir to create `.claude/commands/{slashPrefix}/`
- Use mkdir to create `.claude/commands/{slashPrefix}/agents/`
- Use mkdir to create `.claude/commands/{slashPrefix}/tasks/`

**Confirmation:**
```
✅ Created command structure: .claude/commands/{slashPrefix}/
```

### 3. Convert Each Agent to Claude Code Format

**For each file in `squads/{pack_name}/agents/*.md`:**

**Step 3.1: Read source agent file**
- Parse agent metadata (lines 1-6):
  - Extract: name (# header)
  - Extract: role (from **Role**:)
  - Extract: squad reference
- Parse sections:
  - ## Persona (extract all subsections)
  - ## Commands (extract command list)
  - ## Tasks (extract task references)
  - ## Templates (extract template references)
  - ## Activation (extract activation command)

**Step 3.2: Generate Claude Code command file**

**Template structure:**
```markdown
# /{slashPrefix}:{agent-id} Command

When this command is used, adopt the following agent persona:

# {agent-id}

ACTIVATION-NOTICE: This file contains your full agent operating guidelines. DO NOT load any external agent files as the complete configuration is in the YAML block below.

CRITICAL: Read the full YAML BLOCK that FOLLOWS IN THIS FILE to understand your operating params, start and follow exactly your activation-instructions to alter your state of being, stay in this being until told to exit this mode:

## COMPLETE AGENT DEFINITION FOLLOWS - NO EXTERNAL FILES NEEDED

```yaml
IDE-FILE-RESOLUTION:
  - FOR LATER USE ONLY - NOT FOR ACTIVATION, when executing commands that reference dependencies
  - Dependencies map to squads/{pack_name}/{type}/{name}
  - type=folder (tasks|templates|checklists|data|utils|etc...), name=file-name
  - Example: {task}.md → squads/{pack_name}/tasks/{task}.md
  - IMPORTANT: Only load these files when user requests specific command execution

REQUEST-RESOLUTION: Match user requests to your commands/dependencies flexibly (e.g., "install legal"→*install-commands→install-commands task), ALWAYS ask for clarification if no clear match.

activation-instructions:
  - STEP 1: Read THIS ENTIRE FILE - it contains your complete persona definition
  - STEP 2: Adopt the persona defined in the 'agent' and 'persona' sections below
  - STEP 3: Greet user with: "👋 I am {Agent Name}. {Role description}. Type `*help` to see what I can do."
  - DO NOT: Load any other agent files during activation
  - ONLY load dependency files when user selects them for execution via command
  - The agent.customization field ALWAYS takes precedence over any conflicting instructions
  - CRITICAL WORKFLOW RULE: When executing tasks from dependencies, follow task instructions exactly as written - they are executable workflows
  - MANDATORY INTERACTION RULE: Tasks with elicit=true require user interaction using exact specified format
  - When listing tasks/templates or presenting options during conversations, always show as numbered options list
  - STAY IN CHARACTER!
  - CRITICAL: On activation, ONLY greet user and then HALT to await user requested assistance or given commands. ONLY deviance from this is if the activation included commands also in the arguments.

agent:
  name: {Agent Name}
  id: {agent-id}
  title: {Agent Title/Role}
  icon: {emoji} # Choose appropriate emoji based on role
  squad: {pack_name}
  whenToUse: {When to use this agent - extract from persona/focus}
  customization: null

persona:
  role: {Extract from ## Persona > ### Role}
  style: {Extract from ## Persona > ### Style - comma separated}
  identity: {Extract from ## Persona - summarize}
  focus: {Extract from ## Persona > ### Focus}

core_principles:
  {Extract from ## Persona > ### Expertise - convert to principles}
  - {principle 1}
  - {principle 2}
  - {principle 3}

commands:
  {Extract from ## Commands - convert to numbered list}
  - '*help' - Show numbered list of available commands
  - '{command}' - {description} (→ tasks/{task-file}.md)
  - '*exit' - Say goodbye and deactivate persona

dependencies:
  tasks:
    {Extract from ## Tasks section}
    - {task-file}.md: {purpose/description}
  templates:
    {Extract from ## Templates section}
    - {template-file}.yaml: {purpose}
  checklists: []
  knowledge: []

integration_points:
  inputs:
    {Extract from ## Integration Points > ### Inputs}
    - {input description}
  outputs:
    {Extract from ## Integration Points > ### Outputs}
    - {output description}
  handoff_to:
    {Extract from ## Integration Points > ### Handoff To}
    - {next agent or process}
```
```

**Key conversion rules:**
1. **Agent ID**: Convert filename to kebab-case (e.g., `process-mapper.md` → `process-mapper`)
2. **Emoji selection**: Based on role:
   - Discovery/Mapping → 🗺️
   - Architecture/Design → 🏗️
   - Execution/Implementation → ⚙️
   - Quality/Validation → ✅
   - Documentation → 📝
3. **Commands**: Extract all `*command-name` from ## Commands section
4. **Task references**: Convert relative paths to absolute:
   - `tasks/{task-name}.md` → `squads/{pack_name}/tasks/{task-name}.md`
5. **Preserve**: All persona details, expertise, style, focus

**Step 3.3: Write converted command**
- Target path: `.claude/commands/{slashPrefix}/agents/{agent-id}.md`
- Use Write tool to create file
- Confirm creation: `✅ Converted: {agent-id}`

### 4. Copy Task References

**For each task in `squads/{pack_name}/tasks/*.md`:**

**Option A: Symlink (Unix/Linux/Mac)**
```bash
ln -s "$(pwd)/squads/{pack_name}/tasks/{task}.md" ".claude/commands/{slashPrefix}/tasks/{task}.md"
```

**Option B: Copy (Windows/Universal)**
```bash
cp "squads/{pack_name}/tasks/{task}.md" ".claude/commands/{slashPrefix}/tasks/{task}.md"
```

**Execution:**
- Detect OS (use `process.platform` or `uname`)
- Use symlink on Unix-like systems
- Use copy on Windows
- Track copied/linked files

**Confirmation:**
```
✅ Installed {count} task workflows
```

### 5. Generate Installation Summary

**Create `.claude/commands/{slashPrefix}/README.md`:**
```markdown
# {Pack Name} - Installed Commands

**Version**: {version}
**Installed**: {timestamp}

## Available Agents

{For each agent:}
- `@{slashPrefix}:{agent-id}` - {agent title/role}

## Usage

### Activate an agent:
\```
@{slashPrefix}:{agent-id}
\```

### Example workflows:
{Extract example from pack README or provide generic}

## Documentation

- **Pack README**: `squads/{pack_name}/README.md`
- **User Guide**: `squads/{pack_name}/GUIA-DO-USUARIO.md` (if exists)
- **Agent Details**: `squads/{pack_name}/agents/`
- **Task Workflows**: `squads/{pack_name}/tasks/`

## Uninstall

To remove this squad:
\```bash
rm -rf .claude/commands/{slashPrefix}
\```
```

**Confirmation:**
```
📋 Installation summary: .claude/commands/{slashPrefix}/README.md
```

### 6. Final Validation

**Run validation checks:**
1. Verify all agents converted: `ls .claude/commands/{slashPrefix}/agents/*.md`
2. Count files:
   - Source agents: `ls squads/{pack_name}/agents/*.md | wc -l`
   - Installed commands: `ls .claude/commands/{slashPrefix}/agents/*.md | wc -l`
3. Validate YAML syntax in each converted file (basic check for ```yaml blocks)

**If counts don't match:**
- Report which agents failed to convert
- Provide error details
- Suggest manual review

**Success output:**
```
✅ INSTALLATION COMPLETE

Squad: {pack_name} v{version}
Agents installed: {count}
Commands available:

{For each agent:}
  @{slashPrefix}:{agent-id} - {description}

🚀 You can now activate any agent using @{slashPrefix}:{agent-id}

Try it:
  @{slashPrefix}:{first-agent-id}
  *help
```

## Outputs

**Files created:**
- `.claude/commands/{slashPrefix}/agents/*.md` - Converted agent commands (1 per agent)
- `.claude/commands/{slashPrefix}/tasks/*.md` - Task workflows (copied/symlinked)
- `.claude/commands/{slashPrefix}/README.md` - Installation summary

**Terminal output:**
- Installation progress log
- Success confirmation with usage examples
- List of all available commands

**Error conditions:**
- Squad not found → Suggest `*create-squad`
- Invalid config.yaml → Report YAML errors
- Agent conversion failure → Report which agent and why
- Disk space issues → Report and suggest cleanup

## Next Steps

**Suggest to user:**
1. **Test the installation:**
   ```
   Try activating: @{slashPrefix}:{first-agent}
   ```

2. **Read the documentation:**
   ```
   Check: squads/{pack_name}/README.md
   ```

3. **Start using:**
   ```
   {Provide example workflow from pack}
   ```

4. **Share with team:**
   - Commit `.claude/commands/{slashPrefix}/` to git if team-shared
   - Or keep in `.gitignore` if personal installation

## Error Handling

**Common errors and solutions:**

### Error: "Squad not found"
```
Solution: Check pack name
Command: ls squads/
```

### Error: "config.yaml missing"
```
Solution: Pack incomplete, create config.yaml
Command: *create-squad
```

### Error: "Agent conversion failed"
```
Cause: Malformed agent markdown
Solution: Review agent file structure, fix sections
Reference: squad-architect/templates/agent-tmpl.md
```

### Error: "Permission denied"
```
Cause: Write permissions on .claude/commands/
Solution: Check directory permissions
Command: chmod +w .claude/commands/
```

---

**Task Version**: 1.0.0
**Last Updated**: 2025-10-06
**Squad**: squad-architect
