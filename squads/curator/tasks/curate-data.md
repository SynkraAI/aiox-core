---
task-id: curate-data
name: Curate External Data for Enrichment
agent: data-curator
version: 1.0.0
purpose: Find real news, trends, statistics, and quotes to enrich content

workflow-mode: interactive
elicit: true
elicitation-type: guided

inputs:
  - name: topics
    type: string_array
    description: "List of topics from banco_momentos or user request"
    required: true
  - name: source_preferences
    type: string_array
    description: "Preferred sources or industries"
    required: false
  - name: recency
    type: string
    description: "Max age of data"
    required: false
    default: "12 months"
  - name: min_items
    type: integer
    description: "Minimum items to curate"
    required: false
    default: 5

outputs:
  - path: "curadoria.yaml"
    format: yaml
    description: "Curated external data with sources and suggested placements"

dependencies:
  templates:
    - templates/curadoria-tmpl.yaml
  checklists:
    - checklists/curation-quality.md
    - checklists/security-validation.md
---

# Task: Curate Data

**Command:** `*curate {topics}`
**Execution Type:** Agent (requires judgment for relevance and source evaluation)

---

## Task Anatomy

```yaml
task_name: curate-data
status: active
responsible_executor: data-curator
execution_type: agent
input:
  required:
    - topics: "List of topics from banco_momentos or user request"
  optional:
    - source_preferences: "Preferred sources or industries"
    - recency: "Max age of data (default: 12 months)"
    - min_items: "Minimum items to curate (default: 5)"
output:
  file: "curadoria.yaml"
  template: "squads/curator/templates/curadoria-tmpl.yaml"
action_items:
  - "Extract key topics from input"
  - "Execute I Am the Algorithm scan (multiple sources)"
  - "Apply Haystack Method for non-obvious patterns"
  - "Verify every data point with source"
  - "Classify items by type and confidence"
  - "Map suggested placements to content moments"
  - "Generate curadoria.yaml using template"
  - "Run quality checklist"
acceptance_criteria:
  - "Every item has named source with URL and date"
  - "Every item has type (news, statistic, trend, quote, event)"
  - "Every item has confidence level (high, medium, low)"
  - "No invented or fabricated data points"
  - "Items grouped by topic in by_topic index"
  - "Suggested placements reference specific moments"
  - "At least 3 data types represented"
  - "curation-quality.md checklist passes (all mandatory + 80% quality)"
```

---

## Phases

### PHASE 1: Topic Extraction
**Duration:** 1-2 min
**Mode:** Analysis

```yaml
steps:
  - step: 1.1
    action: "Identify key topics from banco_momentos or user input"
    output: "Topic list with claims to support"

  - step: 1.2
    action: "Identify claims that need supporting data"
    note: "Statements about market size, growth, trends, comparisons"

  - step: 1.3
    action: "Prioritize topics by enrichment potential"
    criteria: "Topics with unsupported claims first"
```

**Checkpoint:**
- [ ] Topics extracted and prioritized
- [ ] Claims needing support identified

---

### PHASE 2: Source Scanning (I Am the Algorithm)
**Duration:** 5-10 min
**Mode:** Research

```yaml
steps:
  - step: 2.1
    action: "Scan multiple sources for each topic"
    framework: "Dave Pell - I Am the Algorithm"
    sources: "News sites, research reports, industry publications, official blogs"

  - step: 2.2
    action: "Filter for relevance and recency"
    criteria: "Must directly relate to topic, within recency window"

  - step: 2.3
    action: "Select most compelling items per topic"
    target: "2-3 items per topic minimum"
```

**Checkpoint:**
- [ ] Multiple sources scanned per topic
- [ ] Relevant items collected
- [ ] Recency verified

---

### PHASE 3: Pattern Detection (Haystack Method)
**Duration:** 2-3 min
**Mode:** Analytical

```yaml
steps:
  - step: 3.1
    action: "Look for non-obvious connections between gathered data"
    framework: "Rohit Bhargava - Haystack Method"

  - step: 3.2
    action: "Identify emerging trends not yet mainstream"
    question: "What's changing that most don't see?"

  - step: 3.3
    action: "Name any patterns found"
    output: "Named trend with supporting evidence"
```

**Checkpoint:**
- [ ] Cross-domain patterns checked
- [ ] Non-obvious insights identified (if available)

---

### PHASE 4: Verification & Assembly
**Duration:** 3-5 min
**Mode:** Validation

```yaml
steps:
  - step: 4.1
    action: "Verify every item's source exists and is accurate"
    verify: "URL accessible, data matches source, date correct"

  - step: 4.2
    action: "Assign confidence levels"
    levels:
      high: "Multiple reputable sources confirm"
      medium: "Single reputable source, not cross-verified"
      low: "Less established source or paywalled"

  - step: 4.3
    action: "Map items to content moments (suggested_placement)"
    format: "After moment #N or During {topic} discussion"

  - step: 4.4
    action: "Generate curadoria.yaml using template"
    template: "squads/curator/templates/curadoria-tmpl.yaml"
```

**Checkpoint:**
- [ ] All items verified
- [ ] Confidence levels assigned
- [ ] Placements mapped

---

## Quality Gate: QG-CUR

**BLOCKING.** Must pass before merging with narrative.

Run checklist: `squads/curator/checklists/curation-quality.md`

```yaml
mandatory_checks:
  - "Every item has named source with URL and date"
  - "No source older than 12 months (unless historical)"
  - "No invented data"
  - "Statistics cite original source"
  - "Every item has type and confidence"
  - "curadoria.yaml follows template"
  - "by_topic index generated"

quality_checks:
  - "At least 3 data types represented"
  - "Multiple sources used"
  - "At least 1 non-obvious insight"
  - "Placements are specific"
  - "No conflicts with source content"

pass_criteria:
  mandatory: "ALL must pass (100%)"
  quality: "At least 80% must pass"
```

---

## Output Format

```yaml
# curadoria.yaml structure

curated_data:
  metadata:
    curator: "data-curator"
    date: "YYYY-MM-DD"
    topics_covered: ["topic1", "topic2"]
    total_items: N

  items:
    - id: "CUR-001"
      type: "statistic | news | trend | quote | event"
      topic: "topic name"
      content: "The actual data point or quote"
      source:
        name: "Source Name"
        url: "https://..."
        date: "YYYY-MM-DD"
      confidence: "high | medium | low"
      suggested_placement: "After moment #N" or "During {topic}"
      notes: "Optional context"

  by_topic:
    topic_name:
      - CUR-001
      - CUR-002
```

---

## Anti-Patterns

```yaml
never_do:
  - "Invent statistics or data points"
  - "Use unverified or unsourced data"
  - "Include items without URL or reference"
  - "Use outdated data without flagging age"
  - "Add irrelevant data for volume"
  - "Mix opinion with fact"
  - "Cite secondary sources when primary available"

always_do:
  - "Cite every source with URL when possible"
  - "Note date of data"
  - "Assign confidence level"
  - "Suggest where data fits in content"
  - "Verify before including"
  - "Prefer reputable sources"
  - "Run curation-quality.md before delivery"
```

---

## Handoff

```yaml
on_complete:
  pass_to: "curator-chief"
  deliver: "curadoria.yaml"
  context: "Curation complete with {n} items across {types} types. Ready to merge with narrative."
  next_gate: "QG-CUR passed"

alternative_handoffs:
  - to: "tier_1 agents"
    when: "Ready to integrate with narrative being built"
  - to: "tier_2 agents"
    when: "Ready for overlay/enrichment in format phase"
```

---

## Veto Conditions (BLOCKING)

| ID | Condition | Detection | Action |
|----|-----------|-----------|--------|
| VETO-01 | No source data files found | `topics` input is empty/null AND no `banco_momentos` file is accessible to extract topics from | BLOCK — cannot curate without knowing what to search for; ask user to provide topics or run `*mine` first |
| VETO-02 | Data schema mismatch with expected format | Output `curadoria.yaml` cannot be validated against `templates/curadoria-tmpl.yaml` structure (missing `items[].source.url`, `items[].confidence`, or `items[].type` fields) | BLOCK — schema integrity required for downstream integration with narrative and format phases |

---

## Dependencies

| Type | File | When Used |
|------|------|-----------|
| Template | `templates/curadoria-tmpl.yaml` | Generating output |
| Checklist | `checklists/curation-quality.md` | QG-CUR validation |

---

## Usage

```bash
# Via curator-chief
@curator:curator-chief
*curate AI automation, productivity tools

# Direct agent activation
@curator:data-curator
*curate marketing digital 2026

# With specific focus
*curate {topics} --min-items 8 --recency 6months

# Verify specific claim
*verify "AI will replace 80% of jobs"

# Get trends
*trends marketing digital
```

---

## Frameworks Reference

### I Am the Algorithm (Dave Pell)
Human curation beats algorithmic feeds. Curator reads broadly across multiple sources, synthesizes, filters for quality and relevance.

**Application:**
- Scan 10+ sources per topic
- Look for what algorithms miss (context, nuance, credibility)
- Prioritize signal over noise

### Haystack Method (Rohit Bhargava)
Find the needle by understanding the haystack. Look for non-obvious patterns across domains.

**5 Steps:**
1. Gather diverse observations
2. Aggregate similar ideas
3. Elevate unique insights
4. Name the trend
5. Prove it

**Application:**
- Cross-reference data points from different industries
- Look for what's changing but not yet mainstream
- Name emerging patterns with evidence

---

_Task Version: 1.0.0_
_Agent: data-curator_
_Quality Gate: QG-CUR (blocking)_
_Frameworks: I Am the Algorithm (Pell) + Haystack Method (Bhargava)_
