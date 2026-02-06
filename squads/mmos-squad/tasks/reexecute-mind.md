---
task-id: reexecute-mind
name: Reexecute Mind Mapping from Scratch
agent: mind-pm
version: 1.0.0
purpose: Backup existing mind via git commit and restart complete MMOS pipeline from scratch

workflow-mode: interactive
elicit: true
elicitation-type: guided

prerequisites:
  - Mind directory exists at squads/mmos-squad/minds/{mind_name}
  - Git repository initialized
  - User has confirmed reexecution decision

inputs:
  - name: mind_name
    type: string
    required: true
    description: Name of the mind to reexecute
  - name: backup_reason
    type: text
    required: true
    description: Reason for reexecution (for git commit message)
  - name: preserve_sources
    type: boolean
    required: false
    default: true
    description: Keep existing sources or start completely fresh

outputs:
  - path: "squads/mmos-squad/minds/{mind_name}/.backup-{timestamp}/"
    description: Git commit with full backup
  - path: "squads/mmos-squad/minds/{mind_name}/"
    description: Clean mind directory ready for new pipeline execution

dependencies:
  agents:
    - mind-mapper
  tasks:
    - execute-mmos-pipeline.md

validation:
  success-criteria:
    - "Git commit with backup created"
    - "Mind directory cleaned (except sources if preserved)"
    - "User confirmed ready to proceed"
    - "Execute pipeline automatically triggered"

estimated-duration: "5-10 minutes for backup and cleanup"
---

# Reexecute Mind Mapping Task

## Purpose

Safely backup an existing mind mapping via git commit and completely restart the MMOS pipeline from scratch. This is useful when:
- Mind quality is unsatisfactory and needs complete rework
- New methodology or approach should be applied
- Sources have changed significantly
- Want to test different configuration or parameters

## When to Use This Task

**Use this task when:**
- Need to completely redo a mind mapping
- Current mind has fundamental issues requiring full restart
- Want to preserve history but start fresh
- Testing different MMOS approaches on same personality

**Do NOT use this task when:**
- Need incremental updates (use brownfield-update instead)
- Only specific phases need rework (use phase-specific tasks)
- Just adding new sources (use research-collection task)

## Key Activities & Instructions

### Phase 0: Pre-Reexecution Validation

#### 0.1 Verify Mind Exists

Check that the specified mind exists:

```bash
# Verify directory exists
test -d "squads/mmos-squad/minds/{{mind_name}}" || echo "ERROR: Mind not found"
```

If mind doesn't exist, inform user and exit gracefully.

#### 0.2 Confirm User Intent (ELICIT)

Present reexecution warning to user:

```markdown
## ⚠️ REEXECUTION WARNING

You are about to **completely restart** the mind mapping for: **{{mind_name}}**

### What will happen:

1. **✅ BACKUP (Safe)**
   - Complete git commit of current state
   - Commit message: "backup: {{mind_name}} before reexecution - {{reason}}"
   - All files preserved in git history
   - Rollback possible at any time

2. **🗑️ CLEANUP (Destructive)**
   - All artifacts deleted
   - All system prompts removed
   - All KB chunks deleted
   - All docs (PRD, TODO, logs) removed
   - Only preserved: {{sources if user chooses}}

3. **🔄 RESTART**
   - Execute MMOS pipeline from scratch
   - Start at Phase 1: Viability Assessment
   - All 6 phases re-executed
   - Estimated time: 8-12 hours
   - Estimated tokens: 2-3M

### Current Mind Status:
- Created: {{creation_date}}
- Version: {{current_version}}
- Fidelity: {{if_available}}%
- Last updated: {{last_update}}
- Total artifacts: {{count}}
- System prompts: {{count}}

### Backup Information:
- Git commit will preserve: ALL current files
- Commit tag: backup-{{mind_name}}-{{timestamp}}
- Rollback command: `git checkout {{commit_hash}} -- squads/mmos-squad/minds/{{mind_name}}`

---

**CRITICAL DECISION REQUIRED:**

Type **CONFIRM** to proceed with reexecution
Type **CANCEL** to abort
Type **QUESTIONS** to discuss before deciding

>
```

**Wait for user response.**

#### 0.3 Handle User Response

**If CANCEL:**
- Exit gracefully with message: "Reexecution cancelled. Mind {{mind_name}} unchanged."
- End task

**If QUESTIONS:**
- Enter discussion mode
- Answer user questions
- Re-present confirmation prompt
- Wait for CONFIRM or CANCEL

**If CONFIRM:**
- Proceed to Phase 1

### Phase 1: Backup via Git

#### 1.1 Check Git Status

Verify git repository is clean or has only the mind being reexecuted:

```bash
# Check for uncommitted changes outside the mind directory
git status --porcelain | grep -v "squads/mmos-squad/minds/{{mind_name}}" || echo "Clean"
```

If other uncommitted changes exist, **WARN USER:**

```markdown
⚠️ **Git Status Warning**

You have uncommitted changes OUTSIDE of the mind directory:

{{list_of_files}}

**Options:**
1. **CONTINUE** - Only commit {{mind_name}} changes, ignore others
2. **STASH** - Stash other changes, then proceed
3. **ABORT** - Fix git status manually first

Type 1, 2, or 3:
```

Handle user choice accordingly.

#### 1.2 Create Backup Commit

Execute git commit with backup:

```bash
# Add all files from mind directory
git add squads/mmos-squad/minds/{{mind_name}}

# Create commit with detailed backup message
git commit -m "backup: {{mind_name}} before reexecution

Reason: {{backup_reason}}

Backup Details:
- Mind: {{mind_name}}
- Timestamp: {{ISO_timestamp}}
- Current version: {{version}}
- Fidelity: {{if_available}}%
- Task: reexecute-mind.md

Status before reexecution:
- Artifacts: {{count}} files
- System prompts: {{count}} versions
- KB chunks: {{count}} files
- Sources: {{count}} files
- Docs: {{list}}

This commit preserves complete state before full pipeline restart.
Rollback: git checkout {{commit_hash}} -- squads/mmos-squad/minds/{{mind_name}}

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

#### 1.3 Verify Backup Success

Check commit was created:

```bash
# Get last commit hash
git log -1 --oneline

# Verify mind files are in commit
git show --name-only HEAD | grep "squads/mmos-squad/minds/{{mind_name}}"
```

If commit failed, **ABORT** and inform user.

#### 1.4 Tag Backup Commit (Optional)

Create git tag for easy reference:

```bash
git tag -a "backup-{{mind_name}}-{{timestamp}}" -m "Backup before reexecution of {{mind_name}}"
```

Present backup confirmation to user:

```markdown
✅ **BACKUP COMPLETE**

Git commit created: {{commit_hash}}
Git tag: backup-{{mind_name}}-{{timestamp}}

**Rollback command** (if needed later):
```bash
git checkout {{commit_hash}} -- squads/mmos-squad/minds/{{mind_name}}
```

**Current state preserved in git history.**
Proceeding to cleanup phase...
```

### Phase 2: Cleanup Mind Directory

#### 2.1 Determine Cleanup Scope

Based on `preserve_sources` input:

**If preserve_sources = true:**
```yaml
preserve:
  - squads/mmos-squad/minds/{{mind_name}}/sources/**
  - squads/mmos-squad/minds/{{mind_name}}/sources/sources_master.yaml
  - squads/mmos-squad/minds/{{mind_name}}/sources/priority_matrix.yaml

delete:
  - squads/mmos-squad/minds/{{mind_name}}/artifacts/**
  - squads/mmos-squad/minds/{{mind_name}}/kb/**
  - squads/mmos-squad/minds/{{mind_name}}/system_prompts/**
  - squads/mmos-squad/minds/{{mind_name}}/specialists/**
  - squads/mmos-squad/minds/{{mind_name}}/docs/**
  - squads/mmos-squad/minds/{{mind_name}}/metadata/**
```

**If preserve_sources = false:**
```yaml
delete:
  - squads/mmos-squad/minds/{{mind_name}}/** (everything)
```

#### 2.2 Execute Cleanup

Delete specified directories:

```bash
# Preserve sources if requested
if [ "{{preserve_sources}}" = "true" ]; then
  # Delete everything except sources
  rm -rf squads/mmos-squad/minds/{{mind_name}}/artifacts
  rm -rf squads/mmos-squad/minds/{{mind_name}}/kb
  rm -rf squads/mmos-squad/minds/{{mind_name}}/system_prompts
  rm -rf squads/mmos-squad/minds/{{mind_name}}/specialists
  rm -rf squads/mmos-squad/minds/{{mind_name}}/docs
  rm -rf squads/mmos-squad/minds/{{mind_name}}/metadata
else
  # Delete everything
  rm -rf squads/mmos-squad/minds/{{mind_name}}
  # Recreate base directory
  mkdir -p squads/mmos-squad/minds/{{mind_name}}
fi
```

#### 2.3 Verify Cleanup Success

Confirm directory structure:

```bash
# List remaining files
tree squads/mmos-squad/minds/{{mind_name}} -L 2
```

Present cleanup confirmation:

```markdown
✅ **CLEANUP COMPLETE**

Mind directory cleaned: squads/mmos-squad/minds/{{mind_name}}/

**Deleted:**
{{list_of_deleted_directories}}

{{#if preserve_sources}}
**Preserved:**
- sources/ ({{count}} files)
- sources_master.yaml
- priority_matrix.yaml (if exists)
{{/if}}

**Mind is now ready for fresh pipeline execution.**
```

### Phase 3: Prepare Fresh Execution

#### 3.1 Create Initial Directory Structure

Set up clean directory structure:

```bash
mkdir -p squads/mmos-squad/minds/{{mind_name}}/docs/logs
{{#unless preserve_sources}}
mkdir -p squads/mmos-squad/minds/{{mind_name}}/sources
{{/unless}}
mkdir -p squads/mmos-squad/minds/{{mind_name}}/artifacts
mkdir -p squads/mmos-squad/minds/{{mind_name}}/kb
mkdir -p squads/mmos-squad/minds/{{mind_name}}/system_prompts
mkdir -p squads/mmos-squad/minds/{{mind_name}}/metadata
```

#### 3.2 Initialize Reexecution Log

Create execution log:

```yaml
# File: squads/mmos-squad/minds/{{mind_name}}/docs/logs/{{timestamp}}-reexecution-init.yaml

reexecution_log:
  mind_name: {{mind_name}}
  initiated_at: {{ISO_timestamp}}
  initiated_by: mind-pm (reexecute-mind task)

  backup:
    commit_hash: {{commit_hash}}
    commit_tag: backup-{{mind_name}}-{{timestamp}}
    backup_reason: {{backup_reason}}

  cleanup:
    preserved_sources: {{boolean}}
    sources_count: {{if_preserved}}
    deleted:
      - artifacts/
      - kb/
      - system_prompts/
      - specialists/
      - docs/
      - metadata/

  status: ready_for_execution
  next_phase: viability_assessment

  execution_plan:
    mode: greenfield
    start_phase: viability
    estimated_duration: 8-12 hours
    estimated_tokens: 2-3M
```

#### 3.3 Update Catalog Status

Update `squads/mmos-squad/minds/catalog.md` if mind is already listed:

```yaml
# Mark mind as "reexecution_in_progress"
- name: {{mind_name}}
  status: reexecution_in_progress
  previous_version: {{old_version}}
  reexecution_initiated: {{timestamp}}
  backup_commit: {{commit_hash}}
```

### Phase 4: Launch Fresh Pipeline

#### 4.1 Prepare Pipeline Context

Gather context for new pipeline execution:

```yaml
pipeline_context:
  mind_name: {{mind_name}}
  mode: greenfield
  start_phase: viability

  {{#if preserve_sources}}
  initial_context: |
    REEXECUTION MODE: Using existing sources from previous mapping.

    Sources preserved:
    {{list_sources}}

    Previous mapping fidelity: {{if_available}}%

    Reexecution reason: {{backup_reason}}

    Goal: Achieve better results with improved methodology or approach.
  {{else}}
  initial_context: |
    REEXECUTION MODE: Complete fresh start, including source collection.

    Reexecution reason: {{backup_reason}}

    Goal: Complete restart of mind mapping process.
  {{/if}}
```

#### 4.2 Invoke Execute Pipeline Task

Automatically launch the MMOS pipeline:

```markdown
🚀 **LAUNCHING FRESH MMOS PIPELINE**

Invoking: `execute-mmos-pipeline.md`

**Configuration:**
- Mode: GREENFIELD
- Mind: {{mind_name}}
- Start Phase: Viability Assessment
- Sources: {{preserved / fresh collection}}

**Pipeline will now begin with Phase 1: Viability Assessment...**

---
```

**Invoke task:**
```yaml
task: execute-mmos-pipeline.md
inputs:
  mind_name: {{mind_name}}
  workflow_mode: greenfield
  start_phase: viability
  initial_context: {{pipeline_context}}
```

**Transfer control to execute-mmos-pipeline task.**

### Phase 5: Handoff Confirmation

#### 5.1 Present Handoff Summary

Show final summary before handoff:

```markdown
## ✅ REEXECUTION PREPARATION COMPLETE

### Summary:

**1. Backup Created** ✅
- Commit: {{commit_hash}}
- Tag: backup-{{mind_name}}-{{timestamp}}
- Rollback: `git checkout {{commit_hash}} -- squads/mmos-squad/minds/{{mind_name}}`

**2. Cleanup Executed** ✅
- Artifacts: Deleted
- KB: Deleted
- System Prompts: Deleted
- Docs: Deleted
{{#if preserve_sources}}
- Sources: **Preserved** ({{count}} files)
{{else}}
- Sources: Deleted
{{/if}}

**3. Fresh Execution Ready** ✅
- Directory: Clean and structured
- Log: Initialized
- Catalog: Updated
- Context: Prepared

**4. Pipeline Launching** 🚀
- Task: execute-mmos-pipeline.md
- Mode: GREENFIELD
- Start: Viability Assessment

---

**Control transferred to execute-mmos-pipeline task.**

You will now go through the complete 6-phase MMOS pipeline.
Previous mapping backed up and safe in git history.

Good luck! 🧠
```

## Outputs

**Git Backup:**
- Commit with complete mind state
- Tag: `backup-{{mind_name}}-{{timestamp}}`
- Rollback documentation

**Cleaned Mind Directory:**
- `squads/mmos-squad/minds/{{mind_name}}/` - Clean structure
- `squads/mmos-squad/minds/{{mind_name}}/sources/` - Preserved if requested
- `squads/mmos-squad/minds/{{mind_name}}/docs/logs/{{timestamp}}-reexecution-init.yaml` - Reexecution log

**Pipeline Launch:**
- Automatic invocation of `execute-mmos-pipeline.md`
- Context prepared for fresh greenfield execution

## Validation Criteria

The reexecution preparation is successful when:

- [ ] **Git backup created**: Commit exists with all mind files
- [ ] **Git tag created**: Easy reference for rollback
- [ ] **Cleanup completed**: Specified directories deleted
- [ ] **Sources preserved**: If requested, sources intact
- [ ] **Directory structured**: Clean folders created
- [ ] **Log initialized**: Reexecution log created
- [ ] **Catalog updated**: Mind status marked as reexecution in progress
- [ ] **Pipeline invoked**: execute-mmos-pipeline task launched

## Rollback Procedure

If reexecution needs to be reverted:

```bash
# Method 1: Git checkout (partial restore)
git checkout {{commit_hash}} -- squads/mmos-squad/minds/{{mind_name}}

# Method 2: Git revert (if committed cleanup)
git revert {{cleanup_commit_hash}}

# Method 3: Tag-based restore
git checkout backup-{{mind_name}}-{{timestamp}} -- squads/mmos-squad/minds/{{mind_name}}
```

## Integration with AIOS

### Memory Layer Integration

Store reexecution metadata:

```typescript
memory.store({
  collection: 'mmos_reexecutions',
  document: {
    mind_name: '{{mind_name}}',
    reexecution_id: '{{uuid}}',
    initiated_at: '{{timestamp}}',
    backup_commit: '{{commit_hash}}',
    reason: '{{backup_reason}}',
    preserve_sources: {{boolean}},
    status: 'pipeline_launched'
  }
});
```

### Error Handling

```yaml
error_handling:
  git_commit_failure:
    action: ABORT immediately
    message: Cannot proceed without backup

  cleanup_failure:
    action: Rollback partial cleanup
    restore: From git commit

  directory_not_found:
    action: Exit gracefully
    message: Mind {{mind_name}} does not exist

  user_cancellation:
    action: Exit without changes
    message: Reexecution cancelled by user
```

## Notes

- **Backup is mandatory** - Never skip git commit
- **User confirmation required** - Reexecution is destructive
- **Sources preservation recommended** - Saves time if sources are good
- **Rollback always available** - Git history preserves everything
- **Automatic pipeline launch** - Seamless transition to fresh execution
- **Catalog tracking** - Mind status updated for visibility
- **Detailed logging** - Complete audit trail maintained

---

**Task Version:** 1.0.0
**Compatible with:** MMOS Mind Mapper v3.0+
**Last Updated:** 2025-10-11
