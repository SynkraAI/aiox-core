---
task-id: viability-assessment
name: APEX + ICP Viability Assessment
agent: mind-mapper
version: 1.0.0
purpose: Evaluate mind mapping candidate viability through APEX scoring and ICP matching to prevent wasted resources

workflow-mode: interactive
elicit: true
elicitation-type: custom

prerequisites:
  - Mind candidate name identified
  - Basic understanding of target use case
  - Access to web search for initial source discovery

inputs:
  - name: mind_name
    type: string
    description: Subject to evaluate (e.g., "Naval Ravikant", "Seth Godin")
    required: true

  - name: mode
    type: enum
    description: Assessment mode
    required: true
    options: ["apex", "icp", "full", "prd_generation"]
    default: "full"
    user_friendly: "Quick APEX only / ICP match only / Full assessment / Generate PRD after GO"

  - name: initial_context
    type: text
    description: Why this mind is being considered
    required: true

  - name: target_icp
    type: string
    description: Specific use case or audience
    required: false
    example: "startup founders", "enterprise sales teams"

  - name: constraints
    type: object
    description: Time, budget, or quality requirements
    required: false
    fields:
      - max_time_hours
      - max_tokens
      - min_quality_score

outputs:
  - path: "squads/mmos-squad/minds/{mind_name}/viability/viability-output.yaml"
    description: Complete APEX + ICP scoring with GO/NO-GO recommendation
    format: "yaml"

  - path: "squads/mmos-squad/minds/{mind_name}/viability/prd.md"
    description: Product requirements document (if mode=prd_generation and GO decision)
    format: "markdown"
    conditional: "Only generated if GO decision and mode includes prd_generation"

dependencies:
  templates:
    - viability-output.yaml
    - prd-template.md
  checklists:
    - viability-checklist.md

validation:
  success-criteria:
    - "APEX score calculated across all 6 dimensions"
    - "ICP match score >= 70% for GO decision"
    - "Clear GO/NO-GO recommendation with justification"
    - "Token savings projection provided"

  warning-conditions:
    - "ICP score 60-69% (borderline)"
    - "Missing sources in 2+ APEX dimensions"

  failure-conditions:
    - "APEX score < 50/100"
    - "ICP match < 60%"
    - "Insufficient public information available"

estimated-duration: "15-30 minutes for full assessment"
token-savings: "40% by auto-rejecting poor candidates before expensive research phase"

mcp_integration:
  exa:
    usage: "Source discovery and availability assessment"
    required: true
    tool: mcp__docker-gateway__web_search_exa
---

# Viability Assessment Task

## MCP Integration: EXA Web Search

**Use EXA MCP for systematic source discovery:**

### Execute Discovery Sweep

Run the following EXA searches to assess source availability:

```
mcp__docker-gateway__web_search_exa
Query: "{mind_name} book author published"
numResults: 5
```

```
mcp__docker-gateway__web_search_exa
Query: "{mind_name} interview podcast"
numResults: 5
```

```
mcp__docker-gateway__web_search_exa
Query: "{mind_name} article blog essay"
numResults: 5
```

```
mcp__docker-gateway__web_search_exa
Query: "{mind_name} youtube video talk"
numResults: 5
```

### Assess Results

| Source Type | Count | Quality | Score |
|-------------|-------|---------|-------|
| Books | {count} | {high/medium/low} | {0-25} |
| Interviews | {count} | {high/medium/low} | {0-25} |
| Articles | {count} | {high/medium/low} | {0-25} |
| Videos | {count} | {high/medium/low} | {0-25} |

**APEX Score Calculation:** Sum of all source type scores (0-100)

---

## Purpose

Evaluate whether a mind mapping candidate is worth the investment of time, tokens, and effort through systematic APEX scoring (6 dimensions) and ICP (Ideal Clone Profile) matching. This task prevents wasted resources on low-viability candidates and provides early GO/NO-GO decision points with ROI projections.

**Token Savings:** Proper viability assessment saves 40% of tokens by auto-rejecting poor candidates before expensive research and analysis phases.

## When to Use This Task

**Use this task when:**
- Starting a new mind mapping project (greenfield)
- Evaluating multiple candidates to prioritize
- Need quick assessment before full pipeline commitment
- Stakeholders want ROI justification before proceeding
- Preview mode from execute-mmos-pipeline

**Do NOT use this task when:**
- Viability is already confirmed (brownfield updates)
- Working with pre-approved subjects
- This is exploratory research without production intent

## Key Activities & Instructions

### Mode: APEX Scoring

#### Step 1: Dimension 1 - Availability (Max: 20 points)

**Evaluate source availability across categories:**

```yaml
availability_scoring:
  books_published:
    score_range: 0-5
    criteria:
      5_points: "5+ books as primary author"
      4_points: "3-4 books"
      3_points: "1-2 books"
      2_points: "Book chapters or contributions"
      1_point: "Mentioned in books"
      0_points: "No books"

  long_form_content:
    score_range: 0-5
    criteria:
      5_points: "Regular podcast/blog with 100+ episodes/articles"
      4_points: "Regular content, 50-99 items"
      3_points: "Occasional content, 20-49 items"
      2_points: "Limited content, 5-19 items"
      1_point: "Sporadic content, <5 items"
      0_points: "No long-form content"

  interviews_appearances:
    score_range: 0-5
    criteria:
      5_points: "50+ high-quality interviews"
      4_points: "20-49 interviews"
      3_points: "10-19 interviews"
      2_points: "5-9 interviews"
      1_point: "1-4 interviews"
      0_points: "No interviews"

  social_media_activity:
    score_range: 0-3
    criteria:
      3_points: "Highly active, substantive posts (Twitter threads, LinkedIn articles)"
      2_points: "Moderately active with meaningful content"
      1_point: "Present but limited substance"
      0_points: "Inactive or non-existent"

  video_content:
    score_range: 0-2
    criteria:
      2_points: "YouTube channel or regular video appearances"
      1_point: "Occasional video content"
      0_points: "No video content"
```

**Research Process:**
1. Google search: "{mind_name} books"
2. Google search: "{mind_name} podcast"
3. Google search: "{mind_name} interviews"
4. Check Twitter/X: @{handle} (if known)
5. Check YouTube: "{mind_name} channel"
6. Check LinkedIn: "{mind_name}"

**Score each category and calculate total.**

**Output format:**
```yaml
availability_score:
  books_published: {{score}}/5
  long_form_content: {{score}}/5
  interviews_appearances: {{score}}/5
  social_media_activity: {{score}}/3
  video_content: {{score}}/2
  total: {{score}}/20

  evidence:
    books: [{{list_found}}]
    podcasts: [{{list_found}}]
    interviews: [{{list_found}}]
    social: "{{assessment}}"
    video: "{{assessment}}"

  notes: "{{any_relevant_observations}}"
```

#### Step 2: Dimension 2 - Public Persona (Max: 15 points)

**Evaluate public presence and accessibility:**

```yaml
public_persona_scoring:
  recognition_level:
    score_range: 0-5
    criteria:
      5_points: "Globally recognized thought leader"
      4_points: "Industry-famous, conference keynote level"
      3_points: "Well-known in specific niche"
      2_points: "Recognized by practitioners"
      1_point: "Emerging voice"
      0_points: "Unknown outside small circle"

  media_coverage:
    score_range: 0-5
    criteria:
      5_points: "Major media features (NYT, WSJ, Forbes, etc.)"
      4_points: "Industry media coverage"
      3_points: "Niche publications"
      2_points: "Blog mentions"
      1_point: "Minimal coverage"
      0_points: "No media presence"

  teaching_presence:
    score_range: 0-5
    criteria:
      5_points: "Courses, workshops, coaching programs"
      4_points: "Regular conference talks"
      3_points: "Occasional talks or webinars"
      2_points: "Educational content online"
      1_point: "Limited teaching"
      0_points: "No teaching presence"
```

**Research Process:**
1. Google News search: "{mind_name}"
2. Check Wikipedia presence
3. Search for courses/programs: "{mind_name} course"
4. Check speaking engagements: "{mind_name} conference speaker"

**Output format:**
```yaml
public_persona_score:
  recognition_level: {{score}}/5
  media_coverage: {{score}}/5
  teaching_presence: {{score}}/5
  total: {{score}}/15

  evidence:
    media: [{{notable_mentions}}]
    wikipedia: {{yes/no}}
    courses: [{{if_any}}]
    speaking: "{{assessment}}"

  assessment: "{{overall_persona_strength}}"
```

#### Step 3: Dimension 3 - Expertise Depth (Max: 20 points)

**Evaluate domain expertise and track record:**

```yaml
expertise_depth_scoring:
  demonstrated_results:
    score_range: 0-7
    criteria:
      7_points: "Extraordinary results (built unicorn, bestseller, industry transformation)"
      6_points: "Exceptional results (exits, major impact, recognized achievements)"
      5_points: "Strong results (successful business, published work, measurable impact)"
      4_points: "Solid results (profitable business, published, respected)"
      3_points: "Moderate results (viable business, published articles)"
      2_points: "Early results (building something, some traction)"
      1_point: "Limited results"
      0_points: "No verifiable results"

  domain_tenure:
    score_range: 0-5
    criteria:
      5_points: "20+ years in domain"
      4_points: "15-19 years"
      3_points: "10-14 years"
      2_points: "5-9 years"
      1_point: "2-4 years"
      0_points: "<2 years"

  methodology_development:
    score_range: 0-5
    criteria:
      5_points: "Created frameworks/methodologies used by others (e.g., 'Jobs to Be Done')"
      4_points: "Unique approaches documented and taught"
      3_points: "Clear methodology, not widely adopted yet"
      2_points: "Some unique practices"
      1_point: "Mostly applies others' methods"
      0_points: "No unique methodology"

  peer_recognition:
    score_range: 0-3
    criteria:
      3_points: "Cited/referenced by other experts frequently"
      2_points: "Some peer recognition"
      1_point: "Minimal peer mention"
      0_points: "Not recognized by peers"
```

**Research Process:**
1. Verify major achievements/results
2. Check domain experience timeline
3. Search for: "{mind_name} framework" or "{mind_name} methodology"
4. Check citations: "as {mind_name} says" or "{mind_name} argues"

**Output format:**
```yaml
expertise_depth_score:
  demonstrated_results: {{score}}/7
  domain_tenure: {{score}}/5
  methodology_development: {{score}}/5
  peer_recognition: {{score}}/3
  total: {{score}}/20

  evidence:
    results: "{{major_achievements}}"
    tenure: "{{years}} years in {{domain}}"
    frameworks: [{{if_any}}]
    citations: "{{assessment}}"

  assessment: "{{credibility_level}}"
```

#### Step 4: Dimension 4 - X-Factor (Max: 15 points)

**Evaluate unique qualities that make cloning valuable:**

```yaml
x_factor_scoring:
  contrarian_thinking:
    score_range: 0-5
    criteria:
      5_points: "Consistently challenges orthodoxy with backed arguments"
      4_points: "Often takes contrarian positions"
      3_points: "Occasionally contrarian"
      2_points: "Mostly conventional with some unique views"
      1_point: "Largely conventional"
      0_points: "No distinctive viewpoint"

  storytelling_communication:
    score_range: 0-5
    criteria:
      5_points: "Master storyteller, memorable communication style"
      4_points: "Excellent communicator with distinctive voice"
      3_points: "Good communicator, some memorable moments"
      2_points: "Clear but unremarkable communication"
      1_point: "Basic communication"
      0_points: "Poor communicator"

  pattern_synthesis:
    score_range: 0-5
    criteria:
      5_points: "Connects insights across multiple domains brilliantly"
      4_points: "Cross-domain thinking evident"
      3_points: "Some interdisciplinary connections"
      2_points: "Mostly single-domain thinking"
      1_point: "Narrow focus"
      0_points: "No synthesis ability"
```

**Research Process:**
1. Read/watch 3-5 samples of their content
2. Note: Do they challenge conventional wisdom?
3. Assess: Is their communication style memorable?
4. Check: Do they reference multiple domains?

**Output format:**
```yaml
x_factor_score:
  contrarian_thinking: {{score}}/5
  storytelling_communication: {{score}}/5
  pattern_synthesis: {{score}}/5
  total: {{score}}/15

  evidence:
    contrarian_examples: [{{examples}}]
    communication_style: "{{description}}"
    synthesis_examples: [{{cross_domain_connections}}]

  unique_qualities: "{{what_makes_them_special}}"
```

#### Step 5: Dimension 5 - Temporal Relevance (Max: 15 points)

**Evaluate current and future relevance:**

```yaml
temporal_relevance_scoring:
  current_activity:
    score_range: 0-5
    criteria:
      5_points: "Highly active, producing new content regularly"
      4_points: "Active, consistent output"
      3_points: "Moderately active"
      2_points: "Occasional activity"
      1_point: "Mostly inactive"
      0_points: "Retired or deceased (historical only)"

  trend_alignment:
    score_range: 0-5
    criteria:
      5_points: "Expertise addresses major current/emerging trends"
      4_points: "Relevant to current market needs"
      3_points: "Some current relevance"
      2_points: "Partially dated but adaptable"
      1_point: "Mostly dated content"
      0_points: "Completely obsolete"

  future_applicability:
    score_range: 0-5
    criteria:
      5_points: "Timeless principles + current application"
      4_points: "Likely relevant 5+ years"
      3_points: "Relevant 2-5 years"
      2_points: "Relevant 1-2 years"
      1_point: "Short-term relevance only"
      0_points: "Already obsolete"
```

**Research Process:**
1. Check last content published date
2. Assess if expertise area is growing/stable/declining
3. Evaluate if principles are timeless or time-bound

**Output format:**
```yaml
temporal_relevance_score:
  current_activity: {{score}}/5
  trend_alignment: {{score}}/5
  future_applicability: {{score}}/5
  total: {{score}}/15

  evidence:
    last_activity: "{{date}}"
    trend_assessment: "{{domain_growth_trajectory}}"
    longevity: "{{timeless_vs_dated}}"

  relevance_window: "{{time_horizon}}"
```

#### Step 6: Dimension 6 - Value Density (Max: 15 points)

**Evaluate actionability and practical value:**

```yaml
value_density_scoring:
  actionable_frameworks:
    score_range: 0-6
    criteria:
      6_points: "Multiple proven frameworks ready to deploy"
      5_points: "Several frameworks documented"
      4_points: "A few clear frameworks"
      3_points: "Some structured approaches"
      2_points: "Principles but few frameworks"
      1_point: "Mostly theoretical"
      0_points: "No actionable frameworks"

  tactical_specificity:
    score_range: 0-5
    criteria:
      5_points: "Specific, step-by-step guidance on implementation"
      4_points: "Clear tactical advice"
      3_points: "Mix of strategy and tactics"
      2_points: "Mostly strategic/theoretical"
      1_point: "Vague or abstract"
      0_points: "No tactical content"

  case_studies_examples:
    score_range: 0-4
    criteria:
      4_points: "Rich case studies with details"
      3_points: "Multiple examples"
      2_points: "Some examples"
      1_point: "Few examples"
      0_points: "No concrete examples"
```

**Research Process:**
1. Review content for frameworks/models
2. Assess specificity level (step-by-step vs abstract)
3. Count case studies/examples provided

**Output format:**
```yaml
value_density_score:
  actionable_frameworks: {{score}}/6
  tactical_specificity: {{score}}/5
  case_studies_examples: {{score}}/4
  total: {{score}}/15

  evidence:
    frameworks: [{{list}}]
    specificity_level: "{{tactical/strategic/mixed}}"
    examples_count: {{number}}

  practical_value: "{{assessment}}"
```

#### Step 7: Calculate Total APEX Score

```yaml
apex_total_score:
  availability: {{score}}/20
  public_persona: {{score}}/15
  expertise_depth: {{score}}/20
  x_factor: {{score}}/15
  temporal_relevance: {{score}}/15
  value_density: {{score}}/15

  total: {{score}}/100
  percentage: {{score}}%

automated_decision:
  threshold_auto_reject: < 50
  threshold_human_review: 50-74
  threshold_auto_approve: >= 75

  decision: {{REJECT / REVIEW / APPROVE}}
  rationale: "{{explanation}}"
```

**Save output:**
- File: `minds/{mind}/docs/logs/{timestamp}-viability.yaml`

### Mode: ICP (Ideal Clone Profile) Matching

#### Step 1: Identify Primary Use Cases

Based on mind's expertise, identify potential use cases:

```yaml
potential_use_cases:
  - use_case: "{{title}}"
    target_audience: "{{who}}"
    primary_value: "{{what_problem_solved}}"
    match_strength: {{High/Medium/Low}}

  # Generate 3-5 potential use cases
```

**Example use cases:**
- "Startup founder mentor" → entrepreneurs building 0-1
- "Sales coaching" → B2B sales professionals
- "Content creation guide" → marketers and creators
- "Technical educator" → developers learning new skills

#### Step 2: ICP Scoring Matrix

**If user provided target ICP:**

Evaluate fit across dimensions:

```yaml
icp_match_scoring:
  domain_alignment:
    weight: 30%
    score: 0-10
    assessment: "{{how_well_expertise_matches_need}}"
    score: {{0-10}}

  audience_fit:
    weight: 25%
    score: 0-10
    assessment: "{{does_communication_style_match_audience}}"
    score: {{0-10}}

  use_case_specificity:
    weight: 20%
    score: 0-10
    assessment: "{{how_specific_content_is_to_use_case}}"
    score: {{0-10}}

  accessibility:
    weight: 15%
    score: 0-10
    assessment: "{{is_content_appropriate_level_for_audience}}"
    score: {{0-10}}

  roi_potential:
    weight: 10%
    score: 0-10
    assessment: "{{value_vs_investment_projection}}"
    score: {{0-10}}

total_icp_match:
  weighted_score: {{calculated}}/10
  percentage: {{percentage}}%

  interpretation:
    90-100: "Perfect match - high ROI expected"
    70-89: "Good match - solid ROI"
    50-69: "Moderate match - marginal ROI"
    0-49: "Poor match - low ROI"
```

#### Step 3: ROI Projection

Estimate investment vs value:

```yaml
roi_projection:
  investment_estimate:
    time: "{{hours}} hours"
    tokens: "{{millions}} M tokens"
    cost_estimate: "${{amount}} (at $X per 1M tokens)"

  expected_value:
    use_case_value: "{{description}}"
    audience_size: "{{potential_users}}"
    value_per_use: "{{estimation}}"

  roi_assessment: "{{High/Medium/Low/Negative}}"

  recommendation: "{{PROCEED / RECONSIDER / STOP}}"
```

**Save output:**
- File: `minds/{mind}/docs/logs/{timestamp}-icp_match.yaml`

### Mode: PRD Generation (Post-GO Decision)

**Only execute if GO decision has been made.**

#### Step 1: Generate Product Requirements Document

**Use viability assessment outputs to create comprehensive PRD.**

**PRD Template Structure:**

```markdown
# Product Requirements Document (PRD)
## Clone IA - {{Mind Name}}

**Version:** 1.0
**Date:** {{date}}
**Author:** {{your_name}}
**Status:** Planning

---

## 1. VISION

### 1.1 Objective
{{Clear statement of what this clone will achieve}}

### 1.2 Value Proposition
- **For {{audience_1}}:** {{value}}
- **For {{audience_2}}:** {{value}}
- **For {{audience_3}}:** {{value}}

### 1.3 Success Metrics
- Fidelity score: >{{target}}%
- {{metric_2}}: {{target}}
- {{metric_3}}: {{target}}

---

## 2. VIABILITY ASSESSMENT SUMMARY

### APEX Score: {{total}}/100

**Dimension Breakdown:**
- Availability: {{score}}/20 - {{strength}}
- Public Persona: {{score}}/15 - {{strength}}
- Expertise Depth: {{score}}/20 - {{strength}}
- X-Factor: {{score}}/15 - {{strength}}
- Temporal Relevance: {{score}}/15 - {{strength}}
- Value Density: {{score}}/15 - {{strength}}

### ICP Match: {{percentage}}%
- Primary Use Case: {{use_case}}
- Target Audience: {{audience}}
- ROI Assessment: {{projection}}

---

## 3. FUNCTIONAL REQUIREMENTS

### FR1: Core Expertise Replication
**Description:** Clone must capture {{mind}}'s primary expertise domain

**Capabilities:**
- {{capability_1}}
- {{capability_2}}
- {{capability_3}}

### FR2: Communication Style Matching
**Description:** Clone must replicate distinctive communication patterns

**Style Elements:**
- {{element_1}}
- {{element_2}}
- {{element_3}}

### FR3: Framework Application
**Description:** Implement key frameworks and methodologies

**Frameworks:**
- {{framework_1}}
- {{framework_2}}
- {{framework_3}}

[... continue with additional FRs ...]

---

## 4. NON-FUNCTIONAL REQUIREMENTS

### NFR1: Fidelity
- Target: >94% clone accuracy
- Measurement: Blind testing protocol

### NFR2: Performance
- Response time: <2s
- Consistency: >95%

### NFR3: Authenticity
- Clear AI disclosure
- Source attribution
- Limitation transparency

---

## 5. SOURCE STRATEGY

### Tier 1 Sources (High Confidence):
- {{source_type}}: {{examples}}

### Tier 2 Sources (Medium Confidence):
- {{source_type}}: {{examples}}

### Tier 3 Sources (Validation Needed):
- {{source_type}}: {{examples}}

### Minimum Source Requirements:
- Total sources: ≥15
- High-confidence sources: ≥5
- Source type diversity: ≥3

---

## 6. COGNITIVE ARCHITECTURE PLAN

### 8-Layer DNA Mental™ Coverage:

**Layer 1 - Behavioral Patterns:**
- Observable actions, decisions, routines

**Layer 2 - Communication Style:**
- Linguistic patterns, writing style, voice

**Layer 3 - Routine & Habits:**
- Temporal patterns, daily practices

**Layer 4 - Recognition Patterns:**
- What they notice, mental radars

**Layer 5 - Mental Models:**
- How they think, reasoning frameworks

**Layer 6 - Values Hierarchy:**
- Core values, what matters most

**Layer 7 - Core Obsessions:**
- What drives them, central questions

**Layer 8 - Productive Paradoxes:**
- Contradictions that create depth

---

## 7. IMPLEMENTATION PLAN

### Phase 1: Viability ✅
- [x] APEX scoring complete
- [x] ICP matching complete
- [x] GO decision received

### Phase 2: Research ({{duration}})
- [ ] Source discovery
- [ ] Parallel collection
- [ ] Sources master compilation

### Phase 3: Analysis ({{duration}})
- [ ] Layers 1-4 extraction
- [ ] Layer 5 (Mental Models)
- [ ] Layer 6 (Values) + Human checkpoint
- [ ] Layer 7 (Obsessions) + Human checkpoint
- [ ] Layer 8 (Paradoxes) + Human checkpoint
- [ ] Cognitive architecture synthesis

### Phase 4: Synthesis ({{duration}})
- [ ] Framework extraction
- [ ] KB chunking
- [ ] Specialist recommendations

### Phase 5: Implementation ({{duration}})
- [ ] Identity core compilation
- [ ] Meta axioms extraction
- [ ] Generalista prompt v1.0
- [ ] Human checkpoint
- [ ] Specialist variants (if approved)

### Phase 6: Validation ({{duration}})
- [ ] Test protocol generation
- [ ] Validation testing
- [ ] Fidelity report
- [ ] Production approval

---

## 8. RISKS & MITIGATIONS

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| {{risk_1}} | {{prob}} | {{impact}} | {{mitigation}} |
| {{risk_2}} | {{prob}} | {{impact}} | {{mitigation}} |

---

## 9. RESOURCE ESTIMATES

### Time Investment:
- Total hours: {{estimate}} hours
- Wall time: {{days}} days (with parallelization)

### Token Investment:
- Estimated tokens: {{millions}}M tokens
- Estimated cost: ${{amount}}

### Human Checkpoints:
- Viability GO/NO-GO
- Layer 6, 7, 8 validations
- System prompt review
- Production approval

---

## 10. SUCCESS CRITERIA

**MVP (Milestone 1):**
- [ ] Basic conversational ability in domain
- [ ] Core frameworks implemented
- [ ] Fidelity >80%

**Beta (Milestone 2):**
- [ ] All 8 layers integrated
- [ ] Complete framework library
- [ ] Fidelity >90%

**Production (Milestone 3):**
- [ ] Full cognitive architecture
- [ ] Specialist variants (if any)
- [ ] Fidelity >94%

---

**Approved By:** {{name}}
**Approval Date:** {{date}}
```

**Save output:**
- File: `minds/{mind}/docs/PRD.md`

#### Step 2: Generate TODO Backlog

**Initialize implementation backlog:**

```markdown
# TODO - {{Mind Name}} Clone

**Status:** Planning Phase
**Last Updated:** {{date}}

## Phase 2: Research [ ]

- [ ] Execute source discovery
- [ ] Set up parallel collection workflow
- [ ] Collect Tier 1 sources ({{count}} items)
- [ ] Collect Tier 2 sources ({{count}} items)
- [ ] Collect Tier 3 sources ({{count}} items)
- [ ] Generate sources_master.yaml
- [ ] Validate minimum source requirements

## Phase 3: Analysis [ ]

### Layers 1-4 (Observable)
- [ ] Extract behavioral patterns
- [ ] Analyze communication style
- [ ] Map routines and habits
- [ ] Identify recognition patterns

### Layers 5-8 (Deep Cognitive)
- [ ] Extract mental models (Layer 5)
- [ ] Map values hierarchy (Layer 6)
- [ ] **HUMAN CHECKPOINT: Validate Layer 6**
- [ ] Identify core obsessions (Layer 7)
- [ ] **HUMAN CHECKPOINT: Validate Layer 7**
- [ ] Extract productive paradoxes (Layer 8)
- [ ] **HUMAN CHECKPOINT: Validate Layer 8**
- [ ] Synthesize cognitive architecture

## Phase 4: Synthesis [ ]

- [ ] Extract communication templates
- [ ] Mine signature phrases
- [ ] Synthesize frameworks
- [ ] Chunk knowledge base
- [ ] Generate specialist recommendations

## Phase 5: Implementation [ ]

- [ ] Compile identity core
- [ ] Extract meta axioms
- [ ] Generate generalista prompt v1.0
- [ ] **HUMAN CHECKPOINT: Review system prompt**
- [ ] Create specialist variants (if approved)
- [ ] Generate operational manual

## Phase 6: Validation [ ]

- [ ] Generate test protocol
- [ ] Execute personality validation
- [ ] Execute knowledge validation
- [ ] Execute style validation
- [ ] Execute edge case testing
- [ ] Generate validation report
- [ ] **HUMAN CHECKPOINT: Production approval**

## Finalization [ ]

- [ ] Update master catalog
- [ ] Generate pipeline summary
- [ ] Archive documentation

---

**Notes:**
- HUMAN CHECKPOINTS are mandatory, cannot skip
- Minimum source requirements: 15 total, 5 high-confidence
- Target fidelity: 94%
- Estimated completion: {{timeline}}
```

**Save output:**
- File: `minds/{mind}/docs/TODO.md`

#### Step 3: Generate Dependencies Map

```yaml
# Dependencies Mapper Output
dependencies:
  mmos_framework:
    version: "3.0"
    methodology: "DNA Mental™ 8-Layer"

  llm_target:
    primary: "{{Claude/GPT-4/etc}}"
    context_window: "{{tokens}}"
    capabilities: [{{list}}]

  source_dependencies:
    critical_sources: [{{must_have_sources}}]
    nice_to_have: [{{optional_sources}}]

  technical_dependencies:
    tools: [{{required_tools}}]
    apis: [{{if_any}}]
    storage: "{{requirements}}"

  human_dependencies:
    subject_matter_expert: {{yes/no}}
    domain_reviewer: {{yes/no}}
    testing_participants: {{count}}

  timeline_dependencies:
    blocking_phases: [{{which_phases_must_complete_first}}]
    parallel_opportunities: [{{which_can_run_simultaneously}}]

integration_points:
  memory_layer: {{enabled/disabled}}
  rag_system: {{enabled/disabled}}
  fine_tuning: {{enabled/disabled}}
```

**Save output:**
- File: `minds/{mind}/metadata/dependencies.yaml`

### Mode: Full (APEX + ICP + Recommendation)

**Execute all of the above in sequence:**

1. Run APEX scoring (all 6 dimensions)
2. Run ICP matching
3. Generate combined recommendation
4. Present to user for GO/NO-GO decision
5. If GO: Offer to generate PRD/TODO/Dependencies

**Final recommendation format:**

```markdown
# VIABILITY ASSESSMENT FINAL REPORT
## {{Mind Name}}

**Assessment Date:** {{timestamp}}
**Analyst:** {{name}}

---

## EXECUTIVE SUMMARY

**RECOMMENDATION: {{GO / NO-GO / CONDITIONAL GO}}**

**Overall Viability: {{percentage}}%**
- APEX Score: {{score}}/100 ({{rating}})
- ICP Match: {{score}}% ({{rating}})

**Key Finding:**
{{1-2 sentence summary of viability}}

---

## APEX ASSESSMENT

[Include full APEX scoring results]

**Strengths:**
- {{strength_1}}
- {{strength_2}}

**Weaknesses:**
- {{weakness_1}}
- {{weakness_2}}

---

## ICP ANALYSIS

[Include full ICP matching results]

**Best Use Cases:**
1. {{use_case_1}} - {{match}}% match
2. {{use_case_2}} - {{match}}% match

**ROI Projection:**
- Investment: {{hours}} hours, {{tokens}}M tokens, ${{cost}}
- Expected Value: {{assessment}}
- ROI Rating: {{High/Medium/Low}}

---

## DECISION FACTORS

### Proceed if:
✅ {{condition_1}}
✅ {{condition_2}}

### Caution if:
⚠️ {{concern_1}}
⚠️ {{concern_2}}

### Stop if:
❌ {{dealbreaker_1}}
❌ {{dealbreaker_2}}

---

## NEXT STEPS

**If GO:**
1. Generate PRD, TODO, Dependencies
2. Begin Phase 2: Research Collection
3. Set up quality checkpoints

**If NO-GO:**
1. Document reasons
2. Archive assessment
3. Consider alternative candidates

**If CONDITIONAL:**
1. Address concerns: {{list}}
2. Re-assess after adjustments

---

**Ready to proceed? (yes/no/discuss)**
```

## Outputs

### APEX Mode Output
- `minds/{mind}/docs/logs/{timestamp}-viability.yaml`

### ICP Mode Output
- `minds/{mind}/docs/logs/{timestamp}-icp_match.yaml`

### Full Mode Outputs
- `minds/{mind}/docs/logs/{timestamp}-viability.yaml`
- `minds/{mind}/docs/logs/{timestamp}-icp_match.yaml`
- `minds/{mind}/docs/logs/{timestamp}-viability_recommendation.md`

### PRD Generation Mode Outputs
- `minds/{mind}/docs/PRD.md`
- `minds/{mind}/docs/TODO.md`
- `minds/{mind}/metadata/dependencies.yaml`

## Validation Criteria

Viability assessment is successful when:

- [ ] **APEX scoring complete**: All 6 dimensions scored with evidence
- [ ] **ICP analysis complete**: Use cases identified, match scored, ROI projected
- [ ] **Decision logic applied**: Auto-reject (<50), human review (50-74), or auto-approve (>=75)
- [ ] **Evidence documented**: All scores backed by specific sources/examples
- [ ] **User decision obtained**: GO/NO-GO/CONDITIONAL decision received
- [ ] **If GO: PRD generated**: Complete PRD with viability results integrated
- [ ] **If GO: TODO initialized**: Backlog created with all phases and checkpoints
- [ ] **If GO: Dependencies mapped**: All dependencies documented
- [ ] **Outputs saved**: All files written to correct locations

## Integration with AIOS

### Memory Layer
Store viability assessments for comparative analysis:

```typescript
memory.store({
  collection: 'mmos_viability',
  document: {
    mind_name: '{{mind}}',
    apex_score: {{score}},
    icp_match: {{percentage}},
    decision: '{{GO/NO-GO}}',
    assessed_at: '{{timestamp}}'
  }
});
```

### Agent Coordination
- **@analyst**: Executes APEX research and scoring
- **@mind-pm**: Generates PRD and TODO
- **@architect**: Maps dependencies

### Performance Notes
- APEX scoring: ~20-30 minutes
- ICP analysis: ~10-15 minutes
- PRD generation: ~15-20 minutes
- Total full assessment: ~45-60 minutes
- Token cost: ~50K tokens

## Notes

- **40% token savings**: Rejecting low-viability candidates early saves 2-2.5M tokens per rejected mind
- **APEX <50 auto-reject**: Don't waste resources on fundamentally unviable candidates
- **Layer 6-8 previews**: Use APEX to preview if deep layers will be extractable
- **ICP matching critical**: High APEX but poor ICP match = low ROI
- **ROI transparency**: Always provide honest cost/value assessment to users
- **Document rejections**: Even NO-GO decisions should be documented for learning

---

**Task Version:** 3.0
**Last Updated:** 2025-10-06
