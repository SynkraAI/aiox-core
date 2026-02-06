# Deep Research Pre-Agent Task

## Purpose

Generate a comprehensive deep research prompt and execute research to establish the knowledge foundation BEFORE creating an agent. This ensures agents are built on REAL methodologies from domain experts, not generic LLM knowledge.

## Why This Task Exists

**Problem:** Agents created without research are weak and generic.
- CopywriterOS tasks were created by LLM without researching actual copywriter methodologies
- Result: 200-line generic tasks instead of 900-line research-backed tasks
- Fix: Research FIRST, then create agent based on real frameworks

**Gold Standard Reference:**
- Research: `docs/research/david-ogilvy-research-engineering-meta-framework.md` (1,179 lines)
- Task: `squads/{your-squad}/tasks/copysearch.md` (921 lines) - Example from Copy squad

## Inputs

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `agent_purpose` | string | Yes | What the agent should do |
| `domain` | string | Yes | Area of expertise |
| `specialist_slug` | string | No | If based on human expert |
| `specialist_name` | string | No | Human-readable name |
| `activity` | string | Yes | Specific activity (e.g., "sales-page") |

## Key Activities & Instructions

### Phase 1: Check Local Knowledge (If Specialist)

**Condition:** Only if `specialist_slug` is provided

**1.1 Search MMOS Resources:**
```yaml
search_paths:
  - outputs/minds/{specialist_slug}/sources/
  - outputs/minds/{specialist_slug}/analysis/
  - outputs/minds/{specialist_slug}/synthesis/
  - docs/research/{specialist_slug}-*.md
```

**1.2 Catalog Found Resources:**
```yaml
for each file found:
  - Record: path, type, line count
  - Assess: relevance to agent_purpose
  - Extract: key topics already covered

output:
  local_catalog:
    files_found: []
    total_lines: N
    topics_covered: []
    gaps_identified: []
```

**1.3 Determine Research Mode:**
```python
if total_lines > 1000:
    research_mode = "complementary"  # Focus on gaps
    research_note = f"Already have {total_lines} lines. Focus on: {gaps}"
else:
    research_mode = "comprehensive"  # Full research needed
    research_note = "Limited local knowledge. Comprehensive research needed."
```

---

### Phase 2: Generate Research Prompt

**Use the 7-component meta-framework:**

#### Component 1: REFINED TOPIC
```yaml
instruction: |
  Transform the agent purpose into a strategic research title.
  - Expand scope beyond the obvious
  - Include time period if specialist-based
  - Make it specific yet comprehensive

template: |
  "The {Methodology} of {Specialist}: {Expanded Description} ({Time Period})"

example: |
  "The Sales Page Engineering of Gary Halbert: Complete Anatomy of Direct Mail
  Letters that Generated Millions — From Envelope to PS (1970-2007)"
```

#### Component 2: CONTEXT
```yaml
instruction: |
  Brief paragraph establishing:
  - What we're building (agent purpose)
  - Why this research matters
  - What we already have (if any)
  - Practical objectives

template: |
  Building an AI agent to {agent_purpose} following {specialist_name}'s REAL
  methodology. {local_knowledge_note}. Need to extract operational frameworks,
  not just theory.
```

#### Component 3: SCOPE (4-6 items)
```yaml
instruction: |
  Develop specific angles to investigate:
  - Process/methodology angles
  - Structure/anatomy of outputs
  - Quality criteria from expert
  - Real examples/case studies
  - Modern adaptation considerations
  - Common mistakes/anti-patterns

format: |
  1. {ANGLE_NAME}
     - Sub-point with specific questions
     - Sub-point with specific questions
     - Sub-point with specific questions

  2. {ANGLE_NAME}
     ...
```

#### Component 4: REQUIREMENTS (3-4 items)
```yaml
instruction: |
  Parameters for the research:
  - Source priority (primary vs secondary)
  - Analysis depth needed
  - Format preferences
  - What to include/exclude

examples:
  - "Prioritize expert's own words (quotes, rules, principles)"
  - "Include line-by-line analysis of real examples"
  - "Differentiate personal style vs universal principles"
  - "Extract operational templates, not just concepts"
```

#### Component 5: RECOMMENDED SOURCES (3-4 types)
```yaml
instruction: |
  Specific source types to prioritize:
  - Books by the expert
  - Interviews/podcasts
  - Archive materials
  - Case studies/analyses

format: |
  - "{Book/Source Title}" (specific chapters if known)
  - {Expert} interviews/podcasts
  - Archive of {expert}'s work
  - Analysis by students/practitioners
```

#### Component 6: EXPECTED RESULTS (3-5 deliverables)
```yaml
instruction: |
  Concrete, actionable outputs:
  - Templates with clear structure
  - Checklists derived from expert criteria
  - Process workflows step-by-step
  - Example databases with analysis

format: |
  1. "{Deliverable Name}" - {What it contains}
  2. "{Deliverable Name}" - {What it contains}
  ...
```

#### Component 7: CLARIFYING QUESTIONS (2-3)
```yaml
instruction: |
  Questions to refine the research focus.
  Note: In YOLO mode, these are auto-answered or skipped.

examples:
  - "Should focus be on {A} or {B}?"
  - "Priority: depth on one topic or breadth across many?"
  - "Include modern adaptations or stay pure to original?"
```

---

### Phase 3: Execute Research

**3.1 Process Local Knowledge:**
```yaml
if local_files exist:
  for each file:
    - Read complete file
    - Extract sections relevant to agent_purpose
    - Note key quotes and frameworks
    - Mark what's covered vs gaps

  output: local_synthesis.md
```

**3.2 Execute Web Research:**
```yaml
research_queries:
  - "{specialist_name} {activity} methodology framework"
  - "{specialist_name} {activity} process steps how-to"
  - "{specialist_name} {activity} examples case studies"
  - "{specialist_name} best practices rules principles"
  - "{activity} {domain} expert techniques"

for each query:
  - WebSearch(query)
  - For top 5-8 results:
      - WebFetch(url)
      - Extract relevant content
      - Note source URL for citation

  output: web_findings.md
```

**3.3 Consolidate Research:**
```yaml
consolidation:
  - Merge: local_synthesis + web_findings
  - Remove duplicates
  - Organize by scope sections
  - Add citations throughout
  - Format as comprehensive document

output: docs/research/{specialist_slug}-{activity}-research.md
```

---

### Phase 4: Validate Research

**Validation Criteria:**
```yaml
minimum_requirements:
  total_lines: 500
  primary_sources: 3
  scope_coverage: 4/6 sections
  actionable_content: true  # Has processes, not just theory

quality_score:
  primary_evidence: 30%  # Quotes, real examples
  scope_coverage: 25%
  actionable_processes: 25%
  source_credibility: 20%

thresholds:
  pass: ">= 80%"
  conditional: "60-79%"
  fail: "< 60%"
```

**On Fail:**
```yaml
if quality_score < 60:
  retry_count += 1
  if retry_count <= 2:
    - Adjust queries (broader or more specific)
    - Re-execute Phase 3
  else:
    - Return partial research with warning
    - Flag for manual enrichment
```

---

## Output Format

### Research Document Structure

```markdown
# Deep Research: {Specialist} {Activity} Methodology

**Generated:** {date}
**Agent Purpose:** {agent_purpose}
**Domain:** {domain}
**Specialist:** {specialist_name}

---

## Executive Summary

{2-3 paragraph overview of findings}

---

## 1. {SCOPE_SECTION_1}

### Key Findings

{Content organized by sub-points}

### Primary Evidence

> "{Quote from expert}" — Source, Year

### Extracted Framework

{Structured framework from this section}

---

## 2. {SCOPE_SECTION_2}

...

---

## Consolidated Framework

### Principles

1. {Principle with citation}
2. {Principle with citation}
...

### Process

1. {Step}
2. {Step}
...

### Structure/Anatomy

| Section | Purpose | Expert Rule |
|---------|---------|-------------|
| ... | ... | ... |

### Quality Criteria

**Excellent:**
- {Criterion}

**Weak:**
- {Anti-pattern}

### Checklist

- [ ] {Check derived from expert}
- [ ] {Check derived from expert}
...

---

## Sources

1. {Source with URL if available}
2. {Source with URL if available}
...

---

## Research Metadata

- Total lines: {N}
- Local sources: {N}%
- Web sources: {N}%
- Primary evidence count: {N}
- Quality score: {N}%
```

---

## Validation Criteria

- [ ] Research prompt covers all 7 components
- [ ] Local knowledge checked first (if specialist)
- [ ] Research document >= 500 lines
- [ ] At least 3 primary source citations
- [ ] At least 4/6 scope sections covered
- [ ] Contains actionable frameworks (not just theory)
- [ ] All claims have source attribution
- [ ] Quality score >= 60%

---

## Examples

### Example 1: Gary Halbert Sales Page Research

**Input:**
```yaml
agent_purpose: "Create high-converting sales pages"
domain: "copywriting"
specialist_slug: "gary_halbert"
specialist_name: "Gary Halbert"
activity: "sales-page"
```

**Generated Prompt:**
```
REFINED TOPIC:
"The Sales Page Engineering of Gary Halbert: Complete Anatomy of Direct Mail
Letters that Generated Millions — From Envelope to PS (1970-2007)"

CONTEXT:
Building an AI agent to create high-converting sales pages following Gary
Halbert's REAL methodology. Already have 3,520 lines of source material
including Boron Letters. Need to extract operational frameworks for digital
sales pages.

SCOPE:
1. HALBERT LETTER ANATOMY
   - Envelope strategy (teaser, appearance, A-pile criteria)
   - Opening: the critical first 3 lines
   - Lead: paragraphs that retain reader
   - Body: central argument structure
   - Proof stacking: where and how to insert credibility
   - Offer presentation: making it irresistible
   - Guarantee: risk reversal structure
   - CTA: closing with urgency
   - PS: strategic post-scriptum usage

2. A-PILE vs B-PILE METHODOLOGY
   - What makes a letter go to A-Pile
   - Appearance: handwritten, typed, printed
   - Personalization techniques
   - How to look like personal correspondence

3. CLASSIC LETTERS ANALYZED
   - Coat of Arms letter: line by line
   - Nancy Halbert letter: emotional structure
   - Common patterns across winners

4. DIGITAL TRANSLATION (2025)
   - Envelope → Subject/Ad equivalent
   - Letter → Landing page equivalent
   - Mobile considerations
   - Visual elements vs pure text

5. PROCESS & WORKFLOW
   - Halbert's research process before writing
   - Draft and revision methodology
   - Testing and iteration approach

REQUIREMENTS:
- Prioritize Halbert's own words (quotes, rules, principles)
- Include line-by-line analysis of at least 3 letters
- Differentiate personal style vs universal principles
- Extract operational templates and checklists

RECOMMENDED SOURCES:
- "The Boron Letters" (especially chapters on salesmanship)
- Gary Halbert Letter (newsletter archive)
- "How to Make Maximum Money in Minimum Time"
- Bond Halbert commentary and analysis

EXPECTED RESULTS:
1. "Halbert Sales Letter Template" - Complete structure with 8+ sections
2. "Opening Lines Database" - 20+ analyzed openings from Halbert
3. "Proof Insertion Framework" - Where to place each proof type
4. "A-Pile Checklist" - Criteria to pass first filter
5. "PS Strategy Guide" - Strategic post-scriptum templates
```

**Output:**
- `docs/research/gary-halbert-sales-page-research.md` (2,100+ lines)
- Quality Score: 92%

---

### Example 2: Generic Domain Research (No Specialist)

**Input:**
```yaml
agent_purpose: "Conduct effective user interviews"
domain: "product-management"
specialist_slug: null
specialist_name: null
activity: "user-interviews"
```

**Generated Prompt:**
```
REFINED TOPIC:
"The Art and Science of User Interviews for Product Discovery: Frameworks,
Techniques, and Anti-Patterns from Leading Practitioners (2015-2025)"

CONTEXT:
Building an AI agent to guide product managers through effective user
interviews. No single specialist - drawing from multiple established
frameworks (Jobs-to-be-Done, Mom Test, Continuous Discovery).

SCOPE:
1. INTERVIEW FRAMEWORKS COMPARISON
   - Jobs-to-be-Done interview structure
   - Mom Test principles and application
   - Continuous Discovery Habits approach
   - When to use which framework

2. QUESTION DESIGN
   - Opening questions that build rapport
   - Deepening questions that reveal truth
   - Questions to avoid (leading, hypothetical)
   - Handling sensitive topics

3. INTERVIEW EXECUTION
   - Setting and environment
   - Recording and note-taking
   - Reading body language and adjusting
   - Handling difficult participants

4. SYNTHESIS & ANALYSIS
   - Pattern recognition across interviews
   - Separating signal from noise
   - Documenting insights effectively
   - Sharing with stakeholders

5. COMMON MISTAKES
   - Confirmation bias in questions
   - Leading the witness
   - Asking about future behavior
   - Not listening to non-verbal cues

REQUIREMENTS:
- Include techniques from multiple frameworks
- Provide example questions for each type
- Include anti-patterns with examples
- Focus on actionable guidance

RECOMMENDED SOURCES:
- "The Mom Test" by Rob Fitzpatrick
- "Continuous Discovery Habits" by Teresa Torres
- "Competing Against Luck" (JTBD) by Christensen
- Practitioner blogs and case studies

EXPECTED RESULTS:
1. "User Interview Framework Selection Guide"
2. "Question Bank by Interview Phase" (50+ questions)
3. "Interview Execution Checklist"
4. "Anti-Patterns to Avoid" (with examples)
5. "Synthesis Template"
```

---

## Integration Notes

This task is called by:
- `workflows/research-then-create-agent.md` (Steps 2-5)

This task calls:
- WebSearch tool (for external research)
- WebFetch tool (for content extraction)
- Read tool (for local knowledge)
- Write tool (for research document)

---

## Error Handling

| Scenario | Action |
|----------|--------|
| No local knowledge found | Continue with web-only research |
| WebSearch returns few results | Try alternative query formulations |
| Research < 500 lines after 2 retries | Accept partial, flag for enrichment |
| Specialist not in MMOS | Treat as comprehensive research |

---

**Task Version:** 1.0.0
**Created:** 2026-01-22
**Part of:** squads/squad-architect
