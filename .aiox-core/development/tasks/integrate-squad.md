# Integrate with Squad

> Task ID: atlas-integrate-Squad
> Agent: Atlas (Design System Builder)
> Version: 1.0.0

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
task: integrateExpansionPack()
responsável: Dex (Builder)
responsavel_type: Agente
atomic_layer: Molecule

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
duration_expected: 2-5 min (estimated)
cost_estimated: $0.001-0.003
token_usage: ~1,000-3,000 tokens
```

**Optimization Notes:**
- Parallelize independent operations; reuse atom results; implement early exits

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


## Description

Connect design system with MMOS, CreatorOS, or InnerLens squads. Generates pack-specific patterns, token variations, and integration documentation.

## Prerequisites

- Design system setup complete
- Components built
- Target squad installed

## Workflow

### Steps

1. **Detect Target Pack** - Identify MMOS, CreatorOS, or InnerLens
2. **Load Pack Requirements** - Read pack-specific pattern needs
3. **Generate Token Variations** - Personality/theme-based tokens
4. **Generate Pack-Specific Patterns** - Custom components for pack
5. **Create Integration Hooks** - Connect pack workflows
6. **Generate Integration Docs** - Usage guide for pack
7. **Test Integration** - Validate pack can use patterns
8. **Update State** - Track integration completion

## Output

- Pack-specific components
- Token variations
- Integration documentation
- Example usage

## Success Criteria

- [ ] Pack can import and use design system
- [ ] Token variations work correctly
- [ ] Pack-specific patterns functional
- [ ] Integration documented
- [ ] No regressions in pack functionality

## Examples

### MMOS Integration

```typescript
// Personality token variations
{
  formal: {
    fontFamily: 'var(--font-serif)',
    spacing: 'var(--space-formal)',
    colorPrimary: 'var(--color-corporate)'
  },
  casual: {
    fontFamily: 'var(--font-sans)',
    spacing: 'var(--space-relaxed)',
    colorPrimary: 'var(--color-friendly)'
  }
}

// CloneChatInterface component
<CloneChatInterface
  personality="formal"
  tokens={personalityTokens.formal}
/>
```

### CreatorOS Integration

```typescript
// Educational token variations
{
  fonts: 'readable (18px)',
  lineHeight: '1.6 (comprehension)',
  spacing: 'generous',
  colors: 'highlight focus'
}

// CourseVideoPlayer component
<CourseVideoPlayer
  tokens={educationalTokens}
  accessibility="WCAG AAA"
/>
```

### InnerLens Integration

```typescript
// Minimal distraction tokens
{
  colors: 'neutral, minimal',
  layout: 'clean, focused',
  spacing: 'balanced'
}

// AssessmentForm component
<AssessmentForm
  tokens={minimalTokens}
  validationUI={systemValidation}
/>
```

## Notes

- Each pack has unique requirements
- Token variations maintain consistency
- Pack-specific components extend base system
- Integration is bidirectional (pack ↔ design system)
- Document in pack's README
