# Task: Structure Question Bank for Assessment

**Task ID:** dopamine-learning/assessment-09-structure-question-bank
**Version:** 1.0.0
**Status:** Production Ready
**Created:** 2026-02-12
**Category:** Assessment Feedback Realtime Workflow
**Total Lines:** 340

---

## Executive Summary

This task organizes all assessment questions with explicit mapping to learning objectives, difficulty levels, and assessment types. Instead of random questions, this creates a structured question bank that ensures comprehensive coverage of all learning objectives across all difficulty tiers.

**Workflow Position:** Phase 1 of Assessment Feedback Realtime workflow
**Input Dependency:** Questions from workflows (Quiz, Challenge)
**Success Definition:** Question bank with metadata for all questions; 100% of objectives covered**

---

## Purpose

Unstructured questions:
- ❌ Some objectives tested 5x, others never tested
- ❌ All questions at same difficulty (confusing for varied learners)
- ❌ No connection to learning objectives visible

Structured question bank:
- ✅ Every objective tested 2-3x across difficulty levels
- ✅ Difficulty calibrated per objective
- ✅ Questions organized by objective + difficulty
- ✅ Missing coverage identified + filled

---

## Executor Type

**Hybrid (70% Agent, 30% Human)**

Agent structures, human validates coverage.

---

## Inputs

### Required Inputs

```yaml
questions_source:
  field: "Question bank from Quiz Immersivo or Challenge workflows"
  format: "YAML (from Tasks 3 or similar)"
  required: true

learning_objectives:
  field: "Complete list of learning objectives"
  format: "list"
  required: true

difficulty_taxonomy:
  field: "Difficulty levels (Bloom's 1-6)"
  format: "text"
  required: true
  example: "L1-Knowledge, L2-Comprehension, L3-Application, L4-Analysis, L5-Synthesis, L6-Evaluation"
```

---

## Preconditions

- [ ] Questions exist (from Quiz or Challenge workflows)
- [ ] Learning objectives defined
- [ ] Difficulty/Bloom levels established

---

## Steps

### Step 1: Audit Existing Questions (5 min)

**Agent Activity:**
- For each question, extract:
  1. Question ID
  2. Text/content
  3. Existing objective mapping (if any)
  4. Difficulty level (estimate if not provided)
  5. Question type (multiple choice, free response, etc.)

**Output:** Question inventory spreadsheet

**Checkpoint:** All questions catalogued

---

### Step 2: Map Questions to Learning Objectives (8 min)

**Agent Activity:**
- For each question, determine which learning objective(s) it tests:
  - Explicit mapping: Question directly tests objective
  - Implicit mapping: Question partly touches objective
  - No mapping: Question doesn't align with any objective

- Identify coverage gaps:
  - Which objectives are over-tested? (≥4 questions)
  - Which are under-tested? (0-1 questions)
  - Which are missing entirely?

**Output:** Objective-to-question mapping + coverage analysis

**Checkpoint:** Coverage gaps identified

---

### Step 3: Classify Difficulty Per Question (8 min)

**Agent Activity:**
- Using Bloom's taxonomy, classify each question:
  - L1 (Knowledge): Recall facts
  - L2 (Comprehension): Understand concepts
  - L3 (Application): Use in context
  - L4 (Analysis): Break down, compare
  - L5 (Synthesis): Create, combine
  - L6 (Evaluation): Judge, assess

- Ensure good distribution:
  - L1-2: 20% (foundation)
  - L3: 40% (application, core)
  - L4-5: 30% (advanced)
  - L6: 10% (evaluation, rare)

**Output:** Difficulty classification for all questions

**Checkpoint:** All questions classified

---

### Step 4: Identify Coverage Gaps & Fill (10 min)

**Agent Activity:**
- Identify missing questions:
  - Objectives with 0-1 questions → need 2-3 total
  - Difficulty levels under-represented → design new questions
  - Question type imbalance → if all multiple choice, add scenarios

- For each gap, specify:
  - Objective being tested
  - Difficulty level needed
  - Question type recommended
  - Approximate content (for human to write)

**Output:** Coverage gap report + recommendations

**Checkpoint:** All gaps documented

---

### Step 5: Create Question Bank Structure (7 min)

**Agent Activity:**
- Organize question bank as:
  - Primary sort: Learning Objective
  - Secondary sort: Difficulty level
  - Tertiary sort: Question type

Example structure:
```
OBJECTIVE: Explain microservice architecture
  - L2 (Comprehension)
    - Question: "What's a microservice?" (definition)
    - Question: "Why use microservices?" (concept)
  - L3 (Application)
    - Question: "Design services for X scenario" (scenario-based)
    - Question: "Troubleshoot this architecture" (problem-based)
  - L4 (Analysis)
    - Question: "Compare monolith vs microservices" (comparison)

OBJECTIVE: Predict service interactions
  - L3 (Application)
    - Question: "Which service handles X?" (prediction)
  - L4 (Analysis)
    - Question: "Why does Payment talk to Auth?" (reasoning)
```

**Output:** Structured question bank document (YAML)

**Checkpoint:** Questions organized by objective + difficulty

---

## Outputs

### Primary Output

**Structured Question Bank**

Format: YAML
Location: `/squads/dopamine-learning/data/question-banks/{{ quiz-slug }}-structured-bank.yaml`

```yaml
structured_question_bank:
  quiz_id: "product-onboarding-microservices"
  created: "{{ timestamp }}"
  total_questions: 24
  coverage_status: "complete"  # or "gaps_identified"

  learning_objectives:
    - objective_id: "obj_arch_001"
      objective: "Explain why product uses microservices vs monolith"
      bloom_level: 2
      questions:
        - question_id: "q_arch_001_orig"
          question_text: "What is a microservice?"
          question_type: "definition"
          difficulty_estimated: 2
          mapped_bloom_level: 2

        - question_id: "q_arch_001_narrative"
          question_text: "[Crisis scenario] Why didn't we catch this earlier?"
          question_type: "narrative_scenario"
          difficulty_estimated: 3
          mapped_bloom_level: 2-3

        - question_id: "q_arch_001_mystery"
          question_text: "[Clue-based] Why would someone architect it this way?"
          question_type: "mystery"
          difficulty_estimated: 4
          mapped_bloom_level: 3-4

      coverage_status: "complete"  # 3 questions, 3 difficulty levels
      coverage_recommendation: "Sufficient. Good variety."

    - objective_id: "obj_arch_002"
      objective: "Predict which service handles specific feature"
      bloom_level: 3
      questions:
        - question_id: "q_arch_002_orig"
          question_text: "Which service processes payments?"
          question_type: "multiple_choice"
          difficulty_estimated: 3

        - question_id: "q_arch_002_challenge"
          question_text: "Service Detective challenge (easy/med/hard)"
          question_type: "progressive_challenge"
          difficulty_estimated: 3-4

      coverage_status: "gaps_identified"
      coverage_recommendation: "Add 1-2 application questions at L3-4"
      recommended_gap:
        - "L4 question: Analyze why service X talks to service Y"
        - "L5 question: Design new service interactions"

  difficulty_distribution:
    l1_knowledge: 3
    l2_comprehension: 6
    l3_application: 10
    l4_analysis: 4
    l5_synthesis: 1
    l6_evaluation: 0
    distribution_percent:
      l1_2: 22  # 5/22 questions
      l3: 45    # 10/22 questions
      l4_5: 23  # 5/22 questions
      l6: 0     # 0/22 questions

  question_type_distribution:
    multiple_choice: 8
    free_response: 4
    scenario_based: 6
    challenge_progression: 3
    mystery: 2
    narrative: 1

  coverage_matrix:
    # Shows which objectives are covered at which difficulty
    headers: [objective, l1, l2, l3, l4, l5, l6, total]
    rows:
      - [obj_arch_001, "", 2, 1, 1, "", "", 4]
      - [obj_arch_002, "", 1, 2, 1, "", "", 4]
      - [obj_arch_003, "", "", 3, "", "", "", 3]
      - [obj_arch_004, 2, 2, 2, "", 1, "", 7]

  coverage_summary:
    all_objectives_covered: true
    min_questions_per_objective: 1
    max_questions_per_objective: 7
    avg_questions_per_objective: 3.4
    gaps_identified: 2
    gap_details:
      - objective: "obj_arch_002"
        gap: "No L4-5 analysis questions"
        recommended_count: 2
      - objective: "obj_arch_003"
        gap: "No L1-2 foundation, jumps to L3"
        recommended_count: 1

  quality_metrics:
    question_alignment_score: 0.95  # 95% of questions map to objectives
    difficulty_spread_score: 0.85   # Good distribution, could use more L5-6
    coverage_completeness: 0.90     # 90% complete, 2 gaps identified

  recommended_additions:
    - objective: "obj_arch_002"
      difficulty: 4
      question_type: "analysis"
      question_concept: "Why does Payment call Auth service? (design reasoning)"

    - objective: "obj_arch_003"
      difficulty: 2
      question_type: "comprehension"
      question_concept: "Define circuit breaker pattern (foundational)"
```

### Secondary Outputs

1. **Coverage Gap Report** (markdown, gaps + recommendations)
2. **Difficulty Distribution Chart** (visual)
3. **Question Audit Spreadsheet** (CSV/XLSX)

---

## Validation

### Checklist

- [ ] All questions mapped to at least one objective
- [ ] All objectives mapped to at least one question
- [ ] Difficulty distribution includes L1-L5 (majority L2-4)
- [ ] No objective has only 1 question (min 2-3 for reliability)
- [ ] Coverage gaps identified and documented
- [ ] Coverage matrix shows which objective-difficulty combinations exist
- [ ] Question types include variety (not all multiple choice)
- [ ] Quality score ≥85%

### Success Criteria

**Threshold: 8/10**

| Criteria | Excellent | Acceptable | Poor |
|----------|-----------|-----------|------|
| **Objective Mapping** | Every objective has 2-3 questions | 1 objective under-covered | Multiple objectives missing |
| **Difficulty Coverage** | L2-4 well distributed, L1/5 present | Mostly L3-4, missing L1-2 | Skewed to one level |
| **Gap Identification** | Clear gaps + specific recommendations | Gaps identified, recs vague | No gap analysis |
| **Question Variety** | Multiple types (scenario, MC, free response) | Mostly one type | All one type |

---

## Estimated Effort

| Role | Effort |
|------|--------|
| Agent | 25-35 min |
| Human | 10-15 min |
| Total | 35-50 min |

---

## Integration

### Feeds To

**Next Task:** Task 10 - design-feedback-layers
- Uses: Structured question bank with metadata
- Produces: Feedback layer specs for these questions

### Agent Routing

**Primary Agent:** Gee (learning validation)

---

## Revision History

| Version | Date | Change |
|---------|------|--------|
| 1.0.0 | 2026-02-12 | Initial release |

