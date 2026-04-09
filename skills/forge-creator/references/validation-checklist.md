# Validation Checklist — Forge Quality Gate

> Run after generating any forge. ALL checks must pass before delivering to the user.

---

## Tier 1 Checks (MANDATORY for all forges)

### CHECK 1: Frontmatter

```
- [ ] `name` field present and matches `{domain}-forge` pattern
- [ ] `description` field present and mentions orchestration/delegation
- [ ] `version` field present (semver format)
- [ ] `category` field present
- [ ] `tags` field present and includes "forge" and domain keyword
```

**How to verify:** Read first 15 lines of SKILL.md, parse YAML frontmatter.

### CHECK 2: Identity Statement

```
- [ ] SKILL.md contains explicit identity ("You are the {Domain} Forge")
- [ ] Identity describes orchestration role, not implementation role
```

**How to verify:** Grep SKILL.md for "You are" or "Forge" in the first 30 lines.

### CHECK 3: "Never Implements" Clause

```
- [ ] SKILL.md contains explicit prohibition ("NEVER", "never", "nunca")
- [ ] Prohibition is domain-specific (not generic "never does anything")
- [ ] Constitutional Rules section exists
```

**How to verify:** Grep SKILL.md for "NEVER" or "nunca" — must appear at least once in context of prohibition.

### CHECK 4: Intent Classifier

```
- [ ] Intent Classification section exists in SKILL.md
- [ ] At least 2 distinct intents defined
- [ ] Each intent has detection rules (keywords, prefixes, or patterns)
- [ ] Help command defined (/{domain}-forge help)
```

**How to verify:** Grep SKILL.md for "Intent Classification" section header.

### CHECK 5: Discovery Questions

```
- [ ] Discovery Questions section exists in SKILL.md
- [ ] At least 3 domain-specific questions
- [ ] Questions use "**bold**" format with " — " explanation
- [ ] Questions are specific (not "tell me more")
```

**How to verify:** Grep SKILL.md for "Discovery Questions" section header, count numbered items.

### CHECK 6: Routing Mechanism

```
- [ ] capability-map.yaml exists
- [ ] At least 2 capabilities defined
- [ ] Each capability has: description, executor, why
- [ ] OR: Routing Table section exists in SKILL.md (for inline routing)
```

**How to verify:** Read capability-map.yaml, validate YAML structure.

### CHECK 7: Executors Exist

```
- [ ] Every executor path in capability-map.yaml resolves to a real file
- [ ] Glob check: squads/{name}/README.md OR skills/{name}/SKILL.md exists
- [ ] No executor points to non-existent resources
```

**How to verify:** For each executor in capability-map.yaml, run Glob to check existence.

**If executor is missing:**
- WARN: `"⚠️ Executor '{path}' não encontrado. Criar squad/skill primeiro ou remover da capability map."`
- Do NOT block delivery — some forges are created before their executors
- Mark missing executors in the summary

### CHECK 8: Examples

```
- [ ] references/examples.md exists
- [ ] At least 2 example execution plans
- [ ] Examples use real executor names from capability-map.yaml
```

**How to verify:** Read references/examples.md, cross-reference executor names.

---

## Tier 2 Additional Checks

### CHECK 9: Personality

```
- [ ] personality.md exists
- [ ] Banner section defined
- [ ] Progress display format defined
- [ ] Tone description present
```

### CHECK 10: Config

```
- [ ] config.yaml exists
- [ ] Valid YAML syntax
- [ ] Domain field matches forge name
- [ ] Defaults section present
```

### CHECK 11: Runner

```
- [ ] runner.md exists
- [ ] State machine section defined
- [ ] State file path uses domain name
- [ ] Error recovery table present
- [ ] Resume protocol defined
```

### CHECK 12: Phases

```
- [ ] phases/ directory exists
- [ ] At least phase-0-discovery.md present
- [ ] Each phase file has Steps section
```

### CHECK 13: Workflows

```
- [ ] workflows/ directory exists
- [ ] At least 1 workflow file
- [ ] Each workflow has: When to Use, Pipeline, Checkpoints
```

### CHECK 14: Plugins

```
- [ ] plugins/SCHEMA.md exists
- [ ] Hook points documented
- [ ] Plugin format documented
```

---

## Validation Output Format

```
✅ VALIDAÇÃO — {domain}-forge (Tier {1|2})

  Tier 1:
    Frontmatter:        ✅ válido
    Identity:           ✅ presente
    Never Implements:   ✅ presente
    Intent Classifier:  ✅ {N} intents
    Discovery:          ✅ {N} perguntas
    Routing:            ✅ capability-map.yaml ({N} capabilities)
    Executors:          ✅ {N}/{N} existem (ou ⚠️ {missing_count} ausentes)
    Examples:           ✅ {N} exemplos

  Tier 2 (se aplicável):
    Personality:        ✅ / ❌
    Config:             ✅ / ❌
    Runner:             ✅ / ❌
    Phases:             ✅ {N} phases / ❌
    Workflows:          ✅ {N} workflows / ❌
    Plugins:            ✅ / ❌

  Status: APROVADO ✅ | ATENÇÃO ⚠️ ({issues}) | REPROVADO ❌ ({blockers})
```

### Status Rules

- **APROVADO:** All mandatory checks pass (Tier 1: checks 1-8, Tier 2: + checks 9-14)
- **ATENÇÃO:** All pass except CHECK 7 (missing executors) — forge is functional but incomplete
- **REPROVADO:** Any check 1-6 or 8 fails — forge is structurally invalid
