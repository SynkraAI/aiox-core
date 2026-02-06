---
task-id: execute-mmos-pipeline
name: Complete MMOS Pipeline Orchestration (6 Phases)
agent: mind-mapper
version: 1.0.0
purpose: Orchestrate complete end-to-end MMOS pipeline from viability to production deployment

workflow-mode: interactive
elicit: true
elicitation-type: guided

prerequisites:
  - MMOS Mind Mapper pack installed
  - ETL Data Collector pack installed
  - All API keys configured

inputs:
  - name: mind_name
    type: string
    required: true
  - name: workflow_mode
    type: enum
    required: true
    options: ["greenfield", "brownfield"]
    default: "greenfield"
  - name: start_phase
    type: enum
    required: false
    options: ["viability", "research", "analysis", "synthesis", "implementation", "testing"]
    default: "viability"
  - name: initial_context
    type: text
    required: true

outputs:
  - path: "squads/mmos-squad/minds/{mind_name}/"
    description: Complete mind directory with all 6 phase outputs
  - path: "squads/mmos-squad/minds/{mind_name}/system_prompts/generalista.md"
    description: Production-ready system prompt (final deliverable)

dependencies:
  agents:
    - mind-pm
    - research-specialist
    - cognitive-analyst
    - system-prompt-architect
  tasks:
    - viability-assessment.md
    - research-collection.md
    - cognitive-analysis.md
    - synthesis-compilation.md
    - system-prompt-creation.md
    - mind-validation.md
    - brownfield-update.md

validation:
  success-criteria:
    - "All 6 phases completed successfully"
    - "Fidelity score >= 94%"
    - "Production deployment approved"
    - "All human checkpoints validated"

estimated-duration: "20-30 hours total for greenfield pipeline"
---

# Execute MMOS Pipeline Task

## Purpose

Orchestrate the complete MMOS Mind Mapper pipeline from viability assessment through production-ready system prompt generation. This master task coordinates all 6 phases (Viability → Research → Analysis → Synthesis → Implementation → Testing) with human checkpoints at critical decision points and intelligent workflow branching for greenfield vs brownfield operations.

## When to Use This Task

**Use this task when:**
- Creating a new mind clone from scratch (greenfield)
- Updating an existing mind with new sources or insights (brownfield)
- Need complete end-to-end orchestration of the MMOS pipeline
- Want guided workflow with human validation at quality gates

**Do NOT use this task when:**
- Only running a specific phase (use individual phase tasks instead)
- Performing quick viability checks (use viability-assessment task)
- Doing exploratory research without commitment (use research-collection task)

### Required Inputs (Brownfield)
- **Existing Mind Path**: Location of current mind directory
- **Update Reason**: What new information or improvements are needed
- **Update Scope**: Full re-analysis or targeted update

## Key Activities & Instructions

### Phase 0: Pipeline Initialization

#### 0.1 Mode Selection (ELICIT)

Present the user with operating mode selection:

**Select operating mode:**

1. **GREENFIELD** - Create new mind from scratch
   - Complete 6-phase pipeline
   - APEX + ICP viability scoring
   - Full 8-layer DNA Mental™ analysis
   - Estimated time: 8-12 hours
   - Estimated tokens: 2-3M tokens

2. **BROWNFIELD** - Update existing mind
   - Selective re-execution of phases
   - Source differential analysis
   - Incremental updates only
   - Estimated time: 2-4 hours
   - Estimated tokens: 500K-1M tokens

3. **PREVIEW MODE** - Explore before committing
   - Viability assessment only
   - Quick APEX scoring
   - GO/NO-GO recommendation
   - Estimated time: 30 minutes
   - Estimated tokens: 50K tokens

**Type 1, 2, or 3 to select mode, or ask questions.**

#### 0.2 Mind Profile Initialization

Based on mode selection:

**GREENFIELD:**
```yaml
mind_profile:
  name: {{mind_name}}
  mode: greenfield
  created_at: {{timestamp}}
  target_icp: {{if_provided}}
  status: viability_pending

directory_structure:
  minds/{{mind_name}}/
    ├── docs/
    │   ├── PRD.md
    │   ├── TODO.md
    │   ├── LIMITATIONS.md
    │   └── logs/
    ├── sources/
    │   ├── articles/
    │   ├── books/
    │   ├── interviews/
    │   ├── videos/
    │   └── sources_master.yaml
    ├── artifacts/
    │   ├── cognitive_architecture.yaml
    │   ├── identity_core.yaml
    │   └── [analysis outputs]
    ├── kb/
    │   └── [knowledge base chunks]
    ├── system_prompts/
    │   └── [versioned prompts]
    └── metadata/
        ├── dependencies.yaml
        └── temporal_context.yaml
```

**BROWNFIELD:**
```yaml
brownfield_profile:
  mind_name: {{existing_mind}}
  mode: brownfield
  update_initiated: {{timestamp}}
  existing_version: {{current_version}}
  update_scope: {{user_specified}}

rollback_safety:
  backup_path: minds/{{mind_name}}/.backup-{{timestamp}}/
  changes_log: minds/{{mind_name}}/docs/logs/{{timestamp}}-brownfield-update.yaml
  rollback_script: available
```

Create the directory structure and initialize tracking files.

#### 0.3 Human Checkpoint Configuration

Configure quality gates and human checkpoints:

```yaml
human_checkpoints:
  viability_decision:
    phase: viability
    trigger: APEX + ICP scoring complete
    decision: GO / NO-GO / REVISE

  layer6_validation:
    phase: analysis
    trigger: Values hierarchy extracted (Layer 6)
    decision: APPROVE / REVISE / RE-ANALYZE

  layer7_validation:
    phase: analysis
    trigger: Core obsessions identified (Layer 7)
    decision: APPROVE / REVISE / RE-ANALYZE

  layer8_validation:
    phase: analysis
    trigger: Productive paradoxes mapped (Layer 8)
    decision: APPROVE / REVISE / RE-ANALYZE

  system_prompt_review:
    phase: implementation
    trigger: Generalista prompt compiled
    decision: APPROVE / ITERATE / MAJOR_REVISION

  production_approval:
    phase: testing
    trigger: Validation tests complete
    decision: DEPLOY / FIX_ISSUES / ABORT
```

### Phase 1: Viability Assessment

#### 1.1 Execute APEX Scoring

Invoke: `viability-assessment.md` task with mode = "apex"

**Wait for output:**
- `minds/{mind}/docs/logs/{timestamp}-viability.yaml`

**Automated Decision Logic:**
```python
apex_thresholds = {
    'auto_reject': total_score < 50,  # Below 50: Auto NO-GO
    'auto_approve': total_score >= 75,  # Above 75: Auto GO
    'human_review': 50 <= total_score < 75  # 50-75: Human decision
}
```

#### 1.2 Execute ICP Scoring

Invoke: `viability-assessment.md` task with mode = "icp"

**Wait for output:**
- `minds/{mind}/docs/logs/{timestamp}-icp_match.yaml`

**Match Score Interpretation:**
```yaml
icp_thresholds:
  perfect_match: >= 90  # High ROI, proceed with confidence
  good_match: 70-89     # Solid ROI, proceed
  moderate_match: 50-69 # Marginal ROI, consider constraints
  poor_match: < 50      # Low ROI, reconsider or narrow scope
```

#### 1.3 HUMAN CHECKPOINT: GO/NO-GO Decision

Present viability results to user:

```markdown
## VIABILITY ASSESSMENT COMPLETE

### APEX Score: {{total}}/100
- Availability: {{score}}/20 - {{assessment}}
- Public Persona: {{score}}/15 - {{assessment}}
- Expertise Depth: {{score}}/20 - {{assessment}}
- X-Factor: {{score}}/15 - {{assessment}}
- Temporal Relevance: {{score}}/15 - {{assessment}}
- Value Density: {{score}}/15 - {{assessment}}

### ICP Match Score: {{percentage}}%
- Use Case: {{primary_use_case}}
- Audience Fit: {{assessment}}
- ROI Projection: {{estimation}}

### RECOMMENDATION: {{GO / NO-GO / PROCEED_WITH_CAUTION}}

### Rationale:
{{detailed_reasoning}}

### Estimated Resources:
- Time: {{hours}} hours
- Tokens: {{estimated_tokens}}
- Key Challenges: {{list}}

---

**DECISION REQUIRED:**

1. **GO** - Proceed to Research phase
2. **NO-GO** - Stop pipeline, document reasons
3. **REVISE** - Adjust scope or ICP, re-assess
4. **QUESTIONS** - Discuss assessment before deciding

Type 1-4 or provide feedback:
```

**Handle user response:**
- **1 (GO)**: Generate PRD, initialize TODO, proceed to Phase 2
- **2 (NO-GO)**: Document decision, clean up, exit gracefully
- **3 (REVISE)**: Gather new parameters, re-run viability
- **4 (QUESTIONS)**: Enter discussion mode, then re-present decision

#### 1.4 Generate Foundation Documents

If GO decision:

Invoke: `viability-assessment.md` task with mode = "prd_generation"

**Outputs:**
- `minds/{mind}/docs/PRD.md`
- `minds/{mind}/docs/TODO.md`
- `minds/{mind}/metadata/dependencies.yaml`

### Phase 2: Research Collection

#### 2.1 Execute Source Discovery

Invoke: `research-collection.md` task with mode = "discovery"

**This will:**
- Identify all available sources across source types
- Map temporal context (when sources were created)
- Build priority matrix based on source quality
- Generate initial sources inventory

**Wait for output:**
- `minds/{mind}/sources/discovery_report.yaml`

#### 2.2 Execute Parallel Collection

Invoke: `research-collection.md` task with mode = "collection"

**Parallelization Strategy:**
```yaml
collection_batches:
  batch_1_priority_1:
    - books (authoritative sources)
    - official websites/blogs
    - published interviews

  batch_2_priority_2:
    - podcasts (long-form)
    - video content (transcripts)
    - social media (curated)

  batch_3_priority_3:
    - secondary sources
    - commentary/analysis
    - community discussions
```

**Progress tracking:**
Show live progress indicator as sources are collected.

#### 2.3 Generate Sources Master

Invoke: `research-collection.md` task with mode = "master_compilation"

**Wait for output:**
- `minds/{mind}/sources/sources_master.yaml`

**Validation:**
```yaml
minimum_requirements:
  total_sources: >= 15
  high_confidence_sources: >= 5
  source_type_diversity: >= 3 types
  temporal_coverage: >= 2 time periods
```

If minimum requirements not met, alert user and offer options:
1. Continue with limited sources (flag as constraint)
2. Pause for manual source gathering
3. Adjust viability decision

### Phase 3: Cognitive Analysis (8 Layers)

#### 3.1 Execute Layers 1-4 (Observable Patterns)

Invoke: `cognitive-analysis.md` task with mode = "layers_1_4"

**Layers:**
- **Layer 1**: Behavioral Patterns (observable actions)
- **Layer 2**: Communication Style (linguistic patterns)
- **Layer 3**: Routine & Habits (temporal patterns)
- **Layer 4**: Recognition Patterns (mental radars)

**Outputs:**
- `minds/{mind}/artifacts/behavioral_patterns.md`
- `minds/{mind}/artifacts/writing_style.md`
- `minds/{mind}/artifacts/routine_analysis.md`
- `minds/{mind}/artifacts/recognition_patterns.yaml`

**No human checkpoint** - these are foundational observables.

#### 3.2 Execute Layer 5 (Mental Models)

Invoke: `cognitive-analysis.md` task with mode = "layer_5"

**Triangulation required:**
Validate mental models against Layers 1-4 for consistency.

**Output:**
- `minds/{mind}/artifacts/mental_models.md`

#### 3.3 Execute Layer 6 (Values Hierarchy)

Invoke: `cognitive-analysis.md` task with mode = "layer_6"

**Triangulation required:**
Cross-reference stated values vs demonstrated values across sources.

**Output:**
- `minds/{mind}/artifacts/values_hierarchy.yaml`

#### 3.4 HUMAN CHECKPOINT: Layer 6 Validation

Present extracted values hierarchy to user:

```markdown
## LAYER 6 VALIDATION: Values Hierarchy

### Extracted Core Values (Ranked):

1. **{{value_1}}** (Priority: Highest)
   - Evidence: {{source_citations}}
   - Demonstrated in: {{examples}}

2. **{{value_2}}** (Priority: High)
   - Evidence: {{source_citations}}
   - Demonstrated in: {{examples}}

[... continue for all values ...]

### Triangulation Status:
- Source agreement: {{percentage}}%
- Stated vs demonstrated alignment: {{percentage}}%
- Temporal consistency: {{assessment}}

### Confidence Level: {{High / Medium / Low}}

---

**VALIDATION REQUIRED:**

Values hierarchy is CRITICAL for clone authenticity. Review carefully.

1. **APPROVE** - Values hierarchy is accurate, proceed to Layer 7
2. **REVISE** - Provide corrections or missing values
3. **RE-ANALYZE** - Insufficient evidence, need deeper analysis

Type 1-3 or provide feedback:
```

**Handle response:**
- Approve: Proceed to Layer 7
- Revise: Update values_hierarchy.yaml with user input, proceed
- Re-analyze: Return to sources, execute deeper extraction

#### 3.5 Execute Layer 7 (Core Obsessions)

Invoke: `cognitive-analysis.md` task with mode = "layer_7"

**Key extraction:**
- What topics/themes appear obsessively across sources?
- What questions drive their work/thinking?
- What problems consume their attention?

**Output:**
- `minds/{mind}/artifacts/core_obsessions.yaml`

#### 3.6 HUMAN CHECKPOINT: Layer 7 Validation

Present core obsessions to user (similar format to Layer 6 checkpoint).

#### 3.7 Execute Layer 8 (Productive Paradoxes)

Invoke: `cognitive-analysis.md` task with mode = "layer_8"

**This is the gold layer** - what makes the mind truly human and unique.

**Output:**
- `minds/{mind}/artifacts/contradictions.yaml`

#### 3.8 HUMAN CHECKPOINT: Layer 8 Validation

Present productive paradoxes to user:

```markdown
## LAYER 8 VALIDATION: Productive Paradoxes

### Identified Paradoxes:

**PARADOX 1: {{title}}**
- Contradiction: "{{belief_A}}" AND "{{belief_B}}"
- Context: {{when_each_applies}}
- Resolution: {{how_they_coexist}}
- Evidence: {{sources}}

[... continue for all paradoxes ...]

### Why Layer 8 Matters:

Paradoxes are what make AI clones feel genuinely human. They:
- Prevent robotic consistency
- Enable contextual wisdom
- Create authentic personality depth

Without Layer 8, clones feel "uncanny valley."

---

**VALIDATION REQUIRED:**

1. **APPROVE** - Paradoxes accurately capture complexity, proceed
2. **REVISE** - Adjust or add missing paradoxes
3. **RE-ANALYZE** - Need deeper paradox extraction

Type 1-3 or provide feedback:
```

#### 3.9 Generate Cognitive Architecture

Invoke: `cognitive-analysis.md` task with mode = "architecture"

**Synthesize all 8 layers into unified cognitive architecture.**

**Output:**
- `minds/{mind}/artifacts/cognitive_architecture.yaml`

### Phase 4: Synthesis

#### 4.1 Execute Framework Extraction

Invoke: `synthesis-compilation.md` task with mode = "frameworks"

**Extract:**
- Communication templates
- Signature phrases
- Decision frameworks
- Problem-solving patterns

**Outputs:**
- `minds/{mind}/artifacts/communication_templates.md`
- `minds/{mind}/artifacts/signature_phrases.md`
- `minds/{mind}/artifacts/frameworks_synthesized.md`

#### 4.2 Execute KB Chunking

Invoke: `synthesis-compilation.md` task with mode = "kb_chunking"

**Create optimized knowledge base chunks** for RAG or fine-tuning.

**Output:**
- `minds/{mind}/kb/chunk_*.md` (multiple files)

#### 4.3 Execute Specialist Recommendations

Invoke: `synthesis-compilation.md` task with mode = "specialist_recommender"

**Analyze cognitive architecture to recommend specialist variations:**
- "{{Mind}} as Business Coach"
- "{{Mind}} as Writer's Mentor"
- "{{Mind}} as Strategic Advisor"

**Output:**
- `@{mind}/docs/logs/{timestamp}-specialist_recommendations.yaml`

### Phase 5: Implementation (System Prompt Creation)

#### 5.1 Generate Identity Core

Invoke: `system-prompt-creation.md` task with mode = "identity_core"

**Distill the absolute essence** of the mind into identity primitives.

**Output:**
- `@{mind}/artifacts/identity_core.yaml`

#### 5.2 Generate Meta Axioms

Invoke: `system-prompt-creation.md` task with mode = "meta_axioms"

**Extract operating principles** that govern all behavior.

**Output:**
- `@{mind}/artifacts/meta_axioms.yaml`

#### 5.3 Compile Generalista System Prompt

Invoke: `system-prompt-creation.md` task with mode = "generalista"

**Compile complete general-purpose system prompt.**

**Output:**
- `@{mind}/system_prompts/{timestamp}-v1.0-generalista.md`

#### 5.4 HUMAN CHECKPOINT: System Prompt Review

Present compiled prompt to user:

```markdown
## SYSTEM PROMPT REVIEW

### Generalista v1.0 Complete

**Location:** @{mind}/system_prompts/{{timestamp}}-v1.0-generalista.md

**Prompt Statistics:**
- Total tokens: {{count}}
- Identity section: {{tokens}}
- Instructions section: {{tokens}}
- Knowledge integration: {{approach}}

### Key Characteristics Encoded:
- ✅ Core identity from Layer 8 paradoxes
- ✅ Values hierarchy (Layer 6) embedded
- ✅ Mental models (Layer 5) as reasoning patterns
- ✅ Communication style (Layer 2) as voice
- ✅ Signature phrases integrated naturally

### Preview Snippet:

```
{{first_200_lines}}
```

---

**REVIEW REQUIRED:**

1. **APPROVE** - Proceed to testing phase
2. **ITERATE** - Request specific changes
3. **MAJOR_REVISION** - Significant issues, needs rework

Type 1-3 or provide detailed feedback:
```

**Handle response:**
- Approve: Generate testing protocol, proceed to Phase 6
- Iterate: Apply changes, increment version, re-present
- Major revision: Return to synthesis phase, identify gaps

#### 5.5 Generate Specialist Variants (Optional)

If user approves specialists from Phase 4 recommendations:

Invoke: `system-prompt-creation.md` task with mode = "specialist"

**For each approved specialist:**
- Fork generalista prompt
- Inject specialist knowledge domain
- Tune instructions for specialist use case

**Outputs:**
- `minds/{mind}/specialists/{specialist_name}/system_prompts/{timestamp}-v1.0.md`

### Phase 6: Validation & Testing

#### 6.1 Generate Test Protocol

Invoke: `mind-validation.md` task with mode = "test_generation"

**Create comprehensive test suite:**
- Personality consistency tests
- Knowledge accuracy tests
- Style fidelity tests
- Edge case handling tests

**Output:**
- `minds/{mind}/docs/testing_protocol.md`
- `minds/{mind}/docs/logs/{timestamp}-test_cases.yaml`

#### 6.2 Execute Validation Tests

Invoke: `mind-validation.md` task with mode = "validation"

**Run test battery:**
1. Personality validator (does it feel like the person?)
2. Knowledge validator (is information accurate?)
3. Style validator (does it sound like the person?)
4. Paradox validator (Layer 8 functioning correctly?)

**Progress indicator:**
Show test execution progress in real-time.

#### 6.3 Generate Validation Report

Invoke: `mind-validation.md` task with mode = "report"

**Output:**
- `minds/{mind}/docs/logs/{timestamp}-validation_report.yaml`

**Report includes:**
```yaml
validation_results:
  overall_fidelity: {{percentage}}%

  personality_fidelity: {{percentage}}%
  - identity_consistency: {{score}}
  - values_alignment: {{score}}
  - paradox_navigation: {{score}}

  knowledge_accuracy: {{percentage}}%
  - factual_correctness: {{score}}
  - context_appropriateness: {{score}}

  style_fidelity: {{percentage}}%
  - linguistic_match: {{score}}
  - signature_phrases: {{score}}
  - tone_consistency: {{score}}

  edge_cases:
    passed: {{count}}
    failed: {{count}}
    failures: [{{list}}]
```

#### 6.4 HUMAN CHECKPOINT: Production Approval

Present final validation results:

```markdown
## FINAL VALIDATION REPORT

### Overall Fidelity: {{percentage}}%

**Target:** 94% (Industry standard for high-quality clones)
**Achieved:** {{percentage}}%
**Status:** {{PASSED / NEEDS_IMPROVEMENT / FAILED}}

### Detailed Scores:
- Personality Fidelity: {{percentage}}% {{status_emoji}}
- Knowledge Accuracy: {{percentage}}% {{status_emoji}}
- Style Fidelity: {{percentage}}% {{status_emoji}}

### Issues Found:
{{if_any_issues}}

### Production Readiness:
{{assessment}}

---

**PRODUCTION APPROVAL DECISION:**

1. **DEPLOY** - Mind is production-ready, finalize and document
2. **FIX_ISSUES** - Address specific issues before deployment
3. **ABORT** - Fundamental issues, major rework needed

Type 1-3 or provide feedback:
```

**Handle response:**
- Deploy: Generate operational manual, finalize documentation
- Fix issues: Create fix task list, iterate, re-test
- Abort: Document lessons learned, archive project

### Phase 7: Finalization

#### 7.1 Generate Operational Manual

**If deployment approved:**

Invoke: `system-prompt-creation.md` task with mode = "operational_manual"

**Output:**
- `minds/{mind}/docs/operational_manual.md`

**Manual includes:**
- How to use the mind clone
- Optimal use cases
- Known limitations
- Troubleshooting guide
- Version history

#### 7.2 Update Master Catalog

Update `squads/mmos-squad/minds/catalog.md` with new mind entry:

```yaml
- name: {{mind_name}}
  version: 1.0
  created: {{timestamp}}
  fidelity: {{percentage}}%
  status: production
  generalista_prompt: minds/{{mind}}/system_prompts/{{file}}
  specialists:
    - {{if_any}}
  use_cases:
    - {{primary}}
    - {{secondary}}
```

#### 7.3 Generate Pipeline Summary

Create comprehensive pipeline execution summary:

```markdown
# MMOS Pipeline Execution Summary

## Mind: {{name}}
## Pipeline Mode: {{greenfield/brownfield}}
## Execution Date: {{timestamp}}

### Resources Used:
- Total time: {{hours}} hours
- Total tokens: {{count}} tokens
- Phases completed: 6/6 ✅

### Outputs Generated:
- Sources collected: {{count}}
- Artifacts created: {{count}}
- System prompts: {{count}}
- Tests executed: {{count}}

### Quality Metrics:
- APEX score: {{score}}/100
- ICP match: {{percentage}}%
- Final fidelity: {{percentage}}%

### Human Checkpoints Executed:
1. ✅ Viability GO/NO-GO
2. ✅ Layer 6 validation
3. ✅ Layer 7 validation
4. ✅ Layer 8 validation
5. ✅ System prompt review
6. ✅ Production approval

### Deliverables:
- [x] PRD
- [x] Sources Master
- [x] Cognitive Architecture (8 layers)
- [x] Knowledge Base
- [x] System Prompt v1.0 (Generalista)
- [x] Validation Report
- [x] Operational Manual

### Status: ✅ COMPLETE & PRODUCTION-READY

---

Next steps:
1. Deploy system prompt to target LLM
2. Monitor initial usage
3. Collect feedback for v1.1 iteration
```

#### 7.4 Present Final Summary to User

Show complete pipeline summary and provide next steps guidance.

## Outputs

### Greenfield Mode Outputs

**Documentation:**
- `minds/{mind}/docs/PRD.md` - Product requirements
- `minds/{mind}/docs/TODO.md` - Implementation backlog
- `minds/{mind}/docs/LIMITATIONS.md` - Known constraints
- `minds/{mind}/docs/operational_manual.md` - Usage guide
- `minds/{mind}/docs/testing_protocol.md` - QA procedures

**Sources:**
- `minds/{mind}/sources/sources_master.yaml` - Complete inventory
- `minds/{mind}/sources/{type}/` - Organized source files

**Artifacts (8 Layers):**
- `minds/{mind}/artifacts/behavioral_patterns.md`
- `minds/{mind}/artifacts/writing_style.md`
- `minds/{mind}/artifacts/routine_analysis.md`
- `minds/{mind}/artifacts/recognition_patterns.yaml`
- `minds/{mind}/artifacts/mental_models.md`
- `minds/{mind}/artifacts/values_hierarchy.yaml`
- `minds/{mind}/artifacts/core_obsessions.yaml`
- `minds/{mind}/artifacts/contradictions.yaml`
- `minds/{mind}/artifacts/cognitive_architecture.yaml`

**Synthesis:**
- `minds/{mind}/artifacts/communication_templates.md`
- `minds/{mind}/artifacts/signature_phrases.md`
- `minds/{mind}/artifacts/frameworks_synthesized.md`

**Implementation:**
- `minds/{mind}/artifacts/identity_core.yaml`
- `minds/{mind}/artifacts/meta_axioms.yaml`
- `minds/{mind}/system_prompts/{timestamp}-v1.0-generalista.md`

**Knowledge Base:**
- `minds/{mind}/kb/chunk_*.md` - Chunked KB files

**Validation:**
- `minds/{mind}/docs/logs/{timestamp}-validation_report.yaml`

**Metadata:**
- `minds/{mind}/metadata/dependencies.yaml`
- `minds/{mind}/metadata/temporal_context.yaml`

### Brownfield Mode Outputs

**Updates:**
- `minds/{mind}/docs/logs/{timestamp}-brownfield-update.yaml` - Change log
- Updated artifacts (only those affected by new sources)
- Incremented system prompt version (v1.x → v1.y)

**Rollback:**
- `minds/{mind}/.backup-{timestamp}/` - Complete backup before changes

## Validation Criteria

The MMOS pipeline execution is successful when:

- [ ] **Viability validated**: APEX ≥ 50, ICP match documented, human GO decision
- [ ] **Sources adequate**: ≥15 total sources, ≥5 high-confidence, ≥3 types
- [ ] **8 Layers complete**: All layers extracted with required triangulation
- [ ] **Human checkpoints passed**: All 6 checkpoints completed with user approval
- [ ] **System prompt compiled**: Generalista v1.0 generated with all layers integrated
- [ ] **Validation passed**: Overall fidelity ≥ 94% (or documented reasons for <94%)
- [ ] **Documentation complete**: PRD, operational manual, testing protocol all generated
- [ ] **Production approved**: Human final approval for deployment received
- [ ] **Catalog updated**: Mind registered in master catalog
- [ ] **Pipeline summary generated**: Complete execution report created

## Integration with AIOS

### Memory Layer Integration

**Store pipeline metadata:**
```typescript
memory.store({
  collection: 'mmos_pipelines',
  document: {
    mind_name: '{{mind}}',
    execution_id: '{{uuid}}',
    mode: '{{greenfield/brownfield}}',
    completed_at: '{{timestamp}}',
    fidelity: {{percentage}},
    outputs: {
      system_prompt: '{{path}}',
      validation_report: '{{path}}'
    }
  }
});
```

**Query for reuse:**
```typescript
// Find similar minds for pattern reuse
memory.query({
  collection: 'mmos_pipelines',
  filter: { fidelity: { $gte: 90 } }
});
```

### Agent Coordination

**This task delegates to specialized agents:**
- **@analyst**: Viability scoring, research, analysis phases
- **@mind-pm**: PRD generation, TODO management
- **@architect**: Cognitive architecture, system prompt compilation
- **@qa**: Validation testing, quality assurance

**Follow agent communication protocol:**
- Maintain context across agent switches
- Pass outputs as inputs to downstream agents
- Aggregate results at phase boundaries

### Error Handling

**Graceful degradation:**
```yaml
error_handling:
  viability_failure:
    action: Offer scope adjustment or termination
    document: reasons in logs

  insufficient_sources:
    action: Alert user, offer manual collection pause
    continue: if user approves proceeding with limited sources

  human_checkpoint_rejection:
    action: Return to previous phase
    iterate: with user guidance
    max_iterations: 3

  validation_failure:
    action: Generate detailed issue report
    offer: Fix issues OR deploy with documented limitations

  critical_error:
    action: Backup current state
    rollback: to last stable checkpoint
    notify: user with error details
```

### Performance Optimization

**Parallel execution opportunities:**
- Phase 2: Parallel source collection
- Phase 3: Layers 1-4 can run in parallel
- Phase 4: Framework extraction and KB chunking can run in parallel
- Phase 6: Test cases can run in parallel

**Estimated execution times:**
- Greenfield (full pipeline): 8-12 hours (wall time), 2-3M tokens
- Brownfield (targeted update): 2-4 hours (wall time), 500K-1M tokens
- Preview mode (viability only): 30 minutes, 50K tokens

### Quality Gates

**Automated quality checks:**
- Source minimum requirements (Phase 2)
- Triangulation validation (Layers 5-8)
- Fidelity threshold (≥94% for production)
- Documentation completeness

**Human validation required:**
- GO/NO-GO viability decision
- Layer 6, 7, 8 validation (identity critical)
- System prompt approval
- Production deployment approval

## Notes

- **Layer 8 (Paradoxes) is the differentiator**: This is what makes clones feel authentically human vs robotic
- **Human checkpoints are non-negotiable**: Do not skip or automate critical validation points
- **Triangulation is mandatory for Layers 5-8**: Multiple source confirmation required
- **Brownfield mode saves 60-75% resources**: Use when updating existing minds
- **Fidelity target is 94%**: Industry standard for high-quality personality clones
- **Pipeline is resumable**: Can pause at phase boundaries and resume later
- **All outputs are versioned**: Maintain history for regression analysis
- **Security**: Never expose source material in system prompts (only synthesized patterns)

---

**Pipeline Version:** 3.0 (DNA Mental™ 8-Layer Methodology)
**Last Updated:** 2025-10-06
