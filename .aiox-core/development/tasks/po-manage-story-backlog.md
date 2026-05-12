---
tools:
  - git               # Track backlog file changes
  - context7          # Research backlog management best practices
checklists:
  - backlog-management-checklist.md
---

# manage-story-backlog

Manage the STORY-BACKLOG.md file to track follow-up tasks, technical debt, and optimization opportunities identified during story reviews, development, and QA processes.

## Purpose

The Story Backlog provides a centralized, structured way to:
- Track follow-up tasks identified during QA reviews
- Document technical debt from development
- Capture optimization opportunities
- Prioritize work across sprints
- Maintain visibility into deferred work

## Prerequisites

- Story review completed (for QA-sourced items)
- Story development completed (for dev-sourced items)
- Clear understanding of issue/opportunity being tracked

## Backlog File Location

**Location**: Configured in `core-config.yaml` as `storyBacklogLocation`
**Default**: `docs/STORY-BACKLOG.md`
**Format**: Markdown with YAML frontmatter for metadata

## Operations

### 1. Add New Backlog Item

**Trigger**: After QA review, during development, or PM prioritization

**Input Parameters**:
```yaml
required:
  - story_id: 'STORY-XXX' # Source story
  - item_type: 'F' # F=followup, O=optimization, T=technical-debt
  - priority: 'HIGH|MEDIUM|LOW' # Priority level
  - title: 'Brief title' # Concise description
  - description: 'Detailed description' # What needs to be done
  - effort: '1 hour' # Time estimate

optional:
  - source: 'QA Review' # Where it came from
  - assignee: 'Backend Developer' # Who should do it
  - sprint: 'Sprint 1' # When to do it
  - risk: 'LOW|MEDIUM|HIGH' # Risk if not done
  - success_criteria: [] # How to validate completion
  - acceptance: 'How to accept as done'
```

**Process**:
1. Read existing `STORY-BACKLOG.md`
2. Generate unique ID: `[{story_id}-{item_type}{sequential_number}]`
   - Example: `[STORY-013-F1]` (first follow-up from STORY-013)
   - Example: `[STORY-013-O2]` (second optimization from STORY-013)
3. Determine priority section (🔴 HIGH, 🟡 MEDIUM, 🟢 LOW)
4. Create item using template (see below)
5. Insert into appropriate priority section
6. Update statistics section
7. Write updated backlog file

**Item Template**:
```markdown
#### [{story_id}-{type}{num}] {title}
- **Source**: {source}
- **Priority**: {priority_emoji} {priority}
- **Effort**: {effort}
- **Status**: 📋 TODO
- **Assignee**: {assignee}
- **Sprint**: {sprint}
- **Description**: {description}
- **Success Criteria**:
  {for each criterion}
  - [ ] {criterion}
- **Acceptance**: {acceptance}

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
task: poManageStoryBacklog()
responsável: Pax (Balancer)
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
  - product-management
  - planning
updated_at: 2025-11-17
```

---

```

### 2. Update Backlog Item Status

**Trigger**: Work started, completed, or blocked

**Input Parameters**:
```yaml
required:
  - item_id: '[STORY-XXX-FY]' # Item to update
  - new_status: 'TODO|IN_PROGRESS|BLOCKED|DONE|CANCELLED'

optional:
  - blocker_reason: 'Why blocked' # If status=BLOCKED
  - completion_notes: 'Notes on completion' # If status=DONE
```

**Process**:
1. Find item by ID in backlog file
2. Update status field
3. Add completion date if DONE
4. Move to appropriate section if priority changed
5. Update statistics
6. Write updated file

**Status Values**:
- 📋 **TODO**: Not started
- 🚧 **IN PROGRESS**: Currently being worked on
- ⏸️ **BLOCKED**: Waiting on dependency
- ✅ **DONE**: Completed and verified
- 💡 **IDEA**: Proposed but not yet approved
- ❌ **CANCELLED**: Decided not to implement

### 3. Review Backlog

**Trigger**: Weekly backlog review meeting

**Process**:
1. Read entire backlog file
2. Generate review report:
   - Items by status
   - Items by priority
   - Items by sprint
   - Overdue items
   - Blocked items
3. Suggest priority adjustments based on:
   - Age of item
   - Dependencies
   - Sprint deadlines
   - Team capacity
4. Output review summary

**Review Questions**:
- Are all 📋 TODO items still relevant?
- Should any 💡 IDEA items be promoted to TODO?
- Are any items blocked for too long?
- Do priorities still make sense?
- Are effort estimates accurate?

### 4. Archive Completed Items

**Trigger**: Monthly or when backlog gets too large

**Process**:
1. Collect all ✅ DONE items
2. Create archive file: `docs/qa/backlog-archive-{YYYY-MM}.md`
3. Move DONE items to archive with completion metadata
4. Remove from main backlog
5. Update statistics
6. Maintain historical record

### 5. Generate Backlog Report

**Trigger**: Sprint planning, stakeholder requests

**Output Options**:
- **Summary**: Item counts by priority/status/sprint
- **Detailed**: Full item list with all fields
- **Sprint View**: Items grouped by sprint
- **Team View**: Items grouped by assignee
- **Risk View**: High-risk items requiring attention

## Configuration Dependencies

This task requires the following configuration keys from `core-config.yaml`:

- **`storyBacklogLocation`**: Location of story backlog file (default: `docs/STORY-BACKLOG.md`)
- **`devStoryLocation`**: Location of story files (to validate source stories)
- **`qaLocation`**: QA output directory (to link QA reviews)

**Example Config Addition**:
```yaml
# Story Backlog Management (added with Story Backlog feature)
storyBacklog:
  enabled: true
  backlogLocation: docs/STORY-BACKLOG.md
  archiveLocation: docs/qa/backlog-archive
  reviewSchedule: weekly # weekly, biweekly, monthly
  autoArchiveAfter: 30 # days after completion
```

## Integration Points

### QA Agent Integration

After completing story review (`review-story` task), QA agent should:
1. Identify follow-ups, technical debt, optimizations
2. Call `manage-story-backlog` with operation='add' for each item
3. Reference backlog items in QA Results section

**Example QA Results Addition**:
```markdown
### Recommended Actions
1. ✅ **Commit immediately** - Unblocks dependent stories
2. 📝 **Created [STORY-013-F1]**: Install Jest+ESM transformer (tracked in backlog)
3. 📝 **Created [STORY-013-F2]**: Add integration tests (tracked in backlog)
```

### Dev Agent Integration

During development (`develop-story` task), dev agent should:
1. Note technical debt incurred for speed
2. Identify optimization opportunities
3. Add items to backlog with `source: Development`

**Example Usage**:
```javascript
// Dev notices optimization opportunity during implementation
await addBacklogItem({
  story_id: 'STORY-013',
  item_type: 'O',
  priority: 'LOW',
  title: 'Optimize multi-service query performance',
  description: 'Add database indexes on service column for better query performance',
  effort: '2 hours',
  source: 'Development',
  assignee: 'Backend Developer',
  sprint: 'Sprint 2'
});
```

### PO Agent Integration

Product Owner uses backlog for:
1. Sprint planning prioritization
2. Weekly backlog reviews
3. Technical debt management
4. Stakeholder reporting

**PO Commands** (see agent update below):
- `*backlog-review`: Generate review report for sprint planning
- `*backlog-summary`: Quick summary of backlog status
- `*backlog-prioritize`: Re-prioritize items based on new information

## Backlog Item Lifecycle

```
┌──────────┐
│   IDEA   │ ← Proposed items
└────┬─────┘
     │ (approved)
     ▼
┌──────────┐
│   TODO   │ ← Ready for work
└────┬─────┘
     │ (started)
     ▼
┌──────────┐
│IN PROGRESS│ ← Actively being worked
└────┬─────┘
     │
     ├─(blocked)──▶ ⏸️  BLOCKED
     │
     ├─(cancelled)─▶ ❌ CANCELLED
     │
     └─(completed)─▶ ✅ DONE ──▶ 📦 ARCHIVED
```

## Best Practices

1. **Be Specific**: Clear, actionable descriptions
2. **Size Appropriately**: Break large items into smaller ones (< 8 hours)
3. **Link Context**: Reference source story, QA report, or decision doc
4. **Estimate Honestly**: Include effort estimates for planning
5. **Review Regularly**: Weekly reviews keep backlog healthy
6. **Archive Promptly**: Don't let backlog grow stale with old DONE items
7. **Track Dependencies**: Note blockers and dependencies
8. **Celebrate Completion**: Mark items DONE, don't let them linger

## Example Workflow

**After QA Review of STORY-013**:
1. QA identifies 3 follow-ups
2. QA calls `manage-story-backlog` 3 times:
   ```bash
   # Add Jest+ESM config item
   *backlog-add STORY-013 F HIGH "Install Jest+ESM transformer" "..."

   # Add integration tests item
   *backlog-add STORY-013 F HIGH "Create integration tests" "..."

   # Add README update item
   *backlog-add STORY-013 F MEDIUM "Update README documentation" "..."
   ```
3. Items appear in backlog with IDs `[STORY-013-F1]`, `[STORY-013-F2]`, `[STORY-013-F3]`
4. Sprint planning: PO calls `*backlog-review`
5. Team commits to F1 and F2 in Sprint 1, defers F3 to Sprint 2
6. Dev starts F1, updates status to IN_PROGRESS
7. Dev completes F1, updates status to DONE
8. Monthly archive moves F1 to archive file

## Success Metrics

Track effectiveness of Story Backlog:
- **Item Completion Rate**: % of backlog items completed
- **Age of Items**: How long items sit in TODO state
- **Blocked Item Resolution**: Time to unblock blocked items
- **Archive Frequency**: Regular archiving indicates healthy flow
- **Sprint Commitment Accuracy**: % of committed backlog items completed

## Related Tasks

- `review-story.md`: Creates backlog items during QA review
- `develop-story.md`: May create backlog items during development
- `execute-checklist.md`: May identify backlog items during validation

## Related Templates

- `story-backlog-item-tmpl.yaml`: Template for individual backlog items
- `story-backlog-report-tmpl.yaml`: Template for backlog reports

---

*Created: 2025-11-11*
*Purpose: Officially integrate Story Backlog into AIOX framework*
*Story: STORY-013 QA Review Process*
