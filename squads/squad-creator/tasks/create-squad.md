# Task: Create Complete Squad

**Task ID:** create-squad
**Version:** 2.0
**Purpose:** Create a complete AIOS-FULLSTACK squad through guided elicitation, research, and validation
**Orchestrator:** @squad-architect
**Mode:** Incremental (human checkpoints) or YOLO (autonomous)
**Quality Standard:** AIOS Level (all components meet minimum standards)

**Frameworks Used:**
- `data/tier-system-framework.md` → Agent tier classification (Phase 3)
- `data/quality-dimensions-framework.md` → Squad validation (Phase 6)
- `data/decision-heuristics-framework.md` → Checkpoint logic (Phase 4, 6)
- `data/executor-matrix-framework.md` → Task executor assignment (Phase 4)

---

## Overview

This task creates a complete, production-ready squad with all required components: agents, tasks, workflows, templates, checklists, and knowledge bases. The key insight: **squads must be built on researched elite minds, not generic bots**.

**v2.0 Changes:**
- Mandatory research loop before any agent creation
- PHASE-based structure with checkpoints
- Quality gates with blocking requirements
- Framework integration at every decision point

```
INPUT (domain + purpose + target_user)
    ↓
[PHASE 0: DISCOVERY]
    → Validate domain viability
    → Check for existing similar squads
    ↓
[PHASE 1: RESEARCH]
    → Execute mind-research-loop.md
    → Identify elite minds with frameworks
    → Validate each mind (SC_FV_001)
    ↓
[PHASE 2: ARCHITECTURE]
    → Define tier structure
    → Plan agent relationships
    → Design quality gates
    ↓
[PHASE 3: CREATION]
    → Create agents (research-then-create-agent.md)
    → Create workflows with checkpoints
    → Create tasks with Task Anatomy
    ↓
[PHASE 4: INTEGRATION]
    → Create orchestrator agent
    → Wire dependencies
    → Generate documentation
    ↓
[PHASE 5: VALIDATION]
    → Run squad-checklist.md
    → Quality dimensions scoring
    → Fix blocking issues
    ↓
OUTPUT: Complete squad + Quality Score
```

---

## Inputs

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `domain` | string | Yes | Domain expertise area | `"copywriting"`, `"legal"`, `"data"` |
| `purpose` | string | Yes | What the squad should accomplish | `"Create high-converting sales pages"` |
| `target_user` | string | Yes | Who will use this squad | `"Marketing teams at SaaS companies"` |
| `use_cases` | list | Yes | 3-5 key use cases | `["sales pages", "email sequences", "ads"]` |
| `mode` | enum | Yes | `"incremental"` or `"yolo"` | `"incremental"` |
| `pack_name` | string | No | Override default name | `"copy"` |

---

## Preconditions

- [ ] squad-architect agent is active
- [ ] WebSearch tool available (for research)
- [ ] Write permissions for `squads/` directory
- [ ] Frameworks loaded: tier-system, quality-dimensions, decision-heuristics, executor-matrix

---

## PHASE 0: DISCOVERY

**Duration:** 5-10 minutes
**Checkpoint:** SC_DSC_001 (Discovery Complete)
**Mode:** Interactive (both modes)

### Step 0.1: Validate Domain Viability

**Actions:**
```yaml
domain_viability_check:
  questions:
    - "Is this domain well-documented with established methodologies?"
    - "Do elite practitioners exist with documented frameworks?"
    - "Can outputs be validated against objective criteria?"
    - "Is there enough depth to warrant a squad (vs single agent)?"

  scoring:
    - documented_methodologies: 0-3
    - elite_practitioners: 0-3
    - validation_criteria: 0-2
    - complexity_warrants_squad: 0-2

  threshold: 6/10
  veto_conditions:
    - elite_practitioners < 2 → "Cannot create quality agents without researched minds"
```

**Decision Point:**
```
IF viability_score >= 6:
    → PROCEED to Step 0.2
ELSE IF viability_score >= 4:
    → WARN: "Domain may not support full squad. Consider single agent."
    → ASK: "Proceed with limited scope?"
ELSE:
    → BLOCK: "Domain lacks sufficient documented frameworks"
    → SUGGEST: "Consider researching domain first or choosing adjacent domain"
```

### Step 0.2: Check Existing Squads

**Actions:**
```yaml
existing_squad_check:
  search_paths:
    - "squads/{similar_names}/"
    - "squads/*/{domain}*"
    - ".claude/commands/*/{domain}*"

  analysis:
    - existing_coverage: "What does existing squad cover?"
    - gap_identification: "What's missing?"
    - extension_vs_new: "Extend existing or create new?"

  output:
    decision: "extend" | "create_new" | "abort_duplicate"
    rationale: "..."
```

**Decision Point:**
```
IF existing squad covers 80%+ of use cases:
    → SUGGEST: "Extend existing squad instead"
    → IF user confirms: → GOTO extend-squad workflow
IF partial overlap:
    → WARN: "Partial overlap detected. Plan for integration."
ELSE:
    → PROCEED to Phase 1
```

### Step 0.3: Define Pack Structure

**Actions:**
```yaml
pack_structure_elicitation:
  required:
    - pack_name: "kebab-case identifier"
    - pack_title: "Human-readable title"
    - version: "1.0.0"
    - author: "Organization or person"
    - slash_prefix: "camelCase for commands"

  derived:
    - pack_path: "squads/{pack_name}/"
    - command_path: ".claude/commands/{PackTitle}/"

  pattern_library:
    - prefix: "2-letter code (e.g., CP for Copy)"
    - initial_patterns:
      - "{PREFIX}-001: Core Process"
      - "{PREFIX}-002: Quality Standard"
      - "{PREFIX}-003: Exception Handling"
```

**Output (PHASE 0):**
```yaml
phase_0_output:
  viability_score: 8/10
  decision: "create_new"
  pack_name: "copy"
  pack_title: "Copy Squad"
  slash_prefix: "copy"
  pattern_prefix: "CP"
  mode: "incremental"
```

**Checkpoint SC_DSC_001:**
```yaml
heuristic_id: SC_DSC_001
name: "Discovery Complete"
blocking: true
criteria:
  - viability_score >= 6
  - pack_name defined
  - no duplicate squad
```

---

## PHASE 1: RESEARCH

**Duration:** 15-30 minutes
**Checkpoint:** SC_RES_001 (Research Quality Gate)
**Mode:** Autonomous (both modes)

### Step 1.1: Execute Mind Research Loop

**CRITICAL:** This step is MANDATORY. No agent creation without research.

**Actions:**
```yaml
execute_workflow:
  workflow: "workflows/mind-research-loop.md"
  inputs:
    domain: "{domain}"
    min_minds: 5
    max_minds: 10
    iterations: 3-5

  execution_mode: "autonomous"
  human_review: false  # Research loop handles validation internally
```

**Mind Research Loop Summary:**
```
Iteration 1: Broad research (find 15-20 names)
Iteration 2: Devil's advocate (cut weak candidates)
Iteration 3: Framework validation (SC_FV_001)
Output: Curated list of elite minds with documented frameworks
```

### Step 1.2: Validate Research Output

**Actions:**
```yaml
research_validation:
  # From data/quality-dimensions-framework.md
  dimensions_to_check:
    - accuracy: "Are the minds real with verifiable work?"
    - coherence: "Do the frameworks complement each other?"
    - strategic_alignment: "Do they cover the use cases?"
    - operational_excellence: "Is the research actionable?"

  # From data/decision-heuristics-framework.md
  apply_heuristic:
    id: SC_RES_001
    name: "Research Quality Gate"
    threshold: 7.0
    blocking: true

    criteria:
      - minds_count >= 5
      - all_minds_have_frameworks: true
      - tier_0_covered: true
      - use_cases_mapped >= 80%

    veto_conditions:
      - minds_count < 3 → "Insufficient research"
      - no_tier_0_minds → "No diagnostic/foundation agent"
```

**Output (PHASE 1):**
```yaml
phase_1_output:
  minds:
    - name: "Gary Halbert"
      tier: 1
      frameworks: ["A-Pile/B-Pile", "Swipe File Method"]
      covers_use_cases: ["sales pages", "direct mail"]

    - name: "Eugene Schwartz"
      tier: 0
      frameworks: ["Market Awareness", "5 Levels of Sophistication"]
      covers_use_cases: ["all - diagnostic"]

    # ... more minds

  research_score: 8.5/10
  checkpoint_status: "PASS"
```

---

## PHASE 2: ARCHITECTURE

**Duration:** 10-20 minutes
**Checkpoint:** SC_ARC_001 (Architecture Approved)
**Mode:** Interactive (incremental) / Autonomous (YOLO)

### Step 2.1: Define Tier Structure

**Apply: tier-system-framework.md**

**Actions:**
```yaml
tier_structure_design:
  # Assign each mind to a tier
  orchestrator:
    purpose: "Coordinates all tiers, routes requests"
    candidates: "New agent or promote from Tier 0"

  tier_0_diagnosis:
    purpose: "First contact, analysis, classification"
    minds: "Those who created diagnostic frameworks"
    required: true  # Every squad MUST have Tier 0

  tier_1_masters:
    purpose: "Primary experts with proven results"
    minds: "Those with documented $X results"

  tier_2_systematizers:
    purpose: "Created frameworks others use"
    minds: "Thought leaders, framework creators"

  tier_3_specialists:
    purpose: "Specific format/channel experts"
    minds: "Niche specialists"

  tools:
    purpose: "Validation, checklists, calculators"
    examples: ["quality-checker", "compliance-validator"]
```

### Step 2.2: Plan Agent Relationships

**Actions:**
```yaml
agent_relationships:
  handoff_map:
    # Who hands off to whom
    - from: "orchestrator"
      to: "tier_0_agents"
      when: "New request arrives"

    - from: "tier_0_agents"
      to: "tier_1_agents"
      when: "Diagnosis complete, execution needed"

  synergies:
    # Who works well together
    - agents: ["diagnosis-agent", "master-agent"]
      pattern: "Diagnosis feeds master context"

  conflicts:
    # Who should NOT be combined
    - agents: ["aggressive-style", "conservative-style"]
      reason: "Contradictory approaches"
```

### Step 2.3: Design Quality Gates

**Actions:**
```yaml
quality_gates_design:
  gates:
    - id: "QG-001"
      name: "Request Classification"
      transition: "Input → Tier 0"
      type: "routing"
      criteria: "Request type identified"

    - id: "QG-002"
      name: "Diagnosis Complete"
      transition: "Tier 0 → Tier 1"
      type: "blocking"
      criteria: "Analysis approved, requirements clear"

    - id: "QG-003"
      name: "Draft Review"
      transition: "Execution → Output"
      type: "blocking"
      criteria: "Quality checklist passed"

  escalation_paths:
    - on_failure: "Return to previous tier with feedback"
    - on_repeated_failure: "Escalate to human review"
```

**Output (PHASE 2):**
```yaml
phase_2_output:
  tier_structure:
    orchestrator: "copy-chief"
    tier_0: ["eugene-schwartz", "claude-hopkins"]
    tier_1: ["gary-halbert", "gary-bencivenga"]
    tier_2: ["dan-kennedy", "todd-brown"]
    tier_3: ["email-specialist", "ad-specialist"]
    tools: ["quality-checker", "headline-scorer"]

  quality_gates: 5
  handoffs: 12
  architecture_score: 8/10
```

**Checkpoint SC_ARC_001:**
```yaml
heuristic_id: SC_ARC_001
name: "Architecture Approved"
blocking: true
criteria:
  - tier_0_defined: true
  - orchestrator_defined: true
  - quality_gates >= 3
  - handoff_map_complete: true

# Incremental mode: Human approval required
# YOLO mode: Auto-approve if criteria met
```

---

## PHASE 3: CREATION

**Duration:** 30-60 minutes (varies by squad size)
**Checkpoint:** SC_CRT_001 (Creation Quality)
**Mode:** Autonomous (both modes, with quality gates)

### Step 3.1: Create Directory Structure

**Actions:**
```yaml
create_directories:
  base: "squads/{pack_name}/"
  subdirectories:
    - agents/
    - tasks/
    - workflows/
    - templates/
    - checklists/
    - data/
    - docs/

  initial_files:
    - config.yaml (from templates/config-tmpl.yaml)
    - README.md (placeholder)
```

### Step 3.2: Create Agents (For Each Mind)

**Execute workflow for each mind:**
```yaml
for_each_mind:
  workflow: "workflows/research-then-create-agent.md"
  inputs:
    agent_purpose: "{derived from mind's expertise}"
    domain: "{domain}"
    specialist_slug: "{mind_slug}"
    specialist_name: "{mind_name}"
    pack_name: "{pack_name}"

  quality_gate:
    # Each agent must pass SC_AGT_001
    blocking: true
    retry_on_fail: true
    max_retries: 2
```

### Step 3.3: Create Orchestrator Agent

**Special agent creation:**
```yaml
create_orchestrator:
  agent_id: "{pack_name}-chief"
  role: "Squad Orchestrator"
  tier: "orchestrator"

  special_capabilities:
    - "Route requests to appropriate tier"
    - "Manage multi-agent workflows"
    - "Track context across handoffs"
    - "Report squad status"

  commands:
    - "*help" - List all squad capabilities
    - "*route" - Route request to best agent
    - "*status" - Show current context
    - "*handoff" - Transfer to specific agent

  must_include:
    - tier_routing_logic
    - quality_gate_checks
    - context_preservation
```

### Step 3.4: Create Workflows

**For complex multi-step operations:**
```yaml
create_workflows:
  # Identify operations that need workflows
  criteria:
    - spans_multiple_agents: true
    - has_intermediate_checkpoints: true
    - output_feeds_next_step: true

  template: "templates/workflow-tmpl.yaml"

  minimum_structure:
    - phases: 3+
    - checkpoints_per_phase: 1+
    - framework_references: 2+

  quality_standard:
    min_lines: 500
```

### Step 3.5: Create Tasks

**Apply: executor-matrix-framework.md**

**For atomic single-session operations:**
```yaml
create_tasks:
  # Each task follows Task Anatomy (8 fields)
  task_anatomy:
    - id: "Unique identifier"
    - purpose: "What and why"
    - executor: "Human | Agent | Hybrid | Worker"
    - inputs: "What it needs"
    - preconditions: "What must be true"
    - steps: "How to execute"
    - outputs: "What it produces"
    - validation: "How to verify"

  executor_assignment:
    # From data/executor-matrix-framework.md
    decision_tree:
      - IF rule_based AND low_stakes → Worker
      - ELSE IF needs_judgment → Hybrid (AI draft, human approve)
      - ELSE IF creative_synthesis → Agent
      - ELSE → Human

  quality_standard:
    simple_tasks: 300+ lines
    complex_tasks: 500+ lines
```

**Output (PHASE 3):**
```yaml
phase_3_output:
  agents_created: 8
  all_pass_quality_gate: true
  workflows_created: 3
  tasks_created: 12
  templates_created: 5
  total_lines: 14,500
```

---

## PHASE 4: INTEGRATION

**Duration:** 10-15 minutes
**Checkpoint:** SC_INT_001 (Integration Complete)
**Mode:** Autonomous

### Step 4.1: Wire Dependencies

**Actions:**
```yaml
wire_dependencies:
  for_each_agent:
    - verify tasks exist
    - verify templates exist
    - verify checklists exist
    - update dependencies block

  create_missing:
    - if dependency referenced but doesn't exist → create stub
    - mark stubs with TODO for later completion
```

### Step 4.2: Create Knowledge Base

**Actions:**
```yaml
create_knowledge_base:
  file: "data/{pack_name}-kb.md"

  sections:
    - domain_overview: "What this domain is about"
    - key_concepts: "Essential terminology"
    - best_practices: "From researched minds"
    - common_patterns: "Reusable patterns"
    - anti_patterns: "What to avoid"
    - regulatory: "If applicable"
```

### Step 4.3: Generate Documentation

**Actions:**
```yaml
generate_documentation:
  readme:
    file: "README.md"
    sections:
      - overview
      - installation
      - quick_start
      - agents_list
      - workflows_list
      - tasks_list
      - templates_list
      - usage_examples

  config:
    file: "config.yaml"
    validate: true
```

---

## PHASE 5: VALIDATION

**Duration:** 5-10 minutes
**Checkpoint:** SC_VAL_001 (Squad Validated)
**Mode:** Autonomous with human review option

### Step 5.1: Run Squad Checklist

**Execute: checklists/squad-checklist.md**

**Actions:**
```yaml
run_squad_checklist:
  categories:
    - structure: "Directory structure correct"
    - agents: "All agents meet standards"
    - workflows: "All workflows have checkpoints"
    - tasks: "All tasks follow anatomy"
    - documentation: "README complete"
    - integration: "Dependencies wired"

  blocking_items:
    - orchestrator_exists
    - tier_0_exists
    - quality_gates_defined
    - readme_complete
```

### Step 5.2: Quality Dimensions Scoring

**Apply: quality-dimensions-framework.md**

**Actions:**
```yaml
quality_scoring:
  dimensions:
    - accuracy: "Are agents based on real minds?"
    - coherence: "Do components work together?"
    - strategic_alignment: "Does squad serve purpose?"
    - operational_excellence: "Is squad usable?"
    - innovation_capacity: "Can squad grow?"
    - risk_management: "Are guardrails in place?"

  weights:
    accuracy: 0.20
    coherence: 0.20
    strategic_alignment: 0.15
    operational_excellence: 0.20
    innovation_capacity: 0.10
    risk_management: 0.15

  threshold: 7.0
  veto_if_below_5:
    - accuracy
    - coherence
    - operational_excellence
```

### Step 5.3: Fix Blocking Issues

**Actions:**
```yaml
fix_blocking_issues:
  for_each_blocking_issue:
    - identify_root_cause
    - determine_fix_approach
    - execute_fix
    - re-validate

  max_iterations: 3
  on_max_iterations_exceeded:
    - report_remaining_issues
    - ask_human_for_direction
```

**Output (PHASE 5):**
```yaml
phase_5_output:
  checklist_pass: true
  quality_score: 8.2/10
  blocking_issues_resolved: 2
  warnings: 3
  status: "PASS"
```

---

## PHASE 6: HANDOFF

**Duration:** 2-5 minutes
**Mode:** Interactive

### Step 6.1: Present Squad Summary

**Actions:**
```yaml
present_summary:
  created:
    - agents: 8
    - workflows: 3
    - tasks: 12
    - templates: 5
    - checklists: 4

  quality:
    - overall_score: 8.2/10
    - research_foundation: "5 elite minds"
    - tier_coverage: "Full (0-3 + tools)"

  activation:
    - install: "npm run install:squad {pack_name}"
    - activate: "@{pack_name}"
    - example: "@copy:sales-page-writer"
```

### Step 6.2: Document Next Steps

**Actions:**
```yaml
next_steps:
  optional_improvements:
    - "Add more specialists to Tier 3"
    - "Create domain-specific templates"
    - "Add integration tests"

  handoff_to:
    - agent: "qa-architect"
      when: "Need deep validation audit"
    - agent: "domain-orchestrator"
      when: "Ready to use squad"
```

---

## Outputs

| Output | Location | Description |
|--------|----------|-------------|
| Squad Directory | `squads/{pack_name}/` | Complete squad structure |
| Agents | `squads/{pack_name}/agents/` | All agent definitions |
| Workflows | `squads/{pack_name}/workflows/` | Multi-phase workflows |
| Tasks | `squads/{pack_name}/tasks/` | Atomic tasks |
| Templates | `squads/{pack_name}/templates/` | Output templates |
| Checklists | `squads/{pack_name}/checklists/` | Validation checklists |
| Knowledge Base | `squads/{pack_name}/data/{pack_name}-kb.md` | Domain knowledge |
| Documentation | `squads/{pack_name}/README.md` | Usage documentation |
| Config | `squads/{pack_name}/config.yaml` | Pack configuration |

---

## Validation Criteria (All Must Pass)

### Structure
- [ ] Pack directory exists at `squads/{pack_name}/`
- [ ] All required subdirectories created
- [ ] config.yaml is valid YAML

### Agents
- [ ] Orchestrator agent exists
- [ ] At least one Tier 0 agent exists
- [ ] All agents pass SC_AGT_001 (300+ lines, voice_dna, etc.)
- [ ] All agents have tier assigned

### Workflows
- [ ] Complex operations have workflows (not just tasks)
- [ ] All workflows have 3+ phases
- [ ] All workflows have checkpoints

### Tasks
- [ ] All tasks follow Task Anatomy (8 fields)
- [ ] Complex tasks are 500+ lines
- [ ] Executor assigned for each task

### Documentation
- [ ] README.md complete with all sections
- [ ] Usage examples provided
- [ ] Installation instructions clear

### Quality
- [ ] Overall score >= 7.0
- [ ] No blocking items failed
- [ ] Research foundation documented

---

## Heuristics Reference

| Heuristic ID | Name | Where Applied | Blocking |
|--------------|------|---------------|----------|
| SC_DSC_001 | Discovery Complete | Phase 0 | Yes |
| SC_RES_001 | Research Quality Gate | Phase 1 | Yes |
| SC_ARC_001 | Architecture Approved | Phase 2 | Yes |
| SC_AGT_001 | Agent Quality Gate | Phase 3 | Yes |
| SC_CRT_001 | Creation Quality | Phase 3 | Yes |
| SC_INT_001 | Integration Complete | Phase 4 | No |
| SC_VAL_001 | Squad Validated | Phase 5 | Yes |

---

## Error Handling

```yaml
error_handling:
  research_fails:
    - retry_with_different_queries
    - if_still_fails: "Abort with explanation"

  agent_creation_fails:
    - identify_missing_research
    - supplement_research
    - retry_creation
    - if_still_fails: "Create simpler agent, note for improvement"

  validation_fails:
    - log_specific_failures
    - attempt_automated_fix
    - if_cannot_fix: "Report to human for decision"
```

---

## Integration with AIOS

This task creates squads that seamlessly integrate with:
- Core AIOS-FULLSTACK framework
- Standard installer (`npm run install:squad`)
- Memory layer for tracking
- Agent activation system (@agent-id syntax)
- Quality frameworks for validation

---

_Task Version: 2.0_
_Last Updated: 2026-02-01_
_Lines: 650+_
