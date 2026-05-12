# User Research & Needs Analysis

> **Task ID:** ux-user-research
> **Agent:** UX-Design Expert
> **Phase:** 1 - UX Research
> **Interactive:** Yes (elicit=true)

---

## Execution Modes

**Choose your execution mode:**

### 1. YOLO Mode - Fast, Autonomous (0-1 prompts)
- Autonomous decision making with logging
- Minimal user interaction
- **Best for:** Simple, deterministic tasks

### 2. Interactive Mode - Balanced, Educational (5-10 prompts) **[DEFAULT]**
- Explicit decision checkpoints
- Educational explanations
- **Best for:** Learning, complex decisions

### 3. Pre-Flight Planning - Comprehensive Upfront Planning
- Task analysis phase (identify all ambiguities)
- Zero ambiguity execution
- **Best for:** Ambiguous requirements, critical work

**Parameter:** `mode` (optional, default: `interactive`)

---

## Task Definition (AIOX Task Format V1.0)

```yaml
task: uxUserResearch()
responsável: Uma (Empathizer)
responsavel_type: Agente
atomic_layer: Strategy

**Entrada:**
- campo: task
  tipo: string
  origem: User Input
  obrigatório: true
  validação: Must be registered task

- campo: parameters
  tipo: object
  origem: User Input
  obrigatório: false
  validação: Valid task parameters

- campo: mode
  tipo: string
  origem: User Input
  obrigatório: false
  validação: yolo|interactive|pre-flight

**Saída:**
- campo: execution_result
  tipo: object
  destino: Memory
  persistido: false

- campo: logs
  tipo: array
  destino: File (.ai/logs/*)
  persistido: true

- campo: state
  tipo: object
  destino: State management
  persistido: true
```

---

## Pre-Conditions

**Purpose:** Validate prerequisites BEFORE task execution (blocking)

**Checklist:**

```yaml
pre-conditions:
  - [ ] Task is registered; required parameters provided; dependencies met
    tipo: pre-condition
    blocker: true
    validação: |
      Check task is registered; required parameters provided; dependencies met
    error_message: "Pre-condition failed: Task is registered; required parameters provided; dependencies met"
```

---

## Post-Conditions

**Purpose:** Validate execution success AFTER task completes

**Checklist:**

```yaml
post-conditions:
  - [ ] Task completed; exit code 0; expected outputs created
    tipo: post-condition
    blocker: true
    validação: |
      Verify task completed; exit code 0; expected outputs created
    error_message: "Post-condition failed: Task completed; exit code 0; expected outputs created"
```

---

## Acceptance Criteria

**Purpose:** Definitive pass/fail criteria for task completion

**Checklist:**

```yaml
acceptance-criteria:
  - [ ] Task completed as expected; side effects documented
    tipo: acceptance-criterion
    blocker: true
    validação: |
      Assert task completed as expected; side effects documented
    error_message: "Acceptance criterion not met: Task completed as expected; side effects documented"
```

---

## Tools

**External/shared resources used by this task:**

- **Tool:** task-runner
  - **Purpose:** Task execution and orchestration
  - **Source:** .aiox-core/core/task-runner.js

- **Tool:** logger
  - **Purpose:** Execution logging and error tracking
  - **Source:** .aiox-core/utils/logger.js

---

## Scripts

**Agent-specific code for this task:**

- **Script:** execute-task.js
  - **Purpose:** Generic task execution wrapper
  - **Language:** JavaScript
  - **Location:** .aiox-core/scripts/execute-task.js

---

## Error Handling

**Strategy:** retry

**Common Errors:**

1. **Error:** Task Not Found
   - **Cause:** Specified task not registered in system
   - **Resolution:** Verify task name and registration
   - **Recovery:** List available tasks, suggest similar

2. **Error:** Invalid Parameters
   - **Cause:** Task parameters do not match expected schema
   - **Resolution:** Validate parameters against task definition
   - **Recovery:** Provide parameter template, reject execution

3. **Error:** Execution Timeout
   - **Cause:** Task exceeds maximum execution time
   - **Resolution:** Optimize task or increase timeout
   - **Recovery:** Kill task, cleanup resources, log state

---

## Performance

**Expected Metrics:**

```yaml
duration_expected: 5-20 min (estimated)
cost_estimated: $0.003-0.015
token_usage: ~2,000-8,000 tokens
```

**Optimization Notes:**
- Iterative analysis with depth limits; cache intermediate results; batch similar operations

---

## Metadata

```yaml
story: N/A
version: 1.0.0
dependencies:
  - N/A
tags:
  - automation
  - workflow
updated_at: 2025-11-17
```

---


## 📋 Description

Conduct comprehensive user research, interviews, surveys, and needs analysis to understand target users, their pain points, goals, and behaviors. Generate personas, user journey maps, and actionable design insights.

---

## 🎯 Objectives

- Understand who the users are (demographics, behaviors, goals)
- Identify pain points and frustrations in current solutions
- Discover opportunities for improvement
- Create evidence-based personas and user journeys
- Document insights that drive design decisions

---

## 📊 Research Methods

### Method 1: User Interviews
**When to use:** Deep qualitative insights, early discovery
**Participants:** 5-10 users (representative sample)
**Duration:** 30-60 minutes per interview
**Output:** Interview transcripts, key quotes, themes

### Method 2: Surveys
**When to use:** Quantitative validation, large sample
**Participants:** 50+ users
**Duration:** 10-15 minutes to complete
**Output:** Statistical data, usage patterns, preferences

### Method 3: Analytics Review
**When to use:** Behavioral data, existing products
**Source:** Google Analytics, Mixpanel, Hotjar, etc.
**Output:** Usage patterns, drop-off points, popular features

### Method 4: Competitor Analysis
**When to use:** Market context, best practices
**Scope:** 3-5 competitors
**Output:** Feature comparison, UX patterns, opportunities

### Method 5: Contextual Inquiry
**When to use:** Observe users in natural environment
**Duration:** 2-4 hours per session
**Output:** Workflow observations, environment insights

---

## 🔄 Workflow

### Step 1: Define Research Objectives
**Interactive Elicitation:**

```
What are your research goals? (Choose 1-3 or type custom)

1. Understand user needs and pain points
2. Validate product concept or feature idea
3. Improve existing product UX
4. Identify new opportunities
5. Compare against competitors
6. Create user personas
7. Custom (describe your goals)

Your selection: _____
```

**Follow-up questions:**
- Who are your target users? (Demographics, roles, tech-savviness)
- What's your timeline? (Days/weeks available)
- What resources do you have? (Budget, access to users)
- What do you already know? (Existing data, assumptions)

---

### Step 2: Select Research Methods
Based on objectives, recommend methods:

```
Recommended research methods for your goals:

[X] User Interviews (5-10 participants)
    - Best for: Deep insights, "why" questions
    - Time: 2-3 weeks
    - Cost: Low (if recruiting internally)

[ ] Surveys (50+ participants)
    - Best for: Quantitative validation
    - Time: 1-2 weeks
    - Cost: Low (use Google Forms/Typeform)

[ ] Analytics Review
    - Best for: Current usage patterns
    - Time: 3-5 days
    - Cost: Free (existing data)

Which methods do you want to use? (Type numbers, e.g., 1,3)
Your selection: _____
```

---

### Step 3: Prepare Research Materials

**For Interviews:**
- Create interview script (10-15 open-ended questions)
- Prepare consent forms
- Set up recording tools (with permission)
- Schedule sessions

**For Surveys:**
- Draft survey questions (max 20 questions)
- Use mix of multiple choice + open-ended
- Set up survey tool (Google Forms, Typeform, SurveyMonkey)
- Plan distribution channels

**For Analytics:**
- Define key metrics to review
- Set date range for analysis
- Prepare dashboard views

---

### Step 4: Conduct Research

**Interview Tips:**
- Build rapport first (5 min)
- Ask open-ended questions ("Tell me about...")
- Probe deeper ("Why is that important?")
- Observe body language and tone
- Stay neutral, don't lead responses
- Record key quotes verbatim

**Survey Tips:**
- Keep it short (10-15 min max)
- Clear, unbiased questions
- Include screening questions
- Test with 2-3 people first

---

### Step 5: Analyze Findings

**Synthesis Process:**
1. Review all data (transcripts, responses, analytics)
2. Extract key insights and quotes
3. Identify themes and patterns
4. Cluster similar findings
5. Prioritize by frequency and impact

**Affinity Mapping:**
- Write findings on sticky notes (digital or physical)
- Group similar insights together
- Name each group (theme)
- Identify relationships between themes

---

### Step 6: Create Personas

**Persona Template:**

```markdown
## Persona: [Name]

### Demographics
- Age: [Range]
- Role: [Job title]
- Tech Savviness: [Beginner/Intermediate/Expert]
- Location: [Geography]

### Goals
- [Primary goal]
- [Secondary goal]
- [Aspirational goal]

### Pain Points
- [Frustration 1]
- [Frustration 2]
- [Frustration 3]

### Behaviors
- [How they currently solve this problem]
- [Tools they use]
- [Typical workflow]

### Quote
> "[Memorable quote from research]"

### Needs from Product
- [Need 1]
- [Need 2]
- [Need 3]
```

**Create 2-4 personas** (primary + secondary users)

---

### Step 7: Document User Journeys

**Journey Map Components:**
- **Stages:** Discovery → Consideration → Purchase → Use → Loyalty
- **Actions:** What user does at each stage
- **Thoughts:** What they're thinking ("Will this work for me?")
- **Emotions:** Emotional state (😊 😐 😞)
- **Pain Points:** Friction and frustrations
- **Opportunities:** Where we can improve

**Format:**
```
Stage: [Stage Name]
-----
Actions:
  - [Action 1]
  - [Action 2]

Thoughts:
  - "[Thought 1]"
  - "[Thought 2]"

Emotions: [😊/😐/😞]

Pain Points:
  - [Pain 1]
  - [Pain 2]

Opportunities:
  - [Opportunity 1]
  - [Opportunity 2]
```

---

### Step 8: Generate Actionable Insights

**Insight Template:**

```markdown
## Key Insight #[N]: [One-sentence insight]

**Evidence:**
- [Data point 1]
- [Quote 1]
- [Quote 2]

**Impact:** [HIGH/MEDIUM/LOW]

**Implications for Design:**
- [Design implication 1]
- [Design implication 2]

**Recommended Actions:**
1. [Action 1]
2. [Action 2]
```

Generate 5-10 key insights ranked by impact.

---

## 📤 Outputs

All artifacts saved to: `outputs/ux-research/{project}/`

### Required Files:
1. **research-summary.md** - Executive summary of findings
2. **personas.md** - 2-4 user personas
3. **user-journeys.md** - Journey maps for key scenarios
4. **insights.md** - 5-10 actionable insights
5. **raw-data/** - Interview transcripts, survey responses

### Optional Files:
6. **interview-script.md** - Questions used
7. **survey-questions.md** - Survey instrument
8. **affinity-map.jpg** - Photo of synthesis work
9. **analytics-summary.md** - Analytics findings

---

## ✅ Success Criteria

- [ ] Research objectives clearly defined
- [ ] Appropriate methods selected and executed
- [ ] Minimum sample size achieved (5+ interviews or 50+ surveys)
- [ ] Data analyzed and synthesized
- [ ] 2-4 personas created with evidence backing
- [ ] User journey maps document complete workflows
- [ ] 5-10 actionable insights generated
- [ ] Insights prioritized by impact
- [ ] All outputs documented in `outputs/ux-research/{project}/`
- [ ] `.state.yaml` updated with research completion

---

## 🔄 Integration with Other Tasks

**Next Steps:**
- `*wireframe` - Use personas and insights to inform wireframe design
- `*create-front-end-spec` - Reference user needs in specifications
- `*build` - Ensure components meet user requirements

**State Management:**
Updates `.state.yaml` with:
- `user_research_complete: true`
- `personas: [list of persona names]`
- `key_insights: [list of insights]`
- `research_date: [ISO date]`

---

## 📚 Templates & Resources

**Interview Script Starter:**
```
1. Tell me about your role and how you currently [do task X]
2. What are your main goals when [doing task X]?
3. Walk me through your typical workflow for [task X]
4. What's the most frustrating part of [task X]?
5. If you had a magic wand, how would you change [task X]?
6. What tools do you currently use for [task X]?
7. How do you measure success for [task X]?
8. Tell me about a time when [task X] went really well
9. Tell me about a time when [task X] went poorly
10. Is there anything else I should know about [task X]?
```

**Survey Question Types:**
- Demographic (screening)
- Multiple choice (quantify preferences)
- Likert scale (measure sentiment 1-5)
- Ranking (prioritize features)
- Open-ended (discover unexpected insights)

---

## ⚠️ Common Pitfalls

1. **Leading questions** - Don't ask "Don't you think X is better?" → Ask "How do you compare X and Y?"
2. **Too small sample** - 1-2 interviews isn't enough → Aim for 5-10 minimum
3. **Confirmation bias** - Don't only talk to happy users → Include frustrated users
4. **No synthesis** - Don't just collect data → Find patterns and themes
5. **Ignoring context** - Don't just ask questions → Observe actual behavior

---

**Created:** 2025-11-12
**Story:** 4.3 - UX-Design-Expert Merge
**Version:** 1.0.0
