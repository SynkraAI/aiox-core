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

## Task Definition (AIOX Task Format V1.0)

```yaml
task: smCreateNextStory()
responsável: River (Facilitator)
responsavel_type: Agente
atomic_layer: Organism

**Entrada:**
- campo: task
  tipo: string
  origem: User Input
  obrigatório: true
  validação: Must be registered task

- campo: parameters
  tipo: object
  origem: User Input
  obrigatório: false
  validação: Valid task parameters

- campo: mode
  tipo: string
  origem: User Input
  obrigatório: false
  validação: yolo|interactive|pre-flight

**Saída:**
- campo: execution_result
  tipo: object
  destino: Memory
  persistido: false

- campo: logs
  tipo: array
  destino: File (.ai/logs/*)
  persistido: true

- campo: state
  tipo: object
  destino: State management
  persistido: true
```

---

## Pre-Conditions

**Purpose:** Validate prerequisites BEFORE task execution (blocking)

**Checklist:**

```yaml
pre-conditions:
  - [ ] Task is registered; required parameters provided; dependencies met
    tipo: pre-condition
    blocker: true
    validação: |
      Check task is registered; required parameters provided; dependencies met
    error_message: "Pre-condition failed: Task is registered; required parameters provided; dependencies met"
```

---

## Post-Conditions

**Purpose:** Validate execution success AFTER task completes

**Checklist:**

```yaml
post-conditions:
  - [ ] Task completed; exit code 0; expected outputs created
    tipo: post-condition
    blocker: true
    validação: |
      Verify task completed; exit code 0; expected outputs created
    error_message: "Post-condition failed: Task completed; exit code 0; expected outputs created"
```

---

## Acceptance Criteria

**Purpose:** Definitive pass/fail criteria for task completion

**Checklist:**

```yaml
acceptance-criteria:
  - [ ] Task completed as expected; side effects documented
    tipo: acceptance-criterion
    blocker: true
    validação: |
      Assert task completed as expected; side effects documented
    error_message: "Acceptance criterion not met: Task completed as expected; side effects documented"
```

---

## Tools

**External/shared resources used by this task:**

- **Tool:** task-runner
  - **Purpose:** Task execution and orchestration
  - **Source:** .aiox-core/core/task-runner.js

- **Tool:** logger
  - **Purpose:** Execution logging and error tracking
  - **Source:** .aiox-core/utils/logger.js

---

## Scripts

**Agent-specific code for this task:**

- **Script:** execute-task.js
  - **Purpose:** Generic task execution wrapper
  - **Language:** JavaScript
  - **Location:** .aiox-core/scripts/execute-task.js

---

## Error Handling

**Strategy:** retry

**Common Errors:**

1. **Error:** Task Not Found
   - **Cause:** Specified task not registered in system
   - **Resolution:** Verify task name and registration
   - **Recovery:** List available tasks, suggest similar

2. **Error:** Invalid Parameters
   - **Cause:** Task parameters do not match expected schema
   - **Resolution:** Validate parameters against task definition
   - **Recovery:** Provide parameter template, reject execution

3. **Error:** Execution Timeout
   - **Cause:** Task exceeds maximum execution time
   - **Resolution:** Optimize task or increase timeout
   - **Recovery:** Kill task, cleanup resources, log state

---

## Performance

**Expected Metrics:**

```yaml
duration_expected: 5-15 min (estimated)
cost_estimated: $0.003-0.010
token_usage: ~3,000-10,000 tokens
```

**Optimization Notes:**
- Break into smaller workflows; implement checkpointing; use async processing where possible

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
  - github-cli        # Access repository structure and previous stories
  - context7          # Look up documentation for technical requirements
  - clickup           # Manage story metadata and tracking
checklists:
  - po-master-checklist.md
---

# Create Next Story Task

## Purpose

To identify the next logical story based on project progress and epic definitions, and then to prepare a comprehensive, self-contained, and actionable story file using the `Story Template`. This task ensures the story is enriched with all necessary technical context, requirements, and acceptance criteria, making it ready for efficient implementation by a Developer Agent with minimal need for additional research or finding its own context.

## SEQUENTIAL Task Execution (Do not proceed until current Task is complete)

### 0. Load Core Configuration and Check Workflow

- Load `aiox-core/core-config.yaml` from the project root
- If the file does not exist, HALT and inform the user: "core-config.yaml not found. This file is required for story creation. You can either: 1) Copy it from GITHUB aiox-core/core-config.yaml and configure it for your project OR 2) Run the AIOX installer against your project to upgrade and add the file automatically. Please add and configure core-config.yaml before proceeding."
- Extract key configurations: `devStoryLocation`, `prd.*`, `architecture.*`, `workflow.*`

### 1. Identify Next Story for Preparation

#### 1.1 Locate Epic Files and Review Existing Stories

- **Refer to tools/cli/github-cli.yaml** for repository navigation commands and file listing operations
- Consult the examples section for branch and file structure inspection patterns
- Based on `prdSharded` from config, locate epic files (sharded location/pattern or monolithic PRD sections)
- If `devStoryLocation` has story files, load the highest `{epicNum}.{storyNum}.story.md` file
- **If highest story exists:**
  - Verify status is 'Done'. If not, alert user: "ALERT: Found incomplete story! File: {lastEpicNum}.{lastStoryNum}.story.md Status: [current status] You should fix this story first, but would you like to accept risk & override to create the next story in draft?"
  - If proceeding, select next sequential story in the current epic
  - If epic is complete, prompt user: "Epic {epicNum} Complete: All stories in Epic {epicNum} have been completed. Would you like to: 1) Begin Epic {epicNum + 1} with story 1 2) Select a specific story to work on 3) Cancel story creation"
  - **CRITICAL**: NEVER automatically skip to another epic. User MUST explicitly instruct which story to create.
- **If no story files exist:** The next story is ALWAYS 1.1 (first story of first epic)
- Announce the identified story to the user: "Identified next story for preparation: {epicNum}.{storyNum} - {Story Title}"

### 2. Gather Story Requirements and Previous Story Context

- Extract story requirements from the identified epic file
- If previous story exists, review Dev Agent Record sections for:
  - Completion Notes and Debug Log References
  - Implementation deviations and technical decisions
  - Challenges encountered and lessons learned
- Extract relevant insights that inform the current story's preparation

### 3. Gather Architecture Context

#### 3.1 Determine Architecture Reading Strategy

- **Refer to tools/mcp/context7.yaml** for library documentation lookup and technical context research
- Consult the examples section for querying library-specific documentation patterns
- **If `architectureVersion: >= v4` and `architectureSharded: true`**: Read `{architectureShardedLocation}/index.md` then follow structured reading order below
- **Else**: Use monolithic `architectureFile` for similar sections

#### 3.2 Read Architecture Documents Based on Story Type

**CRITICAL: File Fallback Strategy**

When attempting to read architecture files, use this fallback order:
1. Try primary filename (e.g., `tech-stack.md`)
2. If not found, try fallback alternatives from `devLoadAlwaysFilesFallback` in core-config.yaml
3. If still not found, check for Portuguese equivalents
4. If none exist, note the missing file in Dev Notes

**Common Fallback Mappings:**
```yaml
tech-stack.md → [technology-stack.md, pilha-tecnologica.md, stack.md]
coding-standards.md → [code-standards.md, padroes-de-codigo.md, standards.md]
source-tree.md → [project-structure.md, unified-project-structure.md, arvore-de-origem.md, directory-structure.md]
testing-strategy.md → [test-strategy.md, estrategia-de-testes.md]
database-schema.md → [db-schema.md, esquema.md, schema.md]
```

**For ALL Stories (try in fallback order):**
- tech-stack.md
- unified-project-structure.md (or project-structure.md, source-tree.md)
- coding-standards.md
- testing-strategy.md

**For Backend/API Stories, additionally:**
- data-models.md
- database-schema.md
- backend-architecture.md
- rest-api-spec.md (or api-spec.md, api-design.md)
- external-apis.md

**For Frontend/UI Stories, additionally:**
- frontend-architecture.md
- components.md
- core-workflows.md (or workflows.md, user-flows.md)
- data-models.md

**For Full-Stack Stories:** Read both Backend and Frontend sections above

**Important:** When a fallback file is used, note it in Dev Notes:
```
[Note: Using fallback file 'pilha-tecnologica.md' instead of 'tech-stack.md']
```

#### 3.3 Extract Story-Specific Technical Details

Extract ONLY information directly relevant to implementing the current story. Do NOT invent new libraries, patterns, or standards not in the source documents.

Extract:

- Specific data models, schemas, or structures the story will use
- API endpoints the story must implement or consume
- Component specifications for UI elements in the story
- File paths and naming conventions for new code
- Testing requirements specific to the story's features
- Security or performance considerations affecting the story

ALWAYS cite source documents: `[Source: architecture/{filename}.md#{section}]`

### 4. Verify Project Structure Alignment

- Cross-reference story requirements with Project Structure Guide from `docs/architecture/unified-project-structure.md`
- Ensure file paths, component locations, or module names align with defined structures
- Document any structural conflicts in "Project Structure Notes" section within the story draft

### 5. Populate Story Template with Full Context

#### 5.1 Get Workspace Structure and Verify Epic

- **Refer to tools/mcp/clickup.yaml** - Review the 'story_creation_workflow' example for complete step-by-step guidance
- **Step 1: Get Workspace Hierarchy**
  - Call `get_workspace_hierarchy` (no parameters needed)
  - Extract the Backlog list ID from response:
    ```javascript
    // Response structure:
    {
      "spaces": [{
        "lists": [{
          "name": "Backlog",
          "id": "901317181013"  // ← Extract this numeric list_id
        }]
      }]
    }
    ```
  - **CRITICAL:** Store this numeric list_id for use in Step 5.3
  - Log: "✅ Found Backlog list (list_id: {backlog_list_id})"

- **Step 2: Search for Epic in Backlog**
  - Use `get_workspace_tasks` with parameters:
    - list_ids: [{backlog_list_id}]  # From Step 1
    - tags: ["epic-{epicNum}"]
    - status: ["Planning", "In Progress"]

- **If Epic NOT found:**
  - HALT execution
  - Display error: "❌ Epic {epicNum} not found in ClickUp Backlog list.
    Please create Epic task with:
    - Name: 'Epic {epicNum}: {Epic Title}'
    - List: Backlog (list_id: {backlog_list_id})
    - Tags: ['epic', 'epic-{epicNum}']
    - Status: Planning or In Progress
    Then retry story creation."

- **If Epic found:**
  - Capture epic_task_id for parent relationship
  - Log: "✅ Found Epic {epicNum} (task_id: {epic_task_id})"

#### 5.2 Prepare Story File and Metadata

- **Refer to tools/mcp/clickup.yaml** for create_task parameters and validation requirements when creating story tracking tasks
- Use validator 'validate-create-task' to check assignee format (must be array)
- Consult the examples section for custom_field format patterns
- Note the API complexity section regarding assignee format mismatch between create and update operations
- Create new story file: `{devStoryLocation}/{epicNum}.{storyNum}.story.md` using Story Template
- Fill in basic story information: Title, Status (Draft), Story statement, Acceptance Criteria from Epic

##### 5.2.1 Prepare ClickUp Metadata for Frontmatter

- Prepare ClickUp section structure (will be populated after ClickUp task creation):
  ```yaml
  clickup:
    task_id: ""  # To be filled
    epic_task_id: "{epic_task_id from 5.1}"
    list: "Backlog"
    url: ""  # To be filled
    last_sync: ""  # To be filled
  ```

#### 5.3 Create Story Task in ClickUp

- **Refer to tools/mcp/clickup.yaml** - Review the 'story_creation_workflow' example for complete parameter reference
- **CRITICAL:** Use validator 'validate-create-task' to prevent format errors
- **CRITICAL:** Use numeric list_id from Step 5.1, NOT a list name string

**Task Creation Parameters:**
```yaml
list_id: "{backlog_list_id}"  # MUST be numeric string from 5.1 (e.g., "901317181013")
name: "Story {epicNum}.{storyNum}: {Story Title}"
parent: "{epic_task_id}"  # Creates as subtask of Epic (from 5.1)
markdown_description: "{entire story .md file content}"
tags:
  - "story"
  - "epic-{epicNum}"
  - "story-{epicNum}.{storyNum}"
custom_fields:
  - id: "epic_number"
    value: {epicNum}
  - id: "story_number"
    value: "{epicNum}.{storyNum}"
  - id: "story_file_path"
    value: "{devStoryLocation}/{epicNum}.{storyNum}.story.md"
  - id: "story-status"
    value: "Draft"
```

**Validation Notes:**
- list_id MUST be numeric string (validated by /^\d+$/)
- Using "Backlog" or other non-numeric values will fail validation
- assignees (if provided) must be array, not object

**Response Handling:**
- **Capture:** story_task_id from response
- **Log:** "✅ Story task created in ClickUp: {story_task_id}"

**Error Handling:**
- If create_task fails with validation error, display the exact error and parameters used
- If API error occurs, log error but continue (local story still valid)
- Warn user: "⚠️ Story created locally but ClickUp sync failed: {error_message}"

#### 5.4 Update Story Frontmatter with ClickUp Data

- Update the frontmatter YAML clickup section with captured values:
  ```yaml
  clickup:
    task_id: "{story_task_id from 5.3}"
    epic_task_id: "{epic_task_id from 5.1}"
    list: "Backlog"
    url: "https://app.clickup.com/t/{story_task_id}"
    last_sync: "{current ISO 8601 timestamp}"
  ```
- Save story file with updated frontmatter
- Log: "✅ Story task created in ClickUp: {story_task_id}"

- **`Dev Notes` section (CRITICAL):**
  - CRITICAL: This section MUST contain ONLY information extracted from architecture documents. NEVER invent or assume technical details.
  - Include ALL relevant technical details from Steps 2-3, organized by category:
    - **Previous Story Insights**: Key learnings from previous story
    - **Data Models**: Specific schemas, validation rules, relationships [with source references]
    - **API Specifications**: Endpoint details, request/response formats, auth requirements [with source references]
    - **Component Specifications**: UI component details, props, state management [with source references]
    - **File Locations**: Exact paths where new code should be created based on project structure
    - **Testing Requirements**: Specific test cases or strategies from testing-strategy.md
    - **Technical Constraints**: Version requirements, performance considerations, security rules
  - Every technical detail MUST include its source reference: `[Source: architecture/{filename}.md#{section}]`
  - If information for a category is not found in the architecture docs, explicitly state: "No specific guidance found in architecture docs"
- **`Tasks / Subtasks` section:**
  - Generate detailed, sequential list of technical tasks based ONLY on: Epic Requirements, Story AC, Reviewed Architecture Information
  - Each task must reference relevant architecture documentation
  - Include unit testing as explicit subtasks based on the Testing Strategy
  - Link tasks to ACs where applicable (e.g., `Task 1 (AC: 1, 3)`)
- Add notes on project structure alignment or discrepancies found in Step 4

### 6. Story Draft Completion and Review

- **Refer to tools/mcp/clickup.yaml** for update_task and get_task operations when managing story status and metadata
- Consult the validation requirements section before updating task status
- Review all sections for completeness and accuracy
- Verify all source references are included for technical details
- Ensure tasks align with both epic requirements and architecture constraints
- Update status to "Draft" and save the story file
- Execute `aiox-core/tasks/execute-checklist` `aiox-core/checklists/story-draft-checklist`
- Provide summary to user including:
  - Story created: `{devStoryLocation}/{epicNum}.{storyNum}.story.md`
  - Status: Draft
  - Key technical components included from architecture docs
  - Any deviations or conflicts noted between epic and architecture
  - Checklist Results
  - Next steps: For Complex stories, suggest the user carefully review the story draft and also optionally have the PO run the task `aiox-core/tasks/validate-next-story`

**ClickUp Integration Note:** This task now includes Epic verification (Section 5.1), ClickUp story task creation (Section 5.3), and automatic frontmatter updates (Section 5.4). Stories are created as subtasks of their parent Epic in ClickUp's Backlog list. If Epic verification or ClickUp sync fails, the story file will still be created locally with a warning message.
