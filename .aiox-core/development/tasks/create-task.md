---

## Execution Modes

**Choose your execution mode:**

### 1. YOLO Mode - Fast, Autonomous (0-1 prompts)
- Autonomous decision making with logging
- Minimal user interaction
- **Best for:** Simple, deterministic tasks

### 2. Interactive Mode - Balanced, Educational (5-10 prompts) **[DEFAULT]**
- Explicit decision checkpoints
- Educational explanations
- **Best for:** Learning, complex decisions

### 3. Pre-Flight Planning - Comprehensive Upfront Planning
- Task analysis phase (identify all ambiguities)
- Zero ambiguity execution
- **Best for:** Ambiguous requirements, critical work

**Parameter:** `mode` (optional, default: `interactive`)

---

## Step 0: IDS Registry Check (Advisory)

Before proceeding, check the Entity Registry for existing artifacts:

1. Extract intent keywords from user's request
2. Run `FrameworkGovernor.preCheck(intent, 'task')`
3. If REUSE match found (>=90% relevance):
   - Display match and ask user: "Existing task found. REUSE instead of creating new?"
4. If ADAPT match found (60-89%):
   - Display adaptation candidate: "Similar task exists. ADAPT instead of creating new?"
5. If CREATE (no match or user chooses):
   - Log decision with justification and proceed to Step 1
6. If IDS unavailable (timeout/error): Warn and proceed normally

**NOTE:** This step is advisory and does NOT block creation. User always has final decision.

---

## Task Definition (AIOX Task Format V1.0)

```yaml
task: createTask()
responsável: Orion (Commander)
responsavel_type: Agente
atomic_layer: Config

**Entrada:**
- campo: name
  tipo: string
  origem: User Input
  obrigatório: true
  validação: Must be non-empty, lowercase, kebab-case

- campo: options
  tipo: object
  origem: User Input
  obrigatório: false
  validação: Valid JSON object with allowed keys

- campo: force
  tipo: boolean
  origem: User Input
  obrigatório: false
  validação: Default: false

**Saída:**
- campo: created_file
  tipo: string
  destino: File system
  persistido: true

- campo: validation_report
  tipo: object
  destino: Memory
  persistido: false

- campo: success
  tipo: boolean
  destino: Return value
  persistido: false
```

---

## Pre-Conditions

**Purpose:** Validate prerequisites BEFORE task execution (blocking)

**Checklist:**

```yaml
pre-conditions:
  - [ ] Target does not already exist; required inputs provided; permissions granted
    tipo: pre-condition
    blocker: true
    validação: |
      Check target does not already exist; required inputs provided; permissions granted
    error_message: "Pre-condition failed: Target does not already exist; required inputs provided; permissions granted"
```

---

## Post-Conditions

**Purpose:** Validate execution success AFTER task completes

**Checklist:**

```yaml
post-conditions:
  - [ ] Resource created successfully; validation passed; no errors logged
    tipo: post-condition
    blocker: true
    validação: |
      Verify resource created successfully; validation passed; no errors logged
    error_message: "Post-condition failed: Resource created successfully; validation passed; no errors logged"
```

---

## Acceptance Criteria

**Purpose:** Definitive pass/fail criteria for task completion

**Checklist:**

```yaml
acceptance-criteria:
  - [ ] Resource exists and is valid; no duplicate resources created
    tipo: acceptance-criterion
    blocker: true
    validação: |
      Assert resource exists and is valid; no duplicate resources created
    error_message: "Acceptance criterion not met: Resource exists and is valid; no duplicate resources created"
```

---

## Tools

**External/shared resources used by this task:**

- **Tool:** component-generator
  - **Purpose:** Generate new components from templates
  - **Source:** .aiox-core/scripts/component-generator.js

- **Tool:** file-system
  - **Purpose:** File creation and validation
  - **Source:** Node.js fs module

---

## Scripts

**Agent-specific code for this task:**

- **Script:** create-component.js
  - **Purpose:** Component creation workflow
  - **Language:** JavaScript
  - **Location:** .aiox-core/scripts/create-component.js

---

## Error Handling

**Strategy:** abort

**Common Errors:**

1. **Error:** Resource Already Exists
   - **Cause:** Target file/resource already exists in system
   - **Resolution:** Use force flag or choose different name
   - **Recovery:** Prompt user for alternative name or force overwrite

2. **Error:** Invalid Input
   - **Cause:** Input name contains invalid characters or format
   - **Resolution:** Validate input against naming rules (kebab-case, lowercase, no special chars)
   - **Recovery:** Sanitize input or reject with clear error message

3. **Error:** Permission Denied
   - **Cause:** Insufficient permissions to create resource
   - **Resolution:** Check file system permissions, run with elevated privileges if needed
   - **Recovery:** Log error, notify user, suggest permission fix

---

## Performance

**Expected Metrics:**

```yaml
duration_expected: 2-10 min (estimated)
cost_estimated: $0.001-0.008
token_usage: ~800-2,500 tokens
```

**Optimization Notes:**
- Validate configuration early; use atomic writes; implement rollback checkpoints

---

## Metadata

```yaml
story: N/A
version: 1.0.0
dependencies:
  - N/A
tags:
  - creation
  - setup
updated_at: 2025-11-17
```

---

tools:
  - github-cli
# TODO: Create task-validation-checklist.md for validation (follow-up story needed)
# checklists:
#   - task-validation-checklist.md
---

# Create Task

## Purpose
To create a new task file that defines executable workflows for agents, with proper structure, elicitation steps, and validation.

## Prerequisites
- User authorization verified
- Task purpose clearly defined
- Understanding of task workflow requirements

## Interactive Elicitation Process

### Step 1: Task Definition
```
ELICIT: Task Basic Information

1. What agent(s) will use this task?
   Examples: "ux-design-expert", "db-sage", "dev", "pm, po, sm" (multiple)

   → If SINGLE agent: Task is agent-specific (will apply naming convention)
   → If MULTIPLE agents: Task is shared (no prefix)

2. What is the task name?

   IF agent-specific (single agent):
     → Suggested format: "{agent-id}-{action}"
     → Examples: "ux-user-research", "db-apply-migration", "dev-develop-story"
     → Validation: Must start with "{agent-id}-"

   IF shared (multiple agents):
     → Use descriptive name WITHOUT agent prefix
     → Examples: "create-doc", "execute-checklist", "manage-story-backlog"
     → Validation: Must NOT have agent-specific prefix

3. What is the primary purpose of this task?

4. What are the prerequisites for running this task?
```

**NAMING CONVENTION (CRITICAL):**
- Agent-specific tasks: `{agent-id}-{task-name}.md`
- Shared tasks: `{task-name}.md` (no prefix)
- Use component-generator.applyNamingConvention() to apply automatically

### Step 2: Task Workflow
```
ELICIT: Task Workflow Steps
1. Does this task require user interaction? (yes/no)
2. What are the main steps in this task? (numbered list)
3. What inputs does the task need?
4. What outputs does the task produce?
5. Are there decision points requiring user input?
```

### Step 3: Elicitation Requirements
```
ELICIT: Interactive Elements (if applicable)
1. What information needs to be collected from users?
2. How should prompts be structured?
3. What validation is needed for user inputs?
4. Are there default values or suggestions?
```

### Step 4: Dependencies and Integration
```
ELICIT: Task Dependencies
1. Does this task depend on other tasks?
2. What templates does it use (if any)?
3. Does it need memory layer access?
4. What files/resources does it need to access?
```

## Implementation Steps

1. **Validate Task Name**
   - Check name doesn't already exist
   - Validate format (lowercase, hyphens)
   - Ensure descriptive and clear naming

2. **Structure Task Content**
   ```markdown
   # {Task Title}
   
   ## Purpose
   {Clear description of what the task accomplishes}
   
   ## Prerequisites
   {List of requirements before task execution}
   
   ## Interactive Elicitation Process
   {If elicit=true, define all prompts and user interactions}
   
   ## Implementation Steps
   {Numbered steps for task execution}
   
   ## Validation Checklist
   {Checklist items to verify task completion}
   
   ## Error Handling
   {How to handle common errors}
   
   ## Success Output
   {What user sees on successful completion}
   ```

3. **Add Security Considerations**
   - Input validation rules
   - File access restrictions
   - Safe command execution
   - Output sanitization

4. **Create Task File**
   - Generate path: `.aiox-core/tasks/{task-name}.md`
   - Write formatted task definition
   - Ensure proper markdown structure

5. **Update Memory Layer**
   ```javascript
   await memoryClient.addMemory({
     type: 'task_created',
     name: taskName,
     path: taskPath,
     creator: currentUser,
     timestamp: new Date().toISOString(),
     metadata: {
       purpose: taskPurpose,
       agents: associatedAgents,
       interactive: hasElicitation
     }
   });
   ```

6. **Generate Usage Examples**
   - Show how to reference in agent files
   - Provide command examples
   - Document expected outputs

## Validation Checklist
- [ ] Task name is unique and valid
- [ ] Purpose clearly stated
- [ ] Steps are numbered and clear
- [ ] Elicitation prompts well-defined
- [ ] Error handling included
- [ ] Success criteria defined
- [ ] Memory layer updated

## Error Handling
- If task exists: Offer to update or create variant
- If validation fails: Show specific issues
- If dependencies missing: List required files
- If write fails: Check permissions

## Success Output
```
✅ Task '{task-name}' created successfully!
📁 Location: .aiox-core/tasks/{task-name}.md
📝 Integration example:
   dependencies:
     tasks:
       - {task-name}.md
🔗 Agents using this task: {agent-list}
``` 