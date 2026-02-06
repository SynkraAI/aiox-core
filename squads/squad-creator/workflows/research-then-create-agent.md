# Workflow: Research Then Create Agent

**Workflow ID:** research-then-create-agent
**Version:** 2.0
**Purpose:** Create high-quality agents based on deep research about domain best practices, not generic LLM knowledge
**Orchestrator:** @squad-architect
**Mode:** YOLO (100% autonomous, no human intervention)
**Quality Standard:** AIOS Level (800+ lines, full semantic depth)

**Frameworks Used:**
- `data/tier-system-framework.md` → Agent tier classification (Step 1, 7)
- `data/quality-dimensions-framework.md` → Research & output validation (Step 5, 8)
- `data/decision-heuristics-framework.md` → Checkpoint logic (Step 5, 8)
- `data/executor-matrix-framework.md` → Task executor assignment (Step 9)

---

## Overview

This workflow ensures agents are built on REAL frameworks and methodologies from domain experts, not generic LLM-generated content. The key insight: **agents created without research are weak and generic**.

**v2.0 Changes:**
- Added Quality Gate step (Step 8) with blocking validation
- Uses agent-tmpl-v2.md template
- Requires all 6 levels: Identity, Operational, Voice DNA, Quality, Credibility, Integration
- Minimum 800 lines per agent

```
INPUT (agent purpose + domain + [specialist])
    ↓
[STEP 1: Parse & Classify]
    → Generic agent OR specialist-based agent?
    ↓
[STEP 2: Check Local Knowledge] ← IF specialist
    → Search: outputs/minds/{slug}/sources/
    → Search: outputs/minds/{slug}/analysis/
    → Search: docs/research/{slug}-*.md
    → Catalog existing resources
    ↓
[STEP 3: Generate Research Prompt]
    → If has local material: "Already have X, need Y"
    → If no local: full research prompt
    ↓
[STEP 4: Execute Deep Research]
    → Combine: Local + WebSearch/API
    ↓
[STEP 5: Consolidate & Validate Research]
    ├─ < 500 lines? → Retry with different queries
    ├─ No primary sources? → Flag for enrichment
    └─ PASS? → Continue
    ↓
[STEP 6: Extract Framework from Research]
    → Principles, processes, checklists
    → Voice DNA (sentence starters, metaphors, vocabulary)
    → Output examples from real sources
    → Anti-patterns from expert warnings
    ↓
[STEP 7: Create Agent Definition]
    → Uses agent-tmpl.md template
    → MUST include ALL 6 LEVELS:
        Level 1: Identity (agent, persona, metadata)
        Level 2: Operational (frameworks, commands)
        Level 3: Voice DNA (starters, metaphors, vocabulary, states)
        Level 4: Quality (examples, anti-patterns, completion)
        Level 5: Credibility (if applicable)
        Level 6: Integration (handoffs, synergies)
    ↓
[STEP 8: QUALITY GATE] ← NEW IN v2.0
    → Run agent-quality-gate.md checklist
    → BLOCKING requirements must pass:
        ├─ 800+ lines
        ├─ vocabulary.always_use (5+) AND never_use (3+)
        ├─ output_examples (3+)
        ├─ anti_patterns.never_do (5+)
        ├─ completion_criteria defined
        └─ handoff_to defined
    → FAIL? → Loop back to Step 7 with specific fixes
    → PASS? → Continue
    ↓
[STEP 9: Create Agent Tasks]
    → 600+ lines per task
    → Based on extracted framework
    → Include templates, examples, checklists
    ↓
OUTPUT: Agent + Tasks with primary evidence + Quality Gate PASS
```

**Quality Guarantee (v2.0):**
- No agent created without research foundation
- All claims traceable to sources
- Tasks based on REAL processes, not invented ones
- **NEW:** All agents have voice_dna, output_examples, anti_patterns
- **NEW:** All agents have completion_criteria and handoffs
- **NEW:** Minimum 800 lines enforced by Quality Gate

---

## Inputs

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `agent_purpose` | string | Yes | What the agent should do | `"Create sales pages"` |
| `domain` | string | Yes | Domain/area of expertise | `"copywriting"`, `"sales"`, `"marketing"` |
| `specialist_slug` | string | No | If based on human expert | `"gary_halbert"`, `"david_ogilvy"` |
| `specialist_name` | string | No | Human-readable name | `"Gary Halbert"`, `"David Ogilvy"` |
| `pack_name` | string | Yes | Target squad | `"copywriter-os"` |
| `output_dir` | path | No | Research output directory | `"docs/research/"` |

---

## Preconditions

- [ ] Squad exists at `squads/{pack_name}/`
- [ ] If specialist: check if mind exists in `outputs/minds/{specialist_slug}/`
- [ ] WebSearch tool available (for external research)
- [ ] Write permissions for output directories

---

## Workflow Steps

### Step 1: Parse & Classify Input

**Duration:** < 30 seconds

**Actions:**
```yaml
parse_input:
  - Extract agent_purpose, domain, specialist info
  - Classify agent type:
      generic: No specialist specified
      specialist_based: Has specialist_slug
  - Validate pack_name exists
  - Set output paths
```

**Decision Point:**
```
IF specialist_slug provided:
    → agent_type = "specialist_based"
    → GOTO Step 2 (Check Local Knowledge)
ELSE:
    → agent_type = "generic"
    → GOTO Step 3 (Generate Research Prompt)
```

**APPLY: Tier System Framework**
```yaml
# From data/tier-system-framework.md
tier_classification:
  - IF agent performs diagnosis/analysis FIRST → Tier 0
  - ELSE IF agent is primary expert with track record → Tier 1
  - ELSE IF agent creates frameworks/systems → Tier 2
  - ELSE IF agent specializes in specific format → Tier 3
  - ELSE IF agent is validation/checklist tool → Tools

  preliminary_tier: "Estimate tier based on agent_purpose"
  final_tier: "Confirmed in Step 7 after research"
```

**Output:**
```yaml
classification:
  agent_type: "specialist_based" | "generic"
  agent_purpose: "Create sales pages"
  domain: "copywriting"
  specialist:
    slug: "gary_halbert"
    name: "Gary Halbert"
  pack_name: "copywriter-os"
  research_output: "docs/research/gary-halbert-sales-page-research.md"
```

---

### Step 2: Check Local Knowledge (IF Specialist)

**Duration:** 1-2 minutes
**Condition:** Only runs if `agent_type == "specialist_based"`

**Actions:**
```yaml
search_local_knowledge:
  primary_sources:
    - path: "outputs/minds/{specialist_slug}/sources/"
      description: "Raw materials, transcripts, books, articles"
      priority: 1

  analysis:
    - path: "outputs/minds/{specialist_slug}/analysis/"
      description: "Identity core, cognitive spec, frameworks"
      priority: 2

  existing_research:
    - path: "docs/research/{specialist_slug}-*.md"
      description: "Previous deep research documents"
      priority: 3

  synthesis:
    - path: "outputs/minds/{specialist_slug}/synthesis/"
      description: "Communication style, mental models"
      priority: 4
```

**Catalog Results:**
```yaml
local_knowledge_catalog:
  found_sources:
    - file: "outputs/minds/gary_halbert/sources/boron-letters.md"
      type: "book_transcript"
      lines: 2450
      relevance: "high"
    - file: "outputs/minds/gary_halbert/sources/coat-of-arms-letter.md"
      type: "sales_letter"
      lines: 180
      relevance: "critical"

  found_research:
    - file: "docs/research/gary-halbert-direct-mail-research.md"
      lines: 890
      topic: "direct mail methodology"

  total_local_lines: 3520
  coverage_assessment: "Strong foundation exists, need sales page specific research"
  gaps_identified:
    - "Sales page structure (vs direct mail letter)"
    - "Digital adaptation of Halbert principles"
    - "Modern case studies"
```

**Output:**
```
📂 Local Knowledge Check for 'gary_halbert':

Found Resources:
  ✅ outputs/minds/gary_halbert/sources/ (12 files, 4,200 lines)
  ✅ outputs/minds/gary_halbert/analysis/identity-core.yaml
  ✅ docs/research/gary-halbert-direct-mail-research.md (890 lines)

Coverage: 70% (strong foundation)
Gaps: Sales page specific structure, digital adaptation

→ Research prompt will focus on GAPS only
```

---

### Step 3: Generate Research Prompt

**Duration:** 1-2 minutes
**Reference:** `templates/research-prompt-tmpl.md`

**Actions:**
```yaml
generate_prompt:
  - Load research prompt template
  - Fill sections based on:
      agent_purpose: What we're building
      domain: Area of expertise
      specialist: If applicable
      local_knowledge: What we already have (from Step 2)
      gaps: What we still need

  - Generate 7-component research prompt:
      1. REFINED_TOPIC: Strategic title expanding scope
      2. CONTEXT: Purpose and practical objectives
      3. SCOPE: 4-6 specific angles to investigate
      4. REQUIREMENTS: 3-4 parameters for research
      5. RECOMMENDED_SOURCES: 3-4 specific source types
      6. EXPECTED_RESULTS: 3-5 concrete deliverables
      7. CLARIFYING_QUESTIONS: 2-3 questions to refine
```

**Prompt Adaptation Logic:**
```python
if local_knowledge.total_lines > 1000:
    # Has substantial local knowledge
    prompt_mode = "complementary"
    prompt_focus = local_knowledge.gaps_identified
    prompt_note = f"NOTE: Already have {local_knowledge.total_lines} lines of material. Focus research on GAPS: {gaps}"
else:
    # Little or no local knowledge
    prompt_mode = "comprehensive"
    prompt_focus = "full_framework"
    prompt_note = "No existing material. Conduct comprehensive research."
```

**Output Example (Specialist-Based):**
```markdown
# Deep Research Prompt: Gary Halbert Sales Page Methodology

## REFINED TOPIC
"The Sales Page Engineering of Gary Halbert: Complete Anatomy of Direct Mail Letters
that Generated Millions — From Envelope to PS, Adapted for Digital (1970-2007)"

## CONTEXT
Building an AI agent to create sales pages following Gary Halbert's REAL methodology.
Already have 3,520 lines of source material including Boron Letters and sample letters.
Need to fill gaps in: sales page specific structure, digital adaptation, modern case studies.

## SCOPE
1. HALBERT LETTER ANATOMY
   - Envelope strategy (teaser, appearance)
   - Opening: first 3 lines that hook
   - Lead: paragraphs that retain
   - Body: central argument structure
   - Proof: where and how to insert credibility
   - Offer: presenting what you're selling
   - Guarantee: risk reversal structure
   - CTA: closing and urgency
   - PS: strategic post-scriptum role

2. A-PILE vs B-PILE METHODOLOGY
   - What makes a letter go to A-Pile
   - Appearance: handwritten, typed, printed
   - Personalization and intimacy
   - How to look like personal correspondence

3. CLASSIC LETTERS ANALYZED (not already in sources)
   - Nancy Halbert letter structure
   - Other documented letters from seminars
   - Common patterns across winners

4. DIGITAL TRANSLATION
   - Envelope → Subject/Ad equivalent
   - Letter → Landing page equivalent
   - Mobile: do long letters work?
   - Visual elements vs pure text

## REQUIREMENTS
- Prioritize Halbert's own words (quotes, rules)
- Include line-by-line analysis of at least 3 letters
- Differentiate personal style vs universal principles
- Extract operational templates and checklists

## RECOMMENDED SOURCES
- "The Boron Letters" (chapters on sales letters)
- Gary Halbert Letter (newsletter archive)
- "How to Make Maximum Money in Minimum Time"
- Bond Halbert commentary and analysis
- Halbert seminar transcripts

## EXPECTED RESULTS
1. "Halbert Sales Letter Template" - Complete structure with sections
2. "Opening Lines Database" - 20+ analyzed openings
3. "Proof Insertion Framework" - Where to place each proof type
4. "Guarantee Structures" - Risk reversal templates
5. "PS Strategy Guide" - Strategic post-scriptum usage
6. "A-Pile Checklist" - Criteria to pass first filter

## NOTE
Already have 3,520 lines including Boron Letters and Coat of Arms letter.
Focus on: Structure systematization, digital adaptation, additional letter analysis.
```

---

### Step 4: Execute Deep Research

**Duration:** 5-15 minutes
**Mode:** Autonomous (YOLO)

**Research Execution Strategy:**
```yaml
research_execution:

  # Phase 1: Process Local Knowledge
  phase_1_local:
    condition: "IF local_knowledge.total_lines > 0"
    actions:
      - Read all found local files
      - Extract relevant sections for agent purpose
      - Create local_synthesis.md with key insights
      - Mark what's already covered
    output: "Local knowledge synthesized"

  # Phase 2: Web Research for Gaps
  phase_2_web:
    method: "WebSearch + WebFetch"
    queries:
      - "{specialist_name} {topic} methodology"
      - "{specialist_name} {topic} framework process"
      - "{specialist_name} {topic} examples case studies"
      - "{topic} best practices {domain}"
      - "{specialist_name} quotes rules principles"

    for_each_query:
      - Execute WebSearch
      - For top 5-10 results:
          - WebFetch content
          - Extract relevant sections
          - Note source URL
      - Compile findings

    output: "Web research compiled"

  # Phase 3: Consolidate
  phase_3_consolidate:
    actions:
      - Merge local_synthesis + web_findings
      - Remove duplicates
      - Organize by research prompt sections
      - Add source citations throughout
      - Format as comprehensive research document

    output: "docs/research/{specialist_slug}-{topic}-research.md"
```

**Progress Logging:**
```
🔍 Step 4: Executing Deep Research...

📂 Phase 1: Processing Local Knowledge
   → Reading outputs/minds/gary_halbert/sources/boron-letters.md (2,450 lines)
   → Reading outputs/minds/gary_halbert/sources/coat-of-arms-letter.md (180 lines)
   → Synthesizing local knowledge...
   ✅ Local synthesis complete (1,200 lines extracted)

🌐 Phase 2: Web Research
   → Query 1: "Gary Halbert sales letter methodology"
      → Found 12 results, fetching top 5...
      → Extracted 450 lines
   → Query 2: "Gary Halbert letter structure framework"
      → Found 8 results, fetching top 5...
      → Extracted 380 lines
   → Query 3: "Gary Halbert sales page examples analysis"
      → Found 15 results, fetching top 5...
      → Extracted 520 lines
   ✅ Web research complete (1,350 lines total)

📝 Phase 3: Consolidating Research
   → Merging sources...
   → Removing duplicates...
   → Organizing by sections...
   → Adding citations...
   ✅ Research document complete

📄 Output: docs/research/gary-halbert-sales-page-research.md
   → Total lines: 2,100
   → Local sources: 45%
   → Web sources: 55%
   → Citations: 34
```

---

### Step 5: Validate Research Quality

**Duration:** 1-2 minutes
**Quality Gate:** BLOCKING
**Framework:** `data/quality-dimensions-framework.md` + `data/decision-heuristics-framework.md`

**APPLY: Quality Dimensions Framework**
```yaml
# From data/quality-dimensions-framework.md - Research Validation
research_dimensions:
  accuracy:
    weight: 1.0
    threshold: 7.0
    veto_power: true
    check: "Are claims verified by primary sources?"

  coherence:
    weight: 0.9
    threshold: 6.0
    check: "Is research internally consistent?"

  strategic_alignment:
    weight: 0.9
    threshold: 6.0
    check: "Does research cover what we need for agent?"

  operational_excellence:
    weight: 0.8
    threshold: 6.0
    check: "Are processes actionable, not just theory?"
```

**APPLY: Decision Heuristics Framework**
```yaml
# From data/decision-heuristics-framework.md - Research Gate Heuristic
heuristic:
  id: "SC_RES_001"
  name: "Research Quality Gate"

  weights:
    primary_evidence: 0.9
    scope_coverage: 0.8
    actionability: 0.8
    source_credibility: 0.7

  thresholds:
    total_lines: 500
    primary_sources: 3
    scope_coverage: "4 of 6 sections"

  veto_conditions:
    - condition: "total_lines < 500"
      action: "VETO - Retry research with broader queries"
    - condition: "primary_sources < 2"
      action: "VETO - Insufficient primary evidence"

  decision_tree: |
    IF total_lines < 500 → VETO (retry max 2x)
    ELSE IF primary_sources < 3 → REVIEW (flag, continue)
    ELSE IF quality_score >= 80% → APPROVE
    ELSE → REVIEW (continue with warning)
```

**Validation Criteria:**
```yaml
research_validation:

  minimum_requirements:
    total_lines: 500  # Minimum lines of research
    primary_sources: 3  # Minimum primary source citations
    sections_covered: 4  # Of 6 scope sections
    actionable_frameworks: 1  # At least one extractable framework

  quality_checks:
    - check: "Has primary evidence (quotes, examples)"
      weight: 30%
    - check: "Covers scope sections adequately"
      weight: 25%
    - check: "Contains actionable processes (not just theory)"
      weight: 25%
    - check: "Sources are credible and cited"
      weight: 20%

  scoring:
    pass: ">= 80%"
    conditional: "60-79%"
    fail: "< 60%"
```

**Decision Tree:**
```python
if research_lines < 500:
    status = "FAIL"
    action = "Retry research with broader queries"
    max_retries = 2

elif primary_sources < 3:
    status = "CONDITIONAL"
    action = "Flag for manual enrichment later, continue"

elif quality_score >= 80:
    status = "PASS"
    action = "Continue to Step 6"

else:
    status = "CONDITIONAL"
    action = "Continue with warning, document gaps"
```

**Output:**
```
🔍 Step 5: Validating Research Quality...

📊 Metrics:
   → Total lines: 2,100 ✅ (min: 500)
   → Primary sources: 8 ✅ (min: 3)
   → Scope coverage: 5/6 ✅ (min: 4)
   → Actionable frameworks: 3 ✅ (min: 1)

📋 Quality Checks:
   ✅ Primary evidence: 35% (quotes, real examples)
   ✅ Scope coverage: 83%
   ✅ Actionable processes: Present (letter anatomy, A-pile criteria)
   ✅ Source credibility: High (Boron Letters, Halbert archives)

📈 Quality Score: 92%

✅ VALIDATION PASSED
   → Proceeding to framework extraction
```

---

### Step 6: Extract Framework from Research

**Duration:** 3-5 minutes

**Extraction Process:**
```yaml
framework_extraction:

  extract_components:

    principles:
      instruction: "Extract explicit rules/principles stated by the expert"
      format: "Bullet list with source citation"
      example:
        - "Never start with 'Dear Friend' - Halbert, Boron Letters Ch.12"
        - "First sentence must grab by the throat - Halbert, Seminar 1986"

    process:
      instruction: "Extract step-by-step process the expert uses"
      format: "Numbered workflow"
      example:
        1. "Research target deeply before writing"
        2. "Write headline last, not first"
        3. "Read aloud to check rhythm"

    structure:
      instruction: "Extract structural anatomy of the output"
      format: "Template with sections"
      example:
        - "Section: Headline - Purpose: Stop and hook"
        - "Section: Lead - Purpose: Build curiosity"
        - "Section: Body - Purpose: Build argument"

    quality_criteria:
      instruction: "Extract what expert considers good vs bad"
      format: "Do/Don't list"
      example:
        do: "Use specific numbers"
        dont: "Use vague claims"

    checklist:
      instruction: "Derive validation checklist from expert criteria"
      format: "Checkbox list"
```

**Output:**
```yaml
extracted_framework:

  name: "Halbert Sales Letter Framework"
  source: "docs/research/gary-halbert-sales-page-research.md"

  principles:
    - "The most important thing is the LIST, then the OFFER, then the COPY"
    - "A-Pile letters look like personal mail, not advertising"
    - "Every sentence must compel reading the next"
    - "Specificity is more believable than generality"
    - "The PS is the second most-read part after the headline"

  process:
    1. "Define your starving crowd (who desperately wants this)"
    2. "Research until you know them better than they know themselves"
    3. "Write the offer before the copy"
    4. "Draft headline options (20-50 before choosing)"
    5. "Write the lead (first 3 paragraphs)"
    6. "Build body with proof stacking"
    7. "Craft irresistible guarantee"
    8. "Write PS that restates main benefit + urgency"
    9. "Read aloud and cut ruthlessly"

  structure:
    - section: "Envelope/Subject"
      purpose: "Get opened, look personal"
      halbert_rule: "Hand-addressed or typed, never labels"

    - section: "Headline"
      purpose: "Stop reader, promise benefit"
      halbert_rule: "News + benefit + curiosity"

    - section: "Lead (3 paragraphs)"
      purpose: "Hook and qualify"
      halbert_rule: "Start with reader, not you"

    - section: "Body"
      purpose: "Build desire through proof"
      halbert_rule: "Stack proof: story → facts → testimonials"

    - section: "Offer"
      purpose: "Make irresistible"
      halbert_rule: "Value must be 10x price perceived"

    - section: "Guarantee"
      purpose: "Remove risk"
      halbert_rule: "Make it specific and bold"

    - section: "CTA"
      purpose: "Get action NOW"
      halbert_rule: "Urgency must be real"

    - section: "PS"
      purpose: "Restate + urgency"
      halbert_rule: "Second most read - use wisely"

  quality_criteria:
    excellent:
      - "Opens like personal letter from friend"
      - "Specific numbers and proof throughout"
      - "Reads smoothly aloud"
      - "Each paragraph earns the next"

    weak:
      - "Looks like advertising"
      - "Vague claims without proof"
      - "Starts talking about seller"
      - "No clear urgency"

  checklist:
    - "[ ] Does it pass A-Pile test? (looks personal)"
    - "[ ] Does headline promise specific benefit?"
    - "[ ] Does lead hook in first 3 sentences?"
    - "[ ] Is proof stacked (story → facts → testimonials)?"
    - "[ ] Is guarantee bold and specific?"
    - "[ ] Is urgency real, not manufactured?"
    - "[ ] Does PS restate main benefit?"
    - "[ ] Does it read smoothly aloud?"
```

---

### Step 7: Create Agent Definition

**Duration:** 3-5 minutes
**Dependency:** Uses `tasks/create-agent.md`
**Framework:** `data/tier-system-framework.md`

**APPLY: Tier System Framework - Final Classification**
```yaml
# From data/tier-system-framework.md - Confirm agent tier
tier_confirmation:
  # Based on extracted framework, confirm tier
  tier_0_indicators:
    - "Agent performs diagnosis BEFORE others act"
    - "Establishes baseline understanding"
    - "Analytical/audit focus"

  tier_1_indicators:
    - "Agent is primary expert for deliverables"
    - "Has documented track record"
    - "Creates main outputs"

  tier_2_indicators:
    - "Agent creates replicable frameworks"
    - "Systematizes processes"
    - "Teaching/methodology focus"

  tier_3_indicators:
    - "Agent specializes in specific format"
    - "Channel-specific optimization"
    - "Applied after core content exists"

  # Set in agent definition
  agent_tier: "Confirmed based on indicators"
```

**Actions:**
```yaml
create_agent:

  # Pre-fill from extracted framework
  auto_fill:
    persona:
      role: "Derived from specialist expertise"
      style: "Derived from specialist's known style"
      identity: "Based on {specialist_name}'s methodology"
      focus: "Derived from principles"

    core_principles: "Direct from extracted_framework.principles"

    knowledge_areas: "Derived from research scope"

    capabilities: "Derived from research expected_results"

  # Execute agent creation
  execute:
    task: "create-agent.md"
    inputs:
      pack_name: "{pack_name}"
      agent_name: "Derived from purpose"
      agent_id: "Derived from purpose (kebab-case)"
      pre_filled_data: "extracted_framework"
      research_file: "docs/research/{slug}-{topic}-research.md"

    mode: "auto_fill"  # Skip elicitation, use research data
```

**Output:**
```
🤖 Step 7: Creating Agent Definition...

📝 Pre-filling from extracted framework:
   → Persona: Based on Gary Halbert methodology
   → Principles: 5 principles from research
   → Knowledge: 6 areas from scope
   → Capabilities: 6 from expected results

📄 Creating agent file...
   → Path: squads/{your-squad}/agents/sales-page-writer.md
   → Lines: 180
   → Based on: docs/research/gary-halbert-sales-page-research.md

✅ Agent Definition Created
   → ID: sales-page-writer
   → Name: Sales Page Writer
   → Methodology: Gary Halbert
   → Activation: @sales-page-writer
```

---

### Step 8: QUALITY GATE (Agent Validation)

**Duration:** 1-2 minutes
**Gate Type:** BLOCKING
**Framework:** `data/quality-dimensions-framework.md` + `data/decision-heuristics-framework.md`

**APPLY: Quality Dimensions Framework - Agent Assessment**
```yaml
# From data/quality-dimensions-framework.md
agent_quality_assessment:
  dimensions:
    accuracy:
      weight: 1.0
      threshold: 7.0
      veto_power: true
      check: "Is agent based on verified research, not invented?"

    coherence:
      weight: 0.9
      threshold: 6.0
      check: "Is agent internally consistent?"

    operational_excellence:
      weight: 0.8
      threshold: 6.0
      check: "Are commands and workflows well-defined?"

  scoring:
    method: "weighted_average"
    pass_threshold: 7.0
    per_dimension_min: 6.0
```

**APPLY: Decision Heuristics Framework - Agent Gate**
```yaml
# From data/decision-heuristics-framework.md
heuristic:
  id: "SC_AGT_001"
  name: "Agent Quality Gate"

  blocking_requirements:
    - check: "agent_lines >= 800"
      fail_action: "Loop to Step 7 - add more detail"
    - check: "vocabulary.always_use.length >= 5"
      fail_action: "Add vocabulary from research"
    - check: "vocabulary.never_use.length >= 3"
      fail_action: "Add anti-patterns from research"
    - check: "output_examples.length >= 3"
      fail_action: "Add real examples from research"
    - check: "anti_patterns.never_do.length >= 5"
      fail_action: "Extract warnings from expert"
    - check: "completion_criteria defined"
      fail_action: "Define when agent task is done"
    - check: "handoff_to defined"
      fail_action: "Define handoffs to other agents"

  decision_tree: |
    FOR each blocking_requirement:
      IF check FAILS → Log specific fix needed

    IF any FAIL → VETO (loop to Step 7 with fixes)
    ELSE → APPROVE (proceed to Step 9)
```

**Validation Execution:**
```yaml
quality_gate_execution:
  run: "checklists/agent-quality-gate.md"

  on_fail:
    action: "Loop back to Step 7"
    provide: "Specific fixes needed"
    max_loops: 2

  on_pass:
    action: "Continue to Step 9"
    log: "Quality Gate PASSED"
```

**Output:**
```
🔒 Step 8: Quality Gate Validation...

📋 Blocking Requirements:
   ✅ Lines: 847 (min: 800)
   ✅ vocabulary.always_use: 7 items (min: 5)
   ✅ vocabulary.never_use: 4 items (min: 3)
   ✅ output_examples: 3 (min: 3)
   ✅ anti_patterns.never_do: 6 items (min: 5)
   ✅ completion_criteria: defined
   ✅ handoff_to: defined (copy-chief, hopkins-auditor)

📊 Quality Dimensions Score:
   → Accuracy: 9/10 (research-based)
   → Coherence: 8/10
   → Operational Excellence: 8/10
   → Overall: 8.3/10 ✅

✅ QUALITY GATE PASSED
   → Proceeding to Step 9: Create Tasks
```

---

### Step 9: Create Agent Tasks

**Duration:** 10-20 minutes per task
**Quality Standard:** 600+ lines per task, based on extracted framework
**Framework:** `data/executor-matrix-framework.md`

**APPLY: Executor Matrix Framework**
```yaml
# From data/executor-matrix-framework.md - Assign executors to each task step
executor_assignment:
  for_each_task_step:
    # Determine who executes this step
    decision_tree:
      - IF step requires creativity/judgment → Human or Hybrid
      - IF step requires data analysis → Agent
      - IF step is deterministic/API → Worker

    # Common patterns for squad tasks:
    patterns:
      research_step:
        executor: Agent
        rationale: "Pattern recognition, data gathering"

      creative_step:
        executor: Human
        rationale: "Requires originality and judgment"

      review_step:
        executor: Hybrid
        rationale: "AI drafts, human validates"

      automation_step:
        executor: Worker
        rationale: "Deterministic, repeatable"

  # Document in task definition
  task_step_format:
    - step: "Step name"
      executor: "Human | Agent | Hybrid | Worker"
      rationale: "Why this executor"
```

**Task Creation Process:**
```yaml
create_tasks:

  # Identify needed tasks from agent capabilities
  identify_tasks:
    source: "agent_definition.capabilities"
    example:
      - "create-sales-page" → Main task
      - "analyze-sales-page" → Audit task
      - "optimize-headline" → Support task

  # For each task
  for_each_task:

    structure:
      - purpose: "From capability description"
      - methodology: "From extracted_framework.process"
      - steps: "Detailed from research"
      - quality_gates: "From extracted_framework.checklist"
      - examples: "From research primary sources"
      - templates: "Derived from extracted_framework.structure"

    requirements:
      min_lines: 600
      must_include:
        - "Methodology source citation"
        - "Step-by-step process from expert"
        - "Real examples analyzed"
        - "Quality checklist derived from expert"
        - "Anti-patterns from expert"

      must_not:
        - "Generic steps not from research"
        - "Invented examples"
        - "Vague instructions"
```

**Output:**
```
📝 Step 9: Creating Agent Tasks...

Task 1: create-sales-page.md
   → Based on: Halbert Sales Letter Framework
   → Structure: 8 sections from research
   → Process: 9-step workflow from Halbert
   → Examples: Coat of Arms, Nancy letter analysis
   → Quality gates: 8-point checklist
   → Lines: 847 ✅
   → Saved: squads/{your-squad}/tasks/create-sales-page.md

Task 2: audit-sales-page.md
   → Based on: Halbert quality criteria
   → Checklist: A-Pile test + 8 criteria
   → Anti-patterns: From research "weak" section
   → Lines: 623 ✅
   → Saved: squads/{your-squad}/tasks/audit-sales-page.md

✅ Tasks Created: 2
   → Total lines: 1,470
   → All based on primary research
   → All exceed 600 line minimum
```

---

## Final Output Summary

```
══════════════════════════════════════════════════════════════════════════
✅ WORKFLOW COMPLETED: Research Then Create Agent
══════════════════════════════════════════════════════════════════════════

📊 Summary:

🔬 Research Phase:
   • Research document: docs/research/gary-halbert-sales-page-research.md
   • Total lines: 2,100
   • Sources: 45% local (MMOS) + 55% web
   • Quality score: 92% PASS

🧬 Framework Extraction:
   • Principles extracted: 5
   • Process steps: 9
   • Structure sections: 8
   • Quality criteria: 8

🤖 Agent Created:
   • ID: sales-page-writer
   • Path: squads/{your-squad}/agents/sales-page-writer.md
   • Methodology: Gary Halbert
   • Based on: Primary research, not generic LLM

📝 Tasks Created:
   • create-sales-page.md (847 lines)
   • audit-sales-page.md (623 lines)
   • Total: 1,470 lines of research-backed tasks

📂 Files Generated:
   1. docs/research/gary-halbert-sales-page-research.md
   2. squads/{your-squad}/agents/sales-page-writer.md
   3. squads/{your-squad}/tasks/create-sales-page.md
   4. squads/{your-squad}/tasks/audit-sales-page.md

✅ Quality Guarantee:
   • All content traceable to primary sources
   • No generic LLM-invented methodology
   • Tasks exceed 600-line minimum
   • Agent ready for activation: @sales-page-writer

══════════════════════════════════════════════════════════════════════════
```

---

## Error Handling

### Research Failures

| Error | Cause | Resolution |
|-------|-------|------------|
| No local knowledge found | Mind doesn't exist | Continue with web-only research |
| WebSearch rate limit | Too many queries | Backoff and retry |
| < 500 lines after research | Insufficient sources | Retry with broader queries (max 2) |
| No primary sources | Only secondary content | Flag warning, continue |

### Validation Failures

| Error | Cause | Resolution |
|-------|-------|------------|
| Research too thin | Niche topic | Accept CONDITIONAL, document gaps |
| No actionable framework | Theory-only sources | Retry with "process" "how-to" queries |
| Quality < 60% | Poor research | STOP, return to user |

### Agent Creation Failures

| Error | Cause | Resolution |
|-------|-------|------------|
| Agent ID exists | Duplicate | Prompt for new name or update existing |
| Task < 600 lines | Insufficient research | Add more detail from sources |

---

## Usage Examples

### Example 1: Specialist-Based Agent (CopywriterOS)

```bash
@squad-architect
*workflow research-then-create-agent \
  --agent-purpose "Create high-converting sales pages" \
  --domain "copywriting" \
  --specialist-slug "gary_halbert" \
  --specialist-name "Gary Halbert" \
  --pack-name "copywriter-os"
```

### Example 2: Generic Domain Agent

```bash
@squad-architect
*workflow research-then-create-agent \
  --agent-purpose "Conduct user interviews for product discovery" \
  --domain "product-management" \
  --pack-name "product-os"
```

### Example 3: Multiple Specialists (Blended)

```bash
@squad-architect
*workflow research-then-create-agent \
  --agent-purpose "Create VSL scripts" \
  --domain "copywriting" \
  --specialist-slug "jon_benson" \
  --specialist-name "Jon Benson" \
  --secondary-specialists "eugene_schwartz,gary_halbert" \
  --pack-name "copywriter-os"
```

---

## Integration Points

**Upstream (provides input):**
- User request for new agent
- Existing minds in `outputs/minds/`
- Existing research in `docs/research/`

**Downstream (consumes output):**
- `create-agent.md` task (Step 7)
- `create-task.md` task (Step 9)
- Agent activation system

**Lateral (planned workflows):**
- upgrade-agent-with-research - For existing weak agents (planned)
- bulk-research-agents - Multiple agents at once (planned)

---

## Quality Guarantees

This workflow enforces:

1. **Research First** - No agent without research foundation
2. **Primary Sources** - Prioritize expert's own words
3. **Local Knowledge** - Use existing MMOS resources first
4. **Traceability** - All claims linked to sources
5. **Minimum Depth** - 500+ lines research, 600+ lines tasks
6. **Expert Methodology** - Real processes, not LLM invention
7. **Quality Gates** - Validation at each step

**Anti-Pattern Prevented:**
```
❌ OLD WAY (CopywriterOS problem):
   User: "Create copywriter agent"
   LLM: *invents generic copywriting advice*
   Result: Weak, generic agent

✅ NEW WAY (This workflow):
   User: "Create copywriter agent based on Gary Halbert"
   Workflow: *researches Halbert's REAL methodology*
   Result: Agent with authentic, traceable expertise
```

---

## Related Resources

- **Tasks:**
  - `tasks/deep-research-pre-agent.md` - Research prompt generation
  - `tasks/create-agent.md` - Agent creation
  - `tasks/create-task.md` - Task creation

- **Templates:**
  - `templates/research-prompt-tmpl.md` - Research prompt structure
  - `templates/agent-tmpl.md` - Agent definition structure

---

**Workflow Status:** Ready for Implementation
**Version:** 1.0.0
**Created:** 2026-01-22
**Author:** AIOS Meta-Agent
