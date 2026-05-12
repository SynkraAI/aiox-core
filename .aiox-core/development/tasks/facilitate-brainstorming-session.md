---
id: facilitate-brainstorming-session
name: Facilitate Brainstorming Session
agent: aiox-master
category: collaboration
complexity: medium
tools:
  - clickup        # Capture ideas and organize them
  - mcp            # Call specialized agents for domain expertise
checklists:
  - aiox-master-checklist.md
---

# Facilitate Brainstorming Session

## Purpose

To conduct a structured brainstorming session with multiple AI agents (and optionally human participants) to generate, categorize, and prioritize ideas for features, solutions, or strategic decisions.

## Input

### Required Parameters

- **topic**: `string`
  - **Description**: The challenge, opportunity, or question to brainstorm about
  - **Example**: "How can we improve user onboarding for AIOX?"
  - **Validation**: Must be at least 20 characters

- **session_goal**: `string`
  - **Description**: What outcome is desired from this session
  - **Options**: `"ideation"` (generate many ideas), `"solution"` (solve a problem), `"strategy"` (strategic planning)
  - **Default**: `"ideation"`

### Optional Parameters

- **participating_agents**: `array<string>`
  - **Description**: Agent IDs to invite to the session
  - **Default**: Auto-select based on topic (using brief analysis)
  - **Example**: `["po", "architect", "ux-expert", "github-devops"]`

- **time_limit**: `number`
  - **Description**: Session duration in minutes
  - **Default**: `30`
  - **Range**: `10-60`

- **output_format**: `string`
  - **Description**: How to organize final output
  - **Options**: `"categorized"` (by theme), `"prioritized"` (by value), `"actionable"` (with next steps)
  - **Default**: `"categorized"`

- **context_documents**: `array<string>`
  - **Description**: Optional file paths for context (PRD, backlog, architecture docs)
  - **Example**: `["docs/prd.md", "docs/backlog.md"]`

## Output

- **ideas**: `array<object>`
  - **Structure**: `{ id, text, source_agent, category, priority, rationale }`
  - **Description**: All generated ideas with metadata

- **categories**: `array<object>`
  - **Structure**: `{ name, ideas_count, top_ideas }`
  - **Description**: Ideas grouped by theme

- **prioritized_recommendations**: `array<object>`
  - **Structure**: `{ idea, value_score, effort_estimate, roi, next_steps }`
  - **Description**: Top 5-10 ideas with actionable next steps

- **session_summary**: `object`
  - **Structure**: `{ topic, duration, agents_participated, ideas_generated, key_insights }`
  - **Description**: Session metadata and insights

- **clickup_board_url**: `string` (optional)
  - **Description**: ClickUp board with ideas organized (if ClickUp integration enabled)

## Process

### Phase 1: Setup & Context Loading (5 min)

1. **Load Context**
   - If `context_documents` provided, read and summarize key points
   - Extract relevant constraints, requirements, or goals

2. **Select Participating Agents**
   - If `participating_agents` not provided:
     - Analyze topic using brief analysis
     - Identify relevant domains (e.g., "user onboarding" → ux-expert, po, copywriter)
     - Auto-select 3-5 appropriate agents
   - Log: "✅ Session participants: [agent list]"

3. **Define Session Structure**
   - Based on `session_goal`:
     - **Ideation**: Divergent thinking (generate maximum ideas)
     - **Solution**: Convergent thinking (evaluate and refine)
     - **Strategy**: Structured frameworks (SWOT, OKRs, etc.)

### Phase 2: Divergent Thinking - Idea Generation (10-15 min)

4. **Round 1: Initial Ideas (5 min)**
   - Prompt each agent: "Generate 3-5 ideas for: {topic}"
   - Collect responses
   - No evaluation yet (pure brainstorming)

5. **Round 2: Build on Ideas (5 min)**
   - Share all ideas with agents
   - Prompt: "Build on or remix existing ideas. Generate 2-3 new ideas inspired by what you see."
   - Collect responses

6. **Round 3: Wild Cards (2 min)**
   - Prompt: "Generate 1-2 unconventional or 'what if' ideas"
   - Encourage creative risk-taking

### Phase 3: Convergent Thinking - Categorization (5-10 min)

7. **Categorize Ideas**
   - Use AI to identify themes/patterns
   - Group ideas into 3-7 categories
   - Example categories: "Quick Wins", "Big Bets", "Research Needed", "Technical Solutions", "UX Improvements"

8. **Deduplicate & Merge**
   - Identify similar ideas
   - Merge or link related concepts

### Phase 4: Evaluation & Prioritization (5-10 min)

9. **Score Ideas** (if `output_format: "prioritized"`)
   - Criteria:
     - **Value**: Impact on users/business (1-10)
     - **Effort**: Development complexity (1-10)
     - **ROI**: Value/Effort ratio
     - **Alignment**: Fits strategy/goals (1-10)
   - Calculate aggregate scores

10. **Select Top Ideas**
    - Identify top 5-10 ideas based on scores
    - For each, generate:
      - **Rationale**: Why this idea is valuable
      - **Next Steps**: Concrete actions to pursue it

### Phase 5: Documentation & Actionability (5 min)

11. **Create Session Report**
    - Summary of all ideas
    - Categorized view
    - Prioritized recommendations
    - Session metadata

12. **Export to ClickUp** (optional)
    - If ClickUp integration enabled:
      - Create board: "Brainstorm: {topic}"
      - Add ideas as tasks with categories as tags
      - Link to session report

## Checklist

### Pre-conditions

- [ ] Topic is well-defined and specific enough
  - **Validation**: `topic.length >= 20 && topic.includes('?') || topic.includes('how') || topic.includes('what')`
  - **Error**: "Topic too vague. Provide a specific question or challenge."

- [ ] Session goal is valid
  - **Validation**: `["ideation", "solution", "strategy"].includes(session_goal)`

- [ ] Participating agents exist (if provided)
  - **Validation**: Check agent IDs against available agents
  - **Error**: "Agent '{agent_id}' not found"

### Post-conditions

- [ ] At least 10 ideas generated
  - **Validation**: `ideas.length >= 10`
  - **Error**: "Insufficient ideas. Extend session or add more agents."

- [ ] All ideas have categories
  - **Validation**: `ideas.every(i => i.category)`

- [ ] Top 5 ideas have next steps
  - **Validation**: `prioritized_recommendations.slice(0, 5).every(r => r.next_steps)`

- [ ] Session summary is complete
  - **Validation**: `session_summary.ideas_generated > 0 && session_summary.agents_participated.length > 0`

### Acceptance Criteria

- [ ] Session produces actionable recommendations
  - **Type**: acceptance
  - **Manual Check**: true
  - **Criteria**: User can immediately act on at least 3 ideas

- [ ] Ideas are diverse and cover multiple perspectives
  - **Type**: acceptance
  - **Manual Check**: false
  - **Test**: `categories.length >= 3`

## Templates

### Session Report Template

```markdown
# Brainstorming Session: {topic}

**Date**: {date}
**Duration**: {duration} minutes
**Participants**: {agents_participated.join(', ')}
**Goal**: {session_goal}

## Context

{context_summary}

## Ideas Generated

**Total**: {ideas_generated}

### By Category

{categories.map(cat => `
#### ${cat.name} (${cat.ideas_count} ideas)

${cat.top_ideas.map(idea => `- ${idea.text} (by ${idea.source_agent})`).join('\n')}
`).join('\n')}

## Top Recommendations

{prioritized_recommendations.map((rec, i) => `
### ${i+1}. ${rec.idea.text}

**Value Score**: ${rec.value_score}/10
**Effort Estimate**: ${rec.effort_estimate}/10
**ROI**: ${rec.roi.toFixed(2)}

**Why this matters**: ${rec.rationale}

**Next Steps**:
${rec.next_steps.map(step => `- ${step}`).join('\n')}
`).join('\n')}

## Key Insights

{key_insights}

## Session Metadata

- **Ideas Generated**: {ideas_generated}
- **Categories Identified**: {categories.length}
- **Agents Participated**: {agents_participated.length}
- **Session Duration**: {duration} minutes
```

## Tools

- **clickup**:
  - **Version**: 1.0.0
  - **Used For**: Export ideas to ClickUp board for tracking
  - **Optional**: Yes (user can opt-out)

- **mcp**:
  - **Version**: 1.0.0
  - **Used For**: Call specialized agents for domain-specific ideas
  - **Shared With**: All brainstorming sessions

## Performance

- **Duration Expected**: 30 minutes (configurable: 10-60 min)
- **Cost Estimated**: $0.05-0.15 (depends on agent count and rounds)
- **Cacheable**: false (sessions are unique)
- **Parallelizable**: true (agents can generate ideas simultaneously)

## Error Handling

- **Strategy**: fallback
- **Fallback**: If agent fails, continue with remaining agents
- **Retry**:
  - **Max Attempts**: 2
  - **Backoff**: linear
  - **Backoff MS**: 1000
- **Abort Workflow**: false (continue even if some agents fail)
- **Notification**: log + summary report

## Metadata

- **Story**: N/A (framework capability)
- **Version**: 1.0.0
- **Dependencies**: None
- **Author**: Brad Frost Clone
- **Created**: 2025-11-13
- **Updated**: 2025-11-13

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
task: facilitateBrainstormingSession()
responsável: Atlas (Decoder)
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


## Usage Examples

### Example 1: Feature Ideation

```bash
aiox activate Maestro
aiox brainstorm "How can we improve AIOX user onboarding for non-technical users?"
```

**Output**: 25 ideas across 5 categories, top 10 prioritized with next steps

### Example 2: Problem Solving with Specific Agents

```bash
aiox brainstorm "How to reduce API latency in database queries?" \
  --agents="db-sage,architect,github-devops" \
  --goal="solution" \
  --format="actionable"
```

**Output**: Focused technical solutions with implementation steps

### Example 3: Strategic Planning

```bash
aiox brainstorm "What should be our open-source expansion strategy for Q1 2026?" \
  --agents="po,architect,github-devops" \
  --goal="strategy" \
  --context="docs/prd.md,docs/open-source-roadmap.md"
```

**Output**: Strategic recommendations aligned with existing plans

---

**Related Tasks:**
- `create-next-story` - Convert ideas into actionable stories
- `analyze-framework` - Analyze framework capabilities for improvement ideas

