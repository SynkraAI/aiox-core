# Deep Research Quality Checklist

**Purpose:** Validate research output BEFORE using it to create agents and tasks.
**Used by:** `workflows/research-then-create-agent.md` (Step 5)
**Quality Gate:** BLOCKING - research that fails cannot proceed to agent creation.

---

## Quick Validation (Automated)

### Minimum Thresholds

| Metric | Minimum | Target | Measurement |
|--------|---------|--------|-------------|
| Total lines | 500 | 800+ | `wc -l research.md` |
| Primary sources | 3 | 5+ | Count citations marked (PRIMARY) |
| Scope sections covered | 4/6 | 6/6 | Count ## headers matching scope |
| Actionable frameworks | 1 | 2+ | Count extracted process/checklist |
| Real examples analyzed | 2 | 5+ | Count case studies with analysis |

```yaml
automated_checks:
  - check: "total_lines >= 500"
    weight: 20%
    fail_action: "BLOCK - insufficient research depth"

  - check: "primary_sources >= 3"
    weight: 20%
    fail_action: "BLOCK - need more primary evidence"

  - check: "scope_coverage >= 4/6"
    weight: 15%
    fail_action: "WARN - gaps in coverage"

  - check: "has_actionable_framework == true"
    weight: 25%
    fail_action: "BLOCK - no extractable process"

  - check: "real_examples >= 2"
    weight: 20%
    fail_action: "WARN - need more examples"
```

---

## 1. DOCUMENT STRUCTURE

### 1.1 Required Sections

- [ ] **Executive Summary** present (2-3 paragraphs)
- [ ] **Scope sections** match original research prompt (4-6 sections)
- [ ] **Consolidated Framework** section present
- [ ] **Sources** section with citations
- [ ] **Research Metadata** section

### 1.2 Section Quality

- [ ] Each scope section has substantive content (50+ lines minimum)
- [ ] Sections follow logical progression
- [ ] No empty or placeholder sections
- [ ] Headers use consistent formatting (## for main, ### for sub)

---

## 2. PRIMARY EVIDENCE

### 2.1 Source Types

**Primary Sources (highest value):**
- [ ] Direct quotes from expert/specialist
- [ ] Excerpts from expert's books/articles
- [ ] Transcripts of expert's speeches/interviews
- [ ] Expert's documented processes/frameworks

**Secondary Sources (supporting):**
- [ ] Analysis by practitioners who studied the expert
- [ ] Case studies applying expert's methods
- [ ] Academic research on the methodology
- [ ] Industry commentary and validation

### 2.2 Citation Quality

- [ ] Each major claim has source attribution
- [ ] Primary sources clearly marked as `(PRIMARY)` or `(EVIDENCE)`
- [ ] Source format includes: Author, Work, Year/Chapter when available
- [ ] URLs provided for web sources
- [ ] No unsourced claims in framework sections

### 2.3 Evidence Distribution

```yaml
evidence_distribution:
  minimum:
    primary_sources: 3
    secondary_sources: 2
    case_studies: 2

  ideal:
    primary_sources: 5+
    secondary_sources: 3+
    case_studies: 5+

  red_flags:
    - "All sources from single origin"
    - "No direct quotes from expert"
    - "Only blog posts, no books/papers"
    - "Sources older than 20 years with no modern validation"
```

---

## 3. SCOPE COVERAGE

### 3.1 Per-Section Validation

For EACH scope section in the research prompt, verify:

- [ ] **Section exists** with matching header
- [ ] **Minimum depth:** 50+ lines of content
- [ ] **Sub-points addressed:** All sub-points from prompt covered
- [ ] **Evidence present:** At least 1 citation in section
- [ ] **Actionable content:** Contains how-to, not just theory

### 3.2 Coverage Scoring

| Coverage | Score | Status |
|----------|-------|--------|
| 6/6 sections | 100% | PASS |
| 5/6 sections | 83% | PASS |
| 4/6 sections | 67% | CONDITIONAL |
| 3/6 sections | 50% | FAIL |
| <3 sections | <50% | HARD FAIL |

### 3.3 Depth Indicators

**Adequate depth (per section):**
- [ ] Has introduction explaining section relevance
- [ ] Has 2+ specific techniques or principles
- [ ] Has at least 1 real example
- [ ] Has practical guidance (not just theory)

**Insufficient depth:**
- [ ] Only definitions without application
- [ ] Single paragraph treatment
- [ ] No examples or evidence
- [ ] Vague generalizations

---

## 4. ACTIONABLE CONTENT

### 4.1 Framework Extraction Readiness

The research MUST contain enough detail to extract:

**Principles (3+ required):**
- [ ] Explicit rules stated by expert
- [ ] Documented beliefs/philosophy
- [ ] What expert considers important
- [ ] Format: Clear, quotable statements

**Process (1 required):**
- [ ] Step-by-step workflow
- [ ] Sequence of actions
- [ ] How expert actually does the work
- [ ] Format: Numbered or ordered steps

**Structure (1 required):**
- [ ] Anatomy of the output (sections, components)
- [ ] Template or blueprint
- [ ] What the deliverable looks like
- [ ] Format: List of sections with purposes

**Quality Criteria (1 required):**
- [ ] What expert considers "good"
- [ ] What expert considers "bad"
- [ ] Evaluation criteria
- [ ] Format: Do/Don't or Excellent/Weak lists

**Checklist (derivable):**
- [ ] Enough criteria to create validation checklist
- [ ] Specific enough to be checkable
- [ ] Based on expert's standards, not generic

### 4.2 Actionability Scoring

```yaml
actionability_check:
  has_extractable_principles: true/false
  has_extractable_process: true/false
  has_extractable_structure: true/false
  has_extractable_criteria: true/false

  minimum_to_pass: 3/4
  ideal: 4/4

  fail_message: |
    Research lacks actionable content.
    Found: {found_items}
    Missing: {missing_items}
    Action: Re-research with focus on "how-to" and "process" queries
```

---

## 5. REAL EXAMPLES

### 5.1 Example Quality Criteria

Each example MUST have:

- [ ] **Identification:** What it is (name, type, date)
- [ ] **Context:** Why it's relevant
- [ ] **Analysis:** What makes it work (or not work)
- [ ] **Lessons:** What to learn from it

### 5.2 Example Types

**Strong examples:**
- [ ] Expert's own work analyzed
- [ ] Case studies with documented results
- [ ] Before/after comparisons
- [ ] Line-by-line or section-by-section breakdowns

**Weak examples:**
- [ ] Hypothetical scenarios
- [ ] "Imagine if..." constructions
- [ ] Generic illustrations without specifics
- [ ] Examples without analysis

### 5.3 Example Distribution

| Count | Status | Notes |
|-------|--------|-------|
| 5+ examples | Excellent | Strong foundation |
| 3-4 examples | Good | Adequate for framework |
| 2 examples | Minimum | Proceed with caution |
| 0-1 examples | Fail | Re-research needed |

---

## 6. CONSOLIDATED FRAMEWORK

### 6.1 Required Components

The "Consolidated Framework" section MUST include:

- [ ] **Principles list** (3-7 items, with citations)
- [ ] **Process steps** (numbered workflow)
- [ ] **Structure/Anatomy** (sections with purposes)
- [ ] **Quality Criteria** (excellent vs weak)
- [ ] **Checklist** (validation items)

### 6.2 Framework Quality

**Each principle:**
- [ ] Is a clear, actionable statement
- [ ] Has source citation
- [ ] Is specific to the domain/expert
- [ ] Is not generic advice

**Process steps:**
- [ ] Are in logical order
- [ ] Each step is clear and executable
- [ ] Steps cover complete workflow
- [ ] No vague "and then magic happens" steps

**Structure/Anatomy:**
- [ ] All sections identified
- [ ] Each section has clear purpose
- [ ] Includes expert's specific guidance per section
- [ ] Covers complete deliverable

**Quality Criteria:**
- [ ] "Excellent" examples are specific
- [ ] "Weak" examples are specific
- [ ] Criteria are observable/testable
- [ ] Based on expert's standards

---

## 7. SOURCE QUALITY

### 7.1 Source Credibility Tiers

**Tier 1 - Primary (Most Valuable):**
- Expert's own books
- Expert's documented frameworks
- Expert's interviews/speeches (transcribed)
- Expert's case studies

**Tier 2 - Validated Secondary:**
- Analysis by known practitioners
- Academic research citing expert
- Industry-recognized case studies
- Peer-reviewed analysis

**Tier 3 - General Secondary:**
- Blog posts about expert
- YouTube summaries
- Forum discussions
- Social media references

### 7.2 Source Mix Requirements

```yaml
source_requirements:
  minimum:
    tier_1: 2 sources
    tier_2: 1 source
    tier_3: unlimited (supporting only)

  ideal:
    tier_1: 4+ sources
    tier_2: 2+ sources
    tier_3: as needed

  red_flags:
    - "Zero Tier 1 sources"
    - "Only Tier 3 sources"
    - "Single source dominance (>80% from one)"
```

### 7.3 Source Documentation

Each source entry should have:
- [ ] Author/Creator name
- [ ] Work title
- [ ] Year (if available)
- [ ] Specific chapter/section (if book)
- [ ] URL (if web source)
- [ ] Tier classification

---

## 8. ANTI-PATTERNS (Red Flags)

### 8.1 Content Red Flags

- [ ] **Generic advice** not specific to expert
- [ ] **Invented frameworks** attributed to expert
- [ ] **Unsourced claims** about expert's methods
- [ ] **Contradictory statements** within research
- [ ] **Filler content** (obvious padding)
- [ ] **Circular references** (citing summaries of summaries)

### 8.2 Structure Red Flags

- [ ] **Missing sections** from original scope
- [ ] **Stub sections** (<20 lines)
- [ ] **Copy-paste blocks** without analysis
- [ ] **No framework extraction possible**
- [ ] **Examples without analysis**

### 8.3 Source Red Flags

- [ ] **No primary sources**
- [ ] **Single-source research**
- [ ] **Only AI-generated summaries**
- [ ] **Broken/invalid URLs**
- [ ] **Sources don't support claims**

---

## 9. VALIDATION WORKFLOW

### 9.1 Automated Pass (Fast Path)

```python
def quick_validate(research_doc):
    checks = {
        'lines': count_lines(research_doc) >= 500,
        'primary_sources': count_primary_sources(research_doc) >= 3,
        'scope_coverage': count_scope_sections(research_doc) >= 4,
        'has_framework': has_consolidated_framework(research_doc),
        'has_examples': count_examples(research_doc) >= 2
    }

    if all(checks.values()):
        return "PASS", 100
    elif checks['lines'] and checks['has_framework']:
        return "CONDITIONAL", calculate_score(checks)
    else:
        return "FAIL", calculate_score(checks)
```

### 9.2 Manual Review Triggers

Run detailed checklist review if:
- [ ] Score between 60-80% (borderline)
- [ ] Specialist is new/unfamiliar
- [ ] Domain is high-stakes
- [ ] Research will feed multiple agents

### 9.3 Decision Matrix

| Score | Status | Action |
|-------|--------|--------|
| 95-100% | PASS | Proceed to framework extraction |
| 80-94% | PASS | Proceed with minor notes |
| 60-79% | CONDITIONAL | Review gaps, proceed with caution |
| 40-59% | FAIL | Retry research with adjusted queries |
| <40% | HARD FAIL | Fundamental issues, restart |

---

## 10. RETRY PROTOCOL

### 10.1 On CONDITIONAL (60-79%)

```yaml
retry_conditional:
  max_retries: 1
  focus: "Fill specific gaps identified"
  queries:
    - "More examples of {weak_section}"
    - "{expert} {topic} case studies"
    - "{expert} {topic} step-by-step process"
  action: "Append to existing research, re-validate"
```

### 10.2 On FAIL (40-59%)

```yaml
retry_fail:
  max_retries: 2
  focus: "Broaden research scope"
  queries:
    - Different query formulations
    - Alternative source types
    - Related experts in same domain
  action: "Replace weak sections, re-validate"
```

### 10.3 On HARD FAIL (<40%)

```yaml
hard_fail:
  action: "STOP workflow"
  message: |
    Research quality insufficient for agent creation.
    Issues: {critical_issues}
    Recommendation: Manual research or different specialist
  options:
    - "Accept partial research with heavy warnings"
    - "Switch to generic (non-specialist) agent"
    - "Abort agent creation"
```

---

## VALIDATION REPORT TEMPLATE

```markdown
# Research Validation Report

**Document:** {research_file_path}
**Validated:** {timestamp}
**Validator:** {automated|manual}

## Quick Metrics

| Metric | Value | Threshold | Status |
|--------|-------|-----------|--------|
| Total Lines | {n} | 500 | {PASS/FAIL} |
| Primary Sources | {n} | 3 | {PASS/FAIL} |
| Scope Coverage | {n}/6 | 4/6 | {PASS/FAIL} |
| Has Framework | {yes/no} | yes | {PASS/FAIL} |
| Examples | {n} | 2 | {PASS/FAIL} |

## Overall Score: {score}%
## Status: {PASS|CONDITIONAL|FAIL|HARD_FAIL}

## Section-by-Section

| Section | Lines | Sources | Examples | Status |
|---------|-------|---------|----------|--------|
| {section_1} | {n} | {n} | {n} | {OK/WARN/FAIL} |
| ... | ... | ... | ... | ... |

## Framework Extraction Readiness

- [ ] Principles extractable: {yes/no}
- [ ] Process extractable: {yes/no}
- [ ] Structure extractable: {yes/no}
- [ ] Criteria extractable: {yes/no}

## Red Flags Detected

{list of red flags or "None"}

## Recommendation

{PROCEED | PROCEED_WITH_CAUTION | RETRY | ABORT}

## Notes

{additional observations}
```

---

**Checklist Version:** 1.0.0
**Created:** 2026-01-22
**Part of:** squads/squad-architect
**Used by:** workflows/research-then-create-agent.md
