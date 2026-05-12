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
task: createBrownfieldStory()
responsável: Pax (Balancer)
responsavel_type: Agente
atomic_layer: Organism

**Entrada:**
- campo: name
  tipo: string
  origem: User Input
  obrigatório: true
  validação: Must be non-empty, lowercase, kebab-case

- campo: options
  tipo: object
  origem: User Input
  obrigatório: false
  validação: Valid JSON object with allowed keys

- campo: force
  tipo: boolean
  origem: User Input
  obrigatório: false
  validação: Default: false

**Saída:**
- campo: created_file
  tipo: string
  destino: File system
  persistido: true

- campo: validation_report
  tipo: object
  destino: Memory
  persistido: false

- campo: success
  tipo: boolean
  destino: Return value
  persistido: false
```

---

## Pre-Conditions

**Purpose:** Validate prerequisites BEFORE task execution (blocking)

**Checklist:**

```yaml
pre-conditions:
  - [ ] Target does not already exist; required inputs provided; permissions granted
    tipo: pre-condition
    blocker: true
    validação: |
      Check target does not already exist; required inputs provided; permissions granted
    error_message: "Pre-condition failed: Target does not already exist; required inputs provided; permissions granted"
```

---

## Post-Conditions

**Purpose:** Validate execution success AFTER task completes

**Checklist:**

```yaml
post-conditions:
  - [ ] Resource created successfully; validation passed; no errors logged
    tipo: post-condition
    blocker: true
    validação: |
      Verify resource created successfully; validation passed; no errors logged
    error_message: "Post-condition failed: Resource created successfully; validation passed; no errors logged"
```

---

## Acceptance Criteria

**Purpose:** Definitive pass/fail criteria for task completion

**Checklist:**

```yaml
acceptance-criteria:
  - [ ] Resource exists and is valid; no duplicate resources created
    tipo: acceptance-criterion
    blocker: true
    validação: |
      Assert resource exists and is valid; no duplicate resources created
    error_message: "Acceptance criterion not met: Resource exists and is valid; no duplicate resources created"
```

---

## Tools

**External/shared resources used by this task:**

- **Tool:** component-generator
  - **Purpose:** Generate new components from templates
  - **Source:** .aiox-core/scripts/component-generator.js

- **Tool:** file-system
  - **Purpose:** File creation and validation
  - **Source:** Node.js fs module

---

## Scripts

**Agent-specific code for this task:**

- **Script:** create-component.js
  - **Purpose:** Component creation workflow
  - **Language:** JavaScript
  - **Location:** .aiox-core/scripts/create-component.js

---

## Error Handling

**Strategy:** retry

**Common Errors:**

1. **Error:** Resource Already Exists
   - **Cause:** Target file/resource already exists in system
   - **Resolution:** Use force flag or choose different name
   - **Recovery:** Prompt user for alternative name or force overwrite

2. **Error:** Invalid Input
   - **Cause:** Input name contains invalid characters or format
   - **Resolution:** Validate input against naming rules (kebab-case, lowercase, no special chars)
   - **Recovery:** Sanitize input or reject with clear error message

3. **Error:** Permission Denied
   - **Cause:** Insufficient permissions to create resource
   - **Resolution:** Check file system permissions, run with elevated privileges if needed
   - **Recovery:** Log error, notify user, suggest permission fix

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

tools:
  - github-cli
checklists:
  - po-master-checklist.md
---

# Create Brownfield Story Task

## Purpose

Create detailed, implementation-ready stories for brownfield projects where traditional sharded PRD/architecture documents may not exist. This task bridges the gap between various documentation formats (document-project output, brownfield PRDs, epics, or user documentation) and executable stories for the Dev agent.

## When to Use This Task

**Use this task when:**

- Working on brownfield projects with non-standard documentation
- Stories need to be created from document-project output
- Working from brownfield epics without full PRD/architecture
- Existing project documentation doesn't follow AIOX v4+ structure
- Need to gather additional context from user during story creation

**Use create-next-story when:**

- Working with properly sharded PRD and v4 architecture documents
- Following standard greenfield or well-documented brownfield workflow
- All technical context is available in structured format

## Task Execution Instructions

### 0. Documentation Context

Check for available documentation in this order:

1. **Sharded PRD/Architecture** (docs/prd/, docs/architecture/)
   - If found, recommend using create-next-story task instead

2. **Brownfield Architecture Document** (docs/brownfield-architecture.md or similar)
   - Created by document-project task
   - Contains actual system state, technical debt, workarounds

3. **Brownfield PRD** (docs/prd.md)
   - May contain embedded technical details

4. **Epic Files** (docs/epics/ or similar)
   - Created by brownfield-create-epic task

5. **User-Provided Documentation**
   - Ask user to specify location and format

### 1. Story Identification and Context Gathering

#### 1.1 Identify Story Source

Based on available documentation:

- **From Brownfield PRD**: Extract stories from epic sections
- **From Epic Files**: Read epic definition and story list
- **From User Direction**: Ask user which specific enhancement to implement
- **No Clear Source**: Work with user to define the story scope

#### 1.2 Gather Essential Context

CRITICAL: For brownfield stories, you MUST gather enough context for safe implementation. Be prepared to ask the user for missing information.

**Required Information Checklist:**

- [ ] What existing functionality might be affected?
- [ ] What are the integration points with current code?
- [ ] What patterns should be followed (with examples)?
- [ ] What technical constraints exist?
- [ ] Are there any "gotchas" or workarounds to know about?

If any required information is missing, list the missing information and ask the user to provide it.

### 2. Extract Technical Context from Available Sources

#### 2.1 From Document-Project Output

If using brownfield-architecture.md from document-project:

- **Technical Debt Section**: Note any workarounds affecting this story
- **Key Files Section**: Identify files that will need modification
- **Integration Points**: Find existing integration patterns
- **Known Issues**: Check if story touches problematic areas
- **Actual Tech Stack**: Verify versions and constraints

## Configuration Dependencies

This task requires the following configuration keys from `core-config.yaml`:

- **`qaLocation`**: QA output directory (typically docs/qa) - Required to write quality reports

**Loading Config:**
```javascript
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '../../.aiox-core/core-config.yaml');
const config = yaml.load(fs.readFileSync(configPath, 'utf8'));

const qaLocation = config.qa?.qaLocation || 'docs/qa';
```

#### 2.2 From Brownfield PRD

If using brownfield PRD:

- **Technical Constraints Section**: Extract all relevant constraints
- **Integration Requirements**: Note compatibility requirements
- **Code Organization**: Follow specified patterns
- **Risk Assessment**: Understand potential impacts

#### 2.3 From User Documentation

Ask the user to help identify:

- Relevant technical specifications
- Existing code examples to follow
- Integration requirements
- Testing approaches used in the project

### 3. Story Creation with Progressive Detail Gathering

#### 3.1 Create Initial Story Structure

Start with the story template, filling in what's known:

```markdown
# Story {{Enhancement Title}}

## Status: Draft

## Story

As a {{user_type}},
I want {{enhancement_capability}},
so that {{value_delivered}}.

## Context Source

- Source Document: {{document name/type}}
- Enhancement Type: {{single feature/bug fix/integration/etc}}
- Existing System Impact: {{brief assessment}}
```

#### 3.2 Develop Acceptance Criteria

Critical: For brownfield, ALWAYS include criteria about maintaining existing functionality

Standard structure:

1. New functionality works as specified
2. Existing {{affected feature}} continues to work unchanged  
3. Integration with {{existing system}} maintains current behavior
4. No regression in {{related area}}
5. Performance remains within acceptable bounds

#### 3.3 Gather Technical Guidance

Critical: This is where you'll need to be interactive with the user if information is missing

Create Dev Technical Guidance section with available information:

```markdown
## Dev Technical Guidance

### Existing System Context
[Extract from available documentation]

### Integration Approach
[Based on patterns found or ask user]

### Technical Constraints
[From documentation or user input]

### Missing Information

Critical: List anything you couldn't find that dev will need and ask for the missing information

### 4. Task Generation with Safety Checks

#### 4.1 Generate Implementation Tasks

Based on gathered context, create tasks that:

- Include exploration tasks if system understanding is incomplete
- Add verification tasks for existing functionality
- Include rollback considerations
- Reference specific files/patterns when known

Example task structure for brownfield:

```markdown
## Tasks / Subtasks

- [ ] Task 1: Analyze existing {{component/feature}} implementation
  - [ ] Review {{specific files}} for current patterns
  - [ ] Document integration points
  - [ ] Identify potential impacts

- [ ] Task 2: Implement {{new functionality}}
  - [ ] Follow pattern from {{example file}}
  - [ ] Integrate with {{existing component}}
  - [ ] Maintain compatibility with {{constraint}}

- [ ] Task 3: Verify existing functionality
  - [ ] Test {{existing feature 1}} still works
  - [ ] Verify {{integration point}} behavior unchanged
  - [ ] Check performance impact

- [ ] Task 4: Add tests
  - [ ] Unit tests following {{project test pattern}}
  - [ ] Integration test for {{integration point}}
  - [ ] Update existing tests if needed
```

#### 4.4 Predict Quality Requirements and Agent Assignment

**CRITICAL FOR BROWNFIELD:** This step populates the `🤖 CodeRabbit Integration` section with brownfield-specific quality gates. Brownfield stories have HIGHER RISK due to integration complexity, so quality planning is essential.

**Integration Point Analysis:**

Analyze the story's integration risks based on:
- What existing functionality will be modified?
- How many integration points are affected?
- Is this touching core/critical functionality?
- What is the blast radius of potential bugs?

**Brownfield-Specific Agent Assignment Rules:**

**If modifying existing database:**
- **Assign**: @db-sage, @dev
- **Rationale**: Database changes in brownfield require expert review for:
  - Existing data migration impacts
  - RLS policy compatibility
  - Index performance on existing data
  - Foreign key constraint conflicts
- **Quality Gates**: Pre-Commit (schema validation), Pre-PR (SQL review), Pre-Deployment (migration testing)

**If changing existing APIs:**
- **Assign**: @architect, @dev
- **Rationale**: API changes risk breaking existing clients:
  - Backward compatibility validation
  - Contract versioning requirements
  - Breaking change identification
  - Client impact assessment
- **Quality Gates**: Pre-Commit (contract validation), Pre-PR (backward compat check)

**If touching deployment/infrastructure:**
- **Assign**: @github-devops, @dev
- **Rationale**: Infrastructure changes need rollback safety:
  - Environment-specific configuration validation
  - Rollback procedure verification
  - Zero-downtime deployment planning
  - Feature flag implementation if needed
- **Quality Gates**: Pre-Commit (config validation), Pre-Deployment (deep scan with rollback plan)

**If affecting existing UI/UX:**
- **Assign**: @ux-expert, @dev
- **Rationale**: UI changes must maintain user experience consistency:
  - Design system compliance
  - Accessibility standards maintained
  - User workflow continuity
  - Browser compatibility preserved
- **Quality Gates**: Pre-Commit (a11y validation), Pre-PR (UX consistency check)

**Risk-Based Quality Gate Determination:**

**HIGH RISK** (affects core functionality, many integration points, production-critical):
- **Quality Gates**: Pre-Commit + Pre-PR + Pre-Deployment
- **Additional Requirements**:
  - Feature flag implementation recommended
  - Phased rollout strategy
  - Detailed rollback procedure
  - Monitoring and alerting plan
- **Focus Areas**:
  - Regression prevention (existing functionality MUST work)
  - Integration safety (new code doesn't break old code)
  - Rollback readiness (changes are reversible)
  - Performance impact (no degradation to existing features)

**MEDIUM RISK** (new feature with isolated scope, some integration):
- **Quality Gates**: Pre-Commit + Pre-PR
- **Additional Requirements**:
  - Integration testing with existing features
  - Unit tests for new and affected code
  - Documentation updates
- **Focus Areas**:
  - Integration points validated
  - Existing patterns followed
  - Error handling comprehensive

**LOW RISK** (documentation, tests only, isolated bug fix):
- **Quality Gates**: Pre-Commit
- **Additional Requirements**:
  - Standard code review
  - Basic testing
- **Focus Areas**:
  - Code quality standards
  - Documentation clarity

**CodeRabbit Focus for Brownfield:**

Regardless of story type, ALL brownfield stories must include these focus areas:

```yaml
🤖 CodeRabbit Integration:

  Story Type Analysis:
    Primary Type: [Database|API|Frontend|Deployment|Security|Integration]
    Secondary Type(s): [Additional types]
    Complexity: [Low|Medium|High]
    Risk Level: [LOW RISK|MEDIUM RISK|HIGH RISK] ← Brownfield-specific
    Integration Points: [List of systems/components affected] ← Brownfield-specific

  Specialized Agent Assignment:
    Primary Agents:
      - @dev (always required)
      - @[integration-specific-agent] (based on affected systems)

    Supporting Agents:
      - @[supporting-agent-1] (if multiple systems)
      - @[supporting-agent-2] (if cross-cutting concerns)

  Quality Gate Tasks:
    - [ ] Pre-Commit (@dev): Run `coderabbit --prompt-only -t uncommitted` before story complete
    - [ ] Pre-PR (@github-devops): Run `coderabbit --prompt-only --base main` before PR creation
    - [ ] Pre-Deployment (@github-devops): Run `coderabbit --prompt-only -t committed --base HEAD~10` before production deploy (HIGH RISK stories only)

  CodeRabbit Focus Areas:
    Primary Focus (Brownfield-Specific):
      - Regression prevention: Existing functionality preserved
      - Integration safety: New code doesn't break existing code
      - Rollback readiness: Changes are reversible
      - [Type-specific focus from detection rules]

    Secondary Focus:
      - [Type-specific focus areas]
      - Performance impact: No degradation to existing features
      - Error handling: Graceful degradation for integration failures
```

**Brownfield Example (HIGH RISK Database + API Story):**

```yaml
🤖 CodeRabbit Integration:

  Story Type Analysis:
    Primary Type: Database
    Secondary Type(s): API
    Complexity: High (schema changes + multiple API endpoints)
    Risk Level: HIGH RISK (affects core payment processing functionality)
    Integration Points:
      - Payment service API
      - Transaction database tables
      - External payment gateway webhook
      - User notification system

  Specialized Agent Assignment:
    Primary Agents:
      - @dev (pre-commit reviews)
      - @db-sage (schema changes, RLS policies, existing data migration)
      - @architect (API contract changes, backward compatibility)

    Supporting Agents:
      - @github-devops (phased rollout, rollback procedure)

  Quality Gate Tasks:
    - [ ] Pre-Commit (@dev): Run before story complete
    - [ ] Pre-PR (@github-devops): Run before PR creation
    - [ ] Pre-Deployment (@github-devops): Run before production deploy with rollback plan validation

  CodeRabbit Focus Areas:
    Primary Focus (Brownfield-Specific):
      - Regression prevention: Existing payment flows MUST work identically
      - Integration safety: New schema compatible with existing queries
      - Rollback readiness: Migration reversible without data loss
      - Service filters on ALL queries (.eq('service', 'ttcx'))
      - Schema compliance with existing patterns

    Secondary Focus:
      - API backward compatibility: v1 clients still supported
      - Performance: No degradation to existing payment processing
      - Error handling: Graceful fallback for gateway failures
      - RLS policies: Consistent with existing security model
      - Migration testing: Validated on copy of production data structure
```

**Integration-Specific Considerations:**

When story involves specific integration patterns:

**Database Integration:**
- Focus: Existing data compatibility, migration safety, RLS policy consistency
- Validation: Run migration on production-like data, verify all existing queries still work

**API Integration:**
- Focus: Contract versioning, backward compatibility, client impact assessment
- Validation: Integration tests with existing API clients, contract testing

**Frontend Integration:**
- Focus: User workflow continuity, design system compliance, accessibility preservation
- Validation: Visual regression testing, user acceptance testing on existing flows

**External System Integration:**
- Focus: Graceful degradation, retry logic, error handling, monitoring
- Validation: Failure scenario testing, circuit breaker validation

**Log Completion:**
- After populating this section, log: "✅ Brownfield story analysis complete: [Primary Type] | Risk Level: [RISK] | Integration Points: [count] | Agents assigned: [agent list]"

### 5. Risk Assessment and Mitigation

CRITICAL: for brownfield - always include risk assessment

Add section for brownfield-specific risks:

```markdown
## Risk Assessment

### Implementation Risks
- **Primary Risk**: {{main risk to existing system}}
- **Mitigation**: {{how to address}}
- **Verification**: {{how to confirm safety}}

### Rollback Plan
- {{Simple steps to undo changes if needed}}

### Safety Checks
- [ ] Existing {{feature}} tested before changes
- [ ] Changes can be feature-flagged or isolated
- [ ] Rollback procedure documented
```

### 6. Final Story Validation

Before finalizing:

1. **Completeness Check**:
   - [ ] Story has clear scope and acceptance criteria
   - [ ] Technical context is sufficient for implementation
   - [ ] Integration approach is defined
   - [ ] Risks are identified with mitigation

2. **Safety Check**:
   - [ ] Existing functionality protection included
   - [ ] Rollback plan is feasible
   - [ ] Testing covers both new and existing features

3. **Information Gaps**:
   - [ ] All critical missing information gathered from user
   - [ ] Remaining unknowns documented for dev agent
   - [ ] Exploration tasks added where needed

### 7. Story Output Format

Save the story with appropriate naming:

- If from epic: `docs/stories/epic-{n}-story-{m}.md`
- If standalone: `docs/stories/brownfield-{feature-name}.md`
- If sequential: Follow existing story numbering

Include header noting documentation context:

```markdown
# Story: {{Title}}

<!-- Source: {{documentation type used}} -->
<!-- Context: Brownfield enhancement to {{existing system}} -->

## Status: Draft
[Rest of story content...]
```

### 8. Handoff Communication

Provide clear handoff to the user:

```text
Brownfield story created: {{story title}}

Source Documentation: {{what was used}}
Story Location: {{file path}}

Key Integration Points Identified:
- {{integration point 1}}
- {{integration point 2}}

Risks Noted:
- {{primary risk}}

{{If missing info}}: 
Note: Some technical details were unclear. The story includes exploration tasks to gather needed information during implementation.

Next Steps:
1. Review story for accuracy
2. Verify integration approach aligns with your system
3. Approve story or request adjustments
4. Dev agent can then implement with safety checks
```

## Success Criteria

The brownfield story creation is successful when:

1. Story can be implemented without requiring dev to search multiple documents
2. Integration approach is clear and safe for existing system
3. All available technical context has been extracted and organized
4. Missing information has been identified and addressed
5. Risks are documented with mitigation strategies
6. Story includes verification of existing functionality
7. Rollback approach is defined

## Important Notes

- This task is specifically for brownfield projects with non-standard documentation
- Always prioritize existing system stability over new features
- When in doubt, add exploration and verification tasks
- It's better to ask the user for clarification than make assumptions
- Each story should be self-contained for the dev agent
- Include references to existing code patterns when available
 