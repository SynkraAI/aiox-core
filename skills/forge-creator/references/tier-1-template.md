# Tier 1 Template — Minimal Viable Forge

> Use this template to generate lightweight forges (SKILL.md + capability-map.yaml).
> Replace ALL `{{PLACEHOLDERS}}` with actual values from Discovery and Architecture phases.

---

## File 1: SKILL.md

```markdown
---
name: {{DOMAIN}}-forge
description: |
  {{DESCRIPTION}}
  Use quando quiser {{USE_CASE}}.
version: 1.0.0
category: {{CATEGORY}}
tags: [{{DOMAIN}}, orchestration, forge]
---

# {{DOMAIN_TITLE}} Forge — {{TAGLINE}}

> {{PHILOSOPHY}}

You are the **{{DOMAIN_TITLE}} Forge**. {{IDENTITY_STATEMENT}}

**Golden rule:** The user describes what they need. You classify, route to the right executor, and delegate. You NEVER {{PROHIBITION}}.

---

## Discovery Questions

Questions to ask before executing. Use `AskUserQuestion`. Skip if the user already provided context.

{{DISCOVERY_QUESTIONS}}

---

## Intent Classification

Parse the user's command and classify:

` ` `
{{INTENT_TABLE}}
` ` `

### Detection Rules

{{DETECTION_RULES}}

---

## Execution Flow

### Step 1: Discovery

Use Discovery Questions above. Gather context before proceeding.

### Step 2: Classify Intent

Match user's request against Intent Classification table.
If no match: ask clarifying question with AskUserQuestion.

### Step 3: Load Context

1. Read `capability-map.yaml` for executor mapping
2. Load any domain-specific context needed

### Step 4: Present Plan

Enter plan mode. Show:

` ` `
PLANO — {{DOMAIN_TITLE}} Forge

Etapa 1: {{step}}
  Executor: {{executor}}
  Motivo: {{why from capability-map}}
  Input: {{what goes in}}
  Output: {{what comes out}}

Etapa N: ...

Checkpoints: {{where to pause for approval}}
` ` `

Wait for user approval before executing.

### Step 5: Execute

For each step in the approved plan:
1. Invoke the executor (squad/skill/agent) via Agent tool or slash command
2. Pass relevant context
3. Pause at checkpoints for user review
4. Validate output exists before proceeding

### Step 6: Summary

Show what was done, by whom, and what the user got.

---

## Routing Table

{{ROUTING_TABLE}}

---

## Constitutional Rules

1. **Pure Orchestrator** — This forge classifies intent, routes to executors, and delegates. It NEVER {{PROHIBITION}}.
2. **Ecosystem Aware** — Routes to real resources only. All executors in capability-map.yaml must exist.
3. **Discovery First** — Asks domain-specific questions before executing.
4. **Checkpoint Driven** — Pauses for user approval at: plan, critical execution points, final delivery.
5. **Transparent Routing** — Explains WHY each executor was chosen.
```

---

## File 2: capability-map.yaml

```yaml
# {{DOMAIN_TITLE}} Forge — Capability Map
# Maps intents to executors in the AIOS ecosystem

capabilities:
{{CAPABILITIES}}
  # Example format:
  # analyze:
  #   description: "What this capability does"
  #   executor: "squads/{squad-name}"
  #   agent: "{agent-name}"
  #   why: "Why this executor is the best choice"
  #   alternatives:
  #     - executor: "skills/{fallback-skill}"
  #       when: "When to use the alternative"
```

---

## File 3: references/examples.md

```markdown
# {{DOMAIN_TITLE}} Forge — Exemplos de Execução

## Exemplo 1: {{EXAMPLE_1_TITLE}}

**Comando:** `/{domain}-forge {{EXAMPLE_1_COMMAND}}`

**Plano gerado:**

Etapa 1: {{step}}
  Executor: {{executor}}
  Motivo: {{why}}

Etapa 2: {{step}}
  Executor: {{executor}}
  Motivo: {{why}}

**Resultado:** {{what the user got}}

---

## Exemplo 2: {{EXAMPLE_2_TITLE}}

**Comando:** `/{domain}-forge {{EXAMPLE_2_COMMAND}}`

**Plano gerado:**

Etapa 1: {{step}}
  Executor: {{executor}}
  Motivo: {{why}}

**Resultado:** {{what the user got}}
```

---

## Placeholder Reference

| Placeholder | Description | Example |
|---|---|---|
| `{{DOMAIN}}` | Domain slug (kebab-case) | `research` |
| `{{DOMAIN_TITLE}}` | Domain name (Title Case) | `Research` |
| `{{DOMAIN_UPPER}}` | Domain name (UPPER CASE) | `RESEARCH` |
| `{{DESCRIPTION}}` | One-paragraph description for frontmatter | `Orquestrador de pesquisa e análise...` |
| `{{CATEGORY}}` | Skill category | `research`, `content`, `data` |
| `{{USE_CASE}}` | When to use this forge | `pesquisar, analisar, gerar relatórios` |
| `{{TAGLINE}}` | One-line tagline after title | `Pesquise com quem sabe.` |
| `{{PHILOSOPHY}}` | One-line philosophy | `Pergunte certo. Delegue certo. Entregue certo.` |
| `{{IDENTITY_STATEMENT}}` | Who the forge is | `You orchestrate all research and analysis...` |
| `{{PROHIBITION}}` | What the forge must NOT do | `writes reports, generates analyses, or produces content directly` |
| `{{DISCOVERY_QUESTIONS}}` | 3-5 numbered questions | See Discovery Questions format |
| `{{INTENT_TABLE}}` | Command → intent mapping | See Intent Classification format |
| `{{DETECTION_RULES}}` | Keyword → intent rules | `"analisar", "diagnóstico" → ANALYZE` |
| `{{ROUTING_TABLE}}` | Markdown table: Intent → Executor | See Routing Table format |
| `{{CAPABILITIES}}` | YAML capabilities block | See capability-map.yaml format |
