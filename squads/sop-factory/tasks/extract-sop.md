# Task: Extract SOP from Process

## Task Anatomy

| Field | Value |
|-------|-------|
| **Task ID** | `extract-sop` |
| **Version** | `1.0.0` |
| **Status** | `active` |
| **Responsible Executor** | `sop-extractor` |
| **Execution Type** | `Agent` |

## Metadata
```yaml
id: extract-sop
name: "Extract SOP from Process"
category: extraction
agent: sop-extractor
elicit: true
autonomous: false
description: "Extract a structured SOP from unstructured process descriptions, documents, or interviews. Applies Toyota Production System gemba principles: go to the source, observe the actual work, capture tribal knowledge. Assigns confidence scores to each step and flags gaps for validation."
```

## Purpose

Transform unstructured process knowledge (descriptions, documents, interviews, observations) into a structured SOP. Most organizational knowledge lives in people's heads as "tribal knowledge" -- undocumented, inconsistent, and vulnerable to loss. This task captures that knowledge using Taiichi Ohno's gemba approach: understand the process as it actually happens (not as it is imagined), decompose it into atomic steps, assign confidence levels, and structure it for formal documentation.

The output is a **draft SOP** with confidence annotations. High-confidence steps come from direct observation or explicit documentation. Low-confidence steps are inferred and flagged for validation via "teach-back" testing.

## Prerequisites

- [ ] Process description or source material available
- [ ] Process owner or subject matter expert accessible (recommended)
- [ ] Extraction method determined (description, document, interview, observation)

## Inputs

```yaml
inputs:
  process_description:
    type: string
    required: true
    description: "Description of the process to extract. Can be informal, unstructured, conversational. The more detail, the higher confidence output."

  extraction_method:
    type: enum
    required: false
    default: description
    options: [description, document, interview, observation]
    description: >
      How the process information was captured:
      - description: Free-text description from user (default)
      - document: Existing document (email, wiki, manual)
      - interview: Structured Q&A with process performer
      - observation: Direct observation notes (gemba walk)

  source_material:
    type: filepath
    required: false
    description: "Path to supporting document (existing wiki page, email, manual, notes)"

  confidence_threshold:
    type: number
    required: false
    default: 0.7
    description: "Minimum confidence score (0.0-1.0) for a step to be included without a review flag. Steps below this threshold are flagged for validation."
```

## Confidence Scoring Model

```yaml
confidence_levels:
  observed:
    score: 1.0
    label: "Directly Observed"
    description: "Step was directly observed being performed (gemba)"
    marker: "[OBS]"

  documented:
    score: 0.9
    label: "Documented"
    description: "Step is explicitly stated in existing documentation"
    marker: "[DOC]"

  reported:
    score: 0.8
    label: "Reported by Performer"
    description: "Step was described by someone who performs it"
    marker: "[REP]"

  corroborated:
    score: 0.7
    label: "Corroborated"
    description: "Step reported by multiple sources or implied by multiple data points"
    marker: "[COR]"

  inferred:
    score: 0.5
    label: "Inferred"
    description: "Step is logically necessary but not explicitly stated"
    marker: "[INF]"

  assumed:
    score: 0.3
    label: "Assumed"
    description: "Step is assumed based on industry norms or common sense"
    marker: "[ASM]"

  unknown:
    score: 0.1
    label: "Unknown"
    description: "Step existence suspected but details unknown"
    marker: "[UNK]"
```

## Workflow / Steps

### 1. Capture Input

```
ELICIT from user:
  1. Describe the process from start to finish (as if teaching a new hire)
  2. Who performs this process? (all roles involved)
  3. What triggers the process? (what causes it to start)
  4. What tools or systems are used?
  5. What is the final output or result?
  6. What are the most common mistakes or problems?
  7. How long does the process typically take?
  8. Are there any steps that vary depending on conditions?
  9. Is there existing documentation? (even partial or outdated)
  10. Who is the most experienced person at this process?

IF source_material provided:
  ACTION: Read and parse the source document
  EXTRACT: Any procedural content, step references, role mentions

STORE: raw_input = {
  description, roles, trigger, tools,
  output, common_errors, duration,
  conditional_steps, existing_docs,
  expert_contact
}
```

### 2. Identify Actors

```
ACTION: Extract all roles/actors involved in the process

FOR EACH mentioned person, title, role, or department:
  - Name/Title of actor
  - What they do in the process
  - When they are involved (which steps)
  - What authority they have (approve, execute, verify)

OUTPUT: actors = [
  {
    role: "<role name>",
    actions: ["<what they do>"],
    steps_involved: [<step numbers>],
    authority: "<execute|approve|verify|inform>"
  }
]

CONFIDENCE: Assign based on how the actor was identified
  - Named in description: 0.9
  - Implied by action: 0.5
  - Assumed from industry norm: 0.3
```

### 3. Extract Steps

```
ACTION: Decompose the process into atomic steps

EXTRACTION RULES:
  a) One action per step (if "do X and Y" -> step X, step Y)
  b) Each step starts with an action verb
  c) Preserve the performer's language (don't over-formalize yet)
  d) Capture time estimates if mentioned
  e) Note any materials or tools required per step
  f) Identify if step is always performed or conditional

FOR EACH extracted step:
  step = {
    number: <sequential>,
    action: "<action verb + object>",
    actor: "<who does it>",
    tools: ["<tools used>"],
    duration: "<estimated time>",
    condition: "<when this step applies, or 'always'>",
    expected_result: "<what should happen>",
    confidence: <0.0-1.0>,
    confidence_marker: "<[OBS]|[DOC]|[REP]|[INF]|[ASM]>",
    source: "<where this step was identified>",
    notes: "<any ambiguity or uncertainty>"
  }

OUTPUT: steps[] ordered chronologically
```

### 4. Identify Decision Points

```
ACTION: Find where the process branches based on conditions

SIGNALS:
  - "if/then" language in description
  - "depending on" phrases
  - "sometimes" or "usually" qualifiers
  - Multiple actors doing similar but different work
  - Exception handling references

FOR EACH decision point:
  decision = {
    step_number: <where the decision occurs>,
    condition: "<what determines the branch>",
    branches: [
      { condition: "<if X>", next_step: <N>, description: "<what happens>" },
      { condition: "<if Y>", next_step: <M>, description: "<what happens>" }
    ],
    default: "<what happens if none match>",
    confidence: <0.0-1.0>,
    notes: "<any ambiguity about the decision logic>"
  }

RULE: If a decision point has no default/else branch, flag it as a gap
```

### 5. Map Dependencies

```
ACTION: Determine the order and dependencies between steps

FOR EACH step, identify:
  - Prerequisites: what must be done before this step
  - Successors: what comes after this step
  - Parallel paths: steps that can happen simultaneously
  - Wait states: steps that require external input or approval
  - Loops: steps that repeat until a condition is met

OUTPUT: dependency_map = {
  sequential: [<step pairs in order>],
  parallel: [<groups of parallel steps>],
  wait_states: [<steps with external dependencies>],
  loops: [<step ranges that repeat>],
  critical_path: [<steps on the longest path>]
}
```

### 6. Assign Confidence Scores

```
ACTION: Review and assign final confidence scores

FOR EACH step:
  1. Base score from extraction method:
     - observation notes: 1.0
     - existing document: 0.9
     - direct report: 0.8
     - corroborated: 0.7
     - inferred: 0.5
     - assumed: 0.3

  2. Adjust for corroboration:
     - Multiple sources agree: +0.1 (max 1.0)
     - Contradictory information: -0.2

  3. Assign confidence marker: [OBS], [DOC], [REP], [COR], [INF], [ASM], [UNK]

FLAG steps below confidence_threshold for mandatory review
```

### 7. Structure as Draft SOP

```
ACTION: Apply human SOP template to extracted content

FOLLOW create-sop-human template structure but:
  - Mark document as "DRAFT - EXTRACTED"
  - Include confidence markers on every step
  - Include a "Confidence Summary" section
  - Include a "Gaps & Review Items" section
  - Include a "Sources" section citing extraction sources

CONFIDENCE SUMMARY:
  | Confidence Level | Step Count | Percentage |
  |-----------------|------------|------------|
  | Observed (1.0) | X | X% |
  | Documented (0.9) | X | X% |
  | Reported (0.8) | X | X% |
  | Inferred (0.5) | X | X% |
  | Assumed (0.3) | X | X% |
  | **Below Threshold** | **X** | **X%** |
```

### 8. Flag Gaps

```
ACTION: Compile all identified gaps and uncertainties

GAP TYPES:
  - MISSING_STEP: Logic suggests a step should exist but was not described
  - MISSING_ACTOR: A step has no identified performer
  - MISSING_TOOL: A step likely requires a tool but none was mentioned
  - AMBIGUOUS_ORDER: Step sequence is unclear
  - AMBIGUOUS_CONDITION: Decision logic is unclear
  - CONTRADICTORY: Conflicting information received
  - LOW_CONFIDENCE: Step below confidence threshold
  - NO_ERROR_HANDLING: Happy path only, no exception handling

FOR EACH gap:
  - gap_id, type, location, description
  - Suggested resolution (question to ask SME, observation to make)
  - Impact on SOP usability if unresolved
```

### 9. Validate with "Teach-Back"

```
ACTION: Recommend teach-back validation protocol

TEACH-BACK METHOD:
  1. Give the draft SOP to someone who has NEVER performed the process
  2. Ask them to read it and explain the process back to you
  3. Note where they:
     - Get confused (clarity gap)
     - Ask questions (completeness gap)
     - Make wrong assumptions (ambiguity gap)
     - Skip steps (visibility gap)
  4. Revise the SOP based on findings

OUTPUT: Include teach-back instructions in the draft SOP

NOTE: This step is a RECOMMENDATION to the user, not something
the agent performs autonomously (requires human participants)
```

## Output

```yaml
outputs:
  primary:
    path: "outputs/sop-factory/extraction/{process-name}-draft-sop-v{version}.md"
    format: markdown
    description: "Draft SOP with confidence annotations, gaps, and teach-back instructions"

  secondary:
    - path: "outputs/sop-factory/extraction/{process-name}-gaps.md"
      format: markdown
      description: "Detailed gap report with suggested resolutions"

    - path: "outputs/sop-factory/extraction/{process-name}-confidence-map.md"
      format: markdown
      description: "Step-by-step confidence breakdown with sources"

  metadata:
    total_steps: "<number>"
    decision_points: "<number>"
    actors_identified: "<number>"
    avg_confidence: "<0.0-1.0>"
    steps_below_threshold: "<number>"
    gaps_identified: "<number>"
    extraction_method: "<method>"
```

## Acceptance Criteria

- [ ] Every extracted step has a confidence score and marker
- [ ] All decision points are identified with all known branches
- [ ] Gaps are flagged with specific resolution suggestions
- [ ] Draft SOP follows the human SOP template structure
- [ ] Confidence summary table is included
- [ ] Steps below confidence threshold are visually flagged
- [ ] Dependency map shows step ordering
- [ ] "Teach-back" validation is recommended with instructions
- [ ] All sources of information are cited
- [ ] Document is clearly marked as DRAFT

## Veto Conditions

- STOP if process description yields fewer than 3 identifiable actions
- STOP if no steps achieve confidence >= 0.5 (insufficient information to extract)
- STOP if the process described is purely conceptual with no actionable steps
- STOP if contradictory information cannot be resolved and covers > 50% of steps
- STOP if the process is safety-critical and average confidence is below 0.7 (too risky to document without direct observation)
