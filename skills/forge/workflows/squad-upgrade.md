# Workflow: Squad Upgrade

> Diagnose → Enrich DNA → Add Quality Gates → Redesign Workflows → Validate

---

## When to Use

- User runs `/forge squad-upgrade {squad-name}`
- Quest delegates a squad-upgrade pack mission to Forge
- Scope: transform an existing squad from basic to production-grade

---

## Pipeline

```
Phase 0 -> Phase 1 -> Phase 2 -> Phase 3 -> Phase 4
Discovery   DNA       Quality    Workflows   Validation
```

ALL 5 phases execute for a full squad upgrade. Individual missions from Quest may trigger specific steps.

---

## Execution

### Phase 0: Discovery (Diagnosis)

Read `{FORGE_HOME}/phases/phase-0-discovery.md` with SQUAD_UPGRADE adjustments:
- Detect squad location (inside aios-core/squads/ or external)
- Read README.md, config.yaml, agents/ directory
- Count agents, measure depth (sections, voice_dna, expertise)
- Run `/ecosystem-audit` on the squad
- CHECKPOINT: show diagnosis summary, confirm upgrade scope

**Diagnosis output:**

```
Squad: {name}
Agents: {count} ({avg_lines} avg lines)
Has config.yaml: {yes/no}
Has workflows: {yes/no}
Has checklists: {count}
Has templates: {count}
Has data files: {count}
Ecosystem audit score: {score}
```

### Phase 1: DNA Enrichment

**Agents:** @architect (design), @dev (implement)

For EACH agent in the squad:

1. **@architect** — Analyze current agent definition, identify gaps
2. **@dev** — Add `voice_dna` section: tone, style, vocabulary, forbidden words
3. **@dev** — Add `expertise` section: domains, references, depth level
4. **@dev** — Add `personality` section: traits, quirks, decision style
5. **@architect** — Review consistency across all agents (no contradictions)

**Quality gate:** Every agent file must have voice_dna, expertise, and personality sections.

### Phase 2: Quality Infrastructure

**Agents:** @dev, @qa

1. **@dev** — Create/update checklists in `checklists/` (quality criteria for squad outputs)
2. **@dev** — Create/update templates in `templates/` (output models for each agent)
3. **@dev** — Add data files in `data/` (reference data, examples, lookup tables)
4. **@qa** — Validate checklists are actionable (each item is testable, not vague)

**Quality gate:** At least 1 checklist and 1 template must exist.

### Phase 3: Workflow Design

**Agents:** @architect, @dev

1. **@architect** — Map existing workflows from config.yaml
2. **@architect** — Design improved workflow: clear steps, agent sequence, inputs/outputs
3. **@dev** — Implement workflow in config.yaml with steps, triggers, gates
4. Optional: add cross-squad chains (integrations with other squads)
5. Optional: document decision points (approval gates, branches, fallbacks)

**Quality gate:** config.yaml must have a `workflows` section with at least one complete workflow.

### Phase 4: Validation

**Agents:** @qa, @pedro-valerio, Kaizen squad

1. **@qa** — Test squad with a real use case (execute main workflow end-to-end)
2. **@pedro-valerio** — Process audit: validate workflows for zero wrong paths, veto conditions
3. **Kaizen squad** — Health check: capture patterns and learnings
4. **@dev** — Update README.md with new capabilities, agents, workflows
5. **@qa** — Run final `/ecosystem-audit`, compare with initial diagnosis
6. CHECKPOINT: show before/after comparison, confirm upgrade complete

**Output:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  SQUAD UPGRADE COMPLETE — {squad_name}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  BEFORE              AFTER
  {old_score}/10      {new_score}/10
  {old_agents} agents  {new_agents} agents
  {old_checklists} checklists  {new_checklists} checklists
  {old_templates} templates  {new_templates} templates

  Improvements:
  + {list of improvements}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Agent Mapping

| Phase | Primary Agent | Supporting |
|-------|---------------|------------|
| 0 - Discovery | (Forge core) | /ecosystem-audit |
| 1 - DNA | @architect | @dev |
| 2 - Quality | @dev | @qa |
| 3 - Workflows | @architect | @dev |
| 4 - Validation | @qa | @pedro-valerio, Kaizen |

---

## Progress Display

```
  ✅ Diagnosis  ->  🔄 DNA  ->  ○ Quality  ->  ○ Workflows  ->  ○ Validation
```

---

## Quest Integration

When invoked by Quest (via forge-bridge), Forge receives the specific mission context.

### Mapping Quest items to Forge steps

| Quest World | Forge Phase |
|---|---|
| W0: Torre de Observação | Phase 0 (Discovery/Diagnosis) |
| W1: Laboratório de DNA | Phase 1 (DNA Enrichment) |
| W2: Sala do Tribunal | Phase 2 (Quality Infrastructure) |
| W3: Sala de Estratégia | Phase 3 (Workflow Design) |
| W4: Arena de Testes | Phase 4 (Validation) |

---

## Error Recovery

```
Agent file too short (< 20 lines)
  → @architect reviews and expands before DNA enrichment

Config.yaml missing
  → @dev creates from template based on agents/ directory

Ecosystem audit fails
  → Show specific failures, let user decide scope of fix
  → Don't block upgrade — audit is diagnostic, not a gate

Process audit (pedro-valerio) fails
  → Return to Phase 3, fix workflow issues
  → Re-run audit after fixes
```
