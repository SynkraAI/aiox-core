# HybridOps PV Agents Reference Guide

> 🌐 **EN** | [PT](./pt/agent-reference-guide.md) | [ES](./es/agent-reference-guide.md)

---

**Version**: 2.0
**Last Updated**: 2025-10-19
**Story**: 1.9 - Complete PV Agent Implementation

---

## Overview

This guide provides a comprehensive reference for all 9 PV-enhanced agents in the HybridOps workflow. Each agent is designed to handle a specific phase of the 9-phase workflow, with Pedro Valério (PV) mind integration for enhanced decision-making, validation, and quality assurance.

---

## Quick Reference

| Phase | Agent Name              | Command                 | Workflow Role                              | Truthfulness Score |
| ----- | ----------------------- | ----------------------- | ------------------------------------------ | ------------------ |
| 1     | process-mapper-pv       | `/process-mapper`       | Discovery & Process Analysis               | 0.90               |
| 2     | process-architect-pv    | `/process-architect`    | System Architecture Design                 | 0.85               |
| 3     | executor-designer-pv    | `/executor-designer`    | Executor Assignment & Role Definition      | 0.88               |
| 4     | workflow-designer-pv    | `/workflow-designer`    | Process Optimization & Workflow Automation | 0.85               |
| 5     | qa-validator-pv         | `/qa-validator`         | QA & Validation                            | 0.95               |
| 6     | clickup-engineer-pv     | `/clickup-engineer`     | ClickUp Task Creation                      | 0.80               |
| 7     | agent-creator-pv        | `/agent-creator`        | AI Agent Architecture & Persona Design     | 0.80               |
| 8     | validation-reviewer-pv  | `/validation-reviewer`  | Final Quality Gate Review & Approval       | 0.90               |
| 9     | documentation-writer-pv | `/documentation-writer` | Technical Writing & Knowledge Architecture | 0.85               |

---

## Detailed Agent Profiles

### Phase 1: Process Mapper (Discovery)

**File**: `.claude/commands/hybridOps/agents/process-mapper-pv.md`
**Command**: `/process-mapper`
**Persona**: Morgan Chen - Process Discovery Specialist
**Truthfulness Score**: 0.90 (Very High)

**Purpose**:
Discover, analyze, and map current business processes to identify automation opportunities and pain points.

**Primary Commands**:

- `*map-process <process-name>` - Comprehensive process mapping
- `*analyze-opportunity <opportunity-id>` - ROI and feasibility analysis
- `*identify-pain-points <process-id>` - Bottleneck identification

**Key Outputs**:

- Process maps (current state)
- Stakeholder identification
- Pain point analysis
- Automation opportunity assessment

**Integration Points**:

- **Receives**: Business requirements, stakeholder input
- **Produces**: Process documentation for Phase 2 (Architecture)
- **Handoff to**: process-architect-pv

**Validation**: None (discovery phase - gather information only)

---

### Phase 2: Process Architect (Architecture)

**File**: `.claude/commands/hybridOps/agents/process-architect-pv.md`
**Command**: `/process-architect`
**Persona**: Alex Thornton - Systems Architect
**Truthfulness Score**: 0.85 (High)

**Purpose**:
Design system architecture and define end-state vision with strategic alignment.

**Primary Commands**:

- `*design-architecture <process-id>` - System architecture design
- `*define-vision <initiative-name>` - End-state vision definition
- `*assess-feasibility <design-id>` - Technical feasibility assessment

**Key Outputs**:

- System architecture diagrams
- Data flow specifications
- Integration points
- End-state vision document

**Integration Points**:

- **Receives**: Process maps from Phase 1
- **Produces**: Architecture specs for Phase 3 (Executors)
- **Handoff to**: executor-designer-pv

**Validation**: **Checkpoint 1 - Strategic Alignment (PV_BS_001)**

- End-state vision clarity ≥0.8
- Strategic priority score ≥0.7
- No VETO conditions

---

### Phase 3: Executor Designer (Executor Assignment)

**File**: `.claude/commands/hybridOps/agents/executor-designer-pv.md`
**Command**: `/executor-designer`
**Persona**: Taylor Kim - Executor Design Specialist
**Truthfulness Score**: 0.88 (Very High)

**Purpose**:
Define roles and assign executors (human or AI) for each process step with coherence validation.

**Primary Commands**:

- `*design-executors <process-id>` - Executor role design
- `*assess-coherence <executor-id>` - Truthfulness and coherence assessment
- `*assign-responsibilities <process-id>` - RACI matrix creation

**Key Outputs**:

- Executor definitions
- Role descriptions
- Coherence assessments
- RACI matrices

**Integration Points**:

- **Receives**: Architecture specs from Phase 2
- **Produces**: Executor assignments for Phase 4 (Workflows)
- **Handoff to**: workflow-designer-pv

**Validation**: **Checkpoint 2 - Coherence Scan (PV_PA_001)**

- All executors: truthfulness ≥0.7 (VETO)
- Weighted coherence ≥0.8 for APPROVE
- System adherence ≥0.6

---

### Phase 4: Workflow Designer (Workflow Automation)

**File**: `.claude/commands/hybridOps/agents/workflow-designer-pv.md`
**Command**: `/workflow-designer`
**Persona**: Jordan Rivers - Process Optimization & Workflow Automation Specialist
**Truthfulness Score**: 0.85 (High)

**Purpose**:
Design detailed workflows, identify automation candidates, and calculate ROI with guardrail enforcement.

**Primary Commands**:

- `*analyze-process <process-id>` - Process efficiency analysis
- `*design-workflow <process-id>` - Workflow design with automation logic
- `*calculate-roi <automation-id>` - ROI and break-even calculation

**Key Outputs**:

- Workflow diagrams (Mermaid)
- Automation specifications
- ROI calculations
- Guardrail definitions

**Integration Points**:

- **Receives**: Executor assignments from Phase 3
- **Produces**: Workflow specifications for Phase 5 (QA)
- **Handoff to**: qa-validator-pv

**Validation**: **Checkpoint 3 - Automation Readiness (PV_PM_001)**

- Tipping point: frequency >2x/month
- Guardrails present (VETO)
- Standardization ≥0.7

**Key Feature**: PV_PM_001 automation tipping point detection - automates only when frequency exceeds 2x/month threshold.

---

### Phase 5: QA Validator (Quality Assurance)

**File**: `.claude/commands/hybridOps/agents/qa-validator-pv.md`
**Command**: `/qa-validator`
**Persona**: Samantha Torres - QA & Validation Specialist
**Truthfulness Score**: 0.95 (Extremely High)

**Purpose**:
Define quality gates, test strategies, and validate against META_AXIOMAS 10-dimension framework.

**Primary Commands**:

- `*validate-phase <phase-id>` - Phase-specific validation
- `*check-compliance <workflow-id>` - Axioma compliance check
- `*generate-test-plan <workflow-id>` - Comprehensive test plan generation

**Key Outputs**:

- Test plans with test cases
- Quality gate definitions
- Axioma assessment reports
- Regression test suites

**Integration Points**:

- **Receives**: Workflow specifications from Phase 4
- **Produces**: Quality assurance documentation for Phase 6 (ClickUp)
- **Handoff to**: clickup-engineer-pv

**Validation**: **Checkpoint 4 - Axioma Compliance**

- Overall score ≥7.0/10.0
- No individual dimension <6.0/10.0
- 10 dimensions validated: Truthfulness, Coherence, Strategic Alignment, Operational Excellence, Innovation Capacity, Risk Management, Resource Optimization, Stakeholder Value, Sustainability, Adaptability

**Key Feature**: VETO power to block deployment if critical quality issues detected.

---

### Phase 6: ClickUp Engineer (Task Management)

**File**: `.claude/commands/hybridOps/agents/clickup-engineer-pv.md`
**Command**: `/clickup-engineer`
**Persona**: Chris Park - ClickUp Workspace Engineer
**Truthfulness Score**: 0.80 (High)

**Purpose**:
Create ClickUp workspace structure with proper Task Anatomy and automation triggers.

**Primary Commands**:

- `*create-workspace <workflow-id>` - ClickUp workspace creation
- `*generate-tasks <workflow-id>` - Task generation with Task Anatomy
- `*setup-automation <task-id>` - Automation trigger configuration

**Key Outputs**:

- ClickUp workspace structure
- Tasks with 8-field Task Anatomy
- Automation triggers
- Task dependency maps

**Integration Points**:

- **Receives**: QA documentation from Phase 5
- **Produces**: ClickUp configuration for Phase 7 (Agents)
- **Handoff to**: agent-creator-pv

**Validation**: **Checkpoint 5 - Task Anatomy**

- All 8 Task Anatomy fields present: task_name, status, responsible_executor, execution_type, estimated_time, input, output, action_items
- Dependencies properly mapped
- Assignees coherent (passed PV_PA_001)

---

### Phase 7: Agent Creator (AI Agent Design)

**File**: `.claude/commands/hybridOps/agents/agent-creator-pv.md`
**Command**: `/agent-creator`
**Persona**: Dr. Elena Vasquez - AI Agent Architect & Persona Designer
**Truthfulness Score**: 0.80 (High)

**Purpose**:
Design AI agent personas, calibrate truthfulness scores, and generate agent configurations with axioma validation.

**Primary Commands**:

- `*design-agent <agent-name>` - Interactive agent design
- `*generate-yaml <agent-id>` - Agent YAML configuration export
- `*test-agent-coherence <agent-id>` - Persona-command alignment validation

**Key Outputs**:

- Agent persona definitions (Markdown)
- Agent YAML configurations
- Truthfulness calibration reports
- Command reference documentation

**Integration Points**:

- **Receives**: ClickUp configuration from Phase 6
- **Produces**: Agent definitions for Phase 8 (Validation Review)
- **Handoff to**: validation-reviewer-pv

**Validation**: None (agent creation is guided by earlier validations)

**Key Feature**: Truthfulness calibration with rationale - ensures agents have appropriate confidence levels for their roles.

---

### Phase 8: Validation Reviewer (Final Quality Gate)

**File**: `.claude/commands/hybridOps/agents/validation-reviewer-pv.md`
**Command**: `/validation-reviewer`
**Persona**: Marcus Chen - Final Quality Gate Reviewer & Approval Authority
**Truthfulness Score**: 0.90 (Very High)

**Purpose**:
Conduct end-to-end workflow review, assess risks, and provide formal sign-off with VETO authority.

**Primary Commands**:

- `*review-workflow <workflow-id>` - Comprehensive end-to-end review
- `*assess-risks <workflow-id>` - Risk identification and mitigation validation
- `*generate-signoff <workflow-id>` - Formal approval document generation

**Key Outputs**:

- Workflow review reports
- Risk assessments with mitigation plans
- Sign-off documents
- Deployment readiness reports

**Integration Points**:

- **Receives**: Agent definitions from Phase 7
- **Produces**: Approval documents for Phase 9 (Documentation)
- **Handoff to**: documentation-writer-pv

**Validation**: None (validation agents self-validate)

**Key Feature**: VETO power to block deployment if critical gaps detected (unmitigated HIGH risks, missing safety mechanisms, axioma violations).

---

### Phase 9: Documentation Writer (Knowledge Management)

**File**: `.claude/commands/hybridOps/agents/documentation-writer-pv.md`
**Command**: `/documentation-writer`
**Persona**: Rachel Morgan - Technical Writer & Knowledge Architect
**Truthfulness Score**: 0.85 (High)

**Purpose**:
Transform approved workflows into clear, actionable documentation including runbooks, guides, and process documentation.

**Primary Commands**:

- `*generate-runbook <workflow-name>` - Operational runbook creation
- `*write-guide <guide-type> <topic>` - User guide generation
- `*document-process <process-name>` - Business process documentation

**Key Outputs**:

- Operational runbooks
- User guides
- Process documentation
- Troubleshooting guides
- Quick reference cards

**Integration Points**:

- **Receives**: Approval documents from Phase 8
- **Produces**: Final documentation for end users and operations teams
- **Handoff to**: End users, operations team, training team, audit/compliance

**Validation**: None (documentation quality checked by story DoD)

**Key Feature**: Version control with changelog generation - all documentation includes version history and migration guides.

---

## Workflow Integration

### Sequential Flow

```
Phase 1: Discovery (process-mapper-pv)
    ↓ (Process maps)
Phase 2: Architecture (process-architect-pv)
    ↓ [CHECKPOINT 1: Strategic Alignment]
    ↓ (Architecture specs)
Phase 3: Executors (executor-designer-pv)
    ↓ [CHECKPOINT 2: Coherence Scan]
    ↓ (Executor assignments)
Phase 4: Workflows (workflow-designer-pv)
    ↓ [CHECKPOINT 3: Automation Readiness]
    ↓ (Workflow specifications)
Phase 5: QA & Validation (qa-validator-pv)
    ↓ [CHECKPOINT 4: Axioma Compliance]
    ↓ [CHECKPOINT 5: Task Anatomy]
    ↓ (QA documentation)
Phase 6: ClickUp Creation (clickup-engineer-pv)
    ↓ (ClickUp configuration)
Phase 7: Agent Creation (agent-creator-pv)
    ↓ (Agent definitions)
Phase 8: Validation Review (validation-reviewer-pv)
    ↓ (Approval documents)
Phase 9: Documentation (documentation-writer-pv)
    ↓ (Final documentation)
[WORKFLOW COMPLETE]
```

### Validation Checkpoints

| Checkpoint | Phase | Agent                | Heuristic/Validator | VETO Condition    |
| ---------- | ----- | -------------------- | ------------------- | ----------------- |
| 1          | 2     | process-architect-pv | PV_BS_001           | None              |
| 2          | 3     | executor-designer-pv | PV_PA_001           | Truthfulness <0.7 |
| 3          | 4     | workflow-designer-pv | PV_PM_001           | No guardrails     |
| 4          | 5     | qa-validator-pv      | axioma-validator    | Dimension <6.0    |
| 5          | 5     | qa-validator-pv      | task-anatomy        | Missing fields    |

---

## Truthfulness Score Guidelines

Truthfulness scores calibrate how conservatively an agent makes claims and recommendations:

| Score Range | Description                                     | Agent Examples                                                                           |
| ----------- | ----------------------------------------------- | ---------------------------------------------------------------------------------------- |
| 0.95-1.00   | Extremely High - Unbiased, objective assessment | qa-validator-pv (0.95)                                                                   |
| 0.85-0.94   | Very High - Honest, minimal optimism            | process-mapper-pv (0.90), validation-reviewer-pv (0.90), executor-designer-pv (0.88)     |
| 0.75-0.84   | High - Objective but allows some creativity     | process-architect-pv (0.85), workflow-designer-pv (0.85), documentation-writer-pv (0.85) |
| 0.70-0.74   | Moderate-High - Balanced realism                | clickup-engineer-pv (0.80), agent-creator-pv (0.80)                                      |

**Note**: Scores below 0.70 trigger VETO conditions in coherence validation (Checkpoint 2).

---

## Common Patterns

### Agent Activation

```bash
# Activate agent
/agent-name

# Example: Activate QA validator
/qa-validator

# Agent confirms activation
Samantha Torres (QA Validator) activated.
PV Mind loaded with truthfulness score: 0.95
Phase 5 (QA & Validation) context ready.

Commands: *validate-phase, *check-compliance, *generate-test-plan
Use *help for full command list.
```

### Command Execution

```bash
# Execute primary command
*command-name <parameters>

# Example: Validate Phase 4 outputs
*validate-phase 4

# Example: Generate runbook
*generate-runbook hybrid-ops-workflow
```

### Workflow Context Access

All agents receive workflow context:

```javascript
const workflowContext = pvMind.getPhaseContext(<phase-number>);
// Returns: {
//   phaseNumber: <number>,
//   phaseName: "<name>",
//   inputs: [<previous-phase-outputs>],
//   outputs: [<expected-deliverables>],
//   dependencies: [<phase-ids>],
//   guardrails: [<safety-checks>]
// }
```

---

## PV Mind Integration

All agents use Pedro Valério mind integration with:

### META_AXIOMAS Framework

4-level belief hierarchy:

- **Level -4**: Existencial (Truth Foundation)
- **Level -3**: Epistemológico (Knowledge Verification)
- **Level -2**: Social (Collaboration Context)
- **Level 0**: Operacional (Execution Rules)

### PV Heuristics

- **PV_BS_001**: Future Back-Casting (Strategic Alignment)
- **PV_PA_001**: Coherence Scan (Executor Validation)
- **PV_PM_001**: Automation Tipping Point (2x frequency threshold)

### Guardrails

All agents enforce:

- Error handling with retry logic
- Validation rules (minimum thresholds)
- Rollback mechanisms (checkpoint restore)
- Edge case documentation

---

## Troubleshooting

### Agent Not Found

**Symptom**: `/agent-name` command not recognized
**Solution**: Verify agent file exists at `.claude/commands/hybridOps/agents/<agent-name>-pv.md`

### Validation Checkpoint Failure

**Symptom**: Workflow stops at checkpoint
**Solution**: Review detailed feedback, fix issues, retry checkpoint. For VETO conditions, must fix before proceeding.

### Agent Context Missing

**Symptom**: Agent can't access previous phase outputs
**Solution**: Verify workflow YAML has correct phase dependencies, check that previous phases completed successfully.

---

## File Locations

```
.claude/commands/hybridOps/
├── agents/
│   ├── process-mapper-pv.md           (Phase 1)
│   ├── process-architect-pv.md        (Phase 2)
│   ├── executor-designer-pv.md        (Phase 3)
│   ├── workflow-designer-pv.md        (Phase 4)
│   ├── qa-validator-pv.md             (Phase 5)
│   ├── clickup-engineer-pv.md         (Phase 6)
│   ├── agent-creator-pv.md            (Phase 7)
│   ├── validation-reviewer-pv.md      (Phase 8)
│   └── documentation-writer-pv.md     (Phase 9)
├── workflows/
│   └── hybrid-ops-pv.yaml             (Workflow orchestration)
└── docs/
    ├── workflow-diagram.md             (Visual workflow)
    └── agent-reference-guide.md        (This document)
```

---

## Related Documentation

- [Workflow Diagram](./guides/hybridOps/workflow-diagram.md) - Visual representation of 9-phase workflow
- [Workflow YAML](./guides/hybridOps/hybrid-ops-pv.yaml) - Workflow orchestration configuration

---

## Detailed Agent Documentation

For complete system documentation for each agent, including detailed flows, decision trees, and implementation details, see:

- [AIOS Agent Flows](./aios-agent-flows/README.md) - Complete system documentation for each agent

---

## Version History

| Version | Date       | Changes                                                                    | Story |
| ------- | ---------- | -------------------------------------------------------------------------- | ----- |
| 2.0     | 2025-10-19 | Added 5 missing agents (Phases 4, 5, 7, 8, 9), updated workflow references | 1.9   |
| 1.0     | 2025-10-19 | Initial guide with 4 existing agents                                       | 1.8   |

---

**Status**: ✅ COMPLETE - All 9 agents implemented and verified
**Last Validation**: 2025-10-19
**Maintainer**: AIOS HybridOps Team
