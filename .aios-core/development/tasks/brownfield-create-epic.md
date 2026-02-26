---
tools:
  - github-cli
checklists:
  - po-master-checklist.md
  - change-checklist.md
---

# Create Brownfield Epic Task

## Purpose

Create a single epic for smaller brownfield enhancements that don't require the full PRD and Architecture documentation process. This task is for isolated features or modifications that can be completed within a focused scope.

## When to Use This Task

**Use this task when:**

- The enhancement can be completed in 1-3 stories
- No significant architectural changes are required
- The enhancement follows existing project patterns
- Integration complexity is minimal
- Risk to existing system is low

**Use the full brownfield PRD/Architecture process when:**

- The enhancement requires multiple coordinated stories
- Architectural planning is needed
- Significant integration work is required
- Risk assessment and mitigation planning is necessary


## Configuration Dependencies

This task requires the following configuration keys from `core-config.yaml`:

- **`devStoryLocation`**: Location of story files (typically docs/stories)

- **`prdShardedLocation`**: Location for sharded PRD documents (typically docs/prd) - Required to access product requirements
- **`architectureShardedLocation`**: Location for sharded architecture documents (typically docs/architecture) - Required to read/write architecture documentation

**Loading Config:**
```javascript
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '../../.aios-core/core-config.yaml');
const config = yaml.load(fs.readFileSync(configPath, 'utf8'));

const dev_story_location = config.devStoryLocation;
const prdShardedLocation = config.prdShardedLocation || 'docs/prd'; // prdShardedLocation
const architectureShardedLocation = config.architectureShardedLocation || 'docs/architecture'; // architectureShardedLocation
```

## Instructions

### 0. Code Intelligence: Codebase Overview (Optional — Auto-skip if unavailable)

> **Condition:** Only execute if `isCodeIntelAvailable()` returns true.
> If no code intelligence provider is available, skip this step silently and proceed to Step 1.

When code intelligence is available, enrich the epic with real codebase data:

```javascript
const { isCodeIntelAvailable } = require('.aios-core/core/code-intel');
const { getCodebaseOverview, getDependencyGraph } = require('.aios-core/core/code-intel/helpers/planning-helper');

if (isCodeIntelAvailable()) {
  const overview = await getCodebaseOverview('.');
  const depGraph = await getDependencyGraph('.');

  // Include in epic under "Codebase Intelligence" section:
  // - overview.codebase: project patterns, file groups
  // - overview.stats: file counts, language distribution
  // - depGraph.dependencies: module relationships
  // - depGraph.summary: { totalDeps, depth }
}
```

**If data is available, add this section to the epic:**

#### Codebase Intelligence

| Metric | Value |
|--------|-------|
| Project Overview | {{overview.codebase summary}} |
| File Statistics | {{overview.stats}} |
| Dependency Depth | {{depGraph.summary.depth}} |
| Total Dependencies | {{depGraph.summary.totalDeps}} |

**Dependency Graph Summary:**
{{depGraph.dependencies key relationships}}

> **Note:** This section is auto-generated from code intelligence. Values are real codebase data, not estimates.

---

### 1. Project Analysis (Required)

Before creating the epic, gather essential information about the existing project:

**Existing Project Context:**

- [ ] Project purpose and current functionality understood
- [ ] Existing technology stack identified
- [ ] Current architecture patterns noted
- [ ] Integration points with existing system identified

**Enhancement Scope:**

- [ ] Enhancement clearly defined and scoped
- [ ] Impact on existing functionality assessed
- [ ] Required integration points identified
- [ ] Success criteria established

### 2. Epic Creation

Create a focused epic following this structure:

#### Epic Title

{{Enhancement Name}} - Brownfield Enhancement

#### Epic Goal

{{1-2 sentences describing what the epic will accomplish and why it adds value}}

#### Epic Description

**Existing System Context:**

- Current relevant functionality: {{brief description}}
- Technology stack: {{relevant existing technologies}}
- Integration points: {{where new work connects to existing system}}

**Enhancement Details:**

- What's being added/changed: {{clear description}}
- How it integrates: {{integration approach}}
- Success criteria: {{measurable outcomes}}

#### Stories (Enhanced with Quality Planning)

**🔧 Dynamic Executor Assignment (Story 11.1 - Projeto Bob)**

Use the executor-assignment module to automatically assign executor and quality gate for each story:

```javascript
// .aios-core/core/orchestration/executor-assignment.js
const { assignExecutorFromContent } = require('.aios-core/core/orchestration/executor-assignment');

// For each story in the epic:
const storyContent = `${storyTitle}\n${storyDescription}\n${acceptanceCriteria}`;
const assignment = assignExecutorFromContent(storyContent);

// Returns:
// {
//   executor: '@dev' | '@data-engineer' | '@devops' | '@ux-design-expert' | '@analyst' | '@architect',
//   quality_gate: '@architect' | '@dev' | '@pm',
//   quality_gate_tools: ['code_review', 'pattern_validation', ...]
// }
```

**Executor Assignment Table:**

| Work Type | Keywords | Executor | Quality Gate |
|-----------|----------|----------|--------------|
| Code/Features/Logic | feature, logic, handler, service, api | @dev | @architect |
| Schema/DB/RLS/Migrations | schema, table, migration, rls, query, database | @data-engineer | @dev |
| Infra/CI/CD/Deploy | ci/cd, deploy, docker, kubernetes, pipeline | @devops | @architect |
| Design/UI Components | component, ui, design, interface, accessibility | @ux-design-expert | @dev |
| Research/Investigation | research, investigate, analyze, poc | @analyst | @pm |
| Architecture Decisions | architecture, design_decision, pattern, scalability | @architect | @pm |

**CRITICAL RULES:**
- [ ] **executor != quality_gate** (ALWAYS different)
- [ ] Include `executor`, `quality_gate`, and `quality_gate_tools` in each story YAML frontmatter
- [ ] Log assignment for traceability

List 1-3 focused stories that complete the epic, including predicted quality gates and specialized agent assignments:

**Story Structure with Quality Predictions:**

Each story should include:
- Story title and brief description
- Predicted specialized agents (based on story type)
- Quality gates (Pre-Commit, Pre-PR, Pre-Deployment if applicable)

**Story YAML Frontmatter Template (Required Fields):**

```yaml
# Every story MUST include these fields in YAML frontmatter
executor: "@data-engineer"           # Assigned via assignExecutorFromContent()
quality_gate: "@dev"                  # MUST be different from executor
quality_gate_tools: [schema_validation, migration_review, rls_test]
```

**Examples:**

1. **Story 1: {{Database Migration Story}}**
   - Description: {{Add new table for feature X with RLS policies}}
   - **Executor Assignment**: `executor: @data-engineer`, `quality_gate: @dev`
   - **Quality Gate Tools**: `[schema_validation, migration_review, rls_test]`
   - **Quality Gates**:
     - Pre-Commit: Schema validation, service filter verification
     - Pre-PR: SQL review, migration safety check
   - **Focus**: Service filters (.eq('service', 'ttcx')), RLS policies, foreign keys

2. **Story 2: {{API Integration Story}}**
   - Description: {{Create REST endpoint for feature X}}
   - **Predicted Agents**: @dev, @architect (if new patterns)
   - **Quality Gates**:
     - Pre-Commit: Security scan, error handling validation
     - Pre-PR: API contract validation, backward compatibility check
   - **Focus**: Input validation, authentication, error responses

3. **Story 3: {{Deployment Story}}**
   - Description: {{Deploy feature X to production with configuration}}
   - **Predicted Agents**: @dev, @github-devops (deployment coordination)
   - **Quality Gates**:
     - Pre-Commit: Configuration validation
     - Pre-PR: Environment consistency check
     - Pre-Deployment: Full security scan, rollback plan validation
   - **Focus**: Secrets management, environment config, zero-downtime deployment

**Agent Assignment Guide for Epic Planning:**

When breaking down epic into stories, predict agents based on:

- **Database Changes** → Include @db-sage in story planning
- **API/Backend Changes** → Include @architect for contract review
- **Frontend/UI Changes** → Include @ux-expert for accessibility
- **Deployment/Infrastructure** → Include @github-devops for coordination
- **Security Features** → Ensure @dev focuses on OWASP validation

**Quality Gate Prediction Guidance:**

- **All Stories**: Must include Pre-Commit review (@dev)
- **Stories Creating PRs**: Include Pre-PR validation (@github-devops)
- **Production Deployments**: Include Pre-Deployment scan (@github-devops)
- **HIGH RISK Stories**: Consider feature flags and phased rollout

This quality planning during epic creation ensures:
- Story creators know which agents to consult
- Quality gates are planned upfront, not retrofitted
- Risk-appropriate validation is built into each story
- Specialized expertise is allocated correctly

#### Compatibility Requirements

- [ ] Existing APIs remain unchanged
- [ ] Database schema changes are backward compatible
- [ ] UI changes follow existing patterns
- [ ] Performance impact is minimal

#### Risk Mitigation

- **Primary Risk:** {{main risk to existing system}}
- **Mitigation:** {{how risk will be addressed}}
- **Rollback Plan:** {{how to undo changes if needed}}

**Quality Assurance Strategy:**

Proactive quality validation reduces risk to existing systems:

- **CodeRabbit Validation**: All stories include pre-commit reviews
  - Database stories: @db-sage validates schema compliance, service filters, RLS policies
  - API stories: @architect validates contracts, backward compatibility
  - Deployment stories: @github-devops validates configuration, rollback readiness

- **Specialized Expertise**: Agent assignment ensures domain experts review relevant changes
  - Prevents architectural drift
  - Catches integration issues early
  - Validates security considerations
  - Ensures accessibility standards

- **Quality Gates Aligned with Risk**:
  - LOW RISK: Pre-Commit validation only
  - MEDIUM RISK: Pre-Commit + Pre-PR validation
  - HIGH RISK: Pre-Commit + Pre-PR + Pre-Deployment validation

- **Regression Prevention**:
  - Each story includes tasks to verify existing functionality
  - Integration tests validate compatibility
  - Performance testing prevents degradation
  - Feature flags enable safe rollout if needed

**Example Quality Risk Mitigation:**

For an epic adding payment processing:
- Risk: Breaking existing checkout flow
- Quality Mitigation:
  - @db-sage reviews schema changes for payment tables
  - @architect validates API contracts with existing payment gateway
  - Pre-Deployment scan validates no hardcoded secrets
  - Phased rollout: 5% → 25% → 50% → 100% of users
  - Monitoring alerts on transaction failures
  - 1-click rollback procedure documented and tested

#### Definition of Done

- [ ] All stories completed with acceptance criteria met
- [ ] Existing functionality verified through testing
- [ ] Integration points working correctly
- [ ] Documentation updated appropriately
- [ ] No regression in existing features

### 3. Validation Checklist

Before finalizing the epic, ensure:

**Scope Validation:**

- [ ] Epic can be completed in 1-3 stories maximum
- [ ] No architectural documentation is required
- [ ] Enhancement follows existing patterns
- [ ] Integration complexity is manageable

**Risk Assessment:**

- [ ] Risk to existing system is low
- [ ] Rollback plan is feasible
- [ ] Testing approach covers existing functionality
- [ ] Team has sufficient knowledge of integration points

**Completeness Check:**

- [ ] Epic goal is clear and achievable
- [ ] Stories are properly scoped
- [ ] Success criteria are measurable
- [ ] Dependencies are identified

### 4. Handoff to Story Manager

Once the epic is validated, provide this handoff to the Story Manager:

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

## Task Definition (AIOS Task Format V1.0)

```yaml
task: brownfieldCreateEpic()
responsável: Morgan (Strategist)
responsavel_type: Agente
atomic_layer: Organism

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
  - **Source:** .aios-core/core/task-runner.js

- **Tool:** logger
  - **Purpose:** Execution logging and error tracking
  - **Source:** .aios-core/utils/logger.js

---

## Scripts

**Agent-specific code for this task:**

- **Script:** execute-task.js
  - **Purpose:** Generic task execution wrapper
  - **Language:** JavaScript
  - **Location:** .aios-core/scripts/execute-task.js

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
duration_expected: 5-15 min (estimated)
cost_estimated: $0.003-0.010
token_usage: ~3,000-10,000 tokens
```

**Optimization Notes:**
- Break into smaller workflows; implement checkpointing; use async processing where possible

---

## Metadata

```yaml
story: N/A
version: 1.0.0
dependencies:
  - N/A
tags:
  - creation
  - setup
updated_at: 2025-11-17
```

---


**Story Manager Handoff:**

"Please develop detailed user stories for this brownfield epic. Key considerations:

- This is an enhancement to an existing system running {{technology stack}}
- Integration points: {{list key integration points}}
- Existing patterns to follow: {{relevant existing patterns}}
- Critical compatibility requirements: {{key requirements}}
- Each story must include verification that existing functionality remains intact

The epic should maintain system integrity while delivering {{epic goal}}."

---

## Success Criteria

The epic creation is successful when:

1. Enhancement scope is clearly defined and appropriately sized
2. Integration approach respects existing system architecture
3. Risk to existing functionality is minimized
4. Stories are logically sequenced for safe implementation
5. Compatibility requirements are clearly specified
6. Rollback plan is feasible and documented

## Important Notes

- This task is specifically for SMALL brownfield enhancements
- If the scope grows beyond 3 stories, consider the full brownfield PRD process
- Always prioritize existing system integrity over new functionality
- When in doubt about scope or complexity, escalate to full brownfield planning
 