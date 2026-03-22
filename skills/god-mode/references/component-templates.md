# Component Templates — Checklists, Templates, Data Files & Rules

## 1. Checklist Creation

### Where to Save

| Type | Path |
|------|------|
| **Core** | `.aiox-core/development/checklists/{name}.md` |
| **Squad** | `squads/{squad}/checklists/{name}.md` |

### Naming: `{domain}-{purpose}.md` (ex: `pre-push-checklist.md`, `agent-quality-gate.md`)

### Schema

```markdown
# {Checklist Title}

```yaml
checklist:
  id: "{checklist-id}"
  version: "1.0.0"
  created: "{date}"
  updated: "{date}"
  purpose: "{what this validates}"
  mode: blocking|advisory
```

---

## Level 0: {Category Name}

```yaml
level_0_checks:
  - id: "{cat}-{num}"
    check: "{what to verify}"
    type: blocking|advisory
    validation: "{how to check}"
```

- [ ] **{id}**: {check description}
  - Type: {blocking|advisory}
  - Validation: `{command or manual check}`

---

## Scoring

| Result | Criteria |
|--------|----------|
| **PASS** | All blocking checks pass |
| **CONCERNS** | Blocking pass, some advisory fail |
| **FAIL** | Any blocking check fails |
```

### Minimal Template

```markdown
# {Name} Checklist

```yaml
checklist:
  id: "{id}"
  version: "1.0.0"
  purpose: "{purpose}"
  mode: blocking
```

## Checks

- [ ] **C-01**: {Check 1} — Type: blocking
- [ ] **C-02**: {Check 2} — Type: blocking
- [ ] **C-03**: {Check 3} — Type: advisory

## Scoring

| Result | Criteria |
|--------|----------|
| PASS | All blocking pass |
| FAIL | Any blocking fails |
```

---

## 2. Template Creation

### Where to Save

| Type | Path |
|------|------|
| **Core** | `.aiox-core/development/templates/{name}.{md|yaml}` |
| **Squad** | `squads/{squad}/templates/{name}.{md|yaml}` |

### Variable Syntax

| Syntax | Meaning |
|--------|---------|
| `{{VARIABLE}}` | Required placeholder — MUST be replaced |
| `{{variable|default}}` | Optional with default value |
| `{{#if condition}}...{{/if}}` | Conditional section |
| `{{#each items}}...{{/each}}` | Loop over array |

### Types in our ecosystem

| Type | Example | Use |
|------|---------|-----|
| YAML Template | `agent-handoff-tmpl.yaml` | Handoff artifacts |
| Markdown Template | `aiox-doc-template.md` | Documentation |
| Directory Template | `squad/` folder | Squad scaffolding |
| Prompt Template | `subagent-step-prompt.md` | Agent prompts |

---

## 3. Data File Creation

### Where to Save

| Type | Path |
|------|------|
| **Core** | `.aios-core/data/{name}.yaml` |
| **Squad** | `squads/{squad}/data/{name}.{yaml|json}` |

### Registry Format

```yaml
# {Registry Name}
registry:
  version: "1.0.0"
  updated: "{date}"
  description: "{purpose}"

entries:
  - id: "{entry-id}"
    name: "{Entry Name}"
    type: "{type}"
    path: "{file path}"
    layer: "L1|L2|L3|L4"
    purpose: "{what it does}"
    keywords:
      - "{keyword}"
    usedBy:
      - "{agent-id}"
```

### Heuristics Format

```yaml
heuristics:
  version: "1.0.0"

  rules:
    - id: "{rule-id}"
      trigger: "{when to apply}"
      condition: "{what to check}"
      action: "{what to do}"
      confidence: 0.9
      source: "{origin}"

  patterns:
    - id: "{pattern-id}"
      name: "{Pattern Name}"
      detection: "{how to detect}"
      response: "{what to do}"
```

---

## 4. Rule Creation

### Where to Save

Rules in `.claude/rules/{rule-name}.md`. Auto-loaded by Claude Code based on `paths:` frontmatter.

### Schema

```markdown
---
paths:
  - "{glob pattern 1}"            # e.g., "docs/stories/**"
  - "{glob pattern 2}"
---

# {Rule Name}

## Purpose

{Why this rule exists.}

## Rules

### Rule 1: {Title}

{Description.}

**Enforcement:** {BLOCK|WARN|INFO}

## Examples

### Correct
{correct example}

### Incorrect
{incorrect example}

## Exceptions

- {When this rule does not apply}
```

### Conditional Loading

| Pattern | Loads When |
|---------|-----------|
| `docs/stories/**` | Editing story files |
| `.aiox-core/**` | Working with framework |
| `packages/**` | Working with packages |
| No `paths:` | Always loaded (global rule) |

---

## Validation Summary

| Component | Key Checks |
|-----------|-----------|
| **Checklist** | Valid YAML metadata, blocking/advisory types, scoring defined |
| **Template** | All `{{VARIABLES}}` documented, sections structured, UTF-8 |
| **Data File** | Valid YAML, version present, entries schema consistent |
| **Rule** | `paths:` frontmatter (if conditional), enforcement levels defined |
