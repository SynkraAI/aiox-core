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

## Task Definition (AIOS Task Format V1.0)

```yaml
task: createNextStory()
responsável: River (Facilitator)
responsavel_type: Agente
atomic_layer: Organism

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
  - **Source:** .aios-core/scripts/component-generator.js

- **Tool:** file-system
  - **Purpose:** File creation and validation
  - **Source:** Node.js fs module

---

## Scripts

**Agent-specific code for this task:**

- **Script:** create-component.js
  - **Purpose:** Component creation workflow
  - **Language:** JavaScript
  - **Location:** .aios-core/scripts/create-component.js

---

## Error Handling

**Strategy:** retry

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

- Load `aios-core/core-config.yaml` from the project root
- If the file does not exist, HALT and inform the user: "core-config.yaml not found. This file is required for story creation. You can either: 1) Copy it from GITHUB aios-core/core-config.yaml and configure it for your project OR 2) Run the AIOS installer against your project to upgrade and add the file automatically. Please add and configure core-config.yaml before proceeding."
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

### 1.2 Code Intelligence: Duplicate Detection & File Suggestions (Auto-skip if unavailable)

- **Check code intelligence availability:** Call `isCodeIntelAvailable()` from `.aios-core/core/code-intel`
- **If available:**
  - Call `detectDuplicateStory(storyDescription)` from `.aios-core/core/code-intel/helpers/story-helper`
    - If matches found: Display advisory warning to user — "Similar functionality found: {warning}". This is **advisory only** and does NOT block story creation.
  - Call `suggestRelevantFiles(storyDescription)` from `.aios-core/core/code-intel/helpers/story-helper`
    - If files found: Pre-populate a "Suggested Files" note in the Dev Notes section with the relevant file references
- **If NOT available:** Skip this step silently — story creation proceeds exactly as before

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
4. If none exist, note the 
## Configuration Dependencies

This task requires the following configuration keys from `core-config.yaml`:

- **`qaLocation`**: QA output directory (typically docs/qa) - Required to write quality reports

**Loading Config:**
```javascript
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '../../.aios-core/core-config.yaml');
const config = yaml.load(fs.readFileSync(configPath, 'utf8'));

const qaLocation = config.qa?.qaLocation || 'docs/qa';
```

missing file in Dev Notes

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

#### 5.2.5 Predict Specialized Agents and CodeRabbit Tasks

**CONDITIONAL STEP** - Check `coderabbit_integration.enabled` in core-config.yaml

```yaml
# core-config.yaml check
coderabbit_integration:
  enabled: true|false  # ← This controls whether to populate CodeRabbit section
```

**IF `coderabbit_integration.enabled: false`:**
- SKIP this entire step (5.2.5)
- In the story file, render only the skip notice in the CodeRabbit Integration section:
  ```markdown
  ## 🤖 CodeRabbit Integration

  > **CodeRabbit Integration**: Disabled
  >
  > CodeRabbit CLI is not enabled in `core-config.yaml`.
  > Quality validation will use manual review process only.
  > To enable, set `coderabbit_integration.enabled: true` in core-config.yaml
  ```
- Log: "ℹ️ CodeRabbit Integration disabled - skipping quality gate configuration"
- Proceed to Step 5.3

**IF `coderabbit_integration.enabled: true`:**
- Continue with full CodeRabbit section population below
- Include self-healing configuration based on Story 6.3.3

---

**CRITICAL:** This step populates the `🤖 CodeRabbit Integration` section created by the story template. Use the architecture context gathered in Step 3 and story requirements from Step 2 to predict which specialized agents and quality gates are needed.

**Story Type Detection Rules:**

Analyze the story's technical characteristics based on:
- Acceptance Criteria keywords
- Architecture files referenced in Step 3.2
- Data models, APIs, or components mentioned in epic
- File locations and affected systems

**Type 1: Database Story**

**Detection Indicators:**
- References to `database-schema.md` or `data-models.md`
- Acceptance Criteria mention: schema, table, migration, RLS, foreign key, index
- File locations include `supabase/migrations/` or database-related paths

**Assignment:**
- **Primary Agents**: @db-sage, @dev
- **Quality Gates**: Pre-Commit (schema validation), Pre-PR (SQL review)
- **Focus Areas**:
  - Service filters: `.eq('service', 'ttcx')` on ALL queries
  - Schema compliance: Foreign keys, indexes, constraints properly defined
  - RLS policies: Row-level security configured and tested
  - Migration safety: Reversible, tested in dev environment

**Type 2: API Story**

**Detection Indicators:**
- References to `rest-api-spec.md` or `backend-architecture.md`
- Acceptance Criteria mention: endpoint, API, service, controller, route
- File locations include `api/src/` or backend paths

**Assignment:**
- **Primary Agents**: @dev, @architect (if new patterns)
- **Quality Gates**: Pre-Commit (security scan), Pre-PR (API contract validation)
- **Focus Areas**:
  - Error handling: Try-catch blocks, proper error responses (4xx, 5xx)
  - Security: Input validation, authentication, authorization checks
  - Validation: Request/response schema validation
  - API contracts: Consistent with `rest-api-spec.md`

**Type 3: Frontend Story**

**Detection Indicators:**
- References to `frontend-architecture.md` or `components.md`
- Acceptance Criteria mention: UI, component, page, form, display, user interface
- File locations include `src/components/` or frontend paths

**Assignment:**
- **Primary Agents**: @ux-expert, @dev
- **Quality Gates**: Pre-Commit (a11y validation), Pre-PR (UX consistency check)
- **Focus Areas**:
  - Accessibility: WCAG 2.1 AA compliance (semantic HTML, ARIA labels, keyboard navigation)
  - Performance: Component optimization, lazy loading, code splitting
  - Responsive design: Mobile-first approach, breakpoints tested
  - UX consistency: Follows design system patterns

**Type 4: Deployment/Infrastructure Story**

**Detection Indicators:**
- Acceptance Criteria mention: deploy, CI/CD, environment, configuration, infrastructure
- References to deployment pipelines or environment configuration
- File locations include `.github/workflows/`, `docker/`, or config files

**Assignment:**
- **Primary Agents**: @github-devops, @dev
- **Quality Gates**: Pre-Commit (config validation), Pre-Deployment (deep scan)
- **Focus Areas**:
  - CI/CD: Pipeline configuration, test coverage enforcement
  - Secrets management: No hardcoded credentials, proper secret handling
  - Environment config: Proper variable usage, validation of required vars
  - Rollback readiness: Changes are reversible, documented rollback procedure

**Type 5: Security Story**

**Detection Indicators:**
- Acceptance Criteria mention: authentication, authorization, security, encryption, vulnerability
- References to security patterns or threat models
- Implements OWASP-related features

**Assignment:**
- **Primary Agents**: @dev, @architect
- **Quality Gates**: Pre-Commit (SAST scan), Pre-PR (security review)
- **Focus Areas**:
  - OWASP Top 10: Injection prevention, XSS protection, auth vulnerabilities
  - Timing attacks: Constant-time comparisons for sensitive operations
  - Data protection: Encryption at rest/transit, proper sanitization
  - Authentication: Secure session management, password handling

**Type 6: Architecture Story**

**Detection Indicators:**
- Acceptance Criteria mention: refactor, pattern, architecture, scalability
- Affects multiple layers or introduces new patterns
- References to `backend-architecture.md` or system design

**Assignment:**
- **Primary Agents**: @architect, @dev
- **Quality Gates**: Pre-Commit (pattern validation), Pre-PR (architecture review)
- **Focus Areas**:
  - Patterns: Follows established architectural patterns
  - Scalability: Performance considerations, load handling
  - Maintainability: Code organization, separation of concerns
  - Backward compatibility: Existing functionality preserved

**Type 7: Integration Story**

**Detection Indicators:**
- Acceptance Criteria mention: integration, external API, webhook, third-party
- References to `external-apis.md`
- Connects to external systems

**Assignment:**
- **Primary Agents**: @dev, @architect, @github-devops
- **Quality Gates**: Pre-Commit, Pre-PR (integration safety)
- **Focus Areas**:
  - Backward compatibility: Existing integrations unaffected
  - API contracts: Proper versioning, contract testing
  - Error handling: Graceful degradation, retry logic
  - Documentation: Integration points clearly documented

**Populate CodeRabbit Integration Section:**

Based on the detected story type(s), populate the template fields:

```yaml
🤖 CodeRabbit Integration:

  Story Type Analysis:
    Primary Type: [Database|API|Frontend|Deployment|Security|Architecture|Integration]
    Secondary Type(s): [Additional types if story spans multiple areas]
    Complexity: [Low|Medium|High] - Based on number of systems affected and scope

  Specialized Agent Assignment:
    Primary Agents:
      - @dev (always required for pre-commit reviews)
      - @[type-specific-agent] (from detection rules above)

    Supporting Agents:
      - @[supporting-agent-1] (if cross-cutting concerns)
      - @[supporting-agent-2] (if multiple systems affected)

  Quality Gate Tasks:
    - [ ] Pre-Commit (@dev): Run `coderabbit --prompt-only -t uncommitted` before marking story complete
    - [ ] Pre-PR (@github-devops): Run `coderabbit --prompt-only --base main` before creating pull request
    - [ ] Pre-Deployment (@github-devops): Run `coderabbit --prompt-only -t committed --base HEAD~10` before production deploy (only for production/deployment stories)

  CodeRabbit Focus Areas:
    Primary Focus:
      - [Focus area 1 from type-specific rules]
      - [Focus area 2 from type-specific rules]

    Secondary Focus:
      - [Focus area 3 if applicable]
      - [Focus area 4 if applicable]
```

**Multi-Type Stories:**

If story spans multiple types (e.g., Database + API):
- List primary type first (the one with most work)
- List secondary type(s) in order of importance
- Combine agent assignments (no duplicates)
- Include ALL relevant focus areas from both types
- Use highest quality gate requirement (e.g., if either requires Pre-Deployment, include it)

**Complexity Determination:**

- **Low**: Single file/component, well-defined scope, minimal dependencies
- **Medium**: Multiple files, moderate scope, some cross-system interaction
- **High**: Many files, complex scope, multiple systems, new patterns, or security-critical

**Example Output (Database + API Story):**

```yaml
🤖 CodeRabbit Integration:

  Story Type Analysis:
    Primary Type: Database
    Secondary Type(s): API
    Complexity: High (affects schema, migrations, and multiple API endpoints)

  Specialized Agent Assignment:
    Primary Agents:
      - @dev (pre-commit reviews)
      - @db-sage (schema and SQL review)
      - @architect (API contract changes)

    Supporting Agents:
      - @github-devops (deployment coordination)

  Quality Gate Tasks:
    - [ ] Pre-Commit (@dev): Run before story complete
    - [ ] Pre-PR (@github-devops): Run before PR creation
    - [ ] Pre-Deployment (@github-devops): Run before production deploy

  CodeRabbit Focus Areas:
    Primary Focus:
      - Service filters on all queries (.eq('service', 'ttcx'))
      - Schema compliance (foreign keys, indexes, constraints)
      - API error handling and validation

    Secondary Focus:
      - RLS policies properly configured
      - API contract consistency with spec
      - Migration reversibility

  Self-Healing Configuration:
    Expected Self-Healing:
      - Primary Agent: @dev (light mode)
      - Max Iterations: 2
      - Timeout: 15 minutes
      - Severity Filter: CRITICAL only

    Predicted Behavior:
      - CRITICAL issues: auto_fix (up to 2 iterations)
      - HIGH issues: document_only (noted in Dev Notes)
```

**Self-Healing Configuration (Story 6.3.3):**

After populating the basic CodeRabbit sections, add the Self-Healing Configuration based on the primary agent:

| Primary Agent | Mode | Max Iterations | Timeout | Severity Filter |
|---------------|------|----------------|---------|-----------------|
| @dev | light | 2 | 15 min | CRITICAL |
| @qa | full | 3 | 30 min | CRITICAL, HIGH |
| @github-devops | check | 0 | N/A | report_only |

**Severity Behavior Matrix:**

| Severity | @dev (light) | @qa (full) | @github-devops (check) |
|----------|--------------|------------|------------------------|
| CRITICAL | auto_fix | auto_fix | report_only |
| HIGH | document_only | auto_fix | report_only |
| MEDIUM | ignore | document_as_debt | report_only |
| LOW | ignore | ignore | ignore |

Use the primary agent from "Specialized Agent Assignment" to determine which self-healing configuration to document.

**Log Completion:**
- After populating this section, log: "✅ Story type analysis complete: [Primary Type] | Agents assigned: [agent list] | Quality gates: [gate count] | Self-healing: [mode]"

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
- Execute `aios-core/tasks/execute-checklist` `aios-core/checklists/story-draft-checklist`
- Provide summary to user including:
  - Story created: `{devStoryLocation}/{epicNum}.{storyNum}.story.md`
  - Status: Draft
  - Key technical components included from architecture docs
  - Any deviations or conflicts noted between epic and architecture
  - Checklist Results
  - Next steps: For Complex stories, suggest the user carefully review the story draft and also optionally have the PO run the task `aios-core/tasks/validate-next-story`

**ClickUp Integration Note:** This task now includes Epic verification (Section 5.1), ClickUp story task creation (Section 5.3), and automatic frontmatter updates (Section 5.4). Stories are created as subtasks of their parent Epic in ClickUp's Backlog list. If Epic verification or ClickUp sync fails, the story file will still be created locally with a warning message.

## Handoff
next_agent: @po
next_command: *validate-story-draft {story-id}
condition: Story status is Draft
alternatives:
  - agent: @dev, command: *develop {story-id}, condition: Story already validated by PO
