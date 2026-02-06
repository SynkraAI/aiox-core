# SOP Validation Checklist

> **Pattern:** SC-CK-001 (SOP Validation Checklist)
> **Version:** 1.0.0
> **Used By:** @sop-extractor, extract-sop task

---

## Purpose

Validate that an extracted SOP meets all quality standards before handoff to squad creation.

---

## Part 1: Structure Completeness

### 1.1 All 11 Parts Present

- [ ] **PART 1:** Process Identification (metadata, triggers, preconditions)
- [ ] **PART 2:** Stakeholders and Executors (stakeholder map, RACI, executor analysis)
- [ ] **PART 3:** Data and Systems (inputs, outputs, tools, integrations)
- [ ] **PART 4:** Process Flow (diagram, detailed steps, decision points)
- [ ] **PART 5:** Quality and Validation (checklists, quality gates, META-AXIOMAS)
- [ ] **PART 6:** Exceptions and Troubleshooting
- [ ] **PART 7:** Automation Analysis (summary, map, barriers, PV_PM_001)
- [ ] **PART 8:** AIOS Squad Blueprint (agents, tasks, checkpoints, guardrails, workflow)
- [ ] **PART 9:** Gaps and Next Steps
- [ ] **PART 10:** Glossary
- [ ] **PART 11:** Extraction Metadata

**Score:** ___/11 parts | **Threshold:** 11/11 required

---

## Part 2: Task Anatomy Compliance (HO-TP-001)

### 2.1 Required Fields per Step

For EACH process step, verify:

| Step | task_name | status | executor | exec_type | est_time | inputs | outputs | actions | criteria |
|------|-----------|--------|----------|-----------|----------|--------|---------|---------|----------|
| 1 | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| 2 | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| 3 | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| ... | | | | | | | | | |

**Score:** ___% steps with 8/8 fields | **Threshold:** 100%

---

## Part 3: Executor Classification (HO-EP Framework)

### 3.1 Every Step Has Executor Type

- [ ] All steps have executor_type assigned
- [ ] Executor types are valid: Human | Agent | Hybrid | Worker

### 3.2 Classification Justification

- [ ] Human steps have cognitive justification (empathy, negotiation, accountability, ethics)
- [ ] Agent steps have automation justification (perception, analysis, synthesis)
- [ ] Hybrid steps have checkpoint defined
- [ ] Worker steps are 100% deterministic

**Score:** ___% steps with justified executor | **Threshold:** 100%

---

## Part 4: Cognitive Analysis

### 4.1 Cognitive Type per Step

- [ ] Each step has cognitive type(s) identified
- [ ] Evidence from transcript cited for classification

### 4.2 Automation Potential

- [ ] Each step evaluated for automation potential
- [ ] Non-automatable steps have "what requires human" documented
- [ ] Partially automatable steps have "what agent can do" documented

**Score:** ___% steps with cognitive analysis | **Threshold:** 100%

---

## Part 5: Decision Rules

### 5.1 Decision Points Captured

- [ ] All "if/when/depends" statements converted to decision points
- [ ] Each decision point has: question, options, criteria, decider

### 5.2 IF/THEN Rules

- [ ] Heuristics translated to explicit IF/THEN rules
- [ ] Rules marked as automatable or human-required

**Score:** ___/___  decision points documented | **Threshold:** 100%

---

## Part 6: Automation Analysis (PV_PM_001)

### 6.1 Frequency/Impact/Automatability Matrix

- [ ] Each step evaluated on: Frequency, Impact, Automatability
- [ ] Decision assigned: AUTOMATE | DELEGATE | KEEP_MANUAL | ELIMINATE

### 6.2 Guardrails Requirement

- [ ] VETO applied to any automation without guardrails
- [ ] Guardrails defined for each automated step:
  - [ ] Loop Prevention
  - [ ] Idempotency
  - [ ] Audit Trail
  - [ ] Escape Route
  - [ ] Retry Logic (if external integration)
  - [ ] Rollback (if destructive)

**Score:** ___% automatable steps with guardrails | **Threshold:** 100%

---

## Part 7: META-AXIOMAS Score

### 7.1 10 Dimensions Evaluated

| # | Dimension | Score (0-10) | Above 6.0? |
|---|-----------|--------------|------------|
| 1 | Truthfulness | | ☐ |
| 2 | Coherence | | ☐ |
| 3 | Strategic Alignment | | ☐ |
| 4 | Operational Excellence | | ☐ |
| 5 | Innovation Capacity | | ☐ |
| 6 | Risk Management | | ☐ |
| 7 | Resource Optimization | | ☐ |
| 8 | Stakeholder Value | | ☐ |
| 9 | Sustainability | | ☐ |
| 10 | Adaptability | | ☐ |

**Overall Score:** ___/10 | **Threshold:** ≥7.0

---

## Part 8: Squad Blueprint Quality

### 8.1 Agents Defined

- [ ] At least one orchestrator agent defined
- [ ] Agent responsibilities map to process steps
- [ ] No orphan steps (all steps assigned to an agent)

### 8.2 Tasks Defined

- [ ] Tasks cover all workflow phases
- [ ] Elicit flags set correctly for interactive tasks
- [ ] Checkpoint flags set for validation points

### 8.3 Workflow YAML

- [ ] Workflow YAML is syntactically valid
- [ ] Phases are sequenced correctly
- [ ] Handoffs are defined between phases
- [ ] Checkpoints reference valid validators

**Score:** Blueprint completeness ___% | **Threshold:** 100%

---

## Part 9: Gap Documentation

### 9.1 Gaps Identified

- [ ] All `[INFERRED]` items listed in gaps
- [ ] Each gap has: impact, clarifying question, priority

### 9.2 Ambiguities Documented

- [ ] Ambiguous statements have multiple interpretations listed
- [ ] Recommendation for resolution provided

### 9.3 Red Flags Addressed

- [ ] Single points of failure identified
- [ ] Undocumented exceptions flagged
- [ ] Non-standardized variations noted

**Score:** ___% gaps with clarifying questions | **Threshold:** 100%

---

## Part 10: Evidence & Traceability

### 10.1 Transcript Citations

- [ ] Key decisions cite transcript evidence
- [ ] Cognitive classifications cite evidence
- [ ] Heuristics cite original quotes

### 10.2 Confidence Levels

- [ ] High confidence items used as-is
- [ ] Medium confidence items marked for validation
- [ ] Low confidence items marked `[INFERRED]`
- [ ] Absent items listed in gaps

---

## Validation Summary

| Category | Score | Threshold | Status |
|----------|-------|-----------|--------|
| Structure (11 parts) | /11 | 11/11 | ☐ PASS ☐ FAIL |
| Task Anatomy (8 fields) | % | 100% | ☐ PASS ☐ FAIL |
| Executor Classification | % | 100% | ☐ PASS ☐ FAIL |
| Cognitive Analysis | % | 100% | ☐ PASS ☐ FAIL |
| Decision Rules | % | 100% | ☐ PASS ☐ FAIL |
| Guardrails | % | 100% | ☐ PASS ☐ FAIL |
| META-AXIOMAS | /10 | ≥7.0 | ☐ PASS ☐ FAIL |
| Squad Blueprint | % | 100% | ☐ PASS ☐ FAIL |
| Gap Documentation | % | 100% | ☐ PASS ☐ FAIL |

---

## Final Decision

- [ ] **APPROVE** - SOP meets all thresholds, ready for squad creation
- [ ] **REVIEW** - SOP needs improvements in specific areas (list below)
- [ ] **REJECT** - SOP has critical gaps, requires re-extraction

**Areas Needing Improvement:**
1.
2.
3.

---

## Handoff Authorization

| Field | Value |
|-------|-------|
| Validated By | |
| Validation Date | |
| Handoff To | create-squad task |
| Artifacts Transferred | sop_document, squad_blueprint, gap_report |

---

**Pattern Compliance:** SC-CK-001 ✓ | HO-TP-001 ✓ | PV_PM_001 ✓
