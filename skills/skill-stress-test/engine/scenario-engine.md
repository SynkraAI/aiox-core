# Scenario Engine — Generation & Escalation

The heart of skill-stress-test. Generates test scenarios that escalate from
simple to skill-breaking, then presents them as structured ping-pong files.

## Input

- `skill_profile`: from `skill-profile.yaml`
- `depth`: quick (5 scenarios) or full (20+ scenarios)
- `current_tier`: which tier we're on
- `runtime`: claude-code or codex
- `fixture_path`: where the fixture lives

## Output

- `scenario-{N}.md` written to `.stress-test/`
- `next-step.md` updated
- Handoff block displayed to user

---

## Tier Model — 5 Escalation Levels

### Tier 1: Happy Path (scenarios 1-3)

Test the skill works under IDEAL conditions.

**Scenario templates:**

#### S-T1-001: First Invocation
- **Setup:** Clean fixture, no prior state
- **Action:** Invoke skill with its simplest/default command
- **Observe:** Banner/greeting shown, discovery questions asked (if any), output format correct
- **Pass:** Skill runs to completion, produces expected artifacts

#### S-T1-002: With All Arguments
- **Setup:** Same clean fixture
- **Action:** Invoke skill with full arguments (use argument-hint from profile)
- **Observe:** Arguments parsed correctly, no discovery questions for provided info
- **Pass:** Skill accepts all args, skips unnecessary questions

#### S-T1-003: Output Verification
- **Setup:** After S-T1-001 completed successfully
- **Action:** Check all artifacts listed in profile exist and are well-formed
- **Observe:** File structure, YAML/JSON validity, no placeholder text
- **Pass:** All expected artifacts exist and are valid

### Tier 2: Variations (scenarios 4-7)

Test each entry point and argument variation.

**Scenario templates:**

#### S-T2-001: Each Entry Point
- For each entry point in skill profile, generate one scenario
- **Action:** Invoke with that specific entry point
- **Pass:** Skill routes correctly to the right handler

#### S-T2-002: Resume/Continue
- **Setup:** Ensure state files exist from Tier 1
- **Action:** Invoke skill with resume/continue command (if supported)
- **Pass:** Skill detects previous state, continues from where it stopped

#### S-T2-003: Help/Status
- **Action:** Invoke skill with help, status, or info command (if supported)
- **Pass:** Skill shows useful info without executing

#### S-T2-004: Different Discovery Answers
- **Setup:** Clean fixture (delete prior state)
- **Action:** Invoke skill but answer discovery questions differently than Tier 1
- **Pass:** Skill adapts behavior based on different answers

### Tier 3: Edge Cases (scenarios 8-12)

Test boundary conditions that real users encounter.

#### S-T3-001: Empty String Input
- **Action:** Invoke skill with empty string: `/skill ""`
- **Pass:** Skill asks for input or uses sensible default

#### S-T3-002: Unicode Input
- **Action:** Invoke skill with accented text: `/skill "aplicacao com funcoes avancadas"`
- **Pass:** Unicode handled correctly in files and output

#### S-T3-003: Idempotency
- **Setup:** Run skill to completion
- **Action:** Run exact same command again immediately
- **Pass:** Skill detects previous run, asks resume/overwrite/skip

#### S-T3-004: Monorepo Subdirectory
- **Setup:** Create subdirectory in fixture, cd into it
- **Action:** Invoke skill from subdirectory
- **Pass:** Skill finds project root or handles subdir correctly

#### S-T3-005: Interrupted Resume
- **Setup:** Create partial state (simulate interrupted run — write state.json with "running" status but no output)
- **Action:** Invoke skill normally
- **Pass:** Skill detects incomplete state, offers recovery

### Tier 4: Hostile Input (scenarios 13-17)

Deliberately break things. Load `references/chaos-catalog.md`.

#### S-T4-001: Missing Manifest (C1-001)
- **Setup:** Delete package.json (or pyproject.toml)
- **Action:** Invoke skill normally
- **Pass:** Graceful error, not crash

#### S-T4-002: No Git (C1-002)
- **Setup:** Remove .git/ directory
- **Action:** Invoke skill normally
- **Pass:** Skill works without git or warns clearly

#### S-T4-003: Corrupt State (C2-001/C2-002)
- **Setup:** Write malformed YAML/JSON to skill's state files
- **Action:** Invoke skill (which will try to read state)
- **Pass:** Skill detects corruption, offers reset

#### S-T4-004: Wrong Project Type (C1-003 variant)
- **Setup:** Use chaos-mismatch fixture (Rust project)
- **Action:** Invoke skill that expects Node.js
- **Pass:** Skill detects mismatch, reports clearly

#### S-T4-005: Permission Denied (C7-001)
- **Setup:** `chmod -R 444 src/`
- **Action:** Invoke skill that writes to src/
- **Pass:** Skill reports permission error, suggests fix

### Tier 5: Chaos (scenarios 18-20+)

Extreme scenarios. Combine multiple failure patterns.

#### S-T5-001: Context Overflow (C3-001)
- **Setup:** Create 500 dummy files in fixture
- **Action:** Invoke skill that scans project structure
- **Pass:** Skill handles without context overflow

#### S-T5-002: Agent Missing + Corrupt State (C1-004 + C2-001)
- **Setup:** Delete agent .md file AND corrupt state
- **Action:** Invoke skill that delegates to missing agent
- **Pass:** Two independent failures handled, not cascading crash

#### S-T5-003: Runtime Gap — No Agent Tool (C4-001)
- **Runtime:** Codex only
- **Action:** Invoke skill that uses Agent tool heavily
- **Pass:** Skill has fallback behavior for non-Agent environments

#### S-T5-004: Injection Attempt (C6-004)
- **Action:** Invoke skill with `"$(echo pwned)"`
- **Pass:** Input treated as literal string, no shell execution

---

## Scenario Generation Algorithm

```
function generateScenarios(profile, depth):
  scenarios = []
  id = 1

  # Tier 1: Always included (3 scenarios)
  scenarios.push(T1-001, T1-002, T1-003)
  id = 4

  if depth == "quick":
    # Add 2 most relevant Tier 2 scenarios
    scenarios.push(bestT2(profile, 2))
    return scenarios  # Total: 5

  # Tier 2: All entry points + variations (3-5 scenarios)
  for entry_point in profile.entry_points:
    scenarios.push(generateT2(entry_point))
  scenarios.push(T2-002)  # resume
  id = len(scenarios) + 1

  # Tier 3: Edge cases (5 scenarios)
  scenarios.push(T3-001 through T3-005)

  # Tier 4: Hostile input (4-5 scenarios)
  # Filter by relevance to skill profile
  if profile.reads package.json:
    scenarios.push(T4-001)
  if profile.uses git:
    scenarios.push(T4-002)
  if profile.has state_files:
    scenarios.push(T4-003)
  scenarios.push(T4-004)  # always test wrong type
  if profile.writes files:
    scenarios.push(T4-005)

  # Tier 5: Chaos (2-3 scenarios)
  scenarios.push(T5-001)  # always test scale
  if profile.dependencies.agents.length > 0:
    scenarios.push(T5-002)
  if profile.uses Agent tool:
    scenarios.push(T5-003)
  scenarios.push(T5-004)  # always test injection

  return scenarios  # Total: 18-25
```

## Writing scenario-{N}.md

For each scenario, write the file with this structure:

```yaml
---
id: S-{NNN}
tier: {1-5}
title: "{descriptive title}"
runtime: {claude-code|codex}
difficulty: {easy|medium|hard|extreme}
chaos_patterns: [{C-codes if tier 4-5}]
---
```

Then markdown body with sections:

### Setup
Step-by-step instructions to prepare the fixture for this scenario.
Include exact bash commands for mutations (file deletion, corruption, etc.).
If no setup needed: "Nenhuma preparacao necessaria."

### Acao
Exact command or prompt to execute. Be specific:
- For Claude Code: `/skill-name "argument"` or the full slash command
- For Codex: Full prompt text to paste, including instruction to read SKILL.md

### O que observar
Numbered checklist of things to look for in the output:
1. Did X happen?
2. Was Y created?
3. Did Z appear in the output?

### Criterios de PASS
Clear pass/fail criteria. One paragraph describing what constitutes success.

### Criterios de FAIL
What would constitute a failure. Include common failure modes from chaos-catalog.

---

## Emitting Handoff Block

After writing scenario-{N}.md, display the handoff block for the user.
The block must be self-contained — the Terminal 2 agent should understand
everything without prior context.

Adapt the block based on runtime:

### Claude Code handoff
```
Voce e um executor de stress test para a skill "{skill_name}".

1. Leia o cenario em {fixture_path}/.stress-test/scenario-{N}.md
2. Execute a secao "Setup" (comandos bash se houver)
3. Execute EXATAMENTE o comando da secao "Acao"
4. Capture o output completo
5. Liste arquivos criados/modificados
6. Escreva resultado em {fixture_path}/.stress-test/result-{N}.md
```

### Codex handoff
```
Voce e um executor de stress test. Contexto:
- Diretorio de trabalho: {fixture_path}
- Skill sendo testada: {skill_name}
- Skill file: ~/aios-core/skills/{skill_name}/SKILL.md

1. Leia {fixture_path}/.stress-test/scenario-{N}.md
2. Execute a secao "Setup"
3. Leia o SKILL.md da skill alvo
4. Siga as instrucoes da skill como se o usuario tivesse digitado
   o comando da secao "Acao"
5. Documente TUDO em {fixture_path}/.stress-test/result-{N}.md
```
