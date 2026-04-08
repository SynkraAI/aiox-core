# Report Engine — Final Stress Test Report

Consolidates all analysis files into a comprehensive report with
compatibility matrix, prioritized fixes, and overall verdict.

## Input

> **Convention:** `{N}` in all file names means a zero-padded 3-digit number: `001`, `002`, etc.

- All `analysis-{N}.md` files from `.stress-test/`
- `session.yaml` with totals
- `skill-profile.yaml` for context

## Output

- `.stress-test/report.md` — full report in the fixture
- `skills/skill-stress-test/reports/{skill}-{date}.md` — historical copy in repo

---

## Report Generation Algorithm

### Step 1: Collect All Analyses

1. Glob `.stress-test/analysis-*.md`
2. Parse each file's YAML frontmatter (scenario_id, runtime, verdict)
3. Sort by scenario_id (ascending)
4. Group by runtime (claude-code, codex)

### Step 2: Calculate Metrics

```yaml
total_scenarios: {count of unique scenario IDs}
total_executions: {count of analysis files, including both runtimes}

claude-code:
  pass: {count}
  warn: {count}
  fail: {count}
  critical: {count}
  skipped: {count}
  incompatible: {count}
  total: {sum}

codex:
  pass: {count}
  warn: {count}
  fail: {count}
  critical: {count}
  skipped: {count}
  incompatible: {count}
  total: {sum}

highest_tier_reached: {1-5}
highest_tier_passed: {highest tier where all scenarios PASS or WARN}
```

### Step 3: Determine Overall Verdict

| Condition | Verdict |
|-----------|---------|
| 0 FAIL, 0 CRITICAL, <= 2 WARN | ROBUST |
| 0 CRITICAL, <= 3 FAIL, any WARN | NEEDS_WORK |
| Any CRITICAL, or > 3 FAIL | FRAGILE |
| > 50% scenarios FAIL/CRITICAL | BROKEN |

**Note:** `incompatible` scenarios are excluded from verdict calculation — they represent
structural runtime gaps, not code quality issues. They ARE reported in the compatibility matrix.

Apply verdict per runtime AND overall:
- Overall = worst of (claude-code verdict, codex verdict)

### Step 4: Build Compatibility Matrix

For each scenario tested in both runtimes:

```
| Cenário | Tier | Claude Code | Codex | Delta |
|---------|------|-------------|-------|-------|
```

Delta column highlights divergences:
- Same result → "—" (no delta)
- CC passes, Codex fails → brief description of why
- Both fail → "Mesmo bug" or "Causas diferentes"

### Step 5: Collect Failures

For each FAIL and CRITICAL analysis:
1. Extract root cause, fix suggestion, contingency
2. Deduplicate — if same root cause appears in multiple scenarios, merge
3. Prioritize:
   - P0: CRITICAL verdicts
   - P1: FAIL in Tier 1-2 (basic functionality broken)
   - P2: FAIL in Tier 3-4 (edge case / hostile input)
   - P3: FAIL in Tier 5 (chaos — nice to fix)

### Step 6: Generate Recommendations

Based on failure patterns, generate actionable recommendations:

1. If many `missing-guard` failures: "Adicionar verificação de existência antes de ler arquivos"
2. If `state-corruption` failures: "Implementar validação de state + recovery automático"
3. If `runtime-dependency` failures: "Adicionar fallbacks para Codex (sem Agent tool)"
4. If `no-error-handling`: "Wrap operações críticas em try/catch com mensagens claras"
5. If `context-overflow`: "Implementar lazy loading e limitar profundidade de scan"

### Step 7: Write Report

Write `.stress-test/report.md`:

```markdown
# Stress Test Report — {skill_name}

**Data:** {date}
**Skill:** {skill_name} v{version} ({skill_type})
**Fixture:** {fixture_path}
**Profundidade:** {quick|full}
**Tiers testados:** 1-{highest_tier_reached}

---

## Veredito Geral: {ROBUST|NEEDS_WORK|FRAGILE|BROKEN}

{1-2 sentence summary of the skill's resilience}

### Resumo por Runtime

| Runtime | PASS | WARN | FAIL | CRITICAL | INCOMPAT | Veredito |
|---------|------|------|------|----------|----------|----------|
| Claude Code | {n} | {n} | {n} | {n} | {n} | {verdict} |
| Codex | {n} | {n} | {n} | {n} | {n} | {verdict} |
| **Total** | **{n}** | **{n}** | **{n}** | **{n}** | **{n}** | **{overall}** |

### Progresso por Tier

| Tier | Nome | Cenários | PASS | WARN | FAIL | CRIT |
|------|------|----------|------|------|------|------|
| 1 | Happy Path | {n} | {n} | {n} | {n} | {n} |
| 2 | Variações | {n} | {n} | {n} | {n} | {n} |
| 3 | Edge Cases | {n} | {n} | {n} | {n} | {n} |
| 4 | Input Hostil | {n} | {n} | {n} | {n} | {n} |
| 5 | Caos | {n} | {n} | {n} | {n} | {n} |

---

## Matriz de Compatibilidade

| Cenário | Tier | Título | Claude Code | Codex | Delta |
|---------|------|--------|-------------|-------|-------|
| S-001 | 1 | {title} | {verdict} | {verdict} | {delta} |
| S-002 | 1 | {title} | {verdict} | {verdict} | {delta} |
| ... | | | | | |

---

## Falhas Detalhadas

### P0 — Críticas

#### F-{N}: {title}
- **Cenário:** S-{id} (Tier {tier})
- **Runtime(s):** {runtimes affected}
- **O que aconteceu:** {description}
- **Root cause:** {module} — {classification}
- **Fix:** {specific suggestion}
- **Contingência:** {workaround}

### P1 — Funcionalidade Básica

#### F-{N}: {title}
...

### P2 — Edge Cases

#### F-{N}: {title}
...

### P3 — Caos (Nice to Fix)

#### F-{N}: {title}
...

---

## Recomendações

Ações priorizadas para melhorar a resiliência da skill:

1. **[P0]** {recommendation}
2. **[P1]** {recommendation}
3. **[P2]** {recommendation}
...

---

## Observações sobre Runtimes

### Claude Code
{summary of CC-specific findings}

### Codex
{summary of Codex-specific findings}

### Gaps entre Runtimes
{list of features that work in CC but not Codex, and vice-versa}

---

## Cleanup

Para remover o fixture de teste:
```bash
rm -rf {fixture_path}
```

---

*Gerado por skill-stress-test v1.0 em {timestamp}*
```

### Step 8: Copy to History

```bash
REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
REPORT_DIR="${REPO_ROOT}/skills/skill-stress-test/reports"
mkdir -p "$REPORT_DIR"
cp {fixture_path}/.stress-test/report.md \
   "${REPORT_DIR}/{skill_name}-{YYYY-MM-DD}.md"
```

### Step 9: Display Summary

Show condensed summary to user (not the full report):

```
=== STRESS TEST REPORT ===
Skill: {name} v{version}
Veredito: {verdict}

Claude Code: {pass} PASS, {warn} WARN, {fail} FAIL, {critical} CRIT
Codex:       {pass} PASS, {warn} WARN, {fail} FAIL, {critical} CRIT

Top Issues:
1. [P0] {most critical finding}
2. [P1] {second finding}
3. [P2] {third finding}

Full report: {fixture_path}/.stress-test/report.md
Histórico:   skills/skill-stress-test/reports/{skill}-{date}.md
```

Then ask:
```
Opções:
1. Ver relatório completo
2. Aplicar fixes sugeridos (se houver FAIL/CRITICAL)
3. Testar outra skill
4. Encerrar
```

---

## Report Quality Rules

- NEVER invent failures that weren't in the analysis files
- NEVER downgrade a CRITICAL to FAIL in the report
- ALWAYS include ALL failures, even minor ones
- ALWAYS provide actionable fixes, not vague suggestions
- Recommendations should reference specific files and line numbers when possible
- The compatibility matrix should only include scenarios tested in both runtimes
- If a scenario was skipped, mark verdict as SKIP (not PASS)
