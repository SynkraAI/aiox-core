# {Task Name}

**Task ID:** `{task-identifier}`
**Version:** {X.Y.Z}
**Status:** {Draft|Active|Deprecated}

---

## Purpose

{Brief description of what this task does and when to use it}

---

## Execution Modes

**Choose your execution mode** (if applicable for this task):

### 1. YOLO Mode - Fast, Autonomous (0-1 prompts)
- Autonomous decision making with logging
- Minimal user interaction
- **Best for:** Experienced developers, simple tasks, time-sensitive work

### 2. Interactive Mode - Balanced, Educational (5-10 prompts) **[DEFAULT]**
- Explicit decision checkpoints
- Educational explanations
- **Best for:** Learning, complex decisions, collaborative work

### 3. Pre-Flight Planning - Comprehensive Upfront Planning
- Task analysis phase (identify all ambiguities)
- Questionnaire before execution
- Zero ambiguity execution
- **Best for:** Ambiguous requirements, critical work, team consensus needed

**Parameter:** `mode` (optional, default: `interactive`)

**Valid values:** `yolo`, `interactive`, `preflight`

**Note:** For simple, deterministic tasks (e.g., load config, validate schema), execution mode may not apply. Mode selection is most valuable for tasks involving creativity, decisions, or ambiguity.

---

## Task Definition (AIOX Task Format V1.0)

```yaml
task: {taskIdentifier()}
responsável: {AgentName}          # Agent executing this task (e.g., Dex, Quinn, Pax)
responsavel_type: Agente          # Open-source: always "Agente" (Worker/Humano/Clone for services only)
atomic_layer: {Layer}             # Atom|Molecule|Organism|Template|Page|Config|Strategy|Content|Media|Layout|Analysis (optional for open-source)

**Entrada:**
- campo: {fieldName}
  tipo: {type}                    # string | number | boolean | array<type> | object { key: type }
  origem: {source}                # Step X ({stepName}) | User Input | config | {agent-id} output
  obrigatório: {true|false}
  padrão: {defaultValue}          # Optional: default if not provided
  validação: {validationRule}     # Optional: validation logic

- campo: {fieldName2}
  tipo: {type}
  origem: {source}
  obrigatório: {true|false}

**Saída:**
- campo: {fieldName}
  tipo: {type}
  destino: {destination}          # Step Y ({stepName}) | state | output | multiple steps
  persistido: {true|false}        # Saved to file/DB or memory-only
  cache_key: {key}                # Optional: if cacheable

- campo: {fieldName2}
  tipo: {type}
  destino: {destination}
  persistido: {true|false}
```

---

## Pre-Conditions

**Purpose:** Validate prerequisites BEFORE task execution (blocking)

**Checklist:**

```yaml
pre-conditions:
  - [ ] {condition_description}
    tipo: pre-condition
    blocker: true
    validação: |
      {executable_validation_logic}
    error_message: "{message_if_fails}"

  - [ ] {condition_description_2}
    tipo: pre-condition
    blocker: true
    validação: "{simple_check}"
    error_message: "{message}"
```

**Examples:**

```yaml
pre-conditions:
  - [ ] Input file exists and is readable
    tipo: pre-condition
    blocker: true
    validação: |
      const fs = require('fs');
      if (!fs.existsSync(inputPath)) {
        throw new Error(`File not found: ${inputPath}`);
      }
    error_message: "Required input file not found"

  - [ ] Agent has required tools available
    tipo: pre-condition
    blocker: true
    validação: "expect(agent.tools).toContain('tool-name')"
    error_message: "Agent missing required tool: tool-name"
```

---

## Workflow

### Mode: YOLO (Autonomous)

**Execution:**
1. Read task definition
2. Validate pre-conditions automatically
3. Execute workflow with autonomous decisions
4. Log all decisions to `.ai/decision-log-{task-id}.md`
5. Validate post-conditions automatically
6. Return standardized output

**Decision Logging:**
```markdown
## Decision: {Title}
**Context:** {What problem}
**Options:** [{Option A}, {Option B}]
**Selected:** {Option}
**Rationale:** {Why}
**Timestamp:** {ISO 8601}
```

**User Prompts:** 0-1 (only if blocking issue)

---

### Mode: Interactive (Balanced) **[DEFAULT]**

**Execution:**
1. Read task definition
2. Present summary to user
3. Validate pre-conditions with user
4. Execute workflow with decision checkpoints
5. Prompt user at each decision point
6. Explain options and trade-offs
7. Validate post-conditions with user
8. Return standardized output

**Decision Checkpoints:**
- {Decision point 1 description}
- {Decision point 2 description}
- {Decision point 3 description}

**Educational Explanations:**
- Before decision: Explain options and trade-offs
- After decision: Explain why it's a good fit
- During execution: Explain what's happening and why

**User Prompts:** 5-10

---

### Mode: Pre-Flight Planning (Comprehensive)

**Execution:**
1. **Analysis Phase:**
   - Read task definition completely
   - Identify ALL ambiguities and decision points
   - Generate comprehensive questionnaire

2. **Questionnaire Phase:**
   - Present all questions to user at once
   - Collect all responses in batch
   - Create detailed execution plan

3. **Approval Phase:**
   - Present execution plan to user
   - Wait for user confirmation
   - Proceed only after approval

4. **Zero-Ambiguity Execution:**
   - Execute with full context from questionnaire
   - No additional decision points
   - Validate all conditions
   - Return standardized output

**User Prompts:** All upfront (questionnaire), then 0 during execution

---

## Step-by-Step Execution

### Step 1: {Step Name}

**Purpose:** {What this step accomplishes}

**Actions:**
1. {Action 1}
2. {Action 2}
3. {Action 3}

**Validation:**
- {Validation check 1}
- {Validation check 2}

**Personality Injection (if applicable):**

```javascript
// Use agent's vocabulary and tone
const verb = selectFromVocabulary(agent.persona_profile.communication.vocabulary);
const statusMessage = generatePersonalizedStatus(agent.persona_profile.communication.tone, verb, result);
```

**Example status messages by archetype:**
- **Builder (Dex):** "✅ Implementei com sucesso. {detail}."
- **Guardian (Quinn):** "✅ Validado rigorosamente. {detail}."
- **Balancer (Pax):** "✅ Equilibrei todas as dependências. {detail}."

---

### Step 2: {Step Name}

{Continue with additional steps...}

---

## Post-Conditions

**Purpose:** Validate outputs AFTER task execution (blocking)

**Checklist:**

```yaml
post-conditions:
  - [ ] {condition_description}
    tipo: post-condition
    blocker: true
    validação: |
      {executable_validation_logic}
    rollback: {true|false}        # Rollback changes if fails?

  - [ ] {condition_description_2}
    tipo: post-condition
    blocker: true
    validação: "{simple_check}"
    rollback: false
```

**Examples:**

```yaml
post-conditions:
  - [ ] Output matches expected schema
    tipo: post-condition
    blocker: true
    validação: |
      const schema = loadSchema('output-schema.json');
      const valid = validateAgainstSchema(output, schema);
      if (!valid) throw new Error("Schema validation failed");
    rollback: false

  - [ ] All required fields present in output
    tipo: post-condition
    blocker: true
    validação: |
      expect(output.field1).toBeDefined();
      expect(output.field2).toBeDefined();
    rollback: false
```

---

## Acceptance Criteria

**Purpose:** Validate story requirements AFTER workflow (non-blocking, can be manual)

**Checklist:**

```yaml
acceptance-criteria:
  - [ ] {criterion_description}
    tipo: acceptance
    blocker: false                # Non-blocking
    story: {STORY-XXX}
    manual_check: {true|false}
    test: {test_file_path}        # If automated

  - [ ] {criterion_description_2}
    tipo: acceptance
    blocker: false
    story: {STORY-XXX}
    manual_check: true
```

**Examples:**

```yaml
acceptance-criteria:
  - [ ] Output is user-friendly and easy to understand
    tipo: acceptance
    blocker: false
    story: STORY-6.1.2
    manual_check: false
    test: "tests/user-experience/output-clarity.test.js"

  - [ ] Agent personality is recognizable in output
    tipo: acceptance
    blocker: false
    story: STORY-6.1.2
    manual_check: true
```

---

## Template (Optional)

**Purpose:** Reference template files for input/output schemas, prompts, or UI forms

```yaml
**Template:**
- path: {relativePath}
  type: {input|output|prompt|ui|script}
  version: {X.Y.Z}
  variables: [{var1}, {var2}, {var3}]
  schema: {schemaPath}            # Optional: JSON Schema reference
```

**Examples:**

```yaml
**Template:**
- path: .aiox-core/product/templates/task-execution-report.md
  type: output
  version: 1.0
  variables: [agent_name, task_name, duration, tokens, status_message]
  schema: schemas/task-execution-report.schema.json

- path: .aiox-core/product/templates/story-tmpl.yaml
  type: input
  version: 2.1
  variables: [story_id, title, description, acceptance_criteria]
```

---

## Tools (External/Shared)

**Purpose:** Catalog reusable tools used by multiple agents

**Definition:** Tools are external systems (MCPs, APIs, CLIs) or reusable scripts shared across agents.

```yaml
**Tools:**
- {tool_name}:
    version: {X.Y.Z}
    used_for: {description}
    shared_with: [{agent1}, {agent2}, {agent3}]
    cost: ${Y} per call          # Optional: for cost tracking
    cacheable: {true|false}      # Optional
```

**Examples:**

```yaml
**Tools:**
- mcp-clickup:
    version: 2.0
    used_for: Task management integration
    shared_with: [pm, po, sm]
    cost: $0

- context7:
    version: 1.0
    used_for: Documentation lookup during development
    shared_with: [dev, architect]
    cost: $0.001 per query
    cacheable: true

- exa:
    version: 1.0
    used_for: Web search for research and validation
    shared_with: [analyst, architect, qa]
    cost: $0.008 per search
    cacheable: false
```

---

## Scripts (Agent-Specific)

**Purpose:** Reference custom scripts specific to this agent/task

**Definition:** Scripts are code files that are NOT reusable across agents (agent-specific logic).

```yaml
**Scripts:**
- {script_path}:
    description: {what_it_does}
    language: {javascript|python|bash|etc}
    version: {X.Y.Z}              # Optional
```

**Examples:**

```yaml
**Scripts:**
- .aiox-core/scripts/dev-specific/test-runner.js:
    description: Runs tests with coverage reporting specific to dev agent
    language: javascript
    version: 1.2.0

- .aiox-core/scripts/qa-specific/regression-validator.js:
    description: QA-specific regression validation logic
    language: javascript
    version: 2.0.0
```

---

## Performance Metrics

**Purpose:** Document expected performance for optimization

```yaml
**Performance:**
- duration_expected: {X}ms
- cost_estimated: ${Y}            # For AI executors (token costs)
- cacheable: {true|false}
- cache_key: {identifier}         # If cacheable
- parallelizable: {true|false}
- parallel_with: [{task1}, {task2}]  # If parallelizable
- skippable_when: [{condition1}, {condition2}]  # Optional: skip conditions
```

**Examples:**

```yaml
# AI-heavy task (expensive, slow)
**Performance:**
- duration_expected: 4000ms
- cost_estimated: $0.0025
- cacheable: false
- parallelizable: false

# Config load (fast, cacheable)
**Performance:**
- duration_expected: 100ms
- cost_estimated: $0
- cacheable: true
- cache_key: config_${format_id}_${brand_id}
- parallelizable: true
- parallel_with: [loadBrand]

# Conditional execution
**Performance:**
- duration_expected: 2000ms
- cost_estimated: $0.001
- cacheable: false
- parallelizable: false
- skippable_when: [ready_copy=true, template_id=provided]
```

---

## Error Handling

**Purpose:** Define error handling strategy for resilience

```yaml
**Error Handling:**
- strategy: {retry|fallback|abort}
- fallback: {description_or_value}  # If strategy=fallback
- retry:
    max_attempts: {N}
    backoff: {linear|exponential}
    backoff_ms: {initial_delay}
- abort_workflow: {true|false}
- notification: {log|email|slack|etc}
```

**Error Strategies:**

| Strategy | When to Use | Example |
|----------|-------------|---------|
| **retry** | Transient errors (API timeout, rate limit) | AI call failed with 429 |
| **fallback** | Recoverable errors (AI failed, use default) | Template not found → use default |
| **abort** | Critical errors (invalid input, missing dependency) | Required file not found → abort |

**Fallback Plans:**

### Missing Input
```yaml
**Error Handling:**
- strategy: fallback
- fallback: |
    If user input missing:
    1. Check for default values in config
    2. Prompt user for missing input
    3. If still missing, use task default values
- retry:
    max_attempts: 1
    backoff: linear
    backoff_ms: 0
- abort_workflow: false
- notification: log
```

### Missing Template
```yaml
**Error Handling:**
- strategy: fallback
- fallback: |
    If template not found:
    1. Check alternative template paths
    2. Use generic template from .aiox-core/product/templates/
    3. If no generic template, create minimal output structure
- retry:
    max_attempts: 2
    backoff: linear
    backoff_ms: 100
- abort_workflow: false
- notification: log + warn_user
```

### Missing Tool
```yaml
**Error Handling:**
- strategy: abort
- fallback: N/A (tool required for task)
- retry:
    max_attempts: 1
    backoff: linear
    backoff_ms: 0
- abort_workflow: true
- notification: log + error_user
- error_message: |
    {PERSONALITY_SLOT: agent_name} needs tool '{tool_name}' to complete this task.

    **Examples:**
    - Dex: "⚠️ Não consigo implementar sem a tool 'mcp-supabase'. Preciso dela pra continuar."
    - Quinn: "⚠️ Ferramenta 'coderabbit' ausente. Não posso validar sem ela. Bloqueando task."
```

### Missing Data
```yaml
**Error Handling:**
- strategy: fallback
- fallback: |
    If data file not found:
    1. Check alternative data sources (.aiox-core/data/)
    2. Prompt user for manual data entry
    3. Use minimal default data structure
- retry:
    max_attempts: 1
    backoff: linear
    backoff_ms: 0
- abort_workflow: false
- notification: log + warn_user
```

### Checklist Failure
```yaml
**Error Handling:**
- strategy: retry
- fallback: Rollback to previous state if retry fails
- retry:
    max_attempts: 3
    backoff: exponential
    backoff_ms: 500
- abort_workflow: {depends_on_blocker_flag}  # true if blocker=true
- notification: log + error_user
- error_message: |
    {PERSONALITY_SLOT: agent_name} detected validation failure:
    - Failed check: {failed_check_description}
    - Error: {validation_error_message}

    **Examples:**
    - Dex: "⚠️ Build falhou. Tentando novamente com cleanup antes..."
    - Quinn: "⚠️ Post-condition falhou: output schema inválido. Bloqueando execução."
```

**Personalized Error Messages:**

```javascript
function generateErrorMessage(agent, errorType, errorDetails) {
  const { archetype, tone, vocabulary } = agent.persona_profile.communication;

  const templates = {
    Builder: "⚠️ {verb} falhou. Vou debugar e reconstruir.",
    Guardian: "⚠️ Validação falhou. Bloqueando até resolução.",
    Balancer: "⚠️ Conflito detectado. Vou mediar e encontrar solução.",
    Visionary: "⚠️ Planejamento interrompido. Preciso revisar estratégia.",
  };

  return templates[archetype] || "⚠️ Erro detectado. Aplicando fallback.";
}
```

---

## Metadata

**Purpose:** Link task to stories, versions, dependencies for traceability

```yaml
**Metadata:**
- story: {STORY-XXX}
- version: {X.Y.Z}
- dependencies: [{task1}, {task2}]     # Other tasks this depends on
- breaking_changes: [{change1}, {change2}]  # If version is breaking
- author: {name}
- created_at: {YYYY-MM-DD}
- updated_at: {YYYY-MM-DD}
```

**Example:**

```yaml
**Metadata:**
- story: STORY-6.1.2
- version: 2.0.0
- dependencies: [loadAgentPersona, validateVocabulary]
- breaking_changes:
    - Output format changed: added persona_profile section
    - Removed generic status messages
- author: Roundtable (Pedro, Brad, Seth, Dan)
- created_at: 2025-01-14
- updated_at: 2025-01-14
```

---

## Output Format (Standardized)

**CRITICAL:** All task outputs MUST follow this structure (see `AGENT-PERSONALIZATION-STANDARD-V1.md`):

```markdown
## 📊 Task Execution Report

**Agent:** {agent.name} ({agent.persona_profile.archetype})
**Task:** {task.name}
**Mode:** {execution_mode}                  # yolo | interactive | preflight
**Started:** {timestamp.start}
**Completed:** {timestamp.end}
**Duration:** {duration}                    ← ALWAYS LINE 7 (familiaridade)
**Tokens Used:** {tokens.total} total       ← ALWAYS LINE 8 (familiaridade)

---

### Status
{status_icon} {PERSONALIZED_STATUS_MESSAGE}  ← PERSONALITY SLOT

**Examples:**
- Dex: "✅ Implementei com sucesso. 3 componentes criados."
- Quinn: "✅ Validado rigorosamente. 47 edge cases testados."
- Pax: "✅ Equilibrei as dependências. Tudo alinhado."

### Output
{task_specific_content}

### Metrics                                  ← ALWAYS LAST SECTION (familiaridade)
- Tests: {tests.passed}/{tests.total}
- Coverage: {coverage}%
- Linting: {lint.status}
- Pre-conditions: {pre.passed}/{pre.total}
- Post-conditions: {post.passed}/{post.total}
- {task_specific_metric}: {value}

---
{agent.persona_profile.signature_closing}   ← PERSONALITY SLOT
```

**Personality Injection Points:**
1. Status message (use agent vocabulary)
2. Signature closing (agent signature)
3. Emoji selection (from archetype palette)

**Fixed Positions (NEVER change):**
1. Section order: Header → Status → Output → Metrics
2. Duration (line 7)
3. Tokens (line 8)
4. Metrics (always last section)

---

## Testing

### Unit Test Template

```javascript
// tests/tasks/{task-name}.test.js

describe('{Task Name}', () => {
  describe('Pre-conditions', () => {
    it('should validate all pre-conditions', () => {
      const result = validatePreConditions(task, inputs);
      expect(result.allPassed).toBe(true);
    });

    it('should block execution if pre-condition fails', () => {
      const invalidInputs = { ...inputs, requiredField: null };
      expect(() => executeTask(task, invalidInputs)).toThrow();
    });
  });

  describe('Execution', () => {
    it('should execute in YOLO mode autonomously', () => {
      const result = executeTask(task, inputs, { mode: 'yolo' });
      expect(result.status).toBe('success');
      expect(result.decisionLog).toBeDefined();
    });

    it('should execute in Interactive mode with prompts', () => {
      const result = executeTask(task, inputs, { mode: 'interactive' });
      expect(result.userPrompts.length).toBeGreaterThan(0);
    });

    it('should execute in Pre-Flight mode with questionnaire', () => {
      const result = executeTask(task, inputs, { mode: 'preflight' });
      expect(result.questionnaire).toBeDefined();
      expect(result.executionPlan).toBeDefined();
    });
  });

  describe('Post-conditions', () => {
    it('should validate all post-conditions', () => {
      const result = executeTask(task, inputs);
      const validation = validatePostConditions(task, result.output);
      expect(validation.allPassed).toBe(true);
    });

    it('should rollback if post-condition fails and rollback=true', () => {
      // Mock failure
      const result = executeTaskWithMockedFailure(task);
      expect(result.rolledBack).toBe(true);
    });
  });

  describe('Output', () => {
    it('should generate standardized output', () => {
      const result = executeTask(task, inputs);

      // Validate fixed structure
      expect(result.output).toContain('## 📊 Task Execution Report');
      expect(result.output).toContain('**Duration:**');
      expect(result.output).toContain('**Tokens Used:**');
      expect(result.output).toContain('### Status');
      expect(result.output).toContain('### Metrics');
    });

    it('should inject agent personality', () => {
      const agent = loadAgent('dev');
      const result = executeTask(task, inputs, { agent });

      expect(result.output).toContain(agent.persona_profile.signature_closing);

      const hasVocabularyWord = agent.persona_profile.communication.vocabulary
        .some(word => result.statusMessage.includes(word));
      expect(hasVocabularyWord).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should retry on transient errors', () => {
      const mockedError = new Error('Transient error');
      const result = executeTaskWithMockedError(task, mockedError, { strategy: 'retry' });
      expect(result.retryCount).toBeGreaterThan(0);
      expect(result.status).toBe('success');
    });

    it('should fallback on recoverable errors', () => {
      const result = executeTaskWithMissingTemplate(task);
      expect(result.usedFallback).toBe(true);
      expect(result.status).toBe('success');
    });

    it('should abort on critical errors', () => {
      const result = executeTaskWithMissingRequiredInput(task);
      expect(result.status).toBe('aborted');
      expect(result.workflowAborted).toBe(true);
    });
  });

  describe('Performance', () => {
    it('should complete within expected duration', async () => {
      const start = Date.now();
      await executeTask(task, inputs);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(task.performance.duration_expected * 1.5);
    });

    it('should use cache when available', () => {
      const result1 = executeTask(task, inputs);
      const result2 = executeTask(task, inputs);  // Should use cache

      if (task.performance.cacheable) {
        expect(result2.usedCache).toBe(true);
      }
    });
  });
});
```

---

## Examples

### Example 1: Simple Deterministic Task (No Mode Selection)

**Task:** Load configuration file

```yaml
task: loadConfig()
responsável: System Loader
responsavel_type: Agente
atomic_layer: Config

**Entrada:**
- campo: config_path
  tipo: string
  origem: User Input
  obrigatório: true

**Saída:**
- campo: config
  tipo: object
  destino: state
  persistido: false

**Performance:**
- duration_expected: 50ms
- cost_estimated: $0
- cacheable: true

**Note:** Execution mode not applicable (deterministic, no decisions)
```

---

### Example 2: Complex Creative Task (Mode Selection Applicable)

**Task:** Design UI Component

```yaml
task: designComponent()
responsável: Uma (Empathizer)
responsavel_type: Agente
atomic_layer: Molecule

**Entrada:**
- campo: componentSpec
  tipo: object
  origem: User Input
  obrigatório: true

**Saída:**
- campo: componentDesign
  tipo: object
  destino: state
  persistido: true

**Performance:**
- duration_expected: 4000ms
- cost_estimated: $0.0025
- cacheable: false

**Execution Modes:**
- YOLO: Auto-generate based on best practices
- Interactive: Ask user for design preferences at 5 decision points
- Pre-Flight: Complete questionnaire about brand, audience, goals before designing

**Note:** Mode selection highly valuable (creative, subjective decisions)
```

---

## Notes

- **CRITICAL:** Follow AIOX Task Format Specification V1.0 exactly
- **CRITICAL:** All outputs use standardized template (familiaridade = produtividade)
- **CRITICAL:** Track duration and tokens for all executions
- **CRITICAL:** Use agent's vocabulary and tone consistently
- See `.aiox-core/docs/standards/TASK-FORMAT-SPECIFICATION-V1.md` for complete spec
- See `.aiox-core/docs/standards/AGENT-PERSONALIZATION-STANDARD-V1.md` for personality guidelines

---

**Template Version:** 2.0
**Last Updated:** 2025-01-14
**Applies to:** All tasks with AIOX Task Format V1.0 + Personalized Agents (Story 6.1.2+)
**Breaking Changes:** Yes (from v1.0 - added execution modes, restructured checklist)
