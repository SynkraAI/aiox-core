# Refine Story

## Purpose

Scrum Master refines an existing story by updating acceptance criteria, adjusting scope, re-estimating if scope changed, recording new dependencies, and validating the refined story against the story draft checklist.

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
task: refineStory()
responsavel: River (Facilitator)
responsavel_type: Agente
atomic_layer: Organism

**Entrada:**
- campo: story_id
  tipo: string
  origem: User Input
  obrigatorio: true
  validacao: Must reference existing story file (e.g., "1.3" or full filename)

- campo: refinement_notes
  tipo: string
  origem: User Input
  obrigatorio: false
  validacao: Free-text notes describing what needs refinement

**Saida:**
- campo: updated_story_file
  tipo: string
  destino: File system (docs/stories/{story_id}.story.md)
  persistido: true

- campo: refinement_log
  tipo: object
  destino: Appended to story file
  persistido: true

- campo: checklist_result
  tipo: string
  destino: Return value
  persistido: false
  values: PASS|FAIL
```

---

## Pre-Conditions

**Purpose:** Validate prerequisites BEFORE task execution (blocking)

**Checklist:**

```yaml
pre-conditions:
  - [ ] Story file exists at the expected path
    tipo: pre-condition
    blocker: true
    validacao: |
      Check story file exists at devStoryLocation/{story_id}.story.md
    error_message: "Pre-condition failed: Story file not found for ID {story_id}"

  - [ ] Story is in Draft, Ready, or Approved status (not Done)
    tipo: pre-condition
    blocker: true
    validacao: |
      Check story status is not Done or In Progress
    error_message: "Pre-condition failed: Cannot refine a story with status {status}. Stories In Progress or Done should not be refined."

  - [ ] core-config.yaml exists and is readable
    tipo: pre-condition
    blocker: true
    validacao: |
      Check .aios-core/core-config.yaml exists
    error_message: "Pre-condition failed: core-config.yaml not found"
```

---

## SEQUENTIAL Task Execution (Do not proceed until current Task is complete)

### Step 1: Load Story and Present Current State

- Load `.aios-core/core-config.yaml` and extract `devStoryLocation`
- Read the story file at `{devStoryLocation}/{story_id}.story.md`
- Parse and present the current state to the user:

```
Story: {story_id} - {title}
Status: {status}
Executor: {executor}
Quality Gate: {quality_gate}
Estimate: {estimate} ({points} points)
Epic: {epic_number}

Acceptance Criteria:
  1. {AC1}
  2. {AC2}
  ...

Scope:
  IN:  {in-scope items}
  OUT: {out-of-scope items}

Dependencies:
  - {dep1}
  - {dep2}
```

- Log: "Loaded story {story_id} for refinement (current status: {status})"

### Step 2: Gather Refinement Input

- If `refinement_notes` provided, use them as guidance for what to refine
- If running in Interactive mode, present refinement options:

```
What would you like to refine?
1. Acceptance Criteria (add, modify, or remove ACs)
2. Scope (adjust IN/OUT scope boundaries)
3. Estimate (re-estimate based on new understanding)
4. Dependencies (add or remove dependencies)
5. Executor / Quality Gate assignment
6. All of the above
```

- [AUTO-DECISION] In YOLO mode, analyze the story and refinement_notes to determine which areas need refinement automatically

### Step 3: Refine Acceptance Criteria

- If acceptance criteria refinement is selected:
  - Present current ACs numbered
  - For each AC, allow: KEEP, MODIFY, REMOVE
  - Allow adding new ACs
  - Ensure all ACs follow Given/When/Then format where applicable
  - Ensure ACs are specific, measurable, and testable
  - Track changes: `{AC_NUM}: {OLD_TEXT} -> {NEW_TEXT}` or `NEW: {AC_TEXT}` or `REMOVED: {AC_TEXT}`
- Log: "{N} ACs modified, {M} added, {K} removed"

### Step 4: Refine Scope

- If scope refinement is selected:
  - Present current IN-SCOPE and OUT-OF-SCOPE items
  - Allow moving items between IN and OUT
  - Allow adding new scope items
  - Track changes: `MOVED_IN: {item}`, `MOVED_OUT: {item}`, `ADDED_IN: {item}`, `ADDED_OUT: {item}`
- If scope significantly changed (items moved IN), flag that re-estimation may be needed
- Log: "Scope adjusted: {N} items moved, {M} items added"

### Step 5: Re-Estimate if Scope Changed

- If scope was changed in Step 4, or if estimate refinement was explicitly selected:
  - Present current estimate: {size} ({points} points)
  - Apply estimation guidelines:
    - S (1 pt): Single file change, well-defined, no dependencies
    - M (2 pts): 2-4 files, moderate complexity, minimal dependencies
    - L (3 pts): 5-8 files, significant complexity, some dependencies
    - XL (5 pts): 9+ files, high complexity, multiple dependencies, new patterns
  - Consider scope changes when re-estimating
  - If estimate changed, record: `ESTIMATE: {old_size}({old_pts}) -> {new_size}({new_pts})`
- Log: "Estimate: {old} -> {new}" or "Estimate unchanged: {current}"

### Step 6: Update Dependencies

- If dependency refinement is selected:
  - Present current dependencies
  - Allow adding new dependencies (other story IDs, external dependencies)
  - Allow removing resolved dependencies
  - For each new dependency, verify the referenced story exists
  - Track changes: `ADDED_DEP: {dep}`, `REMOVED_DEP: {dep}`
- Log: "{N} dependencies added, {M} removed"

### Step 7: Update Story File

- Apply all tracked changes to the story file
- Append a Refinement Log entry at the end of the story (before Handoff section if present):

```markdown
## Refinement Log

### Refinement {date}
- **Refined by:** @sm (River)
- **Reason:** {refinement_notes or summary}
- **Changes:**
  - {list of all tracked changes from Steps 3-6}
- **Previous Estimate:** {old_estimate}
- **New Estimate:** {new_estimate}
- **Status:** {updated_status}
```

- If the story had no Refinement Log section, create it
- If the story already has a Refinement Log, append the new entry
- Save the updated story file
- Log: "Story {story_id} updated with refinement changes"

### Step 8: Run Story Draft Checklist

- Execute the story-draft-checklist against the refined story
- Report checklist results:
  - PASS: All checks passed
  - FAIL: List which checks failed and why
- If FAIL, note which items need attention but do not block (refinement is still saved)
- Log: "Story draft checklist: {PASS|FAIL}"

---

## Post-Conditions

**Purpose:** Validate execution success AFTER task completes

**Checklist:**

```yaml
post-conditions:
  - [ ] Story file updated with refinement changes
    tipo: post-condition
    blocker: true
    validacao: |
      Verify story file was modified and contains refinement log entry
    error_message: "Post-condition failed: Story file not updated"

  - [ ] Refinement log entry appended to story
    tipo: post-condition
    blocker: true
    validacao: |
      Verify Refinement Log section exists with dated entry
    error_message: "Post-condition failed: Refinement log not appended"

  - [ ] Story draft checklist executed
    tipo: post-condition
    blocker: false
    validacao: |
      Verify checklist was run (result may be PASS or FAIL)
    error_message: "Warning: Story draft checklist was not executed"
```

---

## Acceptance Criteria

**Purpose:** Definitive pass/fail criteria for task completion

**Checklist:**

```yaml
acceptance-criteria:
  - [ ] All requested refinement areas were addressed
    tipo: acceptance-criterion
    blocker: true
    validacao: |
      Assert each selected refinement area (AC, scope, estimate, deps) was processed
    error_message: "Acceptance criterion not met: Not all refinement areas addressed"

  - [ ] Changes are tracked in the Refinement Log with before/after values
    tipo: acceptance-criterion
    blocker: true
    validacao: |
      Assert Refinement Log entry contains specific change records
    error_message: "Acceptance criterion not met: Refinement changes not tracked"

  - [ ] Re-estimation was triggered when scope changed
    tipo: acceptance-criterion
    blocker: false
    validacao: |
      Assert estimate was reviewed if scope items were moved IN
    error_message: "Warning: Scope changed but estimate was not reviewed"
```

---

## Error Handling

**Strategy:** retry

**Common Errors:**

1. **Error:** Story File Not Found
   - **Cause:** Invalid story_id or incorrect devStoryLocation
   - **Resolution:** Verify story path against core-config.yaml
   - **Recovery:** List available stories, suggest correct ID

2. **Error:** Story in Invalid State for Refinement
   - **Cause:** Story is Done or In Progress
   - **Resolution:** Cannot refine active or completed stories
   - **Recovery:** Suggest creating a new story for additional work, or using a different workflow

3. **Error:** Referenced Dependency Story Not Found
   - **Cause:** Dependency story ID does not match any existing story file
   - **Resolution:** Verify the dependency story ID
   - **Recovery:** List available story IDs, suggest correct reference

---

## Performance

**Expected Metrics:**

```yaml
duration_expected: 5-15 min (estimated)
cost_estimated: $0.003-0.010
token_usage: ~3,000-10,000 tokens
```

**Optimization Notes:**
- Interactive mode will take longer due to user prompts
- YOLO mode can complete in 3-5 minutes for straightforward refinements

---

## Metadata

```yaml
story: N/A
version: 1.0.0
dependencies:
  - story-draft-checklist.md
tags:
  - refinement
  - scrum-master
  - story-management
updated_at: 2026-04-10
```

---

## Handoff

next_agent: @po
next_command: *validate-story-draft {story-id}
condition: Refinement complete, story ready for PO validation
alternatives:
  - agent: @dev, command: *develop {story-id}, condition: Story already validated and status is Ready
  - agent: @sm, command: *sprint-plan, condition: Refined story should be included in next sprint
