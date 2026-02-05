# AIOS Workflows Guide

**Version:** 1.0.0
**Last Updated:** 2026-02-02
**Status:** Active

---

## Overview

AIOS Workflows are orchestrated sequences of agent activities that automate complex development processes. They provide structured, repeatable patterns for common development scenarios.

### Key Concepts

| Concept | Description |
|---------|-------------|
| **Workflow** | A YAML definition that orchestrates multiple agents through a sequence of steps |
| **Phase** | A logical grouping of related steps within a workflow |
| **Step** | A single action performed by an agent within a workflow |
| **Transition** | Movement from one step to the next, optionally with conditions |
| **State** | Persistent tracking of workflow progress across sessions |

---

## Workflow Types

### By Project Type

| Type | Description | Use Case |
|------|-------------|----------|
| **Greenfield** | New projects from scratch | Starting a new application |
| **Brownfield** | Existing projects | Enhancing or auditing existing code |
| **Generic** | Any project type | Cross-cutting processes like story development |

### By Scope

| Scope | Description | Examples |
|-------|-------------|----------|
| **Fullstack** | Complete application | `greenfield-fullstack`, `brownfield-fullstack` |
| **UI** | Frontend only | `greenfield-ui`, `brownfield-ui` |
| **Service** | Backend only | `greenfield-service`, `brownfield-service` |
| **Discovery** | Analysis and audit | `brownfield-discovery` |

---

## Available Workflows

### Core Development Workflows

#### 1. Story Development Cycle
**ID:** `story-development-cycle`
**Type:** Generic
**Agents:** SM → PO → Dev → QA

The most common workflow for iterative development:

```
┌─────────────────────────────────────────────────────────────┐
│                   Story Development Cycle                    │
│                                                              │
│  @sm: Create Story → @po: Validate → @dev: Implement → @qa  │
│         │                  │               │            │    │
│         ▼                  ▼               ▼            ▼    │
│     Draft Story       10 Checks       Code + Tests    Gate   │
└─────────────────────────────────────────────────────────────┘
```

**Phases:**
1. **Story Creation** - SM creates the next story from backlog
2. **Story Validation** - PO validates with 10-point checklist
3. **Implementation** - Dev implements with tests
4. **QA Review** - QA runs quality gate

**When to use:**
- Any story development (greenfield or brownfield)
- Complete cycle with validation and quality gate
- When you need process traceability

---

#### 2. Greenfield Fullstack
**ID:** `greenfield-fullstack`
**Type:** Greenfield
**Agents:** DevOps → Analyst → PM → UX → Architect → PO → SM → Dev → QA

Complete workflow for new full-stack applications:

**Phases:**
1. **Environment Bootstrap** - DevOps sets up project infrastructure
2. **Discovery & Planning** - Create project brief, PRD, specs, architecture
3. **Document Sharding** - Break down docs for development
4. **Development Cycle** - Iterative story implementation

**When to use:**
- Building production-ready applications
- Multiple team members involved
- Complex feature requirements
- Long-term maintenance expected

---

#### 3. Brownfield Discovery
**ID:** `brownfield-discovery`
**Type:** Brownfield
**Agents:** Architect → Data Engineer → UX → QA → Analyst → PM

Complete technical debt assessment for existing projects:

**Phases:**
1. **Data Collection** - System, database, frontend documentation
2. **Initial Consolidation** - Draft assessment
3. **Specialist Validation** - DB, UX, QA reviews
4. **Final Reports** - Assessment + Executive report
5. **Planning** - Epic and stories creation

**When to use:**
- Migrating from Lovable/v0.dev
- Complete codebase audit
- Technical debt assessment before investment

---

### Other Workflows

| Workflow | ID | Description |
|----------|-------|-------------|
| Greenfield UI | `greenfield-ui` | Frontend-only new projects |
| Greenfield Service | `greenfield-service` | Backend-only new projects |
| Brownfield Fullstack | `brownfield-fullstack` | Enhancing existing fullstack apps |
| Brownfield UI | `brownfield-ui` | Enhancing existing frontends |
| Brownfield Service | `brownfield-service` | Enhancing existing backends |
| QA Loop | `qa-loop` | Quality assurance cycle |
| Spec Pipeline | `spec-pipeline` | Specification refinement |
| Design System Build | `design-system-build-quality` | Design system creation |

---

## How to Create a Workflow

### Step 1: Plan Your Workflow

Define:
- **Purpose**: What problem does this workflow solve?
- **Agents**: Which agents participate?
- **Sequence**: What is the order of steps?
- **Conditions**: Are there decision points or parallel activities?

### Step 2: Use the Create Workflow Task

```bash
# Activate an agent that can create workflows
@architect

# Run the create workflow task
*create-workflow
```

### Step 3: Answer Elicitation Questions

The task will ask:

1. **Target Context**: `core`, `squad`, or `hybrid`
2. **Workflow Name**: e.g., `feature-development`
3. **Primary Goal**: What is the expected outcome?
4. **Stages/Phases**: Main phases of the workflow
5. **Agent Orchestration**: Which agents at each stage
6. **Resource Requirements**: Templates, data files needed

### Step 4: Workflow Structure

The generated workflow follows this structure:

```yaml
workflow:
  id: my-workflow
  name: My Custom Workflow
  version: "1.0"
  description: "Description of what this workflow does"
  type: greenfield | brownfield | generic
  project_types:
    - web-app
    - saas

  metadata:
    elicit: true
    confirmation_required: true

  phases:
    - phase_1: Phase Name
    - phase_2: Another Phase

  sequence:
    - step: step_name
      id: unique-id
      phase: 1
      agent: agent-name
      action: Action description
      creates: output-file.md
      requires: previous-step-id
      optional: false
      notes: |
        Detailed instructions for this step...
      next: next-step-id

  flow_diagram: |
    ```mermaid
    graph TD
      A[Start] --> B[Step 1]
      B --> C[Step 2]
    ```

  decision_guidance:
    when_to_use:
      - Scenario 1
      - Scenario 2
    when_not_to_use:
      - Anti-pattern 1

  handoff_prompts:
    step1_complete: "Step 1 done. Next: @agent for step 2"
```

### Step 5: Output Location

Workflows are saved based on context:
- **Core**: `.aios-core/development/workflows/{name}.yaml`
- **Squad**: `squads/{squad}/workflows/{name}.yaml`
- **Hybrid**: `squads/{squad}/workflows/{name}.yaml`

---

## How to Run a Workflow

### Method 1: Guided Mode (Default)

```bash
# Start a workflow
*run-workflow story-development-cycle start

# Check status
*run-workflow story-development-cycle status

# Continue to next step
*run-workflow story-development-cycle continue

# Skip optional step
*run-workflow story-development-cycle skip

# Abort workflow
*run-workflow story-development-cycle abort
```

### Method 2: Engine Mode

```bash
# Run with full engine automation
*run-workflow greenfield-fullstack start --mode engine
```

### Workflow State

State is persisted in `.aios/{instance-id}-state.yaml`:

```yaml
instance_id: "wf-abc123"
workflow_name: "story-development-cycle"
status: "active"
current_step: 2
total_steps: 4
steps:
  - id: create
    status: completed
    completed_at: "2026-02-02T10:00:00Z"
  - id: validate
    status: in_progress
  - id: implement
    status: pending
  - id: review
    status: pending
```

### Multi-Session Continuity

Workflows persist across Claude Code sessions:

1. User starts new session
2. Activates @aios-master
3. Runs `*run-workflow {name} continue`
4. System loads state, shows current step
5. User executes step
6. Returns and runs `continue` again

---

## Workflow Patterns

AIOS detects common workflow patterns based on command history:

### Detected Patterns

| Pattern | Trigger Commands | Agent Sequence |
|---------|-----------------|----------------|
| Story Development | `validate-story-draft`, `develop`, `review-qa` | PO → Dev → QA → DevOps |
| Epic Creation | `create-epic`, `create-story`, `validate-story-draft` | PO → SM → Architect |
| Architecture Review | `analyze-impact`, `create-doc`, `review-proposal` | Architect → QA → Dev |
| Git Workflow | `pre-push-quality-gate`, `github-pr-automation` | Dev → DevOps |
| Database Workflow | `db-domain-modeling`, `db-schema-audit` | Data Engineer → Dev → QA |

### Pattern Detection

The system uses `workflow-patterns.yaml` to:
- Detect which workflow you're in based on commands used
- Suggest next steps with confidence scores
- Provide contextual handoff messages

---

## Best Practices

### Workflow Design

1. **Keep phases focused** - Each phase should have a clear purpose
2. **Define clear handoffs** - Document what each agent passes to the next
3. **Include optional steps** - Allow flexibility for simple cases
4. **Add decision guidance** - Help users know when to use/not use

### Workflow Execution

1. **Start with status** - Check `*run-workflow {name} status` before continuing
2. **Follow handoff prompts** - They contain important context
3. **Don't skip required steps** - Only optional steps can be skipped
4. **Document decisions** - Keep notes for future reference

### Workflow Creation

1. **Test with simple cases first** - Validate the flow works
2. **Include flow diagrams** - Visual representation helps understanding
3. **Add detailed notes** - Future users will thank you
4. **Define error handling** - What happens when things go wrong?

---

## Workflow vs Task

| Aspect | Workflow | Task |
|--------|----------|------|
| **Scope** | Multiple steps, multiple agents | Single step, single agent |
| **State** | Persisted across sessions | Stateless |
| **Use Case** | Complex processes | Atomic operations |
| **Location** | `.aios-core/development/workflows/` | `.aios-core/development/tasks/` |

---

## Troubleshooting

### Common Issues

**Workflow not found:**
```
Error: Workflow '{name}' not found
```
- Check the workflow name matches the file ID
- Verify the target context (core/squad)

**No active instance:**
```
Error: No active workflow instance found
```
- Start the workflow first with `*run-workflow {name} start`

**Step not optional:**
```
Error: Cannot skip non-optional step
```
- Complete the step or abort the workflow

### Getting Help

```bash
# List available workflows
ls .aios-core/development/workflows/

# Validate a workflow
*validate-workflow {name}

# View workflow details
cat .aios-core/development/workflows/{name}.yaml
```

---

## Detailed Workflow Documentation

For complete documentation for each workflow, including detailed step-by-step guides, flowcharts, and implementation details, see:

- [AIOS Workflows](../aios-workflows/README.md) - Complete documentation for each workflow

---

## Related Documentation

- [HybridOps Workflow Diagram](./hybridOps/workflow-diagram.md) - Human-agent collaboration patterns
- [Agent Reference Guide](../agent-reference-guide.md) - Available agents and their capabilities
- [Story-Driven Development](./user-guide.md#story-driven-development) - The story workflow

---

*AIOS Workflows Guide v1.0 - Orchestrating AI-Human Collaboration*
