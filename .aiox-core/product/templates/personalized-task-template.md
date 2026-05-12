# {Task Name}

## Purpose

{Brief description of what this task does and when to use it}

---

## Parameters

| Parameter | Required | Default | Description |
|-----------|----------|---------|-------------|
| `{param1}` | Yes | - | {Description} |
| `{param2}` | No | `{default}` | {Description} |

---

## Workflow

### Step 1: {Step Name}

{Step description}

**Actions:**
1. {Action 1}
2. {Action 2}
3. {Action 3}

**Validation:**
- {Validation check 1}
- {Validation check 2}

**Output Format (STANDARDIZED):**
```markdown
## 📊 Task Execution Report

**Agent:** {agent.name} ({agent.persona_profile.archetype})
**Task:** {task.name}
**Started:** {timestamp.start}
**Completed:** {timestamp.end}
**Duration:** {duration}
**Tokens Used:** {tokens.input} in / {tokens.output} out / {tokens.total} total

---

### Status
{PERSONALITY_SLOT: status_message}

**Examples per archetype:**
- **Builder (Dex):** "✅ Tá pronto! Implementei todas as funcionalidades."
- **Guardian (Quinn):** "✅ Validado com rigor. 47 edge cases testados."
- **Balancer (Pax):** "✅ Story completa. Equilibrei performance vs. legibilidade."

### Output
{step_specific_output}

### Metrics
- Tests: {tests.passed}/{tests.total}
- Coverage: {coverage}%
- Linting: {lint.status}
- {task_specific_metric_1}: {value}
- {task_specific_metric_2}: {value}

---
{PERSONALITY_SLOT: agent.signature_closing}
```

### Step 2: {Step Name}

{Continue with additional steps...}

---

## Elicitation (if applicable)

**When:** {When to elicit user input}

**Format:**
```markdown
{Agent greeting using personality}

{Question or choice}

Options:
1. {Option 1}
2. {Option 2}
3. {Option 3}

{Personality-infused guidance based on archetype}
```

**Example:**
```markdown
💻 Dex (Builder): Preciso saber qual approach você prefere.

Escolha a arquitetura:
1. Microservices (mais escalável, maior complexidade)
2. Monolith (mais simples, menos overhead)
3. Modular Monolith (meio termo)

Eu recomendo #3 pra começar - facilita construir rápido e depois separar se necessário.
```

---

## Success Criteria

- [ ] {Criterion 1}
- [ ] {Criterion 2}
- [ ] Output follows standardized template
- [ ] All metrics calculated and displayed
- [ ] Duration and token usage tracked

---

## Error Handling

### Error: {Error Type}

**Detection:**
{How to detect this error}

**Resolution:**
{How to resolve it}

**Personalized Error Message Examples:**
- **Builder:** "⚠️ Build falhou. Vou debugar e reconstruir."
- **Guardian:** "⚠️ Validação falhou. Bloqueando deploy até resolução."
- **Balancer:** "⚠️ Conflito detectado. Vou mediar e encontrar consenso."

---

## Dependencies

**Tasks:**
- `.aiox-core/tasks/{dependency1}.md`
- `.aiox-core/tasks/{dependency2}.md`

**Templates:**
- `.aiox-core/product/templates/{template1}.yaml`

**Checklists:**
- `.aiox-core/product/checklists/{checklist1}.md`

**Tools:**
- `{tool1}` - {Usage description}
- `{tool2}` - {Usage description}

---

## Output Templates

### Standard Task Report

All task outputs MUST use this structure (see `.aiox-core/docs/standards/AGENT-PERSONALIZATION-STANDARD-V1.md`):

**FIXED SECTIONS (never change order):**
1. Header (lines 1-7: Agent, Task, Timestamps, Duration, Tokens)
2. Status (personality slot)
3. Output (task-specific content)
4. Metrics (always last)
5. Signature (personality slot)

**PERSONALITY SLOTS (varies per agent):**
- Status message (line after "### Status")
- Signature closing (last line)
- Emoji selection (from archetype palette)
- Verb choice (from agent vocabulary)

### Metric Tracking

**Required metrics (all tasks):**
```javascript
{
  duration: "2.3s",           // Execution time
  tokens: {
    input: 1234,              // Input tokens consumed
    output: 567,              // Output tokens generated
    total: 1801               // Total tokens
  },
  tests: {
    passed: 12,               // Tests that passed
    total: 12,                // Total tests run
    status: "✅ All passing"  // Status summary
  },
  coverage: 87,               // Code coverage %
  lint: {
    status: "✅ Clean",       // Linting status
    warnings: 0,              // Warning count
    errors: 0                 // Error count
  }
}
```

**Optional task-specific metrics:**
```javascript
{
  // Add metrics relevant to this specific task
  files_modified: 5,
  dependencies_added: 2,
  breaking_changes: 0,
  // etc.
}
```

---

## Personality Configuration

### Agent Behavior During Task

**Tone consistency:**
- Use agent's vocabulary words from `persona_profile.communication.vocabulary`
- Match agent's tone from `persona_profile.communication.tone`
- Select emojis from archetype palette (see `archetype-vocabulary.yaml`)

**Example vocabulary usage:**
```javascript
// Builder agent (Dex)
vocabulary: ["construir", "implementar", "refatorar"]
status_message: "✅ Tá pronto! Implementei todas as funcionalidades."

// Guardian agent (Quinn)
vocabulary: ["validar", "verificar", "garantir"]
status_message: "✅ Validado. Garanti cobertura em todos os edge cases."
```

### Status Message Generation

**Template:**
```
{status_icon} {verb_from_vocabulary} {accomplishment}!
```

**Examples by archetype:**

| Archetype | Verb | Example Message |
|-----------|------|-----------------|
| Builder | construir, implementar | "✅ Implementei com sucesso. 3 componentes criados." |
| Guardian | validar, garantir | "✅ Validado rigorosamente. Zero vulnerabilidades." |
| Balancer | equilibrar, harmonizar | "✅ Harmonizei as dependências. Tudo alinhado." |
| Visionary | planejar, estrategizar | "✅ Estratégia definida. 5 milestones mapeados." |

---

## Testing

### Unit Test Template

```javascript
// tests/tasks/{task-name}.test.js

describe('{Task Name}', () => {
  it('should generate standardized output', () => {
    const agent = loadAgent('dev');
    const result = executeTask('{task-name}', params);

    // Validate fixed structure
    expect(result).toContain('## 📊 Task Execution Report');
    expect(result).toContain('**Duration:**');
    expect(result).toContain('**Tokens Used:**');
    expect(result).toContain('### Status');
    expect(result).toContain('### Metrics');

    // Validate personality injection
    expect(result).toContain(agent.persona_profile.signature_closing);
  });

  it('should track duration and tokens', () => {
    const result = executeTask('{task-name}', params);

    expect(result.metrics.duration).toBeDefined();
    expect(result.metrics.tokens.total).toBeGreaterThan(0);
  });

  it('should use agent vocabulary in status message', () => {
    const agent = loadAgent('dev');
    const result = executeTask('{task-name}', params);

    const hasVocabularyWord = agent.persona_profile.communication.vocabulary
      .some(word => result.status_message.includes(word));

    expect(hasVocabularyWord).toBe(true);
  });
});
```

---

## Examples

### Example 1: {Example Scenario}

**Input:**
```yaml
task: {task-name}
agent: dev
params:
  {param1}: {value1}
  {param2}: {value2}
```

**Output:**
```markdown
## 📊 Task Execution Report

**Agent:** Dex (Builder)
**Task:** {Task Name}
**Started:** 2025-01-14T10:30:00Z
**Completed:** 2025-01-14T10:32:23Z
**Duration:** 2.3s
**Tokens Used:** 1,234 in / 567 out / 1,801 total

---

### Status
✅ Tá pronto! Implementei com sucesso.

### Output
{Task-specific output here}

### Metrics
- Tests: 12/12
- Coverage: 87%
- Linting: ✅ Clean

---
— Dex, sempre construindo 🔨
```

---

## Notes

- **CRITICAL:** Always follow output template structure (familiaridade = produtividade)
- **CRITICAL:** Track duration and tokens for all task executions
- **CRITICAL:** Use agent's vocabulary and tone consistently
- See `.aiox-core/docs/standards/AGENT-PERSONALIZATION-STANDARD-V1.md` for complete guidelines

---

**Template Version:** 1.0
**Last Updated:** 2025-01-14
**Applies to:** All tasks using personalized agents (Story 6.1.2+)
