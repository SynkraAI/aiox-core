# AIOX V3 Schemas

> Schema definitions for AIOX agents and tasks with Auto-Claude capabilities.

## Overview

V3 schemas extend the existing V2 format with an `autoClaude` section that enables autonomous development capabilities from the Auto-Claude framework.

## Files

| File                    | Description                       |
| ----------------------- | --------------------------------- |
| `agent-v3-schema.json`  | JSON Schema for agent definitions |
| `task-v3-schema.json`   | JSON Schema for task definitions  |
| `validate-v3-schema.js` | Validation script for V2/V3 files |

## Schema Versions

- **V2 (Legacy)**: Current AIOX format without `autoClaude` section
- **V3 (New)**: Extended format with `autoClaude` capabilities

V3 is **backward compatible** with V2. Migration adds fields without breaking existing functionality.

---

## Agent V3 Schema

### Existing V2 Fields (Preserved)

```yaml
agent:
  name: string # Persona name (e.g., 'Dex')
  id: string # Unique ID (e.g., 'dev')
  title: string # Role title
  icon: string # Emoji icon
  whenToUse: string # Usage guidance
  customization: string|null

persona_profile:
  archetype: string
  zodiac: string
  communication:
    tone: pragmatic|conceptual|analytical|supportive|precise
    emoji_frequency: low|medium|high
    vocabulary: string[]
    greeting_levels:
      minimal: string
      named: string
      archetypal: string
    signature_closing: string

persona:
  role: string
  style: string
  identity: string
  focus: string

core_principles: string[]
commands: Command[]
dependencies:
  tasks: string[]
  templates: string[]
  checklists: string[]
  tools: string[]
```

### New V3 Fields (autoClaude)

```yaml
autoClaude:
  version: '3.0'
  migratedAt: datetime

  # Spec Pipeline capabilities
  specPipeline:
    canGather: boolean # @pm - gather requirements
    canAssess: boolean # @architect - assess complexity
    canResearch: boolean # @analyst - research dependencies
    canWrite: boolean # @pm - write specifications
    canCritique: boolean # @qa - critique specs

  # Execution capabilities
  execution:
    canCreatePlan: boolean # @architect - create implementation.yaml
    canCreateContext: boolean # @architect - generate context files
    canExecute: boolean # @dev - execute subtasks
    canVerify: boolean # @dev, @qa - verify completion
    selfCritique:
      enabled: boolean
      checklistRef: string # Reference to checklist

  # Recovery capabilities
  recovery:
    canTrack: boolean # Track attempts
    canRollback: boolean # Rollback to previous state
    maxAttempts: integer # Default: 3
    stuckDetection: boolean # Enable stuck detection

  # QA capabilities
  qa:
    canReview: boolean # @qa - perform reviews
    canFixRequest: boolean # @qa - create fix requests
    reviewPhases: integer # Default: 10
    maxIterations: integer # Default: 5

  # Memory capabilities
  memory:
    canCaptureInsights: boolean
    canExtractPatterns: boolean
    canDocumentGotchas: boolean

  # Worktree capabilities
  worktree:
    canCreate: boolean # @devops
    canMerge: boolean # @devops
    canCleanup: boolean # @devops
```

### Agent Capability Matrix

| Agent      | specPipeline  | execution                 | recovery        | qa                 | memory          | worktree               |
| ---------- | ------------- | ------------------------- | --------------- | ------------------ | --------------- | ---------------------- |
| @pm        | gather, write | -                         | -               | -                  | -               | -                      |
| @architect | assess        | createPlan, createContext | -               | -                  | -               | -                      |
| @analyst   | research      | -                         | -               | -                  | extractPatterns | -                      |
| @dev       | -             | execute, verify           | track, rollback | -                  | captureInsights | -                      |
| @qa        | critique      | verify                    | -               | review, fixRequest | -               | -                      |
| @devops    | -             | -                         | -               | -                  | -               | create, merge, cleanup |

---

## Task V3 Schema

### Existing V2 Fields (Preserved)

```yaml
# YAML frontmatter
---
templates: string[]
tools: string[]
checklists: string[]
---
# Task definition
task:
  name: string
  responsavel: string
  responsavel_type: Agente|User|System
  atomic_layer: Atom|Molecule|Organism|Template|Page

inputs:
  - campo: string
    tipo: string
    origem: string
    obrigatorio: boolean
    validacao: string

outputs:
  - campo: string
    tipo: string
    destino: string
    persistido: boolean

executionModes:
  yolo: { enabled, prompts, description }
  interactive: { enabled, prompts, description }
  preflight: { enabled, description }
  default: yolo|interactive|preflight

steps:
  - id: string
    description: string
    actions: string[]
    validation: string
    onFailure: halt|retry|skip|escalate
```

### New V3 Fields (autoClaude)

```yaml
autoClaude:
  version: "3.0"
  migratedAt: datetime

  # Execution characteristics
  deterministic: boolean    # Same input = same output
  elicit: boolean          # Requires user interaction
  composable: boolean      # Can be called by other tasks

  # Pipeline classification
  pipelinePhase: enum
    # Spec phases
    - spec-gather
    - spec-assess
    - spec-research
    - spec-write
    - spec-critique
    # Plan phases
    - plan-create
    - plan-context
    - plan-execute
    - plan-verify
    # Recovery phases
    - recovery-track
    - recovery-rollback
    # QA phases
    - qa-review
    - qa-fix
    # Memory phases
    - memory-capture
    - memory-extract
    # Worktree phases
    - worktree-manage
    # General
    - general

  complexity: simple|standard|complex

  # Verification config
  verification:
    type: command|api|browser|e2e|manual|none
    command: string         # Shell command to run
    expectedOutput: string  # Regex pattern
    timeout: integer        # Seconds (default: 30)

  # Self-critique requirements
  selfCritique:
    required: boolean
    checklistRef: string    # e.g., 'self-critique-checklist.md'
    phases: string[]        # Steps where critique runs (e.g., ['5.5', '6.5'])

  # Recovery config
  recovery:
    trackAttempts: boolean
    maxRetries: integer     # Default: 3
    rollbackOnFailure: boolean

  # Context requirements
  contextRequirements:
    projectContext: boolean   # Needs project-context.yaml
    filesContext: boolean     # Needs files-context.yaml
    implementationPlan: boolean
    spec: boolean
```

---

## Validation

### Validate Single File

```bash
node validate-v3-schema.js .aiox-core/development/agents/dev.md
```

### Validate All Files

```bash
node validate-v3-schema.js --all
node validate-v3-schema.js --all --type agent
node validate-v3-schema.js --all --type task
```

### Strict Mode (Require V3)

```bash
node validate-v3-schema.js --all --strict
```

### Show V2 vs V3 Diff

```bash
node validate-v3-schema.js --diff .aiox-core/development/agents/dev.md
```

### JSON Output

```bash
node validate-v3-schema.js --all --json
```

---

## Migration Guide

### Step 1: Check Current Status

```bash
node validate-v3-schema.js --diff .aiox-core/development/agents/dev.md
```

### Step 2: Add autoClaude Section

Add the appropriate `autoClaude` section based on agent role:

```yaml
# Example for @dev agent
autoClaude:
  version: '3.0'
  migratedAt: '2026-01-28T10:00:00Z'

  execution:
    canExecute: true
    canVerify: true
    selfCritique:
      enabled: true
      checklistRef: self-critique-checklist.md

  recovery:
    canTrack: true
    canRollback: true
    maxAttempts: 3
    stuckDetection: true

  memory:
    canCaptureInsights: true
```

### Step 3: Validate

```bash
node validate-v3-schema.js .aiox-core/development/agents/dev.md --strict
```

---

## Related Documents

- PRD: `docs/prd/aiox-autonomous-development-engine.md`
- Auto-Claude Analysis: `docs/architecture/AUTO-CLAUDE-ANALYSIS-COMPLETE.md`
- Migration Stories: `docs/stories/aiox-core-ade/epic-2-migration-v2-v3.md`

---

## Current Status

### Validation Summary (2026-01-28)

| Type   | Total | Valid | V2  | V3  | Errors            |
| ------ | ----- | ----- | --- | --- | ----------------- |
| Agents | 12    | 12    | 12  | 0   | 0                 |
| Tasks  | ~100  | ~60   | ~60 | 0   | ~40 (YAML syntax) |

### Known Issues to Fix Before Migration

**Agent Files:**

- All agents are valid V2, ready for V3 migration
- `qa.md` fixed (YAML syntax with `{scope}` parameters)

**Task Files (need YAML cleanup before migration):**

1. **Values with colons need quotes:**

   ```yaml
   # WRONG
   validação: Default: 1 (0-3)

   # CORRECT
   validação: "Default: 1 (0-3)"
   ```

2. **Markdown formatting inside YAML blocks:**

   ```yaml
   # WRONG (validation script auto-converts these)
   **Entrada:**

   # CORRECT
   inputs:
   ```

3. **Curly braces need quotes (in agent commands):**

   ```yaml
   # WRONG
   - command {arg}: description

   # CORRECT
   - 'command {arg}': description
   ```

### Story 2.3 Acceptance Criteria Status

- [x] AC1: `schemas/agent-v3-schema.json` with Auto-Claude fields
- [x] AC2: `schemas/task-v3-schema.json` updated
- [x] AC3: Backward compatibility with V2 fields
- [x] AC4: Validation script `validate-v3-schema.js`
- [x] AC5: Documentation of each new field in README
- [x] AC6: Diff tool to compare V2 vs V3 (`--diff` flag)

---

## Related Documents

- PRD: `docs/prd/aiox-autonomous-development-engine.md`
- Auto-Claude Analysis: `docs/architecture/AUTO-CLAUDE-ANALYSIS-COMPLETE.md`
- Migration Stories: `docs/stories/aiox-core-ade/epic-2-migration-v2-v3.md`

---

_AIOX V3 Schemas - Synkra Framework_
_Created: 2026-01-28_
_Updated: 2026-01-28 - Added status and known issues_
