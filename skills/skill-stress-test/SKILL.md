---
name: skill-stress-test
description: >-
  Break your skills before your users do. Live stress tester that guides you through
  progressively harder real-world scenarios via structured handoffs to a second terminal
  (Claude Code or Codex), analyzes results, and reports what breaks. This skill should
  be used when the user wants to test, validate, or find edge cases in any skill from
  the ecosystem.
allowed-tools: [Read, Write, Edit, Glob, Grep, Bash, Agent]
argument-hint: "[skill-name] | resume | report"
version: 1.0.0
category: quality
tags: [testing, skills, qa, stress-test, chaos, ping-pong]
lazy_load: true
context_budget: 2500
---

# Skill Stress Test v1.0

Break your skills before your users do. Live stress tester that guides you through
progressively harder scenarios using a ping-pong file protocol between two terminals.

## When to Use This Skill

- Before releasing or sharing a skill — ensure it handles real-world chaos
- After major changes to a skill — regression testing across runtimes
- Quality audits — verify a skill works in Claude Code AND Codex
- When a skill "seems brittle" — find exactly where and why it breaks

## Do NOT Use This Skill When

- Quick syntax fix in a SKILL.md (just edit directly)
- Testing an app/codebase (use `bulletproof-test` instead)
- Static structure validation (use `ecosystem-audit` instead)

## Discovery Questions

Questions to ask before executing. Use AskUserQuestion tool. Skip if the user already provided this context.

1. **Qual skill quer stress-testar?** — (preciso do nome exato para localizar o SKILL.md)
   - forge
   - lp-generator
   - quest
   - bulletproof-test
   - Outra (digitar nome)

2. **Criar projeto fictício ou usar um existente?** — (fixture descartável vs. projeto real)
   - Criar fixture em /tmp/ (recomendado para testes destrutivos)
   - Usar projeto existente (informar path)

3. **Qual profundidade?** — (calibra tempo e número de cenários)
   - Rápido: 5 cenários, Tiers 1-2 (happy path + variações)
   - Completo: 20+ cenários, Tiers 1-5 (até caos total)

---

## Config

```yaml
SKILL_DIR: skills/skill-stress-test
ENGINE_DIR: ${SKILL_DIR}/engine
REFS_DIR: ${SKILL_DIR}/references
COMM_DIR: .stress-test  # relative to fixture path
```

> **Convention:** `{N}` in all file names (scenario, result, analysis) means a zero-padded
> 3-digit number: `001`, `002`, etc. Example: `scenario-001.md`, `result-003.md`.

## Command Routing

| Input | Action |
|-------|--------|
| `[skill-name]` | Start new stress test session |
| `resume` | Resume interrupted session from last fixture |
| `report` | Show last generated report |
| `analisa` / `next` / `próximo` | Analyze latest result and advance |

---

## Session Flow

### Phase 0: Init

1. Parse skill name from args or ask via Discovery Question 1
2. Detect if a session already exists:
   - Glob `/tmp/stress-test-{skill}-*/` for existing fixtures
   - If found with incomplete session.yaml: ask "Resume or start fresh?"
3. Ask Discovery Questions 2 and 3 if not already answered

### Phase 1: Recon

Load and execute `engine/recon.md` against the target skill.

1. Locate the skill: search `skills/{name}/SKILL.md`, then `squads/{name}/README.md`
2. Parse SKILL.md deeply — extract profile
3. Save `skill-profile.yaml` to `.stress-test/`
4. Show summary to user:
   ```
   === RECON COMPLETO ===
   Skill: {name} ({type})
   Entry points: {count}
   Dependências: {list}
   Risk areas: {list}
   ```

### Phase 2: Fixture

Load and execute `engine/fixture-factory.md`.

1. Determine best fixture archetype based on skill profile
2. Create fixture at `/tmp/stress-test-{skill}-{timestamp}/`
3. Create `.stress-test/` inside fixture
4. Initialize `session.yaml` with skill profile and config
5. Show fixture path to user

### Phase 3: Scenario Loop (CORE)

Load `engine/scenario-engine.md` for scenario generation.
Load `engine/output-analyzer.md` for result analysis.

For each scenario (ordered by tier, ascending difficulty):

#### 3a. Generate Scenario

1. Load `references/chaos-catalog.md` if tier >= 4
2. Generate `scenario-{N}.md` with:
   - YAML frontmatter (id, tier, title, runtime, difficulty)
   - Setup instructions (what to prepare in the fixture)
   - Action (exact command/prompt to run)
   - What to observe (checklist)
   - Pass criteria
3. Write `next-step.md` → `WAITING_FOR_EXECUTION`
4. Emit handoff block for the target runtime:

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  COPIE O BLOCO ABAIXO → COLE NO {RUNTIME}        ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

Você é um executor de stress test para a skill "{skill_name}".

1. Leia o cenário em {fixture_path}/.stress-test/scenario-{N}.md
2. Execute EXATAMENTE o que está descrito na seção "Ação"
3. Capture o output completo da execução
4. Liste todos os arquivos criados/modificados pela skill
5. Anote qualquer comportamento inesperado
6. Escreva tudo em {fixture_path}/.stress-test/result-{N}.md
   usando este formato:

---
scenario_id: S-{N}
runtime: {runtime}
executed_at: "{timestamp}"
status: completed  # ou crashed | hung | partial | incompatible
---

## Output
(output completo aqui)

## Artefatos Criados
(lista de arquivos)

## Observações
(notas sobre comportamento)

7. Atualize {fixture_path}/.stress-test/next-step.md:
   current_state → WAITING_FOR_ANALYSIS

NÃO invente resultados. Se a skill crashar, documente o erro exato.
```

5. Wait for user to say "analisa" / "next" / "próximo"

#### 3b. Analyze Result

1. Read `result-{N}.md` from `.stress-test/`
2. If file doesn't exist: warn user — "Terminal 2 ainda não executou. result-{N}.md não encontrado."
3. Load `engine/output-analyzer.md` analysis rules
4. Evaluate against scenario pass criteria
5. Determine verdict: PASS | WARN | FAIL | CRITICAL | SKIP
6. Write `analysis-{N}.md` with verdict, root cause, fix, contingency
7. Update `session.yaml` totals
8. Show verdict to user with emoji indicator:
   - PASS: "PASS — {brief reason}"
   - WARN: "WARN — {brief reason}"
   - FAIL: "FAIL — {root cause}. Fix: {suggestion}"
   - CRITICAL: "CRITICAL — {root cause}. BLOCKER: {impact}"
   - SKIP: "SKIP — incompatibilidade estrutural de runtime. {reason}"

#### 3c. Runtime Rotation

After analyzing for one runtime, check if the other runtime needs testing:
- If depth is "completo" and only one runtime tested: generate same scenario for other runtime
- If depth is "rápido": test only Claude Code (skip Codex unless user requests)

#### 3d. Advance

1. If more scenarios remain: go to 3a with next scenario
2. If user says "pular" / "skip": mark verdict as SKIP, advance
3. If user says "parar" / "stop" / "report": go to Phase 4
4. If all scenarios done: go to Phase 4

### Phase 4: Report

Load and execute `engine/report.md`.

1. Read all `analysis-{N}.md` files
2. Generate consolidated report in `.stress-test/report.md`
3. Copy report to `skills/skill-stress-test/reports/{skill}-{date}.md`
4. Show summary:
   ```
   === STRESS TEST REPORT ===
   Skill: {name}
   Verdict: {ROBUST|NEEDS_WORK|FRAGILE|BROKEN}

   Claude Code: {pass}/{total} PASS, {warn} WARN, {fail} FAIL
   Codex:       {pass}/{total} PASS, {warn} WARN, {fail} FAIL

   Top Issues:
   1. {most critical finding}
   2. {second finding}
   3. {third finding}

   Full report: {fixture_path}/.stress-test/report.md
   ```
5. Ask: "Quer que eu aplique os fixes sugeridos?" (if any FAIL/CRITICAL found)

---

## Resume Protocol

When invoked with `resume`:

1. Find latest fixture: `ls -td /tmp/stress-test-*/` → first result
2. Read `session.yaml` for current state
3. Read `next-step.md` for where we stopped
4. If `WAITING_FOR_EXECUTION`: remind user to run in Terminal 2
5. If `WAITING_FOR_ANALYSIS`: proceed to analyze latest result
6. If `COMPLETE`: show report

---

## Personality

- Tom: técnico mas acessível. Como um pentester explicando achados.
- Usar emojis de status: PASS, WARN, FAIL, CRITICAL
- Celebrar quando skill passa em tier alto: "Essa skill aguenta pancada!"
- Ser direto em falhas: "Quebrou aqui. Causa: X. Fix: Y."
- NUNCA inventar resultados — só analisar o que o Terminal 2 reportou

---

## Lazy Load References

Only load these when needed (lazy_load: true):

| Reference | When to load |
|-----------|-------------|
| `references/chaos-catalog.md` | When generating Tier 4-5 scenarios |
| `references/fixture-templates.md` | When creating fixtures (Phase 2) |
| `engine/recon.md` | Phase 1 only |
| `engine/fixture-factory.md` | Phase 2 only |
| `engine/scenario-engine.md` | Phase 3a (each scenario generation) |
| `engine/output-analyzer.md` | Phase 3b (each result analysis) |
| `engine/report.md` | Phase 4 only |
