# Develop Story Implementation

## Purpose

Execute story implementation by reading the story file, implementing all tasks and acceptance criteria, maintaining the File List, and producing working code with passing validations. This is the core executor task referenced by the story-development-cycle workflow Phase 3.

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
task: develop()
responsavel: Dex (Builder)
responsavel_type: Agente
atomic_layer: Organism

**Entrada:**
- campo: story_id
  tipo: string
  origem: User Input
  obrigatorio: true
  validacao: Must reference existing story file

- campo: story_path
  tipo: string
  origem: Derived
  obrigatorio: true
  validacao: File must exist at devStoryLocation/{story_id}

- campo: mode
  tipo: string
  origem: User Input
  obrigatorio: false
  validacao: yolo|interactive|preflight

**Saida:**
- campo: files_created
  tipo: array
  destino: Story File List
  persistido: true

- campo: files_modified
  tipo: array
  destino: Story File List
  persistido: true

- campo: tests_added
  tipo: array
  destino: Story File List
  persistido: true

- campo: implementation_result
  tipo: object
  destino: Memory
  persistido: false
```

---

## Pre-Conditions

**Purpose:** Validate prerequisites BEFORE task execution (blocking)

**Checklist:**

```yaml
pre-conditions:
  - [ ] Story file exists and has status "Ready" or "In Progress"
    tipo: pre-condition
    blocker: true
    validacao: |
      Verify story file exists at expected path and status is not Draft or Done
    error_message: "Pre-condition failed: Story file not found or not in Ready/In Progress status"

  - [ ] Acceptance criteria are defined in the story
    tipo: pre-condition
    blocker: true
    validacao: |
      Check story contains at least one acceptance criterion
    error_message: "Pre-condition failed: No acceptance criteria found in story"

  - [ ] Executor assignment matches current agent
    tipo: pre-condition
    blocker: true
    validacao: |
      Verify story executor field matches @dev (or current executing agent)
    error_message: "Pre-condition failed: Story executor is not assigned to this agent"
```

---

## SEQUENTIAL Task Execution

### Step 1: Read and Analyze Story

- Load the complete story file
- Extract all tasks, subtasks, and acceptance criteria
- Identify technical requirements from Dev Notes
- Check for any existing File List entries
- Note any dependencies or blocking conditions

### Step 2: Check Requirements and Acceptance Criteria

- Map each acceptance criterion to implementation tasks
- Identify any ambiguities or missing information
- In interactive mode: present summary and confirm understanding with user
- In YOLO mode: log analysis and proceed autonomously
- In preflight mode: generate comprehensive questionnaire

### Step 3: Implement Changes Following Story Checkboxes

For each task/subtask in the story:

1. Read the task description
2. Implement the required changes
3. Follow project coding standards (kebab-case files, PascalCase components, absolute imports)
4. Write tests covering the implementation
5. Run validations (lint + typecheck)
6. **Only if ALL validations pass**: Mark the task checkbox `[x]`
7. Update the File List with created/modified files

### Step 4: Mark Checkboxes as Complete

- Only mark `[x]` after implementation AND validation pass
- Never mark checkboxes for unimplemented or failing tasks
- Update the story status to "In Progress" when first task starts
- Update the story status to "Ready for Review" when all tasks complete

### Step 5: Maintain File List in Story

- Add every created file with path and purpose
- Add every modified file with path and change description
- Add every deleted file with path and reason
- Keep the File List accurate and up-to-date throughout implementation

### Step 6: Run Lint + Typecheck

```bash
npm run lint && npm run typecheck
```

- Fix any lint errors in files you created or modified
- Fix any type errors in files you created or modified
- Do NOT fix pre-existing lint/type errors in files outside story scope

---

## Post-Conditions

**Purpose:** Validate execution success AFTER task completes

**Checklist:**

```yaml
post-conditions:
  - [ ] All story tasks and subtasks marked [x]
    tipo: post-condition
    blocker: true
    validacao: |
      Verify every task checkbox in the story is checked
    error_message: "Post-condition failed: Not all tasks are marked complete"

  - [ ] Lint and typecheck pass for modified files
    tipo: post-condition
    blocker: true
    validacao: |
      Run npm run lint && npm run typecheck and verify exit code 0
    error_message: "Post-condition failed: Lint or typecheck failures detected"

  - [ ] File List is complete and accurate
    tipo: post-condition
    blocker: true
    validacao: |
      Verify File List contains all created, modified, and deleted files
    error_message: "Post-condition failed: File List is incomplete"
```

---

## Acceptance Criteria

**Purpose:** Definitive pass/fail criteria for task completion

**Checklist:**

```yaml
acceptance-criteria:
  - [ ] All acceptance criteria from the story are implemented and validated
    tipo: acceptance-criterion
    blocker: true
    validacao: |
      Assert each story AC has corresponding implementation and passing tests
    error_message: "Acceptance criterion not met: Story ACs not fully implemented"

  - [ ] Code follows project standards and conventions
    tipo: acceptance-criterion
    blocker: true
    validacao: |
      Assert code uses correct naming, imports, and patterns per CLAUDE.md
    error_message: "Acceptance criterion not met: Code does not follow project standards"
```

---

## Error Handling

**Strategy:** retry (max 3 attempts per task)

**Common Errors:**

1. **Error:** Story File Not Found
   - **Cause:** Invalid story_id or incorrect devStoryLocation
   - **Resolution:** Verify story path against core-config.yaml
   - **Recovery:** List available stories, suggest correct ID

2. **Error:** Lint/Typecheck Failures
   - **Cause:** Code does not meet project standards
   - **Resolution:** Fix reported issues in modified files
   - **Recovery:** Auto-fix where possible, report remaining issues

3. **Error:** Test Failures
   - **Cause:** Implementation does not match expected behavior
   - **Resolution:** Debug and fix implementation or test
   - **Recovery:** Max 3 attempts, then HALT and escalate

4. **Error:** Blocking Dependency
   - **Cause:** Task requires output from incomplete dependency
   - **Resolution:** Complete dependency first or request user input
   - **Recovery:** Reorder tasks if possible, otherwise HALT

---

## Blocking Conditions

HALT and ask user if:
- Unapproved dependencies are needed
- Ambiguous requirements remain after story analysis
- 3 failures attempting to implement or fix something
- Missing configuration or environment setup
- Failing regression tests

---

## Performance

**Expected Metrics:**

```yaml
duration_expected: 10-60 min (estimated, depends on story complexity)
cost_estimated: $0.005-0.050
token_usage: ~5,000-50,000 tokens
```

**Optimization Notes:**
- Break large stories into smaller implementation chunks
- Run lint/typecheck incrementally per task, not only at the end
- Use existing patterns and exemplars from the codebase

---

## Metadata

```yaml
story: N/A
version: 1.0.0
dependencies:
  - validate-story-draft.md
  - story-dod-checklist.md
tags:
  - development
  - implementation
  - code
updated_at: 2026-04-10
```

---

## Handoff

next_agent: @qa
next_command: *review {story-id}
condition: Story status is "Ready for Review" and all tasks complete
alternatives:
  - agent: @qa, command: *gate {story-id}, condition: Quick gate decision needed
  - agent: @dev, command: *apply-qa-fixes, condition: Self-identified issues during dev
