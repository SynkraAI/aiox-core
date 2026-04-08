# Workflow: Stress Test

> Quebre suas skills antes que seus usuários quebrem.

---

## When to Use

- User runs `/forge stress-test {skill-name}` or `/forge stress-test all`
- User wants to audit resilience of one or more skills
- Quarterly health check of orchestrator skills
- After major changes to a skill (new workflow, engine refactor)

---

## Pipeline

```
Phase 0 (Recon) -> Phase 1 (Tiers 1-2) -> Phase 2 (Tiers 3-5) -> Phase 3 (Fix) -> Phase 4 (Validate)
```

Phase 0 is AUTOMATIC (detect skill, generate profile).
Phases 1-2 are the test execution (self-test mode for orchestrators).
Phase 3 is human-in-the-loop (approve/apply fixes).
Phase 4 is validation + commit.

---

## Execution

### Phase 0: Recon (AUTOMATIC)

1. Parse skill name from args
   - If `all`: Glob `skills/*/SKILL.md`, filter by `category: orchestration`, build target list
   - If specific name: locate `skills/{name}/SKILL.md`
2. For each target skill, invoke `/skill-stress-test` Phase 1 (Recon):
   - Read SKILL.md deeply
   - Extract entry points, dependencies, state files, risk areas
   - Generate `skill-profile.yaml`
3. Show recon summary for all targets
4. Ask user: "Profundidade?" → Rápido (Tiers 1-2 only) ou Completo (Tiers 1-5)

**Duration target:** < 30 seconds per skill.

### Phase 1: Tiers 1-2 — Happy Path (5 cenários por skill)

For each target skill:

1. Generate 5 scenarios (3x Tier 1, 2x Tier 2) using `/skill-stress-test` scenario engine
2. **Self-test mode** (for orchestrators): execute via Skill tool in same terminal
3. **Ping-pong mode** (for non-orchestrators): emit handoff block for Terminal 2
4. Analyze results, write analysis files
5. Show per-skill summary: `{skill}: {pass}P {warn}W {fail}F`

**Checkpoint:** Show consolidated Tier 1-2 results. Ask:
1. "Continuar para Tiers 3-5 (chaos)?"
2. "Aplicar fixes dos achados até agora?"
3. "Parar aqui — salvar relatório"

### Phase 2: Tiers 3-5 — Chaos (11 cenários por skill)

For each target skill:

1. Generate 11 scenarios using chaos-catalog.md:
   - Tier 3 (5): edge cases — empty input, unicode, idempotência, state corrompido, multi-run
   - Tier 4 (4): hostile input — sem manifest, sem .git, enum inválido, shell injection
   - Tier 5 (2): chaos — context overflow, combined failures
2. Execute via **análise estática de code path** (trace sem executar):
   - Read SKILL.md, runner, workflows, engine modules
   - Trace each scenario through the code
   - Identify where it fails or succeeds
3. Analyze and assign verdict: PASS | WARN | FAIL | CRITICAL
4. Write analysis files

**Checkpoint:** Show consolidated Tier 3-5 results. Ask:
1. "Aplicar fixes?"
2. "Gerar relatório sem fixar?"

### Phase 3: Fix (HUMAN-IN-THE-LOOP)

1. Sort issues by priority: P0 (CRITICAL/FAIL) → P1 (WARN importante) → P2 (WARN menor)
2. For each issue:
   - Show: cenário, root cause, fix sugerido, arquivo, esforço estimado
   - Apply fix (edit file with guard/validation/error handling)
3. Commit fixes with descriptive message referencing cenários
4. Show before/after score

**This phase follows Forge Constitution Art. 1:** Forge does NOT apply fixes directly. It dispatches the appropriate action:
- Spec/markdown fixes → Forge applies (documentation-level)
- Code fixes (.mjs, .cjs) → Forge applies (guard-level, not logic changes)
- Architectural changes → CHECKPOINT, ask user

### Phase 4: Validate + Ship

1. Re-run Tier 1 (S-001) for each skill as smoke test
2. Generate consolidated report
3. Commit report
4. Ask: "Push via @devops?"

---

## Agent Mapping

| Phase | Agent/Skill | Purpose |
|-------|-------------|---------|
| 0 | `/skill-stress-test` (recon) | Generate skill profiles |
| 1-2 | Self (Forge) | Execute scenarios + analyze |
| 3 | Self (Forge) | Apply fixes to specs and code |
| 4 | `@devops` | Push + PR (if requested) |

---

## State

```json
{
  "mode": "STRESS_TEST",
  "targets": ["forge", "quest", "content-forge"],
  "depth": "complete",
  "results": {
    "forge": { "pass": 16, "warn": 0, "fail": 0, "critical": 0 },
    "quest": { "pass": 16, "warn": 0, "fail": 0, "critical": 0 }
  },
  "fixes_applied": 28,
  "commits": ["053593dd1", "ff4608735", "4387ae087", "b185136b9"]
}
```

---

## Integration with Quest

Pack `stress-test-sprint` gamifica este workflow:
- Phase 0 → Quest Phase 0 (Torre de Vigilância)
- Phase 1 → Quest Phase 1 (Pista de Treino)
- Phase 2 → Quest Phase 2 (Arena do Caos)
- Phase 3 → Quest Phase 3 (Oficina de Reparos)
- Phase 4 → Quest Phase 4 (Sala do Tribunal)

Auto-reconciliation maps Forge phases to Quest items via `forge_phase_map` in the pack YAML.
