# Agent Quality Gate Checklist

```yaml
checklist:
  id: agent-quality-gate
  version: 3.0.0
  created: 2026-01-30
  updated: 2026-01-30
  purpose: "Validate agent definitions meet Hybrid Loader quality standard"
  mode: blocking  # Prevents publication if critical items fail
  architecture: "hybrid-loader"
```

---

## Pre-Validation: File Basics

```yaml
file_basics:
  - id: min-lines
    check: "Agent file has 800+ lines"
    type: blocking
    validation: "wc -l {file} >= 800"

  - id: yaml-valid
    check: "YAML syntax is valid"
    type: blocking
    validation: "yamllint passes"

  - id: no-placeholders
    check: "No unfilled {{placeholders}} remain"
    type: blocking
    validation: "grep '{{' returns empty"
```

---

## Level 0: Loader Configuration (All Required - NEW)

```yaml
loader_checks:
  - id: activation-notice
    check: "ACTIVATION-NOTICE is present"
    type: blocking
    section: "top of file"

  - id: ide-file-resolution
    check: "IDE-FILE-RESOLUTION has valid base_path"
    type: blocking
    section: "Level 0"
    required_fields:
      - base_path
      - resolution_pattern

  - id: request-resolution
    check: "REQUEST-RESOLUTION has mapping examples"
    type: blocking
    section: "Level 0"

  - id: command-loader-exists
    check: "command_loader section exists"
    type: blocking
    section: "Level 0"

  - id: command-loader-complete
    check: "Every command with loader != null has entry in command_loader"
    type: blocking
    validation: |
      For each command in commands:
        if command.loader != null:
          assert command.name in command_loader

  - id: command-loader-requires
    check: "Each command_loader entry has 'requires' array"
    type: blocking
    validation: "command_loader[*].requires is array"

  - id: critical-loader-rule
    check: "CRITICAL_LOADER_RULE is present"
    type: blocking
    must_contain:
      - "LOOKUP"
      - "STOP"
      - "LOAD"
      - "VERIFY"
      - "EXECUTE"
      - "FAILURE TO LOAD = FAILURE TO EXECUTE"

  - id: dependencies-complete
    check: "dependencies lists all files in command_loader.requires"
    type: blocking
    validation: |
      all_required_files = flatten(command_loader[*].requires)
      all_dependency_files = flatten(dependencies[*])
      assert all_required_files is subset of all_dependency_files

  - id: files-exist
    check: "All files in dependencies actually exist"
    type: recommended
    validation: "ls {base_path}/{file} succeeds for each"
```

---

## Level 1: Identity (All Required)

```yaml
identity_checks:
  - id: agent-name
    check: "agent.name is defined"
    type: blocking
    section: "agent"

  - id: agent-id
    check: "agent.id is kebab-case"
    type: blocking
    section: "agent"
    pattern: "^[a-z]+(-[a-z]+)*$"

  - id: agent-tier
    check: "agent.tier is 1, 2, or 3"
    type: blocking
    section: "agent"

  - id: when-to-use
    check: "agent.whenToUse is descriptive (20+ chars)"
    type: blocking
    section: "agent"

  - id: persona-complete
    check: "persona has role, style, identity, focus"
    type: blocking
    section: "persona"

  - id: persona-background
    check: "persona.background has 3+ paragraphs"
    type: recommended
    section: "persona"
```

---

## Level 2: Operational (All Required)

```yaml
operational_checks:
  - id: core-principles
    check: "core_principles has 5-9 items"
    type: blocking
    min: 5
    max: 9

  - id: framework-exists
    check: "operational_frameworks has at least 1 framework"
    type: blocking
    min: 1

  - id: framework-complete
    check: "Each framework has: name, philosophy, steps, examples"
    type: blocking
    required_fields:
      - name
      - philosophy
      - steps
      - examples

  - id: framework-steps
    check: "Each framework has 3+ steps with descriptions"
    type: blocking
    min_steps: 3

  - id: commands-defined
    check: "commands has 5+ items including *help and *exit"
    type: blocking
    min: 5
    required:
      - "*help"
      - "*exit"
```

---

## Level 3: Voice DNA (All Required)

```yaml
voice_checks:
  - id: sentence-starters
    check: "voice_dna.sentence_starters has 5+ patterns"
    type: recommended
    min: 5

  - id: metaphors
    check: "voice_dna.metaphors has 3+ metaphors"
    type: recommended
    min: 3

  - id: vocabulary-always
    check: "voice_dna.vocabulary.always_use has 5+ terms"
    type: blocking
    min: 5

  - id: vocabulary-never
    check: "voice_dna.vocabulary.never_use has 3+ terms"
    type: blocking
    min: 3

  - id: behavioral-states
    check: "voice_dna.behavioral_states has 2+ states"
    type: recommended
    min: 2

  - id: signature-phrases
    check: "signature_phrases has 5+ phrases"
    type: recommended
    min: 5
```

---

## Level 4: Quality Assurance (All Required)

```yaml
quality_checks:
  - id: output-examples
    check: "output_examples has 3+ complete examples"
    type: blocking
    min: 3
    required_fields:
      - task
      - input
      - output

  - id: anti-patterns-never
    check: "anti_patterns.never_do has 5+ items"
    type: blocking
    min: 5

  - id: anti-patterns-flags
    check: "anti_patterns.red_flags_in_input has 2+ items"
    type: recommended
    min: 2

  - id: completion-criteria
    check: "completion_criteria.task_done_when is defined"
    type: blocking

  - id: handoff-defined
    check: "completion_criteria.handoff_to has 1+ handoffs"
    type: blocking
    min: 1

  - id: validation-checklist
    check: "completion_criteria.validation_checklist has 3+ items"
    type: recommended
    min: 3

  - id: objection-algorithms
    check: "objection_algorithms has 3+ objections with responses"
    type: recommended
    min: 3
```

---

## Level 5: Credibility (Domain-Specific)

```yaml
credibility_checks:
  applies_to:
    - copy
    - legal
    - storytelling
    - data

  checks:
    - id: achievements
      check: "authority_proof_arsenal.career_achievements has 3+ items"
      type: recommended
      min: 3

    - id: publications
      check: "authority_proof_arsenal.publications is defined"
      type: recommended

    - id: testimonials
      check: "authority_proof_arsenal.testimonials has 1+ items"
      type: recommended
      min: 1
```

---

## Level 6: Integration (All Required)

```yaml
integration_checks:
  - id: tier-position
    check: "integration.tier_position is defined"
    type: blocking

  - id: workflow-position
    check: "integration.workflow_integration.position_in_flow is defined"
    type: blocking

  - id: handoff-from
    check: "integration.workflow_integration.handoff_from has 1+ items"
    type: recommended
    min: 1

  - id: handoff-to
    check: "integration.workflow_integration.handoff_to has 1+ items"
    type: blocking
    min: 1

  - id: activation-greeting
    check: "activation.greeting is defined and 50+ chars"
    type: blocking
    min_chars: 50
```

---

## Validation Execution

### Quick Validation (CLI)

```bash
# Run quality gate on agent file
*validate-agent squads/{pack}/agents/{agent}.md
```

### Manual Validation Checklist

Copy this checklist and fill in:

```markdown
## Agent Quality Gate: {agent_name}

### Blocking Requirements (Must Pass)

**Level 1: Identity**
- [ ] agent.name defined
- [ ] agent.id is kebab-case
- [ ] agent.tier is 1-3
- [ ] agent.whenToUse is descriptive
- [ ] persona complete (role, style, identity, focus)

**Level 2: Operational**
- [ ] core_principles has 5-9 items
- [ ] operational_frameworks has 1+ framework
- [ ] Each framework has name, philosophy, steps, examples
- [ ] commands has 5+ items including *help, *exit

**Level 3: Voice DNA**
- [ ] vocabulary.always_use has 5+ terms
- [ ] vocabulary.never_use has 3+ terms

**Level 4: Quality**
- [ ] output_examples has 3+ complete examples
- [ ] anti_patterns.never_do has 5+ items
- [ ] completion_criteria.task_done_when defined
- [ ] completion_criteria.handoff_to has 1+ items

**Level 6: Integration**
- [ ] integration.tier_position defined
- [ ] workflow_integration.position_in_flow defined
- [ ] handoff_to has 1+ items
- [ ] activation.greeting defined (50+ chars)

### Recommended Requirements (Should Pass)

- [ ] persona.background has 3+ paragraphs
- [ ] sentence_starters has 5+ patterns
- [ ] metaphors has 3+ metaphors
- [ ] behavioral_states has 2+ states
- [ ] signature_phrases has 5+ phrases
- [ ] red_flags_in_input has 2+ items
- [ ] validation_checklist has 3+ items
- [ ] objection_algorithms has 3+ objections
- [ ] Agent file has 800+ lines

### Domain-Specific (If Applicable)

For Copy/Legal/Storytelling/Data:
- [ ] authority_proof_arsenal.achievements has 3+ items
- [ ] publications defined
- [ ] testimonials has 1+ items

### Result

**Blocking:** ___/17 passed
**Recommended:** ___/9 passed
**Total Score:** ___%

**Decision:** [ ] PASS - Ready for publication
              [ ] CONDITIONAL - Pass with documented gaps
              [ ] FAIL - Must fix blocking items
```

---

## Scoring

| Score | Result | Action |
|-------|--------|--------|
| 100% Blocking + 80%+ Recommended | EXCELLENT | Publish |
| 100% Blocking + 50-79% Recommended | GOOD | Publish with note |
| 100% Blocking + <50% Recommended | CONDITIONAL | Document gaps, publish |
| <100% Blocking | FAIL | Fix before publish |

---

## Integration with Workflow

This checklist is automatically invoked at:

```
research-then-create-agent workflow
    ↓
[Phase 6: Framework Extraction]
    ↓
[Phase 7: Agent Definition]
    ↓
[Phase 8: QUALITY GATE] ← THIS CHECKLIST
    ↓
    ├── PASS → Continue to task creation
    └── FAIL → Loop back to fix issues
```

---

**Version:** 2.0.0
**Created:** 2026-01-30
**Standard:** AIOS Agent Quality Level
