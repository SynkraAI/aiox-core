---
task-id: brownfield-update
name: Incremental Mind Update (Brownfield Mode)
agent: mind-mapper
version: 1.0.0
purpose: Execute safe incremental updates to existing production minds without full reprocessing

workflow-mode: interactive
elicit: true
elicitation-type: custom

prerequisites:
  - Existing mind in production
  - Brownfield update plan generated
  - Rollback capability verified

inputs:
  - name: mind_name
    type: string
    required: true
  - name: update_type
    type: enum
    required: true
    options: ["new_sources", "layer_update", "framework_refinement", "contradiction_resolution"]
  - name: rollback_enabled
    type: boolean
    required: true
    default: true

outputs:
  - path: "squads/mmos-squad/minds/{mind_name}/brownfield/update-plan.yaml"
    description: Brownfield update plan with safety checkpoints
  - path: "squads/mmos-squad/minds/{mind_name}/brownfield/rollback/"
    description: Rollback snapshots for safe recovery

dependencies:
  templates:
    - brownfield-plan.yaml
  checklists:
    - brownfield-safety-checklist.md

validation:
  success-criteria:
    - "Update applied without breaking existing functionality"
    - "Fidelity score maintained or improved"
    - "Rollback verified and functional"

estimated-duration: "1-2 hours for incremental update"
resource-savings: "60-75% savings vs full greenfield reprocessing"
---

# Brownfield Update Task

## Purpose

Execute incremental updates to existing MMOS mind clones without full pipeline reprocessing. This task handles new source integration, targeted re-analysis of specific layers, prompt versioning, regression testing, and rollback safety. Achieves 60-75% resource savings vs full greenfield re-execution while maintaining clone fidelity and production stability.

**Key Benefit:** Update existing minds with new insights without starting from scratch.

## When to Use This Task

**Use this task when:**
- Updating existing production mind with new sources
- Refining specific cognitive layers based on new information
- Incrementing system prompt version with improvements
- Responding to user feedback or production issues
- New content from subject becomes available

**Do NOT use this task when:**
- Creating new mind from scratch (use execute-mmos-pipeline greenfield)
- Fundamental re-architecture needed (may require full reprocessing)
- Mind never completed full pipeline (finish greenfield first)
- **Mind Name**: Existing mind being updated
- **Update Type**: One of `new_sources`, `layer_refinement`, `prompt_iteration`, `regression_test`, or `full`
- **Current Version**: Existing system prompt version (e.g., "v1.2")
- **Update Reason**: Why update is needed (new sources / feedback / bugs)

### Optional Inputs
- **New Sources**: List of new sources to integrate
- **Target Layers**: Which layers to re-analyze (if layer_refinement)
- **Specific Issues**: Known problems to fix (if prompt_iteration)
- **Rollback Plan**: Custom rollback requirements

### Mode Descriptions

**`new_sources`** - Integrate new sources, update affected artifacts
**`layer_refinement`** - Re-analyze specific layers with new insights
**`prompt_iteration`** - Increment prompt version with fixes/improvements
**`regression_test`** - Validate updates don't break existing behavior
**`full`** - Execute complete brownfield update workflow

## Key Activities & Instructions

### Brownfield Update Principles

```yaml
brownfield_principles:
  incremental_only:
    - "Never rebuild what's working"
    - "Update only affected components"

  version_control:
    - "All prompts versioned (v1.0, v1.1, v1.2...)"
    - "Maintain version history"
    - "Support rollback to any version"

  safety_first:
    - "Backup before changes"
    - "Regression testing mandatory"
    - "Production stability paramount"

  change_tracking:
    - "Document what changed and why"
    - "Log update decisions"
    - "Maintain audit trail"

  efficiency:
    - "60-75% resource savings vs greenfield"
    - "2-4 hours vs 8-12 hours"
    - "500K-1M tokens vs 2-3M tokens"
```

### Mode: New Sources

#### Objective

Integrate newly available sources into existing mind's knowledge base and update affected cognitive artifacts.

**New Source Integration Workflow:**

#### Step 1: Backup Current State

```yaml
backup_procedure:
  backup_location: "minds/{mind}/.backup-{timestamp}/"

  files_to_backup:
    - system_prompts/{current_version}-generalista.md
    - artifacts/* (all cognitive artifacts)
    - kb/* (knowledge base chunks)
    - docs/operational_manual.md
    - metadata/dependencies.yaml

  backup_metadata:
    version: "{{current_version}}"
    timestamp: "{{backup_time}}"
    reason: "{{update_reason}}"
    restore_command: "{{how_to_rollback}}"
```

**Execute backup:**
```bash
cp -r minds/{mind}/system_prompts minds/{mind}/.backup-{timestamp}/system_prompts
cp -r minds/{mind}/artifacts minds/{mind}/.backup-{timestamp}/artifacts
[... etc ...]
```

#### Step 2: Source Discovery & Collection

**Use research-collection task in differential mode:**

```yaml
differential_source_collection:
  existing_sources: "{{from_sources_master.yaml}}"
  new_sources: [{{user_provided_or_discovered}}]

  collection_process:
    - "Collect new sources only"
    - "Add to sources/{type}/ directories"
    - "Update sources_master.yaml"
    - "Generate source differential report"

  source_differential:
    added: [{{new_source_ids}}]
    removed: [{{if_any_deprecated}}]
    updated: [{{if_any_revised}}]
```

**Output:** `minds/{mind}/docs/logs/{timestamp}-source_differential.yaml`

```yaml
source_differential:
  update_timestamp: "{{timestamp}}"
  previous_source_count: {{count}}
  new_source_count: {{count}}

  new_sources:
    - source_id: "{{id}}"
      title: "{{title}}"
      type: "{{type}}"
      tier: {{1/2/3}}
      publication_date: "{{date}}"
      relevance: "{{why_this_matters}}"

  impact_assessment:
    layers_affected: [{{which_layers_need_update}}]
    artifacts_to_update: [{{which_files}}]
    frameworks_impacted: [{{if_any}}]

  update_recommendation:
    update_type: {{minor/moderate/major}}
    estimated_effort: "{{hours}} hours"
    re_analysis_required: [{{layers}}]
```

#### Step 3: Differential Analysis

**For each affected layer, execute targeted re-analysis:**

```yaml
differential_analysis:
  process:
    - "Load existing artifact for layer"
    - "Analyze new sources for layer"
    - "Identify deltas (new patterns, changes, contradictions)"
    - "Merge new findings with existing"
    - "Flag conflicts for human review"

  merge_strategies:
    additive:
      description: "New content adds to existing without conflict"
      action: "Append to artifact"

    refinement:
      description: "New content refines existing understanding"
      action: "Update artifact with better precision"

    conflict:
      description: "New content contradicts existing"
      action: "Flag for human decision"

    evolution:
      description: "Subject's thinking has evolved"
      action: "Add temporal note, update with current thinking"
```

**Example: Layer 6 (Values) Update:**

```yaml
layer_6_update:
  existing_values: [{{from_values_hierarchy.yaml}}]

  new_source_findings:
    new_value_discovered: "{{value}}"
    existing_value_refinement: "{{which_value}} - {{new_insight}}"
    potential_conflict: "{{what_seems_to_contradict}}"

  merge_decision:
    add: ["{{new_value}}"]
    refine: ["{{existing_value}} - {{updated_description}}"]
    conflict_resolution: "{{human_decision_required}}"

  human_review_required: {{yes/no}}
  reason: "{{if_conflicts_found}}"
```

**For each affected layer:**
1. Load existing artifact
2. Analyze new sources
3. Generate delta report
4. Merge or flag conflicts
5. Update artifact file
6. Log changes

**Output:** Updated artifacts with version increment
- `minds/{mind}/artifacts/{{artifact_name}}.md` (updated)
- `minds/{mind}/docs/logs/{timestamp}-layer_updates.yaml` (change log)

#### Step 4: Knowledge Base Update

**If new sources add significant knowledge:**

```yaml
kb_update_process:
  existing_chunks: {{count}}

  new_chunk_generation:
    - "Extract knowledge from new sources"
    - "Create new chunks following existing format"
    - "Add to kb/ directory"
    - "Update kb/index.yaml"

  chunk_deduplication:
    - "Check for overlapping content"
    - "Merge if significant overlap"
    - "Keep separate if distinct"

  updated_kb:
    new_chunks: [{{chunk_ids}}]
    total_chunks: {{count}}
```

#### Step 5: Prompt Update Recommendation

**Assess if system prompt needs updating:**

```yaml
prompt_update_assessment:
  changes_requiring_prompt_update:
    - "New Layer 6-8 findings (identity changes)"
    - "New frameworks discovered"
    - "Significant new knowledge domain"
    - "Contradictions resolved"

  changes_not_requiring_prompt_update:
    - "Minor behavioral pattern additions"
    - "Additional examples for existing patterns"
    - "Source quality improvements"

  recommendation:
    update_prompt: {{yes/no}}
    reason: "{{why_or_why_not}}"
    affected_sections: [{{which_parts_of_prompt}}]
```

**If prompt update needed:**
Proceed to `prompt_iteration` mode.

**If not needed:**
Document that KB updated but prompt stable.

### Mode: Layer Refinement

#### Objective

Re-analyze specific cognitive layers based on new insights, feedback, or discovered gaps.

**Layer Refinement Workflow:**

#### Step 1: Identify Target Layers

```yaml
layer_refinement_targeting:
  user_specified: [{{layers_user_wants_refined}}]

  or_issue_driven:
    - issue: "{{production_problem}}"
      suspected_layer: {{which_layer}}
      refinement_focus: "{{what_to_improve}}"

  refinement_scope:
    full_re_analysis: "{{if_major_gaps}}"
    targeted_update: "{{if_specific_issue}}"
```

#### Step 2: Execute Targeted Re-Analysis

**Use cognitive-analysis task in targeted mode:**

```yaml
targeted_re_analysis:
  layer: {{target_layer}}
  existing_artifact: "{{current_artifact_path}}"

  re_analysis_process:
    - "Load existing artifact as baseline"
    - "Re-read sources with refined focus"
    - "Extract missed patterns"
    - "Validate existing findings"
    - "Update artifact with improvements"

  quality_gates:
    - "Triangulation still valid (≥3 sources)"
    - "No regression (existing good findings preserved)"
    - "Improvement measurable"
    - "Human validation for identity layers (6-8)"
```

**For identity layers (6-8):**

**Human validation required** even in brownfield mode.

```markdown
## LAYER {{N}} REFINEMENT VALIDATION

### Original Findings (v{{previous_version}}):
{{original_content}}

### Refined Findings (v{{new_version}}):
{{updated_content}}

### Changes Made:
- Added: {{what_added}}
- Refined: {{what_refined}}
- Removed: {{what_removed}}
- Unchanged: {{what_stable}}

### Reason for Changes:
{{why_refinement_was_needed}}

### Impact Assessment:
- Prompt sections affected: [{{list}}]
- Fidelity impact: {{expected_improvement}}

---

**VALIDATION REQUIRED:**

1. **APPROVE** - Refinements improve accuracy, proceed
2. **REVISE** - Adjust refinements: [provide feedback]
3. **REVERT** - Refinement made things worse, rollback

**Type 1, 2, or 3:**
```

#### Step 3: Cascade Updates

**If refined layer affects downstream artifacts:**

```yaml
cascade_analysis:
  layer_dependencies:
    layer_8_updated: ["affects layers 7, 6, 5 interpretation"]
    layer_7_updated: ["affects layer 6 prioritization"]
    layer_6_updated: ["affects layer 5 application"]
    layer_5_updated: ["affects layer 4 interpretation"]

  cascade_update_process:
    - "Identify dependent artifacts"
    - "Check if updates change interpretation"
    - "Update if necessary"
    - "Document cascade changes"
```

### Mode: Prompt Iteration

#### Objective

Increment system prompt version with fixes, improvements, or new layer integrations.

**Prompt Iteration Workflow:**

#### Step 1: Version Management

```yaml
version_control:
  current_version: "v{{major}}.{{minor}}"
  new_version: "v{{major}}.{{minor+1}}"

  version_increment_rules:
    minor_increment: "Bug fixes, refinements, small additions"
    major_increment: "Fundamental changes, new capabilities, major updates"

  version_metadata:
    changes: [{{what_changed}}]
    reason: "{{why_changed}}"
    affected_sections: [{{list}}]
    backward_compatible: {{yes/no}}
```

#### Step 2: Compile Updated Prompt

**Use system-prompt-creation task in iteration mode:**

```yaml
prompt_iteration_process:
  base_prompt: "minds/{mind}/system_prompts/{timestamp}-v{current}-generalista.md"

  updates_to_apply:
    - section: "{{section_name}}"
      change_type: {{add/modify/remove}}
      content: "{{new_content}}"
      reason: "{{why}}"

  compilation:
    - "Load base prompt"
    - "Apply updates section by section"
    - "Validate coherence (no new contradictions except Layer 8)"
    - "Optimize token count if changed"
    - "Generate v{new} prompt"

  diff_generation:
    - "Generate human-readable diff"
    - "Highlight changes"
    - "Document rationale for each change"
```

**Output:** `minds/{mind}/system_prompts/{timestamp}-v{new}-generalista.md`

**Output:** `minds/{mind}/docs/logs/{timestamp}-prompt_diff_v{current}_to_v{new}.md`

```markdown
# Prompt Version Diff: v{{current}} → v{{new}}

## Summary of Changes

**Version:** {{current}} → {{new}}
**Date:** {{timestamp}}
**Change Type:** {{minor/major}}
**Reason:** {{why_updated}}

## Detailed Changes

### Section: Identity Block
**Change Type:** Modified
**Before:**
```
{{old_content}}
```
**After:**
```
{{new_content}}
```
**Reason:** {{explanation}}

---

[... repeat for all changed sections ...]

## Impact Assessment
- Token count: {{old}} → {{new}} ({{delta}})
- Affected behaviors: [{{list}}]
- Regression risk: {{low/medium/high}}
- Testing required: [{{which_tests}}]
```

#### Step 3: Human Review

**Present changes to user:**

```markdown
## PROMPT ITERATION REVIEW: v{{current}} → v{{new}}

### Changes Summary:
- {{count}} sections modified
- {{count}} new sections added
- {{count}} sections removed
- Token delta: {{+/-_count}}

### Key Improvements:
- {{improvement_1}}
- {{improvement_2}}

### Potential Risks:
- {{risk_1}} ({{mitigation}})

### Preview Updated Sections:
{{show_key_changes}}

---

**REVIEW OPTIONS:**

1. **APPROVE** - Proceed to regression testing
2. **REVISE** - Adjust changes: [specify]
3. **REVERT** - Changes not working, rollback

**Type 1, 2, or 3:**
```

### Mode: Regression Test

#### Objective

Validate that updates don't break existing working behavior.

**Regression Testing Workflow:**

#### Step 1: Load Historical Test Results

```yaml
regression_baseline:
  previous_version: "v{{current}}"
  previous_tests: "minds/{mind}/docs/logs/{timestamp}-test_cases.yaml"
  previous_results: "minds/{mind}/docs/logs/{timestamp}-validation_report.yaml"

  baseline_performance:
    fidelity: {{percentage}}%
    tests_passed: {{count}}/{{total}}
    critical_tests_passed: {{all/some}}

  tests_to_rerun:
    all_tests: {{if_major_change}}
    affected_tests: {{if_minor_change}}
    critical_tests_only: {{if_very_minor_change}}
```

#### Step 2: Execute Regression Tests

**Use mind-validation task in regression mode:**

```yaml
regression_test_execution:
  test_selection:
    baseline_tests: [{{from_previous_validation}}]
    additional_tests: [{{if_testing_new_features}}]

  execution:
    - "Run selected tests on v{{new}} prompt"
    - "Compare results to v{{current}} baseline"
    - "Flag any regressions"
    - "Validate improvements as expected"

  regression_detection:
    - test_id: "{{id}}"
      v_current_result: "{{pass/fail}}"
      v_new_result: "{{pass/fail}}"
      status: {{regression/improvement/stable}}
```

#### Step 3: Regression Analysis

```yaml
regression_report:
  overall_status: {{pass/fail}}

  regressions_found: {{count}}
  regressions:
    - test_id: "{{id}}"
      category: "{{type}}"
      severity: {{critical/major/minor}}
      v_current: "{{score}}"
      v_new: "{{score}}"
      delta: {{negative}}
      issue: "{{what_broke}}"
      suspected_cause: "{{which_change_likely_caused}}"

  improvements: {{count}}
  improvements:
    - test_id: "{{id}}"
      v_current: "{{score}}"
      v_new: "{{score}}"
      delta: {{positive}}

  stable_tests: {{count}}

  fidelity_comparison:
    v_current: {{percentage}}%
    v_new: {{percentage}}%
    delta: {{+/-_percentage}}%

  decision:
    proceed: {{yes/no}}
    rationale: "{{explanation}}"
    required_fixes: [{{if_regressions_found}}]
```

**If regressions found:**

```markdown
## REGRESSION DETECTED

### Regressions: {{count}}

**Critical Regressions:** {{count}}
- {{test_id}}: {{description}}
  - v{{current}}: {{score}} → v{{new}}: {{score}}
  - Issue: {{what_broke}}
  - Suspected cause: {{which_change}}

**Recommended Action:**
{{if_critical}} REVERT and fix issue before deploying
{{if_minor}} Accept regression if improvements outweigh, or fix
{{if_none}} Proceed to deployment

---

**DECISION:**

1. **REVERT** - Rollback to v{{current}}, fix issues, re-iterate
2. **ACCEPT_AND_DEPLOY** - Regressions acceptable given improvements
3. **FIX_FORWARD** - Address regressions in v{{new+1}}

**Type 1, 2, or 3:**
```

### Mode: Full (Complete Brownfield Update)

**Execute complete brownfield workflow:**

1. **Backup current state**
2. **Integrate new sources** (if any)
3. **Execute differential analysis** on affected layers
4. **Update affected artifacts**
5. **Update knowledge base** (if needed)
6. **Iterate system prompt** (if warranted)
7. **Human review** of prompt changes
8. **Execute regression testing**
9. **Compile update report**
10. **Deploy or rollback** based on results

**Brownfield Update Summary:**

```markdown
# BROWNFIELD UPDATE COMPLETE

## Update Summary

**Mind:** {{name}}
**Previous Version:** v{{current}}
**New Version:** v{{new}}
**Update Date:** {{timestamp}}
**Update Type:** {{minor/major}}

## Changes Applied

### New Sources Integrated: {{count}}
- {{source_1}}
- {{source_2}}

### Layers Updated:
- Layer {{N}}: {{what_changed}}
- Layer {{N}}: {{what_changed}}

### Artifacts Modified:
- {{artifact_1}} - {{description}}
- {{artifact_2}} - {{description}}

### System Prompt Changes:
- {{section}}: {{modification}}
- Token delta: {{+/-_count}}

## Quality Metrics

### Fidelity:
- Previous: {{percentage}}%
- Current: {{percentage}}%
- Delta: {{+/-}}%

### Regression Testing:
- Tests run: {{count}}
- Passed: {{count}}
- Regressions: {{count}}
- Improvements: {{count}}

## Rollback Information

**Backup Location:** minds/{mind}/.backup-{timestamp}/

**Rollback Command:**
```bash
{{command_to_restore_previous_version}}
```

## Production Status

{{if_deployed}}
✅ Deployed to production as v{{new}}
Previous version available for rollback if needed

{{if_not_deployed}}
⚠️ Not deployed - issues require resolution
See regression report for details

## Next Steps

{{next_actions}}
```

## Outputs

### New Sources Mode Outputs
- `minds/{mind}/docs/logs/{timestamp}-source_differential.yaml`
- `minds/{mind}/docs/logs/{timestamp}-layer_updates.yaml`
- Updated artifacts
- Updated sources_master.yaml

### Layer Refinement Outputs
- Updated layer artifact(s)
- `minds/{mind}/docs/logs/{timestamp}-layer_refinement.yaml`

### Prompt Iteration Outputs
- `minds/{mind}/system_prompts/{timestamp}-v{new}-generalista.md`
- `minds/{mind}/docs/logs/{timestamp}-prompt_diff_v{current}_to_v{new}.md`

### Regression Test Outputs
- `minds/{mind}/docs/logs/{timestamp}-regression_report.yaml`

### Full Mode Outputs
- All of the above
- `minds/{mind}/.backup-{timestamp}/` (backup directory)
- `minds/{mind}/docs/logs/{timestamp}-brownfield_update_summary.md`

## Validation Criteria

Brownfield update is successful when:

- [ ] **Backup created**: Current state safely backed up before changes
- [ ] **New sources integrated**: If applicable, sources added and analyzed
- [ ] **Differential analysis complete**: Only affected components updated
- [ ] **Artifacts updated**: Layer updates applied with change tracking
- [ ] **Prompt iterated**: If needed, new version compiled and reviewed
- [ ] **Regression testing passed**: No critical regressions introduced
- [ ] **Fidelity maintained or improved**: Update doesn't harm clone quality
- [ ] **Documentation complete**: All changes logged and traceable
- [ ] **Rollback available**: Clear path to revert if issues arise
- [ ] **Production decision made**: Deploy or fix-forward plan established

## Integration with AIOS

### Memory Layer
```typescript
memory.store({
  collection: 'mmos_updates',
  document: {
    mind_name: '{{mind}}',
    previous_version: '{{v_current}}',
    new_version: '{{v_new}}',
    update_type: '{{type}}',
    update_date: '{{timestamp}}',
    fidelity_delta: {{+/-}},
    regressions: {{count}},
    deployed: {{boolean}}
  }
});
```

### Agent Coordination
- **@analyst**: Differential analysis and layer refinement
- **@architect**: Prompt iteration and compilation
- **@qa**: Regression testing
- **User**: Approval of updates (mandatory for identity layers)

### Performance Estimates
- New sources integration: 1-2 hours, 150K tokens
- Layer refinement: 0.5-1 hour per layer, 50K tokens per layer
- Prompt iteration: 1-2 hours, 80K tokens
- Regression testing: 1-2 hours, 100K tokens
- **Total brownfield: 3-7 hours, 500K-1M tokens (60-75% savings vs greenfield)**

## Notes

- **Brownfield saves 60-75% resources**: Only update what's needed
- **Version control is critical**: Always maintain version history
- **Backup before changes**: Rollback safety paramount
- **Regression testing mandatory**: Can't skip even for "small" changes
- **Identity layer changes require human validation**: Even in brownfield
- **Production stability > new features**: When in doubt, be conservative
- **Document everything**: Future you will thank current you
- **Rollback is not failure**: Better to revert than deploy broken clone

---

**Task Version:** 3.0
**Last Updated:** 2025-10-06
