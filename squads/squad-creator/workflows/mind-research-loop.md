# Workflow: Mind Research Loop

**Workflow ID:** mind-research-loop
**Version:** 2.0.0
**Purpose:** Research and validate the world's best minds for any domain through iterative loop with self-criticism
**Orchestrator:** @squad-architect
**Mode:** YOLO (100% autonomous, executes all iterations)

**Frameworks Used:**
- `data/tier-system-framework.md` → Classify minds by tier (Iteration 3, Final)
- `data/quality-dimensions-framework.md` → Score each mind (Iteration 3)
- `data/decision-heuristics-framework.md` → Cut/Keep heuristics (Iteration 2, 3)

---

## Core Philosophy

```
People with skin in the game > Generic AI bots
Real consequences = Battle-tested frameworks
Clone elite minds = Guaranteed quality
```

**FUNDAMENTAL RULE:**
> It doesn't matter if someone is "the best in the world" if there's no documented process we can replicate.

**MANDATORY CRITERIA:**
- Documented Framework/Methodology
- Extractable mental artifacts
- Step-by-step process
- Application examples

---

## Overview

This workflow ensures squads are built with the BEST MINDS in the world, not generic agents. Through iterative research with self-questioning (devil's advocate), we refine until only the best remain.

```
INPUT (domain + context)
    ↓
[ITERATION 1: Broad Research]
    → "Who are the biggest names in [domain]?"
    → Initial list: 15-20 names
    ↓
[ITERATION 2: Devil's Advocate]
    → "Why X and not Y?"
    → "Who would criticize this list?"
    → "Who are the contrarians?"
    → Refined list: 10-12 names
    ↓
[ITERATION 3: Framework Validation]
    → "Which ones HAVE documented frameworks?"
    → "Which have REPLICABLE methodology?"
    → "Which have real skin in the game?"
    → Refined list: 6-8 names
    ↓
[ITERATION 4: Cross-Reference] (if needed)
    → Verify across multiple sources
    → Confirm reputation
    → Check if anyone obvious is missing
    → Refined list: 4-6 names
    ↓
[ITERATION 5: Final Elite] (if needed)
    → Final validation of available documentation
    → Confirm each has sufficient material
    → Final list: 3-5 elite minds
    ↓
OUTPUT: Curated list of minds with replicable frameworks
```

**Quality Guarantee:**
- Minimum 3 iterations MANDATORY
- Maximum 5 iterations if necessary
- Each iteration QUESTIONS the previous one
- Only those with DOCUMENTED FRAMEWORKS pass

---

## Inputs

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `domain` | string | Yes | Area of expertise | `"copywriting"`, `"tax-law"`, `"hr"` |
| `context` | string | No | Additional context | `"for Brazilian startups"` |
| `must_include_local` | boolean | No | Include local/regional minds | `true` |
| `specific_needs` | list | No | Specific needs | `["contracts", "tax"]` |

---

## Workflow Steps

### ITERATION 1: Broad Research (Mandatory)

**Objective:** Map the universe of experts in the domain

**Research Queries:**
```yaml
queries:
  - "best {domain} experts thought leaders"
  - "top {domain} consultants frameworks"
  - "most influential {domain} professionals"
  - "{domain} methodology creators founders"
  - "best {domain} books authors"

  # If must_include_local (e.g., Brazilian):
  - "best {domain} Brazil specialists"
  - "{domain} Brazilian reference experts"
```

**For each result:**
```yaml
extract:
  - name: "Expert name"
  - title: "Known title/position"
  - known_for: "What they're known for"
  - has_framework: "Has own framework/methodology? (yes/no/unknown)"
  - sources_found: "Which sources mention this person"
```

**Output Iteration 1:**
```markdown
## Iteration 1: Initial Mapping

### Broad List (15-20 names)

| # | Name | Known for | Framework? | Sources |
|---|------|-----------|------------|---------|
| 1 | Expert A | X methodology | Yes | 5 sources |
| 2 | Expert B | Book Y | Unknown | 3 sources |
...

### Observations
- {patterns identified}
- {gaps in research}
- {areas to explore}
```

---

### ITERATION 2: Devil's Advocate (Mandatory)

**Objective:** Question your own research, find who's missing

**Self-Questioning Queries:**
```yaml
queries:
  - "critics of {expert_names} methodology"
  - "alternatives to {popular_framework}"
  - "{domain} contrarian experts different approach"
  - "underrated {domain} experts hidden gems"
  - "who disagrees with {top_expert} {domain}"
  - "{domain} experts not famous but effective"
```

**Reflection Questions:**
```yaml
self_questioning:
  - "Why {Expert A} and not {Expert B}?"
  - "Who would criticize this list? Why?"
  - "Who are the contrarians in {domain}?"
  - "Who is doing innovative work but isn't famous yet?"
  - "Is the list too American/Eurocentric?"
  - "Is any niche underrepresented?"
```

**APPLY: Decision Heuristics Framework - Devil's Advocate Heuristic**
```yaml
# From data/decision-heuristics-framework.md
heuristic:
  id: "SC_DA_001"
  name: "Devil's Advocate Cut/Keep"
  phase: "Iteration 2"

  weights:
    source_mentions: 0.8
    original_work: 0.9
    practical_results: 0.9
    framework_documented: 1.0  # VETO power

  thresholds:
    source_mentions: 3
    original_work: true
    practical_results: true

  veto_conditions:
    - condition: "source_mentions < 2"
      action: "CUT - Insufficient validation"
    - condition: "is_only_influencer = true"
      action: "CUT - No deep work"
    - condition: "no_practical_results = true"
      action: "CUT - Theory only"

  decision_tree: |
    IF sources < 2 → CUT (insufficient validation)
    ELSE IF is_popularizer_only → CUT (no original work)
    ELSE IF no_practical_evidence → REVIEW (needs more research)
    ELSE → KEEP (proceed to Iteration 3)
```

**Cut Criteria:**
```yaml
keep_if:
  - Mentioned in multiple sources (>=3)
  - Has original work (not just a popularizer)
  - Active practitioner (not just theorist)

cut_if:
  - Only appears in 1 source
  - Is just an "influencer" without deep work
  - No evidence of practical results
```

**Output Iteration 2:**
```markdown
## Iteration 2: Devil's Advocate

### Names Added (weren't in initial list)
| Name | Why they were missing | Relevance |
|------|----------------------|-----------|
| Expert X | Specific niche, less popular | High |

### Names Questioned
| Name | Questioning | Decision |
|------|-------------|----------|
| Expert B | Just a popularizer, no own framework | CUT |

### Refined List (10-12 names)
{updated list with justifications}

### Patterns Identified
- {insights from questioning}
```

---

### ITERATION 3: Framework Validation (Mandatory)

**Objective:** Ensure each name has REPLICABLE DOCUMENTATION
**Frameworks:** `data/quality-dimensions-framework.md` + `data/tier-system-framework.md`

**APPLY: Quality Dimensions Framework - Mind Assessment**
```yaml
# From data/quality-dimensions-framework.md - Adapted for mind validation
mind_dimensions:
  accuracy:
    weight: 1.0
    threshold: 7.0
    veto_power: true
    check: "Are their claims verified by results/case studies?"

  coherence:
    weight: 0.9
    threshold: 6.0
    check: "Is their methodology internally consistent?"

  operational_excellence:
    weight: 0.9
    threshold: 6.0
    check: "Is the process documented and replicable?"

  innovation_capacity:
    weight: 0.7
    threshold: 5.0
    check: "Did they create original frameworks?"

  stakeholder_value:
    weight: 0.8
    threshold: 6.0
    check: "Do they deliver proven results?"

scoring:
  method: "weighted_average"
  pass_threshold: 7.0
  per_dimension_min: 5.0
```

**APPLY: Tier System Framework - Mind Classification**
```yaml
# From data/tier-system-framework.md - Classify each mind
mind_tier_classification:
  tier_0_diagnosis:
    indicators:
      - "Creates diagnostic/audit frameworks"
      - "Establishes baseline before action"
      - "Analytical focus"
    examples: "Auditors, analysts, diagnosticians"

  tier_1_masters:
    indicators:
      - "Proven track record ($XXM+ results)"
      - "Original methodology"
      - "Deep expertise, not just popular"
    examples: "Domain masters with documented results"

  tier_2_systematizers:
    indicators:
      - "Creates teachable frameworks"
      - "Process-oriented thinking"
      - "Methodology developers"
    examples: "Framework creators, educators"

  tier_3_specialists:
    indicators:
      - "Format/channel specific expertise"
      - "Applied specialization"
    examples: "VSL specialist, email specialist"

  # Assign tier to each passing mind
  output: "Each mind gets tier assignment for squad organization"
```

**MANDATORY criteria to continue:**
```yaml
must_have_all:
  - framework_documented: "Has methodology/framework with own name?"
  - process_extractable: "Is there a documented step-by-step process?"
  - artifacts_available: "Has extractable templates, checklists, frameworks?"
  - examples_exist: "Are there application examples?"
  - material_accessible: "Is the material accessible (books, courses, articles)?"
```

**Validation Queries:**
```yaml
queries_per_expert:
  - "{expert_name} methodology framework"
  - "{expert_name} process step by step"
  - "{expert_name} book template checklist"
  - "{expert_name} case study results"
```

**APPLY: Decision Heuristics Framework - Framework Validation Gate**
```yaml
# From data/decision-heuristics-framework.md
heuristic:
  id: "SC_FV_001"
  name: "Framework Validation Gate"
  phase: "Iteration 3"

  weights:
    framework_documented: 1.0    # VETO power
    process_extractable: 0.9
    artifacts_available: 0.8
    examples_exist: 0.8
    material_accessible: 0.7

  veto_conditions:
    - condition: "framework_documented < 2"
      action: "VETO - No replicable methodology"
    - condition: "total_score < 10"
      action: "VETO - Insufficient documentation"

  decision_tree: |
    IF framework_documented == 0 → VETO (no methodology)
    ELSE IF total_score < 10 → VETO (insufficient docs)
    ELSE IF total_score >= 12 → APPROVE (excellent)
    ELSE → APPROVE (acceptable)
```

**Scoring Per Expert:**
```yaml
scoring:
  framework_documented: 0-3  # 0=no, 1=partial, 2=yes, 3=excellent
  process_extractable: 0-3
  artifacts_available: 0-3
  examples_exist: 0-3
  material_accessible: 0-3

  minimum_total: 10/15  # To pass
  ideal_total: 12+/15
```

**Output Iteration 3:**
```markdown
## Iteration 3: Framework Validation

### Detailed Assessment (Quality Dimensions + Tier Classification)

| Expert | Framework | Process | Artifacts | Examples | Access | TOTAL | Tier | Status |
|--------|-----------|---------|-----------|----------|--------|-------|------|--------|
| Expert A | 3 | 3 | 2 | 3 | 3 | 14/15 | Tier 1 | ✅ PASS |
| Expert B | 2 | 1 | 1 | 2 | 2 | 8/15 | - | ❌ FAIL |
| Expert C | 3 | 2 | 3 | 2 | 3 | 13/15 | Tier 0 | ✅ PASS |
| Expert D | 2 | 3 | 2 | 3 | 2 | 12/15 | Tier 2 | ✅ PASS |

### Tier Distribution (from tier-system-framework.md)
- Tier 0 (Diagnosis): Expert C
- Tier 1 (Masters): Expert A
- Tier 2 (Systematizers): Expert D
- Tier 3 (Specialists): {if any}

### Cut Due to Lack of Documentation (Heuristic SC_FV_001)
| Expert | Reason | Veto Condition |
|--------|--------|----------------|
| Expert B | No documented process | total_score < 10 |

### Refined List (6-8 names)
{only those who passed + their tier assignment}
```

---

### ITERATION 4: Cross-Reference (If needed)

**When to execute:** If still more than 6 names or doubts remain

**Objective:** Validate through multiple perspectives

**Verifications:**
```yaml
cross_checks:
  - "Appears in 'best of' lists from multiple sources?"
  - "Cited by other domain experts?"
  - "Has verifiable track record?"
  - "Results are verifiable?"
```

**Final Questions:**
```yaml
final_questions:
  - "Did we miss anyone obvious that any domain expert would mention?"
  - "Does the list cover different approaches/schools in the domain?"
  - "Is there sufficient diversity (geographic, approach)?"
```

---

### ITERATION 5: Final Elite (If needed)

**When to execute:** If still more than 5 names

**Objective:** Select the final team based on material availability

**Tiebreaker Criteria:**
```yaml
tiebreakers:
  1. "Who has the most documented material?"
  2. "Who has the most recent success cases?"
  3. "Who has the most complete framework?"
  4. "Who best complements others on the list?"
```

---

## Final Output

```markdown
# Mind Research Report: {Domain}

**Generated:** {date}
**Domain:** {domain}
**Context:** {context}
**Iterations executed:** {3-5}

---

## Executive Summary

{Paragraph summarizing research and conclusions}

---

## Final Elite: {N} Selected Minds

### Tier Distribution (from tier-system-framework.md)
| Tier | Minds | Role |
|------|-------|------|
| Tier 0 | {names} | Diagnosis/Audit - ALWAYS first |
| Tier 1 | {names} | Core Masters - Primary execution |
| Tier 2 | {names} | Systematizers - Frameworks |
| Tier 3 | {names} | Specialists - Format-specific |

---

### 1. {Expert Name}
- **Tier:** {0|1|2|3} (from tier-system-framework.md)
- **Known for:** {description}
- **Main Framework:** {framework name}
- **Why include:** {justification}
- **Quality Score:** {X}/10 (from quality-dimensions-framework.md)
- **Documentation Score:** {X}/15
- **Available Material:**
  - {book/course/article 1}
  - {book/course/article 2}

### 2. {Expert Name}
...

---

## Minds Considered but Not Selected

| Expert | Reason for Exclusion |
|--------|---------------------|
| {name} | {reason} |

---

## Next Steps

For each selected mind, execute:
1. `deep-research-pre-agent.md` - Deep research of the framework
2. `create-agent.md` - Create agent based on research

---

## Research Metadata

| Metric | Value |
|--------|-------|
| Initial names mapped | {N} |
| After devil's advocate | {N} |
| After framework validation | {N} |
| Final elite | {N} |
| Iterations executed | {N} |
| Queries executed | {N} |
```

---

## Execution Rules

### ALWAYS:
1. Execute MINIMUM 3 iterations
2. Question your own research in each iteration
3. Validate existence of DOCUMENTED FRAMEWORK
4. Justify each inclusion and exclusion
5. Seek diversity of approaches

### NEVER:
1. Accept names without validating frameworks
2. Trust only memory/prior knowledge
3. Skip the devil's advocate iteration
4. Keep a name just because they're famous
5. Stop before 3 iterations

### ABSOLUTE CUT CRITERION:
```
"Is there sufficient documentation of this person's processes
for an agent to replicate the method?"

- YES → Continues
- NO → Cut, no matter how famous they are
```

---

## Integration

**This workflow is executed by:**
- `squad-architect.md` when user requests squad in new domain

**This workflow feeds:**
- `deep-research-pre-agent.md` - With list of minds to research
- `create-agent.md` - With data for each mind

**Complete flow:**
```
mind-research-loop.md (this)
    ↓
[For each selected mind]
    ↓
deep-research-pre-agent.md
    ↓
create-agent.md
    ↓
Complete squad with cloned minds
```

---

## Usage Examples

### Example 1: Copywriting Squad

```yaml
input:
  domain: "copywriting"
  context: "for info-product sales"
  must_include_local: false
```

**Iteration 1:** 18 names mapped (Halbert, Ogilvy, Hopkins, etc.)
**Iteration 2:** 12 names after questioning (removed influencers without framework)
**Iteration 3:** 8 names with documented frameworks
**Final:** 6 elite minds (Halbert, Ogilvy, Schwartz, Kennedy, Bencivenga, Sugarman)

### Example 2: Brazilian Legal Squad

```yaml
input:
  domain: "corporate and tax law"
  context: "for Brazilian startups"
  must_include_local: true
  specific_needs: ["contracts", "tax", "corporate"]
```

**Iteration 1:** 15 names (global + Brazilian mix)
**Iteration 2:** 10 names (added lesser-known Brazilian specialists)
**Iteration 3:** 6 names with frameworks (cut theorists without methodology)
**Final:** 5 minds (3 Brazilian + 2 global with applicable frameworks)

---

**Workflow Status:** Ready for Implementation
**Version:** 2.0.0
**Created:** 2026-01-25
**Updated:** 2026-02-01
**Author:** Squad Architect

**v2.0.0 Changes:**
- Integrated `decision-heuristics-framework.md` in Iteration 2 (SC_DA_001)
- Integrated `quality-dimensions-framework.md` in Iteration 3 (mind assessment)
- Integrated `tier-system-framework.md` in Iteration 3 (tier classification)
- Integrated `decision-heuristics-framework.md` in Iteration 3 (SC_FV_001)
- Added tier distribution to final output
- Added quality score to each mind profile
