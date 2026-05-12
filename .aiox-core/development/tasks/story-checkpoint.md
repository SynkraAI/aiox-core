# Task: Story Checkpoint

## Story 11.3: Development Cycle Workflow

Task de checkpoint entre stories no Development Cycle.
Requer decisão humana para continuar, pausar, revisar ou abortar.

---

## Metadata

```yaml
task_id: story-checkpoint
version: "1.0.0"
agent: "@po"
elicit: true  # REQUIRES human interaction
epic: "11 - Projeto Bob"
story: "11.3"
```

---

## Purpose

Pausar o workflow de desenvolvimento entre stories para perguntar ao usuário qual ação tomar. Garante que o usuário mantém controle sobre o fluxo de trabalho.

---

## Inputs

| Input | Type | Required | Description |
|-------|------|----------|-------------|
| `story_file` | path | Yes | Path to completed story file |
| `pr_url` | string | No | URL of created PR (if push succeeded) |
| `implementation` | object | No | Implementation details from development phase |
| `review_result` | object | No | Quality gate review result |

---

## Execution

### Step 1: Generate Summary

```yaml
summary:
  story_completed:
    file: "${story_file}"
    executor: "${story.executor}"
    quality_gate: "${story.quality_gate}"

  implementation:
    files_created: "${implementation.files_created.length}"
    files_modified: "${implementation.files_modified.length}"
    tests_added: "${implementation.tests_added.length}"

  quality_gate:
    verdict: "${review_result.verdict}"
    score: "${review_result.score}"

  pr:
    url: "${pr_url}"
    status: "${pr_url ? 'Created' : 'Pending'}"
```

### Step 2: Display Summary

```
═══════════════════════════════════════════════════════════════════
                    📋 STORY CHECKPOINT
═══════════════════════════════════════════════════════════════════

Story Completed: ${story_file}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Implementation Summary:
   • Files Created:  ${implementation.files_created.length}
   • Files Modified: ${implementation.files_modified.length}
   • Tests Added:    ${implementation.tests_added.length}

✅ Quality Gate: ${review_result.verdict} (${review_result.score}/100)

🔗 PR: ${pr_url || 'Not created yet'}

═══════════════════════════════════════════════════════════════════
```

### Step 3: Elicit Decision

```yaml
elicitation:
  type: single_choice
  required: true
  timeout: 30m

  prompt: |
    Story completed! What would you like to do next?

  options:
    - id: GO
      label: "🚀 GO - Continue to next story"
      description: |
        Continue the development cycle with the next story in the epic.
        The workflow will automatically load and validate the next story.
      action: suggest_next_story

    - id: PAUSE
      label: "⏸️ PAUSE - Save state and stop"
      description: |
        Save the current workflow state and stop execution.
        You can resume later with *workflow resume development-cycle.
      action: save_session_state

    - id: REVIEW
      label: "🔍 REVIEW - Show what was done"
      description: |
        Display a detailed summary of all changes made in this story.
        Includes file diffs, test results, and quality gate findings.
      action: show_detailed_summary

    - id: ABORT
      label: "⛔ ABORT - Stop the epic"
      description: |
        Stop working on this epic entirely.
        All progress is saved but the workflow will not continue.
      action: abort_epic

  display_format: |
    ┌─────────────────────────────────────────────────────────────┐
    │                   What's next?                              │
    ├─────────────────────────────────────────────────────────────┤
    │                                                             │
    │   [1] 🚀 GO     - Continue to next story                   │
    │   [2] ⏸️ PAUSE  - Save state and stop                      │
    │   [3] 🔍 REVIEW - Show what was done                       │
    │   [4] ⛔ ABORT  - Stop the epic                            │
    │                                                             │
    └─────────────────────────────────────────────────────────────┘

    Enter your choice (1-4):
```

---

## Actions

### GO Action: Suggest Next Story

```yaml
action: suggest_next_story
steps:
  1_find_next:
    description: "Find next story in epic"
    logic: |
      - Read epic file to get story list
      - Find current story position
      - Get next story (status = Draft or Approved)
      - If no more stories, report "Epic complete"

  2_validate_next:
    description: "Validate next story is ready"
    checks:
      - Has executor assigned
      - Has quality_gate assigned
      - Status is Draft or Approved
      - Dependencies are met

  3_confirm:
    description: "Confirm with user"
    prompt: |
      Next story: ${next_story.title}
      Executor: ${next_story.executor}
      Quality Gate: ${next_story.quality_gate}

      Start development? (Y/n)

  4_transition:
    description: "Transition to next story"
    actions:
      - Update workflow state with new story
      - Reset phase to 1_validation
      - Continue workflow execution
```

### PAUSE Action: Save Session State

```yaml
action: save_session_state
steps:
  1_save_state:
    description: "Persist workflow state"
    location: ".aiox/workflow-state/${story_id}-state.yaml"
    content:
      workflow_id: development-cycle
      current_story: "${story_file}"
      current_phase: "6_checkpoint"
      paused_at: "${timestamp}"
      epic_progress:
        completed_stories: []
        remaining_stories: []
      accumulated_context: {}

  2_confirm:
    description: "Confirm state saved"
    message: |
      ✅ Workflow state saved!

      To resume later, run:
        *workflow resume development-cycle

      Or activate @po and run:
        *validate-story-draft ${next_story}

  3_exit:
    description: "Exit workflow"
    status: paused
```

### REVIEW Action: Show Detailed Summary

```yaml
action: show_detailed_summary
steps:
  1_gather_data:
    description: "Collect all changes"
    data:
      - Git diff since workflow start
      - All files created/modified/deleted
      - Test results
      - Quality gate findings
      - PR details

  2_display:
    description: "Show detailed summary"
    format: |
      ═══════════════════════════════════════════════════════════════════
                         📊 DETAILED SUMMARY
      ═══════════════════════════════════════════════════════════════════

      Story: ${story_file}
      Duration: ${duration}

      ─────────────────────────────────────────────────────────────────────
      📁 FILES CHANGED
      ─────────────────────────────────────────────────────────────────────

      Created:
      ${files_created.map(f => '  + ' + f).join('\n')}

      Modified:
      ${files_modified.map(f => '  ~ ' + f).join('\n')}

      ─────────────────────────────────────────────────────────────────────
      🧪 TEST RESULTS
      ─────────────────────────────────────────────────────────────────────

      Passed: ${test_results.passed}
      Failed: ${test_results.failed}
      Skipped: ${test_results.skipped}

      ─────────────────────────────────────────────────────────────────────
      ✅ QUALITY GATE
      ─────────────────────────────────────────────────────────────────────

      Verdict: ${review_result.verdict}
      Score: ${review_result.score}/100

      Findings:
      ${review_result.findings.map(f => '  • ' + f).join('\n')}

      ═══════════════════════════════════════════════════════════════════

  3_return:
    description: "Return to checkpoint"
    action: "Re-display checkpoint options"
```

### ABORT Action: Stop Epic

```yaml
action: abort_epic
steps:
  1_confirm:
    description: "Confirm abort"
    prompt: |
      ⚠️ Are you sure you want to abort the epic?

      This will:
      - Stop the development cycle
      - Save current progress
      - NOT affect completed stories

      Abort? (yes/no)

  2_save_final_state:
    description: "Save abort state"
    location: ".aiox/workflow-state/${story_id}-state.yaml"
    status: aborted

  3_report:
    description: "Report abort"
    message: |
      ⛔ Epic aborted.

      Progress saved. Completed stories are unaffected.

      To review progress:
        *backlog-summary

      To restart:
        *workflow development-cycle ${next_incomplete_story}

  4_exit:
    description: "Exit workflow"
    status: aborted
```

---

## Output

```yaml
output:
  decision:
    type: enum
    values: [GO, PAUSE, REVIEW, ABORT]

  next_story:
    type: path
    optional: true
    description: "Path to next story (only if GO)"

  state_file:
    type: path
    optional: true
    description: "Path to saved state file (if PAUSE or ABORT)"
```

---

## Error Handling

| Error | Handling |
|-------|----------|
| No next story found | Display "Epic complete" message |
| Next story not ready | Display warning, allow manual selection |
| State save failed | Retry 3x, then warn user |
| User timeout | Default to PAUSE after 30 minutes |

---

## Related

- **Workflow:** `development-cycle.yaml`
- **Module:** `workflow-executor.js`
- **Story:** 11.3 (Development Cycle Workflow)
- **Dependencies:** Story 11.1 (Executor Assignment), Story 11.2 (Terminal Spawning)

---

*Task created by @dev (Dex) for Story 11.3*
