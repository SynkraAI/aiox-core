---
task-id: reexecute-phase
name: Reexecute Specific MMOS Phase from Scratch
agent: mind-pm
version: 1.0.0
purpose: Backup phase outputs via git and re-execute specific phase from scratch

workflow-mode: interactive
elicit: true
elicitation-type: guided

prerequisites:
  - Mind directory exists at squads/mmos-squad/minds/{mind_name}
  - Phase has been previously executed
  - Git repository initialized

inputs:
  - name: mind_name
    type: string
    required: true
    description: Name of the mind to reexecute phase for
  - name: phase
    type: enum
    required: true
    options: ["research", "analysis", "synthesis", "implementation", "testing"]
    description: Which phase to reexecute
  - name: reexecution_reason
    type: text
    required: true
    description: Why this phase needs to be reexecuted

outputs:
  - path: "squads/mmos-squad/minds/{mind_name}/docs/logs/{timestamp}-phase-reexecution.yaml"
    description: Reexecution log with backup details
  - path: "squads/mmos-squad/minds/{mind_name}/.phase-backup-{phase}-{timestamp}/"
    description: Git commit with phase outputs backup

dependencies:
  agents:
    - mind-mapper
  tasks:
    - research-collection.md
    - cognitive-analysis.md
    - synthesis-compilation.md
    - system-prompt-creation.md
    - mind-validation.md

validation:
  success-criteria:
    - "Git backup of phase outputs created"
    - "Phase-specific artifacts deleted"
    - "Dependent phases identified"
    - "Phase task automatically invoked"

estimated-duration: "Varies by phase (30min - 4 hours)"
---

# Reexecute Phase Task

## Purpose

Backup specific phase outputs via git and re-execute that phase from scratch. This is useful when:
- Phase quality is unsatisfactory but rest of mind is good
- New methodology for specific phase should be applied
- Sources changed affecting only certain phases
- Testing different approaches for specific phase

## When to Use This Task

**Use this task when:**
- Need to redo research collection with new sources
- Analysis layer needs deeper extraction
- Synthesis outputs need improvement
- System prompt needs complete rebuild
- Validation tests need fresh execution

**Do NOT use this task when:**
- Need complete mind restart (use reexecute-mind instead)
- Only tweaking existing outputs (edit directly)
- Adding incremental updates (use brownfield-update)

## Available Phases

```yaml
phases:
  research:
    task: research-collection.md
    deletes:
      - sources/** (except sources_master.yaml if preserve)
      - docs/logs/*-discovery*.yaml
      - docs/logs/*-collection*.yaml
    affects: [analysis, synthesis, implementation, testing]

  analysis:
    task: cognitive-analysis.md
    deletes:
      - artifacts/behavioral_patterns.md
      - artifacts/writing_style.md
      - artifacts/routine_analysis.md
      - artifacts/recognition_patterns.yaml
      - artifacts/mental_models.md
      - artifacts/values_hierarchy.yaml
      - artifacts/core_obsessions.yaml
      - artifacts/contradictions.yaml
      - artifacts/cognitive_architecture.yaml
    affects: [synthesis, implementation, testing]

  synthesis:
    task: synthesis-compilation.md
    deletes:
      - artifacts/communication_templates.md
      - artifacts/signature_phrases.md
      - artifacts/frameworks_synthesized.md
      - kb/**
    affects: [implementation, testing]

  implementation:
    task: system-prompt-creation.md
    deletes:
      - artifacts/identity_core.yaml
      - artifacts/meta_axioms.yaml
      - system_prompts/**
      - specialists/**
    affects: [testing]

  testing:
    task: mind-validation.md
    deletes:
      - docs/testing_protocol.md
      - docs/logs/*-test*.yaml
      - docs/logs/*-validation*.yaml
    affects: []
```

## Key Activities & Instructions

### Phase 0: Pre-Reexecution Validation

#### 0.1 Verify Mind and Phase

Check that mind exists and phase was previously executed:

```bash
# Verify mind directory
test -d "squads/mmos-squad/minds/{{mind_name}}" || echo "ERROR: Mind not found"

# Verify phase was executed (check for phase artifacts)
case "{{phase}}" in
  research)
    test -f "squads/mmos-squad/minds/{{mind_name}}/sources/sources_master.yaml" || echo "WARNING: Phase may not have been executed"
    ;;
  analysis)
    test -f "squads/mmos-squad/minds/{{mind_name}}/artifacts/cognitive_architecture.yaml" || echo "WARNING: Phase may not have been executed"
    ;;
  synthesis)
    test -d "squads/mmos-squad/minds/{{mind_name}}/kb" || echo "WARNING: Phase may not have been executed"
    ;;
  implementation)
    test -d "squads/mmos-squad/minds/{{mind_name}}/system_prompts" || echo "WARNING: Phase may not have been executed"
    ;;
  testing)
    test -f "squads/mmos-squad/minds/{{mind_name}}/docs/testing_protocol.md" || echo "WARNING: Phase may not have been executed"
    ;;
esac
```

#### 0.2 Identify Affected Downstream Phases

Determine which phases will be affected by this reexecution:

```yaml
dependency_chain:
  research: [analysis, synthesis, implementation, testing]
  analysis: [synthesis, implementation, testing]
  synthesis: [implementation, testing]
  implementation: [testing]
  testing: []
```

#### 0.3 Confirm User Intent (ELICIT)

Present reexecution warning with dependency impact:

```markdown
## ⚠️ PHASE REEXECUTION WARNING

You are about to **reexecute** the **{{phase}}** phase for: **{{mind_name}}**

### What will happen:

1. **✅ BACKUP (Safe)**
   - Git commit of phase-specific outputs
   - Commit message: "backup: {{mind_name}} {{phase}} phase before reexecution"
   - All files preserved in git history
   - Rollback possible at any time

2. **🗑️ CLEANUP (Targeted)**
   - Only {{phase}} outputs deleted:
   {{list_of_files_to_delete}}

   - Preserved (not touched):
   {{list_of_preserved_files}}

3. **⚠️ DEPENDENCY IMPACT**
   {{#if affected_phases}}
   **WARNING:** Reexecuting {{phase}} will affect downstream phases:
   {{#each affected_phases}}
   - **{{this}}**: May need reexecution after {{phase}} completes
   {{/each}}

   **Recommendation:**
   - Review downstream phases after {{phase}} completes
   - Consider reexecuting affected phases if {{phase}} changes significantly
   {{else}}
   No downstream phases affected. Safe to reexecute.
   {{/if}}

4. **🔄 REEXECUTION**
   - Invoke task: {{task_name}}
   - Start from beginning of phase
   - Estimated time: {{estimated_time}}
   - Estimated tokens: {{estimated_tokens}}

### Current Phase Status:
- Last executed: {{last_execution_date}}
- Outputs count: {{count}}
- Dependent phases: {{downstream_count}}

### Backup Information:
- Git commit will preserve: Phase-specific outputs
- Commit tag: backup-{{mind_name}}-{{phase}}-{{timestamp}}
- Rollback command: `git checkout {{tag}} -- squads/mmos-squad/minds/{{mind_name}}`

---

**CRITICAL DECISION REQUIRED:**

Type **CONFIRM** to proceed with phase reexecution
Type **CANCEL** to abort
Type **QUESTIONS** to discuss before deciding

>
```

**Wait for user response.**

#### 0.4 Handle User Response

**If CANCEL:** Exit gracefully
**If QUESTIONS:** Enter discussion mode, then re-present
**If CONFIRM:** Proceed to Phase 1

### Phase 1: Backup Phase Outputs via Git

#### 1.1 Collect Phase-Specific Files

Identify all files produced by this phase:

```bash
case "{{phase}}" in
  research)
    files=(
      "squads/mmos-squad/minds/{{mind_name}}/sources/"
      "squads/mmos-squad/minds/{{mind_name}}/docs/logs/*-discovery*.yaml"
      "squads/mmos-squad/minds/{{mind_name}}/docs/logs/*-collection*.yaml"
    )
    ;;
  analysis)
    files=(
      "squads/mmos-squad/minds/{{mind_name}}/artifacts/behavioral_patterns.md"
      "squads/mmos-squad/minds/{{mind_name}}/artifacts/writing_style.md"
      "squads/mmos-squad/minds/{{mind_name}}/artifacts/cognitive_architecture.yaml"
      # ... all analysis artifacts
    )
    ;;
  # ... other phases
esac
```

#### 1.2 Create Backup Commit

Execute git commit with phase backup:

```bash
# Add phase-specific files
for file in "${files[@]}"; do
  git add "$file" 2>/dev/null || true
done

# Create commit
git commit -m "backup: {{mind_name}} {{phase}} phase before reexecution

Phase: {{phase}}
Reason: {{reexecution_reason}}
Timestamp: {{ISO_timestamp}}

Phase Outputs Backed Up:
{{list_of_backed_up_files}}

Affected Downstream Phases:
{{list_of_affected_phases}}

This commit preserves {{phase}} phase outputs before reexecution.
Rollback: git checkout {{tag}} -- squads/mmos-squad/minds/{{mind_name}}

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# Create tag
git tag -a "backup-{{mind_name}}-{{phase}}-{{timestamp}}" \
  -m "Backup before reexecuting {{phase}} phase of {{mind_name}}"
```

#### 1.3 Verify Backup Success

Present backup confirmation:

```markdown
✅ **PHASE BACKUP COMPLETE**

Git commit created: {{commit_hash}}
Git tag: backup-{{mind_name}}-{{phase}}-{{timestamp}}

**Phase outputs preserved:** {{count}} files

**Rollback command** (if needed later):
```bash
git checkout {{tag}} -- squads/mmos-squad/minds/{{mind_name}}
```

**Phase backup safe in git history.**
Proceeding to cleanup phase...
```

### Phase 2: Cleanup Phase Outputs

#### 2.1 Delete Phase-Specific Artifacts

Remove only files produced by this phase:

```bash
case "{{phase}}" in
  research)
    # Delete sources (except sources_master.yaml if preserving)
    rm -rf squads/mmos-squad/minds/{{mind_name}}/sources/articles/*.md
    rm -rf squads/mmos-squad/minds/{{mind_name}}/sources/books/*.md
    # ... delete specific source files
    ;;

  analysis)
    # Delete all 8-layer artifacts
    rm -f squads/mmos-squad/minds/{{mind_name}}/artifacts/behavioral_patterns.md
    rm -f squads/mmos-squad/minds/{{mind_name}}/artifacts/cognitive_architecture.yaml
    # ... delete all analysis outputs
    ;;

  synthesis)
    # Delete synthesis and KB outputs
    rm -rf squads/mmos-squad/minds/{{mind_name}}/kb/
    rm -f squads/mmos-squad/minds/{{mind_name}}/artifacts/frameworks_synthesized.md
    # ... delete synthesis outputs
    ;;

  implementation)
    # Delete system prompts and identity core
    rm -rf squads/mmos-squad/minds/{{mind_name}}/system_prompts/
    rm -rf squads/mmos-squad/minds/{{mind_name}}/specialists/
    rm -f squads/mmos-squad/minds/{{mind_name}}/artifacts/identity_core.yaml
    # ... delete implementation outputs
    ;;

  testing)
    # Delete test protocols and validation reports
    rm -f squads/mmos-squad/minds/{{mind_name}}/docs/testing_protocol.md
    rm -f squads/mmos-squad/minds/{{mind_name}}/docs/logs/*-validation*.yaml
    # ... delete testing outputs
    ;;
esac
```

#### 2.2 Verify Cleanup Success

Present cleanup confirmation:

```markdown
✅ **CLEANUP COMPLETE**

Phase outputs deleted: {{count}} files

**Deleted:**
{{list_of_deleted_files}}

**Preserved:**
{{list_of_preserved_files}}

**Phase {{phase}} is now ready for fresh execution.**
```

### Phase 3: Prepare Phase Reexecution

#### 3.1 Create Reexecution Log

Document phase reexecution:

```yaml
# File: squads/mmos-squad/minds/{{mind_name}}/docs/logs/{{timestamp}}-phase-reexecution.yaml

phase_reexecution_log:
  mind_name: {{mind_name}}
  phase: {{phase}}
  initiated_at: {{ISO_timestamp}}
  initiated_by: mind-pm (reexecute-phase task)

  backup:
    commit_hash: {{commit_hash}}
    commit_tag: backup-{{mind_name}}-{{phase}}-{{timestamp}}
    reason: {{reexecution_reason}}
    files_backed_up: {{count}}

  cleanup:
    files_deleted: {{count}}
    deleted_paths:
      {{list}}

  affected_phases:
    {{#if affected_phases}}
    downstream: {{list_of_affected_phases}}
    recommendation: Review and consider reexecuting after {{phase}} completes
    {{else}}
    downstream: none
    {{/if}}

  status: ready_for_execution
  next_task: {{task_name}}
```

#### 3.2 Warn About Downstream Impact

If affected phases exist, warn user:

```markdown
⚠️ **DOWNSTREAM IMPACT WARNING**

Reexecuting **{{phase}}** may affect these phases:

{{#each affected_phases}}
**{{this}} Phase:**
- May need review after {{phase}} completes
- Consider reexecuting if {{phase}} changes significantly
- Current outputs may be inconsistent with new {{phase}} outputs
{{/each}}

**Recommendation:**
1. Complete {{phase}} reexecution first
2. Review outputs and assess downstream impact
3. Decide if downstream phases need reexecution

**Options after {{phase}} completes:**
- `*reexecute-phase {{mind_name}} {{affected_phase}}` - Reexecute specific phase
- `*status {{mind_name}}` - Check mind consistency
- Manual review and selective updates
```

### Phase 4: Invoke Phase Task

#### 4.1 Prepare Phase Context

Gather context for phase execution:

```yaml
phase_context:
  mind_name: {{mind_name}}
  phase: {{phase}}
  mode: reexecution

  reexecution_context: |
    PHASE REEXECUTION MODE

    Phase: {{phase}}
    Reason: {{reexecution_reason}}

    Previous phase outputs have been backed up and deleted.
    This is a fresh execution of the {{phase}} phase.

    {{#if affected_phases}}
    WARNING: Downstream phases ({{list}}) may need reexecution after completion.
    {{/if}}

    Goal: {{specific_improvement_goal}}
```

#### 4.2 Invoke Phase-Specific Task

Automatically launch the appropriate task:

```markdown
🚀 **LAUNCHING {{PHASE}} PHASE REEXECUTION**

Invoking: `{{task_name}}`

**Configuration:**
- Mode: Reexecution (fresh start)
- Mind: {{mind_name}}
- Phase: {{phase}}
- Context: {{reexecution_reason}}

**Phase will now execute from the beginning...**

---
```

**Invoke appropriate task:**

```yaml
research:
  task: research-collection.md
  inputs:
    mind_name: {{mind_name}}
    mode: complete_collection
    context: {{phase_context}}

analysis:
  task: cognitive-analysis.md
  inputs:
    mind_name: {{mind_name}}
    mode: layers_1_8
    context: {{phase_context}}

synthesis:
  task: synthesis-compilation.md
  inputs:
    mind_name: {{mind_name}}
    mode: complete_synthesis
    context: {{phase_context}}

implementation:
  task: system-prompt-creation.md
  inputs:
    mind_name: {{mind_name}}
    mode: generalista
    context: {{phase_context}}

testing:
  task: mind-validation.md
  inputs:
    mind_name: {{mind_name}}
    mode: complete_validation
    context: {{phase_context}}
```

**Transfer control to phase task.**

### Phase 5: Post-Execution Recommendations

#### 5.1 Present Completion Summary

After phase completes, show summary:

```markdown
## ✅ PHASE REEXECUTION COMPLETE

### Summary:

**Phase:** {{phase}}
**Mind:** {{mind_name}}

**1. Backup Created** ✅
- Commit: {{commit_hash}}
- Tag: backup-{{mind_name}}-{{phase}}-{{timestamp}}
- Rollback: Available via git

**2. Phase Reexecuted** ✅
- Task: {{task_name}}
- Duration: {{actual_duration}}
- Outputs: {{count}} files regenerated

**3. Next Steps** 📋

{{#if affected_phases}}
**⚠️ REVIEW DOWNSTREAM PHASES:**

{{#each affected_phases}}
**{{this}}:**
- Current outputs may be inconsistent with new {{phase}}
- Recommendation: Review and assess need for reexecution
- Command: `*reexecute-phase {{mind_name}} {{this}}`
{{/each}}

**Options:**
1. **Review downstream** - Manually inspect affected phases
2. **Reexecute downstream** - Use `*reexecute-phase` for each
3. **Run full validation** - `*validate {{mind_name}}` to check consistency
{{else}}
No downstream phases affected. Phase reexecution complete! ✅
{{/if}}
```

## Outputs

**Git Backup:**
- Commit with phase-specific outputs
- Tag: `backup-{{mind_name}}-{{phase}}-{{timestamp}}`
- Rollback documentation

**Cleaned Phase Directory:**
- Phase-specific artifacts deleted
- Other phases untouched
- Ready for fresh execution

**Reexecution Log:**
- `squads/mmos-squad/minds/{{mind_name}}/docs/logs/{{timestamp}}-phase-reexecution.yaml`

**Fresh Phase Outputs:**
- Regenerated by invoking phase task
- New artifacts in appropriate directories

## Validation Criteria

The phase reexecution is successful when:

- [ ] **Git backup created**: Phase outputs committed with tag
- [ ] **Cleanup completed**: Phase-specific artifacts deleted
- [ ] **Other phases preserved**: Non-phase files untouched
- [ ] **Phase task invoked**: Appropriate task launched successfully
- [ ] **Reexecution log created**: Complete documentation of reexecution
- [ ] **Downstream impact assessed**: Affected phases identified
- [ ] **User informed**: Clear next steps provided

## Rollback Procedure

If phase reexecution needs to be reverted:

```bash
# Restore phase outputs from backup
git checkout backup-{{mind_name}}-{{phase}}-{{timestamp}} -- squads/mmos-squad/minds/{{mind_name}}

# Verify restoration
git status

# Commit restoration if desired
git commit -m "rollback: restore {{phase}} phase from backup {{timestamp}}"
```

## Integration with AIOS

### Memory Layer Integration

Store phase reexecution metadata:

```typescript
memory.store({
  collection: 'mmos_phase_reexecutions',
  document: {
    mind_name: '{{mind_name}}',
    phase: '{{phase}}',
    reexecution_id: '{{uuid}}',
    initiated_at: '{{timestamp}}',
    backup_commit: '{{commit_hash}}',
    reason: '{{reexecution_reason}}',
    affected_phases: [{{list}}],
    status: 'phase_executed'
  }
});
```

### Error Handling

```yaml
error_handling:
  phase_not_executed:
    action: Warn user, offer to proceed anyway or cancel

  git_backup_failure:
    action: ABORT immediately
    message: Cannot proceed without backup

  cleanup_failure:
    action: Rollback partial cleanup from git
    restore: Phase outputs from commit

  phase_task_failure:
    action: Keep cleanup, user can retry or rollback
    message: Phase task failed, outputs cleaned but backup available
```

## Notes

- **Targeted cleanup** - Only phase outputs deleted, rest preserved
- **Dependency awareness** - Warns about downstream phase impact
- **Git safety** - Mandatory backup before any deletion
- **Rollback available** - Complete phase restoration via git
- **Automatic invocation** - Phase task launched automatically
- **Downstream guidance** - Clear recommendations for affected phases

---

**Task Version:** 1.0.0
**Compatible with:** MMOS Mind Mapper v3.0+
**Last Updated:** 2025-10-11
